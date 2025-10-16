import jwt from 'jsonwebtoken';
import supabaseService from '../config/supabase.js';
import { createClient } from '@supabase/supabase-js';
import { getEnv, debugEnvVars } from '../utils/env.js';

const JWT_SECRET = getEnv('JWT_SECRET', 'your-secret-key-change-in-production');
const JWT_EXPIRES_IN = getEnv('JWT_EXPIRES_IN', '24h');
const SUPABASE_JWT_SECRET = getEnv('SUPABASE_JWT_SECRET') || null;

// Debug environment variables on startup
debugEnvVars(['JWT_SECRET', 'SUPABASE_JWT_SECRET', 'ADMIN_SUPERADMINS', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']);

// Optional Supabase admin client for token introspection (fallback)
let supabaseAdmin = null;
try {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
} catch {}

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function elevateIfSuperAdmin(user) {
  try {
    if (!user || !user.email) return user;
    const hardcoded = user.email === 'gdogra@gmail.com';
    const envList = String(process.env.ADMIN_SUPERADMINS || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    if (hardcoded || envList.includes(String(user.email).toLowerCase())) {
      user.role = 'super_admin';
    }
  } catch {}
  return user;
}

export function extractBearerToken(req) {
  // 1) Standard Authorization header
  const hAuth = req.headers['authorization'] || req.headers['Authorization'];
  if (hAuth) {
    const parts = String(hAuth).split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1) return parts[0];
  }
  // 2) Reverse proxies may forward as X-Forwarded-Authorization
  const xfAuth = req.headers['x-forwarded-authorization'];
  if (xfAuth) {
    const parts = String(xfAuth).split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1) return parts[0];
  }
  // 3) Some clients send X-Authorization or X-Client-Authorization
  const xAuth = req.headers['x-authorization'] || req.headers['x-client-authorization'] || req.headers['x-supabase-authorization'];
  if (xAuth) {
    const parts = String(xAuth).split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) return parts[1];
    if (parts.length === 1) return parts[0];
  }
  // 4) Cookies (Supabase often stores sb-access-token)
  try {
    const raw = req.headers['cookie'];
    if (raw) {
      const cookies = Object.fromEntries(String(raw).split(';').map(p => p.trim().split('=')));
      if (cookies['sb-access-token']) return cookies['sb-access-token'];
      if (cookies['supabase-access-token']) return cookies['supabase-access-token'];
    }
  } catch {}
  // 5) Query param fallback (debug only)
  const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  if (!isProd && process.env.ALLOW_QUERY_TOKEN === 'true' && req.query && req.query.token) {
    return String(req.query.token);
  }
  return null;
}

export async function authenticateToken(req, res, next) {
  try {
    const token = extractBearerToken(req);

    // Debug token extraction for admin routes (force enable)
    if (req.path && req.path.includes('admin')) {
      console.log('🔍 Auth token extraction:', {
        path: req.path,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        headers: {
          auth: !!req.headers['authorization'],
          xAuth: !!(req.headers['x-authorization'] || req.headers['x-client-authorization']),
          cookie: !!req.headers['cookie']
        }
      });
    }

    if (!token) {
      console.log('🚫 No token found for admin route:', req.path);
      return res.status(401).json({ error: 'Access token required' });
    }

    // For admin routes, prioritize Supabase JWT verification since frontend sends Supabase tokens
    let decodedUser = null;
    
    // Try Supabase JWT verification FIRST for admin routes
    if (req.path && req.path.includes('admin') && SUPABASE_JWT_SECRET) {
      try {
        console.log('🔍 Admin route detected, trying Supabase JWT verification first');
        const payload = jwt.verify(token, SUPABASE_JWT_SECRET);
        decodedUser = elevateIfSuperAdmin({
          id: payload.sub || payload.user_id || 'unknown',
          email: payload.email,
          role: payload.role || payload.user_metadata?.role || 'user'
        });
        console.log('✅ Supabase JWT verified for admin route:', {
          email: decodedUser.email,
          role: decodedUser.role,
          id: decodedUser.id
        });
      } catch (supabaseJwtError) {
        console.log('❌ Supabase JWT verification failed, trying backend JWT:', supabaseJwtError.message);
      }
    }
    
    // If Supabase JWT didn't work, try backend JWT
    if (!decodedUser) {
      const decoded = verifyToken(token);
      if (decoded) {
        decodedUser = elevateIfSuperAdmin(decoded);
        console.log('✅ Backend JWT verified:', {
          email: decodedUser.email,
          role: decodedUser.role,
          id: decodedUser.id
        });
      }
    }
    
    // If we have a valid user from either JWT method
    if (decodedUser) {
      req.user = decodedUser;
      // Hydrate role from profile if available
      try {
        const profile = await supabaseService.getUserByEmail?.(req.user.email);
        if (profile?.role) req.user.role = profile.role;
        req.user = elevateIfSuperAdmin(req.user);
      } catch {}
      
      return next();
    }

    // Fallback: Supabase JWT via service role introspection
    if (!supabaseAdmin) {
      // Optional unverified Supabase JWT fallback (for environments without service role)
      try {
        const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
        if (!isProd && String(process.env.ALLOW_SUPABASE_JWT_FALLBACK || '').toLowerCase() === 'true') {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
            // Basic sanity checks: Supabase issuer hint and required fields
            const iss = String(payload.iss || '');
            if (iss.includes('supabase') && payload.email) {
              req.user = elevateIfSuperAdmin({
                id: payload.sub || payload.user_id || 'unknown',
                email: payload.email,
                role: payload.role || payload.user_metadata?.role || 'user'
              });
              // Hydrate role from profile if available
              try {
                const profile = await supabaseService.getUserByEmail?.(req.user.email);
                if (profile?.role) req.user.role = profile.role;
                req.user = elevateIfSuperAdmin(req.user);
              } catch {}
              return next();
            }
          }
        }
      } catch {}
      // HS256 verification path using SUPABASE_JWT_SECRET (production safe)
      try {
        if (SUPABASE_JWT_SECRET) {
          const payload = jwt.verify(token, SUPABASE_JWT_SECRET);
          req.user = elevateIfSuperAdmin({
            id: payload.sub || payload.user_id || 'unknown',
            email: payload.email,
            role: payload.role || payload.user_metadata?.role || 'user'
          });
          try {
            const profile = await supabaseService.getUserByEmail?.(req.user.email);
            if (profile?.role) req.user.role = profile.role;
            req.user = elevateIfSuperAdmin(req.user);
          } catch {}
          return next();
        }
      } catch {}
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      // Try HS256 verification as secondary path
      try {
        if (SUPABASE_JWT_SECRET) {
          const payload = jwt.verify(token, SUPABASE_JWT_SECRET);
          req.user = elevateIfSuperAdmin({
            id: payload.sub || payload.user_id || 'unknown',
            email: payload.email,
            role: payload.role || payload.user_metadata?.role || 'user'
          });
          try {
            const profile = await supabaseService.getUserByEmail?.(req.user.email);
            if (profile?.role) req.user.role = profile.role;
            req.user = elevateIfSuperAdmin(req.user);
          } catch {}
          return next();
        }
      } catch {}
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const supa = data.user;
    req.user = elevateIfSuperAdmin({
      id: supa.id,
      email: supa.email,
      role: supa.user_metadata?.role || 'user'
    });
    // Hydrate role from profile if available
    try {
      const profile = await supabaseService.getUserByEmail?.(req.user.email);
      if (profile?.role) req.user.role = profile.role;
      req.user = elevateIfSuperAdmin(req.user);
    } catch {}
    return next();
  } catch (e) {
    if (String(process.env.DEBUG_AUTH_HEADERS || '').toLowerCase() === 'true') {
      console.warn('Auth error:', e?.message);
      console.warn('Headers seen:', Object.keys(req.headers));
    }
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
}

// Role-based authorization middleware
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      console.log('🚫 Role check failed: No user authenticated');
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('🚫 Role check failed:', {
        required: roles,
        current: req.user.role,
        email: req.user.email
      });
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    console.log('✅ Role check passed:', { role: req.user.role, email: req.user.email });
    next();
  };
}

// Admin only middleware
export function requireAdmin(req, res, next) {
  try {
    const devBypass = String(process.env.ADMIN_DEV_BYPASS || '').toLowerCase() === 'true';
    const isProd = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
    
    // Enhanced debugging for admin access issues
    console.log('🔐 Admin access check:', {
      hasUser: !!req.user,
      email: req.user?.email,
      role: req.user?.role,
      isGdogra: req.user?.email === 'gdogra@gmail.com',
      adminSuperadmins: process.env.ADMIN_SUPERADMINS,
      authHeader: !!req.headers.authorization,
      nodeEnv: process.env.NODE_ENV,
      isProd
    });
    
    if (devBypass && !isProd) {
      // In development, allow any authenticated user to pass admin checks for rapid iteration
      if (req.user) return next();
    }
  } catch {}
  return requireRole('admin', 'super_admin')(req, res, next);
}

// Healthcare provider middleware (physician, pharmacist, etc.)
export function requireHealthcareProvider(req, res, next) {
  return requireRole('admin', 'physician', 'pharmacist', 'resident', 'nurse')(req, res, next);
}

// Middleware to load user profile
export async function loadUserProfile(req, res, next) {
  if (!req.user) {
    return next();
  }

  try {
    const user = await supabaseService.getUserByEmail(req.user.email);
    if (user) {
      req.userProfile = user;
    }
    next();
  } catch (error) {
    console.error('Error loading user profile:', error);
    next(); // Continue without profile
  }
}

// Rate limiting by user
export function rateLimitByUser(maxRequests = 100, windowMs = 15 * 60 * 1000) {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    
    if (!requests.has(userId)) {
      requests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userRequests = requests.get(userId);
    
    if (now > userRequests.resetTime) {
      userRequests.count = 1;
      userRequests.resetTime = now + windowMs;
      return next();
    }

    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }

    userRequests.count++;
    next();
  };
}

// API key authentication (for external integrations)
export function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // In production, validate against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  req.apiAuth = true;
  next();
}

// Combined auth middleware (supports both JWT and API key)
export function authenticateFlexible(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  const apiKey = req.headers['x-api-key'];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
      return next();
    }
  }

  if (apiKey) {
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    if (validApiKeys.includes(apiKey)) {
      req.apiAuth = true;
      return next();
    }
  }

  return res.status(401).json({ error: 'Valid authentication required' });
}
