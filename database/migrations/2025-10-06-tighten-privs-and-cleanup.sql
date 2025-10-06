-- Harden privileges and finalize move away from public.users FK for patients
-- Safe to re-run. Use in Supabase SQL editor.

BEGIN;

-- 1) Ensure RLS remains enabled (no-op if already)
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- 2) Revoke overly broad anon privileges (RLS still protects rows, but don’t expose write perms)
DO $$
BEGIN
  IF to_regclass('public.patients') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON TABLE public.patients FROM anon;
    GRANT  SELECT, INSERT, UPDATE, DELETE ON TABLE public.patients TO authenticated;
  END IF;
  IF to_regclass('public.patient_profiles') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON TABLE public.patient_profiles FROM anon;
    GRANT  SELECT, INSERT, UPDATE, DELETE ON TABLE public.patient_profiles TO authenticated;
  END IF;
  IF to_regclass('public.users') IS NOT NULL THEN
    REVOKE ALL PRIVILEGES ON TABLE public.users FROM anon;
    GRANT  SELECT, UPDATE ON TABLE public.users TO authenticated;
  END IF;
END$$;

-- 3) Keep patients.user_id FK pointing to auth.users (done in prior migration); verify name is stable
--    This section is defensive and will only apply if the new FK exists and old one lingers.
DO $$
BEGIN
  -- If an old FK to public.users still exists, drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'patients_user_id_fkey'
      AND conrelid = 'public.patients'::regclass
      AND confrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.patients DROP CONSTRAINT patients_user_id_fkey;
  END IF;
  -- If a FK to auth.users exists with a temporary name, rename it to the canonical name
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'patients_user_id_auth_fk'
      AND conrelid = 'public.patients'::regclass
      AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE public.patients RENAME CONSTRAINT patients_user_id_auth_fk TO patients_user_id_fkey;
  END IF;
END$$;

COMMIT;

