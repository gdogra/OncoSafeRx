-- First, let's see the actual structure of the public.users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Fixed sync for the 2 missing users with correct column name
INSERT INTO public.users (id, email, user_role, first_name, last_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'patient') as user_role,
  COALESCE(au.raw_user_meta_data->>'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data->>'last_name', '') as last_name,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.deleted_at IS NULL
  AND au.id NOT IN (SELECT id FROM public.users)
  AND au.email IN ('mangifit@gmail.com', 'tenniscommunity2@gmail.com');

-- Verify the sync worked
SELECT 'After sync - Auth users:' as description, COUNT(*) as count FROM auth.users WHERE deleted_at IS NULL
UNION ALL
SELECT 'After sync - Public users:', COUNT(*) FROM public.users;