import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Target, Zap, Activity, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, Waves, Lightbulb } from 'lucide-react';

interface CognitiveAssessment {
  id: string;
  patientId: string;
  timestamp: string;
  domains: {
    memory: {
      shortTerm: number;
      longTerm: number;
      workingMemory: number;
      episodic: number;
      semantic: number;
    };
    attention: {
      sustained: number;
      selective: number;
      divided: number;
      executiveControl: number;
    };
    processing: {
      speed: number;
      flexibility: number;
      inhibition: number;
      planning: number;
    };
    language: {
      comprehension: number;
      expression: number;
      fluency: number;
      naming: number;
    };
  };
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  cognitiveAge: number;
  chronologicalAge: number;
}

interface NeuroprotectiveProtocol {
  id: string;
  name: string;
  type: 'cognitive_training' | 'medication' | 'lifestyle' | 'intervention';
  status: 'active' | 'pending' | 'completed' | 'paused';
  effectiveness: number;
  sideEffects: string[];
  duration: number;
  frequency: string;
  components: {
    exercises: string[];
    medications: string[];
    activities: string[];
    monitoring: string[];
  };
}

interface MemoryPreservation {
  id: string;
  memoryType: 'episodic' | 'semantic' | 'procedural' | 'working';
  preservationLevel: number;
  deteriorationRate: number;
  interventions: string[];
  biomarkers: {
    tauProtein: number;
    amyloidBeta: number;
    neurofilament: number;
    bdnf: number;
  };
  neuroplasticity: {
    synapticDensity: number;
    neuralConnectivity: number;
    neurogenesis: number;
    myelination: number;
  };
}

interface CognitiveResilience {
  id: string;
  resilienceScore: number;
  cognitiveReserve: number;
  adaptabilityIndex: number;
  recoveryPotential: number;
  protectiveFactors: {
    education: number;
    socialEngagement: number;
    physicalActivity: number;
    mentalStimulation: number;
    nutrition: number;
    sleep: number;
  };
  vulnerabilityFactors: {
    stress: number;
    inflammation: number;
    vascularRisk: number;
    toxicExposure: number;
    geneticRisk: number;
  };
}

const MemoryCognitiveProtection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [cognitiveData, setCognitiveData] = useState<CognitiveAssessment[]>([]);
  const [protocols, setProtocols] = useState<NeuroprotectiveProtocol[]>([]);
  const [memoryData, setMemoryData] = useState<MemoryPreservation[]>([]);
  const [resilienceData, setResilienceData] = useState<CognitiveResilience[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate mock data
  useEffect(() => {
    const generateMockCognitive = (): CognitiveAssessment[] => {
      return Array.from({ length: 10 }, (_, i) => ({
        id: `cog-${i}`,
        patientId: `patient-${Math.floor(Math.random() * 100)}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        domains: {
          memory: {
            shortTerm: Math.random() * 100,
            longTerm: Math.random() * 100,
            workingMemory: Math.random() * 100,
            episodic: Math.random() * 100,
            semantic: Math.random() * 100,
          },
          attention: {
            sustained: Math.random() * 100,
            selective: Math.random() * 100,
            divided: Math.random() * 100,
            executiveControl: Math.random() * 100,
          },
          processing: {
            speed: Math.random() * 100,
            flexibility: Math.random() * 100,
            inhibition: Math.random() * 100,
            planning: Math.random() * 100,
          },
          language: {
            comprehension: Math.random() * 100,
            expression: Math.random() * 100,
            fluency: Math.random() * 100,
            naming: Math.random() * 100,
          },
        },
        overallScore: Math.random() * 100,
        riskLevel: ['low', 'moderate', 'high', 'severe'][Math.floor(Math.random() * 4)] as any,
        cognitiveAge: 45 + Math.random() * 30,
        chronologicalAge: 50 + Math.random() * 25,
      }));
    };

    const generateMockProtocols = (): NeuroprotectiveProtocol[] => {
      const protocolNames = [
        'Cognitive Training Suite',
        'Memory Enhancement Protocol',
        'Attention Restoration Therapy',
        'Executive Function Training',
        'Neuroprotective Medication',
        'Brain Fitness Program'
      ];

      return protocolNames.map((name, i) => ({
        id: `protocol-${i}`,
        name,
        type: ['cognitive_training', 'medication', 'lifestyle', 'intervention'][Math.floor(Math.random() * 4)] as any,
        status: ['active', 'pending', 'completed', 'paused'][Math.floor(Math.random() * 4)] as any,
        effectiveness: Math.random() * 100,
        sideEffects: ['Mild fatigue', 'Temporary confusion', 'Sleep disturbance'],
        duration: Math.floor(Math.random() * 12) + 1,
        frequency: ['Daily', 'Twice weekly', 'Weekly'][Math.floor(Math.random() * 3)],
        components: {
          exercises: ['Working memory tasks', 'Attention training', 'Processing speed drills'],
          medications: ['Donepezil', 'Memantine', 'Rivastigmine'],
          activities: ['Reading', 'Puzzles', 'Social interaction'],
          monitoring: ['Weekly assessments', 'Biomarker tracking', 'Imaging studies'],
        },
      }));
    };

    const generateMockMemory = (): MemoryPreservation[] => {
      return Array.from({ length: 4 }, (_, i) => ({
        id: `memory-${i}`,
        memoryType: ['episodic', 'semantic', 'procedural', 'working'][i] as any,
        preservationLevel: Math.random() * 100,
        deteriorationRate: Math.random() * 5,
        interventions: ['Cognitive training', 'Medication', 'Lifestyle modification'],
        biomarkers: {
          tauProtein: Math.random() * 500,
          amyloidBeta: Math.random() * 1000,
          neurofilament: Math.random() * 50,
          bdnf: Math.random() * 30,
        },
        neuroplasticity: {
          synapticDensity: Math.random() * 100,
          neuralConnectivity: Math.random() * 100,
          neurogenesis: Math.random() * 100,
          myelination: Math.random() * 100,
        },
      }));
    };

    const generateMockResilience = (): CognitiveResilience[] => {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `resilience-${i}`,
        resilienceScore: Math.random() * 100,
        cognitiveReserve: Math.random() * 100,
        adaptabilityIndex: Math.random() * 100,
        recoveryPotential: Math.random() * 100,
        protectiveFactors: {
          education: Math.random() * 100,
          socialEngagement: Math.random() * 100,
          physicalActivity: Math.random() * 100,
          mentalStimulation: Math.random() * 100,
          nutrition: Math.random() * 100,
          sleep: Math.random() * 100,
        },
        vulnerabilityFactors: {
          stress: Math.random() * 100,
          inflammation: Math.random() * 100,
          vascularRisk: Math.random() * 100,
          toxicExposure: Math.random() * 100,
          geneticRisk: Math.random() * 100,
        },
      }));
    };

    setCognitiveData(generateMockCognitive());
    setProtocols(generateMockProtocols());
    setMemoryData(generateMockMemory());
    setResilienceData(generateMockResilience());
  }, []);

  // Canvas visualization for cognitive network
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw cognitive network
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) / 3;

      // Draw main brain areas
      const areas = [
        { name: 'Prefrontal Cortex', angle: 0, color: '#3b82f6', activity: Math.random() },
        { name: 'Hippocampus', angle: Math.PI / 3, color: '#10b981', activity: Math.random() },
        { name: 'Temporal Cortex', angle: (2 * Math.PI) / 3, color: '#f59e0b', activity: Math.random() },
        { name: 'Parietal Cortex', angle: Math.PI, color: '#ef4444', activity: Math.random() },
        { name: 'Occipital Cortex', angle: (4 * Math.PI) / 3, color: '#8b5cf6', activity: Math.random() },
        { name: 'Cerebellum', angle: (5 * Math.PI) / 3, color: '#06b6d4', activity: Math.random() },
      ];

      areas.forEach((area, i) => {
        const x = centerX + Math.cos(area.angle) * radius;
        const y = centerY + Math.sin(area.angle) * radius;

        // Draw connections
        areas.forEach((otherArea, j) => {
          if (i !== j) {
            const otherX = centerX + Math.cos(otherArea.angle) * radius;
            const otherY = centerY + Math.sin(otherArea.angle) * radius;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = `rgba(100, 116, 139, ${0.1 + area.activity * 0.3})`;
            ctx.lineWidth = 1 + area.activity * 2;
            ctx.stroke();
          }
        });

        // Draw brain area
        ctx.beginPath();
        ctx.arc(x, y, 20 + area.activity * 10, 0, 2 * Math.PI);
        ctx.fillStyle = area.color;
        ctx.globalAlpha = 0.7 + area.activity * 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Draw activity pulse
        ctx.beginPath();
        ctx.arc(x, y, 30 + Math.sin(Date.now() * 0.005 + i) * 10, 0, 2 * Math.PI);
        ctx.strokeStyle = area.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      // Draw central processing unit
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#1f2937';
      ctx.fill();

      requestAnimationFrame(animate);
    };

    animate();
  }, [activeTab]);

  const renderCognitiveAssessment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Overall Cognitive Score</p>
                <p className="text-2xl font-bold">
                  {cognitiveData[0]?.overallScore.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Memory Composite</p>
                <p className="text-2xl font-bold">
                  {Object.values(cognitiveData[0]?.domains.memory || {}).reduce((a, b) => a + b, 0) / 5 || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Processing Speed</p>
                <p className="text-2xl font-bold">
                  {cognitiveData[0]?.domains.processing.speed.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Cognitive Age</p>
                <p className="text-2xl font-bold">
                  {cognitiveData[0]?.cognitiveAge.toFixed(0) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Cognitive Domain Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cognitiveData[0] && Object.entries(cognitiveData[0].domains).map(([domain, values]) => (
                <div key={domain} className="space-y-2">
                  <h4 className="font-medium capitalize">{domain}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(values).map(([subdomain, score]) => (
                      <div key={subdomain} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {subdomain.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium">{score.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cognitive Network Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <canvas
              ref={canvasRef}
              className="w-full h-64 border rounded"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNeuroprotectiveProtocols = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Active Protocols</p>
                <p className="text-2xl font-bold">
                  {protocols.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Effectiveness Rate</p>
                <p className="text-2xl font-bold">
                  {(protocols.reduce((sum, p) => sum + p.effectiveness, 0) / protocols.length || 0).toFixed(1)}%
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
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {(protocols.reduce((sum, p) => sum + p.duration, 0) / protocols.length || 0).toFixed(1)} mo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">87.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neuroprotective Protocols</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocols.map((protocol) => (
              <div key={protocol.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{protocol.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{protocol.type.replace('_', ' ')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      protocol.status === 'active' ? 'bg-green-100 text-green-800' :
                      protocol.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      protocol.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {protocol.status}
                    </span>
                    <span className="text-sm font-medium">{protocol.effectiveness.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Duration</p>
                    <p className="font-medium">{protocol.duration} months</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Frequency</p>
                    <p className="font-medium">{protocol.frequency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Components</p>
                    <p className="font-medium">{protocol.components.exercises.length + protocol.components.medications.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Side Effects</p>
                    <p className="font-medium">{protocol.sideEffects.length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMemoryPreservation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {memoryData.map((memory) => (
          <Card key={memory.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium capitalize">{memory.memoryType}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Preservation</span>
                  <span className="text-sm font-medium">{memory.preservationLevel.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deterioration</span>
                  <span className="text-sm font-medium">{memory.deteriorationRate.toFixed(2)}%/mo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Memory Biomarkers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoryData[0] && Object.entries(memoryData[0].biomarkers).map(([marker, value]) => (
                <div key={marker} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{marker.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (value / 1000) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Waves className="h-5 w-5" />
              <span>Neuroplasticity Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memoryData[0] && Object.entries(memoryData[0].neuroplasticity).map(([metric, value]) => (
                <div key={metric} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCognitiveResilience = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Resilience Score</p>
                <p className="text-2xl font-bold">
                  {resilienceData[0]?.resilienceScore.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Cognitive Reserve</p>
                <p className="text-2xl font-bold">
                  {resilienceData[0]?.cognitiveReserve.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Adaptability</p>
                <p className="text-2xl font-bold">
                  {resilienceData[0]?.adaptabilityIndex.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Recovery Potential</p>
                <p className="text-2xl font-bold">
                  {resilienceData[0]?.recoveryPotential.toFixed(1) || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Protective Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resilienceData[0] && Object.entries(resilienceData[0].protectiveFactors).map(([factor, value]) => (
                <div key={factor} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Vulnerability Factors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resilienceData[0] && Object.entries(resilienceData[0].vulnerabilityFactors).map(([factor, value]) => (
                <div key={factor} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{value.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Memory & Cognitive Protection System</h1>
          <p className="text-gray-600">Advanced neuroprotective monitoring and cognitive preservation protocols</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b">
        {[
          { id: 'assessment', label: 'Cognitive Assessment', icon: Brain },
          { id: 'protocols', label: 'Neuroprotective Protocols', icon: Shield },
          { id: 'memory', label: 'Memory Preservation', icon: Target },
          { id: 'resilience', label: 'Cognitive Resilience', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'assessment' && renderCognitiveAssessment()}
        {activeTab === 'protocols' && renderNeuroprotectiveProtocols()}
        {activeTab === 'memory' && renderMemoryPreservation()}
        {activeTab === 'resilience' && renderCognitiveResilience()}
      </div>
    </div>
  );
};

export default MemoryCognitiveProtection;