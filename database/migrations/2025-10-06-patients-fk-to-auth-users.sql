-- Migrate patients.user_id foreign key to auth.users(id)
-- Safe order: add new FK NOT VALID, validate, drop old FK, rename new FK

BEGIN;

-- 0) Quick sanity: how many patient user_ids are missing in auth.users?
--    This should be 0 for a clean validation. If >0, investigate users/auth alignment.
-- SELECT COUNT(*) AS missing_auth_users FROM (
--   SELECT DISTINCT p.user_id
--   FROM public.patients p
--   LEFT JOIN auth.users au ON au.id = p.user_id
--   WHERE au.id IS NULL
--) s;

-- 1) Add new FK to auth.users without validating existing rows yet
ALTER TABLE public.patients
  ADD CONSTRAINT patients_user_id_auth_fk
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  NOT VALID;

-- 2) Validate the new FK against existing data
ALTER TABLE public.patients
  VALIDATE CONSTRAINT patients_user_id_auth_fk;

-- 3) Drop the old FK to public.users if present
ALTER TABLE public.patients
  DROP CONSTRAINT IF EXISTS patients_user_id_fkey;

-- 4) Keep constraint name stable for downstream code/tools
ALTER TABLE public.patients
  RENAME CONSTRAINT patients_user_id_auth_fk TO patients_user_id_fkey;

COMMIT;

-- Notes:
-- - If step (2) fails, it means some patients.user_id values do not exist in auth.users.
--   Fix by ensuring those users exist in auth (or removing/repairing orphan rows), then rerun VALIDATE.
