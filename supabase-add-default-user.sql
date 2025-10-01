-- Add default user for production without authentication
-- Run this in your Supabase SQL Editor

-- Insert the default user with correct column names
INSERT INTO users (
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  specialty,
  institution,
  license_number,
  years_experience,
  preferences,
  persona,
  created_at, 
  updated_at, 
  last_login,
  is_active,
  aud,
  email_confirmed_at,
  confirmed_at
)
VALUES (
  'default-user-production',
  'user@oncosaferx.com',
  'Default',
  'User',
  'oncologist',
  'Medical Oncology',
  'OncoSafeRx',
  'DEFAULT001',
  5,
  '{}',
  '{}',
  NOW(),
  NOW(),
  NOW(),
  true,
  'authenticated',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW(),
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verify the user was created
SELECT id, email, first_name, last_name, role, specialty, created_at, is_active 
FROM users 
WHERE id = 'default-user-production';