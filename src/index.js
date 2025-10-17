import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import client from 'prom-client';
import { incHttpError, incHttpRequest } from './utils/metrics.js';
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
import { generalLimiter, probeLimiter } from './middleware/rateLimiter.js';
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
import diagnosticsRoutes from './routes/diagnosticsRoutes.js';
import pushRoutes from './routes/pushRoutes.js';
import fhirRoutes from './routes/fhirRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import { join as pathJoin } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
await initSentry(app);
const PORT = parseInt(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const logInfo = (...args) => { if (!IS_PROD) console.log(...args); };
// SECURITY FIX: Remove wildcard CORS default
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://oncosaferx.com,https://www.oncosaferx.com,http://localhost:3000';

logInfo(`Starting server on PORT=${PORT}`);
logInfo(`Environment: ${NODE_ENV}`);
logInfo(`CORS Origin: ${CORS_ORIGIN}`);

// Middleware
app.set('trust proxy', 1);
// Harden security headers; enable a conservative baseline. For strict CSP, configure CSP_DIRECTIVES env or extend below.
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Strict Content Security Policy (CSP)
// Enable by setting ENABLE_CSP=true (recommended after verifying headers at the edge)
// Do NOT auto-enable for all production traffic to avoid conflicts with Netlify headers during migration.
if ((process.env.ENABLE_CSP || '').toLowerCase() === 'true') {
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
      // Allow style attributes/inlines for React libraries that inject styles
      styleSrc: ["'self'", "'unsafe-inline'"],
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
// Strict-Transport-Security when explicitly enabled; only use behind HTTPS/terminating proxy
if (getBoolean('ENABLE_HSTS', false)) {
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

// Rate limiting (skip in development)
if (process.env.NODE_ENV !== 'development') {
  app.use(generalLimiter);
} else {
  console.log('⚠️  Rate limiting disabled in development mode');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '20.0.0'
  });
});

// API Health check endpoint (for frontend)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '20.0.0',
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

// (Diagnostics endpoint removed after stabilization)

// Public frontend config (anon/public values only)
app.get('/api/frontend/config', (req, res) => {
  try {
    const cfg = {
      supabaseUrl: process.env.SUPABASE_URL || null,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || null,
      apiBaseUrl: process.env.API_BASE_URL || '/api',
    };
    return res.json(cfg);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read frontend config' });
  }
});

// Config check (server-side environment visibility; masked/summarized)
app.get('/api/config/check', async (req, res) => {
  try {
    const fs = await import('fs');
    const clientBuildPath = join(__dirname, '../frontend/dist');
    const indexPath = join(clientBuildPath, 'index.html');
    
    const cfg = {
      supabase: {
        enabled: !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
        urlPresent: !!process.env.SUPABASE_URL,
        serviceRolePresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        jwtSecretPresent: !!process.env.SUPABASE_JWT_SECRET,
      },
      frontend: {
        serveFrontend: process.env.SERVE_FRONTEND,
        nodeEnv: NODE_ENV,
        buildPathExists: fs.existsSync(clientBuildPath),
        indexExists: fs.existsSync(indexPath),
        buildPath: clientBuildPath,
        indexPath: indexPath
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
    if (!cfg.frontend.buildPathExists) cfg.warnings.push('frontend_build_missing');
    return res.json(cfg);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to read config', details: e.message });
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

// Normalize route labels to avoid high-cardinality metrics
function normalizeRouteForMetrics(p) {
  try {
    const path = String(p || '').split('?')[0];
    // Canonicalize common buckets to avoid query-dependent explosion
    const aliases = [
      { rx: /^\/api\/search(\/|$)/i, canonical: '/api/search' },
      { rx: /^\/api\/analytics(\/|$)/i, canonical: '/api/analytics' },
      { rx: /^\/api\/interactions(\/|$)/i, canonical: '/api/interactions' },
      { rx: /^\/api\/drugs(\/|$)/i, canonical: '/api/drugs' },
      { rx: /^\/api\/patients(\/|$)/i, canonical: '/api/patients' },
      { rx: /^\/metrics$/i, canonical: '/metrics' },
      { rx: /^\/health$/i, canonical: '/health' },
    ];
    for (const a of aliases) {
      if (a.rx.test(path)) return a.canonical;
    }
    // Replace UUIDs, numeric IDs, long hex, and hashes with :id
    const parts = path.split('/').map(seg => {
      if (!seg) return seg;
      if (/^[0-9]+$/.test(seg)) return ':id';
      if (/^[0-9a-fA-F]{24,}$/.test(seg)) return ':id';
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(seg)) return ':id';
      if (seg.length > 64) return ':blob';
      return seg;
    });
    // Collapse consecutive :id segments where sensible
    return parts.join('/') || '/';
  } catch {
    return 'unknown';
  }
}

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;
    // Prefer normalized path; req.route is often undefined here
    const route = normalizeRouteForMetrics(req.path || 'unknown');
    try { incHttpRequest(req.method, route); } catch {}
    httpRequestDuration.labels(req.method, route, String(res.statusCode)).observe(seconds);
    if (res.statusCode >= 400) {
      try { incHttpError(res.statusCode, route); } catch {}
    }
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

// Human-readable metrics summary (no scrape output)
app.get('/metrics/help', (req, res) => {
  try {
    const metrics = [
      {
        name: 'http_request_duration_seconds',
        type: 'histogram',
        help: 'HTTP request duration in seconds',
        labels: ['method', 'route', 'status'],
        buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5]
      },
      {
        name: 'http_requests_total',
        type: 'counter',
        help: 'Total HTTP requests by method and route',
        labels: ['method', 'path']
      },
      {
        name: 'http_errors_total',
        type: 'counter',
        help: 'Count of HTTP error responses',
        labels: ['status', 'path']
      },
      {
        name: 'auth_denied_total',
        type: 'counter',
        help: 'Count of denied auth attempts',
        labels: ['reason', 'path']
      },
      {
        name: 'rate_limit_hits_total',
        type: 'counter',
        help: 'Count of rate limit hits by scope',
        labels: ['scope', 'path']
      },
      {
        name: 'probe_requests_total',
        type: 'counter',
        help: 'Count of denied probe/scanner requests',
        labels: ['path']
      }
    ];
    const notes = [
      'Route labels are normalized to reduce cardinality (UUIDs/IDs redacted).',
      'Set METRICS_TOKEN to protect /metrics; pass via X-METRICS-TOKEN or ?token=.',
      'Default Node metrics are also collected by prom-client.'
    ];
    res.json({
      metrics,
      auth: { tokenRequired: !!process.env.METRICS_TOKEN },
      notes
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to render metrics help' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/supabase-auth', supabaseAuthRoutes);
app.use('/api/admin', adminRoutes);
const APP_DEBUG = String(process.env.APP_DEBUG || '').toLowerCase() === 'true';
if (APP_DEBUG || String(process.env.ADMIN_DEBUG || process.env.DEBUG_AUTH || '').toLowerCase() === 'true') {
  console.log('🚀 ADMIN ROUTES REGISTERED - Ready for authentication debugging');
}
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
app.use('/api/diagnostics', diagnosticsRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/fhir', fhirRoutes);
app.use('/api/integrations', integrationRoutes);

// Serve OpenAPI spec (static YAML)
app.get(['/openapi.yaml','/api/openapi.yaml'], (req, res) => {
  try {
    res.type('text/yaml');
    res.sendFile(join(__dirname, '../docs/openapi.yaml'));
  } catch (e) {
    res.status(500).json({ error: 'Failed to serve spec' });
  }
});
app.use('/api/export', exportRoutes);
app.use('/api/export/epa', epaRoutes);
app.use('/api/prescribe', prescribeRoutes);
app.use('/api/dosing', dosingRoutes);
app.use('/api/editorial', editorialRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/pain', painRoutes);
// Allow disabling patient APIs to simplify or avoid DB deps
const PATIENTS_DISABLED = String(process.env.PATIENTS_DISABLED || '').toLowerCase() === 'true';
if (PATIENTS_DISABLED) {
  console.log('⚠️  Patients API disabled via env (PATIENTS_DISABLED=true)');
  app.use('/api/patients', (req, res) => {
    // Provide a stable shape so frontends don’t crash
    if (req.method === 'GET') return res.json({ patients: [], total: 0, page: 1, pageSize: 0, disabled: true });
    return res.status(503).json({ error: 'Patients feature disabled' });
  });
} else {
  app.use('/api/patients', patientRoutes);
}
app.use('/api/feedback', feedbackRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/overrides', overrideRoutes);
app.use('/', cdsHooksRoutes);
app.use('/', smartRoutes);

// Serve static files from public directory
app.use(express.static(join(__dirname, '../public')));

// Deny-list common scanner/probe paths (reduce noise, avoid SPA fallback)
const denyList = [
  { rx: /^\/wp-admin(\/|$)/i, name: 'wp-admin' },
  { rx: /^\/wp-login\.php$/i, name: 'wp-login' },
  { rx: /^\/xmlrpc\.php$/i, name: 'xmlrpc' },
  { rx: /^\/wordpress(\/|$)/i, name: 'wordpress' },
  { rx: /^\/wp-content(\/|$)/i, name: 'wp-content' },
  { rx: /^\/wp-includes(\/|$)/i, name: 'wp-includes' },
  { rx: /^\/\.env$/i, name: 'dot-env' },
  { rx: /^\/\.git(\/|$)/i, name: 'dot-git' },
  { rx: /^\/server-status$/i, name: 'server-status' },
  { rx: /^\/phpinfo\.php$/i, name: 'phpinfo' },
];
// Prometheus counter for denied probe requests
const probeCounter = new client.Counter({
  name: 'probe_requests_total',
  help: 'Count of denied probe/scanner requests',
  labelNames: ['path']
});

app.use((req, res, next) => {
  try {
    const hit = denyList.find((e) => e.rx.test(req.path));
    if (hit) {
      // Record metric and apply strict rate limit then respond 403 (forbidden)
      try { probeCounter.inc({ path: hit.name }); } catch {}
      return probeLimiter(req, res, () => res.status(403).send('Forbidden'));
    }
  } catch {}
  return next();
});

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
    if (NODE_ENV === 'development') {
      console.warn('Vite middleware failed, continuing without it:', e?.message || e);
    }
  }
}

// Serve frontend build (SPA) for non-API routes
try {
  const clientBuildPath = join(__dirname, '../frontend/dist');
  logInfo(`Frontend serving config: NODE_ENV=${NODE_ENV}, SERVE_FRONTEND=${process.env.SERVE_FRONTEND}, buildPath=${clientBuildPath}`);
  
  const fs = await import('fs');
  const buildExists = fs.existsSync(clientBuildPath);
  const indexExists = fs.existsSync(join(clientBuildPath, 'index.html'));
  logInfo(`Frontend build exists: ${buildExists}, index.html exists: ${indexExists}`);
  
  if (buildExists && indexExists) {
    // Serve static files with proper MIME types
    app.use(express.static(clientBuildPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
          // Cache hashed assets aggressively
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (path.endsWith('.map')) {
          res.setHeader('Content-Type', 'application/json');
          // Maps (if present) can be cached but are optional
          res.setHeader('Cache-Control', 'public, max-age=604800');
        } else if (path.endsWith('.ico') || path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.webp')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    logInfo(`Serving static files from: ${clientBuildPath}`);
    
    // Route all non-API, non-asset requests to React index.html
    app.get(/^\/(?!api|test-frontend|health|metrics|assets|favicon\.ico).*/, (req, res, next) => {
      logInfo(`Serving SPA for: ${req.path}`);
      // Prevent stale HTML caching so hashed asset references stay fresh
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(join(clientBuildPath, 'index.html'), (err) => {
        if (err) {
          if (!IS_PROD) console.log(`Error serving index.html for ${req.path}:`, err.message);
          next();
        }
      });
    });
    logInfo('Frontend SPA routing configured');
  } else {
    logInfo('Frontend build directory or index.html not found');
  }
} catch (e) {
  console.warn('Error setting up frontend serving:', e.message);
}

// Test frontend route
app.get('/test-frontend', (req, res) => {
  res.json({ 
    message: 'Frontend serving test',
    NODE_ENV,
    SERVE_FRONTEND: process.env.SERVE_FRONTEND,
    buildPath: join(__dirname, '../frontend/dist')
  });
});

// Debug endpoint to check what env vars were built into the frontend
app.get('/debug-frontend-env', async (req, res) => {
  try {
    const fs = await import('fs');
    const frontendDistPath = join(__dirname, '../frontend/dist');

    const indexPath = join(frontendDistPath, 'index.html');
    const indexExists = fs.existsSync(indexPath);

    let distFiles = [];
    if (fs.existsSync(frontendDistPath)) {
      distFiles = fs.readdirSync(frontendDistPath);
    }

    res.json({
      frontendDistPath,
      indexExists,
      distFiles,
      message: 'Check if frontend build contains environment variables'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 handler
app.use('*', notFoundHandler);

// Global error handler
app.use(sentryErrorHandler());
app.use(errorHandler);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`OncoSafeRx API running on port ${PORT}`);
  logInfo(`Health: http://localhost:${PORT}/health  CORS: ${CORS_ORIGIN}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down...`);
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
