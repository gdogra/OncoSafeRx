# Example End-to-End Flow

1) Patient creates account via Supabase Auth and completes demographics.

2) Patient or clinician enters current medications; frontend posts to `medication_regimens` and keeps a local list.

3) Frontend invokes agents:
   - POST `/api/agents/run` body: `{ agent_type: 'DDI', patient_id, payload: { medications } }`
   - POST `/api/agents/run` body: `{ agent_type: 'DATA_QUALITY', patient_id, payload: { demographics, labs, medications, allergies } }`

4) Edge function `agents-run` dispatches, persists `agent_runs` rows, responds with structured outputs.

5) UI renders:
   - DDI Risk Map: badges for severity; list of per-pair interactions; links to citations.
   - Data Gaps: prioritized missing fields with rationales and question prompts.

6) (Phase 2) Evidence Agent: user clicks a drug; frontend calls `{ agent_type: 'EVIDENCE', payload: { drugs: [drugName] } }` and shows label sections and trial highlights.

7) (Phase 2) PGx Agent: load patient PGx results; run `{ agent_type: 'PGX', payload: { pgx_results, medications } }` and show per-drug PGx guidance.

Notes: All non-trivial assertions include citations and a confidence score. No prescriptive treatment decisions are provided.

