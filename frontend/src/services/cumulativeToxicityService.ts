/**
 * Cumulative Toxicity Analysis Service
 * Ported from src/services/regimenInteractionService.js for client-side use.
 * Analyzes 7 toxicity domains across all drugs in a patient's regimen.
 */

export interface ToxicityDomain {
  key: string
  label: string
  drugs: string[]
  severity: 'high' | 'moderate'
  monitoring: string
}

export interface ToxicityResult {
  domain: string
  label: string
  severity: 'high' | 'moderate'
  matchingDrugs: string[]
  count: number
  risk: 'critical' | 'high' | 'moderate' | 'low' | 'none'
  monitoring: string
  color: string
}

const TOXICITY_DOMAINS: ToxicityDomain[] = [
  {
    key: 'nephrotoxicity', label: 'Nephrotoxicity', severity: 'high',
    drugs: ['cisplatin', 'carboplatin', 'methotrexate', 'ifosfamide', 'pemetrexed', 'zoledronic acid', 'ibuprofen', 'naproxen', 'celecoxib', 'ketorolac', 'vancomycin', 'gentamicin', 'amphotericin b', 'tenofovir', 'lisinopril', 'enalapril', 'losartan', 'cyclosporine', 'tacrolimus'],
    monitoring: 'Monitor SCr, BUN, GFR before each cycle. Hold nephrotoxic agents if GFR <60.',
  },
  {
    key: 'hepatotoxicity', label: 'Hepatotoxicity', severity: 'high',
    drugs: ['methotrexate', 'gemcitabine', 'irinotecan', 'temozolomide', 'acetaminophen', 'imatinib', 'crizotinib', 'pazopanib', 'regorafenib', 'nivolumab', 'pembrolizumab', 'ipilimumab', 'isoniazid', 'rifampin', 'ketoconazole', 'valproic acid', 'atorvastatin', 'amiodarone'],
    monitoring: 'Monitor LFTs before each cycle. Hold hepatotoxic agents if ALT/AST >5x ULN.',
  },
  {
    key: 'myelosuppression', label: 'Myelosuppression', severity: 'high',
    drugs: ['cyclophosphamide', 'doxorubicin', 'cisplatin', 'carboplatin', 'etoposide', 'paclitaxel', 'docetaxel', 'gemcitabine', 'irinotecan', 'fluorouracil', 'capecitabine', 'pemetrexed', 'temozolomide', 'methotrexate', 'vinblastine', 'vincristine', 'topotecan', 'oxaliplatin'],
    monitoring: 'CBC with differential before each cycle. Dose-reduce or delay for Grade 3-4 cytopenias.',
  },
  {
    key: 'cardiotoxicity', label: 'Cardiotoxicity', severity: 'high',
    drugs: ['doxorubicin', 'epirubicin', 'trastuzumab', 'pertuzumab', 'sunitinib', 'sorafenib', 'bevacizumab', 'fluorouracil', 'capecitabine', 'cyclophosphamide', 'osimertinib', 'ribociclib', 'nilotinib', 'dasatinib', 'ponatinib'],
    monitoring: 'Baseline and periodic LVEF monitoring (echo or MUGA). Hold if LVEF drops >10% or below 50%.',
  },
  {
    key: 'qtProlongation', label: 'QT Prolongation', severity: 'moderate',
    drugs: ['arsenic trioxide', 'vandetanib', 'sunitinib', 'sorafenib', 'nilotinib', 'crizotinib', 'ribociclib', 'osimertinib', 'ondansetron', 'granisetron', 'haloperidol', 'methadone', 'ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'azithromycin', 'fluconazole', 'amiodarone'],
    monitoring: 'Baseline ECG; repeat if >=2 QT-prolonging drugs. Hold if QTc >500ms. Correct electrolytes.',
  },
  {
    key: 'neurotoxicity', label: 'Peripheral Neuropathy', severity: 'moderate',
    drugs: ['vincristine', 'paclitaxel', 'docetaxel', 'oxaliplatin', 'cisplatin', 'bortezomib', 'thalidomide', 'lenalidomide', 'eribulin'],
    monitoring: 'Assess neuropathy grade at each visit. Dose-reduce for Grade 2, hold for Grade 3.',
  },
  {
    key: 'pulmonaryToxicity', label: 'Pulmonary Toxicity', severity: 'high',
    drugs: ['bleomycin', 'busulfan', 'methotrexate', 'gemcitabine', 'nivolumab', 'pembrolizumab', 'atezolizumab', 'everolimus', 'temsirolimus'],
    monitoring: 'Baseline PFTs for bleomycin. Monitor for cough, dyspnea. Hold immunotherapy for Grade 2+ pneumonitis.',
  },
]

/**
 * Analyze cumulative toxicity across all drugs
 */
export function analyzeCumulativeToxicity(drugs: string[]): ToxicityResult[] {
  const drugsLower = drugs.map(d => d.toLowerCase())

  return TOXICITY_DOMAINS.map(domain => {
    const matchingDrugs = drugsLower.filter(d => domain.drugs.includes(d))
    const count = matchingDrugs.length

    let risk: ToxicityResult['risk']
    let color: string
    if (count >= 3) { risk = 'critical'; color = 'bg-red-500' }
    else if (count === 2) { risk = 'high'; color = 'bg-orange-500' }
    else if (count === 1) { risk = 'moderate'; color = 'bg-amber-400' }
    else { risk = 'none'; color = 'bg-gray-200 dark:bg-gray-700' }

    return {
      domain: domain.key,
      label: domain.label,
      severity: domain.severity,
      matchingDrugs: matchingDrugs.map(d => drugs.find(orig => orig.toLowerCase() === d) || d),
      count,
      risk,
      monitoring: domain.monitoring,
      color,
    }
  })
}

/**
 * Get overall risk level based on cumulative toxicity results
 */
export function getOverallToxicityRisk(results: ToxicityResult[]): 'critical' | 'high' | 'moderate' | 'low' {
  const critCount = results.filter(r => r.risk === 'critical').length
  const highCount = results.filter(r => r.risk === 'high').length
  if (critCount > 0) return 'critical'
  if (highCount >= 2) return 'high'
  if (highCount >= 1) return 'moderate'
  return 'low'
}

export { TOXICITY_DOMAINS }
