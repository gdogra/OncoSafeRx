-- Additional oncology-relevant DDI seeds (label/guideline-backed where possible)

insert into public.ddi_evidence (
  drug_primary, drug_interactor, severity, mechanism, recommendation, evidence_source, evidence_level, citations, uniq_hash
) values
  -- Dasatinib + Omeprazole (PPIs reduce absorption)
  ('dasatinib','omeprazole','major','Gastric pH increase reduces dasatinib exposure.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid PPIs with dasatinib due to reduced absorption."}]'::jsonb,
   encode(digest(lower('dasatinib')||'|'||lower('omeprazole')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Erlotinib + Omeprazole
  ('erlotinib','omeprazole','major','Reduced erlotinib absorption with PPIs.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid PPIs with erlotinib; consider staggered H2 antagonists if needed."}]'::jsonb,
   encode(digest(lower('erlotinib')||'|'||lower('omeprazole')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Palbociclib + Clarithromycin (strong CYP3A inhibitor)
  ('palbociclib','clarithromycin','major','Strong CYP3A4 inhibition increases palbociclib exposure.','adjust','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid strong CYP3A inhibitors with palbociclib; reduce dose if unavoidable."}]'::jsonb,
   encode(digest(lower('palbociclib')||'|'||lower('clarithromycin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Venetoclax + Posaconazole
  ('venetoclax','posaconazole','major','Strong CYP3A4 inhibition markedly increases venetoclax exposure.','adjust','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Reduce venetoclax dose with strong CYP3A inhibitors (e.g., posaconazole)."}]'::jsonb,
   encode(digest(lower('venetoclax')||'|'||lower('posaconazole')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Ibrutinib + Warfarin
  ('ibrutinib','warfarin','major','Increased bleeding risk; warfarin contraindicated.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid warfarin with ibrutinib due to bleeding risk."}]'::jsonb,
   encode(digest(lower('ibrutinib')||'|'||lower('warfarin')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Vincristine + Itraconazole
  ('vincristine','itraconazole','major','CYP3A4 inhibition increases vincristine neurotoxicity.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid azole antifungals with vincristine due to neurotoxicity risk."}]'::jsonb,
   encode(digest(lower('vincristine')||'|'||lower('itraconazole')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Paclitaxel + Gemfibrozil
  ('paclitaxel','gemfibrozil','major','CYP2C8 inhibition increases paclitaxel exposure.','avoid','label','high',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Avoid strong CYP2C8 inhibitors (e.g., gemfibrozil) with paclitaxel."}]'::jsonb,
   encode(digest(lower('paclitaxel')||'|'||lower('gemfibrozil')||'|'||coalesce('label',''),'sha256'),'hex')),

  -- Methotrexate + Penicillins (e.g., Amoxicillin)
  ('methotrexate','amoxicillin','moderate','Decreased renal clearance may increase methotrexate toxicity.','monitor','label','moderate',
   '[{"source_type":"label","url":"https://www.accessdata.fda.gov","snippet":"Monitor for methotrexate toxicity with penicillins; consider alternatives."}]'::jsonb,
   encode(digest(lower('methotrexate')||'|'||lower('amoxicillin')||'|'||coalesce('label',''),'sha256'),'hex'))
on conflict (uniq_hash) do nothing;

