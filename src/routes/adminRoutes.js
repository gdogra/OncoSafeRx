import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import supabaseService from '../config/supabase.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import enterpriseRBACService from '../services/enterpriseRBACService.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard overview - get system stats
router.get('/dashboard', asyncHandler(async (req, res) => {
  try {
    // Get user statistics
    const users = await supabaseService.getAllUsers();
    const userStats = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length,
      byRole: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {})
    };

    // Get recent activity from sync logs (if available)
    const recentSyncLogs = await supabaseService.client?.from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5) || [];

    // System health checks
    const systemHealth = {
      supabase: supabaseService.enabled,
      timestamp: new Date().toISOString()
    };

    res.json({
      message: 'Admin dashboard data',
      stats: {
        users: userStats,
        system: systemHealth,
        recentActivity: recentSyncLogs
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}));

// User management - get all users with pagination
router.get('/users', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const offset = (page - 1) * limit;

    let users = await supabaseService.getAllUsers();
    
    // Filter by role if specified
    if (role) {
      users = users.filter(user => user.role === role);
    }
    
    // Filter by status if specified
    if (status === 'active') {
      users = users.filter(user => user.is_active);
    } else if (status === 'inactive') {
      users = users.filter(user => !user.is_active);
    }

    // Apply pagination
    const total = users.length;
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    // Remove sensitive data
    const sanitizedUsers = paginatedUsers.map(user => {
      const { password_hash, ...userResponse } = user;
      return userResponse;
    });

    res.json({
      users: sanitizedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}));

// User management - get single user details
router.get('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    
    // For the no-op service, we'll simulate finding a user
    if (!supabaseService.enabled) {
      return res.json({
        user: {
          id: userId,
          email: 'demo@example.com',
          full_name: 'Demo User',
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        }
      });
    }

    // In a real implementation, you'd fetch user by ID
    const users = await supabaseService.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash, ...userResponse } = user;
    res.json({ user: userResponse });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
}));

// System logs and monitoring
router.get('/logs', asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 50, type } = req.query;
    
    if (!supabaseService.enabled) {
      // Return mock logs for demo
      const mockLogs = [
        {
          id: '1',
          sync_type: 'rxnorm_update',
          status: 'completed',
          records_processed: 1250,
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: '2',
          sync_type: 'cpic_guidelines',
          status: 'completed',
          records_processed: 45,
          started_at: new Date(Date.now() - 7200000).toISOString(),
          completed_at: new Date(Date.now() - 7100000).toISOString()
        }
      ];

      return res.json({
        logs: mockLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: mockLogs.length,
          pages: 1
        }
      });
    }

    // Real implementation would query sync_logs table
    const logs = await supabaseService.client?.from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1) || [];

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: logs.length,
        pages: Math.ceil(logs.length / limit)
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
}));

// Data management - trigger data sync operations
router.post('/sync/:type', asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['rxnorm', 'cpic', 'trials'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid sync type',
        validTypes 
      });
    }

    // Log the sync activity
    const syncLog = await supabaseService.logSyncActivity({
      sync_type: type,
      status: 'started',
      records_processed: 0,
      started_at: new Date().toISOString()
    });

    // In a real implementation, you would trigger the actual sync process
    // For now, we'll simulate a successful sync
    setTimeout(async () => {
      await supabaseService.updateSyncStatus(syncLog.id, {
        status: 'completed',
        records_processed: Math.floor(Math.random() * 1000) + 100,
        completed_at: new Date().toISOString()
      });
    }, 1000);

    res.json({
      message: `${type} sync initiated`,
      syncId: syncLog.id,
      status: 'started'
    });

  } catch (error) {
    console.error('Sync initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate sync operation' });
  }
}));

// System configuration

// RBAC seed status preview
router.get('/rbac/seed-status', asyncHandler(async (req, res) => {
  try {
    const status = enterpriseRBACService.getSeedStatus();
    res.json({
      tenantId: status.tenantId,
      idsAssigned: status.idsAssigned,
      emailsResolved: status.emailsResolved,
      emailsUnresolved: status.emailsUnresolved,
      totalAssigned: status.idsAssigned.length,
      totalResolved: status.emailsResolved.length,
      totalUnresolved: status.emailsUnresolved.length
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get RBAC seed status' });
  }
}));

// Deployment status (Netlify + Render)
router.get('/deploy/status', asyncHandler(async (req, res) => {
  const result = { netlify: null, render: null, warnings: [] };
  // Netlify
  try {
    const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
    const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;
    if (NETLIFY_TOKEN && NETLIFY_SITE_ID) {
      const resp = await fetch(`https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys?per_page=1`, {
        headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
      });
      if (resp.ok) {
        const arr = await resp.json();
        result.netlify = Array.isArray(arr) && arr.length ? arr[0] : null;
      } else {
        result.warnings.push(`netlify_http_${resp.status}`);
      }
    } else {
      result.warnings.push('netlify_not_configured');
    }
  } catch (e) {
    result.warnings.push('netlify_fetch_error');
  }
  // Render
  try {
    const RENDER_KEY = process.env.RENDER_API_KEY;
    const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;
    if (RENDER_KEY && RENDER_SERVICE_ID) {
      const resp = await fetch(`https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys?limit=1`, {
        headers: { Authorization: `Bearer ${RENDER_KEY}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        // Render returns an array or object depending on endpoint; accommodate both
        result.render = Array.isArray(data) ? (data[0] || null) : (data?.deploys?.[0] || data || null);
      } else {
        result.warnings.push(`render_http_${resp.status}`);
      }
    } else {
      result.warnings.push('render_not_configured');
    }
  } catch (e) {
    result.warnings.push('render_fetch_error');
  }
  res.json(result);
}));
router.get('/config', asyncHandler(async (req, res) => {
  try {
    const config = {
      database: {
        enabled: supabaseService.enabled,
        type: supabaseService.enabled ? 'supabase' : 'no-op'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000
      },
      features: {
        rateLimiting: true,
        cors: process.env.CORS_ORIGIN || '*',
        serveFrontend: process.env.SERVE_FRONTEND !== 'false'
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      message: 'System configuration',
      config
    });

  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ error: 'Failed to fetch system configuration' });
  }
}));

// Export data
router.get('/export/:type', asyncHandler(async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;
    
    const validTypes = ['users', 'logs', 'stats'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid export type',
        validTypes 
      });
    }

    let data;
    let filename;

    switch (type) {
      case 'users':
        const users = await supabaseService.getAllUsers();
        data = users.map(({ password_hash, ...user }) => user);
        filename = `users_export_${new Date().toISOString().split('T')[0]}.json`;
        break;
      
      case 'logs':
        data = await supabaseService.client?.from('sync_logs')
          .select('*')
          .order('created_at', { ascending: false }) || [];
        filename = `logs_export_${new Date().toISOString().split('T')[0]}.json`;
        break;
      
      case 'stats':
        const allUsers = await supabaseService.getAllUsers();
        data = {
          userCount: allUsers.length,
          activeUsers: allUsers.filter(u => u.is_active).length,
          roleDistribution: allUsers.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}),
          exportedAt: new Date().toISOString()
        };
        filename = `stats_export_${new Date().toISOString().split('T')[0]}.json`;
        break;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json(data);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
}));

export default router;
