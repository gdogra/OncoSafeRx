/**
 * Oncologist Features API Routes
 * Comprehensive clinical workflow and decision support platform
 * OncoSafeRx - Generated 2024-11-08
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import oncologistFeaturesService from '../services/oncologistFeaturesService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// =============================================
// 1. CLINICAL DECISION SUPPORT
// =============================================

// Create clinical protocol
router.post('/protocols', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const protocol = await oncologistFeaturesService.createClinicalProtocol(oncologistId, req.body);
  res.status(201).json({ success: true, protocol });
}));

// Get clinical protocols
router.get('/protocols', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const protocols = await oncologistFeaturesService.getClinicalProtocols(oncologistId, req.query);
  res.json({ success: true, protocols });
}));

// Get clinical decision support
router.post('/decision-support', asyncHandler(async (req, res) => {
  const { patient_data, treatment_context } = req.body;
  const support = await oncologistFeaturesService.getClinicalDecisionSupport(patient_data, treatment_context);
  res.json({ success: true, decision_support: support });
}));

// Generate AI clinical note
router.post('/ai-notes/generate', asyncHandler(async (req, res) => {
  const { patient_data, visit_data, template } = req.body;
  const aiNote = await oncologistFeaturesService.generateAINote(patient_data, visit_data, template);
  res.json({ success: true, ai_suggestions: aiNote });
}));

// =============================================
// 2. PATIENT POPULATION MANAGEMENT
// =============================================

// Get oncologist's patient caseload
router.get('/patients', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const patients = await oncologistFeaturesService.getOncologistPatients(oncologistId, req.query);
  res.json({ success: true, patients });
}));

// Assign patient to oncologist
router.post('/patients/assign', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const assignment = await oncologistFeaturesService.assignPatientToOncologist(oncologistId, req.body);
  res.status(201).json({ success: true, assignment });
}));

// Update patient status
router.put('/patients/:patientId/status', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { patientId } = req.params;
  const update = await oncologistFeaturesService.updatePatientStatus(oncologistId, patientId, req.body);
  res.json({ success: true, patient: update });
}));

// Get caseload summary
router.get('/caseload/summary', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const summary = await oncologistFeaturesService.getPatientCaseloadSummary(oncologistId);
  res.json({ success: true, summary });
}));

// =============================================
// 3. TREATMENT RESPONSE TRACKING
// =============================================

// Record treatment response
router.post('/treatment/responses', asyncHandler(async (req, res) => {
  const response = await oncologistFeaturesService.recordTreatmentResponse({
    ...req.body,
    oncologist_id: req.user.id
  });
  res.status(201).json({ success: true, response });
}));

// Get treatment responses
router.get('/treatment/responses/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const oncologistId = req.user.id;
  const responses = await oncologistFeaturesService.getTreatmentResponses(patientId, oncologistId);
  res.json({ success: true, responses });
}));

// Get treatment analytics
router.get('/analytics/treatment', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { timeframe = '6 months' } = req.query;
  const analytics = await oncologistFeaturesService.getTreatmentAnalytics(oncologistId, timeframe);
  res.json({ success: true, analytics });
}));

// =============================================
// 4. CLINICAL DOCUMENTATION
// =============================================

// Create clinical note
router.post('/notes', asyncHandler(async (req, res) => {
  const note = await oncologistFeaturesService.createClinicalNote({
    ...req.body,
    oncologist_id: req.user.id
  });
  res.status(201).json({ success: true, note });
}));

// Get clinical notes
router.get('/notes/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const oncologistId = req.user.id;
  const { limit = 10 } = req.query;
  const notes = await oncologistFeaturesService.getClinicalNotes(patientId, oncologistId, parseInt(limit));
  res.json({ success: true, notes });
}));

// =============================================
// 5. TUMOR BOARD & MDT COORDINATION
// =============================================

// Create tumor board case
router.post('/tumor-board/cases', asyncHandler(async (req, res) => {
  const caseData = {
    ...req.body,
    presenting_oncologist_id: req.user.id
  };
  const tumorBoardCase = await oncologistFeaturesService.createTumorBoardCase(caseData);
  res.status(201).json({ success: true, case: tumorBoardCase });
}));

// Get tumor board cases
router.get('/tumor-board/cases', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { status = 'scheduled' } = req.query;
  const cases = await oncologistFeaturesService.getTumorBoardCases(oncologistId, status);
  res.json({ success: true, cases });
}));

// Submit consultation request
router.post('/consultations/request', asyncHandler(async (req, res) => {
  const consultation = await oncologistFeaturesService.submitConsultationRequest({
    ...req.body,
    requesting_physician_id: req.user.id
  });
  res.status(201).json({ success: true, consultation });
}));

// Get pending consultations
router.get('/consultations/pending', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const consultations = await oncologistFeaturesService.getPendingConsultations(oncologistId);
  res.json({ success: true, consultations });
}));

// =============================================
// 6. QUALITY METRICS & ANALYTICS
// =============================================

// Get quality metrics
router.get('/quality/metrics', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { period = 'current_quarter' } = req.query;
  const metrics = await oncologistFeaturesService.getQualityMetrics(oncologistId, period);
  res.json({ success: true, metrics });
}));

// Get practice analytics
router.get('/analytics/practice', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const analytics = await oncologistFeaturesService.generatePracticeAnalytics(oncologistId);
  res.json({ success: true, analytics });
}));

// =============================================
// 7. CLINICAL TRIAL INTEGRATION
// =============================================

// Assess trial eligibility
router.post('/trials/assess-eligibility', asyncHandler(async (req, res) => {
  const { patient_data, trial_criteria } = req.body;
  const assessment = await oncologistFeaturesService.assessTrialEligibility(patient_data, trial_criteria);
  res.json({ success: true, assessment });
}));

// =============================================
// 8. COMPREHENSIVE DASHBOARD
// =============================================

// Oncologist dashboard summary
router.get('/dashboard', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  
  try {
    const dashboard = await oncologistFeaturesService.getOncologistDashboard(oncologistId);
    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error generating oncologist dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate dashboard',
      message: error.message 
    });
  }
}));

// =============================================
// 9. WORKFLOW OPTIMIZATION
// =============================================

// Get clinical workflows
router.get('/workflows', asyncHandler(async (req, res) => {
  const { cancer_type, workflow_type } = req.query;
  // This would typically fetch from clinical_workflows table
  // For now, return sample workflows
  const workflows = [
    {
      id: '1',
      workflow_name: 'New Patient Consultation',
      cancer_type: 'breast',
      workflow_type: 'diagnosis',
      estimated_time_minutes: 60,
      steps: [
        'Review referral documents',
        'Conduct comprehensive history',
        'Perform physical examination',
        'Order staging studies',
        'Discuss initial treatment options'
      ]
    }
  ];
  res.json({ success: true, workflows });
}));

// =============================================
// 10. EVIDENCE-BASED RESEARCH
// =============================================

// Get evidence summaries
router.get('/evidence', asyncHandler(async (req, res) => {
  const { cancer_type, treatment_modality } = req.query;
  // This would typically fetch from evidence_summaries table
  // For now, return sample evidence
  const evidence = [
    {
      id: '1',
      topic: 'Immunotherapy in Advanced NSCLC',
      cancer_type: cancer_type || 'lung',
      evidence_level: 'I',
      summary: 'Pembrolizumab demonstrates significant OS benefit vs chemotherapy',
      confidence_rating: 5
    }
  ];
  res.json({ success: true, evidence });
}));

// =============================================
// 11. SAFETY MONITORING & ALERTS
// =============================================

// Get safety alerts
router.get('/safety/alerts', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { patient_id } = req.query;
  
  // This would integrate with real-time monitoring system
  const alerts = [
    {
      id: '1',
      patient_id: patient_id,
      alert_type: 'drug_interaction',
      severity: 'high',
      message: 'Potential interaction between warfarin and new chemotherapy',
      recommended_action: 'Consider INR monitoring',
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({ success: true, alerts });
}));

// =============================================
// 12. PERFORMANCE BENCHMARKING
// =============================================

// Get peer benchmarks
router.get('/benchmarks', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  
  // This would typically compare against anonymized peer data
  const benchmarks = {
    response_rates: {
      your_average: 75,
      peer_average: 70,
      top_quartile: 85,
      percentile: 75
    },
    patient_satisfaction: {
      your_average: 4.6,
      peer_average: 4.2,
      top_quartile: 4.8,
      percentile: 80
    },
    time_to_treatment: {
      your_average: 14,
      peer_average: 18,
      top_quartile: 12,
      percentile: 85
    }
  };
  
  res.json({ success: true, benchmarks });
}));

// =============================================
// INTEGRATION ENDPOINTS
// =============================================

// Sync with EHR systems
router.post('/integrations/ehr/sync', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { ehr_system, sync_type } = req.body;
  
  // This would integrate with EHR APIs
  const syncResult = {
    status: 'completed',
    records_synced: 25,
    last_sync: new Date().toISOString(),
    ehr_system,
    sync_type
  };
  
  res.json({ success: true, sync_result: syncResult });
}));

// Export patient data for research
router.get('/export/research-data', asyncHandler(async (req, res) => {
  const oncologistId = req.user.id;
  const { anonymize = true, timeframe = '1 year' } = req.query;
  
  // This would generate anonymized research datasets
  res.json({ 
    success: true, 
    message: 'Research data export initiated',
    export_id: 'exp_' + Date.now()
  });
}));

export default router;