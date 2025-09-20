import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PersonaSelector from '../components/User/PersonaSelector';
import { 
  TestTube, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Play,
  RotateCcw,
  FileText,
  Clock
} from 'lucide-react';
import Card from '../components/UI/Card';
import Tooltip from '../components/UI/Tooltip';

const Testing: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const [testHistory, setTestHistory] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to access testing features.</p>
      </div>
    );
  }

  const testScenarios = [
    {
      id: 'drug-interaction',
      title: 'Drug Interaction Alert',
      description: 'Test how different personas respond to potential drug interactions',
      difficulty: 'Medium',
      estimatedTime: '5 min',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      id: 'dose-calculation',
      title: 'Dose Calculation',
      description: 'Test dosing calculations with various experience levels',
      difficulty: 'Easy',
      estimatedTime: '3 min',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'clinical-decision',
      title: 'Clinical Decision Support',
      description: 'Test complex clinical decision scenarios',
      difficulty: 'Hard',
      estimatedTime: '10 min',
      icon: CheckCircle,
      color: 'green'
    },
    {
      id: 'genomics-workflow',
      title: 'Genomics Analysis',
      description: 'Test genomics interpretation workflows',
      difficulty: 'Hard',
      estimatedTime: '8 min',
      icon: TestTube,
      color: 'purple'
    }
  ];

  const runTest = (scenarioId: string) => {
    setCurrentTest(scenarioId);
    
    // Simulate test execution
    setTimeout(() => {
      const testResult = {
        id: Date.now(),
        scenarioId,
        persona: user.persona.name,
        timestamp: new Date().toISOString(),
        result: 'completed',
        score: Math.floor(Math.random() * 100) + 1
      };
      
      setTestHistory(prev => [testResult, ...prev]);
      setCurrentTest(null);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Hard': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'green': return 'text-green-600 bg-green-100';
      case 'purple': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">System Testing & Validation</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Test how different user personas interact with OncoSafeRx features. Switch personas to validate workflows, 
          UI behavior, and decision support across different user types and experience levels.
        </p>
      </div>

      {/* Persona Selector */}
      <PersonaSelector />

      {/* Test Scenarios */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TestTube className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Test Scenarios</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {testScenarios.map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <div
                key={scenario.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(scenario.color)}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tooltip 
                      content={`Difficulty: ${scenario.difficulty} - indicates complexity and required expertise level`}
                      type="help"
                    >
                      <span className={`px-2 py-1 text-xs font-medium rounded-full cursor-help ${getDifficultyColor(scenario.difficulty)}`}>
                        {scenario.difficulty}
                      </span>
                    </Tooltip>
                    <Tooltip content="Estimated completion time for this test scenario">
                      <div className="flex items-center text-xs text-gray-500 cursor-help">
                        <Clock className="w-3 h-3 mr-1" />
                        {scenario.estimatedTime}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{scenario.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

                <button
                  onClick={() => runTest(scenario.id)}
                  disabled={currentTest === scenario.id}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    currentTest === scenario.id
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {currentTest === scenario.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Running Test...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Start Test</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Test History */}
      {testHistory.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">Test History</h2>
            </div>
            <button
              onClick={() => setTestHistory([])}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-3">
            {testHistory.map((test) => {
              const scenario = testScenarios.find(s => s.id === test.scenarioId);
              return (
                <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconColor(scenario?.color || 'gray')}`}>
                      {scenario && <scenario.icon className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{scenario?.title || 'Unknown Test'}</h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span>Persona: {test.persona}</span>
                        <span>•</span>
                        <span>{new Date(test.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-green-600">Score: {test.score}%</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Testing Tips */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Users className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Tips</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>Persona Testing:</strong> Switch between different personas to test how the system adapts to different user types and experience levels.</p>
              <p><strong>Workflow Validation:</strong> Each persona has different preferences for risk tolerance, alert sensitivity, and decision support.</p>
              <p><strong>UI Adaptation:</strong> Notice how the interface changes based on the selected persona's experience level and role.</p>
              <p><strong>Feature Access:</strong> Different personas may have access to different features and capabilities within the system.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Testing;