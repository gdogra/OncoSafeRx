import React, { useState, useEffect } from 'react';
import { Drug } from '../../types';
import { 
  Pill, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Users, 
  Activity, 
  BookOpen, 
  ExternalLink,
  Star,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Zap,
  Shield,
  Info,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';

interface EnhancedDrugInfoProps {
  drug: Drug;
  className?: string;
}

interface DrugDetail {
  id: string;
  category: string;
  title: string;
  content: string | React.ReactNode;
  severity?: 'info' | 'warning' | 'error' | 'success';
  sources: string[];
  lastUpdated: string;
}

interface ClinicalTrial {
  id: string;
  title: string;
  phase: string;
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  condition: string;
  sponsor: string;
  enrollmentTarget: number;
  location: string;
  nctId: string;
}

interface DrugGuideline {
  id: string;
  organization: string;
  title: string;
  recommendation: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  lastReviewed: string;
  url?: string;
}

const EnhancedDrugInfo: React.FC<EnhancedDrugInfoProps> = ({ drug, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'safety' | 'guidelines' | 'trials'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic-info']));
  const [drugDetails, setDrugDetails] = useState<DrugDetail[]>([]);
  const [clinicalTrials, setClinicalTrials] = useState<ClinicalTrial[]>([]);
  const [guidelines, setGuidelines] = useState<DrugGuideline[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEnhancedDrugData();
  }, [drug.rxcui]);

  const loadEnhancedDrugData = async () => {
    setLoading(true);
    try {
      // Fetch real enhanced drug data from API
      const response = await fetch(`/api/drugs/enhanced/${drug.rxcui}`);
      if (response.ok) {
        const enhancedData = await response.json();
        // Merge enhanced data into the drug object
        Object.assign(drug, enhancedData);
      }
      
      // Load additional UI data
      await Promise.all([
        loadDrugDetails(),
        loadClinicalTrials(),
        loadGuidelines()
      ]);
    } catch (error) {
      console.error('Error loading enhanced drug data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDrugDetails = async () => {
    // Mock enhanced drug details
    const details: DrugDetail[] = [
      {
        id: 'mechanism',
        category: 'pharmacology',
        title: 'Mechanism of Action',
        content: drug.mechanism || 'Detailed mechanism of action data not available.',
        severity: 'info',
        sources: ['DrugBank', 'PubMed', 'FDA Label'],
        lastUpdated: '2024-01-15'
      },
      {
        id: 'pharmacokinetics',
        category: 'pharmacology',
        title: 'Pharmacokinetics',
        content: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Absorption:</span>
                <p className="text-gray-600">Rapidly absorbed, bioavailability 85-95%</p>
              </div>
              <div>
                <span className="font-medium">Distribution:</span>
                <p className="text-gray-600">Volume of distribution: 0.6-1.2 L/kg</p>
              </div>
              <div>
                <span className="font-medium">Metabolism:</span>
                <p className="text-gray-600">Hepatic via CYP3A4, CYP2D6</p>
              </div>
              <div>
                <span className="font-medium">Elimination:</span>
                <p className="text-gray-600">Half-life: 8-12 hours, renal excretion 60%</p>
              </div>
            </div>
          </div>
        ),
        severity: 'info',
        sources: ['Clinical Pharmacology', 'Drug Label'],
        lastUpdated: '2024-01-10'
      },
      {
        id: 'contraindications',
        category: 'safety',
        title: 'Contraindications & Precautions',
        content: (
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-red-800 mb-2">Absolute Contraindications:</h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {drug.contraindications?.map((contraindication, index) => (
                  <li key={index}>{contraindication}</li>
                )) || <li>No specific contraindications listed</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Precautions:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                <li>Monitor renal function in elderly patients</li>
                <li>Use with caution in hepatic impairment</li>
                <li>May interact with CYP3A4 inhibitors</li>
              </ul>
            </div>
          </div>
        ),
        severity: 'warning',
        sources: ['FDA Label', 'Clinical Guidelines'],
        lastUpdated: '2024-01-12'
      },
      {
        id: 'adverse-events',
        category: 'safety',
        title: 'Adverse Events Profile',
        content: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <h5 className="font-medium text-red-800 mb-2">Common ({">10%"})</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  {drug.sideEffects?.slice(0, 3).map((effect, index) => (
                    <li key={index}>• {effect}</li>
                  )) || <li>• Nausea</li>}
                </ul>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h5 className="font-medium text-yellow-800 mb-2">Uncommon (1-10%)</h5>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Headache</li>
                  <li>• Dizziness</li>
                  <li>• Rash</li>
                </ul>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <h5 className="font-medium text-gray-800 mb-2">Rare ({"<1%"})</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Severe hypersensitivity</li>
                  <li>• Hepatotoxicity</li>
                  <li>• Serious skin reactions</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        severity: 'warning',
        sources: ['FAERS', 'Clinical Trials', 'Post-marketing surveillance'],
        lastUpdated: '2024-01-08'
      }
    ];

    setDrugDetails(details);
  };

  const loadClinicalTrials = async () => {
    // Mock clinical trials data
    const trials: ClinicalTrial[] = [
      {
        id: 'trial1',
        title: `Phase III Study of ${drug.name} in Advanced Cancer`,
        phase: 'Phase III',
        status: 'recruiting',
        condition: 'Advanced Solid Tumors',
        sponsor: 'National Cancer Institute',
        enrollmentTarget: 450,
        location: 'Multiple centers (US, EU)',
        nctId: 'NCT05123456'
      },
      {
        id: 'trial2',
        title: `Combination Therapy with ${drug.name} and Immunotherapy`,
        phase: 'Phase II',
        status: 'active',
        condition: 'Metastatic Melanoma',
        sponsor: 'Academic Medical Center',
        enrollmentTarget: 120,
        location: 'Johns Hopkins, Mayo Clinic',
        nctId: 'NCT05234567'
      }
    ];

    setClinicalTrials(trials);
  };

  const loadGuidelines = async () => {
    // Mock guidelines data
    const guidelinesList: DrugGuideline[] = [
      {
        id: 'nccn1',
        organization: 'NCCN',
        title: `${drug.name} Guidelines for Cancer Treatment`,
        recommendation: 'Category 1 recommendation for first-line therapy in specific indications',
        evidenceLevel: 'A',
        lastReviewed: '2024-01-01',
        url: 'https://nccn.org'
      },
      {
        id: 'fda1',
        organization: 'FDA',
        title: 'Safety Communication',
        recommendation: 'Monitor for cardiac toxicity in high-risk patients',
        evidenceLevel: 'B',
        lastReviewed: '2023-12-15'
      }
    ];

    setGuidelines(guidelinesList);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getTrialStatusBadge = (status: string) => {
    const statusConfig = {
      recruiting: { bg: 'bg-green-100', text: 'text-green-800', label: 'Recruiting' },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
      suspended: { bg: 'bg-red-100', text: 'text-red-800', label: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'clinical', label: 'Clinical Data', icon: Activity },
    { id: 'safety', label: 'Safety Profile', icon: Shield },
    { id: 'guidelines', label: 'Guidelines', icon: Target },
    { id: 'trials', label: 'Clinical Trials', icon: Users }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Pill className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">{drug.name}</h2>
              {drug.fdaApproved && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  FDA Approved
                </span>
              )}
            </div>
            <p className="text-lg text-gray-600">{drug.genericName}</p>
            {drug.brandNames && drug.brandNames.length > 0 && (
              <p className="text-sm text-gray-500">
                Brand names: {drug.brandNames.join(', ')}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors">
              <Star className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
              <ExternalLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Category</h3>
                  </div>
                  <p className="text-blue-800">{drug.category}</p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium text-purple-900">Mechanism</h3>
                  </div>
                  <p className="text-purple-800 text-sm">{drug.mechanism}</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-green-900">Primary Indications</h3>
                  </div>
                  <div className="text-green-800 text-sm space-y-1">
                    {drug.indications?.slice(0, 3).map((indication, index) => (
                      <div key={index}>• {indication}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-4">
              {drugDetails.filter(detail => detail.category === 'pharmacology').map((detail) => (
                <div key={detail.id} className={`border rounded-lg ${getSeverityBg(detail.severity || 'info')}`}>
                  <button
                    onClick={() => toggleSection(detail.id)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {getSeverityIcon(detail.severity || 'info')}
                      <h3 className="font-medium text-gray-900">{detail.title}</h3>
                    </div>
                    {expandedSections.has(detail.id) ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections.has(detail.id) && (
                    <div className="px-4 pb-4">
                      <div className="border-t pt-4">
                        {typeof detail.content === 'string' ? (
                          <p className="text-gray-700">{detail.content}</p>
                        ) : (
                          detail.content
                        )}
                        
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                          <div>
                            Sources: {detail.sources.join(', ')}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Updated: {detail.lastUpdated}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clinical' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Clinical Data & Evidence</h3>
              <div className="text-sm text-gray-500">
                Comprehensive clinical information and evidence-based insights
              </div>
            </div>

            {/* Display clinical data from the enhanced API */}
            {(drug.clinicalInsights || drug.realWorldEvidence || drug.riskProfile || drug.monitoringRequirements || drug.clinicalDecisionSupport || drug.costEffectiveness) && (
              <div className="space-y-6">
                {/* Clinical Insights */}
                {drug.clinicalInsights && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Clinical Insights
                    </h4>
                    
                    {drug.clinicalInsights.mechanismOfAction && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">Mechanism of Action:</p>
                        <div className="bg-white p-3 rounded border">
                          <p className="text-sm text-gray-700">{drug.clinicalInsights.mechanismOfAction}</p>
                        </div>
                      </div>
                    )}
                    
                    {drug.clinicalInsights.clinicalEfficacy && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-blue-800 mb-2">Clinical Efficacy:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {drug.clinicalInsights.clinicalEfficacy.responseRate && (
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Response Rate</p>
                              <p className="text-lg font-semibold text-gray-900">{drug.clinicalInsights.clinicalEfficacy.responseRate}</p>
                            </div>
                          )}
                          {drug.clinicalInsights.clinicalEfficacy.medianPFS && (
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Median PFS</p>
                              <p className="text-lg font-semibold text-gray-900">{drug.clinicalInsights.clinicalEfficacy.medianPFS}</p>
                            </div>
                          )}
                          {drug.clinicalInsights.clinicalEfficacy.medianOS && (
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Median OS</p>
                              <p className="text-lg font-semibold text-gray-900">{drug.clinicalInsights.clinicalEfficacy.medianOS}</p>
                            </div>
                          )}
                          {drug.clinicalInsights.clinicalEfficacy.evidenceLevel && (
                            <div className="bg-white p-3 rounded border">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Evidence Level</p>
                              <p className="text-lg font-semibold text-gray-900">{drug.clinicalInsights.clinicalEfficacy.evidenceLevel}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {drug.clinicalInsights.patientSubgroups && (
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-2">Patient Subgroups:</p>
                        <div className="space-y-2">
                          {drug.clinicalInsights.patientSubgroups.map((subgroup: any, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <p className="text-sm font-medium text-gray-900">{subgroup.criteria}</p>
                              <p className="text-xs text-gray-600">{subgroup.efficacy}</p>
                              <p className="text-xs text-blue-600 font-medium">{subgroup.recommendation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {drug.clinicalData.realWorldInsights.patientReported && (
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-2">Patient-Reported Outcomes:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Satisfaction Score</p>
                            <p className="text-lg font-semibold text-gray-900">{drug.clinicalData.realWorldInsights.patientReported.satisfactionScore}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adherence Rate</p>
                            <p className="text-lg font-semibold text-gray-900">{drug.clinicalData.realWorldInsights.patientReported.adherenceRate}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">QoL Score</p>
                            <p className="text-lg font-semibold text-gray-900">{drug.clinicalData.realWorldInsights.patientReported.qualityOfLifeScore}</p>
                          </div>
                        </div>
                        {drug.clinicalData.realWorldInsights.patientReported.commonConcerns && (
                          <div className="mt-3 bg-white p-3 rounded border">
                            <p className="text-sm font-medium text-gray-700 mb-2">Common Patient Concerns:</p>
                            <div className="flex flex-wrap gap-2">
                              {drug.clinicalData.realWorldInsights.patientReported.commonConcerns.map((concern: string, index: number) => (
                                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">{concern}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Clinical Decision Support */}
                {drug.clinicalData.clinicalDecisionSupport && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Clinical Decision Support
                    </h4>

                    {drug.clinicalData.clinicalDecisionSupport.doseGuidance && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Dosing Guidance:</p>
                        <div className="bg-white p-3 rounded border">
                          <p className="font-medium">Recommended Dose: {drug.clinicalData.clinicalDecisionSupport.doseGuidance.recommendedDose}</p>
                          {drug.clinicalData.clinicalDecisionSupport.doseGuidance.specialPopulations && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-gray-600">Special Populations:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {drug.clinicalData.clinicalDecisionSupport.doseGuidance.specialPopulations.map((pop: string, index: number) => (
                                  <li key={index}>{pop}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {drug.clinicalData.clinicalDecisionSupport.monitoringPlan && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-800 mb-2">Monitoring Plan:</p>
                        <div className="space-y-2">
                          {drug.clinicalData.clinicalDecisionSupport.monitoringPlan.baseline && (
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-900">Baseline Monitoring:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {drug.clinicalData.clinicalDecisionSupport.monitoringPlan.baseline.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {drug.clinicalData.clinicalDecisionSupport.monitoringPlan.ongoing && (
                            <div className="bg-white p-3 rounded border">
                              <p className="font-medium text-gray-900">Ongoing Monitoring:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {drug.clinicalData.clinicalDecisionSupport.monitoringPlan.ongoing.map((item: string, index: number) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {drug.clinicalData.clinicalDecisionSupport.contraindications && (
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-2">Contraindications:</p>
                        <div className="bg-white p-3 rounded border">
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {drug.clinicalData.clinicalDecisionSupport.contraindications.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Real World Evidence */}
                {drug.clinicalData.realWorldEvidence && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Real-World Evidence
                    </h4>

                    {drug.clinicalData.realWorldEvidence.costEffectiveness && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-purple-800 mb-2">Cost Effectiveness:</p>
                        <div className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Annual Cost</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ${drug.clinicalData.realWorldEvidence.costEffectiveness.annualCost?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost per QALY</p>
                              <p className="text-lg font-semibold text-gray-900">
                                ${drug.clinicalData.realWorldEvidence.costEffectiveness.costPerQALY?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tier Status</p>
                              <p className="text-lg font-semibold text-gray-900">
                                {drug.clinicalData.realWorldEvidence.costEffectiveness.tierStatus || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {drug.clinicalData.realWorldEvidence.outcomes && (
                      <div>
                        <p className="text-sm font-medium text-purple-800 mb-2">Real-World Outcomes:</p>
                        <div className="space-y-2">
                          {Object.entries(drug.clinicalData.realWorldEvidence.outcomes).map(([key, value]: [string, any]) => (
                            <div key={key} className="bg-white p-3 rounded border">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className="text-sm text-gray-700">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Fallback message if no clinical data available */}
            {!(drug.clinicalInsights || drug.realWorldEvidence || drug.riskProfile || drug.monitoringRequirements || drug.clinicalDecisionSupport || drug.costEffectiveness) && (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Clinical Data Available</h3>
                <p className="text-gray-600">
                  Enhanced clinical data is not available for this medication. Please refer to the Overview tab for basic information.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-6">
            {drugDetails.filter(detail => detail.category === 'safety').map((detail) => (
              <div key={detail.id} className={`border rounded-lg ${getSeverityBg(detail.severity || 'info')}`}>
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    {getSeverityIcon(detail.severity || 'info')}
                    <h3 className="font-medium text-gray-900">{detail.title}</h3>
                  </div>
                  
                  {typeof detail.content === 'string' ? (
                    <p className="text-gray-700">{detail.content}</p>
                  ) : (
                    detail.content
                  )}
                  
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <div>Sources: {detail.sources.join(', ')}</div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated: {detail.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trials' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Active Clinical Trials</h3>
              <span className="text-sm text-gray-500">{clinicalTrials.length} trials found</span>
            </div>
            
            <div className="space-y-4">
              {clinicalTrials.map((trial) => (
                <div key={trial.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{trial.title}</h4>
                      <p className="text-sm text-gray-600">{trial.condition}</p>
                    </div>
                    {getTrialStatusBadge(trial.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Phase:</span>
                      <p className="text-gray-600">{trial.phase}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Sponsor:</span>
                      <p className="text-gray-600">{trial.sponsor}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Enrollment:</span>
                      <p className="text-gray-600">{trial.enrollmentTarget} patients</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">NCT ID:</span>
                      <a 
                        href={`https://clinicaltrials.gov/ct2/show/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>{trial.nctId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Locations:</span> {trial.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'guidelines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Clinical Guidelines & Recommendations</h3>
              <span className="text-sm text-gray-500">{guidelines.length} guidelines</span>
            </div>
            
            <div className="space-y-4">
              {guidelines.map((guideline) => (
                <div key={guideline.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{guideline.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          guideline.evidenceLevel === 'A' ? 'bg-green-100 text-green-800' :
                          guideline.evidenceLevel === 'B' ? 'bg-blue-100 text-blue-800' :
                          guideline.evidenceLevel === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Level {guideline.evidenceLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{guideline.organization}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{guideline.recommendation}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last reviewed: {guideline.lastReviewed}</span>
                    {guideline.url && (
                      <a 
                        href={guideline.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>View guideline</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDrugInfo;
