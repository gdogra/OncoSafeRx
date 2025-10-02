import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import client from 'prom-client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { validateEnv, getBoolean } from './config/env.js';
import { initSentry, sentryErrorHandler } from './config/sentry.js';
import supabaseService from './config/supabase.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();
try {
  validateEnv();
} catch (e) {
  console.error('Fatal configuration error:', e?.message || e);
  process.exit(1);
}

// Middleware
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import drugRoutes from './routes/drugRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import genomicsRoutes, { fhirRouter as genomicsFhirRoutes } from './routes/genomicsRoutes.js';
import genomicsPartnerRoutes from './routes/genomicsPartnerRoutes.js';
import alternativesRoutes from './routes/alternativesRoutes.js';
import regimenRoutes from './routes/regimenRoutes.js';
import protocolRoutes from './routes/protocolRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cdsHooksRoutes from './routes/cdsHooksRoutes.js';
import smartRoutes from './routes/smartRoutes.js';
import trialRoutes from './routes/trialRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import prescribeRoutes from './routes/prescribeRoutes.js';
import dosingRoutes from './routes/dosingRoutes.js';
import editorialRoutes from './routes/editorialRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import overrideRoutes from './routes/overrideRoutes.js';
import epaRoutes from './routes/epaRoutes.js';
import authRoutes from './routes/authRoutes.js';
import supabaseAuthRoutes from './routes/supabaseAuthRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import enhancedDrugRoutes from './routes/enhancedDrugRoutes.js';
import enhancedInteractionRoutes from './routes/enhancedInteractionRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import roiRoutes from './routes/roiRoutes.js';
import painRoutes from './routes/painRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import clinicalTrialsRoutes from './routes/clinicalTrialsRoutes.js';
import drugAlternativesRoutes from './routes/drugAlternativesRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import rbacRoutes from './routes/rbacRoutes.js';
import dataArchitectureRoutes from './routes/dataArchitectureRoutes.js';
import advancedWorkflowRoutes from './routes/advancedWorkflowRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
initSentry(app);
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.set('trust proxy', 1);
// Harden security headers; enable a conservative baseline. For strict CSP, configure CSP_DIRECTIVES env or extend below.
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Strict Content Security Policy (CSP)
// Enable by setting ENABLE_CSP=true (recommended in production after verification)
if ((process.env.ENABLE_CSP || '').toLowerCase() === 'true' || NODE_ENV === 'production') {
  try {
    const supabaseWildcard = 'https://*.supabase.co';
    const su = process.env.SUPABASE_URL;
    let suOrigin = null;
    let suWs = null;
    try {
      if (su) {
        const u = new URL(su);
        suOrigin = `${u.protocol}//${u.host}`;
        suWs = `wss://${u.host}`;
      }
    } catch {}
    const directives = {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      // Scripts and styles must come from our origin only
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: [
        "'self'",
        suOrigin || supabaseWildcard,
        suWs || 'wss://*.supabase.co',
      ],
      // Enable HSTS when behind HTTPS (set ENABLE_HSTS=true)
    };
    app.use(helmet.contentSecurityPolicy({ directives, reportOnly: getBoolean('CSP_REPORT_ONLY', false) }));
  } catch (e) {
    console.warn('CSP configuration error:', e?.message || e);
  }
}
// Strict-Transport-Security when enabled; only use behind HTTPS/terminating proxy
if (getBoolean('ENABLE_HSTS', NODE_ENV === 'production')) {
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: false }));
}
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
    version: '1.0.1'
  });
});

// API Health check endpoint (for frontend)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    api: 'oncosaferx',
    supabase: {
      enabled: !!supabaseService?.enabled
    },
    warnings: (() => {
      const list = [];
      if (!supabaseService?.enabled) list.push('supabase_not_configured');
      return list;
    })()
  });
});

// Config check (server-side environment visibility; masked/summarized)
app.get('/api/config/check', (req, res) => {
  try {
    const cfg = {
      supabase: {
        enabled: !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
        urlPresent: !!process.env.SUPABASE_URL,
        serviceRolePresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecretPresent: !!process.env.SUPABASE_JWT_SECRET,
      },
      netlify: {
        configured: !!(process.env.NETLIFY_AUTH_TOKEN && process.env.NETLIFY_SITE_ID)
      },
      render: {
        configured: !!(process.env.RENDER_API_KEY && process.env.RENDER_SERVICE_ID)
      },
      warnings: []
    };
    if (!cfg.supabase.enabled) cfg.warnings.push('supabase_not_configured');
    return res.json(cfg);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read config' });
  }
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
    const token = process.env.METRICS_TOKEN;
    if (token) {
      const provided = req.headers['x-metrics-token'] || req.query.token;
      if (provided !== token) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/supabase-auth', supabaseAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/drugs/enhanced', enhancedDrugRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/interactions/enhanced', enhancedInteractionRoutes);
app.use('/api/genomics', genomicsRoutes);
app.use('/api/genomics', genomicsFhirRoutes);
app.use('/api/genomics', genomicsPartnerRoutes);
app.use('/api/alternatives', alternativesRoutes);
app.use('/api/regimens', regimenRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/clinical-trials', clinicalTrialsRoutes);
app.use('/api/drug-alternatives', drugAlternativesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/data-architecture', dataArchitectureRoutes);
app.use('/api/advanced-workflow', advancedWorkflowRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/export/epa', epaRoutes);
app.use('/api/prescribe', prescribeRoutes);
app.use('/api/dosing', dosingRoutes);
app.use('/api/editorial', editorialRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/pain', painRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/overrides', overrideRoutes);
app.use('/', cdsHooksRoutes);
app.use('/', smartRoutes);

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// In development, mount Vite dev server middleware so you don't need
// a separate terminal/process for the frontend. Requests for the SPA
// are served by Vite; API routes remain handled above.
if (NODE_ENV === 'development' && process.env.USE_VITE !== 'false') {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: join(__dirname, '../frontend'),
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    console.log('Vite dev middleware enabled on / (frontend)');
  } catch (e) {
    console.warn('Vite middleware failed, continuing without it:', e?.message || e);
  }
}

// Serve frontend build (SPA) for non-API routes in production
if (NODE_ENV !== 'development' || process.env.USE_VITE === 'false') {
  try {
    // Vite outputs to 'dist' by default
    const clientBuildPath = join(__dirname, '../frontend/dist');
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
}

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(sentryErrorHandler());
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
