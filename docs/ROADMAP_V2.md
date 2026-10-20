# OncoSafeRx — Roadmap V2 (audit-based)

Drafted 2026-10-20 from a code audit of `main` (commit 254a90a). Supersedes the
"Next Phases" outline in `docs/ROADMAP.md`.

## 1. Audit summary

### What is real and good
| Area | Evidence |
|---|---|
| Calculators (BSA, Cockcroft-Gault CrCl, MME) | `src/engine/calculators.js` |
| PGx phenotype derivation from FHIR-ish observations (CYP2D6, CYP2C19, UGT1A1, TPMT, DPYD, NUDT15) | `src/engine/pgxPhenotype.js` + unit test |
| CPIC-backed guideline data + regression corpus | `src/data/cpicGuidelines*.js`, `tests/clinical-regression/cpicCorpus.test.js` |
| ~758 curated drug-drug interactions | `src/data/knownInteractions.js` |
| DDI regression corpus | `tests/clinical-regression/ddiCorpus.test.js` |
| Regimen-aware dosing: BSA doses, rounding, ANC/platelet/CrCl/LVEF holds | `src/routes/dosingRoutes.js` |
| Regimen templates | `src/data/regimens.js` (6: FOLFOX-6, AC-T, FOLFIRI, R-CHOP, FOLFOXIRI, CAPOX) |
| Provenance UI, FHIR route/service layer, audit log service | recent commits, `src/services/auditLogService.js` |

### What is a stub or thin
| Area | Reality |
|---|---|
| **SMART on FHIR** | `smartRoutes.js` is 31 lines returning `auth.example.com` placeholders. No launch, no token exchange. |
| **CDS Hooks** | `cdsHooksRoutes.js` (74 lines): substring-matches drug names against the DDI list. No prefetch, no PGx/labs/dose cards, no feedback endpoint, no tests. |
| **Override capture** | `overrideRoutes.js` stores to an in-memory array. Lost on every restart, no auth, not linked to cards. |
| **Curated DDI YAML** | `data/ddi_curated.yaml` has 2 entries; the real data is the JS file. Two sources of truth. |
| **Regimens** | 6 templates, only 3 dose-adjusted paths in practice. Rules are hardcoded `if`s, not data. |
| **Dosing rules** | Hardcoded thresholds (e.g. "DPYD PM: avoid or reduce ≥50%") labelled "demo rule". DPYD IM handling does not use the CPIC activity-score model. |
| **Medication reconciliation** | 702-line service exists, but no OTC/supplement/herbal interaction knowledge base behind it. |
| **Tests** | Only 238 lines of clinical regression; zero tests for CDS Hooks, dosing, QT, calculators, or override. |

### Risk: fabricated clinical output (fix first)
`src/routes/aiPredictionRoutes.js` and `src/routes/enhancedDrugRoutes.js` generate
**random numbers** (`Math.random()`) for response times, efficacy/safety scores,
model accuracy/precision/recall ("0.918 + random"), and "patients analyzed".
Similar speculative modules are mounted in `src/index.js`: digitalTwin,
crisprTherapy, arSurgeryAssistant, autonomousTreatment, globalCancerIntelligence.
In a clinical-safety product, presenting randomized scores or invented accuracy
figures to a clinician is a patient-safety and regulatory liability, and it
contradicts the "honest claims" direction of recent commits. The acquisition
and FDA documents in `docs/` should also be checked so they do not cite these
numbers.

## 2. Product thesis

Be the safety check that runs on **every oncology order, inside the EHR**, with
**cited, versioned, deterministic** logic and **low alert noise**. Depth in
oncology rules beats breadth of features.

## 3. Roadmap

### Phase 0 — Credibility cleanup (1–2 weeks)
- Remove or hard-gate (`NODE_ENV!=='production'` + visible "SIMULATED" banner) every route that returns `Math.random()` output; delete fabricated accuracy/count fields.
- Unmount speculative modules from `src/index.js` unless they have real data behind them (digital twin, CRISPR, AR surgery, autonomous treatment, global network).
- Consolidate DDI knowledge into one source of truth (the curated YAML schema is better: mechanism, evidence level, citations — migrate `knownInteractions.js` into it).
- Audit `docs/` (pitch, acquisition, FDA) for claims that rest on the removed features.
- Clean repo root (one-off SQL fixes, `test-signup*.js`, `localStorage-debug.js`) into `scripts/` or delete.

### Phase 1 — Make the core trustworthy (4–6 weeks)
1. **Rules as data.** Move dosing/holding rules out of `dosingRoutes.js` into versioned JSON/YAML (drug, condition, action, severity, source, version). Same engine serves API, CDS Hooks, UI.
2. **CPIC activity-score model** for DPYD (and proper TPMT/NUDT15 combined logic) with correct starting-dose recommendations; add the **"no genotype on file — consider testing before this drug"** card for fluoropyrimidines, thiopurines, irinotecan.
3. **Regimen-level interaction + toxicity check:** evaluate the whole regimen plus supportive care (antiemetics, steroids, anticoagulants) in one call. Add QTc stacking and serotonin-syndrome scoring across the full med list.
4. **Persistent override capture** (Postgres, authenticated, tied to card id + rule version + patient/encounter hash) and an alert-tiering model (interruptive / passive / suppressed) with per-user acknowledged-alert suppression.
5. **Test depth:** unit tests for calculators and every dosing rule; clinical regression corpus of ≥200 cases reviewed by a pharmacist/oncologist; snapshot tests for CDS card output.
6. **Knowledge governance:** every rule carries source, evidence level, reviewer, last-reviewed date; a staleness report; surface in the existing provenance UI.

### Phase 2 — Live in the clinician's workflow (6–10 weeks)
1. **Real SMART on FHIR**: EHR launch + standalone launch, PKCE, token exchange, scopes, patient context. Validate in the Epic and Oracle Health sandboxes and the public SMART launcher.
2. **Production CDS Hooks**: `order-select`, `order-sign`, `patient-view`; prefetch templates (MedicationRequest, Observation labs, genomic Observations, Patient, Condition); JWT verification of EHR calls; `/feedback` endpoint wired to override capture; card UUIDs and suggestions with actions.
3. **Automatic data ingestion:** build the patient context (meds, CrCl inputs, ANC/platelets/LFTs, genotype, diagnoses) from FHIR so nothing is retyped; LOINC/RxNorm mapping layer with unit normalisation.
4. **OTC / supplement / food interactions** knowledge base (St John's wort, grapefruit, etc.) wired into reconciliation, plus a patient-reported-products intake step.
5. **Audit trail** that records inputs, rule versions and outputs for each check (immutable, exportable) — also what a regulator or buyer will ask for first.

### Phase 3 — Oncology depth (10–16 weeks)
- Grow regimens from 6 to ~40 (top solid-tumor + heme regimens, with cycle labs, premeds, dose-modification tables from labels/NCCN-style sources, licensing permitting).
- Organ-function adjustments per drug (renal, hepatic Child-Pugh/bilirubin), performance-status and age flags.
- Tumor-genomics matching: NGS report → actionable variants (OncoKB/CIViC, licensing check) → on-label/guideline therapies, linked to the existing trials routes (ClinicalTrials.gov / NCI).
- Supportive-care guardrails: emetogenic-risk-based antiemetic check, G-CSF/febrile-neutropenia risk, tumor-lysis risk, extravasation/vesicant flags.
- Second interaction data source (licensed, e.g. Lexicomp/DrugBank/Medi-Span) for coverage the curated set will not reach; keep curated oncology rules as the overlay.

### Phase 4 — Differentiation and moat (ongoing)
- **Clinic safety sweep:** "which current patients are on a DPYD-risk regimen with no test on file?" Retrospective cohort view for pharmacy/quality teams.
- **Pharmacist/tumor-board mode:** one-click consult note and chart-ready summary.
- **Outcome feedback loop:** de-identified override reasons and alert acceptance rates drive rule tuning (and are the data asset an acquirer values).
- **Patient/caregiver view:** plain-language avoid-list, symptom check-ins tied to regimen, shareable with local pharmacy.

## 4. Regulatory track (decide in Phase 1, not later)
Dose recommendations and order-level alerts may fall outside the FDA CDS
exemption (criteria: clinician can independently review the basis; not for
time-critical use; no pattern/image analysis). Deterministic, fully cited rules
with visible reasoning (Phase 1 items 1 and 6) keep the exemption defensible.
Get a regulatory counsel opinion before enabling any auto-blocking behaviour.
The existing `docs/FDA_510k_Preparation_Guide.md` should be reconciled with
whichever path is chosen. Also needed before real PHI: BAA with Supabase/hosting,
a HIPAA risk assessment, and removing the demo-login path in production.

## 5. Success metrics
- Alert acceptance rate and override-with-reason rate (target: acceptance of interruptive alerts >40%).
- Median time-to-card in an EHR order flow (< 2 s).
- Regression corpus size and pass rate (100% on every merge).
- % of rules with source + reviewer + review date (target 100%).
- Number of live EHR sandboxes / pilot sites.

## 6. Suggested first sprint
1. Gate/remove `Math.random()` routes. 2. Persist overrides to Postgres.
3. Rules-as-data refactor of `dosingRoutes.js` with tests. 4. Merge
`knownInteractions.js` into the curated schema. 5. SMART launch spike against
the public SMART sandbox.
