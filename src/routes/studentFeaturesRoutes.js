/**
 * Student Features API Routes
 * Comprehensive medical education and learning management platform
 * OncoSafeRx - Generated 2024-11-08
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import studentFeaturesService from '../services/studentFeaturesService.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// =============================================
// 1. STUDENT PROFILE & ACADEMIC TRACKING
// =============================================

// Create student profile
router.post('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.createStudentProfile(userId, req.body);
  res.status(201).json({ success: true, profile });
}));

// Get student profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  res.json({ success: true, profile });
}));

// Update student profile
router.put('/profile', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.updateStudentProfile(userId, req.body);
  res.json({ success: true, profile });
}));

// Get competency progress
router.get('/competencies/progress', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const progress = await studentFeaturesService.getCompetencyProgress(profile.id);
  res.json({ success: true, progress });
}));

// Update competency progress
router.put('/competencies/:competencyId/progress', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { competencyId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const progress = await studentFeaturesService.updateCompetencyProgress(profile.id, competencyId, req.body);
  res.json({ success: true, progress });
}));

// =============================================
// 2. CASE-BASED LEARNING
// =============================================

// Get educational cases
router.get('/cases', asyncHandler(async (req, res) => {
  const cases = await studentFeaturesService.getEducationalCases(req.query);
  res.json({ success: true, cases });
}));

// Get specific case details
router.get('/cases/:caseId', asyncHandler(async (req, res) => {
  const { caseId } = req.params;
  const caseDetails = await studentFeaturesService.getCaseDetails(caseId);
  res.json({ success: true, case: caseDetails });
}));

// Start case attempt
router.post('/cases/:caseId/attempts', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { caseId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const attempt = await studentFeaturesService.startCaseAttempt(profile.id, caseId);
  res.status(201).json({ success: true, attempt });
}));

// Submit case step
router.post('/cases/attempts/:attemptId/steps', asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const stepResult = await studentFeaturesService.submitCaseStep(attemptId, req.body);
  res.status(201).json({ success: true, step: stepResult });
}));

// Complete case attempt
router.put('/cases/attempts/:attemptId/complete', asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const completedAttempt = await studentFeaturesService.completeCaseAttempt(attemptId, req.body);
  res.json({ success: true, attempt: completedAttempt });
}));

// Get student case history
router.get('/cases/history', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const { limit = 20 } = req.query;
  const history = await studentFeaturesService.getStudentCaseHistory(profile.id, parseInt(limit));
  res.json({ success: true, history });
}));

// =============================================
// 3. VIRTUAL CLINICAL ROTATIONS
// =============================================

// Get available rotations
router.get('/rotations/available', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const rotations = await studentFeaturesService.getAvailableRotations(profile.program_type, profile.year_level);
  res.json({ success: true, rotations });
}));

// Enroll in rotation
router.post('/rotations/:rotationId/enroll', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { rotationId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const enrollment = await studentFeaturesService.enrollInRotation(profile.id, rotationId, req.body);
  res.status(201).json({ success: true, enrollment });
}));

// Log patient encounter
router.post('/rotations/encounters', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const encounter = await studentFeaturesService.logPatientEncounter(profile.id, req.body);
  res.status(201).json({ success: true, encounter });
}));

// Get rotation progress
router.get('/rotations/:rotationId/progress', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { rotationId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const progress = await studentFeaturesService.getRotationProgress(profile.id, rotationId);
  res.json({ success: true, progress });
}));

// =============================================
// 4. ASSESSMENTS & TESTING
// =============================================

// Get available assessments
router.get('/assessments', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const assessments = await studentFeaturesService.getAvailableAssessments(profile.program_type, profile.year_level);
  res.json({ success: true, assessments });
}));

// Start assessment attempt
router.post('/assessments/:assessmentId/attempts', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { assessmentId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const attempt = await studentFeaturesService.startAssessmentAttempt(profile.id, assessmentId);
  res.status(201).json({ success: true, attempt });
}));

// Get assessment questions
router.get('/assessments/:assessmentId/questions', asyncHandler(async (req, res) => {
  const { assessmentId } = req.params;
  const { randomize = true } = req.query;
  const questions = await studentFeaturesService.getAssessmentQuestions(assessmentId, randomize === 'true');
  res.json({ success: true, questions });
}));

// Submit assessment answer
router.post('/assessments/attempts/:attemptId/answers', asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { question_id, answer } = req.body;
  const result = await studentFeaturesService.submitAssessmentAnswer(attemptId, question_id, answer);
  res.json({ success: true, result });
}));

// Complete assessment
router.put('/assessments/attempts/:attemptId/complete', asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const result = await studentFeaturesService.completeAssessment(attemptId);
  res.json({ success: true, result });
}));

// =============================================
// 5. MENTORSHIP & SUPERVISION
// =============================================

// Create mentorship relationship
router.post('/mentorship', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const { mentor_id, ...relationshipData } = req.body;
  const relationship = await studentFeaturesService.createMentorshipRelationship(profile.id, mentor_id, relationshipData);
  res.status(201).json({ success: true, relationship });
}));

// Log mentorship meeting
router.post('/mentorship/:relationshipId/meetings', asyncHandler(async (req, res) => {
  const { relationshipId } = req.params;
  const meeting = await studentFeaturesService.logMentorshipMeeting(relationshipId, req.body);
  res.status(201).json({ success: true, meeting });
}));

// Get mentorship history
router.get('/mentorship', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const history = await studentFeaturesService.getMentorshipHistory(profile.id);
  res.json({ success: true, mentorships: history });
}));

// =============================================
// 6. RESEARCH PROJECT MANAGEMENT
// =============================================

// Create research project
router.post('/research', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const project = await studentFeaturesService.createResearchProject(profile.id, req.body);
  res.status(201).json({ success: true, project });
}));

// Update research progress
router.post('/research/:projectId/progress', asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const progress = await studentFeaturesService.updateResearchProgress(projectId, req.body);
  res.status(201).json({ success: true, progress });
}));

// Get research projects
router.get('/research', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const projects = await studentFeaturesService.getResearchProjects(profile.id);
  res.json({ success: true, projects });
}));

// =============================================
// 7. GAMIFICATION & ACHIEVEMENTS
// =============================================

// Get student achievements
router.get('/achievements', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const achievements = await studentFeaturesService.getStudentAchievements(profile.id);
  res.json({ success: true, achievements });
}));

// Get student points
router.get('/points', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const { timeframe = '30 days' } = req.query;
  const points = await studentFeaturesService.getStudentPoints(profile.id, timeframe);
  res.json({ success: true, points });
}));

// Get learning streaks
router.get('/streaks', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const streaks = await studentFeaturesService.getLearningStreaks(profile.id);
  res.json({ success: true, streaks });
}));

// =============================================
// 8. PEER COLLABORATION
// =============================================

// Create study group
router.post('/study-groups', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const group = await studentFeaturesService.createStudyGroup(profile.id, req.body);
  res.status(201).json({ success: true, group });
}));

// Join study group
router.post('/study-groups/:groupId/join', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { groupId } = req.params;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const membership = await studentFeaturesService.joinStudyGroup(profile.id, groupId);
  res.status(201).json({ success: true, membership });
}));

// Get study groups
router.get('/study-groups', asyncHandler(async (req, res) => {
  const groups = await studentFeaturesService.getStudyGroups(req.query);
  res.json({ success: true, groups });
}));

// =============================================
// 9. PERFORMANCE ANALYTICS
// =============================================

// Get student analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const analytics = await studentFeaturesService.generateStudentAnalytics(profile.id);
  res.json({ success: true, analytics });
}));

// Generate learning recommendations
router.get('/recommendations', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  const recommendations = await studentFeaturesService.generateLearningRecommendations(profile.id);
  res.json({ success: true, recommendations });
}));

// =============================================
// 10. COMPREHENSIVE DASHBOARD
// =============================================

// Student dashboard
router.get('/dashboard', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  try {
    const profile = await studentFeaturesService.getStudentProfile(userId);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }
    
    const dashboard = await studentFeaturesService.getStudentDashboard(profile.id);
    res.json({ success: true, dashboard });
  } catch (error) {
    console.error('Error generating student dashboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate dashboard',
      message: error.message 
    });
  }
}));

// =============================================
// 11. LEARNING PATH & CURRICULUM
// =============================================

// Get personalized learning path
router.get('/learning-path', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  
  // Generate personalized learning path based on competencies and progress
  const competencyProgress = await studentFeaturesService.getCompetencyProgress(profile.id);
  const analytics = await studentFeaturesService.generateStudentAnalytics(profile.id);
  
  // Simple learning path algorithm
  const learningPath = {
    current_level: profile.year_level,
    specialization: profile.specialization,
    completed_competencies: competencyProgress.filter(c => c.proficiency_level === 'proficient' || c.proficiency_level === 'advanced').length,
    total_competencies: competencyProgress.length,
    recommended_next_steps: [
      {
        type: 'case_study',
        title: 'Advanced Oncology Cases',
        description: 'Build on current diagnostic skills',
        priority: 'high',
        estimated_time: '2 hours'
      },
      {
        type: 'assessment',
        title: 'Clinical Knowledge Assessment',
        description: 'Validate current competency level',
        priority: 'medium',
        estimated_time: '1 hour'
      }
    ],
    progress_percentage: competencyProgress.length > 0 
      ? Math.round((competencyProgress.filter(c => c.proficiency_level === 'proficient' || c.proficiency_level === 'advanced').length / competencyProgress.length) * 100)
      : 0
  };
  
  res.json({ success: true, learning_path: learningPath });
}));

// =============================================
// 12. CAREER DEVELOPMENT
// =============================================

// Get career guidance
router.get('/career/guidance', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  
  const analytics = await studentFeaturesService.generateStudentAnalytics(profile.id);
  
  const guidance = {
    current_specialization: profile.specialization,
    career_goals: profile.career_goals,
    strengths: [],
    areas_for_development: [],
    recommended_rotations: [
      'Medical Oncology',
      'Radiation Oncology',
      'Surgical Oncology'
    ],
    networking_opportunities: [
      'ASCO Annual Meeting',
      'Local Oncology Society Events',
      'Research Symposiums'
    ],
    skill_recommendations: []
  };
  
  // Analyze performance to identify strengths
  if (analytics.average_case_score > 85) {
    guidance.strengths.push('Diagnostic Excellence');
  }
  if (analytics.engagement_score > 80) {
    guidance.strengths.push('High Engagement & Dedication');
  }
  
  // Identify areas for development
  if (analytics.average_assessment_score < 75) {
    guidance.areas_for_development.push('Knowledge Base Strengthening');
  }
  if (analytics.current_streaks && Object.values(analytics.current_streaks).every(s => s < 5)) {
    guidance.areas_for_development.push('Consistent Study Habits');
  }
  
  res.json({ success: true, career_guidance: guidance });
}));

// Get residency preparation
router.get('/career/residency-prep', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  
  const residencyPrep = {
    target_specialty: profile.specialization || 'Oncology',
    application_timeline: [
      {
        date: 'September (MS4)',
        task: 'ERAS Application Submission',
        status: 'upcoming'
      },
      {
        date: 'October-February',
        task: 'Interview Season',
        status: 'upcoming'
      },
      {
        date: 'March',
        task: 'Match Day',
        status: 'upcoming'
      }
    ],
    required_rotations: [
      'Internal Medicine',
      'Oncology Electives',
      'Research Rotation'
    ],
    board_exam_prep: {
      step_1_target: 240,
      step_2_ck_target: 250,
      recommended_resources: [
        'UWorld Question Bank',
        'First Aid Step 1/2',
        'OncoSafeRx Clinical Cases'
      ]
    },
    research_requirements: {
      publications_recommended: 2,
      poster_presentations: 1,
      current_projects: profile.research_interests || []
    }
  };
  
  res.json({ success: true, residency_prep: residencyPrep });
}));

// =============================================
// LEADERBOARDS & COMPETITION
// =============================================

// Get leaderboards
router.get('/leaderboards', asyncHandler(async (req, res) => {
  const { category = 'points', timeframe = 'month', program_type, year_level } = req.query;
  
  // This would typically query student rankings
  const leaderboard = {
    category,
    timeframe,
    rankings: [
      { rank: 1, student_name: 'Top Performer', points: 1500, program: 'Medical School', year: 4 },
      { rank: 2, student_name: 'Second Place', points: 1350, program: 'Medical School', year: 4 },
      { rank: 3, student_name: 'Third Place', points: 1200, program: 'Medical School', year: 3 }
    ],
    user_rank: null, // Would be populated with current user's rank
    total_participants: 150
  };
  
  res.json({ success: true, leaderboard });
}));

// Get peer comparisons
router.get('/peer-comparison', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await studentFeaturesService.getStudentProfile(userId);
  if (!profile) {
    return res.status(404).json({ success: false, error: 'Student profile not found' });
  }
  
  const analytics = await studentFeaturesService.generateStudentAnalytics(profile.id);
  
  // Mock peer comparison data
  const comparison = {
    your_performance: {
      case_completion_rate: analytics.cases_completed || 0,
      average_score: analytics.average_case_score || 0,
      engagement_score: analytics.engagement_score || 0
    },
    peer_averages: {
      case_completion_rate: 15,
      average_score: 78,
      engagement_score: 65
    },
    percentile_rank: {
      overall: 75,
      case_performance: 80,
      engagement: 85
    },
    comparison_group: `${profile.program_type} - Year ${profile.year_level}`
  };
  
  res.json({ success: true, peer_comparison: comparison });
}));

export default router;