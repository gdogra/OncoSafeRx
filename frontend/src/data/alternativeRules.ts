/**
 * Curated drug alternative rules for high-impact DDI/PGx pairs.
 * Ported from src/data/alternatives.js for client-side use.
 */

export interface AlternativeRule {
  match: { drugA: string; drugB: string }
  forDrug: string
  suggestion: { name: string; rxcui: string | null }
  rationale: string
  citations: string[]
}

export const ALTERNATIVE_RULES: AlternativeRule[] = [
  { match: { drugA: 'clopidogrel', drugB: 'omeprazole' }, forDrug: 'omeprazole', suggestion: { name: 'pantoprazole', rxcui: null }, rationale: 'Pantoprazole has minimal CYP2C19 inhibition and is preferred with clopidogrel.', citations: ['FDA', 'CPIC', 'Clinical guidance'] },
  { match: { drugA: 'tamoxifen', drugB: 'fluoxetine' }, forDrug: 'fluoxetine', suggestion: { name: 'venlafaxine', rxcui: null }, rationale: 'Avoid strong CYP2D6 inhibitors with tamoxifen; consider venlafaxine.', citations: ['ASCO'] },
  { match: { drugA: 'warfarin', drugB: 'ciprofloxacin' }, forDrug: 'ciprofloxacin', suggestion: { name: 'alternative antibiotic per indication', rxcui: null }, rationale: 'Fluoroquinolones can elevate INR; consider non-interacting alternative and monitor.', citations: ['Clinical guidance'] },
  { match: { drugA: 'methotrexate', drugB: 'trimethoprim' }, forDrug: 'trimethoprim', suggestion: { name: 'alternative antibiotic (avoid TMP/SMX)', rxcui: null }, rationale: 'Additive antifolate effects and clearance issues; avoid TMP/SMX when possible.', citations: ['Clinical guidance'] },
  { match: { drugA: 'methotrexate', drugB: 'sulfamethoxazole' }, forDrug: 'sulfamethoxazole', suggestion: { name: 'alternative antibiotic (avoid TMP/SMX)', rxcui: null }, rationale: 'Avoid sulfamethoxazole with MTX; increased myelosuppression risk.', citations: ['Clinical guidance'] },
  { match: { drugA: 'irinotecan', drugB: 'ketoconazole' }, forDrug: 'ketoconazole', suggestion: { name: 'fluconazole or echinocandin', rxcui: null }, rationale: 'Strong CYP3A4 inhibition raises SN-38; avoid strong inhibitors.', citations: ['FDA label'] },
  { match: { drugA: 'clopidogrel', drugB: 'esomeprazole' }, forDrug: 'esomeprazole', suggestion: { name: 'pantoprazole', rxcui: null }, rationale: 'Pantoprazole preferred to avoid reduced clopidogrel activation.', citations: ['FDA', 'CPIC'] },
  { match: { drugA: 'tamoxifen', drugB: 'paroxetine' }, forDrug: 'paroxetine', suggestion: { name: 'venlafaxine', rxcui: null }, rationale: 'Avoid strong CYP2D6 inhibitors; consider venlafaxine for hot flashes/depression.', citations: ['ASCO', 'Clinical guidance'] },
  { match: { drugA: 'codeine', drugB: 'fluoxetine' }, forDrug: 'codeine', suggestion: { name: 'morphine', rxcui: null }, rationale: 'Fluoxetine inhibits CYP2D6; use non-CYP2D6-dependent opioid like morphine.', citations: ['CPIC'] },
  { match: { drugA: 'tramadol', drugB: 'fluoxetine' }, forDrug: 'tramadol', suggestion: { name: 'morphine', rxcui: null }, rationale: 'Serotonergic toxicity risk and reduced activation; prefer non-serotonergic opioid.', citations: ['CPIC'] },
  { match: { drugA: 'warfarin', drugB: 'fluconazole' }, forDrug: 'fluconazole', suggestion: { name: 'echinocandin (e.g., micafungin)', rxcui: null }, rationale: 'Avoid potent CYP2C9 inhibitors; if antifungal needed, consider non-azole.', citations: ['Clinical guidance'] },
  { match: { drugA: 'warfarin', drugB: 'metronidazole' }, forDrug: 'metronidazole', suggestion: { name: 'alternative antibiotic per indication', rxcui: null }, rationale: 'Metronidazole increases INR; consider non-interacting agents.', citations: ['Clinical guidance'] },
]
