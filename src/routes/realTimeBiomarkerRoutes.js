import express from 'express';
import realTimeBiomarkerService from '../services/realTimeBiomarkerService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Real-Time Biomarker Monitoring API Routes
 * Provides comprehensive biomarker monitoring with predictive analytics
 */

// Start biomarker monitoring for a patient
router.post('/monitor/start', authenticateToken, async (req, res) => {
  try {
    const { patientId, monitoringConfig } = req.body;

    if (!patientId) {
      return res.status(400).json({ 
        error: 'Patient ID is required' 
      });
    }

    const result = await realTimeBiomarkerService.startBiomarkerMonitoring(
      patientId, 
      monitoringConfig
    );

    res.json({
      success: true,
      data: result,
      message: 'Biomarker monitoring initiated successfully'
    });

  } catch (error) {
    console.error('Start monitoring error:', error);
    res.status(500).json({ 
      error: 'Failed to start biomarker monitoring',
      details: error.message 
    });
  }
});

// Submit new biomarker data
router.post('/data/submit', authenticateToken, async (req, res) => {
  try {
    const { patientId, biomarkerData } = req.body;

    if (!patientId || !biomarkerData) {
      return res.status(400).json({ 
        error: 'Patient ID and biomarker data are required' 
      });
    }

    const analysis = await realTimeBiomarkerService.processBiomarkerData(
      patientId, 
      biomarkerData
    );

    res.json({
      success: true,
      data: analysis,
      message: 'Biomarker data processed successfully'
    });

  } catch (error) {
    console.error('Data submission error:', error);
    res.status(500).json({ 
      error: 'Failed to process biomarker data',
      details: error.message 
    });
  }
});

// Get current biomarker dashboard for patient
router.get('/dashboard/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { timeRange = '30d' } = req.query;

    const dashboard = await realTimeBiomarkerService.getBiomarkerDashboard(
      patientId, 
      timeRange
    );

    res.json({
      success: true,
      data: dashboard,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Failed to generate biomarker dashboard',
      details: error.message 
    });
  }
});

// Get predictive insights for patient
router.get('/insights/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { horizon = 'short' } = req.query;

    const insights = await realTimeBiomarkerService.getPredictiveInsights(
      patientId, 
      horizon
    );

    res.json({
      success: true,
      data: insights,
      horizon,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictive insights',
      details: error.message 
    });
  }
});

// Get active alerts for patient
router.get('/alerts/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { severity, status = 'active' } = req.query;

    const alerts = await realTimeBiomarkerService.getActiveAlerts(
      patientId, 
      { severity, status }
    );

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve alerts',
      details: error.message 
    });
  }
});

// Update alert status (acknowledge, resolve, etc.)
router.patch('/alerts/:alertId/status', authenticateToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, notes } = req.body;

    const result = await realTimeBiomarkerService.updateAlertStatus(
      alertId, 
      status, 
      {
        updatedBy: req.user.id,
        notes,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: result,
      message: 'Alert status updated successfully'
    });

  } catch (error) {
    console.error('Alert update error:', error);
    res.status(500).json({ 
      error: 'Failed to update alert status',
      details: error.message 
    });
  }
});

// Get biomarker trends analysis
router.get('/trends/:patientId/:biomarker', authenticateToken, async (req, res) => {
  try {
    const { patientId, biomarker } = req.params;
    const { timeRange = '90d', includeProjections = false } = req.query;

    const trends = await realTimeBiomarkerService.getBiomarkerTrends(
      patientId, 
      biomarker, 
      {
        timeRange,
        includeProjections: includeProjections === 'true'
      }
    );

    res.json({
      success: true,
      data: trends,
      biomarker,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze biomarker trends',
      details: error.message 
    });
  }
});

// Configure monitoring parameters
router.put('/monitor/configure/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { monitoringConfig } = req.body;

    const result = await realTimeBiomarkerService.updateMonitoringConfiguration(
      patientId, 
      monitoringConfig
    );

    res.json({
      success: true,
      data: result,
      message: 'Monitoring configuration updated successfully'
    });

  } catch (error) {
    console.error('Configuration error:', error);
    res.status(500).json({ 
      error: 'Failed to update monitoring configuration',
      details: error.message 
    });
  }
});

// Get monitoring status and health
router.get('/monitor/status/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    const status = await realTimeBiomarkerService.getMonitoringStatus(patientId);

    res.json({
      success: true,
      data: status,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve monitoring status',
      details: error.message 
    });
  }
});

// Stop biomarker monitoring
router.post('/monitor/stop/:patientId', authenticateToken, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { reason, notes } = req.body;

    const result = await realTimeBiomarkerService.stopBiomarkerMonitoring(
      patientId, 
      {
        reason,
        notes,
        stoppedBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: result,
      message: 'Biomarker monitoring stopped successfully'
    });

  } catch (error) {
    console.error('Stop monitoring error:', error);
    res.status(500).json({ 
      error: 'Failed to stop biomarker monitoring',
      details: error.message 
    });
  }
});

export default router;