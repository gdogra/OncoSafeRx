import supabaseService from '../config/supabase.js';
import { randomUUID } from 'crypto';

export class EnhancedInteractionEngine {
  constructor() {
    this.enabled = supabaseService.enabled;
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 30; // 30 minutes
  }

  /**
   * Enhanced drug-drug interaction analysis with clinical context
   */
  async analyzeInteractions(medications, patientContext = {}) {
    try {
      const analysisId = randomUUID();
      const timestamp = new Date().toISOString();

      // Get basic interactions
      const basicInteractions = await this.getBasicInteractions(medications);
      
      // Enhance with clinical context
      const enhancedInteractions = await this.enhanceWithClinicalContext(
        basicInteractions, 
        patientContext
      );

      // Calculate risk scores
      const riskAnalysis = await this.calculateRiskScores(
        enhancedInteractions, 
        patientContext
      );

      // Generate clinical recommendations
      const recommendations = await this.generateRecommendations(
        enhancedInteractions, 
        riskAnalysis, 
        patientContext
      );

      // Create monitoring plan
      const monitoringPlan = await this.createMonitoringPlan(
        enhancedInteractions,
        patientContext
      );

      return {
        analysisId,
        timestamp,
        medications,
        patientContext: this.sanitizePatientContext(patientContext),
        interactions: enhancedInteractions,
        riskAnalysis,
        recommendations,
        monitoringPlan,
        summary: this.generateSummary(enhancedInteractions, riskAnalysis)
      };

    } catch (error) {
      console.error('Error in enhanced interaction analysis:', error);
      throw new Error('Failed to analyze drug interactions');
    }
  }

  /**
   * Get basic drug-drug interactions from database
   */
  async getBasicInteractions(medications) {
    if (medications.length < 2) return [];

    const interactions = [];
    const drugPairs = this.generateDrugPairs(medications);

    for (const pair of drugPairs) {
      const interaction = await this.findInteraction(pair.drug1, pair.drug2);
      if (interaction) {
        interactions.push({
          ...interaction,
          drug1: pair.drug1,
          drug2: pair.drug2,
          id: randomUUID()
        });
      }
    }

    return interactions;
  }

  /**
   * Enhance interactions with clinical context
   */
  async enhanceWithClinicalContext(interactions, patientContext) {
    const enhanced = [];

    for (const interaction of interactions) {
      const enhancedInteraction = {
        ...interaction,
        clinicalContext: {
          patientSpecific: await this.getPatientSpecificFactors(interaction, patientContext),
          mechanism: await this.getInteractionMechanism(interaction),
          kinetics: await this.getKinetics(interaction, patientContext),
          evidenceLevel: await this.getEvidenceLevel(interaction),
          prevalence: await this.getPrevalence(interaction)
        },
        severity: await this.calculateContextualSeverity(interaction, patientContext)
      };

      enhanced.push(enhancedInteraction);
    }

    return enhanced;
  }

  /**
   * Calculate comprehensive risk scores
   */
  async calculateRiskScores(interactions, patientContext) {
    const { age, weight, sex, comorbidities = [], genetics = {}, kidneyFunction, liverFunction } = patientContext;

    let baseRisk = 0;
    let adjustedRisk = 0;
    const riskFactors = [];
    const protectiveFactors = [];

    // Base risk from interactions
    for (const interaction of interactions) {
      const severity = this.mapSeverityToScore(interaction.severity);
      baseRisk += severity;
    }

    adjustedRisk = baseRisk;

    // Age-based risk adjustment
    if (age >= 65) {
      const ageMultiplier = 1.2 + (Math.max(0, age - 65) * 0.02);
      adjustedRisk *= ageMultiplier;
      riskFactors.push({
        factor: 'Advanced age',
        impact: 'Increased drug sensitivity and metabolism changes',
        multiplier: ageMultiplier,
        evidence: 'Beers Criteria 2023, Age-related pharmacokinetic changes'
      });
    }

    // Organ function adjustments
    if (kidneyFunction && kidneyFunction < 60) {
      const renalMultiplier = 1.15;
      adjustedRisk *= renalMultiplier;
      riskFactors.push({
        factor: 'Reduced kidney function',
        impact: 'Decreased drug clearance, increased exposure',
        multiplier: renalMultiplier,
        evidence: 'KDIGO guidelines'
      });
    }

    if (liverFunction && liverFunction < 80) {
      const hepaticMultiplier = 1.25;
      adjustedRisk *= hepaticMultiplier;
      riskFactors.push({
        factor: 'Hepatic impairment',
        impact: 'Altered drug metabolism',
        multiplier: hepaticMultiplier,
        evidence: 'Child-Pugh classification'
      });
    }

    // Genetic factors
    if (genetics.cyp2d6_phenotype === 'poor_metabolizer') {
      adjustedRisk *= 1.3;
      riskFactors.push({
        factor: 'CYP2D6 poor metabolizer',
        impact: 'Reduced metabolism of CYP2D6 substrates',
        multiplier: 1.3,
        evidence: 'CPIC guidelines'
      });
    }

    // Comorbidity burden
    if (comorbidities.length >= 3) {
      adjustedRisk *= 1.1;
      riskFactors.push({
        factor: 'Multiple comorbidities',
        impact: 'Complex drug interactions and physiologic stress',
        multiplier: 1.1,
        evidence: 'Polypharmacy literature'
      });
    }

    return {
      baseRisk: Math.round(baseRisk),
      adjustedRisk: Math.round(Math.min(adjustedRisk, 100)),
      riskCategory: this.categorizeRisk(adjustedRisk),
      riskFactors,
      protectiveFactors,
      confidence: this.calculateConfidence(interactions, patientContext)
    };
  }

  /**
   * Generate clinical recommendations
   */
  async generateRecommendations(interactions, riskAnalysis, patientContext) {
    const recommendations = [];

    // Critical interactions
    const criticalInteractions = interactions.filter(i => i.severity === 'critical' || i.severity === 'major');
    
    for (const interaction of criticalInteractions) {
      recommendations.push({
        type: 'intervention',
        priority: 'critical',
        category: 'drug_modification',
        title: `Address ${interaction.severity} interaction: ${interaction.drug1.name} + ${interaction.drug2.name}`,
        description: await this.getInteractionDescription(interaction),
        actions: await this.getRecommendedActions(interaction, patientContext),
        timeline: 'Immediate',
        evidence: interaction.clinicalContext?.evidenceLevel || 'B',
        monitoring: await this.getRequiredMonitoring(interaction)
      });
    }

    // Dosing adjustments
    if (riskAnalysis.riskCategory === 'high' || riskAnalysis.riskCategory === 'critical') {
      recommendations.push({
        type: 'dose_adjustment',
        priority: 'high',
        category: 'dosing',
        title: 'Consider dose adjustments based on risk factors',
        description: 'Patient has elevated risk factors requiring dose modifications',
        actions: await this.getDoseAdjustmentRecommendations(patientContext),
        timeline: 'Within 24 hours',
        evidence: 'A'
      });
    }

    // Monitoring recommendations
    recommendations.push({
      type: 'monitoring',
      priority: 'moderate',
      category: 'surveillance',
      title: 'Enhanced monitoring protocol',
      description: 'Implement systematic monitoring for drug safety',
      actions: await this.getMonitoringRecommendations(interactions, patientContext),
      timeline: 'Ongoing',
      evidence: 'A'
    });

    return recommendations.sort((a, b) => this.priorityScore(a.priority) - this.priorityScore(b.priority));
  }

  /**
   * Create comprehensive monitoring plan
   */
  async createMonitoringPlan(interactions, patientContext) {
    const plan = {
      baseline: [],
      ongoing: [],
      alerts: [],
      schedule: {}
    };

    // Baseline assessments
    plan.baseline = [
      'Complete blood count (CBC)',
      'Comprehensive metabolic panel (CMP)',
      'Liver function tests (LFTs)',
      'Renal function (creatinine, eGFR)',
      'Vital signs and symptom assessment'
    ];

    // Ongoing monitoring based on interactions
    for (const interaction of interactions) {
      const monitoring = await this.getInteractionMonitoring(interaction);
      plan.ongoing.push(...monitoring);
    }

    // Risk-based alerts
    plan.alerts = [
      {
        parameter: 'Creatinine',
        threshold: '>1.5x baseline',
        action: 'Evaluate for nephrotoxicity, consider dose reduction'
      },
      {
        parameter: 'ALT/AST',
        threshold: '>3x ULN',
        action: 'Hold hepatotoxic drugs, evaluate for drug-induced liver injury'
      },
      {
        parameter: 'Platelet count',
        threshold: '<100,000',
        action: 'Assess for drug-induced thrombocytopenia'
      }
    ];

    // Monitoring schedule
    plan.schedule = {
      immediate: 'Baseline labs and assessment',
      '48hours': 'Follow-up assessment if high-risk interactions',
      '1week': 'First monitoring labs',
      '2weeks': 'Safety assessment',
      'monthly': 'Routine monitoring thereafter'
    };

    return plan;
  }

  // Helper methods
  generateDrugPairs(medications) {
    const pairs = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        pairs.push({ drug1: medications[i], drug2: medications[j] });
      }
    }
    return pairs;
  }

  async findInteraction(drug1, drug2) {
    // In real implementation, this would query the drug interaction database
    // For now, return a mock interaction for common oncology drug combinations
    
    const drugName1 = (drug1.name || drug1.generic_name || '').toLowerCase();
    const drugName2 = (drug2.name || drug2.generic_name || '').toLowerCase();
    
    // Define some common oncology interactions
    const knownInteractions = {
      'warfarin-amiodarone': {
        severity: 'major',
        mechanism: 'CYP2C9 inhibition',
        effect: 'Increased warfarin exposure, bleeding risk',
        management: 'Reduce warfarin dose by 25-50%, monitor INR closely'
      },
      'methotrexate-trimethoprim': {
        severity: 'major',
        mechanism: 'Folate antagonism',
        effect: 'Increased methotrexate toxicity',
        management: 'Avoid combination, use alternative antibiotic'
      }
    };

    const pairKey1 = `${drugName1}-${drugName2}`;
    const pairKey2 = `${drugName2}-${drugName1}`;
    
    return knownInteractions[pairKey1] || knownInteractions[pairKey2] || null;
  }

  mapSeverityToScore(severity) {
    const scores = {
      'critical': 40,
      'major': 25,
      'moderate': 15,
      'minor': 5,
      'unknown': 10
    };
    return scores[severity] || 10;
  }

  categorizeRisk(score) {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  priorityScore(priority) {
    const scores = { 'critical': 1, 'high': 2, 'moderate': 3, 'low': 4 };
    return scores[priority] || 5;
  }

  sanitizePatientContext(context) {
    // Remove sensitive data but keep relevant clinical information
    const { age, sex, weight, comorbidities, genetics } = context;
    return { age, sex, weight, comorbidities, genetics };
  }

  generateSummary(interactions, riskAnalysis) {
    const totalInteractions = interactions.length;
    const criticalCount = interactions.filter(i => i.severity === 'critical').length;
    const majorCount = interactions.filter(i => i.severity === 'major').length;

    return {
      totalInteractions,
      criticalCount,
      majorCount,
      overallRisk: riskAnalysis.riskCategory,
      requiresIntervention: criticalCount > 0 || riskAnalysis.riskCategory === 'critical',
      summary: `${totalInteractions} interactions found (${criticalCount} critical, ${majorCount} major). Overall risk: ${riskAnalysis.riskCategory}.`
    };
  }

  // Placeholder methods for future implementation
  async getPatientSpecificFactors(interaction, context) { return {}; }
  async getInteractionMechanism(interaction) { return interaction.mechanism || 'Unknown'; }
  async getKinetics(interaction, context) { return {}; }
  async getEvidenceLevel(interaction) { return 'B'; }
  async getPrevalence(interaction) { return 'Moderate'; }
  async calculateContextualSeverity(interaction, context) { return interaction.severity; }
  async getInteractionDescription(interaction) { return interaction.effect || 'Significant drug interaction'; }
  async getRecommendedActions(interaction, context) { return [interaction.management || 'Monitor closely']; }
  async getRequiredMonitoring(interaction) { return ['Clinical assessment', 'Laboratory monitoring']; }
  async getDoseAdjustmentRecommendations(context) { return ['Consider dose reduction', 'Increase monitoring frequency']; }
  async getMonitoringRecommendations(interactions, context) { return ['Weekly labs for 4 weeks', 'Symptom assessment']; }
  async getInteractionMonitoring(interaction) { return ['Monitor for signs of increased toxicity']; }
  calculateConfidence(interactions, context) { return Math.min(90, 60 + (interactions.length * 5)); }
}

export default new EnhancedInteractionEngine();