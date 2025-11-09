/**
 * Researcher Features Foundation Schema
 * Comprehensive clinical research and biomarker discovery platform
 * OncoSafeRx - Generated 2024-11-08
 */

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CLINICAL TRIAL MANAGEMENT
-- =============================================

-- Clinical trials and research studies
CREATE TABLE IF NOT EXISTS clinical_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_identifier VARCHAR(50) UNIQUE NOT NULL, -- NCT number or internal ID
  principal_investigator_id UUID NOT NULL REFERENCES auth.users(id),
  trial_title VARCHAR(500) NOT NULL,
  trial_type VARCHAR(100) NOT NULL, -- interventional, observational, registry
  study_phase VARCHAR(20), -- phase_i, phase_ii, phase_iii, phase_iv
  cancer_type VARCHAR(100) NOT NULL,
  primary_indication VARCHAR(255),
  intervention_type VARCHAR(100), -- drug, device, procedure, behavioral
  intervention_name VARCHAR(255),
  study_design VARCHAR(100), -- randomized, single_arm, cohort, case_control
  blinding VARCHAR(50), -- open_label, single_blind, double_blind
  randomization_ratio VARCHAR(50), -- 1:1, 2:1, etc.
  primary_endpoint TEXT NOT NULL,
  secondary_endpoints TEXT[],
  inclusion_criteria JSONB NOT NULL,
  exclusion_criteria JSONB NOT NULL,
  target_enrollment INTEGER NOT NULL,
  current_enrollment INTEGER DEFAULT 0,
  enrollment_start_date DATE,
  enrollment_end_date DATE,
  study_start_date DATE NOT NULL,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  study_status VARCHAR(50) DEFAULT 'planning', -- planning, recruiting, active, completed, terminated, suspended
  regulatory_status JSONB, -- IND, IDE, IRB approvals
  sponsor_name VARCHAR(255),
  funding_source VARCHAR(255),
  budget_amount DECIMAL(12,2),
  sites JSONB, -- participating sites
  data_monitoring_committee BOOLEAN DEFAULT false,
  interim_analysis_planned BOOLEAN DEFAULT false,
  biomarker_studies_included BOOLEAN DEFAULT false,
  correlative_studies JSONB,
  statistical_design JSONB,
  protocol_version VARCHAR(20) DEFAULT '1.0',
  protocol_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial enrollment and patient tracking
CREATE TABLE IF NOT EXISTS trial_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES clinical_trials(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id),
  study_id VARCHAR(50) NOT NULL, -- anonymized study ID
  screening_number VARCHAR(50),
  randomization_number VARCHAR(50),
  treatment_arm VARCHAR(100),
  enrollment_date DATE NOT NULL,
  screening_date DATE,
  randomization_date DATE,
  treatment_start_date DATE,
  last_followup_date DATE,
  study_completion_date DATE,
  discontinuation_date DATE,
  discontinuation_reason VARCHAR(255),
  enrollment_status VARCHAR(50) DEFAULT 'enrolled', -- screened, enrolled, randomized, completed, discontinued
  eligibility_assessment JSONB,
  baseline_characteristics JSONB,
  primary_endpoint_data JSONB,
  adverse_events JSONB,
  protocol_deviations JSONB,
  quality_of_life_data JSONB,
  biomarker_samples JSONB,
  pharmacokinetic_data JSONB,
  imaging_data JSONB,
  survival_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. BIOMARKER DISCOVERY & ANALYSIS
-- =============================================

-- Biomarker studies and molecular profiling
CREATE TABLE IF NOT EXISTS biomarker_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_name VARCHAR(255) NOT NULL,
  principal_investigator_id UUID NOT NULL REFERENCES auth.users(id),
  study_type VARCHAR(100) NOT NULL, -- genomic, proteomic, metabolomic, transcriptomic
  cancer_type VARCHAR(100) NOT NULL,
  biomarker_category VARCHAR(100), -- diagnostic, prognostic, predictive, pharmacodynamic
  hypothesis TEXT NOT NULL,
  sample_type VARCHAR(100) NOT NULL, -- tissue, blood, plasma, serum, urine, saliva
  collection_protocol TEXT,
  processing_protocol TEXT,
  analysis_platform VARCHAR(100), -- ngs, array, mass_spec, flow_cytometry, immunohistochemistry
  total_samples INTEGER,
  samples_analyzed INTEGER DEFAULT 0,
  control_samples INTEGER,
  statistical_power DECIMAL(5,2),
  significance_level DECIMAL(5,3) DEFAULT 0.05,
  primary_analysis_plan TEXT,
  secondary_analyses TEXT[],
  collaboration_sites TEXT[],
  data_sharing_agreements JSONB,
  regulatory_approvals JSONB,
  study_status VARCHAR(50) DEFAULT 'design', -- design, sample_collection, analysis, interpretation, completed
  start_date DATE NOT NULL,
  estimated_completion_date DATE,
  funding_source VARCHAR(255),
  budget_amount DECIMAL(10,2),
  publications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biomarker sample tracking and results
CREATE TABLE IF NOT EXISTS biomarker_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES biomarker_studies(id) ON DELETE CASCADE,
  sample_id VARCHAR(50) UNIQUE NOT NULL,
  patient_study_id VARCHAR(50), -- anonymized patient identifier
  trial_enrollment_id UUID REFERENCES trial_enrollments(id),
  sample_type VARCHAR(100) NOT NULL,
  collection_date DATE NOT NULL,
  collection_site VARCHAR(255),
  processing_date DATE,
  storage_location VARCHAR(255),
  storage_conditions VARCHAR(100), -- -80C, liquid_nitrogen, formalin_fixed
  sample_quality VARCHAR(50), -- excellent, good, fair, poor
  dna_concentration DECIMAL(8,2),
  rna_concentration DECIMAL(8,2),
  protein_concentration DECIMAL(8,2),
  purity_ratios JSONB, -- 260/280, 260/230 ratios
  volume_available DECIMAL(6,2), -- in microliters
  freeze_thaw_cycles INTEGER DEFAULT 0,
  analysis_status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, failed
  genomic_data JSONB, -- mutations, copy_number, fusions
  transcriptomic_data JSONB, -- gene expression, splice variants
  proteomic_data JSONB, -- protein levels, modifications
  metabolomic_data JSONB, -- metabolite levels
  imaging_biomarkers JSONB, -- radiomics features
  clinical_correlation JSONB, -- response, survival, toxicity
  quality_control_metrics JSONB,
  batch_information JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. REAL-WORLD EVIDENCE STUDIES
-- =============================================

-- Real-world evidence research projects
CREATE TABLE IF NOT EXISTS rwe_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_name VARCHAR(255) NOT NULL,
  principal_investigator_id UUID NOT NULL REFERENCES auth.users(id),
  study_type VARCHAR(100) NOT NULL, -- retrospective, prospective, registry, claims_analysis
  research_question TEXT NOT NULL,
  study_design VARCHAR(100), -- cohort, case_control, cross_sectional
  population_definition TEXT NOT NULL,
  inclusion_criteria JSONB NOT NULL,
  exclusion_criteria JSONB NOT NULL,
  primary_outcome TEXT NOT NULL,
  secondary_outcomes TEXT[],
  exposure_definition TEXT,
  followup_duration VARCHAR(100),
  data_sources TEXT[], -- ehr, claims, registry, patient_reported
  study_period_start DATE,
  study_period_end DATE,
  target_sample_size INTEGER,
  actual_sample_size INTEGER DEFAULT 0,
  statistical_analysis_plan TEXT,
  confounding_variables TEXT[],
  bias_mitigation_strategies TEXT[],
  data_quality_assessment JSONB,
  ethics_approval_status VARCHAR(50), -- pending, approved, exempt
  data_sharing_plan TEXT,
  study_status VARCHAR(50) DEFAULT 'protocol_development',
  interim_results JSONB,
  final_results JSONB,
  publications JSONB,
  regulatory_submissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RWE data collection and analysis
CREATE TABLE IF NOT EXISTS rwe_data_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL REFERENCES rwe_studies(id) ON DELETE CASCADE,
  patient_identifier VARCHAR(100) NOT NULL, -- anonymized
  data_source VARCHAR(100) NOT NULL,
  data_extraction_date DATE NOT NULL,
  demographics JSONB,
  medical_history JSONB,
  cancer_characteristics JSONB,
  treatment_history JSONB,
  outcomes_data JSONB,
  survival_data JSONB,
  adverse_events JSONB,
  healthcare_utilization JSONB,
  costs_data JSONB,
  quality_of_life JSONB,
  biomarker_data JSONB,
  follow_up_status VARCHAR(50), -- active, lost, deceased, withdrew
  data_completeness_score DECIMAL(5,2),
  data_quality_flags JSONB,
  last_update_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. RESEARCH COLLABORATION
-- =============================================

-- Multi-site research collaborations
CREATE TABLE IF NOT EXISTS research_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaboration_name VARCHAR(255) NOT NULL,
  lead_site VARCHAR(255) NOT NULL,
  lead_investigator_id UUID NOT NULL REFERENCES auth.users(id),
  collaboration_type VARCHAR(100), -- consortium, network, cooperative_group
  research_focus VARCHAR(255) NOT NULL,
  participating_sites JSONB NOT NULL,
  data_sharing_agreement_url TEXT,
  governance_structure JSONB,
  funding_model VARCHAR(100), -- centralized, distributed, site_specific
  communication_platform VARCHAR(100),
  established_date DATE NOT NULL,
  renewal_date DATE,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, completed
  publications JSONB,
  achievements JSONB,
  challenges JSONB,
  meeting_schedule VARCHAR(100),
  next_meeting_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research project assignments and roles
CREATE TABLE IF NOT EXISTS collaboration_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collaboration_id UUID NOT NULL REFERENCES research_collaborations(id) ON DELETE CASCADE,
  project_name VARCHAR(255) NOT NULL,
  project_lead_id UUID REFERENCES auth.users(id),
  project_type VARCHAR(100), -- clinical_trial, biomarker_study, registry
  project_status VARCHAR(50) DEFAULT 'planning',
  start_date DATE,
  target_completion_date DATE,
  participating_sites TEXT[],
  resource_requirements JSONB,
  milestones JSONB,
  deliverables JSONB,
  budget_allocation DECIMAL(10,2),
  progress_updates JSONB,
  risk_assessment JSONB,
  success_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. REGULATORY COMPLIANCE
-- =============================================

-- IRB and regulatory tracking
CREATE TABLE IF NOT EXISTS regulatory_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID, -- can reference multiple study types
  study_type VARCHAR(50) NOT NULL, -- clinical_trial, biomarker_study, rwe_study
  submission_type VARCHAR(100) NOT NULL, -- irb_initial, irb_amendment, fda_ind, ide_submission
  regulatory_body VARCHAR(100) NOT NULL, -- irb, fda, ema, health_canada
  submission_date DATE NOT NULL,
  protocol_version VARCHAR(20),
  documents_submitted JSONB NOT NULL,
  submission_status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, approved, conditional_approval, rejected
  approval_date DATE,
  approval_conditions TEXT[],
  expiration_date DATE,
  renewal_required BOOLEAN DEFAULT false,
  renewal_date DATE,
  amendments JSONB,
  serious_adverse_event_reports JSONB,
  annual_reports JSONB,
  inspection_history JSONB,
  compliance_issues JSONB,
  corrective_actions JSONB,
  responsible_person_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adverse event reporting
CREATE TABLE IF NOT EXISTS adverse_event_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  study_id UUID NOT NULL,
  study_type VARCHAR(50) NOT NULL,
  patient_study_id VARCHAR(100) NOT NULL,
  event_term VARCHAR(255) NOT NULL,
  event_description TEXT NOT NULL,
  severity_grade INTEGER, -- CTCAE 1-5
  seriousness VARCHAR(50) NOT NULL, -- serious, non_serious
  seriousness_criteria TEXT[], -- death, life_threatening, hospitalization, etc.
  relationship_to_treatment VARCHAR(50), -- unrelated, unlikely, possible, probable, definite
  action_taken VARCHAR(100), -- none, dose_reduction, dose_interruption, discontinuation
  outcome VARCHAR(100), -- recovered, recovering, not_recovered, fatal, unknown
  onset_date DATE NOT NULL,
  resolution_date DATE,
  reporter_type VARCHAR(100), -- investigator, patient, healthcare_professional
  expectedness VARCHAR(50), -- expected, unexpected
  regulatory_reporting_required BOOLEAN DEFAULT false,
  regulatory_reports_submitted JSONB,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_information JSONB,
  medical_assessment TEXT,
  investigator_assessment TEXT,
  sponsor_assessment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. LITERATURE & KNOWLEDGE MANAGEMENT
-- =============================================

-- Research literature database
CREATE TABLE IF NOT EXISTS research_literature (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_type VARCHAR(50) NOT NULL, -- journal_article, abstract, review, guideline
  title VARCHAR(500) NOT NULL,
  authors TEXT[] NOT NULL,
  journal_name VARCHAR(255),
  publication_date DATE,
  volume VARCHAR(20),
  issue VARCHAR(20),
  pages VARCHAR(50),
  doi VARCHAR(255) UNIQUE,
  pmid VARCHAR(20) UNIQUE,
  abstract TEXT,
  keywords TEXT[],
  mesh_terms TEXT[],
  cancer_types TEXT[],
  research_topics TEXT[],
  study_design VARCHAR(100),
  sample_size INTEGER,
  primary_endpoint TEXT,
  key_findings TEXT,
  clinical_significance TEXT,
  evidence_level VARCHAR(20), -- I, II-A, II-B, III, IV
  impact_factor DECIMAL(5,3),
  citation_count INTEGER DEFAULT 0,
  relevance_score DECIMAL(5,2), -- AI-calculated relevance
  full_text_url TEXT,
  open_access BOOLEAN DEFAULT false,
  research_area_tags TEXT[],
  biomarkers_mentioned TEXT[],
  drugs_mentioned TEXT[],
  added_by_user_id UUID REFERENCES auth.users(id),
  user_notes TEXT,
  user_rating INTEGER, -- 1-5 scale
  bookmark_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Systematic reviews and meta-analyses
CREATE TABLE IF NOT EXISTS systematic_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_title VARCHAR(500) NOT NULL,
  lead_reviewer_id UUID NOT NULL REFERENCES auth.users(id),
  review_team UUID[],
  research_question TEXT NOT NULL,
  search_strategy JSONB NOT NULL,
  inclusion_criteria JSONB NOT NULL,
  exclusion_criteria JSONB NOT NULL,
  search_databases TEXT[], -- pubmed, embase, cochrane, etc.
  search_date_range JSONB,
  initial_search_results INTEGER,
  after_screening_results INTEGER,
  final_included_studies INTEGER,
  study_selection_process JSONB,
  data_extraction_form JSONB,
  quality_assessment_tool VARCHAR(100),
  risk_of_bias_assessment JSONB,
  statistical_analysis_plan TEXT,
  heterogeneity_assessment JSONB,
  meta_analysis_performed BOOLEAN DEFAULT false,
  meta_analysis_results JSONB,
  certainty_of_evidence JSONB, -- GRADE assessment
  clinical_recommendations TEXT[],
  limitations TEXT[],
  conflicts_of_interest TEXT,
  funding_source VARCHAR(255),
  protocol_registration VARCHAR(100), -- PROSPERO ID
  review_status VARCHAR(50) DEFAULT 'protocol', -- protocol, searching, screening, analysis, writing, published
  manuscript_draft_url TEXT,
  publication_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. GRANT & FUNDING MANAGEMENT
-- =============================================

-- Research grants and funding
CREATE TABLE IF NOT EXISTS research_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grant_title VARCHAR(500) NOT NULL,
  principal_investigator_id UUID NOT NULL REFERENCES auth.users(id),
  co_investigators UUID[],
  funding_agency VARCHAR(255) NOT NULL,
  grant_mechanism VARCHAR(100), -- r01, r21, p01, nih_sbir, industry_sponsored
  grant_number VARCHAR(100) UNIQUE,
  application_type VARCHAR(50), -- new, renewal, revision, supplement
  research_area VARCHAR(255) NOT NULL,
  abstract TEXT,
  specific_aims TEXT,
  total_budget DECIMAL(12,2) NOT NULL,
  direct_costs DECIMAL(12,2),
  indirect_costs DECIMAL(12,2),
  budget_periods JSONB, -- yearly breakdown
  project_period_start DATE NOT NULL,
  project_period_end DATE NOT NULL,
  application_due_date DATE,
  submission_date DATE,
  review_cycle VARCHAR(100),
  study_section VARCHAR(255),
  priority_score INTEGER,
  percentile DECIMAL(5,2),
  funding_decision VARCHAR(50), -- funded, not_funded, pending
  award_date DATE,
  first_funding_date DATE,
  final_report_due_date DATE,
  milestone_reports JSONB,
  publications_from_grant JSONB,
  renewal_applications JSONB,
  compliance_requirements JSONB,
  grant_status VARCHAR(50) DEFAULT 'application', -- application, under_review, funded, completed, terminated
  administrative_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publication tracking and impact
CREATE TABLE IF NOT EXISTS research_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  authors JSONB NOT NULL, -- array of author objects with affiliations
  corresponding_author_id UUID REFERENCES auth.users(id),
  journal_name VARCHAR(255),
  journal_impact_factor DECIMAL(5,3),
  publication_type VARCHAR(50), -- original_research, review, editorial, letter
  manuscript_status VARCHAR(50) DEFAULT 'planning', -- planning, writing, submitted, under_review, accepted, published
  submission_date DATE,
  acceptance_date DATE,
  publication_date DATE,
  doi VARCHAR(255) UNIQUE,
  pmid VARCHAR(20) UNIQUE,
  abstract TEXT,
  keywords TEXT[],
  research_funding_sources TEXT[],
  related_grants UUID[], -- references to research_grants
  related_studies UUID[], -- references to studies
  clinical_trial_registrations TEXT[],
  data_availability_statement TEXT,
  code_availability_statement TEXT,
  competing_interests TEXT,
  acknowledgments TEXT,
  supplementary_materials JSONB,
  peer_review_reports JSONB,
  revision_history JSONB,
  citation_metrics JSONB, -- citations, altmetrics
  open_access_status BOOLEAN DEFAULT false,
  preprint_details JSONB,
  media_coverage JSONB,
  clinical_impact_assessment TEXT,
  policy_implications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. RESEARCH ANALYTICS & INSIGHTS
-- =============================================

-- Research performance metrics
CREATE TABLE IF NOT EXISTS research_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID NOT NULL REFERENCES auth.users(id),
  measurement_period_start DATE NOT NULL,
  measurement_period_end DATE NOT NULL,
  active_studies INTEGER DEFAULT 0,
  completed_studies INTEGER DEFAULT 0,
  total_enrollment INTEGER DEFAULT 0,
  enrollment_rate DECIMAL(5,2), -- patients per month
  publication_count INTEGER DEFAULT 0,
  total_citations INTEGER DEFAULT 0,
  h_index INTEGER DEFAULT 0,
  grant_funding_amount DECIMAL(12,2) DEFAULT 0,
  industry_collaborations INTEGER DEFAULT 0,
  international_collaborations INTEGER DEFAULT 0,
  mentorship_activities INTEGER DEFAULT 0,
  regulatory_submissions INTEGER DEFAULT 0,
  biomarker_discoveries INTEGER DEFAULT 0,
  clinical_impact_score DECIMAL(5,2),
  innovation_index DECIMAL(5,2),
  collaboration_network_size INTEGER DEFAULT 0,
  data_quality_score DECIMAL(5,2),
  protocol_compliance_rate DECIMAL(5,2),
  patient_satisfaction_score DECIMAL(5,2),
  time_to_publication_months DECIMAL(5,1),
  grant_success_rate DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research trend analysis
CREATE TABLE IF NOT EXISTS research_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_category VARCHAR(100) NOT NULL, -- cancer_type, treatment_modality, biomarker, technology
  trend_name VARCHAR(255) NOT NULL,
  trend_description TEXT,
  measurement_period DATE NOT NULL,
  growth_rate DECIMAL(8,2), -- percentage change
  publication_volume INTEGER,
  funding_volume DECIMAL(12,2),
  clinical_trial_activity INTEGER,
  geographic_distribution JSONB,
  key_researchers TEXT[],
  breakthrough_potential VARCHAR(50), -- low, medium, high, revolutionary
  clinical_readiness VARCHAR(50), -- preclinical, early_clinical, late_clinical, approved
  market_potential DECIMAL(12,2),
  regulatory_pathway VARCHAR(100),
  competitive_landscape TEXT,
  investment_activity JSONB,
  risk_assessment JSONB,
  trend_drivers TEXT[],
  future_projections JSONB,
  strategic_recommendations TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE rwe_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rwe_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_literature ENABLE ROW LEVEL SECURITY;
ALTER TABLE systematic_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_trends ENABLE ROW LEVEL SECURITY;

-- Policies for researchers to access their own studies
CREATE POLICY "Researchers can manage their clinical trials" ON clinical_trials
  FOR ALL USING (principal_investigator_id = auth.uid() OR auth.uid() = ANY(
    SELECT unnest(string_to_array(sites->>'investigators', ','))::uuid
    WHERE sites IS NOT NULL
  ));

CREATE POLICY "Researchers can access trial enrollments for their studies" ON trial_enrollments
  FOR ALL USING (trial_id IN (
    SELECT id FROM clinical_trials 
    WHERE principal_investigator_id = auth.uid()
  ));

CREATE POLICY "Researchers can manage their biomarker studies" ON biomarker_studies
  FOR ALL USING (principal_investigator_id = auth.uid());

CREATE POLICY "Researchers can access biomarker samples for their studies" ON biomarker_samples
  FOR ALL USING (study_id IN (
    SELECT id FROM biomarker_studies 
    WHERE principal_investigator_id = auth.uid()
  ));

CREATE POLICY "Researchers can manage their RWE studies" ON rwe_studies
  FOR ALL USING (principal_investigator_id = auth.uid());

CREATE POLICY "Researchers can access RWE data for their studies" ON rwe_data_points
  FOR ALL USING (study_id IN (
    SELECT id FROM rwe_studies 
    WHERE principal_investigator_id = auth.uid()
  ));

CREATE POLICY "Researchers can view public literature" ON research_literature
  FOR SELECT USING (true);

CREATE POLICY "Researchers can manage literature they added" ON research_literature
  FOR ALL USING (added_by_user_id = auth.uid());

CREATE POLICY "Researchers can manage their systematic reviews" ON systematic_reviews
  FOR ALL USING (lead_reviewer_id = auth.uid() OR auth.uid() = ANY(review_team));

CREATE POLICY "Researchers can manage their grants" ON research_grants
  FOR ALL USING (principal_investigator_id = auth.uid() OR auth.uid() = ANY(co_investigators));

CREATE POLICY "Researchers can manage their publications" ON research_publications
  FOR ALL USING (corresponding_author_id = auth.uid() OR 
    auth.uid() IN (SELECT (author->>'user_id')::uuid FROM jsonb_array_elements(authors) AS author));

CREATE POLICY "Researchers can view their metrics" ON research_metrics
  FOR SELECT USING (researcher_id = auth.uid());

CREATE POLICY "All users can view research trends" ON research_trends
  FOR SELECT USING (true);

-- Collaboration policies
CREATE POLICY "Researchers can participate in collaborations" ON research_collaborations
  FOR SELECT USING (
    lead_investigator_id = auth.uid() OR 
    auth.uid() IN (
      SELECT (site->>'investigator_id')::uuid 
      FROM jsonb_array_elements(participating_sites) AS site
    )
  );

CREATE POLICY "Collaboration members can manage projects" ON collaboration_projects
  FOR ALL USING (
    collaboration_id IN (
      SELECT id FROM research_collaborations 
      WHERE lead_investigator_id = auth.uid() OR 
      auth.uid() IN (
        SELECT (site->>'investigator_id')::uuid 
        FROM jsonb_array_elements(participating_sites) AS site
      )
    )
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clinical_trials_pi ON clinical_trials(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON clinical_trials(study_status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_cancer_type ON clinical_trials(cancer_type);
CREATE INDEX IF NOT EXISTS idx_trial_enrollments_trial ON trial_enrollments(trial_id);
CREATE INDEX IF NOT EXISTS idx_trial_enrollments_patient ON trial_enrollments(patient_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_studies_pi ON biomarker_studies(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_samples_study ON biomarker_samples(study_id);
CREATE INDEX IF NOT EXISTS idx_rwe_studies_pi ON rwe_studies(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_rwe_data_points_study ON rwe_data_points(study_id);
CREATE INDEX IF NOT EXISTS idx_literature_cancer_types ON research_literature USING gin(cancer_types);
CREATE INDEX IF NOT EXISTS idx_literature_keywords ON research_literature USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_literature_pmid ON research_literature(pmid);
CREATE INDEX IF NOT EXISTS idx_literature_doi ON research_literature(doi);
CREATE INDEX IF NOT EXISTS idx_grants_pi ON research_grants(principal_investigator_id);
CREATE INDEX IF NOT EXISTS idx_grants_status ON research_grants(grant_status);
CREATE INDEX IF NOT EXISTS idx_publications_author ON research_publications(corresponding_author_id);
CREATE INDEX IF NOT EXISTS idx_research_metrics_researcher ON research_metrics(researcher_id);
CREATE INDEX IF NOT EXISTS idx_research_trends_category ON research_trends(trend_category);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_literature_fulltext ON research_literature 
USING gin(to_tsvector('english', title || ' ' || coalesce(abstract, '') || ' ' || array_to_string(keywords, ' ')));