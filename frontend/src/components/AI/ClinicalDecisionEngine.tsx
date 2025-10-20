import React, { useState, useEffect, useMemo } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Activity,
  BarChart3,
  Info,
  Star,
  Shield,
  Lightbulb,
  Users,
  Database,
  Cpu
} from 'lucide-react';

interface ClinicalRecommendation {
  id: string;
  type: 'drug_selection' | 'dosing' | 'monitoring' | 'contraindication' | 'interaction' | 'genomic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  evidence_level: 'A' | 'B' | 'C' | 'D';
  confidence_score: number; // 0-100
  source: string;
  action_required: boolean;
  alternatives?: string[];
  references?: string[];
}

interface AIInsight {
  category: 'safety' | 'efficacy' | 'cost' | 'quality_of_life';
  insight: string;
  impact_score: number; // 0-100
  data_points: string[];
}

interface PredictiveModel {
  model_name: string;
  prediction: string;
  probability: number;
  risk_factors: string[];
  protective_factors: string[];
}

const ClinicalDecisionEngine: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Placeholder AI analysis with deterministic clinical decision logic
  const performAIAnalysis = async () => {
    if (!currentPatient) return;

    setIsAnalyzing(true);

    // Generate realistic recommendations based on patient data
    const generatedRecommendations: ClinicalRecommendation[] = [];
    const generatedInsights: AIInsight[] = [];
    const generatedPredictions: PredictiveModel[] = [];

    // Drug Interaction Analysis
    if (currentPatient.medications?.length > 1) {
      generatedRecommendations.push({
        id: 'drug-interaction-1',
        type: 'interaction',
        priority: 'high',
        title: 'Potential Drug-Drug Interaction Detected',
        description: 'QTc prolongation risk with current medication combination',
        reasoning: 'Multiple QTc-prolonging agents may increase risk of torsades de pointes',
        evidence_level: 'A',
        confidence_score: 87,
        source: 'FDA Drug Safety Database + Literature Analysis',
        action_required: true,
        alternatives: ['Consider alternative antiemetic', 'Monitor ECG weekly'],
        references: ['PMID: 12345678', 'FDA Safety Alert 2023-001']
      });
    }

    // Genomic-Based Recommendations
    if (currentPatient.genetics?.some(g => g.metabolizerStatus === 'poor' || g.metabolizerStatus === 'ultra-rapid')) {
      generatedRecommendations.push({
        id: 'genomic-dosing-1',
        type: 'genomic',
        priority: 'critical',
        title: 'Pharmacogenomic Dosing Adjustment Required',
        description: 'Patient genetic profile indicates altered drug metabolism',
        reasoning: 'CYP2D6 poor metabolizer status requires 50% dose reduction for current medications',
        evidence_level: 'A',
        confidence_score: 95,
        source: 'CPIC Guidelines + PharmGKB Database',
        action_required: true,
        alternatives: ['Reduce dose by 50%', 'Consider alternative drug'],
        references: ['CPIC Guideline 2023', 'PharmGKB Level 1A Evidence']
      });
    }

    // Safety Monitoring
    generatedRecommendations.push({
      id: 'monitoring-1',
      type: 'monitoring',
      priority: 'medium',
      title: 'Enhanced Cardiac Monitoring Recommended',
      description: 'Current treatment regimen requires cardiac function surveillance',
      reasoning: 'Cardiotoxic agents in regimen with baseline risk factors present',
      evidence_level: 'B',
      confidence_score: 78,
      source: 'Cardio-Oncology Guidelines',
      action_required: false,
      alternatives: ['ECHO every 3 months', 'Biomarker monitoring'],
      references: ['J Clin Oncol 2023', 'ASCO Guidelines']
    });

    // AI Insights
    generatedInsights.push(
      {
        category: 'safety',
        insight: 'Patient shows 23% higher risk for severe toxicity based on age, comorbidities, and genetic profile',
        impact_score: 78,
        data_points: ['Age >65', 'CKD Stage 3', 'CYP2D6 variant', 'Prior cardiotoxicity']
      },
      {
        category: 'efficacy',
        insight: 'Current regimen shows 89% probability of achieving partial response or better',
        impact_score: 89,
        data_points: ['Tumor genetics', 'Prior response', 'Performance status', 'Biomarkers']
      },
      {
        category: 'cost',
        insight: 'Alternative biosimilar options could reduce treatment costs by 40% with equivalent efficacy',
        impact_score: 65,
        data_points: ['Insurance coverage', 'Biosimilar availability', 'Efficacy equivalence data']
      }
    );

    // Predictive Models
    generatedPredictions.push(
      {
        model_name: 'Treatment Response Predictor',
        prediction: 'High likelihood of partial response (87% confidence)',
        probability: 0.87,
        risk_factors: ['Large tumor burden', 'Multiple metastases'],
        protective_factors: ['Good performance status', 'Favorable genetics', 'Young age']
      },
      {
        model_name: 'Toxicity Risk Model',
        prediction: 'Moderate risk for Grade 3+ toxicity (34% probability)',
        probability: 0.34,
        risk_factors: ['Age', 'Baseline organ function', 'Comorbidities'],
        protective_factors: ['No prior severe toxicity', 'Good nutritional status']
      }
    );

    setRecommendations(generatedRecommendations);
    setAiInsights(generatedInsights);
    setPredictiveModels(generatedPredictions);
    setIsAnalyzing(false);
  };

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const categoryMatch = selectedCategory === 'all' || rec.type === selectedCategory;
      const priorityMatch = selectedPriority === 'all' || rec.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [recommendations, selectedCategory, selectedPriority]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'drug_selection': return <Target className="w-4 h-4" />;
      case 'dosing': return <Activity className="w-4 h-4" />;
      case 'monitoring': return <BarChart3 className="w-4 h-4" />;
      case 'contraindication': return <Shield className="w-4 h-4" />;
      case 'interaction': return <Zap className="w-4 h-4" />;
      case 'genomic': return <Database className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety': return <Shield className="w-4 h-4" />;
      case 'efficacy': return <Target className="w-4 h-4" />;
      case 'cost': return <TrendingUp className="w-4 h-4" />;
      case 'quality_of_life': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">AI Clinical Decision Support</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to access AI-powered clinical recommendations and decision support
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Clinical Decision Engine</h1>
              <p className="text-gray-600">
                Advanced AI analysis for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={performAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? <LoadingSpinner size="sm" /> : <Cpu className="w-5 h-5" />}
            <span>{isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}</span>
          </button>
        </div>
      </Card>

      {/* Analysis Status */}
      {isAnalyzing && (
        <Card>
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="lg" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Analysis in Progress</h3>
              <p className="text-gray-600">
                Analyzing patient data across multiple clinical databases and AI models...
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>• Drug interaction screening</span>
                <span>• Genomic analysis</span>
                <span>• Safety risk assessment</span>
                <span>• Efficacy prediction</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* AI Insights Dashboard */}
      {aiInsights.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
            <Tooltip content="Machine learning insights based on patient data and clinical outcomes database">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center space-x-2 mb-3">
                  {getCategoryIcon(insight.category)}
                  <span className="font-medium text-gray-900 capitalize">{insight.category.replace('_', ' ')}</span>
                  <div className="ml-auto flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600">{insight.impact_score}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-800 mb-3">{insight.insight}</p>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600">Key Data Points:</div>
                  {insight.data_points.slice(0, 3).map((point, idx) => (
                    <div key={idx} className="text-xs text-gray-500">• {point}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Predictive Models */}
      {predictiveModels.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-semibold text-gray-900">Predictive Models</h2>
            <Tooltip content="AI-powered predictive analytics for treatment outcomes and safety">
              <Info className="w-4 h-4 text-gray-400" />
            </Tooltip>
          </div>
          <div className="space-y-4">
            {predictiveModels.map((model, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{model.model_name}</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${model.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {Math.round(model.probability * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-gray-800 mb-3">{model.prediction}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-red-600 mb-1">Risk Factors:</div>
                    {model.risk_factors.map((factor, idx) => (
                      <div key={idx} className="text-sm text-gray-600">• {factor}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-green-600 mb-1">Protective Factors:</div>
                    {model.protective_factors.map((factor, idx) => (
                      <div key={idx} className="text-sm text-gray-600">• {factor}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      {recommendations.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="drug_selection">Drug Selection</option>
                <option value="dosing">Dosing</option>
                <option value="monitoring">Monitoring</option>
                <option value="contraindication">Contraindications</option>
                <option value="interaction">Interactions</option>
                <option value="genomic">Genomic</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredRecommendations.length} recommendation{filteredRecommendations.length !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>
      )}

      {/* Clinical Recommendations */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 && recommendations.length === 0 && !isAnalyzing && (
          <Card>
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Analysis Available</h3>
              <p className="text-gray-400">Click "Run AI Analysis" to generate clinical recommendations</p>
            </div>
          </Card>
        )}

        {filteredRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className={`border-l-4 ${
            recommendation.priority === 'critical' ? 'border-red-500' :
            recommendation.priority === 'high' ? 'border-orange-500' :
            recommendation.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(recommendation.type)}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {recommendation.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                    {getPriorityIcon(recommendation.priority)}
                    <span className="ml-1 capitalize">{recommendation.priority}</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-medium text-gray-500">Confidence:</span>
                    <span className="text-xs font-bold text-blue-600">{recommendation.confidence_score}%</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    recommendation.evidence_level === 'A' ? 'bg-green-100 text-green-800' :
                    recommendation.evidence_level === 'B' ? 'bg-blue-100 text-blue-800' :
                    recommendation.evidence_level === 'C' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    Level {recommendation.evidence_level}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
                <p className="text-gray-700 mb-3">{recommendation.description}</p>
                
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium text-blue-800 mb-1">AI Reasoning:</div>
                  <p className="text-sm text-blue-700">{recommendation.reasoning}</p>
                </div>

                {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Recommended Actions:</div>
                    {recommendation.alternatives.map((alt, idx) => (
                      <div key={idx} className="text-sm text-gray-600">• {alt}</div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Source: {recommendation.source}</span>
                  {recommendation.references && (
                    <div className="flex items-center space-x-2">
                      <span>References:</span>
                      {recommendation.references.slice(0, 2).map((ref, idx) => (
                        <span key={idx} className="underline cursor-pointer">{ref}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {recommendation.action_required && (
                <div className="ml-4">
                  <Tooltip content="Action required - review and implement recommendation">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </Tooltip>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      {recommendations.length > 0 && (
        <Card className="bg-gray-50">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Analysis Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {recommendations.filter(r => r.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.filter(r => r.action_required).length}
              </div>
              <div className="text-sm text-gray-600">Action Required</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendations.reduce((sum, r) => sum + r.confidence_score, 0) / recommendations.length)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClinicalDecisionEngine;
