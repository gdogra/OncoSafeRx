#!/usr/bin/env node
/**
 * Lightweight CI smoke checks for frontend build artifacts and env embedding.
 * - Validates that index.html references existing hashed assets
 * - Ensures Supabase URL placeholder is embedded in built JS (proves env wiring)
 */

import fs from 'fs';
import path from 'path';

const distDir = process.env.SMOKE_DIST_DIR || path.join(process.cwd(), 'frontend', 'dist');
const expectedSupabaseUrl = process.env.SMOKE_EXPECTED_SUPABASE_URL || 'https://placeholder.supabase.co';

function fail(msg) {
  console.error(`SMOKE FAIL: ${msg}`);
  process.exit(1);
}

function ok(msg) {
  console.log(`SMOKE OK: ${msg}`);
}

try {
  if (!fs.existsSync(distDir)) fail(`dist directory not found: ${distDir}`);
  const indexPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexPath)) fail(`index.html not found at: ${indexPath}`);

  const html = fs.readFileSync(indexPath, 'utf8');

  // Extract asset references
  const scriptSrcs = Array.from(html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*><\/script>/gi)).map(m => m[1]);
  const cssHrefs = Array.from(html.matchAll(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi)).map(m => m[1]);
  const assets = [...scriptSrcs, ...cssHrefs];
  if (assets.length === 0) fail('no asset references found in index.html');

  // Verify each referenced asset exists on disk
  const missing = [];
  for (const ref of assets) {
    // Strip leading slash if present and resolve against distDir
    const rel = ref.startsWith('/') ? ref.slice(1) : ref;
    const abs = path.join(distDir, rel);
    if (!fs.existsSync(abs)) missing.push(ref);
  }
  if (missing.length) fail(`missing asset files: ${missing.join(', ')}`);
  ok(`all referenced assets exist (${assets.length})`);

  // Search built JS for the expected Supabase URL placeholder (proves env embedding)
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) fail(`assets directory not found: ${assetsDir}`);
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length === 0) fail('no built JS files found in assets directory');

  let foundUrl = false;
  for (const f of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, f), 'utf8');
    if (content.includes(expectedSupabaseUrl)) {
      foundUrl = true;
      break;
    }
  }
  if (!foundUrl) fail(`expected Supabase URL not found in built JS: ${expectedSupabaseUrl}`);
  ok('Supabase URL placeholder embedded in build');

  ok('Frontend smoke checks passed.');
  process.exit(0);
} catch (e) {
  fail(e?.message || String(e));
}

