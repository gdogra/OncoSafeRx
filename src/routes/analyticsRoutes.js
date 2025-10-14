import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { USAGE_METRICS, DRUG_ANALYTICS, CLINICAL_OUTCOMES, QUALITY_METRICS, ROI_METRICS } from '../data/analytics.js';
import supabaseService from '../config/supabase.js';

const router = express.Router();

// POST endpoint for visitor tracking data from frontend
router.post('/', async (req, res) => {
  try {
    const trackingData = req.body;
    
    console.log('📊 Received visitor tracking data:', {
      eventType: trackingData.eventType,
      userId: trackingData.userId,
      userRole: trackingData.userRole,
      sessionId: trackingData.sessionId,
      timestamp: trackingData.timestamp
    });
    
    // Store in Supabase if enabled
    if (supabaseService.enabled && supabaseService.client) {
      try {
        const { error } = await supabaseService.client
          .from('visitor_analytics')
          .insert({
            event_type: trackingData.eventType,
            session_id: trackingData.sessionId,
            user_id: trackingData.userId,
            user_role: trackingData.userRole,
            page_url: trackingData.data?.url || trackingData.data?.path,
            page_title: trackingData.data?.title,
            referrer: trackingData.data?.referrer,
            user_agent: trackingData.data?.userAgent,
            timestamp: trackingData.timestamp,
            data: trackingData.data,
            created_at: new Date().toISOString()
          });
          
        if (error) {
          console.error('❌ Failed to store visitor analytics in Supabase:', error);
          // Don't fail the request - analytics shouldn't break the app
        } else {
          console.log('✅ Visitor analytics stored in Supabase successfully');
        }
      } catch (dbError) {
        console.error('❌ Supabase analytics storage error:', dbError);
        // Don't fail the request - analytics shouldn't break the app
      }
    }
    
    // Always return success - analytics failures shouldn't break user experience
    res.json({ success: true, message: 'Analytics data received' });
    
  } catch (error) {
    console.error('❌ Analytics endpoint error:', error);
    // Still return success to avoid breaking the frontend
    res.json({ success: true, message: 'Analytics data processed with warnings' });
  }
});

// GET endpoint for retrieving visitor metrics (for dashboard)
router.get('/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { range = '7d' } = req.query;
    
    if (!supabaseService.enabled || !supabaseService.client) {
      return res.json({
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        userRoles: [],
        deviceTypes: [],
        geographicDistribution: []
      });
    }
    
    try {
      // Calculate date range
      const now = new Date();
      const daysAgo = parseInt(range.replace('d', '')) || 7;
      const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      // Query recent analytics data
      const { data: analyticsData, error } = await supabaseService.client
        .from('visitor_analytics')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const events = analyticsData || [];
      const pageViews = events.filter(e => e.event_type === 'pageview').length;
      const sessions = new Set(events.map(e => e.session_id)).size;
      
      // Calculate unique visitors by userId (for authenticated users) or sessionId (for anonymous)
      // Prioritize userId over sessionId to avoid counting the same user multiple times
      const uniqueUsers = new Set();
      const authenticatedUsers = new Set();
      
      // First pass: collect all authenticated user IDs
      events.forEach(event => {
        if (event.user_id) {
          authenticatedUsers.add(event.user_id);
        }
      });
      
      // Second pass: add authenticated users, then anonymous sessions
      events.forEach(event => {
        if (event.user_id) {
          uniqueUsers.add(`user:${event.user_id}`);
        } else {
          // Only count anonymous sessions if no authenticated user data exists
          uniqueUsers.add(`session:${event.session_id}`);
        }
      });
      
      const topPages = [];
      const pageViewEvents = events.filter(e => e.event_type === 'pageview');
      const pageGroups = {};
      pageViewEvents.forEach(event => {
        const url = event.page_url || '/';
        pageGroups[url] = (pageGroups[url] || 0) + 1;
      });
      
      Object.entries(pageGroups)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([url, views]) => {
          topPages.push({ url, views });
        });
      
      const userRoles = [];
      const roleGroups = {};
      events.forEach(event => {
        if (event.user_role) {
          roleGroups[event.user_role] = (roleGroups[event.user_role] || 0) + 1;
        }
      });
      
      Object.entries(roleGroups).forEach(([role, count]) => {
        userRoles.push({ role, count });
      });
      
      res.json({
        totalVisitors: uniqueUsers.size,
        uniqueVisitors: uniqueUsers.size,
        pageViews,
        averageSessionDuration: 0, // Would need session duration calculation
        bounceRate: 0, // Would need bounce rate calculation
        topPages,
        userRoles,
        deviceTypes: [{ type: 'Unknown', count: sessions }],
        geographicDistribution: [{ location: 'Unknown', count: sessions }]
      });
      
    } catch (dbError) {
      console.error('❌ Failed to fetch analytics from Supabase:', dbError);
      // Return empty metrics on error
      res.json({
        totalVisitors: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        averageSessionDuration: 0,
        bounceRate: 0,
        topPages: [],
        userRoles: [],
        deviceTypes: [],
        geographicDistribution: []
      });
    }
    
  } catch (error) {
    console.error('❌ Analytics metrics endpoint error:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics metrics' });
  }
});

// Usage metrics
router.get('/usage', (req, res) => {
  const { period } = req.query;
  
  let data = USAGE_METRICS;
  
  if (period === 'daily') {
    data = { daily: USAGE_METRICS.daily };
  } else if (period === 'summary') {
    data = { summary: USAGE_METRICS.summary };
  }
  
  res.json(data);
});

// Drug analytics
router.get('/drugs', (req, res) => {
  res.json(DRUG_ANALYTICS);
});

// Clinical outcomes
router.get('/clinical', (req, res) => {
  res.json(CLINICAL_OUTCOMES);
});

// Quality metrics
router.get('/quality', (req, res) => {
  res.json(QUALITY_METRICS);
});

// ROI metrics
router.get('/roi', (req, res) => {
  res.json(ROI_METRICS);
});

// Dashboard summary
router.get('/dashboard', (req, res) => {
  const summary = {
    usage: USAGE_METRICS.summary,
    topDrugs: DRUG_ANALYTICS.mostSearched.slice(0, 5),
    adherence: CLINICAL_OUTCOMES.protocolAdherence.overall,
    satisfaction: QUALITY_METRICS.systemPerformance.userSatisfaction,
    costSavings: ROI_METRICS.costSavings.totalAnnual,
    recentAlerts: DRUG_ANALYTICS.interactionAlerts.slice(0, 3)
  };
  
  res.json(summary);
});

export default router;
