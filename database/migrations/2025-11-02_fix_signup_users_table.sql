-- Fix signup issues by ensuring users table is properly configured
-- Safe and idempotent. Run in Supabase SQL editor.

-- Ensure extension
create extension if not exists "uuid-ossp";

-- Create users table if missing (separate from auth.users)
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  role text default 'patient',
  first_name text,
  last_name text,
  specialty text,
  institution text,
  license_number text,
  years_experience integer default 0,
  preferences jsonb default '{}'::jsonb,
  persona jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add missing columns if table already exists
alter table public.users add column if not exists email text;
alter table public.users add column if not exists role text default 'patient';
alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists specialty text;
alter table public.users add column if not exists institution text;
alter table public.users add column if not exists license_number text;
alter table public.users add column if not exists years_experience integer default 0;
alter table public.users add column if not exists preferences jsonb default '{}'::jsonb;
alter table public.users add column if not exists persona jsonb default '{}'::jsonb;
alter table public.users add column if not exists created_at timestamptz default now();
alter table public.users add column if not exists updated_at timestamptz default now();

-- Ensure email unique index (skip errors if already present)
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and indexname = 'users_email_key'
  ) then
    create unique index users_email_key on public.users(email);
  end if;
exception when duplicate_table then
  -- Index already exists, continue
end $$;

-- Generic updated_at trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger to users table if not present
do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'update_users_updated_at'
  ) then
    create trigger update_users_updated_at
    before update on public.users
    for each row execute function public.update_updated_at_column();
  end if;
exception when duplicate_object then
  -- Trigger already exists, continue
end $$;

-- Ensure proper RLS policies for signup
alter table public.users enable row level security;

-- Drop existing policies if they exist to recreate them
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Service role can manage all users" on public.users;

-- Allow authenticated users to insert their own profile
create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

-- Allow users to view their own profile
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Allow service role to manage all users (for server-side operations)
create policy "Service role can manage all users" on public.users
  for all using (auth.role() = 'service_role');

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.users to anon, authenticated;
grant all on public.users to service_role;

-- Insert the default user if not exists (Gautam)
insert into public.users (
  id,
  email,
  role,
  first_name,
  last_name,
  specialty,
  institution,
  license_number,
  years_experience,
  created_at
) values (
  'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
  'gdogra@gmail.com',
  'super_admin',
  'Gautam',
  'Dogra',
  'Medical Oncology',
  'OncoSafeRx',
  'CA12345',
  15,
  now()
) on conflict (id) do update set
  role = 'super_admin',
  first_name = 'Gautam',
  last_name = 'Dogra',
  specialty = 'Medical Oncology',
  institution = 'OncoSafeRx',
  license_number = 'CA12345',
  years_experience = 15,
  updated_at = now();

-- Ensure the trigger that was disabled doesn't interfere with manual inserts
-- The disabled trigger from the previous migration should remain disabled
-- This migration handles user creation via RLS policies instead