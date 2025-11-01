import axios from 'axios';
import { randomUUID } from 'crypto';

export class EnhancedFHIRService {
  constructor() {
    this.fhirBaseUrl = process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 15; // 15 minutes
    
    // Initialize FHIR client
    this.fhirClient = axios.create({
      baseURL: this.fhirBaseUrl,
      timeout: 30000,
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json',
        'Cache-Control': 'no-cache'
      }
    });

    // Add authentication if configured
    if (process.env.FHIR_AUTH_TOKEN) {
      this.fhirClient.defaults.headers['Authorization'] = `Bearer ${process.env.FHIR_AUTH_TOKEN}`;
    }

    // Epic-specific configuration
    if (process.env.EPIC_CLIENT_ID) {
      this.epicConfig = {
        clientId: process.env.EPIC_CLIENT_ID,
        baseUrl: process.env.EPIC_FHIR_URL
      };
    }

    // Cerner-specific configuration
    if (process.env.CERNER_CLIENT_ID) {
      this.cernerConfig = {
        clientId: process.env.CERNER_CLIENT_ID,
        baseUrl: process.env.CERNER_FHIR_URL
      };
    }
  }

  /**
   * Comprehensive patient data retrieval with clinical context
   */
  async getComprehensivePatientData(patientId, includeOptions = {}) {
    try {
      const {
        includeMedications = true,
        includeConditions = true,
        includeObservations = true,
        includeEncounters = true,
        includeAllergies = true,
        includeProcedures = true,
        includeImmunizations = false,
        includeCarePlans = true,
        timeRange = '2y' // Last 2 years
      } = includeOptions;

      const patientData = {
        patient: await this.getPatient(patientId),
        medications: includeMedications ? await this.getPatientMedications(patientId, timeRange) : [],
        conditions: includeConditions ? await this.getPatientConditions(patientId) : [],
        observations: includeObservations ? await this.getPatientObservations(patientId, timeRange) : [],
        encounters: includeEncounters ? await this.getPatientEncounters(patientId, timeRange) : [],
        allergies: includeAllergies ? await this.getPatientAllergies(patientId) : [],
        procedures: includeProcedures ? await this.getPatientProcedures(patientId, timeRange) : [],
        immunizations: includeImmunizations ? await this.getPatientImmunizations(patientId) : [],
        carePlans: includeCarePlans ? await this.getPatientCarePlans(patientId) : []
      };

      // Enhance with clinical context
      const clinicalProfile = await this.buildClinicalProfile(patientData);
      
      return {
        fhirData: patientData,
        clinicalProfile,
        retrievalMetadata: {
          timestamp: new Date().toISOString(),
          patientId,
          dataScope: includeOptions,
          fhirVersion: 'R4'
        }
      };

    } catch (error) {
      console.error('Error retrieving comprehensive patient data:', error);
      throw new Error('Failed to retrieve patient data from FHIR server');
    }
  }

  /**
   * Enhanced patient retrieval with demographics
   */
  async getPatient(patientId) {
    try {
      const response = await this.fhirClient.get(`/Patient/${patientId}`);
      const patient = response.data;

      return {
        id: patient.id,
        identifier: this.extractIdentifiers(patient),
        name: this.extractName(patient),
        demographics: this.extractDemographics(patient),
        contact: this.extractContact(patient),
        extensions: this.extractExtensions(patient)
      };

    } catch (error) {
      console.error('Error retrieving patient:', error);
      throw new Error('Patient not found or FHIR server error');
    }
  }

  /**
   * Get patient medications with detailed information
   */
  async getPatientMedications(patientId, timeRange = '1y') {
    try {
      const sinceDate = this.calculateSinceDate(timeRange);
      
      const response = await this.fhirClient.get('/MedicationRequest', {
        params: {
          patient: patientId,
          '_include': 'MedicationRequest:medication',
          '_count': 100,
          'date': `ge${sinceDate}`,
          'status:not': 'cancelled'
        }
      });

      const medications = [];
      const medicationResources = new Map();

      // Process bundle entries
      if (response.data.entry) {
        for (const entry of response.data.entry) {
          if (entry.resource.resourceType === 'Medication') {
            medicationResources.set(entry.resource.id, entry.resource);
          } else if (entry.resource.resourceType === 'MedicationRequest') {
            const medicationRequest = entry.resource;
            const medication = await this.resolveMedication(medicationRequest, medicationResources);
            
            medications.push({
              id: medicationRequest.id,
              medication: medication,
              status: medicationRequest.status,
              intent: medicationRequest.intent,
              dosageInstruction: this.extractDosageInstructions(medicationRequest),
              effectivePeriod: this.extractEffectivePeriod(medicationRequest),
              prescriber: await this.extractPrescriber(medicationRequest),
              indication: this.extractIndication(medicationRequest),
              rxcui: this.extractRxCUI(medication)
            });
          }
        }
      }

      return medications;

    } catch (error) {
      console.error('Error retrieving patient medications:', error);
      return [];
    }
  }

  /**
   * Get patient conditions with staging and severity
   */
  async getPatientConditions(patientId) {
    try {
      const response = await this.fhirClient.get('/Condition', {
        params: {
          patient: patientId,
          '_count': 50,
          'clinical-status': 'active,recurrence,relapse'
        }
      });

      const conditions = [];

      if (response.data.entry) {
        for (const entry of response.data.entry) {
          const condition = entry.resource;
          conditions.push({
            id: condition.id,
            code: this.extractCode(condition.code),
            display: this.extractDisplay(condition.code),
            clinicalStatus: condition.clinicalStatus?.coding?.[0]?.code,
            verificationStatus: condition.verificationStatus?.coding?.[0]?.code,
            category: this.extractCategory(condition),
            severity: this.extractSeverity(condition),
            stage: this.extractStage(condition),
            onsetDate: this.extractOnsetDate(condition),
            recordedDate: condition.recordedDate,
            bodySite: this.extractBodySite(condition),
            evidence: this.extractEvidence(condition)
          });
        }
      }

      return conditions;

    } catch (error) {
      console.error('Error retrieving patient conditions:', error);
      return [];
    }
  }

  /**
   * Get patient observations including lab results and vital signs
   */
  async getPatientObservations(patientId, timeRange = '1y') {
    try {
      const sinceDate = this.calculateSinceDate(timeRange);
      
      // Get multiple types of observations
      const observationTypes = [
        'vital-signs',
        'laboratory',
        'survey',
        'imaging',
        'procedure'
      ];

      const allObservations = [];

      for (const category of observationTypes) {
        const observations = await this.getObservationsByCategory(patientId, category, sinceDate);
        allObservations.push(...observations);
      }

      // Sort by date (most recent first)
      return allObservations.sort((a, b) => new Date(b.effectiveDateTime) - new Date(a.effectiveDateTime));

    } catch (error) {
      console.error('Error retrieving patient observations:', error);
      return [];
    }
  }

  /**
   * Get observations by category
   */
  async getObservationsByCategory(patientId, category, sinceDate) {
    try {
      const response = await this.fhirClient.get('/Observation', {
        params: {
          patient: patientId,
          category: category,
          date: `ge${sinceDate}`,
          '_count': 100,
          '_sort': '-date'
        }
      });

      const observations = [];

      if (response.data.entry) {
        for (const entry of response.data.entry) {
          const obs = entry.resource;
          observations.push({
            id: obs.id,
            code: this.extractCode(obs.code),
            display: this.extractDisplay(obs.code),
            category: category,
            status: obs.status,
            effectiveDateTime: obs.effectiveDateTime || obs.effectivePeriod?.start,
            value: this.extractObservationValue(obs),
            referenceRange: this.extractReferenceRange(obs),
            interpretation: this.extractInterpretation(obs),
            component: this.extractComponents(obs),
            performer: await this.extractPerformer(obs)
          });
        }
      }

      return observations;

    } catch (error) {
      console.error(`Error retrieving ${category} observations:`, error);
      return [];
    }
  }

  /**
   * Build comprehensive clinical profile from FHIR data
   */
  async buildClinicalProfile(fhirData) {
    const profile = {
      demographics: this.extractDemographicSummary(fhirData.patient),
      activeMedications: await this.categorizeActiveMedications(fhirData.medications),
      medicalHistory: await this.categorizeMedicalHistory(fhirData.conditions),
      laboratoryProfile: await this.buildLaboratoryProfile(fhirData.observations),
      vitalSigns: await this.extractLatestVitals(fhirData.observations),
      allergiesAndReactions: await this.processAllergies(fhirData.allergies),
      cancerProfile: await this.buildCancerProfile(fhirData),
      riskFactors: await this.identifyRiskFactors(fhirData),
      currentTreatmentStatus: await this.assessTreatmentStatus(fhirData)
    };

    return profile;
  }

  /**
   * Categorize active medications by therapeutic class
   */
  async categorizeActiveMedications(medications) {
    const categories = {
      chemotherapy: [],
      immunotherapy: [],
      targetedTherapy: [],
      hormonalTherapy: [],
      supportiveCare: [],
      other: []
    };

    for (const med of medications) {
      if (med.status === 'active' || med.status === 'on-hold') {
        const category = await this.classifyMedication(med);
        categories[category].push({
          name: med.medication.display,
          rxcui: med.rxcui,
          dosage: med.dosageInstruction,
          startDate: med.effectivePeriod?.start,
          indication: med.indication
        });
      }
    }

    return categories;
  }

  /**
   * Build laboratory profile with trending
   */
  async buildLaboratoryProfile(observations) {
    const labCategories = {
      hematology: ['hemoglobin', 'hematocrit', 'white-cell-count', 'platelet-count', 'neutrophil-count'],
      chemistry: ['glucose', 'creatinine', 'sodium', 'potassium', 'chloride', 'co2'],
      hepatic: ['alt', 'ast', 'bilirubin-total', 'albumin'],
      cardiac: ['troponin', 'bnp', 'nt-probnp'],
      inflammatory: ['esr', 'crp'],
      tumorMarkers: ['cea', 'ca-125', 'ca-19-9', 'psa', 'afp']
    };

    const profile = {};

    for (const [category, codes] of Object.entries(labCategories)) {
      profile[category] = await this.extractLabsByCategory(observations, codes);
    }

    return profile;
  }

  /**
   * Build cancer-specific profile
   */
  async buildCancerProfile(fhirData) {
    const cancerConditions = fhirData.conditions.filter(condition => 
      this.isCancerCondition(condition)
    );

    if (cancerConditions.length === 0) {
      return null;
    }

    const primaryCancer = cancerConditions.find(c => c.category === 'primary') || cancerConditions[0];

    return {
      primaryDiagnosis: {
        type: primaryCancer.display,
        stage: primaryCancer.stage,
        histology: this.extractHistology(primaryCancer),
        grade: this.extractGrade(primaryCancer),
        diagnosisDate: primaryCancer.onsetDate
      },
      biomarkers: await this.extractBiomarkers(fhirData.observations),
      treatmentHistory: await this.buildTreatmentHistory(fhirData),
      diseaseStatus: await this.assessDiseaseStatus(fhirData),
      prognosticFactors: await this.identifyPrognosticFactors(fhirData)
    };
  }

  /**
   * Extract patient identifiers
   */
  extractIdentifiers(patient) {
    const identifiers = {};
    
    if (patient.identifier) {
      for (const id of patient.identifier) {
        const type = id.type?.coding?.[0]?.code || 'unknown';
        identifiers[type] = {
          value: id.value,
          system: id.system,
          use: id.use
        };
      }
    }

    return identifiers;
  }

  /**
   * Extract patient name
   */
  extractName(patient) {
    const name = patient.name?.[0] || {};
    return {
      family: name.family,
      given: name.given,
      use: name.use,
      text: name.text
    };
  }

  /**
   * Extract demographics
   */
  extractDemographics(patient) {
    return {
      birthDate: patient.birthDate,
      age: this.calculateAge(patient.birthDate),
      gender: patient.gender,
      race: this.extractExtension(patient, 'race')?.display,
      ethnicity: this.extractExtension(patient, 'ethnicity')?.display,
      language: patient.communication?.[0]?.language?.coding?.[0]?.display,
      maritalStatus: patient.maritalStatus?.coding?.[0]?.display,
      active: patient.active
    };
  }

  // Helper methods
  calculateAge(birthDate) {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  calculateSinceDate(timeRange) {
    const now = new Date();
    const amount = parseInt(timeRange);
    const unit = timeRange.slice(-1);
    
    switch (unit) {
      case 'y': return new Date(now.setFullYear(now.getFullYear() - amount)).toISOString().split('T')[0];
      case 'm': return new Date(now.setMonth(now.getMonth() - amount)).toISOString().split('T')[0];
      case 'd': return new Date(now.setDate(now.getDate() - amount)).toISOString().split('T')[0];
      default: return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().split('T')[0];
    }
  }

  extractCode(codeableConcept) {
    return codeableConcept?.coding?.[0]?.code || null;
  }

  extractDisplay(codeableConcept) {
    return codeableConcept?.coding?.[0]?.display || codeableConcept?.text || 'Unknown';
  }

  extractExtension(resource, extensionName) {
    const extension = resource.extension?.find(ext => 
      ext.url?.includes(extensionName));
    return extension?.valueCodeableConcept?.coding?.[0];
  }

  // Enhanced medication extraction methods
  async resolveMedication(medicationRequest, medicationResources) {
    try {
      // Try to resolve from included resources first
      if (medicationRequest.medicationReference?.reference) {
        const medicationId = medicationRequest.medicationReference.reference.split('/')[1];
        const medication = medicationResources.get(medicationId);
        if (medication) {
          return {
            id: medication.id,
            code: this.extractCode(medication.code),
            display: this.extractDisplay(medication.code),
            form: this.extractDisplay(medication.form),
            ingredients: this.extractIngredients(medication),
            rxcui: this.extractRxCUI(medication)
          };
        }
      }

      // Try to resolve from CodeableConcept
      if (medicationRequest.medicationCodeableConcept) {
        return {
          code: this.extractCode(medicationRequest.medicationCodeableConcept),
          display: this.extractDisplay(medicationRequest.medicationCodeableConcept),
          rxcui: this.extractRxCUIFromCodeableConcept(medicationRequest.medicationCodeableConcept)
        };
      }

      return { display: 'Unknown medication' };
    } catch (error) {
      console.error('Error resolving medication:', error);
      return { display: 'Unknown medication' };
    }
  }

  extractDosageInstructions(medicationRequest) {
    if (!medicationRequest.dosageInstruction) return [];
    
    return medicationRequest.dosageInstruction.map(dosage => ({
      text: dosage.text,
      timing: this.extractTiming(dosage.timing),
      route: this.extractDisplay(dosage.route),
      method: this.extractDisplay(dosage.method),
      doseQuantity: this.extractQuantity(dosage.doseQuantity),
      doseRange: this.extractRange(dosage.doseRange),
      maxDosePerPeriod: this.extractRatio(dosage.maxDosePerPeriod),
      patientInstruction: dosage.patientInstruction,
      asNeeded: dosage.asNeededBoolean || dosage.asNeededCodeableConcept
    }));
  }

  extractEffectivePeriod(medicationRequest) {
    return {
      start: medicationRequest.dispenseRequest?.validityPeriod?.start,
      end: medicationRequest.dispenseRequest?.validityPeriod?.end,
      authoredOn: medicationRequest.authoredOn
    };
  }

  async extractPrescriber(medicationRequest) {
    if (!medicationRequest.requester?.reference) return null;
    
    try {
      const prescriberRef = medicationRequest.requester.reference;
      const response = await this.fhirClient.get(`/${prescriberRef}`);
      const practitioner = response.data;
      
      return {
        id: practitioner.id,
        name: this.extractName(practitioner),
        identifier: this.extractIdentifiers(practitioner),
        qualification: practitioner.qualification?.map(q => this.extractDisplay(q.code))
      };
    } catch (error) {
      console.error('Error extracting prescriber:', error);
      return null;
    }
  }

  extractIndication(medicationRequest) {
    if (!medicationRequest.reasonCode?.length && !medicationRequest.reasonReference?.length) {
      return null;
    }
    
    return {
      codes: medicationRequest.reasonCode?.map(code => ({
        code: this.extractCode(code),
        display: this.extractDisplay(code)
      })),
      references: medicationRequest.reasonReference?.map(ref => ref.reference)
    };
  }

  extractRxCUI(medication) {
    if (!medication?.code?.coding) return null;
    
    // Look for RxNorm codes
    const rxnormCoding = medication.code.coding.find(coding => 
      coding.system === 'http://www.nlm.nih.gov/research/umls/rxnorm' ||
      coding.system?.includes('rxnorm')
    );
    
    return rxnormCoding?.code || null;
  }

  extractRxCUIFromCodeableConcept(codeableConcept) {
    if (!codeableConcept?.coding) return null;
    
    const rxnormCoding = codeableConcept.coding.find(coding => 
      coding.system === 'http://www.nlm.nih.gov/research/umls/rxnorm' ||
      coding.system?.includes('rxnorm')
    );
    
    return rxnormCoding?.code || null;
  }
  // Enhanced condition extraction methods
  extractCategory(condition) {
    const category = condition.category?.[0];
    if (!category) return null;
    
    return {
      code: this.extractCode(category),
      display: this.extractDisplay(category),
      system: category.coding?.[0]?.system
    };
  }

  extractSeverity(condition) {
    if (!condition.severity) return null;
    
    return {
      code: this.extractCode(condition.severity),
      display: this.extractDisplay(condition.severity)
    };
  }

  extractStage(condition) {
    if (!condition.stage?.length) return null;
    
    return condition.stage.map(stage => ({
      summary: {
        code: this.extractCode(stage.summary),
        display: this.extractDisplay(stage.summary)
      },
      assessment: stage.assessment?.map(ref => ref.reference),
      type: {
        code: this.extractCode(stage.type),
        display: this.extractDisplay(stage.type)
      }
    }));
  }

  extractOnsetDate(condition) {
    if (condition.onsetDateTime) return condition.onsetDateTime;
    if (condition.onsetAge) return this.extractQuantity(condition.onsetAge);
    if (condition.onsetPeriod) return this.extractPeriod(condition.onsetPeriod);
    if (condition.onsetRange) return this.extractRange(condition.onsetRange);
    if (condition.onsetString) return condition.onsetString;
    return null;
  }

  extractBodySite(condition) {
    if (!condition.bodySite?.length) return null;
    
    return condition.bodySite.map(site => ({
      code: this.extractCode(site),
      display: this.extractDisplay(site)
    }));
  }

  extractEvidence(condition) {
    if (!condition.evidence?.length) return [];
    
    return condition.evidence.map(evidence => ({
      code: evidence.code?.map(code => ({
        code: this.extractCode(code),
        display: this.extractDisplay(code)
      })),
      detail: evidence.detail?.map(ref => ref.reference)
    }));
  }

  // Enhanced observation extraction methods
  extractObservationValue(observation) {
    if (observation.valueQuantity) {
      return {
        type: 'quantity',
        value: observation.valueQuantity.value,
        unit: observation.valueQuantity.unit,
        system: observation.valueQuantity.system,
        code: observation.valueQuantity.code
      };
    }
    
    if (observation.valueCodeableConcept) {
      return {
        type: 'coded',
        code: this.extractCode(observation.valueCodeableConcept),
        display: this.extractDisplay(observation.valueCodeableConcept)
      };
    }
    
    if (observation.valueString) {
      return { type: 'string', value: observation.valueString };
    }
    
    if (observation.valueBoolean !== undefined) {
      return { type: 'boolean', value: observation.valueBoolean };
    }
    
    if (observation.valueInteger !== undefined) {
      return { type: 'integer', value: observation.valueInteger };
    }
    
    if (observation.valueRange) {
      return { type: 'range', ...this.extractRange(observation.valueRange) };
    }
    
    return null;
  }

  extractReferenceRange(observation) {
    if (!observation.referenceRange?.length) return null;
    
    return observation.referenceRange.map(range => ({
      low: this.extractQuantity(range.low),
      high: this.extractQuantity(range.high),
      type: this.extractDisplay(range.type),
      appliesTo: range.appliesTo?.map(applies => this.extractDisplay(applies)),
      age: this.extractRange(range.age),
      text: range.text
    }));
  }

  extractInterpretation(observation) {
    if (!observation.interpretation?.length) return null;
    
    return observation.interpretation.map(interp => ({
      code: this.extractCode(interp),
      display: this.extractDisplay(interp)
    }));
  }

  extractComponents(observation) {
    if (!observation.component?.length) return [];
    
    return observation.component.map(component => ({
      code: {
        code: this.extractCode(component.code),
        display: this.extractDisplay(component.code)
      },
      value: this.extractObservationValue({ ...component }),
      interpretation: this.extractInterpretation({ interpretation: component.interpretation }),
      referenceRange: this.extractReferenceRange({ referenceRange: component.referenceRange })
    }));
  }

  async extractPerformer(observation) {
    if (!observation.performer?.length) return null;
    
    try {
      const performers = [];
      for (const performerRef of observation.performer) {
        if (performerRef.reference) {
          const response = await this.fhirClient.get(`/${performerRef.reference}`);
          const performer = response.data;
          performers.push({
            id: performer.id,
            type: performer.resourceType,
            name: this.extractName(performer) || performer.name,
            identifier: this.extractIdentifiers(performer)
          });
        }
      }
      return performers;
    } catch (error) {
      console.error('Error extracting performer:', error);
      return null;
    }
  }
  // Enhanced FHIR utility methods
  extractContact(patient) {
    const telecom = patient.telecom || [];
    const address = patient.address?.[0] || {};
    
    return {
      phone: telecom.find(t => t.system === 'phone')?.value,
      email: telecom.find(t => t.system === 'email')?.value,
      address: {
        line: address.line,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      }
    };
  }

  extractExtensions(patient) {
    return (patient.extension || []).map(ext => ({
      url: ext.url,
      value: ext.valueString || ext.valueCodeableConcept || ext.valueBoolean
    }));
  }

  // Helper methods for FHIR data types
  extractQuantity(quantity) {
    if (!quantity) return null;
    return {
      value: quantity.value,
      unit: quantity.unit,
      system: quantity.system,
      code: quantity.code
    };
  }

  extractRange(range) {
    if (!range) return null;
    return {
      low: this.extractQuantity(range.low),
      high: this.extractQuantity(range.high)
    };
  }

  extractPeriod(period) {
    if (!period) return null;
    return {
      start: period.start,
      end: period.end
    };
  }

  extractRatio(ratio) {
    if (!ratio) return null;
    return {
      numerator: this.extractQuantity(ratio.numerator),
      denominator: this.extractQuantity(ratio.denominator)
    };
  }

  extractTiming(timing) {
    if (!timing) return null;
    return {
      event: timing.event,
      repeat: timing.repeat,
      code: this.extractDisplay(timing.code)
    };
  }

  extractIngredients(medication) {
    if (!medication.ingredient?.length) return [];
    
    return medication.ingredient.map(ingredient => ({
      item: {
        code: this.extractCode(ingredient.itemCodeableConcept),
        display: this.extractDisplay(ingredient.itemCodeableConcept)
      },
      strength: this.extractRatio(ingredient.strength),
      isActive: ingredient.isActive
    }));
  }

  // Clinical intelligence methods
  async categorizeMedicalHistory(conditions) {
    const categories = {
      oncology: [],
      cardiovascular: [],
      endocrine: [],
      neurological: [],
      psychiatric: [],
      infectious: [],
      other: []
    };

    for (const condition of conditions) {
      const category = this.categorizeCondition(condition);
      categories[category].push(condition);
    }

    return categories;
  }

  categorizeCondition(condition) {
    const code = this.extractCode(condition.code);
    const display = this.extractDisplay(condition.code).toLowerCase();
    
    // Cancer conditions
    if (this.isCancerCondition(condition)) return 'oncology';
    
    // Cardiovascular
    if (display.includes('heart') || display.includes('cardiac') || 
        display.includes('hypertension') || display.includes('coronary')) {
      return 'cardiovascular';
    }
    
    // Diabetes and endocrine
    if (display.includes('diabetes') || display.includes('thyroid') || 
        display.includes('hormone')) {
      return 'endocrine';
    }
    
    // Neurological
    if (display.includes('seizure') || display.includes('stroke') || 
        display.includes('alzheimer') || display.includes('parkinson')) {
      return 'neurological';
    }
    
    // Psychiatric
    if (display.includes('depression') || display.includes('anxiety') || 
        display.includes('bipolar') || display.includes('schizophrenia')) {
      return 'psychiatric';
    }
    
    // Infectious
    if (display.includes('infection') || display.includes('virus') || 
        display.includes('bacterial')) {
      return 'infectious';
    }
    
    return 'other';
  }

  async extractLatestVitals(observations) {
    const vitalSigns = {
      bloodPressure: null,
      heartRate: null,
      temperature: null,
      respiratoryRate: null,
      oxygenSaturation: null,
      weight: null,
      height: null,
      bmi: null
    };

    const vitalCodes = {
      '85354-9': 'bloodPressure',
      '8867-4': 'heartRate',
      '8310-5': 'temperature',
      '9279-1': 'respiratoryRate',
      '2708-6': 'oxygenSaturation',
      '29463-7': 'weight',
      '8302-2': 'height',
      '39156-5': 'bmi'
    };

    // Sort observations by date (most recent first)
    const sortedObs = observations.sort((a, b) => 
      new Date(b.effectiveDateTime) - new Date(a.effectiveDateTime)
    );

    for (const observation of sortedObs) {
      const code = this.extractCode(observation.code);
      const vitalType = vitalCodes[code];
      
      if (vitalType && !vitalSigns[vitalType]) {
        vitalSigns[vitalType] = {
          value: this.extractObservationValue(observation),
          date: observation.effectiveDateTime,
          interpretation: this.extractInterpretation(observation)
        };
      }
    }

    return vitalSigns;
  }

  async processAllergies(allergies) {
    return allergies.map(allergy => ({
      id: allergy.id,
      substance: {
        code: this.extractCode(allergy.code),
        display: this.extractDisplay(allergy.code)
      },
      category: allergy.category,
      criticality: allergy.criticality,
      type: allergy.type,
      reaction: allergy.reaction?.map(reaction => ({
        manifestation: reaction.manifestation?.map(m => this.extractDisplay(m)),
        severity: reaction.severity,
        onset: reaction.onset
      })),
      onset: allergy.onsetDateTime || allergy.onsetAge
    }));
  }

  isCancerCondition(condition) {
    const code = this.extractCode(condition.code);
    const display = this.extractDisplay(condition.code).toLowerCase();
    
    // ICD-10 cancer codes (C00-D49)
    if (code && /^[CD]\d{2}/.test(code)) return true;
    
    // Common cancer terms
    const cancerTerms = [
      'cancer', 'carcinoma', 'lymphoma', 'leukemia', 'sarcoma', 
      'melanoma', 'tumor', 'neoplasm', 'malignant', 'metastatic'
    ];
    
    return cancerTerms.some(term => display.includes(term));
  }

  async extractBiomarkers(observations) {
    const biomarkers = {};
    
    const biomarkerCodes = {
      // Common oncology biomarkers
      'her2': ['HER2', 'ERBB2'],
      'er': ['Estrogen Receptor', 'ER'],
      'pr': ['Progesterone Receptor', 'PR'],
      'pdl1': ['PD-L1', 'PDL1'],
      'msi': ['Microsatellite Instability', 'MSI'],
      'kras': ['KRAS'],
      'egfr': ['EGFR'],
      'brca1': ['BRCA1'],
      'brca2': ['BRCA2']
    };

    for (const observation of observations) {
      const display = this.extractDisplay(observation.code).toLowerCase();
      
      for (const [biomarker, terms] of Object.entries(biomarkerCodes)) {
        if (terms.some(term => display.includes(term.toLowerCase()))) {
          biomarkers[biomarker] = {
            value: this.extractObservationValue(observation),
            date: observation.effectiveDateTime,
            status: observation.status
          };
        }
      }
    }

    return biomarkers;
  }

  async buildTreatmentHistory(fhirData) {
    const treatmentHistory = [];
    
    // Extract from medications
    for (const medication of fhirData.medications || []) {
      if (await this.isOncologyMedication(medication.medication)) {
        treatmentHistory.push({
          type: 'medication',
          name: medication.medication.display,
          startDate: medication.effectivePeriod?.start,
          endDate: medication.effectivePeriod?.end,
          indication: medication.indication
        });
      }
    }
    
    // Extract from procedures
    for (const procedure of fhirData.procedures || []) {
      if (await this.isOncologyProcedure(procedure)) {
        treatmentHistory.push({
          type: 'procedure',
          name: this.extractDisplay(procedure.code),
          date: procedure.performedDateTime || procedure.performedPeriod?.start,
          bodySite: this.extractBodySite(procedure)
        });
      }
    }
    
    return treatmentHistory.sort((a, b) => 
      new Date(b.date || b.startDate) - new Date(a.date || a.startDate)
    );
  }

  async isOncologyMedication(medication) {
    const display = medication.display?.toLowerCase() || '';
    const oncologyTerms = [
      'chemotherapy', 'immunotherapy', 'targeted therapy',
      'doxorubicin', 'cisplatin', 'carboplatin', 'paclitaxel',
      'trastuzumab', 'bevacizumab', 'rituximab', 'pembrolizumab'
    ];
    
    return oncologyTerms.some(term => display.includes(term));
  }

  async isOncologyProcedure(procedure) {
    const display = this.extractDisplay(procedure.code).toLowerCase();
    const oncologyProcedures = [
      'radiation', 'chemotherapy', 'surgery', 'biopsy',
      'resection', 'mastectomy', 'lumpectomy'
    ];
    
    return oncologyProcedures.some(term => display.includes(term));
  }

  // Placeholder methods for additional FHIR resources
  async getPatientEncounters(patientId, timeRange) {
    try {
      const sinceDate = this.calculateSinceDate(timeRange);
      const response = await this.fhirClient.get('/Encounter', {
        params: { patient: patientId, date: `ge${sinceDate}` }
      });
      
      return response.data.entry?.map(entry => ({
        id: entry.resource.id,
        status: entry.resource.status,
        class: entry.resource.class,
        type: entry.resource.type?.map(t => this.extractDisplay(t)),
        period: this.extractPeriod(entry.resource.period),
        reasonCode: entry.resource.reasonCode?.map(r => this.extractDisplay(r))
      })) || [];
    } catch (error) {
      console.error('Error retrieving encounters:', error);
      return [];
    }
  }

  async getPatientAllergies(patientId) {
    try {
      const response = await this.fhirClient.get('/AllergyIntolerance', {
        params: { patient: patientId }
      });
      
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      console.error('Error retrieving allergies:', error);
      return [];
    }
  }

  async getPatientProcedures(patientId, timeRange) {
    try {
      const sinceDate = this.calculateSinceDate(timeRange);
      const response = await this.fhirClient.get('/Procedure', {
        params: { patient: patientId, date: `ge${sinceDate}` }
      });
      
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      console.error('Error retrieving procedures:', error);
      return [];
    }
  }

  async getPatientImmunizations(patientId) {
    try {
      const response = await this.fhirClient.get('/Immunization', {
        params: { patient: patientId }
      });
      
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      console.error('Error retrieving immunizations:', error);
      return [];
    }
  }

  async getPatientCarePlans(patientId) {
    try {
      const response = await this.fhirClient.get('/CarePlan', {
        params: { patient: patientId, status: 'active' }
      });
      
      return response.data.entry?.map(entry => entry.resource) || [];
    } catch (error) {
      console.error('Error retrieving care plans:', error);
      return [];
    }
  }

  /**
   * Build comprehensive clinical profile from FHIR data
   */
  async buildClinicalProfile(fhirData) {
    try {
      const profile = {
        demographics: this.extractDemographicSummary(fhirData.patient),
        medicalHistory: await this.categorizeMedicalHistory(fhirData.conditions || []),
        currentMedications: fhirData.medications || [],
        vitalSigns: await this.extractLatestVitals(fhirData.observations || []),
        allergies: await this.processAllergies(fhirData.allergies || []),
        biomarkers: await this.extractBiomarkers(fhirData.observations || []),
        treatmentHistory: await this.buildTreatmentHistory(fhirData),
        riskFactors: await this.identifyRiskFactors(fhirData),
        diseaseStatus: await this.assessDiseaseStatus(fhirData),
        prognosticFactors: await this.identifyPrognosticFactors(fhirData)
      };

      return profile;
    } catch (error) {
      console.error('Error building clinical profile:', error);
      throw new Error('Failed to build clinical profile');
    }
  }

  extractDemographicSummary(patient) {
    const demographics = this.extractDemographics(patient);
    return {
      age: demographics.age,
      gender: demographics.gender,
      race: demographics.race,
      ethnicity: demographics.ethnicity,
      active: demographics.active
    };
  }

  async identifyRiskFactors(fhirData) {
    const riskFactors = [];
    
    // Age-related risks
    const age = this.extractDemographics(fhirData.patient).age;
    if (age >= 65) {
      riskFactors.push({
        factor: 'Advanced age',
        category: 'demographic',
        significance: 'moderate'
      });
    }
    
    // Comorbidity-related risks
    for (const condition of fhirData.conditions || []) {
      const display = this.extractDisplay(condition.code).toLowerCase();
      
      if (display.includes('diabetes')) {
        riskFactors.push({
          factor: 'Diabetes mellitus',
          category: 'comorbidity',
          significance: 'high'
        });
      }
      
      if (display.includes('heart') || display.includes('cardiac')) {
        riskFactors.push({
          factor: 'Cardiac disease',
          category: 'comorbidity',
          significance: 'high'
        });
      }
      
      if (display.includes('kidney') || display.includes('renal')) {
        riskFactors.push({
          factor: 'Renal impairment',
          category: 'comorbidity',
          significance: 'high'
        });
      }
    }
    
    // Medication-related risks
    for (const medication of fhirData.medications || []) {
      const display = medication.medication.display?.toLowerCase() || '';
      
      if (display.includes('warfarin') || display.includes('anticoagulant')) {
        riskFactors.push({
          factor: 'Anticoagulation therapy',
          category: 'medication',
          significance: 'high'
        });
      }
    }
    
    return riskFactors;
  }

  async assessDiseaseStatus(fhirData) {
    const conditions = fhirData.conditions || [];
    const cancerConditions = conditions.filter(c => this.isCancerCondition(c));
    
    if (cancerConditions.length === 0) {
      return 'no_active_cancer';
    }
    
    // Look for metastatic disease
    const hasMetastatic = cancerConditions.some(condition => {
      const display = this.extractDisplay(condition.code).toLowerCase();
      return display.includes('metastatic') || display.includes('stage iv');
    });
    
    if (hasMetastatic) {
      return 'metastatic';
    }
    
    // Check if under active treatment
    const oncologyMedications = (fhirData.medications || []).filter(med => 
      this.isOncologyMedication(med.medication)
    );
    
    if (oncologyMedications.length > 0) {
      return 'under_treatment';
    }
    
    return 'stable';
  }

  async identifyPrognosticFactors(fhirData) {
    const prognosticFactors = [];
    
    // Performance status indicators
    const observations = fhirData.observations || [];
    const ecogScore = observations.find(obs => 
      this.extractDisplay(obs.code).toLowerCase().includes('ecog')
    );
    
    if (ecogScore) {
      const value = this.extractObservationValue(ecogScore);
      prognosticFactors.push({
        factor: 'ECOG Performance Status',
        value: value?.value,
        significance: value?.value >= 2 ? 'poor' : 'good'
      });
    }
    
    // Biomarker prognostic factors
    const biomarkers = await this.extractBiomarkers(observations);
    
    if (biomarkers.her2?.value?.display === 'positive') {
      prognosticFactors.push({
        factor: 'HER2 positive',
        significance: 'good',
        note: 'Targetable with HER2-directed therapy'
      });
    }
    
    if (biomarkers.pdl1?.value?.value >= 50) {
      prognosticFactors.push({
        factor: 'High PD-L1 expression',
        significance: 'good',
        note: 'Likely to respond to immunotherapy'
      });
    }
    
    return prognosticFactors;
  }
}

export default new EnhancedFHIRService();