Progressive Patient Signup (Wizard)

Goal
- Capture comprehensive patient information gradually, with “Skip for now” on every step.
- Persist partial data to `user.patient_profile` via `/api/auth/profile` as the patient proceeds.

Suggested Steps
1) Account
  - Fields: email, password, full_name, role=patient (preselected)
  - Endpoint: POST `/api/auth/register`
  - On success, store token and move to next step.

2) Demographics (skippable)
  - Fields: firstName, lastName, dateOfBirth, sex, phone, address
  - Payload: `{ patient_profile: { demographics: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

3) Cancer basics (skippable)
  - Fields: cancerType, cancerStage, diagnosisDate, treatingCenter, treatingPhysician
  - Payload: `{ patient_profile: { cancer: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

4) Medical history (skippable)
  - Fields: conditions[], surgeries[], allergies[] (allergen, reaction, severity), familyHistory[]
  - Payload: `{ patient_profile: { medicalHistory: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

5) Medications (skippable)
  - Fields: current medications (rxcui/name, dose, route, frequency)
  - Payload: `{ patient_profile: { medications: [ ... ] } }`
  - Endpoint: PUT `/api/auth/profile`

6) Biomarkers/Genomics (skippable)
  - Fields: her2, er, pr, pdl1, msi; optional genomic data
  - Payload: `{ patient_profile: { biomarkers: {...}, genomics: {...} } }`
  - Endpoint: PUT `/api/auth/profile`

7) Insurance (skippable)
  - Fields: provider, memberId, groupNumber
  - Payload: `{ patient_profile: { insurance: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

8) Emergency Contact (skippable)
  - Fields: name, relationship, phone
  - Payload: `{ patient_profile: { emergencyContact: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

9) Consents (skippable)
  - Fields: shareDeidentifiedData, researchContactOk
  - Payload: `{ patient_profile: { consents: { ... } } }`
  - Endpoint: PUT `/api/auth/profile`

UX Tips
- Show a checklist/progress indicator for completed steps.
- Autosave on step completion; confirm success to the user.
- Allow returning later to complete additional steps.

Security/Privacy
- Avoid logging PII/PHI; ensure backend logs do not contain payload contents.
- Use HTTPS and short-lived JWTs; consider refresh flow.
- Apply RLS and role checks on `public.users` in Supabase; limit profile reads to the owner.

Sample Update Payloads
```
// Demographics only
PUT /api/auth/profile
{
  "patient_profile": {
    "demographics": { "firstName": "Sam", "dateOfBirth": "1982-02-04" }
  }
}

// Add medications later; deep-merge preserved
PUT /api/auth/profile
{
  "patient_profile": {
    "medications": [ { "name": "Warfarin", "dose": "5 mg", "route": "oral", "frequency": "daily" } ]
  }
}
```

