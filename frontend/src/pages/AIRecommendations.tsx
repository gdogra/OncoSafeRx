import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import RecommendationEngine from '../components/AI/RecommendationEngine';
import InteroperabilityManager from '../components/Analytics/InteroperabilityManager';
import { 
  Brain, 
  Globe, 
  Target, 
  Users, 
  Activity,
  TrendingUp,
  Shield,
  Zap,
  Database,
  Cloud,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface SystemStatus {
  ai: {
    status: 'online' | 'offline' | 'training';
    accuracy: number;
    lastUpdate: string;
    modelsLoaded: number;
  };
  interoperability: {
    connectedSystems: number;
    dataFlows: number;
    errorRate: number;
    uptime: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorCount: number;
  };
}

const AIRecommendations: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [activeTab, setActiveTab] = useState<'recommendations' | 'interoperability' | 'system'>('recommendations');
  const [systemStatus] = useState<SystemStatus>({
    ai: {
      status: 'online',
      accuracy: 94.7,
      lastUpdate: '2024-01-15T12:00:00Z',
      modelsLoaded: 12
    },
    interoperability: {
      connectedSystems: 5,
      dataFlows: 8,
      errorRate: 0.12,
      uptime: 99.97
    },
    performance: {
      responseTime: 245,
      throughput: 1250,
      errorCount: 3
    }
  });

  const tabs = [
    { 
      id: 'recommendations', 
      label: 'AI Recommendations', 
      icon: Brain,
      description: 'Personalized clinical decision support'
    },
    { 
      id: 'interoperability', 
      label: 'Interoperability', 
      icon: Globe,
      description: 'System integrations and data flows'
    },
    { 
      id: 'system', 
      label: 'System Status', 
      icon: Activity,
      description: 'Platform health and performance'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'training': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const StatusCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color = 'blue',
    status 
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<any>;
    color?: string;
    status?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600'
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {status && getStatusIcon(status)}
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI & Interoperability Hub</h1>
          <Globe className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Advanced clinical decision support powered by AI and comprehensive system interoperability
        </p>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="AI Model Status"
          value={systemStatus.ai.status.charAt(0).toUpperCase() + systemStatus.ai.status.slice(1)}
          subtitle={`${systemStatus.ai.accuracy}% accuracy`}
          icon={Brain}
          color="purple"
          status={systemStatus.ai.status}
        />
        
        <StatusCard
          title="Connected Systems"
          value={systemStatus.interoperability.connectedSystems}
          subtitle={`${systemStatus.interoperability.dataFlows} active data flows`}
          icon={Globe}
          color="blue"
        />
        
        <StatusCard
          title="System Uptime"
          value={`${systemStatus.interoperability.uptime}%`}
          subtitle="Last 30 days"
          icon={TrendingUp}
          color="green"
        />
        
        <StatusCard
          title="Response Time"
          value={`${systemStatus.performance.responseTime}ms`}
          subtitle="Average API response"
          icon={Zap}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
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
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-400 font-normal">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            {/* Patient Context */}
            {currentPatient ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">
                        AI Recommendations for: {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
                      </h3>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>
                          {currentPatient.demographics.dateOfBirth ? 
                            new Date().getFullYear() - new Date(currentPatient.demographics.dateOfBirth).getFullYear() : 
                            'Unknown age'
                          } year old {currentPatient.demographics.sex}
                          {currentPatient.demographics.mrn && ` • MRN: ${currentPatient.demographics.mrn}`}
                        </p>
                        {currentPatient.conditions && currentPatient.conditions.length > 0 && (
                          <p>
                            Primary condition: {currentPatient.conditions[0].name}
                            {currentPatient.conditions.length > 1 && ` (+${currentPatient.conditions.length - 1} more)`}
                          </p>
                        )}
                        {currentPatient.medications && currentPatient.medications.length > 0 && (
                          <p>Current medications: {currentPatient.medications.length} active</p>
                        )}
                        {currentPatient.allergies && currentPatient.allergies.length > 0 && (
                          <p className="text-orange-700 font-medium">⚠️ {currentPatient.allergies.length} known allergies</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <a
                    href="/patients/all"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    Change Patient
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-900 mb-2">No Patient Selected</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                      To generate personalized AI recommendations, you need to select a patient first. 
                      The AI system analyzes patient-specific data including demographics, conditions, medications, 
                      allergies, and lab values to provide tailored clinical decision support.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="/patients/all"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Go to Patient Management
                      </a>
                      <div className="text-xs text-yellow-600 pt-2 sm:pt-3">
                        Select a patient from the Patient Management page, then return here for AI recommendations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendation Engine */}
            <RecommendationEngine patient={currentPatient || undefined} />

            {/* AI Model Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>AI Model Information</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.ai.status)}
                  <span className="text-sm text-gray-600">
                    Last updated: {new Date(systemStatus.ai.lastUpdate).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Models Loaded</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Drug Selection Model</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dose Optimization Model</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interaction Prediction Model</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outcome Prediction Model</span>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Overall Accuracy:</span>
                      <span className="font-medium text-green-600">{systemStatus.ai.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precision:</span>
                      <span className="font-medium">92.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recall:</span>
                      <span className="font-medium">89.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>F1 Score:</span>
                      <span className="font-medium">91.0%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Training Data</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Patient Records:</span>
                      <span className="font-medium">2.4M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clinical Trials:</span>
                      <span className="font-medium">15,420</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Drug Interactions:</span>
                      <span className="font-medium">890K</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Genomic Variants:</span>
                      <span className="font-medium">125K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interoperability' && (
          <InteroperabilityManager />
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            {/* System Health Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span>Platform Performance</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Response Time</span>
                    <span className="font-medium">{systemStatus.performance.responseTime}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Throughput (req/min)</span>
                    <span className="font-medium">{systemStatus.performance.throughput.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="font-medium text-green-600">{systemStatus.interoperability.errorRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-500" />
                  <span>Data Processing</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">45.2K</div>
                      <div className="text-blue-800">Records Processed</div>
                      <div className="text-xs text-blue-600">Today</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">1.8M</div>
                      <div className="text-green-800">Total Records</div>
                      <div className="text-xs text-green-600">In Database</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Storage Usage:</span>
                      <span className="font-medium">2.4TB / 5TB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent System Events */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>Recent System Events</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium text-green-900">AI Model Update Completed</div>
                    <div className="text-sm text-green-700">Drug interaction model updated with latest clinical data</div>
                  </div>
                  <div className="text-xs text-green-600">2 hours ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Cloud className="w-5 h-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">EHR Integration Health Check</div>
                    <div className="text-sm text-blue-700">All connected systems responding normally</div>
                  </div>
                  <div className="text-xs text-blue-600">4 hours ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <RefreshCw className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-900">Scheduled Maintenance</div>
                    <div className="text-sm text-yellow-700">Analytics dashboard will be updated tomorrow at 2:00 AM</div>
                  </div>
                  <div className="text-xs text-yellow-600">8 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;
