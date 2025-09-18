import jwt from 'jsonwebtoken';
import supabaseService from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

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

// Authentication middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
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
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
}

// Admin only middleware
export function requireAdmin(req, res, next) {
  return requireRole('admin')(req, res, next);
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