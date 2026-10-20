/**
 * Parse a regimen component dose string such as "85 mg/m² IV day 1".
 *
 * Returns one of:
 *   { kind: 'bsa', mgPerM2, capMg? }   dose scales with body surface area
 *   { kind: 'fixed', mg }              flat dose
 *   { kind: 'ambiguous', reason }      more than one dose in the text: do not guess
 *   { kind: 'unparsed' }
 *
 * The previous implementation matched only "mg/m^2" / "mg/m2", never the "mg/m²"
 * actually used in src/data/regimens.js, so no BSA-based dose was ever calculated.
 */
const NUM = '(\\d+(?:\\.\\d+)?)';

export function parseDose(text) {
  const s = String(text || '').replace(/²/g, '2').replace(/\s+/g, ' ');
  const bsaMatches = [...s.matchAll(new RegExp(`${NUM}\\s*mg\\s*/\\s*m\\s*\\^?\\s*2`, 'gi'))].map((m) => Number(m[1]));
  const distinct = [...new Set(bsaMatches)];
  if (distinct.length > 1) {
    return { kind: 'ambiguous', reason: `multiple dose options in "${text}" (${distinct.join(' or ')} mg/m2)` };
  }
  if (distinct.length === 1) {
    const cap = new RegExp(`max(?:imum)?\\.?\\s*${NUM}\\s*mg`, 'i').exec(s);
    const out = { kind: 'bsa', mgPerM2: distinct[0] };
    if (cap) out.capMg = Number(cap[1]);
    return out;
  }
  const fixed = new RegExp(`${NUM}\\s*mg\\b`, 'i').exec(s);
  if (fixed) return { kind: 'fixed', mg: Number(fixed[1]) };
  return { kind: 'unparsed' };
}

export default parseDose;
