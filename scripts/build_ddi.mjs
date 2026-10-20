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
const warnYamlPath = path.join(root, 'data/non_ddi_warnings.yaml');
const warnOutPath = path.join(root, 'src/data/nonDdiWarnings.js');
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
    // Real citations (FDA label text) when available; `sources` above stays as the legacy summary.
    out.citation_status = e.citation_status || 'unverified';
    if (Array.isArray(e.citations) && e.citations.length) out.citations = e.citations;
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

export function renderWarnings(entries) {
  const rows = entries.map((e) => ({
    drug: e.drug, subject: e.subject, category: e.category, severity: e.severity,
    mechanism: e.mechanism || '', effect: e.effect || e.mechanism || '', management: e.recommendation || '',
    evidence_level: EVIDENCE_TO_LEGACY[e.evidence_level] || 'unknown',
    sources: [...new Set(Array.isArray(e.sources) && e.sources.length ? e.sources : [e.evidence_source].filter(Boolean))],
    ...(Array.isArray(e.rxcui) && e.rxcui.length ? { rxcui: e.rxcui } : {}),
    citation_status: e.citation_status || 'unverified',
    ...(Array.isArray(e.citations) && e.citations.length ? { citations: e.citations } : {}),
  }));
  return `// GENERATED FILE - do not edit by hand.
// Source of truth: data/non_ddi_warnings.yaml  (schema: schemas/non_ddi_warnings.schema.json)
// Patient-factor / food warnings: NOT drug-drug interactions. Regenerate with: npm run build:ddi
// CI fails if this file is out of date (npm run check:ddi).

export const NON_DDI_WARNINGS = ${JSON.stringify(rows, null, 2)};

export default NON_DDI_WARNINGS;
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
  const warnings = yaml.load(fs.readFileSync(warnYamlPath, 'utf8'));
  const validateWarn = ajv.compile(JSON.parse(fs.readFileSync(path.join(root, 'schemas/non_ddi_warnings.schema.json'), 'utf8')));
  if (!validateWarn(warnings)) {
    console.error('non_ddi_warnings.yaml failed schema validation:', JSON.stringify(validateWarn.errors.slice(0, 5), null, 2));
    process.exit(1);
  }
  const wkeys = new Set();
  for (const w of warnings) {
    const k = [w.drug, w.subject].map((x) => x.toLowerCase().trim()).join('|');
    if (wkeys.has(k)) { console.error(`Duplicate warning: ${k}`); process.exit(1); }
    wkeys.add(k);
  }
  const next = render(entries);
  const nextWarn = renderWarnings(warnings);
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    const currentWarn = fs.existsSync(warnOutPath) ? fs.readFileSync(warnOutPath, 'utf8') : '';
    if (current !== next || currentWarn !== nextWarn) {
      console.error('Generated interaction modules are out of date. Run: npm run build:ddi');
      process.exit(1);
    }
    console.log(`DDI check OK (${entries.length} interactions, ${warnings.length} non-DDI warnings)`);
    return;
  }
  fs.writeFileSync(outPath, next);
  fs.writeFileSync(warnOutPath, nextWarn);
  console.log(`Wrote ${entries.length} interactions and ${warnings.length} non-DDI warnings`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
