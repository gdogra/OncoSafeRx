import express from 'express';
import Joi from 'joi';
import fhirPatientService from '../services/fhirPatientService.js';

const router = express.Router();

const searchSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  identifier: Joi.string().min(1).max(100).optional(),
  birthdate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .message('birthdate must be YYYY-MM-DD')
    .optional(),
  gender: Joi.string()
    .valid('male', 'female', 'other', 'unknown')
    .optional(),
}).or('name', 'identifier', 'birthdate', 'gender');

const idSchema = Joi.object({
  id: Joi.string().min(1).max(128).required(),
});

// FHIR connectivity health check
router.get('/health', async (req, res) => {
  try {
    const status = await fhirPatientService.healthCheck();
    res.json(status);
  } catch (e) {
    res.status(500).json({ status: 'error', error: e?.message || 'fhir_health_failed' });
  }
});

// Search patients via FHIR (falls back to mock templates if unreachable)
router.get('/patients', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: 'invalid_query', details: error.details.map(d => d.message) });
    }
    const { name, identifier, birthdate, gender } = value;
    const criteria = { name, identifier, birthdate, gender };
    const patients = await fhirPatientService.searchPatients(criteria);
    res.json({ count: patients.length, patients });
  } catch (e) {
    res.status(500).json({ error: e?.message || 'patient_search_failed' });
  }
});

// Get patient by ID via FHIR (falls back to mock if configured)
router.get('/patients/:id', async (req, res) => {
  try {
    const { error, value } = idSchema.validate(req.params);
    if (error) return res.status(400).json({ error: 'invalid_id', details: error.details.map(d => d.message) });
    const { id } = value;
    const patient = await fhirPatientService.getPatientById(id);
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json({ patient });
  } catch (e) {
    res.status(404).json({ error: e?.message || 'Not found' });
  }
});

export default router;
