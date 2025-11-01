import enhancedInteractionEngine from './enhancedInteractionEngine.js';
import { oncologyDrugs } from '../data/oncologyDrugs.js';
import { randomUUID } from 'crypto';

export class ClinicalDecisionSupport {
  constructor() {
    this.alertThresholds = {
      critical: 0.9,
      high: 0.7,
      moderate: 0.5,
      low: 0.3
    };
    this.cache = new Map();
  }

  /**
   * Real-time clinical decision support for oncology prescribing
   */
  async provideClinicalDecisionSupport(prescriptionData, patientContext = {}) {
    try {
      const sessionId = randomUUID();
      const timestamp = new Date().toISOString();

      // Analyze the prescription
      const analysis = await this.analyzePrescription(prescriptionData, patientContext);
      
      // Generate alerts and recommendations
      const alerts = await this.generateAlerts(analysis, patientContext);
      const recommendations = await this.generateRecommendations(analysis, patientContext);
      const alternativeOptions = await this.suggestAlternatives(prescriptionData, patientContext);
      
      // Create monitoring requirements
      const monitoring = await this.createMonitoringRequirements(analysis, patientContext);
      
      // Generate risk score
      const riskScore = await this.calculateOverallRisk(analysis, patientContext);

      return {
        sessionId,
        timestamp,
        riskScore,
        alerts,
        recommendations,
        alternativeOptions,
        monitoring,
        prescriptionAnalysis: analysis,
        summary: this.generateExecutiveSummary(alerts, recommendations, riskScore)
      };

    } catch (error) {
      console.error('Error in clinical decision support:', error);
      throw new Error('Failed to provide clinical decision support');
    }
  }

  /**
   * Analyze prescription for potential issues
   */
  async analyzePrescription(prescriptionData, patientContext) {
    const analysis = {
      drugAnalysis: [],
      interactionAnalysis: null,
      contraindicationAnalysis: [],
      doseAppropriatenessAnalysis: [],
      pharmacogenomicAnalysis: []
    };

    // Analyze each drug
    for (const drug of prescriptionData.medications) {
      const drugAnalysis = await this.analyzeSingleDrug(drug, patientContext);
      analysis.drugAnalysis.push(drugAnalysis);
    }

    // Analyze drug interactions
    if (prescriptionData.medications.length > 1) {
      analysis.interactionAnalysis = await enhancedInteractionEngine.analyzeInteractions(
        prescriptionData.medications,
        patientContext
      );
    }

    // Check contraindications
    analysis.contraindicationAnalysis = await this.checkContraindications(
      prescriptionData.medications,
      patientContext
    );

    // Analyze dose appropriateness
    analysis.doseAppropriatenessAnalysis = await this.analyzeDoseAppropriateness(
      prescriptionData.medications,
      patientContext
    );

    // Pharmacogenomic analysis
    if (patientContext.genetics) {
      analysis.pharmacogenomicAnalysis = await this.analyzePharmacogenomics(
        prescriptionData.medications,
        patientContext.genetics
      );
    }

    return analysis;
  }

  /**
   * Analyze a single drug for appropriateness
   */
  async analyzeSingleDrug(drug, patientContext) {
    const drugData = this.findDrugData(drug);
    
    return {
      drug: drug,
      drugData: drugData,
      appropriateness: await this.assessDrugAppropriateness(drug, drugData, patientContext),
      doseAppropriateness: await this.assessDoseAppropriateness(drug, drugData, patientContext),
      contraindications: await this.checkDrugContraindications(drug, drugData, patientContext),
      precautions: await this.identifyPrecautions(drug, drugData, patientContext),
      monitoringRequirements: await this.getDrugMonitoringRequirements(drug, drugData, patientContext)
    };
  }

  /**
   * Generate clinical alerts based on analysis
   */
  async generateAlerts(analysis, patientContext) {
    const alerts = [];

    // Critical interaction alerts
    if (analysis.interactionAnalysis?.interactions) {
      for (const interaction of analysis.interactionAnalysis.interactions) {
        if (interaction.severity === 'critical' || interaction.severity === 'major') {
          alerts.push({
            type: 'drug_interaction',
            severity: interaction.severity,
            priority: interaction.severity === 'critical' ? 1 : 2,
            title: `${interaction.severity.toUpperCase()} Drug Interaction`,
            message: `${interaction.drug1.name} + ${interaction.drug2.name}: ${interaction.effect}`,
            recommendation: interaction.management || 'Immediate clinical review required',
            evidence: (interaction.clinicalContext?.evidenceLevel) || interaction.evidenceLevel || 'B',
            actionRequired: true,
            timeframe: interaction.severity === 'critical' ? 'immediate' : 'within_24h'
          });
        }
      }
    }

    // Contraindication alerts
    for (const contraindication of analysis.contraindicationAnalysis) {
      if (contraindication.severity === 'absolute') {
        alerts.push({
          type: 'contraindication',
          severity: 'critical',
          priority: 1,
          title: 'Absolute Contraindication',
          message: `${contraindication.drug.name} is contraindicated in ${contraindication.condition}`,
          recommendation: 'Do not prescribe - consider alternative therapy',
          actionRequired: true,
          timeframe: 'immediate'
        });
      }
    }

    // Pharmacogenomic alerts
    for (const pgxAnalysis of analysis.pharmacogenomicAnalysis) {
      if (pgxAnalysis.actionability === 'high') {
        alerts.push({
          type: 'pharmacogenomic',
          severity: pgxAnalysis.severity || 'moderate',
          priority: 3,
          title: 'Pharmacogenomic Consideration',
          message: `Patient is a ${pgxAnalysis.phenotype} for ${pgxAnalysis.gene}`,
          recommendation: pgxAnalysis.recommendation,
          evidence: 'A',
          actionRequired: true,
          timeframe: 'before_dispensing'
        });
      }
    }

    // Dose appropriateness alerts
    for (const doseAnalysis of analysis.doseAppropriatenessAnalysis) {
      if (doseAnalysis.appropriateness === 'inappropriate' || doseAnalysis.appropriateness === 'excessive') {
        alerts.push({
          type: 'dose_inappropriate',
          severity: doseAnalysis.appropriateness === 'excessive' ? 'major' : 'moderate',
          priority: doseAnalysis.appropriateness === 'excessive' ? 2 : 3,
          title: 'Dose Appropriateness Concern',
          message: doseAnalysis.reason,
          recommendation: doseAnalysis.recommendedDose,
          actionRequired: true,
          timeframe: 'before_dispensing'
        });
      }
    }

    return alerts.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate clinical recommendations
   */
  async generateRecommendations(analysis, patientContext) {
    const recommendations = [];

    // Monitoring recommendations
    recommendations.push({
      category: 'monitoring',
      type: 'laboratory',
      title: 'Baseline and Ongoing Laboratory Monitoring',
      description: 'Recommended laboratory tests based on prescribed medications',
      items: await this.getConsolidatedMonitoringPlan(analysis, patientContext),
      evidence: 'A',
      implementation: 'standard_of_care'
    });

    // Patient education recommendations
    recommendations.push({
      category: 'patient_education',
      type: 'counseling',
      title: 'Patient Education Points',
      description: 'Key counseling points for patient safety and efficacy',
      items: await this.getPatientEducationPoints(analysis.drugAnalysis),
      evidence: 'B',
      implementation: 'pharmacist_counseling'
    });

    // Supportive care recommendations
    const supportiveCare = await this.getSupportiveCareRecommendations(analysis, patientContext);
    if (supportiveCare.length > 0) {
      recommendations.push({
        category: 'supportive_care',
        type: 'prophylaxis',
        title: 'Supportive Care Measures',
        description: 'Recommended supportive medications and interventions',
        items: supportiveCare,
        evidence: 'B',
        implementation: 'clinical_protocols'
      });
    }

    return recommendations;
  }

  /**
   * Suggest alternative therapy options
   */
  async suggestAlternatives(prescriptionData, patientContext) {
    const alternatives = [];

    for (const medication of prescriptionData.medications) {
      const drugAlternatives = await this.findAlternativeDrugs(medication, patientContext);
      if (drugAlternatives.length > 0) {
        alternatives.push({
          originalDrug: medication,
          alternatives: drugAlternatives,
          rationale: await this.getAlternativeRationale(medication, patientContext)
        });
      }
    }

    return alternatives;
  }

  /**
   * Calculate overall risk score
   */
  async calculateOverallRisk(analysis, patientContext) {
    let riskScore = 0.1; // Base risk
    const riskFactors = [];

    // Risk from interactions
    if (analysis.interactionAnalysis?.riskAnalysis) {
      const interactionRisk = analysis.interactionAnalysis.riskAnalysis.adjustedRisk / 100;
      riskScore += interactionRisk * 0.4; // 40% weight
      riskFactors.push({
        factor: 'Drug interactions',
        contribution: interactionRisk * 0.4,
        details: `${analysis.interactionAnalysis.interactions.length} interactions identified`
      });
    }

    // Risk from contraindications
    const contraindicationRisk = analysis.contraindicationAnalysis
      .filter(c => c.severity === 'absolute').length * 0.3;
    if (contraindicationRisk > 0) {
      riskScore += contraindicationRisk;
      riskFactors.push({
        factor: 'Contraindications',
        contribution: contraindicationRisk,
        details: 'Absolute contraindications present'
      });
    }

    // Risk from dose inappropriateness
    const doseRisk = analysis.doseAppropriatenessAnalysis
      .filter(d => d.appropriateness === 'excessive').length * 0.2;
    if (doseRisk > 0) {
      riskScore += doseRisk;
      riskFactors.push({
        factor: 'Dose inappropriateness',
        contribution: doseRisk,
        details: 'Potentially excessive dosing identified'
      });
    }

    // Risk from patient factors
    const patientRisk = await this.calculatePatientRisk(patientContext);
    riskScore += patientRisk * 0.1; // 10% weight

    return {
      overallScore: Math.min(riskScore, 1.0),
      category: this.categorizeRisk(riskScore),
      riskFactors,
      confidence: this.calculateConfidence(analysis, patientContext),
      recommendations: this.getRiskMitigationStrategies(riskScore, riskFactors)
    };
  }

  // Helper methods
  findDrugData(drug) {
    const rxcui = drug.rxcui || drug.id;
    const name = (drug.name || drug.generic_name || '').toLowerCase();
    
    // Search by RXCUI first, then by name
    for (const [key, drugData] of Object.entries(oncologyDrugs)) {
      if (drugData.rxcui === rxcui || drugData.name.toLowerCase() === name) {
        return drugData;
      }
    }
    
    return null;
  }

  categorizeRisk(score) {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'moderate';
    return 'low';
  }

  generateExecutiveSummary(alerts, recommendations, riskScore) {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const majorAlerts = alerts.filter(a => a.severity === 'major').length;
    
    return {
      overallRisk: riskScore.category,
      totalAlerts: alerts.length,
      criticalAlerts,
      majorAlerts,
      actionRequired: criticalAlerts > 0 || majorAlerts > 0,
      summary: `Overall risk: ${riskScore.category}. ${alerts.length} alerts generated (${criticalAlerts} critical, ${majorAlerts} major). ${recommendations.length} recommendations provided.`,
      nextSteps: this.getNextSteps(alerts, riskScore)
    };
  }

  getNextSteps(alerts, riskScore) {
    const steps = [];
    
    if (alerts.some(a => a.severity === 'critical')) {
      steps.push('IMMEDIATE: Address critical alerts before prescribing');
    }
    
    if (alerts.some(a => a.severity === 'major')) {
      steps.push('HIGH PRIORITY: Review major alerts and consider modifications');
    }
    
    if (riskScore.category === 'high' || riskScore.category === 'critical') {
      steps.push('ENHANCED MONITORING: Implement intensive monitoring protocol');
    }
    
    steps.push('PATIENT COUNSELING: Provide comprehensive patient education');
    steps.push('FOLLOW-UP: Schedule appropriate follow-up based on risk level');
    
    return steps;
  }

  // Placeholder methods for future implementation
  async assessDrugAppropriateness(drug, drugData, context) { return 'appropriate'; }
  async assessDoseAppropriateness(drug, drugData, context) { return 'appropriate'; }
  async checkDrugContraindications(drug, drugData, context) { return []; }
  async identifyPrecautions(drug, drugData, context) { return []; }
  async getDrugMonitoringRequirements(drug, drugData, context) { return []; }
  async checkContraindications(medications, context) { return []; }
  async analyzeDoseAppropriateness(medications, context) { return []; }
  async analyzePharmacogenomics(medications, genetics) { return []; }
  async createMonitoringRequirements(analysis, context) { return {}; }
  async getConsolidatedMonitoringPlan(analysis, context) { return []; }
  async getPatientEducationPoints(drugAnalysis) { return []; }
  async getSupportiveCareRecommendations(analysis, context) { return []; }
  async findAlternativeDrugs(medication, context) { return []; }
  async getAlternativeRationale(medication, context) { return 'Consider alternatives based on patient factors'; }
  async calculatePatientRisk(context) { return 0.1; }
  calculateConfidence(analysis, context) { return 0.85; }
  getRiskMitigationStrategies(score, factors) { return ['Enhanced monitoring', 'Dose optimization']; }
}

export default new ClinicalDecisionSupport();
