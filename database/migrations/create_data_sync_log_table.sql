-- Create data_sync_log table for tracking data synchronization operations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.data_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    operation_type VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
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

-- Add comments to columns
COMMENT ON TABLE public.data_sync_log IS 'Tracks data synchronization operations and their status';
COMMENT ON COLUMN public.data_sync_log.operation_type IS 'Type of operation: CREATE, UPDATE, DELETE, SYNC, BACKUP';
COMMENT ON COLUMN public.data_sync_log.table_name IS 'Name of the table being synchronized';
COMMENT ON COLUMN public.data_sync_log.record_id IS 'ID of the specific record being synchronized';
COMMENT ON COLUMN public.data_sync_log.operation_status IS 'Status: pending, running, completed, failed, retrying';
COMMENT ON COLUMN public.data_sync_log.sync_source IS 'Source system for the sync operation';
COMMENT ON COLUMN public.data_sync_log.sync_destination IS 'Destination system for the sync operation';
COMMENT ON COLUMN public.data_sync_log.data_payload IS 'JSON payload of the data being synchronized';
COMMENT ON COLUMN public.data_sync_log.execution_time_ms IS 'Time taken to execute the operation in milliseconds';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_data_sync_log_operation_type ON public.data_sync_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_table_name ON public.data_sync_log(table_name);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_record_id ON public.data_sync_log(record_id) WHERE record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_sync_log_user_id ON public.data_sync_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_data_sync_log_status ON public.data_sync_log(operation_status);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_created_at ON public.data_sync_log(created_at);
CREATE INDEX IF NOT EXISTS idx_data_sync_log_retry_count ON public.data_sync_log(retry_count) WHERE retry_count > 0;

-- Create RLS policies for security
ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all sync logs
CREATE POLICY "Admins can view all data sync logs" ON public.data_sync_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND deleted_at IS NULL
        )
    );

-- Policy for service role to manage sync logs
CREATE POLICY "Service role can manage data sync logs" ON public.data_sync_log
    FOR ALL WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.data_sync_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_sync_log TO service_role;