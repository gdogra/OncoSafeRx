import express from 'express';
import patientTreatmentSimulationService from '../services/patientTreatmentSimulationService.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

/**
 * Patient-Facing Treatment Simulation API Routes
 * Interactive treatment visualization and education for patients
 */

// Create personalized treatment simulation
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatmentOptions, preferences = {} } = req.body;

    if (!patientProfile || !treatmentOptions) {
      return res.status(400).json({ 
        error: 'Patient profile and treatment options are required' 
      });
    }

    const simulation = await patientTreatmentSimulationService.createPatientSimulation(
      patientProfile,
      treatmentOptions,
      preferences
    );

    res.json({
      success: true,
      data: simulation,
      message: 'Patient simulation created successfully'
    });

  } catch (error) {
    console.error('Patient simulation creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create patient simulation',
      details: error.message 
    });
  }
});

// Get simulation by ID
router.get('/:simulationId', authenticateUser, async (req, res) => {
  try {
    const { simulationId } = req.params;
    const { includeInteractions = false } = req.query;

    const simulation = await patientTreatmentSimulationService.getSimulation(
      simulationId,
      { includeInteractions: includeInteractions === 'true' }
    );

    res.json({
      success: true,
      data: simulation,
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simulation retrieval error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve simulation',
      details: error.message 
    });
  }
});

// Get treatment comparison visualization
router.post('/compare', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatmentOptions, comparisonCriteria = 'all' } = req.body;

    const comparison = await patientTreatmentSimulationService.createTreatmentComparison(
      patientProfile,
      treatmentOptions,
      { criteria: comparisonCriteria }
    );

    res.json({
      success: true,
      data: comparison,
      comparedTreatments: treatmentOptions.length,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Treatment comparison error:', error);
    res.status(500).json({ 
      error: 'Failed to create treatment comparison',
      details: error.message 
    });
  }
});

// Get personalized outcome projections
router.post('/outcomes/predict', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatment, timeHorizon = '2y' } = req.body;

    const outcomes = await patientTreatmentSimulationService.simulatePatientOutcomes(
      patientProfile,
      treatment,
      { timeHorizon }
    );

    res.json({
      success: true,
      data: outcomes,
      timeHorizon,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Outcome prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to predict outcomes',
      details: error.message 
    });
  }
});

// Get side effect timeline and management
router.post('/side-effects/timeline', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatment, includeManagement = true } = req.body;

    const sideEffects = await patientTreatmentSimulationService.simulateSideEffectProfile(
      patientProfile,
      treatment,
      { includeManagement: includeManagement === true }
    );

    res.json({
      success: true,
      data: sideEffects,
      includesManagement: includeManagement,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Side effect simulation error:', error);
    res.status(500).json({ 
      error: 'Failed to simulate side effects',
      details: error.message 
    });
  }
});

// Generate interactive treatment timeline
router.post('/timeline/interactive', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatment, includePersonalization = true } = req.body;

    const timeline = await patientTreatmentSimulationService.createTreatmentTimeline(
      patientProfile,
      treatment,
      { personalized: includePersonalization === true }
    );

    res.json({
      success: true,
      data: timeline,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Timeline creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create treatment timeline',
      details: error.message 
    });
  }
});

// Get decision support tools
router.post('/decision-aid', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatmentOptions, decisionContext = {} } = req.body;

    const decisionAid = await patientTreatmentSimulationService.createDecisionSupportTools(
      patientProfile,
      treatmentOptions,
      decisionContext
    );

    res.json({
      success: true,
      data: decisionAid,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Decision aid creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create decision aid',
      details: error.message 
    });
  }
});

// Get personalized educational materials
router.get('/education/:patientId', authenticateUser, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      contentType = 'all',
      healthLiteracyLevel = 'average',
      language = 'english' 
    } = req.query;

    const education = await patientTreatmentSimulationService.getEducationalMaterials(
      patientId,
      {
        contentType,
        healthLiteracyLevel,
        language
      }
    );

    res.json({
      success: true,
      data: education,
      filters: { contentType, healthLiteracyLevel, language },
      retrievedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Educational materials error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve educational materials',
      details: error.message 
    });
  }
});

// Record patient interaction with simulation
router.post('/interaction/:simulationId', authenticateUser, async (req, res) => {
  try {
    const { simulationId } = req.params;
    const { interactionType, data, timestamp } = req.body;

    const result = await patientTreatmentSimulationService.recordPatientInteraction(
      simulationId,
      {
        type: interactionType,
        data,
        timestamp: timestamp || new Date().toISOString(),
        patientId: req.user.id
      }
    );

    res.json({
      success: true,
      data: result,
      message: 'Interaction recorded successfully'
    });

  } catch (error) {
    console.error('Interaction recording error:', error);
    res.status(500).json({ 
      error: 'Failed to record interaction',
      details: error.message 
    });
  }
});

// Get quality of life projection
router.post('/quality-of-life/project', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatment, timeframe = '6m' } = req.body;

    const projection = await patientTreatmentSimulationService.simulateQualityOfLifeImpact(
      patientProfile,
      treatment,
      { timeframe }
    );

    res.json({
      success: true,
      data: projection,
      timeframe,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Quality of life projection error:', error);
    res.status(500).json({ 
      error: 'Failed to project quality of life',
      details: error.message 
    });
  }
});

// Generate discussion guide for appointments
router.post('/discussion-guide', authenticateUser, async (req, res) => {
  try {
    const { patientProfile, treatmentOptions, appointmentType = 'treatment_planning' } = req.body;

    const guide = await patientTreatmentSimulationService.generateDiscussionGuide(
      patientProfile,
      treatmentOptions,
      { appointmentType }
    );

    res.json({
      success: true,
      data: guide,
      appointmentType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Discussion guide error:', error);
    res.status(500).json({ 
      error: 'Failed to generate discussion guide',
      details: error.message 
    });
  }
});

// Update patient preferences
router.patch('/preferences/:simulationId', authenticateUser, async (req, res) => {
  try {
    const { simulationId } = req.params;
    const { preferences } = req.body;

    const result = await patientTreatmentSimulationService.updatePatientPreferences(
      simulationId,
      preferences
    );

    res.json({
      success: true,
      data: result,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ 
      error: 'Failed to update preferences',
      details: error.message 
    });
  }
});

// Share simulation with caregiver
router.post('/share/:simulationId', authenticateUser, async (req, res) => {
  try {
    const { simulationId } = req.params;
    const { caregiverEmail, accessLevel = 'view', message } = req.body;

    if (!caregiverEmail) {
      return res.status(400).json({ 
        error: 'Caregiver email is required' 
      });
    }

    const shareResult = await patientTreatmentSimulationService.shareSimulationWithCaregiver(
      simulationId,
      {
        caregiverEmail,
        accessLevel,
        message,
        sharedBy: req.user.id,
        sharedAt: new Date().toISOString()
      }
    );

    res.json({
      success: true,
      data: shareResult,
      message: 'Simulation shared successfully'
    });

  } catch (error) {
    console.error('Simulation sharing error:', error);
    res.status(500).json({ 
      error: 'Failed to share simulation',
      details: error.message 
    });
  }
});

// Export simulation for printing
router.get('/export/:simulationId', authenticateUser, async (req, res) => {
  try {
    const { simulationId } = req.params;
    const { format = 'pdf', sections = 'all' } = req.query;

    const exportData = await patientTreatmentSimulationService.exportSimulation(
      simulationId,
      {
        format,
        sections: sections === 'all' ? 'all' : sections.split(','),
        timestamp: new Date().toISOString()
      }
    );

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=treatment-simulation-${simulationId}.pdf`);
    }

    res.send(exportData);

  } catch (error) {
    console.error('Simulation export error:', error);
    res.status(500).json({ 
      error: 'Failed to export simulation',
      details: error.message 
    });
  }
});

export default router;