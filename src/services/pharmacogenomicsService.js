import { pharmacogenomics } from '../data/oncologyDrugs.js';
import { randomUUID } from 'crypto';

export class PharmacogenomicsService {
  constructor() {
    this.cpicGuidelines = this.loadCPICGuidelines();
    this.cache = new Map();
  }

  /**
   * Comprehensive pharmacogenomic analysis for drug therapy optimization
   */
  async analyzePharmacogenomics(medications, patientGenetics, patientContext = {}) {
    try {
      const analysisId = randomUUID();
      const timestamp = new Date().toISOString();

      const analysis = {
        analysisId,
        timestamp,
        overallRecommendations: [],
        drugSpecificAnalyses: [],
        geneticProfile: this.createGeneticProfile(patientGenetics),
        riskAssessment: {},
        monitoringRecommendations: [],
        educationalPoints: []
      };

      // Analyze each medication
      for (const medication of medications) {
        const drugAnalysis = await this.analyzeDrugGenetics(medication, patientGenetics, patientContext);
        analysis.drugSpecificAnalyses.push(drugAnalysis);
      }

      // Generate overall recommendations
      analysis.overallRecommendations = await this.generateOverallRecommendations(
        analysis.drugSpecificAnalyses,
        patientGenetics
      );

      // Risk assessment
      analysis.riskAssessment = await this.assessPharmacogenomicRisk(
        analysis.drugSpecificAnalyses,
        patientGenetics
      );

      // Monitoring recommendations
      analysis.monitoringRecommendations = await this.generateMonitoringRecommendations(
        analysis.drugSpecificAnalyses
      );

      // Patient education
      analysis.educationalPoints = await this.generateEducationalPoints(
        analysis.drugSpecificAnalyses,
        patientGenetics
      );

      return analysis;

    } catch (error) {
      console.error('Error in pharmacogenomic analysis:', error);
      throw new Error('Failed to analyze pharmacogenomics');
    }
  }

  /**
   * Analyze drug-specific genetic implications
   */
  async analyzeDrugGenetics(medication, patientGenetics, patientContext) {
    const drugName = (medication.name || medication.generic_name || '').toLowerCase();
    const analysis = {
      medication,
      relevantGenes: [],
      phenotypePredictions: [],
      clinicalImplications: [],
      doseRecommendations: [],
      efficacyPredictions: [],
      toxicityRisk: {},
      evidence: {},
      actionability: 'none'
    };

    // Check each genetic variant for relevance to this drug
    for (const [gene, variants] of Object.entries(patientGenetics)) {
      const relevance = await this.assessGeneRelevance(gene, drugName);
      if (relevance.isRelevant) {
        analysis.relevantGenes.push({
          gene,
          variants,
          relevance: relevance.significance,
          phenotype: await this.predictPhenotype(gene, variants),
          clinicalImpact: await this.assessClinicalImpact(gene, drugName, variants)
        });
      }
    }

    // Generate specific recommendations for this drug
    if (analysis.relevantGenes.length > 0) {
      analysis.doseRecommendations = await this.generateDoseRecommendations(
        drugName, 
        analysis.relevantGenes, 
        patientContext
      );
      
      analysis.efficacyPredictions = await this.predictEfficacy(
        drugName, 
        analysis.relevantGenes
      );
      
      analysis.toxicityRisk = await this.assessToxicityRisk(
        drugName, 
        analysis.relevantGenes
      );

      analysis.actionability = this.determineActionability(analysis);
    }

    return analysis;
  }

  /**
   * Create patient's genetic profile summary
   */
  createGeneticProfile(patientGenetics) {
    const profile = {
      genesAnalyzed: Object.keys(patientGenetics),
      phenotypePredictions: {},
      clinicallyActionable: [],
      incidentalFindings: []
    };

    for (const [gene, variants] of Object.entries(patientGenetics)) {
      const phenotype = this.predictPhenotype(gene, variants);
      profile.phenotypePredictions[gene] = phenotype;

      if (this.isClinicalllyActionable(gene, phenotype)) {
        profile.clinicallyActionable.push({
          gene,
          phenotype,
          clinicalSignificance: this.getClinicalSignificance(gene, phenotype)
        });
      }
    }

    return profile;
  }

  /**
   * Predict metabolizer phenotype from genotype
   */
  predictPhenotype(gene, variants) {
    // Simplified phenotype prediction logic
    // In reality, this would use complex algorithms and star allele definitions
    
    const phenotypePredictions = {
      CYP2D6: this.predictCYP2D6Phenotype(variants),
      CYP2C19: this.predictCYP2C19Phenotype(variants),
      CYP2C9: this.predictCYP2C9Phenotype(variants),
      DPYD: this.predictDPYDPhenotype(variants),
      UGT1A1: this.predictUGT1A1Phenotype(variants),
      TPMT: this.predictTPMTPhenotype(variants),
      SLCO1B1: this.predictSLCO1B1Phenotype(variants)
    };

    return phenotypePredictions[gene] || { phenotype: 'unknown', confidence: 'low' };
  }

  /**
   * CYP2D6 phenotype prediction
   */
  predictCYP2D6Phenotype(variants) {
    // Common CYP2D6 variants and their functional impact
    const functionalVariants = {
      '*1': 1.0,  // Normal function
      '*2': 1.0,  // Normal function
      '*3': 0.0,  // No function
      '*4': 0.0,  // No function
      '*5': 0.0,  // Deletion - no function
      '*6': 0.0,  // No function
      '*9': 0.25, // Decreased function
      '*10': 0.25, // Decreased function
      '*17': 0.25, // Decreased function
      '*41': 0.25, // Decreased function
      'xN': 2.0   // Gene duplication
    };

    let activityScore = 0;
    const variantList = Array.isArray(variants) ? variants : [variants];

    for (const variant of variantList) {
      activityScore += functionalVariants[variant] || 0.5; // Default to intermediate
    }

    let phenotype, confidence;
    if (activityScore === 0) {
      phenotype = 'poor_metabolizer';
      confidence = 'high';
    } else if (activityScore > 0 && activityScore < 1.0) {
      phenotype = 'intermediate_metabolizer';
      confidence = 'high';
    } else if (activityScore >= 1.0 && activityScore <= 2.0) {
      phenotype = 'normal_metabolizer';
      confidence = 'high';
    } else {
      phenotype = 'ultrarapid_metabolizer';
      confidence = 'high';
    }

    return {
      phenotype,
      activityScore,
      confidence,
      variants: variantList,
      frequencies: this.getPhenotypeFrequencies('CYP2D6', phenotype)
    };
  }

  /**
   * Generate dose recommendations based on genetic profile
   */
  async generateDoseRecommendations(drugName, relevantGenes, patientContext) {
    const recommendations = [];

    for (const geneInfo of relevantGenes) {
      const recommendation = await this.getDrugGeneRecommendation(
        drugName, 
        geneInfo.gene, 
        geneInfo.phenotype
      );
      
      if (recommendation) {
        recommendations.push({
          gene: geneInfo.gene,
          phenotype: geneInfo.phenotype.phenotype,
          recommendation: recommendation.recommendation,
          doseModification: recommendation.doseModification,
          alternative: recommendation.alternative,
          evidence: recommendation.evidence,
          source: 'CPIC Guidelines'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get drug-gene interaction recommendations
   */
  async getDrugGeneRecommendation(drugName, gene, phenotypeData) {
    const recommendations = {
      'tamoxifen-CYP2D6': {
        poor_metabolizer: {
          recommendation: 'Consider alternative endocrine therapy (aromatase inhibitor)',
          doseModification: 'Standard tamoxifen dosing results in reduced efficacy',
          alternative: 'Anastrozole, letrozole, or exemestane',
          evidence: 'CPIC Level A'
        },
        intermediate_metabolizer: {
          recommendation: 'Consider CYP2D6 inhibitor avoidance',
          doseModification: 'Standard dosing with enhanced monitoring',
          alternative: 'Monitor treatment response closely',
          evidence: 'CPIC Level B'
        }
      },
      'fluorouracil-DPYD': {
        poor_metabolizer: {
          recommendation: 'Avoid fluoropyrimidines or reduce dose by 50%',
          doseModification: 'Start at 50% dose if treatment essential',
          alternative: 'Non-fluoropyrimidine chemotherapy regimen',
          evidence: 'CPIC Level A'
        }
      },
      'irinotecan-UGT1A1': {
        poor_metabolizer: {
          recommendation: 'Reduce starting dose by 25-30%',
          doseModification: 'Consider 80mg/m2 instead of 125mg/m2',
          alternative: 'Enhanced supportive care for diarrhea',
          evidence: 'FDA Label, CPIC Level A'
        }
      }
    };

    const key = `${drugName}-${gene}`;
    const drugGeneRec = recommendations[key];
    
    return drugGeneRec?.[phenotypeData.phenotype] || null;
  }

  /**
   * Assess overall pharmacogenomic risk
   */
  async assessPharmacogenomicRisk(drugAnalyses, patientGenetics) {
    let riskScore = 0;
    const riskFactors = [];
    
    for (const analysis of drugAnalyses) {
      if (analysis.actionability === 'high') {
        riskScore += 30;
        riskFactors.push({
          drug: analysis.medication.name,
          concern: 'High-priority pharmacogenomic interaction',
          genes: analysis.relevantGenes.map(g => g.gene).join(', ')
        });
      } else if (analysis.actionability === 'moderate') {
        riskScore += 15;
        riskFactors.push({
          drug: analysis.medication.name,
          concern: 'Moderate pharmacogenomic interaction',
          genes: analysis.relevantGenes.map(g => g.gene).join(', ')
        });
      }
    }

    return {
      overallRisk: Math.min(riskScore, 100),
      riskCategory: this.categorizeRisk(riskScore),
      riskFactors,
      mitigationStrategies: this.getRiskMitigationStrategies(riskFactors)
    };
  }

  /**
   * Generate monitoring recommendations
   */
  async generateMonitoringRecommendations(drugAnalyses) {
    const monitoring = {
      baseline: [],
      ongoing: [],
      efficacyMonitoring: [],
      toxicityMonitoring: []
    };

    for (const analysis of drugAnalyses) {
      if (analysis.actionability !== 'none') {
        // Add drug-specific monitoring
        const drugMonitoring = await this.getDrugSpecificMonitoring(analysis);
        monitoring.baseline.push(...drugMonitoring.baseline);
        monitoring.ongoing.push(...drugMonitoring.ongoing);
      }
    }

    // Remove duplicates
    monitoring.baseline = [...new Set(monitoring.baseline)];
    monitoring.ongoing = [...new Set(monitoring.ongoing)];

    return monitoring;
  }

  // Helper methods
  assessGeneRelevance(gene, drugName) {
    const drugGeneAssociations = {
      'tamoxifen': ['CYP2D6', 'CYP2C9', 'CYP3A4'],
      'fluorouracil': ['DPYD'],
      'capecitabine': ['DPYD'],
      'irinotecan': ['UGT1A1'],
      'warfarin': ['CYP2C9', 'VKORC1'],
      'clopidogrel': ['CYP2C19'],
      'mercaptopurine': ['TPMT'],
      'azathioprine': ['TPMT']
    };

    const relevantGenes = drugGeneAssociations[drugName] || [];
    return {
      isRelevant: relevantGenes.includes(gene),
      significance: relevantGenes.includes(gene) ? 'high' : 'none'
    };
  }

  predictCYP2C19Phenotype(variants) {
    // Simplified CYP2C19 prediction
    const functionalVariants = {
      '*1': 1.0,  // Normal
      '*2': 0.0,  // No function
      '*3': 0.0,  // No function
      '*17': 1.5  // Increased function
    };

    let activityScore = 0;
    const variantList = Array.isArray(variants) ? variants : [variants];
    
    for (const variant of variantList) {
      activityScore += functionalVariants[variant] || 1.0;
    }

    if (activityScore === 0) return { phenotype: 'poor_metabolizer', confidence: 'high' };
    if (activityScore > 2.0) return { phenotype: 'ultrarapid_metabolizer', confidence: 'high' };
    return { phenotype: 'normal_metabolizer', confidence: 'high' };
  }

  // Additional phenotype prediction methods
  predictCYP2C9Phenotype(variants) { return { phenotype: 'normal_metabolizer', confidence: 'moderate' }; }
  predictDPYDPhenotype(variants) { return { phenotype: 'normal_metabolizer', confidence: 'high' }; }
  predictUGT1A1Phenotype(variants) { return { phenotype: 'normal_metabolizer', confidence: 'high' }; }
  predictTPMTPhenotype(variants) { return { phenotype: 'normal_metabolizer', confidence: 'high' }; }
  predictSLCO1B1Phenotype(variants) { return { phenotype: 'normal_function', confidence: 'high' }; }

  isClinicalllyActionable(gene, phenotype) {
    const actionableGenes = ['CYP2D6', 'CYP2C19', 'DPYD', 'UGT1A1', 'TPMT'];
    return actionableGenes.includes(gene) && phenotype.phenotype !== 'normal_metabolizer';
  }

  getClinicalSignificance(gene, phenotype) {
    if (gene === 'DPYD' && phenotype.phenotype === 'poor_metabolizer') return 'high';
    if (gene === 'CYP2D6' && phenotype.phenotype === 'poor_metabolizer') return 'moderate';
    return 'low';
  }

  categorizeRisk(score) {
    if (score >= 60) return 'high';
    if (score >= 30) return 'moderate';
    return 'low';
  }

  determineActionability(analysis) {
    const hasHighImpactGenes = analysis.relevantGenes.some(g => 
      ['DPYD', 'CYP2D6', 'UGT1A1'].includes(g.gene) && 
      g.phenotype.phenotype !== 'normal_metabolizer'
    );
    
    if (hasHighImpactGenes) return 'high';
    if (analysis.relevantGenes.length > 0) return 'moderate';
    return 'none';
  }

  getPhenotypeFrequencies(gene, phenotype) {
    // Population frequency data
    const frequencies = {
      CYP2D6: {
        poor_metabolizer: '7% Caucasian, 2% Asian',
        normal_metabolizer: '77% Caucasian, 90% Asian'
      }
    };
    
    return frequencies[gene]?.[phenotype] || 'Unknown frequency';
  }

  async assessClinicalImpact(gene, drugName, variants) { return 'moderate'; }
  async predictEfficacy(drugName, relevantGenes) { return { prediction: 'normal', confidence: 'moderate' }; }
  async assessToxicityRisk(drugName, relevantGenes) { return { risk: 'low', confidence: 'moderate' }; }
  async generateOverallRecommendations(analyses, genetics) { return []; }
  async generateEducationalPoints(analyses, genetics) { return []; }
  async getDrugSpecificMonitoring(analysis) { return { baseline: [], ongoing: [] }; }
  getRiskMitigationStrategies(factors) { return ['Enhanced monitoring', 'Dose optimization']; }

  loadCPICGuidelines() {
    // This would load CPIC guidelines from a comprehensive database
    return {};
  }
}

export default new PharmacogenomicsService();