-- Comprehensive Patient Features Database Schema
-- OncoSafeRx Patient Experience Platform
-- Generated: 2024-11-08

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- =============================================
-- 1. MEDICATION ADHERENCE & REMINDERS
-- =============================================

-- Medication schedules and reminders
CREATE TABLE IF NOT EXISTS medication_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    rxcui VARCHAR(20),
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- 'daily', 'twice_daily', 'as_needed', etc.
    schedule_times TIME[], -- Array of times to take medication
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication adherence logs
CREATE TABLE IF NOT EXISTS medication_adherence_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    taken_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('taken', 'missed', 'delayed', 'skipped')) DEFAULT 'missed',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Side effects tracking
CREATE TABLE IF NOT EXISTS medication_side_effects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    side_effect VARCHAR(255) NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10) NOT NULL,
    started_date DATE NOT NULL,
    resolved_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. SYMPTOM & SIDE EFFECT TRACKER
-- =============================================

-- Daily symptom tracking
CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    symptom_type VARCHAR(100) NOT NULL, -- 'fatigue', 'nausea', 'pain', etc.
    severity INTEGER CHECK (severity BETWEEN 1 AND 10) NOT NULL,
    location VARCHAR(100), -- Body location if applicable
    triggers TEXT,
    relief_measures TEXT,
    interference_level INTEGER CHECK (interference_level BETWEEN 1 AND 5), -- Impact on daily activities
    notes TEXT,
    photo_urls TEXT[], -- Array of photo URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom correlation analysis
CREATE TABLE IF NOT EXISTS symptom_correlations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_symptom VARCHAR(100) NOT NULL,
    correlated_factor VARCHAR(100) NOT NULL, -- medication, activity, food, etc.
    correlation_strength DECIMAL(3,2), -- -1 to 1
    confidence_level DECIMAL(3,2), -- 0 to 1
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. TREATMENT JOURNEY TIMELINE
-- =============================================

-- Treatment milestones and progress
CREATE TABLE IF NOT EXISTS treatment_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_type VARCHAR(100) NOT NULL, -- 'diagnosis', 'treatment_start', 'scan', 'surgery', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_date DATE,
    completed_date DATE,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'postponed')) DEFAULT 'scheduled',
    outcome TEXT,
    photo_urls TEXT[],
    is_celebration_worthy BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment response tracking
CREATE TABLE IF NOT EXISTS treatment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_name VARCHAR(255) NOT NULL,
    assessment_date DATE NOT NULL,
    response_type VARCHAR(50), -- 'complete_response', 'partial_response', 'stable', 'progression'
    biomarker_values JSONB, -- Lab results, tumor markers, etc.
    imaging_results TEXT,
    physician_notes TEXT,
    patient_reported_improvement INTEGER CHECK (patient_reported_improvement BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. CARE TEAM COMMUNICATION
-- =============================================

-- Care team members
CREATE TABLE IF NOT EXISTS care_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'oncologist', 'nurse', 'pharmacist', 'social_worker', etc.
    specialty VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    organization VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Secure messages between patient and care team
CREATE TABLE IF NOT EXISTS care_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id UUID NOT NULL REFERENCES auth.users(id), -- For thread organization
    subject VARCHAR(255),
    message_body TEXT NOT NULL,
    priority VARCHAR(20) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    message_type VARCHAR(50), -- 'question', 'update', 'appointment_request', 'prescription_refill'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB, -- File URLs and metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. FAMILY & CAREGIVER PORTAL
-- =============================================

-- Caregiver relationships and permissions
CREATE TABLE IF NOT EXISTS caregiver_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship VARCHAR(100), -- 'spouse', 'parent', 'child', 'friend', etc.
    permission_level VARCHAR(20) CHECK (permission_level IN ('view_only', 'limited', 'full')) DEFAULT 'view_only',
    permissions JSONB, -- Detailed permission settings
    is_emergency_contact BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Shared notes between patient and caregivers
CREATE TABLE IF NOT EXISTS caregiver_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    note_type VARCHAR(50), -- 'observation', 'reminder', 'question', 'update'
    content TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    visibility VARCHAR(20) CHECK (visibility IN ('patient_only', 'caregivers_only', 'all')) DEFAULT 'all',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. WELLNESS & MENTAL HEALTH
-- =============================================

-- Wellness activities and tracking
CREATE TABLE IF NOT EXISTS wellness_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'meditation', 'exercise', 'journaling', etc.
    activity_name VARCHAR(255),
    duration_minutes INTEGER,
    intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 5),
    mood_before INTEGER CHECK (mood_before BETWEEN 1 AND 10),
    mood_after INTEGER CHECK (mood_after BETWEEN 1 AND 10),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    notes TEXT,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mental health assessments
CREATE TABLE IF NOT EXISTS mental_health_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50), -- 'PHQ-9', 'GAD-7', 'custom'
    assessment_date DATE NOT NULL,
    scores JSONB, -- Assessment scores and subscales
    total_score INTEGER,
    risk_level VARCHAR(20), -- 'minimal', 'mild', 'moderate', 'severe'
    recommendations TEXT,
    follow_up_needed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. NUTRITION & WELLNESS TRACKING
-- =============================================

-- Nutritional intake tracking
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    meal_type VARCHAR(50), -- 'breakfast', 'lunch', 'dinner', 'snack'
    food_items JSONB, -- Array of foods with portions
    total_calories INTEGER,
    protein_grams DECIMAL(6,2),
    carbs_grams DECIMAL(6,2),
    fat_grams DECIMAL(6,2),
    water_intake_ml INTEGER,
    appetite_level INTEGER CHECK (appetite_level BETWEEN 1 AND 10),
    nausea_level INTEGER CHECK (nausea_level BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. FINANCIAL & INSURANCE TRACKING
-- =============================================

-- Treatment costs and insurance
CREATE TABLE IF NOT EXISTS treatment_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    provider_name VARCHAR(255),
    service_type VARCHAR(100), -- 'consultation', 'infusion', 'imaging', 'lab', etc.
    procedure_codes VARCHAR[], -- CPT codes
    total_cost DECIMAL(10,2),
    insurance_covered DECIMAL(10,2),
    copay DECIMAL(10,2),
    deductible DECIMAL(10,2),
    out_of_pocket DECIMAL(10,2),
    payment_status VARCHAR(50), -- 'pending', 'paid', 'denied', 'appealing'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. APPOINTMENTS & LOGISTICS
-- =============================================

-- Appointment scheduling and coordination
CREATE TABLE IF NOT EXISTS patient_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES care_team_members(id),
    appointment_type VARCHAR(100), -- 'consultation', 'infusion', 'follow_up', etc.
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location_name VARCHAR(255),
    location_address TEXT,
    preparation_instructions TEXT,
    transportation_arranged BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 10. INTEGRATION & CONNECTIVITY
-- =============================================

-- External system integrations
CREATE TABLE IF NOT EXISTS patient_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_type VARCHAR(100), -- 'wearable', 'pharmacy', 'lab', 'ehr'
    provider_name VARCHAR(255), -- 'Apple Health', 'Epic', 'CVS', etc.
    connection_status VARCHAR(20) CHECK (connection_status IN ('connected', 'disconnected', 'error')) DEFAULT 'disconnected',
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_frequency VARCHAR(50), -- 'real_time', 'hourly', 'daily'
    data_types TEXT[], -- What types of data are synced
    credentials_encrypted TEXT, -- Encrypted API keys/tokens
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Imported health data from external sources
CREATE TABLE IF NOT EXISTS health_data_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES patient_integrations(id),
    data_type VARCHAR(100), -- 'vitals', 'activity', 'sleep', 'lab_results'
    raw_data JSONB,
    processed_data JSONB,
    import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_timestamp TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Medication adherence indexes
CREATE INDEX idx_medication_schedules_patient_active ON medication_schedules(patient_id, is_active);
CREATE INDEX idx_adherence_logs_schedule_time ON medication_adherence_logs(schedule_id, scheduled_time);

-- Symptom tracking indexes
CREATE INDEX idx_symptom_logs_patient_date ON symptom_logs(patient_id, log_date);
CREATE INDEX idx_symptom_logs_type_severity ON symptom_logs(symptom_type, severity);

-- Treatment timeline indexes
CREATE INDEX idx_treatment_milestones_patient_date ON treatment_milestones(patient_id, scheduled_date);
CREATE INDEX idx_treatment_responses_patient_date ON treatment_responses(patient_id, assessment_date);

-- Communication indexes
CREATE INDEX idx_care_messages_thread ON care_messages(thread_id, created_at);
CREATE INDEX idx_care_messages_patient_unread ON care_messages(patient_id, is_read);

-- Caregiver indexes
CREATE INDEX idx_caregiver_relationships_patient ON caregiver_relationships(patient_id, is_active);

-- Wellness indexes
CREATE INDEX idx_wellness_activities_patient_date ON wellness_activities(patient_id, completed_date);
CREATE INDEX idx_mental_health_assessments_patient ON mental_health_assessments(patient_id, assessment_date);

-- Appointment indexes
CREATE INDEX idx_patient_appointments_date ON patient_appointments(patient_id, scheduled_date);
CREATE INDEX idx_patient_appointments_status ON patient_appointments(status, scheduled_date);

-- Integration indexes
CREATE INDEX idx_patient_integrations_type ON patient_integrations(patient_id, integration_type);
CREATE INDEX idx_health_data_imports_patient_type ON health_data_imports(patient_id, data_type, data_timestamp);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_adherence_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregiver_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_data_imports ENABLE ROW LEVEL SECURITY;

-- Patient access policies (users can access their own data)
CREATE POLICY patient_own_data_medication_schedules ON medication_schedules FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_adherence_logs ON medication_adherence_logs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_side_effects ON medication_side_effects FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_symptom_logs ON symptom_logs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_symptom_correlations ON symptom_correlations FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_treatment_milestones ON treatment_milestones FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_treatment_responses ON treatment_responses FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_care_team ON care_team_members FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_wellness ON wellness_activities FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_mental_health ON mental_health_assessments FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_nutrition ON nutrition_logs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_costs ON treatment_costs FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_appointments ON patient_appointments FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_integrations ON patient_integrations FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY patient_own_data_health_imports ON health_data_imports FOR ALL USING (auth.uid() = patient_id);

-- Caregiver access policies (caregivers can access data for patients they're authorized to help)
CREATE POLICY caregiver_access_policy ON caregiver_relationships FOR ALL 
USING (auth.uid() = patient_id OR auth.uid() = caregiver_id);

CREATE POLICY caregiver_notes_access ON caregiver_notes FOR ALL 
USING (
  auth.uid() = patient_id OR 
  auth.uid() = author_id OR
  EXISTS (
    SELECT 1 FROM caregiver_relationships cr 
    WHERE cr.patient_id = caregiver_notes.patient_id 
    AND cr.caregiver_id = auth.uid() 
    AND cr.is_active = true
  )
);

-- Care team message policies
CREATE POLICY care_messages_access ON care_messages FOR ALL 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR
  auth.uid() = patient_id
);

-- Automated triggers for timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers where needed
CREATE TRIGGER update_medication_schedules_updated_at BEFORE UPDATE ON medication_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatment_milestones_updated_at BEFORE UPDATE ON treatment_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_appointments_updated_at BEFORE UPDATE ON patient_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_integrations_updated_at BEFORE UPDATE ON patient_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Patient Features Database Schema Created Successfully! 🎉' as status;