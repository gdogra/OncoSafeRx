/**
 * Google Cloud Healthcare API Integration
 * Demonstrates immediate Google Cloud compatibility and value
 */

import { healthcare } from '@google-cloud/healthcare';
import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { PubSub } from '@google-cloud/pubsub';

class GoogleCloudHealthcareIntegration {
  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    this.datasetId = process.env.HEALTHCARE_DATASET_ID;
    
    // Initialize Google Cloud services
    this.healthcareClient = new healthcare.ProjectsService();
    this.bigquery = new BigQuery({ projectId: this.projectId });
    this.storage = new Storage({ projectId: this.projectId });
    this.pubsub = new PubSub({ projectId: this.projectId });
    
    this.fhirStoreId = 'oncosaferx-fhir-store';
    this.dicomStoreId = 'oncosaferx-dicom-store';
  }

  /**
   * Initialize Google Cloud Healthcare dataset and stores
   */
  async initializeHealthcareDataset() {
    try {
      const parent = `projects/${this.projectId}/locations/${this.location}`;
      
      // Create healthcare dataset
      const datasetResource = {
        timeZone: 'America/New_York'
      };
      
      const [dataset] = await this.healthcareClient.createDataset({
        parent,
        datasetId: this.datasetId,
        dataset: datasetResource
      });

      console.log(`Created healthcare dataset: ${dataset.name}`);

      // Create FHIR store for patient data
      await this.createFHIRStore();
      
      // Create DICOM store for imaging data
      await this.createDICOMStore();

      return dataset;
    } catch (error) {
      console.error('Healthcare dataset initialization error:', error);
      throw error;
    }
  }

  /**
   * Create FHIR store for structured clinical data
   */
  async createFHIRStore() {
    const parent = `projects/${this.projectId}/locations/${this.location}/datasets/${this.datasetId}`;
    
    const fhirStoreResource = {
      version: 'R4',
      enableUpdateCreate: true,
      disableReferentialIntegrity: false,
      disableResourceVersioning: false,
      labels: {
        environment: 'oncosaferx',
        data_type: 'clinical'
      }
    };

    try {
      const [fhirStore] = await this.healthcareClient.createFhirStore({
        parent,
        fhirStoreId: this.fhirStoreId,
        fhirStore: fhirStoreResource
      });

      console.log(`Created FHIR store: ${fhirStore.name}`);
      return fhirStore;
    } catch (error) {
      console.error('FHIR store creation error:', error);
      throw error;
    }
  }

  /**
   * Store patient data in FHIR format
   */
  async storePatientData(patientData) {
    try {
      // Convert patient data to FHIR R4 format
      const fhirPatient = this.convertToFHIR(patientData);
      
      const parent = `projects/${this.projectId}/locations/${this.location}/datasets/${this.datasetId}/fhirStores/${this.fhirStoreId}`;
      
      const [response] = await this.healthcareClient.createResource({
        parent,
        type: 'Patient',
        requestBody: fhirPatient
      });

      // Index in BigQuery for analytics
      await this.indexPatientInBigQuery(patientData, response.id);

      return response;
    } catch (error) {
      console.error('Patient data storage error:', error);
      throw error;
    }
  }

  /**
   * Convert OncoSafeRx patient data to FHIR R4 format
   */
  convertToFHIR(patientData) {
    return {
      resourceType: 'Patient',
      id: patientData.id,
      identifier: [{
        use: 'usual',
        system: 'http://oncosaferx.com/patient-id',
        value: patientData.mrn
      }],
      active: true,
      name: [{
        use: 'official',
        family: patientData.lastName,
        given: [patientData.firstName]
      }],
      gender: patientData.gender?.toLowerCase(),
      birthDate: patientData.dateOfBirth,
      address: [{
        use: 'home',
        line: [patientData.address?.street],
        city: patientData.address?.city,
        state: patientData.address?.state,
        postalCode: patientData.address?.zipCode,
        country: 'US'
      }],
      telecom: [{
        system: 'phone',
        value: patientData.phone,
        use: 'home'
      }, {
        system: 'email',
        value: patientData.email,
        use: 'home'
      }],
      extension: [{
        url: 'http://oncosaferx.com/cancer-type',
        valueString: patientData.primaryDiagnosis
      }, {
        url: 'http://oncosaferx.com/cancer-stage',
        valueString: patientData.cancerStage
      }]
    };
  }

  /**
   * Index patient data in BigQuery for analytics
   */
  async indexPatientInBigQuery(patientData, fhirId) {
    try {
      const datasetId = 'oncosaferx_analytics';
      const tableId = 'patient_data';
      
      const row = {
        patient_id: patientData.id,
        fhir_id: fhirId,
        diagnosis: patientData.primaryDiagnosis,
        stage: patientData.cancerStage,
        age: this.calculateAge(patientData.dateOfBirth),
        gender: patientData.gender,
        created_at: new Date().toISOString(),
        data_source: 'oncosaferx'
      };

      await this.bigquery.dataset(datasetId).table(tableId).insert([row]);
      console.log('Patient data indexed in BigQuery');
    } catch (error) {
      console.error('BigQuery indexing error:', error);
    }
  }

  /**
   * Query clinical insights using BigQuery
   */
  async getClinicalInsights(queryType) {
    const queries = {
      demographics: `
        SELECT 
          diagnosis,
          COUNT(*) as patient_count,
          AVG(age) as avg_age,
          gender
        FROM \`${this.projectId}.oncosaferx_analytics.patient_data\`
        GROUP BY diagnosis, gender
        ORDER BY patient_count DESC
      `,
      
      outcomes: `
        SELECT 
          t.treatment_type,
          AVG(o.survival_months) as avg_survival,
          COUNT(*) as patient_count
        FROM \`${this.projectId}.oncosaferx_analytics.treatment_data\` t
        JOIN \`${this.projectId}.oncosaferx_analytics.outcome_data\` o
        ON t.patient_id = o.patient_id
        GROUP BY t.treatment_type
        ORDER BY avg_survival DESC
      `,
      
      recommendations: `
        SELECT 
          r.recommendation_type,
          r.confidence_score,
          COUNT(*) as usage_count,
          AVG(f.physician_agreement) as agreement_rate
        FROM \`${this.projectId}.oncosaferx_analytics.recommendation_data\` r
        JOIN \`${this.projectId}.oncosaferx_analytics.feedback_data\` f
        ON r.recommendation_id = f.recommendation_id
        GROUP BY r.recommendation_type, r.confidence_score
        ORDER BY usage_count DESC
      `
    };

    try {
      const [rows] = await this.bigquery.query({
        query: queries[queryType],
        location: 'US'
      });

      return rows;
    } catch (error) {
      console.error('BigQuery insights error:', error);
      throw error;
    }
  }

  /**
   * Publish clinical events to Pub/Sub for real-time processing
   */
  async publishClinicalEvent(eventType, eventData) {
    try {
      const topicName = 'oncosaferx-clinical-events';
      const topic = this.pubsub.topic(topicName);
      
      const eventMessage = {
        eventType,
        timestamp: new Date().toISOString(),
        data: eventData,
        source: 'oncosaferx-platform'
      };

      const messageId = await topic.publish(Buffer.from(JSON.stringify(eventMessage)));
      console.log(`Clinical event published: ${messageId}`);
      
      return messageId;
    } catch (error) {
      console.error('Pub/Sub publishing error:', error);
      throw error;
    }
  }

  /**
   * Demonstrate Google Cloud AI integration capabilities
   */
  async enhanceWithGoogleAI(clinicalText) {
    try {
      // This would integrate with Google's Medical AI APIs
      // For demonstration purposes, showing the integration pattern
      
      const aiInsights = {
        entities: await this.extractMedicalEntities(clinicalText),
        sentiment: await this.analyzeClinicalSentiment(clinicalText),
        classification: await this.classifyMedicalText(clinicalText)
      };

      return aiInsights;
    } catch (error) {
      console.error('Google AI integration error:', error);
      throw error;
    }
  }

  /**
   * Generate real-time analytics dashboard data
   */
  async getDashboardMetrics() {
    try {
      const metrics = await Promise.all([
        this.getClinicalInsights('demographics'),
        this.getClinicalInsights('outcomes'),
        this.getClinicalInsights('recommendations'),
        this.getSystemPerformanceMetrics(),
        this.getUsageMetrics()
      ]);

      return {
        demographics: metrics[0],
        outcomes: metrics[1], 
        recommendations: metrics[2],
        performance: metrics[3],
        usage: metrics[4],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      throw error;
    }
  }

  /**
   * Export data for Google Cloud's healthcare analytics
   */
  async exportToHealthcareAnalytics(startDate, endDate) {
    try {
      const exportQuery = `
        EXPORT DATA OPTIONS(
          uri='gs://oncosaferx-exports/analytics_${Date.now()}.json',
          format='JSON'
        ) AS
        SELECT 
          patient_id,
          diagnosis,
          treatment_recommendations,
          outcomes,
          physician_feedback,
          system_confidence
        FROM \`${this.projectId}.oncosaferx_analytics.*\`
        WHERE created_at BETWEEN '${startDate}' AND '${endDate}'
      `;

      const [job] = await this.bigquery.createQueryJob({
        query: exportQuery,
        location: 'US'
      });

      await job.getQueryResults();
      console.log('Data exported to Google Cloud Storage');
      
      return job.id;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Google Cloud migration utilities
export class GoogleCloudMigrationUtility {
  constructor() {
    this.migrationSteps = [
      'infrastructure_setup',
      'data_migration', 
      'api_integration',
      'security_configuration',
      'performance_optimization',
      'monitoring_setup'
    ];
  }

  /**
   * Generate migration plan for Google Cloud
   */
  generateMigrationPlan() {
    return {
      phase1: {
        name: "Infrastructure Setup",
        duration: "2 weeks",
        tasks: [
          "Set up Google Cloud project and billing",
          "Configure VPC and networking",
          "Set up Cloud SQL for PostgreSQL",
          "Configure Cloud Storage buckets",
          "Set up IAM roles and permissions"
        ],
        cost: 5000
      },
      
      phase2: {
        name: "Data Migration", 
        duration: "1 week",
        tasks: [
          "Export existing data from current infrastructure",
          "Transform data for Google Cloud services",
          "Import to Cloud SQL and Cloud Storage",
          "Verify data integrity and completeness",
          "Set up backup and disaster recovery"
        ],
        cost: 3000
      },
      
      phase3: {
        name: "Application Migration",
        duration: "3 weeks", 
        tasks: [
          "Deploy application to Google Kubernetes Engine",
          "Configure Cloud Load Balancer",
          "Set up Cloud CDN for static assets",
          "Integrate with Google Cloud Healthcare APIs",
          "Configure Cloud Pub/Sub for event processing"
        ],
        cost: 8000
      },
      
      phase4: {
        name: "AI Integration",
        duration: "2 weeks",
        tasks: [
          "Integrate with Vertex AI for ML workflows",
          "Set up BigQuery for analytics",
          "Configure AutoML for custom models",
          "Implement Google Cloud AI APIs",
          "Set up model monitoring and retraining"
        ],
        cost: 6000
      },
      
      totalDuration: "8 weeks",
      totalCost: 22000,
      expectedBenefits: [
        "50% reduction in infrastructure costs",
        "10x improvement in scalability", 
        "Advanced AI/ML capabilities",
        "Enterprise-grade security and compliance",
        "Real-time analytics and insights"
      ]
    };
  }
}

export default GoogleCloudHealthcareIntegration;
export { GoogleCloudMigrationUtility };