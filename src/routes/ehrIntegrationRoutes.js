import express from 'express';
import ehrIntegrationService from '../services/ehrIntegrationService.js';
import medicationSyncService from '../services/medicationSyncService.js';
import medicationReconciliationService from '../services/medicationReconciliationService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all EHR integration routes
router.use(authenticateToken);

/**
 * @route POST /api/ehr-integration/auth/initiate
 * @desc Initiate EHR OAuth authentication
 * @access Private
 */
router.post('/auth/initiate', asyncHandler(async (req, res) => {
  const { ehrSystem, patientId, redirectUri } = req.body;

  if (!ehrSystem || !patientId || !redirectUri) {
    return res.status(400).json({
      error: 'Missing required fields: ehrSystem, patientId, redirectUri'
    });
  }

  const authResult = await ehrIntegrationService.initiateEHRAuth(
    ehrSystem,
    patientId,
    redirectUri
  );

  res.json({
    success: true,
    ...authResult
  });
}));

/**
 * @route POST /api/ehr-integration/auth/complete
 * @desc Complete EHR OAuth authentication
 * @access Private
 */
router.post('/auth/complete', asyncHandler(async (req, res) => {
  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({
      error: 'Missing authorization code or state'
    });
  }

  const authResult = await ehrIntegrationService.completeEHRAuth(code, state);

  res.json({
    success: true,
    message: 'EHR authentication completed successfully',
    ...authResult
  });
}));

/**
 * @route GET /api/ehr-integration/medications/:patientId
 * @desc Fetch medications from EHR system
 * @access Private
 */
router.get('/medications/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { ehrSystem } = req.query;

  if (!ehrSystem) {
    return res.status(400).json({
      error: 'EHR system parameter required'
    });
  }

  const medications = await ehrIntegrationService.fetchMedicationsFromEHR(
    patientId,
    ehrSystem
  );

  res.json({
    success: true,
    patientId,
    ehrSystem,
    ...medications
  });
}));

/**
 * @route POST /api/ehr-integration/sync/initialize
 * @desc Initialize medication synchronization for a patient
 * @access Private
 */
router.post('/sync/initialize', asyncHandler(async (req, res) => {
  const { patientId, syncConfig } = req.body;

  if (!patientId) {
    return res.status(400).json({
      error: 'Patient ID required'
    });
  }

  const syncResult = await medicationSyncService.initializePatientSync(
    patientId,
    syncConfig
  );

  res.json({
    success: true,
    message: 'Medication synchronization initialized',
    ...syncResult
  });
}));

/**
 * @route POST /api/ehr-integration/sync/trigger/:patientId
 * @desc Manually trigger medication sync
 * @access Private
 */
router.post('/sync/trigger/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const syncResult = await medicationSyncService.triggerManualSync(patientId);

  res.json({
    success: true,
    message: 'Manual sync completed',
    ...syncResult
  });
}));

/**
 * @route GET /api/ehr-integration/sync/status/:patientId
 * @desc Get synchronization status for a patient
 * @access Private
 */
router.get('/sync/status/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const status = medicationSyncService.getSyncStatus(patientId);

  res.json({
    success: true,
    patientId,
    ...status
  });
}));

/**
 * @route POST /api/ehr-integration/sync/stop/:patientId
 * @desc Stop medication synchronization
 * @access Private
 */
router.post('/sync/stop/:patientId', asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const result = await medicationSyncService.stopPatientSync(patientId);

  res.json({
    success: true,
    patientId,
    ...result
  });
}));

/**
 * @route POST /api/ehr-integration/reconciliation/initiate
 * @desc Initiate medication reconciliation workflow
 * @access Private
 */
router.post('/reconciliation/initiate', asyncHandler(async (req, res) => {
  const { patientId, reconciliationType, context } = req.body;
  const clinicianId = req.user.id; // From authentication middleware

  if (!patientId || !reconciliationType) {
    return res.status(400).json({
      error: 'Patient ID and reconciliation type required'
    });
  }

  const reconciliation = await medicationReconciliationService.initiateReconciliation(
    patientId,
    reconciliationType,
    clinicianId,
    context
  );

  res.json({
    success: true,
    message: 'Medication reconciliation initiated',
    ...reconciliation
  });
}));

/**
 * @route POST /api/ehr-integration/reconciliation/:reconciliationId/resolve-discrepancy
 * @desc Resolve a medication discrepancy
 * @access Private
 */
router.post('/reconciliation/:reconciliationId/resolve-discrepancy', asyncHandler(async (req, res) => {
  const { reconciliationId } = req.params;
  const { discrepancyId, resolution } = req.body;
  const clinicianId = req.user.id;

  if (!discrepancyId || !resolution) {
    return res.status(400).json({
      error: 'Discrepancy ID and resolution required'
    });
  }

  const result = await medicationReconciliationService.resolveDiscrepancy(
    reconciliationId,
    discrepancyId,
    resolution,
    clinicianId
  );

  res.json({
    success: true,
    message: 'Discrepancy resolved successfully',
    ...result
  });
}));

/**
 * @route POST /api/ehr-integration/reconciliation/:reconciliationId/complete
 * @desc Complete medication reconciliation
 * @access Private
 */
router.post('/reconciliation/:reconciliationId/complete', asyncHandler(async (req, res) => {
  const { reconciliationId } = req.params;
  const { finalMedicationList } = req.body;
  const clinicianId = req.user.id;

  if (!finalMedicationList) {
    return res.status(400).json({
      error: 'Final medication list required'
    });
  }

  const result = await medicationReconciliationService.completeReconciliation(
    reconciliationId,
    finalMedicationList,
    clinicianId
  );

  res.json({
    success: true,
    message: 'Medication reconciliation completed',
    ...result
  });
}));

/**
 * @route GET /api/ehr-integration/systems
 * @desc Get list of supported EHR systems
 * @access Private
 */
router.get('/systems', asyncHandler(async (req, res) => {
  const systems = Object.entries(ehrIntegrationService.supportedSystems).map(
    ([id, config]) => ({
      id,
      name: config.name,
      fhirVersion: config.fhirVersion,
      available: !!config.clientId
    })
  );

  res.json({
    success: true,
    supportedSystems: systems,
    totalSystems: systems.length
  });
}));

/**
 * @route GET /api/ehr-integration/health
 * @desc Health check for EHR integration service
 * @access Private
 */
router.get('/health', asyncHandler(async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      ehrIntegration: 'active',
      medicationSync: medicationSyncService.isRunning ? 'running' : 'stopped',
      reconciliation: 'active'
    },
    statistics: {
      activeSyncJobs: medicationSyncService.syncJobs.size,
      totalSyncHistory: medicationSyncService.syncHistory.size
    }
  };

  res.json({
    success: true,
    ...healthStatus
  });
}));

export default router;