import EventEmitter from 'events';
import cron from 'node-cron';
import ehrIntegrationService from './ehrIntegrationService.js';
import pharmacyIntegrationService from './pharmacyIntegrationService.js';

/**
 * Real-Time Medication Synchronization Service
 * Orchestrates medication data sync between EHR, pharmacy, and OncoSafeRx systems
 */
class MedicationSyncService extends EventEmitter {
  constructor() {
    super();
    this.syncJobs = new Map();
    this.syncHistory = new Map();
    this.conflictResolutionRules = new Map();
    this.isRunning = false;
    
    // Sync intervals (in minutes)
    this.syncIntervals = {
      realtime: 5,      // Critical medications every 5 minutes
      standard: 30,     // Standard medications every 30 minutes
      maintenance: 120  // Maintenance medications every 2 hours
    };

    this.setupEventHandlers();
  }

  /**
   * Initialize medication synchronization for a patient
   */
  async initializePatientSync(patientId, syncConfig = {}) {
    try {
      const config = {
        ehrSystems: syncConfig.ehrSystems || [],
        pharmacies: syncConfig.pharmacies || [],
        syncFrequency: syncConfig.syncFrequency || 'standard',
        conflictResolution: syncConfig.conflictResolution || 'manual',
        autoReconcile: syncConfig.autoReconcile || false,
        notificationPreferences: syncConfig.notificationPreferences || {}
      };

      // Store sync configuration
      this.syncJobs.set(patientId, {
        config,
        lastSync: null,
        status: 'active',
        errors: [],
        conflicts: []
      });

      // Start sync schedule
      await this.startSyncSchedule(patientId, config);

      // Perform initial sync
      await this.performInitialSync(patientId, config);

      this.emit('sync_initialized', { patientId, config });

      return {
        success: true,
        patientId,
        message: 'Medication synchronization initialized successfully',
        nextSync: this.getNextSyncTime(config.syncFrequency)
      };
    } catch (error) {
      console.error('Failed to initialize patient sync:', error);
      throw new Error(`Sync initialization failed: ${error.message}`);
    }
  }

  /**
   * Perform comprehensive medication synchronization
   */
  async syncPatientMedications(patientId) {
    try {
      const syncJob = this.syncJobs.get(patientId);
      if (!syncJob) {
        throw new Error('No sync configuration found for patient');
      }

      this.emit('sync_started', { patientId });

      // Collect medication data from all sources
      const syncResults = await this.collectMedicationData(patientId, syncJob.config);
      
      // Detect conflicts and discrepancies
      const conflicts = await this.detectConflicts(syncResults);
      
      // Apply conflict resolution
      const resolvedData = await this.resolveConflicts(conflicts, syncJob.config.conflictResolution);
      
      // Update local medication records
      const updateResults = await this.updateMedicationRecords(patientId, resolvedData);
      
      // Generate sync report
      const syncReport = await this.generateSyncReport(patientId, syncResults, conflicts, updateResults);
      
      // Update sync job status
      syncJob.lastSync = new Date();
      syncJob.conflicts = conflicts;
      syncJob.errors = syncResults.errors || [];

      this.emit('sync_completed', { patientId, syncReport });

      return {
        success: true,
        patientId,
        syncReport,
        conflicts: conflicts.length,
        lastSync: syncJob.lastSync
      };
    } catch (error) {
      console.error('Medication sync failed:', error);
      this.emit('sync_failed', { patientId, error: error.message });
      throw error;
    }
  }

  /**
   * Collect medication data from all configured sources
   */
  async collectMedicationData(patientId, config) {
    const sources = [];
    const errors = [];

    // Collect from EHR systems
    for (const ehrSystem of config.ehrSystems) {
      try {
        const ehrData = await ehrIntegrationService.fetchMedicationsFromEHR(patientId, ehrSystem);
        sources.push({
          type: 'EHR',
          system: ehrSystem,
          data: ehrData.medications,
          timestamp: new Date(),
          reliable: true
        });
      } catch (error) {
        errors.push({
          source: `EHR_${ehrSystem}`,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    // Collect from pharmacy systems
    for (const pharmacy of config.pharmacies) {
      try {
        const pharmacyData = await this.fetchPharmacyMedications(patientId, pharmacy);
        sources.push({
          type: 'PHARMACY',
          system: pharmacy,
          data: pharmacyData,
          timestamp: new Date(),
          reliable: true
        });
      } catch (error) {
        errors.push({
          source: `PHARMACY_${pharmacy}`,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    // Get current OncoSafeRx data
    try {
      const currentData = await this.getCurrentMedicationData(patientId);
      sources.push({
        type: 'ONCOSAFERX',
        system: 'internal',
        data: currentData,
        timestamp: new Date(),
        reliable: true
      });
    } catch (error) {
      errors.push({
        source: 'ONCOSAFERX_INTERNAL',
        error: error.message,
        timestamp: new Date()
      });
    }

    return { sources, errors };
  }

  /**
   * Detect conflicts between medication data sources
   */
  async detectConflicts(syncResults) {
    const conflicts = [];
    const medicationMap = new Map();

    // Group medications by identifier (name, NDC, RXCUI)
    for (const source of syncResults.sources) {
      for (const medication of source.data) {
        const key = this.generateMedicationKey(medication);
        
        if (!medicationMap.has(key)) {
          medicationMap.set(key, []);
        }
        
        medicationMap.get(key).push({
          medication,
          source: source.type,
          system: source.system,
          timestamp: source.timestamp
        });
      }
    }

    // Analyze each medication group for conflicts
    for (const [key, medications] of medicationMap) {
      if (medications.length > 1) {
        const conflict = await this.analyzeMedicationConflict(key, medications);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    return conflicts;
  }

  /**
   * Analyze potential conflicts for a medication
   */
  async analyzeMedicationConflict(medicationKey, medications) {
    const conflicts = [];
    const reference = medications[0].medication;

    for (let i = 1; i < medications.length; i++) {
      const current = medications[i].medication;
      
      // Check dosage conflicts
      if (reference.dosage !== current.dosage) {
        conflicts.push({
          type: 'dosage_mismatch',
          field: 'dosage',
          values: [
            { value: reference.dosage, source: medications[0].source },
            { value: current.dosage, source: medications[i].source }
          ],
          severity: 'high'
        });
      }

      // Check frequency conflicts
      if (reference.frequency !== current.frequency) {
        conflicts.push({
          type: 'frequency_mismatch',
          field: 'frequency',
          values: [
            { value: reference.frequency, source: medications[0].source },
            { value: current.frequency, source: medications[i].source }
          ],
          severity: 'high'
        });
      }

      // Check active status conflicts
      if (reference.status !== current.status) {
        conflicts.push({
          type: 'status_mismatch',
          field: 'status',
          values: [
            { value: reference.status, source: medications[0].source },
            { value: current.status, source: medications[i].source }
          ],
          severity: 'medium'
        });
      }

      // Check date conflicts
      if (reference.startDate && current.startDate) {
        const dateDiff = Math.abs(new Date(reference.startDate) - new Date(current.startDate));
        if (dateDiff > 24 * 60 * 60 * 1000) { // More than 1 day difference
          conflicts.push({
            type: 'date_mismatch',
            field: 'startDate',
            values: [
              { value: reference.startDate, source: medications[0].source },
              { value: current.startDate, source: medications[i].source }
            ],
            severity: 'low'
          });
        }
      }
    }

    if (conflicts.length > 0) {
      return {
        medicationKey,
        medicationName: reference.name,
        conflicts,
        medications,
        recommendedResolution: this.generateResolutionRecommendation(conflicts, medications)
      };
    }

    return null;
  }

  /**
   * Generate medication key for comparison
   */
  generateMedicationKey(medication) {
    // Primary identifiers in order of preference
    if (medication.ndc) return `ndc_${medication.ndc}`;
    if (medication.rxcui) return `rxcui_${medication.rxcui}`;
    
    // Fallback to normalized name
    const normalizedName = medication.name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    
    return `name_${normalizedName}`;
  }

  /**
   * Resolve conflicts based on resolution strategy
   */
  async resolveConflicts(conflicts, strategy) {
    const resolvedMedications = [];

    for (const conflict of conflicts) {
      let resolvedMedication = null;

      switch (strategy) {
        case 'ehr_priority':
          resolvedMedication = this.resolveWithEHRPriority(conflict);
          break;
        case 'latest_timestamp':
          resolvedMedication = this.resolveWithLatestTimestamp(conflict);
          break;
        case 'pharmacy_priority':
          resolvedMedication = this.resolveWithPharmacyPriority(conflict);
          break;
        case 'manual':
          resolvedMedication = await this.flagForManualResolution(conflict);
          break;
        default:
          resolvedMedication = this.resolveWithDefaultStrategy(conflict);
      }

      if (resolvedMedication) {
        resolvedMedications.push(resolvedMedication);
      }
    }

    return resolvedMedications;
  }

  /**
   * Resolve conflict with EHR priority
   */
  resolveWithEHRPriority(conflict) {
    const ehrMedication = conflict.medications.find(m => m.source === 'EHR');
    if (ehrMedication) {
      return {
        ...ehrMedication.medication,
        resolutionMethod: 'ehr_priority',
        resolutionTimestamp: new Date(),
        conflictId: conflict.medicationKey
      };
    }
    return this.resolveWithDefaultStrategy(conflict);
  }

  /**
   * Resolve conflict with latest timestamp
   */
  resolveWithLatestTimestamp(conflict) {
    const latestMedication = conflict.medications.reduce((latest, current) => {
      return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
    });

    return {
      ...latestMedication.medication,
      resolutionMethod: 'latest_timestamp',
      resolutionTimestamp: new Date(),
      conflictId: conflict.medicationKey
    };
  }

  /**
   * Generate resolution recommendation
   */
  generateResolutionRecommendation(conflicts, medications) {
    const recommendations = [];
    const highSeverityConflicts = conflicts.filter(c => c.severity === 'high');

    if (highSeverityConflicts.length > 0) {
      recommendations.push({
        priority: 'urgent',
        action: 'clinical_review',
        message: 'Dosage or frequency conflicts require immediate clinical review'
      });
    }

    const ehrSource = medications.find(m => m.source === 'EHR');
    if (ehrSource) {
      recommendations.push({
        priority: 'normal',
        action: 'use_ehr_data',
        message: 'Consider using EHR data as the authoritative source'
      });
    }

    return recommendations;
  }

  /**
   * Start sync schedule for patient
   */
  async startSyncSchedule(patientId, config) {
    const interval = this.syncIntervals[config.syncFrequency];
    const cronExpression = `*/${interval} * * * *`; // Every N minutes

    const job = cron.schedule(cronExpression, async () => {
      try {
        await this.syncPatientMedications(patientId);
      } catch (error) {
        console.error(`Scheduled sync failed for patient ${patientId}:`, error);
      }
    }, {
      scheduled: false
    });

    this.syncJobs.get(patientId).cronJob = job;
    job.start();
  }

  /**
   * Perform initial comprehensive sync
   */
  async performInitialSync(patientId, config) {
    try {
      const syncResult = await this.syncPatientMedications(patientId);
      
      // Send notification about initial sync completion
      await this.sendSyncNotification(patientId, 'initial_sync_complete', {
        medicationsFound: syncResult.syncReport.totalMedications,
        conflicts: syncResult.conflicts,
        sources: config.ehrSystems.length + config.pharmacies.length
      });

      return syncResult;
    } catch (error) {
      await this.sendSyncNotification(patientId, 'initial_sync_failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get next sync time based on frequency
   */
  getNextSyncTime(frequency) {
    const interval = this.syncIntervals[frequency];
    return new Date(Date.now() + interval * 60 * 1000);
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.on('sync_completed', this.handleSyncCompleted.bind(this));
    this.on('sync_failed', this.handleSyncFailed.bind(this));
    this.on('conflict_detected', this.handleConflictDetected.bind(this));
  }

  /**
   * Handle sync completion
   */
  async handleSyncCompleted({ patientId, syncReport }) {
    console.log(`Medication sync completed for patient ${patientId}`);
    
    // Update sync statistics
    await this.updateSyncStatistics(patientId, syncReport);
    
    // Send notification if there are conflicts
    if (syncReport.conflicts > 0) {
      await this.sendSyncNotification(patientId, 'conflicts_detected', {
        conflictCount: syncReport.conflicts
      });
    }
  }

  /**
   * Handle sync failure
   */
  async handleSyncFailed({ patientId, error }) {
    console.error(`Medication sync failed for patient ${patientId}:`, error);
    
    // Send failure notification
    await this.sendSyncNotification(patientId, 'sync_failed', {
      error,
      retryTime: new Date(Date.now() + 15 * 60 * 1000) // Retry in 15 minutes
    });
  }

  /**
   * Send sync notification
   */
  async sendSyncNotification(patientId, type, data) {
    try {
      // Implementation depends on notification service
      console.log(`Sending ${type} notification to patient ${patientId}:`, data);
      // TODO: Integrate with notification service
    } catch (error) {
      console.error('Failed to send sync notification:', error);
    }
  }

  /**
   * Update sync statistics
   */
  async updateSyncStatistics(patientId, syncReport) {
    const history = this.syncHistory.get(patientId) || {
      totalSyncs: 0,
      successfulSyncs: 0,
      conflictsResolved: 0,
      lastSync: null
    };

    history.totalSyncs++;
    history.successfulSyncs++;
    history.conflictsResolved += syncReport.conflicts;
    history.lastSync = new Date();

    this.syncHistory.set(patientId, history);
  }

  /**
   * Stop sync for patient
   */
  async stopPatientSync(patientId) {
    const syncJob = this.syncJobs.get(patientId);
    if (syncJob && syncJob.cronJob) {
      syncJob.cronJob.stop();
      syncJob.status = 'stopped';
      
      this.emit('sync_stopped', { patientId });
      
      return {
        success: true,
        message: 'Medication synchronization stopped'
      };
    }
    
    throw new Error('No active sync found for patient');
  }

  /**
   * Get sync status for patient
   */
  getSyncStatus(patientId) {
    const syncJob = this.syncJobs.get(patientId);
    const history = this.syncHistory.get(patientId);
    
    if (!syncJob) {
      return {
        status: 'not_configured',
        message: 'Medication sync not configured for this patient'
      };
    }

    return {
      status: syncJob.status,
      lastSync: syncJob.lastSync,
      nextSync: this.getNextSyncTime(syncJob.config.syncFrequency),
      conflicts: syncJob.conflicts.length,
      errors: syncJob.errors.length,
      history: history || null,
      sources: {
        ehr: syncJob.config.ehrSystems.length,
        pharmacy: syncJob.config.pharmacies.length
      }
    };
  }

  /**
   * Manual sync trigger
   */
  async triggerManualSync(patientId) {
    try {
      const result = await this.syncPatientMedications(patientId);
      return {
        success: true,
        message: 'Manual sync completed successfully',
        result
      };
    } catch (error) {
      throw new Error(`Manual sync failed: ${error.message}`);
    }
  }

  // Additional helper methods would be implemented here...
  async fetchPharmacyMedications(patientId, pharmacy) {
    // Implementation would call pharmacy-specific APIs
    return [];
  }

  async getCurrentMedicationData(patientId) {
    // Implementation would fetch from local database
    return [];
  }

  async updateMedicationRecords(patientId, resolvedData) {
    // Implementation would update local database
    return { updated: resolvedData.length };
  }

  async generateSyncReport(patientId, syncResults, conflicts, updateResults) {
    return {
      patientId,
      timestamp: new Date(),
      totalSources: syncResults.sources.length,
      totalMedications: syncResults.sources.reduce((sum, s) => sum + s.data.length, 0),
      conflicts: conflicts.length,
      updates: updateResults.updated,
      errors: syncResults.errors.length
    };
  }

  resolveWithDefaultStrategy(conflict) {
    // Default: use first available medication
    return conflict.medications[0].medication;
  }

  async flagForManualResolution(conflict) {
    // Flag for manual review
    return {
      ...conflict.medications[0].medication,
      requiresManualReview: true,
      conflictDetails: conflict
    };
  }

  resolveWithPharmacyPriority(conflict) {
    const pharmacyMedication = conflict.medications.find(m => m.source === 'PHARMACY');
    return pharmacyMedication ? pharmacyMedication.medication : this.resolveWithDefaultStrategy(conflict);
  }

  handleConflictDetected({ patientId, conflict }) {
    console.log(`Conflict detected for patient ${patientId}:`, conflict.medicationName);
  }
}

export default new MedicationSyncService();