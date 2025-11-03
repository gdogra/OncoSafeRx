-- Recreate the trigger function for user sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Query to check current state
SELECT 'Auth users count:' as description, COUNT(*) as count FROM auth.users WHERE deleted_at IS NULL
UNION ALL
SELECT 'Public users count:', COUNT(*) FROM public.users;

-- Show users in both tables for comparison
SELECT 'AUTH USERS:' as table_name, id, email, created_at FROM auth.users WHERE deleted_at IS NULL
UNION ALL
SELECT 'PUBLIC USERS:', id, email, created_at FROM public.users
ORDER BY table_name, created_at;