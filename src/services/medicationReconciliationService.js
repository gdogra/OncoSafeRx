/**
 * Medication Reconciliation Service
 * Implements clinical medication reconciliation workflows per Joint Commission standards
 */
class MedicationReconciliationService {
  constructor() {
    this.reconciliationStandards = {
      jointCommission: {
        required: true,
        timeframe: '24_hours',
        minimumDataPoints: ['name', 'dose', 'frequency', 'route']
      },
      cms: {
        required: true,
        reporting: 'quarterly',
        qualityMeasures: ['medication_accuracy', 'discharge_reconciliation']
      }
    };

    this.reconciliationTypes = {
      admission: 'Admission Medication Reconciliation',
      transfer: 'Transfer Medication Reconciliation', 
      discharge: 'Discharge Medication Reconciliation',
      outpatient: 'Ambulatory Care Reconciliation'
    };

    this.discrepancyTypes = {
      intentional: 'Intentional medication change',
      unintentional: 'Unintentional discrepancy requiring correction',
      documentation: 'Documentation error or omission',
      patient_reported: 'Patient-reported medication not in records'
    };
  }

  /**
   * Initiate medication reconciliation workflow
   */
  async initiateReconciliation(patientId, reconciliationType, clinicianId, context = {}) {
    try {
      const reconciliationId = this.generateReconciliationId();
      
      // Gather all medication sources
      const medicationSources = await this.gatherMedicationSources(patientId, context);
      
      // Perform automated comparison
      const comparisonResults = await this.performAutomatedComparison(medicationSources);
      
      // Generate discrepancy report
      const discrepancies = await this.identifyDiscrepancies(comparisonResults);
      
      // Create reconciliation workflow
      const workflow = await this.createReconciliationWorkflow(
        reconciliationId,
        patientId,
        reconciliationType,
        clinicianId,
        medicationSources,
        discrepancies
      );

      return {
        success: true,
        reconciliationId,
        workflow,
        discrepancies: discrepancies.length,
        requiresReview: discrepancies.some(d => d.severity === 'high'),
        estimatedCompletionTime: this.estimateCompletionTime(discrepancies.length)
      };
    } catch (error) {
      console.error('Failed to initiate medication reconciliation:', error);
      throw new Error(`Reconciliation initiation failed: ${error.message}`);
    }
  }

  /**
   * Gather medication data from all available sources
   */
  async gatherMedicationSources(patientId, context) {
    const sources = [];

    try {
      // Home medications (patient-reported)
      const homeMedications = await this.getHomeMedications(patientId);
      if (homeMedications.length > 0) {
        sources.push({
          type: 'home_medications',
          source: 'Patient/Family Report',
          medications: homeMedications,
          reliability: 'patient_reported',
          collectedBy: context.collectedBy,
          collectionMethod: context.collectionMethod || 'interview'
        });
      }

      // EHR medication history
      const ehrMedications = await this.getEHRMedications(patientId);
      if (ehrMedications.length > 0) {
        sources.push({
          type: 'ehr_medications',
          source: 'Electronic Health Record',
          medications: ehrMedications,
          reliability: 'high',
          lastUpdated: ehrMedications.lastUpdated
        });
      }

      // Pharmacy records
      const pharmacyMedications = await this.getPharmacyMedications(patientId);
      if (pharmacyMedications.length > 0) {
        sources.push({
          type: 'pharmacy_medications',
          source: 'Pharmacy Records',
          medications: pharmacyMedications,
          reliability: 'high',
          includesDispenseHistory: true
        });
      }

      // Current inpatient orders
      if (context.inpatientStay) {
        const inpatientOrders = await this.getInpatientOrders(patientId, context.encounterDate);
        if (inpatientOrders.length > 0) {
          sources.push({
            type: 'inpatient_orders',
            source: 'Current Hospital Orders',
            medications: inpatientOrders,
            reliability: 'high',
            orderingPhysician: context.orderingPhysician
          });
        }
      }

      // Prior discharge summaries
      const dischargeMedications = await this.getPriorDischargeMedications(patientId, 90); // Last 90 days
      if (dischargeMedications.length > 0) {
        sources.push({
          type: 'discharge_medications',
          source: 'Prior Discharge Summaries',
          medications: dischargeMedications,
          reliability: 'medium',
          timeframe: '90_days'
        });
      }

      // Specialist clinic records
      const specialistMedications = await this.getSpecialistMedications(patientId);
      if (specialistMedications.length > 0) {
        sources.push({
          type: 'specialist_medications',
          source: 'Specialist Clinic Records',
          medications: specialistMedications,
          reliability: 'high',
          specialties: this.getUniqueSpecialties(specialistMedications)
        });
      }

      return sources;
    } catch (error) {
      console.error('Error gathering medication sources:', error);
      throw new Error(`Failed to gather medication sources: ${error.message}`);
    }
  }

  /**
   * Perform automated medication comparison across sources
   */
  async performAutomatedComparison(medicationSources) {
    const comparisonResults = {
      medicationMap: new Map(),
      matches: [],
      discrepancies: [],
      missingMedications: [],
      duplicates: []
    };

    // Create comprehensive medication map
    for (const source of medicationSources) {
      for (const medication of source.medications) {
        const key = this.generateMedicationKey(medication);
        
        if (!comparisonResults.medicationMap.has(key)) {
          comparisonResults.medicationMap.set(key, []);
        }
        
        comparisonResults.medicationMap.get(key).push({
          medication,
          source: source.type,
          sourceData: source,
          reliability: source.reliability
        });
      }
    }

    // Analyze each medication group
    for (const [medicationKey, medicationEntries] of comparisonResults.medicationMap) {
      const analysis = await this.analyzeMedicationGroup(medicationKey, medicationEntries);
      
      if (analysis.hasDiscrepancies) {
        comparisonResults.discrepancies.push(analysis);
      } else {
        comparisonResults.matches.push(analysis);
      }

      if (analysis.isDuplicate) {
        comparisonResults.duplicates.push(analysis);
      }
    }

    // Identify medications present in only one source
    comparisonResults.missingMedications = this.identifyMissingMedications(comparisonResults.medicationMap);

    return comparisonResults;
  }

  /**
   * Analyze a group of medications with the same identifier
   */
  async analyzeMedicationGroup(medicationKey, medicationEntries) {
    const analysis = {
      medicationKey,
      medicationName: medicationEntries[0].medication.name,
      entries: medicationEntries,
      hasDiscrepancies: false,
      isDuplicate: medicationEntries.length > 2,
      discrepancies: [],
      consensus: null,
      confidence: 0
    };

    if (medicationEntries.length === 1) {
      // Single source - check if critical medication missing from other sources
      analysis.consensus = medicationEntries[0].medication;
      analysis.confidence = this.calculateSingleSourceConfidence(medicationEntries[0]);
      return analysis;
    }

    // Compare multiple entries
    const reference = medicationEntries[0].medication;
    
    for (let i = 1; i < medicationEntries.length; i++) {
      const current = medicationEntries[i].medication;
      const discrepancies = this.compareIndividualMedications(reference, current, medicationEntries[0], medicationEntries[i]);
      
      if (discrepancies.length > 0) {
        analysis.hasDiscrepancies = true;
        analysis.discrepancies.push(...discrepancies);
      }
    }

    // Generate consensus medication if possible
    analysis.consensus = await this.generateConsensusMedication(medicationEntries);
    analysis.confidence = this.calculateConsensusConfidence(medicationEntries, analysis.discrepancies);

    return analysis;
  }

  /**
   * Compare two individual medications for discrepancies
   */
  compareIndividualMedications(med1, med2, source1, source2) {
    const discrepancies = [];

    // Dose comparison
    if (med1.dosage && med2.dosage && med1.dosage !== med2.dosage) {
      discrepancies.push({
        type: 'dose_discrepancy',
        field: 'dosage',
        values: [
          { value: med1.dosage, source: source1.source },
          { value: med2.dosage, source: source2.source }
        ],
        severity: this.assessDoseSeverity(med1.dosage, med2.dosage),
        clinicalSignificance: 'high'
      });
    }

    // Frequency comparison
    if (med1.frequency && med2.frequency && med1.frequency !== med2.frequency) {
      discrepancies.push({
        type: 'frequency_discrepancy',
        field: 'frequency',
        values: [
          { value: med1.frequency, source: source1.source },
          { value: med2.frequency, source: source2.source }
        ],
        severity: this.assessFrequencySeverity(med1.frequency, med2.frequency),
        clinicalSignificance: 'high'
      });
    }

    // Route comparison
    if (med1.route && med2.route && med1.route !== med2.route) {
      discrepancies.push({
        type: 'route_discrepancy',
        field: 'route',
        values: [
          { value: med1.route, source: source1.source },
          { value: med2.route, source: source2.source }
        ],
        severity: 'medium',
        clinicalSignificance: 'medium'
      });
    }

    // Status comparison (active/inactive)
    if (med1.status && med2.status && med1.status !== med2.status) {
      discrepancies.push({
        type: 'status_discrepancy',
        field: 'status',
        values: [
          { value: med1.status, source: source1.source },
          { value: med2.status, source: source2.source }
        ],
        severity: 'high',
        clinicalSignificance: 'high'
      });
    }

    return discrepancies;
  }

  /**
   * Identify discrepancies requiring clinical review
   */
  async identifyDiscrepancies(comparisonResults) {
    const discrepancies = [];

    // Process medication discrepancies
    for (const medicationAnalysis of comparisonResults.discrepancies) {
      for (const discrepancy of medicationAnalysis.discrepancies) {
        discrepancies.push({
          id: this.generateDiscrepancyId(),
          medicationName: medicationAnalysis.medicationName,
          type: discrepancy.type,
          severity: discrepancy.severity,
          clinicalSignificance: discrepancy.clinicalSignificance,
          details: discrepancy,
          requiresPhysicianReview: discrepancy.severity === 'high',
          status: 'pending_review',
          identifiedAt: new Date()
        });
      }
    }

    // Add missing medication discrepancies
    for (const missingMed of comparisonResults.missingMedications) {
      discrepancies.push({
        id: this.generateDiscrepancyId(),
        medicationName: missingMed.medicationName,
        type: 'missing_medication',
        severity: this.assessMissingMedicationSeverity(missingMed),
        clinicalSignificance: 'high',
        details: {
          presentIn: missingMed.sources,
          missingFrom: this.getOtherSources(missingMed.sources),
          lastKnownStatus: missingMed.lastKnownStatus
        },
        requiresPhysicianReview: true,
        status: 'pending_review',
        identifiedAt: new Date()
      });
    }

    // Add duplicate medication discrepancies
    for (const duplicate of comparisonResults.duplicates) {
      if (duplicate.entries.length > 2) {
        discrepancies.push({
          id: this.generateDiscrepancyId(),
          medicationName: duplicate.medicationName,
          type: 'duplicate_medication',
          severity: 'medium',
          clinicalSignificance: 'medium',
          details: {
            duplicateCount: duplicate.entries.length,
            sources: duplicate.entries.map(e => e.source)
          },
          requiresPhysicianReview: false,
          status: 'pending_review',
          identifiedAt: new Date()
        });
      }
    }

    return discrepancies.sort((a, b) => this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity));
  }

  /**
   * Create reconciliation workflow with tasks
   */
  async createReconciliationWorkflow(reconciliationId, patientId, type, clinicianId, sources, discrepancies) {
    const workflow = {
      id: reconciliationId,
      patientId,
      type,
      clinicianId,
      status: 'in_progress',
      createdAt: new Date(),
      estimatedCompletion: this.estimateCompletionTime(discrepancies.length),
      
      // Workflow tasks
      tasks: [
        {
          id: 'review_sources',
          title: 'Review Medication Sources',
          description: 'Verify completeness and accuracy of gathered medication sources',
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'high',
          estimatedTime: 5 // minutes
        },
        {
          id: 'resolve_discrepancies',
          title: 'Resolve Medication Discrepancies',
          description: `Review and resolve ${discrepancies.length} identified discrepancies`,
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'high',
          estimatedTime: discrepancies.length * 2,
          discrepancies: discrepancies
        },
        {
          id: 'verify_allergies',
          title: 'Verify Drug Allergies',
          description: 'Confirm patient drug allergies and intolerances',
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'high',
          estimatedTime: 3
        },
        {
          id: 'finalize_list',
          title: 'Finalize Medication List',
          description: 'Create final reconciled medication list',
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'high',
          estimatedTime: 5
        },
        {
          id: 'document_changes',
          title: 'Document Changes',
          description: 'Document all intentional changes and rationale',
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'medium',
          estimatedTime: 5
        },
        {
          id: 'patient_education',
          title: 'Patient Education',
          description: 'Educate patient on medication changes',
          status: 'pending',
          assignedTo: clinicianId,
          priority: 'medium',
          estimatedTime: 10
        }
      ],

      // Source data
      sources,
      
      // Quality metrics
      metrics: {
        totalMedications: sources.reduce((sum, s) => sum + s.medications.length, 0),
        discrepancyCount: discrepancies.length,
        highSeverityCount: discrepancies.filter(d => d.severity === 'high').length,
        sourcesReviewed: sources.length,
        completenessScore: this.calculateCompletenessScore(sources)
      }
    };

    return workflow;
  }

  /**
   * Resolve individual discrepancy
   */
  async resolveDiscrepancy(reconciliationId, discrepancyId, resolution, clinicianId) {
    try {
      const workflow = await this.getWorkflow(reconciliationId);
      const discrepancy = this.findDiscrepancy(workflow, discrepancyId);
      
      if (!discrepancy) {
        throw new Error('Discrepancy not found');
      }

      // Validate resolution
      this.validateResolution(discrepancy, resolution);
      
      // Apply resolution
      const resolvedDiscrepancy = {
        ...discrepancy,
        status: 'resolved',
        resolution: {
          type: resolution.type, // 'intentional_change', 'error_correction', 'no_action'
          rationale: resolution.rationale,
          finalMedication: resolution.finalMedication,
          resolvedBy: clinicianId,
          resolvedAt: new Date()
        }
      };

      // Update workflow
      await this.updateWorkflowDiscrepancy(reconciliationId, resolvedDiscrepancy);
      
      // Check if all discrepancies resolved
      await this.checkWorkflowCompletion(reconciliationId);

      return {
        success: true,
        discrepancyId,
        status: 'resolved',
        resolution: resolvedDiscrepancy.resolution
      };
    } catch (error) {
      console.error('Failed to resolve discrepancy:', error);
      throw new Error(`Discrepancy resolution failed: ${error.message}`);
    }
  }

  /**
   * Complete medication reconciliation
   */
  async completeReconciliation(reconciliationId, finalMedicationList, clinicianId) {
    try {
      const workflow = await this.getWorkflow(reconciliationId);
      
      // Validate completion requirements
      this.validateCompletionRequirements(workflow);
      
      // Generate final reconciliation report
      const report = await this.generateReconciliationReport(workflow, finalMedicationList);
      
      // Update patient medication list
      await this.updatePatientMedicationList(workflow.patientId, finalMedicationList);
      
      // Mark workflow as completed
      await this.completeWorkflow(reconciliationId, report, clinicianId);
      
      // Generate quality metrics
      const qualityMetrics = await this.generateQualityMetrics(workflow, report);
      
      return {
        success: true,
        reconciliationId,
        status: 'completed',
        report,
        qualityMetrics,
        completedAt: new Date()
      };
    } catch (error) {
      console.error('Failed to complete reconciliation:', error);
      throw new Error(`Reconciliation completion failed: ${error.message}`);
    }
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(workflow, finalMedicationList) {
    const report = {
      reconciliationId: workflow.id,
      patientId: workflow.patientId,
      type: workflow.type,
      completedBy: workflow.clinicianId,
      completedAt: new Date(),
      
      summary: {
        totalSourceMedications: workflow.metrics.totalMedications,
        finalMedicationCount: finalMedicationList.length,
        discrepanciesIdentified: workflow.metrics.discrepancyCount,
        discrepanciesResolved: this.countResolvedDiscrepancies(workflow),
        sourcesReviewed: workflow.sources.length
      },
      
      changes: {
        added: this.identifyAddedMedications(workflow.sources, finalMedicationList),
        modified: this.identifyModifiedMedications(workflow.sources, finalMedicationList),
        discontinued: this.identifyDiscontinuedMedications(workflow.sources, finalMedicationList)
      },
      
      clinicalNotes: {
        intentionalChanges: this.extractIntentionalChanges(workflow),
        clinicalRationale: this.extractClinicalRationale(workflow),
        patientEducationProvided: true
      },
      
      qualityIndicators: {
        completenessScore: this.calculateCompletenessScore(workflow.sources),
        accuracyScore: this.calculateAccuracyScore(workflow),
        timeToCompletion: this.calculateCompletionTime(workflow),
        standardsCompliance: this.assessStandardsCompliance(workflow)
      }
    };

    return report;
  }

  // Helper methods
  generateReconciliationId() {
    return `recon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateDiscrepancyId() {
    return `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMedicationKey(medication) {
    if (medication.ndc) return `ndc_${medication.ndc}`;
    if (medication.rxcui) return `rxcui_${medication.rxcui}`;
    return `name_${medication.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20)}`;
  }

  assessDoseSeverity(dose1, dose2) {
    // Implement dose comparison logic
    const diff = Math.abs(parseFloat(dose1) - parseFloat(dose2)) / parseFloat(dose1);
    if (diff > 0.5) return 'high';
    if (diff > 0.2) return 'medium';
    return 'low';
  }

  assessFrequencySeverity(freq1, freq2) {
    // Implement frequency comparison logic
    return 'medium'; // Simplified for now
  }

  calculateSingleSourceConfidence(entry) {
    const reliabilityScores = {
      'high': 0.9,
      'medium': 0.7,
      'patient_reported': 0.5
    };
    return reliabilityScores[entry.reliability] || 0.5;
  }

  async generateConsensusMedication(entries) {
    // Implement consensus generation logic
    const highReliabilityEntry = entries.find(e => e.reliability === 'high');
    return highReliabilityEntry ? highReliabilityEntry.medication : entries[0].medication;
  }

  calculateConsensusConfidence(entries, discrepancies) {
    const baseConfidence = 0.8;
    const discrepancyPenalty = discrepancies.length * 0.1;
    return Math.max(0.1, baseConfidence - discrepancyPenalty);
  }

  identifyMissingMedications(medicationMap) {
    // Implementation for identifying medications missing from certain sources
    return [];
  }

  getSeverityWeight(severity) {
    const weights = { 'high': 3, 'medium': 2, 'low': 1 };
    return weights[severity] || 0;
  }

  estimateCompletionTime(discrepancyCount) {
    const baseTime = 15; // minutes
    const perDiscrepancyTime = 3; // minutes
    return baseTime + (discrepancyCount * perDiscrepancyTime);
  }

  calculateCompletenessScore(sources) {
    // Implementation for calculating how complete the medication sources are
    return Math.min(100, sources.length * 20); // Simplified scoring
  }

  // Placeholder methods for external data sources
  async getHomeMedications(patientId) { return []; }
  async getEHRMedications(patientId) { return []; }
  async getPharmacyMedications(patientId) { return []; }
  async getInpatientOrders(patientId, encounterDate) { return []; }
  async getPriorDischargeMedications(patientId, days) { return []; }
  async getSpecialistMedications(patientId) { return []; }
  
  getUniqueSpecialties(medications) { return []; }
  getOtherSources(presentSources) { return []; }
  assessMissingMedicationSeverity(missingMed) { return 'medium'; }
  
  // Workflow management placeholder methods
  async getWorkflow(id) { return null; }
  findDiscrepancy(workflow, id) { return null; }
  validateResolution(discrepancy, resolution) { return true; }
  async updateWorkflowDiscrepancy(id, discrepancy) { return true; }
  async checkWorkflowCompletion(id) { return true; }
  validateCompletionRequirements(workflow) { return true; }
  async updatePatientMedicationList(patientId, list) { return true; }
  async completeWorkflow(id, report, clinicianId) { return true; }
  async generateQualityMetrics(workflow, report) { return {}; }
  
  countResolvedDiscrepancies(workflow) { return 0; }
  identifyAddedMedications(sources, finalList) { return []; }
  identifyModifiedMedications(sources, finalList) { return []; }
  identifyDiscontinuedMedications(sources, finalList) { return []; }
  extractIntentionalChanges(workflow) { return []; }
  extractClinicalRationale(workflow) { return ''; }
  calculateAccuracyScore(workflow) { return 95; }
  calculateCompletionTime(workflow) { return 20; }
  assessStandardsCompliance(workflow) { return true; }
}

export default new MedicationReconciliationService();