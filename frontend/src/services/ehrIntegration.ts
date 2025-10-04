// EHR Integration Framework for OncoSafeRx
// Supports Epic, Cerner, Allscripts, and other major EHR systems

export interface EHRSystem {
  id: string;
  name: string;
  version: string;
  fhirVersion?: string;
  apiEndpoint?: string;
  authType: 'oauth2' | 'api_key' | 'saml' | 'certificate';
  capabilities: EHRCapability[];
  status: 'connected' | 'disconnected' | 'testing' | 'error';
}

export interface EHRCapability {
  feature: string;
  supported: boolean;
  version?: string;
  limitations?: string[];
}

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
  };
  identifier?: {
    system?: string;
    value?: string;
  }[];
  [key: string]: any;
}

export interface EHRPatient extends FHIRResource {
  resourceType: 'Patient';
  name: {
    use?: string;
    family?: string;
    given?: string[];
  }[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: {
    use?: string;
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
  }[];
  telecom?: {
    system?: string;
    value?: string;
    use?: string;
  }[];
  maritalStatus?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
  };
  contact?: any[];
  communication?: any[];
  generalPractitioner?: any[];
  managingOrganization?: any;
}

export interface EHRMedication extends FHIRResource {
  resourceType: 'MedicationRequest' | 'MedicationStatement';
  status?: string;
  intent?: string;
  category?: any[];
  priority?: string;
  medicationCodeableConcept?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  authoredOn?: string;
  requester?: any;
  dosageInstruction?: {
    timing?: any;
    route?: any;
    doseAndRate?: any[];
    text?: string;
  }[];
  dispenseRequest?: any;
  substitution?: any;
}

export interface EHRLabResult extends FHIRResource {
  resourceType: 'Observation';
  status?: string;
  category?: any[];
  code?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  interpretation?: any[];
  referenceRange?: {
    low?: any;
    high?: any;
    text?: string;
  }[];
}

export interface EHRAllergy extends FHIRResource {
  resourceType: 'AllergyIntolerance';
  clinicalStatus?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
  };
  verificationStatus?: any;
  type?: string;
  category?: string[];
  criticality?: string;
  code?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  patient?: {
    reference?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: any;
  asserter?: any;
  lastOccurrence?: string;
  note?: any[];
  reaction?: {
    substance?: any;
    manifestation?: any[];
    description?: string;
    onset?: string;
    severity?: string;
    exposureRoute?: any;
    note?: any[];
  }[];
}

export interface EHRCondition extends FHIRResource {
  resourceType: 'Condition';
  clinicalStatus?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
  };
  verificationStatus?: any;
  category?: any[];
  severity?: any;
  code?: {
    coding?: {
      system?: string;
      code?: string;
      display?: string;
    }[];
    text?: string;
  };
  subject?: {
    reference?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  recorder?: any;
  asserter?: any;
  stage?: any[];
  evidence?: any[];
  note?: any[];
}

export class EHRIntegrationService {
  private ehrSystems: Map<string, EHRSystem> = new Map();
  private activeSystem: EHRSystem | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.initializeEHRSystems();
  }

  // Initialize supported EHR systems
  private initializeEHRSystems() {
    // Epic (MyChart/Epic EHR)
    this.ehrSystems.set('epic', {
      id: 'epic',
      name: 'Epic Systems',
      version: '2023',
      fhirVersion: 'R4',
      apiEndpoint: (import.meta as any)?.env?.VITE_EPIC_FHIR_ENDPOINT || 'https://fhir.epic.com/interconnect-fhir-oauth',
      authType: 'oauth2',
      capabilities: [
        { feature: 'patient_read', supported: true },
        { feature: 'medication_read', supported: true },
        { feature: 'observation_read', supported: true },
        { feature: 'condition_read', supported: true },
        { feature: 'allergy_read', supported: true },
        { feature: 'medication_write', supported: true, limitations: ['Requires provider credentials'] },
        { feature: 'smart_launch', supported: true },
        { feature: 'cds_hooks', supported: true }
      ],
      status: 'disconnected'
    });

    // Cerner (Oracle Health)
    this.ehrSystems.set('cerner', {
      id: 'cerner',
      name: 'Cerner Corporation',
      version: '2023',
      fhirVersion: 'R4',
      apiEndpoint: (import.meta as any)?.env?.VITE_CERNER_FHIR_ENDPOINT || 'https://fhir-open.cerner.com',
      authType: 'oauth2',
      capabilities: [
        { feature: 'patient_read', supported: true },
        { feature: 'medication_read', supported: true },
        { feature: 'observation_read', supported: true },
        { feature: 'condition_read', supported: true },
        { feature: 'allergy_read', supported: true },
        { feature: 'medication_write', supported: true },
        { feature: 'smart_launch', supported: true },
        { feature: 'cds_hooks', supported: false }
      ],
      status: 'disconnected'
    });

    // Allscripts
    this.ehrSystems.set('allscripts', {
      id: 'allscripts',
      name: 'Allscripts Healthcare Solutions',
      version: '2023',
      fhirVersion: 'R4',
      apiEndpoint: (import.meta as any)?.env?.VITE_ALLSCRIPTS_FHIR_ENDPOINT,
      authType: 'oauth2',
      capabilities: [
        { feature: 'patient_read', supported: true },
        { feature: 'medication_read', supported: true },
        { feature: 'observation_read', supported: true },
        { feature: 'condition_read', supported: true },
        { feature: 'allergy_read', supported: true },
        { feature: 'medication_write', supported: false },
        { feature: 'smart_launch', supported: true },
        { feature: 'cds_hooks', supported: false }
      ],
      status: 'disconnected'
    });

    // athenahealth
    this.ehrSystems.set('athena', {
      id: 'athena',
      name: 'athenahealth',
      version: '2023',
      fhirVersion: 'R4',
      apiEndpoint: (import.meta as any)?.env?.VITE_ATHENA_FHIR_ENDPOINT,
      authType: 'oauth2',
      capabilities: [
        { feature: 'patient_read', supported: true },
        { feature: 'medication_read', supported: true },
        { feature: 'observation_read', supported: true },
        { feature: 'condition_read', supported: true },
        { feature: 'allergy_read', supported: true },
        { feature: 'medication_write', supported: true },
        { feature: 'smart_launch', supported: true },
        { feature: 'cds_hooks', supported: false }
      ],
      status: 'disconnected'
    });

    // NextGen Healthcare
    this.ehrSystems.set('nextgen', {
      id: 'nextgen',
      name: 'NextGen Healthcare',
      version: '2023',
      fhirVersion: 'R4',
      apiEndpoint: (import.meta as any)?.env?.VITE_NEXTGEN_FHIR_ENDPOINT,
      authType: 'oauth2',
      capabilities: [
        { feature: 'patient_read', supported: true },
        { feature: 'medication_read', supported: true },
        { feature: 'observation_read', supported: true },
        { feature: 'condition_read', supported: true },
        { feature: 'allergy_read', supported: true },
        { feature: 'medication_write', supported: false },
        { feature: 'smart_launch', supported: true },
        { feature: 'cds_hooks', supported: false }
      ],
      status: 'disconnected'
    });
  }

  // Get available EHR systems
  getAvailableEHRSystems(): EHRSystem[] {
    return Array.from(this.ehrSystems.values());
  }

  // Connect to specific EHR system
  async connectToEHR(ehrId: string, credentials?: any): Promise<boolean> {
    const ehrSystem = this.ehrSystems.get(ehrId);
    if (!ehrSystem) {
      throw new Error(`EHR system ${ehrId} not found`);
    }

    try {
      switch (ehrSystem.authType) {
        case 'oauth2':
          return await this.authenticateOAuth2(ehrSystem, credentials);
        case 'api_key':
          return await this.authenticateAPIKey(ehrSystem, credentials);
        case 'saml':
          return await this.authenticateSAML(ehrSystem, credentials);
        case 'certificate':
          return await this.authenticateCertificate(ehrSystem, credentials);
        default:
          throw new Error(`Unsupported auth type: ${ehrSystem.authType}`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${ehrSystem.name}:`, error);
      ehrSystem.status = 'error';
      return false;
    }
  }

  // OAuth2 authentication flow
  private async authenticateOAuth2(ehrSystem: EHRSystem, credentials?: any): Promise<boolean> {
    // In a real implementation, this would handle the OAuth2 flow
    // For now, simulate success if credentials are provided
    if (credentials?.clientId && credentials?.clientSecret) {
      ehrSystem.status = 'connected';
      this.activeSystem = ehrSystem;
      this.accessToken = 'simulated_access_token';
      return true;
    }
    
    // In production, redirect to OAuth2 authorization URL
    const authUrl = `${ehrSystem.apiEndpoint}/oauth2/authorize?` +
      `client_id=${credentials?.clientId}&` +
      `response_type=code&` +
      `scope=patient/*.read medication/*.read observation/*.read&` +
      `redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
    
    console.log(`OAuth2 authentication required. Redirect to: ${authUrl}`);
    return false;
  }

  // API Key authentication
  private async authenticateAPIKey(ehrSystem: EHRSystem, credentials?: any): Promise<boolean> {
    if (credentials?.apiKey) {
      ehrSystem.status = 'connected';
      this.activeSystem = ehrSystem;
      this.accessToken = credentials.apiKey;
      return true;
    }
    return false;
  }

  // SAML authentication
  private async authenticateSAML(ehrSystem: EHRSystem, credentials?: any): Promise<boolean> {
    // SAML implementation would go here
    console.log('SAML authentication not yet implemented');
    return false;
  }

  // Certificate-based authentication
  private async authenticateCertificate(ehrSystem: EHRSystem, credentials?: any): Promise<boolean> {
    // Certificate authentication implementation would go here
    console.log('Certificate authentication not yet implemented');
    return false;
  }

  // Get patient data from connected EHR
  async getPatientData(patientId: string): Promise<EHRPatient | null> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/Patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching patient data:', error);
      return null;
    }
  }

  // Get medications for patient
  async getPatientMedications(patientId: string): Promise<EHRMedication[]> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/MedicationRequest?patient=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch medications: ${response.statusText}`);
      }

      const bundle = await response.json();
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }

  // Get lab results for patient
  async getPatientLabResults(patientId: string, categoryCode?: string): Promise<EHRLabResult[]> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    try {
      let url = `${this.activeSystem.apiEndpoint}/Observation?patient=${patientId}&category=laboratory`;
      if (categoryCode) {
        url += `&code=${categoryCode}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lab results: ${response.statusText}`);
      }

      const bundle = await response.json();
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('Error fetching lab results:', error);
      return [];
    }
  }

  // Get allergies for patient
  async getPatientAllergies(patientId: string): Promise<EHRAllergy[]> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/AllergyIntolerance?patient=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch allergies: ${response.statusText}`);
      }

      const bundle = await response.json();
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('Error fetching allergies:', error);
      return [];
    }
  }

  // Get conditions for patient
  async getPatientConditions(patientId: string): Promise<EHRCondition[]> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/Condition?patient=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conditions: ${response.statusText}`);
      }

      const bundle = await response.json();
      return bundle.entry?.map((entry: any) => entry.resource) || [];
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  }

  // Create medication order (if supported)
  async createMedicationRequest(medicationRequest: Partial<EHRMedication>): Promise<string | null> {
    if (!this.activeSystem || !this.accessToken) {
      throw new Error('No active EHR connection');
    }

    const writeCap = this.activeSystem.capabilities.find(cap => cap.feature === 'medication_write');
    if (!writeCap?.supported) {
      throw new Error('Medication writing not supported by this EHR system');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/MedicationRequest`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify({
          resourceType: 'MedicationRequest',
          ...medicationRequest
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create medication request: ${response.statusText}`);
      }

      const created = await response.json();
      return created.id;
    } catch (error) {
      console.error('Error creating medication request:', error);
      return null;
    }
  }

  // SMART on FHIR launch
  async smartLaunch(launchContext: any): Promise<boolean> {
    if (!this.activeSystem) {
      throw new Error('No active EHR system');
    }

    const smartCap = this.activeSystem.capabilities.find(cap => cap.feature === 'smart_launch');
    if (!smartCap?.supported) {
      throw new Error('SMART launch not supported by this EHR system');
    }

    try {
      // Handle SMART launch context
      console.log('Processing SMART launch context:', launchContext);
      
      // In a real implementation, this would:
      // 1. Validate the launch context
      // 2. Exchange the launch token for access token
      // 3. Set up the patient context
      
      return true;
    } catch (error) {
      console.error('Error during SMART launch:', error);
      return false;
    }
  }

  // CDS Hooks integration
  async triggerCDSHook(hookName: string, context: any): Promise<any> {
    if (!this.activeSystem) {
      throw new Error('No active EHR system');
    }

    const cdsCap = this.activeSystem.capabilities.find(cap => cap.feature === 'cds_hooks');
    if (!cdsCap?.supported) {
      throw new Error('CDS Hooks not supported by this EHR system');
    }

    try {
      const response = await fetch(`${this.activeSystem.apiEndpoint}/cds-services/${hookName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hook: hookName,
          hookInstance: Date.now().toString(),
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`CDS Hook failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering CDS Hook:', error);
      return null;
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; system?: EHRSystem; token?: boolean } {
    return {
      connected: this.activeSystem?.status === 'connected',
      system: this.activeSystem || undefined,
      token: !!this.accessToken
    };
  }

  // Disconnect from current EHR
  disconnect(): void {
    if (this.activeSystem) {
      this.activeSystem.status = 'disconnected';
    }
    this.activeSystem = null;
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Test EHR connection
  async testConnection(ehrId: string): Promise<boolean> {
    const ehrSystem = this.ehrSystems.get(ehrId);
    if (!ehrSystem) {
      return false;
    }

    try {
      ehrSystem.status = 'testing';
      
      // Simulate connection test
      const response = await fetch(`${ehrSystem.apiEndpoint}/metadata`, {
        headers: {
          'Accept': 'application/fhir+json'
        }
      });

      if (response.ok) {
        ehrSystem.status = 'disconnected'; // Reset to disconnected after successful test
        return true;
      } else {
        ehrSystem.status = 'error';
        return false;
      }
    } catch (error) {
      console.error(`Connection test failed for ${ehrSystem.name}:`, error);
      ehrSystem.status = 'error';
      return false;
    }
  }
}

// Singleton instance
export const ehrIntegrationService = new EHRIntegrationService();

// Utility functions for FHIR data transformation
export class FHIRTransformService {
  // Transform FHIR Patient to OncoSafeRx Patient format
  static transformPatient(fhirPatient: EHRPatient): any {
    const name = fhirPatient.name?.[0];
    const address = fhirPatient.address?.[0];
    const phone = fhirPatient.telecom?.find(t => t.system === 'phone');
    const email = fhirPatient.telecom?.find(t => t.system === 'email');

    return {
      id: fhirPatient.id,
      demographics: {
        firstName: name?.given?.[0] || '',
        lastName: name?.family || '',
        dateOfBirth: fhirPatient.birthDate || '',
        sex: fhirPatient.gender || 'unknown',
        mrn: fhirPatient.identifier?.find(id => id.system?.includes('MR'))?.value || '',
        contact: {
          phone: phone?.value || '',
          email: email?.value || '',
          address: address ? `${address.line?.join(' ')}, ${address.city}, ${address.state} ${address.postalCode}` : ''
        }
      }
    };
  }

  // Transform FHIR MedicationRequest to OncoSafeRx Medication format
  static transformMedication(fhirMed: EHRMedication): any {
    return {
      id: fhirMed.id,
      name: fhirMed.medicationCodeableConcept?.text || 
            fhirMed.medicationCodeableConcept?.coding?.[0]?.display || 
            'Unknown Medication',
      dosage: fhirMed.dosageInstruction?.[0]?.text || '',
      frequency: fhirMed.dosageInstruction?.[0]?.timing?.repeat?.frequency || 'Unknown',
      route: fhirMed.dosageInstruction?.[0]?.route?.text || '',
      isActive: fhirMed.status === 'active',
      startDate: fhirMed.authoredOn || '',
      prescriber: fhirMed.requester?.display || 'Unknown'
    };
  }

  // Transform FHIR Observation to OncoSafeRx Lab Value format
  static transformLabResult(fhirObs: EHRLabResult): any {
    return {
      id: fhirObs.id,
      labType: fhirObs.code?.text || fhirObs.code?.coding?.[0]?.display || 'Unknown Lab',
      value: fhirObs.valueQuantity?.value?.toString() || 
             fhirObs.valueString || 
             fhirObs.valueBoolean?.toString() || '',
      unit: fhirObs.valueQuantity?.unit || '',
      referenceRange: fhirObs.referenceRange?.[0]?.text || '',
      timestamp: fhirObs.effectiveDateTime || '',
      isAbnormal: fhirObs.interpretation?.some(interp => 
        interp.coding?.some(code => ['H', 'L', 'A'].includes(code.code || ''))
      ) || false,
      criticalFlag: fhirObs.interpretation?.some(interp =>
        interp.coding?.some(code => ['HH', 'LL', 'AA'].includes(code.code || ''))
      ) || false
    };
  }

  // Transform FHIR AllergyIntolerance to OncoSafeRx Allergy format
  static transformAllergy(fhirAllergy: EHRAllergy): any {
    return {
      id: fhirAllergy.id,
      allergen: fhirAllergy.code?.text || fhirAllergy.code?.coding?.[0]?.display || 'Unknown Allergen',
      allergenType: fhirAllergy.category?.[0] || 'unknown',
      severity: fhirAllergy.criticality || 'unknown',
      reaction: fhirAllergy.reaction?.[0]?.description || 
               fhirAllergy.reaction?.[0]?.manifestation?.[0]?.text || 
               'Unknown reaction',
      onsetDate: fhirAllergy.onsetDateTime || fhirAllergy.recordedDate || '',
      verificationStatus: fhirAllergy.verificationStatus?.coding?.[0]?.code || 'unknown'
    };
  }

  // Transform FHIR Condition to OncoSafeRx Medical History format
  static transformCondition(fhirCondition: EHRCondition): any {
    return {
      id: fhirCondition.id,
      condition: fhirCondition.code?.text || fhirCondition.code?.coding?.[0]?.display || 'Unknown Condition',
      icd10Code: fhirCondition.code?.coding?.find(c => c.system?.includes('icd'))?.code || '',
      onsetDate: fhirCondition.onsetDateTime || fhirCondition.recordedDate || '',
      status: fhirCondition.clinicalStatus?.coding?.[0]?.code || 'unknown',
      severity: fhirCondition.severity?.coding?.[0]?.display || 'unknown',
      notes: fhirCondition.note?.[0]?.text || ''
    };
  }
}