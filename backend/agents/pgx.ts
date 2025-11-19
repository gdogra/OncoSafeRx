import {
  AgentContext,
  PerDrugPGxRecommendation,
  PGxResult,
  RunPGxAgentInput,
  RunPGxAgentOutput,
} from './types.ts';

// Placeholder PGx rule mapping: gene -> phenotype lookup
function mapGenotypeToPhenotype(result: PGxResult): PGxResult {
  // TODO: Integrate CPIC/PharmGKB ruleset snapshot
  if (!result.phenotype && result.gene.toUpperCase() === 'CYP2D6' && result.genotype?.includes('*4')) {
    return { ...result, phenotype: 'poor metabolizer' };
  }
  return result;
}

export async function runPGxAgent(input: RunPGxAgentInput, _ctx: AgentContext): Promise<RunPGxAgentOutput> {
  if (!input || !input.patient_id || !Array.isArray(input.pgx_results) || !Array.isArray(input.medications)) {
    throw new Error('Invalid input: patient_id, pgx_results, and medications are required');
  }

  const mapped = input.pgx_results.map(mapGenotypeToPhenotype);

  // Identify drugs with actionable PGx considerations (placeholder logic)
  const recommendations: PerDrugPGxRecommendation[] = [];
  for (const med of input.medications) {
    for (const r of mapped) {
      if (r.gene.toUpperCase() === 'CYP2D6' && (r.phenotype === 'poor metabolizer' || r.phenotype === 'intermediate metabolizer')) {
        // Example: avoid codeine/tramadol in CYP2D6 poor metabolizers
        const dn = med.drug_name.toLowerCase();
        if (['codeine', 'tramadol'].includes(dn)) {
          recommendations.push({
            drug_name: med.drug_name,
            gene: r.gene,
            genotype: r.genotype,
            phenotype: r.phenotype,
            recommendation: 'avoid',
            rationale: 'Reduced conversion to active metabolite in CYP2D6 poor metabolizers; risk of inadequate analgesia.',
            citations: [
              {
                source_type: 'guideline',
                id: 'CPIC-CYP2D6-Codeine',
                url: 'https://cpicpgx.org/guidelines/guideline-for-codeine-and-cyp2d6/',
                snippet: 'Avoid codeine in CYP2D6 poor metabolizers.',
              },
            ],
          });
        }
      }
    }
  }

  return {
    pgx_overview: {
      genes_evaluated: mapped.map((m) => m.gene),
      phenotypes: Array.from(new Set(mapped.map((m) => m.phenotype).filter(Boolean))) as string[],
      gaps: mapped.filter((m) => !m.phenotype).map((m) => `${m.gene}: phenotype unknown`),
    },
    per_drug_recommendations: recommendations,
  };
}

