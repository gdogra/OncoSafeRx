import express from 'express';
import continuousLearningAIService from '../services/continuousLearningAIService.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * Continuous Learning AI API Routes
 * Self-improving AI system that learns from every patient interaction
 */

// Submit learning data from treatment outcomes
router.post('/learn/outcomes', authenticateUser, async (req, res) => {
  try {
    const { patientId, treatmentData, outcomeData, timepoint } = req.body;

    if (!patientId || !treatmentData || !outcomeData) {
      return res.status(400).json({ 
        error: 'Patient ID, treatment data, and outcome data are required' 
      });
    }

    const learningResult = await continuousLearningAIService.learnFromOutcomes(
      patientId,
      treatmentData,
      outcomeData,
      timepoint
    );

    res.json({
      success: true,
      data: learningResult,
      message: 'Learning from outcomes completed successfully'
    });

  } catch (error) {
    console.error('Learning from outcomes error:', error);
    res.status(500).json({ 
      error: 'Failed to learn from outcomes',
      details: error.message 
    });
  }
});

// Generate adaptive recommendations
router.post('/recommendations/adaptive', authenticateUser, async (req, res) => {
  try {
    const { patientData, clinicalContext } = req.body;

    const recommendations = await continuousLearningAIService.generateAdaptiveRecommendations(
      patientData,
      clinicalContext
    );

    res.json({
      success: true,
      data: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Adaptive recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate adaptive recommendations',
      details: error.message 
    });
  }
});

// Get model performance metrics
router.get('/performance/:domain', authenticateUser, async (req, res) => {
  try {
    const { domain } = req.params;
    const { timeRange = '30d' } = req.query;

    const performance = await continuousLearningAIService.assessModelPerformance(
      domain,
      timeRange
    );

    res.json({
      success: true,
      data: performance,
      domain,
      timeRange,
      assessedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Performance assessment error:', error);
    res.status(500).json({ 
      error: 'Failed to assess model performance',
      details: error.message 
    });
  }
});

// Submit feedback for model improvement
router.post('/feedback/submit', authenticateUser, async (req, res) => {
  try {
    const { domain, feedback, outcomeData, context } = req.body;

    if (!domain || !feedback) {
      return res.status(400).json({ 
        error: 'Domain and feedback are required' 
      });
    }

    const improvement = await continuousLearningAIService.improveRecommendationAccuracy(
      domain,
      {
        feedback,
        outcomeData,
        context,
        submittedBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: improvement,
      message: 'Feedback submitted for model improvement'
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
});

// Get discovered patterns
router.get('/patterns/discovered', authenticateUser, async (req, res) => {
  try {
    const { 
      patternType = 'all',
      timeRange = '90d',
      minConfidence = 0.8 
    } = req.query;

    const patterns = await continuousLearningAIService.getDiscoveredPatterns(
      {
        type: patternType,
        timeRange,
        minConfidence: parseFloat(minConfidence)
      }
    );

    res.json({
      success: true,
      data: patterns,
      filters: { patternType, timeRange, minConfidence },
      discoveredAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Pattern discovery error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve discovered patterns',
      details: error.message 
    });
  }
});

// Participate in federated learning
router.post('/federated/participate', authenticateUser, async (req, res) => {
  try {
    const { institutionId, localUpdates, globalModel } = req.body;

    if (!institutionId || !localUpdates) {
      return res.status(400).json({ 
        error: 'Institution ID and local updates are required' 
      });
    }

    const federatedResult = await continuousLearningAIService.participateInFederatedLearning(
      institutionId,
      localUpdates,
      globalModel
    );

    res.json({
      success: true,
      data: federatedResult,
      message: 'Federated learning participation completed'
    });

  } catch (error) {
    console.error('Federated learning error:', error);
    res.status(500).json({ 
      error: 'Failed to participate in federated learning',
      details: error.message 
    });
  }
});

// Get knowledge graph insights
router.get('/knowledge-graph/insights', authenticateUser, async (req, res) => {
  try {
    const { 
      entityType = 'all',
      relationshipType = 'all',
      minStrength = 0.5 
    } = req.query;

    const insights = await continuousLearningAIService.getKnowledgeGraphInsights(
      {
        entityType,
        relationshipType,
        minStrength: parseFloat(minStrength)
      }
    );

    res.json({
      success: true,
      data: insights,
      filters: { entityType, relationshipType, minStrength },
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Knowledge graph insights error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve knowledge graph insights',
      details: error.message 
    });
  }
});

// Get learning statistics
router.get('/statistics/learning', authenticateUser, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;

    const stats = await continuousLearningAIService.getLearningStatistics(timeRange);

    res.json({
      success: true,
      data: stats,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Learning statistics error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve learning statistics',
      details: error.message 
    });
  }
});

// Trigger model retraining
router.post('/models/retrain/:domain', authenticateUser, async (req, res) => {
  try {
    const { domain } = req.params;
    const { force = false, options = {} } = req.body;

    // Check if user has admin privileges for retraining
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Admin privileges required for model retraining' 
      });
    }

    const retrainingResult = await continuousLearningAIService.triggerModelRetraining(
      domain,
      {
        force,
        options,
        triggeredBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: retrainingResult,
      message: `Model retraining initiated for ${domain}`
    });

  } catch (error) {
    console.error('Model retraining error:', error);
    res.status(500).json({ 
      error: 'Failed to trigger model retraining',
      details: error.message 
    });
  }
});

// Get model versions and updates
router.get('/models/versions', authenticateUser, async (req, res) => {
  try {
    const { domain = 'all' } = req.query;

    const versions = await continuousLearningAIService.getModelVersions(domain);

    res.json({
      success: true,
      data: versions,
      domain,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Model versions error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve model versions',
      details: error.message 
    });
  }
});

// Get personalization improvements
router.get('/personalization/:patientId', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { includeHistory = false } = req.query;

    const personalization = await continuousLearningAIService.getPersonalizationImprovements(
      patientId,
      { includeHistory: includeHistory === 'true' }
    );

    res.json({
      success: true,
      data: personalization,
      patientId,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Personalization improvements error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve personalization improvements',
      details: error.message 
    });
  }
});

// Export learning insights
router.get('/insights/export', authenticateUser, async (req, res) => {
  try {
    const { 
      format = 'json',
      timeRange = '90d',
      includePatterns = true,
      includePerformance = true 
    } = req.query;

    const insights = await continuousLearningAIService.exportLearningInsights(
      {
        format,
        timeRange,
        includePatterns: includePatterns === 'true',
        includePerformance: includePerformance === 'true'
      }
    );

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=learning-insights.csv');
    }

    res.send(insights);

  } catch (error) {
    console.error('Learning insights export error:', error);
    res.status(500).json({ 
      error: 'Failed to export learning insights',
      details: error.message 
    });
  }
});

// Get real-time learning status
router.get('/status/real-time', authenticateUser, async (req, res) => {
  try {
    const status = await continuousLearningAIService.getRealTimeLearningStatus();

    res.json({
      success: true,
      data: status,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Real-time status error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve real-time learning status',
      details: error.message 
    });
  }
});

export default router;