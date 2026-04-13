/**
 * One-Click Alternative Finder
 * Suggests the safest therapeutic alternative when a drug interaction is flagged.
 * Uses curated pair-specific rules first, then falls back to same-class substitution.
 */

import { ALTERNATIVE_RULES, type AlternativeRule } from '../data/alternativeRules'
import { getSameClassDrugs, getDrugClass } from '../data/drugClassMappings'

export interface AlternativeSuggestion {
  forDrug: string           // the drug to replace
  alternative: string       // suggested replacement
  rationale: string
  confidence: 'high' | 'medium' | 'low'
  source: 'curated-rule' | 'class-match'
  citations: string[]
  drugClass?: string
  formularyStatus?: 'on-formulary' | 'not-on-formulary' | 'unknown'
}

/**
 * Find alternatives for a drug involved in an interaction
 */
export function findAlternatives(
  drugA: string,
  drugB: string,
  currentDrugs: string[] = [],
  formularyChecker?: (name: string) => 'on-formulary' | 'not-on-formulary' | 'unknown'
): AlternativeSuggestion[] {
  const suggestions: AlternativeSuggestion[] = []
  const a = drugA.toLowerCase()
  const b = drugB.toLowerCase()
  const currentLower = currentDrugs.map(d => d.toLowerCase())

  // 1. Check curated pair-specific rules (highest confidence)
  for (const rule of ALTERNATIVE_RULES) {
    const ma = rule.match.drugA.toLowerCase()
    const mb = rule.match.drugB.toLowerCase()
    if ((a === ma && b === mb) || (a === mb && b === ma)) {
      const altName = rule.suggestion.name
      suggestions.push({
        forDrug: rule.forDrug,
        alternative: altName,
        rationale: rule.rationale,
        confidence: 'high',
        source: 'curated-rule',
        citations: rule.citations,
        drugClass: getDrugClass(rule.forDrug) || undefined,
        formularyStatus: formularyChecker ? formularyChecker(altName) : 'unknown',
      })
    }
  }

  // 2. Same-class substitution fallback (medium confidence)
  if (suggestions.length === 0) {
    // Try finding class alternatives for drug B (keep drug A)
    const classAltsB = getSameClassDrugs(b)
      .filter(alt => !currentLower.includes(alt) && alt !== a)
    for (const alt of classAltsB.slice(0, 3)) {
      suggestions.push({
        forDrug: drugB,
        alternative: alt,
        rationale: `Same therapeutic class (${getDrugClass(b)}). May have fewer interactions — verify before switching.`,
        confidence: 'medium',
        source: 'class-match',
        citations: ['Therapeutic substitution'],
        drugClass: getDrugClass(b) || undefined,
        formularyStatus: formularyChecker ? formularyChecker(alt) : 'unknown',
      })
    }

    // Also try alternatives for drug A
    const classAltsA = getSameClassDrugs(a)
      .filter(alt => !currentLower.includes(alt) && alt !== b)
    for (const alt of classAltsA.slice(0, 2)) {
      suggestions.push({
        forDrug: drugA,
        alternative: alt,
        rationale: `Same therapeutic class (${getDrugClass(a)}). May have fewer interactions — verify before switching.`,
        confidence: 'medium',
        source: 'class-match',
        citations: ['Therapeutic substitution'],
        drugClass: getDrugClass(a) || undefined,
        formularyStatus: formularyChecker ? formularyChecker(alt) : 'unknown',
      })
    }
  }

  return suggestions
}

/**
 * Check if any alternatives exist for a given drug pair (for scoring)
 */
export function hasAlternatives(drugA: string, drugB: string): boolean {
  const a = drugA.toLowerCase()
  const b = drugB.toLowerCase()

  // Check curated rules
  for (const rule of ALTERNATIVE_RULES) {
    const ma = rule.match.drugA.toLowerCase()
    const mb = rule.match.drugB.toLowerCase()
    if ((a === ma && b === mb) || (a === mb && b === ma)) return true
  }

  // Check class alternatives
  return getSameClassDrugs(a).length > 0 || getSameClassDrugs(b).length > 0
}
