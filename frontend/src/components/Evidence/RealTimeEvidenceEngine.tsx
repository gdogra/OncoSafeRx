import React, { useState, useEffect, useCallback } from 'react';
import { Search, Database, TrendingUp, AlertTriangle, CheckCircle, Clock, Brain, Globe, Zap, Shield, Activity, BookOpen, Award, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, LineChart, Line } from 'recharts';

interface EvidenceSource {
  id: string;
  name: string;
  type: 'clinical_trial' | 'real_world' | 'literature' | 'regulatory' | 'genomic' | 'biomarker';
  reliability: number;
  updateFrequency: string;
  lastUpdate: string;
  status: 'active' | 'syncing' | 'error' | 'rate_limited';
  recordCount: number;
  qualityScore: number;
}

interface EvidenceUpdate {
  id: string;
  timestamp: string;
  source: string;
  type: 'new_study' | 'efficacy_update' | 'safety_alert' | 'guideline_change' | 'biomarker_discovery' | 'resistance_pattern';
  drugName: string;
  indication: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  impact: 'high' | 'medium' | 'low';
  summary: string;
  confidence: number;
  changeDirection: 'positive' | 'negative' | 'neutral';
  clinicalSignificance: number;
}

interface DrugEvidence {
  drugName: string;
  totalStudies: number;
  qualityScore: number;
  efficacyTrend: Array<{ month: string; efficacy: number; confidence: number }>;
  safetyProfile: {
    overallScore: number;
    adverseEvents: Array<{ event: string; frequency: number; severity: 'mild' | 'moderate' | 'severe' }>;
    blackBoxWarnings: string[];
  };
  realWorldOutcomes: {
    responseRate: number;
    survivalBenefit: number;
    qualityOfLife: number;
    patientReported: number;
  };
  resistancePatterns: Array<{ mutation: string; frequency: number; impact: number }>;
  biomarkerAssociations: Array<{ biomarker: string; association: number; predictiveValue: number }>;
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'efficacy' | 'safety' | 'resistance' | 'biomarker';
  accuracy: number;
  dataPoints: number;
  lastTraining: string;
  predictions: Array<{ scenario: string; probability: number; confidence: number }>;
  modelComplexity: 'simple' | 'moderate' | 'complex' | 'deep_learning';
  validationScore: number;
}

const RealTimeEvidenceEngine: React.FC = () => {
  const [evidenceSources, setEvidenceSources] = useState<EvidenceSource[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<EvidenceUpdate[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<string>('Pembrolizumab');
  const [drugEvidence, setDrugEvidence] = useState<DrugEvidence | null>(null);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'sources' | 'updates' | 'analysis' | 'models'>('sources');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const initializeEvidenceEngine = useCallback(() => {
    const sources: EvidenceSource[] = [
      {
        id: 'clinicaltrials-gov',
        name: 'ClinicalTrials.gov',
        type: 'clinical_trial',
        reliability: 95,
        updateFrequency: 'Daily',
        lastUpdate: '2 minutes ago',
        status: 'active',
        recordCount: 423691,
        qualityScore: 94
      },
      {
        id: 'pubmed-nlm',
        name: 'PubMed/MEDLINE',
        type: 'literature',
        reliability: 98,
        updateFrequency: 'Real-time',
        lastUpdate: '5 seconds ago',
        status: 'active',
        recordCount: 34928456,
        qualityScore: 96
      },
      {
        id: 'fda-orange-book',
        name: 'FDA Orange Book',
        type: 'regulatory',
        reliability: 99,
        updateFrequency: 'Weekly',
        lastUpdate: '1 day ago',
        status: 'active',
        recordCount: 8947,
        qualityScore: 98
      },
      {
        id: 'real-world-network',
        name: 'Global RWE Network',
        type: 'real_world',
        reliability: 87,
        updateFrequency: 'Hourly',
        lastUpdate: '23 minutes ago',
        status: 'syncing',
        recordCount: 2847392,
        qualityScore: 89
      },
      {
        id: 'cosmic-genomics',
        name: 'COSMIC Database',
        type: 'genomic',
        reliability: 93,
        updateFrequency: 'Monthly',
        lastUpdate: '3 hours ago',
        status: 'active',
        recordCount: 1847292,
        qualityScore: 92
      },
      {
        id: 'biomarker-atlas',
        name: 'Human Protein Atlas',
        type: 'biomarker',
        reliability: 91,
        updateFrequency: 'Bi-weekly',
        lastUpdate: '4 hours ago',
        status: 'active',
        recordCount: 847392,
        qualityScore: 90
      }
    ];

    const updates: EvidenceUpdate[] = [
      {
        id: 'update-1',
        timestamp: '2 minutes ago',
        source: 'PubMed/MEDLINE',
        type: 'efficacy_update',
        drugName: 'Pembrolizumab',
        indication: 'Melanoma',
        evidenceLevel: 'A',
        impact: 'high',
        summary: 'New meta-analysis shows 18% improvement in overall survival with combination therapy',
        confidence: 94,
        changeDirection: 'positive',
        clinicalSignificance: 92
      },
      {
        id: 'update-2',
        timestamp: '7 minutes ago',
        source: 'FDA Orange Book',
        type: 'safety_alert',
        drugName: 'Osimertinib',
        indication: 'NSCLC',
        evidenceLevel: 'A',
        impact: 'medium',
        summary: 'Updated safety profile: increased monitoring for cardiac toxicity recommended',
        confidence: 97,
        changeDirection: 'negative',
        clinicalSignificance: 76
      },
      {
        id: 'update-3',
        timestamp: '12 minutes ago',
        source: 'ClinicalTrials.gov',
        type: 'new_study',
        drugName: 'Trastuzumab',
        indication: 'Breast Cancer',
        evidenceLevel: 'B',
        impact: 'high',
        summary: 'Phase III trial demonstrates superior efficacy in HER2+ patients with novel formulation',
        confidence: 88,
        changeDirection: 'positive',
        clinicalSignificance: 89
      },
      {
        id: 'update-4',
        timestamp: '18 minutes ago',
        source: 'Global RWE Network',
        type: 'biomarker_discovery',
        drugName: 'Nivolumab',
        indication: 'Lung Cancer',
        evidenceLevel: 'B',
        impact: 'high',
        summary: 'Novel PD-L1 expression threshold identified predicting response with 87% accuracy',
        confidence: 85,
        changeDirection: 'positive',
        clinicalSignificance: 91
      },
      {
        id: 'update-5',
        timestamp: '25 minutes ago',
        source: 'COSMIC Database',
        type: 'resistance_pattern',
        drugName: 'Vemurafenib',
        indication: 'Melanoma',
        evidenceLevel: 'B',
        impact: 'medium',
        summary: 'Emerging BRAF resistance mutations detected in 12% of patients after 6 months',
        confidence: 79,
        changeDirection: 'negative',
        clinicalSignificance: 73
      }
    ];

    const models: PredictiveModel[] = [
      {
        id: 'efficacy-predictor-v3',
        name: 'Efficacy Predictor V3.0',
        type: 'efficacy',
        accuracy: 89.4,
        dataPoints: 847392,
        lastTraining: '6 hours ago',
        predictions: [
          { scenario: 'High PD-L1 expression', probability: 73, confidence: 91 },
          { scenario: 'TMB > 10 mut/Mb', probability: 68, confidence: 87 },
          { scenario: 'MSI-H status', probability: 82, confidence: 94 }
        ],
        modelComplexity: 'deep_learning',
        validationScore: 92.1
      },
      {
        id: 'safety-monitor-v2',
        name: 'Safety Monitor V2.5',
        type: 'safety',
        accuracy: 91.7,
        dataPoints: 1247892,
        lastTraining: '12 hours ago',
        predictions: [
          { scenario: 'Grade 3+ immune toxicity', probability: 15, confidence: 88 },
          { scenario: 'Hepatotoxicity risk', probability: 8, confidence: 92 },
          { scenario: 'Cardiotoxicity risk', probability: 4, confidence: 95 }
        ],
        modelComplexity: 'complex',
        validationScore: 89.6
      },
      {
        id: 'resistance-tracker-v1',
        name: 'Resistance Tracker V1.2',
        type: 'resistance',
        accuracy: 84.3,
        dataPoints: 234891,
        lastTraining: '1 day ago',
        predictions: [
          { scenario: 'Primary resistance', probability: 22, confidence: 81 },
          { scenario: 'Acquired resistance (6mo)', probability: 31, confidence: 78 },
          { scenario: 'Acquired resistance (12mo)', probability: 47, confidence: 85 }
        ],
        modelComplexity: 'moderate',
        validationScore: 86.4
      }
    ];

    setEvidenceSources(sources);
    setRecentUpdates(updates);
    setPredictiveModels(models);
  }, []);

  const generateDrugEvidence = useCallback((drug: string) => {
    const evidence: DrugEvidence = {
      drugName: drug,
      totalStudies: 1247,
      qualityScore: 92.4,
      efficacyTrend: [
        { month: 'Jan', efficacy: 67, confidence: 89 },
        { month: 'Feb', efficacy: 69, confidence: 91 },
        { month: 'Mar', efficacy: 71, confidence: 88 },
        { month: 'Apr', efficacy: 73, confidence: 92 },
        { month: 'May', efficacy: 75, confidence: 94 },
        { month: 'Jun', efficacy: 78, confidence: 96 }
      ],
      safetyProfile: {
        overallScore: 87,
        adverseEvents: [
          { event: 'Fatigue', frequency: 42, severity: 'mild' },
          { event: 'Diarrhea', frequency: 28, severity: 'moderate' },
          { event: 'Pneumonitis', frequency: 8, severity: 'severe' },
          { event: 'Thyroid dysfunction', frequency: 15, severity: 'moderate' }
        ],
        blackBoxWarnings: ['Immune-mediated pneumonitis', 'Severe hepatotoxicity']
      },
      realWorldOutcomes: {
        responseRate: 71.4,
        survivalBenefit: 84.2,
        qualityOfLife: 78.9,
        patientReported: 82.1
      },
      resistancePatterns: [
        { mutation: 'JAK1/2 LOF', frequency: 23, impact: 87 },
        { mutation: 'B2M mutation', frequency: 15, impact: 72 },
        { mutation: 'PTEN deletion', frequency: 19, impact: 81 },
        { mutation: 'STK11 mutation', frequency: 12, impact: 68 }
      ],
      biomarkerAssociations: [
        { biomarker: 'PD-L1 TPS >50%', association: 89, predictiveValue: 92 },
        { biomarker: 'TMB >10 mut/Mb', association: 76, predictiveValue: 84 },
        { biomarker: 'MSI-H', association: 94, predictiveValue: 97 },
        { biomarker: 'CD8+ TILs high', association: 71, predictiveValue: 79 }
      ]
    };

    setDrugEvidence(evidence);
  }, []);

  const refreshEvidenceData = useCallback(async () => {
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setRecentUpdates(prev => [
      {
        id: `update-${Date.now()}`,
        timestamp: 'Just now',
        source: 'Real-time Analysis',
        type: 'efficacy_update',
        drugName: selectedDrug,
        indication: 'Multiple',
        evidenceLevel: 'A',
        impact: 'medium',
        summary: 'Real-time evidence synthesis completed with updated efficacy estimates',
        confidence: 93,
        changeDirection: 'positive',
        clinicalSignificance: 87
      },
      ...prev.slice(0, 9)
    ]);
    
    setIsProcessing(false);
  }, [selectedDrug]);

  useEffect(() => {
    initializeEvidenceEngine();
    generateDrugEvidence(selectedDrug);
  }, [initializeEvidenceEngine, generateDrugEvidence, selectedDrug]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshEvidenceData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshEvidenceData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'rate_limited': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'positive': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Real-Time Evidence Integration Engine</h1>
            <p className="text-blue-100">
              Continuous AI-powered synthesis of global clinical evidence with predictive modeling
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">1.2M+</div>
            <div className="text-sm text-blue-100">Evidence Points</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border" data-tour="evidence-filters">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search drugs, studies, or evidence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Pembrolizumab">Pembrolizumab</option>
            <option value="Nivolumab">Nivolumab</option>
            <option value="Atezolizumab">Atezolizumab</option>
            <option value="Osimertinib">Osimertinib</option>
            <option value="Trastuzumab">Trastuzumab</option>
          </select>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh
            </label>
          </div>
          <button
            onClick={refreshEvidenceData}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Refresh Evidence
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" data-tour="evidence-tabs">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'sources', label: 'Evidence Sources', icon: Database },
              { id: 'updates', label: 'Real-Time Updates', icon: Activity },
              { id: 'analysis', label: 'Evidence Analysis', icon: BookOpen },
              { id: 'models', label: 'Predictive Models', icon: Brain }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evidenceSources.map((source) => (
                  <div key={source.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{source.type.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(source.status)}`}>
                        {source.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reliability:</span>
                        <span className="font-medium">{source.reliability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Score:</span>
                        <span className="font-medium">{source.qualityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Records:</span>
                        <span className="font-medium">{source.recordCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Update Freq:</span>
                        <span className="font-medium">{source.updateFrequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-medium text-green-600">{source.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getChangeIcon(update.changeDirection)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{update.drugName} - {update.indication}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">{update.source}</span>
                            <span className="text-sm text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{update.timestamp}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(update.impact)}`}>
                              {update.impact} impact
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Level {update.evidenceLevel}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{update.confidence}%</div>
                          <div className="text-xs text-gray-500">Confidence</div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">{update.summary}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-600">Clinical Significance: {update.clinicalSignificance}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-600 capitalize">{update.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && drugEvidence && (
            <div className="space-y-6">
              {/* Drug Overview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{drugEvidence.drugName} Evidence Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{drugEvidence.totalStudies}</div>
                    <div className="text-sm text-gray-600">Total Studies</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{drugEvidence.qualityScore}%</div>
                    <div className="text-sm text-gray-600">Quality Score</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{drugEvidence.realWorldOutcomes.responseRate}%</div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-teal-600">{drugEvidence.safetyProfile.overallScore}</div>
                    <div className="text-sm text-gray-600">Safety Score</div>
                  </div>
                </div>
              </div>

              {/* Efficacy Trend */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Efficacy Trend Analysis</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={drugEvidence.efficacyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}%`, name === 'efficacy' ? 'Efficacy' : 'Confidence']} />
                    <Area type="monotone" dataKey="efficacy" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="confidence" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Real-World Outcomes */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Real-World Outcomes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'Response Rate', value: drugEvidence.realWorldOutcomes.responseRate },
                      { name: 'Survival Benefit', value: drugEvidence.realWorldOutcomes.survivalBenefit },
                      { name: 'Quality of Life', value: drugEvidence.realWorldOutcomes.qualityOfLife },
                      { name: 'Patient Reported', value: drugEvidence.realWorldOutcomes.patientReported }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Biomarker Associations</h5>
                    <div className="space-y-2">
                      {drugEvidence.biomarkerAssociations.map((biomarker, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{biomarker.biomarker}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{biomarker.predictiveValue}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${biomarker.association}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Profile */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Safety Profile Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Adverse Events</h5>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={drugEvidence.safetyProfile.adverseEvents}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="event" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Frequency']} />
                        <Bar dataKey="frequency" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Black Box Warnings</h5>
                    <div className="space-y-2">
                      {drugEvidence.safetyProfile.blackBoxWarnings.map((warning, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span className="text-sm text-red-800">{warning}</span>
                        </div>
                      ))}
                    </div>

                    <h5 className="font-medium text-gray-900 mb-3 mt-4">Resistance Patterns</h5>
                    <div className="space-y-2">
                      {drugEvidence.resistancePatterns.map((pattern, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                          <span className="text-sm font-medium">{pattern.mutation}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">{pattern.frequency}%</span>
                            <span className="text-sm text-orange-600">Impact: {pattern.impact}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              {predictiveModels.map((model) => (
                <div key={model.id} className="bg-white p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{model.type} prediction model</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{model.accuracy}%</div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Data Points</div>
                      <div className="font-semibold">{model.dataPoints.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Validation Score</div>
                      <div className="font-semibold">{model.validationScore}%</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Complexity</div>
                      <div className="font-semibold capitalize">{model.modelComplexity.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Predictions</h4>
                    <div className="space-y-2">
                      {model.predictions.map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <span className="font-medium">{prediction.scenario}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-blue-600">{prediction.probability}%</span>
                            <div className="flex items-center gap-1">
                              <Shield className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-gray-600">{prediction.confidence}% confidence</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    Last training: {model.lastTraining}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeEvidenceEngine;
