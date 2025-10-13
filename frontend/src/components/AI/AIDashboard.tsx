import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Lightbulb,
  FileText,
  Settings,
  Play,
  Pause,
  Eye,
  Download,
  Filter,
  Search,
  Zap
} from 'lucide-react';
import { 
  AIRecommendation, 
  PredictiveModel, 
  RealWorldEvidence 
} from '../../types/ai';
import { Patient } from '../../types/clinical';
import { aiService } from '../../services/aiService';
import { patientService } from '../../services/patientService';

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const AIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [rweStudies, setRweStudies] = useState<RealWorldEvidence[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    aiService.generateSampleData();
    setRecommendations(aiService.getAIRecommendations());
    setModels(aiService.getPredictiveModels());
    setRweStudies(aiService.getRealWorldEvidence());
    try {
      const list = await patientService.getPatients();
      setPatients(list);
    } catch (e) {
      console.warn('Failed to load patients for AI Dashboard', e);
      setPatients([]);
    }
  };

  const tabs: TabInfo[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Brain,
      description: 'AI platform overview and key metrics'
    },
    {
      id: 'recommendations',
      label: 'AI Recommendations',
      icon: Lightbulb,
      description: 'AI-generated clinical recommendations'
    },
    {
      id: 'models',
      label: 'Predictive Models',
      icon: Target,
      description: 'Machine learning models and predictions'
    },
    {
      id: 'evidence',
      label: 'Real-World Evidence',
      icon: Database,
      description: 'Real-world data studies and outcomes'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Performance metrics and insights'
    }
  ];

  const handleGenerateRecommendations = async () => {
    if (!selectedPatient) return;

    setGeneratingRecommendations(true);
    try {
      const newRecommendations = await aiService.generateRecommendations(selectedPatient);
      setRecommendations(prev => [...prev, ...newRecommendations]);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  const getMetrics = () => {
    return aiService.getAIMetrics();
  };

  const renderOverviewTab = () => {
    const metrics = getMetrics();

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">AI Recommendations</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRecommendations}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-green-600">{metrics.acceptedRecommendations} accepted</span>
                <span className="text-gray-500 ml-2">• {metrics.pendingRecommendations} pending</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Models</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeModels}</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                {metrics.totalModels} total models
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">RWE Studies</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.rweStudies}</p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Real-world evidence base
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.averageConfidence ? Math.round(metrics.averageConfidence) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Model confidence score
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate AI Recommendations</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const patient = patients.find(p => p.id === e.target.value);
                  setSelectedPatient(patient || null);
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.diagnosis}
                  </option>
                ))}
              </select>
            </div>

            {selectedPatient && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Diagnosis:</span> {selectedPatient.diagnosis}
                  </div>
                  <div>
                    <span className="font-medium">Stage:</span> {selectedPatient.stage || 'Not specified'}
                  </div>
                  <div>
                    <span className="font-medium">Performance Status:</span> ECOG {selectedPatient.ecogPerformanceStatus}
                  </div>
                  <div>
                    <span className="font-medium">Treatment History:</span> {selectedPatient.treatmentHistory.length} courses
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateRecommendations}
              disabled={!selectedPatient || generatingRecommendations}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingRecommendations ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Generating Recommendations...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate AI Recommendations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Activity</h3>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map(rec => (
              <div key={rec.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rec.title}</p>
                  <p className="text-sm text-gray-500">
                    {rec.type} • {rec.confidenceScore}% confidence • {new Date(rec.generatedDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.validationStatus === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : rec.validationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {rec.validationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendationsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations
          .filter(rec => 
            searchQuery === '' || 
            rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            rec.type.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(rec => (
          <div key={rec.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.type === 'treatment' ? 'bg-blue-100 text-blue-800' :
                    rec.type === 'diagnostic' ? 'bg-green-100 text-green-800' :
                    rec.type === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                    rec.type === 'genomic' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.type.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <p className="text-sm text-gray-600 mb-3">{rec.rationale}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{rec.confidenceScore}%</div>
                  <div className="text-xs text-gray-500">confidence</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Priority</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Evidence Level</div>
                <div className="text-sm text-gray-900">{rec.evidenceLevel}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500">Model Type</div>
                <div className="text-sm text-gray-900">{rec.modelType.replace('_', ' ')}</div>
              </div>
            </div>

            {rec.evidenceSources.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Evidence Sources</div>
                <div className="space-y-2">
                  {rec.evidenceSources.slice(0, 2).map((source, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-900">{source.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{source.summary}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Generated: {new Date(rec.generatedDate).toLocaleDateString()}</span>
                <span>Model v{rec.modelVersion}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.validationStatus === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : rec.validationStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : rec.validationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {rec.validationStatus}
                </span>
                
                <button className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {recommendations.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Recommendations</h3>
            <p className="text-gray-500">Generate AI recommendations for patients to see intelligent insights</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      {/* Model Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Production Models</p>
              <p className="text-2xl font-bold text-gray-900">
                {models.filter(m => m.deploymentStatus === 'production').length}
              </p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Average Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Models List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Predictive Models</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {/* Sample model entries since we don't have real models yet */}
          {[
            {
              name: 'Treatment Response Predictor',
              type: 'predictive',
              algorithm: 'ensemble',
              accuracy: 0.89,
              status: 'production'
            },
            {
              name: 'Toxicity Risk Model',
              type: 'risk_stratification',
              algorithm: 'random_forest',
              accuracy: 0.82,
              status: 'production'
            },
            {
              name: 'Survival Prediction Model',
              type: 'prognostic',
              algorithm: 'neural_network',
              accuracy: 0.76,
              status: 'testing'
            }
          ].map((model, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{model.type.replace('_', ' ')}</span>
                    <span>{model.algorithm.replace('_', ' ')}</span>
                    <span>Accuracy: {(model.accuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    model.status === 'production' 
                      ? 'bg-green-100 text-green-800'
                      : model.status === 'testing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {model.status}
                  </span>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEvidenceTab = () => (
    <div className="space-y-6">
      {/* Evidence Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-World Evidence Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{rweStudies.length}</div>
            <div className="text-sm text-gray-600">Total Studies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">156K</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">23</div>
            <div className="text-sm text-gray-600">Cancer Types</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">89%</div>
            <div className="text-sm text-gray-600">Quality Score</div>
          </div>
        </div>
      </div>

      {/* Sample RWE Studies */}
      <div className="space-y-4">
        {[
          {
            title: 'Real-world effectiveness of immunotherapy in NSCLC',
            studyType: 'retrospective',
            patients: 3247,
            duration: '24 months',
            keyFinding: 'Similar outcomes to clinical trials in real-world setting'
          },
          {
            title: 'Toxicity patterns in elderly cancer patients',
            studyType: 'prospective',
            patients: 1856,
            duration: '36 months',
            keyFinding: 'Age-specific dosing reduces severe toxicities by 35%'
          },
          {
            title: 'Biomarker-guided therapy outcomes',
            studyType: 'longitudinal',
            patients: 2134,
            duration: '18 months',
            keyFinding: 'Improved response rates with molecular matching'
          }
        ].map((study, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900 mb-2">{study.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{study.studyType}</span>
                  <span>{study.patients} patients</span>
                  <span>{study.duration}</span>
                </div>
                <p className="text-gray-700">{study.keyFinding}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    const metrics = getMetrics();

    return (
      <div className="space-y-6">
        {/* Performance Dashboard */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Platform Performance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Recommendation Accuracy</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">92%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">Model Uptime</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">99.8%</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500 mb-2">User Satisfaction</div>
              <div className="text-2xl font-bold text-gray-900 mb-2">4.7/5</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
          <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Analytics charts would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Cost Savings</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reduced readmissions</span>
                  <span className="text-sm font-medium">$1.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Optimized treatments</span>
                  <span className="text-sm font-medium">$890K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Early detection</span>
                  <span className="text-sm font-medium">$650K</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Quality Improvements</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adherence to guidelines</span>
                  <span className="text-sm font-medium">+15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Treatment response</span>
                  <span className="text-sm font-medium">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Safety events</span>
                  <span className="text-sm font-medium">-28%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI & Real-World Evidence Platform</h1>
        <p className="text-gray-600">
          Advanced artificial intelligence and machine learning for precision oncology
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mr-2 ${
                activeTab === id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <div className="text-left">
                <div>{label}</div>
                <div className="text-xs text-gray-400">{description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'recommendations' && renderRecommendationsTab()}
        {activeTab === 'models' && renderModelsTab()}
        {activeTab === 'evidence' && renderEvidenceTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
};

export default AIDashboard;
