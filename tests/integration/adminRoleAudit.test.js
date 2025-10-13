import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../../src/routes/authRoutes.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';
import { jest } from '@jest/globals';

// Mock supabase service before importing adminRoutes
const calls = { auditInsert: [] };
const users = [
  { id: 'target-1', email: 'user1@example.com', full_name: 'User One', role: 'user', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const mockService = {
  enabled: true,
  client: {
    from: (table) => {
      return {
        insert: async (payload) => {
          if (table === 'admin_audit') {
            calls.auditInsert.push(payload);
            return { data: [{ id: payload?.id }], error: null };
          }
          return { data: null, error: null };
        },
        select: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }),
        eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
        delete: () => ({ eq: async () => ({ data: null, error: null }) }),
        upsert: async () => ({ data: null, error: null }),
        order: () => ({ limit: async () => ({ data: [], error: null }) }),
        range: async () => ({ data: [], error: null, count: 0 }),
        gte: function() { return this; },
        lte: function() { return this; },
      };
    }
  },
  getAllUsers: async () => users.map(u => ({ ...u })),
  updateUser: async (id, data) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) users[idx] = { ...users[idx], ...data, updated_at: new Date().toISOString() };
    return { ...users[idx] };
  }
};

jest.unstable_mockModule('../../src/config/supabase.js', () => ({ default: mockService }));
const { default: adminRoutes } = await import('../../src/routes/adminRoutes.js');

const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('*', notFoundHandler);
  app.use(errorHandler);
  return app;
};

describe('Admin role update inserts audit', () => {
  let app;
  let adminToken;

  beforeAll(async () => {
    app = createApp();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@example.com', password: 'secret1234', full_name: 'Admin', role: 'admin' })
      .expect(201);
    adminToken = reg.body.token;
  });

  it('updates role and inserts admin_audit row', async () => {
    const resp = await request(app)
      .put('/api/admin/users/target-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'pharmacist' })
      .expect(200);

    expect(resp.body.user.role).toBe('pharmacist');
    expect(calls.auditInsert.length).toBeGreaterThan(0);
    const last = calls.auditInsert[calls.auditInsert.length - 1];
    expect(last.action).toBe('role_update');
    expect(last.target_user_id).toBe('target-1');
    expect(last.details).toEqual(expect.objectContaining({ before: 'user', after: 'pharmacist' }));
  });
});

