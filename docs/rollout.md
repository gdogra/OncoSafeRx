# Phased Rollout

## Phase 1: DDI + Data Quality
- Implement and deploy `agents-run` Edge Function.
- Wire frontend flows to call DDI and Data Quality agents after med entry.
- Seed `ddi_evidence` with high-yield pairs from labels/guidelines (manual import or curated dump).
- Add UI for per-pair interactions, severity badges, and missing data prompts.

## Phase 2: Evidence + PGx
- Integrate Evidence Agent with DailyMed/FDA label mirror and ClinicalTrials.gov (or cached summaries) with provenance.
- Add PGx rules snapshot (CPIC/PharmGKB) for selected genes/drugs; expose per-drug PGx suggestions.
- Expand caching strategy to reduce external calls; capture rule set versions.

## Phase 3 (Optional): Trial Finder
- Implement Trial & Option Finder querying registries with disease + biomarker + location filters.
- Present matching NCT trials with rationale and eligibility hints.

## Non-Functional
- Add rate limiting and audit logging (without PHI).
- Add deterministic rule/version pinning to ensure reproducibility.
- Ensure all outputs include citations and confidence.

