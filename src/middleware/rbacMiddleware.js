import enterpriseRBACService from '../services/enterpriseRBACService.js';
import enterpriseMultiTenantService from '../services/enterpriseMultiTenantService.js';

/**
 * Middleware to check if user has required permission for a tenant
 */
export const requirePermission = (permission, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.params.tenantId || req.body.tenantId || req.headers['x-tenant-id'];

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      // Validate tenant access first
      await enterpriseMultiTenantService.validateTenantAccess(userId, tenantId);

      // Check specific permission
      const hasPermission = await enterpriseRBACService.hasPermission(
        userId, 
        tenantId, 
        permission,
        options.context
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission,
          tenantId
        });
      }

      // Add tenant context to request
      req.tenantId = tenantId;
      req.userPermissions = await enterpriseRBACService.getUserPermissions(userId, tenantId);
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(403).json({ error: error.message });
    }
  };
};

/**
 * Middleware to check if user has any of the required permissions
 */
export const requireAnyPermission = (permissions, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.params.tenantId || req.body.tenantId || req.headers['x-tenant-id'];

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      // Validate tenant access
      await enterpriseMultiTenantService.validateTenantAccess(userId, tenantId);

      // Check if user has any of the required permissions
      let hasAnyPermission = false;
      for (const permission of permissions) {
        const hasPermission = await enterpriseRBACService.hasPermission(
          userId, 
          tenantId, 
          permission,
          options.context
        );
        
        if (hasPermission) {
          hasAnyPermission = true;
          break;
        }
      }

      if (!hasAnyPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          requiredAny: permissions,
          tenantId
        });
      }

      req.tenantId = tenantId;
      req.userPermissions = await enterpriseRBACService.getUserPermissions(userId, tenantId);
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(403).json({ error: error.message });
    }
  };
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (roleName, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.params.tenantId || req.body.tenantId || req.headers['x-tenant-id'];

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      // Get user roles
      const userRoles = await enterpriseRBACService.getUserRoles(userId, tenantId);
      const hasRole = userRoles.some(userRole => userRole.role.name === roleName);

      if (!hasRole) {
        return res.status(403).json({ 
          error: 'Insufficient role privileges',
          required: roleName,
          tenantId
        });
      }

      req.tenantId = tenantId;
      req.userRoles = userRoles;
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(403).json({ error: error.message });
    }
  };
};

/**
 * Middleware to check minimum role level
 */
export const requireMinRoleLevel = (minLevel, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.params.tenantId || req.body.tenantId || req.headers['x-tenant-id'];

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      // Get user roles and check maximum level
      const userRoles = await enterpriseRBACService.getUserRoles(userId, tenantId);
      const maxLevel = Math.max(...userRoles.map(userRole => userRole.role.level));

      if (maxLevel < minLevel) {
        return res.status(403).json({ 
          error: 'Insufficient role level',
          required: minLevel,
          current: maxLevel,
          tenantId
        });
      }

      req.tenantId = tenantId;
      req.userRoles = userRoles;
      req.userMaxRoleLevel = maxLevel;
      
      next();
    } catch (error) {
      console.error('Role level check error:', error);
      res.status(403).json({ error: error.message });
    }
  };
};

/**
 * Middleware to validate session and add RBAC context
 */
export const validateRBACSession = () => {
  return async (req, res, next) => {
    try {
      const sessionId = req.headers['x-session-id'];
      
      if (!sessionId) {
        return next(); // Continue without RBAC context
      }

      const session = await enterpriseRBACService.validateSession(sessionId);
      
      // Add session context to request
      req.rbacSession = session;
      req.tenantId = session.tenantId;
      req.sessionPermissions = session.permissions;
      
      next();
    } catch (error) {
      // Session validation failed, but continue without RBAC context
      console.warn('RBAC session validation failed:', error.message);
      next();
    }
  };
};

/**
 * Resource-based access control middleware
 */
export const requireResourceAccess = (resourceType, options = {}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const tenantId = req.params.tenantId || req.body.tenantId || req.headers['x-tenant-id'];
      const resourceId = req.params.id || req.params.resourceId;

      if (!userId || !tenantId) {
        return res.status(401).json({ error: 'Authentication and tenant required' });
      }

      // Define resource-specific permission mapping
      const resourcePermissions = {
        'patient': {
          'read': 'patient.view',
          'write': 'patient.edit',
          'create': 'patient.create',
          'delete': 'patient.delete'
        },
        'analytics': {
          'read': 'analytics.view',
          'write': 'analytics.create_reports',
          'export': 'analytics.export'
        },
        'admin': {
          'read': 'admin.user_management',
          'write': 'admin.user_management',
          'config': 'admin.system_config'
        }
      };

      const operation = options.operation || req.method.toLowerCase();
      const operationMap = {
        'get': 'read',
        'post': 'create',
        'put': 'write',
        'patch': 'write',
        'delete': 'delete'
      };

      const requiredOperation = operationMap[operation] || 'read';
      const requiredPermission = resourcePermissions[resourceType]?.[requiredOperation];

      if (!requiredPermission) {
        return res.status(400).json({ 
          error: 'Invalid resource type or operation',
          resourceType,
          operation: requiredOperation
        });
      }

      // Check permission
      const hasPermission = await enterpriseRBACService.hasPermission(
        userId, 
        tenantId, 
        requiredPermission,
        { resourceType, resourceId, operation: requiredOperation }
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient resource access',
          resourceType,
          operation: requiredOperation,
          required: requiredPermission
        });
      }

      req.tenantId = tenantId;
      req.resourceAccess = {
        type: resourceType,
        id: resourceId,
        operation: requiredOperation,
        permission: requiredPermission
      };
      
      next();
    } catch (error) {
      console.error('Resource access check error:', error);
      res.status(403).json({ error: error.message });
    }
  };
};

/**
 * Audit logging middleware for RBAC actions
 */
export const auditRBACAction = (action, options = {}) => {
  return (req, res, next) => {
    // Store original res.json to capture response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the RBAC action
      const auditData = {
        action,
        userId: req.user?.id,
        tenantId: req.tenantId,
        resource: req.resourceAccess,
        permissions: req.userPermissions ? Array.from(req.userPermissions) : [],
        roles: req.userRoles?.map(r => r.role.name) || [],
        timestamp: new Date().toISOString(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        statusCode: res.statusCode,
        ...options.metadata
      };

      // Log asynchronously
      setImmediate(() => {
        console.log('RBAC Audit:', JSON.stringify(auditData));
        // In production, this would go to audit logging service
      });

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Multi-tenant data filtering middleware
 */
export const enforceDataIsolation = (options = {}) => {
  return (req, res, next) => {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context required for data access' });
    }

    // Add tenant filter to query parameters
    if (!req.query.tenantId) {
      req.query.tenantId = tenantId;
    }

    // Ensure tenant ID matches
    if (req.query.tenantId !== tenantId) {
      return res.status(403).json({ 
        error: 'Data access violation: tenant mismatch' 
      });
    }

    // Add tenant filter to request body for creation operations
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      req.body.tenantId = tenantId;
    }

    next();
  };
};