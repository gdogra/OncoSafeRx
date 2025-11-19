-- OncoSafeRx core schema

-- Extensions
create extension if not exists pgcrypto;

-- patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  demographics jsonb not null default '{}'::jsonb,
  clinical jsonb not null default '{}'::jsonb,
  pgx jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

drop trigger if exists trg_patients_updated_at on public.patients;
create trigger trg_patients_updated_at before update on public.patients
for each row execute function public.set_updated_at();

-- medication_regimens
create table if not exists public.medication_regimens (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  meds jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_medication_regimens_patient_created on public.medication_regimens(patient_id, created_at desc);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  agent_type text not null check (agent_type in ('DDI','DATA_QUALITY','EVIDENCE','PGX','TRIALS')),
  input jsonb not null,
  output jsonb,
  status text not null check (status in ('queued','running','succeeded','failed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_runs_patient_created on public.agent_runs(patient_id, created_at desc);

-- ddi_evidence (optional cache)
create table if not exists public.ddi_evidence (
  id uuid primary key default gen_random_uuid(),
  drug_primary text not null,             -- rxnorm id or normalized name
  drug_interactor text not null,          -- rxnorm id or normalized name
  severity text not null check (severity in ('minor','moderate','major','contraindicated')),
  mechanism text,
  recommendation text,
  evidence_source text,                   -- e.g., 'label','guideline','trial','post_marketing','knowledgebase'
  evidence_level text not null default 'unknown',
  citations jsonb not null default '[]'::jsonb,
  uniq_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists uq_ddi_evidence_hash on public.ddi_evidence(uniq_hash);
create index if not exists idx_ddi_pairs on public.ddi_evidence(drug_primary, drug_interactor);

-- helper to compute uniq hash client-side: sha256(lower(drug_primary)||'|'||lower(drug_interactor)||'|'||coalesce(evidence_source,''))
