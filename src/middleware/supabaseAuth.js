import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getEnv } from '../utils/env.js';

dotenv.config();

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabaseJwtSecret = getEnv('SUPABASE_JWT_SECRET');

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

// Helper: resolve user from a Supabase token. Throws on failure.
async function resolveUserFromToken(token) {
  // Dev token path
  if (token.startsWith('dev-token-')) {
    return {
      id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // Use the same UUID as the default user
      email: 'dev@oncosaferx.com',
      role: 'oncologist',
      isDev: true
    };
  }
  
  // Gdogra token path (special case for gdogra user)
  if (token.startsWith('gdogra-token-')) {
    return {
      id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // gdogra's actual user ID
      email: 'gdogra@gmail.com',
      role: 'super_admin', // Match the frontend role assignment
      isGdogra: true
    };
  }
  // Preferred: service-key introspection
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      const err = new Error('Invalid token');
      err.status = 401;
      throw err;
    }
    return {
      id: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user',
      supabaseUser: data.user
    };
  }
  // Legacy: HS256 verification (only if secret provided)
  if (supabaseJwtSecret) {
    try {
      const decoded = jwt.verify(token, supabaseJwtSecret);
      if (supabaseAdmin && decoded?.sub) {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(decoded.sub);
        if (error || !data?.user) {
          const err = new Error('Invalid token');
          err.status = 401;
          throw err;
        }
        return {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role || 'user',
          supabaseUser: data.user
        };
      }
    } catch (e) {
      console.warn('HS256 verification failed; prefer service role introspection.');
      const err = new Error('Invalid token');
      err.status = 401;
      throw err;
    }
  }
  const err = new Error('Authentication service not configured');
  err.status = 500;
  throw err;
}

/**
 * Middleware to authenticate Supabase JWT tokens (strict)
 */
export const authenticateSupabase = async (req, res, next) => {
  try {
    // Accept Authorization from common proxy-forwarded headers too
    const rawAuth = req.headers.authorization || req.headers['x-forwarded-authorization'] || req.headers['x-authorization'];
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = String(authHeader).substring(7);
    const user = await resolveUserFromToken(token);
    req.user = user;
    return next();
  } catch (error) {
    const code = error?.status || 401;
    const msg = code === 500 ? 'Authentication service not configured' : (error?.message || 'Authentication failed');
    return res.status(code).json({ error: msg });
  }
};

/**
 * Optional Supabase authentication - doesn't fail if no token
 */
export const optionalSupabaseAuth = async (req, _res, next) => {
  try {
    const rawAuth = req.headers.authorization || req.headers['x-forwarded-authorization'] || req.headers['x-authorization'];
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
      return next();
    }
    const token = String(authHeader).substring(7);
    try {
      const user = await resolveUserFromToken(token);
      req.user = user;
    } catch (e) {
      // Non-blocking: log and continue without user context
      console.warn('Optional auth: token ignored:', e?.message || e);
    }
    return next();
  } catch {
    return next();
  }
};

/**
 * Require specific role (after authentication)
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Require healthcare professional roles
 */
export const requireHealthcareProfessional = requireRole(['oncologist', 'pharmacist', 'nurse', 'admin']);
