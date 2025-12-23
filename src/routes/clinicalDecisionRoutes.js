import express from 'express';
import clinicalDecisionSupportService from '../services/clinicalDecisionSupportService.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * Clinical Decision Support API Routes
 * Evidence-based clinical decision support with comprehensive citations
 */

// Generate clinical decision support
router.post('/support', authenticateUser, async (req, res) => {
  try {
    const { patientData, clinicalQuery } = req.body;

    if (!patientData || !clinicalQuery) {
      return res.status(400).json({ 
        error: 'Patient data and clinical query are required' 
      });
    }

    const decisionSupport = await clinicalDecisionSupportService.generateDecisionSupport(
      patientData, 
      clinicalQuery
    );

    res.json({
      success: true,
      data: decisionSupport,
      message: 'Clinical decision support generated successfully'
    });

  } catch (error) {
    console.error('Clinical decision support error:', error);
    res.status(500).json({ 
      error: 'Failed to generate clinical decision support',
      details: error.message 
    });
  }
});

// Get treatment recommendations
router.post('/treatment/recommend', authenticateUser, async (req, res) => {
  try {
    const { patientData, treatmentContext } = req.body;

    const recommendations = await clinicalDecisionSupportService.generateTreatmentRecommendations(
      patientData,
      treatmentContext
    );

    res.json({
      success: true,
      data: recommendations,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Treatment recommendation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate treatment recommendations',
      details: error.message 
    });
  }
});

// Check guideline compliance
router.post('/guidelines/check', authenticateUser, async (req, res) => {
  try {
    const { patientData, proposedTreatment, guidelines = 'all' } = req.body;

    const compliance = await clinicalDecisionSupportService.checkGuidelineCompliance(
      patientData,
      proposedTreatment,
      { guidelines }
    );

    res.json({
      success: true,
      data: compliance,
      checkedGuidelines: guidelines,
      checkedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Guideline compliance error:', error);
    res.status(500).json({ 
      error: 'Failed to check guideline compliance',
      details: error.message 
    });
  }
});

// Get evidence for specific recommendation
router.get('/evidence/:recommendationId', authenticateUser, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { includeEmergingEvidence = false } = req.query;

    const evidence = await clinicalDecisionSupportService.getEvidenceForRecommendation(
      recommendationId,
      { includeEmerging: includeEmergingEvidence === 'true' }
    );

    res.json({
      success: true,
      data: evidence,
      recommendationId,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evidence retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve evidence',
      details: error.message 
    });
  }
});

// Perform drug dosing analysis
router.post('/dosing/analyze', authenticateUser, async (req, res) => {
  try {
    const { patientData, medications, dosingContext } = req.body;

    if (!patientData || !medications) {
      return res.status(400).json({ 
        error: 'Patient data and medications are required' 
      });
    }

    const dosingAnalysis = await clinicalDecisionSupportService.analyzeDosingRecommendations(
      patientData,
      medications,
      dosingContext
    );

    res.json({
      success: true,
      data: dosingAnalysis,
      medications: medications.map(m => m.name || m),
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dosing analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze dosing',
      details: error.message 
    });
  }
});

// Assess clinical risks
router.post('/risk/assess', authenticateUser, async (req, res) => {
  try {
    const { patientData, treatmentPlan, riskFactors = 'all' } = req.body;

    const riskAssessment = await clinicalDecisionSupportService.performRiskAssessment(
      patientData,
      treatmentPlan,
      { riskFactors }
    );

    res.json({
      success: true,
      data: riskAssessment,
      assessedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Risk assessment error:', error);
    res.status(500).json({ 
      error: 'Failed to perform risk assessment',
      details: error.message 
    });
  }
});

// Get decision history for patient
router.get('/history/:patientId', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { timeRange = '30d', decisionType = 'all' } = req.query;

    const history = await clinicalDecisionSupportService.getDecisionHistory(
      patientId,
      { timeRange, decisionType }
    );

    res.json({
      success: true,
      data: history,
      patientId,
      filters: { timeRange, decisionType },
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Decision history error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve decision history',
      details: error.message 
    });
  }
});

// Get quality measures assessment
router.post('/quality/assess', authenticateUser, async (req, res) => {
  try {
    const { patientData, careEpisode, measures = 'all' } = req.body;

    const qualityAssessment = await clinicalDecisionSupportService.assessQualityMeasures(
      patientData,
      careEpisode,
      { measures }
    );

    res.json({
      success: true,
      data: qualityAssessment,
      assessedMeasures: measures,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quality assessment error:', error);
    res.status(500).json({ 
      error: 'Failed to assess quality measures',
      details: error.message 
    });
  }
});

// Generate monitoring plan
router.post('/monitoring/plan', authenticateUser, async (req, res) => {
  try {
    const { patientData, treatmentPlan, riskFactors } = req.body;

    const monitoringPlan = await clinicalDecisionSupportService.generateMonitoringPlan(
      patientData,
      treatmentPlan,
      { riskFactors }
    );

    res.json({
      success: true,
      data: monitoringPlan,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitoring plan error:', error);
    res.status(500).json({ 
      error: 'Failed to generate monitoring plan',
      details: error.message 
    });
  }
});

// Search clinical evidence
router.get('/evidence/search', authenticateUser, async (req, res) => {
  try {
    const { 
      query, 
      evidenceType = 'all',
      dateRange = '10y',
      studyType = 'all',
      evidenceLevel = 'all' 
    } = req.query;

    if (!query) {
      return res.status(400).json({ 
        error: 'Search query is required' 
      });
    }

    const evidence = await clinicalDecisionSupportService.searchClinicalEvidence(
      query,
      {
        type: evidenceType,
        dateRange,
        studyType,
        evidenceLevel
      }
    );

    res.json({
      success: true,
      data: evidence,
      searchQuery: query,
      filters: { evidenceType, dateRange, studyType, evidenceLevel },
      searchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evidence search error:', error);
    res.status(500).json({ 
      error: 'Failed to search clinical evidence',
      details: error.message 
    });
  }
});

// Update decision with feedback
router.patch('/feedback/:decisionId', authenticateUser, async (req, res) => {
  try {
    const { decisionId } = req.params;
    const { feedback, outcome, followUpActions } = req.body;

    const result = await clinicalDecisionSupportService.updateDecisionFeedback(
      decisionId,
      {
        feedback,
        outcome,
        followUpActions,
        providedBy: req.user.id,
        timestamp: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: result,
      message: 'Decision feedback updated successfully'
    });

  } catch (error) {
    console.error('Feedback update error:', error);
    res.status(500).json({ 
      error: 'Failed to update decision feedback',
      details: error.message 
    });
  }
});

// Get decision confidence metrics
router.get('/confidence/:decisionId', authenticateUser, async (req, res) => {
  try {
    const { decisionId } = req.params;

    const confidence = await clinicalDecisionSupportService.getDecisionConfidence(
      decisionId
    );

    res.json({
      success: true,
      data: confidence,
      decisionId,
      calculatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Confidence calculation error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate decision confidence',
      details: error.message 
    });
  }
});

export default router;