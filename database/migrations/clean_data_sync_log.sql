-- Clean data_sync_log table creation
DROP TABLE IF EXISTS public.data_sync_log CASCADE;

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

ALTER TABLE public.data_sync_log 
ADD CONSTRAINT fk_data_sync_log_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX idx_data_sync_log_operation_type ON public.data_sync_log(operation_type);
CREATE INDEX idx_data_sync_log_table_name ON public.data_sync_log(table_name);
CREATE INDEX idx_data_sync_log_status ON public.data_sync_log(operation_status);
CREATE INDEX idx_data_sync_log_created_at ON public.data_sync_log(created_at);

ALTER TABLE public.data_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all data sync logs" ON public.data_sync_log
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true 
    )
);

CREATE POLICY "Service role can manage data sync logs" ON public.data_sync_log
FOR ALL WITH CHECK (true);

GRANT SELECT ON public.data_sync_log TO authenticated;
GRANT ALL ON public.data_sync_log TO service_role;