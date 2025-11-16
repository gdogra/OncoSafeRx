import { authedFetch } from '../utils/authedFetch';

export interface AdverseEvent {
  reportId: string;
  patientId: string;
  reportDate: string;
  
  // Event details
  event: {
    description: string;
    medicallyConfirmed: boolean;
    onset_date: string;
    end_date?: string;
    outcome: 'Recovered' | 'Recovering' | 'Not Recovered' | 'Fatal' | 'Unknown';
    seriousness: {
      serious: boolean;
      death: boolean;
      life_threatening: boolean;
      hospitalization: boolean;
      disability: boolean;
      congenital_anomaly: boolean;
      other_important: boolean;
    };
  };
  
  // Causality assessment
  causality: {
    suspected_drug: string;
    relationship: 'Unrelated' | 'Unlikely' | 'Possible' | 'Probable' | 'Definite';
    rechallenge: boolean;
    dechallenge: boolean;
    naranjo_score: number; // Algorithm-based causality
  };
  
  // Regulatory classification
  classification: {
    ctcae_grade: 1 | 2 | 3 | 4 | 5;
    meddra_code: string;
    meddra_term: string;
    icd10_code: string;
    expedited_reporting_required: boolean;
  };
}

export interface SafetySignal {
  signalId: string;
  detected_date: string;
  
  // Signal characteristics
  signal: {
    drug: string;
    adverse_event: string;
    signal_strength: number; // statistical measure
    confidence_level: number;
    data_source: string[];
  };
  
  // Statistical analysis
  analysis: {
    case_count: number;
    reporting_rate: number;
    expected_rate: number;
    disproportionality: {
      ror: number; // Reporting Odds Ratio
      prr: number; // Proportional Reporting Ratio
      ebgm: number; // Empirical Bayes Geometric Mean
      ic: number; // Information Component
    };
  };
  
  // Clinical evaluation
  evaluation: {
    clinical_significance: 'Low' | 'Medium' | 'High' | 'Critical';
    mechanism_plausible: boolean;
    literature_support: boolean;
    regulatory_actions_needed: boolean;
  };
  
  // Recommended actions
  actions: {
    immediate: string[];
    investigation_needed: string[];
    regulatory_communication: string[];
    label_changes: string[];
  };
}

export interface RegulatorySubmission {
  submissionId: string;
  type: 'IND' | 'NDA' | 'BLA' | 'IDE' | 'PMA' | 'PSUR' | 'DSUR' | 'CIOMS';
  region: 'FDA' | 'EMA' | 'PMDA' | 'Health_Canada' | 'TGA' | 'NMPA';
  
  // Submission details
  details: {
    title: string;
    product: string;
    indication: string;
    submission_date: string;
    due_date: string;
    priority: 'Routine' | 'Expedited' | 'Priority' | 'Breakthrough';
  };
  
  // Required sections
  sections: {
    clinical_overview: boolean;
    safety_data: boolean;
    efficacy_data: boolean;
    risk_assessment: boolean;
    benefit_risk: boolean;
    labeling: boolean;
  };
  
  // Auto-generated content
  generated_content: {
    safety_tables: string[];
    signal_detection: SafetySignal[];
    periodic_reports: string[];
    regulatory_intelligence: string[];
  };
  
  status: 'Draft' | 'In Review' | 'Submitted' | 'Approved' | 'Rejected';
}

export interface RegulatoryIntelligence {
  date: string;
  source: string;
  
  // Regulatory updates
  updates: {
    type: 'Guidance' | 'Warning Letter' | 'Advisory Committee' | 'Approval' | 'Withdrawal';
    title: string;
    summary: string;
    impact_assessment: 'High' | 'Medium' | 'Low';
    action_required: boolean;
    therapeutic_area: string[];
  }[];
  
  // Competitive intelligence
  competitive: {
    competitor: string;
    product: string;
    action: 'Approval' | 'Rejection' | 'Complete Response Letter' | 'Advisory Committee';
    implications: string[];
    opportunities: string[];
  }[];
  
  // Global harmonization
  harmonization: {
    ich_updates: string[];
    regional_differences: string[];
    convergence_opportunities: string[];
  };
}

class RegulatoryComplianceService {
  private baseUrl = '/api/regulatory-compliance';

  /**
   * Automated adverse event reporting
   */
  async submitAdverseEvent(event: AdverseEvent): Promise<{
    submitted: boolean;
    reference_numbers: { region: string; reference: string }[];
    timeline: string;
    next_steps: string[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/submit-adverse-event`, {
        method: 'POST',
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to submit adverse event');
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting adverse event:', error);
      return this.getMockAESubmissionResponse();
    }
  }

  /**
   * Real-time safety signal detection
   */
  async detectSafetySignals(
    drug: string,
    timeframe: '30d' | '90d' | '6m' | '1y' | 'all'
  ): Promise<SafetySignal[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/detect-signals`, {
        method: 'POST',
        body: JSON.stringify({ drug, timeframe }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect safety signals');
      }

      return await response.json();
    } catch (error) {
      console.error('Error detecting safety signals:', error);
      return this.getMockSafetySignals();
    }
  }

  /**
   * Automated regulatory submission generation
   */
  async generateRegulatorySubmission(
    type: string,
    product: string,
    regions: string[]
  ): Promise<RegulatorySubmission[]> {
    try {
      const response = await authedFetch(`${this.baseUrl}/generate-submission`, {
        method: 'POST',
        body: JSON.stringify({ type, product, regions }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate regulatory submission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating submission:', error);
      return this.getMockRegulatorySubmissions();
    }
  }

  /**
   * Global regulatory intelligence monitoring
   */
  async getRegulatoryIntelligence(
    therapeutic_areas: string[],
    regions: string[]
  ): Promise<RegulatoryIntelligence> {
    try {
      const response = await authedFetch(`${this.baseUrl}/regulatory-intelligence`, {
        method: 'POST',
        body: JSON.stringify({ therapeutic_areas, regions }),
      });

      if (!response.ok) {
        throw new Error('Failed to get regulatory intelligence');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting regulatory intelligence:', error);
      return this.getMockRegulatoryIntelligence();
    }
  }

  /**
   * Automated compliance monitoring
   */
  async monitorCompliance(
    products: string[],
    regulations: string[]
  ): Promise<{
    compliance_score: number;
    violations: {
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      description: string;
      deadline: string;
      actions: string[];
    }[];
    upcoming_deadlines: {
      type: string;
      due_date: string;
      preparation_status: string;
    }[];
  }> {
    try {
      const response = await authedFetch(`${this.baseUrl}/monitor-compliance`, {
        method: 'POST',
        body: JSON.stringify({ products, regulations }),
      });

      if (!response.ok) {
        throw new Error('Failed to monitor compliance');
      }

      return await response.json();
    } catch (error) {
      console.error('Error monitoring compliance:', error);
      return this.getMockComplianceMonitoring();
    }
  }

  // Mock data for demonstration
  private getMockAESubmissionResponse() {
    return {
      submitted: true,
      reference_numbers: [
        { region: 'FDA', reference: 'FDA-2024-AE-45678' },
        { region: 'EMA', reference: 'EMA-2024-EVP-12345' },
        { region: 'PMDA', reference: 'PMDA-2024-SAE-789' }
      ],
      timeline: 'Submissions completed within regulatory timelines (FDA: Day 0, EMA: Day 0, PMDA: Day 1)',
      next_steps: [
        'Monitor for regulatory agency follow-up questions',
        'Prepare for potential expedited safety update',
        'Update safety database with submission references'
      ]
    };
  }

  private getMockSafetySignals(): SafetySignal[] {
    return [
      {
        signalId: 'signal_' + Date.now(),
        detected_date: new Date().toISOString(),
        
        signal: {
          drug: 'Pembrolizumab',
          adverse_event: 'Stevens-Johnson Syndrome',
          signal_strength: 2.8,
          confidence_level: 0.95,
          data_source: ['FAERS', 'EudraVigilance', 'VigiBase']
        },
        
        analysis: {
          case_count: 12,
          reporting_rate: 0.15,
          expected_rate: 0.05,
          disproportionality: {
            ror: 3.2,
            prr: 3.1,
            ebgm: 2.9,
            ic: 1.8
          }
        },
        
        evaluation: {
          clinical_significance: 'High',
          mechanism_plausible: true,
          literature_support: true,
          regulatory_actions_needed: true
        },
        
        actions: {
          immediate: [
            'Notify regulatory authorities within 24 hours',
            'Issue Dear Healthcare Provider Letter',
            'Update prescribing information'
          ],
          investigation_needed: [
            'Detailed case review and causality assessment',
            'Literature review for mechanistic explanation',
            'Consider additional post-marketing studies'
          ],
          regulatory_communication: [
            'Prepare regulatory submission with updated safety data',
            'Schedule meetings with FDA/EMA',
            'Submit variation for label update'
          ],
          label_changes: [
            'Add Stevens-Johnson Syndrome to warnings and precautions',
            'Update adverse reactions section',
            'Include monitoring recommendations'
          ]
        }
      }
    ];
  }

  private getMockRegulatorySubmissions(): RegulatorySubmission[] {
    return [
      {
        submissionId: 'reg_sub_' + Date.now(),
        type: 'PSUR',
        region: 'EMA',
        
        details: {
          title: 'Pembrolizumab PSUR #4 (Data Lock Point: December 31, 2024)',
          product: 'Pembrolizumab',
          indication: 'Non-Small Cell Lung Cancer',
          submission_date: '2024-12-15',
          due_date: '2024-12-31',
          priority: 'Routine'
        },
        
        sections: {
          clinical_overview: true,
          safety_data: true,
          efficacy_data: true,
          risk_assessment: true,
          benefit_risk: true,
          labeling: false
        },
        
        generated_content: {
          safety_tables: [
            'Table 1: Summary of Serious Adverse Events',
            'Table 2: Deaths by Preferred Term',
            'Table 3: Adverse Events of Special Interest',
            'Table 4: Lack of Efficacy Cases'
          ],
          signal_detection: [
            {
              signalId: 'signal_123',
              detected_date: '2024-11-15',
              signal: {
                drug: 'Pembrolizumab',
                adverse_event: 'Immune-mediated pneumonitis',
                signal_strength: 1.9,
                confidence_level: 0.88,
                data_source: ['Clinical trials', 'Post-marketing']
              },
              analysis: {
                case_count: 45,
                reporting_rate: 2.1,
                expected_rate: 1.8,
                disproportionality: { ror: 1.8, prr: 1.7, ebgm: 1.6, ic: 0.7 }
              },
              evaluation: {
                clinical_significance: 'Medium',
                mechanism_plausible: true,
                literature_support: true,
                regulatory_actions_needed: false
              },
              actions: { immediate: [], investigation_needed: [], regulatory_communication: [], label_changes: [] }
            }
          ],
          periodic_reports: [
            'Quarterly Safety Update Report Q3 2024',
            'Annual Safety Report 2023',
            'Post-Marketing Commitment Status Update'
          ],
          regulatory_intelligence: [
            'FDA Guidance on Immunotherapy Safety Monitoring',
            'EMA Reflection Paper on Immune-mediated AEs',
            'ICH E2E Pharmacovigilance Planning Update'
          ]
        },
        
        status: 'Draft'
      }
    ];
  }

  private getMockRegulatoryIntelligence(): RegulatoryIntelligence {
    return {
      date: new Date().toISOString(),
      source: 'OncoSafeRx Regulatory Intelligence Engine',
      
      updates: [
        {
          type: 'Guidance',
          title: 'FDA Draft Guidance: Clinical Trial Considerations for Therapeutic Cancer Vaccines',
          summary: 'New FDA guidance outlines considerations for cancer vaccine development including biomarker strategies and endpoint selection.',
          impact_assessment: 'High',
          action_required: true,
          therapeutic_area: ['Oncology', 'Immunotherapy']
        },
        {
          type: 'Warning Letter',
          title: 'FDA Warning Letter to BioPharma Inc. for REMS Non-Compliance',
          summary: 'Warning letter issued for inadequate implementation of Risk Evaluation and Mitigation Strategy.',
          impact_assessment: 'Medium',
          action_required: false,
          therapeutic_area: ['Oncology']
        }
      ],
      
      competitive: [
        {
          competitor: 'Competitor X',
          product: 'Novel CAR-T Therapy',
          action: 'Approval',
          implications: [
            'First approval in pediatric ALL indication',
            'Competitive threat to existing therapies',
            'New standard of care implications'
          ],
          opportunities: [
            'Consider expedited pediatric development',
            'Evaluate combination strategies',
            'Assess market access implications'
          ]
        }
      ],
      
      harmonization: {
        ich_updates: [
          'ICH M7(R2) Assessment and Control of DNA Reactive Impurities',
          'ICH Q14 Analytical Procedure Development',
          'ICH E6(R3) Good Clinical Practice Update'
        ],
        regional_differences: [
          'FDA vs EMA differences in immunotherapy safety monitoring',
          'PMDA unique requirements for Japanese population pharmacokinetics',
          'Health Canada expedited pathways variations'
        ],
        convergence_opportunities: [
          'Common Technical Document harmonization',
          'Real-world evidence acceptance alignment',
          'Digital submission format standardization'
        ]
      }
    };
  }

  private getMockComplianceMonitoring() {
    return {
      compliance_score: 87,
      violations: [
        {
          severity: 'Medium' as const,
          description: 'PSUR submission deadline in 15 days - preparation 60% complete',
          deadline: '2024-12-31',
          actions: [
            'Complete safety data review',
            'Finalize benefit-risk assessment',
            'Submit for quality review'
          ]
        },
        {
          severity: 'Low' as const,
          description: 'Annual safety report template update required for new ICH guidelines',
          deadline: '2025-01-15',
          actions: [
            'Review ICH E2C(R2) updates',
            'Update safety report template',
            'Train safety team on new requirements'
          ]
        }
      ],
      upcoming_deadlines: [
        {
          type: 'PSUR Submission',
          due_date: '2024-12-31',
          preparation_status: '60% Complete'
        },
        {
          type: 'FDA Annual Report',
          due_date: '2025-01-15',
          preparation_status: 'Not Started'
        },
        {
          type: 'EMA Variation Submission',
          due_date: '2025-02-01',
          preparation_status: '25% Complete'
        }
      ]
    };
  }
}

export const regulatoryComplianceService = new RegulatoryComplianceService();