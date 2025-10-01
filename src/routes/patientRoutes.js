import express from 'express';
import supabaseService from '../config/supabase.js';
import { optionalSupabaseAuth } from '../middleware/supabaseAuth.js';

const router = express.Router();

// All endpoints are no-ops if Supabase is not configured or user unauthenticated

router.get('/', optionalSupabaseAuth, async (req, res) => {
  try {
    // Create a default user if none is authenticated (for production without login)
    if (!req.user) {
      req.user = {
        id: 'default-user-production',
        email: 'user@oncosaferx.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user for unauthenticated request');
    }
    
    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable', patients: [], total: 0 });
    }
    const q = String(req.query.q || '').toLowerCase().trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize || '10'), 10) || 10));

    const list = await supabaseService.listPatientsByUser(req.user.id);
    let patients = (list || []).map(r => ({ id: r.id, ...r.data }));
    if (q) {
      patients = patients.filter(p => {
        try {
          const d = p.demographics || {};
          const name = `${d.firstName || ''} ${d.lastName || ''}`.toLowerCase();
          const mrn = String(d.mrn || '').toLowerCase();
          return name.includes(q) || mrn.includes(q);
        } catch { return false; }
      });
    }
    const total = patients.length;
    const start = (page - 1) * pageSize;
    const items = patients.slice(start, start + pageSize);
    return res.json({ patients: items, total, page, pageSize, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to list patients' });
  }
});

router.post('/', optionalSupabaseAuth, async (req, res) => {
  try {
    // Create a default user if none is authenticated (for production without login)
    if (!req.user) {
      req.user = {
        id: 'default-user-production',
        email: 'user@oncosaferx.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user for patient creation');
    }
    
    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const patient = req.body?.patient;
    if (!patient) return res.status(400).json({ error: 'Missing patient' });

    // Basic validation
    const d = patient.demographics || {};
    if (!d.firstName || !d.lastName) {
      return res.status(400).json({ error: 'Missing required demographics: firstName, lastName' });
    }
    const mrn = (d.mrn || '').toString().trim();

    // Enforce MRN uniqueness per user if provided
    if (mrn) {
      try {
        const q = supabaseService.client
          .from('patients')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('mrn', mrn)
          .limit(1);
        const { data, error } = await q;
        if (!error && Array.isArray(data) && data.length) {
          const existingId = data[0].id;
          if (!patient.id || patient.id !== existingId) {
            return res.status(409).json({ error: 'MRN already exists for this user' });
          }
        }
      } catch (_) {}
    }
    console.log('🔄 Attempting to save patient for user:', req.user.id);
    const saved = await supabaseService.upsertPatient(req.user.id, patient);
    console.log('✅ Patient saved successfully:', { id: saved.id, userId: saved.user_id });
    return res.json({ ok: true, patient: saved, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save patient' });
  }
});

router.get('/:id', optionalSupabaseAuth, async (req, res) => {
  try {
    // Create a default user if none is authenticated (for production without login)
    if (!req.user) {
      req.user = {
        id: 'default-user-production',
        email: 'user@oncosaferx.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user for patient retrieval');
    }
    
    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const id = req.params.id;
    const { data, error } = await supabaseService.client
      .from('patients')
      .select('id,user_id,data,created_at,updated_at')
      .eq('user_id', req.user.id)
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ error: 'Not found' });
    return res.json({ patient: data, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch patient' });
  }
});

router.delete('/:id', optionalSupabaseAuth, async (req, res) => {
  try {
    // Create a default user if none is authenticated (for production without login)
    if (!req.user) {
      req.user = {
        id: 'default-user-production',
        email: 'user@oncosaferx.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user for patient deletion');
    }
    
    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const id = req.params.id;
    const ok = await supabaseService.deletePatient(req.user.id, id);
    return res.json({ ok, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to delete patient' });
  }
});

export default router;
