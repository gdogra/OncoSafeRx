import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import enterpriseRBACService from '../services/enterpriseRBACService.js';
import enterpriseMultiTenantService from '../services/enterpriseMultiTenantService.js';

const router = express.Router();

// Middleware to validate tenant access
const validateTenant = asyncHandler(async (req, res, next) => {
  const { tenantId } = req.params;
  const userId = req.user?.id;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant ID is required' });
  }

  try {
    await enterpriseMultiTenantService.validateTenantAccess(userId, tenantId);
    req.tenantId = tenantId;
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

// Get user roles and permissions
router.get('/tenants/:tenantId/users/:userId/roles',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { tenantId } = req;

    // Check permission to view user roles
    const canView = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'admin.user_management'
    );

    if (!canView && req.user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const userRoles = await enterpriseRBACService.getUserRoles(userId, tenantId);
    const userPermissions = await enterpriseRBACService.getUserPermissions(userId, tenantId);

    res.json({
      userId,
      tenantId,
      roles: userRoles.map(r => ({
        name: r.role.name,
        displayName: r.role.displayName || r.role.name,
        level: r.role.level,
        description: r.role.description,
        assignedAt: r.assignment.assignedAt,
        assignedBy: r.assignment.assignedBy,
        expiresAt: r.assignment.expiresAt
      })),
      permissions: Array.from(userPermissions),
      lastUpdated: new Date().toISOString()
    });
  })
);

// Assign role to user
router.post('/tenants/:tenantId/users/:userId/roles',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { tenantId } = req;
    const { roleName, expiresAt, reason, department } = req.body;

    if (!roleName) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const assignment = await enterpriseRBACService.assignUserRole(
      userId,
      tenantId,
      roleName,
      req.user.id,
      { expiresAt, reason, department }
    );

    res.status(201).json({
      success: true,
      assignment: {
        userId: assignment.userId,
        tenantId: assignment.tenantId,
        roleName: assignment.roleName,
        assignedBy: assignment.assignedBy,
        assignedAt: assignment.assignedAt,
        expiresAt: assignment.expiresAt
      }
    });
  })
);

// Revoke role from user
router.delete('/tenants/:tenantId/users/:userId/roles/:roleName',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { userId, roleName } = req.params;
    const { tenantId } = req;
    const { reason } = req.body;

    await enterpriseRBACService.revokeUserRole(
      userId,
      tenantId,
      roleName,
      req.user.id,
      reason
    );

    res.json({
      success: true,
      message: `Role ${roleName} revoked from user ${userId}`
    });
  })
);

// Check user permission
router.get('/tenants/:tenantId/users/:userId/permissions/:permission',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { userId, permission } = req.params;
    const { tenantId } = req;

    // Users can check their own permissions, admins can check any user's permissions
    const canCheck = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'admin.user_management'
    );

    if (!canCheck && req.user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const hasPermission = await enterpriseRBACService.hasPermission(
      userId,
      tenantId,
      permission
    );

    res.json({
      userId,
      tenantId,
      permission,
      hasPermission,
      checkedAt: new Date().toISOString()
    });
  })
);

// Get available roles for tenant
router.get('/tenants/:tenantId/roles',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { tenantId } = req;

    // Check permission to view roles
    const canView = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'admin.role_assignment'
    );

    if (!canView) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const roles = Array.from(enterpriseRBACService.roles.values())
      .filter(role => !role.tenantId || role.tenantId === tenantId)
      .map(role => ({
        name: role.name,
        displayName: role.displayName || role.name,
        level: role.level,
        description: role.description,
        permissions: Array.from(role.permissions),
        isCustom: role.isCustom || false
      }));

    res.json({
      tenantId,
      roles,
      total: roles.length
    });
  })
);

// Create custom role
router.post('/tenants/:tenantId/roles',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { name, displayName, description, permissions, level, inherits } = req.body;

    // Check permission to create roles
    const canCreate = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'admin.role_assignment'
    );

    if (!canCreate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!name || !description || !permissions) {
      return res.status(400).json({ 
        error: 'Name, description, and permissions are required' 
      });
    }

    const customRole = await enterpriseRBACService.createCustomRole(
      tenantId,
      { name, displayName, description, permissions, level, inherits },
      req.user.id
    );

    res.status(201).json({
      success: true,
      role: {
        name: customRole.name,
        displayName: customRole.displayName,
        level: customRole.level,
        description: customRole.description,
        permissions: Array.from(customRole.permissions),
        createdBy: customRole.createdBy,
        createdAt: customRole.createdAt
      }
    });
  })
);

// Get role analytics
router.get('/tenants/:tenantId/analytics/roles',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { tenantId } = req;

    // Check permission to view analytics
    const canView = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'analytics.view'
    );

    if (!canView) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const analytics = await enterpriseRBACService.getRoleAnalytics(tenantId);

    res.json({
      tenantId,
      analytics,
      generatedAt: new Date().toISOString()
    });
  })
);

// Create authenticated session
router.post('/sessions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { tenantId } = req.body;
    const userId = req.user.id;

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    // Validate tenant access
    await enterpriseMultiTenantService.validateTenantAccess(userId, tenantId);

    const { session, token } = await enterpriseRBACService.createSession(
      userId,
      tenantId,
      'jwt'
    );

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        userId: session.userId,
        tenantId: session.tenantId,
        roles: session.roles,
        permissions: session.permissions,
        expiresAt: session.expiresAt
      },
      token
    });
  })
);

// Validate session
router.get('/sessions/:sessionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { permission } = req.query;

    try {
      const session = await enterpriseRBACService.validateSession(sessionId, permission);

      res.json({
        valid: true,
        session: {
          sessionId: session.sessionId,
          userId: session.userId,
          tenantId: session.tenantId,
          roles: session.roles,
          lastActivity: session.lastActivity,
          expiresAt: session.expiresAt
        }
      });
    } catch (error) {
      res.status(401).json({
        valid: false,
        error: error.message
      });
    }
  })
);

// Get all permissions
router.get('/permissions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const permissions = Array.from(enterpriseRBACService.permissions.values())
      .map(permission => ({
        name: permission.name,
        description: permission.description,
        category: permission.category
      }));

    // Group by category
    const permissionsByCategory = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});

    res.json({
      permissions: permissionsByCategory,
      total: permissions.length
    });
  })
);

// Bulk role operations
router.post('/tenants/:tenantId/bulk-operations',
  requireAuth,
  validateTenant,
  asyncHandler(async (req, res) => {
    const { tenantId } = req;
    const { operation, users, roleName, reason } = req.body;

    // Check permission for bulk operations
    const canBulkOperate = await enterpriseRBACService.hasPermission(
      req.user.id, 
      tenantId, 
      'admin.user_management'
    );

    if (!canBulkOperate) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (!operation || !users || !Array.isArray(users)) {
      return res.status(400).json({ 
        error: 'Operation and users array are required' 
      });
    }

    const results = [];

    for (const userId of users) {
      try {
        let result;
        
        if (operation === 'assign') {
          result = await enterpriseRBACService.assignUserRole(
            userId, tenantId, roleName, req.user.id, { reason }
          );
        } else if (operation === 'revoke') {
          result = await enterpriseRBACService.revokeUserRole(
            userId, tenantId, roleName, req.user.id, reason
          );
        }

        results.push({ userId, success: true, result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    res.json({
      operation,
      tenantId,
      roleName,
      results,
      summary: {
        total: users.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  })
);

export default router;