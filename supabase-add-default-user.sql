-- Add default user for production without authentication
-- Run this in your Supabase SQL Editor

-- Ultra-minimal insert with a proper UUID
INSERT INTO users (id, email, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'user@oncosaferx.com',
  'oncologist'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the user was created
SELECT id, email, role 
FROM users 
WHERE id = '00000000-0000-0000-0000-000000000001';