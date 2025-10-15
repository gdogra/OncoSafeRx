# OncoSafeRx

Oncology drug interaction and pharmacogenomic recommendation platform.

## Overview

OncoSafeRx is a precision medicine platform designed to help oncologists and patients navigate complex drug interactions and personalized treatment recommendations based on pharmacogenomic data.

### Current MVP Features

- **Drug Search & Information** via RxNorm database
- **FDA Label Integration** via DailyMed for comprehensive drug information
- **Drug-Drug Interaction Checking** using RxNorm interaction data
- **Basic Pharmacogenomic Guidelines** (CPIC integration planned)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Development Setup

```bash
# Clone and install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start the full stack with Docker
npm run docker:up

# Wait for services to start, then run data sync
npm run sync:rxnorm
npm run sync:cpic
```

### Services

- API Server: http://localhost:3000
- Hasura Console (optional/dev): http://localhost:8081
- PostgreSQL (optional/dev): localhost:5433

### Frontend Serving

- Production/preview: The API serves the React app from `frontend/dist` for non-API routes.
  - Build the frontend: `npm run build` (runs `cd frontend && npm run build`)
  - Start API: `npm run start:prod`
  - Visit: `http://localhost:3000/` to load the UI (SPA); API remains under `/api/*`.
- Development: Run the integrated Vite middleware (default) or run separately.
  - Backend (dev): `npm run dev` (serves API + Vite middleware on /)
  - Alternative: run frontend separately (`cd frontend && npm run dev`) and API with `USE_VITE=false npm run dev`.

### Production Env (Frontend)

- Required:
  - `VITE_SUPABASE_URL` = your Supabase project URL
  - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
  - `VITE_API_URL` = https://your-api.example.com/api
- Optional:
  - `VITE_SKIP_SUPABASE_PREFLIGHT=true` (skip connectivity HEAD)
  - `VITE_SUPABASE_AUTH_VIA_PROXY=true` (use server proxy for auth)
  - `VITE_ALLOW_DEMO_LOGIN=false` (keep disabled in prod)
  - `VITE_COMMUNITY_URL` = URL to your community forum (defaults to GitHub Discussions)

### Health Check

```bash
curl http://localhost:3000/health
```

### FHIR Health

```bash
GET /api/fhir/health
# Response includes connection status, FHIR version, and implementation details.
```

### User Feedback → Tasks

- In‑app feedback widget is built in; submissions go to `/api/feedback/submit` and are auto‑classified.
- Optional server-side GitHub integration creates issues from feedback.
- Configure on API server via env vars:
  - `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, optional `GITHUB_API_URL`
  - `FEEDBACK_AUTO_CREATE_ISSUES=true` to auto‑create on submit
  - Supabase persistence: run `supabase-add-feedback.sql` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

See docs/FEEDBACK.md for full details.

## API Endpoints

### Drug Information

```bash
# Search for drugs
GET /api/drugs/search?q=aspirin

# Get drug details by RXCUI
GET /api/drugs/161

# Get drug interactions
GET /api/drugs/161/interactions

# Search FDA labels
GET /api/drugs/labels/search?q=aspirin

# Get detailed FDA label
GET /api/drugs/labels/{setId}
```

### Interaction Checking

```bash
# Check interactions between multiple drugs
POST /api/interactions/check
{
  "drugs": ["161", "42463", "1191"]
}

# Get all interactions for a drug
GET /api/interactions/drug/161

### Alternatives (MVP)

```

### Pain Management (Opioids)

```
# Calculate total MME/day for a regimen
POST /api/pain/opiates/mme
{
  "medications": [
    { "name": "oxycodone", "doseMgPerDose": 10, "dosesPerDay": 3 },
    { "name": "hydrocodone", "doseMgPerDose": 5, "dosesPerDay": 4 }
  ],
  "patient_context": { "age": 68, "respiratory": true }
}

# Safety check for opioid-related risks
POST /api/pain/opiates/safety-check
{
  "medications": [
    { "name": "oxycodone" },
    { "name": "lorazepam" },
    { "name": "ketoconazole" }
  ],
  "phenotypes": { "CYP2D6": "poor_metabolizer" },
  "patient_context": { "age": 72, "renal_clearance": 28 }
}
```
# Suggest safer alternatives for a set of RXCUIs
POST /api/alternatives/suggest
{
  "drugs": ["42463", "1811631"]
}

# Response
{
  "count": 1,
  "suggestions": [
    {
      "forDrug": {"name": "omeprazole"},
      "withDrug": {"name": "clopidogrel"},
      "alternative": {"name": "pantoprazole", "rxcui": null},
      "rationale": "Pantoprazole has minimal CYP2C19 inhibition...",
      "citations": ["FDA", "CPIC"]
    }
  ]
}
```

### Regimens (MVP)

```
# List regimen templates
GET /api/regimens

# Get regimen details
GET /api/regimens/FOLFOX-6
```

### CDS Hooks (Demo)

```
# Discovery
GET /cds-services

# medication-prescribe
POST /cds-services/oncosaferx-medication-prescribe
{ "context": { "medications": ["42463", "1811631"] } }
```

### Supabase Auth Proxy (Server)

These endpoints are optional and disabled by default. Enable by setting on the API server:

- `AUTH_PROXY_ENABLED=true`
- `PROXY_ALLOWED_ORIGINS` = comma-separated list of allowed frontend origins (e.g. `https://app.example.com,http://localhost:5173`)

Endpoints:

```
# Login via server proxy (rate-limited, origin-checked)
POST /api/supabase-auth/proxy/login
{ "email": "you@example.com", "password": "***" }

# Signup via server proxy (passes metadata to Supabase)
POST /api/supabase-auth/proxy/signup
{ "email": "you@example.com", "password": "***", "metadata": { "first_name": "Jane", "role": "oncologist" } }

# Request password reset email
POST /api/supabase-auth/proxy/reset
{ "email": "you@example.com", "redirectTo": "https://app.example.com/reset-password" }
```

Responses follow Supabase patterns; error JSON includes a `code` field for UI mapping.

# List curated (local) interactions
GET /api/interactions/known

# Filter curated interactions by drug name and/or severity
GET /api/interactions/known?drug=aspirin&severity=major

# Filter by two drugs (order-insensitive)
GET /api/interactions/known?drugA=aspirin&drugB=warfarin

# Limit results and include RXCUI mapping (auto-included when known)
GET /api/interactions/known?drug=aspirin&limit=5

# Resolve missing RXCUIs via RxNorm on the fly (networked)
GET /api/interactions/known?drug=omeprazole&resolveRx=true

# Return a compact enriched view with mapped RXCUIs
GET /api/interactions/known?drugA=codeine&drugB=fluoxetine&view=enriched&resolveRx=true

# Export curated interactions as CSV (honors filters)
GET /api/interactions/known?severity=major&view=csv
```

### Dosing (MVP)

```
# Context-aware dosing adjustments
POST /api/dosing/adjust
{
  "regimenId": "FOLFOX-6",
  "labs": { "ANC": 1200, "platelets": 90000, "CrCl": 25, "LVEF": 48 },
  "phenotypes": { "DPYD": "poor metabolizer" }
}
```

### FHIR Patients (MVP)

```
# Search patients by name/identifier/birthdate/gender
GET /api/fhir/patients?name=emma
GET /api/fhir/patients?identifier=MRN001234
GET /api/fhir/patients?birthdate=1982-03-15
GET /api/fhir/patients?gender=female

# Get a patient by FHIR ID
GET /api/fhir/patients/patient-1

# Health check
GET /api/fhir/health
```

Notes:
- Honors `FHIR_BASE_URL` and optional `FHIR_AUTH_TOKEN`. Defaults to public HAPI if unset.
- Falls back to local mock templates in `fhirPatientService` when FHIR is unreachable (dev-friendly).
- Used by clinical trials drug search when `patientId` is provided.

### Trials (MVP)

```
# Search trials by condition/biomarker/line/status/location radius
GET /api/trials/search?condition=lung&biomarker=EGFR&line=1st&lat=37.77&lon=-122.42&radius_km=50
```

```
# Drug-based trials search with patient linkage (uses FHIR when patientId present)
GET /api/clinical-trials/search-by-drug?drug=imatinib&patientId=patient-1

# Fallback with explicit patient context
GET /api/clinical-trials/search-by-drug?drug=imatinib&condition=GIST&age=54&gender=female
```

### Prescribing & Exports (MVP)

```
# Format a structured SIG
POST /api/prescribe/sig
{ "drug": {"name": "Clopidogrel", "rxcui": "42463"}, "dose": "75 mg", "route": "PO", "frequency": "daily" }

# Regimen PDF export
GET /api/export/regimen/FOLFOX-6/pdf
```

### Search & Synonyms (MVP)

```
GET /api/search/drugs?q=aspirin
GET /api/search/synonyms?q=pump
```

### Billing & ROI (PGx)

```
# CPT reference for PGx
GET /api/billing/pgx/codes

# Payer policy notes
GET /api/billing/pgx/payers

# ROI calculator for a PGx program
POST /api/roi/pgx
{
  "annualADECost": 10000000,
  "testCost": 300,
  "targetPopulation": 5000,
  "expectedTestingRate": 0.4,
  "expectedADEreductionPct": 0.25
}
```

### Genomics (Sample Data)

```bash
# Get CPIC guidelines
GET /api/genomics/cpic/guidelines

# Get genomic recommendations for a drug
GET /api/genomics/drug/161/genomics

# Check genomic profile (with optional HLA observations)
POST /api/genomics/profile/check
{
  "genes": ["CYP2D6", "CYP2C19"],
  "drugs": ["161", "42463"],
  "observations": [ { "code": {"text": "HLA-B*57:01"}, "valueString": "positive" } ]
}
```

### Genomics Panel & Versions

```
# Panel descriptor (17 genes + 4 HLA overview)
GET /api/genomics/panel

# Version/change log for dynamic PGx reporting
GET /api/genomics/versions

# Dynamic PGx report (includes current version metadata)
GET /api/genomics/report/{rxcui}
```

### Partner PGx Decision Support (stub)

```
POST /api/genomics/partner/gene-dose/summarize
{
  "medications": [ {"name": "Clopidogrel"}, {"name": "Irinotecan"} ],
  "phenotypes": { "CYP2C19": "Poor metabolizer", "UGT1A1": "*28/*28" }
}
```

## Data Sources (Phase 1 MVP)

### Free/Open Sources
- **RxNorm** - Standardized drug names and codes
- **DailyMed** - FDA-approved drug labels and safety information
- **CPIC Guidelines** - Gene-drug interaction recommendations (planned)
- **PharmGKB** - Pharmacogenomic knowledge base (planned)

### Enterprise Sources (Phase 2)
- **Micromedex** - Clinical drug database
- **Lexicomp** - Hospital-grade drug information
- **NCCN Guidelines** - Oncology treatment protocols

## Architecture

```
src/
├── config/          # Database and configuration
├── models/          # Data models (Drug, Interaction)
├── services/        # External API integrations
├── routes/          # Express route handlers
├── utils/           # Helper utilities
└── index.js         # Main application entry
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## Roadmap

- **Phase 1 (MVP)**: RxNorm + DailyMed + Basic interactions
- **Phase 2 (Enterprise)**: NCCN + Micromedex + EHR integration  
- **Phase 3 (AI-Powered)**: ML models + Clinical trial matching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
# OncoSafeRx
## Deploy

### Netlify (recommended)

- Netlify settings
  - Base directory: `frontend`
  - Build command: `npm ci && npm run build`
  - Publish directory: `dist`
  - Environment variables:
    - `VITE_API_URL` = https://your-api.example.com/api
    - Optional: `VITE_APP_VERSION` = 1.0.0

- GitHub Actions (auto-deploy on push)
  - This repo includes `.github/workflows/deploy-netlify.yml`
  - Add repository secrets under Settings → Secrets and variables → Actions:
    - `NETLIFY_AUTH_TOKEN` = your Netlify token (starts with `nfp_...`)
    - `NETLIFY_SITE_ID` = your Netlify site ID
    - Optional: `VITE_API_URL` to override at build time

### Badge

Add a Netlify status badge to this README by replacing `YOUR-SITE-ID`:

```
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```
## Production

1) Configure environment

- Server `.env` (see `.env.example`):
  - `PORT=3000`
  - `NODE_ENV=production`
  - `SERVE_FRONTEND=true`
  - `CORS_ORIGIN=https://your-domain.com,https://admin.your-domain.com`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (required)
  - `SUPABASE_SERVICE_ROLE_KEY` (optional; enables server-side profile utilities)
  - `AUTH_PROXY_ENABLED=false` (recommended unless required)
  - `METRICS_TOKEN` (optional; protect `/metrics`)
  - `ALLOW_SUPABASE_JWT_FALLBACK` (dev only; ignored in production)
  - `ALLOW_QUERY_TOKEN` (dev only; ignored in production)
  - `ADMIN_DEV_BYPASS` (dev only; bypass admin role checks for any authenticated user)
  - `ADMIN_SUPERADMINS` (comma-separated emails treated as `super_admin` at API)
  - `SUPABASE_JWT_SECRET` (optional; enables HS256 verification of Supabase JWTs without service introspection)
  - `FHIR_BASE_URL` (optional; defaults to public HAPI)
  - `FHIR_AUTH_TOKEN` (optional; bearer token for secured FHIR servers)

- Frontend `frontend/.env.production` (or CI build env):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

2) Build + Start

```
npm run build
npm run start:prod
```

3) Security notes

- Helmet is enabled with a conservative baseline. You can enable a strict Content Security Policy (CSP) from the server by setting `ENABLE_CSP=true`. The default production CSP blocks inline scripts/styles:
  - default-src 'self'
  - script-src 'self'
  - style-src 'self'  (no 'unsafe-inline')
  - img-src 'self' data: blob:
  - font-src 'self' data:
  - connect-src 'self' https://*.supabase.co wss://*.supabase.co
  - object-src 'none', frame-ancestors 'self', base-uri 'self'
  You may also set CSP via your reverse proxy/CDN (recommended for more complex apps).
- Set `CORS_ORIGIN` to trusted origins only; avoid `*` in production.
- Demo endpoints are disabled by default; do not set `DEMO_PROFILE_ENABLED` in production.
- Protect Prometheus metrics via `METRICS_TOKEN` if exposed.
4) CI/CD Deploy (optional)

This repo includes two GitHub Actions:

- `.github/workflows/build-and-release.yml` — Builds frontend with Node 20, runs tests, uploads artifact.
- `.github/workflows/deploy.yml` — Builds and pushes a Docker image to GHCR and updates your Kubernetes deployment to the new tag.

To use `deploy.yml`, configure repository secrets:

- `VITE_SUPABASE_URL` — Your Supabase URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon key
- `KUBE_CONFIG_B64` — Base64-encoded kubeconfig for your cluster context

By default, images are tagged with the commit SHA and pushed to `ghcr.io/<owner>/<repo>`. The workflow then runs:

```
kubectl set image deployment/oncosaferx-api api=ghcr.io/<owner>/<repo>:<sha> --record
kubectl rollout status deployment/oncosaferx-api
```

Ensure `k8s/deployment-api.yaml` references the same deployment name (`oncosaferx-api`) and that your cluster has the required namespace and RBAC in place.
