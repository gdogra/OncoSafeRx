import express from 'express';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

// In-memory storage for demo (in production, use a proper database)
let feedbackStorage = [];
let ticketCounter = 1;

// Admin email for access control
const ADMIN_EMAIL = 'gdogra@gmail.com';

// Helper function to check admin access
const isAdmin = (req) => {
  const userEmail = req.user?.email || req.headers['user-email'] || req.query.admin_email;
  return userEmail === ADMIN_EMAIL;
};

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
router.post('/submit', (req, res) => {
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
    
    // Store feedback
    feedbackStorage.push(feedbackItem);
    
    // Create GitHub issue if configured (placeholder)
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      // In a real implementation, this would create a GitHub issue
      console.log('Would create GitHub issue:', feedbackItem.metadata.ticketNumber);
    }
    
    console.log('📝 Feedback submitted:', {
      id: feedbackItem.id,
      type: feedbackItem.type,
      priority: feedbackItem.priority,
      ticket: feedbackItem.metadata.ticketNumber
    });
    
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
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const priority = req.query.priority;
    const type = req.query.type;
    
    let filtered = [...feedbackStorage];
    
    // Apply filters
    if (status) {
      filtered = filtered.filter(item => item.status === status);
    }
    if (priority) {
      filtered = filtered.filter(item => item.priority === priority);
    }
    if (type) {
      filtered = filtered.filter(item => item.type === type);
    }
    
    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate
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
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get feedback analytics (admin only)
router.get('/admin/analytics', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const feedback = feedbackStorage;
    
    // Calculate analytics
    const analytics = {
      totalFeedback: feedback.length,
      totalTickets: feedback.filter(f => f.status !== 'closed').length,
      byType: {},
      byPriority: {},
      byStatus: {},
      byCategory: {},
      recentFeedback: feedback
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10),
      
      // Sprint planning
      sprintPlan: {
        currentSprint: feedback.filter(f => f.status === 'in_sprint'),
        nextSprint: feedback.filter(f => f.status === 'in_backlog').slice(0, 10),
        backlog: feedback.filter(f => f.status === 'triaged' || f.status === 'new')
      },
      
      // Time-based stats
      last30Days: feedback.filter(f => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(f.timestamp) >= thirtyDaysAgo;
      }).length
    };
    
    // Calculate distributions
    ['type', 'priority', 'status', 'category'].forEach(field => {
      const distribution = {};
      feedback.forEach(item => {
        const value = item[field];
        distribution[value] = (distribution[value] || 0) + 1;
      });
      analytics[`by${field.charAt(0).toUpperCase() + field.slice(1)}`] = distribution;
    });
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

// Update feedback status (admin only)
router.patch('/admin/:id/status', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
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
    
    res.json({ success: true, feedback: feedbackStorage[feedbackIndex] });
    
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// Create GitHub issue from feedback (admin only)
router.post('/admin/:id/create-issue', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  try {
    const { id } = req.params;
    const feedback = feedbackStorage.find(f => f.id === id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // In a real implementation, this would call GitHub API
    const issueData = {
      title: `[${feedback.type.toUpperCase()}] ${feedback.title}`,
      body: `
**Description:**
${feedback.description}

**Priority:** ${feedback.priority}
**Category:** ${feedback.category}
**Estimated Effort:** ${feedback.estimatedEffort}

**User Context:**
- Page: ${feedback.page}
- Timestamp: ${feedback.timestamp}
- User Agent: ${feedback.userAgent}

**Reproduction Steps:**
${feedback.metadata?.reproductionSteps?.join('\n') || 'Not provided'}

**Expected Behavior:**
${feedback.metadata?.expectedBehavior || 'Not provided'}

**Actual Behavior:**
${feedback.metadata?.actualBehavior || 'Not provided'}

---
*Auto-generated from OncoSafeRx feedback system*
*Ticket ID: ${feedback.metadata?.ticketNumber}*
      `,
      labels: feedback.labels
    };
    
    console.log('Would create GitHub issue:', issueData);
    
    // Simulate GitHub issue creation
    const issueUrl = `https://github.com/gdogra/OncoSafeRx/issues/123`;
    const feedbackIndex = feedbackStorage.findIndex(f => f.id === id);
    feedbackStorage[feedbackIndex].metadata.githubIssue = {
      number: 123,
      url: issueUrl,
      created_at: new Date().toISOString()
    };
    
    res.json({ 
      success: true, 
      issueUrl,
      feedback: feedbackStorage[feedbackIndex]
    });
    
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    res.status(500).json({ error: 'Failed to create GitHub issue' });
  }
});

// Export feedback data (admin only)
router.get('/admin/export', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
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

export default router;