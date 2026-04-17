-- Drop handle_new_user auth trigger
-- 2026-04-17
--
-- Why:
--   The on_auth_user_created trigger + handle_new_user() function insert
--   a row into public.users with role = 'user' whenever a new auth.users
--   row is created. That default role is NOT in our valid application
--   role set (patient, caregiver, oncologist, pharmacist, nurse,
--   researcher, student, admin, super_admin), so it caused:
--     - AuthCallback to skip the /auth/select-role prompt (saw a role)
--     - ProtectedRoute / RBAC to then reject the invalid role and
--       redirect the user back to /login
--
--   The application now:
--     1. On Google OAuth: AuthSelectRole.tsx upserts public.users with
--        a proper role the user picked.
--     2. Never relies on the DB trigger to populate public.users.
--
-- Idempotent — safe to re-run.

-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function (no other code calls it)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Verification query (run after applying):
--   SELECT tgname FROM pg_trigger
--     WHERE tgrelid = 'auth.users'::regclass AND tgname = 'on_auth_user_created';
--   Expected: zero rows.
