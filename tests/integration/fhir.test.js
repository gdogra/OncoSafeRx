import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import fhirRoutes from '../../src/routes/fhirRoutes.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';

const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api/fhir', fhirRoutes);

  app.use('*', notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('FHIR Routes', () => {
  let app;
  beforeAll(() => {
    app = createTestApp();
  });

  it('GET /api/fhir/health should return status and timestamp', async () => {
    const res = await request(app).get('/api/fhir/health').expect(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/fhir/patients?name=emma should return a list (mock fallback OK)', async () => {
    const res = await request(app).get('/api/fhir/patients?name=emma').expect(200);
    expect(res.body).toHaveProperty('count');
    expect(Array.isArray(res.body.patients)).toBe(true);
  });

  it('GET /api/fhir/patients/patient-1 should return a patient (mock template)', async () => {
    const res = await request(app).get('/api/fhir/patients/patient-1').expect(200);
    expect(res.body).toHaveProperty('patient');
    expect(res.body.patient).toHaveProperty('id');
  });
});

