-- CDS Hooks feedback comes from a (verified) EHR, not from an OncoSafeRx user: the signed request
-- identifies the EHR issuer but not a person. Allow rows with an issuer and no user, and record the card.

alter table public.alert_overrides alter column user_id drop not null;
alter table public.alert_overrides add column if not exists ehr_issuer text;
alter table public.alert_overrides add column if not exists card_uuid text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'override_has_actor') then
    alter table public.alert_overrides
      add constraint override_has_actor check (user_id is not null or ehr_issuer is not null);
  end if;
end $$;

create index if not exists idx_alert_overrides_card on public.alert_overrides (card_uuid);
-- RLS is unchanged: rows without user_id are visible only to the service role (the API).
