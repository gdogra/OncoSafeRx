#!/usr/bin/env node
/**
 * Boot check: start the real API in production mode and verify it comes up and
 * rejects the auth bypasses that were once open. Unit tests never import the
 * server, so a bad import or a syntax error elsewhere in src/ can otherwise
 * ship unnoticed.
 *
 *   node scripts/boot-check.js
 */
import { spawn } from 'child_process';
import net from 'net';

const TIMEOUT_MS = Number(process.env.BOOT_CHECK_TIMEOUT_MS || 60000);

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fail = (msg, log) => {
  console.error(`BOOT CHECK FAIL: ${msg}`);
  if (log) console.error('--- server output (tail) ---\n' + log.slice(-3000));
  process.exitCode = 1;
};

const port = await freePort();
let log = '';
const child = spawn(process.execPath, ['src/index.js'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(port),
    USE_VITE: 'false',
    JWT_SECRET: process.env.JWT_SECRET || 'boot-check-' + 'x'.repeat(48),
    SESSION_SECRET: process.env.SESSION_SECRET || 'boot-check-' + 'y'.repeat(48),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
child.stdout.on('data', d => { log += d; });
child.stderr.on('data', d => { log += d; });
let exited = false;
child.on('exit', (code) => { exited = true; if (code) log += `\n[exited with code ${code}]`; });

const base = `http://127.0.0.1:${port}`;
const get = (path, headers = {}) => fetch(base + path, { headers }).then(r => r.status);

try {
  const deadline = Date.now() + TIMEOUT_MS;
  let up = false;
  while (Date.now() < deadline && !exited) {
    try { if ((await get('/health')) === 200) { up = true; break; } } catch {}
    await sleep(500);
  }
  if (!up) {
    fail(exited ? 'server exited before becoming healthy' : `no healthy /health within ${TIMEOUT_MS}ms`, log);
  } else {
    console.log('BOOT OK: /health returned 200');
    const checks = [
      ['/api/patients', { 'x-osrx-guest': '1' }, 'guest header'],
      ['/api/patients', { Authorization: 'Bearer gdogra-token-x' }, 'forged gdogra token'],
      ['/api/patients', { Authorization: 'Bearer dev-token-admin-1' }, 'forged dev token'],
      ['/api/supabase-auth/profile', { 'x-osrx-guest': '1' }, 'unauthenticated profile'],
      ['/api/overrides', {}, 'unauthenticated override history'],
      ['/api/overrides/summary', { 'x-osrx-guest': '1' }, 'unauthenticated override summary'],
    ];
    for (const [path, headers, label] of checks) {
      const status = await get(path, headers);
      if (status === 401 || status === 403) console.log(`BOOT OK: ${label} -> ${status}`);
      else fail(`${label} on ${path} returned ${status}, expected 401/403`);
    }
    // SMART launch must refuse (not crash, not guess) when the server has no SMART configuration
    const smart = await get('/smart/launch?iss=https://evil.example.com/fhir&launch=x');
    if (smart === 503) console.log('BOOT OK: unconfigured SMART launch -> 503');
    else fail(`/smart/launch returned ${smart} without SMART configuration, expected 503`);
    const disc = await get('/cds-services');
    if (disc === 200) console.log('BOOT OK: CDS Hooks discovery -> 200');
    else fail(`/cds-services returned ${disc}, expected 200`);
    const cdsRes = await fetch(`${base}/cds-services/oncosaferx-order-sign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    if (cdsRes.status === 503) console.log('BOOT OK: unconfigured CDS service -> 503 (never unauthenticated 200)');
    else fail(`CDS service returned ${cdsRes.status} without trusted-issuer config, expected 503`);
    for (const experimental of ['/api/digital-twin/health', '/api/medical-llm/health', '/api/ai-prediction/health']) {
      const st = await get(experimental);
      if (st === 404) console.log(`BOOT OK: ${experimental} not mounted`);
      else fail(`${experimental} returned ${st} in production, expected 404`);
    }
    const debug = await get('/api/debug/echo');
    if (debug === 404) console.log('BOOT OK: /api/debug not mounted in production');
    else fail(`/api/debug/echo returned ${debug} in production, expected 404`);
  }
} finally {
  child.kill('SIGTERM');
  await sleep(300);
  if (!exited) child.kill('SIGKILL');
}
