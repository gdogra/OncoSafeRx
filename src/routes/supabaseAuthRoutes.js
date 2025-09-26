import express from 'express';
import Joi from 'joi';
import { rateLimit } from 'express-rate-limit';
import client from 'prom-client';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

/**
 * Get current user profile (using Supabase auth)
 */
router.get('/profile',
  authenticateSupabase,
  asyncHandler(async (req, res) => {
    try {
      const user = req.user;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.supabaseUser.user_metadata?.first_name || '',
          lastName: user.supabaseUser.user_metadata?.last_name || '',
          role: user.role,
          specialty: user.supabaseUser.user_metadata?.specialty || '',
          institution: user.supabaseUser.user_metadata?.institution || '',
          licenseNumber: user.supabaseUser.user_metadata?.license_number || '',
          yearsExperience: user.supabaseUser.user_metadata?.years_experience || 0,
          preferences: user.supabaseUser.user_metadata?.preferences || {
            theme: 'light',
            language: 'en',
            notifications: {
              email: true,
              push: true,
              criticalAlerts: true,
              weeklyReports: true,
            },
            dashboard: {
              defaultView: 'overview',
              refreshInterval: 5000,
              compactMode: false,
            },
            clinical: {
              showGenomicsByDefault: user.role === 'oncologist' || user.role === 'pharmacist',
              autoCalculateDosing: user.role === 'oncologist' || user.role === 'pharmacist',
              requireInteractionAck: true,
              showPatientPhotos: false,
            },
          },
          persona: user.supabaseUser.user_metadata?.persona || {
            id: `persona-${Date.now()}`,
            name: getDefaultPersonaName(user.role),
            description: getDefaultPersonaDescription(user.role),
            role: user.role,
            experienceLevel: 'intermediate',
            specialties: getDefaultSpecialties(user.role),
            preferences: {
              riskTolerance: 'moderate',
              alertSensitivity: 'medium',
              workflowStyle: 'thorough',
              decisionSupport: 'consultative',
            },
            customSettings: {},
          },
          createdAt: user.supabaseUser.created_at,
          lastLogin: new Date().toISOString(),
          isActive: true,
        }
      });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  })
);

/**
 * Verify authentication status
 */
router.get('/verify',
  optionalSupabaseAuth,
  (req, res) => {
    if (req.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role
        }
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  }
);

/**
 * Health check for Supabase auth
 */
router.get('/health',
  (req, res) => {
    res.json({
      status: 'healthy',
      authType: 'supabase',
      timestamp: new Date().toISOString()
    });
  }
);

// Dev-only: Create/Upsert demo profile row via service role (no client session required)
router.post('/demo/profile', asyncHandler(async (req, res) => {
  try {
    const devAllowed = (process.env.NODE_ENV || 'development') === 'development' || (process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true';
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile creation not allowed in this environment' });
    }

    const url = process.env.SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return res.status(500).json({ error: 'Supabase service not configured' });
    }

    const admin = createClient(url, service);
    const { id, email, role = 'oncologist', first_name, last_name } = req.body || {};
    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required fields: id, email' });
    }

    const payload = {
      id,
      email,
      role,
      first_name: first_name || email.split('@')[0],
      last_name: last_name || 'User',
      created_at: new Date().toISOString(),
    };

    const { error } = await admin.from('users').upsert(payload, { onConflict: 'id' });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ ok: true, user: payload });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}));

// Dev-only: Delete demo profile row via service role
router.delete('/demo/profile/:id', asyncHandler(async (req, res) => {
  try {
    const devAllowed = (process.env.NODE_ENV || 'development') === 'development' || (process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true';
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile deletion not allowed in this environment' });
    }

    const url = process.env.SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return res.status(500).json({ error: 'Supabase service not configured' });
    }

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const admin = createClient(url, service);
    const { error } = await admin.from('users').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}));

// Dev-only: Reset demo profile row (and optionally Supabase auth metadata)
router.post('/demo/reset', asyncHandler(async (req, res) => {
  try {
    const devAllowed = (process.env.NODE_ENV || 'development') === 'development' || (process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true';
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile reset not allowed in this environment' });
    }

    const url = process.env.SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return res.status(500).json({ error: 'Supabase service not configured' });
    }

    const admin = createClient(url, service);
    const {
      id,
      email,
      role = 'oncologist',
      first_name = 'Demo',
      last_name = 'Clinician',
      updateAuth = true,
    } = req.body || {};

    if (!id || !email) {
      return res.status(400).json({ error: 'Missing required fields: id, email' });
    }

    // Upsert profile row
    const payload = {
      id,
      email,
      role,
      first_name,
      last_name,
      created_at: new Date().toISOString(),
    };

    const { error: upErr } = await admin.from('users').upsert(payload, { onConflict: 'id' });
    if (upErr) return res.status(500).json({ error: upErr.message });

    // Optionally update Supabase auth metadata if this ID is a real auth user
    if (updateAuth) {
      try {
        // Update metadata: role, first_name, last_name
        const { error: authErr } = await admin.auth.admin.updateUserById(id, {
          user_metadata: { role, first_name, last_name }
        });
        if (authErr) {
          // Non-fatal in dev; include warning in response
          return res.json({ ok: true, user: payload, authUpdated: false, authError: authErr.message });
        }
        return res.json({ ok: true, user: payload, authUpdated: true });
      } catch (e) {
        return res.json({ ok: true, user: payload, authUpdated: false, authError: e?.message || 'auth update failed' });
      }
    }

    return res.json({ ok: true, user: payload, authUpdated: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}));

// --- Security middlewares for proxy endpoints ---
const AUTH_PROXY_ENABLED = (process.env.AUTH_PROXY_ENABLED || '').toLowerCase() === 'true';

const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toString().toLowerCase();
    return `${req.ip}:${email}`;
  },
});

function requireProxyEnabled(req, res, next) {
  if (!AUTH_PROXY_ENABLED) {
    return res.status(404).json({ error: 'Endpoint not found', code: 'proxy_disabled' });
  }
  next();
}

function checkAllowedOrigin(req, res, next) {
  const allowed = (process.env.PROXY_ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length === 0) return next();
  const origin = req.headers.origin || req.headers.referer || '';
  if (!origin) return res.status(403).json({ error: 'Forbidden: missing origin', code: 'forbidden_origin' });
  const matched = allowed.some(o => origin.startsWith(o));
  if (!matched) return res.status(403).json({ error: 'Forbidden: origin not allowed', code: 'forbidden_origin' });
  next();
}

function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'Invalid request', code: 'invalid_request', details: error.details.map(d => d.message) });
    }
    req.body = value;
    next();
  };
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  metadata: Joi.object().unknown(true).default({}),
});

const resetSchema = Joi.object({
  email: Joi.string().email().required(),
  redirectTo: Joi.string().uri().optional(),
});

// Metrics
const proxyAuthCounter = new client.Counter({
  name: 'auth_proxy_requests_total',
  help: 'Count of auth proxy requests',
  labelNames: ['endpoint', 'outcome']
});

function maskEmail(email = '') {
  const [name, domain] = String(email).split('@');
  if (!domain) return '***';
  const masked = name.length <= 2 ? '*'.repeat(name.length) : name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  return `${masked}@${domain}`;
}

/**
 * Server-side proxy login to Supabase (fallback for environments blocking direct auth)
 * Body: { email, password }
 */
router.post('/proxy/login', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const origin = req.headers.origin || req.headers.referer || '';
  console.log('[auth-proxy] login requested for', maskEmail(email), 'from origin', origin);

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    proxyAuthCounter.inc({ endpoint: 'login', outcome: 'error' });
    return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });
  }

  const endpoint = `${url}/auth/v1/token?grant_type=password`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anon,
      'Authorization': `Bearer ${anon}`
    },
    body: JSON.stringify({ email, password })
  });

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.warn('Proxy login failed for', maskEmail(email), resp.status, body?.error || body?.error_description);
    proxyAuthCounter.inc({ endpoint: 'login', outcome: 'error' });
    return res.status(resp.status).json({ error: body?.error_description || body?.error || 'Login failed', code: 'supabase_error' });
  }

  proxyAuthCounter.inc({ endpoint: 'login', outcome: 'success' });
  return res.json({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    user: body.user
  });
}));

/**
 * Server-side proxy signup to Supabase
 * Body: { email, password, metadata?: {...} }
 */
router.post('/proxy/signup', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(signupSchema), asyncHandler(async (req, res) => {
  const { email, password, metadata = {} } = req.body || {};

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'error' });
    return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });
  }

  const endpoint = `${url}/auth/v1/signup`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anon,
      'Authorization': `Bearer ${anon}`
    },
    body: JSON.stringify({ email, password, data: metadata })
  });

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.warn('Proxy signup failed for', maskEmail(email), resp.status, body?.error || body?.error_description);
    proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'error' });
    return res.status(resp.status).json({ error: body?.error_description || body?.error || 'Signup failed', code: 'supabase_error' });
  }

  proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'success' });
  return res.json({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    user: body.user,
    needs_confirmation: !body.access_token
  });
}));

/**
 * Server-side proxy: request password reset email
 * Body: { email, redirectTo? }
 */
router.post('/proxy/reset', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(resetSchema), asyncHandler(async (req, res) => {
  const { email, redirectTo } = req.body || {};

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });

  const endpoint = `${url}/auth/v1/recover`;
  const body = { email };
  if (redirectTo) body.redirect_to = redirectTo;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anon,
      'Authorization': `Bearer ${anon}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const j = await resp.json().catch(() => ({}));
    proxyAuthCounter.inc({ endpoint: 'reset', outcome: 'error' });
    return res.status(resp.status).json({ error: j?.error_description || j?.error || 'Password reset failed', code: 'supabase_error' });
  }
  proxyAuthCounter.inc({ endpoint: 'reset', outcome: 'success' });
  return res.json({ ok: true });
}));

// Helper functions for default persona data
function getDefaultPersonaName(role) {
  const names = {
    oncologist: 'Medical Oncologist',
    pharmacist: 'Clinical Pharmacist',
    nurse: 'Oncology Nurse',
    researcher: 'Clinical Researcher',
    student: 'Healthcare Student',
    user: 'Healthcare Professional'
  };
  return names[role] || 'Healthcare Professional';
}

function getDefaultPersonaDescription(role) {
  const descriptions = {
    oncologist: 'Comprehensive cancer care specialist',
    pharmacist: 'Medication therapy management specialist',
    nurse: 'Direct patient care and medication administration',
    researcher: 'Cancer research and data analysis specialist',
    student: 'Learning healthcare professional',
    user: 'Healthcare team member'
  };
  return descriptions[role] || 'Healthcare team member';
}

function getDefaultSpecialties(role) {
  const specialties = {
    oncologist: ['solid tumors', 'precision medicine'],
    pharmacist: ['oncology pharmacy', 'drug interactions'],
    nurse: ['patient care', 'medication administration'],
    researcher: ['clinical trials', 'genomics research'],
    student: ['general medicine'],
    user: ['healthcare']
  };
  return specialties[role] || ['healthcare'];
}

export default router;
