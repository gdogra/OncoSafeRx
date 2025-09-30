import express from 'express';
import auditLogService from '../services/auditLogService.js';

const router = express.Router();

/**
 * Search audit logs (admin only)
 */
router.get('/search', async (req, res) => {
  try {
    const {
      userId,
      eventType,
      dateFrom,
      dateTo,
      riskLevel,
      limit = 100,
      offset = 0
    } = req.query;

    const criteria = {
      userId,
      eventType,
      dateFrom,
      dateTo,
      riskLevel
    };

    const logs = await auditLogService.searchLogs(criteria);
    const paginatedLogs = logs.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        logs: paginatedLogs,
        total: logs.length,
        criteria,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: logs.length > offset + parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Audit search error:', error);
    res.status(500).json({
      error: 'Failed to search audit logs',
      message: error.message
    });
  }
});

/**
 * Generate compliance report
 */
router.get('/compliance-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required'
      });
    }

    const report = await auditLogService.generateComplianceReport(startDate, endDate);
    
    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report',
      message: error.message
    });
  }
});

/**
 * Log audit event (internal API)
 */
router.post('/log', async (req, res) => {
  try {
    const { eventType, details } = req.body;
    
    if (!eventType) {
      return res.status(400).json({
        error: 'Event type is required'
      });
    }

    const auditId = await auditLogService.logEvent(eventType, details || {});
    
    res.json({
      success: true,
      data: { auditId }
    });

  } catch (error) {
    console.error('Audit logging error:', error);
    res.status(500).json({
      error: 'Failed to log audit event',
      message: error.message
    });
  }
});

/**
 * Get audit event types
 */
router.get('/event-types', (req, res) => {
  res.json({
    success: true,
    data: {
      events: auditLogService.auditEvents,
      riskLevels: auditLogService.riskLevels
    }
  });
});

export default router;