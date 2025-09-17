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

- Production/preview: The API now serves the React app from `frontend/build` for non-API routes.
  - Build the frontend: `cd frontend && npm run build`
  - Start API: `npm start`
  - Visit: `http://localhost:3000/` to load the UI (SPA); API remains under `/api/*`.
- Development: Run frontend dev server separately and point it to the API.
  - Backend: `PORT=3001 npm run dev`
  - Frontend: set `REACT_APP_API_URL=http://localhost:3001/api` then `npm start` (serves on 3000)
  - This avoids port conflicts and enables hot reload.

### Health Check

```bash
curl http://localhost:3000/health
```

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

### Genomics (Sample Data)

```bash
# Get CPIC guidelines
GET /api/genomics/cpic/guidelines

# Get genomic recommendations for a drug
GET /api/genomics/drug/161/genomics

# Check genomic profile
POST /api/genomics/profile/check
{
  "genes": ["CYP2D6", "CYP2C19"],
  "drugs": ["161", "42463"]
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
