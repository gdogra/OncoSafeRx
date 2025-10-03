-- Idempotent migration to align public.users profile table with API expectations
-- Safe to run multiple times in Supabase SQL editor

-- Ensure extension
create extension if not exists "uuid-ossp";

-- Create users table if missing (separate from auth.users)
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  role text default 'user',
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

-- If you want to enforce linkage to Supabase Auth users (optional):
-- alter table public.users
--   add constraint users_id_fk_auth
--   foreign key (id) references auth.users(id) on delete cascade;

-- Add missing columns if table already exists
alter table public.users add column if not exists email text;
alter table public.users add column if not exists role text default 'user';
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
end $$;

-- Optional: RLS policies (enable if you want row-level security)
-- alter table public.users enable row level security;
-- create policy users_self on public.users for select using (auth.uid() = id);
-- create policy users_self_ins on public.users for insert with check (auth.uid() = id);
-- create policy users_self_upd on public.users for update using (auth.uid() = id);

