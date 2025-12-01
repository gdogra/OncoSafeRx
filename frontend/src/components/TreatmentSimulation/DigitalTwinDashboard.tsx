import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Download,
  Share2,
  Brain,
  Zap,
  Target,
  Shield,
  Heart,
  Eye
} from 'lucide-react';

interface DigitalTwinProps {
  patientId: string;
  onSimulationComplete?: (results: any) => void;
}

interface TreatmentOption {
  id: string;
  name: string;
  drugs: string[];
  dosing: string;
  duration: number;
  confidence: number;
}

interface SimulationResult {
  treatmentId: string;
  outcomes: {
    survivalProbability: Record<string, number>;
    responseRate: number;
    timeToProgression: number;
    qualityOfLife: number[];
    toxicity: any[];
  };
  timeline: any[];
  confidence: number;
}

const DigitalTwinDashboard: React.FC<DigitalTwinProps> = ({ 
  patientId, 
  onSimulationComplete 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOption[]>([]);
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'comparison' | 'detailed'>('comparison');

  useEffect(() => {
    initializeDigitalTwin();
    loadTreatmentOptions();
  }, [patientId]);

  const initializeDigitalTwin = async () => {
    setLoading(true);
    try {
      // Mock patient profile - in real implementation, fetch from API
      const mockPatientProfile = {
        patientId,
        age: 62,
        tumorType: 'lung',
        stage: 'IIIB',
        genomicData: {
          mutations: [
            { gene: 'EGFR', variant: 'L858R', alleleFrequency: 0.45 },
            { gene: 'TP53', variant: 'R273H', alleleFrequency: 0.67 }
          ]
        },
        performanceStatus: 1,
        organFunction: {
          renal: { creatinineClearance: 85 },
          hepatic: { bilirubinTotal: 1.2 },
          cardiac: { ejectionFraction: 58 }
        }
      };

      // Create digital twin
      const response = await fetch('/api/digital-twin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientProfile: mockPatientProfile })
      });

      if (response.ok) {
        const twin = await response.json();
        setDigitalTwin(twin);
      }
    } catch (error) {
      console.error('Error initializing digital twin:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTreatmentOptions = async () => {
    // Mock treatment options
    const options: TreatmentOption[] = [
      {
        id: 'egfr_tki',
        name: 'EGFR TKI Monotherapy',
        drugs: ['Osimertinib'],
        dosing: '80mg daily',
        duration: 365,
        confidence: 0.85
      },
      {
        id: 'combo_immuno',
        name: 'Combination Immunotherapy',
        drugs: ['Pembrolizumab', 'Chemotherapy'],
        dosing: 'Q3W + Standard',
        duration: 180,
        confidence: 0.72
      },
      {
        id: 'targeted_combo',
        name: 'Targeted Combination',
        drugs: ['Osimertinib', 'Bevacizumab'],
        dosing: '80mg daily + Q3W',
        duration: 365,
        confidence: 0.68
      }
    ];
    setTreatmentOptions(options);
    setSelectedTreatments([options[0].id]);
  };

  const runSimulation = async () => {
    if (selectedTreatments.length === 0) return;

    setIsSimulating(true);
    setSimulationProgress(0);
    const results: SimulationResult[] = [];

    try {
      for (let i = 0; i < selectedTreatments.length; i++) {
        const treatmentId = selectedTreatments[i];
        const treatment = treatmentOptions.find(t => t.id === treatmentId);
        
        if (!treatment) continue;

        // Simulate progress
        const progressInterval = setInterval(() => {
          setSimulationProgress(prev => Math.min(prev + 5, 90));
        }, 200);

        // Mock simulation API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        clearInterval(progressInterval);
        setSimulationProgress(((i + 1) / selectedTreatments.length) * 100);

        // Mock simulation results
        const result: SimulationResult = {
          treatmentId,
          outcomes: {
            survivalProbability: {
              '6months': 0.92,
              '12months': 0.78,
              '24months': 0.56,
              '36months': 0.34
            },
            responseRate: Math.random() * 0.4 + 0.3,
            timeToProgression: Math.random() * 6 + 8,
            qualityOfLife: Array.from({ length: 52 }, (_, i) => 
              Math.max(0, 0.8 - (i / 52) * 0.3 + Math.random() * 0.1)
            ),
            toxicity: [
              { grade: 1, probability: 0.45 },
              { grade: 2, probability: 0.28 },
              { grade: 3, probability: 0.12 },
              { grade: 4, probability: 0.03 }
            ]
          },
          timeline: [],
          confidence: treatment.confidence
        };

        results.push(result);
      }

      setSimulationResults(results);
      onSimulationComplete?.(results);

    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsSimulating(false);
      setSimulationProgress(100);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Digital Twin Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Digital Twin Status</h3>
            <p className="text-sm text-gray-600">
              Patient virtual model created with {digitalTwin?.calibration?.dataPoints || 0} data points
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((digitalTwin?.metadata?.confidence || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Target className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tumor Model</p>
              <p className="text-lg font-bold text-gray-900">
                {digitalTwin?.tumorModel?.type || 'Gompertz'}
              </p>
              <p className="text-xs text-gray-500">Growth kinetics</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Drug Response</p>
              <p className="text-lg font-bold text-gray-900">
                {Math.round((digitalTwin?.pharmacologyModel?.pharmacodynamics?.efficacy || 0.7) * 100)}%
              </p>
              <p className="text-xs text-gray-500">Predicted efficacy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Resistance Risk</p>
              <p className="text-lg font-bold text-gray-900">
                {digitalTwin?.resistanceModel?.baseline?.resistanceMutations?.length || 0}
              </p>
              <p className="text-xs text-gray-500">Known factors</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Heart className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Organ Function</p>
              <p className="text-lg font-bold text-gray-900">Normal</p>
              <p className="text-xs text-gray-500">All systems</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Components */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Tumor Growth Model</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Pharmacology Model</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Immune Response Model</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-900">Resistance Evolution</span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSimulationTab = () => (
    <div className="space-y-6">
      {/* Treatment Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Options</h3>
        <div className="space-y-3">
          {treatmentOptions.map((treatment) => (
            <div
              key={treatment.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTreatments.includes(treatment.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setSelectedTreatments(prev => 
                  prev.includes(treatment.id)
                    ? prev.filter(id => id !== treatment.id)
                    : [...prev, treatment.id]
                );
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                  <p className="text-sm text-gray-600">
                    {treatment.drugs.join(' + ')} • {treatment.dosing}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round(treatment.confidence * 100)}% confidence
                  </div>
                  <div className="text-xs text-gray-500">Model reliability</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={runSimulation}
            disabled={isSimulating || selectedTreatments.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Simulating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </button>
          
          {isSimulating && (
            <div className="flex-1">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {simulationProgress < 100 ? `Progress: ${simulationProgress}%` : 'Complete!'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Results */}
      {simulationResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Simulation Results</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'comparison' ? 'detailed' : 'comparison')}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-1 inline" />
                {viewMode === 'comparison' ? 'Detailed View' : 'Comparison View'}
              </button>
            </div>
          </div>

          {viewMode === 'comparison' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">Treatment</th>
                    <th className="text-left py-2 px-3">Response Rate</th>
                    <th className="text-left py-2 px-3">12mo Survival</th>
                    <th className="text-left py-2 px-3">Time to Progression</th>
                    <th className="text-left py-2 px-3">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.map((result) => {
                    const treatment = treatmentOptions.find(t => t.id === result.treatmentId);
                    return (
                      <tr key={result.treatmentId} className="border-b border-gray-100">
                        <td className="py-3 px-3 font-medium">{treatment?.name}</td>
                        <td className="py-3 px-3">
                          {Math.round(result.outcomes.responseRate * 100)}%
                        </td>
                        <td className="py-3 px-3">
                          {Math.round(result.outcomes.survivalProbability['12months'] * 100)}%
                        </td>
                        <td className="py-3 px-3">
                          {result.outcomes.timeToProgression.toFixed(1)} months
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            result.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            result.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {Math.round(result.confidence * 100)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6">
              {simulationResults.map((result) => {
                const treatment = treatmentOptions.find(t => t.id === result.treatmentId);
                return (
                  <div key={result.treatmentId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{treatment?.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(result.outcomes.responseRate * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {result.outcomes.timeToProgression.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Months to Progression</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(result.outcomes.survivalProbability['24months'] * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">2-Year Survival</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Digital Twin Overview', icon: Brain },
    { id: 'simulation', label: 'Treatment Simulation', icon: Play },
    { id: 'monitoring', label: 'Response Monitoring', icon: Activity },
    { id: 'resistance', label: 'Resistance Prediction', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating digital twin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Twin Treatment Simulation</h1>
        <p className="text-gray-600">
          Virtual patient modeling for treatment outcome prediction and optimization
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
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
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'simulation' && renderSimulationTab()}
        {activeTab === 'monitoring' && (
          <div className="text-center text-gray-500 py-12">
            Response monitoring features coming soon...
          </div>
        )}
        {activeTab === 'resistance' && (
          <div className="text-center text-gray-500 py-12">
            Resistance prediction analytics coming soon...
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalTwinDashboard;