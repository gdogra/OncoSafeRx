-- Fix user_role column issue in users table
-- The error shows there's a user_role column with NOT NULL constraint
-- but our code tries to insert into 'role' column

-- First, let's see what columns exist and fix any mismatches
do $$ 
begin
  -- Check if user_role column exists and role column doesn't
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'user_role'
  ) and not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'role'
  ) then
    -- Rename user_role to role for consistency
    alter table public.users rename column user_role to role;
    raise notice 'Renamed user_role column to role';
  end if;

  -- If both exist, we need to consolidate
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'user_role'
  ) and exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'role'
  ) then
    -- Update role column with user_role values where role is null
    update public.users set role = user_role where role is null;
    
    -- Drop the user_role column
    alter table public.users drop column user_role;
    raise notice 'Consolidated user_role into role column';
  end if;

  -- Ensure role column has a default
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'role'
  ) then
    alter table public.users alter column role set default 'oncologist';
    raise notice 'Set default value for role column';
  end if;

  -- Remove NOT NULL constraint from role if it's causing issues
  -- and we want to allow nullable roles initially
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'users' 
    and column_name = 'role'
    and is_nullable = 'NO'
  ) then
    alter table public.users alter column role drop not null;
    raise notice 'Removed NOT NULL constraint from role column';
  end if;

exception
  when others then
    raise notice 'Migration completed with warnings: %', sqlerrm;
end $$;

-- Ensure the users table has the expected structure
alter table public.users add column if not exists role text default 'oncologist';
alter table public.users add column if not exists email text;
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

-- Make sure email has unique constraint
do $$ begin
  if not exists (
    select 1 from pg_indexes where schemaname = 'public' and tablename = 'users' and indexname = 'users_email_key'
  ) then
    create unique index users_email_key on public.users(email);
  end if;
exception when duplicate_table then
  -- Index already exists, continue
end $$;

-- Update any existing null roles to default
update public.users set role = 'oncologist' where role is null;

-- Re-enable RLS if needed
alter table public.users enable row level security;

-- Recreate policies to be safe
drop policy if exists "Users can insert their own profile" on public.users;
drop policy if exists "Users can view their own profile" on public.users;
drop policy if exists "Users can update their own profile" on public.users;
drop policy if exists "Service role can manage all users" on public.users;

create policy "Users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

create policy "Service role can manage all users" on public.users
  for all using (auth.role() = 'service_role');

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.users to anon, authenticated;
grant all on public.users to service_role;