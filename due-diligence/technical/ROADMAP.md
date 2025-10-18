# OncoSafeRx — Roadmap (Foundation Phase)

## Scope (This Phase)

1) Alternatives Engine (MVP)
- Suggest safer alternatives for high-impact DDI/PGx pairs
- Include rationale, citations, and monitoring guidance

2) Regimen Builder (MVP)
- A few common regimens (FOLFOX, AC-T, FOLFIRI) with cycle definitions
- Pre-treatment labs, day-of-cycle checks, toxicity notes

3) CDS Hooks Skeleton
- Discovery endpoint and a `medication-prescribe` service returning cards
- Basic logic: surface major interactions + recommended alternatives

4) Frontend wiring
- Add “Alternatives (beta)” on Interaction Checker
- Add Regimens page (list + details)

## Next Phases (Outline)

- EHR integration: SMART on FHIR launch + CDS Hooks in clinical sandbox
- PGx ingestion: FHIR Observations → phenotype derivation; use in alternatives
- Trial matching MVP: condition + biomarker filters; basic I/E screening
- Knowledge base: premium sources, nightly ingests, provenance + versioning
- Governance: editorial workflow, audit trails, override capture

