-- Check existing users and get their IDs
-- Run this in your Supabase SQL Editor

-- Show existing users
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email IN ('tenniscommunity2@gmail.com', 'gdogra@gmail.com')
ORDER BY created_at;