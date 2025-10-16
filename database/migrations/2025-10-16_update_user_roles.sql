-- Migration: Update user role constraints and default
-- Date: 2025-10-16
-- Description: Replace 'user' role with 'patient' and align role validation with application

-- Drop the existing check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add the new check constraint with updated roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'patient'));

-- Update any existing 'user' roles to 'patient' (if any exist)
UPDATE users SET role = 'patient' WHERE role = 'user';

-- Update the default value for new users
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'patient';