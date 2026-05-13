/**
 * Clinical regression suite — curated drug-drug interaction corpus.
 *
 * Locks in well-established, high-stakes DDIs. If any of these pairs ever
 * regresses out of the curated database (drug names typo'd, severity
 * downgraded silently, sources stripped), the test fails the build before
 * the bad data ships.
 */

import { KNOWN_INTERACTIONS } from '../../src/data/knownInteractions.js';

function pairMatches(entry, a, b) {
  if (!Array.isArray(entry.drugs)) return false;
  const list = entry.drugs.map((d) => String(d).toLowerCase());
  return list.includes(String(a).toLowerCase()) && list.includes(String(b).toLowerCase());
}

const SCENARIOS = [
  {
    label: 'Warfarin + Amiodarone → major (CYP2C9 inhibition)',
    a: 'warfarin',
    b: 'amiodarone',
    expectedSeverity: 'major',
    expectedEvidence: /^A$/,
    expectedMechanism: /CYP2C9|warfarin/i,
  },
  {
    label: 'Warfarin + Aspirin → major (additive bleeding)',
    a: 'warfarin',
    b: 'aspirin',
    expectedSeverity: 'major',
    expectedEvidence: /^A$/,
    expectedMechanism: /bleed|anticoagul|antiplatelet/i,
  },
  {
    label: 'Clopidogrel + Omeprazole → moderate/major (CYP2C19 inhibition reducing activation)',
    a: 'clopidogrel',
    b: 'omeprazole',
    expectedSeverity: /^(major|moderate)$/,
    expectedEvidence: /^[AB]$/,
    expectedMechanism: /CYP2C19|clopidogrel|activation/i,
  },
  {
    label: 'Tamoxifen + Paroxetine → major (CYP2D6 inhibition reducing endoxifen)',
    a: 'tamoxifen',
    b: 'paroxetine',
    expectedSeverity: /^(major|moderate)$/,
    expectedEvidence: /^[AB]$/,
    expectedMechanism: /CYP2D6|endoxifen|tamoxifen/i,
  },
];

describe('DDI clinical regression — canonical drug pairs', () => {
  test('the corpus is non-empty and every entry has provenance', () => {
    expect(Array.isArray(KNOWN_INTERACTIONS)).toBe(true);
    expect(KNOWN_INTERACTIONS.length).toBeGreaterThan(100);
    for (const entry of KNOWN_INTERACTIONS) {
      expect(Array.isArray(entry.drugs)).toBe(true);
      expect(entry.drugs.length).toBeGreaterThanOrEqual(2);
      expect(entry.severity).toBeTruthy();
      expect(entry.evidence_level).toBeTruthy();
      expect(Array.isArray(entry.sources)).toBe(true);
      expect(entry.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  for (const s of SCENARIOS) {
    test(s.label, () => {
      const matches = KNOWN_INTERACTIONS.filter((e) => pairMatches(e, s.a, s.b));
      expect(matches.length).toBeGreaterThanOrEqual(1);
      const match = matches[0];
      if (s.expectedSeverity instanceof RegExp) {
        expect(match.severity).toMatch(s.expectedSeverity);
      } else {
        expect(match.severity).toBe(s.expectedSeverity);
      }
      expect(match.evidence_level).toMatch(s.expectedEvidence);
      expect(match.mechanism).toMatch(s.expectedMechanism);
    });
  }
});
