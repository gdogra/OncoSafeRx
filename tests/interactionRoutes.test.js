import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler.js';

// Mock RxNormService and supabaseService before importing the router
const mockGetDrugDetails = jest.fn(async (rxcui) => ({ rxcui, name: rxcui === '11289' ? 'Warfarin' : rxcui === '1191' ? 'Aspirin' : `Drug ${rxcui}` }));
const mockGetDrugInteractions = jest.fn(async (rxcui) => ([
  {
    drug1_rxcui: rxcui,
    drug2_rxcui: rxcui === '11289' ? '1191' : '11289',
    drug1: { name: rxcui === '11289' ? 'Warfarin' : 'Aspirin' },
    drug2: { name: rxcui === '11289' ? 'Aspirin' : 'Warfarin' },
    severity: 'high',
    mechanism: 'Additive anticoagulant effects',
    effect: 'Increased risk of bleeding',
    management: 'Monitor INR closely'
  }
]));

jest.unstable_mockModule('../src/services/rxnormService.js', () => ({
  RxNormService: class {
    isValidRxcui(r) { return /^\d+$/.test(String(r)); }
    async getDrugDetails(r) { return mockGetDrugDetails(r); }
    async getDrugInteractions(r) { return mockGetDrugInteractions(r); }
    async searchDrugs() { return []; }
  }
}));

jest.unstable_mockModule('../src/config/supabase.js', () => ({
  default: {
    enabled: false,
    async getDrugByRxcui() { return null; },
    async checkMultipleInteractions() { return []; }
  }
}));

const { default: interactionRoutes } = await import('../src/routes/interactionRoutes.js');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/interactions', interactionRoutes);
  app.use(errorHandler);
  return app;
}

describe('interactionRoutes /check', () => {
  test('rejects non-RXCUI payload (objects)', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/interactions/check')
      .send({ drugs: [{ rxcui: '11289', name: 'Warfarin' }, { rxcui: '1191', name: 'Aspirin' }] });
    expect(res.statusCode).toBe(400);
    expect(res.body?.error).toMatch(/RXCUI|valid/i);
  });

  test('accepts RXCUI string array and normalizes severities', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/interactions/check')
      .send({ drugs: ['11289', '1191'] });
    expect(res.statusCode).toBe(200);
    expect(res.body?.interactions).toBeTruthy();
    const combined = [
      ...(res.body?.interactions?.stored || []),
      ...(res.body?.interactions?.external || [])
    ];
    // Our mocked severity is 'high'; route normalizes to 'major'
    expect(combined.some(i => String(i.severity).toLowerCase() === 'major')).toBe(true);
  });
});

