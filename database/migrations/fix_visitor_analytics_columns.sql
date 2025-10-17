-- Fix visitor_analytics table to match analytics code expectations
DROP TABLE IF EXISTS public.visitor_analytics CASCADE;

CREATE TABLE public.visitor_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID,
    user_role VARCHAR(50),
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    referrer TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ,
    data JSONB,
    ip_address INET,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    country_code VARCHAR(2),
    visit_duration INTEGER DEFAULT 0,
    bounce BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.visitor_analytics 
ADD CONSTRAINT fk_visitor_analytics_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX idx_visitor_analytics_event_type ON public.visitor_analytics(event_type);
CREATE INDEX idx_visitor_analytics_session_id ON public.visitor_analytics(session_id);
CREATE INDEX idx_visitor_analytics_user_id ON public.visitor_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_visitor_analytics_user_role ON public.visitor_analytics(user_role);
CREATE INDEX idx_visitor_analytics_created_at ON public.visitor_analytics(created_at);
CREATE INDEX idx_visitor_analytics_page_url ON public.visitor_analytics(page_url);
CREATE INDEX idx_visitor_analytics_timestamp ON public.visitor_analytics(timestamp);

ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all visitor analytics" ON public.visitor_analytics
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'super_admin') 
        AND is_active = true 
    )
);

CREATE POLICY "Service role can insert visitor analytics" ON public.visitor_analytics
FOR INSERT WITH CHECK (true);

GRANT SELECT ON public.visitor_analytics TO authenticated;
GRANT ALL ON public.visitor_analytics TO service_role;