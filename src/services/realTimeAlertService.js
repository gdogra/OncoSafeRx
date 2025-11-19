/**
 * Real-Time Alert Service with WebSocket Integration
 * Provides live drug interaction alerts and clinical notifications
 */

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import aiRecommendationEngine from './aiRecommendationEngine.js';

class RealTimeAlertService {
  constructor() {
    this.clients = new Map();
    this.sessions = new Map();
    this.alertQueues = new Map();
    this.wss = null;
    
    // Alert types and their priorities
    this.alertTypes = {
      CRITICAL_INTERACTION: { priority: 1, color: '#dc3545', sound: 'urgent' },
      MAJOR_INTERACTION: { priority: 2, color: '#fd7e14', sound: 'warning' },
      MEDICATION_CHANGE: { priority: 3, color: '#ffc107', sound: 'notification' },
      DOSING_ALERT: { priority: 4, color: '#17a2b8', sound: 'soft' },
      MONITORING_REMINDER: { priority: 5, color: '#28a745', sound: 'gentle' }
    };
    
    // Rate limiting for alerts
    this.rateLimits = {
      critical: 1000, // 1 second minimum between critical alerts
      major: 3000,    // 3 seconds between major alerts
      moderate: 10000 // 10 seconds between moderate alerts
    };
    
    this.lastAlerts = new Map();
  }

  /**
   * Initialize WebSocket server
   */
  initializeWebSocketServer(server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/alerts',
      perMessageDeflate: false
    });

    this.wss.on('connection', (ws, req) => {
      const sessionId = this.generateSessionId();
      const clientId = req.headers['x-client-id'] || sessionId;
      
      console.log(`🔗 WebSocket client connected: ${clientId}`);
      
      // Store client connection
      this.clients.set(sessionId, {
        ws,
        clientId,
        userId: req.headers['x-user-id'],
        role: req.headers['x-user-role'] || 'guest',
        connectedAt: new Date(),
        lastActivity: new Date(),
        subscriptions: new Set(['interactions', 'alerts'])
      });

      // Send welcome message
      this.sendToClient(sessionId, {
        type: 'connection_established',
        sessionId,
        timestamp: new Date().toISOString(),
        capabilities: ['real_time_alerts', 'interaction_monitoring', 'clinical_notifications']
      });

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(sessionId, message);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
          this.sendError(sessionId, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        console.log(`🔌 WebSocket client disconnected: ${clientId}`);
        this.clients.delete(sessionId);
        this.sessions.delete(sessionId);
        this.alertQueues.delete(sessionId);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
        this.clients.delete(sessionId);
      });

      // Send periodic heartbeat
      this.setupHeartbeat(sessionId);
    });

    console.log('✅ Real-time alert service initialized on WebSocket /ws/alerts');
  }

  /**
   * Handle incoming client messages
   */
  handleClientMessage(sessionId, message) {
    const client = this.clients.get(sessionId);
    if (!client) return;

    client.lastActivity = new Date();

    switch (message.type) {
      case 'subscribe':
        this.handleSubscription(sessionId, message.channels);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscription(sessionId, message.channels);
        break;
        
      case 'analyze_interactions':
        this.handleInteractionAnalysis(sessionId, message.data);
        break;
        
      case 'medication_change':
        this.handleMedicationChange(sessionId, message.data);
        break;
        
      case 'heartbeat':
        this.sendToClient(sessionId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
        
      default:
        console.warn(`Unknown message type: ${message.type}`);
        this.sendError(sessionId, `Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle subscription management
   */
  handleSubscription(sessionId, channels) {
    const client = this.clients.get(sessionId);
    if (!client) return;

    channels.forEach(channel => {
      client.subscriptions.add(channel);
    });

    this.sendToClient(sessionId, {
      type: 'subscription_updated',
      subscriptions: Array.from(client.subscriptions),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle real-time interaction analysis
   */
  async handleInteractionAnalysis(sessionId, data) {
    try {
      const { drugList, patientContext } = data;
      
      // Store session data
      this.sessions.set(sessionId, {
        drugList,
        patientContext,
        lastAnalysis: new Date()
      });

      // Perform AI analysis
      const analysis = await aiRecommendationEngine.analyzeInteractions(drugList, patientContext);
      
      // Send analysis results
      this.sendToClient(sessionId, {
        type: 'analysis_complete',
        data: analysis,
        timestamp: new Date().toISOString()
      });

      // Check for critical alerts
      if (analysis.analysis.riskAssessment.level === 'critical') {
        await this.sendCriticalAlert(sessionId, analysis);
      }

      // Send interaction alerts
      for (const interaction of analysis.analysis.knownInteractions) {
        if (interaction.severity === 'major') {
          await this.sendInteractionAlert(sessionId, interaction, 'MAJOR_INTERACTION');
        }
      }

    } catch (error) {
      console.error('Interaction analysis error:', error);
      this.sendError(sessionId, 'Analysis failed: ' + error.message);
    }
  }

  /**
   * Handle medication change notifications
   */
  async handleMedicationChange(sessionId, data) {
    const { action, medication, reason } = data;
    
    // Log medication change
    console.log(`💊 Medication change: ${action} ${medication} for session ${sessionId}`);

    // Send notification to all relevant clients
    this.sendToClient(sessionId, {
      type: 'medication_change_notification',
      data: {
        action,
        medication,
        reason,
        timestamp: new Date().toISOString()
      }
    });

    // Trigger re-analysis if needed
    const session = this.sessions.get(sessionId);
    if (session) {
      let updatedDrugList = [...session.drugList];
      
      if (action === 'add') {
        updatedDrugList.push(medication);
      } else if (action === 'remove') {
        updatedDrugList = updatedDrugList.filter(drug => drug !== medication);
      }

      // Update session and re-analyze
      session.drugList = updatedDrugList;
      await this.handleInteractionAnalysis(sessionId, {
        drugList: updatedDrugList,
        patientContext: session.patientContext
      });
    }
  }

  /**
   * Send critical alert with high priority
   */
  async sendCriticalAlert(sessionId, analysis) {
    const alertKey = `critical_${sessionId}_${Date.now()}`;
    
    if (this.isRateLimited(sessionId, 'critical')) {
      return;
    }

    const alert = {
      id: alertKey,
      type: 'CRITICAL_INTERACTION',
      priority: this.alertTypes.CRITICAL_INTERACTION.priority,
      title: '🚨 CRITICAL DRUG INTERACTION',
      message: `High-risk interaction detected (Risk Score: ${analysis.analysis.riskAssessment.score})`,
      data: {
        interactions: analysis.analysis.knownInteractions.filter(i => i.severity === 'major'),
        riskScore: analysis.analysis.riskAssessment.score,
        recommendations: analysis.analysis.recommendations.filter(r => r.priority === 'urgent')
      },
      timestamp: new Date().toISOString(),
      requiresAcknowledgment: true,
      sound: this.alertTypes.CRITICAL_INTERACTION.sound,
      color: this.alertTypes.CRITICAL_INTERACTION.color
    };

    await this.sendAlert(sessionId, alert);
    this.updateRateLimit(sessionId, 'critical');
  }

  /**
   * Send interaction-specific alert
   */
  async sendInteractionAlert(sessionId, interaction, alertType) {
    const alertKey = `${alertType}_${sessionId}_${interaction.drugPair.join('_')}`;
    
    if (this.isRateLimited(sessionId, interaction.severity)) {
      return;
    }

    const alert = {
      id: alertKey,
      type: alertType,
      priority: this.alertTypes[alertType].priority,
      title: `${interaction.severity.toUpperCase()} Drug Interaction`,
      message: `${interaction.drugPair.join(' + ')}: ${interaction.effect}`,
      data: {
        interaction,
        management: interaction.management,
        evidenceLevel: interaction.evidence_level
      },
      timestamp: new Date().toISOString(),
      requiresAcknowledgment: interaction.severity === 'major',
      sound: this.alertTypes[alertType].sound,
      color: this.alertTypes[alertType].color
    };

    await this.sendAlert(sessionId, alert);
    this.updateRateLimit(sessionId, interaction.severity);
  }

  /**
   * Send monitoring reminder
   */
  async sendMonitoringReminder(sessionId, monitoringType, details) {
    const alert = {
      id: `monitoring_${sessionId}_${monitoringType}_${Date.now()}`,
      type: 'MONITORING_REMINDER',
      priority: this.alertTypes.MONITORING_REMINDER.priority,
      title: 'Monitoring Reminder',
      message: `${monitoringType} monitoring due`,
      data: details,
      timestamp: new Date().toISOString(),
      requiresAcknowledgment: false,
      sound: this.alertTypes.MONITORING_REMINDER.sound,
      color: this.alertTypes.MONITORING_REMINDER.color
    };

    await this.sendAlert(sessionId, alert);
  }

  /**
   * Send alert to specific client
   */
  async sendAlert(sessionId, alert) {
    const client = this.clients.get(sessionId);
    if (!client || !client.subscriptions.has('alerts')) {
      return;
    }

    // Add to alert queue
    if (!this.alertQueues.has(sessionId)) {
      this.alertQueues.set(sessionId, []);
    }
    
    const queue = this.alertQueues.get(sessionId);
    queue.push(alert);
    
    // Keep only last 50 alerts
    if (queue.length > 50) {
      queue.splice(0, queue.length - 50);
    }

    // Send alert
    this.sendToClient(sessionId, {
      type: 'alert',
      alert,
      queuePosition: queue.length
    });

    // Log alert
    console.log(`🔔 Alert sent to ${sessionId}: ${alert.type} - ${alert.message}`);
  }

  /**
   * Broadcast alert to all connected clients
   */
  broadcastAlert(alert, channelFilter = null) {
    for (const [sessionId, client] of this.clients.entries()) {
      if (channelFilter && !client.subscriptions.has(channelFilter)) {
        continue;
      }
      
      this.sendAlert(sessionId, alert);
    }
  }

  /**
   * Send system-wide notification
   */
  sendSystemNotification(message, level = 'info') {
    const notification = {
      id: `system_${Date.now()}`,
      type: 'SYSTEM_NOTIFICATION',
      level,
      message,
      timestamp: new Date().toISOString()
    };

    this.broadcastAlert(notification, 'system');
  }

  /**
   * Send message to specific client
   */
  sendToClient(sessionId, message) {
    const client = this.clients.get(sessionId);
    if (!client || client.ws.readyState !== 1) { // WebSocket.OPEN = 1
      return false;
    }

    try {
      client.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${sessionId}:`, error);
      this.clients.delete(sessionId);
      return false;
    }
  }

  /**
   * Send error message to client
   */
  sendError(sessionId, message) {
    this.sendToClient(sessionId, {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check rate limiting
   */
  isRateLimited(sessionId, severity) {
    const key = `${sessionId}_${severity}`;
    const lastAlert = this.lastAlerts.get(key);
    
    if (!lastAlert) return false;
    
    const timeSince = Date.now() - lastAlert;
    const limit = this.rateLimits[severity] || this.rateLimits.moderate;
    
    return timeSince < limit;
  }

  /**
   * Update rate limiting timestamp
   */
  updateRateLimit(sessionId, severity) {
    const key = `${sessionId}_${severity}`;
    this.lastAlerts.set(key, Date.now());
  }

  /**
   * Setup heartbeat for client
   */
  setupHeartbeat(sessionId) {
    const interval = setInterval(() => {
      const client = this.clients.get(sessionId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      const timeSinceActivity = Date.now() - client.lastActivity.getTime();
      if (timeSinceActivity > 300000) { // 5 minutes
        console.log(`💔 Client ${sessionId} inactive for 5 minutes, disconnecting`);
        client.ws.close(1001, 'Inactive client');
        clearInterval(interval);
        return;
      }

      this.sendToClient(sessionId, {
        type: 'ping',
        timestamp: new Date().toISOString()
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    const stats = {
      totalConnections: this.clients.size,
      activeConnections: 0,
      connectionsLastHour: 0,
      alertsLastHour: 0,
      topAlertTypes: {}
    };

    const oneHourAgo = Date.now() - 3600000;
    
    for (const client of this.clients.values()) {
      if (client.ws.readyState === 1) {
        stats.activeConnections++;
      }
      
      if (client.connectedAt.getTime() > oneHourAgo) {
        stats.connectionsLastHour++;
      }
    }

    return stats;
  }

  /**
   * Clean up inactive sessions
   */
  cleanup() {
    const cutoff = Date.now() - 3600000; // 1 hour
    
    for (const [sessionId, client] of this.clients.entries()) {
      if (client.lastActivity.getTime() < cutoff) {
        console.log(`🧹 Cleaning up inactive session: ${sessionId}`);
        client.ws.close(1000, 'Session timeout');
        this.clients.delete(sessionId);
        this.sessions.delete(sessionId);
        this.alertQueues.delete(sessionId);
      }
    }

    // Clean up rate limiting cache
    for (const [key, timestamp] of this.lastAlerts.entries()) {
      if (timestamp < cutoff) {
        this.lastAlerts.delete(key);
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, 300000); // Every 5 minutes
  }
}

export default new RealTimeAlertService();