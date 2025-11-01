import express from 'express';
import request from 'supertest';
import router from '../src/routes/authRoutes.js';

describe('Auth patient profile', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', router);

  test('register allows optional patient_profile and role patient', async () => {
    const payload = {
      email: `pat-${Date.now()}@example.com`,
      password: 'StrongPass123',
      full_name: 'Pat Example',
      role: 'patient',
      patient_profile: {
        demographics: { firstName: 'Pat' },
        cancer: { cancerType: 'breast' }
      }
    };

    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(201);
    expect(res.body?.user?.role).toBe('patient');
    expect(res.body?.user?.patient_profile?.demographics?.firstName).toBe('Pat');
  });
});

