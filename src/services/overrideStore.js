/**
 * Persistence for alert overrides (table: public.alert_overrides, supabase/migrations/006).
 * Uses Supabase when configured. The in-memory fallback exists for local development
 * only: in production a missing database must fail loudly, not silently drop clinical records.
 */
import { randomUUID } from 'crypto';
import supabaseService from '../config/supabase.js';

const TABLE = 'alert_overrides';

export class PersistenceUnavailableError extends Error {
  constructor() {
    super('Override storage is unavailable');
    this.status = 503;
  }
}

export function createMemoryStore() {
  const rows = [];
  return {
    kind: 'memory',
    async insert(rec) {
      const row = { id: randomUUID(), created_at: new Date().toISOString(), ...rec };
      rows.unshift(row);
      return row;
    },
    async list({ userId, limit = 50, offset = 0, ruleId } = {}) {
      let r = rows;
      if (userId) r = r.filter((x) => x.user_id === userId);
      if (ruleId) r = r.filter((x) => x.rule_id === ruleId);
      return { rows: r.slice(offset, offset + limit), total: r.length };
    },
    async summary() {
      return summarize(rows);
    },
  };
}

export function createSupabaseStore(client) {
  return {
    kind: 'supabase',
    async insert(rec) {
      const { data, error } = await client.from(TABLE).insert(rec).select().single();
      if (error) throw error;
      return data;
    },
    async list({ userId, limit = 50, offset = 0, ruleId } = {}) {
      let q = client.from(TABLE).select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      if (userId) q = q.eq('user_id', userId);
      if (ruleId) q = q.eq('rule_id', ruleId);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: data || [], total: count ?? (data || []).length };
    },
    async summary() {
      const { data, error } = await client.from(TABLE).select('rule_id, rule_version, action, reason_code').limit(50000);
      if (error) throw error;
      return summarize(data || []);
    },
  };
}

/** Per rule+version: how often it was accepted vs overridden, and why. */
export function summarize(rows) {
  const out = new Map();
  for (const r of rows) {
    const k = `${r.rule_id}|${r.rule_version || ''}`;
    const e = out.get(k) || { rule_id: r.rule_id, rule_version: r.rule_version || null, accepted: 0, overridden: 0, reasons: {} };
    if (r.action === 'accept') e.accepted++;
    else { e.overridden++; e.reasons[r.reason_code] = (e.reasons[r.reason_code] || 0) + 1; }
    out.set(k, e);
  }
  return [...out.values()].map((e) => ({ ...e, override_rate: e.accepted + e.overridden ? e.overridden / (e.accepted + e.overridden) : 0 }));
}

const devMemory = createMemoryStore();

/** Pick the store for the current environment. */
export function getOverrideStore(env = process.env) {
  if (supabaseService?.enabled && supabaseService.client) return createSupabaseStore(supabaseService.client);
  if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') return devMemory;
  throw new PersistenceUnavailableError();
}
