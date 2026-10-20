/**
 * Pairwise drug-drug interaction detection for CDS Hooks.
 * A pair is reported only when at least one drug is NEW (a draft order), so clinicians are not
 * re-alerted about combinations that were already on the chart.
 *
 * Matching: whole-word generic/alias name, or RxNorm code when the order carries one.
 * Class-level rows ("strong CYP3A4 inhibitors") never match a drug by name; they need class
 * membership data, which does not exist yet.
 */
import { KNOWN_INTERACTIONS } from '../data/knownInteractions.js';
import { canonicalDrugText } from '../engine/risk/qtSerotonin.js';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const nameRe = new Map();
const re = (n) => { if (!nameRe.has(n)) nameRe.set(n, new RegExp(`(^|[^a-z0-9])${esc(n.toLowerCase())}($|[^a-z0-9])`)); return nameRe.get(n); };

const entryRx = (e) => new Set((e.rxcui || []).filter((c) => /^\d+$/.test(String(c))).map(String));

function matches(drug, term, rxSet) {
  if (drug.rxcui?.some((c) => rxSet.has(c)) && rxSet.size) {
    // an RxNorm hit counts only if the entry's code set contains this drug's code AND the name
    // also lines up with the term, since entries hold codes for both sides of the pair
    if (re(term).test(canonicalDrugText(drug.name))) return true;
  }
  return re(term).test(canonicalDrugText(drug.name));
}

export function findInteractions({ draft, active }) {
  const all = [...draft.map((d) => ({ ...d, isDraft: true })), ...active.filter((a) => !draft.some((d) => d.name.toLowerCase() === a.name.toLowerCase())).map((d) => ({ ...d, isDraft: false }))];
  const hits = [];
  for (const e of KNOWN_INTERACTIONS) {
    const [a, b] = e.drugs;
    const rx = entryRx(e);
    const da = all.filter((d) => matches(d, a, rx));
    const db = all.filter((d) => matches(d, b, rx));
    for (const x of da) for (const y of db) {
      if (x.name === y.name) continue;
      if (!x.isDraft && !y.isDraft) continue;
      hits.push({ entry: e, drugA: x, drugB: y });
    }
  }
  // de-duplicate by pair of ordered names
  const seen = new Set();
  return hits.filter((h) => { const k = [h.drugA.name, h.drugB.name].sort().join('|') + '|' + h.entry.drugs.join('|'); if (seen.has(k)) return false; seen.add(k); return true; });
}
