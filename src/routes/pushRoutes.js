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

router.get('/subscriptions', async (req, res) => {
  try {
    if (pgEnabled()) {
      await initPg();
      const { rows } = await pool.query('SELECT endpoint FROM push_subscriptions ORDER BY created_at DESC');
      return res.json({ subscriptions: rows.map(r => r.endpoint) });
    }
    return res.json({ subscriptions: Array.from(subscriptions).map(s => s.endpoint) });
  } catch {
    return res.status(500).json({ error: 'Failed to list subscriptions' });
  }
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'Missing endpoint' });
    const remaining = Array.from(subscriptions).filter((s) => s?.endpoint !== endpoint);
    subscriptions = new Set(remaining);
    if (pgEnabled()) {
      try { await initPg(); await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]); } catch {}
    } else {
      saveSubscriptions();
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to unsubscribe' });
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

// Schedule CRUD
// Scheduled push storage
const SCHED_FILE = join(DATA_DIR, 'scheduled-pushes.json');

async function listSchedules() {
  if (pgEnabled()) {
    await initPg();
    const { rows } = await pool.query('SELECT * FROM push_schedules ORDER BY scheduled_at ASC');
    return rows;
  }
  try {
    ensureDataDir();
    if (!fs.existsSync(SCHED_FILE)) return [];
    return JSON.parse(fs.readFileSync(SCHED_FILE, 'utf-8'));
  } catch { return []; }
}

async function saveSchedules(all) {
  if (pgEnabled()) {
    await initPg();
    // Upsert per-record
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const s of all) {
        await client.query(
          `INSERT INTO push_schedules (id, title, body, url, require_interaction, audience, endpoint, scheduled_at, sent_at, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT (id) DO UPDATE SET
             title=EXCLUDED.title,
             body=EXCLUDED.body,
             url=EXCLUDED.url,
             require_interaction=EXCLUDED.require_interaction,
             audience=EXCLUDED.audience,
             endpoint=EXCLUDED.endpoint,
             scheduled_at=EXCLUDED.scheduled_at,
             sent_at=EXCLUDED.sent_at,
             status=EXCLUDED.status`,
          [s.id, s.title, s.body, s.url, s.require_interaction, s.audience, s.endpoint, s.scheduled_at, s.sent_at, s.status]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    return;
  }
  try {
    ensureDataDir();
    fs.writeFileSync(SCHED_FILE, JSON.stringify(all, null, 2));
  } catch {}
}

// Scheduler loop: send due notifications
let schedulerStarted = false;
async function startScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  setInterval(async () => {
    try {
      const publicKey = process.env.VAPID_PUBLIC_KEY;
      const privateKey = process.env.VAPID_PRIVATE_KEY;
      let webpush;
      if (publicKey && privateKey) {
        try { webpush = await import('web-push'); webpush.default.setVapidDetails('mailto:admin@oncosaferx.com', publicKey, privateKey); } catch {}
      }
      const now = new Date();
      let schedules = await listSchedules();
      const toSend = schedules.filter(s => s.status === 'pending' && new Date(s.scheduled_at) <= now);
      if (!toSend.length) return;
      const subs = Array.from(subscriptions);
      for (const s of toSend) {
        let sent = 0;
        if (webpush) {
          const payload = JSON.stringify({ title: s.title, body: s.body, data: { url: s.url || '/' }, requireInteraction: !!s.require_interaction });
          const targets = s.audience === 'endpoint' && s.endpoint ? subs.filter(x => x.endpoint === s.endpoint) : subs;
          await Promise.all(targets.map(async (sub) => { try { await webpush.default.sendNotification(sub, payload); sent++; } catch {} }));
        }
        s.status = 'sent';
        s.sent_at = new Date().toISOString();
      }
      await saveSchedules(schedules);
    } catch {}
  }, 30000);
}
startScheduler();
router.get('/schedules', async (req, res) => {
  try { return res.json({ schedules: await listSchedules() }); } catch { return res.status(500).json({ error: 'Failed to list schedules' }); }
});

router.post('/schedules', async (req, res) => {
  try {
    const { title, body, url, requireInteraction, audience = 'all', endpoint, scheduledAt } = req.body || {};
    if (!title || !body || !scheduledAt) return res.status(400).json({ error: 'Missing fields' });
    const id = crypto.randomUUID();
    const item = { id, title, body, url: url || '/', require_interaction: !!requireInteraction, audience, endpoint: audience === 'endpoint' ? endpoint : null, scheduled_at: new Date(scheduledAt).toISOString(), sent_at: null, status: 'pending', created_at: new Date().toISOString() };
    const current = await listSchedules();
    current.push(item);
    await saveSchedules(current);
    return res.json({ ok: true, id });
  } catch { return res.status(500).json({ error: 'Failed to create schedule' }); }
});

router.delete('/schedules/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const current = await listSchedules();
    const next = current.filter(s => s.id !== id);
    await saveSchedules(next);
    return res.json({ ok: true });
  } catch { return res.status(500).json({ error: 'Failed to delete schedule' }); }
});

router.post('/schedules/:id/send', async (req, res) => {
  try {
    const id = req.params.id;
    const current = await listSchedules();
    const target = current.find(s => s.id === id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    let webpush;
    if (publicKey && privateKey) {
      try { webpush = await import('web-push'); webpush.default.setVapidDetails('mailto:admin@oncosaferx.com', publicKey, privateKey); } catch {}
    }
    let sent = 0;
    if (webpush) {
      const subs = Array.from(subscriptions);
      const payload = JSON.stringify({ title: target.title, body: target.body, data: { url: target.url || '/' }, requireInteraction: !!target.require_interaction });
      const targets = target.audience === 'endpoint' && target.endpoint ? subs.filter(x => x.endpoint === target.endpoint) : subs;
      await Promise.all(targets.map(async (sub) => { try { await webpush.default.sendNotification(sub, payload); sent++; } catch {} }));
    }
    target.status = 'sent';
    target.sent_at = new Date().toISOString();
    await saveSchedules(current);
    return res.json({ ok: true, sent });
  } catch { return res.status(500).json({ error: 'Failed to send schedule' }); }
});

export default router;
