import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom, Zap, Activity, Target, Radio, Waves, BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, Orbit } from 'lucide-react';

interface QuantumEntanglement {
  id: string;
  patientId: string;
  entanglementPair: {
    primaryQubit: {
      id: string;
      state: 'superposition' | 'collapsed';
      spin: 'up' | 'down' | 'coherent';
      coherenceTime: number; // in microseconds
      fidelity: number; // 0-1
    };
    entangledQubit: {
      id: string;
      state: 'superposition' | 'collapsed';
      spin: 'up' | 'down' | 'coherent';
      location: string;
      distance: number; // in kilometers
    };
  };
  entanglementStrength: number; // 0-1
  decoherenceRate: number; // per second
  bellStateViolation: number; // CHSH inequality test result
  quantumChannel: {
    noiseLevel: number;
    errorRate: number;
    throughput: number; // qubits per second
    protocol: 'BB84' | 'E91' | 'SARG04' | 'DPS';
  };
  measurementHistory: Array<{
    timestamp: string;
    measurement: string;
    outcome: 'correlated' | 'anti-correlated' | 'random';
    confidence: number;
  }>;
}

interface QuantumSensor {
  id: string;
  type: 'magnetometer' | 'accelerometer' | 'biosensor' | 'temperature' | 'pressure';
  location: 'implanted' | 'wearable' | 'remote' | 'lab_based';
  sensitivity: number; // in relevant SI units
  quantumAdvantage: number; // improvement over classical sensors
  operatingTemperature: number; // in Kelvin
  coherenceLength: number; // in meters
  currentState: {
    superposition: boolean;
    squeezedState: boolean;
    entangled: boolean;
    noiseLevel: number;
  };
  biomarkerDetection: {
    detected: string[];
    sensitivity: { [biomarker: string]: number };
    specificity: { [biomarker: string]: number };
    quantumEnhancement: { [biomarker: string]: number };
  };
  realTimeData: Array<{
    timestamp: string;
    value: number;
    uncertainty: number;
    quantumCorrection: number;
  }>;
}

interface QuantumTeleportation {
  id: string;
  sourceLocation: string;
  targetLocation: string;
  dataType: 'vital_signs' | 'biomarker_levels' | 'genetic_data' | 'imaging_data';
  teleportationProtocol: 'standard' | 'continuous_variable' | 'cluster_state' | 'hybrid';
  fidelity: number; // 0-1
  transmissionTime: number; // in nanoseconds
  quantumChannel: {
    entangledPhotons: number;
    photonLoss: number;
    detectorEfficiency: number;
    darkCounts: number;
  };
  classicalChannel: {
    bandwidth: number; // bits per second
    latency: number; // milliseconds
    errorRate: number;
  };
  teleportedData: {
    originalState: string;
    reconstructedState: string;
    verificationResult: 'success' | 'partial' | 'failed';
    dataIntegrity: number; // 0-1
  };
}

interface QuantumNetworking {
  id: string;
  networkTopology: 'star' | 'mesh' | 'ring' | 'tree' | 'hybrid';
  nodes: Array<{
    nodeId: string;
    location: string;
    nodeType: 'hospital' | 'clinic' | 'lab' | 'patient_device' | 'quantum_repeater';
    quantumProcessingPower: number; // logical qubits
    entanglementCapacity: number;
    connectionsToOtherNodes: string[];
  }>;
  quantumInternet: {
    globalConnectivity: boolean;
    quantumRepeaters: number;
    maxDistance: number; // kilometers
    averageLatency: number; // milliseconds
  };
  securityLevel: {
    quantumKeyDistribution: boolean;
    quantumDigitalSignatures: boolean;
    postQuantumCryptography: boolean;
    intrusionDetection: number; // 0-1
  };
  dataFlow: Array<{
    timestamp: string;
    source: string;
    destination: string;
    dataVolume: number; // qubits
    routingPath: string[];
    transmissionSuccess: boolean;
  }>;
}

interface QuantumML {
  id: string;
  algorithmType: 'VQE' | 'QAOA' | 'QNN' | 'QSVM' | 'Quantum_GAN' | 'HHL';
  quantumCircuit: {
    depth: number;
    gateCount: number;
    qubits: number;
    connectivityGraph: string;
  };
  classicalHybrid: {
    optimizerType: 'COBYLA' | 'SPSA' | 'Adam' | 'L-BFGS-B';
    iterations: number;
    convergence: number;
    parameterCount: number;
  };
  quantumAdvantage: {
    speedup: number; // compared to classical
    memoryReduction: number;
    accuracyImprovement: number;
    powerConsumption: number; // watts
  };
  applications: Array<{
    taskType: 'drug_discovery' | 'protein_folding' | 'biomarker_identification' | 'treatment_optimization';
    performance: number; // 0-1
    executionTime: number; // seconds
    quantumResources: number; // qubit-hours
  }>;
  errorMitigation: {
    techniques: string[];
    effectivenessScore: number;
    overheadFactor: number;
  };
}

const QuantumEntangledHealthMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entanglement');
  const [entanglements, setEntanglements] = useState<QuantumEntanglement[]>([]);
  const [sensors, setSensors] = useState<QuantumSensor[]>([]);
  const [teleportations, setTeleportations] = useState<QuantumTeleportation[]>([]);
  const [networking, setNetworking] = useState<QuantumNetworking[]>([]);
  const [quantumML, setQuantumML] = useState<QuantumML[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Populate data (demo mode only); otherwise show empty state
  useEffect(() => {
    const isDemoMode = false; // Demo mode removed for production
    if (!isDemoMode) {
      setEntanglements([]);
      setSensors([]);
      setTeleportations([]);
      setNetworking([]);
      setQuantumML([]);
      return;
    }
    const generateMockEntanglements = (): QuantumEntanglement[] => {
      return Array.from({ length: 6 }, (_, i) => ({
        id: `entanglement-${i}`,
        patientId: `patient-${i}`,
        entanglementPair: {
          primaryQubit: {
            id: `qubit-${i}-primary`,
            state: Math.random() > 0.5 ? 'superposition' : 'collapsed',
            spin: ['up', 'down', 'coherent'][Math.floor(Math.random() * 3)] as any,
            coherenceTime: Math.random() * 100 + 50,
            fidelity: 0.8 + Math.random() * 0.19,
          },
          entangledQubit: {
            id: `qubit-${i}-entangled`,
            state: Math.random() > 0.5 ? 'superposition' : 'collapsed',
            spin: ['up', 'down', 'coherent'][Math.floor(Math.random() * 3)] as any,
            location: ['Remote Lab', 'Satellite', 'Partner Hospital', 'Research Center'][Math.floor(Math.random() * 4)],
            distance: Math.random() * 1000 + 10,
          },
        },
        entanglementStrength: 0.7 + Math.random() * 0.29,
        decoherenceRate: Math.random() * 0.01 + 0.001,
        bellStateViolation: 2 + Math.random() * 0.8, // > 2 indicates quantum correlation
        quantumChannel: {
          noiseLevel: Math.random() * 0.1,
          errorRate: Math.random() * 0.05,
          throughput: Math.random() * 1000 + 100,
          protocol: ['BB84', 'E91', 'SARG04', 'DPS'][Math.floor(Math.random() * 4)] as any,
        },
        measurementHistory: Array.from({ length: 20 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 60 * 1000).toISOString(),
          measurement: `measurement-${j}`,
          outcome: ['correlated', 'anti-correlated', 'random'][Math.floor(Math.random() * 3)] as any,
          confidence: 0.8 + Math.random() * 0.19,
        })),
      }));
    };

    const generateMockSensors = (): QuantumSensor[] => {
      const sensorTypes = ['magnetometer', 'accelerometer', 'biosensor', 'temperature', 'pressure'];
      
      return sensorTypes.map((type, i) => ({
        id: `sensor-${i}`,
        type: type as any,
        location: ['implanted', 'wearable', 'remote', 'lab_based'][Math.floor(Math.random() * 4)] as any,
        sensitivity: Math.random() * 1e-12 + 1e-15,
        quantumAdvantage: Math.random() * 100 + 10,
        operatingTemperature: Math.random() * 4 + 0.01, // Kelvin
        coherenceLength: Math.random() * 1000 + 100,
        currentState: {
          superposition: Math.random() > 0.5,
          squeezedState: Math.random() > 0.7,
          entangled: Math.random() > 0.6,
          noiseLevel: Math.random() * 0.1,
        },
        biomarkerDetection: {
          detected: ['PSA', 'CEA', 'CA-125', 'AFP'].filter(() => Math.random() > 0.5),
          sensitivity: {
            PSA: 0.8 + Math.random() * 0.19,
            CEA: 0.8 + Math.random() * 0.19,
            'CA-125': 0.8 + Math.random() * 0.19,
            AFP: 0.8 + Math.random() * 0.19,
          },
          specificity: {
            PSA: 0.85 + Math.random() * 0.14,
            CEA: 0.85 + Math.random() * 0.14,
            'CA-125': 0.85 + Math.random() * 0.14,
            AFP: 0.85 + Math.random() * 0.14,
          },
          quantumEnhancement: {
            PSA: Math.random() * 50 + 10,
            CEA: Math.random() * 50 + 10,
            'CA-125': Math.random() * 50 + 10,
            AFP: Math.random() * 50 + 10,
          },
        },
        realTimeData: Array.from({ length: 50 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 60 * 1000).toISOString(),
          value: Math.sin(j * 0.1) * 10 + Math.random() * 5,
          uncertainty: Math.random() * 0.5,
          quantumCorrection: (Math.random() - 0.5) * 2,
        })),
      }));
    };

    const generateMockTeleportations = (): QuantumTeleportation[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `teleportation-${i}`,
        sourceLocation: ['Hospital A', 'Clinic B', 'Lab C', 'Device D'][i],
        targetLocation: ['Research Center', 'Specialist Hospital', 'Analytics Hub', 'Cloud Server'][i],
        dataType: ['vital_signs', 'biomarker_levels', 'genetic_data', 'imaging_data'][i] as any,
        teleportationProtocol: ['standard', 'continuous_variable', 'cluster_state', 'hybrid'][Math.floor(Math.random() * 4)] as any,
        fidelity: 0.85 + Math.random() * 0.14,
        transmissionTime: Math.random() * 1000 + 100,
        quantumChannel: {
          entangledPhotons: Math.floor(Math.random() * 1000000) + 100000,
          photonLoss: Math.random() * 0.2,
          detectorEfficiency: 0.8 + Math.random() * 0.19,
          darkCounts: Math.random() * 1000,
        },
        classicalChannel: {
          bandwidth: Math.random() * 1e9 + 1e6,
          latency: Math.random() * 10 + 1,
          errorRate: Math.random() * 0.01,
        },
        teleportedData: {
          originalState: `|ψ⟩ = α|0⟩ + β|1⟩`,
          reconstructedState: `|ψ'⟩ = α'|0⟩ + β'|1⟩`,
          verificationResult: ['success', 'partial', 'failed'][Math.floor(Math.random() * 3)] as any,
          dataIntegrity: 0.9 + Math.random() * 0.09,
        },
      }));
    };

    const generateMockNetworking = (): QuantumNetworking[] => {
      return Array.from({ length: 2 }, (_, i) => ({
        id: `network-${i}`,
        networkTopology: ['star', 'mesh', 'ring', 'tree', 'hybrid'][Math.floor(Math.random() * 5)] as any,
        nodes: Array.from({ length: 8 }, (_, j) => ({
          nodeId: `node-${j}`,
          location: `Location-${j}`,
          nodeType: ['hospital', 'clinic', 'lab', 'patient_device', 'quantum_repeater'][Math.floor(Math.random() * 5)] as any,
          quantumProcessingPower: Math.floor(Math.random() * 100) + 10,
          entanglementCapacity: Math.floor(Math.random() * 1000) + 100,
          connectionsToOtherNodes: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => `node-${Math.floor(Math.random() * 8)}`),
        })),
        quantumInternet: {
          globalConnectivity: Math.random() > 0.3,
          quantumRepeaters: Math.floor(Math.random() * 50) + 10,
          maxDistance: Math.random() * 10000 + 1000,
          averageLatency: Math.random() * 100 + 10,
        },
        securityLevel: {
          quantumKeyDistribution: true,
          quantumDigitalSignatures: Math.random() > 0.5,
          postQuantumCryptography: Math.random() > 0.7,
          intrusionDetection: 0.9 + Math.random() * 0.09,
        },
        dataFlow: Array.from({ length: 100 }, (_, j) => ({
          timestamp: new Date(Date.now() - j * 60 * 1000).toISOString(),
          source: `node-${Math.floor(Math.random() * 8)}`,
          destination: `node-${Math.floor(Math.random() * 8)}`,
          dataVolume: Math.floor(Math.random() * 1000) + 100,
          routingPath: [`node-${Math.floor(Math.random() * 8)}`, `node-${Math.floor(Math.random() * 8)}`],
          transmissionSuccess: Math.random() > 0.1,
        })),
      }));
    };

    const generateMockQuantumML = (): QuantumML[] => {
      const algorithms = ['VQE', 'QAOA', 'QNN', 'QSVM', 'Quantum_GAN', 'HHL'];
      
      return algorithms.map((algorithm, i) => ({
        id: `qml-${i}`,
        algorithmType: algorithm as any,
        quantumCircuit: {
          depth: Math.floor(Math.random() * 100) + 10,
          gateCount: Math.floor(Math.random() * 1000) + 100,
          qubits: Math.floor(Math.random() * 50) + 5,
          connectivityGraph: 'all-to-all',
        },
        classicalHybrid: {
          optimizerType: ['COBYLA', 'SPSA', 'Adam', 'L-BFGS-B'][Math.floor(Math.random() * 4)] as any,
          iterations: Math.floor(Math.random() * 1000) + 100,
          convergence: Math.random() * 0.1 + 0.9,
          parameterCount: Math.floor(Math.random() * 1000) + 50,
        },
        quantumAdvantage: {
          speedup: Math.random() * 100 + 2,
          memoryReduction: Math.random() * 90 + 10,
          accuracyImprovement: Math.random() * 30 + 5,
          powerConsumption: Math.random() * 1000 + 100,
        },
        applications: [
          {
            taskType: ['drug_discovery', 'protein_folding', 'biomarker_identification', 'treatment_optimization'][Math.floor(Math.random() * 4)] as any,
            performance: 0.8 + Math.random() * 0.19,
            executionTime: Math.random() * 3600 + 60,
            quantumResources: Math.random() * 1000 + 100,
          },
        ],
        errorMitigation: {
          techniques: ['Zero-noise extrapolation', 'Probabilistic error cancellation', 'Symmetry verification'],
          effectivenessScore: 0.7 + Math.random() * 0.29,
          overheadFactor: 1 + Math.random() * 3,
        },
      }));
    };

    setEntanglements(generateMockEntanglements());
    setSensors(generateMockSensors());
    setTeleportations(generateMockTeleportations());
    setNetworking(generateMockNetworking());
    setQuantumML(generateMockQuantumML());
  }, []);

  // Canvas visualization for quantum entanglement
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw quantum entanglement visualization
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw entangled particles
      const time = Date.now() * 0.001;
      const particle1X = centerX - 100 + Math.sin(time) * 20;
      const particle1Y = centerY + Math.cos(time * 1.5) * 10;
      const particle2X = centerX + 100 - Math.sin(time) * 20;
      const particle2Y = centerY - Math.cos(time * 1.5) * 10;

      // Draw entanglement connection
      ctx.beginPath();
      ctx.moveTo(particle1X, particle1Y);
      ctx.lineTo(particle2X, particle2Y);
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(time * 2) * 0.2})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw quantum waves
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(particle1X, particle1Y, 20 + i * 15 + Math.sin(time * 2 + i) * 5, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 - i * 0.03})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(particle2X, particle2Y, 20 + i * 15 + Math.sin(time * 2 + i + Math.PI) * 5, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.2 - i * 0.03})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw particles
      ctx.beginPath();
      ctx.arc(particle1X, particle1Y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(particle2X, particle2Y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Draw superposition state
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('|ψ⟩ = α|0⟩ + β|1⟩', centerX, centerY - 50);
      ctx.fillText('Entangled State', centerX, centerY + 60);

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderEntanglement = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Atom className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Entangled Pairs</p>
                <p className="text-2xl font-bold">{entanglements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Fidelity</p>
                <p className="text-2xl font-bold">
                  {(entanglements.reduce((sum, e) => sum + e.entanglementPair.primaryQubit.fidelity, 0) / entanglements.length || 0).toFixed(3)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Bell Violations</p>
                <p className="text-2xl font-bold">
                  {entanglements.filter(e => e.bellStateViolation > 2).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Coherence</p>
                <p className="text-2xl font-bold">
                  {(entanglements.reduce((sum, e) => sum + e.entanglementPair.primaryQubit.coherenceTime, 0) / entanglements.length || 0).toFixed(1)}μs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quantum Entanglement Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entanglement Strength Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {entanglements.slice(0, 5).map((entanglement) => (
                <div key={entanglement.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Patient {entanglement.patientId}</span>
                    <span className="text-sm font-medium">{entanglement.entanglementStrength.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${entanglement.entanglementStrength * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quantum Entanglement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entanglements.map((entanglement) => (
              <div key={entanglement.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">Patient {entanglement.patientId}</h4>
                    <p className="text-sm text-gray-600">
                      Distance: {entanglement.entanglementPair.entangledQubit.distance.toFixed(1)} km
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      entanglement.bellStateViolation > 2 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      Bell: {entanglement.bellStateViolation.toFixed(2)}
                    </span>
                    <span className="text-sm font-medium">{(entanglement.entanglementStrength * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Primary Qubit</p>
                    <p className="font-medium capitalize">{entanglement.entanglementPair.primaryQubit.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entangled Qubit</p>
                    <p className="font-medium">{entanglement.entanglementPair.entangledQubit.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Coherence Time</p>
                    <p className="font-medium">{entanglement.entanglementPair.primaryQubit.coherenceTime.toFixed(1)}μs</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fidelity</p>
                    <p className="font-medium">{entanglement.entanglementPair.primaryQubit.fidelity.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSensors = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Quantum Sensors</p>
                <p className="text-2xl font-bold">{sensors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Entangled Sensors</p>
                <p className="text-2xl font-bold">
                  {sensors.filter(s => s.currentState.entangled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Waves className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Squeezed States</p>
                <p className="text-2xl font-bold">
                  {sensors.filter(s => s.currentState.squeezedState).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Quantum Advantage</p>
                <p className="text-2xl font-bold">
                  {(sensors.reduce((sum, s) => sum + s.quantumAdvantage, 0) / sensors.length || 0).toFixed(0)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sensors.map((sensor) => (
          <Card key={sensor.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="capitalize">{sensor.type} Sensor</span>
                <span className="text-sm text-gray-600 capitalize">{sensor.location}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Sensitivity</p>
                    <p className="font-medium">{sensor.sensitivity.toExponential(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantum Advantage</p>
                    <p className="font-medium">{sensor.quantumAdvantage.toFixed(1)}x</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Operating Temp</p>
                    <p className="font-medium">{sensor.operatingTemperature.toFixed(3)} K</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Coherence Length</p>
                    <p className="font-medium">{sensor.coherenceLength.toFixed(0)} m</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Quantum States</h5>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(sensor.currentState).map(([state, active]) => (
                      <span
                        key={state}
                        className={`px-2 py-1 rounded text-xs ${
                          active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {state.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium mb-2">Detected Biomarkers</h5>
                  <div className="space-y-1">
                    {sensor.biomarkerDetection.detected.map((biomarker) => (
                      <div key={biomarker} className="flex justify-between text-xs">
                        <span>{biomarker}</span>
                        <span className="text-green-600">
                          {(sensor.biomarkerDetection.quantumEnhancement[biomarker] || 0).toFixed(1)}x
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTeleportation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Active Teleportations</p>
                <p className="text-2xl font-bold">{teleportations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Successful</p>
                <p className="text-2xl font-bold">
                  {teleportations.filter(t => t.teleportedData.verificationResult === 'success').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Fidelity</p>
                <p className="text-2xl font-bold">
                  {(teleportations.reduce((sum, t) => sum + t.fidelity, 0) / teleportations.length || 0).toFixed(3)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Avg Transmission</p>
                <p className="text-2xl font-bold">
                  {(teleportations.reduce((sum, t) => sum + t.transmissionTime, 0) / teleportations.length || 0).toFixed(0)}ns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quantum Teleportation Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teleportations.map((teleportation) => (
              <div key={teleportation.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium capitalize">{teleportation.dataType.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600">
                      {teleportation.sourceLocation} → {teleportation.targetLocation}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      teleportation.teleportedData.verificationResult === 'success' ? 'bg-green-100 text-green-800' :
                      teleportation.teleportedData.verificationResult === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {teleportation.teleportedData.verificationResult}
                    </span>
                    <span className="text-sm font-medium">{(teleportation.fidelity * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Protocol</p>
                    <p className="font-medium capitalize">{teleportation.teleportationProtocol.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transmission Time</p>
                    <p className="font-medium">{teleportation.transmissionTime.toFixed(0)} ns</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entangled Photons</p>
                    <p className="font-medium">{teleportation.quantumChannel.entangledPhotons.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data Integrity</p>
                    <p className="font-medium">{(teleportation.teleportedData.dataIntegrity * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNetworking = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Orbit className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Network Nodes</p>
                <p className="text-2xl font-bold">
                  {networking.reduce((sum, n) => sum + n.nodes.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Radio className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Quantum Repeaters</p>
                <p className="text-2xl font-bold">
                  {networking.reduce((sum, n) => sum + n.quantumInternet.quantumRepeaters, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Data Throughput</p>
                <p className="text-2xl font-bold">
                  {networking[0]?.dataFlow.filter(d => d.transmissionSuccess).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Security Level</p>
                <p className="text-2xl font-bold">
                  {((networking[0]?.securityLevel.intrusionDetection || 0) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {networking.map((network) => (
        <Card key={network.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quantum Network {network.id}</span>
              <span className="text-sm text-gray-600 capitalize">{network.networkTopology}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Max Distance</p>
                  <p className="font-medium">{network.quantumInternet.maxDistance.toFixed(0)} km</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Latency</p>
                  <p className="font-medium">{network.quantumInternet.averageLatency.toFixed(1)} ms</p>
                </div>
                <div>
                  <p className="text-gray-600">Global Connectivity</p>
                  <p className="font-medium">{network.quantumInternet.globalConnectivity ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Active Nodes</p>
                  <p className="font-medium">{network.nodes.length}</p>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Security Features</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(network.securityLevel).map(([feature, enabled]) => (
                    <span
                      key={feature}
                      className={`px-2 py-1 rounded text-xs ${
                        enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">Node Distribution</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                  {['hospital', 'clinic', 'lab', 'patient_device', 'quantum_repeater'].map((type) => {
                    const count = network.nodes.filter(n => n.nodeType === type).length;
                    return (
                      <div key={type} className="text-center">
                        <p className="text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                        <p className="font-medium">{count}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-indigo-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-purple-600 rounded-lg">
          <Atom className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quantum Entangled Health Monitoring</h1>
          <p className="text-gray-600">Revolutionary quantum technologies for instantaneous health data transmission</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'entanglement', label: 'Quantum Entanglement', icon: Atom },
          { id: 'sensors', label: 'Quantum Sensors', icon: Activity },
          { id: 'teleportation', label: 'Data Teleportation', icon: Zap },
          { id: 'networking', label: 'Quantum Networks', icon: Radio },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'entanglement' && renderEntanglement()}
        {activeTab === 'sensors' && renderSensors()}
        {activeTab === 'teleportation' && renderTeleportation()}
        {activeTab === 'networking' && renderNetworking()}
      </div>
    </div>
  );
};

export default QuantumEntangledHealthMonitoring;
