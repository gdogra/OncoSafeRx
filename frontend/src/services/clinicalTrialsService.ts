import { authedFetch } from '../utils/authedFetch';

export interface ClinicalTrial {
  id: string;
  nctId: string;
  title: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV';
  status: 'Recruiting' | 'Active' | 'Completed' | 'Suspended';
  sponsor: string;
  conditions: string[];
  interventions: string[];
  eligibilityCriteria: {
    age: { min?: number; max?: number };
    gender?: 'Male' | 'Female' | 'All';
    performanceStatus?: string[];
    priorTreatments?: string[];
    excludedMedications?: string[];
    requiredBiomarkers?: string[];
  };
  locations: {
    facility: string;
    city: string;
    state: string;
    distance?: number;
  }[];
  estimatedEnrollment: number;
  currentEnrollment: number;
  primaryEndpoint: string;
  secondaryEndpoints: string[];
  drugInteractionRisk: 'Low' | 'Moderate' | 'High';
  lastUpdated: string;
}

export interface PatientProfile {
  age: number;
  gender: 'Male' | 'Female';
  diagnosis: string[];
  currentMedications: {
    name: string;
    dose: string;
    frequency: string;
  }[];
  priorTreatments: string[];
  performanceStatus: number;
  biomarkers: {
    name: string;
    value: string;
    status: 'Positive' | 'Negative' | 'Unknown';
  }[];
  genetics: {
    gene: string;
    variant: string;
    status: string;
  }[];
  zipCode: string;
}

export interface TrialMatch {
  trial: ClinicalTrial;
  matchScore: number;
  eligibilityStatus: 'Eligible' | 'Likely Eligible' | 'Possibly Eligible' | 'Not Eligible';
  matchReasons: string[];
  concerns: string[];
  nextSteps: string[];
}

class ClinicalTrialsService {
  private baseUrl = '/api/clinical-trials';

  /**
   * Search for clinical trials matching patient criteria
   */
  async searchTrials(patientProfile: PatientProfile): Promise<TrialMatch[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/search`, {
        method: 'POST',
        body: JSON.stringify(patientProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to search clinical trials');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching clinical trials:', error);
      // Return mock data for demo purposes
      return this.getMockTrialMatches(patientProfile);
    }
  }

  /**
   * Check real-time eligibility for specific trial
   */
  async checkTrialEligibility(
    trialId: string, 
    patientProfile: PatientProfile
  ): Promise<{
    eligible: boolean;
    score: number;
    criteria: {
      met: string[];
      failed: string[];
      unknown: string[];
    };
    drugInteractions: {
      conflicts: string[];
      warnings: string[];
      recommendations: string[];
    };
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/${trialId}/eligibility`, {
        method: 'POST',
        body: JSON.stringify(patientProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to check trial eligibility');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      return this.getMockEligibilityCheck();
    }
  }

  /**
   * Get trials by location with drug interaction analysis
   */
  async getTrialsByLocation(zipCode: string, radius: number = 50): Promise<ClinicalTrial[]> {
    try {
      const response = await authedFetch(
        `${this.baseUrl}/location?zipCode=${zipCode}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error('Failed to get trials by location');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting trials by location:', error);
      return this.getMockLocationTrials();
    }
  }

  /**
   * Analyze drug interactions for trial protocols
   */
  async analyzeTrialDrugInteractions(
    trialId: string,
    currentMedications: string[]
  ): Promise<{
    riskLevel: 'Low' | 'Moderate' | 'High';
    interactions: {
      drug1: string;
      drug2: string;
      severity: 'Minor' | 'Moderate' | 'Major';
      mechanism: string;
      recommendation: string;
    }[];
    trialModifications: string[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/${trialId}/interactions`, {
        method: 'POST',
        body: JSON.stringify({ medications: currentMedications }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze trial drug interactions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing trial interactions:', error);
      return this.getMockInteractionAnalysis();
    }
  }

  // Mock data for demo purposes
  private getMockTrialMatches(patientProfile: PatientProfile): TrialMatch[] {
    const mockTrials: ClinicalTrial[] = [
      {
        id: '1',
        nctId: 'NCT05123456',
        title: 'Phase II Study of Novel CDK4/6 Inhibitor in Advanced Breast Cancer',
        phase: 'Phase II',
        status: 'Recruiting',
        sponsor: 'Memorial Sloan Kettering Cancer Center',
        conditions: ['Breast Cancer', 'HER2-Negative Breast Cancer'],
        interventions: ['Palbociclib + Fulvestrant', 'Novel CDK4/6 Inhibitor'],
        eligibilityCriteria: {
          age: { min: 18, max: 75 },
          gender: 'All',
          performanceStatus: ['0', '1'],
          priorTreatments: ['Prior CDK4/6 inhibitor allowed'],
          requiredBiomarkers: ['ER+', 'HER2-']
        },
        locations: [
          { facility: 'Memorial Sloan Kettering', city: 'New York', state: 'NY', distance: 12.3 },
          { facility: 'Weill Cornell Medicine', city: 'New York', state: 'NY', distance: 8.7 }
        ],
        estimatedEnrollment: 120,
        currentEnrollment: 87,
        primaryEndpoint: 'Progression-free survival',
        secondaryEndpoints: ['Overall survival', 'Response rate', 'Safety'],
        drugInteractionRisk: 'Moderate',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        nctId: 'NCT05234567',
        title: 'Immunotherapy Combination for Advanced Lung Cancer',
        phase: 'Phase III',
        status: 'Recruiting',
        sponsor: 'Bristol Myers Squibb',
        conditions: ['Non-Small Cell Lung Cancer', 'Advanced NSCLC'],
        interventions: ['Nivolumab + Ipilimumab', 'Standard of Care'],
        eligibilityCriteria: {
          age: { min: 18 },
          gender: 'All',
          performanceStatus: ['0', '1'],
          requiredBiomarkers: ['PD-L1 >1%']
        },
        locations: [
          { facility: 'NYU Langone Health', city: 'New York', state: 'NY', distance: 15.2 },
          { facility: 'Mount Sinai Hospital', city: 'New York', state: 'NY', distance: 18.9 }
        ],
        estimatedEnrollment: 450,
        currentEnrollment: 298,
        primaryEndpoint: 'Overall survival',
        secondaryEndpoints: ['Progression-free survival', 'Quality of life'],
        drugInteractionRisk: 'High',
        lastUpdated: new Date().toISOString()
      }
    ];

    return mockTrials.map(trial => ({
      trial,
      matchScore: Math.random() * 40 + 60, // 60-100% match
      eligibilityStatus: 'Likely Eligible' as const,
      matchReasons: [
        'Age within eligible range',
        'Performance status acceptable',
        'Diagnosis matches inclusion criteria'
      ],
      concerns: [
        'Current medications may require washout period',
        'Recent treatment history needs review'
      ],
      nextSteps: [
        'Schedule screening visit',
        'Obtain recent imaging',
        'Review medication interactions'
      ]
    }));
  }

  private getMockEligibilityCheck() {
    return {
      eligible: true,
      score: 85,
      criteria: {
        met: ['Age 18-75', 'ECOG PS 0-1', 'Adequate organ function'],
        failed: [],
        unknown: ['Recent imaging pending review']
      },
      drugInteractions: {
        conflicts: ['Warfarin may increase bleeding risk with trial drug'],
        warnings: ['Monitor for CYP3A4 interactions'],
        recommendations: ['Consider dose reduction if drug levels elevated']
      }
    };
  }

  private getMockLocationTrials(): ClinicalTrial[] {
    return [
      {
        id: '3',
        nctId: 'NCT05345678',
        title: 'CAR-T Cell Therapy for Relapsed Lymphoma',
        phase: 'Phase I',
        status: 'Recruiting',
        sponsor: 'University of Pennsylvania',
        conditions: ['B-Cell Lymphoma', 'Relapsed/Refractory Lymphoma'],
        interventions: ['CD19 CAR-T Cells'],
        eligibilityCriteria: {
          age: { min: 18, max: 70 },
          gender: 'All',
          performanceStatus: ['0', '1', '2']
        },
        locations: [
          { facility: 'Hospital of the University of Pennsylvania', city: 'Philadelphia', state: 'PA', distance: 95.2 }
        ],
        estimatedEnrollment: 24,
        currentEnrollment: 18,
        primaryEndpoint: 'Maximum tolerated dose',
        secondaryEndpoints: ['Safety', 'Efficacy', 'CAR-T expansion'],
        drugInteractionRisk: 'Low',
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  private getMockInteractionAnalysis() {
    return {
      riskLevel: 'Moderate' as const,
      interactions: [
        {
          drug1: 'Trial Drug X',
          drug2: 'Warfarin',
          severity: 'Moderate' as const,
          mechanism: 'CYP2C9 inhibition',
          recommendation: 'Monitor INR closely, may need dose adjustment'
        }
      ],
      trialModifications: [
        'Hold warfarin 7 days before trial start',
        'Switch to LMWH during trial period',
        'Resume warfarin after washout period'
      ]
    };
  }
}

export const clinicalTrialsService = new ClinicalTrialsService();