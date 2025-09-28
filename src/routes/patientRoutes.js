import express from 'express';
import supabaseService from '../config/supabase.js';
import { optionalSupabaseAuth } from '../middleware/supabaseAuth.js';

const router = express.Router();

// All endpoints are no-ops if Supabase is not configured or user unauthenticated

router.get('/', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user || !supabaseService.enabled) {
      // Generate user-specific mock patients for development/demo
      const userId = req.user?.id || 'anonymous';
      const userHash = userId.slice(-3); // Use last 3 chars for variation
      
      const patientTemplates = [
        { firstName: 'Sarah', lastName: 'Johnson', condition: 'Breast Cancer', stage: 'Stage II', meds: ['Tamoxifen', 'Metformin'] },
        { firstName: 'Michael', lastName: 'Chen', condition: 'Lung Cancer', stage: 'Stage IIIA', meds: ['Carboplatin', 'Pemetrexed'] },
        { firstName: 'Emily', lastName: 'Rodriguez', condition: 'Colorectal Cancer', stage: 'Stage I', meds: ['5-Fluorouracil', 'Leucovorin'] },
        { firstName: 'Robert', lastName: 'Thompson', condition: 'Prostate Cancer', stage: 'Stage II', meds: ['Bicalutamide', 'Leuprolide'] },
        { firstName: 'Lisa', lastName: 'Anderson', condition: 'Leukemia', stage: 'Acute', meds: ['Daunorubicin', 'Cytarabine'] }
      ];

      const mockPatients = patientTemplates.map((template, index) => ({
        id: `${userId}-patient-${index + 1}`,
        demographics: {
          firstName: template.firstName,
          lastName: template.lastName,
          mrn: `MRN-${userHash}-${String(index + 1).padStart(3, '0')}`,
          age: 25 + (index * 10) + parseInt(userHash, 16) % 10,
          gender: index % 2 === 0 ? 'female' : 'male',
          dateOfBirth: `19${70 + index * 5}-${String(index + 1).padStart(2, '0')}-15`
        },
        conditions: [{ name: template.condition, stage: template.stage }],
        medications: template.meds,
        userId: userId // Track which user owns this patient
      }));

      const q = String(req.query.q || '').toLowerCase().trim();
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
      const pageSize = Math.min(50, Math.max(1, parseInt(String(req.query.pageSize || '10'), 10) || 10));

      let patients = mockPatients;
      if (q) {
        patients = mockPatients.filter(p => {
          const name = `${p.demographics.firstName} ${p.demographics.lastName}`.toLowerCase();
          const mrn = p.demographics.mrn.toLowerCase();
          return name.includes(q) || mrn.includes(q);
        });
      }

      const total = patients.length;
      const start = (page - 1) * pageSize;
      const items = patients.slice(start, start + pageSize);
      
      return res.status(200).json({ patients: items, total, page, pageSize, offline: true });
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
    if (!req.user || !supabaseService.enabled) {
      return res.status(200).json({ ok: true, offline: true });
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
    const saved = await supabaseService.upsertPatient(req.user.id, patient);
    return res.json({ ok: true, patient: saved, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to save patient' });
  }
});

router.get('/:id', optionalSupabaseAuth, async (req, res) => {
  try {
    if (!req.user || !supabaseService.enabled) {
      // Return user-specific mock patient data for development
      const userId = req.user?.id || 'anonymous';
      const patientId = req.params.id;
      
      // Check if this is a mock patient belonging to this user
      if (patientId.startsWith(userId)) {
        const patientIndex = parseInt(patientId.split('-').pop()) - 1;
        const templates = [
          { firstName: 'Sarah', lastName: 'Johnson', condition: 'Breast Cancer', stage: 'Stage II', meds: ['Tamoxifen', 'Metformin'] },
          { firstName: 'Michael', lastName: 'Chen', condition: 'Lung Cancer', stage: 'Stage IIIA', meds: ['Carboplatin', 'Pemetrexed'] },
          { firstName: 'Emily', lastName: 'Rodriguez', condition: 'Colorectal Cancer', stage: 'Stage I', meds: ['5-Fluorouracil', 'Leucovorin'] },
          { firstName: 'Robert', lastName: 'Thompson', condition: 'Prostate Cancer', stage: 'Stage II', meds: ['Bicalutamide', 'Leuprolide'] },
          { firstName: 'Lisa', lastName: 'Anderson', condition: 'Leukemia', stage: 'Acute', meds: ['Daunorubicin', 'Cytarabine'] }
        ];
        
        if (patientIndex >= 0 && patientIndex < templates.length) {
          const template = templates[patientIndex];
          const userHash = userId.slice(-3);
          const mockPatient = {
            id: patientId,
            demographics: {
              firstName: template.firstName,
              lastName: template.lastName,
              mrn: `MRN-${userHash}-${String(patientIndex + 1).padStart(3, '0')}`,
              age: 25 + (patientIndex * 10) + parseInt(userHash, 16) % 10,
              gender: patientIndex % 2 === 0 ? 'female' : 'male',
              dateOfBirth: `19${70 + patientIndex * 5}-${String(patientIndex + 1).padStart(2, '0')}-15`
            },
            conditions: [{ name: template.condition, stage: template.stage }],
            medications: template.meds,
            userId: userId
          };
          return res.status(200).json({ patient: mockPatient, offline: true });
        }
      }
      
      return res.status(404).json({ error: 'Patient not found', offline: true });
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
    if (!req.user || !supabaseService.enabled) {
      return res.status(200).json({ ok: true, offline: true });
    }
    const id = req.params.id;
    const ok = await supabaseService.deletePatient(req.user.id, id);
    return res.json({ ok, offline: false });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to delete patient' });
  }
});

export default router;
