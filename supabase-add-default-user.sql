-- Add default user for production without authentication
-- Run this in your Supabase SQL Editor

-- Insert the default user if it doesn't exist
INSERT INTO users (id, email, full_name, role, created_at, updated_at, is_active)
VALUES (
  'default-user-production',
  'user@oncosaferx.com',
  'Default Production User',
  'oncologist',
  NOW(),
  NOW(),
  true
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verify the user was created
SELECT id, email, full_name, role, created_at FROM users WHERE id = 'default-user-production';