import express from 'express';
import Joi from 'joi';
import { authenticateSupabase, requireRole } from '../middleware/supabaseAuth.js';
import { getOverrideStore } from '../services/overrideStore.js';

export const OVERRIDE_REASONS = [
  'not_clinically_relevant',
  'previously_tolerated',
  'benefit_outweighs_risk',
  'dose_already_adjusted',
  'monitoring_in_place',
  'no_alternative_available',
  'other',
];

const bodySchema = Joi.object({
  action: Joi.string().valid('accept', 'override').required(),
  source: Joi.string().valid('dosing', 'interaction', 'cds-hooks', 'other').default('other'),
  ruleId: Joi.string().pattern(/^[A-Za-z0-9._|:-]+$/).max(200).required(),
  ruleVersion: Joi.string().max(64).allow(null, ''),
  cardId: Joi.string().max(100).allow(null, ''),
  reasonCode: Joi.string().valid(...OVERRIDE_REASONS)
    .when('action', { is: 'override', then: Joi.required(), otherwise: Joi.optional() }),
  reasonText: Joi.string().max(500).allow(null, '')
    .when('reasonCode', { is: 'other', then: Joi.string().min(3).max(500).required() }),
  // Opaque key supplied by the caller. Do not send names, MRNs or dates of birth.
  patientRef: Joi.string().max(128).allow(null, ''),
  context: Joi.object().max(20).default({}),
});

export function createOverrideRouter({
  authenticate = authenticateSupabase,
  requireAdminRole = requireRole(['admin', 'super_admin']),
  getStore = getOverrideStore,
} = {}) {
  const router = express.Router();
  router.use(authenticate);

  const withStore = (handler) => async (req, res) => {
    try {
      return await handler(req, res, getStore());
    } catch (e) {
      const status = e?.status || 500;
      if (status >= 500) console.error('overrides error:', e?.message || e);
      return res.status(status).json({ error: status === 503 ? 'Override storage is unavailable' : 'Failed to process request' });
    }
  };

  // Record how a clinician responded to an alert. The user comes from the verified
  // session, never from the request body.
  router.post('/', withStore(async (req, res, store) => {
    const { value, error } = bodySchema.validate(req.body || {}, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ error: 'Invalid override', details: error.details.map((d) => d.message) });
    const row = await store.insert({
      user_id: req.user.id,
      source: value.source,
      rule_id: value.ruleId,
      rule_version: value.ruleVersion || null,
      card_id: value.cardId || null,
      action: value.action,
      reason_code: value.reasonCode || null,
      reason_text: value.reasonText || null,
      patient_ref: value.patientRef || null,
      context: value.context,
    });
    return res.status(201).json(row);
  }));

  // Your own history.
  router.get('/', withStore(async (req, res, store) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const out = await store.list({ userId: req.user.id, limit, offset, ruleId: req.query.ruleId });
    return res.json({ count: out.total, overrides: out.rows });
  }));

  // Alert-fatigue view for admins: which rules get overridden, and why.
  router.get('/summary', requireAdminRole, withStore(async (_req, res, store) => {
    return res.json({ rules: await store.summary() });
  }));

  return router;
}

export default createOverrideRouter();
