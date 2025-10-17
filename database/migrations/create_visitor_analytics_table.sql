-- Create visitor_analytics table for tracking site analytics
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.visitor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    referrer_url TEXT,
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    viewport_size VARCHAR(20),
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    visit_duration INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to columns
COMMENT ON TABLE public.visitor_analytics IS 'Tracks visitor analytics and site usage data';
COMMENT ON COLUMN public.visitor_analytics.session_id IS 'Unique session identifier for tracking user sessions';
COMMENT ON COLUMN public.visitor_analytics.user_id IS 'Reference to authenticated user (NULL for anonymous visitors)';
COMMENT ON COLUMN public.visitor_analytics.visit_duration IS 'Time spent on page in seconds';
COMMENT ON COLUMN public.visitor_analytics.bounce IS 'Whether this was a bounce (single page visit)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_user_id ON public.visitor_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_created_at ON public.visitor_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_page_url ON public.visitor_analytics(page_url);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_device_type ON public.visitor_analytics(device_type);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_country_code ON public.visitor_analytics(country_code);

-- Create RLS policies for security
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all analytics
CREATE POLICY "Admins can view all visitor analytics" ON public.visitor_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin') 
            AND is_active = true 
            AND deleted_at IS NULL
        )
    );

-- Policy for service role to insert analytics data
CREATE POLICY "Service role can insert visitor analytics" ON public.visitor_analytics
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON public.visitor_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_analytics TO service_role;