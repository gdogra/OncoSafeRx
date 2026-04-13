/**
 * Supplement-Drug Interaction Checker
 * Checks selected supplements against current medications.
 */

import { SUPPLEMENT_INTERACTIONS } from '../data/supplementInteractions'

export interface SupplementInteractionResult {
  supplement: string
  drug: string
  severity: string
  mechanism: string
  effect: string
  management: string
  evidence_level: string
  sources: string[]
  isSupplementInteraction: true
}

/**
 * Check all supplements against all drugs for interactions
 */
export function checkSupplementInteractions(
  supplements: string[],
  drugs: string[]
): SupplementInteractionResult[] {
  const results: SupplementInteractionResult[] = []
  const suppLower = supplements.map(s => s.toLowerCase())
  const drugLower = drugs.map(d => d.toLowerCase())

  for (const interaction of SUPPLEMENT_INTERACTIONS) {
    const [a, b] = interaction.drugs.map(d => d.toLowerCase())
    // Check if one side is a supplement and the other is a drug
    const suppMatch = suppLower.find(s => s === a || s === b)
    const drugMatch = drugLower.find(d => d === a || d === b)

    if (suppMatch && drugMatch) {
      results.push({
        supplement: supplements.find(s => s.toLowerCase() === suppMatch) || suppMatch,
        drug: drugs.find(d => d.toLowerCase() === drugMatch) || drugMatch,
        severity: interaction.severity,
        mechanism: interaction.mechanism,
        effect: interaction.effect,
        management: interaction.management,
        evidence_level: interaction.evidence_level,
        sources: interaction.sources,
        isSupplementInteraction: true,
      })
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { major: 3, moderate: 2, minor: 1 }
  return results.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))
}
