import express from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import auth from '../middleware/auth.js';
import researcherFeaturesService from '../services/researcherFeaturesService.js';

const router = express.Router();

router.use(auth);

router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await researcherFeaturesService.getResearcherProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Researcher profile not found' });
    }
    
    const dashboard = await researcherFeaturesService.getResearcherDashboard(profile.id);
    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error generating researcher dashboard:', error);
    res.status(500).json({ success: false, error: 'Failed to generate dashboard' });
  }
}));

router.post('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await researcherFeaturesService.createResearcherProfile(userId, req.body);
    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error('Error creating researcher profile:', error);
    res.status(500).json({ success: false, error: 'Failed to create profile' });
  }
}));

router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await researcherFeaturesService.getResearcherProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Researcher profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error getting researcher profile:', error);
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
}));

router.put('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const profile = await researcherFeaturesService.updateResearcherProfile(userId, req.body);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating researcher profile:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
}));

router.post('/clinical-trials', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const trial = await researcherFeaturesService.createClinicalTrial(userId, req.body);
    res.status(201).json({ success: true, trial });
  } catch (error) {
    console.error('Error creating clinical trial:', error);
    res.status(500).json({ success: false, error: 'Failed to create clinical trial' });
  }
}));

router.get('/clinical-trials', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const trials = await researcherFeaturesService.getClinicalTrials(userId, req.query);
    res.json({ success: true, trials });
  } catch (error) {
    console.error('Error getting clinical trials:', error);
    res.status(500).json({ success: false, error: 'Failed to get clinical trials' });
  }
}));

router.get('/clinical-trials/:trialId', asyncHandler(async (req, res) => {
  const { trialId } = req.params;
  const userId = req.user.id;
  try {
    const trial = await researcherFeaturesService.getClinicalTrial(trialId, userId);
    if (!trial) {
      return res.status(404).json({ success: false, error: 'Clinical trial not found' });
    }
    res.json({ success: true, trial });
  } catch (error) {
    console.error('Error getting clinical trial:', error);
    res.status(500).json({ success: false, error: 'Failed to get clinical trial' });
  }
}));

router.put('/clinical-trials/:trialId', asyncHandler(async (req, res) => {
  const { trialId } = req.params;
  const userId = req.user.id;
  try {
    const trial = await researcherFeaturesService.updateClinicalTrial(trialId, req.body, userId);
    res.json({ success: true, trial });
  } catch (error) {
    console.error('Error updating clinical trial:', error);
    res.status(500).json({ success: false, error: 'Failed to update clinical trial' });
  }
}));

router.post('/clinical-trials/:trialId/enroll', asyncHandler(async (req, res) => {
  const { trialId } = req.params;
  const userId = req.user.id;
  try {
    const enrollment = await researcherFeaturesService.enrollPatientInTrial(trialId, req.body, userId);
    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error('Error enrolling patient in trial:', error);
    res.status(500).json({ success: false, error: 'Failed to enroll patient' });
  }
}));

router.get('/clinical-trials/:trialId/enrollments', asyncHandler(async (req, res) => {
  const { trialId } = req.params;
  const userId = req.user.id;
  try {
    const enrollments = await researcherFeaturesService.getTrialEnrollments(trialId, userId);
    res.json({ success: true, enrollments });
  } catch (error) {
    console.error('Error getting trial enrollments:', error);
    res.status(500).json({ success: false, error: 'Failed to get enrollments' });
  }
}));

router.get('/clinical-trials/:trialId/analytics', asyncHandler(async (req, res) => {
  const { trialId } = req.params;
  const userId = req.user.id;
  try {
    const analytics = await researcherFeaturesService.generateTrialAnalytics(trialId, userId);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error generating trial analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to generate analytics' });
  }
}));

router.post('/biomarker-studies', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const study = await researcherFeaturesService.createBiomarkerStudy(userId, req.body);
    res.status(201).json({ success: true, study });
  } catch (error) {
    console.error('Error creating biomarker study:', error);
    res.status(500).json({ success: false, error: 'Failed to create biomarker study' });
  }
}));

router.get('/biomarker-studies', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const studies = await researcherFeaturesService.getBiomarkerStudies(userId, req.query);
    res.json({ success: true, studies });
  } catch (error) {
    console.error('Error getting biomarker studies:', error);
    res.status(500).json({ success: false, error: 'Failed to get biomarker studies' });
  }
}));

router.post('/biomarker-studies/:studyId/discovery', asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user.id;
  try {
    const results = await researcherFeaturesService.performBiomarkerDiscovery(studyId, req.body, userId);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error performing biomarker discovery:', error);
    res.status(500).json({ success: false, error: 'Failed to perform biomarker discovery' });
  }
}));

router.get('/biomarker-studies/:studyId/results', asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user.id;
  try {
    const results = await researcherFeaturesService.getBiomarkerResults(studyId, userId);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error getting biomarker results:', error);
    res.status(500).json({ success: false, error: 'Failed to get biomarker results' });
  }
}));

router.post('/rwe-studies', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const study = await researcherFeaturesService.createRWEStudy(userId, req.body);
    res.status(201).json({ success: true, study });
  } catch (error) {
    console.error('Error creating RWE study:', error);
    res.status(500).json({ success: false, error: 'Failed to create RWE study' });
  }
}));

router.get('/rwe-studies', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const studies = await researcherFeaturesService.getRWEStudies(userId, req.query);
    res.json({ success: true, studies });
  } catch (error) {
    console.error('Error getting RWE studies:', error);
    res.status(500).json({ success: false, error: 'Failed to get RWE studies' });
  }
}));

router.post('/rwe-studies/:studyId/analytics', asyncHandler(async (req, res) => {
  const { studyId } = req.params;
  const userId = req.user.id;
  try {
    const analytics = await researcherFeaturesService.generateRWEAnalytics(studyId, req.body, userId);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error generating RWE analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to generate RWE analytics' });
  }
}));

router.post('/collaborations', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const collaboration = await researcherFeaturesService.createCollaboration(userId, req.body);
    res.status(201).json({ success: true, collaboration });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(500).json({ success: false, error: 'Failed to create collaboration' });
  }
}));

router.get('/collaborations', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const collaborations = await researcherFeaturesService.getCollaborations(userId, req.query);
    res.json({ success: true, collaborations });
  } catch (error) {
    console.error('Error getting collaborations:', error);
    res.status(500).json({ success: false, error: 'Failed to get collaborations' });
  }
}));

router.post('/collaborations/:collaborationId/join', asyncHandler(async (req, res) => {
  const { collaborationId } = req.params;
  const userId = req.user.id;
  try {
    const result = await researcherFeaturesService.joinCollaboration(collaborationId, userId, req.body);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error joining collaboration:', error);
    res.status(500).json({ success: false, error: 'Failed to join collaboration' });
  }
}));

router.post('/regulatory-submissions', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const submission = await researcherFeaturesService.createRegulatorySubmission(userId, req.body);
    res.status(201).json({ success: true, submission });
  } catch (error) {
    console.error('Error creating regulatory submission:', error);
    res.status(500).json({ success: false, error: 'Failed to create regulatory submission' });
  }
}));

router.get('/regulatory-submissions', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const submissions = await researcherFeaturesService.getRegulatorySubmissions(userId, req.query);
    res.json({ success: true, submissions });
  } catch (error) {
    console.error('Error getting regulatory submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to get regulatory submissions' });
  }
}));

router.get('/regulatory-submissions/:submissionId/compliance', asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user.id;
  try {
    const report = await researcherFeaturesService.generateComplianceReport(submissionId, userId);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating compliance report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate compliance report' });
  }
}));

router.post('/literature', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const entry = await researcherFeaturesService.addLiteratureEntry(userId, req.body);
    res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error('Error adding literature entry:', error);
    res.status(500).json({ success: false, error: 'Failed to add literature entry' });
  }
}));

router.get('/literature', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const literature = await researcherFeaturesService.getLiterature(userId, req.query);
    res.json({ success: true, literature });
  } catch (error) {
    console.error('Error getting literature:', error);
    res.status(500).json({ success: false, error: 'Failed to get literature' });
  }
}));

router.post('/literature/search', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const results = await researcherFeaturesService.searchLiterature(req.body, userId);
    res.json({ success: true, results });
  } catch (error) {
    console.error('Error searching literature:', error);
    res.status(500).json({ success: false, error: 'Failed to search literature' });
  }
}));

router.post('/grants', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const grant = await researcherFeaturesService.createGrantApplication(userId, req.body);
    res.status(201).json({ success: true, grant });
  } catch (error) {
    console.error('Error creating grant application:', error);
    res.status(500).json({ success: false, error: 'Failed to create grant application' });
  }
}));

router.get('/grants', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const grants = await researcherFeaturesService.getGrantApplications(userId, req.query);
    res.json({ success: true, grants });
  } catch (error) {
    console.error('Error getting grant applications:', error);
    res.status(500).json({ success: false, error: 'Failed to get grant applications' });
  }
}));

router.post('/grants/:grantId/milestones', asyncHandler(async (req, res) => {
  const { grantId } = req.params;
  const userId = req.user.id;
  try {
    const milestone = await researcherFeaturesService.updateGrantMilestone(grantId, req.body, userId);
    res.json({ success: true, milestone });
  } catch (error) {
    console.error('Error updating grant milestone:', error);
    res.status(500).json({ success: false, error: 'Failed to update grant milestone' });
  }
}));

router.post('/publications', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const publication = await researcherFeaturesService.createPublication(userId, req.body);
    res.status(201).json({ success: true, publication });
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ success: false, error: 'Failed to create publication' });
  }
}));

router.get('/publications', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const publications = await researcherFeaturesService.getPublications(userId, req.query);
    res.json({ success: true, publications });
  } catch (error) {
    console.error('Error getting publications:', error);
    res.status(500).json({ success: false, error: 'Failed to get publications' });
  }
}));

router.get('/analytics', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const analytics = await researcherFeaturesService.getResearcherAnalytics(userId, req.query);
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error getting researcher analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
}));

router.get('/insights', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const insights = await researcherFeaturesService.generateResearchInsights(userId, req.query);
    res.json({ success: true, insights });
  } catch (error) {
    console.error('Error generating research insights:', error);
    res.status(500).json({ success: false, error: 'Failed to generate insights' });
  }
}));

export default router;