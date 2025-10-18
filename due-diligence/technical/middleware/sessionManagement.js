/**
 * Secure Session Management for Healthcare Applications
 * HIPAA-compliant session handling with advanced security features
 */

import session from 'express-session';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import crypto from 'crypto';
import auditTrail, { AUDIT_EVENTS, SENSITIVITY_LEVELS } from './auditTrail.js';

class SecureSessionManager {
  constructor() {
    this.redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;
    this.sessionSecret = process.env.SESSION_SECRET || this.generateSecureSecret();
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 30; // 30 minutes default
    this.maxConcurrentSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 3;
  }

  /**
   * Generate secure session secret if not provided
   */
  generateSecureSecret() {
    console.warn('⚠️  SESSION_SECRET not set, generating random secret (not recommended for production)');
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Create session configuration
   */
  createSessionConfig() {
    const config = {
      name: 'osrx_session', // Don't use default session name
      secret: this.sessionSecret,
      resave: false,
      saveUninitialized: false,
      rolling: true, // Reset expiration on each request
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        httpOnly: true, // Prevent XSS attacks
        maxAge: this.sessionTimeout * 60 * 1000, // Convert minutes to milliseconds
        sameSite: 'strict' // CSRF protection
      }
    };

    // Use Redis store if available
    if (this.redis) {
      config.store = new RedisStore({
        client: this.redis,
        prefix: 'osrx:sess:',
        ttl: this.sessionTimeout * 60 // TTL in seconds
      });
    }

    return session(config);
  }

  /**
   * Session security middleware
   */
  createSecurityMiddleware() {
    return async (req, res, next) => {
      if (!req.session) {
        return next();
      }

      try {
        // Check for session hijacking
        await this.checkSessionSecurity(req);

        // Update session activity
        await this.updateSessionActivity(req);

        // Validate concurrent sessions
        await this.validateConcurrentSessions(req);

        next();
      } catch (error) {
        console.error('Session security check failed:', error);
        await this.invalidateSession(req, 'security_violation');
        res.status(401).json({ 
          error: 'Session security violation detected',
          code: 'SESSION_SECURITY_VIOLATION'
        });
      }
    };
  }

  /**
   * Check session security (fingerprinting, hijacking detection)
   */
  async checkSessionSecurity(req) {
    if (!req.user || !req.session) return;

    // Generate user fingerprint
    const currentFingerprint = this.generateUserFingerprint(req);
    
    if (!req.session.fingerprint) {
      // First time - store fingerprint
      req.session.fingerprint = currentFingerprint;
      req.session.createdAt = new Date().toISOString();
      req.session.lastIP = req.ip;
    } else {
      // Check for potential session hijacking
      if (req.session.fingerprint !== currentFingerprint) {
        await auditTrail.auditSecurityEvent(
          'session_hijacking_detected',
          SENSITIVITY_LEVELS.CRITICAL,
          {
            userId: req.user.id,
            sessionId: req.sessionID,
            expectedFingerprint: req.session.fingerprint,
            actualFingerprint: currentFingerprint,
            lastIP: req.session.lastIP,
            currentIP: req.ip
          },
          req
        );
        throw new Error('Session fingerprint mismatch detected');
      }

      // Check for suspicious IP changes
      if (req.session.lastIP !== req.ip) {
        await auditTrail.auditSecurityEvent(
          'session_ip_change',
          SENSITIVITY_LEVELS.HIGH,
          {
            userId: req.user.id,
            sessionId: req.sessionID,
            oldIP: req.session.lastIP,
            newIP: req.ip
          },
          req
        );
        req.session.lastIP = req.ip;
      }
    }
  }

  /**
   * Generate user fingerprint for session security
   */
  generateUserFingerprint(req) {
    const components = [
      req.headers['user-agent'] || '',
      req.headers['accept-language'] || '',
      req.headers['accept-encoding'] || '',
      req.ip || ''
    ];
    
    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(req) {
    if (!req.user || !req.session) return;

    req.session.lastActivity = new Date().toISOString();
    req.session.requestCount = (req.session.requestCount || 0) + 1;

    // Store session info in Redis for concurrent session tracking
    if (this.redis) {
      const sessionKey = `user_sessions:${req.user.id}`;
      const sessionData = {
        sessionId: req.sessionID,
        userId: req.user.id,
        userEmail: req.user.email,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        createdAt: req.session.createdAt,
        lastActivity: req.session.lastActivity,
        requestCount: req.session.requestCount
      };

      await this.redis.hset(sessionKey, req.sessionID, JSON.stringify(sessionData));
      await this.redis.expire(sessionKey, this.sessionTimeout * 60);
    }
  }

  /**
   * Validate concurrent sessions
   */
  async validateConcurrentSessions(req) {
    if (!req.user || !this.redis) return;

    const sessionKey = `user_sessions:${req.user.id}`;
    const sessions = await this.redis.hgetall(sessionKey);
    const sessionCount = Object.keys(sessions).length;

    if (sessionCount > this.maxConcurrentSessions) {
      // Find and remove oldest sessions
      const sessionList = Object.entries(sessions)
        .map(([sessionId, data]) => ({ sessionId, ...JSON.parse(data) }))
        .sort((a, b) => new Date(a.lastActivity) - new Date(b.lastActivity));

      const sessionsToRemove = sessionList.slice(0, sessionCount - this.maxConcurrentSessions);
      
      for (const session of sessionsToRemove) {
        await this.invalidateSessionById(session.sessionId, 'concurrent_limit_exceeded');
        await this.redis.hdel(sessionKey, session.sessionId);
      }

      await auditTrail.auditSecurityEvent(
        'concurrent_session_limit_exceeded',
        SENSITIVITY_LEVELS.MEDIUM,
        {
          userId: req.user.id,
          sessionCount,
          maxSessions: this.maxConcurrentSessions,
          removedSessions: sessionsToRemove.length
        },
        req
      );
    }
  }

  /**
   * Invalidate current session
   */
  async invalidateSession(req, reason = 'logout') {
    if (!req.session) return;

    try {
      const sessionId = req.sessionID;
      const userId = req.user?.id;

      // Audit session termination
      if (userId) {
        await auditTrail.createAuditEntry({
          eventType: AUDIT_EVENTS.USER_LOGOUT,
          userId,
          userEmail: req.user?.email,
          action: 'SESSION_INVALIDATED',
          resourceType: 'session',
          resourceId: sessionId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          sessionId,
          sensitivityLevel: SENSITIVITY_LEVELS.MEDIUM,
          additionalData: {
            reason,
            timestamp: new Date().toISOString()
          }
        });

        // Remove from Redis tracking
        if (this.redis) {
          await this.redis.hdel(`user_sessions:${userId}`, sessionId);
        }
      }

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
      });

    } catch (error) {
      console.error('Session invalidation error:', error);
    }
  }

  /**
   * Invalidate session by ID (for concurrent session management)
   */
  async invalidateSessionById(sessionId, reason = 'admin_action') {
    try {
      if (this.redis) {
        // Use Redis store to destroy session
        await this.redis.del(`osrx:sess:${sessionId}`);
      }

      console.log(`Session ${sessionId} invalidated: ${reason}`);
    } catch (error) {
      console.error('Session invalidation by ID error:', error);
    }
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId) {
    if (!this.redis) return [];

    try {
      const sessionKey = `user_sessions:${userId}`;
      const sessions = await this.redis.hgetall(sessionKey);
      
      return Object.entries(sessions).map(([sessionId, data]) => ({
        sessionId,
        ...JSON.parse(data)
      }));
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Session cleanup middleware (for expired sessions)
   */
  createCleanupMiddleware() {
    return async (req, res, next) => {
      if (!req.session || !req.user) {
        return next();
      }

      try {
        const sessionAge = new Date() - new Date(req.session.createdAt || 0);
        const maxSessionAge = parseInt(process.env.MAX_SESSION_AGE_HOURS) || 24; // 24 hours default
        
        if (sessionAge > maxSessionAge * 60 * 60 * 1000) {
          await this.invalidateSession(req, 'session_expired');
          return res.status(401).json({ 
            error: 'Session expired',
            code: 'SESSION_EXPIRED'
          });
        }

        // Check for MFA timeout
        if (req.session.mfaVerified && req.session.mfaVerifiedAt) {
          const mfaAge = new Date() - new Date(req.session.mfaVerifiedAt);
          const mfaTimeout = parseInt(process.env.MFA_SESSION_TIMEOUT_MINUTES) || 120; // 2 hours default
          
          if (mfaAge > mfaTimeout * 60 * 1000) {
            req.session.mfaVerified = false;
            delete req.session.mfaVerifiedAt;
          }
        }

        next();
      } catch (error) {
        console.error('Session cleanup error:', error);
        next();
      }
    };
  }

  /**
   * Session termination endpoint
   */
  createSessionRoutes(app) {
    // Logout current session
    app.post('/api/auth/logout', async (req, res) => {
      try {
        await this.invalidateSession(req, 'user_logout');
        res.json({ message: 'Logged out successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
      }
    });

    // Get user's active sessions
    app.get('/api/auth/sessions', async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const sessions = await this.getUserSessions(req.user.id);
        res.json({ sessions });
      } catch (error) {
        res.status(500).json({ error: 'Failed to get sessions' });
      }
    });

    // Terminate specific session
    app.delete('/api/auth/sessions/:sessionId', async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const { sessionId } = req.params;
        await this.invalidateSessionById(sessionId, 'user_terminated');
        
        res.json({ message: 'Session terminated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to terminate session' });
      }
    });

    // Terminate all other sessions
    app.post('/api/auth/logout-all', async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const sessions = await this.getUserSessions(req.user.id);
        const currentSessionId = req.sessionID;
        
        for (const session of sessions) {
          if (session.sessionId !== currentSessionId) {
            await this.invalidateSessionById(session.sessionId, 'logout_all');
          }
        }

        // Clear Redis tracking
        if (this.redis) {
          await this.redis.del(`user_sessions:${req.user.id}`);
        }

        res.json({ 
          message: 'All other sessions terminated successfully',
          terminatedSessions: sessions.length - 1
        });
      } catch (error) {
        res.status(500).json({ error: 'Failed to terminate sessions' });
      }
    });
  }
}

// Export session manager and middleware
const sessionManager = new SecureSessionManager();

export const sessionConfig = sessionManager.createSessionConfig();
export const sessionSecurity = sessionManager.createSecurityMiddleware();
export const sessionCleanup = sessionManager.createCleanupMiddleware();
export const createSessionRoutes = (app) => sessionManager.createSessionRoutes(app);

export { SecureSessionManager };
export default sessionManager;