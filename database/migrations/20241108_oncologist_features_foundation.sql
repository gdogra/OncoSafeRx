/**
 * Oncologist Features Foundation Schema
 * Comprehensive clinical workflow and decision support platform
 * OncoSafeRx - Generated 2024-11-08
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CLINICAL DECISION SUPPORT
-- =============================================

-- Treatment recommendations and clinical protocols
CREATE TABLE IF NOT EXISTS clinical_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_name VARCHAR(255) NOT NULL,
  cancer_type VARCHAR(100) NOT NULL,
  stage VARCHAR(50),
  biomarkers TEXT[],
  treatment_lines INTEGER DEFAULT 1,
  drugs JSONB NOT NULL, -- {drug_name, dosage, schedule, cycles}
  evidence_level VARCHAR(20) DEFAULT 'III', -- I, II-A, II-B, III, IV
  guidelines_source VARCHAR(100), -- NCCN, ASCO, ESMO
  success_rate DECIMAL(5,2),
  side_effects JSONB,
  contraindications TEXT[],
  monitoring_requirements JSONB,
  cost_estimate DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical decision rules and alerts
CREATE TABLE IF NOT EXISTS clinical_decision_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(255) NOT NULL,
  condition_type VARCHAR(100) NOT NULL, -- interaction, contraindication, dosing, monitoring
  severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  trigger_conditions JSONB NOT NULL,
  alert_message TEXT NOT NULL,
  recommended_actions JSONB,
  evidence_references TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. PATIENT POPULATION MANAGEMENT
-- =============================================

-- Oncologist patient assignments and caseload
CREATE TABLE IF NOT EXISTS oncologist_patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_diagnosis VARCHAR(255) NOT NULL,
  cancer_stage VARCHAR(50),
  date_of_diagnosis DATE,
  treatment_status VARCHAR(50) DEFAULT 'active', -- active, complete, palliative, surveillance
  risk_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  next_appointment TIMESTAMP WITH TIME ZONE,
  last_visit TIMESTAMP WITH TIME ZONE,
  treatment_response VARCHAR(50), -- complete, partial, stable, progressive
  performance_status INTEGER, -- ECOG 0-4
  comorbidities TEXT[],
  notes TEXT,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(oncologist_id, patient_id)
);

-- Care team assignments and roles
CREATE TABLE IF NOT EXISTS care_team_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL, -- oncologist, nurse, pharmacist, social_worker, nutritionist
  is_primary BOOLEAN DEFAULT false,
  responsibilities TEXT[],
  contact_priority INTEGER DEFAULT 1,
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, team_member_id)
);

-- =============================================
-- 3. TREATMENT RESPONSE TRACKING
-- =============================================

-- Treatment response assessments
CREATE TABLE IF NOT EXISTS treatment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  response_criteria VARCHAR(50) DEFAULT 'RECIST', -- RECIST, iRECIST, WHO
  overall_response VARCHAR(50), -- CR, PR, SD, PD
  target_lesions JSONB, -- measurements and changes
  non_target_lesions JSONB,
  new_lesions BOOLEAN DEFAULT false,
  biomarker_response JSONB,
  clinical_benefit BOOLEAN,
  quality_of_life_score INTEGER, -- 1-10 scale
  toxicity_grade INTEGER, -- CTCAE 1-5
  next_assessment_date DATE,
  notes TEXT,
  imaging_studies JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment efficacy analytics
CREATE TABLE IF NOT EXISTS treatment_efficacy_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol_id UUID REFERENCES clinical_protocols(id) ON DELETE CASCADE,
  cancer_type VARCHAR(100) NOT NULL,
  total_patients INTEGER DEFAULT 0,
  complete_response_count INTEGER DEFAULT 0,
  partial_response_count INTEGER DEFAULT 0,
  stable_disease_count INTEGER DEFAULT 0,
  progressive_disease_count INTEGER DEFAULT 0,
  median_pfs_days INTEGER,
  median_os_days INTEGER,
  grade_3_4_toxicity_rate DECIMAL(5,2),
  discontinuation_rate DECIMAL(5,2),
  cost_per_response DECIMAL(10,2),
  calculated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CLINICAL DOCUMENTATION
-- =============================================

-- AI-assisted clinical notes
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  note_type VARCHAR(50) NOT NULL, -- consultation, follow_up, procedure, discharge
  chief_complaint TEXT,
  history_present_illness TEXT,
  assessment TEXT,
  plan TEXT,
  ai_suggestions JSONB,
  billing_codes VARCHAR(100)[],
  template_used VARCHAR(255),
  voice_transcription BOOLEAN DEFAULT false,
  is_finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical note templates
CREATE TABLE IF NOT EXISTS note_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) NOT NULL,
  note_type VARCHAR(50) NOT NULL,
  cancer_type VARCHAR(100),
  template_content TEXT NOT NULL,
  variables JSONB, -- placeholders for dynamic content
  billing_codes VARCHAR(100)[],
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. MULTIDISCIPLINARY TEAM COORDINATION
-- =============================================

-- Tumor board cases and discussions
CREATE TABLE IF NOT EXISTS tumor_board_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  presenting_oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  case_summary TEXT NOT NULL,
  clinical_question TEXT,
  imaging_available BOOLEAN DEFAULT false,
  pathology_available BOOLEAN DEFAULT false,
  molecular_results JSONB,
  current_treatment TEXT,
  treatment_options JSONB,
  recommendations TEXT,
  consensus_reached BOOLEAN DEFAULT false,
  attendees UUID[],
  meeting_notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation requests and referrals
CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requesting_physician_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consulting_specialist_id UUID REFERENCES auth.users(id),
  specialty_requested VARCHAR(100) NOT NULL,
  urgency VARCHAR(20) DEFAULT 'routine', -- urgent, semi_urgent, routine
  clinical_question TEXT NOT NULL,
  relevant_history TEXT,
  current_medications JSONB,
  requested_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferred_date TIMESTAMP WITH TIME ZONE,
  consultation_type VARCHAR(50) DEFAULT 'in_person', -- in_person, telehealth, curbside
  status VARCHAR(50) DEFAULT 'pending', -- pending, scheduled, completed, cancelled
  consultation_notes TEXT,
  recommendations TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. QUALITY METRICS AND COMPLIANCE
-- =============================================

-- Quality indicators and performance metrics
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name VARCHAR(255) NOT NULL,
  metric_category VARCHAR(100) NOT NULL, -- safety, efficacy, patient_satisfaction, compliance
  measurement_period DATE NOT NULL,
  target_value DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  benchmark_value DECIMAL(10,2),
  percentile_rank INTEGER,
  improvement_trend VARCHAR(20), -- improving, stable, declining
  action_required BOOLEAN DEFAULT false,
  notes TEXT,
  calculated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical guideline compliance tracking
CREATE TABLE IF NOT EXISTS guideline_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guideline_source VARCHAR(100) NOT NULL, -- NCCN, ASCO, ESMO
  guideline_version VARCHAR(50),
  recommendation_category VARCHAR(100),
  recommendation_text TEXT,
  compliance_status VARCHAR(50) NOT NULL, -- compliant, deviation, not_applicable
  deviation_reason TEXT,
  clinical_justification TEXT,
  assessment_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. CLINICAL TRIAL INTEGRATION
-- =============================================

-- Clinical trial matching and enrollment
CREATE TABLE IF NOT EXISTS trial_eligibility_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_id VARCHAR(50) NOT NULL, -- NCT number or internal ID
  trial_name VARCHAR(255),
  eligibility_criteria JSONB NOT NULL,
  patient_matches JSONB, -- criteria met/not met
  eligibility_score DECIMAL(5,2), -- percentage match
  major_exclusions TEXT[],
  screening_required TEXT[],
  assessment_date DATE NOT NULL,
  recommendation VARCHAR(50), -- eligible, potentially_eligible, not_eligible
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial enrollment tracking
CREATE TABLE IF NOT EXISTS trial_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_id VARCHAR(50) NOT NULL,
  enrollment_date DATE NOT NULL,
  randomization_arm VARCHAR(100),
  treatment_start_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, withdrawn, lost_to_followup
  withdrawal_reason TEXT,
  adverse_events JSONB,
  protocol_deviations JSONB,
  outcome_data JSONB,
  last_followup_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. RESEARCH AND EVIDENCE TRACKING
-- =============================================

-- Evidence synthesis and literature tracking
CREATE TABLE IF NOT EXISTS evidence_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic VARCHAR(255) NOT NULL,
  cancer_type VARCHAR(100),
  treatment_modality VARCHAR(100),
  evidence_level VARCHAR(20), -- I, II, III, IV
  summary TEXT NOT NULL,
  key_findings JSONB,
  clinical_implications TEXT,
  practice_recommendations TEXT,
  references JSONB,
  confidence_rating INTEGER, -- 1-5 scale
  last_updated DATE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  peer_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. WORKFLOW OPTIMIZATION
-- =============================================

-- Clinical workflow templates and automation
CREATE TABLE IF NOT EXISTS clinical_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_name VARCHAR(255) NOT NULL,
  cancer_type VARCHAR(100),
  workflow_type VARCHAR(100) NOT NULL, -- diagnosis, treatment, followup, surveillance
  steps JSONB NOT NULL, -- ordered workflow steps
  automation_rules JSONB,
  estimated_time_minutes INTEGER,
  required_roles TEXT[],
  decision_points JSONB,
  quality_checkpoints JSONB,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice performance analytics
CREATE TABLE IF NOT EXISTS practice_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oncologist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  total_patients INTEGER DEFAULT 0,
  new_patients_month INTEGER DEFAULT 0,
  avg_visits_per_patient DECIMAL(5,2),
  treatment_response_rate DECIMAL(5,2),
  patient_satisfaction_score DECIMAL(5,2),
  protocol_adherence_rate DECIMAL(5,2),
  documentation_completion_rate DECIMAL(5,2),
  time_to_treatment_days DECIMAL(8,2),
  cost_per_patient DECIMAL(10,2),
  revenue_per_patient DECIMAL(10,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clinical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_decision_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE oncologist_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_efficacy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tumor_board_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE guideline_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_eligibility_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for oncologists to access their own data
CREATE POLICY "Oncologists can manage their protocols" ON clinical_protocols
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Oncologists can view decision rules" ON clinical_decision_rules
  FOR SELECT USING (true);

CREATE POLICY "Oncologists can manage their patients" ON oncologist_patients
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Care team can view assignments" ON care_team_assignments
  FOR SELECT USING (team_member_id = auth.uid() OR patient_id IN (
    SELECT patient_id FROM oncologist_patients WHERE oncologist_id = auth.uid()
  ));

CREATE POLICY "Oncologists can manage treatment responses" ON treatment_responses
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Oncologists can view efficacy metrics" ON treatment_efficacy_metrics
  FOR SELECT USING (true);

CREATE POLICY "Oncologists can manage clinical notes" ON clinical_notes
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Users can view public templates" ON note_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Oncologists can manage note templates" ON note_templates
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Oncologists can participate in tumor boards" ON tumor_board_cases
  FOR ALL USING (presenting_oncologist_id = auth.uid() OR auth.uid() = ANY(attendees));

CREATE POLICY "Oncologists can manage consultations" ON consultation_requests
  FOR ALL USING (requesting_physician_id = auth.uid() OR consulting_specialist_id = auth.uid());

CREATE POLICY "Oncologists can view their quality metrics" ON quality_metrics
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Oncologists can manage guideline compliance" ON guideline_compliance
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Oncologists can manage trial assessments" ON trial_eligibility_assessments
  FOR ALL USING (oncologist_id = auth.uid());

CREATE POLICY "Oncologists can view trial enrollments" ON trial_enrollments
  FOR SELECT USING (patient_id IN (
    SELECT patient_id FROM oncologist_patients WHERE oncologist_id = auth.uid()
  ));

CREATE POLICY "Users can view evidence summaries" ON evidence_summaries
  FOR SELECT USING (true);

CREATE POLICY "Oncologists can manage evidence summaries" ON evidence_summaries
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view public workflows" ON clinical_workflows
  FOR SELECT USING (true);

CREATE POLICY "Oncologists can manage workflows" ON clinical_workflows
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Oncologists can view their practice analytics" ON practice_analytics
  FOR ALL USING (oncologist_id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clinical_protocols_oncologist ON clinical_protocols(oncologist_id);
CREATE INDEX IF NOT EXISTS idx_clinical_protocols_cancer_type ON clinical_protocols(cancer_type);
CREATE INDEX IF NOT EXISTS idx_oncologist_patients_oncologist ON oncologist_patients(oncologist_id);
CREATE INDEX IF NOT EXISTS idx_oncologist_patients_status ON oncologist_patients(treatment_status);
CREATE INDEX IF NOT EXISTS idx_treatment_responses_patient ON treatment_responses(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_responses_oncologist ON treatment_responses(oncologist_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_patient ON clinical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_notes_date ON clinical_notes(visit_date);
CREATE INDEX IF NOT EXISTS idx_tumor_board_date ON tumor_board_cases(meeting_date);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_oncologist ON quality_metrics(oncologist_id);
CREATE INDEX IF NOT EXISTS idx_trial_assessments_patient ON trial_eligibility_assessments(patient_id);