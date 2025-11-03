-- Fix role assignment to respect user signup selection
-- Safe and idempotent. Run in Supabase SQL editor.

-- Remove the default constraint to let the application handle role assignment
alter table public.users alter column role drop default;

-- Add a comment to the table to clarify role handling
comment on column public.users.role is 'User role: set during signup based on user selection, no database default';