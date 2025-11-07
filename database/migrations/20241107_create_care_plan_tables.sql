-- Care Plan Database Migration
-- Creates tables for comprehensive care plan management

-- Main care plans table
CREATE TABLE IF NOT EXISTS care_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_physician_id UUID REFERENCES auth.users(id),
    primary_physician TEXT,
    diagnosis TEXT,
    stage TEXT,
    treatment_phase TEXT CHECK (treatment_phase IN ('initial', 'active', 'maintenance', 'surveillance', 'palliative')),
    start_date TIMESTAMPTZ,
    review_date TIMESTAMPTZ,
    goals JSONB DEFAULT '[]'::jsonb,
    milestones JSONB DEFAULT '[]'::jsonb,
    risk_factors JSONB DEFAULT '[]'::jsonb,
    allergies JSONB DEFAULT '[]'::jsonb,
    current_medications JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care plan sections (treatment, medications, etc.)
CREATE TABLE IF NOT EXISTS care_plan_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    section_type TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Care plan goals
CREATE TABLE IF NOT EXISTS care_plan_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_plan_id UUID REFERENCES care_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    target_date TIMESTAMPTZ,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    category TEXT CHECK (category IN ('treatment', 'lifestyle', 'support', 'monitoring')),
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care team members
CREATE TABLE IF NOT EXISTS care_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- If team member is a system user
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('oncologist', 'nurse', 'pharmacist', 'social_worker', 'nutritionist', 'surgeon', 'radiologist', 'pathologist')),
    specialty TEXT,
    hospital TEXT,
    department TEXT,
    email TEXT,
    phone TEXT,
    availability TEXT CHECK (availability IN ('available', 'busy', 'offline')) DEFAULT 'available',
    last_active TIMESTAMPTZ DEFAULT NOW(),
    certifications JSONB DEFAULT '[]'::jsonb,
    years_experience INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care tasks
CREATE TABLE IF NOT EXISTS care_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_plan_id UUID REFERENCES care_plans(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('medication', 'appointment', 'lab', 'imaging', 'consultation', 'follow_up', 'education', 'emergency')) NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_to TEXT, -- Can be user ID or role name
    assigned_by UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES auth.users(id),
    provider_name TEXT,
    appointment_type TEXT,
    appointment_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    location TEXT,
    notes TEXT,
    status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communication threads
CREATE TABLE IF NOT EXISTS communication_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    participants JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of user IDs
    type TEXT CHECK (type IN ('general', 'urgent', 'medication', 'symptoms', 'results')) DEFAULT 'general',
    priority TEXT CHECK (priority IN ('normal', 'high', 'urgent')) DEFAULT 'normal',
    is_active BOOLEAN DEFAULT true,
    unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages within communication threads
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES communication_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'document', 'system')) DEFAULT 'text',
    read_by JSONB DEFAULT '[]'::jsonb, -- Array of user IDs who have read this message
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_care_plans_patient_id ON care_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plans_active ON care_plans(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_care_plan_sections_patient_id ON care_plan_sections(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_sections_active ON care_plan_sections(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_care_plan_goals_patient_id ON care_plan_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_plan_goals_status ON care_plan_goals(status);

CREATE INDEX IF NOT EXISTS idx_care_team_members_patient_id ON care_team_members(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_team_members_active ON care_team_members(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_care_tasks_patient_id ON care_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_care_tasks_status ON care_tasks(status);
CREATE INDEX IF NOT EXISTS idx_care_tasks_due_date ON care_tasks(due_date);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

CREATE INDEX IF NOT EXISTS idx_communication_threads_patient_id ON communication_threads(patient_id);
CREATE INDEX IF NOT EXISTS idx_communication_threads_active ON communication_threads(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_care_plans_updated_at ON care_plans;
CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON care_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_care_plan_sections_updated_at ON care_plan_sections;
CREATE TRIGGER update_care_plan_sections_updated_at BEFORE UPDATE ON care_plan_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_care_plan_goals_updated_at ON care_plan_goals;
CREATE TRIGGER update_care_plan_goals_updated_at BEFORE UPDATE ON care_plan_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_care_team_members_updated_at ON care_team_members;
CREATE TRIGGER update_care_team_members_updated_at BEFORE UPDATE ON care_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_care_tasks_updated_at ON care_tasks;
CREATE TRIGGER update_care_tasks_updated_at BEFORE UPDATE ON care_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communication_threads_updated_at ON communication_threads;
CREATE TRIGGER update_communication_threads_updated_at BEFORE UPDATE ON communication_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Care plans - patients can only see their own
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care plans" ON care_plans;
CREATE POLICY "Users can view their own care plans" ON care_plans FOR ALL USING (patient_id = auth.uid());

-- Care plan sections - patients can only see their own
ALTER TABLE care_plan_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care plan sections" ON care_plan_sections;
CREATE POLICY "Users can view their own care plan sections" ON care_plan_sections FOR ALL USING (patient_id = auth.uid());

-- Care plan goals - patients can only see their own
ALTER TABLE care_plan_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care plan goals" ON care_plan_goals;
CREATE POLICY "Users can view their own care plan goals" ON care_plan_goals FOR ALL USING (patient_id = auth.uid());

-- Care team members - patients can only see their own team
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care team" ON care_team_members;
CREATE POLICY "Users can view their own care team" ON care_team_members FOR ALL USING (patient_id = auth.uid());

-- Care tasks - patients can only see their own tasks
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own care tasks" ON care_tasks;
CREATE POLICY "Users can view their own care tasks" ON care_tasks FOR ALL USING (patient_id = auth.uid());

-- Appointments - patients can only see their own appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
CREATE POLICY "Users can view their own appointments" ON appointments FOR ALL USING (patient_id = auth.uid());

-- Communication threads - users can only see threads they participate in
ALTER TABLE communication_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view threads they participate in" ON communication_threads;
CREATE POLICY "Users can view threads they participate in" ON communication_threads 
FOR ALL USING (participants @> jsonb_build_array(auth.uid()::text));

-- Messages - users can only see messages in threads they participate in
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their threads" ON messages;
CREATE POLICY "Users can view messages in their threads" ON messages 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM communication_threads 
        WHERE id = messages.thread_id 
        AND participants @> jsonb_build_array(auth.uid()::text)
    )
);

-- Grant permissions
GRANT ALL ON care_plans TO authenticated;
GRANT ALL ON care_plan_sections TO authenticated;
GRANT ALL ON care_plan_goals TO authenticated;
GRANT ALL ON care_team_members TO authenticated;
GRANT ALL ON care_tasks TO authenticated;
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON communication_threads TO authenticated;
GRANT ALL ON messages TO authenticated;