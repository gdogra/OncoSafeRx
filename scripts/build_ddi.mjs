#!/usr/bin/env node
// Build the runtime interaction module from the single source of truth.
//
//   data/ddi_curated.yaml  --(this script)-->  src/data/knownInteractions.js
//
//   node scripts/build_ddi.mjs          write src/data/knownInteractions.js
//   node scripts/build_ddi.mjs --check  fail if the committed file is stale
//
// The generated module keeps the legacy shape (drugs[], effect, management,
// A/B/C evidence, sources[], rxcui[]) so existing consumers are untouched.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = process.cwd();
const yamlPath = path.join(root, 'data/ddi_curated.yaml');
const outPath = path.join(root, 'src/data/knownInteractions.js');
const schemaPath = path.join(root, 'schemas/ddi_curated.schema.json');

const EVIDENCE_TO_LEGACY = { high: 'A', moderate: 'B', low: 'C', unknown: 'unknown' };

export function buildEntries(entries) {
  return entries.map((e) => {
    const sources = Array.isArray(e.sources) && e.sources.length
      ? e.sources
      : [e.evidence_source, ...(e.citations || []).map((c) => c.id || c.source_type)].filter(Boolean);
    const out = {
      drugs: [e.drug_primary, e.drug_interactor],
      severity: e.severity,
      mechanism: e.mechanism || '',
      effect: e.effect || e.mechanism || '',
      management: e.recommendation || '',
      evidence_level: EVIDENCE_TO_LEGACY[e.evidence_level] || 'unknown',
      sources: [...new Set(sources)],
    };
    if (Array.isArray(e.rxcui) && e.rxcui.length) out.rxcui = e.rxcui;
    return out;
  });
}

export function render(entries) {
  return `// GENERATED FILE - do not edit by hand.
// Source of truth: data/ddi_curated.yaml  (schema: schemas/ddi_curated.schema.json)
// Regenerate with: npm run build:ddi
// CI fails if this file is out of date (npm run check:ddi).

export const KNOWN_INTERACTIONS = ${JSON.stringify(buildEntries(entries), null, 2)};

export default KNOWN_INTERACTIONS;
`;
}

function main() {
  const entries = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(JSON.parse(fs.readFileSync(schemaPath, 'utf8')));
  if (!validate(entries)) {
    console.error('ddi_curated.yaml failed schema validation:', JSON.stringify(validate.errors.slice(0, 5), null, 2));
    process.exit(1);
  }
  // One row per unordered pair: duplicates are how conflicting severities slip in.
  const seen = new Map();
  for (const e of entries) {
    const key = [e.drug_primary, e.drug_interactor].map((d) => d.toLowerCase().trim()).sort().join('|');
    if (seen.has(key)) {
      console.error(`Duplicate interaction pair in YAML: ${key}`);
      process.exit(1);
    }
    seen.set(key, true);
  }
  const next = render(entries);
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (current !== next) {
      console.error('src/data/knownInteractions.js is out of date. Run: npm run build:ddi');
      process.exit(1);
    }
    console.log(`DDI check OK (${entries.length} interactions)`);
    return;
  }
  fs.writeFileSync(outPath, next);
  console.log(`Wrote ${entries.length} interactions to src/data/knownInteractions.js`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
