import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Zap, 
  Brain, 
  Target, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Network,
  Cpu,
  Sparkles,
  Microscope,
  Shield,
  ArrowRight,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Settings,
  Download,
  Share2,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Waves,
  Crosshair,
  Molecule
} from 'lucide-react';
import { interactionService } from '../../services/api';

interface QuantumState {
  id: string;
  patientId: string;
  timestamp: string;
  quantumBits: number;
  coherenceTime: number;
  entanglementDegree: number;
  superpositionStates: Array<{
    state: string;
    probability: number;
    drugCombination: string[];
    efficacy: number;
    toxicity: number;
  }>;
  parallelUniverses: Array<{
    universeId: string;
    treatmentPath: string;
    outcomeScore: number;
    timeline: string;
    sideEffects: string[];
    survivalRate: number;
  }>;
}

interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  quantumEffect: 'constructive' | 'destructive' | 'neutral';
  interferencePattern: number[];
  synergyScore: number;
  riskLevel: 'minimal' | 'moderate' | 'high' | 'critical';
  molecularResonance: {
    frequency: number;
    amplitude: number;
    phase: number;
  };
}

interface TreatmentSimulation {
  id: string;
  name: string;
  quantumComplexity: number;
  simulationTime: number;
  accuracy: number;
  scenarios: number;
  status: 'running' | 'completed' | 'failed' | 'queued';
  results: {
    optimalCombination: string[];
    successProbability: number;
    riskAssessment: string;
    timelineWeeks: number;
  };
}

const QuantumTreatmentOptimization: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [quantumStates, setQuantumStates] = useState<QuantumState[]>([]);
  const [drugInteractions, setDrugInteractions] = useState<DrugInteraction[]>([]);
  const [simulations, setSimulations] = useState<TreatmentSimulation[]>([]);
  const [isQuantumProcessing, setIsQuantumProcessing] = useState(false);
  const [selectedUniverse, setSelectedUniverse] = useState<string | null>(null);
  const [quantumCoherence, setQuantumCoherence] = useState(87.3);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQuantumData();
    if (canvasRef.current) {
      drawQuantumVisualization();
    }
  }, []);

  const generateQuantumData = async () => {
    const mockStates: QuantumState[] = [
      {
        id: 'qs001',
        patientId: 'patient123',
        timestamp: new Date().toISOString(),
        quantumBits: 512,
        coherenceTime: 0.23,
        entanglementDegree: 0.89,
        superpositionStates: [
          {
            state: '|φ⟩ = α|0⟩ + β|1⟩',
            probability: 0.73,
            drugCombination: ['Pembrolizumab', 'Carboplatin'],
            efficacy: 0.82,
            toxicity: 0.15
          },
          {
            state: '|ψ⟩ = γ|0⟩ + δ|1⟩',
            probability: 0.27,
            drugCombination: ['Nivolumab', 'Ipilimumab'],
            efficacy: 0.76,
            toxicity: 0.28
          }
        ],
        parallelUniverses: [
          {
            universeId: 'universe-alpha',
            treatmentPath: 'Immunotherapy → Chemotherapy → Radiation',
            outcomeScore: 0.89,
            timeline: '16 weeks',
            sideEffects: ['Fatigue', 'Nausea'],
            survivalRate: 0.92
          },
          {
            universeId: 'universe-beta',
            treatmentPath: 'Targeted Therapy → Immunotherapy',
            outcomeScore: 0.84,
            timeline: '12 weeks',
            sideEffects: ['Skin rash', 'Diarrhea'],
            survivalRate: 0.88
          }
        ]
      }
    ];

    // Fetch real interactions for a known pair to populate the demo visuals
    let computedInteractions: DrugInteraction[] = [];
    try {
      const result = await interactionService.checkInteractions([
        { rxcui: '11289', name: 'Warfarin' },
        { rxcui: '1191', name: 'Aspirin' }
      ]);
      const all = [
        ...(result?.interactions?.stored || []),
        ...(result?.interactions?.external || [])
      ];
      computedInteractions = all.slice(0, 2).map((i: any, idx: number) => ({
        id: i.id || `${i.drug1_rxcui || ''}-${i.drug2_rxcui || ''}-${idx}`,
        drug1: i.drug1?.name || `Drug ${i.drug1_rxcui}`,
        drug2: i.drug2?.name || `Drug ${i.drug2_rxcui}`,
        quantumEffect: (String(i.severity || '').toLowerCase() === 'major') ? 'destructive'
                     : (String(i.severity || '').toLowerCase() === 'minor') ? 'constructive'
                     : 'neutral',
        interferencePattern: [0.2, 0.7, 0.5, 0.9, 0.6].map(v => Math.max(0.1, Math.min(0.95, v + (Math.random() - 0.5) * 0.2))),
        synergyScore: Math.max(0.1, Math.min(0.95, (i.severity === 'minor' ? 0.75 : i.severity === 'major' ? 0.35 : 0.55) + (Math.random() - 0.5) * 0.1)),
        riskLevel: (String(i.severity || '').toLowerCase() === 'major') ? 'critical'
                 : (String(i.severity || '').toLowerCase() === 'moderate') ? 'high'
                 : 'minimal',
        molecularResonance: {
          frequency: 300 + Math.random() * 200,
          amplitude: Math.max(0.2, Math.min(0.95, 0.5 + (Math.random() - 0.5))),
          phase: Math.random() * Math.PI
        }
      }));
    } catch (e) {
      computedInteractions = [];
    }

    const mockSimulations: TreatmentSimulation[] = [
      {
        id: 'sim001',
        name: 'Quantum Superposition Treatment A',
        quantumComplexity: 0.92,
        simulationTime: 147.3,
        accuracy: 0.96,
        scenarios: 10000,
        status: 'completed',
        results: {
          optimalCombination: ['Pembrolizumab', 'Carboplatin', 'Radiation'],
          successProbability: 0.89,
          riskAssessment: 'Low risk with high efficacy potential',
          timelineWeeks: 14
        }
      },
      {
        id: 'sim002',
        name: 'Parallel Universe Treatment B',
        quantumComplexity: 0.87,
        simulationTime: 203.7,
        accuracy: 0.94,
        scenarios: 15000,
        status: 'running',
        results: {
          optimalCombination: ['Nivolumab', 'Ipilimumab'],
          successProbability: 0.82,
          riskAssessment: 'Moderate risk with good efficacy',
          timelineWeeks: 18
        }
      }
    ];

    setQuantumStates(mockStates);
    setDrugInteractions(computedInteractions);
    setSimulations(mockSimulations);
  };

  const drawQuantumVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 300;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + time;
      const radius = 80 + Math.sin(time + i) * 20;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, `hsl(${200 + i * 30}, 100%, 70%)`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `hsl(${200 + i * 30}, 80%, 60%)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Quantum Entanglement', centerX, centerY - 100);
    ctx.fillText(`Coherence: ${quantumCoherence.toFixed(1)}%`, centerX, centerY + 100);
  };

  const startQuantumSimulation = () => {
    setIsQuantumProcessing(true);
    setTimeout(() => {
      setIsQuantumProcessing(false);
      setQuantumCoherence(Math.random() * 20 + 80);
    }, 3000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Atom className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quantum States</h3>
                <p className="text-sm text-gray-600">Active superpositions</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-blue-600">{quantumStates.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Coherence: {quantumCoherence.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Network className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Drug Interactions</h3>
                <p className="text-sm text-gray-600">Quantum analyzed</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-purple-600">{drugInteractions.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Synergy detected: 85%
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Cpu className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Simulations</h3>
                <p className="text-sm text-gray-600">Parallel universes</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-green-600">{simulations.length}</span>
          </div>
          <div className="text-sm text-gray-600">
            Accuracy: 96%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span>Quantum Visualization</span>
          </h3>
          <button
            onClick={startQuantumSimulation}
            disabled={isQuantumProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {isQuantumProcessing ? (
              <>
                <PauseCircle className="h-4 w-4" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg bg-slate-900"
          />
        </div>
      </div>
    </div>
  );

  const renderQuantumStates = () => (
    <div className="space-y-6">
      {quantumStates.map((state, index) => (
        <div key={state.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Atom className="h-5 w-5 text-blue-500" />
              <span>Quantum State {index + 1}</span>
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Coherence: {(state.coherenceTime * 1000).toFixed(0)}ms
              </span>
              <span className="text-sm text-gray-600">
                Entanglement: {(state.entanglementDegree * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Superposition States</h4>
              <div className="space-y-3">
                {state.superpositionStates.map((superState, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-blue-600">{superState.state}</code>
                      <span className="text-sm font-medium text-gray-700">
                        {(superState.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Drugs: {superState.drugCombination.join(', ')}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Efficacy:</span>
                        <span className="font-medium text-green-600">
                          {(superState.efficacy * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Toxicity:</span>
                        <span className="font-medium text-red-600">
                          {(superState.toxicity * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Parallel Universes</h4>
              <div className="space-y-3">
                {state.parallelUniverses.map((universe, idx) => (
                  <div 
                    key={universe.universeId} 
                    className={`rounded-lg p-4 border cursor-pointer transition-all ${
                      selectedUniverse === universe.universeId
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedUniverse(universe.universeId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{universe.universeId}</span>
                      <span className="text-sm font-medium text-purple-600">
                        Score: {(universe.outcomeScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {universe.treatmentPath}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Timeline:</span>
                        <span className="font-medium">{universe.timeline}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Survival:</span>
                        <span className="font-medium text-green-600">
                          {(universe.survivalRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDrugInteractions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Molecule className="h-5 w-5 text-green-500" />
          <span>Quantum Drug Interaction Analysis</span>
        </h3>
        
        <div className="space-y-4">
          {drugInteractions.map((interaction) => (
            <div 
              key={interaction.id} 
              className={`rounded-lg p-4 border ${
                interaction.quantumEffect === 'constructive' 
                  ? 'bg-green-50 border-green-200' 
                  : interaction.quantumEffect === 'destructive'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    interaction.quantumEffect === 'constructive' 
                      ? 'bg-green-500' 
                      : interaction.quantumEffect === 'destructive'
                      ? 'bg-red-500'
                      : 'bg-gray-500'
                  }`}>
                    <Waves className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {interaction.drug1} + {interaction.drug2}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {interaction.quantumEffect} interference
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {(interaction.synergyScore * 100).toFixed(0)}%
                  </div>
                  <div className={`text-sm font-medium ${
                    interaction.riskLevel === 'minimal' ? 'text-green-600' :
                    interaction.riskLevel === 'moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {interaction.riskLevel} risk
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Interference Pattern</h5>
                  <div className="flex items-end space-x-1 h-16">
                    {interaction.interferencePattern.map((value, idx) => (
                      <div
                        key={idx}
                        className={`w-8 rounded-t ${
                          interaction.quantumEffect === 'constructive' 
                            ? 'bg-green-400' 
                            : interaction.quantumEffect === 'destructive'
                            ? 'bg-red-400'
                            : 'bg-gray-400'
                        }`}
                        style={{ height: `${value * 100}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Molecular Resonance</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frequency:</span>
                      <span className="font-mono">{interaction.molecularResonance.frequency} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amplitude:</span>
                      <span className="font-mono">{interaction.molecularResonance.amplitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phase:</span>
                      <span className="font-mono">{interaction.molecularResonance.phase} rad</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSimulations = () => (
    <div className="space-y-6">
      {simulations.map((simulation) => (
        <div key={simulation.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <span>{simulation.name}</span>
            </h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              simulation.status === 'completed' ? 'bg-green-100 text-green-800' :
              simulation.status === 'running' ? 'bg-blue-100 text-blue-800' :
              simulation.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {simulation.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Quantum Complexity</div>
              <div className="text-xl font-bold text-blue-600">
                {(simulation.quantumComplexity * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Simulation Time</div>
              <div className="text-xl font-bold text-purple-600">
                {simulation.simulationTime.toFixed(1)}s
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Accuracy</div>
              <div className="text-xl font-bold text-green-600">
                {(simulation.accuracy * 100).toFixed(0)}%
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Scenarios</div>
              <div className="text-xl font-bold text-orange-600">
                {simulation.scenarios.toLocaleString()}
              </div>
            </div>
          </div>

          {simulation.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span>Optimal Treatment Results</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Optimal Combination:</span>
                      <div className="mt-1">
                        {simulation.results.optimalCombination.map((drug, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                          >
                            {drug}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Success Probability:</span>
                      <span className="font-bold text-green-600">
                        {(simulation.results.successProbability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Timeline:</span>
                      <span className="font-medium">{simulation.results.timelineWeeks} weeks</span>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Risk Assessment:</span>
                  <p className="mt-1 text-sm text-gray-900">{simulation.results.riskAssessment}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Quantum Overview', icon: Eye },
    { id: 'states', label: 'Quantum States', icon: Atom },
    { id: 'interactions', label: 'Drug Interactions', icon: Molecule },
    { id: 'simulations', label: 'Simulations', icon: Cpu }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quantum-Enhanced Treatment Optimization
            </h1>
            <p className="text-gray-600">
              Revolutionary quantum computing for cancer treatment planning
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-gray-200 mb-8">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-screen">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'states' && renderQuantumStates()}
        {activeTab === 'interactions' && renderDrugInteractions()}
        {activeTab === 'simulations' && renderSimulations()}
      </div>
    </div>
  );
};

export default QuantumTreatmentOptimization;
