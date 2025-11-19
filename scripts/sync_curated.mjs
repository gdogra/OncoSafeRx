// Node script: read YAML curated files and POST to admin-ddi-sync
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const FUNCTION_URL = process.env.FUNCTION_URL; // e.g., https://<ref>.functions.supabase.co/admin-ddi-sync
const ADMIN_SECRET = process.env.FUNCTION_ADMIN_SECRET;

if (!FUNCTION_URL || !ADMIN_SECRET) {
  console.error('Missing FUNCTION_URL or FUNCTION_ADMIN_SECRET');
  process.exit(1);
}

function loadYaml(p) {
  const text = fs.readFileSync(p, 'utf8');
  return yaml.load(text);
}

const root = process.cwd();
const aliases = loadYaml(path.join(root, 'data/drug_aliases.yaml')) || [];
const ddi = loadYaml(path.join(root, 'data/ddi_curated.yaml')) || [];

const payload = { aliases, ddi };

const res = await fetch(FUNCTION_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  console.error('Sync failed', res.status, await res.text());
  process.exit(res.status);
}

console.log('Sync OK', await res.json());

