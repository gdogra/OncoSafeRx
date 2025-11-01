-- Adds a patient_profile JSONB column to users and a GIN index for key lookup
-- Safe to run multiple times (IF NOT EXISTS guards)

CREATE SCHEMA IF NOT EXISTS public;

-- 1) Add column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS patient_profile JSONB DEFAULT '{}'::jsonb;

-- 2) Ensure preferences JSONB exists (optional)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 3) Basic GIN index for JSONB containment queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'users_patient_profile_gin'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX users_patient_profile_gin ON public.users USING GIN (patient_profile jsonb_path_ops);
  END IF;
END $$;

-- 4) Optional: helpful computed columns (uncomment if desired)
-- ALTER TABLE public.users
--   ADD COLUMN IF NOT EXISTS patient_first_name TEXT GENERATED ALWAYS AS ((patient_profile->'demographics'->>'firstName')) STORED;
-- ALTER TABLE public.users
--   ADD COLUMN IF NOT EXISTS patient_cancer_type TEXT GENERATED ALWAYS AS ((patient_profile->'cancer'->>'cancerType')) STORED;

