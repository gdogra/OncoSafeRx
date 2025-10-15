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
## v20.1.1 - 2025-10-15

### Changed
- Hardened development auth flags so they are ignored in production:
  - `ALLOW_SUPABASE_JWT_FALLBACK` and `ALLOW_QUERY_TOKEN` only honored when `NODE_ENV!=production`.

### Added
- AdminAuthBanner shown across admin pages with inline diagnostics and quick actions.
- Expanded Admin Auth Diagnostics page with server `/api/auth/diagnostics`, query‑token toggle, and copy‑curl helper.

### Notes
- Production behavior is unchanged unless `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set; dev fallbacks remain available for local development.

