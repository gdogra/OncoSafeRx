import rateLimit from 'express-rate-limit';

// Rate limiting configuration
export const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
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
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Different rate limits for different endpoints
const RL_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '', 10) || 15 * 60 * 1000;
const RL_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '', 10) || 100;

export const generalLimiter = createRateLimiter(RL_WINDOW, RL_MAX);
export const searchLimiter = createRateLimiter(60 * 1000, 30);
export const interactionLimiter = createRateLimiter(5 * 60 * 1000, 50);
