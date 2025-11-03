-- Add 'patient' role to the CHECK constraint and fix role validation
-- Safe and idempotent. Run in Supabase SQL editor.

-- Drop the existing check constraint
alter table public.users drop constraint if exists users_role_check;

-- Add the new check constraint with 'patient' included
alter table public.users add constraint users_role_check 
  check (role in ('patient', 'user', 'oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin'));

-- Update the default role to 'patient' for new signups
alter table public.users alter column role set default 'patient';

-- Update any existing 'user' roles to 'patient' (since they're equivalent)
update public.users set role = 'patient' where role = 'user';

-- Add a comment explaining the role values
comment on column public.users.role is 'User role: patient (default), oncologist, pharmacist, nurse, researcher, student, admin, super_admin';