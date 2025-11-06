import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Dna, 
  Target, 
  Activity,
  Zap,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  Download,
  Maximize2,
  Settings,
  Info,
  TrendingUp,
  Network,
  Cpu,
  Eye,
  BarChart3
} from 'lucide-react';
import { Drug } from '../../types';
import { 
  drugMechanismVisualizationService,
  DrugMechanismData,
  PathwayVisualization,
  MolecularDynamicsSimulation,
  PatientSpecificModeling
} from '../../services/drugMechanismVisualizationService';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';
import Tooltip from '../UI/Tooltip';

interface DrugMechanismDashboardProps {
  selectedDrugs: Drug[];
  patientGenomics?: any;
  className?: string;
}

const DrugMechanismDashboard: React.FC<DrugMechanismDashboardProps> = ({
  selectedDrugs,
  patientGenomics,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'molecular' | 'pathway' | 'dynamics' | 'patient' | 'simulation'>('molecular');
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [selectedPathway, setSelectedPathway] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Visualization data
  const [mechanismData, setMechanismData] = useState<DrugMechanismData | null>(null);
  const [pathwayData, setPathwayData] = useState<PathwayVisualization | null>(null);
  const [simulationData, setSimulationData] = useState<MolecularDynamicsSimulation | null>(null);
  const [patientModel, setPatientModel] = useState<PatientSpecificModeling | null>(null);
  const [treatmentSimulation, setTreatmentSimulation] = useState<any>(null);
  
  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Available pathways and visualization options
  const [availablePathways] = useState(drugMechanismVisualizationService.getAvailablePathways());
  const [supportedDrugs] = useState(drugMechanismVisualizationService.getSupportedDrugs());

  useEffect(() => {
    if (selectedDrugs.length > 0 && !selectedDrug) {
      setSelectedDrug(selectedDrugs[0].rxcui || selectedDrugs[0].name);
    }
  }, [selectedDrugs, selectedDrug]);

  useEffect(() => {
    if (selectedDrug && activeTab === 'molecular') {
      loadMechanismData();
    }
  }, [selectedDrug, activeTab]);

  useEffect(() => {
    if (selectedPathway && activeTab === 'pathway') {
      loadPathwayData();
    }
  }, [selectedPathway, activeTab, selectedDrugs]);

  const loadMechanismData = async () => {
    if (!selectedDrug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await drugMechanismVisualizationService.getDrugMechanismData(selectedDrug);
      setMechanismData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mechanism data');
    } finally {
      setLoading(false);
    }
  };

  const loadPathwayData = async () => {
    if (!selectedPathway) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const drugIds = selectedDrugs.map(d => d.rxcui || d.name);
      const data = await drugMechanismVisualizationService.getPathwayVisualization(selectedPathway, drugIds);
      setPathwayData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pathway data');
    } finally {
      setLoading(false);
    }
  };

  const runMolecularDynamics = async () => {
    if (!selectedDrug || !mechanismData?.targets[0]) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const patientMutations = patientGenomics?.mutations?.map((m: any) => `${m.gene}:${m.mutation}`) || [];
      const data = await drugMechanismVisualizationService.runMolecularDynamicsSimulation(
        selectedDrug,
        mechanismData.targets[0].id,
        patientMutations
      );
      setSimulationData(data);
      setActiveTab('dynamics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run molecular dynamics');
    } finally {
      setLoading(false);
    }
  };

  const generatePatientModel = async () => {
    if (!patientGenomics || selectedDrugs.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const drugList = selectedDrugs.map(d => d.rxcui || d.name);
      const data = await drugMechanismVisualizationService.generatePatientSpecificModel(
        'current-patient',
        patientGenomics,
        drugList
      );
      setPatientModel(data);
      setActiveTab('patient');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate patient model');
    } finally {
      setLoading(false);
    }
  };

  const runTreatmentSimulation = async () => {
    if (selectedDrugs.length === 0) return;
    
    setIsSimulating(true);
    setError(null);
    
    try {
      const timeline = Array.from({ length: 30 }, (_, i) => i); // 30 days
      const data = await drugMechanismVisualizationService.simulateTreatmentMechanism(
        selectedDrugs,
        patientGenomics,
        timeline
      );
      setTreatmentSimulation(data);
      setActiveTab('simulation');
      
      // Animate simulation progress
      const animate = () => {
        setSimulationProgress(prev => {
          const next = prev + simulationSpeed;
          if (next >= 100) {
            setIsSimulating(false);
            return 100;
          }
          animationRef.current = requestAnimationFrame(animate);
          return next;
        });
      };
      animationRef.current = requestAnimationFrame(animate);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run treatment simulation');
      setIsSimulating(false);
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const exportVisualization = () => {
    // Implementation for exporting current visualization
    const dataToExport = {
      timestamp: new Date().toISOString(),
      drugs: selectedDrugs.map(d => d.name),
      mechanism: mechanismData,
      pathway: pathwayData,
      simulation: simulationData,
      patientModel: patientModel
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drug-mechanism-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'molecular', label: 'Molecular Structure', icon: Atom, color: 'blue' },
    { id: 'pathway', label: 'Pathway Analysis', icon: Network, color: 'green' },
    { id: 'dynamics', label: 'Molecular Dynamics', icon: Activity, color: 'purple' },
    { id: 'patient', label: 'Patient-Specific', icon: Target, color: 'orange' },
    { id: 'simulation', label: 'Treatment Simulation', icon: TrendingUp, color: 'red' }
  ];

  if (selectedDrugs.length === 0) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200 text-center ${className}`}>
        <Atom className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Drug Mechanism Visualization</h3>
        <p className="text-gray-600">
          Add drugs to visualize their molecular mechanisms, pathway interactions, and treatment dynamics
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">Drug Mechanism Visualization Lab</h3>
              <p className="text-sm text-blue-100">
                3D molecular interactions • Pathway dynamics • Patient-specific modeling
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportVisualization}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-white/20 text-white text-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Drug
              </label>
              <select
                value={selectedDrug}
                onChange={(e) => setSelectedDrug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {selectedDrugs.map((drug) => (
                  <option key={drug.rxcui || drug.name} value={drug.rxcui || drug.name}>
                    {drug.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Pathway
              </label>
              <select
                value={selectedPathway}
                onChange={(e) => setSelectedPathway(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select pathway...</option>
                {availablePathways.map((pathway) => (
                  <option key={pathway} value={pathway}>
                    {pathway}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulation Speed
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{simulationSpeed}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-100 text-${tab.color}-700 shadow-sm` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Running molecular analysis...</p>
              <p className="text-sm text-gray-500 mt-1">Quantum simulations in progress</p>
            </div>
          </div>
        )}

        {error && (
          <Alert type="error" title="Visualization Error">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <div className="space-y-6">
            {/* Molecular Structure Analysis */}
            {activeTab === 'molecular' && mechanismData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Drug Structure */}
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <Atom className="w-5 h-5 mr-2" />
                      Molecular Structure
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-blue-800">Formula:</span>
                        <span className="ml-2 text-blue-700">{mechanismData.drug.structure.formula}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Molecular Weight:</span>
                        <span className="ml-2 text-blue-700">{mechanismData.drug.structure.molecularWeight.toLocaleString()} Da</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">LogP:</span>
                        <span className="ml-2 text-blue-700">{mechanismData.drug.structure.logP}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {mechanismData.drug.classification.map((cls, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target Information */}
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Primary Target
                    </h4>
                    {mechanismData.targets[0] && (
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-green-800">Target:</span>
                          <span className="ml-2 text-green-700">{mechanismData.targets[0].name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Type:</span>
                          <span className="ml-2 text-green-700 capitalize">{mechanismData.targets[0].type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Location:</span>
                          <span className="ml-2 text-green-700 capitalize">{mechanismData.targets[0].location}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">PDB ID:</span>
                          <span className="ml-2 text-green-700">{mechanismData.targets[0].structure.pdbId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Binding Kinetics */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Binding Kinetics & Mechanism
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h6 className="font-medium text-purple-800 mb-2">Affinity</h6>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-purple-700">Kd:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.bindingSite.affinityKd} nM</span>
                        </div>
                        <div>
                          <span className="text-purple-700">IC50:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.kineticsData.ic50} nM</span>
                        </div>
                        <div>
                          <span className="text-purple-700">Selectivity:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.bindingSite.selectivity}x</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-purple-800 mb-2">Kinetics</h6>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-purple-700">kon:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.kineticsData.kon.toExponential(2)} M⁻¹s⁻¹</span>
                        </div>
                        <div>
                          <span className="text-purple-700">koff:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.kineticsData.koff.toExponential(2)} s⁻¹</span>
                        </div>
                        <div>
                          <span className="text-purple-700">Hill coeff:</span>
                          <span className="ml-2 font-medium">{mechanismData.mechanism.kineticsData.hill_coefficient}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h6 className="font-medium text-purple-800 mb-2">Mechanism</h6>
                      <div className="space-y-2 text-sm">
                        <div className="text-purple-700 capitalize">
                          {mechanismData.mechanism.type.replace('_', ' ')}
                        </div>
                        <div className="text-purple-600">
                          Binding site: {mechanismData.mechanism.bindingSite.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={runMolecularDynamics}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Run Molecular Dynamics</span>
                  </button>
                  {patientGenomics && (
                    <button
                      onClick={generatePatientModel}
                      disabled={loading}
                      className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      <Target className="w-5 h-5" />
                      <span>Patient-Specific Model</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pathway Analysis */}
            {activeTab === 'pathway' && selectedPathway && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Network className="w-5 h-5 mr-2 text-green-600" />
                    {selectedPathway} Pathway
                  </h4>
                  <button
                    onClick={loadPathwayData}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                {pathwayData && (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h6 className="font-semibold text-green-900 mb-3">Pathway Nodes</h6>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {pathwayData.nodes.map((node) => (
                            <div key={node.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                              <div>
                                <span className="font-medium text-green-800">{node.name}</span>
                                <span className="ml-2 text-sm text-green-600 capitalize">({node.type})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  node.state === 'active' ? 'bg-green-100 text-green-700' :
                                  node.state === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                  node.state === 'upregulated' ? 'bg-red-100 text-red-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                  {node.state}
                                </span>
                                <span className="text-sm text-green-700">
                                  {node.expression.toFixed(1)}x
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h6 className="font-semibold text-green-900 mb-3">Drug Interventions</h6>
                        <div className="space-y-2">
                          {pathwayData.drugInterventions.map((intervention, i) => (
                            <div key={i} className="p-3 bg-white rounded border border-green-200">
                              <div className="font-medium text-green-800 mb-1">
                                {intervention.drugId}
                              </div>
                              <div className="text-sm text-green-700 mb-2">
                                {intervention.mechanism}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600">
                                  Targets: {intervention.targetNodes.join(', ')}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  {(intervention.effectStrength * 100).toFixed(0)}% effect
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pathway Canvas Placeholder */}
                    <div className="mt-6">
                      <canvas
                        ref={canvasRef}
                        width={800}
                        height={400}
                        className="w-full border border-green-300 rounded-lg bg-white"
                        style={{ maxHeight: '400px' }}
                      />
                      <p className="text-center text-sm text-green-600 mt-2">
                        Interactive pathway visualization • Click nodes for details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Molecular Dynamics */}
            {activeTab === 'dynamics' && simulationData && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-600" />
                  Molecular Dynamics Simulation
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h6 className="font-semibold text-purple-900 mb-4">Simulation Results</h6>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-purple-800">Binding Energy:</span>
                        <span className="ml-2 text-purple-700">{simulationData.results.bindingEnergy} kcal/mol</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-800">Pose Confidence:</span>
                        <span className="ml-2 text-purple-700">{(simulationData.results.bindingPose.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="font-medium text-purple-800">Duration:</span>
                        <span className="ml-2 text-purple-700">{simulationData.parameters.duration} ns</span>
                      </div>
                    </div>

                    <h6 className="font-semibold text-purple-900 mt-6 mb-3">Conformational Changes</h6>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {simulationData.results.conformationalChanges.map((change, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-purple-800">{change.residue}</span>
                          <span className="text-purple-700">{change.change.toFixed(2)} Å RMSD</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                    <h6 className="font-semibold text-purple-900 mb-4">Key Interactions</h6>
                    <div className="space-y-2">
                      {simulationData.visualization.interactionMap.map((interaction, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <span className="text-purple-800">{interaction.residue}</span>
                            <span className="ml-2 text-sm text-purple-600 capitalize">
                              ({interaction.interaction_type.replace('_', ' ')})
                            </span>
                          </div>
                          <span className="text-purple-700">
                            {(interaction.frequency * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Patient-Specific Modeling */}
            {activeTab === 'patient' && patientModel && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-600" />
                  Patient-Specific Molecular Model
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h6 className="font-semibold text-orange-900 mb-4">Genomic Profile</h6>
                    <div className="space-y-4">
                      <div>
                        <h7 className="font-medium text-orange-800">Mutations</h7>
                        <div className="mt-2 space-y-2">
                          {patientModel.genomics.mutations.map((mutation, i) => (
                            <div key={i} className="p-2 bg-white rounded border border-orange-200">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-orange-800">
                                  {mutation.gene}: {mutation.mutation}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  mutation.impact === 'gain_of_function' ? 'bg-red-100 text-red-700' :
                                  mutation.impact === 'loss_of_function' ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {mutation.impact.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-sm text-orange-700 mt-1">
                                Confidence: {(mutation.confidence * 100).toFixed(0)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                    <h6 className="font-semibold text-orange-900 mb-4">Predicted Drug Effects</h6>
                    <div className="space-y-3">
                      {patientModel.modeledEffects.map((effect, i) => (
                        <div key={i} className="p-3 bg-white rounded border border-orange-200">
                          <div className="font-medium text-orange-800 mb-2">
                            {effect.drug} → {effect.target}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-orange-700">Efficacy:</span>
                              <span className="ml-2 font-medium">{(effect.predictedResponse.efficacy * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Resistance Risk:</span>
                              <span className="ml-2 font-medium">{(effect.predictedResponse.resistance_risk * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-orange-700">Optimal Dose:</span>
                              <span className="ml-2 font-medium">{effect.predictedResponse.optimal_dose} mg/m²</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Treatment Simulation */}
            {activeTab === 'simulation' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                    Treatment Simulation
                  </h4>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={isSimulating ? resetSimulation : runTreatmentSimulation}
                      className={`px-4 py-2 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 ${
                        isSimulating ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isSimulating ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      <span>{isSimulating ? 'Reset' : 'Run Simulation'}</span>
                    </button>
                  </div>
                </div>

                {isSimulating && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-800">Simulation Progress</span>
                      <span className="text-red-700">{simulationProgress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-3">
                      <div 
                        className="bg-red-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {treatmentSimulation && (
                  <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                    <h6 className="font-semibold text-red-900 mb-4">Mechanism Timeline</h6>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h7 className="font-medium text-red-800">Pathway States Over Time</h7>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                          {treatmentSimulation.mechanismTimeline.slice(0, 10).map((timepoint: any, i: number) => (
                            <div key={i} className="p-2 bg-white rounded border border-red-200">
                              <div className="font-medium text-red-800">Day {timepoint.day}</div>
                              <div className="text-sm text-red-700">
                                {Object.entries(timepoint.pathwayStates).map(([pathway, state]: any) => (
                                  <div key={pathway} className="flex justify-between">
                                    <span>{pathway.replace('_', ' ')}</span>
                                    <span>{(state * 100).toFixed(0)}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h7 className="font-medium text-red-800">Drug Concentrations</h7>
                        <div className="mt-2 space-y-2">
                          {Object.entries(treatmentSimulation.mechanismTimeline[0]?.drugConcentrations || {}).map(([drug, conc]: any) => (
                            <div key={drug} className="flex justify-between items-center p-2 bg-white rounded border border-red-200">
                              <span className="text-red-800">{drug}</span>
                              <span className="text-red-700">{conc.toFixed(1)} ng/mL</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugMechanismDashboard;