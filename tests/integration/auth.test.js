import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '../../src/routes/authRoutes.js';
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

  // Error handlers
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('Auth API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'testpassword123',
      full_name: 'Test User',
      role: 'user'
    };

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn', '24h');
      
      // User data should not include password
      expect(response.body.user).not.toHaveProperty('password_hash');
      expect(response.body.user.email).toBe(validUserData.email);
      expect(response.body.user.full_name).toBe(validUserData.full_name);
      expect(response.body.user.role).toBe(validUserData.role);
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid email');
    });

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          password: '123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least 8 characters');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // missing password and full_name
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validUserData,
          role: 'invalid-role'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be one of');
    });

    it('should set default role to user when role not provided', async () => {
      const userData = { ...validUserData };
      delete userData.role;

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('user');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('valid email');
    });

    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should return 403 when invalid token provided', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          current_password: 'oldpassword',
          new_password: 'newpassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Access token required');
    });

    it('should reject request with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          current_password: 'old',
          new_password: '123' // too short
        })
        .expect(403); // Will fail on auth first

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('GET /api/auth/status', () => {
    it('should return unauthenticated status when no token', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .expect(200);

      expect(response.body).toHaveProperty('authenticated', false);
    });

    it('should return unauthenticated status with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/status')
        .set('Authorization', 'Bearer invalid-token')
        .expect(200);

      expect(response.body).toHaveProperty('authenticated', false);
    });
  });

  describe('Admin Routes', () => {
    describe('GET /api/auth/users', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app)
          .get('/api/auth/users')
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Access token required');
      });
    });

    describe('PUT /api/auth/users/:userId/role', () => {
      it('should return 401 when no token provided', async () => {
        const response = await request(app)
          .put('/api/auth/users/123/role')
          .send({ role: 'admin' })
          .expect(401);

        expect(response.body).toHaveProperty('error', 'Access token required');
      });

      it('should reject invalid role', async () => {
        const response = await request(app)
          .put('/api/auth/users/123/role')
          .set('Authorization', 'Bearer invalid-token')
          .send({ role: 'invalid-role' })
          .expect(403); // Will fail on auth first

        expect(response.body).toHaveProperty('error');
      });
    });
  });
});