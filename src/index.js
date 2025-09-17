import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import client from 'prom-client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Middleware
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import drugRoutes from './routes/drugRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import genomicsRoutes, { fhirRouter as genomicsFhirRoutes } from './routes/genomicsRoutes.js';
import alternativesRoutes from './routes/alternativesRoutes.js';
import regimenRoutes from './routes/regimenRoutes.js';
import cdsHooksRoutes from './routes/cdsHooksRoutes.js';
import smartRoutes from './routes/smartRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(s => s.trim()), credentials: true }));
app.use(compression());

// Request ID middleware
app.use((req, res, next) => {
  const headerId = req.headers['x-request-id'];
  const id = Array.isArray(headerId) ? headerId[0] : headerId;
  req.id = id || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// JSON logging with morgan
morgan.token('id', (req) => req.id);
morgan.token('real-ip', (req) => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString());
app.use(morgan((tokens, req, res) => {
  const log = {
    time: tokens.date(req, res, 'iso'),
    id: tokens.id(req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    length: tokens.res(req, res, 'content-length'),
    ref: tokens.referrer(req, res),
    ua: tokens['user-agent'](req, res),
    ip: tokens['real-ip'](req, res),
    responseTimeMs: Number(tokens['response-time'](req, res))
  };
  return JSON.stringify(log);
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Prometheus metrics
client.collectDefaultMetrics();
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
});

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;
    const route = req.route?.path || req.path || 'unknown';
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(seconds);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// API routes
app.use('/api/drugs', drugRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/genomics', genomicsRoutes);
app.use('/api/genomics', genomicsFhirRoutes);
app.use('/api/alternatives', alternativesRoutes);
app.use('/api/regimens', regimenRoutes);
app.use('/', cdsHooksRoutes);
app.use('/', smartRoutes);

// Serve frontend build (SPA) for non-API routes, if available
try {
  const clientBuildPath = join(__dirname, '../frontend/build');
  if (process.env.SERVE_FRONTEND !== 'false') {
    app.use(express.static(clientBuildPath));
    // Route all non-API requests to React index.html
    app.get(/^\/(?!api).*/, (req, res, next) => {
      res.sendFile(join(clientBuildPath, 'index.html'), (err) => {
        if (err) next();
      });
    });
  }
} catch (e) {
  // ignore if build folder not present
}

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`OncoSafeRx API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force shutdown after timeout
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
