import React, { useState, useEffect } from 'react';
import { PatientProfile } from '../../types';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  Activity,
  Shield,
  Zap,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Settings,
  RefreshCw,
  BookOpen,
  Users,
  Database,
  Award,
  Filter
} from 'lucide-react';

interface AIRecommendation {
  id: string;
  type: 'drug_selection' | 'dose_adjustment' | 'monitoring' | 'interaction_alert' | 'clinical_pathway' | 'biomarker';
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  title: string;
  description: string;
  rationale: string[];
  evidence: {
    level: 'A' | 'B' | 'C' | 'D';
    sources: string[];
    studyCount: number;
    patientCount: number;
  };
  recommendation: string;
  alternatives?: string[];
  contraindications?: string[];
  monitoring?: string[];
  expectedOutcome: {
    efficacy: number;
    safety: number;
    timeToEffect: string;
    durationOfEffect: string;
  };
  userFeedback?: 'accepted' | 'rejected' | 'modified';
  timestamp: string;
  category: string;
}

interface RecommendationFilters {
  type: string[];
  priority: string[];
  confidence: number;
  category: string[];
  showFeedback: boolean;
}

interface AIInsight {
  id: string;
  title: string;
  insight: string;
  impact: 'positive' | 'negative' | 'neutral';
  relevance: number;
  category: string;
}

const RecommendationEngine: React.FC<{
  patient?: PatientProfile;
  className?: string;
}> = ({ patient, className = '' }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AIRecommendation | null>(null);
  const [filters, setFilters] = useState<RecommendationFilters>({
    type: [],
    priority: [],
    confidence: 70,
    category: [],
    showFeedback: false
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (patient) {
      generateRecommendations();
    }
  }, [patient]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'drug_selection',
          priority: 'high',
          confidence: 92,
          title: 'Consider Pembrolizumab for PD-L1 Positive NSCLC',
          description: 'Based on patient\'s PD-L1 expression (85%) and stage IIIB NSCLC, pembrolizumab monotherapy is recommended as first-line treatment.',
          rationale: [
            'PD-L1 tumor proportion score ≥50% (85% in this patient)',
            'Stage IIIB non-small cell lung cancer diagnosis',
            'No contraindications to immunotherapy identified',
            'ECOG performance status 0-1',
            'Adequate organ function'
          ],
          evidence: {
            level: 'A',
            sources: ['KEYNOTE-024', 'KEYNOTE-042', 'NCCN Guidelines'],
            studyCount: 15,
            patientCount: 8420
          },
          recommendation: 'Initiate pembrolizumab 200mg IV every 3 weeks',
          alternatives: ['Carboplatin + paclitaxel + pembrolizumab', 'Atezolizumab monotherapy'],
          monitoring: ['Immune-related adverse events', 'Tumor response (8-12 weeks)', 'Thyroid function'],
          expectedOutcome: {
            efficacy: 87,
            safety: 78,
            timeToEffect: '6-8 weeks',
            durationOfEffect: '12-24 months'
          },
          timestamp: '2024-01-15T14:30:00Z',
          category: 'Immunotherapy'
        },
        {
          id: '2',
          type: 'dose_adjustment',
          priority: 'medium',
          confidence: 88,
          title: 'Carboplatin Dose Adjustment for Renal Function',
          description: 'Patient\'s creatinine clearance of 65 mL/min requires carboplatin dose modification using Calvert formula.',
          rationale: [
            'Creatinine clearance 65 mL/min (mild renal impairment)',
            'Age 72 years with potential for further decline',
            'Previous nephrotoxicity history with cisplatin',
            'Optimal AUC targeting for efficacy and safety'
          ],
          evidence: {
            level: 'A',
            sources: ['Calvert Formula Validation Studies', 'FDA Label', 'Clinical Pharmacology'],
            studyCount: 8,
            patientCount: 2340
          },
          recommendation: 'Reduce carboplatin dose to AUC 4.5 (calculated: 320mg total dose)',
          monitoring: ['Renal function weekly', 'Complete blood count', 'Hearing assessment'],
          expectedOutcome: {
            efficacy: 85,
            safety: 92,
            timeToEffect: '2-3 weeks',
            durationOfEffect: '3-4 weeks per cycle'
          },
          timestamp: '2024-01-15T14:25:00Z',
          category: 'Dose Optimization'
        },
        {
          id: '3',
          type: 'monitoring',
          priority: 'high',
          confidence: 95,
          title: 'Enhanced Cardiac Monitoring for Doxorubicin',
          description: 'Patient at increased risk for doxorubicin-induced cardiomyopathy due to age and baseline LVEF.',
          rationale: [
            'Age >65 years (72 years)',
            'Baseline LVEF 55% (borderline)',
            'Planned cumulative dose >300 mg/m²',
            'History of hypertension',
            'Female gender (increased risk)'
          ],
          evidence: {
            level: 'A',
            sources: ['Cardio-Oncology Guidelines', 'ASE/EACVI Recommendations', 'ASCO Guidelines'],
            studyCount: 25,
            patientCount: 12500
          },
          recommendation: 'Obtain echocardiogram before each cycle after 240 mg/m² cumulative dose',
          monitoring: ['Echocardiogram q3 cycles initially, then q cycle', 'BNP/NT-proBNP', 'Clinical symptoms'],
          expectedOutcome: {
            efficacy: 88,
            safety: 94,
            timeToEffect: 'Immediate',
            durationOfEffect: 'Ongoing'
          },
          timestamp: '2024-01-15T14:20:00Z',
          category: 'Cardiotoxicity Prevention'
        },
        {
          id: '4',
          type: 'biomarker',
          priority: 'medium',
          confidence: 82,
          title: 'EGFR Mutation Testing Recommended',
          description: 'Given patient demographics and histology, EGFR mutation testing could identify targeted therapy options.',
          rationale: [
            'Adenocarcinoma histology',
            'Never smoker status',
            'Asian ethnicity',
            'Female gender',
            'Age >65 years'
          ],
          evidence: {
            level: 'A',
            sources: ['NCCN Guidelines', 'IASLC Recommendations', 'CAP/IASLC/AMP Guidelines'],
            studyCount: 45,
            patientCount: 28000
          },
          recommendation: 'Order comprehensive genomic profiling including EGFR, ALK, ROS1, BRAF, KRAS',
          alternatives: ['Targeted EGFR testing only', 'Liquid biopsy if tissue insufficient'],
          expectedOutcome: {
            efficacy: 75,
            safety: 98,
            timeToEffect: '7-14 days for results',
            durationOfEffect: 'Permanent information'
          },
          timestamp: '2024-01-15T14:15:00Z',
          category: 'Precision Medicine'
        }
      ];

      const mockInsights: AIInsight[] = [
        {
          id: '1',
          title: 'Treatment Response Prediction',
          insight: 'Based on similar patient profiles, 89% achieved partial response or better with recommended regimen',
          impact: 'positive',
          relevance: 94,
          category: 'Efficacy Prediction'
        },
        {
          id: '2',
          title: 'Risk Stratification',
          insight: 'Patient falls into moderate-risk category for treatment-related mortality (3.2% vs 2.1% average)',
          impact: 'neutral',
          relevance: 87,
          category: 'Safety Assessment'
        },
        {
          id: '3',
          title: 'Cost-Effectiveness Analysis',
          insight: 'Recommended therapy shows 1.8x better cost-effectiveness ratio compared to standard chemotherapy',
          impact: 'positive',
          relevance: 76,
          category: 'Economic Impact'
        }
      ];

      setRecommendations(mockRecommendations);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (recommendationId: string, feedback: 'accepted' | 'rejected' | 'modified') => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, userFeedback: feedback }
        : rec
    ));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drug_selection': return <Target className="w-4 h-4 text-blue-500" />;
      case 'dose_adjustment': return <Activity className="w-4 h-4 text-purple-500" />;
      case 'monitoring': return <Eye className="w-4 h-4 text-green-500" />;
      case 'interaction_alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'clinical_pathway': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'biomarker': return <Database className="w-4 h-4 text-cyan-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEvidenceIcon = (level: string) => {
    switch (level) {
      case 'A': return <Award className="w-4 h-4 text-green-500" />;
      case 'B': return <Star className="w-4 h-4 text-blue-500" />;
      case 'C': return <BookOpen className="w-4 h-4 text-yellow-500" />;
      case 'D': return <Users className="w-4 h-4 text-gray-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.type.length > 0 && !filters.type.includes(rec.type)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(rec.priority)) return false;
    if (rec.confidence < filters.confidence) return false;
    if (filters.category.length > 0 && !filters.category.includes(rec.category)) return false;
    if (!filters.showFeedback && rec.userFeedback) return false;
    return true;
  });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI-Powered Recommendations</h2>
              <p className="text-sm text-gray-600">
                Personalized clinical decision support based on patient data and evidence
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configure AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="space-y-1">
                {['drug_selection', 'dose_adjustment', 'monitoring', 'biomarker'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                        } else {
                          setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <div className="space-y-1">
                {['high', 'medium', 'low'].map((priority) => (
                  <label key={priority} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ ...prev, priority: [...prev.priority, priority] }));
                        } else {
                          setFilters(prev => ({ ...prev, priority: prev.priority.filter(p => p !== priority) }));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Confidence: {filters.confidence}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={filters.confidence}
                onChange={(e) => setFilters(prev => ({ ...prev, confidence: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showFeedback}
                  onChange={(e) => setFilters(prev => ({ ...prev, showFeedback: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show feedback given</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI is analyzing patient data and generating recommendations...</p>
            </div>
          </div>
        ) : !patient ? (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Patient Selected</h3>
            <p className="text-gray-600">Select a patient to generate AI-powered recommendations.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Insights Summary */}
            {insights.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-900 mb-3 flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5" />
                  <span>AI Insights</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                        <span className="text-xs text-gray-500">{insight.relevance}% relevant</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Recommendations ({filteredRecommendations.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Sorted by priority and confidence
                </div>
              </div>
              
              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recommendations match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecommendations.map((recommendation) => (
                    <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          {getTypeIcon(recommendation.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                              {getPriorityIcon(recommendation.priority)}
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {recommendation.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className={`font-bold ${getConfidenceColor(recommendation.confidence)}`}>
                              {recommendation.confidence}%
                            </div>
                            <div className="text-xs text-gray-500">confidence</div>
                          </div>
                          {getEvidenceIcon(recommendation.evidence.level)}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                        <div className="font-medium text-blue-900 mb-1">Recommendation:</div>
                        <div className="text-blue-800">{recommendation.recommendation}</div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Expected Outcomes:</h5>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Efficacy:</span>
                              <span className="font-medium">{recommendation.expectedOutcome.efficacy}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Safety:</span>
                              <span className="font-medium">{recommendation.expectedOutcome.safety}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time to Effect:</span>
                              <span className="font-medium">{recommendation.expectedOutcome.timeToEffect}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Evidence Level {recommendation.evidence.level}:</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>{recommendation.evidence.studyCount} studies</div>
                            <div>{recommendation.evidence.patientCount.toLocaleString()} patients</div>
                            <div className="flex flex-wrap gap-1">
                              {recommendation.evidence.sources.slice(0, 2).map((source, index) => (
                                <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {new Date(recommendation.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {recommendation.userFeedback ? (
                            <span className={`text-sm px-2 py-1 rounded ${
                              recommendation.userFeedback === 'accepted' ? 'bg-green-100 text-green-800' :
                              recommendation.userFeedback === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {recommendation.userFeedback}
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleFeedback(recommendation.id, 'accepted')}
                                className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Accept recommendation"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(recommendation.id, 'rejected')}
                                className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Reject recommendation"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => setSelectedRecommendation(recommendation)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Recommendation Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{selectedRecommendation.title}</h3>
                <button
                  onClick={() => setSelectedRecommendation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Clinical Rationale:</h4>
                <ul className="space-y-1">
                  {selectedRecommendation.rationale.map((point, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedRecommendation.monitoring && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Monitoring Requirements:</h4>
                  <ul className="space-y-1">
                    {selectedRecommendation.monitoring.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                        <Eye className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedRecommendation.alternatives && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Alternative Options:</h4>
                  <ul className="space-y-1">
                    {selectedRecommendation.alternatives.map((alt, index) => (
                      <li key={index} className="text-sm text-gray-700">• {alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationEngine;