import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Middleware to authenticate Supabase JWT tokens
 */
export const authenticateSupabase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // First try to verify with Supabase JWT secret if available
    if (supabaseJwtSecret) {
      try {
        const decoded = jwt.verify(token, supabaseJwtSecret);
        
        // Get user profile from Supabase
        if (supabaseAdmin) {
          const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(decoded.sub);
          
          if (error) {
            console.error('Error fetching user from Supabase:', error);
            return res.status(401).json({ error: 'Invalid token' });
          }

          // Attach user info to request
          req.user = {
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user',
            supabaseUser: user
          };
          
          return next();
        }
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError.message);
      }
    }

    // Fallback: verify token with Supabase client
    if (supabaseAdmin) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'user',
        supabaseUser: user
      };
      
      return next();
    }

    // If no Supabase configuration available
    return res.status(500).json({ error: 'Authentication service not configured' });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional Supabase authentication - doesn't fail if no token
 */
export const optionalSupabaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without auth
    }

    // Use the same logic as authenticateSupabase but don't fail
    await authenticateSupabase(req, res, next);
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
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