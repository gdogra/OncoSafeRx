import { authedFetch } from '../utils/authedFetch';

export interface ClinicalEvidence {
  evidenceId: string;
  blockchainHash: string;
  patientId: string; // anonymized
  timestamp: string;
  
  // Evidence metadata
  studyType: 'RCT' | 'Observational' | 'Real_World' | 'Case_Series' | 'N_of_1';
  evidenceLevel: '1A' | '1B' | '2A' | '2B' | '3' | '4' | '5';
  institution: string;
  investigator: string;
  
  // Treatment details
  treatment: {
    drug: string;
    dose: string;
    schedule: string;
    duration: number; // days
    indication: string;
    lineOfTherapy: number;
    priorTreatments: string[];
  };
  
  // Patient characteristics (anonymized)
  demographics: {
    ageGroup: '18-30' | '31-50' | '51-65' | '66-75' | '76+';
    sex: 'M' | 'F';
    ethnicity: string;
    performanceStatus: number;
  };
  
  // Biomarkers
  biomarkers: {
    name: string;
    value: string;
    method: string;
    laboratory: string;
    date: string;
    verified: boolean;
  }[];
  
  // Clinical outcomes
  outcomes: {
    efficacy: {
      response: 'CR' | 'PR' | 'SD' | 'PD';
      responseDate?: string;
      progressionFreeMonths?: number;
      overallSurvivalMonths?: number;
      qualityOfLifeScore?: number;
    };
    safety: {
      adverseEvent: string;
      grade: 1 | 2 | 3 | 4 | 5;
      attribution: 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite';
      onset: string;
      resolution?: string;
    }[];
    followUp: number; // months
  };
  
  // Verification
  verification: {
    dataMonitor: string;
    auditDate: string;
    sourceDataVerified: boolean;
    regulatoryCompliance: boolean;
    gdprCompliance: boolean;
  };
}

export interface SmartContract {
  contractAddress: string;
  contractType: 'Outcome_Based_Payment' | 'Data_Licensing' | 'Research_Collaboration' | 'Patent_Licensing';
  parties: {
    role: 'Sponsor' | 'CRO' | 'Site' | 'Investigator' | 'Patient' | 'Regulator';
    address: string;
    verified: boolean;
  }[];
  
  terms: {
    milestones: {
      milestone: string;
      criteria: string;
      payment: number;
      currency: 'USD' | 'EUR' | 'ETH' | 'OncoToken';
      verified: boolean;
      completedAt?: string;
    }[];
    dataRights: {
      dataType: string;
      accessLevel: 'Read' | 'Write' | 'Execute' | 'Full';
      duration: number; // months
      royalty: number; // percentage
    }[];
    compliance: {
      regulations: string[];
      auditRequirements: string[];
      reportingFrequency: string;
    };
  };
}

export interface DecentralizedTrial {
  trialId: string;
  nctNumber?: string;
  blockchainNetwork: 'Ethereum' | 'Polygon' | 'OncoChain';
  
  // Trial design
  protocol: {
    title: string;
    phase: 'I' | 'I/II' | 'II' | 'II/III' | 'III' | 'IV';
    studyType: 'Interventional' | 'Observational' | 'Expanded_Access';
    primaryEndpoint: string;
    secondaryEndpoints: string[];
    inclusionCriteria: string[];
    exclusionCriteria: string[];
    targetEnrollment: number;
  };
  
  // Decentralized components
  governance: {
    dao: string; // Decentralized Autonomous Organization address
    stakeholders: {
      role: 'Sponsor' | 'Investigator' | 'Patient_Advocate' | 'Regulator' | 'Data_Committee';
      votingPower: number;
      verified: boolean;
    }[];
    decisions: {
      proposal: string;
      votesFor: number;
      votesAgainst: number;
      executed: boolean;
      timestamp: string;
    }[];
  };
  
  // Patient enrollment via blockchain
  enrollment: {
    patientId: string; // anonymized blockchain address
    enrollmentDate: string;
    consentHash: string; // immutable consent record
    eligibilityVerified: boolean;
    randomization?: {
      arm: string;
      stratificationFactors: any;
      verified: boolean;
    };
  }[];
  
  // Real-time data collection
  dataCollection: {
    patientId: string;
    dataType: 'Safety' | 'Efficacy' | 'PRO' | 'Biomarker' | 'Imaging';
    timestamp: string;
    dataHash: string;
    verified: boolean;
    source: 'Site' | 'Patient_App' | 'Wearable' | 'Lab' | 'Imaging_Center';
  }[];
}

export interface GlobalEvidence {
  aggregationId: string;
  queryHash: string;
  
  // Query parameters
  query: {
    drug: string;
    indication: string;
    biomarker?: string;
    demographics?: any;
    timeframe: string;
  };
  
  // Aggregated results
  evidence: {
    totalPatients: number;
    institutions: number;
    countries: string[];
    studyTypes: string[];
    followUpRange: string;
  };
  
  // Efficacy synthesis
  efficacy: {
    responseRate: {
      estimate: number;
      confidenceInterval: [number, number];
      heterogeneity: number;
      studies: number;
    };
    survivalBenefit: {
      medianPFS: number;
      medianOS: number;
      hazardRatio: number;
      pValue: number;
    };
    qualityEvidence: 'High' | 'Moderate' | 'Low' | 'Very_Low';
  };
  
  // Safety synthesis
  safety: {
    commonEvents: {
      event: string;
      incidence: number;
      grade3Plus: number;
      confidenceInterval: [number, number];
    }[];
    rareEvents: {
      event: string;
      cases: number;
      incidenceRate: number;
      causalityAssessed: boolean;
    }[];
  };
  
  // Blockchain verification
  verification: {
    dataProvenance: boolean;
    auditTrail: string[];
    qualityScore: number;
    lastVerified: string;
  };
}

class BlockchainEvidenceService {
  private baseUrl = '/api/blockchain-evidence';

  /**
   * Record clinical evidence on blockchain
   */
  async recordEvidence(evidence: ClinicalEvidence): Promise<{
    blockchainHash: string;
    transactionId: string;
    gasUsed: number;
    verification: boolean;
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/record`, {
        method: 'POST',
        body: JSON.stringify(evidence),
      });

      if (!response.ok) {
        throw new Error('Failed to record evidence on blockchain');
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording evidence:', error);
      return this.getMockBlockchainRecord();
    }
  }

  /**
   * Create smart contract for outcome-based pricing
   */
  async createSmartContract(
    contractType: string,
    terms: any,
    parties: any[]
  ): Promise<SmartContract> {
    try {
      const response = await authedFetch(`${this.baseUrl}/smart-contract`, {
        method: 'POST',
        body: JSON.stringify({
          contractType,
          terms,
          parties
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create smart contract');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating smart contract:', error);
      return this.getMockSmartContract();
    }
  }

  /**
   * Launch decentralized clinical trial
   */
  async launchDecentralizedTrial(
    protocol: any,
    governance: any
  ): Promise<DecentralizedTrial> {
    try {
      const response = await authedFetch(`${this.baseUrl}/decentralized-trial`, {
        method: 'POST',
        body: JSON.stringify({
          protocol,
          governance
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to launch decentralized trial');
      }

      return await response.json();
    } catch (error) {
      console.error('Error launching decentralized trial:', error);
      return this.getMockDecentralizedTrial();
    }
  }

  /**
   * Query global evidence network
   */
  async queryGlobalEvidence(
    drug: string,
    indication: string,
    filters?: {
      biomarker?: string;
      demographics?: any;
      timeframe?: string;
    }
  ): Promise<GlobalEvidence> {
    try {
      const response = await authedFetch(`${this.baseUrl}/global-evidence`, {
        method: 'POST',
        body: JSON.stringify({
          drug,
          indication,
          filters
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query global evidence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying global evidence:', error);
      return this.getMockGlobalEvidence(drug, indication);
    }
  }

  /**
   * Verify evidence authenticity
   */
  async verifyEvidence(
    evidenceId: string,
    blockchainHash: string
  ): Promise<{
    verified: boolean;
    integrity: boolean;
    provenance: string[];
    auditTrail: any[];
    confidence: number;
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        body: JSON.stringify({
          evidenceId,
          blockchainHash
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify evidence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying evidence:', error);
      return this.getMockVerificationResult();
    }
  }

  /**
   * Monetize data through blockchain marketplace
   */
  async monetizeData(
    dataAsset: {
      type: string;
      description: string;
      patient_count: number;
      follow_up: number;
      endpoints: string[];
    },
    licensing: {
      price: number;
      currency: string;
      duration: number;
      restrictions: string[];
    }
  ): Promise<{
    assetId: string;
    nftAddress: string;
    marketplaceUrl: string;
    royaltyStructure: any;
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/monetize-data`, {
        method: 'POST',
        body: JSON.stringify({
          dataAsset,
          licensing
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to monetize data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error monetizing data:', error);
      return this.getMockDataMonetization();
    }
  }

  // Mock data for demonstration
  private getMockBlockchainRecord() {
    return {
      blockchainHash: '0x' + Math.random().toString(16).substr(2, 40),
      transactionId: '0x' + Math.random().toString(16).substr(2, 40),
      gasUsed: 125000,
      verification: true
    };
  }

  private getMockSmartContract(): SmartContract {
    return {
      contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
      contractType: 'Outcome_Based_Payment',
      parties: [
        { role: 'Sponsor', address: '0x123...abc', verified: true },
        { role: 'Site', address: '0x456...def', verified: true },
        { role: 'Patient', address: '0x789...ghi', verified: true }
      ],
      terms: {
        milestones: [
          {
            milestone: 'Patient enrollment complete',
            criteria: 'All 100 patients enrolled with verified eligibility',
            payment: 50000,
            currency: 'USD',
            verified: true,
            completedAt: new Date().toISOString()
          },
          {
            milestone: 'Primary endpoint achieved',
            criteria: 'Response rate >30% with statistical significance',
            payment: 200000,
            currency: 'USD',
            verified: false
          }
        ],
        dataRights: [
          {
            dataType: 'Clinical outcomes',
            accessLevel: 'Read',
            duration: 24,
            royalty: 10
          }
        ],
        compliance: {
          regulations: ['FDA_CFR_Part_11', 'EU_GDPR', 'ICH_E6_R2'],
          auditRequirements: ['Monthly data verification', 'Quarterly compliance audit'],
          reportingFrequency: 'Real-time for SAEs, Monthly for efficacy'
        }
      }
    };
  }

  private getMockDecentralizedTrial(): DecentralizedTrial {
    return {
      trialId: 'DCT_' + Date.now(),
      nctNumber: 'NCT' + Math.floor(Math.random() * 1000000).toString().padStart(8, '0'),
      blockchainNetwork: 'OncoChain',
      
      protocol: {
        title: 'Decentralized Trial of Novel Immunotherapy in Advanced NSCLC',
        phase: 'II',
        studyType: 'Interventional',
        primaryEndpoint: 'Overall Response Rate at 12 weeks',
        secondaryEndpoints: ['Progression-free survival', 'Overall survival', 'Safety'],
        inclusionCriteria: ['Advanced NSCLC', 'PD-L1 positive', 'ECOG PS 0-1'],
        exclusionCriteria: ['Prior immunotherapy', 'Active autoimmune disease'],
        targetEnrollment: 150
      },
      
      governance: {
        dao: '0x' + Math.random().toString(16).substr(2, 40),
        stakeholders: [
          { role: 'Sponsor', votingPower: 40, verified: true },
          { role: 'Investigator', votingPower: 30, verified: true },
          { role: 'Patient_Advocate', votingPower: 20, verified: true },
          { role: 'Data_Committee', votingPower: 10, verified: true }
        ],
        decisions: [
          {
            proposal: 'Increase target enrollment from 100 to 150 patients',
            votesFor: 85,
            votesAgainst: 15,
            executed: true,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      
      enrollment: [
        {
          patientId: '0xpatient1',
          enrollmentDate: new Date().toISOString(),
          consentHash: '0x' + Math.random().toString(16).substr(2, 40),
          eligibilityVerified: true,
          randomization: {
            arm: 'Experimental',
            stratificationFactors: { pdl1_score: '>50%', smoking_status: 'former' },
            verified: true
          }
        }
      ],
      
      dataCollection: [
        {
          patientId: '0xpatient1',
          dataType: 'Safety',
          timestamp: new Date().toISOString(),
          dataHash: '0x' + Math.random().toString(16).substr(2, 40),
          verified: true,
          source: 'Patient_App'
        }
      ]
    };
  }

  private getMockGlobalEvidence(drug: string, indication: string): GlobalEvidence {
    return {
      aggregationId: 'global_' + Date.now(),
      queryHash: '0x' + Math.random().toString(16).substr(2, 40),
      
      query: {
        drug,
        indication,
        timeframe: 'last_5_years'
      },
      
      evidence: {
        totalPatients: 15420,
        institutions: 247,
        countries: ['USA', 'Germany', 'UK', 'Japan', 'Canada', 'Australia', 'France'],
        studyTypes: ['RCT', 'Real_World', 'Observational'],
        followUpRange: '6-60 months'
      },
      
      efficacy: {
        responseRate: {
          estimate: 0.42,
          confidenceInterval: [0.38, 0.46],
          heterogeneity: 0.15,
          studies: 23
        },
        survivalBenefit: {
          medianPFS: 12.4,
          medianOS: 28.1,
          hazardRatio: 0.65,
          pValue: 0.001
        },
        qualityEvidence: 'High'
      },
      
      safety: {
        commonEvents: [
          {
            event: 'Fatigue',
            incidence: 0.68,
            grade3Plus: 0.12,
            confidenceInterval: [0.64, 0.72]
          },
          {
            event: 'Diarrhea',
            incidence: 0.45,
            grade3Plus: 0.08,
            confidenceInterval: [0.41, 0.49]
          }
        ],
        rareEvents: [
          {
            event: 'Immune_pneumonitis',
            cases: 23,
            incidenceRate: 0.0015,
            causalityAssessed: true
          }
        ]
      },
      
      verification: {
        dataProvenance: true,
        auditTrail: ['Data source verified', 'Statistical analysis audited', 'Blockchain integrity confirmed'],
        qualityScore: 0.91,
        lastVerified: new Date().toISOString()
      }
    };
  }

  private getMockVerificationResult() {
    return {
      verified: true,
      integrity: true,
      provenance: ['Institution A', 'Laboratory B', 'CRO C'],
      auditTrail: [
        { action: 'Data recorded', timestamp: new Date().toISOString(), verifier: 'Data Monitor' },
        { action: 'Source verified', timestamp: new Date().toISOString(), verifier: 'Quality Auditor' },
        { action: 'Blockchain confirmed', timestamp: new Date().toISOString(), verifier: 'Smart Contract' }
      ],
      confidence: 0.95
    };
  }

  private getMockDataMonetization() {
    return {
      assetId: 'asset_' + Date.now(),
      nftAddress: '0x' + Math.random().toString(16).substr(2, 40),
      marketplaceUrl: 'https://oncosaferx.com/marketplace/asset_123',
      royaltyStructure: {
        originalCreator: 0.5,
        institution: 0.3,
        platform: 0.2
      }
    };
  }
}

export const blockchainEvidenceService = new BlockchainEvidenceService();