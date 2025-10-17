-- Fix visitor_analytics table creation  
-- Run this in Supabase SQL Editor

-- First, drop the table if it exists incomplete
DROP TABLE IF EXISTS public.visitor_analytics CASCADE;

-- Create the table with a simpler approach
CREATE TABLE public.visitor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id UUID,
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    country_code VARCHAR(2),
    visit_duration INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint separately
ALTER TABLE public.visitor_analytics 
ADD CONSTRAINT fk_visitor_analytics_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON TABLE public.visitor_analytics IS 'Tracks visitor analytics and site usage data';
COMMENT ON COLUMN public.visitor_analytics.session_id IS 'Unique session identifier for tracking user sessions';
COMMENT ON COLUMN public.visitor_analytics.user_id IS 'Reference to authenticated user (NULL for anonymous visitors)';

-- Create indexes
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX idx_visitor_analytics_created_at ON public.visitor_analytics(created_at);
CREATE INDEX idx_visitor_analytics_page_url ON public.visitor_analytics(page_url);

-- Enable RLS
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all visitor analytics" ON public.visitor_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND (deleted_at IS NULL OR deleted_at IS NULL)
        )
    );

CREATE POLICY "Service role can insert visitor analytics" ON public.visitor_analytics
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON public.visitor_analytics TO authenticated;
GRANT ALL ON public.visitor_analytics TO service_role;