import React, { useState, useEffect } from 'react';
import { Brain, Dna, Target, TrendingUp, AlertTriangle, Clock, CheckCircle, Activity, Zap, Shield, Play, Pause, RotateCcw, Settings, BarChart3, LineChart, Calculator, Sliders, TestTube, MapPin, Users, Calendar, ExternalLink, Star, Filter, FileText, Database, TrendingDown, Clipboard, Microscope, FlaskConical, Beaker, Phone, Mail, PieChart, BarChart2, Calendar as TimelineIcon, Layers, Eye, MousePointer, Maximize2 } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import Tooltip from '../UI/Tooltip';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface GenomicProfile {
  hlaTypes: string[];
  cypVariants: Record<string, string>;
  dpydVariants: string[];
  otherVariants: Record<string, string>;
  riskScore: number;
  pharmacogenomics: PharmacogenomicProfile;
}

interface PharmacogenomicProfile {
  metabolizerStatus: Record<string, {
    gene: string;
    genotype: string;
    phenotype: 'Poor' | 'Intermediate' | 'Normal' | 'Rapid' | 'Ultrarapid';
    activityScore: number;
    clinicalImplications: string[];
    drugRecommendations: DrugRecommendation[];
  }>;
  hlaRisks: {
    allele: string;
    drugs: string[];
    riskType: 'Hypersensitivity' | 'Efficacy' | 'Toxicity';
    riskLevel: 'Low' | 'Moderate' | 'High';
    recommendations: string[];
  }[];
  otherBiomarkers: {
    gene: string;
    variant: string;
    impact: string;
    affectedDrugs: string[];
    recommendation: string;
  }[];
  overallRiskScore: number;
  lastUpdated: string;
}

interface DrugRecommendation {
  drug: string;
  recommendation: 'Standard' | 'Reduced' | 'Increased' | 'Alternative' | 'Avoid';
  dosageAdjustment?: string;
  monitoringRequired?: string[];
  rationale: string;
  evidenceLevel: 'High' | 'Moderate' | 'Low';
  sources: string[];
}

interface TreatmentProtocol {
  id: string;
  name: string;
  drugs: Array<{
    name: string;
    dosing: string;
    genomicOptimization: string;
    efficacyPrediction: number;
    safetyScore: number;
  }>;
  duration: string;
  expectedOutcome: {
    responseRate: number;
    survivalBenefit: number;
    qualityOfLife: number;
    confidence: number;
  };
  genomicCompatibility: number;
  evidenceLevel: 'I' | 'II' | 'III' | 'IV';
  cost: number;
  monitoring: string[];
  contraindications: string[];
  alternatives: string[];
}

interface AIInsight {
  type: 'optimization' | 'warning' | 'recommendation' | 'trial';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  source: string;
}

interface TreatmentScenario {
  id: string;
  name: string;
  description: string;
  modifications: {
    dosageAdjustments: Record<string, number>;
    drugSubstitutions: Record<string, string>;
    scheduleChanges: Record<string, string>;
    additionalDrugs: string[];
    removedDrugs: string[];
  };
  predictedOutcomes: {
    responseRate: number;
    survivalBenefit: number;
    qualityOfLife: number;
    toxicityReduction: number;
    confidence: number;
  };
  riskProfile: {
    severity: 'low' | 'medium' | 'high';
    factors: string[];
  };
}

interface SimulationState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  scenarios: TreatmentScenario[];
  activeScenario: TreatmentScenario | null;
  comparison: {
    baseline: TreatmentProtocol;
    scenarios: TreatmentScenario[];
  } | null;
}

interface ClinicalTrial {
  nct_id: string;
  title: string;
  phase: string;
  status: string;
  condition: string;
  biomarkers: string[];
  eligibilityScore: number;
  matchReasons: string[];
  location: {
    name: string;
    city: string;
    state: string;
    distance?: number;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  interventions: string[];
  enrollmentStatus: {
    current: number;
    target: number;
    estimatedCompletion: string;
  };
  keyEligibility: {
    ageRange: string;
    performanceStatus: string;
    priorTreatments: string;
    biomarkerRequirements: string[];
  };
}

interface TrialMatchResult {
  matchedTrials: ClinicalTrial[];
  totalMatches: number;
  highConfidenceMatches: number;
  alternativeTrials: ClinicalTrial[];
  eligibilityGaps: {
    criteria: string;
    currentValue: string;
    requiredValue: string;
    actionNeeded: string;
  }[];
}

const TreatmentPlanner: React.FC = () => {
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [genomicProfile, setGenomicProfile] = useState<GenomicProfile | null>(null);
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<TreatmentProtocol | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [predictionResults, setPredictionResults] = useState<any>(null);
  
  // Simulation states
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    currentStep: 0,
    totalSteps: 5,
    scenarios: [],
    activeScenario: null,
    comparison: null
  });
  const [showSimulator, setShowSimulator] = useState(false);
  const [scenarioParameters, setScenarioParameters] = useState({
    dosageReduction: 0,
    addSupportiveCare: false,
    alternativeSchedule: false,
    combinationTherapy: false
  });
  
  // Clinical trial states
  const [trialMatchResult, setTrialMatchResult] = useState<TrialMatchResult | null>(null);
  const [showTrialMatcher, setShowTrialMatcher] = useState(false);
  const [trialMatchLoading, setTrialMatchLoading] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  
  // Genomic analysis states
  const [showGenomicAnalysis, setShowGenomicAnalysis] = useState(false);
  const [genomicAnalysisLoading, setGenomicAnalysisLoading] = useState(false);
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [pharmacogenomicResults, setPharmacogenomicResults] = useState<any>(null);
  
  // Enhanced visualization states
  const [showVisualizationPanel, setShowVisualizationPanel] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'review' | 'simulate' | 'results'>('setup');
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<'timeline' | 'outcomes' | 'biomarkers' | 'risk-matrix' | 'pathway-map'>('timeline');
  const [timelineView, setTimelineView] = useState<'overview' | 'detailed'>('overview');
  const [chartInteractions, setChartInteractions] = useState<boolean>(true);
  const [animatedCharts, setAnimatedCharts] = useState<boolean>(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      // Simulate loading comprehensive patient data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockGenomicProfile: GenomicProfile = {
        hlaTypes: ['HLA-B*5701', 'HLA-DQA1*05:01'],
        cypVariants: {
          'CYP2D6': '*1/*4',
          'CYP3A4': '*1/*1',
          'CYP2C19': '*1/*2'
        },
        dpydVariants: ['c.1905+1G>A'],
        otherVariants: {
          'TPMT': '*1/*3C',
          'UGT1A1': '*28/*28'
        },
        riskScore: 0.75,
        pharmacogenomics: {
          metabolizerStatus: {
            'CYP2D6': {
              gene: 'CYP2D6',
              genotype: '*1/*4',
              phenotype: 'Intermediate',
              activityScore: 1.0,
              clinicalImplications: [
                'Reduced enzyme activity',
                '50% of normal metabolism',
                'Higher drug concentrations possible'
              ],
              drugRecommendations: [
                {
                  drug: 'Codeine',
                  recommendation: 'Alternative',
                  rationale: 'Reduced conversion to active metabolite',
                  evidenceLevel: 'High',
                  sources: ['CPIC Guidelines', 'PharmGKB']
                },
                {
                  drug: 'Tamoxifen',
                  recommendation: 'Standard',
                  monitoringRequired: ['Enhanced monitoring for efficacy'],
                  rationale: 'Intermediate metabolism may affect active metabolite levels',
                  evidenceLevel: 'Moderate',
                  sources: ['CPIC Guidelines']
                }
              ]
            },
            'CYP2C19': {
              gene: 'CYP2C19',
              genotype: '*1/*2',
              phenotype: 'Intermediate',
              activityScore: 1.5,
              clinicalImplications: [
                'Reduced enzyme activity for some substrates',
                'May affect clopidogrel activation',
                'Proton pump inhibitor metabolism affected'
              ],
              drugRecommendations: [
                {
                  drug: 'Clopidogrel',
                  recommendation: 'Alternative',
                  rationale: 'Reduced conversion to active metabolite',
                  evidenceLevel: 'High',
                  sources: ['FDA', 'CPIC Guidelines']
                },
                {
                  drug: 'Omeprazole',
                  recommendation: 'Reduced',
                  dosageAdjustment: '50% dose reduction',
                  rationale: 'Reduced metabolism may lead to higher exposure',
                  evidenceLevel: 'Moderate',
                  sources: ['CPIC Guidelines']
                }
              ]
            },
            'TPMT': {
              gene: 'TPMT',
              genotype: '*1/*3C',
              phenotype: 'Intermediate',
              activityScore: 0.5,
              clinicalImplications: [
                'Reduced thiopurine metabolism',
                'Increased risk of myelosuppression',
                'Dose reduction required'
              ],
              drugRecommendations: [
                {
                  drug: '6-Mercaptopurine',
                  recommendation: 'Reduced',
                  dosageAdjustment: '30-70% dose reduction',
                  monitoringRequired: ['Weekly CBC for 4 weeks', 'Then monthly CBC'],
                  rationale: 'Reduced enzyme activity increases toxicity risk',
                  evidenceLevel: 'High',
                  sources: ['FDA', 'CPIC Guidelines']
                },
                {
                  drug: 'Azathioprine',
                  recommendation: 'Reduced',
                  dosageAdjustment: '30-70% dose reduction',
                  monitoringRequired: ['Enhanced CBC monitoring'],
                  rationale: 'Intermediate metabolizer status',
                  evidenceLevel: 'High',
                  sources: ['CPIC Guidelines']
                }
              ]
            }
          },
          hlaRisks: [
            {
              allele: 'HLA-B*5701',
              drugs: ['Abacavir', 'Carbamazepine'],
              riskType: 'Hypersensitivity',
              riskLevel: 'High',
              recommendations: [
                'Avoid abacavir - high risk of severe hypersensitivity',
                'Consider alternative antiretrovirals',
                'Use carbamazepine with extreme caution'
              ]
            },
            {
              allele: 'HLA-DQA1*05:01',
              drugs: ['Lumiracoxib'],
              riskType: 'Toxicity',
              riskLevel: 'Moderate',
              recommendations: [
                'Enhanced liver function monitoring if lumiracoxib used',
                'Consider alternative COX-2 inhibitors'
              ]
            }
          ],
          otherBiomarkers: [
            {
              gene: 'UGT1A1',
              variant: '*28/*28',
              impact: 'Reduced glucuronidation capacity',
              affectedDrugs: ['Irinotecan', 'Bilirubin'],
              recommendation: 'Reduce irinotecan dose by 25-50% to prevent severe toxicity'
            }
          ],
          overallRiskScore: 0.72,
          lastUpdated: new Date().toISOString()
        }
      };

      const mockProtocols: TreatmentProtocol[] = [
        {
          id: 'proto-001',
          name: 'AI-Optimized FOLFOX + Bevacizumab',
          drugs: [
            {
              name: 'Oxaliplatin',
              dosing: '85 mg/m² (reduced 15% based on CYP variants)',
              genomicOptimization: 'Dose adjusted for CYP2D6 *1/*4 genotype',
              efficacyPrediction: 87,
              safetyScore: 92
            },
            {
              name: '5-Fluorouracil',
              dosing: '2400 mg/m² (standard - DPYD compatible)',
              genomicOptimization: 'Safe dosing confirmed by DPYD analysis',
              efficacyPrediction: 82,
              safetyScore: 88
            },
            {
              name: 'Bevacizumab',
              dosing: '5 mg/kg (optimized for HLA profile)',
              genomicOptimization: 'HLA-compatible, low immunogenicity risk',
              efficacyPrediction: 78,
              safetyScore: 85
            }
          ],
          duration: '6 months',
          expectedOutcome: {
            responseRate: 84,
            survivalBenefit: 76,
            qualityOfLife: 82,
            confidence: 91
          },
          genomicCompatibility: 94,
          evidenceLevel: 'I',
          cost: 45000,
          monitoring: ['CBC weekly', 'LFTs bi-weekly', 'Neuropathy assessment'],
          contraindications: ['Severe renal impairment', 'Active bleeding'],
          alternatives: ['CAPOX regimen', 'FOLFIRI alternative']
        },
        {
          id: 'proto-002',
          name: 'Precision Immunotherapy Protocol',
          drugs: [
            {
              name: 'Pembrolizumab',
              dosing: '200mg Q3W (HLA-optimized)',
              genomicOptimization: 'HLA-B*5701 compatible, enhanced response predicted',
              efficacyPrediction: 91,
              safetyScore: 86
            }
          ],
          duration: '2 years',
          expectedOutcome: {
            responseRate: 89,
            survivalBenefit: 85,
            qualityOfLife: 88,
            confidence: 87
          },
          genomicCompatibility: 91,
          evidenceLevel: 'II',
          cost: 180000,
          monitoring: ['Immune markers monthly', 'Thyroid function', 'Liver enzymes'],
          contraindications: ['Autoimmune disease', 'Organ transplant'],
          alternatives: ['Nivolumab', 'Combination checkpoint inhibitors']
        }
      ];

      const mockInsights: AIInsight[] = [
        {
          type: 'optimization',
          title: 'Genomic Optimization Opportunity',
          description: 'CYP2D6 *1/*4 genotype suggests 15% dose reduction for oxaliplatin to optimize efficacy/toxicity ratio',
          confidence: 94,
          actionable: true,
          priority: 'high',
          source: 'PharmGKB + Real-world Evidence'
        },
        {
          type: 'warning',
          title: 'DPYD Variant Detected',
          description: 'c.1905+1G>A variant detected. Standard 5-FU dosing is safe, but enhanced monitoring recommended',
          confidence: 98,
          actionable: true,
          priority: 'medium',
          source: 'CPIC Guidelines'
        },
        {
          type: 'trial',
          title: 'Clinical Trial Match',
          description: 'Patient eligible for NCT04567890: AI-guided precision oncology trial with 89% match score',
          confidence: 89,
          actionable: true,
          priority: 'medium',
          source: 'ClinicalTrials.gov AI Matcher'
        }
      ];

      setGenomicProfile(mockGenomicProfile);
      setProtocols(mockProtocols);
      setSelectedProtocol(mockProtocols[0]);
      setAiInsights(mockInsights);
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async (protocol: TreatmentProtocol) => {
    setLoading(true);
    try {
      // Simulate AI prediction generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const predictions = {
        outcomeTimeline: [
          { month: 1, responseRate: 25, survivalRate: 100, qualityOfLife: 85 },
          { month: 3, responseRate: 65, survivalRate: 98, qualityOfLife: 82 },
          { month: 6, responseRate: 84, survivalRate: 94, qualityOfLife: 84 },
          { month: 12, responseRate: 78, survivalRate: 88, qualityOfLife: 87 },
          { month: 24, responseRate: 72, survivalRate: 76, qualityOfLife: 89 }
        ],
        biomarkerPredictions: {
          'CEA': { baseline: 45, predicted: [35, 18, 8, 12, 15] },
          'CA 19-9': { baseline: 120, predicted: [95, 45, 22, 28, 32] }
        },
        riskFactors: [
          { factor: 'Neuropathy', risk: 35, mitigation: 'Dose reduction protocol' },
          { factor: 'Neutropenia', risk: 22, mitigation: 'G-CSF support' },
          { factor: 'GI Toxicity', risk: 18, mitigation: 'Prophylactic medications' }
        ]
      };
      
      setPredictionResults(predictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simulation functions
  const generateScenarios = async (baseProtocol: TreatmentProtocol) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const scenarios: TreatmentScenario[] = [
        {
          id: 'scenario-1',
          name: 'Dose-Reduced Regimen',
          description: '20% dose reduction with enhanced supportive care',
          modifications: {
            dosageAdjustments: { 'Oxaliplatin': -20, '5-Fluorouracil': -15 },
            drugSubstitutions: {},
            scheduleChanges: {},
            additionalDrugs: ['Ondansetron', 'Dexamethasone'],
            removedDrugs: []
          },
          predictedOutcomes: {
            responseRate: 78,
            survivalBenefit: 72,
            qualityOfLife: 91,
            toxicityReduction: 45,
            confidence: 89
          },
          riskProfile: {
            severity: 'low',
            factors: ['Reduced neuropathy risk', 'Better tolerance']
          }
        },
        {
          id: 'scenario-2',
          name: 'Alternative Schedule',
          description: 'Modified infusion schedule with split dosing',
          modifications: {
            dosageAdjustments: {},
            drugSubstitutions: {},
            scheduleChanges: { 'Oxaliplatin': 'Split dose over 2 days' },
            additionalDrugs: [],
            removedDrugs: []
          },
          predictedOutcomes: {
            responseRate: 81,
            survivalBenefit: 74,
            qualityOfLife: 88,
            toxicityReduction: 28,
            confidence: 85
          },
          riskProfile: {
            severity: 'low',
            factors: ['Improved infusion tolerance']
          }
        },
        {
          id: 'scenario-3',
          name: 'Combination Enhancement',
          description: 'Add targeted therapy based on genomic profile',
          modifications: {
            dosageAdjustments: {},
            drugSubstitutions: {},
            scheduleChanges: {},
            additionalDrugs: ['Panitumumab'],
            removedDrugs: []
          },
          predictedOutcomes: {
            responseRate: 92,
            survivalBenefit: 88,
            qualityOfLife: 79,
            toxicityReduction: -15,
            confidence: 82
          },
          riskProfile: {
            severity: 'medium',
            factors: ['Increased skin toxicity risk', 'Higher efficacy potential']
          }
        }
      ];
      
      setSimulationState(prev => ({
        ...prev,
        scenarios,
        comparison: {
          baseline: baseProtocol,
          scenarios
        }
      }));
      
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async (scenario: TreatmentScenario) => {
    setSimulationState(prev => ({ ...prev, isRunning: true, currentStep: 0, activeScenario: scenario }));
    
    for (let step = 1; step <= simulationState.totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSimulationState(prev => ({ ...prev, currentStep: step }));
    }
    
    setSimulationState(prev => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setSimulationState(prev => ({
      ...prev,
      isRunning: false,
      currentStep: 0,
      activeScenario: null
    }));
  };

  // Clinical trial matching functions
  const searchMatchingTrials = async (protocol?: TreatmentProtocol) => {
    setTrialMatchLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTrials: ClinicalTrial[] = [
        {
          nct_id: 'NCT05123456',
          title: 'AI-Guided Precision Oncology with Genomic-Optimized FOLFOX',
          phase: 'Phase 3',
          status: 'Recruiting',
          condition: 'Colorectal Cancer',
          biomarkers: ['KRAS wild-type', 'MSI-stable'],
          eligibilityScore: 94,
          matchReasons: [
            'Genomic profile matches inclusion criteria',
            'Current treatment aligns with trial protocol',
            'Age and performance status compatible'
          ],
          location: {
            name: 'Memorial Sloan Kettering Cancer Center',
            city: 'New York',
            state: 'NY',
            distance: 2.3
          },
          contact: {
            name: 'Dr. Sarah Johnson',
            phone: '(212) 639-2000',
            email: 'trialsinfo@mskcc.org'
          },
          interventions: ['AI-Optimized FOLFOX', 'Precision Dosing Algorithm'],
          enrollmentStatus: {
            current: 287,
            target: 450,
            estimatedCompletion: '2025-12-31'
          },
          keyEligibility: {
            ageRange: '18-75 years',
            performanceStatus: 'ECOG 0-1',
            priorTreatments: 'No prior chemotherapy for metastatic disease',
            biomarkerRequirements: ['KRAS wild-type', 'Adequate genomic profile']
          }
        },
        {
          nct_id: 'NCT05234567',
          title: 'Combination Immunotherapy with AI-Selected Biomarkers',
          phase: 'Phase 2',
          status: 'Recruiting',
          condition: 'Advanced Solid Tumors',
          biomarkers: ['PD-L1+', 'TMB-High'],
          eligibilityScore: 87,
          matchReasons: [
            'Biomarker profile suggests good response',
            'Innovative AI-guided approach',
            'Potential for improved outcomes'
          ],
          location: {
            name: 'Dana-Farber Cancer Institute',
            city: 'Boston',
            state: 'MA',
            distance: 45.7
          },
          contact: {
            name: 'Dr. Lisa Wang',
            phone: '(617) 632-3000',
            email: 'precision@dfci.harvard.edu'
          },
          interventions: ['Pembrolizumab', 'AI-Selected Combination'],
          enrollmentStatus: {
            current: 67,
            target: 120,
            estimatedCompletion: '2025-06-30'
          },
          keyEligibility: {
            ageRange: '18+ years',
            performanceStatus: 'ECOG 0-2',
            priorTreatments: 'Progression on standard therapy',
            biomarkerRequirements: ['PD-L1 expression', 'TMB testing']
          }
        },
        {
          nct_id: 'NCT05345678',
          title: 'Real-Time Adaptation Protocol with Liquid Biopsy',
          phase: 'Phase 2',
          status: 'Recruiting',
          condition: 'Metastatic Cancer',
          biomarkers: ['ctDNA monitoring', 'Dynamic biomarkers'],
          eligibilityScore: 82,
          matchReasons: [
            'Real-time monitoring aligns with AI approach',
            'Adaptive dosing protocol',
            'Cutting-edge biomarker strategy'
          ],
          location: {
            name: 'UCSF Helen Diller Family Comprehensive Cancer Center',
            city: 'San Francisco',
            state: 'CA',
            distance: 12.1
          },
          contact: {
            name: 'Dr. Emily Rodriguez',
            phone: '(415) 476-1000',
            email: 'liquidbiopsy@ucsf.edu'
          },
          interventions: ['Liquid Biopsy-Guided Therapy', 'Dynamic Treatment Adaptation'],
          enrollmentStatus: {
            current: 134,
            target: 200,
            estimatedCompletion: '2025-12-31'
          },
          keyEligibility: {
            ageRange: '18+ years',
            performanceStatus: 'ECOG 0-1',
            priorTreatments: '≥1 prior systemic therapy',
            biomarkerRequirements: ['Measurable disease', 'ctDNA detectable']
          }
        }
      ];

      const eligibilityGaps = [
        {
          criteria: 'Performance Status',
          currentValue: 'ECOG 2',
          requiredValue: 'ECOG 0-1',
          actionNeeded: 'Improve functional status or consider supportive care'
        },
        {
          criteria: 'Prior Treatments',
          currentValue: '3 prior regimens',
          requiredValue: '≤2 prior regimens',
          actionNeeded: 'Consider trials for heavily pretreated patients'
        }
      ];

      const result: TrialMatchResult = {
        matchedTrials: mockTrials,
        totalMatches: mockTrials.length,
        highConfidenceMatches: mockTrials.filter(t => t.eligibilityScore >= 90).length,
        alternativeTrials: mockTrials.filter(t => t.eligibilityScore < 90),
        eligibilityGaps
      };

      setTrialMatchResult(result);
    } catch (error) {
      console.error('Error matching clinical trials:', error);
    } finally {
      setTrialMatchLoading(false);
    }
  };

  const getTrialPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase 1': return 'bg-blue-100 text-blue-800';
      case 'Phase 2': return 'bg-green-100 text-green-800';
      case 'Phase 3': return 'bg-purple-100 text-purple-800';
      case 'Phase 4': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetabolizerColor = (phenotype: string) => {
    switch (phenotype) {
      case 'Poor': return 'bg-red-100 text-red-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Rapid': return 'bg-blue-100 text-blue-800';
      case 'Ultrarapid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Standard': return 'bg-green-100 text-green-800';
      case 'Reduced': return 'bg-yellow-100 text-yellow-800';
      case 'Increased': return 'bg-blue-100 text-blue-800';
      case 'Alternative': return 'bg-orange-100 text-orange-800';
      case 'Avoid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Genomic analysis functions
  const analyzePharmacogenomics = async (selectedDrugs: string[]) => {
    setGenomicAnalysisLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        analysisId: 'PGX-2024-001',
        patientId: 'PT-12345',
        timestamp: new Date().toISOString(),
        drugAnalysis: selectedDrugs.map(drug => ({
          drug,
          riskAssessment: {
            overallRisk: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Moderate' : 'Low',
            efficacyPrediction: Math.floor(Math.random() * 30) + 70,
            toxicityRisk: Math.floor(Math.random() * 40) + 10,
            recommendations: [
              'Monitor closely for first 4 weeks',
              'Consider dose adjustment based on response',
              'Regular pharmacokinetic monitoring recommended'
            ]
          },
          genomicFactors: [
            {
              gene: 'CYP2D6',
              impact: 'Reduced metabolism',
              confidence: 94
            },
            {
              gene: 'CYP2C19',
              impact: 'Standard metabolism',
              confidence: 87
            }
          ]
        })),
        pathwayAnalysis: {
          primaryPathways: [
            {
              pathway: 'CYP2D6-mediated metabolism',
              status: 'Impaired',
              affectedDrugs: selectedDrugs.slice(0, 2),
              clinicalSignificance: 'High'
            },
            {
              pathway: 'Phase II conjugation',
              status: 'Normal',
              affectedDrugs: selectedDrugs.slice(1),
              clinicalSignificance: 'Low'
            }
          ],
          interactions: [
            {
              type: 'Gene-Gene',
              description: 'CYP2D6 and CYP2C19 combined effect',
              impact: 'Moderate reduction in overall drug clearance'
            }
          ]
        },
        clinicalDecisionSupport: {
          alerts: [
            {
              level: 'High',
              message: 'HLA-B*5701 positive - Avoid abacavir',
              action: 'Select alternative antiretroviral'
            },
            {
              level: 'Medium',
              message: 'TPMT intermediate - Reduce thiopurine doses',
              action: 'Use 30-70% dose reduction'
            }
          ],
          dosingGuidance: selectedDrugs.map(drug => ({
            drug,
            standardDose: '100mg daily',
            recommendedDose: Math.random() > 0.5 ? '75mg daily' : '100mg daily',
            rationale: 'Based on CYP2D6 intermediate metabolizer status'
          }))
        }
      };
      
      setPharmacogenomicResults(mockResults);
    } catch (error) {
      console.error('Error analyzing pharmacogenomics:', error);
    } finally {
      setGenomicAnalysisLoading(false);
    }
  };

  // Enhanced risk calculation functions
  const calculateOverallRisk = (profile: GenomicProfile | null): number => {
    if (!profile) return 0.5;
    
    let riskScore = 0;
    let factors = 0;
    
    // HLA risk contribution
    if (profile.pharmacogenomics.hlaRisks.length > 0) {
      const hlaRisk = profile.pharmacogenomics.hlaRisks.reduce((acc, risk) => {
        return acc + (risk.riskLevel === 'High' ? 0.3 : risk.riskLevel === 'Moderate' ? 0.2 : 0.1);
      }, 0);
      riskScore += hlaRisk;
      factors++;
    }
    
    // Metabolizer status contribution
    const metabolizerRisk = Object.values(profile.pharmacogenomics.metabolizerStatus).reduce((acc, status) => {
      return acc + (status.phenotype === 'Poor' ? 0.4 : 
                    status.phenotype === 'Intermediate' ? 0.3 : 
                    status.phenotype === 'Ultrarapid' ? 0.2 : 0.1);
    }, 0) / Object.keys(profile.pharmacogenomics.metabolizerStatus).length;
    
    riskScore += metabolizerRisk;
    factors++;
    
    return Math.min(riskScore / factors, 1.0);
  };

  const calculateDrugSpecificRisk = (drug: string, profile: GenomicProfile | null) => {
    if (!profile) return getDefaultDrugRisk(drug);
    
    // Drug-specific risk calculations based on genomic profile
    const riskMap: Record<string, any> = {
      'Oxaliplatin': {
        overall: profile.pharmacogenomics.metabolizerStatus['CYP2D6']?.phenotype === 'Intermediate' ? 'Moderate' : 'Low',
        efficacy: 82,
        toxicity: 35,
        pkImpact: 'Moderate - reduced clearance',
        primaryPathway: 'CYP2D6-mediated metabolism',
        secondaryPathways: ['CYP3A4', 'Non-enzymatic degradation'],
        metabolicCapacity: 0.7,
        standardDose: '85 mg/m²',
        adjustedDose: '70 mg/m² (18% reduction)',
        adjustmentRationale: 'CYP2D6 intermediate metabolizer - reduce dose to prevent accumulation',
        monitoring: ['Neuropathy assessment', 'PK levels if available'],
        recommendations: [
          'Reduce initial dose by 15-20%',
          'Monitor for neuropathy closely',
          'Consider dose escalation based on tolerance'
        ],
        genomicFactors: [
          { gene: 'CYP2D6', impact: 'Reduced metabolism', confidence: 94 },
          { gene: 'ERCC1', impact: 'DNA repair capacity', confidence: 78 }
        ]
      },
      '5-Fluorouracil': {
        overall: profile.pharmacogenomics.otherBiomarkers.some(b => b.gene === 'DPYD') ? 'Low' : 'Very Low',
        efficacy: 85,
        toxicity: 15,
        pkImpact: 'Minimal - normal DPYD function',
        primaryPathway: 'DPYD-mediated catabolism',
        secondaryPathways: ['Anabolic pathways', 'Renal excretion'],
        metabolicCapacity: 0.9,
        standardDose: '2400 mg/m²',
        adjustedDose: '2400 mg/m² (no adjustment)',
        adjustmentRationale: 'Normal DPYD function - standard dosing appropriate',
        monitoring: ['CBC', 'Mucositis assessment'],
        recommendations: [
          'Standard dosing appropriate',
          'Monitor for myelosuppression',
          'Watch for mucositis development'
        ],
        genomicFactors: [
          { gene: 'DPYD', impact: 'Normal metabolism', confidence: 98 }
        ]
      }
    };
    
    return riskMap[drug] || getDefaultDrugRisk(drug);
  };

  const getDefaultDrugRisk = (drug: string) => ({
    overall: 'Moderate',
    efficacy: 75,
    toxicity: 25,
    pkImpact: 'Unknown',
    primaryPathway: 'Mixed pathways',
    secondaryPathways: ['Multiple'],
    metabolicCapacity: 0.8,
    standardDose: 'Standard',
    adjustedDose: 'Standard',
    adjustmentRationale: 'Insufficient genomic data for specific recommendation',
    monitoring: ['Standard monitoring'],
    recommendations: ['Standard dosing with close monitoring'],
    genomicFactors: []
  });

  // Enhanced visualization components
  const TimelineChart: React.FC<{ data: any; detailed?: boolean }> = ({ data, detailed = false }) => {
    const timePoints = data?.outcomeTimeline || [];
    const maxResponse = Math.max(...timePoints.map((p: any) => p.responseRate));
    
    return (
      <div className="relative h-64 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-semibold text-gray-900">Treatment Response Timeline</h6>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Response Rate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Survival Rate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>Quality of Life</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-40">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-rows-5 opacity-20">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-t border-gray-300"></div>
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Timeline points and connections */}
          <div className="relative h-full flex items-end justify-between px-4">
            {timePoints.map((point: any, index: number) => (
              <div key={index} className="relative flex flex-col items-center">
                {/* Data points */}
                <div className="relative mb-2">
                  <div 
                    className="w-3 h-3 bg-green-500 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform"
                    style={{ transform: `translateY(-${(point.responseRate / 100) * 140}px)` }}
                    title={`Response: ${point.responseRate}%`}
                  />
                  <div 
                    className="w-3 h-3 bg-blue-500 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform absolute left-0"
                    style={{ transform: `translateY(-${(point.survivalRate / 100) * 140}px)` }}
                    title={`Survival: ${point.survivalRate}%`}
                  />
                  <div 
                    className="w-3 h-3 bg-purple-500 rounded-full shadow-sm cursor-pointer hover:scale-125 transition-transform absolute left-0"
                    style={{ transform: `translateY(-${(point.qualityOfLife / 100) * 140}px)` }}
                    title={`QoL: ${point.qualityOfLife}%`}
                  />
                </div>
                
                {/* Time labels */}
                <div className="text-xs text-gray-600 text-center">
                  <div>Month</div>
                  <div className="font-semibold">{point.month}</div>
                </div>
                
                {/* Detailed view additional info */}
                {detailed && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-lg border text-xs z-10 opacity-0 hover:opacity-100 transition-opacity">
                    <div>Response: {point.responseRate}%</div>
                    <div>Survival: {point.survivalRate}%</div>
                    <div>QoL: {point.qualityOfLife}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Trend lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="responseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.1"/>
              </linearGradient>
            </defs>
            
            {/* Response rate trend line */}
            <path
              d={`M ${timePoints.map((point: any, index: number) => 
                `${(index / (timePoints.length - 1)) * 100}% ${100 - (point.responseRate)}%`
              ).join(' L ')}`}
              className="stroke-green-500 stroke-2 fill-none"
              style={{ strokeDasharray: animatedCharts ? '5,5' : 'none' }}
            />
          </svg>
        </div>
      </div>
    );
  };

  const OutcomePredictionChart: React.FC<{ protocol: TreatmentProtocol }> = ({ protocol }) => {
    const outcomes = [
      { label: 'Response Rate', value: protocol.expectedOutcome.responseRate, color: 'bg-green-500', target: 85 },
      { label: 'Survival Benefit', value: protocol.expectedOutcome.survivalBenefit, color: 'bg-blue-500', target: 80 },
      { label: 'Quality of Life', value: protocol.expectedOutcome.qualityOfLife, color: 'bg-purple-500', target: 75 },
      { label: 'Confidence', value: protocol.expectedOutcome.confidence, color: 'bg-orange-500', target: 90 }
    ];

    return (
      <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-semibold text-gray-900">Outcome Predictions vs Targets</h6>
          <div className="text-xs text-gray-600">Genomic Compatibility: {protocol.genomicCompatibility}%</div>
        </div>
        
        <div className="space-y-4">
          {outcomes.map((outcome, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{outcome.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{outcome.value}%</span>
                  <span className="text-xs text-gray-500">Target: {outcome.target}%</span>
                </div>
              </div>
              
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                {/* Target indicator */}
                <div 
                  className="absolute top-0 h-full w-0.5 bg-gray-600 z-10"
                  style={{ left: `${outcome.target}%` }}
                  title={`Target: ${outcome.target}%`}
                />
                
                {/* Progress bar */}
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${outcome.color}`}
                  style={{ 
                    width: animatedCharts ? `${outcome.value}%` : '0%',
                    background: outcome.value >= outcome.target 
                      ? `linear-gradient(90deg, ${outcome.color.replace('bg-', '').replace('-500', '')}, #10B981)`
                      : undefined
                  }}
                />
                
                {/* Value indicator */}
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-600 rounded-full shadow-sm"
                  style={{ left: `calc(${outcome.value}% - 6px)` }}
                />
              </div>
              
              {/* Performance indicator */}
              <div className="flex justify-end mt-1">
                {outcome.value >= outcome.target ? (
                  <span className="text-xs text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Above target
                  </span>
                ) : (
                  <span className="text-xs text-orange-600 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    Below target
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BiomarkerTrendChart: React.FC<{ data: any }> = ({ data }) => {
    const biomarkers = data?.biomarkerPredictions || {};
    
    return (
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-semibold text-gray-900">Biomarker Trends</h6>
          <div className="text-xs text-gray-600">Predicted trajectory over 24 months</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(biomarkers).map(([biomarker, data]: [string, any]) => (
            <div key={biomarker} className="bg-white p-3 rounded border">
              <div className="flex items-center justify-between mb-2">
                <h7 className="font-medium text-gray-900">{biomarker}</h7>
                <span className="text-xs text-gray-600">Baseline: {data.baseline}</span>
              </div>
              
              <div className="relative h-20">
                <div className="flex items-end justify-between h-full">
                  {data.predicted.map((value: number, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500"
                        style={{ 
                          height: `${Math.max((1 - value / data.baseline) * 60, 5)}px`,
                          opacity: animatedCharts ? 1 : 0.3
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1">{index * 6}m</span>
                    </div>
                  ))}
                </div>
                
                {/* Baseline reference line */}
                <div className="absolute w-full border-t border-dashed border-gray-400 opacity-50" style={{ top: '60px' }}>
                  <span className="absolute -left-12 -top-2 text-xs text-gray-500">Baseline</span>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-600">
                Current trend: {data.predicted[data.predicted.length - 1] < data.baseline ? 
                  <span className="text-green-600">Improving ↓</span> : 
                  <span className="text-red-600">Worsening ↑</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RiskMatrix: React.FC<{ genomicProfile: GenomicProfile | null }> = ({ genomicProfile }) => {
    if (!genomicProfile) return null;
    
    const riskFactors = [
      { 
        name: 'CYP2D6', 
        risk: genomicProfile.pharmacogenomics.metabolizerStatus['CYP2D6']?.phenotype === 'Poor' ? 0.8 : 
              genomicProfile.pharmacogenomics.metabolizerStatus['CYP2D6']?.phenotype === 'Intermediate' ? 0.6 : 0.3,
        category: 'Metabolism'
      },
      { 
        name: 'HLA-B*5701', 
        risk: genomicProfile.pharmacogenomics.hlaRisks.find(r => r.allele === 'HLA-B*5701') ? 0.9 : 0.1,
        category: 'Hypersensitivity'
      },
      { 
        name: 'TPMT', 
        risk: genomicProfile.pharmacogenomics.metabolizerStatus['TPMT']?.phenotype === 'Poor' ? 0.8 : 
              genomicProfile.pharmacogenomics.metabolizerStatus['TPMT']?.phenotype === 'Intermediate' ? 0.5 : 0.2,
        category: 'Toxicity'
      },
      { 
        name: 'UGT1A1', 
        risk: genomicProfile.pharmacogenomics.otherBiomarkers.find(b => b.gene === 'UGT1A1') ? 0.7 : 0.3,
        category: 'Clearance'
      }
    ];

    const categories = ['Metabolism', 'Hypersensitivity', 'Toxicity', 'Clearance'];
    
    return (
      <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h6 className="font-semibold text-gray-900">Genomic Risk Heat Map</h6>
          <div className="flex items-center space-x-2 text-xs">
            <span>Low</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <div className="w-3 h-3 bg-yellow-200 rounded"></div>
              <div className="w-3 h-3 bg-orange-200 rounded"></div>
              <div className="w-3 h-3 bg-red-200 rounded"></div>
            </div>
            <span>High</span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {categories.map((category) => (
            <div key={category} className="text-center">
              <div className="text-xs font-medium text-gray-700 mb-2">{category}</div>
              <div className="space-y-1">
                {riskFactors.filter(f => f.category === category).map((factor) => (
                  <div key={factor.name} className="relative group">
                    <div 
                      className={`h-8 rounded cursor-pointer transition-all duration-300 ${
                        factor.risk >= 0.8 ? 'bg-red-400 hover:bg-red-500' :
                        factor.risk >= 0.6 ? 'bg-orange-400 hover:bg-orange-500' :
                        factor.risk >= 0.4 ? 'bg-yellow-400 hover:bg-yellow-500' :
                        'bg-green-400 hover:bg-green-500'
                      }`}
                      style={{ opacity: 0.7 + (factor.risk * 0.3) }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                      {factor.name}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                      Risk Score: {(factor.risk * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>High Risk Factors:</strong>
              <ul className="mt-1 space-y-1">
                {riskFactors.filter(f => f.risk >= 0.7).map(f => (
                  <li key={f.name} className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Overall Risk Score:</strong>
              <div className="mt-1 text-lg font-bold text-orange-600">
                {(genomicProfile.pharmacogenomics.overallRiskScore * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEvidenceBadge = (level: string) => {
    const colors = {
      'I': 'bg-green-100 text-green-800',
      'II': 'bg-blue-100 text-blue-800',
      'III': 'bg-yellow-100 text-yellow-800',
      'IV': 'bg-gray-100 text-gray-800'
    };
    return colors[level as keyof typeof colors] || colors['IV'];
  };

  // Wizard steps configuration
  const wizardSteps = [
    { id: 'setup', title: 'Patient Setup', description: 'Review genomic profile and AI insights', icon: Target },
    { id: 'review', title: 'Protocol Review', description: 'Select and customize treatment protocols', icon: FileText },
    { id: 'simulate', title: 'Simulate Options', description: 'Explore treatment scenarios', icon: Calculator },
    { id: 'results', title: 'View Results', description: 'Analyze predictions and outcomes', icon: BarChart3 }
  ];

  const getCurrentStepIndex = () => wizardSteps.findIndex(step => step.id === currentStep);
  const isStepCompleted = (stepId: string) => {
    const stepIndex = wizardSteps.findIndex(step => step.id === stepId);
    const currentIndex = getCurrentStepIndex();
    return stepIndex < currentIndex;
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'setup': return genomicProfile && aiInsights.length > 0;
      case 'review': return selectedProtocol;
      case 'simulate': return simulationState.scenarios.length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < wizardSteps.length - 1) {
      setCurrentStep(wizardSteps[currentIndex + 1].id as any);
    }
  };

  const previousStep = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(wizardSteps[currentIndex - 1].id as any);
    }
  };

  const getStepTooltip = (stepId: string) => {
    const tooltips = {
      'setup': 'Load and analyze patient genomic data, view AI-generated treatment insights and compatibility scores.',
      'review': 'Compare different treatment protocols, see efficacy predictions and select the best option for your patient.',
      'simulate': 'Modify treatment parameters, explore alternative dosing schedules, and compare predicted outcomes.',
      'results': 'View comprehensive predictions, outcome timelines, biomarker trends, and risk assessments.'
    };
    return tooltips[stepId as keyof typeof tooltips] || 'Treatment planning step';
  };

  if (loading && !protocols.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg">Analyzing genomic profile and generating treatment protocols...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Getting Started */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Treatment Planner</h1>
            <p className="text-gray-600">Step-by-step genomic-optimized treatment planning</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {isFirstTime && (
            <button
              onClick={() => setShowGuidedTour(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Take Tour</span>
            </button>
          )}
          <div className="flex items-center space-x-2">
            <Dna className="w-5 h-5 text-green-600" />
            <Tooltip 
              content="Genomic compatibility score indicates how well your patient's genetic profile matches with available treatments. Higher scores suggest better predicted outcomes."
              type="clinical"
              position="bottom-left"
            >
              <span className="text-sm font-medium text-green-600 cursor-help border-b border-dotted border-green-400">
                {genomicProfile?.riskScore ? `${(genomicProfile.riskScore * 100).toFixed(0)}% compatibility` : 'Loading...'}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Progress Wizard */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Treatment Planning Workflow</h2>
            <span className="text-sm text-gray-500">
              Step {getCurrentStepIndex() + 1} of {wizardSteps.length}
            </span>
          </div>
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8">
            {wizardSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = isStepCompleted(step.id);
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${index !== wizardSteps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      isActive 
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : isCompleted 
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                      <Tooltip 
                        content={getStepTooltip(step.id)}
                        type="help"
                        position="bottom"
                      >
                        <div className="text-xs text-gray-400 max-w-20 cursor-help">
                          {step.description}
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                  {index !== wizardSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousStep}
              disabled={getCurrentStepIndex() === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm">← Previous</span>
            </button>
            
            <div className="text-sm text-gray-500">
              {wizardSteps[getCurrentStepIndex()].description}
            </div>
            
            <button
              onClick={nextStep}
              disabled={!canProceedToNextStep() || getCurrentStepIndex() === wizardSteps.length - 1}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="text-sm">Next →</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Step Content with Progressive Disclosure */}
      {currentStep === 'setup' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Step 1: Patient Setup & AI Insights</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Review your patient's genomic profile and get AI-powered insights to guide treatment planning.
            </p>
            {!genomicProfile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Loading genomic data and generating insights...</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">This usually takes 10-15 seconds</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* AI Insights Panel - Only show in setup step */}
      {currentStep === 'setup' && (
        <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">AI-Generated Insights</h3>
            <Tooltip 
              content="These insights are generated by analyzing your patient's genomic profile against current clinical evidence and treatment databases."
              type="help"
              iconOnly
            />
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getPriorityIcon(insight.priority)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{insight.description}</p>
                  <p className="text-xs text-gray-500">Source: {insight.source}</p>
                </div>
                {insight.actionable && (
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Act
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
      )}

      {/* Simulation Step */}
      {currentStep === 'simulate' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calculator className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Step 3: Treatment Simulation</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Explore different treatment scenarios and see predicted outcomes for various modifications.
            </p>
          </div>
        </Card>
      )}

      {/* Interactive Treatment Simulator - Only show in simulate step */}
      {currentStep === 'simulate' && (
        <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Calculator className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Treatment Simulator</h3>
                <p className="text-sm text-gray-600">Explore "what-if" scenarios and optimize treatment plans</p>
              </div>
            </div>
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showSimulator 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {showSimulator ? 'Hide Simulator' : 'Open Simulator'}
            </button>
          </div>

          {showSimulator && (
            <div className="space-y-6">
              {/* Simulation Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Scenario Parameters</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage Adjustment: {scenarioParameters.dosageReduction}%
                      </label>
                      <input
                        type="range"
                        min="-50"
                        max="25"
                        step="5"
                        value={scenarioParameters.dosageReduction}
                        onChange={(e) => setScenarioParameters(prev => ({ 
                          ...prev, 
                          dosageReduction: Number(e.target.value) 
                        }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-50% (Reduce)</span>
                        <span>0% (Standard)</span>
                        <span>+25% (Intensify)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scenarioParameters.addSupportiveCare}
                          onChange={(e) => setScenarioParameters(prev => ({ 
                            ...prev, 
                            addSupportiveCare: e.target.checked 
                          }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Add enhanced supportive care</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scenarioParameters.alternativeSchedule}
                          onChange={(e) => setScenarioParameters(prev => ({ 
                            ...prev, 
                            alternativeSchedule: e.target.checked 
                          }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Modified infusion schedule</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={scenarioParameters.combinationTherapy}
                          onChange={(e) => setScenarioParameters(prev => ({ 
                            ...prev, 
                            combinationTherapy: e.target.checked 
                          }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Add combination therapy</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Simulation Controls</h4>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => selectedProtocol && generateScenarios(selectedProtocol)}
                        disabled={!selectedProtocol || loading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Generate Scenarios</span>
                      </button>
                      
                      <button
                        onClick={resetSimulation}
                        disabled={!simulationState.scenarios.length}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset</span>
                      </button>
                    </div>

                    {simulationState.isRunning && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Simulation Progress
                          </span>
                          <span className="text-sm text-gray-600">
                            {simulationState.currentStep}/{simulationState.totalSteps}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(simulationState.currentStep / simulationState.totalSteps) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scenario Results */}
              {simulationState.scenarios.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Generated Scenarios</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {simulationState.scenarios.map((scenario) => (
                      <div key={scenario.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{scenario.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            scenario.riskProfile.severity === 'low' 
                              ? 'bg-green-100 text-green-800'
                              : scenario.riskProfile.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {scenario.riskProfile.severity} risk
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Response Rate:</span>
                            <span className="font-medium text-green-600">{scenario.predictedOutcomes.responseRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Quality of Life:</span>
                            <span className="font-medium text-blue-600">{scenario.predictedOutcomes.qualityOfLife}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Toxicity Reduction:</span>
                            <span className={`font-medium ${scenario.predictedOutcomes.toxicityReduction >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scenario.predictedOutcomes.toxicityReduction >= 0 ? '+' : ''}{scenario.predictedOutcomes.toxicityReduction}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Confidence:</span>
                            <span className="font-medium text-purple-600">{scenario.predictedOutcomes.confidence}%</span>
                          </div>
                        </div>

                        <button
                          onClick={() => runSimulation(scenario)}
                          disabled={simulationState.isRunning}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                          <Play className="w-4 h-4" />
                          <span>Run Simulation</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparison View */}
              {simulationState.comparison && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Scenario Comparison</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metric
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Baseline
                          </th>
                          {simulationState.comparison.scenarios.map((scenario) => (
                            <th key={scenario.id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {scenario.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Response Rate</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{simulationState.comparison.baseline.expectedOutcome.responseRate}%</td>
                          {simulationState.comparison.scenarios.map((scenario) => (
                            <td key={`${scenario.id}-response`} className="px-4 py-3 text-sm text-gray-600">
                              {scenario.predictedOutcomes.responseRate}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Quality of Life</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{simulationState.comparison.baseline.expectedOutcome.qualityOfLife}%</td>
                          {simulationState.comparison.scenarios.map((scenario) => (
                            <td key={`${scenario.id}-qol`} className="px-4 py-3 text-sm text-gray-600">
                              {scenario.predictedOutcomes.qualityOfLife}%
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">Survival Benefit</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{simulationState.comparison.baseline.expectedOutcome.survivalBenefit}%</td>
                          {simulationState.comparison.scenarios.map((scenario) => (
                            <td key={`${scenario.id}-survival`} className="px-4 py-3 text-sm text-gray-600">
                              {scenario.predictedOutcomes.survivalBenefit}%
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
      )}

      {/* Genomic Biomarker Analysis */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Microscope className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Genomic Biomarker Analysis</h3>
                <p className="text-sm text-gray-600">Comprehensive pharmacogenomics and biomarker assessment</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => selectedProtocol && analyzePharmacogenomics(selectedProtocol.drugs.map(d => d.name))}
                disabled={!selectedProtocol || genomicAnalysisLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <FlaskConical className="w-4 h-4" />
                <span>{genomicAnalysisLoading ? 'Analyzing...' : 'Analyze Genomics'}</span>
              </button>
              <button
                onClick={() => setShowGenomicAnalysis(!showGenomicAnalysis)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showGenomicAnalysis 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {showGenomicAnalysis ? 'Hide Analysis' : 'Show Analysis'}
              </button>
            </div>
          </div>

          {genomicAnalysisLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-lg text-gray-600">Running comprehensive pharmacogenomic analysis...</span>
            </div>
          )}

          {showGenomicAnalysis && genomicProfile && (
            <div className="space-y-6">
              {/* Pharmacogenomic Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Dna className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-900">Metabolizer Profile</h4>
                  </div>
                  <div className="text-2xl font-bold text-indigo-700">
                    {Object.keys(genomicProfile.pharmacogenomics.metabolizerStatus).length}
                  </div>
                  <div className="text-sm text-indigo-600">Genes analyzed</div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-900">HLA Risks</h4>
                  </div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {genomicProfile.pharmacogenomics.hlaRisks.length}
                  </div>
                  <div className="text-sm text-yellow-600">Risk alleles detected</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Risk Score</h4>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {(genomicProfile.pharmacogenomics.overallRiskScore * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-green-600">Overall safety</div>
                </div>
              </div>

              {/* Metabolizer Status Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Database className="w-5 h-5 text-purple-600 mr-2" />
                  Pharmacogenomic Profile
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(genomicProfile.pharmacogenomics.metabolizerStatus).map(([gene, data]) => (
                    <div key={gene} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{data.gene}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">Genotype: {data.genotype}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getMetabolizerColor(data.phenotype)}`}>
                              {data.phenotype} Metabolizer
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">{data.activityScore}</div>
                          <div className="text-xs text-gray-500">Activity Score</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Clinical Implications:</h6>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {data.clinicalImplications.map((implication, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{implication}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-2">Drug Recommendations:</h6>
                        <div className="space-y-2">
                          {data.drugRecommendations.slice(0, 2).map((rec, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{rec.drug}</span>
                                <span className={`px-2 py-0.5 rounded ${getRecommendationColor(rec.recommendation)}`}>
                                  {rec.recommendation}
                                </span>
                              </div>
                              <p className="text-gray-600">{rec.rationale}</p>
                              {rec.dosageAdjustment && (
                                <p className="text-indigo-600 font-medium mt-1">Dose: {rec.dosageAdjustment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HLA Risk Assessment */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  HLA-Associated Drug Risks
                </h4>
                <div className="space-y-3">
                  {genomicProfile.pharmacogenomics.hlaRisks.map((risk, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${getRiskLevelColor(risk.riskLevel)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{risk.allele}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">Risk Type: {risk.riskType}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskLevelColor(risk.riskLevel)}`}>
                              {risk.riskLevel} Risk
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">Affected Drugs:</div>
                          <div className="text-xs text-gray-600">{risk.drugs.join(', ')}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Clinical Recommendations:</h6>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {risk.recommendations.map((rec, recIndex) => (
                            <li key={recIndex} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Biomarkers */}
              {genomicProfile.pharmacogenomics.otherBiomarkers.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Beaker className="w-5 h-5 text-green-600 mr-2" />
                    Additional Biomarkers
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {genomicProfile.pharmacogenomics.otherBiomarkers.map((biomarker, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-semibold text-gray-900">{biomarker.gene}</h5>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {biomarker.variant}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{biomarker.impact}</p>
                        <div className="text-xs text-gray-500 mb-2">
                          <strong>Affected drugs:</strong> {biomarker.affectedDrugs.join(', ')}
                        </div>
                        <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <strong>Recommendation:</strong> {biomarker.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pharmacogenomic Analysis Results */}
              {pharmacogenomicResults && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    Treatment-Specific Analysis
                  </h4>
                  <div className="space-y-4">
                    {/* Clinical Decision Support Alerts */}
                    {pharmacogenomicResults.clinicalDecisionSupport.alerts.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Clinical Alerts:</h5>
                        <div className="space-y-2">
                          {pharmacogenomicResults.clinicalDecisionSupport.alerts.map((alert: any, index: number) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                              alert.level === 'High' ? 'bg-red-50 border-red-500 text-red-700' :
                              alert.level === 'Medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' :
                              'bg-blue-50 border-blue-500 text-blue-700'
                            }`}>
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-medium">{alert.message}</p>
                                  <p className="text-sm mt-1">Action: {alert.action}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drug-Specific Analysis */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Drug-Specific Genomic Assessment:</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drug</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficacy</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toxicity Risk</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosing</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {pharmacogenomicResults.drugAnalysis.map((analysis: any, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{analysis.drug}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-xs font-medium px-2 py-1 rounded ${getRiskLevelColor(analysis.riskAssessment.overallRisk)}`}>
                                    {analysis.riskAssessment.overallRisk}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{analysis.riskAssessment.efficacyPrediction}%</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{analysis.riskAssessment.toxicityRisk}%</td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {pharmacogenomicResults.clinicalDecisionSupport.dosingGuidance.find((d: any) => d.drug === analysis.drug)?.recommendedDose || 'Standard'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Clinical Trial Integration */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TestTube className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Clinical Trial Matcher</h3>
                <p className="text-sm text-gray-600">Find trials matching your treatment plan and patient profile</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => searchMatchingTrials(selectedProtocol)}
                disabled={!selectedProtocol || trialMatchLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <TestTube className="w-4 h-4" />
                <span>{trialMatchLoading ? 'Searching...' : 'Find Matching Trials'}</span>
              </button>
              <button
                onClick={() => setShowTrialMatcher(!showTrialMatcher)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showTrialMatcher 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {showTrialMatcher ? 'Hide Trials' : 'Show Trial Details'}
              </button>
            </div>
          </div>

          {/* Trial Search Summary */}
          {trialMatchResult && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{trialMatchResult.totalMatches}</div>
                  <div className="text-sm text-green-600">Total Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{trialMatchResult.highConfidenceMatches}</div>
                  <div className="text-sm text-blue-600">High Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{trialMatchResult.alternativeTrials.length}</div>
                  <div className="text-sm text-purple-600">Alternative Options</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{trialMatchResult.eligibilityGaps.length}</div>
                  <div className="text-sm text-orange-600">Eligibility Gaps</div>
                </div>
              </div>
            </div>
          )}

          {trialMatchLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-lg text-gray-600">Analyzing patient profile and searching trials...</span>
            </div>
          )}

          {showTrialMatcher && trialMatchResult && (
            <div className="space-y-6">
              {/* High Confidence Matches */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  High Confidence Matches ({trialMatchResult.highConfidenceMatches})
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {trialMatchResult.matchedTrials.filter(t => t.eligibilityScore >= 90).map((trial) => (
                    <div key={trial.nct_id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-mono text-sm text-blue-600">{trial.nct_id}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getTrialPhaseColor(trial.phase)}`}>
                              {trial.phase}
                            </span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {trial.status}
                            </span>
                          </div>
                          <h5 className="font-semibold text-gray-900 mb-2">{trial.title}</h5>
                          <p className="text-sm text-gray-600 mb-2">{trial.condition}</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getEligibilityScoreColor(trial.eligibilityScore)}`}>
                            {trial.eligibilityScore}%
                          </div>
                          <div className="text-xs text-gray-500">Match Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Location & Contact:</h6>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{trial.location.name}</span>
                            </div>
                            <div>{trial.location.city}, {trial.location.state}</div>
                            {trial.location.distance && (
                              <div className="text-blue-600">{trial.location.distance} km away</div>
                            )}
                            <div className="mt-1">
                              <span className="font-medium">{trial.contact.name}</span>
                              <div>{trial.contact.phone}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-1">Enrollment Status:</h6>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{trial.enrollmentStatus.current}/{trial.enrollmentStatus.target} enrolled</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Est. completion: {trial.enrollmentStatus.estimatedCompletion}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(trial.enrollmentStatus.current / trial.enrollmentStatus.target) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Why this trial matches:</h6>
                        <div className="flex flex-wrap gap-2">
                          {trial.matchReasons.map((reason, index) => (
                            <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Key Eligibility:</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div><strong>Age:</strong> {trial.keyEligibility.ageRange}</div>
                          <div><strong>Performance:</strong> {trial.keyEligibility.performanceStatus}</div>
                          <div><strong>Prior Tx:</strong> {trial.keyEligibility.priorTreatments}</div>
                          <div><strong>Biomarkers:</strong> {trial.keyEligibility.biomarkerRequirements.join(', ')}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-green-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(`tel:${trial.contact.phone}`)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => window.open(`mailto:${trial.contact.email}`)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email</span>
                          </button>
                          <button
                            onClick={() => window.open(`https://clinicaltrials.gov/ct2/show/${trial.nct_id}`, '_blank')}
                            className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                        </div>
                        <button
                          onClick={() => setSelectedTrial(selectedTrial?.nct_id === trial.nct_id ? null : trial)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200"
                        >
                          {selectedTrial?.nct_id === trial.nct_id ? 'Hide Details' : 'Show Full Details'}
                        </button>
                      </div>

                      {/* Expanded Trial Details */}
                      {selectedTrial?.nct_id === trial.nct_id && (
                        <div className="mt-4 pt-4 border-t border-green-200 space-y-3">
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-1">Interventions:</h6>
                            <div className="flex flex-wrap gap-2">
                              {trial.interventions.map((intervention, index) => (
                                <span key={index} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                  {intervention}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 mb-1">Required Biomarkers:</h6>
                            <div className="flex flex-wrap gap-2">
                              {trial.biomarkers.map((biomarker, index) => (
                                <span key={index} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                                  {biomarker}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Trials */}
              {trialMatchResult.alternativeTrials.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Filter className="w-5 h-5 text-blue-500 mr-2" />
                    Alternative Options ({trialMatchResult.alternativeTrials.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trialMatchResult.alternativeTrials.map((trial) => (
                      <div key={trial.nct_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono text-sm text-blue-600">{trial.nct_id}</span>
                              <span className={`text-xs font-medium px-2 py-1 rounded ${getTrialPhaseColor(trial.phase)}`}>
                                {trial.phase}
                              </span>
                            </div>
                            <h5 className="font-medium text-gray-900 text-sm">{trial.title}</h5>
                          </div>
                          <div className={`text-lg font-bold ${getEligibilityScoreColor(trial.eligibilityScore)}`}>
                            {trial.eligibilityScore}%
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <div>{trial.location.city}, {trial.location.state}</div>
                          {trial.location.distance && (
                            <div className="text-blue-600">{trial.location.distance} km away</div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => window.open(`https://clinicaltrials.gov/ct2/show/${trial.nct_id}`, '_blank')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Gaps */}
              {trialMatchResult.eligibilityGaps.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                    Eligibility Considerations ({trialMatchResult.eligibilityGaps.length})
                  </h4>
                  <div className="space-y-3">
                    {trialMatchResult.eligibilityGaps.map((gap, index) => (
                      <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-1">{gap.criteria}</h5>
                            <div className="text-sm text-gray-600 mb-2">
                              <div><strong>Current:</strong> {gap.currentValue}</div>
                              <div><strong>Required:</strong> {gap.requiredValue}</div>
                            </div>
                            <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
                              <strong>Action needed:</strong> {gap.actionNeeded}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Protocol Review Step */}
      {currentStep === 'review' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Step 2: Protocol Review & Selection</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Choose the most suitable treatment protocol based on genomic compatibility and expected outcomes.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ready to Review Protocols</span>
              </div>
              <p className="text-xs text-green-600">
                {protocols.length} protocols available • Look for high genomic compatibility scores ({'>'}80%) • Consider evidence levels I-II for best outcomes
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Treatment Protocols - Only show in review step */}
      {currentStep === 'review' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {protocols.map((protocol) => (
          <Card 
            key={protocol.id}
            className={`cursor-pointer transition-all ${
              selectedProtocol?.id === protocol.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
            }`}
            onClick={() => {
              setSelectedProtocol(protocol);
              generatePredictions(protocol);
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{protocol.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getEvidenceBadge(protocol.evidenceLevel)}`}>
                      Evidence Level {protocol.evidenceLevel}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {protocol.genomicCompatibility}% genomic match
                    </span>
                  </div>
                </div>
                <Target className="w-6 h-6 text-blue-600" />
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-lg font-semibold text-green-600">{protocol.expectedOutcome.responseRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-semibold text-blue-600">{protocol.expectedOutcome.confidence}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Key Drugs:</p>
                  <div className="space-y-1">
                    {protocol.drugs.slice(0, 2).map((drug, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{drug.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">{drug.efficacyPrediction}%</span>
                          <Shield className="w-3 h-3 text-blue-500" />
                          <span className="text-blue-600">{drug.safetyScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Duration: {protocol.duration}</span>
                  <span className="text-sm font-medium text-gray-900">${protocol.cost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        </div>
      )}

      {/* Detailed Protocol View - Only show in review step */}
      {currentStep === 'review' && selectedProtocol && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Detailed Protocol Analysis</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Drug Details */}
              <div className="lg:col-span-2">
                <h4 className="font-semibold text-gray-900 mb-3">Genomic-Optimized Drug Regimen</h4>
                <div className="space-y-4">
                  {selectedProtocol.drugs.map((drug, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{drug.name}</h5>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Efficacy: {drug.efficacyPrediction}%
                          </span>
                          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Safety: {drug.safetyScore}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Dosing:</strong> {drug.dosing}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Genomic Optimization:</strong> {drug.genomicOptimization}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcome Predictions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Predicted Outcomes</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">Response Rate</span>
                    <span className="font-semibold text-green-800">{selectedProtocol.expectedOutcome.responseRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">Survival Benefit</span>
                    <span className="font-semibold text-blue-800">{selectedProtocol.expectedOutcome.survivalBenefit}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-700">Quality of Life</span>
                    <span className="font-semibold text-purple-800">{selectedProtocol.expectedOutcome.qualityOfLife}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm text-yellow-700">AI Confidence</span>
                    <span className="font-semibold text-yellow-800">{selectedProtocol.expectedOutcome.confidence}%</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Monitoring Requirements</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedProtocol.monitoring.map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Step */}
      {currentStep === 'results' && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Step 4: Results & Analysis</h3>
            </div>
            <p className="text-gray-600 mb-6">
              View detailed predictions, outcomes, and visualizations for your selected treatment approach.
            </p>
          </div>
        </Card>
      )}

      {/* Enhanced Visualization Panel - Only show in results step */}
      {currentStep === 'results' && (
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Enhanced Visualizations</h3>
                <p className="text-sm text-gray-600">Interactive charts and analytics for treatment insights</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setAnimatedCharts(!animatedCharts)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  animatedCharts ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Animations</span>
              </button>
              <button
                onClick={() => setShowVisualizationPanel(!showVisualizationPanel)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  showVisualizationPanel 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                {showVisualizationPanel ? 'Hide Charts' : 'Show Charts'}
              </button>
            </div>
          </div>

          {showVisualizationPanel && (
            <div className="space-y-6">
              {/* Visualization Selector */}
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { key: 'timeline', label: 'Timeline', icon: TimelineIcon },
                    { key: 'outcomes', label: 'Outcomes', icon: Target },
                    { key: 'biomarkers', label: 'Biomarkers', icon: Activity },
                    { key: 'risk-matrix', label: 'Risk Matrix', icon: Layers }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedVisualization(key as any)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedVisualization === key
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualization Content */}
              <div className="transition-all duration-300">
                {selectedVisualization === 'timeline' && predictionResults && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Treatment Response Timeline</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setTimelineView('overview')}
                          className={`px-3 py-1 rounded text-sm ${
                            timelineView === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          Overview
                        </button>
                        <button
                          onClick={() => setTimelineView('detailed')}
                          className={`px-3 py-1 rounded text-sm ${
                            timelineView === 'detailed' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                          }`}
                        >
                          Detailed
                        </button>
                      </div>
                    </div>
                    <TimelineChart data={predictionResults} detailed={timelineView === 'detailed'} />
                  </div>
                )}

                {selectedVisualization === 'outcomes' && selectedProtocol && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Outcome Predictions Analysis</h4>
                    <OutcomePredictionChart protocol={selectedProtocol} />
                  </div>
                )}

                {selectedVisualization === 'biomarkers' && predictionResults && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Biomarker Trend Analysis</h4>
                    <BiomarkerTrendChart data={predictionResults} />
                  </div>
                )}

                {selectedVisualization === 'risk-matrix' && genomicProfile && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Genomic Risk Assessment</h4>
                    <RiskMatrix genomicProfile={genomicProfile} />
                  </div>
                )}
              </div>

              {/* Chart Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MousePointer className="w-4 h-4" />
                    <span>Interactive elements enabled</span>
                  </div>
                  {chartInteractions && (
                    <div className="flex items-center space-x-2">
                      <Maximize2 className="w-4 h-4" />
                      <span>Click elements for details</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartInteractions(!chartInteractions)}
                    className={`px-3 py-1 rounded text-sm ${
                      chartInteractions ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {chartInteractions ? 'Interactive' : 'Static'}
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                    onClick={() => {
                      alert('Chart export functionality would be implemented here');
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
      )}

      {predictionResults && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-semibold">AI Outcome Predictions</h3>
              {loading && <LoadingSpinner size="sm" />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Treatment Timeline</h4>
                <div className="space-y-2">
                  {predictionResults.outcomeTimeline.map((point: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">Month {point.month}</span>
                      <div className="flex space-x-4 text-sm">
                        <span className="text-green-600">Response: {point.responseRate}%</span>
                        <span className="text-blue-600">Survival: {point.survivalRate}%</span>
                        <span className="text-purple-600">QoL: {point.qualityOfLife}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Risk Assessment</h4>
                <div className="space-y-2">
                  {predictionResults.riskFactors.map((risk: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{risk.factor}</span>
                        <span className={`text-sm font-semibold ${risk.risk < 25 ? 'text-green-600' : risk.risk < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {risk.risk}% risk
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Guided Tour Overlay */}
      {showGuidedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Welcome to AI Treatment Planner!</h3>
                  <p className="text-sm text-gray-600">Let's get you started with genomic-optimized treatment planning</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 How it works:</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li><strong>Step 1:</strong> Review genomic profile and AI insights</li>
                    <li><strong>Step 2:</strong> Compare and select treatment protocols</li>
                    <li><strong>Step 3:</strong> Simulate different treatment scenarios</li>
                    <li><strong>Step 4:</strong> Analyze predictions and outcomes</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💡 Pro Tips:</h4>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Hover over terms with dotted underlines for explanations</li>
                    <li>• Look for help icons (?) for detailed information</li>
                    <li>• Use the workflow progress bar to navigate steps</li>
                    <li>• Each step builds on the previous one</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setIsFirstTime(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Don't show again
                </button>
                <button
                  onClick={() => setShowGuidedTour(false)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TreatmentPlannerWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="AI Treatment Planner"
      fallbackMessage="The AI Treatment Planner is temporarily unavailable. This advanced feature requires AI processing and genomic analysis."
    >
      <TreatmentPlanner />
    </FeatureErrorBoundary>
  );
};

export default TreatmentPlannerWithBoundary;