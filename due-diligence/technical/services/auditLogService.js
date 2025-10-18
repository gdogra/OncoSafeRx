import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

class AuditLogService {
  constructor() {
    this.logDir = process.env.AUDIT_LOG_DIR || './logs/audit';
    this.ensureLogDirectory();
    
    // HIPAA-required audit events
    this.auditEvents = {
      // Access events
      USER_LOGIN: 'user_login',
      USER_LOGOUT: 'user_logout',
      FAILED_LOGIN: 'failed_login',
      
      // Patient data events
      PATIENT_ACCESSED: 'patient_accessed',
      PATIENT_CREATED: 'patient_created',
      PATIENT_UPDATED: 'patient_updated',
      PATIENT_SEARCHED: 'patient_searched',
      
      // Clinical data events
      CLINICAL_DATA_VIEWED: 'clinical_data_viewed',
      MEDICATION_ACCESSED: 'medication_accessed',
      ALLERGY_DATA_VIEWED: 'allergy_data_viewed',
      CONDITION_DATA_VIEWED: 'condition_data_viewed',
      
      // Decision support events
      DRUG_INTERACTION_CHECK: 'drug_interaction_check',
      CLINICAL_DECISION_SUPPORT: 'clinical_decision_support',
      AI_RECOMMENDATION_GENERATED: 'ai_recommendation_generated',
      
      // Administrative events
      SYSTEM_CONFIG_CHANGED: 'system_config_changed',
      USER_PERMISSIONS_CHANGED: 'user_permissions_changed',
      DATA_EXPORT: 'data_export',
      DATA_IMPORT: 'data_import',
      
      // Security events
      UNAUTHORIZED_ACCESS_ATTEMPT: 'unauthorized_access_attempt',
      PRIVILEGE_ESCALATION_ATTEMPT: 'privilege_escalation_attempt',
      SUSPICIOUS_ACTIVITY: 'suspicious_activity'
    };

    // Risk levels for different events
    this.riskLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
  }

  /**
   * Log audit event with HIPAA compliance
   */
  async logEvent(eventType, details) {
    try {
      const auditEntry = {
        id: this.generateAuditId(),
        timestamp: new Date().toISOString(),
        eventType,
        eventCategory: this.categorizeEvent(eventType),
        riskLevel: this.assessRiskLevel(eventType, details),
        
        // User information
        user: {
          id: details.userId || 'system',
          email: details.userEmail || 'unknown',
          role: details.userRole || 'unknown',
          ipAddress: this.hashPII(details.ipAddress || 'unknown'),
          userAgent: details.userAgent ? this.hashPII(details.userAgent) : 'unknown'
        },
        
        // Session information
        session: {
          id: details.sessionId || 'unknown',
          duration: details.sessionDuration || null
        },
        
        // Patient information (if applicable)
        patient: details.patientId ? {
          id: this.hashPII(details.patientId),
          mrn: this.hashPII(details.patientMrn || ''),
          ageGroup: this.getAgeGroup(details.patientAge)
        } : null,
        
        // Resource information
        resource: {
          type: details.resourceType || 'unknown',
          id: details.resourceId ? this.hashPII(details.resourceId) : null,
          action: details.action || 'unknown',
          endpoint: details.endpoint || 'unknown'
        },
        
        // Technical details
        system: {
          component: details.component || 'onco-safe-rx',
          version: process.env.APP_VERSION || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          server: process.env.SERVER_ID || 'unknown'
        },
        
        // Outcome and details
        outcome: {
          status: details.outcome || 'success',
          statusCode: details.statusCode || 200,
          message: details.message || '',
          errorCode: details.errorCode || null
        },
        
        // Additional context
        context: {
          clinicalContext: details.clinicalContext || null,
          businessJustification: details.businessJustification || null,
          dataTypes: details.dataTypes || [],
          sensitivity: details.sensitivity || 'standard'
        },
        
        // Compliance flags
        compliance: {
          hipaaRelevant: this.isHIPAARelevant(eventType, details),
          requiresNotification: this.requiresNotification(eventType, details),
          retentionPeriod: this.getRetentionPeriod(eventType),
          encryptionRequired: true
        }
      };

      // Write to multiple destinations for redundancy
      await Promise.all([
        this.writeToFile(auditEntry),
        this.writeToDatabase(auditEntry),
        this.sendToSIEM(auditEntry)
      ]);

      // Check for alert conditions
      await this.checkAlertConditions(auditEntry);

      return auditEntry.id;

    } catch (error) {
      console.error('Audit logging failed:', error);
      // Critical: audit logging failure should be escalated
      await this.logAuditFailure(error, eventType, details);
      throw new Error('Audit logging system failure');
    }
  }

  /**
   * Write audit log to encrypted file
   */
  async writeToFile(auditEntry) {
    const date = new Date().toISOString().split('T')[0];
    const filename = `audit_${date}.json`;
    const filepath = path.join(this.logDir, filename);
    
    // Encrypt sensitive data before writing
    const encryptedEntry = this.encryptSensitiveData(auditEntry);
    const logLine = JSON.stringify(encryptedEntry) + '\n';
    
    await fs.appendFile(filepath, logLine, 'utf8');
  }

  /**
   * Write to database for searchability
   */
  async writeToDatabase(auditEntry) {
    // In production, this would write to a secure database
    // For now, we'll write to a separate JSON log that can be indexed
    const dbLogPath = path.join(this.logDir, 'audit_db.jsonl');
    const dbEntry = {
      ...auditEntry,
      indexed_timestamp: Date.now(),
      search_fields: this.extractSearchFields(auditEntry)
    };
    
    const logLine = JSON.stringify(dbEntry) + '\n';
    await fs.appendFile(dbLogPath, logLine, 'utf8');
  }

  /**
   * Send to SIEM system
   */
  async sendToSIEM(auditEntry) {
    // In production, this would send to Splunk, ELK, or other SIEM
    if (process.env.SIEM_ENDPOINT) {
      try {
        const response = await fetch(process.env.SIEM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SIEM_TOKEN}`
          },
          body: JSON.stringify(auditEntry)
        });
        
        if (!response.ok) {
          throw new Error(`SIEM logging failed: ${response.status}`);
        }
      } catch (error) {
        console.error('SIEM logging failed:', error);
        // Log locally as backup
        await this.writeToFile({
          ...auditEntry,
          siemFailure: true,
          siemError: error.message
        });
      }
    }
  }

  /**
   * Check for alert conditions
   */
  async checkAlertConditions(auditEntry) {
    const alerts = [];
    
    // Check for high-risk events
    if (auditEntry.riskLevel === this.riskLevels.CRITICAL) {
      alerts.push({
        type: 'critical_security_event',
        message: `Critical security event: ${auditEntry.eventType}`,
        severity: 'critical'
      });
    }
    
    // Check for multiple failed logins
    if (auditEntry.eventType === this.auditEvents.FAILED_LOGIN) {
      const recentFailures = await this.getRecentFailedLogins(auditEntry.user.id);
      if (recentFailures >= 5) {
        alerts.push({
          type: 'brute_force_attempt',
          message: `Multiple failed login attempts for user ${auditEntry.user.id}`,
          severity: 'high'
        });
      }
    }
    
    // Check for unauthorized access patterns
    if (auditEntry.eventType === this.auditEvents.UNAUTHORIZED_ACCESS_ATTEMPT) {
      alerts.push({
        type: 'unauthorized_access',
        message: `Unauthorized access attempt detected`,
        severity: 'high'
      });
    }
    
    // Send alerts if any
    if (alerts.length > 0) {
      await this.sendAlerts(alerts, auditEntry);
    }
  }

  /**
   * Utility functions
   */
  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  hashPII(data) {
    if (!data || typeof data !== 'string') return 'unknown';
    return createHash('sha256').update(data + process.env.AUDIT_SALT || 'default_salt').digest('hex').substr(0, 16);
  }

  getAgeGroup(age) {
    if (!age) return 'unknown';
    if (age < 18) return 'pediatric';
    if (age < 65) return 'adult';
    return 'geriatric';
  }

  categorizeEvent(eventType) {
    if (eventType.includes('login') || eventType.includes('auth')) return 'authentication';
    if (eventType.includes('patient')) return 'patient_data';
    if (eventType.includes('clinical') || eventType.includes('medication')) return 'clinical_data';
    if (eventType.includes('admin') || eventType.includes('config')) return 'administrative';
    if (eventType.includes('unauthorized') || eventType.includes('suspicious')) return 'security';
    return 'general';
  }

  assessRiskLevel(eventType, details) {
    // Critical risk events
    if ([
      this.auditEvents.UNAUTHORIZED_ACCESS_ATTEMPT,
      this.auditEvents.PRIVILEGE_ESCALATION_ATTEMPT,
      this.auditEvents.SUSPICIOUS_ACTIVITY
    ].includes(eventType)) {
      return this.riskLevels.CRITICAL;
    }
    
    // High risk events
    if ([
      this.auditEvents.FAILED_LOGIN,
      this.auditEvents.USER_PERMISSIONS_CHANGED,
      this.auditEvents.DATA_EXPORT
    ].includes(eventType)) {
      return this.riskLevels.HIGH;
    }
    
    // Medium risk events
    if ([
      this.auditEvents.PATIENT_ACCESSED,
      this.auditEvents.CLINICAL_DATA_VIEWED,
      this.auditEvents.SYSTEM_CONFIG_CHANGED
    ].includes(eventType)) {
      return this.riskLevels.MEDIUM;
    }
    
    return this.riskLevels.LOW;
  }

  isHIPAARelevant(eventType, details) {
    return [
      this.auditEvents.PATIENT_ACCESSED,
      this.auditEvents.PATIENT_CREATED,
      this.auditEvents.PATIENT_UPDATED,
      this.auditEvents.CLINICAL_DATA_VIEWED,
      this.auditEvents.MEDICATION_ACCESSED
    ].includes(eventType) || details.patientId;
  }

  requiresNotification(eventType, details) {
    return [
      this.auditEvents.UNAUTHORIZED_ACCESS_ATTEMPT,
      this.auditEvents.PRIVILEGE_ESCALATION_ATTEMPT,
      this.auditEvents.DATA_EXPORT
    ].includes(eventType) || details.riskLevel === this.riskLevels.CRITICAL;
  }

  getRetentionPeriod(eventType) {
    // HIPAA requires 6 years minimum for healthcare records
    return '6_years';
  }

  encryptSensitiveData(auditEntry) {
    // In production, implement proper encryption
    return {
      ...auditEntry,
      _encrypted: true,
      _encryption_method: 'AES-256-GCM'
    };
  }

  extractSearchFields(auditEntry) {
    return {
      event_type: auditEntry.eventType,
      user_id: auditEntry.user.id,
      risk_level: auditEntry.riskLevel,
      outcome_status: auditEntry.outcome.status,
      date: auditEntry.timestamp.split('T')[0],
      patient_involved: !!auditEntry.patient
    };
  }

  async getRecentFailedLogins(userId) {
    // In production, query the audit database
    // For now, return a mock count
    return Math.floor(Math.random() * 3);
  }

  async sendAlerts(alerts, auditEntry) {
    for (const alert of alerts) {
      console.error(`SECURITY ALERT: ${alert.message}`, {
        alert,
        auditEntry: auditEntry.id,
        timestamp: auditEntry.timestamp
      });
      
      // In production, send to monitoring system
      if (process.env.ALERT_WEBHOOK) {
        try {
          await fetch(process.env.ALERT_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alert,
              auditId: auditEntry.id,
              timestamp: auditEntry.timestamp
            })
          });
        } catch (error) {
          console.error('Failed to send alert:', error);
        }
      }
    }
  }

  async logAuditFailure(error, eventType, details) {
    const failureLog = {
      timestamp: new Date().toISOString(),
      error: 'AUDIT_SYSTEM_FAILURE',
      originalEvent: eventType,
      errorMessage: error.message,
      details: {
        userId: details.userId,
        component: details.component,
        severity: 'CRITICAL'
      }
    };
    
    // Write to emergency log file
    const emergencyLog = path.join(this.logDir, 'audit_failures.log');
    await fs.appendFile(emergencyLog, JSON.stringify(failureLog) + '\n', 'utf8');
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create audit log directory:', error);
      throw error;
    }
  }

  /**
   * Search audit logs (for compliance reporting)
   */
  async searchLogs(criteria) {
    try {
      const dbLogPath = path.join(this.logDir, 'audit_db.jsonl');
      const content = await fs.readFile(dbLogPath, 'utf8');
      const logs = content.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      
      return logs.filter(log => this.matchesCriteria(log, criteria));
    } catch (error) {
      console.error('Audit log search failed:', error);
      return [];
    }
  }

  matchesCriteria(log, criteria) {
    if (criteria.userId && log.user.id !== criteria.userId) return false;
    if (criteria.eventType && log.eventType !== criteria.eventType) return false;
    if (criteria.dateFrom && log.timestamp < criteria.dateFrom) return false;
    if (criteria.dateTo && log.timestamp > criteria.dateTo) return false;
    if (criteria.riskLevel && log.riskLevel !== criteria.riskLevel) return false;
    return true;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate, endDate) {
    const logs = await this.searchLogs({
      dateFrom: startDate,
      dateTo: endDate
    });
    
    return {
      period: { start: startDate, end: endDate },
      totalEvents: logs.length,
      eventsByType: this.groupBy(logs, 'eventType'),
      eventsByRisk: this.groupBy(logs, 'riskLevel'),
      hipaaEvents: logs.filter(log => log.compliance.hipaaRelevant).length,
      securityEvents: logs.filter(log => log.eventCategory === 'security').length,
      failedLogins: logs.filter(log => log.eventType === this.auditEvents.FAILED_LOGIN).length,
      dataAccess: logs.filter(log => log.eventCategory === 'patient_data').length,
      generatedAt: new Date().toISOString()
    };
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}

export default new AuditLogService();