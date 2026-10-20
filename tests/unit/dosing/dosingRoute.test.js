import express from 'express';
import dosingRoutes from '../../../src/routes/dosingRoutes.js';

let server; let base;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/dosing', dosingRoutes);
  await new Promise((r) => { server = app.listen(0, '127.0.0.1', r); });
  base = `http://127.0.0.1:${server.address().port}/api/dosing/adjust`;
});
afterAll(() => new Promise((r) => server.close(r)));

const post = (body) => fetch(base, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('404 for unknown regimen', async () => {
  expect((await post({ regimenId: 'NOPE' })).status).toBe(404);
});

test('DPYD poor metabolizer on FOLFOX-6 returns a critical avoid finding, doses, disclaimer', async () => {
  const res = await post({
    regimenId: 'folfox-6',
    phenotypes: { DPYD: 'Poor metabolizer' },
    patient: { heightCm: 170, weightKg: 70 },
    labs: { ANC: 2000, platelets: 200000 },
  });
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.findings[0]).toMatchObject({ ruleId: 'DPYD-POOR-FLUOROPYRIMIDINE', action: 'avoid', severity: 'critical' });
  expect(body.warnings.join(' ')).toMatch(/DPYD poor metabolizer/);
  expect(body.calculatedDoses.find((d) => d.component === 'Oxaliplatin').calculatedMg).toBeGreaterThan(100);
  expect(body.disclaimer).toMatch(/Decision support only/);
});
