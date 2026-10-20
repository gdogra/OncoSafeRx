import express from 'express';
import { createOverrideRouter } from '../../../src/routes/overrideRoutes.js';
import { createMemoryStore, summarize, getOverrideStore, PersistenceUnavailableError } from '../../../src/services/overrideStore.js';
import { evaluateRegimen } from '../../../src/engine/dosing/evaluate.js';
import REGIMENS from '../../../src/data/regimens.js';

let server; let base; let store; let currentUser;
beforeAll(async () => {
  store = createMemoryStore();
  const app = express();
  app.use(express.json());
  app.use('/api/overrides', createOverrideRouter({
    authenticate: (req, res, next) => (currentUser ? ((req.user = currentUser), next()) : res.status(401).json({ error: 'No token provided' })),
    requireAdminRole: (req, res, next) => (['admin', 'super_admin'].includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' })),
    getStore: () => store,
  }));
  await new Promise((r) => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}/api/overrides`;
});
afterAll(() => new Promise((r) => server.close(r)));
beforeEach(() => { currentUser = { id: 'u1', role: 'oncologist' }; });

const post = (body) => fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('requires authentication', async () => {
  currentUser = null;
  expect((await post({ action: 'accept', ruleId: 'X' })).status).toBe(401);
  expect((await fetch(base)).status).toBe(401);
});

test('override needs a reason; "other" needs text', async () => {
  expect((await post({ action: 'override', ruleId: 'DPYD-POOR-FLUOROPYRIMIDINE' })).status).toBe(400);
  expect((await post({ action: 'override', ruleId: 'R1', reasonCode: 'other' })).status).toBe(400);
  expect((await post({ action: 'override', ruleId: 'R1', reasonCode: 'made_up' })).status).toBe(400);
  const ok = await post({ action: 'override', ruleId: 'R1', reasonCode: 'other', reasonText: 'palliative intent' });
  expect(ok.status).toBe(201);
});

test('user comes from the session, not the body; unknown fields are dropped', async () => {
  const res = await post({ action: 'accept', ruleId: 'HEME-COUNTS-DELAY', ruleVersion: 'abc123', userId: 'attacker', user_id: 'attacker', source: 'dosing' });
  expect(res.status).toBe(201);
  const row = await res.json();
  expect(row.user_id).toBe('u1');
  expect(row.userId).toBeUndefined();
});

test('users only see their own history', async () => {
  await post({ action: 'accept', ruleId: 'MINE' });
  currentUser = { id: 'u2', role: 'oncologist' };
  await post({ action: 'accept', ruleId: 'THEIRS' });
  const body = await (await fetch(base)).json();
  expect(body.overrides.every((o) => o.user_id === 'u2')).toBe(true);
});

test('summary is admin-only and reports override rate by rule version', async () => {
  expect((await fetch(`${base}/summary`)).status).toBe(403);
  currentUser = { id: 'a1', role: 'admin' };
  await post({ action: 'override', ruleId: 'NOISY', ruleVersion: 'v1', reasonCode: 'not_clinically_relevant' });
  await post({ action: 'override', ruleId: 'NOISY', ruleVersion: 'v1', reasonCode: 'not_clinically_relevant' });
  await post({ action: 'accept', ruleId: 'NOISY', ruleVersion: 'v1' });
  const { rules } = await (await fetch(`${base}/summary`)).json();
  const noisy = rules.find((r) => r.rule_id === 'NOISY');
  expect(noisy).toMatchObject({ accepted: 1, overridden: 2, reasons: { not_clinically_relevant: 2 } });
  expect(noisy.override_rate).toBeCloseTo(2 / 3);
});

test('production without a database fails loudly instead of dropping records', () => {
  expect(() => getOverrideStore({ NODE_ENV: 'production' })).toThrow(PersistenceUnavailableError);
});

test('summarize handles empty input', () => expect(summarize([])).toEqual([]));

test('dosing findings carry a stable content-hash rule version', () => {
  const run = () => evaluateRegimen({ regimen: REGIMENS.find((r) => r.id === 'FOLFOX-6'), phenotypes: { DPYD: 'Poor metabolizer' }, patient: {} });
  const f = run().findings.find((x) => x.ruleId === 'DPYD-POOR-FLUOROPYRIMIDINE');
  expect(f.ruleVersion).toMatch(/^[0-9a-f]{12}$/);
  expect(run().findings.find((x) => x.ruleId === 'DPYD-POOR-FLUOROPYRIMIDINE').ruleVersion).toBe(f.ruleVersion);
});
