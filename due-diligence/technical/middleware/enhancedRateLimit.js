/**
 * Enhanced Rate Limiting for Healthcare Applications
 * HIPAA-compliant rate limiting with security monitoring
 */

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import auditTrail, { AUDIT_EVENTS, SENSITIVITY_LEVELS } from './auditTrail.js';

class EnhancedRateLimiter {
  constructor() {
    this.redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
    this.enabled = process.env.NODE_ENV !== 'development' || process.env.FORCE_RATE_LIMITING === 'true';
  }

  /**
   * General API rate limiter
   */
  createGeneralLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.GENERAL_RATE_LIMIT) || 100,
      message: {
        error: 'Too many requests from this IP',
        retryAfter: '15 minutes',
        code: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:general:'
      }) : undefined,
      keyGenerator: (req) => {
        return req.ip + ':' + (req.user?.id || 'anonymous');
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'general', 'MEDIUM');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * Authentication rate limiter (more restrictive)
   */
  createAuthLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.AUTH_RATE_LIMIT) || 10,
      message: {
        error: 'Too many authentication attempts',
        retryAfter: '15 minutes',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:auth:'
      }) : undefined,
      keyGenerator: (req) => {
        // Rate limit by IP and email for auth attempts
        const email = req.body?.email || req.query?.email || 'unknown';
        return `${req.ip}:${email}`;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'authentication', 'HIGH');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * Admin endpoints rate limiter (very restrictive)
   */
  createAdminLimiter() {
    return rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: parseInt(process.env.ADMIN_RATE_LIMIT) || 50,
      message: {
        error: 'Too many admin requests',
        retryAfter: '10 minutes',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:admin:'
      }) : undefined,
      keyGenerator: (req) => {
        return req.user?.id || req.ip;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'admin', 'CRITICAL');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * MFA attempts rate limiter (very strict)
   */
  createMFALimiter() {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: parseInt(process.env.MFA_RATE_LIMIT) || 5,
      message: {
        error: 'Too many MFA attempts',
        retryAfter: '5 minutes',
        code: 'MFA_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:mfa:'
      }) : undefined,
      keyGenerator: (req) => {
        const userId = req.body?.userId || req.user?.id;
        return `${req.ip}:${userId}`;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'mfa', 'CRITICAL');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * PHI access rate limiter (moderate)
   */
  createPHILimiter() {
    return rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: parseInt(process.env.PHI_RATE_LIMIT) || 200,
      message: {
        error: 'Too many PHI access requests',
        retryAfter: '10 minutes',
        code: 'PHI_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:phi:'
      }) : undefined,
      keyGenerator: (req) => {
        return req.user?.id || req.ip;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'phi_access', 'HIGH');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * Password reset rate limiter
   */
  createPasswordResetLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT) || 3,
      message: {
        error: 'Too many password reset attempts',
        retryAfter: '1 hour',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:password_reset:'
      }) : undefined,
      keyGenerator: (req) => {
        const email = req.body?.email || req.query?.email;
        return `${req.ip}:${email}`;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'password_reset', 'HIGH');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * Data export rate limiter (very strict for HIPAA compliance)
   */
  createDataExportLimiter() {
    return rateLimit({
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      max: parseInt(process.env.DATA_EXPORT_RATE_LIMIT) || 5,
      message: {
        error: 'Daily data export limit exceeded',
        retryAfter: '24 hours',
        code: 'DATA_EXPORT_RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:export:'
      }) : undefined,
      keyGenerator: (req) => {
        return req.user?.id || req.ip;
      },
      onLimitReached: async (req) => {
        await this.auditRateLimitViolation(req, 'data_export', 'CRITICAL');
      },
      skip: (req) => !this.enabled
    });
  }

  /**
   * Audit rate limit violations
   */
  async auditRateLimitViolation(req, limitType, severity) {
    try {
      await auditTrail.auditSecurityEvent(
        'rate_limit_exceeded',
        SENSITIVITY_LEVELS[severity] || SENSITIVITY_LEVELS.MEDIUM,
        {
          limitType,
          endpoint: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent'],
          userEmail: req.user?.email,
          timestamp: new Date().toISOString()
        },
        req
      );
    } catch (error) {
      console.error('Rate limit audit error:', error);
    }
  }

  /**
   * Create adaptive rate limiter based on user reputation
   */
  createAdaptiveLimiter(baseLimit, windowMs) {
    return rateLimit({
      windowMs,
      max: async (req) => {
        if (!req.user) return Math.floor(baseLimit * 0.5); // Lower limit for unauthenticated

        // Check user's recent security events
        const recentViolations = await this.getRecentSecurityViolations(req.user.id);
        
        if (recentViolations > 5) return Math.floor(baseLimit * 0.2); // Severely restricted
        if (recentViolations > 2) return Math.floor(baseLimit * 0.5); // Moderately restricted
        if (req.user.role === 'super_admin') return baseLimit * 2; // Higher limit for admins
        
        return baseLimit;
      },
      store: this.redis ? new RedisStore({
        sendCommand: (...args) => this.redis.call(...args),
        prefix: 'rl:adaptive:'
      }) : undefined,
      keyGenerator: (req) => req.user?.id || req.ip,
      skip: (req) => !this.enabled
    });
  }

  /**
   * Get recent security violations for user
   */
  async getRecentSecurityViolations(userId) {
    try {
      if (!this.redis) return 0;

      const key = `security_violations:${userId}`;
      const violations = await this.redis.get(key);
      return parseInt(violations) || 0;
    } catch (error) {
      console.error('Security violations check error:', error);
      return 0;
    }
  }

  /**
   * Increment security violations counter
   */
  async incrementSecurityViolations(userId) {
    try {
      if (!this.redis || !userId) return;

      const key = `security_violations:${userId}`;
      const current = await this.redis.incr(key);
      
      // Expire after 24 hours
      if (current === 1) {
        await this.redis.expire(key, 24 * 60 * 60);
      }
    } catch (error) {
      console.error('Security violations increment error:', error);
    }
  }
}

// Rate limiter configuration and export
const rateLimiter = new EnhancedRateLimiter();

export const generalLimiter = rateLimiter.createGeneralLimiter();
export const authLimiter = rateLimiter.createAuthLimiter();
export const adminLimiter = rateLimiter.createAdminLimiter();
export const mfaLimiter = rateLimiter.createMFALimiter();
export const phiLimiter = rateLimiter.createPHILimiter();
export const passwordResetLimiter = rateLimiter.createPasswordResetLimiter();
export const dataExportLimiter = rateLimiter.createDataExportLimiter();

// Adaptive rate limiter factory
export const createAdaptiveLimiter = (baseLimit, windowMs) => 
  rateLimiter.createAdaptiveLimiter(baseLimit, windowMs);

export default rateLimiter;