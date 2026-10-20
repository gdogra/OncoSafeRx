/**
 * Stateless link between a CDS Hooks card and the rule that produced it.
 *
 * Feedback arrives carrying only the card's uuid. Instead of storing every issued card, the first
 * 64 bits of the uuid are a hash of "<ruleId>@<version>" and the rest is random. On feedback we look
 * the prefix up in an index built from every rule we can emit. Safe on serverless (no shared memory).
 */
import crypto from 'node:crypto';
import { DOSING_RULES, DOSE_CAPS } from '../engine/dosing/rules.generated.js';
import { ruleVersion } from '../engine/dosing/evaluate.js';
import { SAFETY_RULE_IDS, SAFETY_LISTS_VERSION } from '../engine/risk/qtSerotonin.js';
import { KNOWN_INTERACTIONS } from '../data/knownInteractions.js';

const prefix = (ruleId, version) => crypto.createHash('sha256').update(`${ruleId}@${version}`).digest('hex').slice(0, 16);

export const ddiRuleId = (a, b) => `DDI:${[a, b].map((x) => x.toLowerCase().trim()).sort().join('|')}`;
export const ddiVersion = (entry) => crypto.createHash('sha256').update(JSON.stringify([entry.severity, entry.mechanism, entry.management])).digest('hex').slice(0, 12);

export const HLA_RULES = {
  'HLA-ABACAVIR': { drug: 'abacavir', allele: 'HLA-B*57:01', text: 'Risk of abacavir hypersensitivity; abacavir is contraindicated in HLA-B*57:01 carriers.', source: 'CPIC guideline for abacavir and HLA-B' },
  'HLA-CARBAMAZEPINE-B1502': { drug: 'carbamazepine', allele: 'HLA-B*15:02', text: 'Risk of SJS/TEN with carbamazepine; avoid in HLA-B*15:02 carriers unless the benefit clearly outweighs the risk.', source: 'CPIC guideline for carbamazepine and HLA-A/HLA-B' },
  'HLA-CARBAMAZEPINE-A3101': { drug: 'carbamazepine', allele: 'HLA-A*31:01', text: 'Risk of severe cutaneous reactions with carbamazepine in HLA-A*31:01 carriers.', source: 'CPIC guideline for carbamazepine and HLA-A/HLA-B' },
  'HLA-ALLOPURINOL': { drug: 'allopurinol', allele: 'HLA-B*58:01', text: 'Risk of severe cutaneous adverse reactions with allopurinol; avoid in HLA-B*58:01 carriers.', source: 'CPIC guideline for allopurinol and HLA-B' },
};
export const HLA_VERSION = '1';

const index = new Map();
function add(ruleId, version) { index.set(prefix(ruleId, version), { ruleId, version }); }
for (const r of [...DOSING_RULES, ...DOSE_CAPS]) add(r.id, ruleVersion(r));
for (const id of SAFETY_RULE_IDS) add(id, SAFETY_LISTS_VERSION);
for (const e of KNOWN_INTERACTIONS) add(ddiRuleId(e.drugs[0], e.drugs[1]), ddiVersion(e));
for (const id of Object.keys(HLA_RULES)) add(id, HLA_VERSION);
add('CDS-DATA-UNAVAILABLE', '1');
add('CDS-MORE-FINDINGS', '1');

export function cardUuid(ruleId, version) {
  const hex = prefix(ruleId, version) + crypto.randomBytes(8).toString('hex'); // 32 hex chars
  const v = hex.slice(0, 12) + '4' + hex.slice(13, 16) + ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16) + hex.slice(17);
  return `${v.slice(0, 8)}-${v.slice(8, 12)}-${v.slice(12, 16)}-${v.slice(16, 20)}-${v.slice(20, 32)}`;
}

/** Resolve a card uuid to the rule that produced it, or null if unknown. */
export function ruleForCard(uuid) {
  const hex = String(uuid || '').replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return null;
  // undo the version/variant nibble edits: the prefix we hashed is hex[0..11] + original [12] + hex[13..15]
  // The original 13th char is lost, so match on the first 12 and last 3 of the 16-char prefix only.
  const head = hex.slice(0, 12); const tail = hex.slice(13, 16);
  for (const [p, rule] of index) if (p.slice(0, 12) === head && p.slice(13, 16) === tail) return rule;
  return null;
}
