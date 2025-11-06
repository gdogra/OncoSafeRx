import axios from 'axios';
import crypto from 'crypto';

/**
 * Enterprise EHR Integration Service
 * Supports Epic, Cerner, Allscripts, athenahealth, and other FHIR R4 compliant systems
 */
class EHRIntegrationService {
  constructor() {
    this.supportedSystems = {
      epic: {
        name: 'Epic MyChart',
        fhirVersion: 'R4',
        baseUrl: process.env.EPIC_FHIR_BASE_URL,
        clientId: process.env.EPIC_CLIENT_ID,
        authUrl: process.env.EPIC_AUTH_URL || 'https://fhir.epic.com/interconnect-fhir-oauth',
        scopes: 'patient/MedicationRequest.read patient/MedicationStatement.read patient/Patient.read'
      },
      cerner: {
        name: 'Cerner PowerChart',
        fhirVersion: 'R4',
        baseUrl: process.env.CERNER_FHIR_BASE_URL,
        clientId: process.env.CERNER_CLIENT_ID,
        authUrl: process.env.CERNER_AUTH_URL || 'https://authorization.cerner.com/tenants',
        scopes: 'patient/MedicationRequest.read patient/MedicationStatement.read patient/Patient.read'
      },
      allscripts: {
        name: 'Allscripts Professional EHR',
        fhirVersion: 'R4',
        baseUrl: process.env.ALLSCRIPTS_FHIR_BASE_URL,
        clientId: process.env.ALLSCRIPTS_CLIENT_ID,
        authUrl: process.env.ALLSCRIPTS_AUTH_URL,
        scopes: 'patient/MedicationRequest.read patient/MedicationStatement.read'
      },
      athena: {
        name: 'athenahealth',
        fhirVersion: 'R4',
        baseUrl: process.env.ATHENA_FHIR_BASE_URL,
        clientId: process.env.ATHENA_CLIENT_ID,
        authUrl: process.env.ATHENA_AUTH_URL,
        scopes: 'patient/MedicationRequest.read patient/MedicationStatement.read'
      }
    };

    this.activeSessions = new Map();
    this.tokenRefreshHandlers = new Map();
  }

  /**
   * Initialize OAuth 2.0 SMART on FHIR authorization
   */
  async initiateEHRAuth(ehrSystem, patientId, redirectUri) {
    try {
      const config = this.supportedSystems[ehrSystem];
      if (!config) {
        throw new Error(`Unsupported EHR system: ${ehrSystem}`);
      }

      // Generate PKCE challenge for security
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = this.generateCodeChallenge(codeVerifier);
      const state = crypto.randomBytes(32).toString('hex');

      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: redirectUri,
        scope: config.scopes,
        state: state,
        aud: config.baseUrl,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      // Store PKCE verifier for token exchange
      this.activeSessions.set(state, {
        codeVerifier,
        ehrSystem,
        patientId,
        timestamp: Date.now()
      });

      const authUrl = `${config.authUrl}/authorize?${authParams.toString()}`;

      return {
        authUrl,
        state,
        ehrSystem: config.name
      };
    } catch (error) {
      console.error('EHR auth initiation failed:', error);
      throw new Error(`Failed to initiate ${ehrSystem} authentication: ${error.message}`);
    }
  }

  /**
   * Complete OAuth flow and obtain access tokens
   */
  async completeEHRAuth(code, state) {
    try {
      const session = this.activeSessions.get(state);
      if (!session) {
        throw new Error('Invalid or expired authentication session');
      }

      const config = this.supportedSystems[session.ehrSystem];
      const tokenResponse = await axios.post(`${config.authUrl}/token`, {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        client_id: config.clientId,
        code_verifier: session.codeVerifier
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokens = tokenResponse.data;
      
      // Store tokens securely
      await this.storeEHRTokens(session.patientId, session.ehrSystem, tokens);
      
      // Clean up session
      this.activeSessions.delete(state);
      
      // Set up token refresh
      this.setupTokenRefresh(session.patientId, session.ehrSystem, tokens);

      return {
        success: true,
        ehrSystem: session.ehrSystem,
        patientId: session.patientId,
        expiresIn: tokens.expires_in
      };
    } catch (error) {
      console.error('EHR auth completion failed:', error);
      throw new Error(`Failed to complete EHR authentication: ${error.message}`);
    }
  }

  /**
   * Fetch medication data from EHR using FHIR R4
   */
  async fetchMedicationsFromEHR(patientId, ehrSystem) {
    try {
      const tokens = await this.getEHRTokens(patientId, ehrSystem);
      const config = this.supportedSystems[ehrSystem];

      if (!tokens || !tokens.access_token) {
        throw new Error('No valid EHR tokens found. Please re-authenticate.');
      }

      // Fetch MedicationRequests (prescriptions)
      const medicationRequests = await this.fetchFHIRResource(
        `${config.baseUrl}/MedicationRequest`,
        { patient: patientId, status: 'active' },
        tokens.access_token
      );

      // Fetch MedicationStatements (patient reported medications)
      const medicationStatements = await this.fetchFHIRResource(
        `${config.baseUrl}/MedicationStatement`,
        { patient: patientId, status: 'active' },
        tokens.access_token
      );

      // Transform FHIR resources to OncoSafeRx format
      const medications = await this.transformFHIRMedications(
        medicationRequests,
        medicationStatements,
        config.baseUrl,
        tokens.access_token
      );

      return {
        success: true,
        medications,
        lastUpdated: new Date().toISOString(),
        source: config.name
      };
    } catch (error) {
      console.error('EHR medication fetch failed:', error);
      throw new Error(`Failed to fetch medications from ${ehrSystem}: ${error.message}`);
    }
  }

  /**
   * Transform FHIR medication resources to OncoSafeRx format
   */
  async transformFHIRMedications(medicationRequests, medicationStatements, baseUrl, accessToken) {
    const medications = [];

    // Process MedicationRequests
    for (const request of medicationRequests.entry || []) {
      const resource = request.resource;
      
      try {
        // Fetch medication details if referenced
        let medicationData = null;
        if (resource.medicationReference) {
          medicationData = await this.fetchFHIRResource(
            resource.medicationReference.reference.startsWith('http') 
              ? resource.medicationReference.reference 
              : `${baseUrl}/${resource.medicationReference.reference}`,
            {},
            accessToken
          );
        }

        const medication = {
          id: resource.id,
          sourceId: resource.id,
          sourceSystem: 'EHR',
          name: this.extractMedicationName(resource, medicationData),
          genericName: this.extractGenericName(resource, medicationData),
          dosage: this.extractDosage(resource),
          frequency: this.extractFrequency(resource),
          route: this.extractRoute(resource),
          startDate: resource.authoredOn ? new Date(resource.authoredOn) : new Date(),
          endDate: this.extractEndDate(resource),
          prescribedBy: this.extractPrescriber(resource),
          purpose: this.extractPurpose(resource),
          instructions: this.extractInstructions(resource),
          ndc: this.extractNDC(medicationData),
          rxcui: this.extractRXCUI(medicationData),
          interactions: [], // To be populated by interaction checking
          sideEffects: [],
          foodRestrictions: [],
          timingInstructions: this.extractTimingInstructions(resource),
          pillIdentification: this.extractPillInfo(medicationData),
          fhirResource: resource // Keep original for reference
        };

        medications.push(medication);
      } catch (error) {
        console.warn(`Failed to process medication request ${resource.id}:`, error);
      }
    }

    // Process MedicationStatements
    for (const statement of medicationStatements.entry || []) {
      const resource = statement.resource;
      
      try {
        // Check if this medication is already processed from MedicationRequest
        const existingMed = medications.find(med => 
          med.name === this.extractMedicationName(resource) ||
          med.sourceId === resource.id
        );

        if (!existingMed) {
          const medication = {
            id: resource.id,
            sourceId: resource.id,
            sourceSystem: 'EHR_PATIENT_REPORTED',
            name: this.extractMedicationName(resource),
            genericName: this.extractGenericName(resource),
            dosage: this.extractDosageFromStatement(resource),
            frequency: this.extractFrequencyFromStatement(resource),
            route: this.extractRouteFromStatement(resource),
            startDate: resource.effectiveDateTime ? new Date(resource.effectiveDateTime) : new Date(),
            endDate: null,
            prescribedBy: 'Patient Reported',
            purpose: resource.reasonCode?.[0]?.text || 'Not specified',
            instructions: resource.note?.[0]?.text || '',
            interactions: [],
            sideEffects: [],
            foodRestrictions: [],
            timingInstructions: '',
            pillIdentification: {},
            fhirResource: resource
          };

          medications.push(medication);
        }
      } catch (error) {
        console.warn(`Failed to process medication statement ${resource.id}:`, error);
      }
    }

    return medications;
  }

  /**
   * Fetch FHIR resource with proper error handling
   */
  async fetchFHIRResource(url, params = {}, accessToken) {
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/fhir+json',
          'Content-Type': 'application/fhir+json'
        },
        params
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('EHR access token expired. Please re-authenticate.');
      }
      throw error;
    }
  }

  /**
   * Extract medication name from FHIR resource
   */
  extractMedicationName(resource, medicationData = null) {
    if (medicationData?.code?.coding) {
      const coding = medicationData.code.coding.find(c => c.display) || medicationData.code.coding[0];
      if (coding?.display) return coding.display;
    }
    
    if (resource.medicationCodeableConcept?.coding) {
      const coding = resource.medicationCodeableConcept.coding.find(c => c.display) || resource.medicationCodeableConcept.coding[0];
      if (coding?.display) return coding.display;
    }

    return 'Unknown Medication';
  }

  /**
   * Extract generic name from FHIR resource
   */
  extractGenericName(resource, medicationData = null) {
    if (medicationData?.code?.coding) {
      const rxnormCoding = medicationData.code.coding.find(c => c.system === 'http://www.nlm.nih.gov/research/umls/rxnorm');
      if (rxnormCoding?.display) return rxnormCoding.display;
    }
    
    return this.extractMedicationName(resource, medicationData);
  }

  /**
   * Extract dosage information
   */
  extractDosage(resource) {
    if (resource.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity) {
      const dose = resource.dosageInstruction[0].doseAndRate[0].doseQuantity;
      return `${dose.value}${dose.unit || dose.code || ''}`;
    }
    return 'Not specified';
  }

  /**
   * Extract frequency information
   */
  extractFrequency(resource) {
    if (resource.dosageInstruction?.[0]?.timing?.repeat) {
      const repeat = resource.dosageInstruction[0].timing.repeat;
      if (repeat.frequency && repeat.period) {
        return `${repeat.frequency} time(s) per ${repeat.period} ${repeat.periodUnit || 'day'}`;
      }
    }
    return 'As directed';
  }

  /**
   * Extract route of administration
   */
  extractRoute(resource) {
    const route = resource.dosageInstruction?.[0]?.route?.coding?.[0]?.display;
    if (route) {
      // Map FHIR route to our standardized routes
      const routeMap = {
        'Oral': 'oral',
        'Oral route': 'oral',
        'Intravenous': 'injection',
        'Intramuscular': 'injection',
        'Subcutaneous': 'injection',
        'Topical': 'topical',
        'Inhalation': 'inhalation'
      };
      return routeMap[route] || 'oral';
    }
    return 'oral';
  }

  /**
   * Extract prescriber information
   */
  extractPrescriber(resource) {
    if (resource.requester?.display) {
      return resource.requester.display;
    }
    if (resource.requester?.reference) {
      return `Provider (${resource.requester.reference})`;
    }
    return 'Unknown Provider';
  }

  /**
   * Extract medication purpose/indication
   */
  extractPurpose(resource) {
    if (resource.reasonCode?.[0]?.text) {
      return resource.reasonCode[0].text;
    }
    if (resource.reasonCode?.[0]?.coding?.[0]?.display) {
      return resource.reasonCode[0].coding[0].display;
    }
    return 'Not specified';
  }

  /**
   * Extract special instructions
   */
  extractInstructions(resource) {
    return resource.dosageInstruction?.[0]?.text || 
           resource.dosageInstruction?.[0]?.patientInstruction || 
           'Take as directed';
  }

  /**
   * Extract timing instructions
   */
  extractTimingInstructions(resource) {
    const instruction = resource.dosageInstruction?.[0];
    if (instruction?.timing?.code?.text) {
      return instruction.timing.code.text;
    }
    if (instruction?.when) {
      return instruction.when.join(', ');
    }
    return 'As directed';
  }

  /**
   * Generate PKCE code verifier
   */
  generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code challenge
   */
  generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  /**
   * Store EHR tokens securely (implement based on your security requirements)
   */
  async storeEHRTokens(patientId, ehrSystem, tokens) {
    // Implementation depends on your secure storage solution
    // This could be encrypted database storage, secure vault, etc.
    console.log(`Storing EHR tokens for patient ${patientId}, system ${ehrSystem}`);
    // TODO: Implement secure token storage
  }

  /**
   * Retrieve EHR tokens securely
   */
  async getEHRTokens(patientId, ehrSystem) {
    // Implementation depends on your secure storage solution
    console.log(`Retrieving EHR tokens for patient ${patientId}, system ${ehrSystem}`);
    // TODO: Implement secure token retrieval
    return null;
  }

  /**
   * Set up automatic token refresh
   */
  setupTokenRefresh(patientId, ehrSystem, tokens) {
    if (tokens.refresh_token && tokens.expires_in) {
      const refreshTime = (tokens.expires_in - 300) * 1000; // Refresh 5 minutes before expiry
      
      const refreshHandler = setTimeout(async () => {
        try {
          await this.refreshEHRTokens(patientId, ehrSystem, tokens.refresh_token);
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }, refreshTime);

      this.tokenRefreshHandlers.set(`${patientId}_${ehrSystem}`, refreshHandler);
    }
  }

  /**
   * Refresh access tokens
   */
  async refreshEHRTokens(patientId, ehrSystem, refreshToken) {
    try {
      const config = this.supportedSystems[ehrSystem];
      
      const response = await axios.post(`${config.authUrl}/token`, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: config.clientId
      });

      const newTokens = response.data;
      await this.storeEHRTokens(patientId, ehrSystem, newTokens);
      this.setupTokenRefresh(patientId, ehrSystem, newTokens);
      
      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Extract NDC (National Drug Code) from medication data
   */
  extractNDC(medicationData) {
    if (medicationData?.code?.coding) {
      const ndcCoding = medicationData.code.coding.find(c => 
        c.system === 'http://hl7.org/fhir/sid/ndc' || 
        c.system === 'http://www.nlm.nih.gov/research/umls/ndc'
      );
      return ndcCoding?.code || null;
    }
    return null;
  }

  /**
   * Extract RXCUI from medication data
   */
  extractRXCUI(medicationData) {
    if (medicationData?.code?.coding) {
      const rxnormCoding = medicationData.code.coding.find(c => 
        c.system === 'http://www.nlm.nih.gov/research/umls/rxnorm'
      );
      return rxnormCoding?.code || null;
    }
    return null;
  }

  /**
   * Extract pill identification information
   */
  extractPillInfo(medicationData) {
    // This would typically come from drug databases
    // For now, return empty object
    return {
      shape: '',
      color: '',
      markings: '',
      size: ''
    };
  }

  /**
   * Extract end date from medication request
   */
  extractEndDate(resource) {
    if (resource.dispenseRequest?.validityPeriod?.end) {
      return new Date(resource.dispenseRequest.validityPeriod.end);
    }
    return null;
  }

  /**
   * Extract dosage from medication statement
   */
  extractDosageFromStatement(resource) {
    if (resource.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity) {
      const dose = resource.dosage[0].doseAndRate[0].doseQuantity;
      return `${dose.value}${dose.unit || dose.code || ''}`;
    }
    return 'Not specified';
  }

  /**
   * Extract frequency from medication statement
   */
  extractFrequencyFromStatement(resource) {
    if (resource.dosage?.[0]?.timing?.repeat) {
      const repeat = resource.dosage[0].timing.repeat;
      if (repeat.frequency && repeat.period) {
        return `${repeat.frequency} time(s) per ${repeat.period} ${repeat.periodUnit || 'day'}`;
      }
    }
    return 'As reported';
  }

  /**
   * Extract route from medication statement
   */
  extractRouteFromStatement(resource) {
    const route = resource.dosage?.[0]?.route?.coding?.[0]?.display;
    if (route) {
      const routeMap = {
        'Oral': 'oral',
        'Oral route': 'oral',
        'Intravenous': 'injection',
        'Intramuscular': 'injection',
        'Subcutaneous': 'injection',
        'Topical': 'topical',
        'Inhalation': 'inhalation'
      };
      return routeMap[route] || 'oral';
    }
    return 'oral';
  }
}

export default new EHRIntegrationService();