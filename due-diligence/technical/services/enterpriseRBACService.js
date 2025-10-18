import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import supabaseService from '../config/supabase.js';

class EnterpriseRBACService {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.userRoles = new Map();
    this.tenantUserCache = new Map();
    this.sessionCache = new Map();
    
    // Enterprise role hierarchy
    this.roleHierarchy = {
      SYSTEM_ADMIN: {
        level: 100,
        inherits: [],
        description: 'Complete system access across all tenants'
      },
      TENANT_ADMIN: {
        level: 90,
        inherits: [],
        description: 'Full administrative access within tenant'
      },
      CLINICAL_DIRECTOR: {
        level: 80,
        inherits: ['ATTENDING_PHYSICIAN'],
        description: 'Clinical oversight and administration'
      },
      ATTENDING_PHYSICIAN: {
        level: 70,
        inherits: ['RESIDENT_PHYSICIAN'],
        description: 'Full clinical decision-making authority'
      },
      RESIDENT_PHYSICIAN: {
        level: 60,
        inherits: ['CLINICAL_USER'],
        description: 'Supervised clinical practice'
      },
      PHARMACIST: {
        level: 55,
        inherits: ['CLINICAL_USER'],
        description: 'Medication management and consultation'
      },
      NURSE_PRACTITIONER: {
        level: 50,
        inherits: ['CLINICAL_USER'],
        description: 'Advanced nursing practice'
      },
      CLINICAL_USER: {
        level: 40,
        inherits: ['BASIC_USER'],
        description: 'General clinical access'
      },
      RESEARCH_USER: {
        level: 35,
        inherits: ['BASIC_USER'],
        description: 'Research and analytics access'
      },
      BASIC_USER: {
        level: 20,
        inherits: [],
        description: 'Limited system access'
      },
      READ_ONLY: {
        level: 10,
        inherits: [],
        description: 'View-only access'
      }
    };

    // Granular permission system
    this.permissionCategories = {
      PATIENT_ACCESS: {
        'patient.view': 'View patient information',
        'patient.edit': 'Edit patient records',
        'patient.create': 'Create new patient records',
        'patient.delete': 'Delete patient records',
        'patient.export': 'Export patient data',
        'patient.merge': 'Merge patient records'
      },
      CLINICAL_OPERATIONS: {
        'clinical.prescribe': 'Prescribe medications',
        'clinical.modify_orders': 'Modify clinical orders',
        'clinical.view_interactions': 'View drug interactions',
        'clinical.override_alerts': 'Override safety alerts',
        'clinical.decision_support': 'Access AI decision support',
        'clinical.genomics': 'Access genomic data'
      },
      ANALYTICS_REPORTING: {
        'analytics.view': 'View analytics dashboards',
        'analytics.export': 'Export analytics data',
        'analytics.create_reports': 'Create custom reports',
        'analytics.population_health': 'Access population health data',
        'analytics.predictive': 'Access predictive models'
      },
      ADMINISTRATIVE: {
        'admin.user_management': 'Manage users',
        'admin.role_assignment': 'Assign roles',
        'admin.system_config': 'Configure system settings',
        'admin.audit_logs': 'Access audit logs',
        'admin.tenant_management': 'Manage tenant settings',
        'admin.billing': 'Access billing information',
        'admin.feedback': 'Manage user feedback and issue creation'
      },
      RESEARCH_DATA: {
        'research.clinical_trials': 'Access clinical trials data',
        'research.population_data': 'Access population research data',
        'research.export_deidentified': 'Export de-identified data',
        'research.genomic_research': 'Access genomic research data'
      },
      QUALITY_ASSURANCE: {
        'qa.quality_metrics': 'View quality metrics',
        'qa.safety_reports': 'Access safety reports',
        'qa.compliance_monitoring': 'Monitor compliance',
        'qa.incident_management': 'Manage quality incidents'
      }
    };

    this.initializeRolesAndPermissions();
    this.lastSeed = {
      tenantId: null,
      idsAssigned: [],
      emailsResolved: [],
      emailsUnresolved: []
    };
    this.seedFromEnv();
  }

  /**
   * Initialize default roles with permissions
   */
  initializeRolesAndPermissions() {
    // Define all permissions
    Object.values(this.permissionCategories).forEach(category => {
      Object.entries(category).forEach(([permission, description]) => {
        this.permissions.set(permission, {
          name: permission,
          description,
          category: this.getCategoryForPermission(permission)
        });
      });
    });

    // Define role permissions
    const rolePermissions = {
      SYSTEM_ADMIN: this.getAllPermissions(),
      
      TENANT_ADMIN: [
        ...this.getPermissionsByCategory('PATIENT_ACCESS'),
        ...this.getPermissionsByCategory('CLINICAL_OPERATIONS'),
        ...this.getPermissionsByCategory('ANALYTICS_REPORTING'),
        'admin.user_management',
        'admin.role_assignment',
        'admin.system_config',
        'admin.audit_logs',
        'admin.tenant_management',
        'admin.feedback',
        ...this.getPermissionsByCategory('QUALITY_ASSURANCE')
      ],
      
      CLINICAL_DIRECTOR: [
        ...this.getPermissionsByCategory('PATIENT_ACCESS'),
        ...this.getPermissionsByCategory('CLINICAL_OPERATIONS'),
        ...this.getPermissionsByCategory('ANALYTICS_REPORTING'),
        'admin.user_management',
        'admin.role_assignment',
        ...this.getPermissionsByCategory('QUALITY_ASSURANCE')
      ],
      
      ATTENDING_PHYSICIAN: [
        'patient.view', 'patient.edit', 'patient.create', 'patient.export',
        ...this.getPermissionsByCategory('CLINICAL_OPERATIONS'),
        'analytics.view', 'analytics.create_reports',
        'research.clinical_trials',
        'qa.quality_metrics', 'qa.safety_reports'
      ],
      
      RESIDENT_PHYSICIAN: [
        'patient.view', 'patient.edit',
        'clinical.prescribe', 'clinical.view_interactions', 'clinical.decision_support',
        'analytics.view',
        'research.clinical_trials'
      ],
      
      PHARMACIST: [
        'patient.view', 'patient.edit',
        'clinical.prescribe', 'clinical.modify_orders', 'clinical.view_interactions',
        'clinical.override_alerts', 'clinical.decision_support', 'clinical.genomics',
        'analytics.view', 'analytics.create_reports',
        'qa.quality_metrics', 'qa.safety_reports'
      ],
      
      NURSE_PRACTITIONER: [
        'patient.view', 'patient.edit',
        'clinical.prescribe', 'clinical.view_interactions', 'clinical.decision_support',
        'analytics.view',
        'qa.quality_metrics'
      ],
      
      CLINICAL_USER: [
        'patient.view',
        'clinical.view_interactions', 'clinical.decision_support',
        'analytics.view'
      ],
      
      RESEARCH_USER: [
        'patient.view',
        'analytics.view', 'analytics.export', 'analytics.population_health',
        ...this.getPermissionsByCategory('RESEARCH_DATA')
      ],
      
      BASIC_USER: [
        'patient.view',
        'clinical.view_interactions',
        'analytics.view'
      ],
      
      READ_ONLY: [
        'patient.view',
        'analytics.view'
      ]
    };

    // Initialize roles
    Object.entries(this.roleHierarchy).forEach(([roleName, roleData]) => {
      this.roles.set(roleName, {
        name: roleName,
        level: roleData.level,
        inherits: roleData.inherits,
        description: roleData.description,
        permissions: new Set(rolePermissions[roleName] || []),
        effectivePermissions: this.calculateEffectivePermissions(roleName, rolePermissions)
      });
    });
  }

  /**
   * Seed default roles for local/dev via env vars
   * RBAC_SEED_TENANT_ID=default
   * RBAC_SEED_TENANT_ADMIN_USER_IDS="uuid1,uuid2"
   */
  seedFromEnv() {
    try {
      const tenantId = process.env.RBAC_SEED_TENANT_ID || 'default';
      const ids = (process.env.RBAC_SEED_TENANT_ADMIN_USER_IDS || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const emails = (process.env.RBAC_SEED_TENANT_ADMIN_EMAILS || '')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

      this.lastSeed = {
        tenantId,
        idsAssigned: [],
        emailsResolved: [],
        emailsUnresolved: []
      };

      const assignId = (userId) => {
        const userKey = `${userId}_${tenantId}`;
        if (!this.userRoles.has(userKey)) this.userRoles.set(userKey, []);
        this.userRoles.get(userKey).push({
          userId,
          tenantId,
          roleName: 'TENANT_ADMIN',
          assignedBy: 'system-seed',
          assignedAt: new Date().toISOString(),
          expiresAt: null,
          conditions: {},
          metadata: { assignmentReason: 'env-seed' }
        });
        this.clearUserCache(userId, tenantId);
        this.lastSeed.idsAssigned.push(userId);
      };

      // Assign by IDs immediately
      ids.forEach(assignId);

      // Assign by emails (best-effort, requires Supabase or user directory)
      if (emails.length > 0) {
        (async () => {
          let resolved = 0;
          for (const email of emails) {
            try {
              const user = await supabaseService.getUserByEmail(email);
              if (user?.id) { assignId(user.id); resolved++; this.lastSeed.emailsResolved.push(email); }
              else { this.lastSeed.emailsUnresolved.push(email); }
            } catch { this.lastSeed.emailsUnresolved.push(email); }
          }
          if (resolved > 0) {
            console.log(`🔐 RBAC seeded TENANT_ADMIN for ${resolved} user(s) by email in tenant '${tenantId}'`);
          }
        })();
      }

      if (ids.length > 0 || emails.length > 0) {
        console.log(`🔐 RBAC seeding requested (tenant='${tenantId}', ids=${ids.length}, emails=${emails.length})`);
      }
    } catch (e) {
      console.warn('RBAC seeding failed:', e?.message || e);
    }
  }

  getSeedStatus() {
    return {
      tenantId: this.lastSeed?.tenantId || null,
      idsAssigned: this.lastSeed?.idsAssigned || [],
      emailsResolved: this.lastSeed?.emailsResolved || [],
      emailsUnresolved: this.lastSeed?.emailsUnresolved || []
    };
  }

  /**
   * Assign role to user within tenant
   */
  async assignUserRole(userId, tenantId, roleName, assignedBy, options = {}) {
    try {
      const role = this.roles.get(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      // Validate assignment permissions
      await this.validateRoleAssignment(assignedBy, tenantId, roleName);

      const assignment = {
        userId,
        tenantId,
        roleName,
        assignedBy,
        assignedAt: new Date().toISOString(),
        expiresAt: options.expiresAt,
        conditions: options.conditions || {},
        metadata: {
          assignmentReason: options.reason,
          department: options.department,
          supervisor: options.supervisor
        }
      };

      // Store assignment
      const userKey = `${userId}_${tenantId}`;
      if (!this.userRoles.has(userKey)) {
        this.userRoles.set(userKey, []);
      }
      this.userRoles.get(userKey).push(assignment);

      // Clear cache
      this.clearUserCache(userId, tenantId);

      // Log assignment
      await this.logRoleChange('role_assigned', assignment);

      return assignment;

    } catch (error) {
      console.error('Error assigning user role:', error);
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId, tenantId, permission, context = {}) {
    try {
      const userPermissions = await this.getUserPermissions(userId, tenantId);
      
      // Check direct permission
      if (userPermissions.has(permission)) {
        return this.evaluatePermissionContext(permission, context);
      }

      return false;

    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get all permissions for user in tenant
   */
  async getUserPermissions(userId, tenantId) {
    const cacheKey = `permissions_${userId}_${tenantId}`;
    
    if (this.tenantUserCache.has(cacheKey)) {
      const cached = this.tenantUserCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 minute cache
        return cached.permissions;
      }
    }

    const userKey = `${userId}_${tenantId}`;
    const assignments = this.userRoles.get(userKey) || [];
    
    const allPermissions = new Set();
    const now = new Date();

    for (const assignment of assignments) {
      // Check if assignment is still valid
      if (assignment.expiresAt && new Date(assignment.expiresAt) < now) {
        continue;
      }

      const role = this.roles.get(assignment.roleName);
      if (role) {
        // Add all effective permissions (including inherited)
        role.effectivePermissions.forEach(permission => {
          allPermissions.add(permission);
        });
      }
    }

    // Cache result
    this.tenantUserCache.set(cacheKey, {
      permissions: allPermissions,
      timestamp: Date.now()
    });

    return allPermissions;
  }

  /**
   * Get user roles in tenant
   */
  async getUserRoles(userId, tenantId) {
    const userKey = `${userId}_${tenantId}`;
    const assignments = this.userRoles.get(userKey) || [];
    
    return assignments
      .filter(assignment => {
        if (assignment.expiresAt) {
          return new Date(assignment.expiresAt) > new Date();
        }
        return true;
      })
      .map(assignment => ({
        role: this.roles.get(assignment.roleName),
        assignment
      }));
  }

  /**
   * Create session with role context
   */
  async createSession(userId, tenantId, authMethod = 'password') {
    try {
      const userRoles = await this.getUserRoles(userId, tenantId);
      const userPermissions = await this.getUserPermissions(userId, tenantId);

      const session = {
        sessionId: this.generateSessionId(),
        userId,
        tenantId,
        roles: userRoles.map(r => r.role.name),
        permissions: Array.from(userPermissions),
        authMethod,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: this.calculateSessionExpiry(userRoles),
        ipAddress: null, // Set by calling service
        userAgent: null  // Set by calling service
      };

      // Store session
      this.sessionCache.set(session.sessionId, session);

      // Generate JWT token
      const token = jwt.sign(
        {
          sessionId: session.sessionId,
          userId,
          tenantId,
          roles: session.roles,
          permissions: session.permissions.slice(0, 50) // Limit token size
        },
        process.env.JWT_SECRET || 'default-secret',
        { 
          expiresIn: '8h',
          issuer: 'oncosaferx-rbac',
          audience: tenantId
        }
      );

      return { session, token };

    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Validate session and permissions
   */
  async validateSession(sessionId, requiredPermission = null) {
    const session = this.sessionCache.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    if (new Date(session.expiresAt) < new Date()) {
      this.sessionCache.delete(sessionId);
      throw new Error('Session expired');
    }

    // Update last activity
    session.lastActivity = new Date().toISOString();

    // Check permission if required
    if (requiredPermission && !session.permissions.includes(requiredPermission)) {
      throw new Error('Insufficient permissions');
    }

    return session;
  }

  /**
   * Revoke user role
   */
  async revokeUserRole(userId, tenantId, roleName, revokedBy, reason) {
    try {
      const userKey = `${userId}_${tenantId}`;
      const assignments = this.userRoles.get(userKey) || [];
      
      const updatedAssignments = assignments.filter(assignment => {
        if (assignment.roleName === roleName) {
          // Log revocation
          this.logRoleChange('role_revoked', {
            ...assignment,
            revokedBy,
            revokedAt: new Date().toISOString(),
            revocationReason: reason
          });
          return false;
        }
        return true;
      });

      this.userRoles.set(userKey, updatedAssignments);
      this.clearUserCache(userId, tenantId);

      return true;

    } catch (error) {
      console.error('Error revoking user role:', error);
      throw new Error(`Failed to revoke role: ${error.message}`);
    }
  }

  /**
   * Create custom role
   */
  async createCustomRole(tenantId, roleData, createdBy) {
    try {
      const roleName = `CUSTOM_${tenantId}_${roleData.name.toUpperCase()}`;
      
      const customRole = {
        name: roleName,
        displayName: roleData.displayName || roleData.name,
        level: roleData.level || 30,
        inherits: roleData.inherits || [],
        description: roleData.description,
        permissions: new Set(roleData.permissions || []),
        tenantId,
        isCustom: true,
        createdBy,
        createdAt: new Date().toISOString()
      };

      // Calculate effective permissions
      customRole.effectivePermissions = this.calculateEffectivePermissions(
        roleName, 
        { [roleName]: Array.from(customRole.permissions) }
      );

      this.roles.set(roleName, customRole);

      return customRole;

    } catch (error) {
      console.error('Error creating custom role:', error);
      throw new Error(`Failed to create custom role: ${error.message}`);
    }
  }

  /**
   * Get role analytics for tenant
   */
  async getRoleAnalytics(tenantId) {
    const analytics = {
      totalUsers: 0,
      roleDistribution: {},
      permissionUsage: {},
      securityMetrics: {
        privilegedUsers: 0,
        expiringSessions: 0,
        failedAttempts: 0
      }
    };

    // Analyze user roles
    for (const [userKey, assignments] of this.userRoles) {
      if (userKey.endsWith(`_${tenantId}`)) {
        analytics.totalUsers++;
        
        assignments.forEach(assignment => {
          const roleName = assignment.roleName;
          analytics.roleDistribution[roleName] = (analytics.roleDistribution[roleName] || 0) + 1;
          
          // Check for privileged roles
          const role = this.roles.get(roleName);
          if (role && role.level >= 70) {
            analytics.securityMetrics.privilegedUsers++;
          }
        });
      }
    }

    return analytics;
  }

  /**
   * Utility functions
   */
  getAllPermissions() {
    return Array.from(this.permissions.keys());
  }

  getPermissionsByCategory(category) {
    return Object.keys(this.permissionCategories[category] || {});
  }

  getCategoryForPermission(permission) {
    for (const [category, permissions] of Object.entries(this.permissionCategories)) {
      if (permissions[permission]) {
        return category;
      }
    }
    return 'UNKNOWN';
  }

  calculateEffectivePermissions(roleName, rolePermissions) {
    const role = this.roleHierarchy[roleName];
    if (!role) return new Set();

    const effective = new Set(rolePermissions[roleName] || []);
    
    // Add inherited permissions
    role.inherits.forEach(inheritedRole => {
      const inheritedPermissions = this.calculateEffectivePermissions(inheritedRole, rolePermissions);
      inheritedPermissions.forEach(permission => effective.add(permission));
    });

    return effective;
  }

  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  calculateSessionExpiry(userRoles) {
    // Base expiry of 8 hours
    let expiryHours = 8;
    
    // Extend for higher privilege roles
    const maxLevel = Math.max(...userRoles.map(r => r.role.level));
    if (maxLevel >= 80) expiryHours = 12; // Directors and above
    if (maxLevel >= 90) expiryHours = 24; // Admins

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);
    return expiry.toISOString();
  }

  async validateRoleAssignment(assignerId, tenantId, targetRole) {
    const assignerPermissions = await this.getUserPermissions(assignerId, tenantId);
    
    if (!assignerPermissions.has('admin.role_assignment')) {
      throw new Error('Insufficient permissions to assign roles');
    }

    // Prevent privilege escalation
    const assignerRoles = await this.getUserRoles(assignerId, tenantId);
    const assignerMaxLevel = Math.max(...assignerRoles.map(r => r.role.level));
    const targetRoleLevel = this.roleHierarchy[targetRole]?.level || 0;

    if (targetRoleLevel >= assignerMaxLevel) {
      throw new Error('Cannot assign role with equal or higher privileges');
    }
  }

  evaluatePermissionContext(permission, context) {
    // Add context-based permission evaluation
    // For example, time-based restrictions, location-based access, etc.
    return true;
  }

  clearUserCache(userId, tenantId) {
    const cacheKey = `permissions_${userId}_${tenantId}`;
    this.tenantUserCache.delete(cacheKey);
  }

  async logRoleChange(action, data) {
    // Integration with audit logging service
    console.log(`RBAC ${action}:`, data);
  }
}

export default new EnterpriseRBACService();
