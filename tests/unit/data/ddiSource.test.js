import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { render } from '../../../scripts/build_ddi.mjs';
import { KNOWN_INTERACTIONS } from '../../../src/data/knownInteractions.js';

const yamlPath = path.join(process.cwd(), 'data/ddi_curated.yaml');
const entries = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
const pairKey = (a, b) => [a, b].map((d) => d.toLowerCase().trim()).sort().join('|');

describe('interaction data: single source of truth', () => {
  test('generated module is exactly what the YAML builds (run `npm run build:ddi`)', () => {
    const generated = fs.readFileSync(path.join(process.cwd(), 'src/data/knownInteractions.js'), 'utf8');
    expect(generated).toBe(render(entries));
  });

  test('one row per unordered drug pair', () => {
    const seen = new Set();
    for (const e of entries) {
      const k = pairKey(e.drug_primary, e.drug_interactor);
      expect(seen.has(k)).toBe(false);
      seen.add(k);
    }
  });

  test('no placeholder "interactions" with a non-drug', () => {
    for (const e of KNOWN_INTERACTIONS) {
      for (const d of e.drugs) expect(d).not.toMatch(/^(none|no major|n\/a)\b|none (significant|specific)/i);
    }
  });

  test('hand-reviewed entries keep their citations and map to the legacy shape', () => {
    const tam = KNOWN_INTERACTIONS.find((e) => pairKey(e.drugs[0], e.drugs[1]) === 'paroxetine|tamoxifen');
    expect(tam.severity).toBe('major');
    expect(tam.evidence_level).toBe('A');
    expect(tam.sources).toContain('CPIC-Tamoxifen-CYP2D6');
  });

  describe('citations', () => {
    const cited = entries.filter((e) => e.citation_status === 'label_mention');
    test('a large share of entries carry a verifiable FDA-label citation', () => {
      expect(cited.length).toBeGreaterThan(300);
    });
    test('each label citation has setid, DailyMed URL, section, and a non-trivial verbatim snippet', () => {
      for (const e of cited) {
        const labels = e.citations.filter((c) => c.source_type === 'label');
        expect(labels.length).toBeGreaterThanOrEqual(1);
        for (const c of labels) {
          expect(c.id).toMatch(/^[0-9a-f-]{36}$/);
          expect(c.url).toBe(`https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${c.id}`);
          expect(c.section).toBeTruthy();
          expect(c.snippet.length).toBeGreaterThan(20);
        }
      }
    });
    test('every snippet contains the term it was matched on (auditable, no mismatched citations)', () => {
      for (const e of cited) {
        for (const c of e.citations.filter((x) => x.source_type === 'label')) {
          expect(c.matched).toBeTruthy();
          if (!c.snippet.toLowerCase().includes(c.matched.toLowerCase())) {
            throw new Error(`${e.drug_primary}+${e.drug_interactor}: snippet lacks matched term "${c.matched}"`);
          }
        }
      }
    });
    test('entries without a citation are explicitly marked unverified, never silently uncited', () => {
      for (const e of entries) {
        if (!(e.citations || []).length) expect(e.citation_status).toBe('unverified');
      }
    });
    test('generated module exposes citations and status', () => {
      const withCites = KNOWN_INTERACTIONS.filter((e) => e.citations?.length);
      expect(withCites.length).toBeGreaterThan(300);
      expect(KNOWN_INTERACTIONS.every((e) => ['label_mention', 'unverified'].includes(e.citation_status))).toBe(true);
    });
  });
});
