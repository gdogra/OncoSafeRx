# OncoSafeRx Agentic Backend Architecture

## Overview

The backend provides a unified agent runner that accepts a request from the frontend (`POST /api/agents/run`) and dispatches to specialized agents:

- DDI Safety Agent (AGENT 1)
- Patient Data Completeness & Quality Agent (AGENT 2)
- Evidence Retrieval & Label Intelligence Agent (AGENT 3)
- Pharmacogenomic Interpretation Agent (AGENT 4)
- Trial & Option Finder (AGENT 5, Phase 2+)

This doc anchors concrete interfaces, data contracts, and persistence with Supabase Postgres.

## Components

- Supabase Edge Function `agents-run`: Unified entrypoint; authenticates request, loads patient/regimen as needed, dispatches agent, persists `agent_runs` row with input+output.
- Agent Library: TypeScript modules implementing `runDDIAgent`, `runDataQualityAgent`, `runEvidenceAgent`, `runPGxAgent` (and optional `runTrialsAgent`).
- Database: Core tables `patients`, `medication_regimens`, `agent_runs`, optional `ddi_evidence` cache.

## Data Flow

1) Frontend calls `POST /api/agents/run` with `{ agent_type, patient_id, payload }`.
2) Edge Function authenticates user (Supabase Auth), validates input.
3) Loads patient/regimen as needed; constructs agent-specific input.
4) Invokes agent implementation; agent may query `ddi_evidence` and other caches.
5) Persists `agent_runs` with input, output, status, timestamps.
6) Returns structured output to frontend with provenance and confidence.

## Safety & Provenance

- Each agent emits citations with `source_type`, identifiers (PMID/NCT/SPL/URL), and a short snippet.
- Assertions include `evidence_level` and `confidence`.
- Agents never fabricate identifiers; unknowns are explicit.

## Determinism

- Deterministic behavior is driven by caching evidence (e.g., `ddi_evidence`), explicit rule versions, and avoiding non-deterministic sampling.
- Agent inputs/outputs and rule versions can be logged in `agent_runs`.

## Privacy

- Do not send PHI to external services.
- Only persist minimum necessary identifiers; avoid free-text PHI in logs.

