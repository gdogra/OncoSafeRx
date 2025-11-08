/**
 * Student Features Service
 * Comprehensive medical education and learning management platform
 * OncoSafeRx - Generated 2024-11-08
 */

import supabaseService from '../config/supabase.js';

class StudentFeaturesService {
  constructor() {
    if (!supabaseService || !supabaseService.enabled) {
      throw new Error('Supabase service not available');
    }
    this.supabase = supabaseService.supabase;
  }

  // =============================================
  // 1. STUDENT PROFILE & ACADEMIC TRACKING
  // =============================================

  async createStudentProfile(userId, profileData) {
    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .insert({
          user_id: userId,
          ...profileData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Initialize learning streaks
      await this.initializeLearningStreaks(data.id);
      
      return data;
    } catch (error) {
      console.error('Error creating student profile:', error);
      throw error;
    }
  }

  async getStudentProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  async updateStudentProfile(userId, updates) {
    try {
      const { data, error } = await this.supabase
        .from('student_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  async getCompetencyProgress(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('student_competency_progress')
        .select(`
          *,
          competency:competency_id (
            competency_name,
            competency_category,
            description,
            learning_objectives
          )
        `)
        .eq('student_id', studentId)
        .order('assessment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching competency progress:', error);
      throw error;
    }
  }

  async updateCompetencyProgress(studentId, competencyId, progressData) {
    try {
      const { data, error } = await this.supabase
        .from('student_competency_progress')
        .upsert({
          student_id: studentId,
          competency_id: competencyId,
          ...progressData,
          assessment_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Award points for competency achievement
      if (progressData.proficiency_level === 'proficient' || progressData.proficiency_level === 'advanced') {
        await this.awardPoints(studentId, 'competency_mastery', 50, 
          `Achieved ${progressData.proficiency_level} level in competency`);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating competency progress:', error);
      throw error;
    }
  }

  // =============================================
  // 2. CASE-BASED LEARNING
  // =============================================

  async getEducationalCases(filters = {}) {
    try {
      let query = this.supabase
        .from('educational_cases')
        .select('*')
        .eq('is_active', true);

      if (filters.specialty) {
        query = query.eq('specialty', filters.specialty);
      }
      if (filters.difficulty_level) {
        query = query.eq('difficulty_level', filters.difficulty_level);
      }
      if (filters.target_year_level) {
        query = query.contains('target_year_level', [filters.target_year_level]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching educational cases:', error);
      throw error;
    }
  }

  async getCaseDetails(caseId) {
    try {
      const { data, error } = await this.supabase
        .from('educational_cases')
        .select('*')
        .eq('id', caseId)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Increment usage count
      await this.supabase
        .from('educational_cases')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', caseId);
      
      return data;
    } catch (error) {
      console.error('Error fetching case details:', error);
      throw error;
    }
  }

  async startCaseAttempt(studentId, caseId) {
    try {
      // Check for existing incomplete attempt
      const { data: existingAttempt } = await this.supabase
        .from('student_case_attempts')
        .select('id')
        .eq('student_id', studentId)
        .eq('case_id', caseId)
        .eq('status', 'in_progress')
        .single();

      if (existingAttempt) {
        return existingAttempt;
      }

      // Create new attempt
      const { data, error } = await this.supabase
        .from('student_case_attempts')
        .insert({
          student_id: studentId,
          case_id: caseId,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting case attempt:', error);
      throw error;
    }
  }

  async submitCaseStep(attemptId, stepData) {
    try {
      const { data, error } = await this.supabase
        .from('case_step_interactions')
        .insert({
          attempt_id: attemptId,
          ...stepData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting case step:', error);
      throw error;
    }
  }

  async completeCaseAttempt(attemptId, completionData) {
    try {
      const completionTime = new Date().toISOString();
      const timeSpent = Math.floor((new Date() - new Date(completionData.start_time)) / 1000 / 60);
      
      const { data, error } = await this.supabase
        .from('student_case_attempts')
        .update({
          completion_time: completionTime,
          time_spent_minutes: timeSpent,
          student_diagnosis: completionData.student_diagnosis,
          student_treatment_plan: completionData.student_treatment_plan,
          student_reasoning: completionData.student_reasoning,
          score: completionData.score,
          status: 'completed'
        })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Award points and update streaks
      const studentId = data.student_id;
      await this.awardPoints(studentId, 'case_completion', 
        Math.round(completionData.score || 0), 
        `Completed case with score ${completionData.score}`);
      
      await this.updateLearningStreak(studentId, 'case_completion');
      
      // Check for achievements
      await this.checkCaseAchievements(studentId, completionData.score);
      
      return data;
    } catch (error) {
      console.error('Error completing case attempt:', error);
      throw error;
    }
  }

  async getStudentCaseHistory(studentId, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('student_case_attempts')
        .select(`
          *,
          case:case_id (
            case_title,
            specialty,
            difficulty_level
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student case history:', error);
      throw error;
    }
  }

  // =============================================
  // 3. VIRTUAL CLINICAL ROTATIONS
  // =============================================

  async getAvailableRotations(programType, yearLevel) {
    try {
      const { data, error } = await this.supabase
        .from('virtual_rotations')
        .select('*')
        .eq('program_type', programType)
        .eq('is_active', true)
        .order('rotation_name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching available rotations:', error);
      throw error;
    }
  }

  async enrollInRotation(studentId, rotationId, enrollmentData) {
    try {
      const { data, error } = await this.supabase
        .from('student_rotation_assignments')
        .insert({
          student_id: studentId,
          rotation_id: rotationId,
          ...enrollmentData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error enrolling in rotation:', error);
      throw error;
    }
  }

  async logPatientEncounter(studentId, encounterData) {
    try {
      const { data, error } = await this.supabase
        .from('virtual_patient_encounters')
        .insert({
          student_id: studentId,
          ...encounterData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Award points for patient encounters
      await this.awardPoints(studentId, 'clinical_encounter', 25, 
        `Logged ${encounterData.encounter_type} encounter`);
      
      return data;
    } catch (error) {
      console.error('Error logging patient encounter:', error);
      throw error;
    }
  }

  async getRotationProgress(studentId, rotationId) {
    try {
      const [assignmentResult, encountersResult] = await Promise.all([
        this.supabase
          .from('student_rotation_assignments')
          .select(`
            *,
            rotation:rotation_id (
              rotation_name,
              required_activities,
              patient_encounters_required
            )
          `)
          .eq('student_id', studentId)
          .eq('rotation_id', rotationId)
          .single(),
        
        this.supabase
          .from('virtual_patient_encounters')
          .select('encounter_type, complexity_level')
          .eq('student_id', studentId)
          .eq('rotation_assignment_id', rotationId)
      ]);

      if (assignmentResult.error) throw assignmentResult.error;
      if (encountersResult.error) throw encountersResult.error;

      const assignment = assignmentResult.data;
      const encounters = encountersResult.data;

      return {
        assignment,
        encounters_completed: encounters.length,
        encounters_required: assignment.rotation.patient_encounters_required,
        progress_percentage: Math.min(100, 
          (encounters.length / assignment.rotation.patient_encounters_required) * 100)
      };
    } catch (error) {
      console.error('Error fetching rotation progress:', error);
      throw error;
    }
  }

  // =============================================
  // 4. ASSESSMENTS & TESTING
  // =============================================

  async getAvailableAssessments(programType, yearLevel) {
    try {
      const { data, error } = await this.supabase
        .from('assessments')
        .select('id, assessment_name, assessment_type, subject_area, total_questions, time_limit_minutes, passing_score')
        .eq('program_type', programType)
        .contains('year_level', [yearLevel])
        .eq('is_active', true)
        .gte('available_until', new Date().toISOString())
        .order('assessment_name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching available assessments:', error);
      throw error;
    }
  }

  async startAssessmentAttempt(studentId, assessmentId) {
    try {
      // Check attempt limits
      const { data: previousAttempts } = await this.supabase
        .from('student_assessment_attempts')
        .select('id')
        .eq('student_id', studentId)
        .eq('assessment_id', assessmentId);

      const { data: assessment } = await this.supabase
        .from('assessments')
        .select('max_attempts, allow_retakes')
        .eq('id', assessmentId)
        .single();

      if (assessment && !assessment.allow_retakes && previousAttempts.length > 0) {
        throw new Error('Retakes not allowed for this assessment');
      }

      if (assessment && previousAttempts.length >= assessment.max_attempts) {
        throw new Error('Maximum attempts exceeded');
      }

      const { data, error } = await this.supabase
        .from('student_assessment_attempts')
        .insert({
          student_id: studentId,
          assessment_id: assessmentId,
          attempt_number: previousAttempts.length + 1,
          answers: {},
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting assessment attempt:', error);
      throw error;
    }
  }

  async getAssessmentQuestions(assessmentId, randomize = true) {
    try {
      let query = this.supabase
        .from('assessment_questions')
        .select('id, question_number, question_type, question_text, question_image_url, answer_options, points, tags')
        .eq('assessment_id', assessmentId);

      if (randomize) {
        // In a real implementation, you'd randomize the order
        query = query.order('question_number');
      } else {
        query = query.order('question_number');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      throw error;
    }
  }

  async submitAssessmentAnswer(attemptId, questionId, answer) {
    try {
      // Get current answers
      const { data: attempt } = await this.supabase
        .from('student_assessment_attempts')
        .select('answers')
        .eq('id', attemptId)
        .single();

      const updatedAnswers = {
        ...attempt.answers,
        [questionId]: {
          answer,
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await this.supabase
        .from('student_assessment_attempts')
        .update({ answers: updatedAnswers })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error submitting assessment answer:', error);
      throw error;
    }
  }

  async completeAssessment(attemptId) {
    try {
      const completionTime = new Date().toISOString();
      
      // Get attempt data
      const { data: attempt } = await this.supabase
        .from('student_assessment_attempts')
        .select('student_id, assessment_id, answers, start_time')
        .eq('id', attemptId)
        .single();

      // Calculate score
      const scoreResult = await this.calculateAssessmentScore(attempt.assessment_id, attempt.answers);
      const timeSpent = Math.floor((new Date() - new Date(attempt.start_time)) / 1000 / 60);

      const { data, error } = await this.supabase
        .from('student_assessment_attempts')
        .update({
          completion_time: completionTime,
          time_spent_minutes: timeSpent,
          total_score: scoreResult.totalScore,
          percentage_score: scoreResult.percentageScore,
          passed: scoreResult.passed,
          feedback: scoreResult.feedback
        })
        .eq('id', attemptId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Award points and achievements
      await this.awardPoints(attempt.student_id, 'assessment_completion', 
        Math.round(scoreResult.percentageScore), 
        `Completed assessment with ${scoreResult.percentageScore}% score`);
      
      if (scoreResult.passed) {
        await this.checkAssessmentAchievements(attempt.student_id, scoreResult.percentageScore);
      }
      
      return { ...data, score_breakdown: scoreResult };
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  }

  async calculateAssessmentScore(assessmentId, studentAnswers) {
    try {
      // Get correct answers and scoring information
      const { data: questions } = await this.supabase
        .from('assessment_questions')
        .select('id, correct_answer, points, explanation')
        .eq('assessment_id', assessmentId);

      const { data: assessment } = await this.supabase
        .from('assessments')
        .select('passing_score')
        .eq('id', assessmentId)
        .single();

      let totalPossiblePoints = 0;
      let earnedPoints = 0;
      const feedback = [];

      questions.forEach(question => {
        totalPossiblePoints += question.points;
        const studentAnswer = studentAnswers[question.id]?.answer;
        
        if (studentAnswer && studentAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
          earnedPoints += question.points;
          feedback.push({
            questionId: question.id,
            correct: true,
            explanation: question.explanation
          });
        } else {
          feedback.push({
            questionId: question.id,
            correct: false,
            correctAnswer: question.correct_answer,
            explanation: question.explanation
          });
        }
      });

      const percentageScore = totalPossiblePoints > 0 ? (earnedPoints / totalPossiblePoints) * 100 : 0;
      const passed = percentageScore >= assessment.passing_score;

      return {
        totalScore: earnedPoints,
        totalPossiblePoints,
        percentageScore: Math.round(percentageScore * 100) / 100,
        passed,
        feedback
      };
    } catch (error) {
      console.error('Error calculating assessment score:', error);
      throw error;
    }
  }

  // =============================================
  // 5. MENTORSHIP & SUPERVISION
  // =============================================

  async createMentorshipRelationship(studentId, mentorId, relationshipData) {
    try {
      const { data, error } = await this.supabase
        .from('mentorship_relationships')
        .insert({
          student_id: studentId,
          mentor_id: mentorId,
          start_date: new Date().toISOString().split('T')[0],
          ...relationshipData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating mentorship relationship:', error);
      throw error;
    }
  }

  async logMentorshipMeeting(relationshipId, meetingData) {
    try {
      const { data, error } = await this.supabase
        .from('mentorship_meetings')
        .insert({
          relationship_id: relationshipId,
          ...meetingData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging mentorship meeting:', error);
      throw error;
    }
  }

  async getMentorshipHistory(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('mentorship_relationships')
        .select(`
          *,
          meetings:mentorship_meetings(*),
          mentor:mentor_id (
            email,
            user_metadata
          )
        `)
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching mentorship history:', error);
      throw error;
    }
  }

  // =============================================
  // 6. RESEARCH PROJECT MANAGEMENT
  // =============================================

  async createResearchProject(studentId, projectData) {
    try {
      const { data, error } = await this.supabase
        .from('student_research_projects')
        .insert({
          student_id: studentId,
          start_date: new Date().toISOString().split('T')[0],
          ...projectData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating research project:', error);
      throw error;
    }
  }

  async updateResearchProgress(projectId, progressData) {
    try {
      const { data, error } = await this.supabase
        .from('research_progress_updates')
        .insert({
          project_id: projectId,
          update_date: new Date().toISOString().split('T')[0],
          ...progressData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Award research points
      if (progressData.percentage_complete) {
        const studentProject = await this.supabase
          .from('student_research_projects')
          .select('student_id')
          .eq('id', projectId)
          .single();
        
        if (studentProject.data) {
          await this.awardPoints(studentProject.data.student_id, 'research_progress', 
            Math.round(progressData.percentage_complete / 10), 
            `Research project ${progressData.percentage_complete}% complete`);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error updating research progress:', error);
      throw error;
    }
  }

  async getResearchProjects(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('student_research_projects')
        .select(`
          *,
          progress_updates:research_progress_updates(*)
        `)
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching research projects:', error);
      throw error;
    }
  }

  // =============================================
  // 7. GAMIFICATION & ACHIEVEMENTS
  // =============================================

  async awardPoints(studentId, category, points, description) {
    try {
      const { data, error } = await this.supabase
        .from('student_points')
        .insert({
          student_id: studentId,
          point_category: category,
          points_earned: points,
          activity_description: description
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  async awardAchievement(studentId, achievementData) {
    try {
      const { data, error } = await this.supabase
        .from('student_achievements')
        .insert({
          student_id: studentId,
          ...achievementData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  async getStudentAchievements(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('student_achievements')
        .select('*')
        .eq('student_id', studentId)
        .order('earned_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching student achievements:', error);
      throw error;
    }
  }

  async getStudentPoints(studentId, timeframe = '30 days') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeframe === '30 days' ? 30 : 365));

      const { data, error } = await this.supabase
        .from('student_points')
        .select('*')
        .eq('student_id', studentId)
        .gte('earned_date', startDate.toISOString().split('T')[0])
        .order('earned_date', { ascending: false });
      
      if (error) throw error;
      
      const totalPoints = data.reduce((sum, point) => sum + point.points_earned, 0);
      const pointsByCategory = data.reduce((acc, point) => {
        acc[point.point_category] = (acc[point.point_category] || 0) + point.points_earned;
        return acc;
      }, {});

      return {
        total_points: totalPoints,
        recent_activities: data.slice(0, 10),
        points_by_category: pointsByCategory
      };
    } catch (error) {
      console.error('Error fetching student points:', error);
      throw error;
    }
  }

  async updateLearningStreak(studentId, streakType) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: streak } = await this.supabase
        .from('learning_streaks')
        .select('*')
        .eq('student_id', studentId)
        .eq('streak_type', streakType)
        .single();

      let updateData;
      if (streak) {
        const lastActivity = new Date(streak.last_activity_date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (streak.last_activity_date === today) {
          // Already updated today
          return streak;
        } else if (lastActivity.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          // Consecutive day
          updateData = {
            current_streak: streak.current_streak + 1,
            longest_streak: Math.max(streak.longest_streak, streak.current_streak + 1),
            last_activity_date: today
          };
        } else {
          // Streak broken, start new
          updateData = {
            current_streak: 1,
            last_activity_date: today,
            streak_start_date: today
          };
        }

        const { data, error } = await this.supabase
          .from('learning_streaks')
          .update(updateData)
          .eq('student_id', studentId)
          .eq('streak_type', streakType)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new streak
        const { data, error } = await this.supabase
          .from('learning_streaks')
          .insert({
            student_id: studentId,
            streak_type: streakType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today,
            streak_start_date: today
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error updating learning streak:', error);
      throw error;
    }
  }

  async initializeLearningStreaks(studentId) {
    try {
      const streakTypes = ['daily_login', 'case_completion', 'assessment_taking'];
      
      for (const streakType of streakTypes) {
        await this.supabase
          .from('learning_streaks')
          .insert({
            student_id: studentId,
            streak_type: streakType,
            current_streak: 0,
            longest_streak: 0
          });
      }
    } catch (error) {
      console.error('Error initializing learning streaks:', error);
    }
  }

  async checkCaseAchievements(studentId, score) {
    try {
      if (score >= 95) {
        await this.awardAchievement(studentId, {
          achievement_type: 'perfect_score',
          achievement_name: 'Case Master',
          description: 'Achieved perfect score on case study',
          points_awarded: 100,
          category: 'academic',
          rarity: 'rare'
        });
      }

      // Check for case completion milestones
      const { data: attempts } = await this.supabase
        .from('student_case_attempts')
        .select('id')
        .eq('student_id', studentId)
        .eq('status', 'completed');

      if (attempts && [10, 25, 50, 100].includes(attempts.length)) {
        await this.awardAchievement(studentId, {
          achievement_type: 'case_milestone',
          achievement_name: `${attempts.length} Cases Completed`,
          description: `Completed ${attempts.length} case studies`,
          points_awarded: attempts.length * 2,
          category: 'academic',
          rarity: attempts.length >= 50 ? 'epic' : 'uncommon'
        });
      }
    } catch (error) {
      console.error('Error checking case achievements:', error);
    }
  }

  async checkAssessmentAchievements(studentId, score) {
    try {
      if (score === 100) {
        await this.awardAchievement(studentId, {
          achievement_type: 'perfect_assessment',
          achievement_name: 'Perfect Scholar',
          description: 'Achieved 100% on assessment',
          points_awarded: 150,
          category: 'academic',
          rarity: 'epic'
        });
      }
    } catch (error) {
      console.error('Error checking assessment achievements:', error);
    }
  }

  // =============================================
  // 8. PEER COLLABORATION
  // =============================================

  async createStudyGroup(studentId, groupData) {
    try {
      const { data, error } = await this.supabase
        .from('study_groups')
        .insert({
          created_by: studentId,
          ...groupData
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add creator as first member
      await this.supabase
        .from('study_group_memberships')
        .insert({
          group_id: data.id,
          student_id: studentId,
          role: 'admin'
        });
      
      return data;
    } catch (error) {
      console.error('Error creating study group:', error);
      throw error;
    }
  }

  async joinStudyGroup(studentId, groupId) {
    try {
      const { data, error } = await this.supabase
        .from('study_group_memberships')
        .insert({
          group_id: groupId,
          student_id: studentId,
          role: 'member'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining study group:', error);
      throw error;
    }
  }

  async getStudyGroups(filters = {}) {
    try {
      let query = this.supabase
        .from('study_groups')
        .select(`
          *,
          member_count:study_group_memberships(count)
        `)
        .eq('is_active', true);

      if (filters.program_type) {
        query = query.eq('program_type', filters.program_type);
      }
      if (filters.year_level) {
        query = query.eq('year_level', filters.year_level);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching study groups:', error);
      throw error;
    }
  }

  // =============================================
  // 9. PERFORMANCE ANALYTICS
  // =============================================

  async generateStudentAnalytics(studentId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Get various performance metrics
      const [casesResult, assessmentsResult, pointsResult, streaksResult] = await Promise.all([
        this.supabase
          .from('student_case_attempts')
          .select('score, completion_time, time_spent_minutes')
          .eq('student_id', studentId)
          .eq('status', 'completed')
          .gte('completion_time', thirtyDaysAgo.toISOString()),

        this.supabase
          .from('student_assessment_attempts')
          .select('percentage_score, passed, time_spent_minutes')
          .eq('student_id', studentId)
          .gte('completion_time', thirtyDaysAgo.toISOString()),

        this.supabase
          .from('student_points')
          .select('points_earned, point_category')
          .eq('student_id', studentId)
          .gte('earned_date', thirtyDaysAgoStr),

        this.supabase
          .from('learning_streaks')
          .select('*')
          .eq('student_id', studentId)
      ]);

      const cases = casesResult.data || [];
      const assessments = assessmentsResult.data || [];
      const points = pointsResult.data || [];
      const streaks = streaksResult.data || [];

      // Calculate analytics
      const analytics = {
        cases_completed: cases.length,
        average_case_score: cases.length > 0 
          ? cases.reduce((sum, c) => sum + (c.score || 0), 0) / cases.length 
          : 0,
        
        assessments_taken: assessments.length,
        average_assessment_score: assessments.length > 0
          ? assessments.reduce((sum, a) => sum + (a.percentage_score || 0), 0) / assessments.length
          : 0,
        assessment_pass_rate: assessments.length > 0
          ? assessments.filter(a => a.passed).length / assessments.length * 100
          : 0,

        total_points_earned: points.reduce((sum, p) => sum + p.points_earned, 0),
        points_by_category: points.reduce((acc, p) => {
          acc[p.point_category] = (acc[p.point_category] || 0) + p.points_earned;
          return acc;
        }, {}),

        current_streaks: streaks.reduce((acc, s) => {
          acc[s.streak_type] = s.current_streak;
          return acc;
        }, {}),
        
        longest_streaks: streaks.reduce((acc, s) => {
          acc[s.streak_type] = s.longest_streak;
          return acc;
        }, {}),

        total_study_time_minutes: cases.reduce((sum, c) => sum + (c.time_spent_minutes || 0), 0) +
                                  assessments.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0)
      };

      // Calculate engagement score (1-100)
      analytics.engagement_score = this.calculateEngagementScore(analytics);

      // Calculate learning velocity
      analytics.learning_velocity_score = this.calculateLearningVelocity(analytics);

      // Store analytics
      await this.supabase
        .from('student_analytics')
        .upsert({
          student_id: studentId,
          analytics_date: today,
          ...analytics
        });

      return analytics;
    } catch (error) {
      console.error('Error generating student analytics:', error);
      throw error;
    }
  }

  calculateEngagementScore(analytics) {
    let score = 0;
    
    // Activity frequency (40 points max)
    if (analytics.cases_completed > 0) score += Math.min(20, analytics.cases_completed * 2);
    if (analytics.assessments_taken > 0) score += Math.min(20, analytics.assessments_taken * 4);
    
    // Performance quality (30 points max)
    if (analytics.average_case_score > 0) score += Math.min(15, analytics.average_case_score / 100 * 15);
    if (analytics.average_assessment_score > 0) score += Math.min(15, analytics.average_assessment_score / 100 * 15);
    
    // Consistency/streaks (30 points max)
    const streakPoints = Object.values(analytics.current_streaks || {})
      .reduce((sum, streak) => sum + Math.min(5, streak), 0);
    score += Math.min(30, streakPoints);

    return Math.round(Math.min(100, score));
  }

  calculateLearningVelocity(analytics) {
    // Simple velocity calculation based on completion rate and time efficiency
    const caseVelocity = analytics.cases_completed > 0 
      ? analytics.cases_completed / Math.max(1, analytics.total_study_time_minutes / 60) 
      : 0;
    
    const assessmentVelocity = analytics.assessments_taken > 0
      ? analytics.assessments_taken / 30 // per month
      : 0;

    return Math.round((caseVelocity * 2 + assessmentVelocity) * 10) / 10;
  }

  async generateLearningRecommendations(studentId) {
    try {
      // Get student analytics and profile
      const analytics = await this.generateStudentAnalytics(studentId);
      const profile = await this.getStudentProfile(studentId);

      const recommendations = [];

      // Performance-based recommendations
      if (analytics.average_case_score < 70) {
        recommendations.push({
          recommendation_type: 'case_study',
          recommendation_text: 'Focus on foundational case studies to improve diagnostic skills',
          reasoning: 'Case study scores below target performance',
          priority_level: 3,
          estimated_time_minutes: 45
        });
      }

      // Engagement-based recommendations
      if (analytics.engagement_score < 50) {
        recommendations.push({
          recommendation_type: 'study_group',
          recommendation_text: 'Join a study group to increase engagement and peer learning',
          reasoning: 'Low engagement score indicates need for collaborative learning',
          priority_level: 2,
          estimated_time_minutes: 30
        });
      }

      // Streak-based recommendations
      const maxStreak = Math.max(...Object.values(analytics.current_streaks || {}));
      if (maxStreak === 0) {
        recommendations.push({
          recommendation_type: 'daily_activity',
          recommendation_text: 'Start with daily login streak to build consistent learning habits',
          reasoning: 'No active learning streaks detected',
          priority_level: 4,
          estimated_time_minutes: 15
        });
      }

      // Store recommendations
      for (const rec of recommendations) {
        await this.supabase
          .from('learning_recommendations')
          .insert({
            student_id: studentId,
            ...rec
          });
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating learning recommendations:', error);
      throw error;
    }
  }

  // =============================================
  // 10. STUDENT DASHBOARD
  // =============================================

  async getStudentDashboard(studentId) {
    try {
      const [
        profile,
        analytics,
        recentCases,
        upcomingAssessments,
        achievements,
        points,
        streaks,
        mentorships,
        rotations,
        recommendations
      ] = await Promise.allSettled([
        this.getStudentProfile(studentId),
        this.generateStudentAnalytics(studentId),
        this.getStudentCaseHistory(studentId, 5),
        this.getUpcomingAssessments(studentId),
        this.getStudentAchievements(studentId),
        this.getStudentPoints(studentId),
        this.getLearningStreaks(studentId),
        this.getMentorshipHistory(studentId),
        this.getCurrentRotations(studentId),
        this.getLearningRecommendations(studentId, 5)
      ]);

      return {
        profile: profile.status === 'fulfilled' ? profile.value : null,
        analytics: analytics.status === 'fulfilled' ? analytics.value : {},
        recent_cases: recentCases.status === 'fulfilled' ? recentCases.value : [],
        upcoming_assessments: upcomingAssessments.status === 'fulfilled' ? upcomingAssessments.value : [],
        recent_achievements: achievements.status === 'fulfilled' ? achievements.value.slice(0, 5) : [],
        points_summary: points.status === 'fulfilled' ? points.value : { total_points: 0 },
        learning_streaks: streaks.status === 'fulfilled' ? streaks.value : [],
        mentorships: mentorships.status === 'fulfilled' ? mentorships.value : [],
        current_rotations: rotations.status === 'fulfilled' ? rotations.value : [],
        recommendations: recommendations.status === 'fulfilled' ? recommendations.value : []
      };
    } catch (error) {
      console.error('Error generating student dashboard:', error);
      throw error;
    }
  }

  async getUpcomingAssessments(studentId) {
    try {
      const profile = await this.getStudentProfile(studentId);
      const assessments = await this.getAvailableAssessments(profile.program_type, profile.year_level);
      
      return assessments.slice(0, 5); // Next 5 upcoming
    } catch (error) {
      console.error('Error fetching upcoming assessments:', error);
      return [];
    }
  }

  async getLearningStreaks(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('learning_streaks')
        .select('*')
        .eq('student_id', studentId);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching learning streaks:', error);
      return [];
    }
  }

  async getCurrentRotations(studentId) {
    try {
      const { data, error } = await this.supabase
        .from('student_rotation_assignments')
        .select(`
          *,
          rotation:rotation_id (
            rotation_name,
            specialty
          )
        `)
        .eq('student_id', studentId)
        .eq('status', 'active');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching current rotations:', error);
      return [];
    }
  }

  async getLearningRecommendations(studentId, limit = 5) {
    try {
      const { data, error } = await this.supabase
        .from('learning_recommendations')
        .select('*')
        .eq('student_id', studentId)
        .eq('acted_upon', false)
        .order('priority_level', { ascending: false })
        .order('generated_date', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching learning recommendations:', error);
      return [];
    }
  }
}

export default new StudentFeaturesService();