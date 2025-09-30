import fs from 'fs/promises';
import path from 'path';

class RealAnalyticsService {
  constructor() {
    this.analyticsDir = process.env.ANALYTICS_DIR || './logs/analytics';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 5; // 5 minutes cache
    
    this.ensureAnalyticsDirectory();
    
    // Real-time metrics storage
    this.metrics = {
      userSessions: new Map(),
      apiCalls: new Map(),
      drugLookups: new Map(),
      interactionChecks: new Map(),
      patientAccess: new Map(),
      errorRates: new Map()
    };

    // Start real-time data collection
    this.startMetricsCollection();
  }

  /**
   * Track user interaction event
   */
  async trackEvent(eventType, eventData) {
    try {
      const timestamp = new Date().toISOString();
      const event = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp,
        eventType,
        ...eventData
      };

      // Store in memory for real-time analytics
      this.storeInMemory(eventType, event);
      
      // Persist to disk for historical analysis
      await this.persistEvent(event);
      
      // Update real-time dashboard metrics
      await this.updateDashboardMetrics(eventType, event);

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  /**
   * Get real drug interaction trends
   */
  async getRealInteractionTrends(timeframe = '30d') {
    try {
      const cacheKey = `interaction_trends_${timeframe}`;
      
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Get real interaction data from logs
      const interactionData = await this.queryInteractionLogs(timeframe);
      const trends = this.processInteractionTrends(interactionData);
      
      this.cache.set(cacheKey, {
        data: trends,
        timestamp: Date.now()
      });

      return trends;

    } catch (error) {
      console.error('Error getting real interaction trends:', error);
      return this.getFallbackTrends();
    }
  }

  /**
   * Get real usage analytics
   */
  async getUsageAnalytics(timeframe = '7d') {
    const startDate = this.getStartDate(timeframe);
    const endDate = new Date();

    const analytics = {
      overview: await this.getUsageOverview(startDate, endDate),
      userActivity: await this.getUserActivity(startDate, endDate),
      featureUsage: await this.getFeatureUsage(startDate, endDate),
      performanceMetrics: await this.getPerformanceMetrics(startDate, endDate),
      errorAnalytics: await this.getErrorAnalytics(startDate, endDate),
      clinicalMetrics: await this.getClinicalMetrics(startDate, endDate)
    };

    return analytics;
  }

  /**
   * Get usage overview
   */
  async getUsageOverview(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const totalSessions = events.filter(e => e.eventType === 'session_start').length;
    const totalInteractions = events.filter(e => e.eventType === 'drug_interaction_check').length;
    const avgSessionDuration = this.calculateAverageSessionDuration(events);

    return {
      totalUsers: uniqueUsers,
      totalSessions,
      totalInteractions,
      avgSessionDuration,
      totalEvents: events.length,
      period: { start: startDate, end: endDate }
    };
  }

  /**
   * Get user activity metrics
   */
  async getUserActivity(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    // Group by date
    const dailyActivity = {};
    events.forEach(event => {
      const date = event.timestamp.split('T')[0];
      if (!dailyActivity[date]) {
        dailyActivity[date] = { users: new Set(), sessions: 0, interactions: 0 };
      }
      
      dailyActivity[date].users.add(event.userId);
      if (event.eventType === 'session_start') dailyActivity[date].sessions++;
      if (event.eventType === 'drug_interaction_check') dailyActivity[date].interactions++;
    });

    // Convert to array format
    const activity = Object.entries(dailyActivity).map(([date, data]) => ({
      date,
      activeUsers: data.users.size,
      sessions: data.sessions,
      interactions: data.interactions
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      dailyActivity: activity,
      peakUsageDay: activity.reduce((max, day) => 
        day.activeUsers > max.activeUsers ? day : max, activity[0] || {}),
      growthRate: this.calculateGrowthRate(activity)
    };
  }

  /**
   * Get feature usage analytics
   */
  async getFeatureUsage(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    const featureUsage = {};
    events.forEach(event => {
      const feature = this.mapEventToFeature(event.eventType);
      featureUsage[feature] = (featureUsage[feature] || 0) + 1;
    });

    // Sort by usage
    const sortedFeatures = Object.entries(featureUsage)
      .map(([feature, count]) => ({ feature, count, percentage: (count / events.length * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    return {
      features: sortedFeatures,
      mostUsed: sortedFeatures[0],
      leastUsed: sortedFeatures[sortedFeatures.length - 1],
      totalFeatureInteractions: events.length
    };
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    const performanceEvents = events.filter(e => e.responseTime);
    const responseTimes = performanceEvents.map(e => e.responseTime);
    
    return {
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      slowestEndpoint: this.getSlowesEndpoint(performanceEvents),
      fastestEndpoint: this.getFastestEndpoint(performanceEvents),
      totalApiCalls: performanceEvents.length
    };
  }

  /**
   * Get error analytics
   */
  async getErrorAnalytics(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    const errorEvents = events.filter(e => e.eventType === 'error' || e.statusCode >= 400);
    const totalEvents = events.length;
    
    const errorsByType = {};
    const errorsByEndpoint = {};
    
    errorEvents.forEach(event => {
      const errorType = event.errorType || 'unknown';
      const endpoint = event.endpoint || 'unknown';
      
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
    });

    return {
      totalErrors: errorEvents.length,
      errorRate: totalEvents > 0 ? (errorEvents.length / totalEvents * 100).toFixed(2) : 0,
      errorsByType: Object.entries(errorsByType).map(([type, count]) => ({ type, count })),
      errorsByEndpoint: Object.entries(errorsByEndpoint).map(([endpoint, count]) => ({ endpoint, count })),
      criticalErrors: errorEvents.filter(e => e.severity === 'critical').length
    };
  }

  /**
   * Get clinical-specific metrics
   */
  async getClinicalMetrics(startDate, endDate) {
    const events = await this.getEventsInRange(startDate, endDate);
    
    const clinicalEvents = events.filter(e => 
      ['drug_interaction_check', 'patient_accessed', 'clinical_decision_support'].includes(e.eventType)
    );

    const interactionChecks = events.filter(e => e.eventType === 'drug_interaction_check');
    const patientAccess = events.filter(e => e.eventType === 'patient_accessed');
    const aiRecommendations = events.filter(e => e.eventType === 'ai_recommendation_generated');

    return {
      totalClinicalInteractions: clinicalEvents.length,
      drugInteractionChecks: interactionChecks.length,
      patientsAccessed: new Set(patientAccess.map(e => e.patientId)).size,
      aiRecommendationsGenerated: aiRecommendations.length,
      averageInteractionsPerSession: this.calculateAverageInteractionsPerSession(events),
      clinicalDecisionSupport: {
        totalRequests: events.filter(e => e.eventType === 'clinical_decision_support').length,
        averageConfidence: this.calculateAverageConfidence(aiRecommendations)
      }
    };
  }

  /**
   * Store event in memory for real-time access
   */
  storeInMemory(eventType, event) {
    const category = this.getEventCategory(eventType);
    
    if (!this.metrics[category]) {
      this.metrics[category] = new Map();
    }
    
    // Keep only recent events in memory (last 1000 per category)
    const categoryEvents = this.metrics[category];
    if (categoryEvents.size >= 1000) {
      const oldestKey = categoryEvents.keys().next().value;
      categoryEvents.delete(oldestKey);
    }
    
    categoryEvents.set(event.id, event);
  }

  /**
   * Persist event to disk
   */
  async persistEvent(event) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `analytics_${date}.jsonl`;
    const filepath = path.join(this.analyticsDir, filename);
    
    const logLine = JSON.stringify(event) + '\n';
    await fs.appendFile(filepath, logLine, 'utf8');
  }

  /**
   * Update real-time dashboard metrics
   */
  async updateDashboardMetrics(eventType, event) {
    // Update counters based on event type
    const timestamp = Date.now();
    const minute = Math.floor(timestamp / 60000) * 60000; // Round to minute
    
    // Store metrics by minute for real-time dashboards
    const metricsKey = `${eventType}_${minute}`;
    // Implementation would update dashboard data structures
  }

  /**
   * Query interaction logs from disk
   */
  async queryInteractionLogs(timeframe) {
    const days = this.parseDaysFromTimeframe(timeframe);
    const events = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const filename = `analytics_${dateStr}.jsonl`;
        const filepath = path.join(this.analyticsDir, filename);
        const content = await fs.readFile(filepath, 'utf8');
        
        const dayEvents = content.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line))
          .filter(event => event.eventType === 'drug_interaction_check');
        
        events.push(...dayEvents);
      } catch (error) {
        // File doesn't exist for this date, continue
      }
    }
    
    return events;
  }

  /**
   * Process interaction trends from raw data
   */
  processInteractionTrends(interactionData) {
    const trends = {
      totalInteractions: interactionData.length,
      severityDistribution: {},
      commonInteractions: {},
      timeDistribution: {}
    };

    interactionData.forEach(event => {
      // Process severity
      const severity = event.severity || 'unknown';
      trends.severityDistribution[severity] = (trends.severityDistribution[severity] || 0) + 1;
      
      // Process drug pairs
      if (event.drugPair) {
        const pair = event.drugPair.sort().join(' + ');
        trends.commonInteractions[pair] = (trends.commonInteractions[pair] || 0) + 1;
      }
      
      // Process time distribution
      const hour = new Date(event.timestamp).getHours();
      trends.timeDistribution[hour] = (trends.timeDistribution[hour] || 0) + 1;
    });

    return trends;
  }

  /**
   * Utility functions
   */
  async getEventsInRange(startDate, endDate) {
    const events = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      try {
        const filename = `analytics_${dateStr}.jsonl`;
        const filepath = path.join(this.analyticsDir, filename);
        const content = await fs.readFile(filepath, 'utf8');
        
        const dayEvents = content.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
        
        events.push(...dayEvents);
      } catch (error) {
        // File doesn't exist, continue
      }
    }
    
    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= start && eventDate <= end;
    });
  }

  getStartDate(timeframe) {
    const date = new Date();
    const days = this.parseDaysFromTimeframe(timeframe);
    date.setDate(date.getDate() - days);
    return date;
  }

  parseDaysFromTimeframe(timeframe) {
    if (timeframe.endsWith('d')) return parseInt(timeframe);
    if (timeframe.endsWith('w')) return parseInt(timeframe) * 7;
    if (timeframe.endsWith('m')) return parseInt(timeframe) * 30;
    return 7; // Default to 7 days
  }

  getEventCategory(eventType) {
    if (eventType.includes('session')) return 'userSessions';
    if (eventType.includes('api')) return 'apiCalls';
    if (eventType.includes('drug')) return 'drugLookups';
    if (eventType.includes('interaction')) return 'interactionChecks';
    if (eventType.includes('patient')) return 'patientAccess';
    if (eventType.includes('error')) return 'errorRates';
    return 'general';
  }

  mapEventToFeature(eventType) {
    const featureMap = {
      'drug_interaction_check': 'Drug Interaction Checker',
      'patient_accessed': 'Patient Management',
      'clinical_decision_support': 'Clinical Decision Support',
      'ai_recommendation_generated': 'AI Recommendations',
      'drug_search': 'Drug Database Search',
      'clinical_trials_search': 'Clinical Trials Search'
    };
    
    return featureMap[eventType] || 'Other';
  }

  calculateAverageSessionDuration(events) {
    const sessions = {};
    
    events.forEach(event => {
      if (!event.sessionId) return;
      
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = { start: null, end: null };
      }
      
      const timestamp = new Date(event.timestamp);
      if (event.eventType === 'session_start') {
        sessions[event.sessionId].start = timestamp;
      } else {
        sessions[event.sessionId].end = timestamp;
      }
    });
    
    const durations = Object.values(sessions)
      .filter(session => session.start && session.end)
      .map(session => session.end - session.start);
    
    return durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  }

  percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(arr.length * p / 100) - 1;
    return sorted[index];
  }

  calculateGrowthRate(activity) {
    if (activity.length < 2) return 0;
    const latest = activity[activity.length - 1];
    const previous = activity[activity.length - 2];
    return ((latest.activeUsers - previous.activeUsers) / previous.activeUsers * 100).toFixed(1);
  }

  getFallbackTrends() {
    return {
      totalInteractions: 0,
      severityDistribution: {},
      commonInteractions: {},
      timeDistribution: {},
      note: 'No interaction data available'
    };
  }

  async ensureAnalyticsDirectory() {
    try {
      await fs.mkdir(this.analyticsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create analytics directory:', error);
    }
  }

  startMetricsCollection() {
    // Start background collection of system metrics
    setInterval(() => {
      this.collectSystemMetrics();
    }, 60000); // Every minute
  }

  async collectSystemMetrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    await this.trackEvent('system_metrics', {
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      timestamp: new Date().toISOString()
    });
  }
}

export default new RealAnalyticsService();