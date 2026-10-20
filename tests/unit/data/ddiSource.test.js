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
});
