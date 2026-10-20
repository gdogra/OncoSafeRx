#!/usr/bin/env node
// data/qt_serotonin.yaml --> src/engine/risk/lists.generated.js
//   node scripts/build_safety_classes.mjs          write
//   node scripts/build_safety_classes.mjs --check  fail if the committed file is stale
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = process.cwd();
const yamlPath = path.join(root, 'data/qt_serotonin.yaml');
const outPath = path.join(root, 'src/engine/risk/lists.generated.js');

export function render(doc) {
  return `// GENERATED FILE - do not edit by hand.
// Source of truth: data/qt_serotonin.yaml  (schema: schemas/qt_serotonin.schema.json)
// Regenerate with: npm run build:safety
// CI fails if this file is out of date (npm run check:safety).

export const SAFETY_LISTS = ${JSON.stringify(doc, null, 2)};

export default SAFETY_LISTS;
`;
}

function main() {
  const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(JSON.parse(fs.readFileSync(path.join(root, 'schemas/qt_serotonin.schema.json'), 'utf8')));
  if (!validate(doc)) { console.error('qt_serotonin.yaml failed validation:', JSON.stringify(validate.errors.slice(0, 5), null, 2)); process.exit(1); }
  // A drug may sit in one QT tier and one serotonergic class only; otherwise the tiering is ambiguous.
  for (const [group, tiers] of [['qt_drugs', doc.qt_drugs], ['serotonergic_drugs', doc.serotonergic_drugs]]) {
    const seen = new Map();
    for (const [tier, names] of Object.entries(tiers)) {
      for (const n of names) {
        const k = n.toLowerCase();
        if (seen.has(k)) { console.error(`${group}: "${n}" is in both "${seen.get(k)}" and "${tier}"`); process.exit(1); }
        seen.set(k, tier);
      }
    }
  }
  for (const [alias, target] of Object.entries(doc.aliases)) {
    const known = [...Object.values(doc.qt_drugs), ...Object.values(doc.serotonergic_drugs)].flat().map((x) => x.toLowerCase());
    if (!known.includes(target.toLowerCase())) { console.error(`alias "${alias}" -> "${target}" does not match any listed drug`); process.exit(1); }
  }
  const next = render(doc);
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (current !== next) { console.error('src/engine/risk/lists.generated.js is out of date. Run: npm run build:safety'); process.exit(1); }
    console.log('Safety lists check OK');
    return;
  }
  fs.writeFileSync(outPath, next);
  const n = (o) => Object.values(o).flat().length;
  console.log(`Wrote ${n(doc.qt_drugs)} QT drugs, ${n(doc.serotonergic_drugs)} serotonergic drugs`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
