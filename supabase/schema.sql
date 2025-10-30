-- OncoSafeRx Database Schema for Supabase
-- Create tables for drugs, interactions, and genomic data

-- Enable Row Level Security and necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drugs table - Core drug information from RxNorm/DailyMed
CREATE TABLE drugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rxcui VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    generic_name VARCHAR(500) NOT NULL,
    brand_names TEXT[], -- Array of brand names
    active_ingredients TEXT[], -- Array of active ingredients
    dosage_forms TEXT[], -- Array of dosage forms (tablet, capsule, etc.)
    strengths TEXT[], -- Array of strength values
    fda_application_number VARCHAR(100),
    ndc VARCHAR(20), -- National Drug Code
    therapeutic_class VARCHAR(200),
    indication TEXT,
    contraindications TEXT[],
    warnings TEXT[],
    adverse_reactions TEXT[],
    dosing JSONB, -- Flexible dosing information
    metabolism JSONB, -- CYP enzymes and metabolic pathways
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drug interactions table
CREATE TABLE drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    drug1_rxcui VARCHAR(50) NOT NULL,
    drug2_rxcui VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('major', 'moderate', 'minor', 'unknown')),
    mechanism TEXT,
    effect TEXT NOT NULL,
    management TEXT,
    evidence_level VARCHAR(10) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure we don't have duplicate interactions
    UNIQUE (drug1_rxcui, drug2_rxcui),
    
    -- Foreign key constraints
    FOREIGN KEY (drug1_rxcui) REFERENCES drugs(rxcui) ON DELETE CASCADE,
    FOREIGN KEY (drug2_rxcui) REFERENCES drugs(rxcui) ON DELETE CASCADE
);

-- Genes table - Pharmacogenomic genes
CREATE TABLE genes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) UNIQUE NOT NULL, -- e.g., CYP2D6, TPMT
    name VARCHAR(200) NOT NULL, -- Full gene name
    chromosome VARCHAR(10),
    function TEXT, -- Description of gene function
    clinical_significance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gene-drug interactions table
CREATE TABLE gene_drug_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gene_symbol VARCHAR(50) NOT NULL,
    drug_rxcui VARCHAR(50) NOT NULL,
    phenotype VARCHAR(100), -- e.g., "Poor Metabolizer", "Rapid Metabolizer"
    recommendation TEXT NOT NULL,
    evidence_level VARCHAR(10) CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
    implications TEXT,
    dosage_adjustment TEXT,
    sources TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique gene-drug combinations
    UNIQUE (gene_symbol, drug_rxcui),
    
    -- Foreign key constraints
    FOREIGN KEY (gene_symbol) REFERENCES genes(symbol) ON DELETE CASCADE,
    FOREIGN KEY (drug_rxcui) REFERENCES drugs(rxcui) ON DELETE CASCADE
);

-- Patient profiles table (for future personalized recommendations)
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id VARCHAR(100) UNIQUE NOT NULL, -- External patient identifier
    genetic_profile JSONB, -- Store genetic test results
    current_medications TEXT[], -- Array of current RXCUIs
    allergies TEXT[],
    comorbidities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Oncology protocols table (NCCN guidelines, treatment protocols)
CREATE TABLE oncology_protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol_name VARCHAR(200) NOT NULL,
    cancer_type VARCHAR(100) NOT NULL,
    stage VARCHAR(50),
    guideline_source VARCHAR(100), -- NCCN, ASCO, ESMO
    drugs TEXT[], -- Array of RXCUIs in the protocol
    sequence_order INTEGER,
    duration_weeks INTEGER,
    efficacy_data JSONB,
    toxicity_profile JSONB,
    contraindications TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinical trials table (integration with ClinicalTrials.gov)
CREATE TABLE clinical_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nct_id VARCHAR(20) UNIQUE NOT NULL, -- ClinicalTrials.gov identifier
    title TEXT NOT NULL,
    status VARCHAR(50),
    phase VARCHAR(20),
    condition TEXT,
    intervention TEXT,
    drugs TEXT[], -- Array of RXCUIs being studied
    eligibility_criteria TEXT,
    locations JSONB, -- Trial locations
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data sync log table
CREATE TABLE data_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(100) NOT NULL, -- rxnorm, dailymed, cpic, etc.
    sync_type VARCHAR(50) NOT NULL, -- full, incremental
    status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    records_processed INTEGER DEFAULT 0,
    records_added INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors TEXT[],
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_drugs_rxcui ON drugs(rxcui);
CREATE INDEX idx_drugs_name ON drugs(name);
CREATE INDEX idx_drugs_generic_name ON drugs(generic_name);
CREATE INDEX idx_drugs_therapeutic_class ON drugs(therapeutic_class);

CREATE INDEX idx_drug_interactions_drug1 ON drug_interactions(drug1_rxcui);
CREATE INDEX idx_drug_interactions_drug2 ON drug_interactions(drug2_rxcui);
CREATE INDEX idx_drug_interactions_severity ON drug_interactions(severity);

CREATE INDEX idx_genes_symbol ON genes(symbol);

CREATE INDEX idx_gene_drug_interactions_gene ON gene_drug_interactions(gene_symbol);
CREATE INDEX idx_gene_drug_interactions_drug ON gene_drug_interactions(drug_rxcui);

CREATE INDEX idx_patient_profiles_patient_id ON patient_profiles(patient_id);

CREATE INDEX idx_oncology_protocols_cancer_type ON oncology_protocols(cancer_type);
CREATE INDEX idx_oncology_protocols_drugs ON oncology_protocols USING GIN (drugs);

CREATE INDEX idx_clinical_trials_nct_id ON clinical_trials(nct_id);
CREATE INDEX idx_clinical_trials_condition ON clinical_trials(condition);
CREATE INDEX idx_clinical_trials_drugs ON clinical_trials USING GIN (drugs);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drug_interactions_updated_at BEFORE UPDATE ON drug_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_genes_updated_at BEFORE UPDATE ON genes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gene_drug_interactions_updated_at BEFORE UPDATE ON gene_drug_interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oncology_protocols_updated_at BEFORE UPDATE ON oncology_protocols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clinical_trials_updated_at BEFORE UPDATE ON clinical_trials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE genes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gene_drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oncology_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sync_log ENABLE ROW LEVEL SECURITY;

-- Public read access for drug and gene data (for research/educational use)
CREATE POLICY "Public read access for drugs" ON drugs FOR SELECT USING (true);
CREATE POLICY "Public read access for drug_interactions" ON drug_interactions FOR SELECT USING (true);
CREATE POLICY "Public read access for genes" ON genes FOR SELECT USING (true);

-- Trial analytics tables (agent outputs)
create table if not exists public.trial_analytics (
  drug text primary key,
  total int not null default 0,
  oncologyTotal int not null default 0,
  phaseCounts jsonb not null default '{}'::jsonb,
  ddiSignals int not null default 0,
  updatedAt timestamptz not null default now()
);

create table if not exists public.trial_analytics_runs (
  id uuid primary key default uuid_generate_v4(),
  processed int not null default 0,
  duration_ms int not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz not null default now()
);

-- RLS and policies
alter table public.trial_analytics enable row level security;
alter table public.trial_analytics_runs enable row level security;

-- For now, allow read access (adjust to role-based if needed)
create policy "Public read access for trial_analytics" on public.trial_analytics for select using (true);
create policy "Public read access for trial_analytics_runs" on public.trial_analytics_runs for select using (true);

-- Helpful indexes
create index if not exists idx_trial_analytics_updated on public.trial_analytics(updatedAt desc);
create index if not exists idx_trial_analytics_runs_finished on public.trial_analytics_runs(finished_at desc);

-- Users table for extended user profiles
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  role text default 'user' check (role in ('user', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin')),
  first_name text,
  last_name text,
  full_name text,
  specialty text,
  institution text,
  license_number text,
  years_experience integer default 0,
  preferences jsonb default '{
    "theme": "light",
    "language": "en",
    "notifications": {
      "email": true,
      "push": true,
      "criticalAlerts": true,
      "weeklyReports": true
    },
    "dashboard": {
      "defaultView": "overview",
      "refreshInterval": 5000,
      "compactMode": false
    },
    "clinical": {
      "showGenomicsByDefault": true,
      "autoCalculateDosing": true,
      "requireInteractionAck": true,
      "showPatientPhotos": false
    }
  }'::jsonb,
  persona jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_login timestamptz,
  is_active boolean default true
);

-- Users table indexes
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(is_active);

-- Enable RLS for users table
alter table public.users enable row level security;

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce((
    select role in ('admin', 'super_admin') 
    from public.users 
    where id = auth.uid()
  ), false);
$$;

-- RLS policies for users table
create policy "users_select_policy" on public.users
  for select using (
    auth.uid() = id or public.is_admin()
  );

create policy "users_insert_policy" on public.users
  for insert with check (
    auth.uid() = id or public.is_admin()
  );

create policy "users_update_policy" on public.users
  for update using (
    auth.uid() = id or public.is_admin()
  ) with check (
    auth.uid() = id or public.is_admin()
  );

-- Trigger function to handle new user creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, first_name, last_name, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    concat(
      coalesce(new.raw_user_meta_data->>'first_name', ''),
      ' ',
      coalesce(new.raw_user_meta_data->>'last_name', '')
    )
  );
  return new;
end;
$$;

-- Trigger to automatically create user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to update updated_at timestamp
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function update_updated_at_column();

CREATE POLICY "Public read access for gene_drug_interactions" ON gene_drug_interactions FOR SELECT USING (true);
CREATE POLICY "Public read access for oncology_protocols" ON oncology_protocols FOR SELECT USING (true);
CREATE POLICY "Public read access for clinical_trials" ON clinical_trials FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "Service role can manage drugs" ON drugs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage drug_interactions" ON drug_interactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage genes" ON genes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage gene_drug_interactions" ON gene_drug_interactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage patient_profiles" ON patient_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage oncology_protocols" ON oncology_protocols FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage clinical_trials" ON clinical_trials FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage data_sync_log" ON data_sync_log FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can read patient profiles they own
CREATE POLICY "Users can read own patient_profiles" ON patient_profiles FOR SELECT USING (auth.uid()::text = patient_id);
CREATE POLICY "Users can update own patient_profiles" ON patient_profiles FOR UPDATE USING (auth.uid()::text = patient_id);

-- Restrict data sync log access
CREATE POLICY "Service role read access for data_sync_log" ON data_sync_log FOR SELECT USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
