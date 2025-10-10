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
    const recentSyncLogs = await supabaseService.client?.from('data_sync_log')
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

// User management - create new user
router.post('/users', asyncHandler(async (req, res) => {
  try {
    const { email, full_name, role = 'user', institution, specialty, password } = req.body;
    
    // Validate required fields
    if (!email || !full_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: email and full_name are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate role
    const validRoles = ['admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles 
      });
    }

    // Check if user already exists
    const users = await supabaseService.getAllUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const userData = {
      email: email.toLowerCase(),
      full_name,
      role,
      institution: institution || null,
      specialty: specialty || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Create user in Supabase auth if password provided
    if (password && supabaseService.enabled && supabaseService.client?.auth?.admin) {
      try {
        const { data: authUser, error: authError } = await supabaseService.client.auth.admin.createUser({
          email: userData.email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: userData.role,
            institution: userData.institution,
            specialty: userData.specialty
          }
        });

        if (authError) throw authError;
        userData.id = authUser.user.id;
      } catch (authError) {
        console.error('Auth user creation failed:', authError);
        return res.status(500).json({ 
          error: 'Failed to create user authentication: ' + authError.message 
        });
      }
    }

    const newUser = await supabaseService.createUser(userData);
    const { password_hash, ...userResponse } = newUser;
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: userResponse 
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}));

// User management - update user
router.put('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, full_name, role, institution, specialty, is_active } = req.body;

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: 'Invalid role',
          validRoles 
        });
      }
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Check if user exists
    const users = await supabaseService.getAllUsers();
    const existingUser = users.find(u => u.id === userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for email conflicts (if email is being changed)
    if (email && email.toLowerCase() !== existingUser.email.toLowerCase()) {
      const emailConflict = users.find(u => u.id !== userId && u.email.toLowerCase() === email.toLowerCase());
      if (emailConflict) {
        return res.status(409).json({ error: 'Email already in use by another user' });
      }
    }

    const updateData = {};
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (institution !== undefined) updateData.institution = institution;
    if (specialty !== undefined) updateData.specialty = specialty;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update auth metadata if email or other auth fields changed
    if ((email || full_name || role) && supabaseService.enabled && supabaseService.client?.auth?.admin) {
      try {
        const authUpdate = {};
        if (email) authUpdate.email = email;
        if (full_name || role || institution || specialty) {
          authUpdate.user_metadata = {
            ...existingUser,
            full_name: full_name || existingUser.full_name,
            role: role || existingUser.role,
            institution: institution !== undefined ? institution : existingUser.institution,
            specialty: specialty !== undefined ? specialty : existingUser.specialty
          };
        }

        const { error: authError } = await supabaseService.client.auth.admin.updateUserById(userId, authUpdate);
        if (authError) {
          console.error('Auth update failed:', authError);
          // Continue with profile update even if auth update fails
        }
      } catch (authError) {
        console.error('Auth update error:', authError);
      }
    }

    const updatedUser = await supabaseService.updateUser(userId, updateData);
    const { password_hash, ...userResponse } = updatedUser;
    
    res.json({ 
      message: 'User updated successfully',
      user: userResponse 
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}));

// User management - delete user
router.delete('/users/:userId', asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const users = await supabaseService.getAllUsers();
    const existingUser = users.find(u => u.id === userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user && req.user.id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prevent deleting the last admin
    const adminUsers = users.filter(u => u.role === 'admin' && u.is_active && u.id !== userId);
    if (existingUser.role === 'admin' && adminUsers.length === 0) {
      return res.status(400).json({ 
        error: 'Cannot delete the last admin user. Promote another user to admin first.' 
      });
    }

    const result = await supabaseService.deleteUser(userId);
    
    res.json({ 
      message: 'User deleted successfully',
      user: result.user 
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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

    // Real implementation would query data_sync_log table
    const logs = await supabaseService.client?.from('data_sync_log')
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
        data = await supabaseService.client?.from('data_sync_log')
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
