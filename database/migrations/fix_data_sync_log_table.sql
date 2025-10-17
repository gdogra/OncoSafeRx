-- Fix data_sync_log table creation
-- Run this in Supabase SQL Editor

-- First, drop the table if it exists incomplete
DROP TABLE IF EXISTS public.data_sync_log CASCADE;

-- Create the table with a simpler approach
CREATE TABLE public.data_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    user_id UUID,
    operation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    sync_source VARCHAR(50),
    sync_destination VARCHAR(50),
    data_payload JSONB,
    execution_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Add foreign key constraint separately
ALTER TABLE public.data_sync_log 
ADD CONSTRAINT fk_data_sync_log_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE public.data_sync_log IS 'Tracks data synchronization operations and their status';
COMMENT ON COLUMN public.data_sync_log.operation_type IS 'Type of operation: CREATE, UPDATE, DELETE, SYNC, BACKUP';
COMMENT ON COLUMN public.data_sync_log.table_name IS 'Name of the table being synchronized';
COMMENT ON COLUMN public.data_sync_log.record_id IS 'ID of the specific record being synchronized';
COMMENT ON COLUMN public.data_sync_log.operation_status IS 'Status: pending, running, completed, failed, retrying';

-- Create indexes
CREATE INDEX idx_data_sync_log_operation_type ON public.data_sync_log(operation_type);
CREATE INDEX idx_data_sync_log_table_name ON public.data_sync_log(table_name);
CREATE INDEX idx_data_sync_log_status ON public.data_sync_log(operation_status);
CREATE INDEX idx_data_sync_log_created_at ON public.data_sync_log(created_at);

-- Enable RLS
ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all data sync logs" ON public.data_sync_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        )
    );

CREATE POLICY "Service role can manage data sync logs" ON public.data_sync_log
    FOR ALL WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.data_sync_log TO authenticated;
GRANT ALL ON public.data_sync_log TO service_role;