import rateLimit from 'express-rate-limit';
import { incRateLimitHit } from '../utils/metrics.js';

// Rate limiting configuration
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100, scope = 'general') => {
  return rateLimit({
    windowMs, // 15 minutes default
    max, // limit each IP to max requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      try { incRateLimitHit(scope, req.path || req.originalUrl || 'unknown'); } catch {}
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const RL_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '', 10) || 5 * 60 * 1000; // 5 minutes instead of 15
const RL_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '', 10) || 1000; // 1000 requests instead of 100

// Search rate limiting (can be overridden with env vars)
const SEARCH_WINDOW = parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS || '', 10) || 60 * 1000;
const SEARCH_MAX = parseInt(process.env.SEARCH_RATE_LIMIT_MAX || '', 10) || 120;

// Interaction rate limiting (can be overridden with env vars)  
const INTERACTION_WINDOW = parseInt(process.env.INTERACTION_RATE_LIMIT_WINDOW_MS || '', 10) || 5 * 60 * 1000;
const INTERACTION_MAX = parseInt(process.env.INTERACTION_RATE_LIMIT_MAX || '', 10) || 200;

export const generalLimiter = createRateLimiter(RL_WINDOW, RL_MAX, 'general');
export const searchLimiter = createRateLimiter(SEARCH_WINDOW, SEARCH_MAX, 'search');
export const interactionLimiter = createRateLimiter(INTERACTION_WINDOW, INTERACTION_MAX, 'interaction');

// Probe/Scanner deny-list limiter (very strict)
const PROBE_WINDOW = parseInt(process.env.PROBE_RATE_LIMIT_WINDOW_MS || '', 10) || 10 * 60 * 1000; // 10 minutes
const PROBE_MAX = parseInt(process.env.PROBE_RATE_LIMIT_MAX || '', 10) || 20; // 20 requests per window
export const probeLimiter = createRateLimiter(PROBE_WINDOW, PROBE_MAX, 'probe');
