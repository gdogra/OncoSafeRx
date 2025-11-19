/**
 * AI-Powered Clinical Recommendation Engine
 * Provides intelligent drug interaction analysis, alternative suggestions, and clinical decision support
 */

import { KNOWN_INTERACTIONS } from '../data/knownInteractions.js';
import rxnormService from './rxnormService.js';

class AIRecommendationEngine {
  constructor() {
    // ML model endpoints and configuration
    this.mlEndpoints = {
      interactionPrediction: process.env.ML_INTERACTION_ENDPOINT || '/api/ml/interaction-predict',
      severityClassifier: process.env.ML_SEVERITY_ENDPOINT || '/api/ml/severity-classify',
      alternativeSuggester: process.env.ML_ALTERNATIVES_ENDPOINT || '/api/ml/suggest-alternatives'
    };
    
    // Risk scoring weights for different factors
    this.riskWeights = {
      age: { '>65': 1.5, '>75': 2.0, '>85': 2.5 },
      renal: { 'mild': 1.2, 'moderate': 1.8, 'severe': 3.0 },
      hepatic: { 'mild': 1.3, 'moderate': 2.0, 'severe': 3.5 },
      pregnancy: { 'yes': 2.0 },
      polypharmacy: { '>5': 1.3, '>10': 1.8, '>15': 2.2 }
    };
    
    // Drug categories with special monitoring requirements
    this.specialCategories = {
      anticoagulants: ['warfarin', 'dabigatran', 'rivaroxaban', 'apixaban'],
      opioids: ['morphine', 'oxycodone', 'fentanyl', 'tramadol', 'codeine'],
      chemotherapy: ['methotrexate', 'cisplatin', 'doxorubicin', 'paclitaxel'],
      immunosuppressants: ['tacrolimus', 'cyclosporine', 'mycophenolate'],
      antiarrhythmics: ['amiodarone', 'quinidine', 'procainamide'],
      qtProlonging: ['ondansetron', 'haloperidol', 'methadone']
    };
  }

  /**
   * Generate comprehensive interaction analysis with AI insights
   */
  async analyzeInteractions(drugList, patientContext = {}) {
    try {
      const startTime = Date.now();
      
      // Phase 1: Known interactions check
      const knownInteractions = this.checkKnownInteractions(drugList);
      
      // Phase 2: ML-based interaction prediction
      const predictedInteractions = await this.predictInteractions(drugList, patientContext);
      
      // Phase 3: Risk stratification
      const riskAssessment = this.calculateRiskScore(drugList, patientContext, [...knownInteractions, ...predictedInteractions]);
      
      // Phase 4: Alternative suggestions
      const alternatives = await this.suggestAlternatives(drugList, knownInteractions, patientContext);
      
      // Phase 5: Clinical recommendations
      const recommendations = this.generateClinicalRecommendations(drugList, knownInteractions, patientContext, riskAssessment);
      
      return {
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
        drugList,
        patientContext,
        analysis: {
          knownInteractions,
          predictedInteractions,
          riskAssessment,
          alternatives,
          recommendations
        },
        summary: this.generateSummary(knownInteractions, predictedInteractions, riskAssessment)
      };
      
    } catch (error) {
      console.error('AI recommendation engine error:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Check for known curated interactions
   */
  checkKnownInteractions(drugList) {
    const interactions = [];
    const normalizedDrugs = drugList.map(drug => drug.toLowerCase());
    
    for (let i = 0; i < normalizedDrugs.length; i++) {
      for (let j = i + 1; j < normalizedDrugs.length; j++) {
        const drug1 = normalizedDrugs[i];
        const drug2 = normalizedDrugs[j];
        
        const interaction = KNOWN_INTERACTIONS.find(int => 
          (int.drugs.includes(drug1) && int.drugs.includes(drug2)) ||
          int.drugs.some(d => drug1.includes(d) || d.includes(drug1)) &&
          int.drugs.some(d => drug2.includes(d) || d.includes(drug2))
        );
        
        if (interaction) {
          interactions.push({
            ...interaction,
            drugPair: [drug1, drug2],
            type: 'known',
            confidence: 0.95
          });
        }
      }
    }
    
    return interactions;
  }

  /**
   * Use ML models to predict potential interactions
   */
  async predictInteractions(drugList, patientContext) {
    // For now, implement rule-based prediction with ML placeholders
    // In production, this would call actual ML models
    
    const predictedInteractions = [];
    
    // Simulate ML prediction based on drug categories and mechanisms
    for (let i = 0; i < drugList.length; i++) {
      for (let j = i + 1; j < drugList.length; j++) {
        const drug1 = drugList[i].toLowerCase();
        const drug2 = drugList[j].toLowerCase();
        
        // Check for category-based interactions
        const categoryInteraction = this.predictCategoryInteraction(drug1, drug2, patientContext);
        if (categoryInteraction) {
          predictedInteractions.push(categoryInteraction);
        }
        
        // Check for mechanism-based interactions
        const mechanismInteraction = await this.predictMechanismInteraction(drug1, drug2);
        if (mechanismInteraction) {
          predictedInteractions.push(mechanismInteraction);
        }
      }
    }
    
    return predictedInteractions;
  }

  /**
   * Predict interactions based on drug categories
   */
  predictCategoryInteraction(drug1, drug2, patientContext) {
    // QT prolonging drugs combination
    const qtDrugs = this.specialCategories.qtProlonging;
    if (qtDrugs.some(d => drug1.includes(d)) && qtDrugs.some(d => drug2.includes(d))) {
      return {
        drugs: [drug1, drug2],
        drugPair: [drug1, drug2],
        severity: 'major',
        mechanism: 'Additive QT prolongation',
        effect: 'Torsades de pointes risk',
        management: 'Monitor ECG and electrolytes; consider alternatives',
        evidence_level: 'B',
        type: 'predicted',
        confidence: 0.85,
        sources: ['ML Category Analysis'],
        riskFactors: patientContext.age > 65 ? ['Advanced age'] : []
      };
    }

    // Opioid + CNS depressant
    const opioids = this.specialCategories.opioids;
    const cnsDepressants = ['benzodiazepine', 'alcohol', 'barbiturate', 'muscle relaxant'];
    
    if (opioids.some(d => drug1.includes(d)) && cnsDepressants.some(d => drug2.includes(d))) {
      return {
        drugs: [drug1, drug2],
        drugPair: [drug1, drug2],
        severity: 'major',
        mechanism: 'Additive CNS and respiratory depression',
        effect: 'Respiratory depression and death risk',
        management: 'Avoid combination; consider naloxone availability',
        evidence_level: 'A',
        type: 'predicted',
        confidence: 0.92,
        sources: ['ML Category Analysis', 'CDC Guidelines'],
        riskFactors: ['High mortality risk']
      };
    }

    return null;
  }

  /**
   * Predict mechanism-based interactions using drug properties
   */
  async predictMechanismInteraction(drug1, drug2) {
    // This would typically call ML models trained on drug mechanisms
    // For now, implement rule-based prediction
    
    const cyp3a4Inhibitors = ['ketoconazole', 'clarithromycin', 'grapefruit'];
    const cyp3a4Substrates = ['simvastatin', 'atorvastatin', 'midazolam', 'cyclosporine'];
    
    if (cyp3a4Inhibitors.some(d => drug1.includes(d)) && 
        cyp3a4Substrates.some(d => drug2.includes(d))) {
      return {
        drugs: [drug1, drug2],
        drugPair: [drug1, drug2],
        severity: 'moderate',
        mechanism: 'CYP3A4 inhibition increases substrate exposure',
        effect: 'Increased toxicity risk of substrate drug',
        management: 'Monitor for toxicity; consider dose reduction',
        evidence_level: 'B',
        type: 'predicted',
        confidence: 0.78,
        sources: ['ML Mechanism Analysis'],
        riskFactors: ['Pharmacokinetic interaction']
      };
    }

    return null;
  }

  /**
   * Calculate comprehensive risk score
   */
  calculateRiskScore(drugList, patientContext, interactions) {
    let baseRisk = 1.0;
    const riskFactors = [];

    // Age factor
    if (patientContext.age > 85) {
      baseRisk *= this.riskWeights.age['>85'];
      riskFactors.push('Advanced age (>85)');
    } else if (patientContext.age > 75) {
      baseRisk *= this.riskWeights.age['>75'];
      riskFactors.push('Advanced age (>75)');
    } else if (patientContext.age > 65) {
      baseRisk *= this.riskWeights.age['>65'];
      riskFactors.push('Elderly (>65)');
    }

    // Organ function
    if (patientContext.renalFunction === 'severe') {
      baseRisk *= this.riskWeights.renal.severe;
      riskFactors.push('Severe renal impairment');
    } else if (patientContext.renalFunction === 'moderate') {
      baseRisk *= this.riskWeights.renal.moderate;
      riskFactors.push('Moderate renal impairment');
    }

    if (patientContext.hepaticFunction === 'severe') {
      baseRisk *= this.riskWeights.hepatic.severe;
      riskFactors.push('Severe hepatic impairment');
    } else if (patientContext.hepaticFunction === 'moderate') {
      baseRisk *= this.riskWeights.hepatic.moderate;
      riskFactors.push('Moderate hepatic impairment');
    }

    // Polypharmacy
    if (drugList.length > 15) {
      baseRisk *= this.riskWeights.polypharmacy['>15'];
      riskFactors.push('Extreme polypharmacy (>15 drugs)');
    } else if (drugList.length > 10) {
      baseRisk *= this.riskWeights.polypharmacy['>10'];
      riskFactors.push('High polypharmacy (>10 drugs)');
    } else if (drugList.length > 5) {
      baseRisk *= this.riskWeights.polypharmacy['>5'];
      riskFactors.push('Polypharmacy (>5 drugs)');
    }

    // Interaction severity multiplier
    const majorInteractions = interactions.filter(i => i.severity === 'major').length;
    const moderateInteractions = interactions.filter(i => i.severity === 'moderate').length;
    
    baseRisk *= (1 + (majorInteractions * 0.5) + (moderateInteractions * 0.2));

    // Categorize risk level
    let riskLevel = 'low';
    let riskColor = 'green';
    
    if (baseRisk >= 3.0) {
      riskLevel = 'critical';
      riskColor = 'red';
    } else if (baseRisk >= 2.0) {
      riskLevel = 'high';
      riskColor = 'orange';
    } else if (baseRisk >= 1.5) {
      riskLevel = 'moderate';
      riskColor = 'yellow';
    }

    return {
      score: Math.round(baseRisk * 100) / 100,
      level: riskLevel,
      color: riskColor,
      factors: riskFactors,
      interactions: {
        major: majorInteractions,
        moderate: moderateInteractions,
        total: interactions.length
      },
      recommendations: this.getRiskMitigationStrategies(riskLevel, riskFactors)
    };
  }

  /**
   * Suggest safer drug alternatives
   */
  async suggestAlternatives(drugList, interactions, patientContext) {
    const alternatives = [];

    for (const interaction of interactions) {
      if (interaction.severity === 'major' || interaction.severity === 'moderate') {
        // Find alternatives for each drug in the interaction
        for (const drug of interaction.drugPair) {
          const drugAlternatives = await this.findDrugAlternatives(drug, patientContext);
          if (drugAlternatives.length > 0) {
            alternatives.push({
              originalDrug: drug,
              interaction: interaction,
              alternatives: drugAlternatives,
              reasoning: `Safer alternatives to avoid ${interaction.severity} interaction with ${interaction.drugPair.find(d => d !== drug)}`
            });
          }
        }
      }
    }

    return alternatives;
  }

  /**
   * Find therapeutic alternatives for a drug
   */
  async findDrugAlternatives(drugName, patientContext) {
    // This would typically query a comprehensive drug database
    // For now, implement common clinical alternatives
    
    const alternatives = {
      'warfarin': [
        { name: 'apixaban', rationale: 'DOAC with fewer interactions', monitoring: 'No INR required' },
        { name: 'rivaroxaban', rationale: 'DOAC alternative', monitoring: 'Renal function monitoring' }
      ],
      'omeprazole': [
        { name: 'pantoprazole', rationale: 'Minimal CYP2C19 inhibition', monitoring: 'Standard PPI monitoring' },
        { name: 'famotidine', rationale: 'H2 blocker alternative', monitoring: 'Less potent but safer' }
      ],
      'paroxetine': [
        { name: 'sertraline', rationale: 'Weaker CYP2D6 inhibition', monitoring: 'Monitor for efficacy' },
        { name: 'venlafaxine', rationale: 'SNRI with minimal CYP interactions', monitoring: 'Blood pressure monitoring' }
      ],
      'ketoconazole': [
        { name: 'fluconazole', rationale: 'Less potent CYP3A4 inhibition', monitoring: 'Liver function tests' },
        { name: 'terbinafine', rationale: 'Different mechanism of action', monitoring: 'For appropriate infections only' }
      ]
    };

    const drugAlts = alternatives[drugName.toLowerCase()] || [];
    
    // Filter based on patient context
    return drugAlts.filter(alt => {
      // Add patient-specific filtering logic here
      if (patientContext.allergies && patientContext.allergies.includes(alt.name)) {
        return false;
      }
      
      if (patientContext.renalFunction === 'severe' && alt.name.includes('rivaroxaban')) {
        return false; // Avoid in severe renal impairment
      }
      
      return true;
    });
  }

  /**
   * Generate clinical recommendations
   */
  generateClinicalRecommendations(drugList, interactions, patientContext, riskAssessment) {
    const recommendations = [];

    // High priority safety recommendations
    if (riskAssessment.level === 'critical' || riskAssessment.level === 'high') {
      recommendations.push({
        priority: 'urgent',
        type: 'safety',
        title: 'Immediate Review Required',
        description: 'High-risk drug combination detected. Immediate clinical review recommended.',
        action: 'Review all medications and consider alternatives',
        monitoring: 'Enhanced monitoring protocols'
      });
    }

    // Interaction-specific recommendations
    for (const interaction of interactions) {
      if (interaction.severity === 'major') {
        recommendations.push({
          priority: 'high',
          type: 'interaction',
          title: `Major Interaction: ${interaction.drugPair.join(' + ')}`,
          description: interaction.effect,
          action: interaction.management,
          monitoring: this.getMonitoringRecommendations(interaction)
        });
      }
    }

    // Patient-specific recommendations
    if (patientContext.age > 75) {
      recommendations.push({
        priority: 'medium',
        type: 'geriatric',
        title: 'Geriatric Considerations',
        description: 'Enhanced sensitivity to drug effects in elderly patients',
        action: 'Consider lower starting doses and slower titration',
        monitoring: 'Increased monitoring frequency'
      });
    }

    // Polypharmacy recommendations
    if (drugList.length > 10) {
      recommendations.push({
        priority: 'medium',
        type: 'polypharmacy',
        title: 'Medication Reconciliation',
        description: 'High number of medications increases interaction risk',
        action: 'Review necessity of each medication; consider deprescribing',
        monitoring: 'Regular medication review'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get monitoring recommendations for specific interactions
   */
  getMonitoringRecommendations(interaction) {
    const monitoring = [];

    if (interaction.mechanism.includes('CYP')) {
      monitoring.push('Monitor for signs of toxicity');
      monitoring.push('Consider therapeutic drug monitoring if available');
    }

    if (interaction.mechanism.includes('QT')) {
      monitoring.push('ECG monitoring');
      monitoring.push('Electrolyte monitoring (K+, Mg2+)');
    }

    if (interaction.mechanism.includes('bleeding') || interaction.effect.includes('bleeding')) {
      monitoring.push('CBC with attention to platelet count');
      monitoring.push('PT/INR monitoring');
      monitoring.push('Monitor for signs of bleeding');
    }

    if (interaction.mechanism.includes('renal') || interaction.mechanism.includes('nephrotoxicity')) {
      monitoring.push('Serum creatinine and BUN');
      monitoring.push('Urine output monitoring');
    }

    return monitoring;
  }

  /**
   * Get risk mitigation strategies
   */
  getRiskMitigationStrategies(riskLevel, riskFactors) {
    const strategies = [];

    if (riskLevel === 'critical') {
      strategies.push('Emergency medication review required');
      strategies.push('Consider hospitalization for medication optimization');
      strategies.push('Pharmacist consultation mandatory');
    } else if (riskLevel === 'high') {
      strategies.push('Urgent clinical review within 24 hours');
      strategies.push('Enhanced monitoring protocols');
      strategies.push('Patient/caregiver education on warning signs');
    } else if (riskLevel === 'moderate') {
      strategies.push('Clinical review within 1 week');
      strategies.push('Standard monitoring with increased vigilance');
      strategies.push('Consider medication alternatives');
    }

    // Factor-specific strategies
    if (riskFactors.includes('Polypharmacy')) {
      strategies.push('Medication reconciliation and deprescribing review');
    }

    if (riskFactors.some(f => f.includes('renal'))) {
      strategies.push('Dose adjustment for renal function');
      strategies.push('Avoid nephrotoxic combinations');
    }

    return strategies;
  }

  /**
   * Generate analysis summary
   */
  generateSummary(knownInteractions, predictedInteractions, riskAssessment) {
    const totalInteractions = knownInteractions.length + predictedInteractions.length;
    const majorInteractions = [...knownInteractions, ...predictedInteractions]
      .filter(i => i.severity === 'major').length;

    return {
      interactionCount: totalInteractions,
      majorInteractionCount: majorInteractions,
      riskLevel: riskAssessment.level,
      riskScore: riskAssessment.score,
      keyFindings: this.extractKeyFindings(knownInteractions, predictedInteractions, riskAssessment),
      urgentActions: totalInteractions > 0 ? 
        ['Review medication list', 'Consider alternatives', 'Enhance monitoring'] : 
        ['Continue current regimen', 'Routine monitoring sufficient']
    };
  }

  /**
   * Extract key clinical findings
   */
  extractKeyFindings(knownInteractions, predictedInteractions, riskAssessment) {
    const findings = [];

    if (riskAssessment.level === 'critical') {
      findings.push('🚨 Critical drug interaction risk detected');
    }

    const majorKnown = knownInteractions.filter(i => i.severity === 'major');
    if (majorKnown.length > 0) {
      findings.push(`⚠️ ${majorKnown.length} major known interaction(s)`);
    }

    const majorPredicted = predictedInteractions.filter(i => i.severity === 'major');
    if (majorPredicted.length > 0) {
      findings.push(`🤖 ${majorPredicted.length} AI-predicted major interaction(s)`);
    }

    if (riskAssessment.factors.length > 3) {
      findings.push(`📊 Multiple risk factors present (${riskAssessment.factors.length})`);
    }

    if (findings.length === 0) {
      findings.push('✅ No major interactions detected');
    }

    return findings;
  }

  /**
   * Real-time interaction monitoring (for WebSocket integration)
   */
  async monitorInteractionsRealTime(sessionId, drugList, callback) {
    // This would integrate with WebSocket for real-time alerts
    const analysis = await this.analyzeInteractions(drugList);
    
    if (analysis.analysis.riskAssessment.level === 'critical') {
      callback({
        type: 'critical_alert',
        sessionId,
        alert: {
          message: 'Critical drug interaction detected!',
          data: analysis,
          timestamp: new Date().toISOString()
        }
      });
    }

    return analysis;
  }
}

export default new AIRecommendationEngine();