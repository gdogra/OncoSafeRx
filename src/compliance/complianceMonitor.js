/**
 * Comprehensive Compliance Monitoring System
 * HIPAA, FDA, and Clinical Grade Compliance Automation
 */

import cron from 'node-cron';
import supabaseService from '../config/supabase.js';
import auditTrail, { AUDIT_EVENTS, SENSITIVITY_LEVELS } from '../middleware/auditTrail.js';

class ComplianceMonitoringSystem {
  constructor() {
    this.monitoringEnabled = process.env.COMPLIANCE_MONITORING_ENABLED !== 'false';
    this.alertThresholds = {
      phiAccessViolations: 5,        // per hour
      failedLoginAttempts: 10,       // per hour
      systemDowntime: 300,           // 5 minutes
      encryptionFailures: 1,         // any failure is critical
      auditLogGaps: 60,              // 1 minute gap
      unauthorizedAccess: 1,         // any unauthorized access
      dataIntegrityViolations: 1     // any integrity violation
    };
    
    this.complianceScores = {
      hipaa: 0,
      security: 0,
      dataIntegrity: 0,
      availability: 0,
      overall: 0
    };

    this.lastAssessment = null;
    this.alertHistory = [];
  }

  /**
   * Initialize compliance monitoring system
   */
  async initialize() {
    if (!this.monitoringEnabled) {
      console.log('Compliance monitoring disabled');
      return;
    }

    console.log('🔍 Initializing Compliance Monitoring System...');

    // Schedule regular compliance assessments
    this.scheduleComplianceChecks();
    
    // Start real-time monitoring
    await this.startRealTimeMonitoring();
    
    // Initialize dashboard
    await this.initializeComplianceDashboard();

    console.log('✅ Compliance Monitoring System initialized');
  }

  /**
   * Schedule automated compliance checks
   */
  scheduleComplianceChecks() {
    // Real-time monitoring every minute
    cron.schedule('* * * * *', async () => {
      await this.performRealTimeCheck();
    });

    // Hourly comprehensive check
    cron.schedule('0 * * * *', async () => {
      await this.performHourlyAssessment();
    });

    // Daily compliance report
    cron.schedule('0 8 * * *', async () => {
      await this.generateDailyComplianceReport();
    });

    // Weekly comprehensive audit
    cron.schedule('0 9 * * 1', async () => {
      await this.performWeeklyComplianceAudit();
    });

    // Monthly compliance summary
    cron.schedule('0 9 1 * *', async () => {
      await this.generateMonthlyComplianceReport();
    });
  }

  /**
   * Real-time compliance monitoring
   */
  async performRealTimeCheck() {
    try {
      const timestamp = new Date();
      
      // Check critical compliance metrics
      const results = await Promise.all([
        this.checkPHIAccessCompliance(),
        this.checkSecurityIncidents(),
        this.checkSystemAvailability(),
        this.checkDataIntegrity(),
        this.checkAuditTrailContinuity()
      ]);

      // Process results and generate alerts
      await this.processComplianceResults(results, timestamp);

    } catch (error) {
      console.error('Real-time compliance check error:', error);
      await this.generateComplianceAlert({
        type: 'MONITORING_SYSTEM_ERROR',
        severity: 'HIGH',
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  /**
   * Check PHI access compliance
   */
  async checkPHIAccessCompliance() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    try {
      // Query recent PHI access events
      const { data: phiAccess, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .eq('event_type', 'phi_access')
        .gte('timestamp', oneHourAgo.toISOString());

      if (error) throw error;

      // Analyze access patterns
      const analysis = this.analyzePHIAccessPatterns(phiAccess);

      return {
        metric: 'phi_access_compliance',
        status: analysis.violations > this.alertThresholds.phiAccessViolations ? 'VIOLATION' : 'COMPLIANT',
        details: analysis,
        timestamp: new Date()
      };

    } catch (error) {
      return {
        metric: 'phi_access_compliance',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Analyze PHI access patterns for violations
   */
  analyzePHIAccessPatterns(accessEvents) {
    const violations = [];
    const userActivity = {};
    let rapidAccessCount = 0;
    let afterHoursAccess = 0;

    accessEvents.forEach(event => {
      const userId = event.user_id;
      const timestamp = new Date(event.timestamp);
      const hour = timestamp.getHours();

      // Track user activity
      if (!userActivity[userId]) {
        userActivity[userId] = {
          accessCount: 0,
          lastAccess: null,
          rapidAccess: 0
        };
      }

      userActivity[userId].accessCount++;

      // Check for rapid access (>10 accesses in 10 minutes)
      if (userActivity[userId].lastAccess) {
        const timeDiff = timestamp - userActivity[userId].lastAccess;
        if (timeDiff < 10 * 60 * 1000) { // 10 minutes
          userActivity[userId].rapidAccess++;
          if (userActivity[userId].rapidAccess > 10) {
            rapidAccessCount++;
            violations.push({
              type: 'RAPID_PHI_ACCESS',
              userId,
              count: userActivity[userId].rapidAccess,
              timeframe: '10 minutes'
            });
          }
        } else {
          userActivity[userId].rapidAccess = 0;
        }
      }

      userActivity[userId].lastAccess = timestamp;

      // Check for after-hours access (outside 6 AM - 10 PM)
      if (hour < 6 || hour > 22) {
        afterHoursAccess++;
        violations.push({
          type: 'AFTER_HOURS_ACCESS',
          userId,
          timestamp: timestamp.toISOString(),
          hour
        });
      }
    });

    return {
      totalAccess: accessEvents.length,
      uniqueUsers: Object.keys(userActivity).length,
      violations: violations.length,
      violationDetails: violations,
      rapidAccessCount,
      afterHoursAccess,
      complianceScore: Math.max(0, 100 - (violations.length * 10))
    };
  }

  /**
   * Check security incidents
   */
  async checkSecurityIncidents() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    try {
      const { data: incidents, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .eq('event_type', 'security_event')
        .gte('timestamp', oneHourAgo.toISOString());

      if (error) throw error;

      const criticalIncidents = incidents.filter(
        incident => incident.sensitivity_level === 'CRITICAL'
      );

      return {
        metric: 'security_incidents',
        status: criticalIncidents.length > 0 ? 'CRITICAL' : 'COMPLIANT',
        details: {
          totalIncidents: incidents.length,
          criticalIncidents: criticalIncidents.length,
          incidents: incidents.map(inc => ({
            type: inc.additional_data ? JSON.parse(inc.additional_data).event : 'unknown',
            severity: inc.sensitivity_level,
            timestamp: inc.timestamp,
            userId: inc.user_id
          }))
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        metric: 'security_incidents',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check system availability
   */
  async checkSystemAvailability() {
    try {
      const startTime = Date.now();
      
      // Test database connectivity
      const { data, error } = await supabaseService.client
        .from('users')
        .select('count(*)')
        .limit(1);

      const responseTime = Date.now() - startTime;

      if (error) {
        return {
          metric: 'system_availability',
          status: 'DOWN',
          details: { error: error.message, responseTime },
          timestamp: new Date()
        };
      }

      const status = responseTime > 5000 ? 'DEGRADED' : 'AVAILABLE';

      return {
        metric: 'system_availability',
        status,
        details: {
          responseTime,
          threshold: 5000,
          uptime: this.calculateUptime()
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        metric: 'system_availability',
        status: 'DOWN',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Check data integrity
   */
  async checkDataIntegrity() {
    try {
      // Check for recent data integrity violations
      const { data: violations, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .ilike('action', '%INTEGRITY%')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Perform data consistency checks
      const consistencyResults = await this.performDataConsistencyChecks();

      return {
        metric: 'data_integrity',
        status: violations.length > 0 || !consistencyResults.passed ? 'VIOLATION' : 'COMPLIANT',
        details: {
          integrityViolations: violations.length,
          consistencyChecks: consistencyResults,
          violations: violations
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        metric: 'data_integrity',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Perform data consistency checks
   */
  async performDataConsistencyChecks() {
    const checks = [];

    try {
      // Check user-role consistency
      const { data: userRoleCheck } = await supabaseService.client
        .from('users')
        .select('id, role')
        .not('role', 'in', '(patient,provider,admin,super_admin)');

      checks.push({
        name: 'user_role_consistency',
        passed: userRoleCheck.length === 0,
        violations: userRoleCheck.length,
        details: userRoleCheck
      });

      // Check audit trail completeness
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: auditGaps } = await supabaseService.client
        .rpc('check_audit_gaps', { 
          start_time: oneHourAgo.toISOString(),
          max_gap_minutes: 5 
        });

      checks.push({
        name: 'audit_trail_completeness',
        passed: auditGaps.length === 0,
        violations: auditGaps.length,
        details: auditGaps
      });

      return {
        passed: checks.every(check => check.passed),
        checks,
        totalViolations: checks.reduce((sum, check) => sum + check.violations, 0)
      };

    } catch (error) {
      return {
        passed: false,
        error: error.message,
        checks
      };
    }
  }

  /**
   * Check audit trail continuity
   */
  async checkAuditTrailContinuity() {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const { data: recentAudits, error } = await supabaseService.client
        .from('audit_trail')
        .select('timestamp')
        .gte('timestamp', fiveMinutesAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Check for gaps in audit trail
      const gaps = this.findAuditTrailGaps(recentAudits);

      return {
        metric: 'audit_trail_continuity',
        status: gaps.length > 0 ? 'GAP_DETECTED' : 'CONTINUOUS',
        details: {
          recentAudits: recentAudits.length,
          gaps: gaps.length,
          gapDetails: gaps
        },
        timestamp: new Date()
      };

    } catch (error) {
      return {
        metric: 'audit_trail_continuity',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Find gaps in audit trail
   */
  findAuditTrailGaps(audits) {
    const gaps = [];
    const maxGapMinutes = 5;

    for (let i = 0; i < audits.length - 1; i++) {
      const current = new Date(audits[i].timestamp);
      const next = new Date(audits[i + 1].timestamp);
      const gapMinutes = (current - next) / (1000 * 60);

      if (gapMinutes > maxGapMinutes) {
        gaps.push({
          start: next.toISOString(),
          end: current.toISOString(),
          durationMinutes: Math.round(gapMinutes * 100) / 100
        });
      }
    }

    return gaps;
  }

  /**
   * Process compliance results and generate alerts
   */
  async processComplianceResults(results, timestamp) {
    const violations = results.filter(result => 
      ['VIOLATION', 'CRITICAL', 'DOWN', 'GAP_DETECTED'].includes(result.status)
    );

    // Update compliance scores
    await this.updateComplianceScores(results);

    // Generate alerts for violations
    for (const violation of violations) {
      await this.generateComplianceAlert({
        type: violation.metric.toUpperCase(),
        severity: this.getSeverityLevel(violation.status),
        details: violation.details,
        timestamp
      });
    }

    // Store assessment results
    await this.storeAssessmentResults(results, timestamp);
  }

  /**
   * Generate compliance alert
   */
  async generateComplianceAlert(alert) {
    try {
      // Store alert in database
      const { error } = await supabaseService.client
        .from('compliance_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          details: JSON.stringify(alert.details),
          timestamp: alert.timestamp.toISOString(),
          status: 'ACTIVE',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store compliance alert:', error);
      }

      // Add to alert history
      this.alertHistory.push(alert);

      // Send immediate notifications for critical alerts
      if (alert.severity === 'CRITICAL') {
        await this.sendImmediateNotification(alert);
      }

      // Audit the compliance alert
      await auditTrail.createAuditEntry({
        eventType: AUDIT_EVENTS.SECURITY_EVENT,
        action: 'COMPLIANCE_ALERT_GENERATED',
        resourceType: 'compliance',
        resourceId: alert.type,
        sensitivityLevel: SENSITIVITY_LEVELS.HIGH,
        outcome: 'success',
        additionalData: {
          alertType: alert.type,
          severity: alert.severity,
          timestamp: alert.timestamp
        }
      });

    } catch (error) {
      console.error('Compliance alert generation error:', error);
    }
  }

  /**
   * Send immediate notification for critical alerts
   */
  async sendImmediateNotification(alert) {
    // TODO: Implement notification system (email, SMS, Slack, etc.)
    console.error(`🚨 CRITICAL COMPLIANCE ALERT: ${alert.type}`, {
      severity: alert.severity,
      details: alert.details,
      timestamp: alert.timestamp
    });

    // Log to external monitoring system if configured
    if (process.env.EXTERNAL_MONITORING_WEBHOOK) {
      try {
        await fetch(process.env.EXTERNAL_MONITORING_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service: 'OncoSafeRx',
            alert_type: alert.type,
            severity: alert.severity,
            details: alert.details,
            timestamp: alert.timestamp
          })
        });
      } catch (error) {
        console.error('Failed to send external notification:', error);
      }
    }
  }

  /**
   * Update compliance scores
   */
  async updateComplianceScores(results) {
    const scores = {
      hipaa: 0,
      security: 0,
      dataIntegrity: 0,
      availability: 0
    };

    results.forEach(result => {
      let score = 100;
      
      switch (result.status) {
        case 'COMPLIANT':
        case 'AVAILABLE':
        case 'CONTINUOUS':
          score = 100;
          break;
        case 'DEGRADED':
          score = 75;
          break;
        case 'VIOLATION':
        case 'GAP_DETECTED':
          score = 50;
          break;
        case 'CRITICAL':
        case 'DOWN':
          score = 0;
          break;
        case 'ERROR':
          score = 25;
          break;
        default:
          score = 50;
      }

      // Map metrics to compliance areas
      switch (result.metric) {
        case 'phi_access_compliance':
          scores.hipaa = Math.min(scores.hipaa + score / 2, 100);
          break;
        case 'security_incidents':
          scores.security = score;
          break;
        case 'data_integrity':
          scores.dataIntegrity = score;
          scores.hipaa = Math.min(scores.hipaa + score / 2, 100);
          break;
        case 'system_availability':
          scores.availability = score;
          break;
        case 'audit_trail_continuity':
          scores.hipaa = Math.min(scores.hipaa + score / 3, 100);
          scores.security = Math.min(scores.security + score / 3, 100);
          break;
      }
    });

    // Calculate overall score
    const overall = (scores.hipaa + scores.security + scores.dataIntegrity + scores.availability) / 4;

    this.complianceScores = {
      ...scores,
      overall: Math.round(overall)
    };

    // Store scores in database
    await this.storeComplianceScores(this.complianceScores);
  }

  /**
   * Store compliance scores
   */
  async storeComplianceScores(scores) {
    try {
      const { error } = await supabaseService.client
        .from('compliance_scores')
        .insert({
          hipaa_score: scores.hipaa,
          security_score: scores.security,
          data_integrity_score: scores.dataIntegrity,
          availability_score: scores.availability,
          overall_score: scores.overall,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store compliance scores:', error);
      }
    } catch (error) {
      console.error('Compliance score storage error:', error);
    }
  }

  /**
   * Generate daily compliance report
   */
  async generateDailyComplianceReport() {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    try {
      const report = {
        date: today.toISOString().split('T')[0],
        period: {
          start: yesterday.toISOString(),
          end: today.toISOString()
        },
        scores: this.complianceScores,
        summary: await this.generateComplianceSummary(yesterday, today),
        alerts: await this.getAlertsForPeriod(yesterday, today),
        recommendations: await this.generateRecommendations()
      };

      // Store report
      await this.storeComplianceReport(report, 'DAILY');

      // Send report to stakeholders
      await this.distributeComplianceReport(report, 'DAILY');

      return report;

    } catch (error) {
      console.error('Daily compliance report generation error:', error);
      throw error;
    }
  }

  /**
   * Generate compliance summary
   */
  async generateComplianceSummary(startDate, endDate) {
    try {
      const { data: alerts } = await supabaseService.client
        .from('compliance_alerts')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lt('timestamp', endDate.toISOString());

      const { data: phiAccess } = await supabaseService.client
        .from('audit_trail')
        .select('count(*)')
        .eq('event_type', 'phi_access')
        .gte('timestamp', startDate.toISOString())
        .lt('timestamp', endDate.toISOString())
        .single();

      const { data: securityIncidents } = await supabaseService.client
        .from('audit_trail')
        .select('count(*)')
        .eq('event_type', 'security_event')
        .gte('timestamp', startDate.toISOString())
        .lt('timestamp', endDate.toISOString())
        .single();

      return {
        totalAlerts: alerts?.length || 0,
        criticalAlerts: alerts?.filter(a => a.severity === 'CRITICAL').length || 0,
        phiAccessEvents: phiAccess?.count || 0,
        securityIncidents: securityIncidents?.count || 0,
        complianceScore: this.complianceScores.overall,
        trend: await this.calculateComplianceTrend(startDate)
      };

    } catch (error) {
      console.error('Compliance summary generation error:', error);
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        phiAccessEvents: 0,
        securityIncidents: 0,
        complianceScore: 0,
        trend: 'unknown'
      };
    }
  }

  /**
   * Calculate compliance trend
   */
  async calculateComplianceTrend(currentPeriodStart) {
    try {
      const previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000);
      
      const { data: currentScores } = await supabaseService.client
        .from('compliance_scores')
        .select('overall_score')
        .gte('timestamp', currentPeriodStart.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      const { data: previousScores } = await supabaseService.client
        .from('compliance_scores')
        .select('overall_score')
        .gte('timestamp', previousPeriodStart.toISOString())
        .lt('timestamp', currentPeriodStart.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!currentScores || !previousScores) {
        return 'insufficient_data';
      }

      const currentScore = currentScores.overall_score;
      const previousScore = previousScores.overall_score;
      const difference = currentScore - previousScore;

      if (difference > 5) return 'improving';
      if (difference < -5) return 'declining';
      return 'stable';

    } catch (error) {
      console.error('Compliance trend calculation error:', error);
      return 'unknown';
    }
  }

  /**
   * Get severity level for status
   */
  getSeverityLevel(status) {
    switch (status) {
      case 'CRITICAL':
      case 'DOWN':
        return 'CRITICAL';
      case 'VIOLATION':
      case 'GAP_DETECTED':
        return 'HIGH';
      case 'DEGRADED':
        return 'MEDIUM';
      case 'ERROR':
        return 'LOW';
      default:
        return 'LOW';
    }
  }

  /**
   * Calculate system uptime
   */
  calculateUptime() {
    // Simplified uptime calculation - in production, this would be more sophisticated
    const startTime = process.env.SERVICE_START_TIME || Date.now();
    const uptime = Date.now() - startTime;
    return {
      milliseconds: uptime,
      hours: Math.floor(uptime / (1000 * 60 * 60)),
      percentage: 99.9 // This would be calculated from actual downtime data
    };
  }

  /**
   * Store assessment results
   */
  async storeAssessmentResults(results, timestamp) {
    try {
      const { error } = await supabaseService.client
        .from('compliance_assessments')
        .insert({
          timestamp: timestamp.toISOString(),
          results: JSON.stringify(results),
          overall_score: this.complianceScores.overall,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store assessment results:', error);
      }
    } catch (error) {
      console.error('Assessment storage error:', error);
    }
  }

  /**
   * Get current compliance status
   */
  getCurrentComplianceStatus() {
    return {
      scores: this.complianceScores,
      lastAssessment: this.lastAssessment,
      recentAlerts: this.alertHistory.slice(-10),
      systemStatus: {
        monitoring: this.monitoringEnabled,
        uptime: this.calculateUptime()
      }
    };
  }
}

// Export compliance monitoring system
const complianceMonitor = new ComplianceMonitoringSystem();

export default complianceMonitor;
export { ComplianceMonitoringSystem };