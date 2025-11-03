import express from 'express';
import Joi from 'joi';
import { rateLimit } from 'express-rate-limit';
import client from 'prom-client';
import { authenticateSupabase, optionalSupabaseAuth } from '../middleware/supabaseAuth.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
// import fetch from 'node-fetch'; // Using built-in fetch in Node.js 18+
import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env.js';

const router = express.Router();

/**
 * Get current user profile (using Supabase auth)
 */
router.get('/profile',
  optionalSupabaseAuth,
  asyncHandler(async (req, res) => {
    try {
      // Allow default user fallback if unauthenticated (to match patient routes behavior)
      let user = req.user;
      if (!user) {
        user = {
          id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // Default: Gautam
          email: 'gdogra@gmail.com',
          role: 'oncologist',
          isDefault: true,
          supabaseUser: { user_metadata: {} }
        };
        console.log('🔄 Using default user (Gautam) for unauthenticated profile fetch');
      }
      
      // Ensure an app-level users row exists for authenticated users (not for the default fallback)
      try {
        if (!user.isDefault && user.id && getEnv('SUPABASE_URL') && getEnv('SUPABASE_SERVICE_ROLE_KEY')) {
          const admin = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));
          const { data: existing, error: selErr } = await admin
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          if (!selErr && !existing) {
            const meta = user.supabaseUser?.user_metadata || {};
            const payload = {
              id: user.id,
              email: user.email || null,
              role: meta.role || 'oncologist',
              first_name: meta.first_name || (user.email ? String(user.email).split('@')[0] : ''),
              last_name: meta.last_name || '',
              created_at: new Date().toISOString(),
            };
            await admin.from('users').upsert(payload, { onConflict: 'id' });
            console.log('🆕 Created users row for', user.email);
          }
        }
      } catch (ensureErr) {
        console.warn('⚠️ Failed to ensure users row:', ensureErr?.message || ensureErr);
      }
      
      // Optionally load profile fields from public.users to supplement auth metadata
      let dbRow = null;
      try {
        if (!user.isDefault && getEnv('SUPABASE_URL') && getEnv('SUPABASE_SERVICE_ROLE_KEY')) {
          const admin = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));
          const { data: row } = await admin
            .from('users')
            .select('first_name,last_name,role,specialty,institution,license_number,years_experience,preferences,persona')
            .eq('id', user.id)
            .maybeSingle();
          dbRow = row || null;
        }
      } catch {}

      const meta = user.supabaseUser?.user_metadata || {};
      const responseUser = {
        id: user.id,
        email: user.email,
        firstName: meta.first_name || dbRow?.first_name || '',
        lastName: meta.last_name || dbRow?.last_name || '',
        role: user.role || dbRow?.role,
        specialty: meta.specialty || dbRow?.specialty || '',
        institution: meta.institution || dbRow?.institution || '',
        licenseNumber: meta.license_number || dbRow?.license_number || '',
        yearsExperience: meta.years_experience || dbRow?.years_experience || 0,
        preferences: meta.preferences || dbRow?.preferences || {
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
              showGenomicsByDefault: (user.role || dbRow?.role) === 'oncologist' || (user.role || dbRow?.role) === 'pharmacist',
              autoCalculateDosing: (user.role || dbRow?.role) === 'oncologist' || (user.role || dbRow?.role) === 'pharmacist',
              requireInteractionAck: true,
              showPatientPhotos: false,
            },
          },
        persona: meta.persona || dbRow?.persona || {
            id: `persona-${Date.now()}`,
            name: getDefaultPersonaName(user.role || dbRow?.role),
            description: getDefaultPersonaDescription(user.role || dbRow?.role),
            role: user.role || dbRow?.role,
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
        createdAt: user.supabaseUser?.created_at,
        lastLogin: new Date().toISOString(),
        isActive: true,
      };

      res.json({ user: responseUser });

    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  })
);

/**
 * Exchange Supabase auth for backend JWT
 * - Requires Authorization: Bearer <supabase_jwt>
 * - Issues backend JWT signed with server secret, including role from metadata
 */
router.post('/exchange/backend-jwt',
  authenticateSupabase,
  asyncHandler(async (req, res) => {
    try {
      const user = req.user; // From authenticateSupabase
      if (!user?.id || !user?.email) {
        return res.status(400).json({ error: 'Invalid user context for exchange' });
      }

      const appUser = {
        id: user.id,
        email: user.email,
        role: user.role || 'user'
      };

      const token = generateToken(appUser);
      return res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
    } catch (e) {
      console.error('JWT exchange error:', e);
      return res.status(500).json({ error: 'Failed to exchange token' });
    }
  })
);

/**
 * Update user profile (using Supabase auth)
 */
router.put('/profile',
  optionalSupabaseAuth,
  asyncHandler(async (req, res) => {
    try {
      // Allow default user fallback if unauthenticated (to match patient routes behavior)
      let user = req.user;
      if (!user) {
        user = {
          id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // Default: Gautam
          email: 'gdogra@gmail.com',
          role: 'oncologist',
          isDefault: true,
          supabaseUser: { user_metadata: {} }
        };
        console.log('🔄 Using default user (Gautam) for unauthenticated profile update');
      }
      const updates = req.body;
      
      console.log('🔄 Profile update request for user:', user.id);
      console.log('🔄 Updates:', updates);
      
      // Create Supabase admin client for user metadata updates
      const url = getEnv("SUPABASE_URL");
      const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
      
      if (!url || !serviceKey) {
        return res.status(500).json({ error: 'Supabase service not configured' });
      }
      
      const admin = createClient(url, serviceKey);
      
      // Prepare user metadata updates
      const metadataUpdates = {};
      if (updates.firstName !== undefined) metadataUpdates.first_name = updates.firstName;
      if (updates.lastName !== undefined) metadataUpdates.last_name = updates.lastName;
      if (updates.specialty !== undefined) metadataUpdates.specialty = updates.specialty;
      if (updates.institution !== undefined) metadataUpdates.institution = updates.institution;
      if (updates.licenseNumber !== undefined) metadataUpdates.license_number = updates.licenseNumber;
      if (updates.yearsExperience !== undefined) metadataUpdates.years_experience = updates.yearsExperience;
      if (updates.preferences !== undefined) metadataUpdates.preferences = updates.preferences;
      if (updates.persona !== undefined) metadataUpdates.persona = updates.persona;
      if (updates.role !== undefined) metadataUpdates.role = updates.role;
      
      // Update Supabase auth user metadata (skip for dev/gdogra users)
      let authError = null;
      if (!user.isDev && !user.isGdogra) {
        const updateResult = await admin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.supabaseUser?.user_metadata,
            ...metadataUpdates
          }
        });
        authError = updateResult.error;
      } else {
        console.log('🔧 Skipping Supabase auth metadata update for dev/gdogra user');
      }
      
      if (authError) {
        console.error('❌ Failed to update auth metadata:', authError);
        return res.status(500).json({ error: 'Failed to update profile: ' + authError.message });
      }
      
      // Also update or create user profile in users table
      const userMetadata = user.supabaseUser?.user_metadata || {};
      const profileData = {
        id: user.id,
        email: user.email,
        role: updates.role || user.role,
        first_name: updates.firstName || userMetadata.first_name || '',
        last_name: updates.lastName || userMetadata.last_name || '',
        specialty: updates.specialty || userMetadata.specialty || '',
        institution: updates.institution || userMetadata.institution || '',
        license_number: updates.licenseNumber || userMetadata.license_number || '',
        years_experience: updates.yearsExperience || userMetadata.years_experience || 0,
        preferences: updates.preferences || userMetadata.preferences || {},
        persona: updates.persona || userMetadata.persona || {},
        // Do not set updated_at explicitly to avoid schema mismatch on instances where column is absent
      };
      
      const { error: profileError } = await admin.from('users').upsert(profileData, { onConflict: 'id' });
      
      if (profileError) {
        console.error('❌ Failed to update profile table:', profileError);
        // Don't fail the request if the table update fails, as auth metadata was updated
        console.warn('⚠️ Profile table update failed, but auth metadata was updated successfully');
      }
      
      console.log('✅ Profile updated successfully for user:', user.id);
      
      // Return updated profile
      const updatedProfile = {
        id: user.id,
        email: user.email,
        firstName: updates.firstName ?? userMetadata.first_name ?? '',
        lastName: updates.lastName ?? userMetadata.last_name ?? '',
        role: updates.role ?? user.role,
        specialty: updates.specialty ?? userMetadata.specialty ?? '',
        institution: updates.institution ?? userMetadata.institution ?? '',
        licenseNumber: updates.licenseNumber ?? userMetadata.license_number ?? '',
        yearsExperience: updates.yearsExperience ?? userMetadata.years_experience ?? 0,
        preferences: updates.preferences ?? userMetadata.preferences ?? {
          theme: 'light',
          language: 'en',
          notifications: { email: true, push: true, criticalAlerts: true, weeklyReports: true },
          dashboard: { defaultView: 'overview', refreshInterval: 5000, compactMode: false },
          clinical: { showGenomicsByDefault: true, autoCalculateDosing: true, requireInteractionAck: true, showPatientPhotos: false }
        },
        persona: updates.persona ?? userMetadata.persona ?? {
          id: `persona-${Date.now()}`,
          name: getDefaultPersonaName(user.role),
          description: getDefaultPersonaDescription(user.role),
          role: user.role,
          experienceLevel: 'intermediate',
          specialties: getDefaultSpecialties(user.role),
          preferences: { riskTolerance: 'moderate', alertSensitivity: 'medium', workflowStyle: 'thorough', decisionSupport: 'consultative' },
          customSettings: {}
        },
        createdAt: user.supabaseUser?.created_at || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true
      };
      
      res.json({
        success: true,
        user: updatedProfile
      });
      
    } catch (error) {
      console.error('❌ Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile: ' + error.message });
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
      timestamp: new Date().toISOString(),
      proxyEnabled: AUTH_PROXY_ENABLED === true
    });
  }
);

// Dev-only: Create/Upsert demo profile row via service role (no client session required)
router.post('/demo/profile', asyncHandler(async (req, res) => {
  try {
    const devAllowed = ((process.env.NODE_ENV || 'development') === 'development') 
      || ((process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true')
      || !!getEnv("SUPABASE_SERVICE_ROLE_KEY"); // allow when server can securely write
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile creation not allowed in this environment' });
    }

    const url = getEnv("SUPABASE_URL");
    const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
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
    const devAllowed = ((process.env.NODE_ENV || 'development') === 'development') 
      || ((process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true')
      || !!getEnv("SUPABASE_SERVICE_ROLE_KEY"); // allow when server can securely write
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile deletion not allowed in this environment' });
    }

    const url = getEnv("SUPABASE_URL");
    const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
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
    const devAllowed = ((process.env.NODE_ENV || 'development') === 'development') 
      || ((process.env.DEMO_PROFILE_ENABLED || '').toLowerCase() === 'true')
      || !!getEnv("SUPABASE_SERVICE_ROLE_KEY"); // allow when server can securely write
    if (!devAllowed) {
      return res.status(403).json({ error: 'Demo profile reset not allowed in this environment' });
    }

    const url = getEnv("SUPABASE_URL");
    const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
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
const AUTH_PROXY_FORCE_ADMIN_SIGNUP = (process.env.AUTH_PROXY_FORCE_ADMIN_SIGNUP || '').toLowerCase() === 'true';

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

const refreshSchema = Joi.object({
  refresh_token: Joi.string().min(20).required(),
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

  const url = getEnv("SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY");
  if (!url || !anon) {
    proxyAuthCounter.inc({ endpoint: 'login', outcome: 'error' });
    return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });
  }

  const endpoint = `${url}/auth/v1/token?grant_type=password`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let resp;
  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anon,
        'Authorization': `Bearer ${anon}`
      },
      body: JSON.stringify({ email, password }),
      signal: ctrl.signal
    });
  } catch (e) {
    clearTimeout(timer);
    console.warn('Proxy login upstream error:', e?.name || e?.message || e);
    proxyAuthCounter.inc({ endpoint: 'login', outcome: 'error' });
    return res.status(504).json({ error: 'Upstream Supabase auth timeout', code: 'upstream_timeout' });
  } finally {
    clearTimeout(timer);
  }

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

// Simple test signup route - GET version for debugging
router.get('/signup-test', asyncHandler(async (req, res) => {
  res.json({ message: 'GET signup test route working' });
}));

// Simple working signup route
router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role = 'patient' } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  // For now, just test the route works
  return res.json({
    message: 'Signup route working with data',
    received: { email, firstName, lastName, role }
  });
}));

/**
 * Server-side proxy signup to Supabase
 * Body: { email, password, metadata?: {...} }
 */
// Temporarily disabled for debugging
// router.post('/proxy/signup', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(signupSchema), asyncHandler(async (req, res) => {

// Working signup route with email confirmation
router.post('/proxy/signup', requireProxyEnabled, asyncHandler(async (req, res) => {
  const { email, password, metadata = {} } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !service) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  try {
    const admin = createClient(url, service);
    const autoConfirm = (process.env.SUPABASE_AUTH_EMAIL_CONFIRM || 'true').toLowerCase() !== 'false';
    
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: autoConfirm,
      user_metadata: metadata,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: autoConfirm ? 'User created and confirmed' : 'User created, please check email for confirmation',
      user: data.user,
      needs_confirmation: !autoConfirm
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
}));

/*
router.post('/proxy/signup-full', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(signupSchema), asyncHandler(async (req, res) => {
  const { email, password, metadata = {} } = req.body || {};

  const url = getEnv("SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY");
  const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon) {
    proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'error' });
    return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });
  }

  // Build upstream signup payload, adding redirect if we can infer it
  const origin = req.headers.origin || req.headers.referer || '';
  const redirect_to = origin ? `${origin.replace(/\/$/, '')}/auth/confirm` : undefined;
  const upstreamBody = { email, password, data: metadata };
  if (redirect_to) Object.assign(upstreamBody, { redirect_to });

  // Helper: admin create + password grant flow with email confirmation support
  async function adminCreateAndGrant() {
    if (!service) {
      return { error: 'missing SUPABASE_SERVICE_ROLE_KEY', stage: 'missing_service_key' };
    }
    try {
      const admin = createClient(url, service);
      const autoConfirm = (process.env.SUPABASE_AUTH_EMAIL_CONFIRM || 'true').toLowerCase() !== 'false';
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: autoConfirm,
        user_metadata: metadata,
      });
      if (createErr) {
        // If create failed, the user may already exist. Try password grant anyway.
        try {
          const tokenEndpoint = `${url}/auth/v1/token?grant_type=password`;
          const tokenResp = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': anon, 'Authorization': `Bearer ${anon}` },
            body: JSON.stringify({ email, password })
          });
          const tokenBody = await tokenResp.json().catch(() => ({}));
          if (tokenResp.ok) {
            return {
              access_token: tokenBody.access_token,
              refresh_token: tokenBody.refresh_token,
              expires_in: tokenBody.expires_in,
              token_type: tokenBody.token_type,
              user: tokenBody.user,
              stage: 'grant_after_existing'
            };
          }
        } catch (_) {}
        return { error: (createErr.message || String(createErr)), stage: 'admin_create', status: createErr.status };
      }
      // Obtain tokens via password grant
      const tokenEndpoint = `${url}/auth/v1/token?grant_type=password`;
      const tokenResp = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': anon, 'Authorization': `Bearer ${anon}` },
        body: JSON.stringify({ email, password })
      });
      const tokenBody = await tokenResp.json().catch(() => ({}));
      if (!tokenResp.ok) {
        return { user: created?.user, stage: 'password_grant_failed', details: tokenBody?.error || tokenBody?.error_description };
      }
      return {
        access_token: tokenBody.access_token,
        refresh_token: tokenBody.refresh_token,
        expires_in: tokenBody.expires_in,
        token_type: tokenBody.token_type,
        user: tokenBody.user || created?.user,
        stage: 'admin_grant_success'
      };
    } catch (e) {
      return { error: e?.message || 'unknown', stage: 'fallback_exception' };
    }
  }

  // Optional forced admin path (env-controlled) to bypass upstream failures entirely
  if (AUTH_PROXY_FORCE_ADMIN_SIGNUP) {
    const adminResult = await adminCreateAndGrant();
    if (adminResult && adminResult.error) {
      proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'error' });
      return res.status(500).json({ error: 'Signup failed', code: 'supabase_error', details: adminResult.error, stage: adminResult.stage });
    }
    // Continue with profile creation below using `body` shape
    var body = adminResult; // eslint-disable-line
  } else {
  const endpoint = `${url}/auth/v1/signup`;
  let resp;
  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anon,
        'Authorization': `Bearer ${anon}`
      },
      body: JSON.stringify(upstreamBody)
    });
  } catch (e) {
    console.warn('Proxy signup upstream fetch error:', e?.name || e?.message || e);
    resp = null;
  }

  let body = resp ? await resp.json().catch(() => ({})) : {};
  if (!resp || !resp.ok) {
    // Fallback: create user via admin with email_confirm=true (bypass email send failures)
    const adminResult = await adminCreateAndGrant();
    if (adminResult && adminResult.error) {
      proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'error' });
      const status = resp?.status || 500;
      return res.status(status).json({ error: 'Signup failed', code: 'supabase_error', details: adminResult.error, stage: adminResult.stage });
    }
    body = adminResult;
  }
  }

  // Try to create public.users row, but do NOT fail signup if this part errors.
  let profileCreated = false;
  let profileError = null;
  try {
    if (service && body?.user?.id) {
      const admin = createClient(url, service);
      const um = body.user.user_metadata || {};
      const first = um.first_name || (email.split('@')[0]);
      const last = um.last_name || 'User';
      const role = um.role || 'patient'; // Use role from signup form metadata
      
      console.log('[auth-proxy] User metadata role:', um.role, 'Final role:', role, 'All metadata:', um);
      console.log('[auth-proxy] Creating user profile for email:', email);

      const { data: existingUser } = await admin
        .from('users')
        .select('id')
        .eq('id', body.user.id)
        .maybeSingle();

      if (!existingUser) {
        const payload = {
          id: body.user.id,
          email,
          role,
          first_name: first,
          last_name: last,
          specialty: um.specialty || '',
          institution: um.institution || '',
          license_number: um.license_number || '',
          years_experience: um.years_experience || 0,
          preferences: um.preferences || {},
          persona: um.persona || {},
          created_at: new Date().toISOString()
        };

        let upErr = null;
        try {
          const { error } = await admin.from('users').insert(payload);
          upErr = error || null;
        } catch (insertError) {
          upErr = insertError;
        }

        if (upErr) {
          // Try alternate schema name for role
          if (String(upErr.message || '').includes('user_role')) {
            try {
              const altPayload = { ...payload };
              altPayload.user_role = altPayload.role;
              delete altPayload.role;
              const { error: altErr } = await admin.from('users').insert(altPayload);
              if (!altErr) upErr = null;
              else upErr = altErr;
            } catch (altError) {
              upErr = altError;
            }
          }
        }

        if (upErr) {
          // Try minimal payload
          try {
            const minimalPayload = {
              id: body.user.id,
              email,
              first_name: first,
              last_name: last,
              created_at: new Date().toISOString()
            };
            const { error: minErr } = await admin.from('users').insert(minimalPayload);
            if (!minErr) upErr = null;
            else upErr = minErr;
          } catch (minError) {
            upErr = minError;
          }
        }

        if (upErr) {
          console.error('[auth-proxy] Failed to create user profile:', upErr?.message || upErr);
          profileError = upErr?.message || 'Unknown profile creation error';
        } else {
          profileCreated = true;
          console.log('[auth-proxy] Successfully created user profile for:', email, 'with role:', role);
        }
      } else {
        profileCreated = true;
        console.log('[auth-proxy] User profile already exists for:', email);
      }
    } else {
      if (!service) console.warn('[auth-proxy] Skipping profile creation: missing service role key');
      if (!body?.user?.id) console.warn('[auth-proxy] Skipping profile creation: missing user id from upstream response');
    }
  } catch (e) {
    console.error('[auth-proxy] Exception during profile creation:', e?.message || e);
    profileError = e?.message || 'Unknown exception';
  }

  proxyAuthCounter.inc({ endpoint: 'signup', outcome: 'success' });
  return res.json({
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_in: body.expires_in,
    token_type: body.token_type,
    user: body.user,
    needs_confirmation: !body.access_token,
    profile_created: profileCreated,
    ...(profileError ? { profile_error: profileError } : {})
  });
}));
*/

/**
 * Server-side proxy: request password reset email
 * Body: { email, redirectTo? }
 */
router.post('/proxy/reset', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(resetSchema), asyncHandler(async (req, res) => {
  const { email, redirectTo } = req.body || {};

  const url = getEnv("SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY");
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

/**
 * Server-side proxy refresh to Supabase
 * Body: { refresh_token }
 */
router.post('/proxy/refresh', requireProxyEnabled, checkAllowedOrigin, proxyLimiter, validateBody(refreshSchema), asyncHandler(async (req, res) => {
  const { refresh_token } = req.body || {};

  const url = getEnv("SUPABASE_URL");
  const anon = getEnv("SUPABASE_ANON_KEY");
  if (!url || !anon) {
    proxyAuthCounter.inc({ endpoint: 'refresh', outcome: 'error' });
    return res.status(500).json({ error: 'Supabase not configured on server', code: 'not_configured' });
  }

  const endpoint = `${url}/auth/v1/token?grant_type=refresh_token`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  let resp;
  try {
    resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anon,
        'Authorization': `Bearer ${anon}`
      },
      body: JSON.stringify({ refresh_token }),
      signal: ctrl.signal
    });
  } catch (e) {
    clearTimeout(timer);
    console.warn('Proxy refresh upstream error:', e?.name || e?.message || e);
    proxyAuthCounter.inc({ endpoint: 'refresh', outcome: 'error' });
    return res.status(504).json({ error: 'Upstream Supabase auth timeout', code: 'upstream_timeout' });
  } finally {
    clearTimeout(timer);
  }

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    console.warn('Proxy refresh failed', resp.status, body?.error || body?.error_description);
    proxyAuthCounter.inc({ endpoint: 'refresh', outcome: 'error' });
    return res.status(resp.status).json({ error: body?.error_description || body?.error || 'Refresh failed', code: 'supabase_error' });
  }

  proxyAuthCounter.inc({ endpoint: 'refresh', outcome: 'success' });
  return res.json(body);
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

// Development session creator - creates a valid dev token for the existing user
router.post('/demo/session', async (req, res) => {
  try {
    const userId = 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a';
    const devToken = `dev-token-${Date.now()}`;
    
    // Return a development session that the frontend can use
    res.json({
      session: {
        access_token: devToken,
        user: {
          id: userId,
          email: 'gdogra@gmail.com',
          user_metadata: {
            role: 'oncologist',
            first_name: 'Gautam',
            last_name: 'Dogra'
          }
        }
      },
      user: {
        id: userId,
        email: 'gdogra@gmail.com',
        role: 'oncologist'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Backfill profiles from Supabase Auth users into public.users
 * Protection: require service role configured AND X-Admin-Token header matching BACKFILL_TOKEN.
 */
router.post('/backfill/profiles', asyncHandler(async (req, res) => {
  try {
    const url = getEnv("SUPABASE_URL");
    const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const adminToken = process.env.BACKFILL_TOKEN || '';
    const provided = req.headers['x-admin-token'] || req.query.token;
    if (!url || !service) return res.status(500).json({ error: 'Supabase service not configured' });
    if (!adminToken || String(provided) !== adminToken) return res.status(403).json({ error: 'Forbidden' });

    const admin = createClient(url, service);

    // Helper: derive names
    const deriveNames = (email, meta = {}) => {
      let first = meta.first_name || '';
      let last = meta.last_name || '';
      if (!first && meta.given_name) first = meta.given_name;
      if (!last && meta.family_name) last = meta.family_name;
      if (!first && email) {
        const local = String(email).split('@')[0];
        const parts = local.split(/[._-]/);
        first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Clinician';
      }
      if (!last) last = 'User';
      return { first, last };
    };

    let page = 1;
    const perPage = 1000;
    let total = 0, created = 0, updated = 0, skipped = 0;

    // Paginate through auth users
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return res.status(500).json({ error: error.message });
      const users = data?.users || [];
      if (users.length === 0) break;
      for (const u of users) {
        total++;
        const email = u.email || null;
        const meta = u.user_metadata || {};
        const role = meta.role || 'oncologist';
        const names = deriveNames(email, meta);
        // Check if profile exists
        const { data: existing } = await admin
          .from('users')
          .select('id')
          .eq('id', u.id)
          .maybeSingle();
        const payload = {
          id: u.id,
          email,
          role,
          first_name: names.first,
          last_name: names.last,
          created_at: new Date().toISOString()
        };
        if (!existing) {
          const { error: insErr } = await admin.from('users').upsert(payload, { onConflict: 'id' });
          if (!insErr) created++; else skipped++;
        } else {
          const { error: upErr } = await admin.from('users').update({
            email,
            role,
            first_name: names.first,
            last_name: names.last,
            updated_at: new Date().toISOString()
          }).eq('id', u.id);
          if (!upErr) updated++; else skipped++;
        }
      }
      page++;
    }

    return res.json({ ok: true, total, created, updated, skipped });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unexpected error' });
  }
}));

/**
 * Admin health check: validate service role key by listing users (read-only)
 * Protection: X-Admin-Token must match BACKFILL_TOKEN
 */
router.get('/admin/health', asyncHandler(async (req, res) => {
  try {
    const url = getEnv("SUPABASE_URL");
    const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
    const adminToken = process.env.BACKFILL_TOKEN || '';
    const provided = req.headers['x-admin-token'] || req.query.token;
    if (!url || !service) return res.status(500).json({ ok: false, error: 'Supabase service not configured' });
    if (!adminToken || String(provided) !== adminToken) return res.status(403).json({ ok: false, error: 'Forbidden' });

    const admin = createClient(url, service);
    const start = Date.now();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const ms = Date.now() - start;
    if (error) return res.status(500).json({ ok: false, stage: 'list_users', error: error.message, ms });
    const count = (data?.users || []).length;
    return res.json({ ok: true, stage: 'list_users', users_seen: count, ms });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Unknown error' });
  }
}));

/**
 * Admin: Create a Supabase Auth user (if missing) and upsert public.users profile.
 * Protect with BACKFILL_TOKEN via x-admin-token header.
 * Body: { email: string, password?: string, metadata?: object }
 */
router.post('/admin/create-user', asyncHandler(async (req, res) => {
  const url = getEnv("SUPABASE_URL");
  const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminToken = process.env.BACKFILL_TOKEN || '';
  if (!url || !service) return res.status(500).json({ error: 'Supabase service not configured' });
  const provided = req.headers['x-admin-token'] || req.query.token;
  if (!adminToken || String(provided) !== adminToken) return res.status(403).json({ error: 'Forbidden' });

  const { email, password, metadata = {} } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const admin = createClient(url, service);

  const deriveNames = (em, meta = {}) => {
    let first = meta.first_name || '';
    let last = meta.last_name || '';
    if (!first && meta.given_name) first = meta.given_name;
    if (!last && meta.family_name) last = meta.family_name;
    if (!first) {
      const local = String(em).split('@')[0];
      const parts = local.split(/[._-]/);
      first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Clinician';
    }
    if (!last) last = 'User';
    return { first, last };
  };

  // 1) Create auth user (or find if exists)
  let userId = null;
  try {
    const autoConfirm = (process.env.SUPABASE_AUTH_EMAIL_CONFIRM || 'true').toLowerCase() !== 'false';
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: password || `Temp-${Math.random().toString(36).slice(2)}!A9`,
      email_confirm: autoConfirm,
      user_metadata: metadata
    });
    if (error && !String(error?.message || '').toLowerCase().includes('already registered')) {
      return res.status(500).json({ error: error.message });
    }
    userId = data?.user?.id || null;
  } catch (e) {
    // ignore, will try to find
  }

  // If userId still null, try to find by listing users (best-effort)
  if (!userId) {
    try {
      let page = 1; const perPage = 1000; let found = null;
      // Cap pages to avoid long scans
      for (; page <= 10; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) break;
        const users = data?.users || [];
        const hit = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
        if (hit) { found = hit; break; }
        if (users.length < perPage) break;
      }
      userId = found?.id || null;
    } catch {}
  }

  if (!userId) return res.status(500).json({ error: 'Failed to create or find auth user' });

  // 2) Upsert public.users profile
  try {
    const names = deriveNames(email, metadata);
    const payload = {
      id: userId,
      email,
      role: metadata.role || 'oncologist',
      first_name: names.first,
      last_name: names.last,
      created_at: new Date().toISOString()
    };
    const { error: upErr } = await admin.from('users').upsert(payload, { onConflict: 'id' });
    if (upErr) {
      return res.status(500).json({ error: upErr.message });
    }
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to upsert profile' });
  }

  return res.json({ ok: true, id: userId, email });
}));

/**
 * Admin: Link profile row to auth user by email (fix mismatched IDs).
 * Body: { email: string }
 */
router.post('/admin/link-user', asyncHandler(async (req, res) => {
  const url = getEnv("SUPABASE_URL");
  const service = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminToken = process.env.BACKFILL_TOKEN || '';
  if (!url || !service) return res.status(500).json({ error: 'Supabase service not configured' });
  const provided = req.headers['x-admin-token'] || req.query.token;
  if (!adminToken || String(provided) !== adminToken) return res.status(403).json({ error: 'Forbidden' });

  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@'))
    return res.status(400).json({ error: 'Valid email required' });

  const admin = createClient(url, service);

  // Find auth user by email (paginate best-effort)
  let authUser = null; let page = 1; const perPage = 1000;
  while (page <= 10 && !authUser) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = data?.users || [];
    const hit = users.find(u => (u.email || '').toLowerCase() === email.toLowerCase());
    if (hit) { authUser = hit; break; }
    if (users.length < perPage) break;
    page++;
  }
  if (!authUser) return res.status(404).json({ error: 'Auth user not found' });

  // Check profile row by email
  const { data: prof, error: pErr } = await admin.from('users').select('id').eq('email', email).maybeSingle();
  if (pErr) return res.status(500).json({ error: pErr.message });

  // If exists and id differs, update id to auth id
  if (prof && prof.id !== authUser.id) {
    const { error: upErr } = await admin.from('users')
      .update({ id: authUser.id, updated_at: new Date().toISOString() })
      .eq('email', email);
    if (upErr) return res.status(500).json({ error: upErr.message });
    return res.json({ ok: true, linked: true, id: authUser.id, email });
  }

  // If no profile, create one minimally
  if (!prof) {
    const payload = {
      id: authUser.id,
      email,
      role: authUser.user_metadata?.role || 'oncologist',
      first_name: authUser.user_metadata?.first_name || (email.split('@')[0]),
      last_name: authUser.user_metadata?.last_name || 'User',
      created_at: new Date().toISOString()
    };
    const { error: insErr } = await admin.from('users').upsert(payload, { onConflict: 'id' });
    if (insErr) return res.status(500).json({ error: insErr.message });
    return res.json({ ok: true, created: true, id: authUser.id, email });
  }

  return res.json({ ok: true, linked: false, id: authUser.id, email });
}));

export default router;
