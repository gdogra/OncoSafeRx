import client from 'prom-client'

// Helper to get or create a metric safely across module imports
function counter(name, help, labelNames = []) {
  const existing = client.register.getSingleMetric(name)
  if (existing) return existing
  return new client.Counter({ name, help, labelNames })
}

export const authDeniedCounter = counter(
  'auth_denied_total',
  'Count of denied auth attempts',
  ['reason', 'path']
)

export const httpErrorCounter = counter(
  'http_errors_total',
  'Count of HTTP error responses',
  ['status', 'path']
)

export function incAuthDenied(reason = 'unknown', path = 'unknown') {
  try { authDeniedCounter.labels(String(reason), String(path)).inc() } catch {}
}

export function incHttpError(status = 500, path = 'unknown') {
  try { httpErrorCounter.labels(String(status), String(path)).inc() } catch {}
}

// Total requests by route and method
export const httpRequestCounter = counter(
  'http_requests_total',
  'Total HTTP requests by method and route',
  ['method', 'path']
)

export function incHttpRequest(method = 'GET', path = 'unknown') {
  try { httpRequestCounter.labels(String(method), String(path)).inc() } catch {}
}

// Rate limit hits
export const rateLimitHits = counter(
  'rate_limit_hits_total',
  'Count of rate limit hits by scope',
  ['scope', 'path']
)

export function incRateLimitHit(scope = 'general', path = 'unknown') {
  try { rateLimitHits.labels(String(scope), String(path)).inc() } catch {}
}

export default {
  incAuthDenied,
  incHttpError,
  incHttpRequest,
  incRateLimitHit,
}
