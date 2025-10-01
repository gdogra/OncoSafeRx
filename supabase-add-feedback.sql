-- Feedback table for OncoSafeRx feedback capture
-- Run this in your Supabase project (SQL editor)

create table if not exists public.feedback (
  id text primary key,
  type text not null,
  category text not null,
  priority text not null,
  title text not null,
  description text not null,
  page text,
  url text,
  user_agent text,
  session_id text,
  timestamp timestamptz not null,
  status text not null default 'new',
  labels text[] default '{}',
  estimated_effort text,
  metadata jsonb default '{}'::jsonb,
  votes integer default 0,
  assignee text,
  sprint_target text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Helpful indexes
create index if not exists feedback_timestamp_idx on public.feedback (timestamp desc);
create index if not exists feedback_status_idx on public.feedback (status);
create index if not exists feedback_priority_idx on public.feedback (priority);
create index if not exists feedback_type_idx on public.feedback (type);

-- Row Level Security (adjust as needed for your app)
alter table public.feedback enable row level security;

-- Admin policy example: allow service role to do everything
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'feedback' and policyname = 'service_role_all'
  ) then
    create policy service_role_all on public.feedback for all to service_role using (true) with check (true);
  end if;
end $$;

