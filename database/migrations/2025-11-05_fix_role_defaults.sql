-- Correct role defaults and fix misclassified users

-- Ensure role column exists and set default to 'patient'
alter table public.users add column if not exists role text;
alter table public.users alter column role set default 'patient';

-- Convert ambiguous or clinician-default roles to 'patient' when there is no clinician metadata
-- This is conservative: only adjusts rows lacking specialty/institution/license_number
update public.users
set role = 'patient'
where
  (role is null or role in ('user','oncologist'))
  and coalesce(trim(specialty),'') = ''
  and coalesce(trim(institution),'') = ''
  and coalesce(trim(license_number),'') = '';

