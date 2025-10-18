import express from 'express'
import { authenticateTenantApiKey, listTenantsConfigured } from '../middleware/apiKeys.js'
import { rateLimitByTenant } from '../middleware/tenantRateLimit.js'
import supabaseService from '../config/supabase.js'
import auditLogService from '../services/auditLogService.js'

const router = express.Router()

// All integration endpoints require tenant API key and are rate-limited per tenant
router.use(authenticateTenantApiKey)
router.use(rateLimitByTenant)

router.get('/ping', async (req, res) => {
  const body = { ok: true, tenant: req.tenantId, keyPhase: req.tenantKeyPhase, time: new Date().toISOString() }
  try {
    await auditLogService.logEvent('integration_access', {
      userId: `tenant:${req.tenantId}`,
      userEmail: `integration@${req.tenantId}`,
      userRole: 'integration',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      resourceType: 'integration',
      action: 'ping',
      endpoint: '/api/integrations/ping',
      outcome: 'success',
      statusCode: 200,
      message: `keyPhase=${req.tenantKeyPhase || 'active'}`,
    })
  } catch {}
  res.json(body)
})

// Example: minimal patient lookup by MRN within tenant context
router.get('/patients/lookup', async (req, res) => {
  try {
    const mrn = String(req.query.mrn || '').trim()
    if (!mrn) return res.status(400).json({ error: 'mrn required' })
    if (!supabaseService.enabled) {
      // No-op: iterate dev store across current tenant users if possible
      // In NoOp we cannot tenant-scope; return empty for safety
      return res.json({ patients: [] })
    }
    const { data, error } = await supabaseService.client
      .from('patients')
      .select('id,user_id,data,created_at,updated_at')
      .eq('mrn', mrn)
      .limit(10)
    if (error) {
      try { await auditLogService.logEvent('integration_access', { userId: `tenant:${req.tenantId}`, resourceType: 'integration', action: 'patients_lookup', endpoint: '/api/integrations/patients/lookup', outcome: 'error', statusCode: 500, message: `keyPhase=${req.tenantKeyPhase || 'active'}; ${error.message}` }) } catch {}
      return res.status(500).json({ error: error.message })
    }
    const payload = {
      patients: (data || []).map(r => ({ id: r.id, user_id: r.user_id, created_at: r.created_at, updated_at: r.updated_at, ...r.data }))
    }
    try { await auditLogService.logEvent('integration_access', { userId: `tenant:${req.tenantId}`, resourceType: 'integration', action: 'patients_lookup', endpoint: '/api/integrations/patients/lookup', outcome: 'success', statusCode: 200, message: `keyPhase=${req.tenantKeyPhase || 'active'}` }) } catch {}
    return res.json(payload)
  } catch (e) {
    try { await auditLogService.logEvent('integration_access', { userId: `tenant:${req.tenantId}`, resourceType: 'integration', action: 'patients_lookup', endpoint: '/api/integrations/patients/lookup', outcome: 'error', statusCode: 500, message: `keyPhase=${req.tenantKeyPhase || 'active'}; ${e?.message || 'lookup_failed'}` }) } catch {}
    return res.status(500).json({ error: 'lookup_failed' })
  }
})

// Diagnostics: list tenants configured (keys hidden)
router.get('/diagnostics/config', (_req, res) => {
  return res.json({ tenants: listTenantsConfigured() })
})

export default router
