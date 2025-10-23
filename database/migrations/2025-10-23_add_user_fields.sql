-- Migration: Add missing user fields
-- Date: 2025-10-23
-- Description: Add first_name, last_name, years_experience, persona fields and update role constraints

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS persona VARCHAR(100);

-- Update role constraint to include missing roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'super_admin', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'patient', 'caregiver', 'student'));

-- Populate first_name and last_name from full_name where possible
UPDATE users 
SET 
    first_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN split_part(full_name, ' ', 1)
        ELSE full_name
    END,
    last_name = CASE 
        WHEN full_name IS NOT NULL AND position(' ' in full_name) > 0 
        THEN substring(full_name from position(' ' in full_name) + 1)
        ELSE ''
    END
WHERE first_name IS NULL OR last_name IS NULL;

-- Update any existing super_admin roles to match frontend expectations
UPDATE users SET role = 'super_admin' WHERE email = 'gdogra@gmail.com' AND role != 'super_admin';

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_persona ON users(persona);