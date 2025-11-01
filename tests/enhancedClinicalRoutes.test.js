import express from 'express';
import request from 'supertest';
import router from '../src/routes/enhancedClinicalRoutes.js';

describe('Enhanced Clinical Routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/clinical', router);

  beforeAll(() => {
    // Enable dev token path in auth middleware
    process.env.NODE_ENV = 'development';
  });

  test('GET /drug-info/:rxcui returns 400 for invalid patientContext JSON', async () => {
    const res = await request(app)
      .get('/api/clinical/drug-info/12345?patientContext=notjson')
      .set('Authorization', 'Bearer dev-token-admin');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, error: 'Invalid patientContext JSON' });
  });
});

