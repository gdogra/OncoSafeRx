import React, { useState, useEffect, useCallback } from 'react';
import { User, Brain, Activity, Target, Zap, TrendingUp, Calendar, Heart, Shield, Database, Settings, Play, Pause, RotateCcw, Save, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, BarChart, Bar } from 'recharts';

interface PatientProfile {
  id: string;
  age: number;
  gender: 'M' | 'F';
  ethnicity: string;
  diagnosis: {
    primary: string;
    stage: string;
    histology: string;
    grade: string;
    biomarkers: { [key: string]: string | number };
  };
  comorbidities: Array<{
    condition: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    treatment: string;
  }>;
  genomics: {
    variants: Array<{
      gene: string;
      variant: string;
      vaf: number;
      significance: string;
    }>;
    tmb: number;
    msi: 'MSI-H' | 'MSS' | 'MSI-L';
    hrd: number;
  };
  performance: {
    ecog: 0 | 1 | 2 | 3 | 4;
    karnofsky: number;
    weight: number;
    bmi: number;
  };
  labs: {
    hemoglobin: number;
    neutrophils: number;
    platelets: number;
    creatinine: number;
    bilirubin: number;
    alt: number;
    albumin: number;
  };
}

interface TreatmentScenario {
  id: string;
  name: string;
  drugs: Array<{
    name: string;
    dose: string;
    schedule: string;
    route: string;
  }>;
  duration: number; // weeks
  supportiveCare: string[];
  monitoring: string[];
}

interface SimulationParameters {
  timeHorizon: number; // months
  iterations: number;
  uncertainty: boolean;
  monteCarlo: boolean;
  pharmacokinetics: boolean;
  resistance: boolean;
  adverseEvents: boolean;
}

interface SimulationResult {
  scenario: string;
  timePoint: number; // months
  tumorSize: number; // % of baseline
  survivalProbability: number;
  progressionFree: number;
  qualityOfLife: number;
  toxicity: {
    grade1_2: number;
    grade3_4: number;
    serious: number;
  };
  biomarkers: {
    [marker: string]: number;
  };
  resistance: {
    probability: number;
    mechanisms: string[];
  };
  confidence: {
    lower: number;
    upper: number;
  };
}

interface DigitalTwinModel {
  id: string;
  version: string;
  components: {
    pharmacokinetic: {
      model: 'PBPK' | '2-compartment' | '3-compartment';
      parameters: { [key: string]: number };
      clearance: number;
      volume: number;
    };
    pharmacodynamic: {
      model: 'Emax' | 'Hill' | 'Linear' | 'Sigmoid';
      ec50: number;
      emax: number;
      hillCoeff: number;
    };
    tumor: {
      growthModel: 'Exponential' | 'Gompertz' | 'Logistic' | 'Bertalanffy';
      growthRate: number;
      carryingCapacity: number;
      killRate: number;
    };
    resistance: {
      model: 'Goldie-Coldman' | 'Branching' | 'Spatial' | 'Clonal';
      mutationRate: number;
      selectionPressure: number;
      fitnessLandscape: number[][];
    };
    toxicity: {
      models: Array<{
        organ: string;
        threshold: number;
        slope: number;
        recovery: number;
      }>;
    };
  };
  validation: {
    accuracy: number;
    precision: number;
    sensitivity: number;
    specificity: number;
    auc: number;
  };
}

interface OptimizationResult {
  bestScenario: string;
  optimizedParameters: {
    dose: number;
    schedule: string;
    duration: number;
    combination: string[];
  };
  expectedOutcomes: {
    survival: number;
    progression: number;
    response: number;
    qualityOfLife: number;
    toxicity: number;
  };
  confidence: number;
  alternatives: Array<{
    scenario: string;
    score: number;
    tradeoffs: string;
  }>;
}

const PatientDigitalTwin: React.FC = () => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [scenarios, setScenarios] = useState<TreatmentScenario[]>([]);
  const [simulationParams, setSimulationParams] = useState<SimulationParameters>({
    timeHorizon: 24,
    iterations: 1000,
    uncertainty: true,
    monteCarlo: true,
    pharmacokinetics: true,
    resistance: true,
    adverseEvents: true
  });
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [digitalTwinModel, setDigitalTwinModel] = useState<DigitalTwinModel | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [simulationProgress, setSimulationProgress] = useState(0);

  const generatePatientProfile = useCallback((): PatientProfile => {
    return {
      id: 'PT-DT-001',
      age: 67,
      gender: 'F',
      ethnicity: 'Caucasian',
      diagnosis: {
        primary: 'Non-Small Cell Lung Cancer',
        stage: 'IIIB',
        histology: 'Adenocarcinoma',
        grade: '3',
        biomarkers: {
          'PD-L1 TPS': 65,
          'EGFR': 'L858R',
          'ALK': 'Negative',
          'ROS1': 'Negative',
          'BRAF': 'Wild-type',
          'KRAS': 'G12C'
        }
      },
      comorbidities: [
        { condition: 'Hypertension', severity: 'Moderate', treatment: 'Lisinopril 10mg daily' },
        { condition: 'Diabetes Type 2', severity: 'Mild', treatment: 'Metformin 1000mg BID' },
        { condition: 'COPD', severity: 'Moderate', treatment: 'Albuterol PRN' }
      ],
      genomics: {
        variants: [
          { gene: 'EGFR', variant: 'L858R', vaf: 42, significance: 'Pathogenic' },
          { gene: 'KRAS', variant: 'G12C', vaf: 38, significance: 'Pathogenic' },
          { gene: 'TP53', variant: 'R273H', vaf: 67, significance: 'Pathogenic' },
          { gene: 'PIK3CA', variant: 'H1047R', vaf: 23, significance: 'Pathogenic' }
        ],
        tmb: 14.2,
        msi: 'MSS',
        hrd: 12
      },
      performance: {
        ecog: 1,
        karnofsky: 80,
        weight: 68.5,
        bmi: 24.8
      },
      labs: {
        hemoglobin: 11.2,
        neutrophils: 4200,
        platelets: 285000,
        creatinine: 0.9,
        bilirubin: 0.8,
        alt: 28,
        albumin: 3.8
      }
    };
  }, []);

  const generateTreatmentScenarios = useCallback((): TreatmentScenario[] => {
    return [
      {
        id: 'scenario-1',
        name: 'EGFR TKI Monotherapy',
        drugs: [
          { name: 'Osimertinib', dose: '80mg', schedule: 'Once daily', route: 'Oral' }
        ],
        duration: 52,
        supportiveCare: ['Dexamethasone premedication', 'Anti-emetics', 'Skin care'],
        monitoring: ['CT scans q8w', 'ECHO q12w', 'Labs q2w', 'Symptom assessment q2w']
      },
      {
        id: 'scenario-2',
        name: 'Immunotherapy Combination',
        drugs: [
          { name: 'Pembrolizumab', dose: '200mg', schedule: 'Q3W', route: 'IV' },
          { name: 'Carboplatin', dose: 'AUC 5', schedule: 'Q3W x 4 cycles', route: 'IV' },
          { name: 'Pemetrexed', dose: '500mg/m²', schedule: 'Q3W', route: 'IV' }
        ],
        duration: 104,
        supportiveCare: ['Folic acid', 'Vitamin B12', 'Dexamethasone', 'Anti-emetics'],
        monitoring: ['CT scans q6w', 'Labs q1w', 'Thyroid function q12w', 'Pneumonitis screening']
      },
      {
        id: 'scenario-3',
        name: 'Targeted Combination',
        drugs: [
          { name: 'Osimertinib', dose: '80mg', schedule: 'Once daily', route: 'Oral' },
          { name: 'Bevacizumab', dose: '15mg/kg', schedule: 'Q3W', route: 'IV' }
        ],
        duration: 78,
        supportiveCare: ['Antihypertensives', 'Bleeding precautions', 'Wound care'],
        monitoring: ['CT scans q6w', 'BP monitoring', 'Proteinuria q2w', 'Cardiac function q12w']
      },
      {
        id: 'scenario-4',
        name: 'Novel Triplet Therapy',
        drugs: [
          { name: 'Sotorasib', dose: '960mg', schedule: 'Once daily', route: 'Oral' },
          { name: 'Pembrolizumab', dose: '200mg', schedule: 'Q3W', route: 'IV' },
          { name: 'Trametinib', dose: '2mg', schedule: 'Once daily', route: 'Oral' }
        ],
        duration: 52,
        supportiveCare: ['Skin toxicity management', 'Diarrhea prophylaxis', 'Eye exams'],
        monitoring: ['CT scans q6w', 'ECHO q8w', 'Ophthalmologic exams q8w', 'Labs q2w']
      }
    ];
  }, []);

  const generateDigitalTwinModel = useCallback((): DigitalTwinModel => {
    return {
      id: 'DTM-v3.2',
      version: '3.2.1',
      components: {
        pharmacokinetic: {
          model: 'PBPK',
          parameters: {
            clearance: 2.1,
            volume_central: 45.2,
            volume_peripheral: 123.8,
            ka: 0.85,
            bioavailability: 0.92
          },
          clearance: 2.1,
          volume: 45.2
        },
        pharmacodynamic: {
          model: 'Emax',
          ec50: 1.2,
          emax: 95.4,
          hillCoeff: 2.1
        },
        tumor: {
          growthModel: 'Gompertz',
          growthRate: 0.023,
          carryingCapacity: 1000,
          killRate: 0.087
        },
        resistance: {
          model: 'Branching',
          mutationRate: 1.2e-6,
          selectionPressure: 0.75,
          fitnessLandscape: [[0.8, 0.9], [0.6, 1.2]]
        },
        toxicity: {
          models: [
            { organ: 'Liver', threshold: 2.5, slope: 1.8, recovery: 0.15 },
            { organ: 'Heart', threshold: 1.8, slope: 2.2, recovery: 0.08 },
            { organ: 'Skin', threshold: 1.2, slope: 1.5, recovery: 0.25 },
            { organ: 'GI', threshold: 1.5, slope: 1.9, recovery: 0.20 }
          ]
        }
      },
      validation: {
        accuracy: 0.87,
        precision: 0.84,
        sensitivity: 0.91,
        specificity: 0.82,
        auc: 0.89
      }
    };
  }, []);

  const runSimulation = useCallback(async (scenarioId: string) => {
    setIsSimulating(true);
    setSimulationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 10;
      });
    }, 200);

    // Simulate computation time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    clearInterval(progressInterval);
    setSimulationProgress(100);

    // Generate simulation results
    const results: SimulationResult[] = [];
    const scenario = scenarios.find(s => s.id === scenarioId)!;
    
    for (let month = 0; month <= simulationParams.timeHorizon; month++) {
      const baseResponseRate = scenario.name.includes('Immunotherapy') ? 0.45 : 
                              scenario.name.includes('EGFR') ? 0.65 : 
                              scenario.name.includes('Novel') ? 0.38 : 0.52;
      
      const timeDecay = Math.exp(-month * 0.05);
      const responseDecay = baseResponseRate * timeDecay;
      
      results.push({
        scenario: scenario.name,
        timePoint: month,
        tumorSize: Math.max(10, 100 * (1 - responseDecay + Math.random() * 0.1)),
        survivalProbability: Math.max(0, Math.min(100, 95 * Math.exp(-month * 0.02) + Math.random() * 5)),
        progressionFree: Math.max(0, Math.min(100, 90 * Math.exp(-month * 0.04) + Math.random() * 5)),
        qualityOfLife: Math.max(40, Math.min(100, 85 - month * 1.2 + Math.random() * 10)),
        toxicity: {
          grade1_2: Math.min(80, 20 + month * 2 + Math.random() * 10),
          grade3_4: Math.min(30, 5 + month * 0.8 + Math.random() * 5),
          serious: Math.min(15, 2 + month * 0.3 + Math.random() * 2)
        },
        biomarkers: {
          'ctDNA': Math.max(0, 100 * (1 - responseDecay) + Math.random() * 20),
          'CRP': 5 + month * 0.5 + Math.random() * 2,
          'LDH': 200 + month * 10 + Math.random() * 50
        },
        resistance: {
          probability: Math.min(70, month * 2.5 + Math.random() * 10),
          mechanisms: ['T790M', 'C797S', 'Bypass pathways']
        },
        confidence: {
          lower: Math.max(0, responseDecay * 100 - 15),
          upper: Math.min(100, responseDecay * 100 + 15)
        }
      });
    }

    setSimulationResults(prev => [...prev.filter(r => r.scenario !== scenario.name), ...results]);
    setIsSimulating(false);
    setSimulationProgress(0);
  }, [scenarios, simulationParams]);

  const runOptimization = useCallback(async () => {
    setIsSimulating(true);
    
    // Simulate optimization computation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const optimizationResult: OptimizationResult = {
      bestScenario: 'EGFR TKI Monotherapy',
      optimizedParameters: {
        dose: 80,
        schedule: 'Once daily',
        duration: 48,
        combination: ['Osimertinib', 'Bevacizumab']
      },
      expectedOutcomes: {
        survival: 84.2,
        progression: 67.8,
        response: 71.5,
        qualityOfLife: 78.9,
        toxicity: 23.4
      },
      confidence: 87.3,
      alternatives: [
        { scenario: 'Immunotherapy Combination', score: 82.1, tradeoffs: 'Higher toxicity, better long-term survival' },
        { scenario: 'Targeted Combination', score: 79.6, tradeoffs: 'Lower resistance, moderate efficacy' },
        { scenario: 'Novel Triplet Therapy', score: 76.3, tradeoffs: 'Experimental, high potential' }
      ]
    };

    setOptimization(optimizationResult);
    setIsSimulating(false);
  }, []);

  useEffect(() => {
    const patientProfile = generatePatientProfile();
    const treatmentScenarios = generateTreatmentScenarios();
    const twinModel = generateDigitalTwinModel();
    
    setPatient(patientProfile);
    setScenarios(treatmentScenarios);
    setDigitalTwinModel(twinModel);
    setSelectedScenario(treatmentScenarios[0].id);
  }, [generatePatientProfile, generateTreatmentScenarios, generateDigitalTwinModel]);

  if (!patient || !digitalTwinModel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentScenarioResults = simulationResults.filter(r => r.scenario === scenarios.find(s => s.id === selectedScenario)?.name);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Digital Twin Patient Modeling</h1>
            <p className="text-blue-100">
              AI-powered patient simulation with personalized treatment optimization and outcome prediction
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{digitalTwinModel.validation.accuracy * 100}%</div>
            <div className="text-sm text-blue-100">Model Accuracy</div>
          </div>
        </div>
      </div>

      {/* Patient Profile */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Digital Twin Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Demographics & Performance</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Age:</span>
                <span className="font-medium">{patient.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{patient.gender === 'M' ? 'Male' : 'Female'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ECOG PS:</span>
                <span className="font-medium">{patient.performance.ecog}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">BMI:</span>
                <span className="font-medium">{patient.performance.bmi}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Diagnosis & Staging</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Primary:</span>
                <span className="font-medium">{patient.diagnosis.primary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stage:</span>
                <span className="font-medium">{patient.diagnosis.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Histology:</span>
                <span className="font-medium">{patient.diagnosis.histology}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grade:</span>
                <span className="font-medium">{patient.diagnosis.grade}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Biomarkers</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(patient.diagnosis.biomarkers).slice(0, 4).map(([marker, value]) => (
                <div key={marker} className="flex justify-between">
                  <span className="text-gray-600">{marker}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Treatment Scenario</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {scenarios.map(scenario => (
                <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Horizon (months)</label>
            <input
              type="number"
              value={simulationParams.timeHorizon}
              onChange={(e) => setSimulationParams(prev => ({ ...prev, timeHorizon: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="6"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monte Carlo Iterations</label>
            <input
              type="number"
              value={simulationParams.iterations}
              onChange={(e) => setSimulationParams(prev => ({ ...prev, iterations: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="100"
              max="10000"
              step="100"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'uncertainty', label: 'Uncertainty Analysis' },
            { key: 'pharmacokinetics', label: 'PK Modeling' },
            { key: 'resistance', label: 'Resistance Evolution' },
            { key: 'adverseEvents', label: 'Toxicity Modeling' },
            { key: 'monteCarlo', label: 'Monte Carlo' }
          ].map(param => (
            <label key={param.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={simulationParams[param.key as keyof SimulationParameters] as boolean}
                onChange={(e) => setSimulationParams(prev => ({ ...prev, [param.key]: e.target.checked }))}
                className="rounded"
              />
              {param.label}
            </label>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={() => runSimulation(selectedScenario)}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Simulating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Simulation
              </>
            )}
          </button>

          <button
            onClick={runOptimization}
            disabled={isSimulating}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Target className="h-4 w-4" />
            Optimize Treatment
          </button>

          <button
            onClick={() => setSimulationResults([])}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        {isSimulating && simulationProgress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Simulation Progress</span>
              <span>{simulationProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${simulationProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Simulation Results */}
      {currentScenarioResults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tumor Response */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tumor Response Simulation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentScenarioResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timePoint" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'tumorSize' ? 'Tumor Size' : 'Confidence']} />
                <Area type="monotone" dataKey="tumorSize" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Area type="monotone" dataKey="confidence.lower" stroke="#94A3B8" fill="none" strokeDasharray="5,5" />
                <Area type="monotone" dataKey="confidence.upper" stroke="#94A3B8" fill="none" strokeDasharray="5,5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Survival Outcomes */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Survival & Progression</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentScenarioResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timePoint" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`${value.toFixed(1)}%`, name === 'survivalProbability' ? 'Overall Survival' : 'Progression-Free']} />
                <Line type="monotone" dataKey="survivalProbability" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="progressionFree" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quality of Life & Toxicity */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality of Life & Toxicity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={currentScenarioResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timePoint" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="qualityOfLife" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="toxicity.grade3_4" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Biomarker Trajectories */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Biomarker Trajectories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentScenarioResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timePoint" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="biomarkers.ctDNA" stroke="#EF4444" strokeWidth={2} name="ctDNA" />
                <Line type="monotone" dataKey="biomarkers.CRP" stroke="#F59E0B" strokeWidth={2} name="CRP" />
                <Line type="monotone" dataKey="resistance.probability" stroke="#8B5CF6" strokeWidth={2} name="Resistance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Optimization Results */}
      {optimization && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Optimization Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Optimal Treatment Strategy</h4>
              <div className="bg-white p-4 rounded border">
                <div className="text-lg font-semibold text-blue-600 mb-2">{optimization.bestScenario}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dose:</span>
                    <span className="font-medium">{optimization.optimizedParameters.dose}mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Schedule:</span>
                    <span className="font-medium">{optimization.optimizedParameters.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{optimization.optimizedParameters.duration} weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{optimization.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Expected Outcomes</h4>
              <div className="space-y-2">
                {Object.entries(optimization.expectedOutcomes).map(([outcome, value]) => (
                  <div key={outcome} className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="capitalize text-sm">{outcome.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{value.toFixed(1)}%</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Alternative Strategies</h4>
            <div className="space-y-2">
              {optimization.alternatives.map((alt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <div className="font-medium">{alt.scenario}</div>
                    <div className="text-sm text-gray-600">{alt.tradeoffs}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{alt.score}%</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Model Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Twin Model Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Model Components</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PK Model:</span>
                <span className="font-medium">{digitalTwinModel.components.pharmacokinetic.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PD Model:</span>
                <span className="font-medium">{digitalTwinModel.components.pharmacodynamic.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tumor Growth:</span>
                <span className="font-medium">{digitalTwinModel.components.tumor.growthModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resistance:</span>
                <span className="font-medium">{digitalTwinModel.components.resistance.model}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Model Validation</h4>
            <div className="space-y-2">
              {Object.entries(digitalTwinModel.validation).map(([metric, value]) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{metric}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{(value * 100).toFixed(1)}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Model Version</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">{digitalTwinModel.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model ID:</span>
                <span className="font-medium">{digitalTwinModel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clearance:</span>
                <span className="font-medium">{digitalTwinModel.components.pharmacokinetic.clearance} L/h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volume:</span>
                <span className="font-medium">{digitalTwinModel.components.pharmacokinetic.volume} L</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDigitalTwin;