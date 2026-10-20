import express from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createSmartRouter } from '../../../src/routes/smartRoutes.js';
import { seal, unseal } from '../../../src/smart/seal.js';
import { getSmartConfig, issAllowed, DEFAULT_SCOPE } from '../../../src/smart/config.js';
import { buildDosingInputs, pickObservations } from '../../../src/smart/fhirInputs.js';

const listen = (app) => new Promise((r) => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
const close = (s) => new Promise((r) => s.close(r));

// ---- a fake EHR: SMART config, authorize, token (checks PKCE), JWKS, FHIR reads ----
let ehr; let ehrBase; let appServer; let appBase; let seen; let behavior;
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
const CLIENT_ID = 'test-client';

beforeAll(async () => {
  const e = express();
  e.use(express.urlencoded({ extended: false }));
  e.get('/fhir/.well-known/smart-configuration', (req, res) => res.json({
    authorization_endpoint: `${ehrBase}/auth/authorize`, token_endpoint: `${ehrBase}/auth/token`,
    jwks_uri: `${ehrBase}/auth/jwks`, issuer: `${ehrBase}/fhir`, code_challenge_methods_supported: ['S256'],
  }));
  e.get('/auth/authorize', (req, res) => {
    seen.authorize = req.query;
    res.redirect(`${req.query.redirect_uri}?code=the-code&state=${encodeURIComponent(behavior.returnState ?? req.query.state)}`);
  });
  e.post('/auth/token', (req, res) => {
    seen.token = req.body;
    if (behavior.tokenFails) return res.status(400).json({ error: 'invalid_grant' });
    const expected = crypto.createHash('sha256').update(req.body.code_verifier || '').digest('base64url');
    if (expected !== seen.authorize.code_challenge) return res.status(400).json({ error: 'pkce_mismatch' });
    const id_token = jwt.sign({ fhirUser: `${ehrBase}/fhir/Practitioner/dr1`, nonce: behavior.badNonce ? 'wrong' : seen.authorize.nonce },
      privateKey, { algorithm: 'RS256', keyid: 'k1', issuer: `${ehrBase}/fhir`, audience: behavior.badAudience ? 'someone-else' : CLIENT_ID, expiresIn: 300 });
    res.json({ access_token: 'AT-123', token_type: 'bearer', expires_in: 300, scope: 'launch patient/Patient.read', patient: 'p1', encounter: 'e1', id_token });
  });
  e.get('/auth/jwks', (req, res) => res.json({ keys: [jwk] }));
  e.use('/fhir', (req, res, next) => (req.headers.authorization === 'Bearer AT-123' ? next() : res.status(401).json({ error: 'no token' })));
  e.get('/fhir/Patient/p1', (req, res) => res.json({ resourceType: 'Patient', id: 'p1', gender: 'female', birthDate: '1960-06-15' }));
  e.get('/fhir/Observation', (req, res) => {
    const lab = (code, value, unit, date, status = 'final') => ({ resource: { resourceType: 'Observation', status, code: { coding: [{ system: 'http://loinc.org', code }] }, effectiveDateTime: date, valueQuantity: { value, unit, code: unit } } });
    const recent = new Date(Date.now() - 86400000).toISOString();
    const old = new Date(Date.now() - 40 * 86400000).toISOString();
    res.json({ entry: req.query.category === 'vital-signs'
      ? [lab('29463-7', 70, 'kg', recent), lab('8302-2', 170, 'cm', recent)]
      : [lab('26499-4', 1.2, '10*3/uL', recent), lab('777-3', 90, '10*3/uL', recent), lab('2160-0', 1.0, 'mg/dL', recent), lab('2823-3', 3.2, 'mmol/L', recent), lab('8634-8', 480, 'ms', old), lab('19123-9', 1.9, 'furlongs', recent)] });
  });
  e.get('/fhir/MedicationRequest', (req, res) => res.json({ entry: [
    { resource: { resourceType: 'MedicationRequest', status: 'active', medicationCodeableConcept: { text: 'Ondansetron 8 mg tablet' } } },
    { resource: { resourceType: 'MedicationRequest', status: 'stopped', medicationCodeableConcept: { text: 'Aspirin' } } },
    { resource: { resourceType: 'MedicationRequest', status: 'active', medicationReference: { reference: 'Medication/m1' } } },
  ] }));
  ehr = await listen(e);
  ehrBase = `http://127.0.0.1:${ehr.address().port}`;

  const a = express();
  const cfg = () => ({
    clientId: CLIENT_ID, clientSecret: '', redirectUri: `${appBase}/smart/callback`, scope: DEFAULT_SCOPE,
    allowedIss: [`${ehrBase}/fhir`], sessionSecret: 'x'.repeat(40), postLoginUrl: '/', secureCookies: false, sessionMaxSeconds: 3600, problems: [],
  });
  a.use('/', createSmartRouter({ getConfig: cfg }));
  appServer = await listen(a);
  appBase = `http://127.0.0.1:${appServer.address().port}`;
});
afterAll(async () => { await close(ehr); await close(appServer); });
beforeEach(() => { seen = {}; behavior = {}; });

const jar = (res) => (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).filter((c) => !/=$/.test(c)).join('; ');

async function runLaunch(query) {
  const launch = await fetch(`${appBase}/smart/launch?${new URLSearchParams(query)}`, { redirect: 'manual' });
  if (launch.status !== 302) return { launch };
  const auth = await fetch(launch.headers.get('location'), { redirect: 'manual' });
  const cb = await fetch(auth.headers.get('location'), { redirect: 'manual', headers: { cookie: jar(launch) } });
  return { launch, auth, cb };
}

describe('SMART EHR launch', () => {
  test('full flow: discovery, PKCE, state, id_token, session; token never exposed to the browser', async () => {
    const { launch, cb } = await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'abc' });
    const a = seen.authorize;
    expect(a).toMatchObject({ response_type: 'code', client_id: CLIENT_ID, aud: `${ehrBase}/fhir`, code_challenge_method: 'S256', launch: 'abc' });
    expect(a.scope.split(' ')).toContain('launch');
    expect(a.scope.split(' ')).not.toContain('launch/patient');
    expect(a.state.length).toBeGreaterThan(20);
    expect(launch.headers.getSetCookie()[0]).toMatch(/HttpOnly/);
    expect(cb.status).toBe(302);
    expect(cb.headers.get('location')).toBe('/?smart=1'); // test config sets postLoginUrl '/'
    expect(seen.token).toMatchObject({ grant_type: 'authorization_code', code: 'the-code', client_id: CLIENT_ID });

    const session = jar(cb);
    const ctx = await (await fetch(`${appBase}/api/smart/context`, { headers: { cookie: session } })).json();
    expect(ctx).toMatchObject({ authenticated: true, patient: 'p1', encounter: 'e1', fhirUser: `${ehrBase}/fhir/Practitioner/dr1` });
    expect(JSON.stringify(ctx)).not.toContain('AT-123');
  });

  test('standalone launch (no launch param) asks for launch/patient', async () => {
    await runLaunch({ iss: `${ehrBase}/fhir` });
    expect(seen.authorize.scope.split(' ')).toContain('launch/patient');
    expect(seen.authorize.launch).toBeUndefined();
  });

  test('iss not on the allow-list is rejected before any request to it', async () => {
    const r = await fetch(`${appBase}/smart/launch?iss=${encodeURIComponent('https://evil.example.com/fhir')}&launch=x`, { redirect: 'manual' });
    expect(r.status).toBe(400);
    expect(seen.authorize).toBeUndefined();
  });

  test('state mismatch is rejected', async () => {
    behavior.returnState = 'forged';
    const { cb } = await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'abc' });
    expect(cb.status).toBe(400);
    expect(seen.token).toBeUndefined();
  });

  test('callback without the transaction cookie is rejected', async () => {
    const r = await fetch(`${appBase}/smart/callback?code=c&state=s`, { redirect: 'manual' });
    expect(r.status).toBe(400);
  });

  test('EHR error response is surfaced without leaking details', async () => {
    const r = await fetch(`${appBase}/smart/callback?error=access_denied&error_description=secret`, { redirect: 'manual' });
    expect(r.status).toBe(400);
    expect(JSON.stringify(await r.json())).not.toContain('secret');
  });

  test('token endpoint failure -> 502, no session', async () => {
    behavior.tokenFails = true;
    const { cb } = await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'abc' });
    expect(cb.status).toBe(502);
    expect(jar(cb)).toBe('');
  });

  test('id_token with the wrong audience or nonce is rejected', async () => {
    behavior.badAudience = true;
    expect((await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'a' })).cb.status).toBe(401);
    behavior = { badNonce: true };
    expect((await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'a' })).cb.status).toBe(401);
  });

  test('no session -> context says unauthenticated, patient data is 401', async () => {
    expect((await (await fetch(`${appBase}/api/smart/context`)).json()).authenticated).toBe(false);
    expect((await fetch(`${appBase}/api/smart/patient`)).status).toBe(401);
  });

  test('FHIR data is mapped to dosing inputs; stale / unconvertible values are withheld and reported', async () => {
    const { cb } = await runLaunch({ iss: `${ehrBase}/fhir`, launch: 'abc' });
    const res = await fetch(`${appBase}/api/smart/patient`, { headers: { cookie: jar(cb) } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dosingInputs.patient).toMatchObject({ sex: 'female', weightKg: 70, heightCm: 170, serumCreatinineMgDl: 1 });
    expect(body.dosingInputs.patient.ageYears).toBeGreaterThan(50);
    expect(body.dosingInputs.labs).toMatchObject({ ANC: 1200, platelets: 90000, potassium: 3.2 });
    expect(body.dosingInputs.labs.QTc).toBeUndefined();            // 40 days old: excluded
    expect(body.staleFields).toContain('QTc');
    expect(body.unconverted[0]).toMatchObject({ field: 'magnesium' }); // unit "furlongs"
    expect(body.dosingInputs.medications).toEqual(['Ondansetron 8 mg tablet']); // active only
    expect(body.medicationsUnresolved).toBe(1);
  });

  test('logout clears the session cookie', async () => {
    const r = await fetch(`${appBase}/api/smart/logout`, { method: 'POST' });
    expect(r.headers.getSetCookie()[0]).toMatch(/Max-Age=0/);
  });
});

describe('sealed cookies and config', () => {
  const opts = { secret: 'y'.repeat(40), label: 'smart-session' };
  test('round trip; tamper, wrong label and expiry all fail', () => {
    const t = seal({ a: 1 }, { ...opts, ttlSeconds: 60 });
    expect(unseal(t, opts)).toEqual({ a: 1 });
    expect(unseal(t.slice(0, -2) + 'AA', opts)).toBeNull();
    expect(unseal(t, { ...opts, label: 'smart-transaction' })).toBeNull();
    expect(unseal(t, { ...opts, secret: 'z'.repeat(40) })).toBeNull();
    expect(unseal(seal({ a: 1 }, { ...opts, ttlSeconds: -5 }), opts)).toBeNull();
  });

  test('production requires explicit client id, secret, redirect URI and allow-list', () => {
    expect(getSmartConfig({ NODE_ENV: 'production' }).problems).toEqual(
      expect.arrayContaining(['SMART_CLIENT_ID', 'SMART_REDIRECT_URI', 'SMART_ALLOWED_ISS']));
    const ok = getSmartConfig({ NODE_ENV: 'production', SMART_CLIENT_ID: 'c', SMART_SESSION_SECRET: 's'.repeat(40), SMART_REDIRECT_URI: 'https://a/smart/callback', SMART_ALLOWED_ISS: 'https://ehr.example/fhir/' });
    expect(ok.problems).toEqual([]);
    expect(issAllowed(ok, 'https://ehr.example/fhir')).toBe(true);
    expect(issAllowed(ok, 'http://ehr.example/fhir')).toBe(false);
    expect(issAllowed(ok, 'https://other.example/fhir')).toBe(false);
  });

  test('after a successful launch the browser lands on the safety-check screen by default', () => {
    expect(getSmartConfig({ NODE_ENV: 'development' }).postLoginUrl).toBe('/safety-check');
  });

  test('dev defaults allow only the public SMART sandbox', () => {
    const dev = getSmartConfig({ NODE_ENV: 'development' });
    expect(dev.allowedIss).toEqual(['https://launch.smarthealthit.org/v/r4/fhir']);
  });
});

describe('FHIR unit handling', () => {
  const obs = (code, value, unit, date = new Date().toISOString()) => ({ resourceType: 'Observation', status: 'final', code: { coding: [{ system: 'http://loinc.org', code }] }, effectiveDateTime: date, valueQuantity: { value, unit, code: unit } });
  test('converts SI units exactly', () => {
    const { values } = pickObservations([obs('2160-0', 88.4, 'umol/L'), obs('26499-4', 1.5, '10*9/L'), obs('29463-7', 154, '[lb_av]')]);
    expect(values.creatinine).toBe(1);
    expect(values.ANC).toBe(1500);
    expect(values.weightKg).toBeCloseTo(69.85, 1);
  });
  test('ignores entered-in-error and takes the latest result', () => {
    const { values } = pickObservations([
      { ...obs('2823-3', 9.9, 'mmol/L'), status: 'entered-in-error' },
      obs('2823-3', 4.1, 'mmol/L', new Date(Date.now() - 2 * 86400000).toISOString()),
      obs('2823-3', 3.9, 'mmol/L', new Date(Date.now() - 1 * 86400000).toISOString()),
    ]);
    expect(values.potassium).toBe(3.9);
  });
  test('empty input yields empty dosing inputs, never invented values', () => {
    const r = buildDosingInputs({ patient: {}, observations: [], medicationRequests: [] });
    expect(r.dosingInputs).toEqual({ patient: {}, labs: {}, medications: [] });
  });
});
