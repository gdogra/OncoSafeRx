import ALTERNATIVE_RULES from '../data/alternatives.js';
import RXCUI_MAP from '../data/rxcuiMap.js';

export function suggestAlternatives(drugDetails) {
  const suggestions = [];

  // Normalize names for matching
  const normalized = drugDetails.map(d => ({
    rxcui: d.rxcui,
    name: d.name,
    nameLc: (d.name || '').toLowerCase()
  }));

  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const a = normalized[i];
      const b = normalized[j];

      for (const rule of ALTERNATIVE_RULES) {
        const mA = rule.match.drugA.toLowerCase();
        const mB = rule.match.drugB.toLowerCase();
        const pairMatches =
          (a.nameLc.includes(mA) && b.nameLc.includes(mB)) ||
          (a.nameLc.includes(mB) && b.nameLc.includes(mA));
        if (!pairMatches) continue;

        // Suggest alternative for the rule.forDrug member of the pair
        const targetName = rule.forDrug.toLowerCase();
        const target = a.nameLc.includes(targetName) ? a : b;
        const keep = target === a ? b : a;

        const altName = rule.suggestion.name;
        const altRxcui = RXCUI_MAP[altName.toLowerCase()] || rule.suggestion.rxcui || null;

        suggestions.push({
          forDrug: { rxcui: target.rxcui, name: target.name },
          withDrug: { rxcui: keep.rxcui, name: keep.name },
          alternative: { name: altName, rxcui: altRxcui },
          rationale: rule.rationale,
          citations: rule.citations
        });
      }
    }
  }

  return dedupeSuggestions(suggestions);
}

function dedupeSuggestions(items) {
  const seen = new Set();
  return items.filter(it => {
    const key = `${(it.forDrug.name || '').toLowerCase()}|${(it.withDrug.name || '').toLowerCase()}|${(it.alternative.name || '').toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default suggestAlternatives;

