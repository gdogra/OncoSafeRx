/**
 * CDS Hooks 2.0 service.
 *
 *   GET  /cds-services                       discovery (public by spec)
 *   POST /cds-services/oncosaferx-order-sign      hook: order-sign   (new medication orders)
 *   POST /cds-services/oncosaferx-patient-view    hook: patient-view (critical findings only)
 *   POST /cds-services/:id/feedback          card outcome (accepted / overridden + reason)
 *
 * Every service call must carry an EHR-signed JWT (src/cds/auth.js); unsigned calls are accepted
 * only in development/test. Cards come from src/cds/analyze.js and are linked to their rule via
 * the card uuid (src/cds/ruleIndex.js), so feedback is attributable without server-side state.
 */
import express from 'express';
import { getCdsConfig } from '../cds/config.js';
import { verifyCdsRequest, CdsAuthError } from '../cds/auth.js';
import { analyze } from '../cds/analyze.js';
import { buildCards, OVERRIDE_REASONS } from '../cds/cards.js';
import { ruleForCard } from '../cds/ruleIndex.js';
import { getOverrideStore } from '../services/overrideStore.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PID = '{{context.patientId}}';

export const SERVICES = [
  {
    id: 'oncosaferx-order-sign', hook: 'order-sign', title: 'OncoSafeRx medication safety (order sign)',
    description: 'Checks new medication orders for major interactions, QT and serotonin load, pharmacogenomic and renal/cardiac rules.',
    prefetch: {
      patient: `Patient/${PID}`,
      medications: `MedicationRequest?patient=${PID}&status=active`,
      labs: `Observation?patient=${PID}&category=laboratory&_sort=-date&_count=200`,
      vitals: `Observation?patient=${PID}&category=vital-signs&_sort=-date&_count=50`,
    },
  },
  {
    id: 'oncosaferx-patient-view', hook: 'patient-view', title: 'OncoSafeRx critical medication findings (chart open)',
    description: 'Shows only critical findings about the current medication list when a chart is opened.',
    prefetch: {
      patient: `Patient/${PID}`,
      medications: `MedicationRequest?patient=${PID}&status=active`,
      labs: `Observation?patient=${PID}&category=laboratory&_sort=-date&_count=200`,
      vitals: `Observation?patient=${PID}&category=vital-signs&_sort=-date&_count=50`,
    },
  },
];

export function createCdsRouter({ getConfig = () => getCdsConfig(), fetchImpl = fetch, getStore = getOverrideStore } = {}) {
  const router = express.Router();

  router.get('/cds-services', (req, res) => {
    res.json({ services: SERVICES.map(({ id, hook, title, description, prefetch }) => ({ id, hook, title, description, prefetch })) });
  });

  const base = (cfg, req) => cfg.publicBaseUrl || (cfg.allowUnsigned ? `${req.protocol}://${req.get('host')}` : '');

  async function authenticate(req, res, id, suffix = '') {
    const cfg = getConfig();
    if (cfg.problems.length) {
      console.error(`CDS Hooks is not configured: missing ${cfg.problems.join(', ')}`);
      res.status(503).json({ error: 'CDS Hooks is not configured on this server' });
      return null;
    }
    try {
      return await verifyCdsRequest(req, { cfg, expectedAud: `${base(cfg, req)}/cds-services/${id}${suffix}`, fetchImpl });
    } catch (e) {
      if (e instanceof CdsAuthError) {
        if (e.status >= 500) console.error('CDS auth error:', e.message);
        res.status(e.status).json({ error: e.status === 401 ? 'Unauthorized' : 'Service unavailable' });
        return null;
      }
      throw e;
    }
  }

  router.post('/cds-services/:id', async (req, res) => {
    const service = SERVICES.find((s) => s.id === req.params.id);
    if (!service) return res.status(404).json({ error: 'Unknown CDS service' });
    if (!(await authenticate(req, res, service.id))) return;

    const b = req.body || {};
    if (b.hook !== service.hook) return res.status(400).json({ error: `Expected hook "${service.hook}"` });
    if (!UUID.test(String(b.hookInstance || ''))) return res.status(400).json({ error: 'hookInstance must be a UUID' });
    const ctx = b.context || {};
    if (typeof ctx.patientId !== 'string' || !ctx.patientId) return res.status(400).json({ error: 'context.patientId is required' });
    if (service.hook === 'order-sign' && !(ctx.draftOrders && Array.isArray(ctx.draftOrders.entry))) {
      return res.status(400).json({ error: 'context.draftOrders must be a FHIR Bundle' });
    }

    const result = analyze({ hook: service.hook, draftOrders: ctx.draftOrders, prefetch: b.prefetch || {} });
    const cards = buildCards({
      findings: result.findings,
      missing: service.hook === 'order-sign' ? result.missing : [],
      stale: service.hook === 'order-sign' ? result.stale : [],
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ cards });
  });

  router.post('/cds-services/:id/feedback', async (req, res) => {
    const service = SERVICES.find((s) => s.id === req.params.id);
    if (!service) return res.status(404).json({ error: 'Unknown CDS service' });
    const who = await authenticate(req, res, service.id, '/feedback');
    if (!who) return;

    const items = Array.isArray(req.body?.feedback) ? req.body.feedback : null;
    if (!items || !items.length || items.length > 50) return res.status(400).json({ error: 'feedback must be a non-empty array (max 50)' });
    const known = new Set(OVERRIDE_REASONS.map((r) => r.code));
    const records = [];
    for (const f of items) {
      if (!UUID.test(String(f?.card || '')) || !['accepted', 'overridden'].includes(f?.outcome)) {
        return res.status(400).json({ error: 'each feedback item needs a card uuid and outcome "accepted" or "overridden"' });
      }
      const rule = ruleForCard(f.card);
      const override = f.outcome === 'overridden';
      const code = f.overrideReason?.reason?.code;
      const comment = typeof f.overrideReason?.userComment === 'string' ? f.overrideReason.userComment : '';
      const display = f.overrideReason?.reason?.display || '';
      const reasonCode = !override ? null : known.has(code) ? code : (code || comment || display) ? 'other' : 'unspecified';
      const reasonText = override && reasonCode !== null && !known.has(code)
        ? [code && `code: ${code}`, display, comment].filter(Boolean).join(' | ').slice(0, 500) || null
        : (override && comment ? comment.slice(0, 500) : null);
      records.push({
        user_id: null, ehr_issuer: who.issuer, source: 'cds-hooks', rule_id: rule?.ruleId || 'UNKNOWN', rule_version: rule?.version || null,
        card_uuid: f.card, action: override ? 'override' : 'accept', reason_code: reasonCode, reason_text: reasonText, patient_ref: null,
        context: { service: service.id, hook: service.hook, ...(Array.isArray(f.acceptedSuggestions) ? { acceptedSuggestions: f.acceptedSuggestions.length } : {}) },
      });
    }
    try {
      const store = getStore();
      for (const r of records) await store.insert(r);
    } catch (e) {
      console.error('CDS feedback not stored:', e?.message || e);
      return res.status(e?.status || 500).json({ error: 'Feedback could not be recorded' });
    }
    return res.status(200).json({ recorded: records.length });
  });

  return router;
}

export default createCdsRouter();
