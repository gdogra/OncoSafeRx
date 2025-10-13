import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', '..', 'data');
const SUBS_FILE = join(DATA_DIR, 'push-subscriptions.json');

const router = express.Router();

// In-memory cache + file persistence
let subscriptions = new Set();

// Optional Postgres persistence
let pool = null;
function pgEnabled() {
  return !!(process.env.DATABASE_URL || process.env.PGHOST);
}

async function initPg() {
  if (!pgEnabled()) return;
  if (pool) return;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  });
  await pool.query(`CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

function ensureDataDir() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch {}
}

async function loadSubscriptions() {
  try {
    if (pgEnabled()) {
      await initPg();
      const { rows } = await pool.query('SELECT data FROM push_subscriptions');
      const arr = rows.map(r => r.data).filter(Boolean);
      subscriptions = new Set(arr);
    } else {
      ensureDataDir();
      if (fs.existsSync(SUBS_FILE)) {
        const raw = fs.readFileSync(SUBS_FILE, 'utf-8');
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) subscriptions = new Set(arr);
      }
    }
  } catch {}
}

async function saveSubscriptions() {
  try {
    const arr = Array.from(subscriptions);
    if (pgEnabled()) {
      await initPg();
      // Upsert all known subs
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const sub of arr) {
          await client.query(
            'INSERT INTO push_subscriptions (endpoint, data) VALUES ($1, $2) ON CONFLICT (endpoint) DO UPDATE SET data = EXCLUDED.data',
            [sub.endpoint, sub]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
    } else {
      ensureDataDir();
      fs.writeFileSync(SUBS_FILE, JSON.stringify(arr, null, 2));
    }
  } catch {}
}

await loadSubscriptions();

router.post('/subscribe', (req, res) => {
  try {
    const sub = req.body;
    if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
    // Store unique by endpoint
    const asArr = Array.from(subscriptions);
    const filtered = asArr.filter((s) => s?.endpoint !== sub.endpoint);
    filtered.push(sub);
    subscriptions = new Set(filtered);
    saveSubscriptions();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Placeholder endpoint to test server-side push integration
router.post('/test', async (req, res) => {
  // Attempt to send a demo push if web-push is installed and keys are set
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return res.json({ ok: true, subscribers: subscriptions.size, message: 'VAPID keys not configured' });
    }
    let webpush;
    try {
      webpush = await import('web-push');
    } catch {
      return res.json({ ok: true, subscribers: subscriptions.size, message: 'web-push not installed' });
    }
    webpush.default.setVapidDetails('mailto:admin@oncosaferx.com', publicKey, privateKey);
    const payload = JSON.stringify({
      title: 'OncoSafeRx Notification',
      body: 'Background push test from server',
      data: { url: '/' },
    });
    let sendCount = 0;
    await Promise.all(Array.from(subscriptions).map(async (sub) => {
      try { await webpush.default.sendNotification(sub, payload); sendCount++; } catch {}
    }));
    return res.json({ ok: true, subscribers: subscriptions.size, sent: sendCount });
  } catch (e) {
    return res.status(500).json({ error: 'Push send failed', details: e?.message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { title, body, url, requireInteraction } = req.body || {};
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      return res.json({ ok: false, message: 'VAPID keys not configured', subscribers: subscriptions.size });
    }
    let webpush;
    try { webpush = await import('web-push'); } catch { return res.json({ ok: false, message: 'web-push not installed' }); }
    webpush.default.setVapidDetails('mailto:admin@oncosaferx.com', publicKey, privateKey);
    const payload = JSON.stringify({
      title: title || 'OncoSafeRx',
      body: body || 'Background notification',
      data: { url: url || '/' },
      requireInteraction: !!requireInteraction,
    });
    let sendCount = 0;
    await Promise.all(Array.from(subscriptions).map(async (sub) => {
      try { await webpush.default.sendNotification(sub, payload); sendCount++; } catch {}
    }));
    return res.json({ ok: true, sent: sendCount, subscribers: subscriptions.size });
  } catch (e) {
    return res.status(500).json({ error: 'Push send failed', details: e?.message });
  }
});

export default router;
