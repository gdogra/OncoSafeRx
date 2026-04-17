-- RLS Hardening Migration
-- 2026-04-17
--
-- Purpose:
--   1. Enable RLS on 4 tables that are currently open to the anon key
--      (push_subscriptions, push_schedules, medication_regimens,
--       patient_id_conversion_audit).
--   2. Clean up duplicate policies on public.users that have accumulated
--      across several earlier migrations.
--
-- Safe to re-run: uses IF EXISTS / IF NOT EXISTS where appropriate and
-- DROP POLICY IF EXISTS before recreating anything.

-- ============================================================
-- 1. push_subscriptions — service-role only
-- ============================================================
-- Schema: endpoint (pk), data jsonb, created_at, updated_at
-- No user_id column; writes happen via backend / edge functions.
ALTER TABLE IF EXISTS public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only_push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "service_role_only_push_subscriptions"
  ON public.push_subscriptions
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 2. push_schedules — service-role only
-- ============================================================
-- Schema: id, title, body, audience, endpoint, scheduled_at, ...
-- Written by admin/cron flows; clients read via /api/push/schedules.
ALTER TABLE IF EXISTS public.push_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only_push_schedules" ON public.push_schedules;
CREATE POLICY "service_role_only_push_schedules"
  ON public.push_schedules
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 3. medication_regimens — service-role only (conservative default)
-- ============================================================
-- Schema not colocated in migrations; safest to lock to service role.
-- If user-ownership column exists later, add a separate policy.
ALTER TABLE IF EXISTS public.medication_regimens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only_medication_regimens" ON public.medication_regimens;
CREATE POLICY "service_role_only_medication_regimens"
  ON public.medication_regimens
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 4. patient_id_conversion_audit — service-role only (audit data)
-- ============================================================
ALTER TABLE IF EXISTS public.patient_id_conversion_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_only_patient_id_audit" ON public.patient_id_conversion_audit;
CREATE POLICY "service_role_only_patient_id_audit"
  ON public.patient_id_conversion_audit
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- 5. Clean up duplicate policies on public.users
-- ============================================================
-- Before: 14 policies (8 SELECT/INSERT/UPDATE duplicates + admin + service).
-- After: 6 canonical policies.
--
-- Canonical set kept:
--   - users_select         (user reads own row)
--   - users_insert         (user inserts own row)
--   - users_update         (user updates own row)
--   - Users can view own profile and admins can view all active users
--                          (admin override for SELECT)
--   - Admins can soft delete users
--   - Service role can manage all users

-- SELECT duplicates
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "users_self" ON public.users;

-- INSERT duplicates
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "users_self_ins" ON public.users;

-- UPDATE duplicates
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "users_self_upd" ON public.users;

-- Safety net: ensure the canonical self-policies exist
-- (re-create idempotently in case a prior migration dropped them)

-- users_select: user reads own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select'
  ) THEN
    CREATE POLICY users_select ON public.users
      FOR SELECT TO public
      USING (auth.uid() = id);
  END IF;
END
$$;

-- users_insert: user inserts own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert'
  ) THEN
    CREATE POLICY users_insert ON public.users
      FOR INSERT TO public
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- users_update: user updates own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update'
  ) THEN
    CREATE POLICY users_update ON public.users
      FOR UPDATE TO public
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- ============================================================
-- Verification queries (run after applying; informational only)
-- ============================================================
-- SELECT tablename FROM pg_tables
--   WHERE schemaname = 'public'
--     AND NOT rowsecurity
--     AND tablename NOT LIKE 'pg_%';
-- Expected: zero rows (all public tables should have RLS enabled).
--
-- SELECT policyname, cmd FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'users'
--   ORDER BY cmd, policyname;
-- Expected: 6 rows (users_insert, users_select, users_update,
--   admin view policy, admin soft delete policy, service role policy).
