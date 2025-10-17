-- Create comprehensive audit trail table for HIPAA compliance
-- This table stores all access to Protected Health Information (PHI)

DROP TABLE IF EXISTS public.audit_trail CASCADE;

CREATE TABLE public.audit_trail (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id UUID,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    sensitivity_level VARCHAR(20) DEFAULT 'medium',
    outcome VARCHAR(20) DEFAULT 'success',
    error_message TEXT,
    additional_data JSONB,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE public.audit_trail 
ADD CONSTRAINT fk_audit_trail_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON TABLE public.audit_trail IS 'HIPAA-compliant audit trail for all PHI access and system events';
COMMENT ON COLUMN public.audit_trail.event_type IS 'Type of event: phi_access, phi_create, phi_update, phi_delete, user_login, admin_action, security_event';
COMMENT ON COLUMN public.audit_trail.sensitivity_level IS 'Event sensitivity: low, medium, high, critical';
COMMENT ON COLUMN public.audit_trail.outcome IS 'Event outcome: success, failure, security_event';
COMMENT ON COLUMN public.audit_trail.old_values IS 'Previous values before change (for update/delete operations)';
COMMENT ON COLUMN public.audit_trail.new_values IS 'New values after change (for create/update operations)';

-- Create indexes for performance and compliance queries
CREATE INDEX idx_audit_trail_event_type ON public.audit_trail(event_type);
CREATE INDEX idx_audit_trail_user_id ON public.audit_trail(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_trail_user_email ON public.audit_trail(user_email);
CREATE INDEX idx_audit_trail_resource ON public.audit_trail(resource_type, resource_id);
CREATE INDEX idx_audit_trail_timestamp ON public.audit_trail(timestamp DESC);
CREATE INDEX idx_audit_trail_sensitivity ON public.audit_trail(sensitivity_level);
CREATE INDEX idx_audit_trail_ip_address ON public.audit_trail(ip_address);
CREATE INDEX idx_audit_trail_session_id ON public.audit_trail(session_id);

-- Index for HIPAA compliance queries (PHI access by user)
CREATE INDEX idx_audit_trail_phi_access ON public.audit_trail(user_id, event_type, timestamp) 
WHERE event_type IN ('phi_access', 'phi_create', 'phi_update', 'phi_delete');

-- Index for security monitoring
CREATE INDEX idx_audit_trail_security_events ON public.audit_trail(event_type, sensitivity_level, timestamp)
WHERE event_type = 'security_event' OR sensitivity_level = 'critical';

-- Enable Row Level Security for audit trail protection
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins and system can view audit trails
CREATE POLICY "Super admins can view audit trails" ON public.audit_trail
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin' 
        AND is_active = true 
        AND deleted_at IS NULL
    )
);

-- Policy: Only service role can insert audit entries
CREATE POLICY "Service role can insert audit entries" ON public.audit_trail
FOR INSERT WITH CHECK (true);

-- Policy: Audit entries are immutable (no updates or deletes)
CREATE POLICY "Audit entries are immutable" ON public.audit_trail
FOR UPDATE USING (false);

CREATE POLICY "Audit entries cannot be deleted" ON public.audit_trail
FOR DELETE USING (false);

-- Grant permissions
GRANT SELECT ON public.audit_trail TO authenticated;
GRANT INSERT ON public.audit_trail TO service_role;
GRANT SELECT ON public.audit_trail TO service_role;

-- Create function to prevent audit trail modifications
CREATE OR REPLACE FUNCTION prevent_audit_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit trail entries cannot be modified for compliance reasons';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to prevent modifications
CREATE TRIGGER prevent_audit_update
    BEFORE UPDATE ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modifications();

CREATE TRIGGER prevent_audit_delete
    BEFORE DELETE ON public.audit_trail
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modifications();

-- Create function for audit trail cleanup (respecting retention period)
CREATE OR REPLACE FUNCTION cleanup_audit_trail(retention_days INTEGER DEFAULT 2555)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Only delete non-critical events older than retention period
    DELETE FROM public.audit_trail 
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL
    AND sensitivity_level != 'critical';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO public.audit_trail (
        event_type, action, resource_type, 
        additional_data, timestamp, sensitivity_level
    ) VALUES (
        'system_maintenance', 'CLEANUP', 'audit_trail',
        jsonb_build_object('deleted_count', deleted_count, 'retention_days', retention_days),
        NOW(), 'medium'
    );
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;