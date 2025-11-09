import { createClient } from '@supabase/supabase-js';
import fhirPipeline from './fhirDataPipeline.js';
import aiEngine from './aiEngine.js';

class EHRIntegrationHub {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.ehrSystems = new Map();
    this.activeConnections = new Map();
    this.syncQueues = new Map();
    
    this.initializeEHRSystems();
    this.startSyncProcessing();
  }

  async initializeEHRSystems() {
    console.log('Initializing EHR Integration Hub...');
    
    // Major EHR systems with their integration capabilities
    const ehrSystems = [
      {
        id: 'epic',
        name: 'Epic Systems',
        version: 'R4',
        marketShare: 31.8,
        fhirCompliant: true,
        endpoints: {
          patient: '/api/FHIR/R4/Patient',
          observation: '/api/FHIR/R4/Observation',
          condition: '/api/FHIR/R4/Condition',
          medication: '/api/FHIR/R4/MedicationStatement',
          diagnostic: '/api/FHIR/R4/DiagnosticReport',
          genomics: '/api/FHIR/R4/Observation?category=survey'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 1000, window: '1h' },
        supportedFeatures: [
          'real_time_sync', 'bulk_export', 'smart_apps', 'cds_hooks',
          'patient_access', 'provider_access', 'genomics_integration'
        ],
        regions: ['US', 'EU', 'CA', 'AU']
      },
      {
        id: 'cerner',
        name: 'Oracle Health (Cerner)',
        version: 'R4',
        marketShare: 25.3,
        fhirCompliant: true,
        endpoints: {
          patient: '/v1/Patient',
          observation: '/v1/Observation',
          condition: '/v1/Condition',
          medication: '/v1/MedicationStatement',
          diagnostic: '/v1/DiagnosticReport'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 800, window: '1h' },
        supportedFeatures: [
          'real_time_sync', 'bulk_export', 'smart_apps', 'population_health',
          'clinical_decision_support', 'interoperability'
        ],
        regions: ['US', 'UK', 'DE', 'AU']
      },
      {
        id: 'allscripts',
        name: 'Allscripts Healthcare',
        version: 'R4',
        marketShare: 8.7,
        fhirCompliant: true,
        endpoints: {
          patient: '/FHIR/R4/Patient',
          observation: '/FHIR/R4/Observation',
          condition: '/FHIR/R4/Condition'
        },
        authentication: 'Basic',
        rateLimit: { requests: 500, window: '1h' },
        supportedFeatures: ['bulk_export', 'patient_access', 'provider_access'],
        regions: ['US', 'CA']
      },
      {
        id: 'athenahealth',
        name: 'athenahealth',
        version: 'R4',
        marketShare: 5.9,
        fhirCompliant: true,
        endpoints: {
          patient: '/fhir/r4/Patient',
          observation: '/fhir/r4/Observation',
          condition: '/fhir/r4/Condition'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 600, window: '1h' },
        supportedFeatures: ['real_time_sync', 'population_health', 'analytics'],
        regions: ['US']
      },
      {
        id: 'nextgen',
        name: 'NextGen Healthcare',
        version: 'R4',
        marketShare: 4.2,
        fhirCompliant: true,
        endpoints: {
          patient: '/fhir/Patient',
          observation: '/fhir/Observation'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 400, window: '1h' },
        supportedFeatures: ['bulk_export', 'patient_access'],
        regions: ['US']
      },
      {
        id: 'intersystems',
        name: 'InterSystems HealthShare',
        version: 'R4',
        marketShare: 3.8,
        fhirCompliant: true,
        endpoints: {
          patient: '/fhir/r4/Patient',
          observation: '/fhir/r4/Observation',
          genomics: '/fhir/r4/Genomics'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 1200, window: '1h' },
        supportedFeatures: [
          'real_time_sync', 'interoperability', 'analytics', 'ai_integration'
        ],
        regions: ['US', 'EU', 'CA']
      },
      {
        id: 'meditech',
        name: 'MEDITECH',
        version: 'R4',
        marketShare: 16.2,
        fhirCompliant: true,
        endpoints: {
          patient: '/api/fhir/Patient',
          observation: '/api/fhir/Observation'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 500, window: '1h' },
        supportedFeatures: ['bulk_export', 'patient_access'],
        regions: ['US', 'CA', 'UK']
      },
      // International EHR systems
      {
        id: 'emis',
        name: 'EMIS Health (UK)',
        version: 'R4',
        marketShare: 12.4, // UK market
        fhirCompliant: true,
        endpoints: {
          patient: '/openehr/fhir/Patient',
          observation: '/openehr/fhir/Observation'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 600, window: '1h' },
        supportedFeatures: ['nhs_integration', 'gp_connect', 'care_records'],
        regions: ['UK']
      },
      {
        id: 'siemens',
        name: 'Siemens Healthineers',
        version: 'R4',
        marketShare: 8.9, // European market
        fhirCompliant: true,
        endpoints: {
          patient: '/fhir/r4/Patient',
          imaging: '/fhir/r4/ImagingStudy'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 800, window: '1h' },
        supportedFeatures: ['imaging_integration', 'ai_diagnostics', 'workflow'],
        regions: ['EU', 'DE', 'FR']
      },
      {
        id: 'compugroup',
        name: 'CompuGroup Medical',
        version: 'R4',
        marketShare: 15.2, // German market
        fhirCompliant: true,
        endpoints: {
          patient: '/api/fhir/Patient',
          observation: '/api/fhir/Observation'
        },
        authentication: 'OAuth2',
        rateLimit: { requests: 700, window: '1h' },
        supportedFeatures: ['gdpr_compliance', 'telematik', 'e_prescribing'],
        regions: ['DE', 'AT', 'CH']
      }
    ];

    ehrSystems.forEach(system => {
      this.ehrSystems.set(system.id, {
        ...system,
        status: 'available',
        connections: 0,
        totalSynced: 0,
        lastSync: null,
        errorCount: 0,
        avgResponseTime: 0
      });
      
      this.syncQueues.set(system.id, []);
    });

    console.log(`EHR Integration Hub initialized with ${this.ehrSystems.size} EHR systems`);
  }

  async connectToEHR(ehrId, hospitalConfig) {
    try {
      console.log(`Connecting to ${ehrId} for ${hospitalConfig.hospitalName}`);
      
      const ehrSystem = this.ehrSystems.get(ehrId);
      if (!ehrSystem) {
        throw new Error(`EHR system ${ehrId} not supported`);
      }

      // Validate configuration
      await this.validateEHRConfig(ehrId, hospitalConfig);
      
      // Establish connection
      const connection = await this.establishConnection(ehrId, hospitalConfig);
      
      // Test connection with sample query
      await this.testConnection(connection);
      
      // Store active connection
      const connectionId = `${ehrId}_${hospitalConfig.hospitalId}`;
      this.activeConnections.set(connectionId, {
        ...connection,
        ehrId,
        hospitalConfig,
        status: 'active',
        connectedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        syncMode: hospitalConfig.syncMode || 'real_time'
      });

      // Start sync process
      await this.initializeSync(connectionId);
      
      console.log(`Successfully connected to ${ehrSystem.name}`);
      return connectionId;
      
    } catch (error) {
      console.error(`Failed to connect to ${ehrId}:`, error);
      throw error;
    }
  }

  async validateEHRConfig(ehrId, config) {
    const required = ['hospitalId', 'hospitalName', 'apiEndpoint', 'credentials'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }

    // Validate endpoint URL
    try {
      new URL(config.apiEndpoint);
    } catch {
      throw new Error('Invalid API endpoint URL');
    }

    // Validate credentials based on EHR system
    const ehrSystem = this.ehrSystems.get(ehrId);
    if (ehrSystem.authentication === 'OAuth2' && 
        (!config.credentials.clientId || !config.credentials.clientSecret)) {
      throw new Error('OAuth2 credentials (clientId, clientSecret) required');
    }
  }

  async establishConnection(ehrId, config) {
    const ehrSystem = this.ehrSystems.get(ehrId);
    
    const connection = {
      id: Date.now().toString(),
      ehrId,
      baseUrl: config.apiEndpoint,
      authentication: ehrSystem.authentication,
      credentials: config.credentials,
      capabilities: ehrSystem.supportedFeatures,
      rateLimit: ehrSystem.rateLimit,
      requestCount: 0,
      lastRequest: null
    };

    // Get access token for OAuth2 systems
    if (ehrSystem.authentication === 'OAuth2') {
      connection.accessToken = await this.getOAuth2Token(ehrId, config);
    }

    return connection;
  }

  async getOAuth2Token(ehrId, config) {
    // Mock OAuth2 token exchange
    console.log(`Getting OAuth2 token for ${ehrId}`);
    
    // In production, this would make actual OAuth2 requests
    return {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'patient/*.read observation/*.read',
      expires_at: Date.now() + (3600 * 1000)
    };
  }

  async testConnection(connection) {
    console.log('Testing EHR connection...');
    
    try {
      // Mock connection test
      const testResult = await this.makeEHRRequest(connection, '/metadata', 'GET');
      
      if (!testResult.fhirVersion) {
        throw new Error('Invalid FHIR metadata response');
      }
      
      console.log('Connection test successful');
      return true;
      
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  async makeEHRRequest(connection, endpoint, method = 'GET', data = null) {
    // Check rate limits
    await this.enforceRateLimit(connection);
    
    // Prepare headers
    const headers = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json'
    };

    if (connection.authentication === 'OAuth2' && connection.accessToken) {
      headers['Authorization'] = `Bearer ${connection.accessToken.access_token}`;
    } else if (connection.authentication === 'Basic') {
      const encoded = Buffer.from(
        `${connection.credentials.username}:${connection.credentials.password}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
    }

    // Mock HTTP request - in production, use actual HTTP client
    console.log(`Making ${method} request to ${connection.baseUrl}${endpoint}`);
    
    connection.requestCount++;
    connection.lastRequest = new Date().toISOString();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Mock responses based on endpoint
    if (endpoint === '/metadata') {
      return {
        resourceType: 'CapabilityStatement',
        fhirVersion: '4.0.1',
        format: ['application/fhir+json'],
        rest: [{ mode: 'server' }]
      };
    }
    
    if (endpoint.includes('/Patient')) {
      return this.generateMockPatientData();
    }
    
    if (endpoint.includes('/Observation')) {
      return this.generateMockObservationData();
    }
    
    return { resourceType: 'Bundle', total: 0, entry: [] };
  }

  async enforceRateLimit(connection) {
    const now = Date.now();
    const windowMs = 3600000; // 1 hour in milliseconds
    
    if (connection.requestCount >= connection.rateLimit.requests) {
      const timeSinceFirstRequest = now - (connection.lastRequest || now);
      if (timeSinceFirstRequest < windowMs) {
        const waitTime = windowMs - timeSinceFirstRequest;
        console.log(`Rate limit exceeded, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        // Reset counter if window has passed
        connection.requestCount = 0;
      }
    }
  }

  generateMockPatientData() {
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{
        resource: {
          resourceType: 'Patient',
          id: 'patient-' + Math.random().toString(36).substr(2, 9),
          identifier: [{
            use: 'usual',
            system: 'http://hospital.org/patient-id',
            value: 'MRN' + Math.floor(Math.random() * 1000000)
          }],
          name: [{
            use: 'official',
            family: 'Doe',
            given: ['John']
          }],
          gender: Math.random() > 0.5 ? 'male' : 'female',
          birthDate: '1970-01-01',
          address: [{
            use: 'home',
            line: ['123 Main St'],
            city: 'Anytown',
            state: 'CA',
            postalCode: '12345',
            country: 'US'
          }]
        }
      }]
    };
  }

  generateMockObservationData() {
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: 1,
      entry: [{
        resource: {
          resourceType: 'Observation',
          id: 'obs-' + Math.random().toString(36).substr(2, 9),
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '33747-0',
              display: 'Hemoglobin'
            }]
          },
          subject: {
            reference: 'Patient/patient-123'
          },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: 12.5,
            unit: 'g/dL',
            system: 'http://unitsofmeasure.org',
            code: 'g/dL'
          },
          referenceRange: [{
            low: { value: 12.0, unit: 'g/dL' },
            high: { value: 16.0, unit: 'g/dL' }
          }]
        }
      }]
    };
  }

  async initializeSync(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) return;

    console.log(`Initializing sync for connection ${connectionId}`);
    
    switch (connection.syncMode) {
      case 'real_time':
        await this.setupRealtimeSync(connectionId);
        break;
      case 'scheduled':
        await this.setupScheduledSync(connectionId);
        break;
      case 'manual':
        console.log('Manual sync mode - no automatic sync');
        break;
    }
  }

  async setupRealtimeSync(connectionId) {
    console.log(`Setting up real-time sync for ${connectionId}`);
    
    // In production, this would set up webhook subscriptions or WebSocket connections
    // For now, simulate with polling
    const intervalId = setInterval(async () => {
      try {
        await this.performIncrementalSync(connectionId);
      } catch (error) {
        console.error(`Real-time sync error for ${connectionId}:`, error);
      }
    }, 60000); // Poll every minute

    const connection = this.activeConnections.get(connectionId);
    connection.syncInterval = intervalId;
  }

  async setupScheduledSync(connectionId) {
    console.log(`Setting up scheduled sync for ${connectionId}`);
    
    // Schedule sync every 4 hours
    const intervalId = setInterval(async () => {
      try {
        await this.performFullSync(connectionId);
      } catch (error) {
        console.error(`Scheduled sync error for ${connectionId}:`, error);
      }
    }, 4 * 60 * 60 * 1000); // Every 4 hours

    const connection = this.activeConnections.get(connectionId);
    connection.syncInterval = intervalId;
  }

  async performIncrementalSync(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection || connection.status !== 'active') return;

    console.log(`Performing incremental sync for ${connectionId}`);
    
    const lastSync = connection.lastSync || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    try {
      // Sync patients updated since last sync
      const patients = await this.fetchUpdatedPatients(connection, lastSync);
      await this.processPatientUpdates(patients, connectionId);
      
      // Sync observations
      const observations = await this.fetchUpdatedObservations(connection, lastSync);
      await this.processObservationUpdates(observations, connectionId);
      
      // Update connection
      connection.lastSync = new Date().toISOString();
      connection.lastActivity = new Date().toISOString();
      
    } catch (error) {
      console.error(`Incremental sync failed for ${connectionId}:`, error);
      connection.errorCount++;
    }
  }

  async performFullSync(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection || connection.status !== 'active') return;

    console.log(`Performing full sync for ${connectionId}`);
    
    try {
      // Full sync of all oncology patients
      const allPatients = await this.fetchOncologyPatients(connection);
      await this.processPatientUpdates(allPatients, connectionId);
      
      // Sync all recent observations for oncology patients
      const allObservations = await this.fetchOncologyObservations(connection);
      await this.processObservationUpdates(allObservations, connectionId);
      
      connection.lastSync = new Date().toISOString();
      connection.totalSynced += allPatients.length + allObservations.length;
      
    } catch (error) {
      console.error(`Full sync failed for ${connectionId}:`, error);
      connection.errorCount++;
    }
  }

  async fetchUpdatedPatients(connection, since) {
    const endpoint = `/Patient?_lastUpdated=gt${since}&condition=cancer`;
    const response = await this.makeEHRRequest(connection, endpoint);
    return response.entry || [];
  }

  async fetchUpdatedObservations(connection, since) {
    const endpoint = `/Observation?_lastUpdated=gt${since}&category=laboratory,vital-signs`;
    const response = await this.makeEHRRequest(connection, endpoint);
    return response.entry || [];
  }

  async fetchOncologyPatients(connection) {
    const endpoint = `/Patient?condition=cancer&_count=1000`;
    const response = await this.makeEHRRequest(connection, endpoint);
    return response.entry || [];
  }

  async fetchOncologyObservations(connection) {
    const endpoint = `/Observation?category=laboratory&date=gt${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&_count=5000`;
    const response = await this.makeEHRRequest(connection, endpoint);
    return response.entry || [];
  }

  async processPatientUpdates(patients, connectionId) {
    console.log(`Processing ${patients.length} patient updates for ${connectionId}`);
    
    for (const patientEntry of patients) {
      try {
        // Transform and enrich patient data
        const fhirResource = patientEntry.resource;
        await fhirPipeline.ingestFHIRData('Patient', fhirResource, connectionId);
        
        // Check if patient needs AI analysis
        if (await this.shouldAnalyzePatient(fhirResource)) {
          await this.queuePatientForAIAnalysis(fhirResource, connectionId);
        }
        
      } catch (error) {
        console.error(`Error processing patient update:`, error);
      }
    }
  }

  async processObservationUpdates(observations, connectionId) {
    console.log(`Processing ${observations.length} observation updates for ${connectionId}`);
    
    for (const obsEntry of observations) {
      try {
        const fhirResource = obsEntry.resource;
        await fhirPipeline.ingestFHIRData('Observation', fhirResource, connectionId);
        
        // Check for critical values
        if (await this.isCriticalObservation(fhirResource)) {
          await this.handleCriticalValue(fhirResource, connectionId);
        }
        
      } catch (error) {
        console.error(`Error processing observation update:`, error);
      }
    }
  }

  async shouldAnalyzePatient(patientResource) {
    // Check if patient has cancer diagnosis or relevant conditions
    return patientResource.condition?.some(condition => 
      condition.code?.coding?.some(code => 
        code.system === 'http://hl7.org/fhir/sid/icd-10' && 
        code.code?.startsWith('C')
      )
    );
  }

  async queuePatientForAIAnalysis(patientResource, connectionId) {
    const queue = this.syncQueues.get(connectionId);
    queue.push({
      type: 'ai_analysis',
      resource: patientResource,
      priority: 'normal',
      timestamp: new Date().toISOString()
    });
  }

  async isCriticalObservation(obsResource) {
    if (!obsResource.valueQuantity) return false;
    
    const value = obsResource.valueQuantity.value;
    const code = obsResource.code?.coding?.[0]?.code;
    
    // Define critical thresholds for common tumor markers
    const criticalThresholds = {
      '33747-0': { high: 20 }, // Hemoglobin critical low
      '2951-2': { high: 1000 }, // Sodium
      '6299-2': { high: 100 }   // Tumor markers
    };
    
    const threshold = criticalThresholds[code];
    return threshold && (value > threshold.high || value < threshold.low);
  }

  async handleCriticalValue(obsResource, connectionId) {
    console.log(`Critical value detected: ${obsResource.code?.coding?.[0]?.display}`);
    
    // Store critical alert
    await this.supabase
      .from('critical_alerts')
      .insert({
        connection_id: connectionId,
        patient_reference: obsResource.subject?.reference,
        observation_id: obsResource.id,
        observation_code: obsResource.code?.coding?.[0]?.code,
        observation_display: obsResource.code?.coding?.[0]?.display,
        value: obsResource.valueQuantity?.value,
        unit: obsResource.valueQuantity?.unit,
        alert_timestamp: new Date().toISOString(),
        status: 'active'
      });
    
    // Trigger notification workflow
    await this.triggerCriticalAlert(obsResource, connectionId);
  }

  async triggerCriticalAlert(obsResource, connectionId) {
    // In production, this would send notifications via multiple channels
    console.log(`Triggering critical alert for ${obsResource.subject?.reference}`);
    
    const alert = {
      type: 'critical_value',
      patient: obsResource.subject?.reference,
      test: obsResource.code?.coding?.[0]?.display,
      value: `${obsResource.valueQuantity?.value} ${obsResource.valueQuantity?.unit}`,
      timestamp: new Date().toISOString(),
      source: connectionId
    };
    
    // Mock notification channels
    await Promise.all([
      this.sendEmailAlert(alert),
      this.sendSMSAlert(alert),
      this.createInAppNotification(alert),
      this.updateDashboard(alert)
    ]);
  }

  async sendEmailAlert(alert) {
    console.log('Sending email alert for critical value');
    // Mock email sending
  }

  async sendSMSAlert(alert) {
    console.log('Sending SMS alert for critical value');
    // Mock SMS sending
  }

  async createInAppNotification(alert) {
    await this.supabase
      .from('notifications')
      .insert({
        type: 'critical_alert',
        title: 'Critical Laboratory Value',
        message: `Critical value detected: ${alert.test} = ${alert.value}`,
        alert_data: alert,
        created_at: new Date().toISOString(),
        read: false
      });
  }

  async updateDashboard(alert) {
    // Real-time dashboard update via WebSocket
    console.log('Updating dashboard with critical alert');
  }

  startSyncProcessing() {
    // Process queued sync tasks
    setInterval(async () => {
      for (const [connectionId, queue] of this.syncQueues) {
        if (queue.length > 0) {
          const task = queue.shift();
          try {
            await this.processSyncTask(task, connectionId);
          } catch (error) {
            console.error(`Error processing sync task:`, error);
          }
        }
      }
    }, 5000); // Process every 5 seconds
  }

  async processSyncTask(task, connectionId) {
    switch (task.type) {
      case 'ai_analysis':
        await this.performAIAnalysis(task.resource, connectionId);
        break;
      default:
        console.log(`Unknown sync task type: ${task.type}`);
    }
  }

  async performAIAnalysis(patientResource, connectionId) {
    try {
      // Mock AI analysis for patient
      const analysis = await aiEngine.performMultiModalAnalysis({
        id: patientResource.id,
        age: this.calculateAge(patientResource.birthDate),
        gender: patientResource.gender,
        // Mock additional data needed for AI
        cancerStage: 'IIB',
        performanceStatus: 1,
        genomics: { mutations: [] },
        currentRegimen: { numberOfAgents: 2 },
        biomarkers: {}
      });

      // Store AI analysis results
      await this.supabase
        .from('ehr_ai_analyses')
        .insert({
          connection_id: connectionId,
          patient_id: patientResource.id,
          analysis_results: analysis,
          created_at: new Date().toISOString()
        });

      console.log(`AI analysis completed for patient ${patientResource.id}`);
      
    } catch (error) {
      console.error('Error performing AI analysis:', error);
    }
  }

  calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  async getEHRIntegrationStatus() {
    const activeConnections = Array.from(this.activeConnections.values());
    const ehrSystems = Array.from(this.ehrSystems.values());
    
    return {
      totalEHRSystems: ehrSystems.length,
      activeConnections: activeConnections.length,
      totalHospitals: new Set(activeConnections.map(c => c.hospitalConfig.hospitalId)).size,
      syncStats: {
        realTimeConnections: activeConnections.filter(c => c.syncMode === 'real_time').length,
        scheduledConnections: activeConnections.filter(c => c.syncMode === 'scheduled').length,
        manualConnections: activeConnections.filter(c => c.syncMode === 'manual').length
      },
      dataVolume: {
        totalSynced: ehrSystems.reduce((sum, s) => sum + s.totalSynced, 0),
        last24Hours: await this.getSyncVolumeLastDay()
      },
      systemHealth: {
        healthyConnections: activeConnections.filter(c => c.errorCount < 5).length,
        degradedConnections: activeConnections.filter(c => c.errorCount >= 5 && c.errorCount < 20).length,
        failedConnections: activeConnections.filter(c => c.errorCount >= 20).length
      },
      lastUpdated: new Date().toISOString()
    };
  }

  async getSyncVolumeLastDay() {
    const { data } = await this.supabase
      .from('fhir_resources')
      .select('resource_type')
      .gte('ingested_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    return data?.length || 0;
  }

  async disconnectFromEHR(connectionId) {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }

    console.log(`Disconnecting from ${connectionId}`);
    
    // Clear sync interval
    if (connection.syncInterval) {
      clearInterval(connection.syncInterval);
    }
    
    // Update status
    connection.status = 'disconnected';
    connection.disconnectedAt = new Date().toISOString();
    
    // Remove from active connections
    this.activeConnections.delete(connectionId);
    
    console.log(`Successfully disconnected from ${connectionId}`);
  }

  async getEHRSystemCapabilities(ehrId) {
    const ehrSystem = this.ehrSystems.get(ehrId);
    if (!ehrSystem) {
      throw new Error(`EHR system ${ehrId} not found`);
    }

    return {
      system: ehrSystem.name,
      version: ehrSystem.version,
      marketShare: ehrSystem.marketShare,
      fhirCompliant: ehrSystem.fhirCompliant,
      supportedFeatures: ehrSystem.supportedFeatures,
      supportedRegions: ehrSystem.regions,
      endpoints: ehrSystem.endpoints,
      authentication: ehrSystem.authentication,
      rateLimit: ehrSystem.rateLimit,
      integrationGuide: `https://docs.oncosafe.org/ehr-integration/${ehrId}`,
      certificationLevel: ehrSystem.fhirCompliant ? 'ONC Certified' : 'Custom Integration'
    };
  }
}

// Export singleton instance
const ehrHub = new EHRIntegrationHub();
export default ehrHub;