// Simple in-app medication reminder manager using the Web Notifications API.
// Notes:
// - Runs only while the app is open (no background service worker).
// - Stores schedules in localStorage and checks every 30s.

export type ScheduledReminder = {
  id: string; // med id
  title: string; // medication name
  message: string; // e.g., dosage + instructions
  dueAt: number; // epoch ms
  periodMs?: number; // if recurring
};

const STORAGE_KEY = 'osrx_medication_reminders';
const ENABLED_KEY = 'osrx_medication_reminders_enabled';
let intervalHandle: number | null = null;

const now = () => Date.now();

function loadReminders(): ScheduledReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function saveReminders(items: ScheduledReminder[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

function parseFrequencyToPeriodMs(freq: string | undefined): number | undefined {
  if (!freq) return undefined;
  const f = String(freq).toLowerCase();
  // Common patterns
  if (f.includes('once daily') || f.includes('daily') || f.includes('every day')) return 24 * 60 * 60 * 1000;
  if (f.includes('twice daily') || f.includes('bid')) return 12 * 60 * 60 * 1000;
  if (f.includes('three times') || f.includes('tid')) return 8 * 60 * 60 * 1000;
  if (f.includes('four times') || f.includes('qid')) return 6 * 60 * 60 * 1000;
  const m = f.match(/every\s+(\d{1,2})\s*hour/);
  if (m) {
    const hours = Math.max(1, Math.min(24, parseInt(m[1], 10) || 0));
    return hours * 60 * 60 * 1000;
  }
  return undefined;
}

function parseNextDueAt(nextDose?: string): number | undefined {
  if (!nextDose) return undefined;
  const t = Date.parse(nextDose);
  return Number.isFinite(t) ? t : undefined;
}

function nextOccurrenceForTime(hhmm: string): number | undefined {
  // hhmm in "HH:MM" 24h format
  const m = String(hhmm || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return undefined;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (!(h >= 0 && h <= 23 && min >= 0 && min <= 59)) return undefined;
  const nowD = new Date();
  const d = new Date();
  d.setHours(h, min, 0, 0);
  if (d.getTime() <= nowD.getTime()) {
    // move to tomorrow
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

function notificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

async function ensurePermission(): Promise<NotificationPermission> {
  if (!notificationSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const p = await Notification.requestPermission();
    return p;
  } catch { return 'denied'; }
}

function notify(rem: ScheduledReminder) {
  try {
    // eslint-disable-next-line no-new
    new Notification(rem.title, { body: rem.message, tag: rem.id, requireInteraction: false });
  } catch {}
}

function tick() {
  const items = loadReminders();
  if (!items.length) return;
  const t = now();
  let changed = false;
  const out: ScheduledReminder[] = [];
  for (const r of items) {
    if (r.dueAt <= t) {
      notify(r);
      if (r.periodMs && r.periodMs > 0) {
        // reschedule to the next interval (avoid drift by adding period)
        out.push({ ...r, dueAt: r.dueAt + r.periodMs });
      } else {
        // one-shot reminder, drop it
        changed = true;
      }
    } else {
      out.push(r);
    }
  }
  if (changed || out.length !== items.length) saveReminders(out);
}

function startLoop() {
  if (intervalHandle != null) return;
  intervalHandle = window.setInterval(tick, 30_000);
}

function stopLoop() {
  if (intervalHandle != null) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

export const reminderManager = {
  isSupported: () => notificationSupported(),
  isEnabled: (): boolean => {
    try { return localStorage.getItem(ENABLED_KEY) === '1'; } catch { return false; }
  },
  async enableForMedications(medications: Array<any>): Promise<{ scheduled: number; permission: NotificationPermission }>{
    const perm = await ensurePermission();
    if (perm !== 'granted') {
      try { localStorage.setItem(ENABLED_KEY, '0'); } catch {}
      return { scheduled: 0, permission: perm };
    }
    const items: ScheduledReminder[] = [];
    const nowMs = now();
    (medications || [])
      .filter((m) => m && m.isActive)
      .forEach((m) => {
        const title = m.drug?.name || m.drugName || m.name || 'Medication Reminder';
        const message = [m.dosage, m.frequency, m.instructions].filter(Boolean).join(' - ');
        const doseTimes: string[] = Array.isArray(m.doseTimes) ? m.doseTimes : [];
        if (doseTimes.length > 0) {
          doseTimes.forEach((t) => {
            const dueAt = nextOccurrenceForTime(t) ?? (nowMs + 60_000);
            items.push({ id: `${m.id}:${t}`, title, message, dueAt, periodMs: 24 * 60 * 60 * 1000 });
          });
        } else {
          const dueAt = parseNextDueAt(m.nextDose) ?? (nowMs + 60_000); // default: in 1 minute
          const periodMs = parseFrequencyToPeriodMs(m.frequency) || undefined;
          items.push({ id: String(m.id), title, message, dueAt, periodMs });
        }
      });
    saveReminders(items);
    try { localStorage.setItem(ENABLED_KEY, '1'); } catch {}
    startLoop();
    // quick tick to register immediate ones
    setTimeout(tick, 200);
    return { scheduled: items.length, permission: 'granted' } as const;
  },
  disable() {
    try { localStorage.setItem(ENABLED_KEY, '0'); } catch {}
    saveReminders([]);
    stopLoop();
  },
  reschedule(medications: Array<any>) {
    if (!reminderManager.isEnabled()) return;
    const items: ScheduledReminder[] = [];
    const nowMs = now();
    (medications || []).filter((m) => m && m.isActive).forEach((m) => {
      const title = m.drug?.name || m.drugName || m.name || 'Medication Reminder';
      const message = [m.dosage, m.frequency, m.instructions].filter(Boolean).join(' - ');
      const doseTimes: string[] = Array.isArray(m.doseTimes) ? m.doseTimes : [];
      if (doseTimes.length > 0) {
        doseTimes.forEach((t) => {
          const dueAt = nextOccurrenceForTime(t) ?? (nowMs + 60_000);
          items.push({ id: `${m.id}:${t}`, title, message, dueAt, periodMs: 24 * 60 * 60 * 1000 });
        });
      } else {
        const dueAt = parseNextDueAt(m.nextDose) ?? (nowMs + 60_000);
        const periodMs = parseFrequencyToPeriodMs(m.frequency) || undefined;
        items.push({ id: String(m.id), title, message, dueAt, periodMs });
      }
    });
    saveReminders(items);
    startLoop();
  }
};

// Auto-start loop if enabled on app load
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(ENABLED_KEY) === '1' && notificationSupported() && Notification.permission === 'granted') {
      startLoop();
    }
  } catch {}
}
