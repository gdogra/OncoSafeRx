import { PatientProfile, PatientDemographics, PatientLabValues, PatientAllergy, PatientMedication, PatientCondition } from '../types';

// FHIR R4 Resource Interfaces
export interface FHIRBundle {
  resourceType: 'Bundle';
  id?: string;
  type: 'collection' | 'searchset' | 'history' | 'transaction' | 'document';
  total?: number;
  entry?: FHIRBundleEntry[];
}

export interface FHIRBundleEntry {
  fullUrl?: string;
  resource: FHIRResource;
  search?: {
    mode: 'match' | 'include';
    score?: number;
  };
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  identifier?: Array<{
    use?: string;
    type?: FHIRCodeableConcept;
    system?: string;
    value?: string;
  }>;
  active?: boolean;
  name?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
    family?: string;
    given?: string[];
    prefix?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
    value?: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
    type?: 'postal' | 'physical' | 'both';
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: Array<{
    low?: { value?: number; unit?: string };
    high?: { value?: number; unit?: string };
    text?: string;
  }>;
}

export interface FHIRMedicationRequest extends FHIRResource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft' | 'unknown';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept?: FHIRCodeableConcept;
  medicationReference?: FHIRReference;
  subject: FHIRReference;
  authoredOn?: string;
  dosageInstruction?: Array<{
    text?: string;
    timing?: any;
    route?: FHIRCodeableConcept;
    doseAndRate?: Array<{
      doseQuantity?: {
        value?: number;
        unit?: string;
        system?: string;
        code?: string;
      };
    }>;
  }>;
}

export interface FHIRAllergyIntolerance extends FHIRResource {
  resourceType: 'AllergyIntolerance';
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  type?: 'allergy' | 'intolerance';
  category?: Array<'food' | 'medication' | 'environment' | 'biologic'>;
  criticality?: 'low' | 'high' | 'unable-to-assess';
  code?: FHIRCodeableConcept;
  patient: FHIRReference;
  recordedDate?: string;
  reaction?: Array<{
    substance?: FHIRCodeableConcept;
    manifestation: FHIRCodeableConcept[];
    severity?: 'mild' | 'moderate' | 'severe';
  }>;
}

export interface FHIRCondition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus?: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code?: FHIRCodeableConcept;
  subject: FHIRReference;
  onsetDateTime?: string;
  onsetPeriod?: {
    start?: string;
    end?: string;
  };
  abatementDateTime?: string;
}

export interface FHIRCodeableConcept {
  coding?: Array<{
    system?: string;
    version?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: {
    system?: string;
    value?: string;
  };
  display?: string;
}

class FHIRService {
  private static instance: FHIRService;
  private baseUrl: string;
  private headers: Record<string, string>;

  private constructor() {
    this.baseUrl = (import.meta as any)?.env?.VITE_FHIR_BASE_URL || (import.meta as any)?.env?.REACT_APP_FHIR_BASE_URL || 'https://hapi.fhir.org/baseR4';
    this.headers = {
      'Content-Type': 'application/fhir+json',
      'Accept': 'application/fhir+json',
    };

    // Add authentication if available
    const authToken = (import.meta as any)?.env?.VITE_FHIR_AUTH_TOKEN || (import.meta as any)?.env?.REACT_APP_FHIR_AUTH_TOKEN;
    if (authToken) {
      this.headers['Authorization'] = `Bearer ${authToken}`;
    }
  }

  public static getInstance(): FHIRService {
    if (!FHIRService.instance) {
      FHIRService.instance = new FHIRService();
    }
    return FHIRService.instance;
  }

  /**
   * Search for patients by various criteria
   */
  public async searchPatients(criteria: {
    name?: string;
    identifier?: string;
    birthdate?: string;
    gender?: string;
    limit?: number;
  }): Promise<FHIRBundle> {
    const params = new URLSearchParams();
    
    if (criteria.name) params.append('name', criteria.name);
    if (criteria.identifier) params.append('identifier', criteria.identifier);
    if (criteria.birthdate) params.append('birthdate', criteria.birthdate);
    if (criteria.gender) params.append('gender', criteria.gender);
    params.append('_count', (criteria.limit || 10).toString());

    const response = await fetch(`${this.baseUrl}/Patient?${params}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`FHIR Patient search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get patient by ID with related resources
   */
  public async getPatientWithResources(patientId: string): Promise<{
    patient: FHIRPatient;
    observations: FHIRObservation[];
    medications: FHIRMedicationRequest[];
    allergies: FHIRAllergyIntolerance[];
    conditions: FHIRCondition[];
  }> {
    try {
      // Fetch patient
      const patientResponse = await fetch(`${this.baseUrl}/Patient/${patientId}`, {
        headers: this.headers,
      });
      
      if (!patientResponse.ok) {
        throw new Error(`Failed to fetch patient: ${patientResponse.statusText}`);
      }
      
      const patient: FHIRPatient = await patientResponse.json();

      // Fetch related resources in parallel
      const [
        observationsBundle,
        medicationsBundle,
        allergiesBundle,
        conditionsBundle
      ] = await Promise.all([
        this.getObservations(patientId),
        this.getMedicationRequests(patientId),
        this.getAllergyIntolerances(patientId),
        this.getConditions(patientId)
      ]);

      return {
        patient,
        observations: observationsBundle.entry?.map(e => e.resource as FHIRObservation) || [],
        medications: medicationsBundle.entry?.map(e => e.resource as FHIRMedicationRequest) || [],
        allergies: allergiesBundle.entry?.map(e => e.resource as FHIRAllergyIntolerance) || [],
        conditions: conditionsBundle.entry?.map(e => e.resource as FHIRCondition) || []
      };
    } catch (error) {
      console.error('Failed to fetch patient with resources:', error);
      throw error;
    }
  }

  /**
   * Get lab results (observations) for a patient
   */
  public async getObservations(patientId: string, category?: string): Promise<FHIRBundle> {
    const params = new URLSearchParams({
      patient: patientId,
      _sort: '-date',
      _count: '100'
    });

    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${this.baseUrl}/Observation?${params}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch observations: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get medication requests for a patient
   */
  public async getMedicationRequests(patientId: string): Promise<FHIRBundle> {
    const params = new URLSearchParams({
      patient: patientId,
      status: 'active',
      _sort: '-authoredon',
      _count: '50'
    });

    const response = await fetch(`${this.baseUrl}/MedicationRequest?${params}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch medication requests: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get allergy intolerances for a patient
   */
  public async getAllergyIntolerances(patientId: string): Promise<FHIRBundle> {
    const params = new URLSearchParams({
      patient: patientId,
      _count: '50'
    });

    const response = await fetch(`${this.baseUrl}/AllergyIntolerance?${params}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch allergies: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conditions for a patient
   */
  public async getConditions(patientId: string): Promise<FHIRBundle> {
    const params = new URLSearchParams({
      patient: patientId,
      _count: '50'
    });

    const response = await fetch(`${this.baseUrl}/Condition?${params}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conditions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Convert FHIR Patient to OncoSafeRx PatientProfile
   */
  public convertFHIRPatientToProfile(
    patient: FHIRPatient,
    observations: FHIRObservation[] = [],
    medications: FHIRMedicationRequest[] = [],
    allergies: FHIRAllergyIntolerance[] = [],
    conditions: FHIRCondition[] = []
  ): PatientProfile {
    const name = patient.name?.[0];
    const telecom = patient.telecom || [];
    const address = patient.address?.[0];

    const demographics: PatientDemographics = {
      firstName: name?.given?.[0] || '',
      lastName: name?.family || '',
      dateOfBirth: patient.birthDate || '',
      sex: patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'other',
      mrn: patient.identifier?.find(id => id.type?.coding?.[0]?.code === 'MR')?.value,
      contact: {
        phone: telecom.find(t => t.system === 'phone')?.value,
        email: telecom.find(t => t.system === 'email')?.value,
        address: address?.text || [address?.line?.join(' '), address?.city, address?.state].filter(Boolean).join(', ')
      }
    };

    const labValues: PatientLabValues[] = observations
      .filter(obs => obs.valueQuantity?.value !== undefined)
      .map(obs => ({
        timestamp: obs.effectiveDateTime || new Date().toISOString(),
        labType: obs.code.text || obs.code.coding?.[0]?.display || 'Unknown',
        value: obs.valueQuantity!.value!,
        unit: obs.valueQuantity!.unit || '',
        referenceRange: obs.referenceRange?.[0] ? 
          `${obs.referenceRange[0].low?.value || ''}-${obs.referenceRange[0].high?.value || ''}` : undefined,
        isAbnormal: obs.interpretation?.some(interp => 
          interp.coding?.some(coding => ['H', 'L', 'A'].includes(coding.code || ''))
        ),
        criticalFlag: obs.interpretation?.some(interp => 
          interp.coding?.some(coding => ['HH', 'LL', 'AA'].includes(coding.code || ''))
        )
      }));

    const patientMedications: PatientMedication[] = medications.map((med, index) => ({
      id: med.id || `med-${index}`,
      drug: {
        rxcui: 'unknown',
        name: med.medicationCodeableConcept?.text || med.medicationCodeableConcept?.coding?.[0]?.display || 'Unknown medication',
        generic_name: med.medicationCodeableConcept?.coding?.[0]?.display
      },
      dosage: med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value?.toString() || 'Unknown',
      frequency: med.dosageInstruction?.[0]?.text || 'Unknown',
      route: med.dosageInstruction?.[0]?.route?.text || 'Unknown',
      startDate: med.authoredOn || new Date().toISOString(),
      indication: 'From EHR',
      isActive: med.status === 'active'
    }));

    const patientAllergies: PatientAllergy[] = allergies.map((allergy, index) => ({
      id: allergy.id || `allergy-${index}`,
      allergen: allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown allergen',
      allergenType: allergy.category?.[0] === 'medication' ? 'drug' : 
                   allergy.category?.[0] === 'food' ? 'food' : 
                   allergy.category?.[0] === 'environment' ? 'environmental' : 'other',
      reaction: allergy.reaction?.[0]?.manifestation?.[0]?.text || 
               allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || 'Unknown reaction',
      severity: allergy.reaction?.[0]?.severity === 'severe' ? 'severe' :
               allergy.reaction?.[0]?.severity === 'moderate' ? 'moderate' : 'mild',
      dateReported: allergy.recordedDate || new Date().toISOString(),
      verified: allergy.verificationStatus?.coding?.[0]?.code === 'confirmed'
    }));

    const patientConditions: PatientCondition[] = conditions.map((condition, index) => ({
      id: condition.id || `condition-${index}`,
      condition: condition.code?.text || condition.code?.coding?.[0]?.display || 'Unknown condition',
      icd10Code: condition.code?.coding?.find(c => c.system?.includes('icd-10'))?.code,
      status: condition.clinicalStatus?.coding?.[0]?.code === 'active' ? 'active' : 
             condition.clinicalStatus?.coding?.[0]?.code === 'resolved' ? 'resolved' : 'inactive',
      dateOfOnset: condition.onsetDateTime || condition.onsetPeriod?.start || new Date().toISOString(),
      dateResolved: condition.abatementDateTime
    }));

    return {
      id: patient.id || `fhir-patient-${Date.now()}`,
      demographics,
      allergies: patientAllergies,
      medications: patientMedications,
      conditions: patientConditions,
      labValues,
      genetics: [], // Would need separate genomics FHIR resources
      vitals: [], // Would parse vital signs from observations
      treatmentHistory: [],
      notes: [{
        id: 'fhir-import',
        timestamp: new Date().toISOString(),
        author: 'FHIR Import',
        type: 'clinical',
        content: `Patient data imported from FHIR server: ${patient.identifier?.length || 0} identifiers, ${observations.length} observations, ${medications.length} medications, ${allergies.length} allergies, ${conditions.length} conditions`
      }],
      preferences: {},
      lastUpdated: new Date().toISOString(),
      createdBy: 'FHIR Import Service',
      isActive: patient.active !== false
    };
  }

  /**
   * Create or update patient in FHIR server
   */
  public async createPatient(patientProfile: PatientProfile): Promise<FHIRPatient> {
    const fhirPatient: FHIRPatient = this.convertProfileToFHIRPatient(patientProfile);

    const response = await fetch(`${this.baseUrl}/Patient`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(fhirPatient)
    });

    if (!response.ok) {
      throw new Error(`Failed to create FHIR patient: ${response.statusText}`);
    }

    return response.json();
  }

  private convertProfileToFHIRPatient(profile: PatientProfile): FHIRPatient {
    return {
      resourceType: 'Patient',
      identifier: profile.demographics.mrn ? [{
        use: 'usual',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
            code: 'MR',
            display: 'Medical Record Number'
          }]
        },
        value: profile.demographics.mrn
      }] : undefined,
      active: profile.isActive,
      name: [{
        use: 'official',
        family: profile.demographics.lastName,
        given: [profile.demographics.firstName]
      }],
      telecom: [
        profile.demographics.contact?.phone ? {
          system: 'phone',
          value: profile.demographics.contact.phone,
          use: 'home'
        } : null,
        profile.demographics.contact?.email ? {
          system: 'email',
          value: profile.demographics.contact.email
        } : null
      ].filter(Boolean) as any[],
      gender: profile.demographics.sex === 'male' ? 'male' : 
             profile.demographics.sex === 'female' ? 'female' : 'other',
      birthDate: profile.demographics.dateOfBirth
    };
  }

  /**
   * Validate FHIR connection
   */
  public async validateConnection(): Promise<{ connected: boolean; version?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/metadata`, {
        headers: { 'Accept': 'application/fhir+json' }
      });

      if (response.ok) {
        const capability = await response.json();
        return {
          connected: true,
          version: capability.fhirVersion || 'Unknown'
        };
      } else {
        return {
          connected: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const fhirService = FHIRService.getInstance();