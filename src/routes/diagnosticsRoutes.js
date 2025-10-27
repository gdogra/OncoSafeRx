import express from 'express';
import supabaseService from '../config/supabase.js';
import { optionalSupabaseAuth } from '../middleware/supabaseAuth.js';
import fetch from 'node-fetch';

const router = express.Router();

// Verify authenticated user, users row presence, and patients list
router.get('/patients/check', optionalSupabaseAuth, async (req, res) => {
  try {
    const supaEnabled = !!supabaseService?.enabled;
    const authed = !!req.user;
    const user = req.user || null;

    if (!authed) {
      return res.status(401).json({
        ok: false,
        error: 'No authenticated user. Ensure Authorization: Bearer <token> is forwarded.',
        supabaseEnabled: supaEnabled,
      });
    }

    let usersRowExists = null;
    let patients = [];
    let patientsCount = 0;
    let lastPatient = null;
    let potentialIssue = null;

    if (supabaseService.enabled && supabaseService.client) {
      try {
        const { data: urow, error: uerr } = await supabaseService.client
          .from('users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        usersRowExists = !!urow && !uerr;
        if (!usersRowExists) potentialIssue = 'missing_public_users_row_for_auth_user';
      } catch {
        usersRowExists = false;
      }

      try {
        const list = await supabaseService.listPatientsByUser(user.id);
        patients = Array.isArray(list) ? list : [];
        patientsCount = patients.length;
        lastPatient = patients[0] || null;
      } catch {
        patients = [];
      }
    }

    return res.json({
      ok: true,
      supabaseEnabled: supaEnabled,
      auth: { id: user.id, email: user.email },
      usersRowExists,
      patientsCount,
      lastPatientSample: lastPatient ? { id: lastPatient.id, user_id: lastPatient.user_id } : null,
      potentialIssue,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'diagnostics_failed' });
  }
});

// Attempt a minimal insert to capture DB error (does not persist if constraints fail)
router.post('/patients/create-test', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ ok: false, error: 'unauthenticated' });
    if (!supabaseService.enabled || !supabaseService.client) {
      return res.status(503).json({ ok: false, error: 'supabase_disabled' });
    }

    const now = new Date().toISOString();
    const payload = {
      user_id: req.user.id,
      data: {
        id: undefined,
        demographics: { mrn: `diag-${Date.now()}`, firstName: 'Diag', lastName: 'Insert' },
        createdAt: now,
      },
      updated_at: now,
    };

    try {
      const { data, error, status } = await supabaseService.client
        .from('patients')
        .insert(payload)
        .select()
        .maybeSingle();

      if (error) {
        return res.status(200).json({ ok: false, status, dbError: { message: error.message, code: error.code, details: error.details } });
      }
      return res.json({ ok: true, patient: data || null });
    } catch (e) {
      return res.status(200).json({ ok: false, exception: e?.message || 'insert_failed' });
    }
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'diagnostics_failed' });
  }
});

export default router;

// Evidence tools diagnostics: sanity-check core analysis endpoints
router.get('/evidence-tools', async (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const withTimeout = async (p, ms) => Promise.race([
    p,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  ]);
  const results = {};
  async function probe(name, path, init = {}) {
    try {
      const r = await withTimeout(fetch(base + path, { ...init, headers: { 'Accept': 'application/json', ...(init.headers || {}) } }), 4000);
      const status = r.status;
      let body = null;
      try { body = await r.json(); } catch {}
      results[name] = { ok: r.ok, status, sample: body && (body.count || body.total || body.data?.length || body.results?.length || null) };
    } catch (e) {
      results[name] = { ok: false, error: e.message };
    }
  }
  await Promise.all([
    probe('interactions_known', '/api/interactions/known?limit=1'),
    probe('enhanced_drug_search', '/api/drugs/enhanced/search?q=aspirin'),
    probe('clinical_trials_condition', '/api/clinical-trials/search?condition=breast%20cancer&pageSize=5'),
    probe('ddi_engine', '/api/interactions?drugA=aspirin&drugB=ibuprofen'),
    probe('genomics_panel', '/api/genomics/panel'),
    probe('genomics_versions', '/api/genomics/versions'),
  ]);
  return res.json({ ok: true, base, results });
});
