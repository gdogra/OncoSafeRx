/**
 * Monitoring Schedule Generator
 * Creates a tailored lab/imaging monitoring timeline based on
 * drug regimen, toxicity risks, and interactions.
 */

import { type ToxicityResult } from './cumulativeToxicityService'

export interface MonitoringItem {
  parameter: string
  frequency: 'baseline' | 'each_cycle' | 'weekly' | 'biweekly' | 'monthly' | 'prn'
  rationale: string
  relatedDrugs: string[]
  alertThreshold?: string
  priority: 'critical' | 'routine' | 'optional'
}

export interface MonitoringSchedule {
  baseline: MonitoringItem[]
  eachCycle: MonitoringItem[]
  weekly: MonitoringItem[]
  monthly: MonitoringItem[]
  prn: MonitoringItem[]
}

// Drug-specific monitoring requirements
const DRUG_MONITORING: Record<string, MonitoringItem[]> = {
  doxorubicin: [
    { parameter: 'LVEF (Echo/MUGA)', frequency: 'baseline', rationale: 'Anthracycline cardiotoxicity', relatedDrugs: ['doxorubicin'], alertThreshold: 'LVEF <50% or drop >10%', priority: 'critical' },
    { parameter: 'LVEF (Echo/MUGA)', frequency: 'each_cycle', rationale: 'Cumulative cardiotoxicity monitoring (max 450 mg/m2)', relatedDrugs: ['doxorubicin'], alertThreshold: 'LVEF <50%', priority: 'critical' },
  ],
  cisplatin: [
    { parameter: 'Creatinine/GFR', frequency: 'each_cycle', rationale: 'Cisplatin nephrotoxicity', relatedDrugs: ['cisplatin'], alertThreshold: 'GFR <60 mL/min', priority: 'critical' },
    { parameter: 'Electrolytes (Mg2+, K+)', frequency: 'each_cycle', rationale: 'Cisplatin causes renal magnesium wasting', relatedDrugs: ['cisplatin'], alertThreshold: 'Mg2+ <1.5 mg/dL', priority: 'critical' },
    { parameter: 'Audiometry', frequency: 'baseline', rationale: 'Cisplatin ototoxicity', relatedDrugs: ['cisplatin'], priority: 'routine' },
  ],
  bleomycin: [
    { parameter: 'PFTs (DLCO)', frequency: 'baseline', rationale: 'Bleomycin pulmonary toxicity', relatedDrugs: ['bleomycin'], alertThreshold: 'DLCO <60% predicted', priority: 'critical' },
    { parameter: 'PFTs (DLCO)', frequency: 'each_cycle', rationale: 'Cumulative pulmonary fibrosis risk (max 400 units)', relatedDrugs: ['bleomycin'], alertThreshold: 'DLCO decrease >15%', priority: 'critical' },
  ],
  trastuzumab: [
    { parameter: 'LVEF (Echo/MUGA)', frequency: 'each_cycle', rationale: 'Trastuzumab cardiotoxicity (reversible)', relatedDrugs: ['trastuzumab'], alertThreshold: 'LVEF <50% or drop >16%', priority: 'critical' },
  ],
  imatinib: [
    { parameter: 'CBC with differential', frequency: 'weekly', rationale: 'Imatinib myelosuppression (first 2 months)', relatedDrugs: ['imatinib'], priority: 'routine' },
    { parameter: 'LFTs', frequency: 'monthly', rationale: 'Imatinib hepatotoxicity', relatedDrugs: ['imatinib'], alertThreshold: 'ALT/AST >5x ULN', priority: 'routine' },
  ],
  warfarin: [
    { parameter: 'INR', frequency: 'weekly', rationale: 'Warfarin anticoagulation monitoring', relatedDrugs: ['warfarin'], alertThreshold: 'INR >4.0 or <1.5', priority: 'critical' },
  ],
}

/**
 * Generate a complete monitoring schedule
 */
export function generateMonitoringSchedule(
  drugs: string[],
  toxicityResults: ToxicityResult[],
  interactions: { drugs?: string[]; mechanism?: string }[] = []
): MonitoringSchedule {
  const items: MonitoringItem[] = []
  const seen = new Set<string>() // deduplicate by parameter+frequency

  // 1. Drug-specific monitoring
  for (const drug of drugs) {
    const monitoring = DRUG_MONITORING[drug.toLowerCase()]
    if (monitoring) {
      for (const item of monitoring) {
        const key = `${item.parameter}|${item.frequency}`
        if (!seen.has(key)) {
          seen.add(key)
          items.push({ ...item })
        } else {
          // Merge related drugs
          const existing = items.find(i => `${i.parameter}|${i.frequency}` === key)
          if (existing && !existing.relatedDrugs.includes(drug)) {
            existing.relatedDrugs.push(drug)
          }
        }
      }
    }
  }

  // 2. Toxicity domain-based monitoring (from cumulative analysis)
  for (const tox of toxicityResults) {
    if (tox.count === 0) continue

    const monitoringMap: Record<string, { param: string; threshold?: string }> = {
      nephrotoxicity: { param: 'Creatinine/BUN/GFR', threshold: 'GFR <60' },
      hepatotoxicity: { param: 'LFTs (ALT, AST, Bilirubin)', threshold: 'ALT/AST >5x ULN' },
      myelosuppression: { param: 'CBC with differential', threshold: 'ANC <1000, Platelets <75K' },
      cardiotoxicity: { param: 'LVEF (Echo/MUGA)', threshold: 'LVEF <50%' },
      qtProlongation: { param: 'ECG (QTc interval)', threshold: 'QTc >500ms' },
      neurotoxicity: { param: 'Neuropathy assessment (NCI-CTCAE)', threshold: 'Grade 2+' },
      pulmonaryToxicity: { param: 'PFTs or chest imaging', threshold: 'DLCO decline >15%' },
    }

    const monitor = monitoringMap[tox.domain]
    if (monitor) {
      const freq = tox.count >= 3 ? 'each_cycle' : 'biweekly'
      const key = `${monitor.param}|${freq}`
      if (!seen.has(key)) {
        seen.add(key)
        items.push({
          parameter: monitor.param,
          frequency: freq,
          rationale: `${tox.label} risk — ${tox.count} contributing agent(s)`,
          relatedDrugs: tox.matchingDrugs,
          alertThreshold: monitor.threshold,
          priority: tox.count >= 3 ? 'critical' : 'routine',
        })
      }
    }
  }

  // 3. Interaction-driven monitoring
  for (const ix of interactions) {
    const mech = (ix.mechanism || '').toLowerCase()
    if (mech.includes('qt prolongation') || mech.includes('torsade')) {
      const key = 'ECG (QTc)|each_cycle'
      if (!seen.has(key)) {
        seen.add(key)
        items.push({
          parameter: 'ECG (QTc interval)',
          frequency: 'each_cycle',
          rationale: 'Drug interaction with additive QT prolongation risk',
          relatedDrugs: ix.drugs || [],
          alertThreshold: 'QTc >500ms',
          priority: 'critical',
        })
      }
    }
    if (mech.includes('inr') || mech.includes('bleeding') || mech.includes('anticoag')) {
      const key = 'INR|weekly'
      if (!seen.has(key)) {
        seen.add(key)
        items.push({
          parameter: 'INR',
          frequency: 'weekly',
          rationale: 'Drug interaction affecting anticoagulation',
          relatedDrugs: ix.drugs || [],
          alertThreshold: 'INR >4.0',
          priority: 'critical',
        })
      }
    }
  }

  // Always include baseline CBC and CMP for any chemo regimen
  if (drugs.length >= 2) {
    if (!seen.has('CBC with differential|baseline')) {
      items.push({ parameter: 'CBC with differential', frequency: 'baseline', rationale: 'Baseline before treatment', relatedDrugs: [], priority: 'routine' })
    }
    if (!seen.has('CMP (Comprehensive Metabolic Panel)|baseline')) {
      items.push({ parameter: 'CMP (Comprehensive Metabolic Panel)', frequency: 'baseline', rationale: 'Baseline renal and hepatic function', relatedDrugs: [], priority: 'routine' })
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, routine: 1, optional: 2 }
  items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return {
    baseline: items.filter(i => i.frequency === 'baseline'),
    eachCycle: items.filter(i => i.frequency === 'each_cycle'),
    weekly: items.filter(i => i.frequency === 'weekly' || i.frequency === 'biweekly'),
    monthly: items.filter(i => i.frequency === 'monthly'),
    prn: items.filter(i => i.frequency === 'prn'),
  }
}
