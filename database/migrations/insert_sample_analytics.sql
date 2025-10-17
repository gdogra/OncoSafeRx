-- Insert sample visitor analytics data for testing
-- Run this after creating the fixed visitor_analytics table

INSERT INTO public.visitor_analytics (
    event_type,
    session_id,
    user_id,
    user_role,
    page_url,
    page_title,
    referrer,
    user_agent,
    timestamp,
    data,
    device_type,
    browser_name,
    country_code,
    visit_duration,
    bounce
) VALUES 
-- Sample data for admin user
(
    'page_view',
    'session_' || gen_random_uuid()::text,
    (SELECT id FROM public.users WHERE role = 'super_admin' LIMIT 1),
    'super_admin',
    '/admin/dashboard',
    'Admin Dashboard - OncoSafeRx',
    'https://oncosaferx.com',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '1 hour',
    '{"action": "dashboard_view", "section": "overview"}',
    'desktop',
    'Chrome',
    'US',
    300,
    false
),
-- Sample data for patient users
(
    'page_view',
    'session_' || gen_random_uuid()::text,
    (SELECT id FROM public.users WHERE role = 'patient' LIMIT 1),
    'patient',
    '/patient/profile',
    'Patient Profile - OncoSafeRx',
    'https://google.com',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    NOW() - INTERVAL '2 hours',
    '{"action": "profile_view", "section": "personal_info"}',
    'mobile',
    'Safari',
    'CA',
    180,
    false
),
(
    'page_view',
    'session_' || gen_random_uuid()::text,
    (SELECT id FROM public.users WHERE role = 'patient' LIMIT 1 OFFSET 1),
    'patient',
    '/patient/medications',
    'My Medications - OncoSafeRx',
    'https://oncosaferx.com/patient/profile',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() - INTERVAL '30 minutes',
    '{"action": "medications_view", "medication_count": 3}',
    'desktop',
    'Chrome',
    'US',
    450,
    false
),
-- Anonymous visitor
(
    'page_view',
    'session_' || gen_random_uuid()::text,
    NULL,
    NULL,
    '/about',
    'About OncoSafeRx',
    'https://google.com',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() - INTERVAL '15 minutes',
    '{"action": "about_view", "source": "organic_search"}',
    'desktop',
    'Chrome',
    'US',
    60,
    true
),
-- Additional patient activity
(
    'page_view',
    'session_' || gen_random_uuid()::text,
    (SELECT id FROM public.users WHERE role = 'patient' LIMIT 1 OFFSET 2),
    'patient',
    '/patient/appointments',
    'Appointments - OncoSafeRx',
    'https://oncosaferx.com',
    'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    NOW() - INTERVAL '45 minutes',
    '{"action": "appointments_view", "upcoming_count": 2}',
    'tablet',
    'Safari',
    'CA',
    220,
    false
);