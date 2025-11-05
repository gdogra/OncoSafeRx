-- Add demographics fields to public.users (idempotent)
-- Run in Supabase SQL editor.

-- age: integer in years
alter table public.users add column if not exists age integer;

-- weight: numeric with 2 decimals (kg or lb per app semantics)
alter table public.users add column if not exists weight numeric(6,2);

-- sex: free-text for now (consider enum later)
alter table public.users add column if not exists sex text;

-- address: structured JSON (street, city, state, postal_code, country, etc.)
alter table public.users add column if not exists address jsonb default '{}'::jsonb;

-- No additional RLS needed; existing policies apply to new columns.
-- Grants already provided in prior migrations.

