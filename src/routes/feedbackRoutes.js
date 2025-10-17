import express from 'express';
import { validate, schemas } from '../utils/validation.js';
import supabaseService from '../config/supabase.js';
import { githubIssueService } from '../services/githubIssueService.js';
import { authenticateToken } from '../middleware/auth.js';
import enterpriseRBACService from '../services/enterpriseRBACService.js';

const router = express.Router();

// In-memory storage for demo (in production, use a proper database)
let feedbackStorage = [];
let ticketCounter = 1;

// Fine-grained permission guard for feedback admin
async function feedbackAdminGuard(req, res, next) {
  try {
    const tenantId = req.headers['x-tenant-id'] || 'default';
    const userId = req.user?.id;
    // Prefer RBAC permission, fallback to role === 'admin'
    let allowed = false;
    if (userId) {
      allowed = await enterpriseRBACService.hasPermission(userId, tenantId, 'admin.feedback');
    }
    if (!allowed && req.user?.role === 'admin') {
      allowed = true;
    }
    if (!allowed) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    return next();
  } catch (e) {
    console.error('Feedback admin guard error:', e);
    return res.status(500).json({ error: 'Permission check failed' });
  }
}

// Protect all admin routes with token + permission
router.use('/admin', authenticateToken, feedbackAdminGuard);

// One-time in-memory → Supabase migration (best-effort)
let feedbackMemoryMigrated = false;
let feedbackMemoryMigratedCount = 0;
async function migrateMemoryToSupabase(force = false) {
  if (feedbackMemoryMigrated && !force) return { inserted: 0, ran: true };
  feedbackMemoryMigratedCount = 0;
  try {
    if (!supabaseService?.enabled || typeof supabaseService.listAllFeedback !== 'function' || typeof supabaseService.insertFeedback !== 'function') {
      return { inserted: 0, ran: false };
    }
    const existing = await supabaseService.listAllFeedback();
    const existingIds = new Set(Array.isArray(existing) ? existing.map(f => f.id) : []);
    const toInsert = feedbackStorage.filter(f => !existingIds.has(f.id));
    for (const fb of toInsert) {
      try { await supabaseService.insertFeedback(fb); feedbackMemoryMigratedCount++; } catch {}
    }
    feedbackMemoryMigrated = true;
    if (feedbackMemoryMigratedCount > 0) {
      console.log(`⬆️ Migrated ${feedbackMemoryMigratedCount} feedback items from memory to Supabase`);
    }
    return { inserted: feedbackMemoryMigratedCount, ran: true };
  } catch (e) {
    console.warn('Feedback memory migration skipped:', e?.message || e);
    return { inserted: 0, ran: false };
  }
}
// Attempt migration shortly after module load
setTimeout(() => { migrateMemoryToSupabase(); }, 1000);

// Classify feedback into ticket categories
const classifyFeedback = (feedback) => {
  const { type, description, title } = feedback;
  
  // Simple classification logic (can be enhanced with ML)
  const keywords = {
    critical: ['crash', 'error', 'broken', 'not working', 'critical', 'urgent', 'production'],
    high: ['important', 'blocking', 'cannot', 'issue', 'problem', 'bug'],
    medium: ['improve', 'better', 'enhance', 'slow', 'minor'],
    low: ['suggestion', 'nice to have', 'cosmetic', 'polish']
  };
  
  const text = `${title} ${description}`.toLowerCase();
  
  // Determine priority
  let priority = 'medium';
  for (const [level, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      priority = level;
      break;
    }
  }
  
  // Map type to category
  const categoryMap = {
    'bug': 'ui_ux',
    'feature_request': 'clinical_decision_support',
    'improvement': 'ui_ux',
    'performance_issue': 'performance',
    'security_concern': 'security',
    'integration_issue': 'integration',
    'usability_issue': 'ui_ux'
  };
  
  const category = categoryMap[type] || 'general';
  
  // Estimate effort based on type and priority
  const effortMap = {
    'critical': { bug: 'l', feature_request: 'xl', improvement: 'm' },
    'high': { bug: 'm', feature_request: 'l', improvement: 's' },
    'medium': { bug: 's', feature_request: 'm', improvement: 'xs' },
    'low': { bug: 'xs', feature_request: 's', improvement: 'xs' }
  };
  
  const estimatedEffort = effortMap[priority]?.[type] || 'm';
  
  // Generate labels
  const labels = [type, priority];
  if (text.includes('mobile')) labels.push('mobile');
  if (text.includes('drug') || text.includes('medication')) labels.push('drugs');
  if (text.includes('patient')) labels.push('patient-data');
  
  return {
    type,
    category,
    priority,
    estimatedEffort,
    labels,
    confidence: 0.85,
    reasoning: `Classified as ${type} with ${priority} priority based on keywords and content analysis`
  };
};

// Submit feedback
router.post('/submit', async (req, res) => {
  try {
    const feedback = req.body;
    
    // Generate unique ID and timestamp
    const feedbackItem = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...feedback,
      timestamp: new Date().toISOString(),
      sessionId: req.sessionID || `session_${Date.now()}`,
      status: 'new',
      votes: 0,
      url: req.headers.referer || '',
      userAgent: req.headers['user-agent'] || ''
    };
    
    // Classify the feedback
    const classification = classifyFeedback(feedbackItem);
    feedbackItem.type = classification.type;
    feedbackItem.category = classification.category;
    feedbackItem.priority = classification.priority;
    feedbackItem.estimatedEffort = classification.estimatedEffort;
    feedbackItem.labels = classification.labels;
    
    // Add metadata
    feedbackItem.metadata = {
      ...feedbackItem.metadata,
      classification,
      ticketNumber: `ONCO-${ticketCounter++}`,
      autoClassified: true
    };
    
    // Store feedback in memory
    feedbackStorage.push(feedbackItem);

    // Persist to Supabase if available
    (async () => {
      try {
        if (supabaseService?.enabled && typeof supabaseService.insertFeedback === 'function') {
          await supabaseService.insertFeedback(feedbackItem);
        }
      } catch (e) {
        console.warn('Supabase insert feedback failed (fallback to memory ok):', e?.message || e);
      }
    })();
    
    // Optionally create a GitHub issue immediately if configured
    try {
      const autoCreate = String(process.env.FEEDBACK_AUTO_CREATE_ISSUES || '').toLowerCase() === 'true';
      if (autoCreate && githubIssueService.isEnabled()) {
        const issueInput = githubIssueService.formatIssueFromFeedback(feedbackItem);
        const issue = await githubIssueService.createIssue(issueInput);
        feedbackItem.metadata.githubIssue = {
          number: issue.number,
          url: issue.html_url,
          created_at: issue.created_at
        };
        console.log(`📌 Created GitHub issue #${issue.number} for ${feedbackItem.metadata.ticketNumber}`);
      }
    } catch (e) {
      console.warn('GitHub auto-create failed:', e?.message || e);
    }
    
    const APP_DEBUG = String(process.env.APP_DEBUG || '').toLowerCase() === 'true';
    if (APP_DEBUG || String(process.env.FEEDBACK_DEBUG || '').toLowerCase() === 'true') {
      console.log('📝 Feedback submitted:', {
        id: feedbackItem.id,
        type: feedbackItem.type,
        priority: feedbackItem.priority,
        ticket: feedbackItem.metadata.ticketNumber
      });
    }
    
    res.json({
      success: true,
      id: feedbackItem.id,
      ticketNumber: feedbackItem.metadata.ticketNumber,
      classification
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedback (admin only)
router.get('/admin/all', (req, res) => {
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const priority = req.query.priority;
    const type = req.query.type;

    const trySupabase = async () => {
      if (supabaseService?.enabled && typeof supabaseService.listFeedback === 'function') {
        const result = await supabaseService.listFeedback({ page, limit, status, priority, type });
        if (result) return result;
      }
      return null;
    };

    (async () => {
      const supa = await trySupabase();
      if (supa) return res.json(supa);

      // Fallback to in-memory
      let filtered = [...feedbackStorage];
      if (status) filtered = filtered.filter(item => item.status === status);
      if (priority) filtered = filtered.filter(item => item.priority === priority);
      if (type) filtered = filtered.filter(item => item.type === type);
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filtered.slice(startIndex, endIndex);
      res.json({
        feedback: paginatedItems,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit)
      });
    })().catch((e) => {
      console.error('Error fetching feedback (admin/all):', e);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    });
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback analytics (admin only)
router.get('/admin/analytics', (req, res) => {
  
  try {
    const compute = (feedback) => {
      // Calculate analytics
      const analytics = {
        totalFeedback: feedback.length,
        totalTickets: feedback.filter(f => f.status !== 'closed').length,
        byType: {},
        byPriority: {},
        byStatus: {},
        byCategory: {},
        recentFeedback: [...feedback]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10),
        sprintPlan: {
          currentSprint: feedback.filter(f => f.status === 'in_sprint'),
          nextSprint: feedback.filter(f => f.status === 'in_backlog').slice(0, 10),
          backlog: feedback.filter(f => f.status === 'triaged' || f.status === 'new')
        },
        last30Days: feedback.filter(f => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(f.timestamp) >= thirtyDaysAgo;
        }).length
      };

      ['type', 'priority', 'status', 'category'].forEach(field => {
        const distribution = {};
        feedback.forEach(item => {
          const value = item[field];
          distribution[value] = (distribution[value] || 0) + 1;
        });
        analytics[`by${field.charAt(0).toUpperCase() + field.slice(1)}`] = distribution;
      });
      return analytics;
    };

    const trySupabase = async () => {
      if (supabaseService?.enabled && typeof supabaseService.listAllFeedback === 'function') {
        const all = await supabaseService.listAllFeedback();
        if (Array.isArray(all)) return compute(all);
      }
      return null;
    };

    (async () => {
      const analytics = await trySupabase();
      if (analytics) return res.json(analytics);
      // Fallback to in-memory
      return res.json(compute(feedbackStorage));
    })().catch((e) => {
      console.error('Error generating analytics:', e);
      res.status(500).json({ error: 'Failed to generate analytics' });
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Update feedback status (admin only)
router.patch('/admin/:id/status', (req, res) => {
  
  try {
    const { id } = req.params;
    const { status, assignee, sprintTarget } = req.body;
    
    const feedbackIndex = feedbackStorage.findIndex(f => f.id === id);
    if (feedbackIndex === -1) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Update feedback
    feedbackStorage[feedbackIndex] = {
      ...feedbackStorage[feedbackIndex],
      status,
      assignee,
      sprintTarget,
      lastUpdated: new Date().toISOString()
    };

    // Persist to Supabase if available
    (async () => {
      try {
        if (supabaseService?.enabled && typeof supabaseService.updateFeedbackStatus === 'function') {
          await supabaseService.updateFeedbackStatus(id, { status, assignee, sprintTarget });
        }
      } catch (e) {
        console.warn('Supabase update status failed (memory updated):', e?.message || e);
      }
    })();
    
    res.json({ success: true, feedback: feedbackStorage[feedbackIndex] });
    
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// Create GitHub issue from feedback (admin only)
router.post('/admin/:id/create-issue', async (req, res) => {
  
  try {
    const { id } = req.params;
    const feedback = feedbackStorage.find(f => f.id === id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    if (!githubIssueService.isEnabled()) {
      return res.status(400).json({ error: 'GitHub not configured on server' });
    }

    const input = githubIssueService.formatIssueFromFeedback(feedback);
    const issue = await githubIssueService.createIssue(input);

    const feedbackIndex = feedbackStorage.findIndex(f => f.id === id);
    feedbackStorage[feedbackIndex].metadata.githubIssue = {
      number: issue.number,
      url: issue.html_url,
      created_at: issue.created_at
    };

    res.json({ 
      success: true, 
      issueUrl: issue.html_url,
      issueNumber: issue.number,
      feedback: feedbackStorage[feedbackIndex]
    });
  
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    res.status(500).json({ error: 'Failed to create GitHub issue' });
  }
});

// Export feedback data (admin only)
router.get('/admin/export', (req, res) => {
  
  try {
    const exportData = {
      exported_at: new Date().toISOString(),
      version: '1.0',
      total_feedback: feedbackStorage.length,
      feedback: feedbackStorage
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="oncosaferx-feedback-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);
    
  } catch (error) {
    console.error('Error exporting feedback:', error);
    res.status(500).json({ error: 'Failed to export feedback' });
  }
});

// Get feedback statistics for dashboard
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalSubmissions: feedbackStorage.length,
      activeTickets: feedbackStorage.filter(f => !['closed', 'done'].includes(f.status)).length,
      criticalIssues: feedbackStorage.filter(f => f.priority === 'critical').length,
      averageResponseTime: '2.3 days' // Placeholder
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Error generating stats:', error);
    res.status(500).json({ error: 'Failed to generate stats' });
  }
});

// Admin: migration status
router.get('/admin/migration-status', (req, res) => {
  try {
    res.json({
      ran: feedbackMemoryMigrated,
      inserted: feedbackMemoryMigratedCount,
      supabaseEnabled: !!supabaseService?.enabled
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to get migration status' });
  }
});

// Admin: trigger migration manually
router.post('/admin/migrate', async (req, res) => {
  try {
    const { force } = req.body || {};
    const result = await migrateMemoryToSupabase(!!force);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ error: 'Failed to run migration' });
  }
});

export default router;
