-- Create user_demographics table to properly handle user demographic data
-- This separates demographics from the core users table for better data management

-- Create user_demographics table
create table if not exists public.user_demographics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  age integer check (age > 0 and age <= 150),
  weight numeric(6,2) check (weight > 0 and weight <= 1000),
  height numeric(6,2) check (height > 0 and height <= 300), -- cm
  sex text check (sex in ('male', 'female', 'other', 'prefer-not-to-say')),
  address jsonb default '{}'::jsonb,
  allergies jsonb default '[]'::jsonb,
  medical_conditions jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Ensure one demographics record per user
  constraint user_demographics_user_id_unique unique (user_id)
);

-- Create updated_at trigger
create or replace function update_user_demographics_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_demographics_updated_at
  before update on public.user_demographics
  for each row execute function update_user_demographics_updated_at();

-- Add RLS policies
alter table public.user_demographics enable row level security;

-- Users can only access their own demographics
create policy "Users can view own demographics" on public.user_demographics
  for select using (auth.uid() = user_id);

create policy "Users can insert own demographics" on public.user_demographics
  for insert with check (auth.uid() = user_id);

create policy "Users can update own demographics" on public.user_demographics
  for update using (auth.uid() = user_id);

create policy "Users can delete own demographics" on public.user_demographics
  for delete using (auth.uid() = user_id);

-- Admin policies (service role can access all)
create policy "Service role can access all demographics" on public.user_demographics
  for all using (current_setting('role') = 'service_role');

-- Create indexes for performance
create index if not exists user_demographics_user_id_idx on public.user_demographics (user_id);
create index if not exists user_demographics_updated_at_idx on public.user_demographics (updated_at);

-- Grant permissions
grant all on public.user_demographics to authenticated;
grant all on public.user_demographics to service_role;
grant usage on sequence user_demographics_id_seq to authenticated;
grant usage on sequence user_demographics_id_seq to service_role;