import React, { useState, useEffect } from 'react';
import { 
  Beaker, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity, 
  Heart, 
  Brain, 
  Dna, 
  Pill, 
  Route, 
  Layers, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Settings, 
  Info, 
  Download, 
  Share2,
  Microscope,
  Atom,
  Eye,
  Timer
} from 'lucide-react';
import Card from '../UI/Card';
import PathwayDiagram from './PathwayDiagram';

interface DrugPathway {
  drugName: string;
  mechanism: string;
  targetProteins: string[];
  metabolismPathway: string[];
  expectedEfficacy: number;
  sideEffectProfile: SideEffect[];
  genomicFactors: string[];
  timeToEffect: number;
  duration: number;
}

interface SideEffect {
  name: string;
  probability: number;
  severity: 'mild' | 'moderate' | 'severe';
  timeframe: string;
  mitigation?: string;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  geneticProfile: {
    mutations: string[];
    metabolizerStatus: string[];
    biomarkers: string[];
  };
  treatments: DrugPathway[];
  outcomeMetrics: {
    overallSurvival: number;
    progressionFreeSurvival: number;
    responseRate: number;
    qualityOfLife: number;
    sideEffectBurden: number;
  };
  confidence: number;
}

interface BodySystem {
  name: string;
  organs: string[];
  affectedByTreatment: boolean;
  impactLevel: 'low' | 'medium' | 'high';
  expectedChanges: string[];
  timeToEffect: number;
}

interface PredictiveModel {
  scenario: string;
  timePoints: number[];
  tumorSize: number[];
  biomarkerLevels: { [key: string]: number[] };
  sideEffectSeverity: number[];
  qualityOfLife: number[];
  confidence: number[];
}

const TreatmentSimulationLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'pathways' | 'body' | 'predictions'>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [bodySystems, setBodySystems] = useState<BodySystem[]>([]);
  const [predictiveModels, setPredictiveModels] = useState<PredictiveModel[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<DrugPathway | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedEnzyme, setSelectedEnzyme] = useState<string | null>(null);

  useEffect(() => {
    // Mock data initialization
    setScenarios([
      {
        id: '1',
        name: 'Current Treatment Plan',
        description: 'Olaparib maintenance therapy based on your BRCA1 mutation',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC'],
          metabolizerStatus: ['CYP2D6 intermediate'],
          biomarkers: ['ER+', 'PR+', 'HER2-']
        },
        treatments: [
          {
            drugName: 'Olaparib',
            mechanism: 'PARP inhibition',
            targetProteins: ['PARP1', 'PARP2'],
            metabolismPathway: ['CYP3A4', 'CYP2D6'],
            expectedEfficacy: 85,
            sideEffectProfile: [
              { name: 'Fatigue', probability: 65, severity: 'moderate', timeframe: '1-2 weeks' },
              { name: 'Nausea', probability: 45, severity: 'mild', timeframe: 'First month' },
              { name: 'Anemia', probability: 25, severity: 'moderate', timeframe: '2-3 months' }
            ],
            genomicFactors: ['BRCA1 mutation', 'Homologous recombination deficiency'],
            timeToEffect: 8,
            duration: 104
          }
        ],
        outcomeMetrics: {
          overallSurvival: 87,
          progressionFreeSurvival: 92,
          responseRate: 78,
          qualityOfLife: 72,
          sideEffectBurden: 35
        },
        confidence: 89
      },
      {
        id: '2',
        name: 'Alternative Therapy A',
        description: 'Combination immunotherapy with checkpoint inhibitors',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC', 'PD-L1 positive'],
          metabolizerStatus: ['CYP2D6 intermediate'],
          biomarkers: ['ER+', 'PR+', 'HER2-', 'PD-L1+']
        },
        treatments: [
          {
            drugName: 'Pembrolizumab + Olaparib',
            mechanism: 'PD-1 inhibition + PARP inhibition',
            targetProteins: ['PD-1', 'PARP1', 'PARP2'],
            metabolismPathway: ['Minimal hepatic metabolism', 'CYP3A4'],
            expectedEfficacy: 78,
            sideEffectProfile: [
              { name: 'Immune-related rash', probability: 40, severity: 'mild', timeframe: '2-4 weeks' },
              { name: 'Fatigue', probability: 70, severity: 'moderate', timeframe: '1-2 weeks' },
              { name: 'Thyroid dysfunction', probability: 15, severity: 'moderate', timeframe: '3-6 months' }
            ],
            genomicFactors: ['BRCA1 mutation', 'PD-L1 expression', 'Tumor mutational burden'],
            timeToEffect: 12,
            duration: 78
          }
        ],
        outcomeMetrics: {
          overallSurvival: 82,
          progressionFreeSurvival: 88,
          responseRate: 72,
          qualityOfLife: 68,
          sideEffectBurden: 42
        },
        confidence: 76
      },
      {
        id: '3',
        name: 'Experimental Protocol',
        description: 'Novel ADC therapy targeting specific tumor antigens',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC'],
          metabolizerStatus: ['CYP2D6 intermediate'],
          biomarkers: ['ER+', 'PR+', 'HER2-', 'Trop2+']
        },
        treatments: [
          {
            drugName: 'Sacituzumab govitecan',
            mechanism: 'Antibody-drug conjugate targeting Trop2',
            targetProteins: ['Trop2', 'TOP1'],
            metabolismPathway: ['Proteolytic cleavage', 'UGT1A1'],
            expectedEfficacy: 68,
            sideEffectProfile: [
              { name: 'Neutropenia', probability: 55, severity: 'moderate', timeframe: '1-2 cycles' },
              { name: 'Diarrhea', probability: 65, severity: 'moderate', timeframe: 'Ongoing' },
              { name: 'Hair loss', probability: 45, severity: 'mild', timeframe: '2-3 cycles' }
            ],
            genomicFactors: ['Trop2 expression', 'UGT1A1 polymorphisms'],
            timeToEffect: 6,
            duration: 52
          }
        ],
        outcomeMetrics: {
          overallSurvival: 75,
          progressionFreeSurvival: 80,
          responseRate: 65,
          qualityOfLife: 62,
          sideEffectBurden: 48
        },
        confidence: 62
      }
    ]);

    setBodySystems([
      {
        name: 'Cardiovascular System',
        organs: ['Heart', 'Blood vessels', 'Blood'],
        affectedByTreatment: true,
        impactLevel: 'medium',
        expectedChanges: ['Mild decrease in heart rate variability', 'Potential anemia'],
        timeToEffect: 4
      },
      {
        name: 'Hematologic System',
        organs: ['Bone marrow', 'Blood cells'],
        affectedByTreatment: true,
        impactLevel: 'high',
        expectedChanges: ['Decreased neutrophil count', 'Mild anemia', 'Platelet monitoring needed'],
        timeToEffect: 2
      },
      {
        name: 'Gastrointestinal System',
        organs: ['Stomach', 'Intestines', 'Liver'],
        affectedByTreatment: true,
        impactLevel: 'medium',
        expectedChanges: ['Mild nausea', 'Appetite changes', 'Liver enzyme monitoring'],
        timeToEffect: 1
      },
      {
        name: 'Nervous System',
        organs: ['Brain', 'Spinal cord', 'Nerves'],
        affectedByTreatment: false,
        impactLevel: 'low',
        expectedChanges: ['Minimal impact expected'],
        timeToEffect: 8
      },
      {
        name: 'Immune System',
        organs: ['Lymph nodes', 'Spleen', 'Thymus'],
        affectedByTreatment: false,
        impactLevel: 'low',
        expectedChanges: ['No significant impact expected'],
        timeToEffect: 12
      }
    ]);

    setPredictiveModels([
      {
        scenario: 'Current Treatment Plan',
        timePoints: [0, 4, 8, 12, 16, 20, 24],
        tumorSize: [100, 85, 65, 50, 45, 42, 40],
        biomarkerLevels: {
          'CA 15-3': [45, 38, 28, 22, 20, 18, 16],
          'CEA': [8.5, 7.2, 5.8, 4.5, 4.1, 3.8, 3.5]
        },
        sideEffectSeverity: [0, 25, 35, 30, 25, 20, 15],
        qualityOfLife: [100, 85, 75, 80, 85, 88, 90],
        confidence: [95, 92, 88, 82, 78, 72, 68]
      }
    ]);
  }, []);

  const runSimulation = () => {
    setSimulationRunning(true);
    setSimulationProgress(0);
    
    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSimulationRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getEffectColor = (effectiveness: number) => {
    if (effectiveness >= 80) return 'text-green-600 bg-green-50';
    if (effectiveness >= 60) return 'text-blue-600 bg-blue-50';
    if (effectiveness >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'severe': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Beaker className="w-8 h-8 mr-3 text-purple-600" />
            Treatment Simulation Lab
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize and compare treatment pathways with personalized predictions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runSimulation}
            disabled={simulationRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              simulationRunning 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {simulationRunning ? (
              <>
                <Timer className="w-4 h-4 animate-spin" />
                <span>Simulating... {simulationProgress}%</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>Export Results</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'scenarios', label: 'Treatment Scenarios', icon: Target },
            { id: 'pathways', label: 'Drug Pathways', icon: Route },
            { id: 'body', label: '3D Body Impact', icon: Layers },
            { id: 'predictions', label: 'Outcome Predictions', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Treatment Scenarios Tab */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`p-6 cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedScenario(scenario)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    scenario.confidence >= 80 ? 'bg-green-100 text-green-800' :
                    scenario.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scenario.confidence}% confidence
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Response Rate</p>
                    <p className="text-lg font-bold text-green-600">{scenario.outcomeMetrics.responseRate}%</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Quality of Life</p>
                    <p className="text-lg font-bold text-blue-600">{scenario.outcomeMetrics.qualityOfLife}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1">Key Genetic Factors</p>
                  <div className="flex flex-wrap gap-1">
                    {scenario.geneticProfile.mutations.map((mutation, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {mutation.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {scenario.treatments.length} treatment{scenario.treatments.length !== 1 ? 's' : ''}
                  </span>
                  <span className={`text-xs font-medium ${
                    scenario.outcomeMetrics.sideEffectBurden < 30 ? 'text-green-600' :
                    scenario.outcomeMetrics.sideEffectBurden < 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {scenario.outcomeMetrics.sideEffectBurden}% side effect burden
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Detailed Scenario View */}
          {selectedScenario && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Analysis: {selectedScenario.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {Object.entries(selectedScenario.outcomeMetrics).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-lg font-bold text-gray-900">{value}%</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Treatment Details</h3>
                  {selectedScenario.treatments.map((treatment, idx) => (
                    <div key={idx} className="border rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{treatment.drugName}</h4>
                      <p className="text-sm text-gray-600 mb-2">{treatment.mechanism}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-700">Expected Efficacy: </span>
                          <span className={`text-xs font-medium ${getEffectColor(treatment.expectedEfficacy)}`}>
                            {treatment.expectedEfficacy}%
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Time to Effect: </span>
                          <span className="text-xs text-gray-600">{treatment.timeToEffect} weeks</span>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-700">Duration: </span>
                          <span className="text-xs text-gray-600">{treatment.duration} weeks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Side Effect Profile</h3>
                  {selectedScenario.treatments[0]?.sideEffectProfile.map((sideEffect, idx) => (
                    <div key={idx} className="border rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{sideEffect.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(sideEffect.severity)}`}>
                          {sideEffect.severity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{sideEffect.probability}% probability</span>
                        <span>{sideEffect.timeframe}</span>
                      </div>
                      {sideEffect.mitigation && (
                        <p className="text-xs text-gray-600 mt-1 bg-blue-50 p-2 rounded">
                          Mitigation: {sideEffect.mitigation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Drug Pathways Tab */}
      {activeTab === 'pathways' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Drug Mechanism Visualization
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Atom className="w-5 h-5 mr-2" />
                  Molecular Targets
                </h3>
                <div className="space-y-3">
                  {selectedScenario?.treatments[0]?.targetProteins.map((protein, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedTarget(protein)}
                      className="w-full text-left flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 focus:outline-none border"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{protein}</p>
                        <p className="text-sm text-gray-600">Tap to view details and pathway links</p>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedTarget && (
                  <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Molecular Target</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedTarget}</div>
                      </div>
                      <button onClick={() => setSelectedTarget(null)} className="text-xs border rounded px-2 py-1">Close</button>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {(selectedScenario?.treatments?.[0]?.name || 'The selected drug')} binds to {selectedTarget} to modulate its activity.
                      This interaction can change downstream signaling responsible for efficacy and side effects.
                    </div>
                    <div className="mt-3 text-xs text-gray-600">Explore:</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <a href={`https://www.uniprot.org/uniprotkb?query=${encodeURIComponent(selectedTarget)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">UniProt</a>
                      <a href={`https://reactome.org/content/query?q=${encodeURIComponent(selectedTarget)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">Reactome</a>
                      <a href={`https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(selectedTarget)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">NCBI Gene</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                  <Route className="w-5 h-5 mr-2" />
                  Metabolism Pathway
                </h3>
                <div className="space-y-3">
                  {selectedScenario?.treatments[0]?.metabolismPathway.map((enzyme, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedEnzyme(enzyme)}
                      className="w-full text-left flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm hover:bg-green-50 focus:outline-none border"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{enzyme}</p>
                        <p className="text-sm text-gray-600">Tap to view role in metabolism</p>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedEnzyme && (
                  <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Metabolizing Enzyme</div>
                        <div className="text-lg font-semibold text-gray-900">{selectedEnzyme}</div>
                      </div>
                      <button onClick={() => setSelectedEnzyme(null)} className="text-xs border rounded px-2 py-1">Close</button>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedEnzyme} participates in the metabolism of {(selectedScenario?.treatments?.[0]?.name || 'the drug')}. Changes in {selectedEnzyme} activity (e.g., inhibitors/inducers or PGx) can alter exposure, efficacy, and toxicity.
                    </div>
                    <div className="mt-3 text-xs text-gray-600">Explore:</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <a href={`https://go.drugbank.com/unearth/q?searcher=targets&query=${encodeURIComponent(selectedEnzyme)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">DrugBank</a>
                      <a href={`https://www.reactome.org/content/query?q=${encodeURIComponent(selectedEnzyme)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">Reactome</a>
                      <a href={`https://www.genecards.org/Search/Keyword?queryString=${encodeURIComponent(selectedEnzyme)}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 border rounded bg-gray-50 hover:bg-gray-100">GeneCards</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Simple static pathway diagram with highlighting */}
            <div className="mt-6">
              <PathwayDiagram
                drugName={selectedScenario?.treatments?.[0]?.drugName || selectedScenario?.treatments?.[0]?.name || 'Drug'}
                targets={selectedScenario?.treatments?.[0]?.targetProteins || []}
                enzymes={selectedScenario?.treatments?.[0]?.metabolismPathway || []}
                selectedTarget={selectedTarget}
                selectedEnzyme={selectedEnzyme}
                onSelectTarget={(t) => setSelectedTarget(t)}
                onSelectEnzyme={(e) => setSelectedEnzyme(e)}
                className="border rounded-lg"
              />
            </div>
          </Card>
        </div>
      )}

      {/* 3D Body Impact Tab */}
      {activeTab === 'body' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Treatment Impact on Body Systems
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bodySystems.map((system, idx) => (
                <div key={idx} className={`border rounded-lg p-4 ${
                  system.affectedByTreatment ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{system.name}</h3>
                    <span className={`text-sm font-medium ${getImpactColor(system.impactLevel)}`}>
                      {system.impactLevel} impact
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Organs Involved:</p>
                    <p className="text-sm text-gray-600">{system.organs.join(', ')}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Expected Changes:</p>
                    <ul className="text-sm text-gray-600">
                      {system.expectedChanges.map((change, changeIdx) => (
                        <li key={changeIdx} className="flex items-start space-x-2">
                          <span className="text-xs mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      Effects typically seen in {system.timeToEffect} weeks
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Outcome Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-6">
          {predictiveModels.map((model, idx) => (
            <Card key={idx} className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Predictive Timeline: {model.scenario}
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Tumor Response</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tumor Size Reduction</span>
                      <span className="text-sm font-medium text-green-600">
                        {100 - model.tumorSize[model.tumorSize.length - 1]}% reduction
                      </span>
                    </div>
                    <div className="space-y-2">
                      {model.timePoints.map((time, timeIdx) => (
                        <div key={timeIdx} className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 w-12">Week {time}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${model.tumorSize[timeIdx]}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12">{model.tumorSize[timeIdx]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quality of Life Projection</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {model.timePoints.map((time, timeIdx) => (
                        <div key={timeIdx} className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500 w-12">Week {time}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                model.qualityOfLife[timeIdx] >= 80 ? 'bg-green-500' :
                                model.qualityOfLife[timeIdx] >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${model.qualityOfLife[timeIdx]}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12">{model.qualityOfLife[timeIdx]}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Biomarker Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(model.biomarkerLevels).map(([biomarker, values]) => (
                    <div key={biomarker} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{biomarker}</h4>
                      <div className="space-y-1">
                        {values.map((value, valueIdx) => (
                          <div key={valueIdx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Week {model.timePoints[valueIdx]}</span>
                            <span className={`font-medium ${
                              value < values[0] * 0.5 ? 'text-green-600' :
                              value < values[0] * 0.8 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Prediction Confidence</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      These predictions are based on similar genetic profiles and treatment responses. 
                      Confidence levels range from {Math.min(...model.confidence)}% to {Math.max(...model.confidence)}% 
                      across the timeline.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TreatmentSimulationLab;
