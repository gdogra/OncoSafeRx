// Example Node.js/Express server for handling visitor analytics
// This would be implemented in your backend

const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const app = express();

// Rate limiting for analytics endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many analytics requests from this IP'
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use('/api/analytics', analyticsLimiter);

// HIPAA-compliant data storage
class AnalyticsDatabase {
  constructor() {
    this.sessions = new Map();
    this.pageViews = [];
    this.interactions = [];
    this.dailyMetrics = new Map();
  }

  // Hash IP addresses for privacy
  hashIP(ip) {
    return crypto.createHash('sha256').update(ip + process.env.ANALYTICS_SALT).digest('hex').slice(0, 16);
  }

  // Store session data (anonymized)
  storeSession(sessionData, clientIP) {
    const anonymizedSession = {
      ...sessionData,
      ipHash: this.hashIP(clientIP),
      ipAddress: undefined, // Remove actual IP
      // Remove any potentially sensitive data
      userAgent: this.sanitizeUserAgent(sessionData.userAgent)
    };

    this.sessions.set(sessionData.sessionId, anonymizedSession);
    
    // Store daily metrics
    const date = new Date().toISOString().split('T')[0];
    if (!this.dailyMetrics.has(date)) {
      this.dailyMetrics.set(date, {
        sessions: 0,
        pageViews: 0,
        uniqueVisitors: new Set(),
        devices: {},
        userRoles: {},
        locations: {}
      });
    }

    const dayMetrics = this.dailyMetrics.get(date);
    dayMetrics.sessions++;
    dayMetrics.uniqueVisitors.add(sessionData.sessionId);
    
    if (sessionData.deviceType) {
      dayMetrics.devices[sessionData.deviceType] = (dayMetrics.devices[sessionData.deviceType] || 0) + 1;
    }
    
    if (sessionData.userRole) {
      dayMetrics.userRoles[sessionData.userRole] = (dayMetrics.userRoles[sessionData.userRole] || 0) + 1;
    }
  }

  sanitizeUserAgent(userAgent) {
    // Remove potentially identifying information from user agent
    return userAgent
      .replace(/\([^)]*\)/g, '') // Remove parenthetical content
      .replace(/\s+/g, ' ')
      .trim();
  }

  storePageView(pageViewData) {
    // Remove sensitive query parameters
    const sanitizedUrl = this.sanitizeUrl(pageViewData.url);
    
    const anonymizedPageView = {
      ...pageViewData,
      url: sanitizedUrl,
      title: this.sanitizeTitle(pageViewData.title)
    };

    this.pageViews.push(anonymizedPageView);

    // Update daily metrics
    const date = new Date().toISOString().split('T')[0];
    if (this.dailyMetrics.has(date)) {
      this.dailyMetrics.get(date).pageViews++;
    }
  }

  sanitizeUrl(url) {
    // Remove sensitive query parameters
    const urlObj = new URL(url, 'https://example.com');
    const sensitiveParams = ['patient_id', 'user_id', 'token', 'session'];
    
    sensitiveParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.pathname + urlObj.search;
  }

  sanitizeTitle(title) {
    // Remove patient names or other sensitive info from page titles
    return title.replace(/Patient:\s*[^-]+/gi, 'Patient: [Redacted]');
  }

  storeInteraction(interactionData) {
    const anonymizedInteraction = {
      ...interactionData,
      // Remove sensitive form values
      value: interactionData.type === 'form_submit' ? '[Redacted]' : interactionData.value
    };

    this.interactions.push(anonymizedInteraction);
  }

  getMetrics(dateRange = '7d') {
    const days = parseInt(dateRange.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let totalSessions = 0;
    let totalPageViews = 0;
    let uniqueVisitors = new Set();
    let deviceTypes = {};
    let userRoles = {};
    
    // Aggregate metrics
    for (let [date, metrics] of this.dailyMetrics) {
      const metricDate = new Date(date);
      if (metricDate >= startDate) {
        totalSessions += metrics.sessions;
        totalPageViews += metrics.pageViews;
        
        metrics.uniqueVisitors.forEach(visitor => uniqueVisitors.add(visitor));
        
        Object.entries(metrics.devices).forEach(([device, count]) => {
          deviceTypes[device] = (deviceTypes[device] || 0) + count;
        });
        
        Object.entries(metrics.userRoles).forEach(([role, count]) => {
          userRoles[role] = (userRoles[role] || 0) + count;
        });
      }
    }

    // Calculate top pages
    const pageViews = this.pageViews.filter(pv => {
      const pvDate = new Date(pv.timestamp);
      return pvDate >= startDate;
    });

    const pageCounts = {};
    pageViews.forEach(pv => {
      pageCounts[pv.url] = (pageCounts[pv.url] || 0) + 1;
    });

    const topPages = Object.entries(pageCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, views]) => ({ url, views }));

    // Calculate average session duration
    const recentSessions = Array.from(this.sessions.values()).filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && session.duration;
    });

    const avgDuration = recentSessions.length > 0 
      ? recentSessions.reduce((sum, session) => sum + (session.duration || 0), 0) / recentSessions.length / 1000
      : 0;

    return {
      totalVisitors: totalSessions,
      uniqueVisitors: uniqueVisitors.size,
      pageViews: totalPageViews,
      averageSessionDuration: Math.round(avgDuration),
      bounceRate: this.calculateBounceRate(recentSessions),
      topPages,
      userRoles: Object.entries(userRoles).map(([role, count]) => ({ role, count })),
      deviceTypes: Object.entries(deviceTypes).map(([type, count]) => ({ type, count })),
      geographicDistribution: this.getGeographicDistribution(recentSessions)
    };
  }

  calculateBounceRate(sessions) {
    if (sessions.length === 0) return 0;
    
    const bounceSessions = sessions.filter(session => 
      session.pageViews && session.pageViews.length <= 1
    ).length;
    
    return bounceSessions / sessions.length;
  }

  getGeographicDistribution(sessions) {
    // In a real implementation, you'd use IP geolocation
    // For now, return mock data
    return [
      { location: 'United States', count: Math.floor(sessions.length * 0.5) },
      { location: 'Canada', count: Math.floor(sessions.length * 0.2) },
      { location: 'United Kingdom', count: Math.floor(sessions.length * 0.15) },
      { location: 'Germany', count: Math.floor(sessions.length * 0.1) },
      { location: 'Australia', count: Math.floor(sessions.length * 0.05) }
    ];
  }
}

const db = new AnalyticsDatabase();

// Analytics tracking endpoint
app.post('/api/analytics', [
  body('eventType').isIn(['pageview', 'interaction', 'session_end']),
  body('sessionId').isUUID(),
  body('timestamp').isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { eventType, data, sessionId } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    switch (eventType) {
      case 'pageview':
        db.storePageView(data);
        break;
      
      case 'interaction':
        db.storeInteraction(data);
        break;
      
      case 'session_end':
        db.storeSession(data, clientIP);
        break;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics metrics endpoint
app.get('/api/analytics/metrics', (req, res) => {
  try {
    const { range = '7d' } = req.query;
    const metrics = db.getMetrics(range);
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real-time analytics endpoint (for websockets or SSE)
app.get('/api/analytics/realtime', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send current active sessions
  const activeSessions = Array.from(db.sessions.values()).filter(session => {
    const sessionAge = Date.now() - new Date(session.startTime).getTime();
    return sessionAge < 30 * 60 * 1000; // Active in last 30 minutes
  });

  res.write(`data: ${JSON.stringify({
    activeSessions: activeSessions.length,
    recentPageViews: db.pageViews.slice(-10),
    timestamp: new Date().toISOString()
  })}\n\n`);

  // Keep connection alive
  const heartbeat = setInterval(() => {
    res.write(`data: ${JSON.stringify({ heartbeat: true })}\n\n`);
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
  });
});

// Export db for testing
module.exports = { app, db };

/* 
Usage Example:

// In your main server file:
const { app } = require('./analytics-api');
const express = require('express');
const mainApp = express();

// Use analytics API
mainApp.use(app);

// Start server
mainApp.listen(3001, () => {
  console.log('Analytics server running on port 3001');
});

*/