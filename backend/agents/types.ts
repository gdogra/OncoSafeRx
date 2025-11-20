// Shared types and agent contracts for OncoSafeRx

export type AgentType = 'DDI' | 'DATA_QUALITY' | 'EVIDENCE' | 'PGX' | 'TRIALS';

export type Severity = 'minor' | 'moderate' | 'major' | 'contraindicated';
export type EvidenceLevel = 'high' | 'moderate' | 'low' | 'unknown';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type SourceType = 'label' | 'trial' | 'guideline' | 'post_marketing' | 'knowledgebase' | 'internal_cache';

export interface Citation {
  source_type: SourceType;
  id?: string; // PMID / NCT / SPL / URL / KB ID
  url?: string;
  snippet?: string;
}

export interface MedicationInput {
  drug_name: string;
  dose?: string; // e.g., "500 mg"
  route?: string; // e.g., "PO", "IV"
  frequency?: string; // e.g., "BID"
  start_date?: string; // ISO date
  indication?: string;
}

export interface NormalizedMedication extends MedicationInput {
  rxnorm_concept_id?: string; // e.g., RxCUI
  normalized_drug_name?: string;
}

// ---------------------
// DDI Agent Contracts
// ---------------------

export interface RunDDIAgentInput {
  patient_id: string;
  medications: MedicationInput[];
  comorbidities?: string[];
  renal_function?: { egfr?: number; creatinine?: number; unit?: string };
  hepatic_function?: { ast?: number; alt?: number; bilirubin?: number; unit?: string };
  age?: number;
  diagnosis?: string;
}

export interface DDIInteraction {
  primary_drug: string;
  interacting_drug: string;
  rxnorm_primary?: string;
  rxnorm_interactor?: string;
  severity: Severity;
  mechanism?: string;
  recommendation?: string; // avoid / adjust / monitor
  evidence_level: EvidenceLevel;
  citations: Citation[];
  stale?: boolean; // evidence may be stale according to source checks
  evidence_hash?: string; // uniq_hash for provenance
}

export interface RunDDIAgentOutput {
  overall_risk_level: 'low' | 'moderate' | 'high';
  per_pair_interactions: DDIInteraction[];
  notes?: string;
  confidence: ConfidenceLevel;
  confidence_reasons?: string[];
}

// ---------------------
// Data Quality Agent
// ---------------------

export interface RunDataQualityAgentInput {
  patient_id: string;
  demographics?: { age?: number; sex?: 'male' | 'female' | 'other' };
  comorbidities?: string[];
  labs?: {
    renal?: { egfr?: number; creatinine?: number; unit?: string; drawn_at?: string };
    hepatic?: { ast?: number; alt?: number; bilirubin?: number; unit?: string; drawn_at?: string };
  };
  medications?: MedicationInput[];
  allergies?: string[];
  pgx?: Record<string, unknown>;
}

export interface MissingField {
  field: string;
  reason_needed: string;
}

export interface RunDataQualityAgentOutput {
  status: 'sufficient' | 'insufficient';
  missing_fields: MissingField[];
  recommended_questions_for_clinician_or_patient: string[];
  impact_on_safety_assessment: string;
}

// ---------------------
// Evidence Agent
// ---------------------

export interface RunEvidenceAgentInput {
  drugs: string[];
  interaction_pair?: { a: string; b: string };
  biomarkers?: string[];
  disease_context?: string;
}

export interface DrugSummary {
  drug_name: string;
  indications: string[];
  major_warnings: string[];
  interaction_highlights: string[];
  dose_adjustments_in_renal_hepatic_impairment: string[];
  biomarker_links: string[];
}

export interface TrialSummary {
  nct_id: string;
  phase?: string;
  title: string;
  key_findings?: string;
  DDI_relevance?: string;
  citations?: Citation[];
}

export interface RunEvidenceAgentOutput {
  drug_summary: DrugSummary[];
  trials: TrialSummary[];
  citations: Citation[];
  confidence: ConfidenceLevel;
}

// ---------------------
// PGx Agent
// ---------------------

export interface PGxResult {
  gene: string;
  genotype?: string; // diplotype e.g. CYP2D6 *4/*4
  phenotype?: string; // e.g., "poor metabolizer"
}

export interface RunPGxAgentInput {
  patient_id: string;
  pgx_results: PGxResult[];
  medications: MedicationInput[];
}

export interface PerDrugPGxRecommendation {
  drug_name: string;
  gene: string;
  genotype?: string;
  phenotype?: string;
  recommendation: 'avoid' | 'adjust_dose' | 'use_alternative' | 'monitor' | 'no_action';
  rationale?: string;
  citations: Citation[];
}

export interface RunPGxAgentOutput {
  pgx_overview: { genes_evaluated: string[]; phenotypes: string[]; gaps: string[] };
  per_drug_recommendations: PerDrugPGxRecommendation[];
}

// ---------------------
// Agent Run Persistence Contracts
// ---------------------

export interface AgentRunRecord {
  id: string;
  patient_id: string;
  agent_type: AgentType;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  created_at: string;
}

export interface AgentContext {
  supabase?: any; // Supabase client in runtime
  logger?: { info: (...args: any[]) => void; warn: (...args: any[]) => void; error: (...args: any[]) => void };
}
