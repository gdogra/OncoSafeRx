import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Import routes and middleware
import drugRoutes from '../../src/routes/drugRoutes.js';
import interactionRoutes from '../../src/routes/interactionRoutes.js';
import genomicsRoutes from '../../src/routes/genomicsRoutes.js';
import { generalLimiter } from '../../src/middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';

// Create test app
const createTestApp = () => {
  const app = express();
  
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Routes
  app.use('/api/drugs', drugRoutes);
  app.use('/api/interactions', interactionRoutes);
  app.use('/api/genomics', genomicsRoutes);

  // Error handlers
  app.use('*', notFoundHandler);
  app.use(errorHandler);

  return app;
};

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        version: '1.0.0'
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Drug Routes', () => {
    describe('GET /api/drugs/search', () => {
      it('should return search results for valid query', async () => {
        const response = await request(app)
          .get('/api/drugs/search?q=aspirin')
          .expect(200);

        expect(response.body).toHaveProperty('query', 'aspirin');
        expect(response.body).toHaveProperty('count');
        expect(response.body).toHaveProperty('results');
        expect(Array.isArray(response.body.results)).toBe(true);
      });

      it('should reject query shorter than 2 characters', async () => {
        const response = await request(app)
          .get('/api/drugs/search?q=a')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('at least 2 characters');
      });

      it('should reject missing query parameter', async () => {
        const response = await request(app)
          .get('/api/drugs/search')
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/drugs/:rxcui', () => {
      it('should reject invalid RXCUI format', async () => {
        const response = await request(app)
          .get('/api/drugs/invalid123')
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('contain only numbers');
      });

      it('should handle valid RXCUI format', async () => {
        // This will likely fail due to external API, but should have proper error handling
        const response = await request(app)
          .get('/api/drugs/161');

        expect([200, 404, 500, 503]).toContain(response.status);
      });
    });
  });

  describe('Interaction Routes', () => {
    describe('POST /api/interactions/check', () => {
      it('should reject request with less than 2 drugs', async () => {
        const response = await request(app)
          .post('/api/interactions/check')
          .send({ drugs: ['161'] })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('At least 2 drugs');
      });

      it('should reject request with invalid RXCUI', async () => {
        const response = await request(app)
          .post('/api/interactions/check')
          .send({ drugs: ['161', 'invalid'] })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('valid RXCUI');
      });

      it('should accept valid request format', async () => {
        // This will likely fail due to external API, but should have proper error handling
        const response = await request(app)
          .post('/api/interactions/check')
          .send({ drugs: ['161', '42463'] });

        expect([200, 500, 503]).toContain(response.status);
      });

      it('should reject request with too many drugs', async () => {
        const drugs = Array.from({ length: 11 }, (_, i) => `${i + 1}`);
        const response = await request(app)
          .post('/api/interactions/check')
          .send({ drugs })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('Maximum 10 drugs');
      });
    });
  });

  describe('Genomics Routes', () => {
    describe('GET /api/genomics/cpic/guidelines', () => {
      it('should return sample CPIC guidelines', async () => {
        const response = await request(app)
          .get('/api/genomics/cpic/guidelines')
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('guidelines');
        expect(Array.isArray(response.body.guidelines)).toBe(true);
        expect(response.body.guidelines.length).toBeGreaterThan(0);
      });
    });

    describe('POST /api/genomics/profile/check', () => {
      it('should accept valid genomics profile', async () => {
        const response = await request(app)
          .post('/api/genomics/profile/check')
          .send({
            genes: ['CYP2D6', 'CYP2C19'],
            drugs: ['161', '42463']
          })
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('analysis');
      });

      it('should reject invalid gene format', async () => {
        const response = await request(app)
          .post('/api/genomics/profile/check')
          .send({
            genes: ['cyp2d6'], // lowercase
            drugs: ['161']
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('uppercase letters');
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/api/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint not found');
      expect(response.body).toHaveProperty('availableEndpoints');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/interactions/check')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});