// Tenant-scoped API key authentication with key rotation support
// Supports env JSON mapping: TENANT_API_KEYS='{"tenantA":["key1"],"tenantB":["key2","key3"]}'
// Also supports per-tenant env vars: TENANT_KEY_tenantA=key1,key2
// Rotation phases: active and next. Keys are stored/compared as hashes.

import { createHash } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

const STORE_PATH = process.env.TENANT_KEYS_STORE || path.join(process.cwd(), 'data/tenant-api-keys.json')
const KEY_SALT = process.env.TENANT_API_KEY_SALT || ''

function hashKey(raw) {
  return createHash('sha256').update(String(raw) + KEY_SALT).digest('hex')
}

function normalizeKeys(x) {
  const arr = Array.isArray(x) ? x : String(x || '').split(',')
  return new Set(arr.map(s => String(s).trim()).filter(Boolean))
}

function parseTenantKeyPhases() {
  const out = new Map()
  try {
    const rawActive = process.env.TENANT_API_KEYS_ACTIVE
    const rawNext = process.env.TENANT_API_KEYS_NEXT
    const rawLegacy = process.env.TENANT_API_KEYS
    const active = rawActive ? JSON.parse(rawActive) : (rawLegacy ? JSON.parse(rawLegacy) : {})
    const next = rawNext ? JSON.parse(rawNext) : {}
    for (const [tenant, keys] of Object.entries(active)) {
      const a = normalizeKeys(keys)
      const n = normalizeKeys(next[tenant] || [])
      out.set(tenant, { active: a, next: n })
    }
    for (const [tenant, keys] of Object.entries(next)) {
      if (!out.has(tenant)) out.set(tenant, { active: new Set(), next: normalizeKeys(keys) })
    }
  } catch {}
  // Fallback per-tenant envs
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith('TENANT_KEY_')) {
      const tenant = k.replace('TENANT_KEY_', '')
      const existing = out.get(tenant) || { active: new Set(), next: new Set() }
      String(v || '').split(',').map(s => s.trim()).filter(Boolean).forEach(key => existing.active.add(key))
      out.set(tenant, existing)
    }
    if (k.startsWith('TENANT_KEY_NEXT_')) {
      const tenant = k.replace('TENANT_KEY_NEXT_', '')
      const existing = out.get(tenant) || { active: new Set(), next: new Set() }
      String(v || '').split(',').map(s => s.trim()).filter(Boolean).forEach(key => existing.next.add(key))
      out.set(tenant, existing)
    }
  }
  return out
}

// In-memory hashed keys: Map(tenant -> { active: Set(hash), next: Set(hash) })
const tenantKeys = new Map()

async function loadPersistedKeys() {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    const json = JSON.parse(raw)
    const tenants = json?.tenants || {}
    for (const [tenant, phases] of Object.entries(tenants)) {
      const act = new Set(Array.isArray(phases.active) ? phases.active : [])
      const nxt = new Set(Array.isArray(phases.next) ? phases.next : [])
      tenantKeys.set(tenant, { active: act, next: nxt })
    }
  } catch {}
}

function mergeEnvKeysIntoMemory() {
  const parsed = parseTenantKeyPhases()
  for (const [tenant, sets] of parsed.entries()) {
    const act = tenantKeys.get(tenant)?.active || new Set()
    const nxt = tenantKeys.get(tenant)?.next || new Set()
    ;(sets.active || new Set()).forEach((k) => act.add(hashKey(k)))
    ;(sets.next || new Set()).forEach((k) => nxt.add(hashKey(k)))
    tenantKeys.set(tenant, { active: act, next: nxt })
  }
}

async function persistKeys() {
  try {
    const tenants = {}
    for (const [tenant, sets] of tenantKeys.entries()) {
      tenants[tenant] = { active: Array.from(sets.active || []), next: Array.from(sets.next || []) }
    }
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true })
    await fs.writeFile(STORE_PATH, JSON.stringify({ tenants, version: 1 }, null, 2))
  } catch {}
}

// Initialize store
await loadPersistedKeys()
mergeEnvKeysIntoMemory()

export function authenticateTenantApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.api_key
  const tenantId = req.headers['x-tenant-id'] || req.query.tenant || req.params?.tenantId
  if (!key || !tenantId) {
    return res.status(401).json({ error: 'API key and tenant required' })
  }
  const cfg = tenantKeys.get(String(tenantId))
  const k = String(key)
  const kh = hashKey(k)
  let phase = null
  if (cfg?.active?.has(kh)) phase = 'active'
  else if (cfg?.next?.has(kh)) phase = 'next'
  if (!phase) {
    return res.status(403).json({ error: 'Invalid API key for tenant' })
  }
  req.apiAuth = true
  req.tenantId = String(tenantId)
  req.tenantKeyPhase = phase
  return next()
}

// Utility to expose current config without keys (for diagnostics)
export function listTenantsConfigured() {
  return Array.from(tenantKeys.entries()).map(([tenant, sets]) => ({ tenant, hasActive: sets.active?.size > 0, hasNext: sets.next?.size > 0, activeCount: sets.active?.size || 0, nextCount: sets.next?.size || 0 }))
}

// Admin helpers to manage keys in-memory and persist (hashed only)
export async function addTenantKeys(tenant, phase, keys = []) {
  const t = String(tenant)
  const p = phase === 'next' ? 'next' : 'active'
  const sets = tenantKeys.get(t) || { active: new Set(), next: new Set() }
  for (const raw of keys) {
    sets[p].add(hashKey(raw))
  }
  tenantKeys.set(t, sets)
  await persistKeys()
  return { tenant: t, phase: p, counts: { active: sets.active.size, next: sets.next.size } }
}

export async function removeTenantKeys(tenant, phase, keys = []) {
  const t = String(tenant)
  const p = phase === 'next' ? 'next' : 'active'
  const sets = tenantKeys.get(t) || { active: new Set(), next: new Set() }
  for (const raw of keys) {
    sets[p].delete(hashKey(raw))
  }
  tenantKeys.set(t, sets)
  await persistKeys()
  return { tenant: t, phase: p, counts: { active: sets.active.size, next: sets.next.size } }
}

export async function promoteTenantKeys(tenant, options = { retireActive: true }) {
  const t = String(tenant)
  const sets = tenantKeys.get(t) || { active: new Set(), next: new Set() }
  if (options.retireActive) {
    sets.active = new Set(sets.next)
  } else {
    for (const h of sets.next) sets.active.add(h)
  }
  sets.next = new Set()
  tenantKeys.set(t, sets)
  await persistKeys()
  return { tenant: t, counts: { active: sets.active.size, next: sets.next.size } }
}

export async function clearTenantPhase(tenant, phase) {
  const t = String(tenant)
  const p = phase === 'next' ? 'next' : 'active'
  const sets = tenantKeys.get(t) || { active: new Set(), next: new Set() }
  sets[p] = new Set()
  tenantKeys.set(t, sets)
  await persistKeys()
  return { tenant: t, cleared: p }
}

export function summarizeTenants() {
  return listTenantsConfigured()
}

export default { authenticateTenantApiKey, listTenantsConfigured }
