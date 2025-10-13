import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Calendar, Award, ExternalLink, CheckCircle, XCircle, Clock, Zap, Brain, Target, FileText, AlertTriangle } from 'lucide-react';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

interface PatientProfile {
  demographics: {
    age: number;
    gender: string;
    ethnicity: string;
    location: { lat: number; lng: number; city: string; state: string; };
  };
  medical: {
    cancerType: string;
    subtype: string;
    stage: string;
    ecogStatus: number;
    priorTreatments: string[];
    currentTreatment?: string;
    progressionDate?: string;
  };
  genomics: {
    mutations: Record<string, string>;
    biomarkers: Record<string, number>;
    hlaTypes: string[];
    microsatelliteStatus: string;
    tumorMutationalBurden: number;
  };
  laboratory: {
    hemoglobin: number;
    platelets: number;
    neutrophils: number;
    creatinine: number;
    bilirubin: number;
    ast: number;
    alt: number;
  };
  comorbidities: string[];
  insurance: string;
}

interface ClinicalTrial {
  nctId: string;
  title: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV';
  status: 'Recruiting' | 'Active' | 'Completed' | 'Terminated';
  sponsor: string;
  studyType: string;
  interventions: Array<{
    type: string;
    name: string;
    description: string;
  }>;
  conditions: string[];
  eligibility: {
    criteria: string[];
    genderBased: boolean;
    minimumAge: number;
    maximumAge: number;
    healthyVolunteers: boolean;
  };
  locations: Array<{
    facility: string;
    city: string;
    state: string;
    country: string;
    status: string;
    distance: number;
    contactInfo: {
      name: string;
      phone: string;
      email: string;
    };
  }>;
  primaryOutcome: string;
  secondaryOutcomes: string[];
  estimatedEnrollment: number;
  studyStartDate: string;
  estimatedCompletionDate: string;
  lastUpdate: string;
  matchScore: number;
  matchReasons: Array<{
    category: 'genomic' | 'demographic' | 'medical' | 'laboratory';
    criterion: string;
    status: 'match' | 'partial' | 'fail';
    weight: number;
  }>;
  enrollmentPrediction: {
    likelihood: number;
    timeToEnrollment: number;
    competingTrials: number;
    sites: number;
  };
  aiInsights: Array<{
    type: 'advantage' | 'concern' | 'requirement';
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface EnrollmentProcess {
  trialId: string;
  status: 'initiated' | 'screening' | 'approved' | 'enrolled' | 'declined';
  steps: Array<{
    step: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    completedDate?: string;
    notes?: string;
  }>;
  documents: Array<{
    name: string;
    type: 'consent' | 'screening' | 'labs' | 'imaging';
    status: 'required' | 'submitted' | 'reviewed' | 'approved';
    uploadDate?: string;
  }>;
  timeline: {
    initiated: string;
    estimatedDecision: string;
    estimatedStart?: string;
  };
}

const TrialMatcher: React.FC = () => {
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [enrollmentProcesses, setEnrollmentProcesses] = useState<EnrollmentProcess[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    phase: '',
    distance: 100,
    enrollmentStatus: 'recruiting',
    genomicMatch: true,
    priorityMatch: 'high'
  });
  const [autoEnrollment, setAutoEnrollment] = useState(false);

  useEffect(() => {
    loadPatientProfile();
  }, []);

  useEffect(() => {
    if (patientProfile) {
      findMatchingTrials();
    }
  }, [patientProfile, searchFilters]);

  const loadPatientProfile = async () => {
    // Simulate loading patient profile from EHR/database
    const mockProfile: PatientProfile = {
      demographics: {
        age: 64,
        gender: 'female',
        ethnicity: 'Caucasian',
        location: { lat: 40.7128, lng: -74.0060, city: 'New York', state: 'NY' }
      },
      medical: {
        cancerType: 'Non-Small Cell Lung Cancer',
        subtype: 'Adenocarcinoma',
        stage: 'Stage IV',
        ecogStatus: 1,
        priorTreatments: ['Carboplatin/Paclitaxel', 'Pembrolizumab'],
        currentTreatment: 'Supportive Care',
        progressionDate: '2024-08-15'
      },
      genomics: {
        mutations: {
          'KRAS': 'G12C',
          'TP53': 'R273H',
          'STK11': 'Wild-type',
          'EGFR': 'Wild-type',
          'ALK': 'Negative'
        },
        biomarkers: {
          'PD-L1': 85,
          'TMB': 12.5,
          'MSI': 0.2
        },
        hlaTypes: ['HLA-A*02:01', 'HLA-B*07:02'],
        microsatelliteStatus: 'MSS',
        tumorMutationalBurden: 12.5
      },
      laboratory: {
        hemoglobin: 11.2,
        platelets: 185000,
        neutrophils: 3200,
        creatinine: 0.9,
        bilirubin: 0.8,
        ast: 28,
        alt: 31
      },
      comorbidities: ['Hypertension', 'Type 2 Diabetes'],
      insurance: 'Medicare'
    };
    
    setPatientProfile(mockProfile);
  };

  const findMatchingTrials = async () => {
    setIsMatching(true);
    
    try {
      // Simulate AI-powered trial matching
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockTrials: ClinicalTrial[] = [
        {
          nctId: 'NCT04567890',
          title: 'Phase II Study of KRAS G12C Inhibitor in Advanced NSCLC',
          phase: 'Phase II',
          status: 'Recruiting',
          sponsor: 'Memorial Sloan Kettering Cancer Center',
          studyType: 'Interventional',
          interventions: [
            {
              type: 'Drug',
              name: 'Sotorasib',
              description: 'KRAS G12C inhibitor, 960mg daily'
            },
            {
              type: 'Drug',
              name: 'Pembrolizumab',
              description: 'Anti-PD-1 antibody, 200mg Q3W'
            }
          ],
          conditions: ['Non-Small Cell Lung Cancer', 'KRAS G12C Mutation'],
          eligibility: {
            criteria: [
              'KRAS G12C mutation confirmed',
              'Stage IIIB/IV NSCLC',
              'ECOG 0-1',
              'Prior platinum-based therapy',
              'Adequate organ function'
            ],
            genderBased: false,
            minimumAge: 18,
            maximumAge: 99,
            healthyVolunteers: false
          },
          locations: [
            {
              facility: 'Memorial Sloan Kettering Cancer Center',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              status: 'Recruiting',
              distance: 5.2,
              contactInfo: {
                name: 'Dr. Sarah Johnson',
                phone: '(212) 639-7000',
                email: 'trials@mskcc.org'
              }
            },
            {
              facility: 'NYU Langone Health',
              city: 'New York',
              state: 'NY',
              country: 'USA',
              status: 'Recruiting',
              distance: 8.7,
              contactInfo: {
                name: 'Dr. Michael Chen',
                phone: '(212) 731-5000',
                email: 'clinical.trials@nyulangone.org'
              }
            }
          ],
          primaryOutcome: 'Overall Response Rate',
          secondaryOutcomes: ['Progression-Free Survival', 'Overall Survival', 'Safety and Tolerability'],
          estimatedEnrollment: 120,
          studyStartDate: '2024-01-15',
          estimatedCompletionDate: '2026-12-31',
          lastUpdate: '2024-09-15',
          matchScore: 94,
          matchReasons: [
            { category: 'genomic', criterion: 'KRAS G12C mutation', status: 'match', weight: 30 },
            { category: 'medical', criterion: 'Stage IV NSCLC', status: 'match', weight: 25 },
            { category: 'medical', criterion: 'Prior platinum therapy', status: 'match', weight: 20 },
            { category: 'demographic', criterion: 'Age eligibility', status: 'match', weight: 10 },
            { category: 'medical', criterion: 'ECOG performance status', status: 'match', weight: 15 }
          ],
          enrollmentPrediction: {
            likelihood: 85,
            timeToEnrollment: 14,
            competingTrials: 3,
            sites: 2
          },
          aiInsights: [
            {
              type: 'advantage',
              description: 'Perfect genomic match for KRAS G12C targeted therapy',
              priority: 'high'
            },
            {
              type: 'advantage',
              description: 'Close proximity to multiple recruiting sites',
              priority: 'medium'
            },
            {
              type: 'requirement',
              description: 'Recent tissue biopsy may be required for molecular confirmation',
              priority: 'medium'
            }
          ]
        },
        {
          nctId: 'NCT05123456',
          title: 'CAR-T Cell Therapy for Solid Tumors with High TMB',
          phase: 'Phase I',
          status: 'Recruiting',
          sponsor: 'National Cancer Institute',
          studyType: 'Interventional',
          interventions: [
            {
              type: 'Biological',
              name: 'CAR-T Cells',
              description: 'Autologous CAR-T cells targeting tumor antigens'
            }
          ],
          conditions: ['Solid Tumors', 'High Tumor Mutational Burden'],
          eligibility: {
            criteria: [
              'TMB ≥ 10 mutations/Mb',
              'Progressive disease',
              'ECOG 0-2',
              'Adequate cardiac function',
              'No active infections'
            ],
            genderBased: false,
            minimumAge: 18,
            maximumAge: 70,
            healthyVolunteers: false
          },
          locations: [
            {
              facility: 'National Cancer Institute',
              city: 'Bethesda',
              state: 'MD',
              country: 'USA',
              status: 'Recruiting',
              distance: 225,
              contactInfo: {
                name: 'Dr. Emily Rodriguez',
                phone: '(301) 496-4000',
                email: 'ncictep@mail.nih.gov'
              }
            }
          ],
          primaryOutcome: 'Safety and Tolerability',
          secondaryOutcomes: ['Overall Response Rate', 'Duration of Response'],
          estimatedEnrollment: 24,
          studyStartDate: '2024-03-01',
          estimatedCompletionDate: '2025-12-31',
          lastUpdate: '2024-09-10',
          matchScore: 78,
          matchReasons: [
            { category: 'genomic', criterion: 'High TMB (≥10)', status: 'match', weight: 35 },
            { category: 'medical', criterion: 'Progressive disease', status: 'match', weight: 25 },
            { category: 'demographic', criterion: 'Age eligibility', status: 'match', weight: 10 },
            { category: 'medical', criterion: 'ECOG performance status', status: 'match', weight: 15 },
            { category: 'laboratory', criterion: 'Organ function', status: 'partial', weight: 15 }
          ],
          enrollmentPrediction: {
            likelihood: 65,
            timeToEnrollment: 21,
            competingTrials: 1,
            sites: 1
          },
          aiInsights: [
            {
              type: 'advantage',
              description: 'High TMB makes patient ideal candidate for CAR-T therapy',
              priority: 'high'
            },
            {
              type: 'concern',
              description: 'Phase I trial with unknown efficacy and potential toxicity',
              priority: 'medium'
            },
            {
              type: 'requirement',
              description: 'Extensive screening and manufacturing time (4-6 weeks)',
              priority: 'high'
            }
          ]
        },
        {
          nctId: 'NCT04789012',
          title: 'Precision Medicine Platform for Advanced Solid Tumors',
          phase: 'Phase II',
          status: 'Recruiting',
          sponsor: 'Dana-Farber Cancer Institute',
          studyType: 'Interventional',
          interventions: [
            {
              type: 'Other',
              name: 'Personalized Treatment',
              description: 'AI-guided treatment selection based on molecular profiling'
            }
          ],
          conditions: ['Advanced Solid Tumors', 'Refractory Cancer'],
          eligibility: {
            criteria: [
              'Advanced solid tumor',
              'Progressive disease on standard therapy',
              'Available tumor tissue',
              'ECOG 0-2',
              'Life expectancy > 3 months'
            ],
            genderBased: false,
            minimumAge: 18,
            maximumAge: 99,
            healthyVolunteers: false
          },
          locations: [
            {
              facility: 'Dana-Farber Cancer Institute',
              city: 'Boston',
              state: 'MA',
              country: 'USA',
              status: 'Recruiting',
              distance: 190,
              contactInfo: {
                name: 'Dr. Jennifer Liu',
                phone: '(617) 632-3000',
                email: 'precision.trials@dfci.harvard.edu'
              }
            }
          ],
          primaryOutcome: 'Overall Response Rate',
          secondaryOutcomes: ['Progression-Free Survival', 'Overall Survival', 'Quality of Life'],
          estimatedEnrollment: 200,
          studyStartDate: '2024-02-01',
          estimatedCompletionDate: '2027-01-31',
          lastUpdate: '2024-09-20',
          matchScore: 71,
          matchReasons: [
            { category: 'medical', criterion: 'Advanced solid tumor', status: 'match', weight: 25 },
            { category: 'medical', criterion: 'Progressive disease', status: 'match', weight: 25 },
            { category: 'medical', criterion: 'Prior standard therapy', status: 'match', weight: 20 },
            { category: 'demographic', criterion: 'Age eligibility', status: 'match', weight: 10 },
            { category: 'medical', criterion: 'Performance status', status: 'match', weight: 20 }
          ],
          enrollmentPrediction: {
            likelihood: 75,
            timeToEnrollment: 10,
            competingTrials: 2,
            sites: 1
          },
          aiInsights: [
            {
              type: 'advantage',
              description: 'AI-guided precision medicine approach matches patient profile',
              priority: 'high'
            },
            {
              type: 'advantage',
              description: 'Fast enrollment process with broad eligibility criteria',
              priority: 'medium'
            },
            {
              type: 'concern',
              description: 'Treatment assignment based on molecular profiling results',
              priority: 'low'
            }
          ]
        }
      ];
      
      // Sort by match score
      const sortedTrials = mockTrials.sort((a, b) => b.matchScore - a.matchScore);
      setTrials(sortedTrials);
      
      // Auto-enroll in top match if enabled
      if (autoEnrollment && sortedTrials.length > 0 && sortedTrials[0].matchScore >= 90) {
        initiateEnrollment(sortedTrials[0]);
      }
      
    } catch (error) {
      console.error('Error finding trials:', error);
    } finally {
      setIsMatching(false);
    }
  };

  const initiateEnrollment = async (trial: ClinicalTrial) => {
    const enrollmentProcess: EnrollmentProcess = {
      trialId: trial.nctId,
      status: 'initiated',
      steps: [
        { step: 'Initial screening', status: 'in_progress' },
        { step: 'Medical record review', status: 'pending' },
        { step: 'Genomic confirmation', status: 'pending' },
        { step: 'Eligibility assessment', status: 'pending' },
        { step: 'Informed consent', status: 'pending' },
        { step: 'Enrollment', status: 'pending' }
      ],
      documents: [
        { name: 'Medical Records', type: 'screening', status: 'required' },
        { name: 'Genomic Report', type: 'labs', status: 'required' },
        { name: 'Recent Imaging', type: 'imaging', status: 'required' },
        { name: 'Informed Consent', type: 'consent', status: 'required' }
      ],
      timeline: {
        initiated: new Date().toISOString(),
        estimatedDecision: new Date(Date.now() + trial.enrollmentPrediction.timeToEnrollment * 24 * 60 * 60 * 1000).toISOString(),
        estimatedStart: new Date(Date.now() + (trial.enrollmentPrediction.timeToEnrollment + 7) * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    
    setEnrollmentProcesses(prev => [...prev, enrollmentProcess]);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase I': return 'bg-red-100 text-red-800';
      case 'Phase II': return 'bg-yellow-100 text-yellow-800';
      case 'Phase III': return 'bg-blue-100 text-blue-800';
      case 'Phase IV': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'match': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Clinical Trial Matcher</h1>
            <p className="text-gray-600">Intelligent trial matching with automated enrollment assistance</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoEnrollment}
              onChange={(e) => setAutoEnrollment(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Auto-enrollment for high matches</span>
          </label>
          <button
            onClick={findMatchingTrials}
            disabled={isMatching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isMatching ? <LoadingSpinner size="sm" /> : <Search className="w-4 h-4" />}
            <span>Find Trials</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Summary */}
      {patientProfile && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Patient Profile</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{patientProfile.demographics.age} years old, {patientProfile.demographics.gender}</p>
                  <p>{patientProfile.demographics.location.city}, {patientProfile.demographics.location.state}</p>
                  <p>{patientProfile.demographics.ethnicity}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Medical</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{patientProfile.medical.cancerType}</p>
                  <p>{patientProfile.medical.stage}</p>
                  <p>ECOG {patientProfile.medical.ecogStatus}</p>
                  <p>{patientProfile.medical.priorTreatments.length} prior treatments</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Genomics</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(patientProfile.genomics.mutations).slice(0, 3).map(([gene, mutation]) => (
                    <p key={gene}>{gene}: {mutation}</p>
                  ))}
                  <p>TMB: {patientProfile.genomics.tumorMutationalBurden}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Current: {patientProfile.medical.currentTreatment}</p>
                  <p>Insurance: {patientProfile.insurance}</p>
                  <p>{patientProfile.comorbidities.length} comorbidities</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Search Filters</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phase</label>
              <select
                value={searchFilters.phase}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, phase: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Phases</option>
                <option value="Phase I">Phase I</option>
                <option value="Phase II">Phase II</option>
                <option value="Phase III">Phase III</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
              <input
                type="range"
                min="25"
                max="500"
                value={searchFilters.distance}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, distance: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{searchFilters.distance} miles</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={searchFilters.enrollmentStatus}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, enrollmentStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="recruiting">Recruiting</option>
                <option value="active">Active</option>
                <option value="all">All</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genomic Match</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={searchFilters.genomicMatch}
                  onChange={(e) => setSearchFilters(prev => ({ ...prev, genomicMatch: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Required</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={searchFilters.priorityMatch}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, priorityMatch: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">High match only</option>
                <option value="medium">Medium+ match</option>
                <option value="all">All matches</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Matching Status */}
      {isMatching && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="sm" />
              <div>
                <h3 className="font-medium text-gray-900">AI Trial Matching in Progress</h3>
                <p className="text-sm text-gray-600">
                  Analyzing patient profile against 15,000+ clinical trials using machine learning...
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Genomic Analysis</span>
                <span className="text-green-600">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Eligibility Screening</span>
                <span className="text-blue-600">Processing...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Location Matching</span>
                <span className="text-gray-500">Pending</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Trial Results */}
      {trials.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {trials.length} Matching Trials Found
            </h3>
            <div className="text-sm text-gray-600">
              Sorted by AI match score
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {trials.map((trial, index) => (
              <Card 
                key={trial.nctId}
                className={`cursor-pointer transition-all ${
                  selectedTrial?.nctId === trial.nctId ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedTrial(trial)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{trial.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPhaseColor(trial.phase)}`}>
                          {trial.phase}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {trial.nctId}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{trial.sponsor}</p>
                      <p className="text-sm text-gray-700">{trial.primaryOutcome}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getMatchScoreColor(trial.matchScore)}`}>
                        {trial.matchScore}%
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Match Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Match Criteria */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Match Criteria</h5>
                      <div className="space-y-1">
                        {trial.matchReasons.slice(0, 3).map((reason, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            {getStatusIcon(reason.status)}
                            <span className="text-gray-700">{reason.criterion}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Locations</h5>
                      <div className="space-y-1">
                        {trial.locations.slice(0, 2).map((location, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-700">{location.facility}</span>
                            </div>
                            <p className="text-gray-600 ml-4">{location.distance} miles away</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enrollment Prediction */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Enrollment Prediction</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Likelihood:</span>
                          <span className="font-medium">{trial.enrollmentPrediction.likelihood}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time to Enroll:</span>
                          <span>{trial.enrollmentPrediction.timeToEnrollment} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Competing Trials:</span>
                          <span>{trial.enrollmentPrediction.competingTrials}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium text-gray-900 mb-2">AI Insights</h5>
                    <div className="space-y-2">
                      {trial.aiInsights.slice(0, 2).map((insight, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-sm">
                          {insight.type === 'advantage' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          ) : insight.type === 'concern' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-500 mt-0.5" />
                          )}
                          <span className="text-gray-700">{insight.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Updated: {new Date(trial.lastUpdate).toLocaleDateString()}</span>
                      <span>Enrolling: {trial.estimatedEnrollment} patients</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center space-x-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>View on ClinicalTrials.gov</span>
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          initiateEnrollment(trial);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Start Enrollment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Trial View */}
      {selectedTrial && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Detailed Trial Information</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eligibility Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Detailed Eligibility</h4>
                <div className="space-y-2">
                  {selectedTrial.eligibility.criteria.map((criterion, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-gray-700">{criterion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Locations */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">All Study Locations</h4>
                <div className="space-y-3">
                  {selectedTrial.locations.map((location, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{location.facility}</h5>
                        <span className="text-sm text-blue-600">{location.distance} miles</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {location.city}, {location.state}
                      </p>
                      <div className="text-sm text-gray-600">
                        <p>Contact: {location.contactInfo.name}</p>
                        <p>Phone: {location.contactInfo.phone}</p>
                        <p>Email: {location.contactInfo.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Enrollment Processes */}
      {enrollmentProcesses.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Active Enrollment Processes</h3>
            </div>

            <div className="space-y-6">
              {enrollmentProcesses.map((process, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Trial {process.trialId}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      process.status === 'initiated' ? 'bg-blue-100 text-blue-800' :
                      process.status === 'screening' ? 'bg-yellow-100 text-yellow-800' :
                      process.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {process.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Steps */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Enrollment Steps</h5>
                      <div className="space-y-2">
                        {process.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2 text-sm">
                            {step.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : step.status === 'in_progress' ? (
                              <Clock className="w-4 h-4 text-blue-500" />
                            ) : step.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={step.status === 'completed' ? 'text-green-700' : 'text-gray-700'}>
                              {step.step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Required Documents</h5>
                      <div className="space-y-2">
                        {process.documents.map((doc, docIndex) => (
                          <div key={docIndex} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{doc.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              doc.status === 'reviewed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Initiated: {new Date(process.timeline.initiated).toLocaleDateString()}</span>
                      <span>Decision Expected: {new Date(process.timeline.estimatedDecision).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const TrialMatcherWithBoundary: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Clinical Trial Matcher"
      fallbackMessage="The clinical trial matching system is temporarily unavailable. This feature requires access to trial databases and AI processing."
    >
      <TrialMatcher />
    </FeatureErrorBoundary>
  );
};

export default TrialMatcherWithBoundary;
