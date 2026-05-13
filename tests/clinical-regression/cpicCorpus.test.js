/**
 * Clinical regression suite — CPIC pharmacogenomic corpus.
 *
 * For each canonical clinical scenario, assert that:
 *   1) The (gene, drug, phenotype) tuple has a matching entry in the curated
 *      CPIC corpus.
 *   2) That entry has the expected evidence level.
 *   3) That entry has at least one source citation.
 *   4) When the scenario is "actionable" (avoid / reduce), the recommendation
 *      text contains the expected action keyword.
 *
 * If any of these assertions break, a guideline regressed in the data file
 * and a clinical claim that depends on it would silently change. The test
 * fails the build before that ships.
 *
 * Scenarios are drawn from CPIC's gold-standard gene-drug pairs and are the
 * same fixtures we used to verify the PharmacogenomicsPanel runtime. Adding
 * new clinical scenarios here = adding to the trustworthy floor.
 */

import { CPIC_GUIDELINES_EXPANDED } from '../../src/data/cpicGuidelinesExpanded.js';

/**
 * Forgiving comparison: tolerate "(5-FU)", "5-Fluorouracil", "Mercaptopurine (6-MP)"
 * variants by tokenizing on non-alphanumerics and checking token overlap.
 */
function drugMatches(needle, hay) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  const a = new Set(norm(needle).split(' ').filter(Boolean));
  const b = new Set(norm(hay).split(' ').filter(Boolean));
  for (const t of a) if (b.has(t)) return true;
  return false;
}

function phenotypeMatches(needle, hay) {
  const a = String(needle || '').toLowerCase();
  const b = String(hay || '').toLowerCase();
  return b.includes(a) || a.includes(b);
}

/**
 * Each scenario locks one clinical fact in. `expectedActionPattern` is a
 * regex applied to the matched recommendation text — it captures the kind
 * of action a clinician would expect (avoid / reduce / consider).
 */
const SCENARIOS = [
  {
    label: 'DPYD Poor Metabolizer + 5-FU → avoid or dose reduce ≥50%',
    gene: 'DPYD',
    drug: 'Fluorouracil',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /\bavoid\b/i,
    minSources: 2,
  },
  {
    label: 'DPYD Intermediate Metabolizer + 5-FU → 50% dose reduction',
    gene: 'DPYD',
    drug: 'Fluorouracil',
    phenotype: 'Intermediate Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /50%/i,
    minSources: 1,
  },
  {
    label: 'DPYD Poor Metabolizer + Capecitabine → avoid',
    gene: 'DPYD',
    drug: 'Capecitabine',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /\bavoid\b/i,
    minSources: 1,
  },
  {
    label: 'UGT1A1 Poor Metabolizer + Irinotecan → dose reduce',
    gene: 'UGT1A1',
    drug: 'Irinotecan',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /\b(reduce|reduction|lower)\b/i,
    minSources: 1,
  },
  {
    label: 'TPMT Poor Metabolizer + Mercaptopurine (6-MP) → drastic dose reduction',
    gene: 'TPMT',
    drug: 'Mercaptopurine',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /10%|alternative/i,
    minSources: 1,
  },
  {
    label: 'TPMT Poor Metabolizer + Azathioprine → alternative or 10% dose',
    gene: 'TPMT',
    drug: 'Azathioprine',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /alternative|10%/i,
    minSources: 1,
  },
  {
    label: 'NUDT15 Poor Metabolizer + 6-MP → drastic dose reduction',
    gene: 'NUDT15',
    drug: 'Mercaptopurine',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /10%|alternative/i,
    minSources: 1,
  },
  {
    label: 'CYP2D6 Poor Metabolizer + Tamoxifen → consider alternative endocrine therapy',
    gene: 'CYP2D6',
    drug: 'Tamoxifen',
    phenotype: 'Poor Metabolizer',
    expectedEvidence: 'A',
    expectedActionPattern: /alternative|aromatase/i,
    minSources: 1,
  },
];

describe('CPIC clinical regression — canonical PGx scenarios', () => {
  test('the corpus is non-empty and well-formed', () => {
    expect(Array.isArray(CPIC_GUIDELINES_EXPANDED)).toBe(true);
    expect(CPIC_GUIDELINES_EXPANDED.length).toBeGreaterThan(50);
    for (const entry of CPIC_GUIDELINES_EXPANDED) {
      expect(entry.gene_symbol).toBeTruthy();
      expect(entry.drug?.name).toBeTruthy();
      expect(entry.phenotype).toBeTruthy();
      expect(entry.recommendation).toBeTruthy();
      expect(entry.evidence_level).toBeTruthy();
      expect(Array.isArray(entry.sources)).toBe(true);
      expect(entry.sources.length).toBeGreaterThanOrEqual(1);
    }
  });

  for (const s of SCENARIOS) {
    test(s.label, () => {
      const matches = CPIC_GUIDELINES_EXPANDED.filter(
        (g) =>
          g.gene_symbol === s.gene &&
          drugMatches(s.drug, g.drug?.name) &&
          phenotypeMatches(s.phenotype, g.phenotype)
      );
      expect(matches.length).toBeGreaterThanOrEqual(1);

      const match = matches[0];
      expect(match.evidence_level).toBe(s.expectedEvidence);
      expect(match.recommendation).toMatch(s.expectedActionPattern);
      expect(match.sources.length).toBeGreaterThanOrEqual(s.minSources);
    });
  }
});
