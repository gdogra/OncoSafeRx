# trial-analytics-agent (Supabase Edge Function)

Automates querying ClinicalTrials.gov for marketed drugs and stores per‑drug analytics:

- Oncology relevance (based on condition keywords)
- Trial phase distribution
- Heuristic DDI signals from co‑intervention text

## Invoke

```
curl -X POST \
  https://<PROJECT-REF>.functions.supabase.co/trial-analytics-agent \
  -H "Authorization: Bearer <SERVICE_ROLE_OR_ANON>" \
  -H "Content-Type: application/json" \
  -d '{"limit": 200, "pageSize": 50, "maxPages": 2}'
```

## Expected Tables

- `marketed_drugs(name text, rxcui text)` — source list (~800+ marketed drugs)
- `trial_analytics(drug text primary key, total int, oncologyTotal int, phaseCounts jsonb, ddiSignals int, updatedAt timestamptz)`

You can create them quickly:

```sql
create table if not exists public.marketed_drugs (
  name text primary key,
  rxcui text
);

create table if not exists public.trial_analytics (
  drug text primary key,
  total int not null default 0,
  oncologyTotal int not null default 0,
  phaseCounts jsonb not null default '{}'::jsonb,
  ddiSignals int not null default 0,
  updatedAt timestamptz not null default now()
);
```

## Scheduling

Use Supabase Scheduled Functions (or external scheduler) to run nightly.
