import express from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createCdsRouter, SERVICES } from '../../../src/routes/cdsHooksRoutes.js';
import { createMemoryStore } from '../../../src/services/overrideStore.js';
import { clearCdsAuthCaches } from '../../../src/cds/auth.js';
import { ruleForCard } from '../../../src/cds/ruleIndex.js';
import { getCdsConfig } from '../../../src/cds/config.js';

const listen = (app) => new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
const close = (s) => new Promise((r) => s.close(r));

// ---- fake EHR key server -------------------------------------------------------------------------
const mkKey = () => { const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }); return { privateKey, jwk: { ...publicKey.export({ format: 'jwk' }), alg: 'RS256', use: 'sig' } }; };
const keyA = mkKey(); keyA.jwk.kid = 'a';
const keyB = mkKey(); keyB.jwk.kid = 'b';
let keyServer; let jwksUrl; let jwksKeys;

let appServer; let appBase; let store; let cfg;
const ISS = 'https://ehr.example.com';

beforeAll(async () => {
  const k = express();
  k.get('/jwks', (req, res) => res.json({ keys: jwksKeys }));
  keyServer = await listen(k);
  jwksUrl = `http://127.0.0.1:${keyServer.address().port}/jwks`;
  store = createMemoryStore();
  const a = express();
  a.use(express.json());
  a.use('/', createCdsRouter({ getConfig: () => cfg, getStore: () => store }));
  appServer = await listen(a);
  appBase = `http://127.0.0.1:${appServer.address().port}`;
});
afterAll(async () => { await close(keyServer); await close(appServer); });
beforeEach(() => {
  clearCdsAuthCaches();
  jwksKeys = [keyA.jwk];
  cfg = { trustedIssuers: { [ISS]: { jwksUri: jwksUrl } }, publicBaseUrl: appBase, allowUnsigned: false, problems: [], jwksTtlMs: 600000 };
});

const sign = (aud, { key = keyA, claims = {}, header = {} } = {}) =>
  jwt.sign({ iss: ISS, aud, jti: crypto.randomUUID(), ...claims }, key.privateKey, { algorithm: 'RS256', keyid: key.jwk.kid, expiresIn: 300, ...header });
const url = (id, suffix = '') => `${appBase}/cds-services/${id}${suffix}`;
const call = (id, body, token, suffix = '') => fetch(url(id, suffix), { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });

// ---- FHIR fixtures -------------------------------------------------------------------------------
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString();
const med = (name, status = 'active', rxnorm) => ({ resource: { resourceType: 'MedicationRequest', status, medicationCodeableConcept: { text: name, ...(rxnorm ? { coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: rxnorm, display: name }] } : {}) } } });
const obs = (code, value, unit, days = 1) => ({ resource: { resourceType: 'Observation', status: 'final', code: { coding: [{ system: 'http://loinc.org', code }] }, effectiveDateTime: ago(days), valueQuantity: { value, unit, code: unit } } });
const gene = (text, value) => ({ resource: { resourceType: 'Observation', status: 'final', code: { text }, valueString: value, effectiveDateTime: ago(30) } });
const bundle = (entries) => ({ resourceType: 'Bundle', entry: entries });
const patient = (over = {}) => ({ resourceType: 'Patient', id: 'p1', gender: 'female', birthDate: '1960-01-01', ...over });
const hook = (id, { draft = [], active = [], labs = [], vitals = [], pt = patient(), prefetch } = {}) => ({
  hook: SERVICES.find((s) => s.id === id).hook, hookInstance: crypto.randomUUID(),
  context: { userId: 'Practitioner/1', patientId: 'p1', ...(id.includes('order') ? { draftOrders: bundle(draft.map((n) => (typeof n === 'string' ? med(n, 'draft') : n))) } : {}) },
  prefetch: prefetch ?? { patient: pt, medications: bundle(active.map((n) => (typeof n === 'string' ? med(n) : n))), labs: bundle(labs), vitals: bundle(vitals) },
});
const OS = 'oncosaferx-order-sign'; const PV = 'oncosaferx-patient-view';
const cardsFor = async (id, body) => (await (await call(id, body, sign(url(id)))).json()).cards;
const ruleOf = (card) => ruleForCard(card.uuid)?.ruleId;

describe('discovery and authentication', () => {
  test('discovery lists both services with prefetch templates', async () => {
    const { services } = await (await fetch(`${appBase}/cds-services`)).json();
    expect(services.map((s) => s.hook).sort()).toEqual(['order-sign', 'patient-view']);
    expect(services[0].prefetch.patient).toBe('Patient/{{context.patientId}}');
  });

  test('a valid EHR-signed request is accepted', async () => {
    expect((await call(OS, hook(OS, { draft: ['metformin'] }), sign(url(OS)))).status).toBe(200);
  });

  test.each([
    ['no token', () => undefined],
    ['wrong audience', () => sign(url(PV))],
    ['untrusted issuer', () => sign(url(OS), { claims: { iss: 'https://evil.example.com' } })],
    ['signed with a key the issuer does not publish', () => sign(url(OS), { key: { ...mkKey(), jwk: { kid: 'zz' } } })],
    ['expired', () => jwt.sign({ iss: ISS, aud: url(OS), jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) - 600 }, keyA.privateKey, { algorithm: 'RS256', keyid: 'a' })],
    ['missing jti', () => jwt.sign({ iss: ISS, aud: url(OS) }, keyA.privateKey, { algorithm: 'RS256', keyid: 'a', expiresIn: 300 })],
    ['unexpected key-set URL', () => sign(url(OS), { header: { header: { kid: 'a', jku: 'https://evil.example.com/jwks' } } })],
    ['alg none', () => jwt.sign({ iss: ISS, aud: url(OS), jti: 'x' }, '', { algorithm: 'none' })],
  ])('rejects: %s', async (_n, mk) => {
    expect((await call(OS, hook(OS, { draft: ['metformin'] }), mk())).status).toBe(401);
  });

  test('replayed token is rejected', async () => {
    const t = sign(url(OS)); const body = hook(OS, { draft: ['metformin'] });
    expect((await call(OS, body, t)).status).toBe(200);
    expect((await call(OS, body, t)).status).toBe(401);
  });

  test('key rotation: unknown kid triggers one JWKS refresh', async () => {
    expect((await call(OS, hook(OS, { draft: ['metformin'] }), sign(url(OS), { key: keyB }))).status).toBe(401); // not published yet
    jwksKeys = [keyA.jwk, keyB.jwk];
    expect((await call(OS, hook(OS, { draft: ['metformin'] }), sign(url(OS), { key: keyB }))).status).toBe(200);
  });

  test('unsigned requests are only for dev/test; production config without issuers is a 503', async () => {
    expect((await call(OS, hook(OS, { draft: ['metformin'] }))).status).toBe(401);
    cfg = { ...cfg, allowUnsigned: true };
    expect((await call(OS, hook(OS, { draft: ['metformin'] }))).status).toBe(200);
    cfg = getCdsConfig({ NODE_ENV: 'production' });
    expect(cfg.problems).toEqual(expect.arrayContaining(['CDS_TRUSTED_ISSUERS', 'CDS_PUBLIC_BASE_URL']));
    expect((await call(OS, hook(OS, { draft: ['metformin'] }), 'x')).status).toBe(503);
  });

  test('request validation', async () => {
    const good = hook(OS, { draft: ['metformin'] });
    expect((await call(OS, { ...good, hook: 'patient-view' }, sign(url(OS)))).status).toBe(400);
    expect((await call(OS, { ...good, hookInstance: 'nope' }, sign(url(OS)))).status).toBe(400);
    expect((await call(OS, { ...good, context: { patientId: 'p1' } }, sign(url(OS)))).status).toBe(400);
    expect((await call('nope', good, sign(url('nope')))).status).toBe(404);
  });
});

describe('order-sign cards', () => {
  test('major interaction between a new order and a chart medication -> warning card with override reasons and label link', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], active: ['warfarin'] }));
    const c = cards.find((x) => ruleOf(x)?.startsWith('DDI:'));
    expect(c).toMatchObject({ indicator: 'warning' });
    expect(c.summary).toMatch(/capecitabine \+ warfarin/i);
    expect(c.overrideReasons.length).toBeGreaterThan(3);
    expect(c.summary.length).toBeLessThanOrEqual(140);
    expect(c.detail).toMatch(/Recommended: monitor/);
    expect(c.links[0].label).not.toMatch(/\[/);
    expect(ruleForCard(c.uuid)).toMatchObject({ ruleId: 'DDI:capecitabine|warfarin' });
  });

  test('already-charted combinations are not re-alerted when the new order is unrelated', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['metformin'], active: ['warfarin', 'aspirin'] }));
    expect(cards.filter((c) => c.indicator !== 'info')).toEqual([]);
  });

  test('two known-risk QT drugs -> critical card', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['ondansetron'], active: ['citalopram'] }));
    expect(cards.find((c) => ruleOf(c) === 'QT-MULTIPLE-KNOWN')).toMatchObject({ indicator: 'critical' });
  });

  test('MAO-inhibitor-type drug with a serotonergic new order -> critical card', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['sertraline'], active: ['linezolid'] }));
    expect(cards.find((c) => ruleOf(c) === 'SEROTONIN-MAOI-COMBINATION')).toMatchObject({ indicator: 'critical' });
  });

  test('capecitabine with severe renal impairment (CrCl from creatinine, age, weight) -> critical', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], pt: patient({ birthDate: '1940-01-01', gender: 'female' }), vitals: [obs('29463-7', 60, 'kg')], labs: [obs('2160-0', 3.0, 'mg/dL')] }));
    expect(cards.find((c) => ruleOf(c) === 'CAPECITABINE-CRCL-LT30')).toMatchObject({ indicator: 'critical' });
  });

  test('fluoropyrimidine: DPYD poor -> critical; intermediate -> warning; no genotype -> info prompt', async () => {
    const poor = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], labs: [gene('DPYD genotype', 'DPYD *2A homozygous')] }));
    expect(poor.find((c) => ruleOf(c) === 'DPYD-POOR-FLUOROPYRIMIDINE')).toMatchObject({ indicator: 'critical' });
    const im = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], labs: [gene('DPYD genotype', 'DPYD *2A heterozygous')] }));
    expect(im.find((c) => ruleOf(c) === 'DPYD-INTERMEDIATE-FLUOROPYRIMIDINE')).toMatchObject({ indicator: 'warning' });
    const none = await cardsFor(OS, hook(OS, { draft: ['capecitabine'] }));
    expect(none.find((c) => ruleOf(c) === 'DPYD-GENOTYPE-MISSING')).toMatchObject({ indicator: 'info', summary: 'No DPYD genotype on file.' });
  });

  test('unrelated "wildtype" result does not hide the missing-DPYD prompt', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], labs: [gene('CYP2D6', 'CYP2D6 wildtype')] }));
    expect(cards.find((c) => ruleOf(c) === 'DPYD-GENOTYPE-MISSING')).toBeTruthy();
  });

  test('HLA-B*57:01 positive + abacavir -> critical pharmacogenomic card', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['abacavir'], labs: [gene('HLA-B*57:01', 'HLA-B*57:01 positive')] }));
    expect(cards.find((c) => ruleOf(c) === 'HLA-ABACAVIR')).toMatchObject({ indicator: 'critical' });
  });

  test('generic regimen rules (ANC/platelet gaps) do not fire for an ordinary order', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['metformin'] }));
    expect(cards.map(ruleOf)).not.toContain('ANC-MISSING');
  });

  test('missing prefetch yields a visible data-unavailable card instead of silence', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['capecitabine'], prefetch: {} }));
    const c = cards.find((x) => ruleOf(x) === 'CDS-DATA-UNAVAILABLE');
    expect(c.detail).toMatch(/patient.*medication list.*laboratory/);
  });

  test('stale labs are reported as too old, not used', async () => {
    const cards = await cardsFor(OS, hook(OS, { draft: ['ondansetron'], labs: [obs('2823-3', 3.0, 'mmol/L', 40)] }));
    expect(cards.find((x) => ruleOf(x) === 'CDS-DATA-UNAVAILABLE').detail).toMatch(/too old.*potassium/i);
  });

  test('card volume is capped; the overflow is summarised', async () => {
    const draft = ['ondansetron', 'citalopram', 'sertraline', 'linezolid', 'warfarin', 'capecitabine', 'fluconazole', 'methadone', 'tramadol'];
    const cards = await cardsFor(OS, hook(OS, { draft }));
    expect(cards.length).toBeLessThanOrEqual(6);
    expect(cards.some((c) => ruleOf(c) === 'CDS-MORE-FINDINGS')).toBe(true);
    expect(cards.every((c) => /^[0-9a-f-]{36}$/.test(c.uuid))).toBe(true);
  });
});

describe('patient-view cards', () => {
  test('only critical findings are shown on chart open', async () => {
    const quiet = await cardsFor(PV, hook(PV, { active: ['warfarin', 'aspirin', 'metformin'] }));
    expect(quiet).toEqual([]);
    const loud = await cardsFor(PV, hook(PV, { active: ['linezolid', 'sertraline'] }));
    expect(loud.map(ruleOf)).toContain('SEROTONIN-MAOI-COMBINATION');
    expect(loud.every((c) => c.indicator === 'critical')).toBe(true);
  });
});

describe('feedback', () => {
  const fb = (cardUuid, extra = {}) => ({ feedback: [{ card: cardUuid, outcome: 'overridden', outcomeTimestamp: new Date().toISOString(), ...extra }] });

  test('overridden feedback is stored against the rule and version, with the verified EHR issuer', async () => {
    const [c] = (await cardsFor(OS, hook(OS, { draft: ['capecitabine'], active: ['warfarin'] }))).filter((x) => ruleOf(x)?.startsWith('DDI:'));
    const body = fb(c.uuid, { overrideReason: { reason: { code: 'monitoring_in_place', display: 'Monitoring is in place' }, userComment: 'INR checked twice weekly' } });
    const res = await call(OS, body, sign(url(OS, '/feedback')), '/feedback');
    expect(res.status).toBe(200);
    const row = (await store.list({ ruleId: 'DDI:capecitabine|warfarin' })).rows[0];
    expect(row).toMatchObject({ source: 'cds-hooks', action: 'override', reason_code: 'monitoring_in_place', ehr_issuer: ISS, user_id: null, card_uuid: c.uuid });
    expect(row.rule_version).toMatch(/^[0-9a-f]{12}$/);
    expect(row.reason_text).toBe('INR checked twice weekly');
    expect(row.patient_ref).toBeNull();
  });

  test('accepted feedback; free-form and missing reasons are normalised; unknown cards are kept as UNKNOWN', async () => {
    const [c] = await cardsFor(OS, hook(OS, { draft: ['ondansetron'], active: ['citalopram'] }));
    await call(OS, { feedback: [{ card: c.uuid, outcome: 'accepted', acceptedSuggestions: [{ id: 's1' }] }] }, sign(url(OS, '/feedback')), '/feedback');
    await call(OS, fb(c.uuid, { overrideReason: { reason: { code: 'EHR-LOCAL-7', display: 'Palliative' } } }), sign(url(OS, '/feedback')), '/feedback');
    await call(OS, fb(c.uuid), sign(url(OS, '/feedback')), '/feedback');
    await call(OS, fb(crypto.randomUUID()), sign(url(OS, '/feedback')), '/feedback');
    const rows = (await store.list({ limit: 200 })).rows;
    const ours = rows.filter((r) => r.card_uuid === c.uuid);
    expect(ours.map((r) => `${r.action}:${r.reason_code}`).sort()).toEqual(['accept:null', 'override:other', 'override:unspecified']);
    expect(ours.find((r) => r.reason_code === 'other').reason_text).toMatch(/EHR-LOCAL-7.*Palliative/);
    expect(rows.some((r) => r.rule_id === 'UNKNOWN')).toBe(true);
  });

  test('feedback must be authenticated, well-formed, and storable', async () => {
    expect((await call(OS, fb(crypto.randomUUID()), undefined, '/feedback')).status).toBe(401);
    expect((await call(OS, { feedback: [] }, sign(url(OS, '/feedback')), '/feedback')).status).toBe(400);
    expect((await call(OS, { feedback: [{ card: 'x', outcome: 'overridden' }] }, sign(url(OS, '/feedback')), '/feedback')).status).toBe(400);
    expect((await call(OS, { feedback: [{ card: crypto.randomUUID(), outcome: 'maybe' }] }, sign(url(OS, '/feedback')), '/feedback')).status).toBe(400);
    // a token minted for the service URL must not work on the feedback URL
    expect((await call(OS, fb(crypto.randomUUID()), sign(url(OS)), '/feedback')).status).toBe(401);
  });
});
