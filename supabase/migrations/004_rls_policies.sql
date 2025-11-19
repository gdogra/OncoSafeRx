-- Enable RLS and add read-only policies for ddi_evidence and drug_aliases

alter table public.ddi_evidence enable row level security;
alter table public.drug_aliases enable row level security;

-- Allow authenticated users to SELECT from ddi_evidence and drug_aliases
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='ddi_evidence' and policyname='ddi_evidence_read_authenticated'
  ) then
    create policy ddi_evidence_read_authenticated on public.ddi_evidence
      for select
      to authenticated
      using (true);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='drug_aliases' and policyname='drug_aliases_read_authenticated'
  ) then
    create policy drug_aliases_read_authenticated on public.drug_aliases
      for select
      to authenticated
      using (true);
  end if;
end $$;

-- No write policies are defined; default deny for insert/update/delete.

