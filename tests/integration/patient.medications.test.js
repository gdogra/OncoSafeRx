import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import patientRoutes from '../../src/routes/patientRoutes.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';

// Create test app focused on patient + medications
const createTestApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api/patients', patientRoutes);

  app.use('*', notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Patient Medications API', () => {
  let app;
  let patientId;

  beforeAll(() => {
    app = createTestApp();
  });

  it('creates a patient profile (no-op mode OK)', async () => {
    const patient = {
      id: `patient-test-${Date.now()}`,
      demographics: { firstName: 'Test', lastName: 'User' },
      medications: [],
      allergies: [],
      conditions: []
    };

    const res = await request(app)
      .post('/api/patients')
      .send({ patient })
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    const saved = res.body.patient?.data || res.body.patient || patient;
    expect(saved).toBeTruthy();
    patientId = saved.id || patient.id;
    expect(patientId).toBeTruthy();
  });

  it('lists medications (initially empty)', async () => {
    const res = await request(app)
      .get(`/api/patients/${encodeURIComponent(patientId)}/medications`)
      .expect(200);

    expect(res.body).toHaveProperty('medications');
    expect(Array.isArray(res.body.medications)).toBe(true);
  });

  it('adds a medication', async () => {
    const med = {
      id: `med-${Date.now()}`,
      drugName: 'Acetaminophen',
      dosage: '500 mg',
      frequency: 'Once daily',
      isActive: true,
      startDate: '2024-01-01'
    };

    const res = await request(app)
      .post(`/api/patients/${encodeURIComponent(patientId)}/medications`)
      .send({ medication: med })
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    expect(Array.isArray(res.body.medications)).toBe(true);
    const found = res.body.medications.find((m) => m.id === med.id);
    expect(found).toBeTruthy();
  });

  it('updates a medication', async () => {
    const medId = `med-update-${Date.now()}`;
    // create first
    await request(app)
      .post(`/api/patients/${encodeURIComponent(patientId)}/medications`)
      .send({ medication: { id: medId, drugName: 'Ibuprofen', dosage: '200 mg', frequency: 'Twice daily', isActive: true, startDate: '2024-01-01' } })
      .expect(200);

    const patch = { dosage: '400 mg' };
    const res = await request(app)
      .put(`/api/patients/${encodeURIComponent(patientId)}/medications/${encodeURIComponent(medId)}`)
      .send({ medication: patch })
      .expect(200);

    const updated = res.body.medications.find((m) => m.id === medId);
    expect(updated).toBeTruthy();
    expect(updated.dosage).toBe('400 mg');
  });

  it('completes and restores a medication', async () => {
    const medId = `med-complete-${Date.now()}`;
    // create
    await request(app)
      .post(`/api/patients/${encodeURIComponent(patientId)}/medications`)
      .send({ medication: { id: medId, drugName: 'Amoxicillin', dosage: '500 mg', frequency: 'Three times daily', isActive: true, startDate: '2024-01-01' } })
      .expect(200);

    // complete
    let res = await request(app)
      .put(`/api/patients/${encodeURIComponent(patientId)}/medications/${encodeURIComponent(medId)}`)
      .send({ medication: { isActive: false, endDate: '2024-02-01' } })
      .expect(200);

    let med = res.body.medications.find((m) => m.id === medId);
    expect(med).toBeTruthy();
    expect(med.isActive).toBe(false);
    expect(med.endDate).toBe('2024-02-01');

    // restore
    res = await request(app)
      .put(`/api/patients/${encodeURIComponent(patientId)}/medications/${encodeURIComponent(medId)}`)
      .send({ medication: { isActive: true, endDate: null } })
      .expect(200);

    med = res.body.medications.find((m) => m.id === medId);
    expect(med).toBeTruthy();
    expect(med.isActive).toBe(true);
  });

  it('deletes a medication', async () => {
    const medId = `med-delete-${Date.now()}`;
    // create
    await request(app)
      .post(`/api/patients/${encodeURIComponent(patientId)}/medications`)
      .send({ medication: { id: medId, drugName: 'Metformin', dosage: '500 mg', frequency: 'Twice daily', isActive: true, startDate: '2024-01-01' } })
      .expect(200);

    const res = await request(app)
      .delete(`/api/patients/${encodeURIComponent(patientId)}/medications/${encodeURIComponent(medId)}`)
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    expect(res.body.deleted).toBe(medId);
    const exists = (res.body.medications || []).some((m) => m.id === medId);
    expect(exists).toBe(false);
  });
});

