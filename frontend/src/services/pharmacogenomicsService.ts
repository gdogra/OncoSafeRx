import { authedFetch } from '../utils/authedFetch';

export interface GeneticVariant {
  gene: string;
  variant: string;
  genotype: string;
  phenotype: 'Poor Metabolizer' | 'Intermediate Metabolizer' | 'Normal Metabolizer' | 'Rapid Metabolizer' | 'Ultrarapid Metabolizer';
  clinicalSignificance: 'High' | 'Moderate' | 'Low' | 'Unknown';
  lastUpdated: string;
}

export interface DrugMetabolismProfile {
  drugName: string;
  affectedGenes: string[];
  metabolismRate: 'Very Slow' | 'Slow' | 'Normal' | 'Fast' | 'Very Fast';
  recommendedAction: 'Avoid' | 'Use Alternative' | 'Reduce Dose' | 'Standard Dose' | 'Increase Dose' | 'Monitor Closely';
  specificRecommendations: {
    startingDose: string;
    maxDose: string;
    titrationInterval: string;
    monitoringParameters: string[];
    alternativeDrugs: string[];
  };
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4';
  guidelines: string[];
  warnings: string[];
}

export interface DosingRecommendation {
  drugName: string;
  indication: string;
  patientFactors: {
    age: number;
    weight: number;
    height: number;
    bsa: number;
    creatinine: number;
    bilirubin: number;
    genetics: GeneticVariant[];
  };
  recommendedDose: {
    amount: string;
    frequency: string;
    route: string;
    duration: string;
  };
  adjustmentFactors: {
    geneticAdjustment: number; // multiplier
    renalAdjustment: number;
    hepaticAdjustment: number;
    ageAdjustment: number;
    combinedAdjustment: number;
  };
  monitoring: {
    parameters: string[];
    frequency: string;
    targets: { parameter: string; target: string; units: string }[];
  };
  interactions: {
    drug: string;
    effect: string;
    recommendation: string;
  }[];
  efficacyPrediction: {
    likelihood: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    responseRate: number;
    timeToResponse: string;
  };
  toxicityPrediction: {
    overallRisk: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
    specificRisks: { toxicity: string; risk: string; prevention: string }[];
  };
}

class PharmacogenomicsService {
  private baseUrl = '/api/pharmacogenomics';

  /**
   * Get list of common pharmacogenes for testing and display
   */
  getCommonPharmacogenes(): string[] {
    return [
      'CYP2D6', 'CYP2C19', 'CYP3A4', 'CYP3A5', 'CYP2C9',
      'CYP1A2', 'CYP2B6', 'UGT1A1', 'DPYD', 'TPMT',
      'COMT', 'SLCO1B1', 'ABCB1', 'ABCG2', 'VKORC1'
    ];
  }

  /**
   * Generate personalized dosing recommendations
   */
  async generateDosingRecommendation(
    patientId: string,
    drugName: string,
    indication: string,
    patientFactors: any
  ): Promise<DosingRecommendation> {
    try {
      const response = await authedFetch(`${this.baseUrl}/dosing`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          drugName,
          indication,
          patientFactors
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dosing recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating dosing recommendation:', error);
      return this.getMockDosingRecommendation(drugName);
    }
  }

  // Mock data for demo purposes
  private getMockDosingRecommendation(drugName: string): DosingRecommendation {
    return {
      drugName,
      indication: 'Breast Cancer',
      patientFactors: {
        age: 65,
        weight: 70,
        height: 165,
        bsa: 1.75,
        creatinine: 0.9,
        bilirubin: 0.8,
        genetics: []
      },
      recommendedDose: {
        amount: '20 mg',
        frequency: 'Daily',
        route: 'Oral',
        duration: '5 years or until progression'
      },
      adjustmentFactors: {
        geneticAdjustment: 0.8,
        renalAdjustment: 1.0,
        hepaticAdjustment: 1.0,
        ageAdjustment: 0.9,
        combinedAdjustment: 0.72
      },
      monitoring: {
        parameters: ['Endoxifen levels', 'Bone density', 'Lipid profile'],
        frequency: 'Every 3 months for first year, then every 6 months',
        targets: [
          { parameter: 'Endoxifen', target: '>5.9 ng/mL', units: 'ng/mL' },
          { parameter: 'Bone density', target: 'T-score >-2.5', units: 'T-score' }
        ]
      },
      interactions: [
        {
          drug: 'Paroxetine',
          effect: 'Strong CYP2D6 inhibition',
          recommendation: 'Avoid concomitant use or consider alternative antidepressant'
        }
      ],
      efficacyPrediction: {
        likelihood: 'Moderate',
        responseRate: 0.65,
        timeToResponse: '3-6 months'
      },
      toxicityPrediction: {
        overallRisk: 'Low',
        specificRisks: [
          {
            toxicity: 'Hot flashes',
            risk: 'High (>70%)',
            prevention: 'Lifestyle modifications, consider non-hormonal alternatives'
          },
          {
            toxicity: 'Venous thromboembolism',
            risk: 'Low (<1%)',
            prevention: 'Monitor for signs/symptoms, avoid prolonged immobility'
          }
        ]
      }
    };
  }
}

export const pharmacogenomicsService = new PharmacogenomicsService();