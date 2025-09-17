// High-impact alternatives for DDI/PGx pairs (MVP)
// Each rule targets a drug or pair and suggests an alternative with rationale.

export const ALTERNATIVE_RULES = [
  // PPI with clopidogrel (CYP2C19 inhibition)
  {
    match: { drugA: 'clopidogrel', drugB: 'omeprazole' },
    forDrug: 'omeprazole',
    suggestion: { name: 'pantoprazole', rxcui: null },
    rationale: 'Pantoprazole has minimal CYP2C19 inhibition and is preferred with clopidogrel.',
    citations: ['FDA', 'CPIC', 'Clinical guidance']
  },
  {
    match: { drugA: 'tamoxifen', drugB: 'fluoxetine' },
    forDrug: 'fluoxetine',
    suggestion: { name: 'venlafaxine', rxcui: null },
    rationale: 'Avoid strong CYP2D6 inhibitors with tamoxifen; consider venlafaxine.',
    citations: ['ASCO']
  },
  // Warfarin + ciprofloxacin
  {
    match: { drugA: 'warfarin', drugB: 'ciprofloxacin' },
    forDrug: 'ciprofloxacin',
    suggestion: { name: 'alternative antibiotic per indication', rxcui: null },
    rationale: 'Fluoroquinolones can elevate INR; consider non-interacting alternative and monitor.',
    citations: ['Clinical guidance']
  },
  // Methotrexate + TMP/SMX
  {
    match: { drugA: 'methotrexate', drugB: 'trimethoprim' },
    forDrug: 'trimethoprim',
    suggestion: { name: 'alternative antibiotic (avoid TMP/SMX)', rxcui: null },
    rationale: 'Additive antifolate effects and clearance issues; avoid TMP/SMX when possible.',
    citations: ['Clinical guidance']
  },
  {
    match: { drugA: 'methotrexate', drugB: 'sulfamethoxazole' },
    forDrug: 'sulfamethoxazole',
    suggestion: { name: 'alternative antibiotic (avoid TMP/SMX)', rxcui: null },
    rationale: 'Avoid sulfamethoxazole with MTX; increased myelosuppression risk.',
    citations: ['Clinical guidance']
  },
  // Irinotecan + ketoconazole
  {
    match: { drugA: 'irinotecan', drugB: 'ketoconazole' },
    forDrug: 'ketoconazole',
    suggestion: { name: 'fluconazole (evaluate interaction) or echinocandin', rxcui: null },
    rationale: 'Strong CYP3A4 inhibition raises SN-38; avoid strong inhibitors.',
    citations: ['FDA label']
  },
  {
    match: { drugA: 'clopidogrel', drugB: 'esomeprazole' },
    forDrug: 'esomeprazole',
    suggestion: { name: 'pantoprazole', rxcui: null },
    rationale: 'Pantoprazole preferred to avoid reduced clopidogrel activation.',
    citations: ['FDA', 'CPIC']
  },
  // Tamoxifen with strong CYP2D6 inhibitors
  {
    match: { drugA: 'tamoxifen', drugB: 'paroxetine' },
    forDrug: 'paroxetine',
    suggestion: { name: 'venlafaxine', rxcui: null },
    rationale: 'Avoid strong CYP2D6 inhibitors; consider venlafaxine for hot flashes/depression.',
    citations: ['ASCO', 'Clinical guidance']
  },
  // Opioids dependent on CYP2D6 activation
  {
    match: { drugA: 'codeine', drugB: 'fluoxetine' },
    forDrug: 'codeine',
    suggestion: { name: 'morphine', rxcui: null },
    rationale: 'Fluoxetine inhibits CYP2D6; use non–CYP2D6-dependent opioid like morphine.',
    citations: ['CPIC']
  },
  {
    match: { drugA: 'tramadol', drugB: 'fluoxetine' },
    forDrug: 'tramadol',
    suggestion: { name: 'morphine', rxcui: null },
    rationale: 'Serotonergic toxicity risk and reduced activation; prefer non-serotonergic opioid.',
    citations: ['CPIC']
  },
  // Warfarin interacting antibiotics/antifungals
  {
    match: { drugA: 'warfarin', drugB: 'fluconazole' },
    forDrug: 'fluconazole',
    suggestion: { name: 'echinocandin (e.g., micafungin)', rxcui: null },
    rationale: 'Avoid potent CYP2C9 inhibitors; if antifungal needed, consider non-azole when appropriate.',
    citations: ['Clinical guidance']
  },
  {
    match: { drugA: 'warfarin', drugB: 'metronidazole' },
    forDrug: 'metronidazole',
    suggestion: { name: 'alternative antibiotic per indication', rxcui: null },
    rationale: 'Metronidazole increases INR; consider non-interacting agents and close INR monitoring.',
    citations: ['Clinical guidance']
  }
];

export default ALTERNATIVE_RULES;
