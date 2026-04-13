/**
 * Interaction Severity Scoring Engine
 * Scores each drug interaction 1-10 based on clinical severity, evidence level,
 * mechanism type, and availability of alternatives.
 */

export interface InteractionScore {
  score: number          // 1-10
  level: 'critical' | 'high' | 'moderate' | 'low'
  color: string          // tailwind color class
  label: string          // human-readable
  components: {
    base: number         // from severity
    evidence: number     // from evidence level
    mechanism: number    // from mechanism type
    alternative: number  // reduction if alternative exists
  }
}

interface InteractionInput {
  severity?: string       // 'major' | 'moderate' | 'minor'
  evidence_level?: string // 'A' | 'B' | 'C' | 'D'
  mechanism?: string      // free text describing mechanism
}

// Mechanism keywords that increase risk
const HIGH_RISK_MECHANISMS = ['qt prolongation', 'torsade', 'bleeding', 'hemorrhage', 'fatal', 'respiratory depression', 'serotonin syndrome']
const MODERATE_RISK_MECHANISMS = ['cyp3a4', 'cyp2d6', 'cyp2c19', 'cyp1a2', 'p-glycoprotein', 'myelosuppression', 'nephrotoxicity', 'hepatotoxicity']

function getMechanismModifier(mechanism: string): number {
  if (!mechanism) return 0
  const lower = mechanism.toLowerCase()
  if (HIGH_RISK_MECHANISMS.some(k => lower.includes(k))) return 1.5
  if (MODERATE_RISK_MECHANISMS.some(k => lower.includes(k))) return 0.5
  return 0
}

export function scoreInteraction(interaction: InteractionInput, hasAlternative: boolean = false): InteractionScore {
  // Base score from severity
  let base = 5
  switch (interaction.severity?.toLowerCase()) {
    case 'major': base = 8; break
    case 'moderate': base = 5; break
    case 'minor': base = 2; break
    case 'contraindicated': base = 10; break
  }

  // Evidence modifier
  let evidence = 0
  switch (interaction.evidence_level?.toUpperCase()) {
    case 'A': evidence = 2; break
    case 'A/B': evidence = 1.5; break
    case 'B': evidence = 1; break
    case 'C': evidence = 0; break
    case 'D': evidence = -1; break
  }

  // Mechanism modifier
  const mechanism = getMechanismModifier(interaction.mechanism || '')

  // Alternative availability modifier
  const alternative = hasAlternative ? -0.5 : 0

  // Calculate final score (clamped 1-10)
  const raw = base + evidence + mechanism + alternative
  const score = Math.round(Math.min(10, Math.max(1, raw)))

  // Determine level and color
  let level: InteractionScore['level']
  let color: string
  let label: string
  if (score >= 8) { level = 'critical'; color = 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 border-red-300 dark:border-red-800'; label = 'Critical Risk' }
  else if (score >= 6) { level = 'high'; color = 'text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 border-orange-300 dark:border-orange-800'; label = 'High Risk' }
  else if (score >= 4) { level = 'moderate'; color = 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300 dark:border-amber-800'; label = 'Moderate Risk' }
  else { level = 'low'; color = 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 border-green-300 dark:border-green-800'; label = 'Low Risk' }

  return { score, level, color, label, components: { base, evidence, mechanism, alternative } }
}

/**
 * Score multiple interactions and return sorted by severity
 */
export function scoreAllInteractions(
  interactions: InteractionInput[],
  alternativesAvailable: Set<string>
): (InteractionInput & { riskScore: InteractionScore })[] {
  return interactions
    .map(i => ({
      ...i,
      riskScore: scoreInteraction(i, alternativesAvailable.has(
        (i as any).drugs?.sort().join('+') || ''
      ))
    }))
    .sort((a, b) => b.riskScore.score - a.riskScore.score)
}
