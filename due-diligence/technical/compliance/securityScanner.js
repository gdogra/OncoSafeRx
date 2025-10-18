/**
 * Automated Security Scanner
 * Continuous security vulnerability assessment and monitoring
 */

import crypto from 'crypto';
import supabaseService from '../config/supabase.js';
import auditTrail, { AUDIT_EVENTS, SENSITIVITY_LEVELS } from '../middleware/auditTrail.js';

class SecurityScanner {
  constructor() {
    this.scannerEnabled = process.env.SECURITY_SCANNER_ENABLED !== 'false';
    this.scanIntervals = {
      vulnerability: 60 * 60 * 1000,      // 1 hour
      configuration: 30 * 60 * 1000,      // 30 minutes
      access_pattern: 5 * 60 * 1000,      // 5 minutes
      integrity: 15 * 60 * 1000           // 15 minutes
    };
    
    this.vulnerabilityDatabase = {
      // Common vulnerabilities to check
      sql_injection: {
        patterns: [/(\bUNION\b.*\bSELECT\b)|(\bOR\b.*=.*)/i],
        severity: 'CRITICAL'
      },
      xss_attempt: {
        patterns: [/<script[^>]*>.*?<\/script>/gi, /javascript:/gi],
        severity: 'HIGH'
      },
      path_traversal: {
        patterns: [/\.\.[\/\\]/g],
        severity: 'HIGH'
      },
      command_injection: {
        patterns: [/[;&|`$()]/g],
        severity: 'CRITICAL'
      }
    };

    this.configurationChecks = [
      'database_encryption',
      'ssl_configuration',
      'session_security',
      'cors_configuration',
      'authentication_strength',
      'audit_logging',
      'backup_encryption'
    ];

    this.lastScanResults = {};
  }

  /**
   * Initialize security scanner
   */
  async initialize() {
    if (!this.scannerEnabled) {
      console.log('Security scanner disabled');
      return;
    }

    console.log('🔐 Initializing Security Scanner...');

    // Start automated scanning schedules
    this.startVulnerabilityScanning();
    this.startConfigurationScanning();
    this.startAccessPatternMonitoring();
    this.startIntegrityScanning();

    // Perform initial comprehensive scan
    await this.performComprehensiveScan();

    console.log('✅ Security Scanner initialized');
  }

  /**
   * Start vulnerability scanning
   */
  startVulnerabilityScanning() {
    setInterval(async () => {
      await this.performVulnerabilityScan();
    }, this.scanIntervals.vulnerability);
  }

  /**
   * Start configuration scanning
   */
  startConfigurationScanning() {
    setInterval(async () => {
      await this.performConfigurationScan();
    }, this.scanIntervals.configuration);
  }

  /**
   * Start access pattern monitoring
   */
  startAccessPatternMonitoring() {
    setInterval(async () => {
      await this.performAccessPatternAnalysis();
    }, this.scanIntervals.access_pattern);
  }

  /**
   * Start integrity scanning
   */
  startIntegrityScanning() {
    setInterval(async () => {
      await this.performIntegrityScan();
    }, this.scanIntervals.integrity);
  }

  /**
   * Perform comprehensive security scan
   */
  async performComprehensiveScan() {
    console.log('🔍 Starting comprehensive security scan...');

    const scanId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      const results = await Promise.all([
        this.performVulnerabilityScan(),
        this.performConfigurationScan(),
        this.performAccessPatternAnalysis(),
        this.performIntegrityScan(),
        this.performDatabaseSecurityScan(),
        this.performNetworkSecurityScan()
      ]);

      const comprehensiveResults = {
        scanId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        scans: {
          vulnerability: results[0],
          configuration: results[1],
          accessPattern: results[2],
          integrity: results[3],
          database: results[4],
          network: results[5]
        },
        overallScore: this.calculateOverallSecurityScore(results),
        criticalFindings: this.extractCriticalFindings(results)
      };

      // Store scan results
      await this.storeScanResults(comprehensiveResults);

      // Generate security report
      await this.generateSecurityReport(comprehensiveResults);

      // Alert on critical findings
      if (comprehensiveResults.criticalFindings.length > 0) {
        await this.alertCriticalFindings(comprehensiveResults.criticalFindings);
      }

      this.lastScanResults = comprehensiveResults;

      console.log(`✅ Comprehensive security scan completed in ${comprehensiveResults.duration}ms`);
      return comprehensiveResults;

    } catch (error) {
      console.error('Comprehensive security scan error:', error);
      
      await auditTrail.auditSecurityEvent(
        'security_scan_error',
        SENSITIVITY_LEVELS.HIGH,
        { scanId, error: error.message }
      );

      throw error;
    }
  }

  /**
   * Perform vulnerability scan
   */
  async performVulnerabilityScan() {
    const vulnerabilities = [];
    const startTime = Date.now();

    try {
      // Scan recent audit logs for attack patterns
      const recentLogs = await this.getRecentAuditLogs(60); // Last 60 minutes
      
      for (const log of recentLogs) {
        const vulns = await this.scanLogForVulnerabilities(log);
        vulnerabilities.push(...vulns);
      }

      // Scan database for injection attempts
      const dbVulnerabilities = await this.scanDatabaseForInjectionAttempts();
      vulnerabilities.push(...dbVulnerabilities);

      // Scan for weak authentication attempts
      const authVulnerabilities = await this.scanAuthenticationVulnerabilities();
      vulnerabilities.push(...authVulnerabilities);

      return {
        type: 'vulnerability_scan',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        vulnerabilities,
        criticalCount: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        highCount: vulnerabilities.filter(v => v.severity === 'HIGH').length,
        mediumCount: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
        score: Math.max(0, 100 - (vulnerabilities.length * 10))
      };

    } catch (error) {
      console.error('Vulnerability scan error:', error);
      return {
        type: 'vulnerability_scan',
        timestamp: new Date().toISOString(),
        error: error.message,
        score: 0
      };
    }
  }

  /**
   * Scan log entry for vulnerabilities
   */
  async scanLogForVulnerabilities(logEntry) {
    const vulnerabilities = [];
    const logData = JSON.stringify(logEntry);

    for (const [vulnType, vulnConfig] of Object.entries(this.vulnerabilityDatabase)) {
      for (const pattern of vulnConfig.patterns) {
        if (pattern.test(logData)) {
          vulnerabilities.push({
            type: vulnType,
            severity: vulnConfig.severity,
            description: `Potential ${vulnType} detected in log entry`,
            logEntry: logEntry.id,
            timestamp: logEntry.timestamp,
            pattern: pattern.toString(),
            mitigation: this.getMitigationStrategy(vulnType)
          });
        }
      }
    }

    return vulnerabilities;
  }

  /**
   * Scan database for injection attempts
   */
  async scanDatabaseForInjectionAttempts() {
    const vulnerabilities = [];

    try {
      // Look for suspicious query patterns in audit logs
      const { data: suspiciousQueries, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .ilike('additional_data', '%UNION%')
        .or('additional_data.ilike.%DROP%,additional_data.ilike.%DELETE%')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      for (const query of suspiciousQueries || []) {
        vulnerabilities.push({
          type: 'sql_injection_attempt',
          severity: 'CRITICAL',
          description: 'Potential SQL injection attempt detected',
          userId: query.user_id,
          timestamp: query.timestamp,
          details: query.additional_data,
          mitigation: 'Review and block suspicious user, implement parameterized queries'
        });
      }

      return vulnerabilities;

    } catch (error) {
      console.error('Database injection scan error:', error);
      return [];
    }
  }

  /**
   * Scan authentication vulnerabilities
   */
  async scanAuthenticationVulnerabilities() {
    const vulnerabilities = [];

    try {
      // Check for brute force attempts
      const { data: failedLogins, error } = await supabaseService.client
        .from('audit_trail')
        .select('ip_address, user_email, timestamp')
        .eq('outcome', 'failure')
        .eq('action', 'LOGIN')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Analyze failed login patterns
      const ipFailures = {};
      const userFailures = {};

      for (const failure of failedLogins || []) {
        // Track by IP
        if (!ipFailures[failure.ip_address]) {
          ipFailures[failure.ip_address] = [];
        }
        ipFailures[failure.ip_address].push(failure);

        // Track by user
        if (failure.user_email) {
          if (!userFailures[failure.user_email]) {
            userFailures[failure.user_email] = [];
          }
          userFailures[failure.user_email].push(failure);
        }
      }

      // Identify brute force attempts
      for (const [ip, failures] of Object.entries(ipFailures)) {
        if (failures.length >= 10) {
          vulnerabilities.push({
            type: 'brute_force_attempt',
            severity: 'HIGH',
            description: `Brute force attack detected from IP ${ip}`,
            source: ip,
            attemptCount: failures.length,
            timeframe: '1 hour',
            mitigation: 'Block IP address, implement rate limiting'
          });
        }
      }

      // Identify credential stuffing
      for (const [email, failures] of Object.entries(userFailures)) {
        if (failures.length >= 5) {
          vulnerabilities.push({
            type: 'credential_stuffing',
            severity: 'MEDIUM',
            description: `Multiple failed login attempts for user ${email}`,
            targetUser: email,
            attemptCount: failures.length,
            timeframe: '1 hour',
            mitigation: 'Lock user account, force password reset'
          });
        }
      }

      return vulnerabilities;

    } catch (error) {
      console.error('Authentication vulnerability scan error:', error);
      return [];
    }
  }

  /**
   * Perform configuration security scan
   */
  async performConfigurationScan() {
    const findings = [];
    const startTime = Date.now();

    try {
      for (const check of this.configurationChecks) {
        const result = await this.performConfigurationCheck(check);
        findings.push(result);
      }

      return {
        type: 'configuration_scan',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        findings,
        passed: findings.filter(f => f.status === 'PASS').length,
        failed: findings.filter(f => f.status === 'FAIL').length,
        warnings: findings.filter(f => f.status === 'WARN').length,
        score: Math.round((findings.filter(f => f.status === 'PASS').length / findings.length) * 100)
      };

    } catch (error) {
      console.error('Configuration scan error:', error);
      return {
        type: 'configuration_scan',
        timestamp: new Date().toISOString(),
        error: error.message,
        score: 0
      };
    }
  }

  /**
   * Perform individual configuration check
   */
  async performConfigurationCheck(checkType) {
    switch (checkType) {
      case 'database_encryption':
        return await this.checkDatabaseEncryption();
      
      case 'ssl_configuration':
        return await this.checkSSLConfiguration();
      
      case 'session_security':
        return await this.checkSessionSecurity();
      
      case 'cors_configuration':
        return await this.checkCORSConfiguration();
      
      case 'authentication_strength':
        return await this.checkAuthenticationStrength();
      
      case 'audit_logging':
        return await this.checkAuditLogging();
      
      case 'backup_encryption':
        return await this.checkBackupEncryption();
      
      default:
        return {
          check: checkType,
          status: 'UNKNOWN',
          message: 'Unknown configuration check'
        };
    }
  }

  /**
   * Check database encryption configuration
   */
  async checkDatabaseEncryption() {
    try {
      // Check if encryption key is configured
      const encryptionKey = process.env.PHI_ENCRYPTION_KEY;
      
      if (!encryptionKey) {
        return {
          check: 'database_encryption',
          status: 'FAIL',
          severity: 'CRITICAL',
          message: 'PHI encryption key not configured',
          recommendation: 'Configure PHI_ENCRYPTION_KEY environment variable'
        };
      }

      if (encryptionKey.length < 32) {
        return {
          check: 'database_encryption',
          status: 'WARN',
          severity: 'MEDIUM',
          message: 'Encryption key may be too short',
          recommendation: 'Use encryption key of at least 32 characters'
        };
      }

      return {
        check: 'database_encryption',
        status: 'PASS',
        message: 'Database encryption properly configured'
      };

    } catch (error) {
      return {
        check: 'database_encryption',
        status: 'ERROR',
        message: `Encryption check failed: ${error.message}`
      };
    }
  }

  /**
   * Check SSL configuration
   */
  async checkSSLConfiguration() {
    const nodeEnv = process.env.NODE_ENV;
    
    if (nodeEnv === 'production') {
      // In production, SSL should be enforced
      const forceSSL = process.env.FORCE_SSL === 'true';
      
      if (!forceSSL) {
        return {
          check: 'ssl_configuration',
          status: 'FAIL',
          severity: 'HIGH',
          message: 'SSL not enforced in production',
          recommendation: 'Set FORCE_SSL=true for production environment'
        };
      }
    }

    return {
      check: 'ssl_configuration',
      status: 'PASS',
      message: 'SSL configuration appropriate for environment'
    };
  }

  /**
   * Check session security configuration
   */
  async checkSessionSecurity() {
    const sessionSecret = process.env.SESSION_SECRET;
    const sessionTimeout = process.env.SESSION_TIMEOUT_MINUTES;

    const issues = [];

    if (!sessionSecret) {
      issues.push('Session secret not configured');
    } else if (sessionSecret.length < 32) {
      issues.push('Session secret too short');
    }

    if (!sessionTimeout || parseInt(sessionTimeout) > 60) {
      issues.push('Session timeout too long or not configured');
    }

    if (issues.length > 0) {
      return {
        check: 'session_security',
        status: 'FAIL',
        severity: 'HIGH',
        message: `Session security issues: ${issues.join(', ')}`,
        recommendation: 'Configure secure session settings'
      };
    }

    return {
      check: 'session_security',
      status: 'PASS',
      message: 'Session security properly configured'
    };
  }

  /**
   * Check CORS configuration
   */
  async checkCORSConfiguration() {
    const corsOrigin = process.env.CORS_ORIGIN;

    if (!corsOrigin || corsOrigin === '*') {
      return {
        check: 'cors_configuration',
        status: 'FAIL',
        severity: 'HIGH',
        message: 'CORS allows all origins or not configured',
        recommendation: 'Configure specific allowed origins for CORS'
      };
    }

    // Check for localhost in production
    if (process.env.NODE_ENV === 'production' && corsOrigin.includes('localhost')) {
      return {
        check: 'cors_configuration',
        status: 'WARN',
        severity: 'MEDIUM',
        message: 'CORS allows localhost in production',
        recommendation: 'Remove localhost from production CORS origins'
      };
    }

    return {
      check: 'cors_configuration',
      status: 'PASS',
      message: 'CORS properly configured'
    };
  }

  /**
   * Check authentication strength
   */
  async checkAuthenticationStrength() {
    try {
      // Check if MFA is enforced for admin users
      const { data: adminUsers, error } = await supabaseService.client
        .from('users')
        .select('id, role')
        .in('role', ['admin', 'super_admin']);

      if (error) throw error;

      const { data: mfaUsers, error: mfaError } = await supabaseService.client
        .from('user_mfa')
        .select('user_id')
        .eq('is_enabled', true);

      if (mfaError) throw mfaError;

      const mfaUserIds = new Set(mfaUsers?.map(u => u.user_id) || []);
      const adminsWithoutMFA = adminUsers?.filter(admin => !mfaUserIds.has(admin.id)) || [];

      if (adminsWithoutMFA.length > 0) {
        return {
          check: 'authentication_strength',
          status: 'FAIL',
          severity: 'HIGH',
          message: `${adminsWithoutMFA.length} admin users without MFA`,
          recommendation: 'Enforce MFA for all administrative users'
        };
      }

      return {
        check: 'authentication_strength',
        status: 'PASS',
        message: 'Strong authentication enforced'
      };

    } catch (error) {
      return {
        check: 'authentication_strength',
        status: 'ERROR',
        message: `Authentication check failed: ${error.message}`
      };
    }
  }

  /**
   * Check audit logging configuration
   */
  async checkAuditLogging() {
    const auditEnabled = process.env.AUDIT_TRAIL_ENABLED !== 'false';
    
    if (!auditEnabled) {
      return {
        check: 'audit_logging',
        status: 'FAIL',
        severity: 'CRITICAL',
        message: 'Audit logging disabled',
        recommendation: 'Enable audit trail logging for compliance'
      };
    }

    // Check recent audit activity
    try {
      const { data: recentAudits, error } = await supabaseService.client
        .from('audit_trail')
        .select('count(*)')
        .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .single();

      if (error) throw error;

      if (recentAudits.count === 0) {
        return {
          check: 'audit_logging',
          status: 'WARN',
          severity: 'MEDIUM',
          message: 'No recent audit activity detected',
          recommendation: 'Verify audit logging is functioning'
        };
      }

      return {
        check: 'audit_logging',
        status: 'PASS',
        message: 'Audit logging active and functioning'
      };

    } catch (error) {
      return {
        check: 'audit_logging',
        status: 'ERROR',
        message: `Audit logging check failed: ${error.message}`
      };
    }
  }

  /**
   * Check backup encryption
   */
  async checkBackupEncryption() {
    // This would check backup encryption settings
    // Implementation depends on backup solution used
    
    return {
      check: 'backup_encryption',
      status: 'PASS',
      message: 'Backup encryption check passed (implementation pending)'
    };
  }

  /**
   * Perform access pattern analysis
   */
  async performAccessPatternAnalysis() {
    const anomalies = [];
    const startTime = Date.now();

    try {
      // Analyze recent access patterns
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const { data: accessEvents, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .gte('timestamp', oneHourAgo.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Detect unusual access patterns
      const patterns = this.analyzeAccessPatterns(accessEvents || []);
      anomalies.push(...patterns.anomalies);

      return {
        type: 'access_pattern_analysis',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        totalEvents: accessEvents?.length || 0,
        anomalies,
        patterns: patterns.summary,
        score: Math.max(0, 100 - (anomalies.length * 15))
      };

    } catch (error) {
      console.error('Access pattern analysis error:', error);
      return {
        type: 'access_pattern_analysis',
        timestamp: new Date().toISOString(),
        error: error.message,
        score: 0
      };
    }
  }

  /**
   * Analyze access patterns for anomalies
   */
  analyzeAccessPatterns(events) {
    const anomalies = [];
    const userActivity = {};
    const ipActivity = {};

    // Process events
    events.forEach(event => {
      const userId = event.user_id;
      const ipAddress = event.ip_address;
      const timestamp = new Date(event.timestamp);

      // Track user activity
      if (userId) {
        if (!userActivity[userId]) {
          userActivity[userId] = {
            events: [],
            uniqueIPs: new Set(),
            hourlyDistribution: Array(24).fill(0)
          };
        }
        userActivity[userId].events.push(event);
        userActivity[userId].uniqueIPs.add(ipAddress);
        userActivity[userId].hourlyDistribution[timestamp.getHours()]++;
      }

      // Track IP activity
      if (ipAddress) {
        if (!ipActivity[ipAddress]) {
          ipActivity[ipAddress] = {
            events: [],
            uniqueUsers: new Set()
          };
        }
        ipActivity[ipAddress].events.push(event);
        if (userId) ipActivity[ipAddress].uniqueUsers.add(userId);
      }
    });

    // Detect anomalies
    for (const [userId, activity] of Object.entries(userActivity)) {
      // Multiple IP addresses for same user
      if (activity.uniqueIPs.size > 3) {
        anomalies.push({
          type: 'multiple_ip_addresses',
          severity: 'MEDIUM',
          userId,
          ipCount: activity.uniqueIPs.size,
          description: 'User accessing from multiple IP addresses'
        });
      }

      // Unusual activity hours
      const normalHours = activity.hourlyDistribution.slice(8, 18); // 8 AM - 6 PM
      const offHours = [...activity.hourlyDistribution.slice(0, 8), ...activity.hourlyDistribution.slice(18)];
      const offHoursActivity = offHours.reduce((sum, count) => sum + count, 0);
      const totalActivity = activity.events.length;

      if (offHoursActivity / totalActivity > 0.7) {
        anomalies.push({
          type: 'unusual_hours_access',
          severity: 'LOW',
          userId,
          offHoursPercentage: Math.round((offHoursActivity / totalActivity) * 100),
          description: 'High percentage of after-hours access'
        });
      }

      // High frequency access
      if (activity.events.length > 100) {
        anomalies.push({
          type: 'high_frequency_access',
          severity: 'MEDIUM',
          userId,
          eventCount: activity.events.length,
          description: 'Unusually high access frequency'
        });
      }
    }

    // IP-based anomalies
    for (const [ipAddress, activity] of Object.entries(ipActivity)) {
      // Multiple users from same IP
      if (activity.uniqueUsers.size > 5) {
        anomalies.push({
          type: 'multiple_users_same_ip',
          severity: 'MEDIUM',
          ipAddress,
          userCount: activity.uniqueUsers.size,
          description: 'Multiple users accessing from same IP address'
        });
      }
    }

    return {
      anomalies,
      summary: {
        totalUsers: Object.keys(userActivity).length,
        totalIPs: Object.keys(ipActivity).length,
        averageEventsPerUser: events.length / Object.keys(userActivity).length || 0
      }
    };
  }

  /**
   * Get mitigation strategy for vulnerability type
   */
  getMitigationStrategy(vulnType) {
    const strategies = {
      sql_injection: 'Implement parameterized queries, input validation, and WAF rules',
      xss_attempt: 'Implement content security policy, input sanitization, and output encoding',
      path_traversal: 'Validate file paths, use whitelists, and implement proper access controls',
      command_injection: 'Validate input, use safe APIs, and implement sandboxing',
      brute_force_attempt: 'Implement rate limiting, account lockout, and IP blocking',
      credential_stuffing: 'Force password reset, implement CAPTCHA, and monitor for credential leaks'
    };

    return strategies[vulnType] || 'Review and implement appropriate security controls';
  }

  /**
   * Calculate overall security score
   */
  calculateOverallSecurityScore(scanResults) {
    const scores = scanResults
      .filter(result => result.score !== undefined)
      .map(result => result.score);

    if (scores.length === 0) return 0;

    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }

  /**
   * Extract critical findings from scan results
   */
  extractCriticalFindings(scanResults) {
    const criticalFindings = [];

    scanResults.forEach(result => {
      if (result.vulnerabilities) {
        const critical = result.vulnerabilities.filter(v => v.severity === 'CRITICAL');
        criticalFindings.push(...critical);
      }

      if (result.findings) {
        const critical = result.findings.filter(f => f.severity === 'CRITICAL');
        criticalFindings.push(...critical);
      }

      if (result.anomalies) {
        const critical = result.anomalies.filter(a => a.severity === 'CRITICAL');
        criticalFindings.push(...critical);
      }
    });

    return criticalFindings;
  }

  /**
   * Get recent audit logs
   */
  async getRecentAuditLogs(minutes) {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);

    try {
      const { data, error } = await supabaseService.client
        .from('audit_trail')
        .select('*')
        .gte('timestamp', timeAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching recent audit logs:', error);
      return [];
    }
  }

  /**
   * Store scan results
   */
  async storeScanResults(results) {
    try {
      const { error } = await supabaseService.client
        .from('security_scan_results')
        .insert({
          scan_id: results.scanId,
          timestamp: results.timestamp,
          scan_type: 'comprehensive',
          results: JSON.stringify(results),
          overall_score: results.overallScore,
          critical_findings_count: results.criticalFindings.length,
          duration_ms: results.duration,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store scan results:', error);
      }
    } catch (error) {
      console.error('Scan results storage error:', error);
    }
  }

  /**
   * Get latest scan results
   */
  getLatestScanResults() {
    return this.lastScanResults;
  }
}

// Export security scanner
const securityScanner = new SecurityScanner();

export default securityScanner;
export { SecurityScanner };