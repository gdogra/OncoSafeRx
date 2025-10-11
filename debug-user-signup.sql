-- Debug script to identify and fix remaining user signup issues

-- 1. Check if users table exists and its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check current triggers on auth.users
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
  AND event_object_table = 'users';

-- 3. Check current RLS policies on users table
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- 4. Check if the function exists and its definition
SELECT 
  proname, 
  prosrc
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 5. Test if we can insert into users table manually (should reveal constraint issues)
-- (This is just to see the structure - don't actually run this insert)
-- INSERT INTO public.users (id, email, first_name, last_name, role) 
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'test@example.com', 'Test', 'User', 'student');