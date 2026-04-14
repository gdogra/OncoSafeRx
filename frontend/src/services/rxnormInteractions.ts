/**
 * RxNorm Direct Interaction Checking (Client-Side)
 * Calls NLM's free, CORS-enabled RxNorm Interaction API.
 * Used as an enrichment layer on top of curated FALLBACK_INTERACTIONS.
 */

const RXNORM_INTERACTION_URL = 'https://rxnav.nlm.nih.gov/REST/interaction'

// Simple in-memory cache
const cache = new Map<string, { data: any; ts: number }>()
const CACHE_TTL = 5 * 60_000 // 5 minutes

export interface RxNormInteraction {
  drugs: string[]
  severity: string
  mechanism: string
  effect: string
  management: string
  evidence_level: string
  sources: string[]
  fromRxNorm: boolean
}

/**
 * Check interactions between multiple drugs via RxNorm
 * Uses the /interaction/list endpoint with RXCUIs
 */
export async function checkRxNormInteractions(
  rxcuis: string[]
): Promise<RxNormInteraction[]> {
  if (rxcuis.length < 2) return []

  const cacheKey = rxcuis.sort().join('+')
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  try {
    const url = `${RXNORM_INTERACTION_URL}/list.json?rxcuis=${rxcuis.join('+')}`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return []

    const data = await res.json()
    const interactions: RxNormInteraction[] = []

    // Parse the nested RxNorm interaction response
    const groups = data?.fullInteractionTypeGroup || []
    for (const group of groups) {
      for (const type of (group.fullInteractionType || [])) {
        for (const pair of (type.interactionPair || [])) {
          const concepts = pair.interactionConcept || []
          const drugNames = concepts.map((c: any) =>
            c.minConceptItem?.name || ''
          ).filter(Boolean)

          if (drugNames.length < 2) continue

          const description = pair.description || ''
          const severity = pair.severity?.toLowerCase() || 'moderate'

          interactions.push({
            drugs: drugNames,
            severity: severity === 'high' ? 'major' : severity === 'low' ? 'minor' : 'moderate',
            mechanism: description,
            effect: description,
            management: 'Consult prescribing information. Clinical monitoring recommended.',
            evidence_level: 'B',
            sources: ['NLM RxNorm Interaction API'],
            fromRxNorm: true,
          })
        }
      }
    }

    cache.set(cacheKey, { data: interactions, ts: Date.now() })
    return interactions
  } catch (err) {
    console.warn('RxNorm interaction API call failed:', (err as any)?.message)
    return []
  }
}

/**
 * Check interactions for a single drug pair via RxNorm
 */
export async function checkPairInteraction(
  rxcui1: string,
  rxcui2: string
): Promise<RxNormInteraction[]> {
  if (!rxcui1 || !rxcui2) return []

  const cacheKey = [rxcui1, rxcui2].sort().join('+')
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data

  try {
    const url = `${RXNORM_INTERACTION_URL}/interaction.json?rxcui=${rxcui1}&sources=DrugBank`
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return []

    const data = await res.json()
    const interactions: RxNormInteraction[] = []

    for (const group of (data?.interactionTypeGroup || [])) {
      for (const type of (group.interactionType || [])) {
        for (const pair of (type.interactionPair || [])) {
          const concepts = pair.interactionConcept || []
          const hasTarget = concepts.some((c: any) =>
            c.minConceptItem?.rxcui === rxcui2
          )
          if (!hasTarget) continue

          const drugNames = concepts.map((c: any) =>
            c.minConceptItem?.name || ''
          ).filter(Boolean)

          interactions.push({
            drugs: drugNames,
            severity: pair.severity === 'high' ? 'major' : pair.severity === 'low' ? 'minor' : 'moderate',
            mechanism: pair.description || '',
            effect: pair.description || '',
            management: 'Consult prescribing information.',
            evidence_level: 'B',
            sources: ['NLM RxNorm'],
            fromRxNorm: true,
          })
        }
      }
    }

    cache.set(cacheKey, { data: interactions, ts: Date.now() })
    return interactions
  } catch {
    return []
  }
}
