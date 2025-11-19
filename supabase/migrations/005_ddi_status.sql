-- Track staleness of evidence sources without altering main cache

create table if not exists public.ddi_evidence_status (
  uniq_hash text primary key,
  last_checked_at timestamptz,
  last_status int,
  last_etag text,
  last_modified text,
  stale boolean not null default false,
  last_error text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_ddi_status_stale on public.ddi_evidence_status(stale);

-- Optional RLS: only authenticated read
alter table public.ddi_evidence_status enable row level security;
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ddi_evidence_status' and policyname='ddi_status_read_authenticated'
  ) then
    create policy ddi_status_read_authenticated on public.ddi_evidence_status
      for select to authenticated using (true);
  end if;
end $$;

