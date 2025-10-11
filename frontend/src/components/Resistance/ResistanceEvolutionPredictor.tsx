import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, AlertTriangle, Target, Activity, Zap, Calendar, BarChart3, Network, Eye, Settings, Play, Pause, Download, Brain, Dna } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, BarChart, Bar, Treemap, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ResistanceMutation {
  id: string;
  gene: string;
  mutation: string;
  type: 'point' | 'insertion' | 'deletion' | 'amplification' | 'translocation' | 'epigenetic';
  chromosome: string;
  position: number;
  allele_frequency: number;
  fitness_cost: number;
  resistance_level: 'low' | 'moderate' | 'high' | 'complete';
  mechanism: 'target_alteration' | 'bypass_pathway' | 'efflux_pump' | 'metabolism' | 'dna_repair' | 'apoptosis_evasion';
  first_detected: string;
  prevalence: number;
  clinical_significance: 'established' | 'emerging' | 'experimental' | 'unknown';
  drugs_affected: Array<{
    drug: string;
    resistance_fold: number;
    mechanism: string;
  }>;
}

interface ClonalEvolution {
  timepoint: number; // days
  total_cells: number;
  clones: Array<{
    id: string;
    size: number;
    mutations: string[];
    fitness: number;
    drug_resistance: { [drug: string]: number };
    generation: number;
    parent_clone?: string;
  }>;
  dominant_clone: string;
  resistance_index: number;
  mutation_rate: number;
  selection_pressure: number;
}

interface TreatmentPressure {
  drug: string;
  start_date: string;
  duration: number; // days
  dose_intensity: number; // relative to standard
  resistance_selection: number;
  mutation_induction: number;
  fitness_landscape_change: number;
}

interface ResistanceModel {
  id: string;
  name: string;
  type: 'mathematical' | 'agent_based' | 'machine_learning' | 'hybrid';
  parameters: {
    mutation_rate: number;
    selection_coefficient: number;
    population_size: number;
    drug_concentration: number;
    growth_rate: number;
    death_rate: number;
  };
  predictions: {
    time_to_resistance: number; // days
    confidence_interval: [number, number];
    resistance_probability: number;
    dominant_mutations: string[];
    fitness_trajectory: Array<{ time: number; fitness: number }>;
  };
  validation: {
    accuracy: number;
    sensitivity: number;
    specificity: number;
    auc: number;
  };
}

interface InterventionStrategy {
  id: string;
  name: string;
  type: 'combination' | 'sequential' | 'adaptive' | 'collateral_sensitivity' | 'evolutionary_trap';
  drugs: Array<{
    name: string;
    timing: string;
    dose: string;
    duration: number;
  }>;
  mechanism: string;
  expected_benefit: {
    delay_resistance: number; // days
    reduce_probability: number; // percentage
    extend_survival: number; // months
  };
  feasibility: {
    toxicity_score: number;
    complexity_score: number;
    cost_score: number;
    implementation_score: number;
  };
  evidence_level: 'preclinical' | 'phase_1' | 'phase_2' | 'phase_3' | 'approved';
}

interface ResistanceNetwork {
  nodes: Array<{
    id: string;
    type: 'gene' | 'pathway' | 'drug' | 'mutation';
    name: string;
    size: number;
    centrality: number;
    druggability: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: 'activates' | 'inhibits' | 'regulates' | 'interacts';
    strength: number;
    evidence: string;
  }>;
  communities: Array<{
    id: string;
    nodes: string[];
    function: string;
    druggable: boolean;
  }>;
}

interface PredictionResults {
  scenario: string;
  time_horizon: number;
  resistance_probability: number;
  time_to_resistance: number;
  major_mutations: Array<{
    mutation: string;
    probability: number;
    time_to_emergence: number;
  }>;
  treatment_options: InterventionStrategy[];
  confidence: number;
}

const ResistanceEvolutionPredictor: React.FC = () => {
  const [resistanceMutations, setResistanceMutations] = useState<ResistanceMutation[]>([]);
  const [clonalEvolution, setClonalEvolution] = useState<ClonalEvolution[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentPressure[]>([]);
  const [resistanceModels, setResistanceModels] = useState<ResistanceModel[]>([]);
  const [interventionStrategies, setInterventionStrategies] = useState<InterventionStrategy[]>([]);
  const [resistanceNetwork, setResistanceNetwork] = useState<ResistanceNetwork | null>(null);
  const [predictionResults, setPredictionResults] = useState<PredictionResults[]>([]);
  
  const [selectedDrug, setSelectedDrug] = useState('osimertinib');
  const [selectedModel, setSelectedModel] = useState('hybrid-v2');
  const [timeHorizon, setTimeHorizon] = useState(365);
  const [isRunningPrediction, setIsRunningPrediction] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('standard_therapy');
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const generateResistanceData = useCallback(() => {
    // Generate resistance mutations
    const mutations: ResistanceMutation[] = [
      {
        id: 'egfr-t790m',
        gene: 'EGFR',
        mutation: 'T790M',
        type: 'point',
        chromosome: 'chr7',
        position: 55249071,
        allele_frequency: 0.45,
        fitness_cost: 0.15,
        resistance_level: 'high',
        mechanism: 'target_alteration',
        first_detected: '2023-06-15',
        prevalence: 0.68,
        clinical_significance: 'established',
        drugs_affected: [
          { drug: 'erlotinib', resistance_fold: 125, mechanism: 'increased_binding_affinity' },
          { drug: 'gefitinib', resistance_fold: 98, mechanism: 'increased_binding_affinity' },
          { drug: 'afatinib', resistance_fold: 45, mechanism: 'covalent_binding_maintained' }
        ]
      },
      {
        id: 'egfr-c797s',
        gene: 'EGFR',
        mutation: 'C797S',
        type: 'point',
        chromosome: 'chr7',
        position: 55249063,
        allele_frequency: 0.23,
        fitness_cost: 0.08,
        resistance_level: 'complete',
        mechanism: 'target_alteration',
        first_detected: '2024-01-08',
        prevalence: 0.31,
        clinical_significance: 'emerging',
        drugs_affected: [
          { drug: 'osimertinib', resistance_fold: 289, mechanism: 'covalent_binding_loss' }
        ]
      },
      {
        id: 'met-amplification',
        gene: 'MET',
        mutation: 'Amplification',
        type: 'amplification',
        chromosome: 'chr7',
        position: 116312459,
        allele_frequency: 0.67,
        fitness_cost: 0.05,
        resistance_level: 'moderate',
        mechanism: 'bypass_pathway',
        first_detected: '2023-11-22',
        prevalence: 0.42,
        clinical_significance: 'established',
        drugs_affected: [
          { drug: 'osimertinib', resistance_fold: 12, mechanism: 'bypass_signaling' },
          { drug: 'erlotinib', resistance_fold: 18, mechanism: 'bypass_signaling' }
        ]
      },
      {
        id: 'pik3ca-h1047r',
        gene: 'PIK3CA',
        mutation: 'H1047R',
        type: 'point',
        chromosome: 'chr3',
        position: 178952085,
        allele_frequency: 0.34,
        fitness_cost: 0.12,
        resistance_level: 'moderate',
        mechanism: 'bypass_pathway',
        first_detected: '2023-09-14',
        prevalence: 0.28,
        clinical_significance: 'established',
        drugs_affected: [
          { drug: 'osimertinib', resistance_fold: 8, mechanism: 'pi3k_akt_activation' }
        ]
      },
      {
        id: 'braf-v600e',
        gene: 'BRAF',
        mutation: 'V600E',
        type: 'point',
        chromosome: 'chr7',
        position: 140753336,
        allele_frequency: 0.28,
        fitness_cost: 0.09,
        resistance_level: 'moderate',
        mechanism: 'bypass_pathway',
        first_detected: '2023-12-03',
        prevalence: 0.19,
        clinical_significance: 'emerging',
        drugs_affected: [
          { drug: 'osimertinib', resistance_fold: 15, mechanism: 'mapk_reactivation' }
        ]
      }
    ];

    // Generate clonal evolution data
    const evolution: ClonalEvolution[] = [];
    for (let day = 0; day <= 365; day += 7) {
      const timepoint: ClonalEvolution = {
        timepoint: day,
        total_cells: Math.floor(1e9 * Math.exp(day * 0.005)),
        clones: [
          {
            id: 'sensitive',
            size: Math.floor(1e9 * Math.exp(day * 0.003) * Math.exp(-day * 0.008)),
            mutations: [],
            fitness: 1.0 - (day * 0.008),
            drug_resistance: { osimertinib: 0.1 },
            generation: Math.floor(day / 7),
            parent_clone: undefined
          },
          {
            id: 't790m_clone',
            size: Math.floor(1e6 * Math.exp(day * 0.007) * (day > 90 ? 1 : 0)),
            mutations: ['T790M'],
            fitness: 0.85 + (day > 90 ? day * 0.002 : 0),
            drug_resistance: { osimertinib: 0.3, erlotinib: 0.9 },
            generation: Math.floor((day - 90) / 7),
            parent_clone: 'sensitive'
          },
          {
            id: 'c797s_clone',
            size: Math.floor(1e5 * Math.exp(day * 0.009) * (day > 180 ? 1 : 0)),
            mutations: ['T790M', 'C797S'],
            fitness: 0.75 + (day > 180 ? day * 0.003 : 0),
            drug_resistance: { osimertinib: 0.95, erlotinib: 0.9 },
            generation: Math.floor((day - 180) / 7),
            parent_clone: 't790m_clone'
          }
        ],
        dominant_clone: day < 90 ? 'sensitive' : day < 240 ? 't790m_clone' : 'c797s_clone',
        resistance_index: Math.min(1.0, day / 365),
        mutation_rate: 1e-6 * (1 + day * 0.001),
        selection_pressure: Math.min(1.0, day / 180)
      };
      evolution.push(timepoint);
    }

    // Generate treatment history
    const treatments: TreatmentPressure[] = [
      {
        drug: 'osimertinib',
        start_date: '2023-06-01',
        duration: 365,
        dose_intensity: 1.0,
        resistance_selection: 0.85,
        mutation_induction: 0.15,
        fitness_landscape_change: 0.75
      },
      {
        drug: 'bevacizumab',
        start_date: '2023-08-15',
        duration: 180,
        dose_intensity: 0.9,
        resistance_selection: 0.25,
        mutation_induction: 0.05,
        fitness_landscape_change: 0.20
      }
    ];

    // Generate resistance models
    const models: ResistanceModel[] = [
      {
        id: 'hybrid-v2',
        name: 'Hybrid Evolutionary Model v2.0',
        type: 'hybrid',
        parameters: {
          mutation_rate: 1e-6,
          selection_coefficient: 0.15,
          population_size: 1e9,
          drug_concentration: 0.8,
          growth_rate: 0.023,
          death_rate: 0.018
        },
        predictions: {
          time_to_resistance: 247,
          confidence_interval: [189, 312],
          resistance_probability: 0.73,
          dominant_mutations: ['T790M', 'MET amplification', 'C797S'],
          fitness_trajectory: Array.from({ length: 52 }, (_, i) => ({
            time: i * 7,
            fitness: 1.0 - (i * 0.02) + Math.random() * 0.1
          }))
        },
        validation: {
          accuracy: 0.87,
          sensitivity: 0.84,
          specificity: 0.91,
          auc: 0.89
        }
      },
      {
        id: 'ml-ensemble',
        name: 'ML Ensemble Predictor',
        type: 'machine_learning',
        parameters: {
          mutation_rate: 1.2e-6,
          selection_coefficient: 0.18,
          population_size: 8e8,
          drug_concentration: 0.75,
          growth_rate: 0.025,
          death_rate: 0.020
        },
        predictions: {
          time_to_resistance: 198,
          confidence_interval: [165, 245],
          resistance_probability: 0.81,
          dominant_mutations: ['C797S', 'T790M', 'PIK3CA mutations'],
          fitness_trajectory: Array.from({ length: 52 }, (_, i) => ({
            time: i * 7,
            fitness: 1.0 - (i * 0.025) + Math.random() * 0.08
          }))
        },
        validation: {
          accuracy: 0.91,
          sensitivity: 0.89,
          specificity: 0.93,
          auc: 0.92
        }
      }
    ];

    // Generate intervention strategies
    const strategies: InterventionStrategy[] = [
      {
        id: 'combo-1',
        name: 'Osimertinib + MET Inhibitor',
        type: 'combination',
        drugs: [
          { name: 'Osimertinib', timing: 'concurrent', dose: '80mg daily', duration: 365 },
          { name: 'Capmatinib', timing: 'concurrent', dose: '400mg BID', duration: 365 }
        ],
        mechanism: 'Dual pathway inhibition preventing bypass resistance',
        expected_benefit: {
          delay_resistance: 156,
          reduce_probability: 45,
          extend_survival: 8.4
        },
        feasibility: {
          toxicity_score: 6.2,
          complexity_score: 4.1,
          cost_score: 8.7,
          implementation_score: 7.3
        },
        evidence_level: 'phase_2'
      },
      {
        id: 'adaptive-1',
        name: 'Adaptive Dosing Strategy',
        type: 'adaptive',
        drugs: [
          { name: 'Osimertinib', timing: 'adaptive', dose: '40-160mg daily', duration: 365 }
        ],
        mechanism: 'ctDNA-guided dosing to minimize selection pressure',
        expected_benefit: {
          delay_resistance: 89,
          reduce_probability: 28,
          extend_survival: 4.2
        },
        feasibility: {
          toxicity_score: 4.8,
          complexity_score: 7.9,
          cost_score: 6.2,
          implementation_score: 5.4
        },
        evidence_level: 'phase_1'
      },
      {
        id: 'sequential-1',
        name: 'Sequential Targeted Therapy',
        type: 'sequential',
        drugs: [
          { name: 'Osimertinib', timing: 'first', dose: '80mg daily', duration: 180 },
          { name: 'Amivantamab', timing: 'at_progression', dose: '1050mg IV', duration: 180 }
        ],
        mechanism: 'Sequential targeting to exploit collateral sensitivity',
        expected_benefit: {
          delay_resistance: 124,
          reduce_probability: 35,
          extend_survival: 6.8
        },
        feasibility: {
          toxicity_score: 7.1,
          complexity_score: 5.8,
          cost_score: 9.2,
          implementation_score: 6.9
        },
        evidence_level: 'phase_3'
      }
    ];

    // Generate resistance network
    const network: ResistanceNetwork = {
      nodes: [
        { id: 'EGFR', type: 'gene', name: 'EGFR', size: 100, centrality: 0.95, druggability: 0.92 },
        { id: 'MET', type: 'gene', name: 'MET', size: 80, centrality: 0.78, druggability: 0.85 },
        { id: 'PIK3CA', type: 'gene', name: 'PIK3CA', size: 75, centrality: 0.82, druggability: 0.71 },
        { id: 'BRAF', type: 'gene', name: 'BRAF', size: 70, centrality: 0.74, druggability: 0.88 },
        { id: 'T790M', type: 'mutation', name: 'T790M', size: 60, centrality: 0.91, druggability: 0.45 },
        { id: 'C797S', type: 'mutation', name: 'C797S', size: 45, centrality: 0.67, druggability: 0.12 }
      ],
      edges: [
        { source: 'EGFR', target: 'MET', type: 'interacts', strength: 0.85, evidence: 'PMID:12345678' },
        { source: 'EGFR', target: 'PIK3CA', type: 'activates', strength: 0.72, evidence: 'PMID:87654321' },
        { source: 'T790M', target: 'EGFR', type: 'regulates', strength: 0.95, evidence: 'PMID:11223344' },
        { source: 'C797S', target: 'EGFR', type: 'regulates', strength: 0.89, evidence: 'PMID:55667788' }
      ],
      communities: [
        {
          id: 'egfr_pathway',
          nodes: ['EGFR', 'T790M', 'C797S'],
          function: 'Primary target pathway',
          druggable: true
        },
        {
          id: 'bypass_pathways',
          nodes: ['MET', 'PIK3CA', 'BRAF'],
          function: 'Resistance bypass mechanisms',
          druggable: true
        }
      ]
    };

    setResistanceMutations(mutations);
    setClonalEvolution(evolution);
    setTreatmentHistory(treatments);
    setResistanceModels(models);
    setInterventionStrategies(strategies);
    setResistanceNetwork(network);
  }, []);

  const runResistancePrediction = useCallback(async () => {
    setIsRunningPrediction(true);
    
    // Simulate prediction computation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const results: PredictionResults[] = [
      {
        scenario: 'Standard Osimertinib Monotherapy',
        time_horizon: timeHorizon,
        resistance_probability: 0.73,
        time_to_resistance: 247,
        major_mutations: [
          { mutation: 'T790M', probability: 0.68, time_to_emergence: 125 },
          { mutation: 'C797S', probability: 0.31, time_to_emergence: 247 },
          { mutation: 'MET amplification', probability: 0.42, time_to_emergence: 189 }
        ],
        treatment_options: interventionStrategies,
        confidence: 0.87
      },
      {
        scenario: 'Osimertinib + MET Inhibitor',
        time_horizon: timeHorizon,
        resistance_probability: 0.45,
        time_to_resistance: 398,
        major_mutations: [
          { mutation: 'C797S', probability: 0.52, time_to_emergence: 324 },
          { mutation: 'PIK3CA mutations', probability: 0.28, time_to_emergence: 289 },
          { mutation: 'BRAF mutations', probability: 0.19, time_to_emergence: 356 }
        ],
        treatment_options: interventionStrategies.slice(1),
        confidence: 0.82
      }
    ];
    
    setPredictionResults(results);
    setIsRunningPrediction(false);
  }, [timeHorizon, interventionStrategies]);

  useEffect(() => {
    generateResistanceData();
  }, [generateResistanceData]);

  const currentModel = resistanceModels.find(m => m.id === selectedModel);
  const currentResults = predictionResults.find(r => r.scenario.toLowerCase().includes(selectedScenario.replace('_', ' ')));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resistance Evolution Predictor</h1>
            <p className="text-red-100">
              Advanced AI modeling of cancer drug resistance with evolutionary dynamics and intervention optimization
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentModel?.predictions.time_to_resistance || 'N/A'}</div>
            <div className="text-sm text-red-100">Days to Resistance</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Drug</label>
            <select
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="osimertinib">Osimertinib</option>
              <option value="erlotinib">Erlotinib</option>
              <option value="gefitinib">Gefitinib</option>
              <option value="afatinib">Afatinib</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prediction Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {resistanceModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (days)</label>
            <input
              type="number"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              min="30"
              max="1095"
              step="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="standard_therapy">Standard Therapy</option>
              <option value="combination_therapy">Combination Therapy</option>
              <option value="adaptive_dosing">Adaptive Dosing</option>
              <option value="sequential_therapy">Sequential Therapy</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={runResistancePrediction}
            disabled={isRunningPrediction}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isRunningPrediction ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Predicting...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Run Prediction
              </>
            )}
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export Results
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Simulation Speed:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm">{simulationSpeed}x</span>
          </div>
        </div>
      </div>

      {/* Clonal Evolution Visualization */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clonal Evolution Dynamics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={clonalEvolution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timepoint" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${Number(value).toExponential(2)}`, name]} />
            <Area
              type="monotone"
              dataKey="clones[0].size"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              name="Sensitive Clone"
            />
            <Area
              type="monotone"
              dataKey="clones[1].size"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              name="T790M Clone"
            />
            <Area
              type="monotone"
              dataKey="clones[2].size"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              name="C797S Clone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Resistance Mutations Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mutation Timeline */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resistance Mutation Timeline</h3>
          <div className="space-y-4">
            {resistanceMutations.map((mutation) => (
              <div key={mutation.id} className="relative">
                <div className="flex items-start gap-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    mutation.resistance_level === 'complete' ? 'bg-red-500' :
                    mutation.resistance_level === 'high' ? 'bg-orange-500' :
                    mutation.resistance_level === 'moderate' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {mutation.gene} {mutation.mutation}
                      </h4>
                      <span className={`px-2 py-1 text-xs rounded ${
                        mutation.clinical_significance === 'established' ? 'bg-green-100 text-green-800' :
                        mutation.clinical_significance === 'emerging' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {mutation.clinical_significance}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      VAF: {(mutation.allele_frequency * 100).toFixed(1)}% | 
                      Prevalence: {(mutation.prevalence * 100).toFixed(0)}% | 
                      Mechanism: {mutation.mechanism.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      First detected: {mutation.first_detected} | 
                      Fitness cost: {(mutation.fitness_cost * 100).toFixed(1)}%
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Affected drugs:</div>
                      <div className="flex flex-wrap gap-1">
                        {mutation.drugs_affected.map((drug, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                            {drug.drug} ({drug.resistance_fold}x)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
          {currentModel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className="text-xl font-bold text-blue-600">
                    {(currentModel.validation.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-600">AUC</div>
                  <div className="text-xl font-bold text-green-600">
                    {currentModel.validation.auc.toFixed(3)}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Model Parameters</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Mutation Rate:</span>
                    <span className="font-medium">{currentModel.parameters.mutation_rate.toExponential(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selection Coefficient:</span>
                    <span className="font-medium">{currentModel.parameters.selection_coefficient.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Population Size:</span>
                    <span className="font-medium">{currentModel.parameters.population_size.toExponential(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Drug Concentration:</span>
                    <span className="font-medium">{currentModel.parameters.drug_concentration.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Predictions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time to Resistance:</span>
                    <span className="font-medium">{currentModel.predictions.time_to_resistance} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resistance Probability:</span>
                    <span className="font-medium">{(currentModel.predictions.resistance_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Interval:</span>
                    <span className="font-medium">
                      {currentModel.predictions.confidence_interval[0]}-{currentModel.predictions.confidence_interval[1]} days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prediction Results */}
      {currentResults && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resistance Prediction Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Overall Predictions</h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Resistance Probability</div>
                  <div className="text-2xl font-bold text-red-600">
                    {(currentResults.resistance_probability * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Time to Resistance</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {currentResults.time_to_resistance} days
                  </div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600">Model Confidence</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {(currentResults.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Expected Mutations</h4>
              <div className="space-y-2">
                {currentResults.major_mutations.map((mutation, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{mutation.mutation}</span>
                      <span className="text-sm text-red-600">
                        {(mutation.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Expected at: {mutation.time_to_emergence} days
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Intervention Options</h4>
              <div className="space-y-2">
                {currentResults.treatment_options.slice(0, 3).map((strategy) => (
                  <div key={strategy.id} className="bg-white p-3 rounded border">
                    <div className="font-medium text-blue-600">{strategy.name}</div>
                    <div className="text-xs text-gray-600 mb-1">{strategy.type.replace('_', ' ')}</div>
                    <div className="text-sm">
                      <div>Delay: +{strategy.expected_benefit.delay_resistance} days</div>
                      <div>Risk reduction: -{strategy.expected_benefit.reduce_probability}%</div>
                    </div>
                    <div className="mt-1">
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        strategy.evidence_level === 'approved' ? 'bg-green-100 text-green-800' :
                        strategy.evidence_level === 'phase_3' ? 'bg-blue-100 text-blue-800' :
                        strategy.evidence_level === 'phase_2' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {strategy.evidence_level.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intervention Strategies */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resistance Prevention Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interventionStrategies.map((strategy) => (
            <div key={strategy.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">{strategy.type.replace('_', ' ')}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  strategy.evidence_level === 'approved' ? 'bg-green-100 text-green-800' :
                  strategy.evidence_level === 'phase_3' ? 'bg-blue-100 text-blue-800' :
                  strategy.evidence_level === 'phase_2' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {strategy.evidence_level.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="text-gray-700">{strategy.mechanism}</div>
                
                <div>
                  <div className="font-medium">Expected Benefits:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Delay resistance: +{strategy.expected_benefit.delay_resistance} days</li>
                    <li>• Reduce probability: -{strategy.expected_benefit.reduce_probability}%</li>
                    <li>• Extend survival: +{strategy.expected_benefit.extend_survival} months</li>
                  </ul>
                </div>

                <div>
                  <div className="font-medium">Feasibility Scores:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div>Toxicity: {strategy.feasibility.toxicity_score}/10</div>
                    <div>Complexity: {strategy.feasibility.complexity_score}/10</div>
                    <div>Cost: {strategy.feasibility.cost_score}/10</div>
                    <div>Implementation: {strategy.feasibility.implementation_score}/10</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium">Drug Regimen:</div>
                  <ul className="text-xs text-gray-600">
                    {strategy.drugs.map((drug, index) => (
                      <li key={index}>• {drug.name}: {drug.dose} {drug.timing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fitness Landscape */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitness Landscape Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentModel?.predictions.fitness_trajectory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 1.2]} />
            <Tooltip formatter={(value) => [`${value.toFixed(3)}`, 'Fitness']} />
            <Line 
              type="monotone" 
              dataKey="fitness" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ResistanceEvolutionPredictor;
