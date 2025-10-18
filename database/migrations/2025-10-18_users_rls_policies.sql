-- Enable RLS and add secure, idempotent policies for public.users
-- Run this in Supabase SQL editor (safe to re-run)

-- Ensure table exists
create table if not exists public.users (
  id uuid primary key,
  email text unique,
  role text default 'user',
  full_name text,
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

-- Add missing columns (no-ops if already exist)
alter table public.users add column if not exists full_name text;
alter table public.users add column if not exists first_name text;
alter table public.users add column if not exists last_name text;
alter table public.users add column if not exists specialty text;
alter table public.users add column if not exists institution text;
alter table public.users add column if not exists license_number text;
alter table public.users add column if not exists years_experience integer default 0;
alter table public.users add column if not exists preferences jsonb default '{}'::jsonb;
alter table public.users add column if not exists persona jsonb default '{}'::jsonb;

-- Enable Row Level Security
alter table public.users enable row level security;

-- Drop existing policies if present to avoid conflicts
do $$ begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_select') then
    drop policy users_select on public.users;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_insert') then
    drop policy users_insert on public.users;
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='users' and policyname='users_update') then
    drop policy users_update on public.users;
  end if;
end $$;

-- Helper: check if JWT role is admin/super_admin
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce( (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') in ('admin','super_admin')
  ), false )
$$;

-- SELECT: users can read their own row; admins can read all
create policy users_select on public.users
for select
using (
  auth.uid() = id or public.is_admin()
);

-- INSERT: users can insert their own row; admins may insert any
create policy users_insert on public.users
for insert
with check (
  auth.uid() = id or public.is_admin()
);

-- UPDATE: users can update their own row; admins may update any
create policy users_update on public.users
for update
using (
  auth.uid() = id or public.is_admin()
)
with check (
  auth.uid() = id or public.is_admin()
);

-- Optional: keep updated_at fresh
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname='trg_users_set_updated_at') then
    create trigger trg_users_set_updated_at
    before update on public.users
    for each row execute function public.update_updated_at_column();
  end if;
end $$;

