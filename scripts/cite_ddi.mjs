#!/usr/bin/env node
/**
 * Attach REAL, checkable citations to curated interactions.
 *
 * For each pair (A, B) we look for B (or a known alias/class wording) in the
 * Drug Interactions / Contraindications / Warnings sections of A's FDA label on
 * DailyMed, and the reverse. When found, the citation records the label's setid,
 * a DailyMed URL, the section, and a VERBATIM snippet from the label. Nothing is
 * inferred or written from memory: no label text, no citation.
 *
 * "label_mention" means the FDA label for one of the drugs discusses the other. It does NOT
 * mean our severity grading was checked against the label.
 *
 *   node scripts/cite_ddi.mjs [--limit N] [--only drugA] [--refresh]
 * Cache: .cache/dailymed (git-ignored).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';

const root = process.cwd();
const yamlPath = path.join(root, 'data/ddi_curated.yaml');
const cacheDir = path.join(root, '.cache/dailymed');
fs.mkdirSync(cacheDir, { recursive: true });
const args = process.argv.slice(2);
const argVal = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const LIMIT = argVal('--limit') ? Number(argVal('--limit')) : Infinity;
const ONLY = argVal('--only');
const TODAY = new Date().toISOString().slice(0, 10);
const BASE = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let lastCall = 0;
async function cachedFetch(url, ext) {
  const f = path.join(cacheDir, crypto.createHash('sha1').update(url).digest('hex') + '.' + ext);
  if (fs.existsSync(f) && !args.includes('--refresh')) return fs.readFileSync(f, 'utf8');
  for (let attempt = 0; attempt < 7; attempt++) {
    try {
      const wait = lastCall + 200 - Date.now(); lastCall = Math.max(Date.now(), lastCall) + 200; if (wait > 0) await sleep(wait);
      const res = await fetch(url, { headers: { 'user-agent': 'OncoSafeRx-citation-builder' } });
      if (res.status === 404) { fs.writeFileSync(f, ''); return ''; }
      if (res.status === 429) { await sleep(8000 * (attempt + 1)); continue; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      fs.writeFileSync(f, text);
      return text;
    } catch (e) {
      await sleep(1500 * (attempt + 1));
    }
  }
  console.error(`fetch FAILED (will leave affected entries unchecked): ${url}`);
  return null; // null = could not check; '' = checked and empty
}

async function pool(items, n, fn) {
  let i = 0; let done = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const item = items[i++];
      await fn(item);
      if (++done % 50 === 0) console.log(`  ${done}/${items.length}`);
    }
  }));
}

const SECTIONS = [
  ['34073-7', 'Drug Interactions'],
  ['34070-3', 'Contraindications'],
  ['43685-7', 'Warnings and Precautions'],
  ['34071-1', 'Warnings'],
];

const parser = new XMLParser({ preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: '@_', trimValues: false, processEntities: true });

function textOf(nodes) {
  let out = '';
  for (const n of nodes || []) {
    for (const [k, v] of Object.entries(n)) {
      if (k === ':@') continue;
      if (k === '#text') out += v;
      else {
        const block = /^(paragraph|item|list|tr|table|caption|title|section|text)$/.test(k);
        out += (block ? ' ' : '') + textOf(v) + (block ? ' ' : '');
      }
    }
  }
  return out;
}

function findSections(nodes, code, acc = []) {
  for (const n of nodes || []) {
    for (const [k, v] of Object.entries(n)) {
      if (k === ':@' || k === '#text') continue;
      if (k === 'section') {
        const codeNode = (v || []).find((c) => c.code && c[':@']);
        if (codeNode && codeNode[':@']['@_code'] === code) { acc.push(v); continue; }
      }
      findSections(v, code, acc);
    }
  }
  return acc;
}

const squash = (s) => s.replace(/\s+/g, ' ').replace(/\s+([.,;:)])/g, '$1').replace(/\(\s+/g, '(').trim();

function parseLabel(xml) {
  const tree = parser.parse(xml);
  const title = squash(textOf(findFirst(tree, 'title') || [])) || '';
  const sections = [];
  for (const [code, name] of SECTIONS) {
    const found = findSections(tree, code);
    if (found.length) sections.push({ code, name, text: squash(found.map((f) => textOf(f)).join(' ')) });
  }
  return { sections };
}
function findFirst(nodes, tag) {
  for (const n of nodes || []) for (const [k, v] of Object.entries(n)) { if (k === tag) return v; if (k !== ':@' && k !== '#text') { const r = findFirst(v, tag); if (r) return r; } }
  return null;
}

// ---- drug names and labels -------------------------------------------------
const entries = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
const header = fs.readFileSync(yamlPath, 'utf8').split('\n').filter((l, i, a) => a.slice(0, i + 1).every((x) => x.startsWith('#') || x.trim() === '')).join('\n');
const aliasDoc = yaml.load(fs.readFileSync(path.join(root, 'data/drug_aliases.yaml'), 'utf8')) || [];
const aliasesFor = new Map();
for (const a of aliasDoc) {
  const c = String(a.canonical_name || '').toLowerCase();
  if (!aliasesFor.has(c)) aliasesFor.set(c, new Set([c]));
  aliasesFor.get(c).add(String(a.name).toLowerCase());
}

function termVariants(name) {
  const n = name.toLowerCase().trim();
  const set = new Set([n, ...(aliasesFor.get(n) || [])]);
  const singular = (s) => s.replace(/ies$/, 'y').replace(/s$/, '');
  const strip = n.replace(/^(strong|potent|moderate|weak|dual|systemic)\s+/, '');
  for (const v of [n, strip]) { set.add(v); set.add(singular(v)); }
  const map = {
    nsaids: ['nsaid', 'nonsteroidal anti-inflammatory'], ssris: ['ssri', 'selective serotonin reuptake inhibitor'], 'proton pump inhibitors': ['proton pump inhibitor'],
    'ace inhibitors': ['ace inhibitor', 'angiotensin converting enzyme inhibitor'], 'beta-blockers': ['beta-blocker', 'beta blocker'],
    'live vaccines': ['live vaccine', 'live attenuated vaccine'], statins: ['statin', 'hmg-coa reductase inhibitor'], 'azole antifungals': ['azole'],
  };
  for (const t of map[n] || []) set.add(t);
  return [...set].filter((t) => t.length >= 4);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(^|[^a-z0-9])${esc(t)}($|[^a-z0-9])`, 'i');

const failed = new Set(); // names whose lookup errored (not the same as "no label exists")
const labelCache = new Map(); // drug name -> [{ setid, title, sections }]
async function labelsFor(name) {
  const key = name.toLowerCase();
  if (labelCache.has(key)) return labelCache.get(key);
  const canonical = (() => { for (const [c, set] of aliasesFor) if (set.has(key)) return c; return key; })();
  const list = await cachedFetch(`${BASE}/spls.json?drug_name=${encodeURIComponent(canonical)}&pagesize=25`, 'json');
  if (list === null) { failed.add(key); labelCache.set(key, []); return []; }
  let data = [];
  try { data = JSON.parse(list || '{}').data || []; } catch {}
  const first = canonical.split(/[\s,/]+/)[0];
  const candidates = data.filter((d) => d.title.toLowerCase().includes(first)).slice(0, 2);
  const out = [];
  for (const c of candidates) {
    const xml = await cachedFetch(`${BASE}/spls/${c.setid}.xml`, 'xml');
    if (xml === null) failed.add(key);
    if (!xml) continue;
    try { out.push({ setid: c.setid, title: squash(c.title), ...parseLabel(xml) }); } catch (e) { console.error(`parse failed ${c.setid}: ${e.message}`); }
  }
  labelCache.set(key, out);
  return out;
}

function snippetFrom(text, re) {
  const m = re.exec(text);
  if (!m) return null;
  const idx = m.index + m[1].length;
  const start = Math.max(0, text.lastIndexOf('. ', idx) + 2 || 0);
  let end = text.indexOf('. ', idx);
  end = end === -1 ? text.length : end + 1;
  let s = text.slice(start, end).trim();
  if (s.length > 420) { const a = Math.max(0, idx - start - 200); s = text.slice(start + a, start + a + 420).trim(); }
  // drop leading cross-reference noise such as "(5.11, 8.1) 5.1 " (still a verbatim substring of the label)
  s = s.replace(/^[^A-Za-z]+/, '');
  return s;
}

async function citeFor(label, otherName, otherDisplay) {
  const terms = termVariants(otherName);
  for (const sec of label.sections) {
    for (const t of terms) {
      const snip = snippetFrom(sec.text, termRe(t));
      // Self-check: the snippet we store must itself contain the term that matched.
      if (snip && termRe(t).test(snip.toLowerCase())) return {
        source_type: 'label', id: label.setid, title: label.title.slice(0, 160), section: sec.name,
        url: `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${label.setid}`, matched: t, snippet: snip, retrieved: TODAY,
      };
    }
  }
  return null;
}

async function main() {
  const todo = entries.filter((e) => !ONLY || [e.drug_primary, e.drug_interactor].includes(ONLY)).slice(0, LIMIT);
  const names = [...new Set(todo.flatMap((e) => [e.drug_primary, e.drug_interactor]))];
  console.log(`Fetching labels for ${names.length} names...`);
  await pool(names, 3, (n) => labelsFor(n));
  let verified = 0; let unchecked = 0;
  for (const e of todo) {
    const found = [];
    for (const [a, b] of [[e.drug_primary, e.drug_interactor], [e.drug_interactor, e.drug_primary]]) {
      for (const label of labelCache.get(a.toLowerCase()) || []) {
        const c = await citeFor(label, b, b);
        if (c && !found.some((f) => f.id === c.id)) { found.push(c); break; }
      }
    }
    const kept = (e.citations || []).filter((c) => c.source_type !== 'label'); // keep hand-entered citations
    e.citations = [...kept, ...found];
    if (!e.citations.length) delete e.citations;
    const couldNotCheck = !found.length && [e.drug_primary, e.drug_interactor].some((n) => failed.has(n.toLowerCase()));
    if (couldNotCheck) { unchecked++; continue; } // leave previous status untouched
    e.citation_status = found.length ? 'label_mention' : 'unverified';
    e.citations_checked_on = TODAY;
    if (found.length) verified++;
  }
  const body = yaml.dump(entries, { lineWidth: 120, noRefs: true });
  fs.writeFileSync(yamlPath, header.trimEnd() + '\n\n' + body);
  console.log(`label_mention: ${verified}/${todo.length}; unverified: ${todo.length - verified - unchecked}; could not check (rerun): ${unchecked}`);
}

main();
