-- Sync the 2 missing users from auth.users to public.users
INSERT INTO public.users (id, email, role, first_name, last_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'role', 'patient') as role,
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

-- Show all users to confirm they're all synced
SELECT 'All users now in public.users:' as status, email, role, first_name, last_name 
FROM public.users 
ORDER BY created_at;