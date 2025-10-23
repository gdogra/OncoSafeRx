-- OncoSafeRx Database Schema for Supabase
-- This script creates all necessary tables for the oncology drug interaction platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('admin', 'super_admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'patient', 'caregiver', 'student')),
    institution VARCHAR(255),
    specialty VARCHAR(255),
    license_number VARCHAR(100),
    years_experience INTEGER,
    persona VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Drugs table - comprehensive drug information
CREATE TABLE IF NOT EXISTS drugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rxcui VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    generic_name VARCHAR(500),
    brand_names TEXT[], -- Array of brand names
    active_ingredients TEXT[], -- Array of active ingredients
    drug_class VARCHAR(255),
    route VARCHAR(100),
    dosage_form VARCHAR(100),
    strength VARCHAR(255),
    atc_code VARCHAR(20), -- WHO ATC classification
    ndc_codes TEXT[], -- National Drug Codes
    indication TEXT,
    contraindications TEXT,
    warnings TEXT,
    pregnancy_category VARCHAR(10),
    controlled_substance_schedule VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for drugs table
CREATE INDEX IF NOT EXISTS idx_drugs_rxcui ON drugs(rxcui);
CREATE INDEX IF NOT EXISTS idx_drugs_name_gin ON drugs USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_drugs_generic_name_gin ON drugs USING gin(generic_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_drugs_brand_names_gin ON drugs USING gin(brand_names);
CREATE INDEX IF NOT EXISTS idx_drugs_drug_class ON drugs(drug_class);

-- Drug interactions table
CREATE TABLE IF NOT EXISTS drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug1_rxcui VARCHAR(20) NOT NULL REFERENCES drugs(rxcui),
    drug2_rxcui VARCHAR(20) NOT NULL REFERENCES drugs(rxcui),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('major', 'moderate', 'minor', 'contraindicated')),
    mechanism TEXT,
    effect TEXT NOT NULL,
    management TEXT,
    evidence_level VARCHAR(10) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    sources TEXT[],
    frequency VARCHAR(20), -- common, uncommon, rare
    onset VARCHAR(20), -- rapid, delayed
    documentation VARCHAR(20), -- established, probable, suspected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_drug_pair UNIQUE (drug1_rxcui, drug2_rxcui),
    CONSTRAINT no_self_interaction CHECK (drug1_rxcui != drug2_rxcui),
    CONSTRAINT ordered_drug_pair CHECK (drug1_rxcui < drug2_rxcui)
);

-- Create indexes for drug interactions
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug1 ON drug_interactions(drug1_rxcui);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_drug2 ON drug_interactions(drug2_rxcui);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_severity ON drug_interactions(severity);

-- Genes table for pharmacogenomics
CREATE TABLE IF NOT EXISTS genes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    chromosome VARCHAR(10),
    function TEXT,
    aliases TEXT[],
    hgnc_id VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for genes
CREATE INDEX IF NOT EXISTS idx_genes_symbol ON genes(symbol);

-- Gene-drug interactions (pharmacogenomics)
CREATE TABLE IF NOT EXISTS gene_drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gene_symbol VARCHAR(20) NOT NULL REFERENCES genes(symbol),
    drug_rxcui VARCHAR(20) NOT NULL REFERENCES drugs(rxcui),
    phenotype VARCHAR(50) NOT NULL, -- PM, IM, NM, RM, UM
    recommendation TEXT NOT NULL,
    evidence_level VARCHAR(10) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    sources TEXT[],
    dose_adjustment VARCHAR(100), -- percentage or specific instruction
    monitoring_required BOOLEAN DEFAULT false,
    alternative_drugs TEXT[], -- RXCUIs of alternative drugs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_gene_drug_phenotype UNIQUE (gene_symbol, drug_rxcui, phenotype)
);

-- Create indexes for gene-drug interactions
CREATE INDEX IF NOT EXISTS idx_gene_drug_interactions_gene ON gene_drug_interactions(gene_symbol);
CREATE INDEX IF NOT EXISTS idx_gene_drug_interactions_drug ON gene_drug_interactions(drug_rxcui);
CREATE INDEX IF NOT EXISTS idx_gene_drug_interactions_phenotype ON gene_drug_interactions(phenotype);

-- CPIC guidelines table
CREATE TABLE IF NOT EXISTS cpic_guidelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gene_symbol VARCHAR(20) NOT NULL REFERENCES genes(symbol),
    drug_rxcui VARCHAR(20) NOT NULL REFERENCES drugs(rxcui),
    guideline_version VARCHAR(20),
    recommendation_level VARCHAR(20), -- Strong, Moderate, Optional
    phenotype_recommendations JSONB, -- Structured recommendations by phenotype
    publication_date DATE,
    doi VARCHAR(255),
    pmid VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_cpic_guideline UNIQUE (gene_symbol, drug_rxcui, guideline_version)
);

-- Oncology protocols/regimens table
CREATE TABLE IF NOT EXISTS oncology_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50),
    cancer_type VARCHAR(100) NOT NULL,
    indication TEXT,
    line_of_therapy INTEGER, -- 1st line, 2nd line, etc.
    cycle_length_days INTEGER,
    total_cycles INTEGER,
    drugs JSONB NOT NULL, -- Array of drug objects with dosing
    premedications JSONB,
    supportive_care JSONB,
    monitoring_schedule JSONB,
    dose_modifications JSONB,
    toxicity_management JSONB,
    references TEXT[],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'investigational')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    last_reviewed DATE
);

-- Create indexes for oncology protocols
CREATE INDEX IF NOT EXISTS idx_oncology_protocols_cancer_type ON oncology_protocols(cancer_type);
CREATE INDEX IF NOT EXISTS idx_oncology_protocols_name_gin ON oncology_protocols USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_oncology_protocols_status ON oncology_protocols(status);

-- Clinical trials table
CREATE TABLE IF NOT EXISTS clinical_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nct_id VARCHAR(20) UNIQUE,
    title TEXT NOT NULL,
    condition VARCHAR(255) NOT NULL,
    intervention_type VARCHAR(100),
    intervention_drugs TEXT[], -- Array of drug names/RXCUIs
    phase VARCHAR(20),
    status VARCHAR(50),
    enrollment_target INTEGER,
    primary_endpoint TEXT,
    secondary_endpoints TEXT[],
    inclusion_criteria TEXT,
    exclusion_criteria TEXT,
    biomarkers TEXT[],
    sponsor VARCHAR(255),
    locations JSONB, -- Array of location objects
    start_date DATE,
    completion_date DATE,
    last_update_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clinical trials
CREATE INDEX IF NOT EXISTS idx_clinical_trials_nct_id ON clinical_trials(nct_id);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_condition_gin ON clinical_trials USING gin(condition gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_status ON clinical_trials(status);
CREATE INDEX IF NOT EXISTS idx_clinical_trials_phase ON clinical_trials(phase);

-- User pharmacogenomic profiles
CREATE TABLE IF NOT EXISTS user_pgx_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    patient_identifier VARCHAR(255), -- De-identified patient ID
    gene_symbol VARCHAR(20) NOT NULL REFERENCES genes(symbol),
    genotype VARCHAR(100),
    phenotype VARCHAR(50),
    activity_score DECIMAL(3,1),
    test_method VARCHAR(100),
    test_date DATE,
    lab_name VARCHAR(255),
    confidence_level VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_gene UNIQUE (user_id, patient_identifier, gene_symbol)
);

-- Create indexes for PGx profiles
CREATE INDEX IF NOT EXISTS idx_user_pgx_profiles_user ON user_pgx_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pgx_profiles_gene ON user_pgx_profiles(gene_symbol);

-- Patient cases (for educational/testing purposes)
CREATE TABLE IF NOT EXISTS patient_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_name VARCHAR(255) NOT NULL,
    description TEXT,
    demographics JSONB, -- age, gender, race, etc.
    medical_history TEXT[],
    current_medications JSONB, -- Array of drug objects
    allergies TEXT[],
    lab_values JSONB,
    genetic_profile JSONB,
    presenting_complaint TEXT,
    treatment_goals TEXT[],
    expected_interactions JSONB, -- Known interactions for testing
    learning_objectives TEXT[],
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    specialty VARCHAR(100),
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit trails for drug interaction checks
CREATE TABLE IF NOT EXISTS interaction_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    drug_rxcuis TEXT[] NOT NULL,
    interactions_found INTEGER DEFAULT 0,
    highest_severity VARCHAR(20),
    alerts_overridden JSONB, -- Which alerts were ignored
    override_reasons TEXT[],
    patient_case_id UUID REFERENCES patient_cases(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients per user (server persistence for patient profiles)
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    -- Generated MRN column for fast lookup and uniqueness per user
    mrn TEXT GENERATED ALWAYS AS ((data->'demographics'->>'mrn')) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes to optimize lookups by user and recency
CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients(updated_at DESC);
-- Optional GIN index for text search within patient data (e.g., demographics)
CREATE INDEX IF NOT EXISTS idx_patients_data_gin ON patients USING gin (data jsonb_path_ops);
-- Enforce uniqueness of MRN per user (non-null MRNs)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_patients_user_mrn ON patients(user_id, mrn) WHERE mrn IS NOT NULL AND mrn <> '';

-- Trigger to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_patients_updated_at ON patients;
CREATE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Enable Row Level Security (Supabase)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own patients
DROP POLICY IF EXISTS patients_select_own ON patients;
CREATE POLICY patients_select_own ON patients
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS patients_insert_own ON patients;
CREATE POLICY patients_insert_own ON patients
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS patients_update_own ON patients;
CREATE POLICY patients_update_own ON patients
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS patients_delete_own ON patients;
CREATE POLICY patients_delete_own ON patients
FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for interaction checks
CREATE INDEX IF NOT EXISTS idx_interaction_checks_user ON interaction_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_interaction_checks_created_at ON interaction_checks(created_at);

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sync logs for external API synchronization
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type VARCHAR(50) NOT NULL, -- rxnorm, cpic, fda, trials
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'partial')),
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_errors INTEGER DEFAULT 0,
    errors JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    triggered_by VARCHAR(50) -- manual, scheduled, api
);

-- Create indexes for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_type ON sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pgx_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_checks ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can only see/edit their own PGx profiles
CREATE POLICY "Users can view own PGx profiles" ON user_pgx_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own PGx profiles" ON user_pgx_profiles FOR ALL USING (auth.uid() = user_id);

-- Public patient cases can be viewed by all, private only by creator
CREATE POLICY "Public cases viewable by all" ON patient_cases FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Users can manage own cases" ON patient_cases FOR ALL USING (auth.uid() = created_by);

-- Users can view their own interaction history
CREATE POLICY "Users can view own interaction checks" ON interaction_checks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interaction checks" ON interaction_checks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON drug_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_genes_updated_at BEFORE UPDATE ON genes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gene_drug_interactions_updated_at BEFORE UPDATE ON gene_drug_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cpic_guidelines_updated_at BEFORE UPDATE ON cpic_guidelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oncology_protocols_updated_at BEFORE UPDATE ON oncology_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_trials_updated_at BEFORE UPDATE ON clinical_trials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_pgx_profiles_updated_at BEFORE UPDATE ON user_pgx_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_cases_updated_at BEFORE UPDATE ON patient_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to search drugs with fuzzy matching
CREATE OR REPLACE FUNCTION search_drugs(search_term TEXT, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    rxcui VARCHAR(20),
    name VARCHAR(500),
    generic_name VARCHAR(500),
    brand_names TEXT[],
    drug_class VARCHAR(255),
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.rxcui,
        d.name,
        d.generic_name,
        d.brand_names,
        d.drug_class,
        GREATEST(
            similarity(d.name, search_term),
            similarity(d.generic_name, search_term),
            COALESCE((SELECT MAX(similarity(brand, search_term)) FROM unnest(d.brand_names) brand), 0)
        ) as sim
    FROM drugs d
    WHERE 
        d.name % search_term OR
        d.generic_name % search_term OR
        EXISTS (SELECT 1 FROM unnest(d.brand_names) brand WHERE brand % search_term)
    ORDER BY sim DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert initial system configuration
INSERT INTO system_config (key, value, description) VALUES 
('app_version', '"1.0.0"', 'Current application version'),
('rxnorm_last_sync', 'null', 'Last RxNorm synchronization timestamp'),
('cpic_last_sync', 'null', 'Last CPIC synchronization timestamp'),
('fda_last_sync', 'null', 'Last FDA data synchronization timestamp'),
('max_drug_interactions_check', '10', 'Maximum number of drugs allowed in single interaction check'),
('default_interaction_severity_filter', '["major", "moderate"]', 'Default severity levels to display'),
('enable_pgx_recommendations', 'true', 'Enable pharmacogenomic recommendations')
ON CONFLICT (key) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW drug_interaction_summary AS
SELECT 
    d1.name as drug1_name,
    d1.generic_name as drug1_generic,
    d2.name as drug2_name,
    d2.generic_name as drug2_generic,
    di.severity,
    di.effect,
    di.management,
    di.evidence_level,
    di.created_at
FROM drug_interactions di
JOIN drugs d1 ON di.drug1_rxcui = d1.rxcui
JOIN drugs d2 ON di.drug2_rxcui = d2.rxcui;

-- Create materialized view for drug interaction statistics
CREATE MATERIALIZED VIEW drug_interaction_stats AS
SELECT 
    severity,
    COUNT(*) as count,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
FROM drug_interactions
GROUP BY severity;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_drug_interaction_stats_severity ON drug_interaction_stats(severity);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_drug_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW drug_interaction_stats;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE drugs IS 'Comprehensive drug information from RxNorm and other sources';
COMMENT ON TABLE drug_interactions IS 'Known drug-drug interactions with clinical significance';
COMMENT ON TABLE genes IS 'Pharmacogenomic genes and their information';
COMMENT ON TABLE gene_drug_interactions IS 'Gene-drug interactions for personalized medicine';
COMMENT ON TABLE cpic_guidelines IS 'Clinical Pharmacogenetics Implementation Consortium guidelines';
COMMENT ON TABLE oncology_protocols IS 'Standardized oncology treatment protocols and regimens';
COMMENT ON TABLE clinical_trials IS 'Clinical trial information for patient matching';
COMMENT ON TABLE user_pgx_profiles IS 'User pharmacogenomic profiles for personalized recommendations';

-- Grant permissions (adjust based on your Supabase setup)
-- These would typically be handled through Supabase dashboard or additional scripts

COMMIT;
