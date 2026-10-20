# OncoSafeRx — Asset Summary

*Replaces an earlier version that described capabilities (quantum drug discovery,
CRISPR design, autonomous treatment delivery, billion-dollar valuations) that
are not built. See `docs/ROADMAP_V2.md` for the audited state of the code.*

## What it is
An oncology drug-interaction and pharmacogenomics (PGx) decision-support web
application for clinicians, with a React frontend and a Node/Express API on
Supabase.

## What works today (verified in code)
- Drug search and FDA label lookup (RxNorm, DailyMed).
- Drug-drug interaction checking over ~750 curated interactions, with a
  regression test corpus.
- PGx phenotype derivation (CYP2D6, CYP2C19, UGT1A1, TPMT, DPYD, NUDT15) and
  CPIC-backed guideline data, with a regression test corpus.
- Calculators: body surface area, Cockcroft-Gault CrCl, opioid MME.
- Regimen templates (6) with dose calculation and lab-based hold rules.
- Alternatives suggestions with rationale and citations.
- Provenance display, audit logging service, role-based access, Supabase auth.

## Early-stage or incomplete
- EHR integration: a CDS Hooks endpoint exists as a basic prototype; SMART on
  FHIR launch is a placeholder.
- Override capture is in-memory only.
- Several experimental modules return simulated data and are disabled in
  production.

## Not built
Quantum drug discovery, CRISPR therapy design, AR surgery assistance,
autonomous treatment delivery, global outbreak surveillance, 20-year health
prediction, "holistic wellbeing" orchestration. Earlier documents described
these as operational; they are not.

## Regulatory and compliance status
- No FDA clearance or approval. A 510(k) preparation guide exists in
  `docs/`; whether the product needs one depends on its final CDS design.
- No SOC 2 or HIPAA attestation completed.
- No published clinical validation or accuracy figure.

## Valuation
No valuation is asserted here. Any figure given to a third party should come
from a current financial model with stated assumptions, not from this file.

## Before sharing externally, confirm
Pilot sites, physician counts, patient counts, testimonials and customer names
that appear in other documents: only include those backed by records you can
produce.
