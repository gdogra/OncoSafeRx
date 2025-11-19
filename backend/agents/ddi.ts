import {
  AgentContext,
  Citation,
  DDIInteraction,
  EvidenceLevel,
  NormalizedMedication,
  RunDDIAgentInput,
  RunDDIAgentOutput,
  Severity,
} from './types.ts';

// Normalize medications via internal alias table (drug_aliases); fallback to trimmed lowercased name.
async function normalizeMedications(
  meds: RunDDIAgentInput['medications'],
  ctx: AgentContext,
): Promise<NormalizedMedication[]> {
  const supabase = ctx.supabase;
  const results: NormalizedMedication[] = [];
  for (const m of meds) {
    const raw = (m.drug_name || '').trim();
    const q = raw.toLowerCase();
    let normalized_drug_name: string | undefined;
    let rxnorm_concept_id: string | undefined;

    if (supabase) {
      try {
        // Try exact name match (case-insensitive) on alias name
        let resp = await supabase
          .from('drug_aliases')
          .select('canonical_name, rxnorm_concept_id')
          .ilike('name', q)
          .limit(1);
        if (!resp.error && resp.data && resp.data.length > 0) {
          normalized_drug_name = resp.data[0].canonical_name;
          rxnorm_concept_id = resp.data[0].rxnorm_concept_id || undefined;
        } else {
          // Try canonical_name direct match
          resp = await supabase
            .from('drug_aliases')
            .select('canonical_name, rxnorm_concept_id')
            .ilike('canonical_name', q)
            .limit(1);
          if (!resp.error && resp.data && resp.data.length > 0) {
            normalized_drug_name = resp.data[0].canonical_name;
            rxnorm_concept_id = resp.data[0].rxnorm_concept_id || undefined;
          }
        }
      } catch (_e) {
        // ignore
      }
    }

    results.push({
      ...m,
      normalized_drug_name: normalized_drug_name || q,
      rxnorm_concept_id,
    });
  }
  return results;
}

// Placeholder: compute pairwise combinations
function getPairs(meds: NormalizedMedication[]) {
  const pairs: [NormalizedMedication, NormalizedMedication][] = [];
  for (let i = 0; i < meds.length; i++) {
    for (let j = i + 1; j < meds.length; j++) {
      pairs.push([meds[i], meds[j]]);
    }
  }
  return pairs;
}

// Query cached ddi_evidence by normalized names or rxnorm ids if available
async function lookupDDIEvidence(
  ctx: AgentContext,
  a: NormalizedMedication,
  b: NormalizedMedication,
): Promise<DDIInteraction | null> {
  try {
    const supabase = ctx.supabase;
    if (!supabase) return null;

    // Helper to map a row into DDIInteraction
    const toInteraction = (row: any, aDrug: NormalizedMedication, bDrug: NormalizedMedication): DDIInteraction => ({
      primary_drug: aDrug.normalized_drug_name || aDrug.drug_name,
      interacting_drug: bDrug.normalized_drug_name || bDrug.drug_name,
      rxnorm_primary: aDrug.rxnorm_concept_id,
      rxnorm_interactor: bDrug.rxnorm_concept_id,
      severity: row.severity as Severity,
      mechanism: row.mechanism || undefined,
      recommendation: row.recommendation || undefined,
      evidence_level: (row.evidence_level || 'unknown') as EvidenceLevel,
      citations: (row.citations || []) as Citation[],
    });

    // Try by rxnorm ids first (both orders)
    if (a.rxnorm_concept_id && b.rxnorm_concept_id) {
      let q = await supabase
        .from('ddi_evidence')
        .select('*')
        .eq('drug_primary', a.rxnorm_concept_id)
        .eq('drug_interactor', b.rxnorm_concept_id)
        .limit(1);
      if (!q.error && q.data && q.data.length > 0) return toInteraction(q.data[0], a, b);

      q = await supabase
        .from('ddi_evidence')
        .select('*')
        .eq('drug_primary', b.rxnorm_concept_id)
        .eq('drug_interactor', a.rxnorm_concept_id)
        .limit(1);
      if (!q.error && q.data && q.data.length > 0) return toInteraction(q.data[0], a, b);
    }

    // Fallback by normalized name (both orders)
    let qn = await supabase
      .from('ddi_evidence')
      .select('*')
      .eq('drug_primary', a.normalized_drug_name)
      .eq('drug_interactor', b.normalized_drug_name)
      .limit(1);
    if (!qn.error && qn.data && qn.data.length > 0) return toInteraction(qn.data[0], a, b);

    qn = await supabase
      .from('ddi_evidence')
      .select('*')
      .eq('drug_primary', b.normalized_drug_name)
      .eq('drug_interactor', a.normalized_drug_name)
      .limit(1);
    if (!qn.error && qn.data && qn.data.length > 0) return toInteraction(qn.data[0], a, b);

    return null;
  } catch (_e) {
    return null;
  }
}

export async function runDDIAgent(input: RunDDIAgentInput, ctx: AgentContext): Promise<RunDDIAgentOutput> {
  // Basic validation
  if (!input || !input.patient_id || !Array.isArray(input.medications)) {
    throw new Error('Invalid input: patient_id and medications are required');
  }

  const normalized = await normalizeMedications(input.medications, ctx);
  const pairs = getPairs(normalized);

  const interactions: DDIInteraction[] = [];

  for (const [a, b] of pairs) {
    // 1) Try cache
    const cached = await lookupDDIEvidence(ctx, a, b);
    if (cached) {
      interactions.push(cached);
      continue;
    }

    // 2) TODO: Query external sources (labels/guidelines) if allowed and cache results
    // For now, return no interaction when unknown. Never fabricate IDs.
  }

  // Aggregate risk
  const worst = interactions.reduce<Severity | null>((acc, i) => {
    const order: Severity[] = ['minor', 'moderate', 'major', 'contraindicated'];
    if (!acc) return i.severity;
    return order.indexOf(i.severity) > order.indexOf(acc) ? i.severity : acc;
  }, null);

  const risk: RunDDIAgentOutput['overall_risk_level'] = (() => {
    if (!worst) return 'low';
    if (worst === 'major' || worst === 'contraindicated') return 'high';
    if (worst === 'moderate') return 'moderate';
    return 'low';
  })();

  const notes =
    interactions.length === 0
      ? 'No interactions found in cache; additional evidence retrieval may be required.'
      : 'Review flagged interactions. Prefer label/guideline-backed recommendations.';

  const confidence: RunDDIAgentOutput['confidence'] = interactions.length > 0 ? 'medium' : 'low';

  return {
    overall_risk_level: risk,
    per_pair_interactions: interactions,
    notes,
    confidence,
    confidence_reasons: interactions.length > 0 ? ['Contains cached evidence'] : ['No cached evidence found'],
  };
}
