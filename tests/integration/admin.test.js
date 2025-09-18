import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../../src/routes/authRoutes.js';
import adminRoutes from '../../src/routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);

  // Error handlers
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Admin API Integration Tests', () => {
  let app;
  let adminToken;

  beforeAll(async () => {
    app = createTestApp();
    
    // Create admin user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testadmin@example.com',
        password: 'testpassword123',
        full_name: 'Test Admin',
        role: 'admin'
      });
    
    adminToken = registerResponse.body.token;
  });

  describe('Authentication and Authorization', () => {
    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });

    it('should reject non-admin users', async () => {
      // Create regular user
      const userResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'testuser@example.com',
          password: 'testpassword123',
          full_name: 'Test User',
          role: 'user'
        });

      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${userResponse.body.token}`)
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Dashboard Endpoints', () => {
    describe('GET /api/admin/dashboard', () => {
      it('should return dashboard statistics', async () => {
        const response = await request(app)
          .get('/api/admin/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Admin dashboard data');
        expect(response.body).toHaveProperty('stats');
        expect(response.body.stats).toHaveProperty('users');
        expect(response.body.stats).toHaveProperty('system');
        expect(response.body).toHaveProperty('timestamp');
      });
    });

    describe('GET /api/admin/users', () => {
      it('should return paginated user list', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('users');
        expect(response.body).toHaveProperty('pagination');
        expect(response.body.pagination).toHaveProperty('page');
        expect(response.body.pagination).toHaveProperty('limit');
        expect(response.body.pagination).toHaveProperty('total');
        expect(Array.isArray(response.body.users)).toBe(true);
      });

      it('should support pagination parameters', async () => {
        const response = await request(app)
          .get('/api/admin/users?page=1&limit=10')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.pagination.page).toBe(1);
        expect(response.body.pagination.limit).toBe(10);
      });
    });

    describe('GET /api/admin/logs', () => {
      it('should return system logs', async () => {
        const response = await request(app)
          .get('/api/admin/logs')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('logs');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.logs)).toBe(true);
      });
    });

    describe('GET /api/admin/config', () => {
      it('should return system configuration', async () => {
        const response = await request(app)
          .get('/api/admin/config')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'System configuration');
        expect(response.body).toHaveProperty('config');
        expect(response.body.config).toHaveProperty('database');
        expect(response.body.config).toHaveProperty('environment');
        expect(response.body.config).toHaveProperty('features');
      });
    });
  });

  describe('Data Sync Operations', () => {
    describe('POST /api/admin/sync/:type', () => {
      it('should initiate rxnorm sync', async () => {
        const response = await request(app)
          .post('/api/admin/sync/rxnorm')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'rxnorm sync initiated');
        expect(response.body).toHaveProperty('syncId');
        expect(response.body).toHaveProperty('status', 'started');
      });

      it('should initiate cpic sync', async () => {
        const response = await request(app)
          .post('/api/admin/sync/cpic')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('message', 'cpic sync initiated');
      });

      it('should reject invalid sync type', async () => {
        const response = await request(app)
          .post('/api/admin/sync/invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Invalid sync type');
        expect(response.body).toHaveProperty('validTypes');
      });
    });
  });

  describe('Data Export', () => {
    describe('GET /api/admin/export/:type', () => {
      it('should export users data', async () => {
        const response = await request(app)
          .get('/api/admin/export/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.headers['content-disposition']).toContain('attachment');
      });

      it('should export stats data', async () => {
        const response = await request(app)
          .get('/api/admin/export/stats')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('userCount');
        expect(response.body).toHaveProperty('activeUsers');
        expect(response.body).toHaveProperty('roleDistribution');
        expect(response.body).toHaveProperty('exportedAt');
      });

      it('should reject invalid export type', async () => {
        const response = await request(app)
          .get('/api/admin/export/invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);

        expect(response.body).toHaveProperty('error', 'Invalid export type');
        expect(response.body).toHaveProperty('validTypes');
      });
    });
  });

  describe('User Management', () => {
    describe('GET /api/admin/users/:userId', () => {
      it('should return user details for demo user', async () => {
        const response = await request(app)
          .get('/api/admin/users/demo-123')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id', 'demo-123');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).not.toHaveProperty('password_hash');
      });
    });
  });
});