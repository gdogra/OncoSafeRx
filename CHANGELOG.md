# Changelog

All notable changes to this project will be documented in this file.

## v20.1.0 - 2025-10-15

### Added
- Server FHIR endpoints: `GET /api/fhir/health`, `GET /api/fhir/patients`, `GET /api/fhir/patients/:id` with Joi validation and mock fallback.
- Clinical trials drug search now leverages FHIR patient profile when `patientId` is provided.
- Frontend FHIR Patients page (`/fhir-patients`) to search patients, view details, and jump to trials with patient context.
- Recent drugs memory (localStorage) surfaced in FHIR Patients and mirrored on Trials page.
- Trials page shows patient-aware search toast with deep link back to the selected patient.
- Integration tests: smoke tests for FHIR routes.

### Documentation
- README updated with FHIR endpoints and examples, production env variables (`FHIR_BASE_URL`, `FHIR_AUTH_TOKEN`), and trial search examples using `patientId`.

