-- Fix user_role_enum to include 'patient' and remove invalid 'user' values
-- Safe and idempotent. Run in Supabase SQL editor.

-- First, let's see what enum values exist
-- SELECT unnest(enum_range(NULL::user_role_enum));

-- Add 'patient' to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'patient' AND enumtypid = 'user_role_enum'::regtype) THEN
        ALTER TYPE user_role_enum ADD VALUE 'patient';
    END IF;
END $$;

-- Update any existing 'user' values to 'patient' before removing from enum
UPDATE public.users SET role = 'patient'::text WHERE role = 'user';

-- Note: We cannot easily remove 'user' from the enum if it's in use
-- Instead, let's modify the column to use text with a check constraint

-- First, change the column type from enum to text
ALTER TABLE public.users ALTER COLUMN role TYPE text;

-- Drop the enum if it's no longer needed (optional, might fail if referenced elsewhere)
-- DROP TYPE IF EXISTS user_role_enum;

-- Add a check constraint with all valid roles including 'patient'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('patient', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin'));

-- Set default to 'patient'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'patient';

-- Add comment
COMMENT ON COLUMN public.users.role IS 'User role: patient (default), oncologist, pharmacist, nurse, researcher, student, admin, super_admin';