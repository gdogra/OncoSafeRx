-- Backfill public.users names and JSON fields (idempotent)
-- - Derive first_name/last_name from full_name when missing
-- - Derive full_name from first_name/last_name when missing
-- - Ensure preferences/persona are non-null JSON objects
-- - Fill created_at/updated_at when null

-- 1) Normalize whitespace on full_name/first_name/last_name
update public.users
set
  full_name = nullif(btrim(full_name), ''),
  first_name = nullif(btrim(first_name), ''),
  last_name = nullif(btrim(last_name), '')
where true;

-- 2) Backfill first_name/last_name from full_name if missing
--    Use first token as first_name, remainder as last_name
update public.users
set
  first_name = coalesce(first_name,
                        split_part(full_name, ' ', 1)),
  last_name = coalesce(last_name,
                       nullif(regexp_replace(full_name, '^\s*([^\s]+)\s*', ''), ''))
where (first_name is null or last_name is null)
  and full_name is not null;

-- 3) If last_name remained null after split, set it to empty string
update public.users
set last_name = coalesce(last_name, '')
where last_name is null;

-- 4) Backfill full_name from first_name/last_name when missing
update public.users
set full_name =
  nullif(concat_ws(' ', coalesce(first_name, ''), coalesce(last_name, '')), '')
where full_name is null
  and (first_name is not null or last_name is not null);

-- 5) Ensure preferences/persona are JSON objects, not null
update public.users
set preferences = '{}'::jsonb
where preferences is null;

update public.users
set persona = '{}'::jsonb
where persona is null;

-- 6) Fill created_at/updated_at if null
update public.users
set created_at = now()
where created_at is null;

update public.users
set updated_at = now()
where updated_at is null;

-- 7) Optional: ensure role defaults to 'user' when null/blank
update public.users
set role = 'user'
where (role is null or btrim(role) = '');

