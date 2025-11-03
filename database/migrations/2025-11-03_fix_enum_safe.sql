-- Safe migration to fix user role enum issues
-- Run in Supabase SQL editor.

-- First, let's see what enum values currently exist
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role_enum'::regtype ORDER BY enumlabel;

-- Add 'patient' to the enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'patient' AND enumtypid = 'user_role_enum'::regtype) THEN
        ALTER TYPE user_role_enum ADD VALUE 'patient';
    END IF;
END $$;

-- Check what role values are actually in the users table
SELECT DISTINCT role FROM public.users;

-- Convert the column from enum to text to avoid enum constraints
ALTER TABLE public.users ALTER COLUMN role TYPE text USING role::text;

-- Now we can safely update any problematic values
UPDATE public.users SET role = 'patient' WHERE role NOT IN ('patient', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin');

-- Add a check constraint with all valid roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('patient', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin'));

-- Set default to 'patient'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'patient';

-- Verify the changes
SELECT DISTINCT role FROM public.users ORDER BY role;