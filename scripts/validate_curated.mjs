// Validate curated YAML files against JSON Schemas
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function loadYaml(p) {
  const txt = fs.readFileSync(p, 'utf8');
  return yaml.load(txt);
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const root = process.cwd();
const aliasesSchema = loadJson(path.join(root, 'schemas/drug_aliases.schema.json'));
const ddiSchema = loadJson(path.join(root, 'schemas/ddi_curated.schema.json'));

const aliases = loadYaml(path.join(root, 'data/drug_aliases.yaml'));
const ddi = loadYaml(path.join(root, 'data/ddi_curated.yaml'));

const v1 = ajv.compile(aliasesSchema);
const v2 = ajv.compile(ddiSchema);

let ok = true;

if (!v1(aliases)) {
  ok = false;
  console.error('Aliases YAML invalid:', v1.errors);
}

if (!v2(ddi)) {
  ok = false;
  console.error('DDI YAML invalid:', v2.errors);
}

if (!ok) {
  process.exit(1);
} else {
  console.log('Curated YAML validation OK');
}

