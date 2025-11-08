/**
 * Patient Features API Routes
 * Comprehensive patient experience platform endpoints
 * OncoSafeRx - Generated 2024-11-08
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import patientFeaturesService from '../services/patientFeaturesService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// =============================================
// 1. MEDICATION ADHERENCE & REMINDERS
// =============================================

// Create medication schedule
router.post('/medications/schedules', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const schedule = await patientFeaturesService.createMedicationSchedule(patientId, req.body);
  res.status(201).json({ success: true, schedule });
}));

// Get medication schedules
router.get('/medications/schedules', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const schedules = await patientFeaturesService.getMedicationSchedules(patientId);
  res.json({ success: true, schedules });
}));

// Log medication adherence
router.post('/medications/schedules/:scheduleId/adherence', asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const patientId = req.user.id;
  const log = await patientFeaturesService.logMedicationAdherence(scheduleId, patientId, req.body);
  res.status(201).json({ success: true, log });
}));

// Get adherence statistics
router.get('/medications/adherence/stats', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { timeframe = '30 days' } = req.query;
  const stats = await patientFeaturesService.getAdherenceStats(patientId, timeframe);
  res.json({ success: true, stats });
}));

// Log side effect
router.post('/medications/side-effects', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const sideEffect = await patientFeaturesService.logSideEffect(patientId, req.body);
  res.status(201).json({ success: true, sideEffect });
}));

// =============================================
// 2. SYMPTOM & SIDE EFFECT TRACKER
// =============================================

// Log symptom
router.post('/symptoms', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const symptom = await patientFeaturesService.logSymptom(patientId, req.body);
  res.status(201).json({ success: true, symptom });
}));

// Get symptom history
router.get('/symptoms', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { timeframe = '30 days' } = req.query;
  const symptoms = await patientFeaturesService.getSymptomHistory(patientId, timeframe);
  res.json({ success: true, symptoms });
}));

// Analyze symptom correlations
router.post('/symptoms/analyze-correlations', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const correlations = await patientFeaturesService.analyzeSymptomCorrelations(patientId);
  res.json({ success: true, correlations });
}));

// =============================================
// 3. TREATMENT JOURNEY TIMELINE
// =============================================

// Create treatment milestone
router.post('/treatment/milestones', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const milestone = await patientFeaturesService.createTreatmentMilestone(patientId, req.body);
  res.status(201).json({ success: true, milestone });
}));

// Get treatment timeline
router.get('/treatment/timeline', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const timeline = await patientFeaturesService.getTreatmentTimeline(patientId);
  res.json({ success: true, timeline });
}));

// Log treatment response
router.post('/treatment/responses', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const response = await patientFeaturesService.logTreatmentResponse(patientId, req.body);
  res.status(201).json({ success: true, response });
}));

// =============================================
// 4. CARE TEAM COMMUNICATION
// =============================================

// Add care team member
router.post('/care-team', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const member = await patientFeaturesService.addCareTeamMember(patientId, req.body);
  res.status(201).json({ success: true, member });
}));

// Get care team
router.get('/care-team', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const team = await patientFeaturesService.getCareTeam(patientId);
  res.json({ success: true, team });
}));

// Send message to care team
router.post('/messages', asyncHandler(async (req, res) => {
  const senderId = req.user.id;
  const { recipient_id, patient_id = senderId, ...messageData } = req.body;
  const message = await patientFeaturesService.sendMessage(senderId, recipient_id, patient_id, messageData);
  res.status(201).json({ success: true, message });
}));

// Get messages
router.get('/messages', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { patient_id = userId, thread_id } = req.query;
  const messages = await patientFeaturesService.getMessages(userId, patient_id, thread_id);
  res.json({ success: true, messages });
}));

// =============================================
// 5. FAMILY & CAREGIVER PORTAL
// =============================================

// Invite caregiver
router.post('/caregivers/invite', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { email, relationship, permissions } = req.body;
  const invitation = await patientFeaturesService.inviteCaregiver(patientId, email, relationship, permissions);
  res.status(201).json({ success: true, invitation });
}));

// Get caregivers
router.get('/caregivers', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const caregivers = await patientFeaturesService.getCaregivers(patientId);
  res.json({ success: true, caregivers });
}));

// Add caregiver note
router.post('/caregivers/notes', asyncHandler(async (req, res) => {
  const patientId = req.query.patient_id || req.user.id;
  const authorId = req.user.id;
  const note = await patientFeaturesService.addCaregiverNote(patientId, authorId, req.body);
  res.status(201).json({ success: true, note });
}));

// =============================================
// 6. WELLNESS & MENTAL HEALTH
// =============================================

// Log wellness activity
router.post('/wellness/activities', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const activity = await patientFeaturesService.logWellnessActivity(patientId, req.body);
  res.status(201).json({ success: true, activity });
}));

// Get wellness history
router.get('/wellness/activities', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { timeframe = '30 days' } = req.query;
  const activities = await patientFeaturesService.getWellnessHistory(patientId, timeframe);
  res.json({ success: true, activities });
}));

// Conduct mental health assessment
router.post('/wellness/mental-health-assessment', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const assessment = await patientFeaturesService.conductMentalHealthAssessment(patientId, req.body);
  res.status(201).json({ success: true, assessment });
}));

// =============================================
// 7. NUTRITION TRACKING
// =============================================

// Log nutrition
router.post('/nutrition', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const nutrition = await patientFeaturesService.logNutrition(patientId, req.body);
  res.status(201).json({ success: true, nutrition });
}));

// Get nutrition history
router.get('/nutrition', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { timeframe = '7 days' } = req.query;
  const nutrition = await patientFeaturesService.getNutritionHistory(patientId, timeframe);
  res.json({ success: true, nutrition });
}));

// =============================================
// 8. FINANCIAL TRACKING
// =============================================

// Log treatment cost
router.post('/finances/costs', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const cost = await patientFeaturesService.logTreatmentCost(patientId, req.body);
  res.status(201).json({ success: true, cost });
}));

// Get cost summary
router.get('/finances/summary', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { year } = req.query;
  const summary = await patientFeaturesService.getCostSummary(patientId, year ? parseInt(year) : undefined);
  res.json({ success: true, summary });
}));

// =============================================
// 9. APPOINTMENTS & LOGISTICS
// =============================================

// Schedule appointment
router.post('/appointments', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const appointment = await patientFeaturesService.scheduleAppointment(patientId, req.body);
  res.status(201).json({ success: true, appointment });
}));

// Get upcoming appointments
router.get('/appointments', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { limit = '10' } = req.query;
  const appointments = await patientFeaturesService.getUpcomingAppointments(patientId, parseInt(limit));
  res.json({ success: true, appointments });
}));

// =============================================
// 10. INTEGRATION & CONNECTIVITY
// =============================================

// Connect integration
router.post('/integrations', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const integration = await patientFeaturesService.connectIntegration(patientId, req.body);
  res.status(201).json({ success: true, integration });
}));

// Sync integration data
router.post('/integrations/:integrationId/sync', asyncHandler(async (req, res) => {
  const { integrationId } = req.params;
  const syncResult = await patientFeaturesService.syncIntegrationData(integrationId);
  res.json({ success: true, syncResult });
}));

// =============================================
// ANALYTICS & INSIGHTS
// =============================================

// Generate patient insights
router.get('/insights', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const insights = await patientFeaturesService.generatePatientInsights(patientId);
  res.json({ success: true, insights });
}));

// Patient dashboard summary
router.get('/dashboard', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  
  try {
    const [
      schedules,
      symptoms,
      timeline,
      team,
      appointments,
      insights
    ] = await Promise.all([
      patientFeaturesService.getMedicationSchedules(patientId),
      patientFeaturesService.getSymptomHistory(patientId, '7 days'),
      patientFeaturesService.getTreatmentTimeline(patientId),
      patientFeaturesService.getCareTeam(patientId),
      patientFeaturesService.getUpcomingAppointments(patientId, 3),
      patientFeaturesService.generatePatientInsights(patientId)
    ]);

    const dashboard = {
      medications: {
        active_schedules: schedules.length,
        recent_schedules: schedules.slice(0, 3)
      },
      symptoms: {
        recent_count: symptoms.length,
        recent_symptoms: symptoms.slice(0, 5)
      },
      treatment: {
        upcoming_milestones: timeline.filter(m => 
          new Date(m.scheduled_date) > new Date() && m.status === 'scheduled'
        ).slice(0, 3)
      },
      care_team: {
        team_size: team.length,
        primary_provider: team.find(t => t.is_primary)
      },
      appointments: {
        upcoming_count: appointments.length,
        next_appointments: appointments
      },
      insights
    };

    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error generating dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate dashboard',
      message: error.message 
    });
  }
}));

// Health score calculation
router.get('/health-score', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  
  try {
    const [adherence, wellness, symptoms] = await Promise.all([
      patientFeaturesService.getAdherenceStats(patientId, '30 days'),
      patientFeaturesService.getWellnessHistory(patientId, '30 days'),
      patientFeaturesService.getSymptomHistory(patientId, '30 days')
    ]);

    // Calculate comprehensive health score
    const adherenceScore = (adherence.overall_rate || 0) * 100;
    const wellnessScore = patientFeaturesService.calculateWellnessScore(wellness) * 10;
    const symptomScore = symptoms.length > 0 
      ? Math.max(0, 100 - (symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length * 10))
      : 100;

    const healthScore = Math.round((adherenceScore + wellnessScore + symptomScore) / 3);

    res.json({
      success: true,
      healthScore: {
        overall: healthScore,
        breakdown: {
          adherence: Math.round(adherenceScore),
          wellness: Math.round(wellnessScore),
          symptoms: Math.round(symptomScore)
        },
        trends: {
          improving: healthScore > 70,
          stable: healthScore >= 50 && healthScore <= 70,
          concerning: healthScore < 50
        }
      }
    });
  } catch (error) {
    console.error('Error calculating health score:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate health score',
      message: error.message 
    });
  }
}));

// Export patient data (for portability)
router.get('/export', asyncHandler(async (req, res) => {
  const patientId = req.user.id;
  const { format = 'json' } = req.query;
  
  try {
    const [
      schedules,
      symptoms,
      timeline,
      team,
      wellness,
      nutrition,
      costs,
      appointments
    ] = await Promise.all([
      patientFeaturesService.getMedicationSchedules(patientId),
      patientFeaturesService.getSymptomHistory(patientId, '365 days'),
      patientFeaturesService.getTreatmentTimeline(patientId),
      patientFeaturesService.getCareTeam(patientId),
      patientFeaturesService.getWellnessHistory(patientId, '365 days'),
      patientFeaturesService.getNutritionHistory(patientId, '365 days'),
      patientFeaturesService.getCostSummary(patientId),
      patientFeaturesService.getUpcomingAppointments(patientId, 100)
    ]);

    const exportData = {
      patient_id: patientId,
      export_date: new Date().toISOString(),
      data: {
        medication_schedules: schedules,
        symptoms: symptoms,
        treatment_timeline: timeline,
        care_team: team,
        wellness_activities: wellness,
        nutrition_logs: nutrition,
        financial_summary: costs,
        appointments: appointments
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="oncosaferx-patient-data-${new Date().toISOString().split('T')[0]}.csv"`);
      // Would implement CSV conversion here
      res.send('CSV export not yet implemented');
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="oncosaferx-patient-data-${new Date().toISOString().split('T')[0]}.json"`);
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting patient data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export patient data',
      message: error.message 
    });
  }
}));

export default router;