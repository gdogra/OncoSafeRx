import axios from 'axios';

class FHIRPatientService {
  constructor() {
    this.fhirBaseUrl = process.env.FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4';
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 15; // 15 minutes cache
    
    // FHIR client configuration
    this.fhirClient = axios.create({
      baseURL: this.fhirBaseUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/fhir+json',
        'Content-Type': 'application/fhir+json'
      }
    });

    // Add authentication if configured
    if (process.env.FHIR_AUTH_TOKEN) {
      this.fhirClient.defaults.headers['Authorization'] = `Bearer ${process.env.FHIR_AUTH_TOKEN}`;
    }

  }

  /**
   * Search patients by various criteria
   */
  async searchPatients(searchCriteria) {
    try {
      const cacheKey = `search_${JSON.stringify(searchCriteria)}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let patients = [];

      // Search patients using FHIR
      patients = await this.searchPatientsFHIR(searchCriteria);

      // Cache results
      this.cache.set(cacheKey, {
        data: patients,
        timestamp: Date.now()
      });

      return patients;

    } catch (error) {
      console.error('Patient search error:', error);
      throw new Error('Failed to search patients');
    }
  }

  /**
   * Search patients using FHIR API
   */
  async searchPatientsFHIR(criteria) {
    const params = {};
    
    if (criteria.name) {
      params.name = criteria.name;
    }
    
    if (criteria.identifier) {
      params.identifier = criteria.identifier;
    }
    
    if (criteria.birthdate) {
      params.birthdate = criteria.birthdate;
    }
    
    if (criteria.gender) {
      params.gender = criteria.gender;
    }

    // Include related resources
    params._include = 'Patient:general-practitioner';
    params._revinclude = 'Condition:patient,MedicationRequest:patient,AllergyIntolerance:patient';
    
    const response = await this.fhirClient.get('/Patient', { params });
    
    if (response.data?.entry) {
      return response.data.entry
        .filter(entry => entry.resource.resourceType === 'Patient')
        .map(entry => this.transformFHIRPatient(entry.resource, response.data.entry));
    }
    
    return [];
  }


  /**
   * Get patient by ID
   */
  async getPatientById(patientId) {
    try {
      const cacheKey = `patient_${patientId}`;
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      let patient = null;

      // Get patient using FHIR
      patient = await this.getPatientByIdFHIR(patientId);

      // Cache result
      this.cache.set(cacheKey, {
        data: patient,
        timestamp: Date.now()
      });

      return patient;

    } catch (error) {
      console.error(`Error fetching patient ${patientId}:`, error);
      throw new Error(`Failed to fetch patient ${patientId}`);
    }
  }

  /**
   * Get patient by ID using FHIR
   */
  async getPatientByIdFHIR(patientId) {
    // Get patient resource
    const patientResponse = await this.fhirClient.get(`/Patient/${patientId}`);
    const patient = patientResponse.data;

    // Get related resources
    const [conditions, medications, allergies] = await Promise.allSettled([
      this.fhirClient.get('/Condition', { params: { patient: patientId } }),
      this.fhirClient.get('/MedicationRequest', { params: { patient: patientId } }),
      this.fhirClient.get('/AllergyIntolerance', { params: { patient: patientId } })
    ]);

    const relatedData = {
      conditions: conditions.status === 'fulfilled' ? conditions.value.data : null,
      medications: medications.status === 'fulfilled' ? medications.value.data : null,
      allergies: allergies.status === 'fulfilled' ? allergies.value.data : null
    };

    return this.transformFHIRPatient(patient, null, relatedData);
  }

  /**
   * Transform FHIR Patient resource to application format
   */
  transformFHIRPatient(fhirPatient, bundleEntries = null, relatedData = null) {
    const name = fhirPatient.name?.[0];
    const birthDate = fhirPatient.birthDate;
    const age = birthDate ? this.calculateAge(birthDate) : null;
    
    // Extract address
    const address = fhirPatient.address?.[0];
    
    // Extract contact info
    const telecom = fhirPatient.telecom || [];
    const phone = telecom.find(t => t.system === 'phone')?.value;
    const email = telecom.find(t => t.system === 'email')?.value;

    // Process related resources from bundle or separate calls
    let conditions = [];
    let medications = [];
    let allergies = [];

    if (bundleEntries) {
      // Extract from bundle
      conditions = bundleEntries
        .filter(entry => entry.resource.resourceType === 'Condition' && 
                entry.resource.subject.reference === `Patient/${fhirPatient.id}`)
        .map(entry => this.transformCondition(entry.resource));
      
      medications = bundleEntries
        .filter(entry => entry.resource.resourceType === 'MedicationRequest' && 
                entry.resource.subject.reference === `Patient/${fhirPatient.id}`)
        .map(entry => this.transformMedication(entry.resource));
      
      allergies = bundleEntries
        .filter(entry => entry.resource.resourceType === 'AllergyIntolerance' && 
                entry.resource.patient.reference === `Patient/${fhirPatient.id}`)
        .map(entry => this.transformAllergy(entry.resource));
    } else if (relatedData) {
      // Extract from separate API calls
      conditions = relatedData.conditions?.entry?.map(entry => 
        this.transformCondition(entry.resource)) || [];
      medications = relatedData.medications?.entry?.map(entry => 
        this.transformMedication(entry.resource)) || [];
      allergies = relatedData.allergies?.entry?.map(entry => 
        this.transformAllergy(entry.resource)) || [];
    }

    return {
      id: fhirPatient.id,
      firstName: name?.given?.[0] || 'Unknown',
      lastName: name?.family || 'Unknown',
      age,
      gender: fhirPatient.gender,
      dateOfBirth: birthDate,
      mrn: fhirPatient.identifier?.find(id => id.type?.coding?.[0]?.code === 'MR')?.value || 
           fhirPatient.identifier?.[0]?.value || fhirPatient.id,
      conditions: conditions.map(c => c.display),
      stage: this.extractCancerStage(conditions),
      medications,
      allergies: allergies.map(a => a.display),
      demographics: {
        race: this.extractExtension(fhirPatient, 'race')?.display,
        ethnicity: this.extractExtension(fhirPatient, 'ethnicity')?.display,
        language: fhirPatient.communication?.[0]?.language?.coding?.[0]?.display,
        address: address ? {
          street: address.line?.join(' '),
          city: address.city,
          state: address.state,
          zip: address.postalCode
        } : null,
        phone,
        email
      },
      insurance: this.extractInsurance(fhirPatient),
      ecogPerformanceStatus: this.extractPerformanceStatus(conditions),
      lastVisit: this.extractLastVisit(fhirPatient),
      nextAppointment: null, // Would need Appointment resources
      careTeam: this.extractCareTeam(fhirPatient),
      source: 'fhir',
      fhirId: fhirPatient.id
    };
  }

  /**
   * Transform FHIR Condition to application format
   */
  transformCondition(fhirCondition) {
    return {
      display: fhirCondition.code?.coding?.[0]?.display || 
               fhirCondition.code?.text || 'Unknown condition',
      code: fhirCondition.code?.coding?.[0]?.code,
      system: fhirCondition.code?.coding?.[0]?.system,
      clinicalStatus: fhirCondition.clinicalStatus?.coding?.[0]?.code,
      category: fhirCondition.category?.[0]?.coding?.[0]?.display,
      onsetDate: fhirCondition.onsetDateTime,
      stage: fhirCondition.stage?.[0]?.summary?.coding?.[0]?.display
    };
  }

  /**
   * Transform FHIR MedicationRequest to application format
   */
  transformMedication(fhirMedication) {
    const medication = fhirMedication.medicationCodeableConcept || 
                      fhirMedication.medicationReference;
    
    return {
      name: medication?.coding?.[0]?.display || medication?.text || 'Unknown medication',
      code: medication?.coding?.[0]?.code,
      dosage: this.extractDosage(fhirMedication),
      route: fhirMedication.dosageInstruction?.[0]?.route?.coding?.[0]?.display || 'oral',
      status: fhirMedication.status,
      intent: fhirMedication.intent
    };
  }

  /**
   * Transform FHIR AllergyIntolerance to application format
   */
  transformAllergy(fhirAllergy) {
    return {
      display: fhirAllergy.code?.coding?.[0]?.display || 
               fhirAllergy.code?.text || 'Unknown allergy',
      code: fhirAllergy.code?.coding?.[0]?.code,
      severity: fhirAllergy.reaction?.[0]?.severity,
      clinicalStatus: fhirAllergy.clinicalStatus?.coding?.[0]?.code
    };
  }

  /**
   * Utility functions
   */
  calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  extractExtension(resource, extensionName) {
    const extension = resource.extension?.find(ext => 
      ext.url?.includes(extensionName));
    return extension?.valueCodeableConcept?.coding?.[0];
  }

  extractCancerStage(conditions) {
    const cancerCondition = conditions.find(c => 
      c.display?.toLowerCase().includes('cancer') && c.stage);
    return cancerCondition?.stage || null;
  }

  extractDosage(medicationRequest) {
    const dosage = medicationRequest.dosageInstruction?.[0];
    if (!dosage) return 'As directed';
    
    const dose = dosage.doseAndRate?.[0]?.doseQuantity;
    const timing = dosage.timing?.repeat;
    
    let dosageText = '';
    if (dose) {
      dosageText += `${dose.value}${dose.unit || 'units'}`;
    }
    if (timing) {
      dosageText += ` ${this.formatTiming(timing)}`;
    }
    
    return dosageText || dosage.text || 'As directed';
  }

  formatTiming(timing) {
    if (timing.frequency && timing.period) {
      return `${timing.frequency} times per ${timing.periodUnit || 'day'}`;
    }
    return 'as directed';
  }

  extractInsurance(patient) {
    // This would typically come from Coverage resources
    return {
      provider: 'Insurance on file',
      plan: 'Unknown',
      memberId: patient.id
    };
  }

  extractPerformanceStatus(conditions) {
    // This would typically be in Observation resources
    return 1; // Default ECOG status
  }

  extractLastVisit(patient) {
    // This would come from Encounter resources
    return new Date().toISOString().split('T')[0];
  }

  extractCareTeam(patient) {
    // This would come from CareTeam resources
    return [
      { name: 'Primary Oncologist', role: 'Oncologist' },
      { name: 'Oncology Nurse', role: 'Nurse' }
    ];
  }

  /**
   * Create or update patient (for EHR integration)
   */
  async createPatient(patientData) {
    try {
      const fhirPatient = this.transformToFHIR(patientData);
      
      const response = await this.fhirClient.post('/Patient', fhirPatient);
      return this.transformFHIRPatient(response.data);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  /**
   * Transform application patient data to FHIR format
   */
  transformToFHIR(patientData) {
    return {
      resourceType: 'Patient',
      identifier: [{
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR'
          }]
        },
        value: patientData.mrn
      }],
      name: [{
        given: [patientData.firstName],
        family: patientData.lastName
      }],
      gender: patientData.gender,
      birthDate: patientData.dateOfBirth,
      address: patientData.demographics?.address ? [{
        line: [patientData.demographics.address.street],
        city: patientData.demographics.address.city,
        state: patientData.demographics.address.state,
        postalCode: patientData.demographics.address.zip
      }] : [],
      telecom: [
        ...(patientData.demographics?.phone ? [{
          system: 'phone',
          value: patientData.demographics.phone
        }] : []),
        ...(patientData.demographics?.email ? [{
          system: 'email',
          value: patientData.demographics.email
        }] : [])
      ]
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Health check for FHIR connectivity
   */
  async healthCheck() {
    try {
      const response = await this.fhirClient.get('/metadata');
      return {
        status: 'connected',
        fhirVersion: response.data.fhirVersion,
        implementation: response.data.implementation?.description,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default new FHIRPatientService();