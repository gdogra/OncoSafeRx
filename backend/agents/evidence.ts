import {
  AgentContext,
  Citation,
  DrugSummary,
  RunEvidenceAgentInput,
  RunEvidenceAgentOutput,
} from './types.ts';

export async function runEvidenceAgent(
  input: RunEvidenceAgentInput,
  _ctx: AgentContext,
): Promise<RunEvidenceAgentOutput> {
  if (!input || !Array.isArray(input.drugs) || input.drugs.length === 0) {
    throw new Error('Invalid input: at least one drug is required');
  }

  // TODO: Integrate with FDA/DailyMed/Guidelines/ClinicalTrials APIs or cached mirror.
  // For now, return a structured placeholder with empty citations.
  const summaries: DrugSummary[] = input.drugs.map((drug) => ({
    drug_name: drug,
    indications: [],
    major_warnings: [],
    interaction_highlights: [],
    dose_adjustments_in_renal_hepatic_impairment: [],
    biomarker_links: [],
  }));

  const citations: Citation[] = [];

  return {
    drug_summary: summaries,
    trials: [],
    citations,
    confidence: 'low',
  };
}

