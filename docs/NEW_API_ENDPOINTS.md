New API Endpoints (Clinical, Genomic, AI)

Base path: /api

1) Clinical Decision & Interactions
- POST `/clinical/analyze-interactions`
  - Body: `{ medications: Medication[], patientContext?: PatientContext }`
  - Notes: Requires ≥2 medications.
  - Example request:
    {
      "medications": [
        { "name": "warfarin" },
        { "name": "amiodarone" }
      ],
      "patientContext": { "age": 72, "kidneyFunction": 55 }
    }
  - Example response (truncated):
    {
      "success": true,
      "data": {
        "interactions": [ { "severity": "major", "clinicalContext": {"evidenceLevel": "B"} } ],
        "summary": { "totalInteractions": 1, "overallRisk": "moderate" }
      }
    }

- POST `/clinical/decision-support`
  - Body: `Prescription { medications: Medication[], patientContext?: PatientContext }`
  - Example request: { "medications": [{"name":"tamoxifen"}], "patientContext": {"genetics": {"CYP2D6": ["*4","*5"]}} }

- POST `/clinical/pharmacogenomics`
  - Body: `{ medications: Medication[], genetics: object, patientContext?: PatientContext }`

- POST `/clinical/comprehensive-analysis`
  - Body: `{ medications: Medication[], patientContext?: PatientContext, includePharmacogenomics?: boolean, includeInteractions?: boolean, includeDecisionSupport?: boolean }`

- GET `/clinical/drug-info/:rxcui`
  - Query: `patientContext` (JSON-encoded string)
  - Validates params; returns 400 on invalid `patientContext` JSON.
  - Example: `/clinical/drug-info/1734104?patientContext={"age":60}`

2) Genomic Profiling
- POST `/genomics/profiling/analyze-profile`
  - Body: `{ genomicData: GenomicData, patientContext?: PatientContext, analysisOptions?: object }`
  - Example request:
    {
      "genomicData": { "sampleId": "S1", "variants": [{"gene":"BRAF","alteration":"V600E","type":"snv"}] },
      "analysisOptions": { "includeTherapeuticTargets": true }
    }

- POST `/genomics/profiling/interpret-variants`
  - Body: `{ variants: Variant[], cancerType?: string, includeTherapeuticImplications?: boolean, includePrognosticImplications?: boolean, includeResistanceImplications?: boolean }`

...additional: `/analyze-tmb`, `/analyze-msi`, `/analyze-hrd`, `/identify-targets`

3) AI Treatment Predictions
- POST `/ai/treatment/predict-treatment`
  - Body: `{ patientData: PatientData, availableTreatments: Treatment[], predictionOptions?: object }`
  - Example request:
    {
      "patientData": { "age": 58, "sex": "female", "cancerType": "breast", "cancerStage": "II", "performanceStatus": 1,
        "biomarkers": { "her2": "positive" } },
      "availableTreatments": [{ "regimen": "Trastuzumab + Pertuzumab + Docetaxel", "type": "combination" }]
    }

- POST `/ai/treatment/predict-response`
  - Body: `{ patientData: PatientData, treatment: Treatment, responseMetrics?: ('ORR'|'DCR'|'PFS'|'OS'|'duration')[] }`

- POST `/ai/treatment/predict-survival`
  - Body: `{ patientData: PatientData, treatments: Treatment[], survivalMetrics?: ('OS'|'PFS'|'DFS'|'RFS')[], timePoints?: number[] }`

- POST `/ai/treatment/predict-toxicity`, `/compare-treatments`, `/explain-prediction`

Auth
- All endpoints require JWT via `Authorization: Bearer <token>`.

Validation
- Shared schemas for Medication and PatientContext are defined in `src/middleware/validation.js` and used by clinical routes.
 - Genomic routes reuse the shared PatientContext schema.

Notes
- Many services currently return structured placeholders with `analysisType`/`version` metadata to aid clients during integration.

Auth and Profiles (patient)
- POST `/auth/register`
  - Accepts `patient_profile` (optional). Patients can skip and fill later.
  - Example request:
    {
      "email": "pat@example.com",
      "password": "StrongPass123",
      "full_name": "Pat Example",
      "role": "patient",
      "patient_profile": {
        "demographics": { "firstName": "Pat", "dateOfBirth": "1980-04-12" },
        "cancer": { "cancerType": "breast", "cancerStage": "II" }
      }
    }

- GET `/auth/profile`
- PUT `/auth/profile`
  - Accepts partial updates and deep-merges nested objects.
  - Validates against patient profile schema; all fields optional.
