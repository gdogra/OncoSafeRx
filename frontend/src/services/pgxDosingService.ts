/**
 * Pharmacogenomic Dosing Calculator
 * Calculates exact dose adjustments based on CPIC guidelines.
 */

export interface DosingResult {
  gene: string
  phenotype: string
  drug: string
  standardDose: number         // mg/m2 or mg
  adjustedDose: number
  reductionPercent: number     // 0-100
  unit: string
  rationale: string
  monitoring: string[]
  evidenceLevel: string
  sources: string[]
  isContraindicated: boolean
}

interface CpicGuideline {
  gene_symbol: string
  drug: { name: string; generic_name: string }
  phenotype: string
  recommendation: string
  evidence_level: string
  dosage_adjustment: string
  implications: string
  sources: string[]
}

// Key CPIC dosing rules for oncology-critical genes
const DOSING_RULES: {
  gene: string
  drug: string
  phenotype: string
  reductionPct: number
  contraindicated: boolean
  monitoring: string[]
  evidenceLevel: string
}[] = [
  // DPYD — Fluoropyrimidines
  { gene: 'DPYD', drug: 'fluorouracil', phenotype: 'Poor Metabolizer', reductionPct: 100, contraindicated: true, monitoring: ['Avoid 5-FU entirely if possible', 'If essential: reduce dose >=50% with early TDM'], evidenceLevel: 'A' },
  { gene: 'DPYD', drug: 'fluorouracil', phenotype: 'Intermediate Metabolizer', reductionPct: 50, contraindicated: false, monitoring: ['Monitor for mucositis, diarrhea, neutropenia', 'Consider TDM at cycle 1', 'CBC before each cycle'], evidenceLevel: 'A' },
  { gene: 'DPYD', drug: 'capecitabine', phenotype: 'Poor Metabolizer', reductionPct: 100, contraindicated: true, monitoring: ['Avoid capecitabine entirely if possible', 'Consider alternative regimen'], evidenceLevel: 'A' },
  { gene: 'DPYD', drug: 'capecitabine', phenotype: 'Intermediate Metabolizer', reductionPct: 50, contraindicated: false, monitoring: ['Hand-foot syndrome monitoring', 'CBC weekly for first cycle', 'GI toxicity assessment'], evidenceLevel: 'A' },

  // UGT1A1 — Irinotecan
  { gene: 'UGT1A1', drug: 'irinotecan', phenotype: 'Poor Metabolizer (*28/*28)', reductionPct: 30, contraindicated: false, monitoring: ['Reduce by at least one dose level', 'Monitor for severe diarrhea and neutropenia', 'CBC twice weekly during first cycle'], evidenceLevel: 'A' },
  { gene: 'UGT1A1', drug: 'irinotecan', phenotype: 'Intermediate Metabolizer (*1/*28)', reductionPct: 0, contraindicated: false, monitoring: ['Standard dose for FOLFIRI', 'Consider reduction for single-agent high-dose (>=250 mg/m2)', 'Monitor for diarrhea'], evidenceLevel: 'A' },

  // TPMT — Thiopurines
  { gene: 'TPMT', drug: 'mercaptopurine', phenotype: 'Poor Metabolizer', reductionPct: 90, contraindicated: false, monitoring: ['10% of standard dose, 3x/week instead of daily', 'CBC weekly for 8 weeks then monthly', 'TPMT activity level confirmation'], evidenceLevel: 'A' },
  { gene: 'TPMT', drug: 'mercaptopurine', phenotype: 'Intermediate Metabolizer', reductionPct: 50, contraindicated: false, monitoring: ['Start at 30-70% of standard dose', 'Adjust based on myelosuppression', 'CBC every 2 weeks initially'], evidenceLevel: 'A' },

  // NUDT15 — Thiopurines (East Asian populations)
  { gene: 'NUDT15', drug: 'mercaptopurine', phenotype: 'Poor Metabolizer', reductionPct: 90, contraindicated: false, monitoring: ['10% of standard dose', 'Especially important in East Asian patients', 'CBC weekly initially'], evidenceLevel: 'A' },

  // CYP2D6 — Tamoxifen
  { gene: 'CYP2D6', drug: 'tamoxifen', phenotype: 'Poor Metabolizer', reductionPct: 0, contraindicated: false, monitoring: ['Consider aromatase inhibitor + ovarian suppression if premenopausal', 'Or increase tamoxifen to 40mg/day', 'Endoxifen level monitoring if available'], evidenceLevel: 'A' },
  { gene: 'CYP2D6', drug: 'tamoxifen', phenotype: 'Intermediate Metabolizer', reductionPct: 0, contraindicated: false, monitoring: ['Consider higher dose (40mg) or alternative endocrine therapy', 'Monitor endoxifen levels'], evidenceLevel: 'A' },

  // CYP2D6 — Opioids
  { gene: 'CYP2D6', drug: 'codeine', phenotype: 'Poor Metabolizer', reductionPct: 100, contraindicated: true, monitoring: ['Use non-CYP2D6 opioid: morphine, hydromorphone, fentanyl'], evidenceLevel: 'A' },
  { gene: 'CYP2D6', drug: 'codeine', phenotype: 'Ultrarapid Metabolizer', reductionPct: 100, contraindicated: true, monitoring: ['CONTRAINDICATED — rapid conversion causes respiratory depression', 'Use morphine or hydromorphone instead'], evidenceLevel: 'A' },
  { gene: 'CYP2D6', drug: 'tramadol', phenotype: 'Poor Metabolizer', reductionPct: 100, contraindicated: true, monitoring: ['Use non-CYP2D6 opioid'], evidenceLevel: 'A' },
]

/**
 * Calculate adjusted dose based on PGx profile
 */
export function calculateDose(
  gene: string,
  phenotype: string,
  drug: string,
  standardDose: number,
  bsa: number = 1.7, // default BSA
  unit: string = 'mg/m2'
): DosingResult | null {
  const geneLower = gene.toLowerCase()
  const drugLower = drug.toLowerCase()
  const phenoLower = phenotype.toLowerCase()

  const rule = DOSING_RULES.find(r =>
    r.gene.toLowerCase() === geneLower &&
    r.drug.toLowerCase() === drugLower &&
    r.phenotype.toLowerCase().includes(phenoLower.split(' ')[0]) // match "poor" in "Poor Metabolizer"
  )

  if (!rule) return null

  const totalStandardDose = unit === 'mg/m2' ? standardDose * bsa : standardDose
  const reductionPct = rule.reductionPct
  const adjustedDose = rule.contraindicated ? 0 : Math.round(totalStandardDose * (1 - reductionPct / 100) * 100) / 100

  return {
    gene,
    phenotype,
    drug,
    standardDose: Math.round(totalStandardDose * 100) / 100,
    adjustedDose,
    reductionPercent: reductionPct,
    unit: unit === 'mg/m2' ? 'mg (total)' : unit,
    rationale: rule.contraindicated
      ? `${gene} ${phenotype}: Drug is contraindicated. Consider alternative therapy.`
      : `${gene} ${phenotype}: Reduce dose by ${reductionPct}% (${standardDose} ${unit} x ${bsa} BSA = ${totalStandardDose}mg standard → ${adjustedDose}mg adjusted)`,
    monitoring: rule.monitoring,
    evidenceLevel: rule.evidenceLevel,
    sources: ['CPIC Guidelines', 'FDA Label'],
    isContraindicated: rule.contraindicated,
  }
}

/**
 * Get all available gene-drug pairs for the calculator UI
 */
export function getAvailableGeneDrugPairs(): { gene: string; drug: string; phenotypes: string[] }[] {
  const map = new Map<string, Set<string>>()
  for (const rule of DOSING_RULES) {
    const key = `${rule.gene}|${rule.drug}`
    if (!map.has(key)) map.set(key, new Set())
    map.get(key)!.add(rule.phenotype)
  }
  return Array.from(map.entries()).map(([key, phenotypes]) => {
    const [gene, drug] = key.split('|')
    return { gene, drug, phenotypes: Array.from(phenotypes) }
  })
}
