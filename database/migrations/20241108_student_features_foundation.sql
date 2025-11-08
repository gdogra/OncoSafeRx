/**
 * Student Features Foundation Schema
 * Comprehensive medical education and learning management platform
 * OncoSafeRx - Generated 2024-11-08
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. STUDENT PROFILES & ACADEMIC TRACKING
-- =============================================

-- Student academic profiles and program tracking
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  program_type VARCHAR(100) NOT NULL, -- medical_school, residency, fellowship, nursing, pharmacy
  year_level INTEGER NOT NULL,
  school_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100), -- oncology, internal_medicine, surgery, etc.
  enrollment_date DATE NOT NULL,
  expected_graduation DATE,
  current_rotation VARCHAR(100),
  academic_advisor_id UUID REFERENCES auth.users(id),
  gpa DECIMAL(3,2),
  class_rank INTEGER,
  honors_distinctions TEXT[],
  research_interests TEXT[],
  career_goals TEXT,
  learning_style VARCHAR(50), -- visual, auditory, kinesthetic, mixed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic competency tracking and milestones
CREATE TABLE IF NOT EXISTS academic_competencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competency_name VARCHAR(255) NOT NULL,
  competency_category VARCHAR(100) NOT NULL, -- knowledge, skills, attitudes, professionalism
  program_type VARCHAR(100) NOT NULL,
  year_level INTEGER,
  description TEXT NOT NULL,
  learning_objectives JSONB NOT NULL,
  assessment_criteria JSONB NOT NULL,
  required_for_promotion BOOLEAN DEFAULT false,
  prerequisites UUID[],
  estimated_hours INTEGER,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student competency progress tracking
CREATE TABLE IF NOT EXISTS student_competency_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  competency_id UUID NOT NULL REFERENCES academic_competencies(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(50) NOT NULL, -- novice, developing, proficient, advanced, expert
  assessment_score DECIMAL(5,2),
  assessment_date DATE,
  assessed_by UUID REFERENCES auth.users(id),
  assessment_method VARCHAR(100), -- exam, practical, observation, portfolio
  notes TEXT,
  remediation_required BOOLEAN DEFAULT false,
  completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, competency_id)
);

-- =============================================
-- 2. INTERACTIVE CASE-BASED LEARNING
-- =============================================

-- Clinical case library for education
CREATE TABLE IF NOT EXISTS educational_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_title VARCHAR(255) NOT NULL,
  case_type VARCHAR(100) NOT NULL, -- diagnosis, treatment, ethics, emergency
  specialty VARCHAR(100) NOT NULL,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  target_year_level INTEGER[],
  patient_presentation JSONB NOT NULL, -- age, sex, chief_complaint, history, physical_exam
  case_progression JSONB NOT NULL, -- sequential case development
  learning_objectives TEXT[],
  key_concepts TEXT[],
  differential_diagnosis TEXT[],
  correct_diagnosis TEXT,
  treatment_plan JSONB,
  case_discussion TEXT,
  evidence_references TEXT[],
  author_id UUID REFERENCES auth.users(id),
  peer_reviewed BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  estimated_time_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student case attempt tracking and performance
CREATE TABLE IF NOT EXISTS student_case_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES educational_cases(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_time TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  student_diagnosis TEXT,
  student_treatment_plan JSONB,
  student_reasoning TEXT,
  score DECIMAL(5,2),
  feedback TEXT,
  areas_for_improvement TEXT[],
  status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case step interactions and decision tracking
CREATE TABLE IF NOT EXISTS case_step_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES student_case_attempts(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_type VARCHAR(100) NOT NULL, -- history_taking, physical_exam, diagnostic_test, treatment_decision
  student_action JSONB NOT NULL,
  is_correct BOOLEAN,
  points_awarded INTEGER DEFAULT 0,
  hint_used BOOLEAN DEFAULT false,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. VIRTUAL CLINICAL ROTATIONS
-- =============================================

-- Virtual rotation schedules and tracking
CREATE TABLE IF NOT EXISTS virtual_rotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rotation_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  program_type VARCHAR(100) NOT NULL,
  duration_weeks INTEGER NOT NULL,
  learning_objectives TEXT[],
  required_activities JSONB NOT NULL,
  assessment_methods TEXT[],
  supervising_faculty UUID[] REFERENCES auth.users(id),
  patient_encounters_required INTEGER DEFAULT 10,
  procedures_required TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student rotation assignments and progress
CREATE TABLE IF NOT EXISTS student_rotation_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  rotation_id UUID NOT NULL REFERENCES virtual_rotations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  supervising_faculty_id UUID REFERENCES auth.users(id),
  rotation_goals TEXT[],
  status VARCHAR(50) DEFAULT 'active', -- active, completed, incomplete, deferred
  mid_rotation_evaluation JSONB,
  final_evaluation JSONB,
  student_reflection TEXT,
  grade VARCHAR(10), -- A, B, C, D, F, P, F (Pass/Fail)
  honors BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Virtual patient encounters during rotations
CREATE TABLE IF NOT EXISTS virtual_patient_encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  rotation_assignment_id UUID REFERENCES student_rotation_assignments(id),
  encounter_type VARCHAR(100) NOT NULL, -- admission, consultation, follow_up, procedure
  patient_demographics JSONB NOT NULL,
  chief_complaint TEXT,
  history_obtained JSONB,
  physical_exam_findings JSONB,
  diagnostic_tests_ordered TEXT[],
  differential_diagnosis TEXT[],
  treatment_plan JSONB,
  student_notes TEXT,
  faculty_feedback TEXT,
  encounter_date DATE DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  complexity_level INTEGER DEFAULT 1, -- 1-5 scale
  learning_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. ASSESSMENTS & TESTING
-- =============================================

-- Assessment and examination system
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_name VARCHAR(255) NOT NULL,
  assessment_type VARCHAR(100) NOT NULL, -- quiz, midterm, final, osce, board_prep, competency
  subject_area VARCHAR(100) NOT NULL,
  program_type VARCHAR(100) NOT NULL,
  year_level INTEGER[],
  total_questions INTEGER NOT NULL,
  time_limit_minutes INTEGER,
  passing_score DECIMAL(5,2) DEFAULT 70.0,
  instructions TEXT,
  randomize_questions BOOLEAN DEFAULT true,
  allow_retakes BOOLEAN DEFAULT false,
  max_attempts INTEGER DEFAULT 1,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment questions and answers
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false, short_answer, essay, image_based
  question_text TEXT NOT NULL,
  question_image_url TEXT,
  answer_options JSONB, -- for multiple choice questions
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  learning_objective TEXT,
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  points INTEGER DEFAULT 1,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student assessment attempts and scores
CREATE TABLE IF NOT EXISTS student_assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  attempt_number INTEGER DEFAULT 1,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_time TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  total_score DECIMAL(5,2),
  percentage_score DECIMAL(5,2),
  passed BOOLEAN DEFAULT false,
  answers JSONB NOT NULL, -- student's answers
  feedback TEXT,
  remediation_suggested TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. MENTORSHIP & SUPERVISION
-- =============================================

-- Mentorship relationships and tracking
CREATE TABLE IF NOT EXISTS mentorship_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type VARCHAR(100) NOT NULL, -- academic, research, clinical, career
  start_date DATE NOT NULL,
  end_date DATE,
  meeting_frequency VARCHAR(50), -- weekly, bi_weekly, monthly, as_needed
  mentorship_goals TEXT[],
  status VARCHAR(50) DEFAULT 'active', -- active, completed, paused, terminated
  student_satisfaction_rating INTEGER, -- 1-5 scale
  mentor_satisfaction_rating INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship meeting logs and progress tracking
CREATE TABLE IF NOT EXISTS mentorship_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID NOT NULL REFERENCES mentorship_relationships(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  meeting_type VARCHAR(50) NOT NULL, -- in_person, virtual, phone, email
  duration_minutes INTEGER,
  topics_discussed TEXT[],
  goals_reviewed TEXT[],
  action_items TEXT[],
  student_reflection TEXT,
  mentor_notes TEXT,
  next_meeting_date DATE,
  meeting_rating INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty evaluations of students
CREATE TABLE IF NOT EXISTS faculty_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluation_context VARCHAR(100) NOT NULL, -- rotation, research, clinical_skills, professionalism
  evaluation_date DATE NOT NULL,
  competency_ratings JSONB NOT NULL, -- structured competency assessments
  strengths TEXT[],
  areas_for_improvement TEXT[],
  specific_feedback TEXT,
  overall_rating INTEGER, -- 1-5 scale
  recommendations TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. RESEARCH PROJECT MANAGEMENT
-- =============================================

-- Student research projects and thesis tracking
CREATE TABLE IF NOT EXISTS student_research_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  project_title VARCHAR(255) NOT NULL,
  project_type VARCHAR(100) NOT NULL, -- thesis, dissertation, research_paper, poster, capstone
  research_area VARCHAR(100),
  primary_advisor_id UUID REFERENCES auth.users(id),
  committee_members UUID[],
  start_date DATE NOT NULL,
  expected_completion_date DATE,
  actual_completion_date DATE,
  project_description TEXT,
  research_question TEXT,
  methodology TEXT,
  status VARCHAR(50) DEFAULT 'planning', -- planning, in_progress, data_collection, analysis, writing, completed, defended
  irb_approval_required BOOLEAN DEFAULT false,
  irb_approval_date DATE,
  funding_source TEXT,
  budget_amount DECIMAL(10,2),
  deliverables TEXT[],
  milestones JSONB,
  final_grade VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research project progress tracking and milestones
CREATE TABLE IF NOT EXISTS research_progress_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES student_research_projects(id) ON DELETE CASCADE,
  update_date DATE NOT NULL,
  milestone_achieved TEXT,
  progress_description TEXT,
  challenges_encountered TEXT,
  next_steps TEXT,
  advisor_feedback TEXT,
  percentage_complete INTEGER DEFAULT 0,
  files_submitted TEXT[], -- URLs to uploaded files
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. GAMIFIED LEARNING SYSTEM
-- =============================================

-- Gamification points and achievement system
CREATE TABLE IF NOT EXISTS student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL, -- case_completion, perfect_score, streak, collaboration
  achievement_name VARCHAR(255) NOT NULL,
  description TEXT,
  points_awarded INTEGER DEFAULT 0,
  badge_icon_url TEXT,
  earned_date DATE DEFAULT CURRENT_DATE,
  category VARCHAR(100), -- academic, clinical, research, leadership
  rarity VARCHAR(50) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student points and leaderboards
CREATE TABLE IF NOT EXISTS student_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  point_category VARCHAR(100) NOT NULL, -- case_study, assessment, participation, research
  points_earned INTEGER NOT NULL,
  activity_description TEXT,
  earned_date DATE DEFAULT CURRENT_DATE,
  semester VARCHAR(20),
  academic_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning streaks and engagement tracking
CREATE TABLE IF NOT EXISTS learning_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  streak_type VARCHAR(100) NOT NULL, -- daily_login, case_completion, assessment_taking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_start_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, streak_type)
);

-- =============================================
-- 8. PEER COLLABORATION
-- =============================================

-- Study groups and collaborative learning
CREATE TABLE IF NOT EXISTS study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_name VARCHAR(255) NOT NULL,
  description TEXT,
  subject_focus VARCHAR(100),
  program_type VARCHAR(100),
  year_level INTEGER,
  max_members INTEGER DEFAULT 8,
  created_by UUID NOT NULL REFERENCES student_profiles(id),
  is_private BOOLEAN DEFAULT false,
  meeting_schedule VARCHAR(255),
  meeting_location TEXT,
  group_goals TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study group memberships
CREATE TABLE IF NOT EXISTS study_group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES study_groups(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- member, moderator, admin
  joined_date DATE DEFAULT CURRENT_DATE,
  contribution_score INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, student_id)
);

-- Peer discussion forums and knowledge sharing
CREATE TABLE IF NOT EXISTS discussion_forums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- case_discussion, q_and_a, study_tips, career_advice
  description TEXT,
  program_type VARCHAR(100),
  year_level INTEGER[],
  moderator_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts and discussions
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id UUID NOT NULL REFERENCES discussion_forums(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id), -- for replies
  title VARCHAR(255),
  content TEXT NOT NULL,
  post_type VARCHAR(50) DEFAULT 'discussion', -- discussion, question, announcement, resource
  tags TEXT[],
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false, -- for questions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. PERFORMANCE ANALYTICS
-- =============================================

-- Student learning analytics and performance tracking
CREATE TABLE IF NOT EXISTS student_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  total_study_time_minutes INTEGER DEFAULT 0,
  cases_completed INTEGER DEFAULT 0,
  average_case_score DECIMAL(5,2),
  assessments_taken INTEGER DEFAULT 0,
  average_assessment_score DECIMAL(5,2),
  forum_posts_count INTEGER DEFAULT 0,
  peer_interactions_count INTEGER DEFAULT 0,
  research_milestones_completed INTEGER DEFAULT 0,
  competencies_mastered INTEGER DEFAULT 0,
  learning_velocity_score DECIMAL(5,2), -- progress rate indicator
  engagement_score INTEGER DEFAULT 0, -- 1-100 scale
  knowledge_retention_rate DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning pathway recommendations and AI insights
CREATE TABLE IF NOT EXISTS learning_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL, -- case_study, assessment, resource, mentor_meeting
  content_id UUID, -- references various content tables
  recommendation_text TEXT NOT NULL,
  reasoning TEXT,
  priority_level INTEGER DEFAULT 1, -- 1-5 scale
  estimated_time_minutes INTEGER,
  difficulty_adjustment VARCHAR(50), -- easier, maintain, harder
  generated_date DATE DEFAULT CURRENT_DATE,
  acted_upon BOOLEAN DEFAULT false,
  student_feedback INTEGER, -- 1-5 helpfulness rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_competency_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_case_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_step_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_rotation_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_patient_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for students to access their own data
CREATE POLICY "Students can manage their profile" ON student_profiles
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Students can view competencies" ON academic_competencies
  FOR SELECT USING (true);

CREATE POLICY "Students can view their progress" ON student_competency_progress
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view educational cases" ON educational_cases
  FOR SELECT USING (is_active = true);

CREATE POLICY "Students can manage their case attempts" ON student_case_attempts
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can manage their interactions" ON case_step_interactions
  FOR ALL USING (attempt_id IN (
    SELECT id FROM student_case_attempts 
    WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  ));

CREATE POLICY "Students can view virtual rotations" ON virtual_rotations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Students can view their rotation assignments" ON student_rotation_assignments
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can manage their encounters" ON virtual_patient_encounters
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view active assessments" ON assessments
  FOR SELECT USING (is_active = true);

CREATE POLICY "Students can view assessment questions" ON assessment_questions
  FOR SELECT USING (assessment_id IN (SELECT id FROM assessments WHERE is_active = true));

CREATE POLICY "Students can manage their assessment attempts" ON student_assessment_attempts
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view their mentorship relationships" ON mentorship_relationships
  FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view their achievements" ON student_achievements
  FOR SELECT USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view their points" ON student_points
  FOR SELECT USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can view public study groups" ON study_groups
  FOR SELECT USING (is_private = false OR created_by IN (
    SELECT id FROM student_profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Students can view public forums" ON discussion_forums
  FOR SELECT USING (is_public = true);

CREATE POLICY "Students can manage their forum posts" ON forum_posts
  FOR ALL USING (author_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

-- Faculty policies for supervision and evaluation
CREATE POLICY "Faculty can evaluate students" ON faculty_evaluations
  FOR ALL USING (evaluator_id = auth.uid());

CREATE POLICY "Faculty can supervise mentorship" ON mentorship_relationships
  FOR ALL USING (mentor_id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_program ON student_profiles(program_type, year_level);
CREATE INDEX IF NOT EXISTS idx_competency_progress_student ON student_competency_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_case_attempts_student ON student_case_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_case_attempts_case ON student_case_attempts(case_id);
CREATE INDEX IF NOT EXISTS idx_rotation_assignments_student ON student_rotation_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_patient_encounters_student ON virtual_patient_encounters(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON student_assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_student ON mentorship_relationships(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_relationships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_student ON student_research_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_student ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_points_student ON student_points(student_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_analytics_student ON student_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_student ON learning_recommendations(student_id);