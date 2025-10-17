// Simple per-tenant rate limiter (in-memory)
// Supports TENANT_RATE_LIMITS JSON: {"default":{"windowMs":60000,"max":300},"tenantA":{"max":600}}
// and TENANT_WINDOW_MS, TENANT_MAX as fallback defaults

import { incRateLimitHit } from '../utils/metrics.js'

const DEFAULT_WINDOW = parseInt(process.env.TENANT_WINDOW_MS || '60000', 10)
const DEFAULT_MAX = parseInt(process.env.TENANT_MAX || '300', 10)

let overrides = {}
try {
  overrides = JSON.parse(process.env.TENANT_RATE_LIMITS || '{}')
} catch {}

const buckets = new Map() // tenantId -> { count, resetAt }

function getLimits(tenantId) {
  const def = overrides.default || {}
  const ovr = overrides[tenantId] || {}
  const windowMs = Number(ovr.windowMs ?? def.windowMs ?? DEFAULT_WINDOW)
  const max = Number(ovr.max ?? def.max ?? DEFAULT_MAX)
  return { windowMs, max }
}

export function rateLimitByTenant(req, res, next) {
  try {
    const tenantId = String(req.tenantId || req.headers['x-tenant-id'] || 'unknown')
    const { windowMs, max } = getLimits(tenantId)
    const now = Date.now()
    let bucket = buckets.get(tenantId)
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs }
      buckets.set(tenantId, bucket)
    }
    if (bucket.count >= max) {
      try { incRateLimitHit('tenant', req.path || req.originalUrl || 'unknown') } catch {}
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
      res.setHeader('Retry-After', String(retryAfter))
      return res.status(429).json({ error: 'Tenant rate limit exceeded', retryAfter })
    }
    bucket.count++
    res.setHeader('X-RateLimit-Limit', String(max))
    res.setHeader('X-RateLimit-Remaining', String(max - bucket.count))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))
    return next()
  } catch (e) {
    return next()
  }
}

export default { rateLimitByTenant }

