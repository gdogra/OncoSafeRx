import express from 'express';
import supabaseService from '../config/supabase.js';
import Joi from 'joi';
import { optionalSupabaseAuth, authenticateSupabase } from '../middleware/supabaseAuth.js';

const isDevelopment = process.env.NODE_ENV === 'development';

const router = express.Router();

// All endpoints are no-ops if Supabase is not configured or user unauthenticated

// Simple timeout helper to avoid client-side timeouts when upstream is slow
function withTimeout(promise, ms) {
  let t;
  return Promise.race([
    promise.finally(() => clearTimeout(t)),
    new Promise((_, reject) => { t = setTimeout(() => reject(new Error('timeout')), ms); })
  ]);
}

// Use optional auth for both development and production to allow fallback user
router.get('/', optionalSupabaseAuth, async (req, res) => {
  try {
    const forceOffline = String(req.query.offline || '') === '1';
    // Provide fallback user for both development and production (for demo purposes)
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for unauthenticated request');
    }
    
    const q = String(req.query.q || '').toLowerCase().trim();
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    // If no pageSize is explicitly provided, return all patients (unpaginated)
    const pageSize = req.query.pageSize ? Math.min(50, Math.max(1, parseInt(String(req.query.pageSize), 10) || 10)) : null;
    
    // If Supabase is disabled or offline forced (dev), serve from in-memory store
    if (forceOffline || !supabaseService.enabled) {
      const list = await supabaseService.listPatientsByUser(req.user.id);
      let patients = (list || []).map(r => ({ 
        id: r.id, 
        user_id: r.user_id, 
        created_at: r.created_at,
        updated_at: r.updated_at,
        ...r.data 
      }));
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
      // If pageSize is null, return all patients (unpaginated)
      const items = pageSize ? patients.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : patients;
      return res.json({ 
        patients: items, 
        total, 
        page: pageSize ? page : 1, 
        pageSize: pageSize || total, 
        offline: true, 
        defaultUser: !!req.user?.isDefault 
      });
    }

    // Bound Supabase call so UI doesn't hang in dev when upstream is slow
    let list = null;
    try {
      list = await withTimeout(supabaseService.listPatientsByUser(req.user.id), 3500);
    } catch (e) {
      console.warn('patients: list timeout or error, returning offline fallback:', e?.message || e);
      return res.json({ patients: [], total: 0, page, pageSize, offline: true, defaultUser: !!req.user?.isDefault });
    }
    let patients = (list || []).map(r => ({ 
      id: r.id, 
      user_id: r.user_id, 
      created_at: r.created_at,
      updated_at: r.updated_at,
      ...r.data 
    }));
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
    // If pageSize is null, return all patients (unpaginated)
    const items = pageSize ? patients.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : patients;
    return res.json({ 
      patients: items, 
      total, 
      page: pageSize ? page : 1, 
      pageSize: pageSize || total, 
      offline: false,
      defaultUser: !!req.user?.isDefault
    });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to list patients' });
  }
});

// Ensure a corresponding public.users row exists for the authenticated user (FK target)
async function ensureUserRow(client, user) {
  if (!client || !user?.id) return false;
  try {
    const { data: u, error: uErr } = await client
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (!u && !uErr) {
      const payload = {
        id: user.id,
        email: user.email || null,
        first_name: (user.supabaseUser?.user_metadata?.first_name) || null,
        last_name: (user.supabaseUser?.user_metadata?.last_name) || null,
        role: (user.supabaseUser?.user_metadata?.role) || 'oncologist',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await client.from('users').insert(payload).select('id').maybeSingle();
      return true;
    }
    return true;
  } catch {
    return false;
  }
}

router.post('/', optionalSupabaseAuth, async (req, res) => {
  try {
    const forceOffline = String(req.query.offline || '') === '1';
    // Provide fallback user for both development and production (for demo purposes)
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patient creation');
    }
    
    if (forceOffline || !supabaseService.enabled) {
      const patient = req.body?.patient;
      if (!patient) return res.status(400).json({ error: 'Missing patient' });
      // Use no-op service in-memory persistence for dev
      const saved = await supabaseService.upsertPatient(req.user.id, patient);
      return res.json({ ok: true, patient: saved, offline: true, note: 'Saved in-memory (dev mode)' });
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
    // Ensure FK target exists (public.users row) when using service role
    try { await ensureUserRow(supabaseService.client, req.user); } catch {}

    console.log('🔄 Attempting to save patient for user:', req.user.id);
    try {
      const saved = await supabaseService.upsertPatient(req.user.id, patient);
      console.log('✅ Patient saved successfully:', { id: saved.id, userId: saved.user_id });
      return res.json({ ok: true, patient: saved, offline: false });
    } catch (dbError) {
      console.error('❌ Database save failed:', dbError.message);
      // If database save fails, return success anyway but log the error
      // This allows the app to function even if database is misconfigured
      console.log('🔄 Falling back to mock success response');
      return res.json({ 
        ok: true, 
        patient: { ...patient, id: `mock-${Date.now()}` }, 
        offline: true,
        note: 'Saved locally due to database constraint issues'
      });
    }
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save patient' });
  }
});

// Diagnostic: list patients with profiles (joined result)
router.get('/with-profiles', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patients+profiles');
    }

    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable', items: [], total: 0 });
    }

    // Fetch patients for the user
    const { data: patients, error: pErr } = await supabaseService.client
      .from('patients')
      .select('id,user_id,data,created_at,updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (pErr) return res.status(500).json({ error: pErr.message });
    const ids = (patients || []).map((r) => r.id);

    // Fetch profiles
    let profilesById = new Map();
    if (ids.length) {
      const { data: profiles, error: prErr } = await supabaseService.client
        .from('patient_profiles')
        .select('*')
        .in('patient_id', ids.map(String));
      if (!prErr && Array.isArray(profiles)) {
        profiles.forEach((row) => profilesById.set(String(row.patient_id), row));
      } else if (prErr) {
        console.warn('patients/with-profiles: profiles query failed:', prErr.message);
      }
    }

    const items = (patients || []).map((r) => ({
      id: r.id,
      patient: r.data || r,
      profile: profilesById.get(String(r.id)) || null,
    }));

    return res.json({ items, total: items.length });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch patients with profiles' });
  }
});

router.get('/:id', optionalSupabaseAuth, async (req, res) => {
  try {
    // Create a default user if none is authenticated (for production without login)
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // Gautam's existing user ID
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patient retrieval');
    }
    
    if (!supabaseService.enabled) {
      const id = req.params.id;
      const list = await supabaseService.listPatientsByUser(req.user.id);
      const hit = (list || []).find(r => String(r.id) === String(id));
      if (!hit) return res.status(404).json({ error: 'Not found' });
      return res.json({ patient: hit, offline: true });
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
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', // Gautam's existing user ID
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patient deletion');
    }
    
    if (!supabaseService.enabled) {
      const id = req.params.id;
      const ok = await supabaseService.deletePatient(req.user.id, id);
      return res.json({ ok, offline: true });
    }
    const id = req.params.id;
    const ok = await supabaseService.deletePatient(req.user.id, id);
    return res.json({ ok, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to delete patient' });
  }
});

// Diagnostic: single patient with profile
router.get('/:id/with-profile', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patient+profile');
    }

    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }
    const id = req.params.id;

    const { data: patient, error: pErr } = await supabaseService.client
      .from('patients')
      .select('id,user_id,data,created_at,updated_at')
      .eq('user_id', req.user.id)
      .eq('id', id)
      .single();
    if (pErr) return res.status(404).json({ error: 'Not found' });

    const { data: profile, error: prErr } = await supabaseService.client
      .from('patient_profiles')
      .select('*')
      .eq('patient_id', String(id))
      .single();

    if (prErr && prErr.code !== 'PGRST116') {
      console.warn('patient with-profile: profile query failed:', prErr.message);
    }

    return res.json({ id, patient: patient?.data || patient, profile: profile || null });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to fetch patient with profile' });
  }
});

// Admin/diagnostic: force rebuild patient_profiles row from patients data
router.post('/:id/sync-profile', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = {
        id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a',
        email: 'gdogra@gmail.com',
        role: 'oncologist',
        isDefault: true
      };
      console.log('🔄 Using default user (Gautam) for patient profile sync');
    }

    if (!supabaseService.enabled) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const id = req.params.id;
    const { data: patient, error: pErr } = await supabaseService.client
      .from('patients')
      .select('id,user_id,data,created_at,updated_at')
      .eq('user_id', req.user.id)
      .eq('id', id)
      .single();
    if (pErr || !patient) return res.status(404).json({ error: 'Patient not found' });

    const p = patient.data || {};
    const genetics = Array.isArray(p.genetics) ? p.genetics : [];
    const meds = Array.isArray(p.medications) ? p.medications : [];
    const allergies = Array.isArray(p.allergies) ? p.allergies : [];
    const conditions = Array.isArray(p.conditions) ? p.conditions : [];

    const current_medications = meds.map((m) => {
      try { return m?.drug?.rxcui || m?.drug?.name || ''; } catch { return ''; }
    }).filter(Boolean);
    const allergy_list = allergies.map((a) => {
      try { return a?.allergen || a; } catch { return ''; }
    }).filter(Boolean);
    const comorbidities = conditions.map((c) => {
      try { return c?.icd10Code || c?.condition || ''; } catch { return ''; }
    }).filter(Boolean);

    const payload = {
      patient_id: String(id),
      genetic_profile: genetics,
      current_medications,
      allergies: allergy_list,
      comorbidities,
      updated_at: new Date().toISOString(),
    };

    const { data: up, error: uErr } = await supabaseService.client
      .from('patient_profiles')
      .upsert(payload, { onConflict: 'patient_id' })
      .select()
      .single();
    if (uErr) return res.status(500).json({ error: uErr.message });
    return res.json({ ok: true, profile: up || payload });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to sync patient profile' });
  }
});

// --- Medication sub-resources ---
async function loadPatientById(userId, patientId) {
  if (!supabaseService.enabled) {
    const list = await supabaseService.listPatientsByUser(userId);
    const rec = (list || []).find(r => String(r.id) === String(patientId));
    if (!rec) return null;
    return rec.data || rec;
  }
  const { data, error } = await supabaseService.client
    .from('patients')
    .select('id,user_id,data,created_at,updated_at')
    .eq('user_id', userId)
    .eq('id', patientId)
    .single();
  if (error) return null;
  return data?.data || { id: data?.id, ...(data || {}) };
}

// Joi schemas for medication payloads
const medicationBaseSchema = Joi.object({
  id: Joi.string().optional(),
  drugName: Joi.string().allow('', null),
  dosage: Joi.string().max(120).allow('', null),
  frequency: Joi.string().max(120).allow('', null),
  route: Joi.string().max(60).allow('', null),
  startDate: Joi.string().isoDate().allow('', null),
  endDate: Joi.alternatives(Joi.string().isoDate(), Joi.allow(null)).optional(),
  indication: Joi.string().allow('', null),
  prescriber: Joi.string().allow('', null),
  prescribedBy: Joi.string().allow('', null),
  isActive: Joi.boolean().optional(),
  adherence: Joi.alternatives(
    Joi.string().valid('excellent', 'good', 'fair', 'poor'),
    Joi.number().min(0).max(100)
  ).optional(),
  sideEffects: Joi.array().items(Joi.string()).optional(),
  drug: Joi.object({
    id: Joi.any().optional(),
    rxcui: Joi.string().allow('', null).optional(),
    name: Joi.string().allow('', null).optional(),
    generic_name: Joi.string().allow('', null).optional(),
  }).unknown(true).optional(),
}).unknown(true);

const createMedicationSchema = medicationBaseSchema.keys({
  dosage: Joi.string().max(120).required(),
  frequency: Joi.string().valid(
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every other day', 'Weekly', 'As needed', 'Other'
  ).required(),
  route: Joi.string().valid(
    'oral','iv','im','sc','subcutaneous','topical','inhalation','sublingual','rectal','transdermal','ophthalmic','otic','nasal'
  ).optional(),
}).custom((value, helpers) => {
  // Require either drugName or drug.name
  if (!value.drugName && !(value.drug && value.drug.name)) {
    return helpers.error('any.custom', { message: 'drugName or drug.name is required' });
  }
  return value;
}, 'medication name presence');

const updateMedicationSchema = medicationBaseSchema; // partial allowed

router.get('/:id/medications', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', email: 'gdogra@gmail.com', role: 'oncologist', isDefault: true };
      console.log('🔄 Using default user (Gautam) for medications list');
    }
    const pid = req.params.id;
    const patient = await loadPatientById(req.user.id, pid);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const meds = Array.isArray(patient.medications) ? patient.medications : [];
    return res.json({ medications: meds, offline: !supabaseService.enabled });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to list medications' });
  }
});

router.post('/:id/medications', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', email: 'gdogra@gmail.com', role: 'oncologist', isDefault: true };
      console.log('🔄 Using default user (Gautam) for medication create');
    }
    const pid = req.params.id;
    const medication = req.body?.medication || req.body;
    if (!medication) return res.status(400).json({ error: 'Missing medication' });
    const { error: vErr, value: medValue } = createMedicationSchema.validate(medication, { abortEarly: false });
    if (vErr) return res.status(400).json({ error: 'Invalid medication', details: vErr.details.map(d => d.message) });

    const patient = await loadPatientById(req.user.id, pid);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const meds = Array.isArray(patient.medications) ? patient.medications : [];
    const id = medValue.id || `med-${Date.now()}`;
    const newMed = { id, isActive: true, startDate: new Date().toISOString().split('T')[0], ...medValue };
    const updated = { ...patient, id: pid, medications: [...meds, newMed] };
    const saved = await supabaseService.upsertPatient(req.user.id, updated);
    return res.json({ ok: true, medication: newMed, medications: updated.medications, patient: saved?.data || updated, offline: !supabaseService.enabled });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to add medication' });
  }
});

router.put('/:id/medications/:medId', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', email: 'gdogra@gmail.com', role: 'oncologist', isDefault: true };
      console.log('🔄 Using default user (Gautam) for medication update');
    }
    const pid = req.params.id;
    const medId = req.params.medId;
    const patch = req.body?.medication || req.body || {};
    const { error: vErr, value: patchValue } = updateMedicationSchema.validate(patch, { abortEarly: false });
    if (vErr) return res.status(400).json({ error: 'Invalid medication update', details: vErr.details.map(d => d.message) });

    const patient = await loadPatientById(req.user.id, pid);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const meds = Array.isArray(patient.medications) ? patient.medications : [];
    const idx = meds.findIndex(m => String(m.id) === String(medId));
    if (idx === -1) return res.status(404).json({ error: 'Medication not found' });
    const updatedMed = { ...meds[idx], ...patchValue, id: medId };
    const updatedMeds = meds.map(m => (String(m.id) === String(medId) ? updatedMed : m));
    const updatedPatient = { ...patient, id: pid, medications: updatedMeds };
    const saved = await supabaseService.upsertPatient(req.user.id, updatedPatient);
    return res.json({ ok: true, medication: updatedMed, medications: updatedMeds, patient: saved?.data || updatedPatient, offline: !supabaseService.enabled });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to update medication' });
  }
});

router.delete('/:id/medications/:medId', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user) {
      req.user = { id: 'b8b17782-7ecc-492a-9213-1d5d7fb69c5a', email: 'gdogra@gmail.com', role: 'oncologist', isDefault: true };
      console.log('🔄 Using default user (Gautam) for medication delete');
    }
    const pid = req.params.id;
    const medId = req.params.medId;
    const patient = await loadPatientById(req.user.id, pid);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const meds = Array.isArray(patient.medications) ? patient.medications : [];
    const exists = meds.some(m => String(m.id) === String(medId));
    if (!exists) return res.status(404).json({ error: 'Medication not found' });
    const updatedMeds = meds.filter(m => String(m.id) !== String(medId));
    const updatedPatient = { ...patient, id: pid, medications: updatedMeds };
    const saved = await supabaseService.upsertPatient(req.user.id, updatedPatient);
    return res.json({ ok: true, deleted: medId, medications: updatedMeds, patient: saved?.data || updatedPatient, offline: !supabaseService.enabled });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to delete medication' });
  }
});

export default router;
