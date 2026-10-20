#!/usr/bin/env node
// data/dosing_rules.yaml --> src/engine/dosing/rules.generated.js
//   node scripts/build_dosing_rules.mjs          write
//   node scripts/build_dosing_rules.mjs --check  fail if the committed file is stale
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = process.cwd();
const yamlPath = path.join(root, 'data/dosing_rules.yaml');
const outPath = path.join(root, 'src/engine/dosing/rules.generated.js');

export function render(doc) {
  return `// GENERATED FILE - do not edit by hand.
// Source of truth: data/dosing_rules.yaml  (schema: schemas/dosing_rules.schema.json)
// Regenerate with: npm run build:dosing
// CI fails if this file is out of date (npm run check:dosing).

export const DOSING_RULES = ${JSON.stringify(doc.rules, null, 2)};

export const DOSE_CAPS = ${JSON.stringify(doc.dose_caps, null, 2)};
`;
}

function main() {
  const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(JSON.parse(fs.readFileSync(path.join(root, 'schemas/dosing_rules.schema.json'), 'utf8')));
  if (!validate(doc)) {
    console.error('dosing_rules.yaml failed schema validation:', JSON.stringify(validate.errors.slice(0, 5), null, 2));
    process.exit(1);
  }
  const ids = new Set();
  for (const r of [...doc.rules, ...doc.dose_caps]) {
    if (ids.has(r.id)) { console.error(`Duplicate rule id: ${r.id}`); process.exit(1); }
    ids.add(r.id);
  }
  for (const r of doc.rules) {
    const w = r.when;
    const kinds = ['lab', 'phenotype', 'missing_lab', 'missing_phenotype'].filter((k) => k in w);
    if (kinds.length !== 1) { console.error(`${r.id}: "when" needs exactly one of lab/phenotype/missing_lab/missing_phenotype`); process.exit(1); }
    if (w.lab && w.lt === undefined && w.gte === undefined) { console.error(`${r.id}: lab condition needs lt and/or gte`); process.exit(1); }
    if (w.phenotype && !w.in?.length) { console.error(`${r.id}: phenotype condition needs "in"`); process.exit(1); }
  }
  const next = render(doc);
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (current !== next) { console.error('src/engine/dosing/rules.generated.js is out of date. Run: npm run build:dosing'); process.exit(1); }
    console.log(`Dosing rules check OK (${doc.rules.length} rules, ${doc.dose_caps.length} caps)`);
    return;
  }
  fs.writeFileSync(outPath, next);
  console.log(`Wrote ${doc.rules.length} rules, ${doc.dose_caps.length} caps`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
