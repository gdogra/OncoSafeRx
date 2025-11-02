-- Disable Supabase auth signup trigger to prevent 500s during signup
-- Safe and idempotent. Run in Supabase SQL editor.

-- Drop the trigger that runs on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;

-- Optionally drop the function (uncomment if you want it removed)
-- do $$ begin
--   if exists (select 1 from pg_proc where proname = 'handle_new_user' and pronamespace = 'public'::regnamespace) then
--     drop function public.handle_new_user();
--   end if;
-- end $$;

-- Note: The application now ensures public.users is created/maintained via
--  - backend: /api/supabase-auth/proxy/signup (service role upsert)
--  - backend: /api/supabase-auth/profile (lazy upsert on fetch)
-- so relying on the DB trigger is no longer required.

