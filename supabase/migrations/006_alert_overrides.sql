-- Clinician responses to decision-support alerts (accept / override, with reason).
-- Linked to the rule id + rule version that fired, so alert noise and unsafe overrides
-- can be measured. Holds no patient identifiers: patient_ref is an opaque, caller-supplied key.

create table if not exists public.alert_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source text not null check (source in ('dosing', 'interaction', 'cds-hooks', 'other')),
  rule_id text not null,
  rule_version text,
  card_id text,
  action text not null check (action in ('accept', 'override')),
  reason_code text,
  reason_text text check (reason_text is null or char_length(reason_text) <= 500),
  patient_ref text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint override_needs_reason check (action <> 'override' or reason_code is not null)
);

create index if not exists idx_alert_overrides_rule on public.alert_overrides (rule_id, action);
create index if not exists idx_alert_overrides_user on public.alert_overrides (user_id, created_at desc);

alter table public.alert_overrides enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='alert_overrides' and policyname='alert_overrides_select_own') then
    create policy alert_overrides_select_own on public.alert_overrides for select to authenticated using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='alert_overrides' and policyname='alert_overrides_insert_own') then
    create policy alert_overrides_insert_own on public.alert_overrides for insert to authenticated with check (user_id = auth.uid());
  end if;
end $$;
-- No update/delete policies: override records are append-only. The API uses the service role.
