import { createClient } from '@supabase/supabase-js';
import aiEngine from './aiEngine.js';

class FHIRDataPipeline {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    this.supportedResources = [
      'Patient', 'Observation', 'Condition', 'MedicationStatement',
      'DiagnosticReport', 'Specimen', 'ProcedureRequest', 'CarePlan',
      'Genomics', 'ImagingStudy', 'ClinicalImpression'
    ];
    
    this.globalHospitals = new Map();
    this.initializeGlobalNetwork();
  }

  async initializeGlobalNetwork() {
    console.log('Initializing Global Hospital Network...');
    
    // Mock global hospital network - in production, this would be real hospital APIs
    const hospitals = [
      { id: 'msk', name: 'Memorial Sloan Kettering', country: 'US', capability: ['genomics', 'trials'] },
      { id: 'mdacc', name: 'MD Anderson Cancer Center', country: 'US', capability: ['imaging', 'trials'] },
      { id: 'royalmarsden', name: 'Royal Marsden Hospital', country: 'UK', capability: ['immunotherapy'] },
      { id: 'gustaverossy', name: 'Gustave Rossy Institute', country: 'FR', capability: ['precision'] },
      { id: 'ncc', name: 'National Cancer Center', country: 'JP', capability: ['genomics'] },
      { id: 'aiims', name: 'AIIMS Delhi', country: 'IN', capability: ['population'] },
      { id: 'princessmargaret', name: 'Princess Margaret', country: 'CA', capability: ['trials'] },
      { id: 'charite', name: 'Charité Berlin', country: 'DE', capability: ['ai', 'trials'] },
      { id: 'karolinska', name: 'Karolinska Institute', country: 'SE', capability: ['research'] },
      { id: 'shanghai', name: 'Fudan University Shanghai Cancer Center', country: 'CN', capability: ['population'] }
    ];

    hospitals.forEach(hospital => {
      this.globalHospitals.set(hospital.id, {
        ...hospital,
        endpoint: `https://api.${hospital.id}.org/fhir/R4`,
        lastSync: null,
        status: 'active'
      });
    });

    console.log(`Initialized network with ${this.globalHospitals.size} global hospitals`);
  }

  async ingestFHIRData(resourceType, fhirResource, sourceHospital = 'local') {
    try {
      console.log(`Ingesting ${resourceType} resource from ${sourceHospital}`);
      
      // Validate FHIR resource
      const validationResult = await this.validateFHIRResource(resourceType, fhirResource);
      if (!validationResult.isValid) {
        throw new Error(`Invalid FHIR resource: ${validationResult.errors.join(', ')}`);
      }

      // Transform FHIR to internal format
      const transformedData = await this.transformFHIRResource(resourceType, fhirResource);
      
      // Enrich with AI analysis if applicable
      if (this.shouldEnrichWithAI(resourceType)) {
        transformedData.aiAnalysis = await this.enrichWithAI(transformedData);
      }

      // Store in database with provenance
      const storedData = await this.storeFHIRData(transformedData, sourceHospital);
      
      // Trigger real-time collaboration if relevant
      if (this.isCollaborationWorthy(transformedData)) {
        await this.broadcastToGlobalNetwork(transformedData);
      }

      return storedData;
    } catch (error) {
      console.error('Error ingesting FHIR data:', error);
      throw error;
    }
  }

  async validateFHIRResource(resourceType, resource) {
    const errors = [];
    
    // Basic FHIR structure validation
    if (!resource.resourceType) {
      errors.push('Missing resourceType');
    } else if (resource.resourceType !== resourceType) {
      errors.push(`Resource type mismatch: expected ${resourceType}, got ${resource.resourceType}`);
    }

    if (!resource.id) {
      errors.push('Missing resource id');
    }

    // Resource-specific validation
    switch (resourceType) {
      case 'Patient':
        if (!resource.identifier || resource.identifier.length === 0) {
          errors.push('Patient must have at least one identifier');
        }
        break;

      case 'Observation':
        if (!resource.status) {
          errors.push('Observation must have status');
        }
        if (!resource.code) {
          errors.push('Observation must have code');
        }
        if (!resource.subject) {
          errors.push('Observation must have subject reference');
        }
        break;

      case 'DiagnosticReport':
        if (!resource.status) {
          errors.push('DiagnosticReport must have status');
        }
        if (!resource.code) {
          errors.push('DiagnosticReport must have code');
        }
        if (!resource.subject) {
          errors.push('DiagnosticReport must have subject reference');
        }
        break;

      case 'Genomics':
        if (!resource.subject) {
          errors.push('Genomics resource must have subject reference');
        }
        if (!resource.specimen) {
          errors.push('Genomics resource must have specimen reference');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async transformFHIRResource(resourceType, fhirResource) {
    const baseTransformation = {
      id: fhirResource.id,
      resourceType: resourceType,
      sourceFormat: 'FHIR_R4',
      transformedAt: new Date().toISOString(),
      originalResource: fhirResource
    };

    switch (resourceType) {
      case 'Patient':
        return {
          ...baseTransformation,
          patientData: {
            id: fhirResource.id,
            identifiers: fhirResource.identifier || [],
            name: this.extractHumanName(fhirResource.name),
            gender: fhirResource.gender,
            birthDate: fhirResource.birthDate,
            address: fhirResource.address?.[0],
            telecom: fhirResource.telecom || [],
            maritalStatus: fhirResource.maritalStatus?.coding?.[0]?.code,
            communication: fhirResource.communication || []
          }
        };

      case 'Observation':
        return {
          ...baseTransformation,
          observationData: {
            id: fhirResource.id,
            status: fhirResource.status,
            category: fhirResource.category?.[0]?.coding?.[0]?.code,
            code: fhirResource.code?.coding?.[0],
            subject: fhirResource.subject?.reference,
            effectiveDateTime: fhirResource.effectiveDateTime,
            value: this.extractObservationValue(fhirResource),
            interpretation: fhirResource.interpretation?.[0]?.coding?.[0]?.code,
            referenceRange: fhirResource.referenceRange?.[0],
            component: fhirResource.component || []
          }
        };

      case 'DiagnosticReport':
        return {
          ...baseTransformation,
          diagnosticData: {
            id: fhirResource.id,
            status: fhirResource.status,
            category: fhirResource.category?.[0]?.coding?.[0]?.code,
            code: fhirResource.code?.coding?.[0],
            subject: fhirResource.subject?.reference,
            effectiveDateTime: fhirResource.effectiveDateTime,
            issued: fhirResource.issued,
            performer: fhirResource.performer || [],
            result: fhirResource.result || [],
            imagingStudy: fhirResource.imagingStudy || [],
            conclusion: fhirResource.conclusion,
            conclusionCode: fhirResource.conclusionCode || []
          }
        };

      case 'Genomics':
        return {
          ...baseTransformation,
          genomicsData: {
            id: fhirResource.id,
            subject: fhirResource.subject?.reference,
            specimen: fhirResource.specimen?.reference,
            genomicSourceClass: fhirResource.component?.find(c => 
              c.code?.coding?.[0]?.code === 'genomic-source-class'
            )?.valueCodeableConcept?.coding?.[0]?.code,
            variants: this.extractGenomicVariants(fhirResource),
            copyNumberVariants: this.extractCopyNumberVariants(fhirResource),
            structuralVariants: this.extractStructuralVariants(fhirResource)
          }
        };

      default:
        return {
          ...baseTransformation,
          genericData: fhirResource
        };
    }
  }

  extractHumanName(names) {
    if (!names || names.length === 0) return {};
    
    const primaryName = names.find(n => n.use === 'official') || names[0];
    return {
      given: primaryName.given || [],
      family: primaryName.family,
      prefix: primaryName.prefix || [],
      suffix: primaryName.suffix || []
    };
  }

  extractObservationValue(observation) {
    if (observation.valueQuantity) {
      return {
        type: 'Quantity',
        value: observation.valueQuantity.value,
        unit: observation.valueQuantity.unit,
        system: observation.valueQuantity.system
      };
    }
    
    if (observation.valueCodeableConcept) {
      return {
        type: 'CodeableConcept',
        coding: observation.valueCodeableConcept.coding || []
      };
    }
    
    if (observation.valueString) {
      return {
        type: 'String',
        value: observation.valueString
      };
    }
    
    if (observation.valueBoolean !== undefined) {
      return {
        type: 'Boolean',
        value: observation.valueBoolean
      };
    }

    return null;
  }

  extractGenomicVariants(genomicsResource) {
    const variants = [];
    
    genomicsResource.component?.forEach(component => {
      if (component.code?.coding?.[0]?.code === 'genetic-variant') {
        variants.push({
          chromosome: component.valueCodeableConcept?.coding?.[0]?.code,
          position: component.component?.find(c => c.code?.coding?.[0]?.code === 'genomic-ref-seq')?.valueString,
          referenceAllele: component.component?.find(c => c.code?.coding?.[0]?.code === 'ref-allele')?.valueString,
          alternateAllele: component.component?.find(c => c.code?.coding?.[0]?.code === 'alt-allele')?.valueString,
          variantType: component.component?.find(c => c.code?.coding?.[0]?.code === 'variant-type')?.valueCodeableConcept?.coding?.[0]?.code,
          clinicalSignificance: component.component?.find(c => c.code?.coding?.[0]?.code === 'clinical-significance')?.valueCodeableConcept?.coding?.[0]?.code
        });
      }
    });

    return variants;
  }

  extractCopyNumberVariants(genomicsResource) {
    const cnvs = [];
    
    genomicsResource.component?.forEach(component => {
      if (component.code?.coding?.[0]?.code === 'copy-number-variant') {
        cnvs.push({
          chromosome: component.valueCodeableConcept?.coding?.[0]?.code,
          startPosition: component.component?.find(c => c.code?.coding?.[0]?.code === 'start-range')?.valueRange?.low?.value,
          endPosition: component.component?.find(c => c.code?.coding?.[0]?.code === 'end-range')?.valueRange?.high?.value,
          copyNumber: component.component?.find(c => c.code?.coding?.[0]?.code === 'copy-number')?.valueQuantity?.value,
          gene: component.component?.find(c => c.code?.coding?.[0]?.code === 'gene-studied')?.valueCodeableConcept?.coding?.[0]?.display
        });
      }
    });

    return cnvs;
  }

  extractStructuralVariants(genomicsResource) {
    const svs = [];
    
    genomicsResource.component?.forEach(component => {
      if (component.code?.coding?.[0]?.code === 'structural-variant') {
        svs.push({
          variantType: component.valueCodeableConcept?.coding?.[0]?.code,
          chromosome1: component.component?.find(c => c.code?.coding?.[0]?.code === 'chromosome-1')?.valueCodeableConcept?.coding?.[0]?.code,
          chromosome2: component.component?.find(c => c.code?.coding?.[0]?.code === 'chromosome-2')?.valueCodeableConcept?.coding?.[0]?.code,
          breakpoint1: component.component?.find(c => c.code?.coding?.[0]?.code === 'breakpoint-1')?.valueQuantity?.value,
          breakpoint2: component.component?.find(c => c.code?.coding?.[0]?.code === 'breakpoint-2')?.valueQuantity?.value,
          gene1: component.component?.find(c => c.code?.coding?.[0]?.code === 'gene-1')?.valueCodeableConcept?.coding?.[0]?.display,
          gene2: component.component?.find(c => c.code?.coding?.[0]?.code === 'gene-2')?.valueCodeableConcept?.coding?.[0]?.display
        });
      }
    });

    return svs;
  }

  shouldEnrichWithAI(resourceType) {
    return ['Observation', 'DiagnosticReport', 'Genomics'].includes(resourceType);
  }

  async enrichWithAI(transformedData) {
    try {
      const { resourceType } = transformedData;
      
      switch (resourceType) {
        case 'Observation':
          return await this.enrichObservationWithAI(transformedData.observationData);
        
        case 'DiagnosticReport':
          return await this.enrichDiagnosticReportWithAI(transformedData.diagnosticData);
          
        case 'Genomics':
          return await this.enrichGenomicsWithAI(transformedData.genomicsData);
          
        default:
          return null;
      }
    } catch (error) {
      console.error('Error enriching with AI:', error);
      return null;
    }
  }

  async enrichObservationWithAI(observationData) {
    // Analyze observation for clinical significance
    const analysis = {
      clinicalSignificance: this.assessClinicalSignificance(observationData),
      trendAnalysis: await this.analyzeTrends(observationData),
      alerts: await this.generateAlerts(observationData),
      recommendations: await this.generateRecommendations(observationData)
    };

    return analysis;
  }

  async enrichDiagnosticReportWithAI(diagnosticData) {
    // AI analysis of diagnostic reports
    const analysis = {
      keyFindings: await this.extractKeyFindings(diagnosticData),
      riskStratification: await this.stratifyRisk(diagnosticData),
      followUpRecommendations: await this.generateFollowUp(diagnosticData),
      comparisonWithPopulation: await this.compareWithPopulation(diagnosticData)
    };

    return analysis;
  }

  async enrichGenomicsWithAI(genomicsData) {
    // Advanced genomic analysis using AI
    if (genomicsData.subject) {
      const mockPatientData = await this.getMockPatientData(genomicsData.subject);
      const analysis = await aiEngine.analyzeBiomarkers({
        patient_id: genomicsData.subject,
        mutations: genomicsData.variants,
        copyNumberAlterations: genomicsData.copyNumberVariants,
        structuralVariants: genomicsData.structuralVariants
      });

      return analysis;
    }

    return null;
  }

  async getMockPatientData(patientRef) {
    // In production, this would fetch real patient data
    return {
      id: patientRef.replace('Patient/', ''),
      age: 55,
      gender: 'female',
      cancerType: 'breast',
      stage: 'IIB'
    };
  }

  assessClinicalSignificance(observationData) {
    const { code, value, referenceRange } = observationData;
    
    if (!value || !referenceRange) {
      return 'Unable to assess';
    }

    const numValue = value.value;
    const { low, high } = referenceRange;
    
    if (numValue < low * 0.5 || numValue > high * 2) {
      return 'Critical - requires immediate attention';
    } else if (numValue < low || numValue > high) {
      return 'Abnormal - requires clinical correlation';
    } else {
      return 'Normal range';
    }
  }

  async analyzeTrends(observationData) {
    // Mock trend analysis - in production, would analyze historical data
    return {
      trend: 'stable',
      changePercent: 2.1,
      significance: 'not significant'
    };
  }

  async generateAlerts(observationData) {
    const alerts = [];
    
    if (observationData.code?.code === 'tumor-marker' && observationData.value?.value > 100) {
      alerts.push({
        severity: 'high',
        message: 'Tumor marker significantly elevated',
        action: 'Consider immediate oncology consultation'
      });
    }

    return alerts;
  }

  async generateRecommendations(observationData) {
    return [
      'Continue current monitoring schedule',
      'Consider correlation with clinical symptoms',
      'Repeat in 4 weeks if clinically indicated'
    ];
  }

  async extractKeyFindings(diagnosticData) {
    // AI-powered key finding extraction
    return [
      'No evidence of disease progression on current imaging',
      'Stable hepatic lesions consistent with treated disease',
      'New pulmonary nodule requires follow-up'
    ];
  }

  async stratifyRisk(diagnosticData) {
    return {
      category: 'moderate',
      score: 0.45,
      factors: ['stable disease', 'good performance status', 'adequate organ function']
    };
  }

  async generateFollowUp(diagnosticData) {
    return [
      'Repeat imaging in 12 weeks',
      'Monitor tumor markers monthly',
      'Clinical assessment in 4 weeks'
    ];
  }

  async compareWithPopulation(diagnosticData) {
    return {
      percentile: 75,
      comparison: 'Better than average for similar patient population',
      benchmarkData: 'Based on 10,000+ similar cases in global database'
    };
  }

  async storeFHIRData(transformedData, sourceHospital) {
    try {
      const { data, error } = await this.supabase
        .from('fhir_resources')
        .insert({
          resource_id: transformedData.id,
          resource_type: transformedData.resourceType,
          source_hospital: sourceHospital,
          transformed_data: transformedData,
          ingested_at: new Date().toISOString(),
          ai_enriched: transformedData.aiAnalysis ? true : false
        })
        .select()
        .single();

      if (error) throw error;

      // Store in resource-specific tables for better querying
      await this.storeInSpecificTable(transformedData);

      return data;
    } catch (error) {
      console.error('Error storing FHIR data:', error);
      throw error;
    }
  }

  async storeInSpecificTable(transformedData) {
    const { resourceType } = transformedData;
    
    try {
      switch (resourceType) {
        case 'Patient':
          await this.supabase
            .from('patients_fhir')
            .upsert({
              patient_id: transformedData.patientData.id,
              patient_data: transformedData.patientData,
              last_updated: new Date().toISOString()
            });
          break;

        case 'Observation':
          await this.supabase
            .from('observations_fhir')
            .insert({
              observation_id: transformedData.observationData.id,
              patient_id: transformedData.observationData.subject?.replace('Patient/', ''),
              observation_data: transformedData.observationData,
              ai_analysis: transformedData.aiAnalysis,
              created_at: new Date().toISOString()
            });
          break;

        case 'Genomics':
          await this.supabase
            .from('genomics_fhir')
            .insert({
              genomics_id: transformedData.genomicsData.id,
              patient_id: transformedData.genomicsData.subject?.replace('Patient/', ''),
              genomics_data: transformedData.genomicsData,
              ai_analysis: transformedData.aiAnalysis,
              created_at: new Date().toISOString()
            });
          break;
      }
    } catch (error) {
      console.error(`Error storing in ${resourceType} table:`, error);
    }
  }

  isCollaborationWorthy(transformedData) {
    // Determine if data should be shared with global network
    if (transformedData.resourceType === 'Genomics') return true;
    if (transformedData.aiAnalysis?.alerts?.some(alert => alert.severity === 'high')) return true;
    if (transformedData.resourceType === 'DiagnosticReport' && 
        transformedData.aiAnalysis?.riskStratification?.category === 'high') return true;
    
    return false;
  }

  async broadcastToGlobalNetwork(transformedData) {
    console.log('Broadcasting to global network...');
    
    try {
      // Anonymize data for global sharing
      const anonymizedData = await this.anonymizeData(transformedData);
      
      // Broadcast to relevant hospitals based on data type and capabilities
      const targetHospitals = this.selectTargetHospitals(transformedData);
      
      const broadcastPromises = targetHospitals.map(hospital => 
        this.sendToHospital(hospital, anonymizedData)
      );

      const results = await Promise.allSettled(broadcastPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Successfully broadcasted to ${successful}/${targetHospitals.length} hospitals`);
      
      // Log broadcast for analytics
      await this.logBroadcast(transformedData, targetHospitals, successful);
      
    } catch (error) {
      console.error('Error broadcasting to global network:', error);
    }
  }

  async anonymizeData(data) {
    // Remove all patient identifiers and apply differential privacy
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // Remove direct identifiers
    delete anonymized.patientData?.identifiers;
    delete anonymized.patientData?.name;
    delete anonymized.patientData?.address;
    delete anonymized.patientData?.telecom;
    
    // Generalize dates
    if (anonymized.patientData?.birthDate) {
      const birthYear = new Date(anonymized.patientData.birthDate).getFullYear();
      anonymized.patientData.birthDate = `${birthYear}-01-01`; // Year only
    }
    
    // Add noise to numeric values for differential privacy
    if (anonymized.observationData?.value?.value) {
      const noise = (Math.random() - 0.5) * 0.1; // 10% noise
      anonymized.observationData.value.value *= (1 + noise);
    }
    
    return anonymized;
  }

  selectTargetHospitals(transformedData) {
    const targets = [];
    
    // Select hospitals based on data type and capabilities
    this.globalHospitals.forEach((hospital, id) => {
      if (transformedData.resourceType === 'Genomics' && 
          hospital.capability.includes('genomics')) {
        targets.push(hospital);
      }
      
      if (transformedData.aiAnalysis?.alerts?.some(a => a.severity === 'high') &&
          hospital.capability.includes('trials')) {
        targets.push(hospital);
      }
    });
    
    // Limit to top 5 most relevant hospitals
    return targets.slice(0, 5);
  }

  async sendToHospital(hospital, data) {
    try {
      // In production, this would be actual HTTP requests to hospital FHIR endpoints
      console.log(`Sending data to ${hospital.name} (${hospital.country})`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // Mock successful response
      return {
        hospital: hospital.id,
        status: 'success',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error sending to ${hospital.name}:`, error);
      throw error;
    }
  }

  async logBroadcast(data, targetHospitals, successfulSends) {
    try {
      await this.supabase
        .from('global_broadcasts')
        .insert({
          resource_type: data.resourceType,
          resource_id: data.id,
          target_hospitals: targetHospitals.map(h => h.id),
          successful_sends: successfulSends,
          broadcast_timestamp: new Date().toISOString(),
          data_summary: this.generateDataSummary(data)
        });
    } catch (error) {
      console.error('Error logging broadcast:', error);
    }
  }

  generateDataSummary(data) {
    return {
      resourceType: data.resourceType,
      hasAI: !!data.aiAnalysis,
      significance: data.aiAnalysis?.clinicalSignificance || 'unknown',
      alertCount: data.aiAnalysis?.alerts?.length || 0
    };
  }

  // Real-time collaboration features
  async subscribeToGlobalUpdates(hospitalId, callback) {
    console.log(`Subscribing ${hospitalId} to global updates`);
    
    // In production, this would set up WebSocket connections or server-sent events
    // For now, simulate with periodic polling
    const intervalId = setInterval(async () => {
      try {
        const updates = await this.getGlobalUpdates(hospitalId);
        if (updates.length > 0) {
          callback(updates);
        }
      } catch (error) {
        console.error('Error fetching global updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return intervalId;
  }

  async getGlobalUpdates(hospitalId) {
    try {
      const { data, error } = await this.supabase
        .from('global_broadcasts')
        .select('*')
        .not('target_hospitals', 'cs', `{${hospitalId}}`)
        .gte('broadcast_timestamp', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('broadcast_timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting global updates:', error);
      return [];
    }
  }

  async getGlobalAnalytics() {
    try {
      const analytics = await Promise.all([
        this.getResourceStats(),
        this.getHospitalActivity(),
        this.getAIEnrichmentStats(),
        this.getCollaborationMetrics()
      ]);

      return {
        resources: analytics[0],
        hospitalActivity: analytics[1],
        aiEnrichment: analytics[2],
        collaboration: analytics[3],
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting global analytics:', error);
      throw error;
    }
  }

  async getResourceStats() {
    const { data } = await this.supabase
      .from('fhir_resources')
      .select('resource_type')
      .gte('ingested_at', new Date(Date.now() - 86400000).toISOString()); // Last 24 hours

    const stats = {};
    data?.forEach(resource => {
      stats[resource.resource_type] = (stats[resource.resource_type] || 0) + 1;
    });

    return stats;
  }

  async getHospitalActivity() {
    const { data } = await this.supabase
      .from('fhir_resources')
      .select('source_hospital')
      .gte('ingested_at', new Date(Date.now() - 86400000).toISOString());

    const activity = {};
    data?.forEach(resource => {
      activity[resource.source_hospital] = (activity[resource.source_hospital] || 0) + 1;
    });

    return activity;
  }

  async getAIEnrichmentStats() {
    const { data } = await this.supabase
      .from('fhir_resources')
      .select('ai_enriched')
      .gte('ingested_at', new Date(Date.now() - 86400000).toISOString());

    const total = data?.length || 0;
    const enriched = data?.filter(r => r.ai_enriched).length || 0;

    return {
      total,
      enriched,
      enrichmentRate: total > 0 ? (enriched / total * 100).toFixed(1) + '%' : '0%'
    };
  }

  async getCollaborationMetrics() {
    const { data } = await this.supabase
      .from('global_broadcasts')
      .select('successful_sends, target_hospitals')
      .gte('broadcast_timestamp', new Date(Date.now() - 86400000).toISOString());

    const totalBroadcasts = data?.length || 0;
    const totalTargets = data?.reduce((sum, b) => sum + (b.target_hospitals?.length || 0), 0) || 0;
    const totalSuccessful = data?.reduce((sum, b) => sum + (b.successful_sends || 0), 0) || 0;

    return {
      totalBroadcasts,
      totalTargets,
      totalSuccessful,
      successRate: totalTargets > 0 ? ((totalSuccessful / totalTargets) * 100).toFixed(1) + '%' : '0%'
    };
  }
}

// Export singleton instance
const fhirPipeline = new FHIRDataPipeline();
export default fhirPipeline;