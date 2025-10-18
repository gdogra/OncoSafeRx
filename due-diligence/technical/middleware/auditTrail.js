/**
 * Comprehensive Audit Trail System for HIPAA Compliance
 * Tracks all access to Protected Health Information (PHI)
 */

import supabaseService from '../config/supabase.js';

// Audit event types for healthcare compliance
const AUDIT_EVENTS = {
  PHI_ACCESS: 'phi_access',
  PHI_CREATE: 'phi_create', 
  PHI_UPDATE: 'phi_update',
  PHI_DELETE: 'phi_delete',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ADMIN_ACTION: 'admin_action',
  SECURITY_EVENT: 'security_event',
  DATA_EXPORT: 'data_export',
  SYSTEM_ACCESS: 'system_access'
};

// Sensitivity levels for audit events
const SENSITIVITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

class AuditTrailService {
  constructor() {
    this.enabled = process.env.AUDIT_TRAIL_ENABLED !== 'false';
    this.retentionPeriod = parseInt(process.env.AUDIT_RETENTION_DAYS) || 2555; // 7 years default for HIPAA
  }

  /**
   * Create comprehensive audit entry
   */
  async createAuditEntry({
    eventType,
    userId,
    userEmail,
    action,
    resourceType,
    resourceId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
    sessionId,
    sensitivityLevel = SENSITIVITY_LEVELS.MEDIUM,
    outcome = 'success',
    errorMessage = null,
    additionalData = {}
  }) {
    if (!this.enabled) {
      return;
    }

    try {
      const auditEntry = {
        id: crypto.randomUUID(),
        event_type: eventType,
        user_id: userId,
        user_email: userEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_id: sessionId,
        sensitivity_level: sensitivityLevel,
        outcome,
        error_message: errorMessage,
        additional_data: JSON.stringify(additionalData),
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      // Store in secure audit table
      const { error } = await supabaseService.client
        .from('audit_trail')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to create audit entry:', error);
        // CRITICAL: Audit failure should not break the application
        // but should be monitored for compliance
      }

      // For critical events, also log to external audit system
      if (sensitivityLevel === SENSITIVITY_LEVELS.CRITICAL) {
        await this.logToCriticalAuditSystem(auditEntry);
      }

    } catch (error) {
      console.error('Audit trail creation error:', error);
      // Continue operation - audit failure shouldn't break app
    }
  }

  /**
   * Log critical events to external audit system
   */
  async logToCriticalAuditSystem(auditEntry) {
    // TODO: Implement integration with external SIEM or audit system
    console.warn('CRITICAL AUDIT EVENT:', {
      event: auditEntry.event_type,
      user: auditEntry.user_email,
      timestamp: auditEntry.timestamp,
      resource: `${auditEntry.resource_type}/${auditEntry.resource_id}`
    });
  }

  /**
   * Middleware for automatic audit trail creation
   */
  createAuditMiddleware(eventType, resourceType, sensitivityLevel = SENSITIVITY_LEVELS.MEDIUM) {
    return async (req, res, next) => {
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Create audit entry after successful operation
        setImmediate(async () => {
          try {
            await auditTrail.createAuditEntry({
              eventType,
              userId: req.user?.id,
              userEmail: req.user?.email,
              action: req.method,
              resourceType,
              resourceId: req.params.id || req.body?.id,
              oldValues: req.auditOldValues,
              newValues: req.method !== 'GET' ? req.body : null,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              sessionId: req.sessionID,
              sensitivityLevel,
              outcome: res.statusCode < 400 ? 'success' : 'failure',
              additionalData: {
                endpoint: req.originalUrl,
                method: req.method,
                statusCode: res.statusCode
              }
            });
          } catch (error) {
            console.error('Audit middleware error:', error);
          }
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * PHI access audit specifically for HIPAA compliance
   */
  async auditPHIAccess(req, resourceType, resourceId, accessLevel = 'read') {
    await this.createAuditEntry({
      eventType: AUDIT_EVENTS.PHI_ACCESS,
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: accessLevel.toUpperCase(),
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: req.sessionID,
      sensitivityLevel: SENSITIVITY_LEVELS.HIGH,
      additionalData: {
        accessLevel,
        endpoint: req.originalUrl,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Security event audit for failed authentication, suspicious activity
   */
  async auditSecurityEvent(event, severity, details, req = null) {
    await this.createAuditEntry({
      eventType: AUDIT_EVENTS.SECURITY_EVENT,
      userId: req?.user?.id,
      userEmail: req?.user?.email,
      action: 'SECURITY_EVENT',
      resourceType: 'security',
      resourceId: null,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent'],
      sessionId: req?.sessionID,
      sensitivityLevel: severity,
      outcome: 'security_event',
      additionalData: {
        event,
        details,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Export singleton instance
const auditTrail = new AuditTrailService();

// Middleware functions
export const auditPHIAccess = (resourceType, sensitivityLevel = SENSITIVITY_LEVELS.HIGH) => {
  return auditTrail.createAuditMiddleware(AUDIT_EVENTS.PHI_ACCESS, resourceType, sensitivityLevel);
};

export const auditAdminAction = (resourceType) => {
  return auditTrail.createAuditMiddleware(AUDIT_EVENTS.ADMIN_ACTION, resourceType, SENSITIVITY_LEVELS.CRITICAL);
};

export const auditUserAction = (resourceType) => {
  return auditTrail.createAuditMiddleware(AUDIT_EVENTS.SYSTEM_ACCESS, resourceType, SENSITIVITY_LEVELS.MEDIUM);
};

export { auditTrail, AUDIT_EVENTS, SENSITIVITY_LEVELS };
export default auditTrail;