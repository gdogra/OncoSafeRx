-- Create drug_aliases table for normalization
create table if not exists public.drug_aliases (
  name text primary key,                     -- alias or brand/generic as entered
  canonical_name text not null,              -- normalized generic name
  rxnorm_concept_id text,                    -- optional RxCUI
  created_at timestamptz not null default now()
);

create index if not exists idx_drug_aliases_name_lower on public.drug_aliases (lower(name));
create index if not exists idx_drug_aliases_canonical_lower on public.drug_aliases (lower(canonical_name));

-- Seed minimal aliases (extend over time)
insert into public.drug_aliases(name, canonical_name, rxnorm_concept_id) values
  ('capecitabine','capecitabine', null),
  ('xeloda','capecitabine', null),
  ('warfarin','warfarin', null),
  ('coumadin','warfarin', null),
  ('jantoven','warfarin', null),
  ('tamoxifen','tamoxifen', null),
  ('nolvadex','tamoxifen', null),
  ('paroxetine','paroxetine', null),
  ('paxil','paroxetine', null),
  ('fluoxetine','fluoxetine', null),
  ('prozac','fluoxetine', null),
  ('imatinib','imatinib', null),
  ('gleevec','imatinib', null),
  ('pazopanib','pazopanib', null),
  ('votrient','pazopanib', null),
  ('simvastatin','simvastatin', null),
  ('zocor','simvastatin', null),
  ('sunitinib','sunitinib', null),
  ('sutent','sunitinib', null),
  ('ketoconazole','ketoconazole', null),
  ('nizoral','ketoconazole', null),
  ('regorafenib','regorafenib', null),
  ('stivarga','regorafenib', null),
  ('rifampin','rifampin', null),
  ('rifampicin','rifampin', null),
  ('cisplatin','cisplatin', null),
  ('platinol','cisplatin', null),
  ('gentamicin','gentamicin', null),
  ('garamycin','gentamicin', null),
  ('methotrexate','methotrexate', null),
  ('trexall','methotrexate', null),
  ('ibuprofen','ibuprofen', null),
  ('advil','ibuprofen', null),
  ('motrin','ibuprofen', null),
  ('codeine','codeine', null)
on conflict do nothing;

-- Helper function for uniq hash via hex-encoded sha256
-- SELECT encode(digest('text','sha256'),'hex');

-- Seed curated DDI evidence (conservative, label/guideline-backed)
insert into public.ddi_evidence (
  drug_primary, drug_interactor, severity, mechanism, recommendation, evidence_source, evidence_level, citations, uniq_hash
) values
  -- Capecitabine + Warfarin
  ('capecitabine','warfarin','major','Increased anticoagulant effect (INR elevation).','monitor','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Capecitabine increases anticoagulant effect of warfarin; monitor INR."}]'::jsonb,
   encode(digest(lower('capecitabine')||'|'||lower('warfarin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Tamoxifen + Paroxetine
  ('tamoxifen','paroxetine','major','CYP2D6 inhibition reduces endoxifen (active metabolite).','avoid','guideline','high',
   '[{"source_type":"guideline","id":"CPIC-Tamoxifen-CYP2D6","url":"https://cpicpgx.org/guidelines/guideline-for-tamoxifen-and-cyp2d6/","snippet":"Avoid strong CYP2D6 inhibitors with tamoxifen."}]'::jsonb,
   encode(digest(lower('tamoxifen')||'|'||lower('paroxetine')||'|'||coalesce('guideline',''),'sha256'),'hex')),

  -- Tamoxifen + Fluoxetine
  ('tamoxifen','fluoxetine','major','CYP2D6 inhibition reduces endoxifen (active metabolite).','avoid','guideline','high',
   '[{"source_type":"guideline","id":"CPIC-Tamoxifen-CYP2D6","url":"https://cpicpgx.org/guidelines/guideline-for-tamoxifen-and-cyp2d6/","snippet":"Avoid strong CYP2D6 inhibitors with tamoxifen."}]'::jsonb,
   encode(digest(lower('tamoxifen')||'|'||lower('fluoxetine')||'|'||coalesce('guideline',''),'sha256'),'hex')),

  -- Imatinib + Warfarin
  ('imatinib','warfarin','major','Potential increased exposure/bleeding risk; label recommends alternative anticoagulation.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid concomitant warfarin; consider low molecular weight heparin."}]'::jsonb,
   encode(digest(lower('imatinib')||'|'||lower('warfarin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Pazopanib + Simvastatin
  ('pazopanib','simvastatin','major','Increased risk of hepatotoxicity when coadministered.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid simvastatin due to increased risk of hepatotoxicity with pazopanib."}]'::jsonb,
   encode(digest(lower('pazopanib')||'|'||lower('simvastatin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Sunitinib + Ketoconazole
  ('sunitinib','ketoconazole','major','Strong CYP3A4 inhibition increases sunitinib exposure.','adjust','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid strong CYP3A4 inhibitors or reduce sunitinib dose."}]'::jsonb,
   encode(digest(lower('sunitinib')||'|'||lower('ketoconazole')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Regorafenib + Rifampin
  ('regorafenib','rifampin','major','Strong CYP3A4 induction decreases regorafenib exposure.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid strong CYP3A4 inducers with regorafenib."}]'::jsonb,
   encode(digest(lower('regorafenib')||'|'||lower('rifampin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Cisplatin + Gentamicin
  ('cisplatin','gentamicin','major','Enhanced nephrotoxicity/ototoxicity.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Concurrent aminoglycosides increase nephrotoxicity with cisplatin; avoid."}]'::jsonb,
   encode(digest(lower('cisplatin')||'|'||lower('gentamicin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Methotrexate (high-dose) + Ibuprofen
  ('methotrexate','ibuprofen','major','Reduced renal clearance increases methotrexate toxicity.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid NSAIDs with high-dose methotrexate due to toxicity risk."}]'::jsonb,
   encode(digest(lower('methotrexate')||'|'||lower('ibuprofen')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Codeine + Paroxetine
  ('codeine','paroxetine','moderate','CYP2D6 inhibition reduces analgesic effect of codeine.','avoid','guideline','high',
   '[{"source_type":"guideline","id":"CPIC-Codeine-CYP2D6","url":"https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/","snippet":"Avoid codeine with strong CYP2D6 inhibitors."}]'::jsonb,
   encode(digest(lower('codeine')||'|'||lower('paroxetine')||'|'||coalesce('guideline',''),'sha256'),'hex'))
on conflict (uniq_hash) do nothing;

