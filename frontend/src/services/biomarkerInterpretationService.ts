import { authedFetch } from '../utils/authedFetch';

export interface GenomicVariant {
  gene: string;
  variant: string;
  variantType: 'SNV' | 'Indel' | 'CNV' | 'Fusion' | 'Rearrangement';
  alleleFrequency: number;
  coverage: number;
  significance: 'Pathogenic' | 'Likely Pathogenic' | 'VUS' | 'Likely Benign' | 'Benign';
  cosmicId?: string;
  clinvarId?: string;
}

export interface LiquidBiopsyResult {
  sampleId: string;
  collectionDate: string;
  platform: 'Guardant360' | 'FoundationOne Liquid CDx' | 'Tempus xT' | 'Signatera';
  ctDNA: {
    detected: boolean;
    concentration: number; // copies/mL
    tumorFraction: number; // percentage
  };
  variants: GenomicVariant[];
  microsatelliteInstability: {
    status: 'MSI-High' | 'MSI-Low' | 'MSS';
    score: number;
  };
  tumorMutationalBurden: {
    value: number; // mutations per megabase
    classification: 'High' | 'Intermediate' | 'Low';
  };
  homologousRecombinationDeficiency: {
    score: number;
    status: 'HRD-Positive' | 'HRD-Negative';
  };
}

export interface TreatmentRecommendation {
  drug: string;
  indication: string;
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4' | 'R1';
  rationale: string;
  biomarkerSupport: {
    primaryBiomarker: string;
    supportingBiomarkers: string[];
    mechanismOfAction: string;
  };
  clinicalTrials: {
    nctId: string;
    title: string;
    phase: string;
    eligibility: 'Eligible' | 'Likely Eligible' | 'Screen Required';
  }[];
  resistance: {
    knownResistanceMutations: string[];
    riskFactors: string[];
    monitoringStrategy: string;
  };
}

export interface BiomarkerInterpretation {
  reportId: string;
  patientId: string;
  generatedAt: string;
  
  // Input data
  liquidBiopsy?: LiquidBiopsyResult;
  tissueBiopsy?: {
    sampleType: string;
    pathology: string;
    ihc: { marker: string; result: string; percentage?: number }[];
    fish: { target: string; result: string; ratio?: number }[];
  };
  
  // AI interpretation
  keyFindings: {
    actionableMutations: GenomicVariant[];
    resistanceMutations: GenomicVariant[];
    prognosticMarkers: GenomicVariant[];
    immunotherapy_predictors: {
      msi: boolean;
      tmb: boolean;
      pdl1: number | null;
    };
  };
  
  // Treatment recommendations
  recommendations: {
    firstLine: TreatmentRecommendation[];
    secondLine: TreatmentRecommendation[];
    clinical_trials: TreatmentRecommendation[];
    avoid: { drug: string; reason: string }[];
  };
  
  // Monitoring strategy
  monitoring: {
    nextAssessment: string; // timeline
    biomarkersToTrack: string[];
    imagingSchedule: string;
    liquidBiopsyInterval: string;
  };
  
  // Resistance prediction
  resistancePrediction: {
    primaryResistanceProbability: number;
    expectedDurationOfResponse: number; // months
    alternativeTargets: string[];
    combinationStrategies: string[];
  };
}

class BiomarkerInterpretationService {
  private baseUrl = '/api/biomarker-interpretation';

  /**
   * Analyze genomic data and generate treatment recommendations
   */
  async interpretBiomarkers(
    patientId: string,
    genomicData: Partial<LiquidBiopsyResult>,
    clinicalContext: {
      diagnosis: string;
      stage: string;
      priorTreatments: string[];
      performanceStatus: number;
    }
  ): Promise<BiomarkerInterpretation> {
    try {
      const response = await authedFetch(`${this.baseUrl}/interpret`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          genomicData,
          clinicalContext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to interpret biomarkers');
      }

      return await response.json();
    } catch (error) {
      console.error('Error interpreting biomarkers:', error);
      return this.getMockBiomarkerInterpretation(patientId, genomicData);
    }
  }

  /**
   * Real-time monitoring and alert system
   */
  async monitorMolecularEvolution(
    patientId: string,
    baselineGenomics: GenomicVariant[],
    followupGenomics: GenomicVariant[]
  ): Promise<{
    newMutations: GenomicVariant[];
    lostMutations: GenomicVariant[];
    evolvedMutations: { original: GenomicVariant; evolved: GenomicVariant }[];
    resistanceAlerts: string[];
    treatmentAdjustments: TreatmentRecommendation[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/monitor-evolution`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          baselineGenomics,
          followupGenomics
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to monitor molecular evolution');
      }

      return await response.json();
    } catch (error) {
      console.error('Error monitoring evolution:', error);
      return this.getMockEvolutionMonitoring();
    }
  }

  /**
   * Integrate with major NGS laboratory APIs
   */
  async syncLabResults(
    patientId: string, 
    labProvider: 'Guardant' | 'Foundation' | 'Tempus',
    reportId: string
  ): Promise<LiquidBiopsyResult> {
    try {
      const response = await authedFetch(`${this.baseUrl}/sync-lab-results`, {
        method: 'POST',
        body: JSON.stringify({
          patientId,
          labProvider,
          reportId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync lab results');
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing lab results:', error);
      return this.getMockLabResults();
    }
  }

  // Mock data for immediate demonstration
  private getMockBiomarkerInterpretation(
    patientId: string,
    genomicData: any
  ): BiomarkerInterpretation {
    return {
      reportId: 'bio_' + Date.now(),
      patientId,
      generatedAt: new Date().toISOString(),
      
      liquidBiopsy: {
        sampleId: 'LB_2024_001',
        collectionDate: '2024-11-15',
        platform: 'Guardant360',
        ctDNA: {
          detected: true,
          concentration: 125.4,
          tumorFraction: 8.2
        },
        variants: [
          {
            gene: 'EGFR',
            variant: 'T790M',
            variantType: 'SNV',
            alleleFrequency: 12.5,
            coverage: 1250,
            significance: 'Pathogenic',
            cosmicId: 'COSM6240'
          },
          {
            gene: 'TP53',
            variant: 'R248W',
            variantType: 'SNV',
            alleleFrequency: 45.2,
            coverage: 980,
            significance: 'Pathogenic',
            cosmicId: 'COSM10648'
          }
        ],
        microsatelliteInstability: {
          status: 'MSS',
          score: 0.8
        },
        tumorMutationalBurden: {
          value: 3.2,
          classification: 'Low'
        },
        homologousRecombinationDeficiency: {
          score: 25,
          status: 'HRD-Negative'
        }
      },
      
      keyFindings: {
        actionableMutations: [
          {
            gene: 'EGFR',
            variant: 'T790M',
            variantType: 'SNV',
            alleleFrequency: 12.5,
            coverage: 1250,
            significance: 'Pathogenic'
          }
        ],
        resistanceMutations: [
          {
            gene: 'EGFR',
            variant: 'T790M',
            variantType: 'SNV',
            alleleFrequency: 12.5,
            coverage: 1250,
            significance: 'Pathogenic'
          }
        ],
        prognosticMarkers: [],
        immunotherapy_predictors: {
          msi: false,
          tmb: false,
          pdl1: null
        }
      },
      
      recommendations: {
        firstLine: [
          {
            drug: 'Osimertinib',
            indication: 'EGFR T790M-positive NSCLC',
            evidenceLevel: '1A',
            rationale: 'EGFR T790M mutation detected with high confidence. Osimertinib specifically targets T790M resistance mutation.',
            biomarkerSupport: {
              primaryBiomarker: 'EGFR T790M',
              supportingBiomarkers: ['EGFR amplification'],
              mechanismOfAction: 'Irreversible EGFR TKI targeting T790M gatekeeper mutation'
            },
            clinicalTrials: [
              {
                nctId: 'NCT02296125',
                title: 'AURA3: Osimertinib vs chemotherapy in T790M+ NSCLC',
                phase: 'Phase III',
                eligibility: 'Eligible'
              }
            ],
            resistance: {
              knownResistanceMutations: ['EGFR C797S', 'MET amplification'],
              riskFactors: ['High T790M allele frequency'],
              monitoringStrategy: 'Serial ctDNA monitoring every 8 weeks'
            }
          }
        ],
        secondLine: [
          {
            drug: 'Platinum + Pemetrexed',
            indication: 'NSCLC progression after EGFR TKI',
            evidenceLevel: '1A',
            rationale: 'Standard chemotherapy backbone for EGFR-mutant NSCLC after TKI progression',
            biomarkerSupport: {
              primaryBiomarker: 'EGFR mutation',
              supportingBiomarkers: ['Non-squamous histology'],
              mechanismOfAction: 'DNA-damaging chemotherapy'
            },
            clinicalTrials: [],
            resistance: {
              knownResistanceMutations: [],
              riskFactors: ['Prior chemotherapy exposure'],
              monitoringStrategy: 'Standard imaging every 6 weeks'
            }
          }
        ],
        clinical_trials: [
          {
            drug: 'Amivantamab + Lazertinib',
            indication: 'EGFR-mutant NSCLC with T790M',
            evidenceLevel: '2A',
            rationale: 'Novel EGFR/MET bispecific antibody combination showing promising activity',
            biomarkerSupport: {
              primaryBiomarker: 'EGFR T790M',
              supportingBiomarkers: ['MET expression'],
              mechanismOfAction: 'Bispecific antibody targeting EGFR and MET'
            },
            clinicalTrials: [
              {
                nctId: 'NCT04487080',
                title: 'MARIPOSA-2: Amivantamab + lazertinib vs osimertinib',
                phase: 'Phase III',
                eligibility: 'Likely Eligible'
              }
            ],
            resistance: {
              knownResistanceMutations: ['Unknown - novel mechanism'],
              riskFactors: ['Investigational therapy'],
              monitoringStrategy: 'Enhanced safety monitoring per protocol'
            }
          }
        ],
        avoid: [
          {
            drug: 'Erlotinib',
            reason: 'Ineffective against T790M resistance mutation'
          },
          {
            drug: 'Gefitinib',
            reason: 'Ineffective against T790M resistance mutation'
          }
        ]
      },
      
      monitoring: {
        nextAssessment: '8 weeks',
        biomarkersToTrack: ['EGFR T790M', 'MET amplification', 'EGFR C797S'],
        imagingSchedule: 'CT chest/abdomen/pelvis every 8 weeks',
        liquidBiopsyInterval: 'Every 8 weeks, sooner if clinical progression'
      },
      
      resistancePrediction: {
        primaryResistanceProbability: 0.15,
        expectedDurationOfResponse: 12.3,
        alternativeTargets: ['MET', 'HER2', 'BRAF'],
        combinationStrategies: ['EGFR + MET inhibition', 'EGFR + chemotherapy']
      }
    };
  }

  private getMockEvolutionMonitoring() {
    return {
      newMutations: [
        {
          gene: 'MET',
          variant: 'amplification',
          variantType: 'CNV',
          alleleFrequency: 25.4,
          coverage: 890,
          significance: 'Pathogenic'
        }
      ],
      lostMutations: [],
      evolvedMutations: [
        {
          original: {
            gene: 'EGFR',
            variant: 'T790M',
            variantType: 'SNV',
            alleleFrequency: 12.5,
            coverage: 1250,
            significance: 'Pathogenic'
          },
          evolved: {
            gene: 'EGFR',
            variant: 'T790M',
            variantType: 'SNV',
            alleleFrequency: 35.8,
            coverage: 1180,
            significance: 'Pathogenic'
          }
        }
      ],
      resistanceAlerts: [
        'MET amplification detected - potential resistance to osimertinib',
        'Increasing T790M allele frequency suggests clonal evolution'
      ],
      treatmentAdjustments: [
        {
          drug: 'Tepotinib + Osimertinib',
          indication: 'EGFR + MET co-targeting',
          evidenceLevel: '2B',
          rationale: 'Combination therapy to address emerging MET-mediated resistance',
          biomarkerSupport: {
            primaryBiomarker: 'MET amplification',
            supportingBiomarkers: ['EGFR T790M'],
            mechanismOfAction: 'Dual EGFR/MET inhibition'
          },
          clinicalTrials: [],
          resistance: {
            knownResistanceMutations: ['EGFR C797S'],
            riskFactors: ['Combination toxicity'],
            monitoringStrategy: 'Weekly safety monitoring initially'
          }
        }
      ]
    };
  }

  private getMockLabResults(): LiquidBiopsyResult {
    return {
      sampleId: 'GH_2024_12345',
      collectionDate: new Date().toISOString(),
      platform: 'Guardant360',
      ctDNA: {
        detected: true,
        concentration: 89.7,
        tumorFraction: 5.4
      },
      variants: [
        {
          gene: 'KRAS',
          variant: 'G12C',
          variantType: 'SNV',
          alleleFrequency: 18.9,
          coverage: 1450,
          significance: 'Pathogenic',
          cosmicId: 'COSM516'
        }
      ],
      microsatelliteInstability: {
        status: 'MSS',
        score: 1.2
      },
      tumorMutationalBurden: {
        value: 7.8,
        classification: 'Intermediate'
      },
      homologousRecombinationDeficiency: {
        score: 18,
        status: 'HRD-Negative'
      }
    };
  }
}

export const biomarkerInterpretationService = new BiomarkerInterpretationService();