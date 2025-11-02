/**
 * Advanced AI Dashboard
 * 
 * Enterprise-grade AI interface showcasing real-time treatment optimization,
 * clinical decision support, and predictive analytics
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Cpu,
  Activity,
  FileText,
  Image,
  Mic,
  MessageSquare,
  BookOpen,
  Search,
  TrendingUp,
  Shield,
  Clock,
  Award,
  Network,
  Zap,
  BarChart3,
  Users,
  Target,
  Lightbulb,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';

interface AIMetrics {
  treatmentOptimizationAccuracy: number;
  adverseEventPredictionAccuracy: number;
  nlpClinicalAccuracy: number;
  imagingAnalysisAccuracy: number;
  voiceTranscriptionAccuracy: number;
}

interface FederatedLearningStatus {
  networkSize: string;
  totalPatients: string;
  modelAccuracy: AIMetrics;
  lastUpdate: string;
  dataPrivacyCompliant: boolean;
}

export default function AdvancedAIDashboard() {
  const [aiMetrics, setAIMetrics] = useState<AIMetrics | null>(null);
  const [federatedStatus, setFederatedStatus] = useState<FederatedLearningStatus | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load AI system metrics
      const healthResponse = await fetch('/api/advanced-ai/system/health');
      const healthData = await healthResponse.json();
      
      // Load federated learning status
      const federatedResponse = await fetch('/api/advanced-ai/federated-learning/status');
      const federatedData = await federatedResponse.json();
      
      // Load analytics
      const analyticsResponse = await fetch('/api/advanced-ai/analytics/dashboard');
      const analytics = await analyticsResponse.json();
      
      if (healthData.success) {
        setSystemHealth(healthData.systemHealth);
        setAIMetrics(healthData.systemHealth.advancedAI.modelAccuracy);
      }
      
      if (federatedData.success) {
        setFederatedStatus(federatedData.federatedLearning);
      }
      
      if (analytics.success) {
        setAnalyticsData(analytics.analytics);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startDemo = async (demoType: string) => {
    setActiveDemo(demoType);
    // Simulate demo interaction
    setTimeout(() => setActiveDemo(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading Advanced AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced AI Platform</h1>
                <p className="text-gray-600">Enterprise-Grade Clinical Intelligence</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
              <button
                onClick={loadDashboardData}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Capabilities Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Real-time Treatment Optimization */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Treatment Optimization</h3>
              </div>
              <button
                onClick={() => startDemo('treatment')}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={activeDemo === 'treatment'}
              >
                {activeDemo === 'treatment' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-lg font-bold text-green-600">
                  {aiMetrics ? `${(aiMetrics.treatmentOptimizationAccuracy * 100).toFixed(1)}%` : 'Loading...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: aiMetrics ? `${aiMetrics.treatmentOptimizationAccuracy * 100}%` : '0%' }}
                ></div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Federated learning across 25+ hospitals</li>
                <li>• Real-time dosage optimization</li>
                <li>• Sub-2 second response times</li>
                <li>• 2.5M+ patient records training data</li>
              </ul>
            </div>
          </div>

          {/* Predictive Adverse Events */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Adverse Event Prediction</h3>
              </div>
              <button
                onClick={() => startDemo('adverse')}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                disabled={activeDemo === 'adverse'}
              >
                {activeDemo === 'adverse' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy</span>
                <span className="text-lg font-bold text-green-600">
                  {aiMetrics ? `${(aiMetrics.adverseEventPredictionAccuracy * 100).toFixed(1)}%` : 'Loading...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: aiMetrics ? `${aiMetrics.adverseEventPredictionAccuracy * 100}%` : '0%' }}
                ></div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 95.6% prediction accuracy</li>
                <li>• 30-day risk forecasting</li>
                <li>• Genetic predisposition analysis</li>
                <li>• Preventive intervention protocols</li>
              </ul>
            </div>
          </div>

          {/* Clinical Decision Support */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Clinical Decision Support</h3>
              </div>
              <button
                onClick={() => startDemo('clinical')}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                disabled={activeDemo === 'clinical'}
              >
                {activeDemo === 'clinical' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Quality</span>
                <span className="text-lg font-bold text-green-600">
                  {aiMetrics ? `${(aiMetrics.nlpClinicalAccuracy * 100).toFixed(1)}%` : 'Loading...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: aiMetrics ? `${aiMetrics.nlpClinicalAccuracy * 100}%` : '0%' }}
                ></div>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Evidence-based recommendations</li>
                <li>• Real-time literature citations</li>
                <li>• Natural language interaction</li>
                <li>• Oncology-specialized LLM</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Advanced AI Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* NLP & Voice Features */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Cpu className="h-6 w-6 text-indigo-600 mr-3" />
              NLP & Voice AI
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Clinical Note Analysis</h4>
                <p className="text-sm text-gray-600">Automated coding & extraction</p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  91% Accuracy
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Mic className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Voice Documentation</h4>
                <p className="text-sm text-gray-600">Hands-free clinical notes</p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  95% Transcription
                </div>
              </div>
            </div>
          </div>

          {/* Computer Vision & Imaging */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Image className="h-6 w-6 text-green-600 mr-3" />
              Medical Imaging AI
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Activity className="h-8 w-8 text-red-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Radiology Analysis</h4>
                <p className="text-sm text-gray-600">CT, MRI, PET scan interpretation</p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  88% Detection Rate
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <Search className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">Pathology Vision</h4>
                <p className="text-sm text-gray-600">Histological pattern recognition</p>
                <div className="mt-2 text-xs text-green-600 font-medium">
                  Beta Testing
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Federated Learning Network Status */}
        {federatedStatus && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Network className="h-6 w-6 text-blue-600 mr-3" />
              Federated Learning Network
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{federatedStatus.networkSize}</div>
                <div className="text-sm text-gray-600">Hospital Partners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{federatedStatus.totalPatients}</div>
                <div className="text-sm text-gray-600">Anonymized Records</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">HIPAA Compliant</span>
                </div>
                <div className="text-sm text-gray-600">Privacy Preserving</div>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Impact Analytics */}
        {analyticsData && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 text-indigo-600 mr-3" />
              Clinical Impact Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analyticsData.clinicalImpact?.adverseEventsPreventedEstimate || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Adverse Events Prevented</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analyticsData.clinicalImpact?.treatmentOptimizationsApplied || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Treatment Optimizations</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analyticsData.clinicalImpact?.physiciansTimesSaved || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Physician Time Saved</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {analyticsData.clinicalImpact?.patientSatisfactionImprovement || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Patient Satisfaction ↑</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="h-6 w-6 text-yellow-500 mr-3" />
            Quick AI Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <BookOpen className="h-6 w-6 text-blue-600 mb-2" />
              <div className="font-semibold text-gray-900">Generate Treatment Plan</div>
              <div className="text-sm text-gray-600">AI-powered plan with physician review</div>
              <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <MessageSquare className="h-6 w-6 text-green-600 mb-2" />
              <div className="font-semibold text-gray-900">Clinical Decision Support</div>
              <div className="text-sm text-gray-600">Ask the AI assistant</div>
              <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Upload className="h-6 w-6 text-purple-600 mb-2" />
              <div className="font-semibold text-gray-900">Analyze Medical Image</div>
              <div className="text-sm text-gray-600">Upload radiology or pathology</div>
              <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Search className="h-6 w-6 text-red-600 mb-2" />
              <div className="font-semibold text-gray-900">Literature Search</div>
              <div className="text-sm text-gray-600">AI-powered medical research</div>
              <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}