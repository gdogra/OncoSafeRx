import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Badge
} from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Flask,
  Microscope,
  TestTube,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Beaker,
  Zap,
  Shield,
  FileText,
  Scan,
  Users,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  MapPin,
  Thermometer,
  Timer,
  Target,
  Workflow
} from 'lucide-react';

interface LabWorkflow {
  id: string;
  name: string;
  type: 'sequencing' | 'immunohistochemistry' | 'flow_cytometry' | 'mass_spectrometry' | 'pcr' | 'western_blot' | 'elisa' | 'cytogenetics';
  status: 'active' | 'paused' | 'maintenance' | 'error';
  throughput: number;
  avg_turnaround: number;
  success_rate: number;
  instruments: Instrument[];
  protocols: Protocol[];
  current_samples: number;
  queue_length: number;
}

interface Instrument {
  id: string;
  name: string;
  model: string;
  type: 'sequencer' | 'microscope' | 'spectrometer' | 'analyzer' | 'centrifuge' | 'incubator' | 'freezer';
  status: 'online' | 'offline' | 'maintenance' | 'error' | 'calibrating';
  utilization: number;
  last_calibration: string;
  next_maintenance: string;
  location: string;
  temperature?: number;
  operating_hours: number;
}

interface Sample {
  id: string;
  patient_id: string;
  sample_type: 'blood' | 'tissue' | 'urine' | 'saliva' | 'csf' | 'bone_marrow' | 'cytology';
  collection_date: string;
  received_date: string;
  priority: 'routine' | 'urgent' | 'stat' | 'research';
  status: 'received' | 'processing' | 'analyzed' | 'reported' | 'archived' | 'rejected';
  workflow_id: string;
  tests_ordered: string[];
  barcode: string;
  location: string;
  storage_conditions: string;
}

interface Protocol {
  id: string;
  name: string;
  version: string;
  type: 'sop' | 'method' | 'procedure' | 'guideline';
  category: string;
  steps: ProtocolStep[];
  estimated_time: number;
  quality_controls: QualityControl[];
  validated: boolean;
  approval_date: string;
}

interface ProtocolStep {
  id: string;
  order: number;
  description: string;
  duration: number;
  temperature?: number;
  critical_control_point: boolean;
  automation_level: 'manual' | 'semi_automated' | 'automated';
}

interface QualityControl {
  id: string;
  type: 'positive' | 'negative' | 'blank' | 'standard' | 'duplicate';
  frequency: 'every_batch' | 'daily' | 'weekly' | 'monthly';
  acceptance_criteria: string;
  last_result: 'pass' | 'fail' | 'pending';
  next_due: string;
}

interface TestResult {
  id: string;
  sample_id: string;
  test_name: string;
  result_value: any;
  units: string;
  reference_range: string;
  interpretation: 'normal' | 'abnormal' | 'critical' | 'pending';
  method: string;
  instrument_id: string;
  technologist: string;
  verified_by: string;
  report_date: string;
  turnaround_time: number;
}

interface LabMetrics {
  total_samples: number;
  samples_today: number;
  avg_turnaround: number;
  success_rate: number;
  instrument_uptime: number;
  pending_results: number;
}

const LIMSIntegration: React.FC = () => {
  const [workflows, setWorkflows] = useState<LabWorkflow[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [metrics, setMetrics] = useState<LabMetrics | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLaboratoryData();
    const interval = setInterval(refreshMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadLaboratoryData = async () => {
    try {
      setIsLoading(true);
      
      const mockWorkflows: LabWorkflow[] = [
        {
          id: 'wf_ngs',
          name: 'Next-Generation Sequencing',
          type: 'sequencing',
          status: 'active',
          throughput: 96,
          avg_turnaround: 5.2,
          success_rate: 98.5,
          instruments: [],
          protocols: [],
          current_samples: 24,
          queue_length: 12
        },
        {
          id: 'wf_ihc',
          name: 'Immunohistochemistry',
          type: 'immunohistochemistry',
          status: 'active',
          throughput: 48,
          avg_turnaround: 2.8,
          success_rate: 96.8,
          instruments: [],
          protocols: [],
          current_samples: 18,
          queue_length: 6
        },
        {
          id: 'wf_flow',
          name: 'Flow Cytometry',
          type: 'flow_cytometry',
          status: 'active',
          throughput: 32,
          avg_turnaround: 1.5,
          success_rate: 99.2,
          instruments: [],
          protocols: [],
          current_samples: 8,
          queue_length: 4
        },
        {
          id: 'wf_ms',
          name: 'Mass Spectrometry',
          type: 'mass_spectrometry',
          status: 'maintenance',
          throughput: 24,
          avg_turnaround: 3.2,
          success_rate: 97.5,
          instruments: [],
          protocols: [],
          current_samples: 0,
          queue_length: 15
        },
        {
          id: 'wf_pcr',
          name: 'Quantitative PCR',
          type: 'pcr',
          status: 'active',
          throughput: 96,
          avg_turnaround: 0.8,
          success_rate: 99.8,
          instruments: [],
          protocols: [],
          current_samples: 32,
          queue_length: 8
        }
      ];

      const mockInstruments: Instrument[] = [
        {
          id: 'seq_001',
          name: 'Illumina NovaSeq 6000',
          model: 'NovaSeq 6000',
          type: 'sequencer',
          status: 'online',
          utilization: 85,
          last_calibration: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Lab A - Room 101',
          operating_hours: 2840
        },
        {
          id: 'ms_001',
          name: 'Thermo Q Exactive Plus',
          model: 'Q Exactive Plus',
          type: 'spectrometer',
          status: 'maintenance',
          utilization: 0,
          last_calibration: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date().toISOString(),
          location: 'Lab B - Room 205',
          operating_hours: 3200
        },
        {
          id: 'flow_001',
          name: 'BD FACSCanto II',
          model: 'FACSCanto II',
          type: 'analyzer',
          status: 'online',
          utilization: 72,
          last_calibration: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Lab C - Room 302',
          operating_hours: 1980
        },
        {
          id: 'pcr_001',
          name: 'Applied Biosystems 7500',
          model: '7500 Real-Time PCR',
          type: 'analyzer',
          status: 'online',
          utilization: 95,
          last_calibration: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Lab A - Room 102',
          temperature: 25.2,
          operating_hours: 4200
        },
        {
          id: 'micro_001',
          name: 'Zeiss Axio Observer',
          model: 'Axio Observer 7',
          type: 'microscope',
          status: 'online',
          utilization: 68,
          last_calibration: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          next_maintenance: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Lab D - Room 403',
          operating_hours: 2650
        }
      ];

      const mockSamples: Sample[] = [
        {
          id: 'SPL001',
          patient_id: 'PT12345',
          sample_type: 'tissue',
          collection_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          received_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'urgent',
          status: 'processing',
          workflow_id: 'wf_ngs',
          tests_ordered: ['Comprehensive Genomic Profiling', 'TMB Analysis'],
          barcode: '2024091234567',
          location: 'Freezer A-1',
          storage_conditions: '-80°C'
        },
        {
          id: 'SPL002',
          patient_id: 'PT12346',
          sample_type: 'blood',
          collection_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          received_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          priority: 'stat',
          status: 'analyzed',
          workflow_id: 'wf_flow',
          tests_ordered: ['Minimal Residual Disease', 'Immunophenotyping'],
          barcode: '2024091234568',
          location: 'Refrigerator B-2',
          storage_conditions: '4°C'
        },
        {
          id: 'SPL003',
          patient_id: 'PT12347',
          sample_type: 'tissue',
          collection_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          received_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'routine',
          status: 'reported',
          workflow_id: 'wf_ihc',
          tests_ordered: ['PD-L1 Expression', 'MSI Analysis'],
          barcode: '2024091234569',
          location: 'Archive C-3',
          storage_conditions: 'Room Temperature'
        }
      ];

      const mockProtocols: Protocol[] = [
        {
          id: 'prot_001',
          name: 'Comprehensive Genomic Profiling',
          version: '2.1',
          type: 'sop',
          category: 'Genomics',
          steps: [
            {
              id: 'step_001',
              order: 1,
              description: 'DNA/RNA extraction from FFPE tissue',
              duration: 180,
              critical_control_point: true,
              automation_level: 'semi_automated'
            },
            {
              id: 'step_002',
              order: 2,
              description: 'Quality assessment and quantification',
              duration: 60,
              critical_control_point: true,
              automation_level: 'automated'
            },
            {
              id: 'step_003',
              order: 3,
              description: 'Library preparation',
              duration: 240,
              critical_control_point: true,
              automation_level: 'automated'
            }
          ],
          estimated_time: 480,
          quality_controls: [
            {
              id: 'qc_001',
              type: 'positive',
              frequency: 'every_batch',
              acceptance_criteria: 'DNA concentration >10 ng/μL',
              last_result: 'pass',
              next_due: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          validated: true,
          approval_date: '2024-01-15'
        }
      ];

      const mockTestResults: TestResult[] = [
        {
          id: 'result_001',
          sample_id: 'SPL002',
          test_name: 'Minimal Residual Disease',
          result_value: 0.003,
          units: '%',
          reference_range: '<0.01%',
          interpretation: 'normal',
          method: 'Flow Cytometry',
          instrument_id: 'flow_001',
          technologist: 'J. Smith',
          verified_by: 'Dr. A. Johnson',
          report_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          turnaround_time: 1.2
        },
        {
          id: 'result_002',
          sample_id: 'SPL003',
          test_name: 'PD-L1 Expression',
          result_value: 85,
          units: '% positive cells',
          reference_range: 'Variable',
          interpretation: 'abnormal',
          method: 'Immunohistochemistry',
          instrument_id: 'micro_001',
          technologist: 'M. Davis',
          verified_by: 'Dr. B. Wilson',
          report_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          turnaround_time: 2.8
        }
      ];

      const mockMetrics: LabMetrics = {
        total_samples: 1247,
        samples_today: 28,
        avg_turnaround: 2.8,
        success_rate: 98.2,
        instrument_uptime: 94.5,
        pending_results: 15
      };

      setWorkflows(mockWorkflows);
      setInstruments(mockInstruments);
      setSamples(mockSamples);
      setProtocols(mockProtocols);
      setTestResults(mockTestResults);
      setMetrics(mockMetrics);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load laboratory data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setInstruments(prev => prev.map(instrument => ({
      ...instrument,
      utilization: Math.max(0, Math.min(100, instrument.utilization + (Math.random() - 0.5) * 10)),
      temperature: instrument.temperature ? 
        Math.max(20, Math.min(30, instrument.temperature + (Math.random() - 0.5) * 2)) : 
        undefined
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'calibrating': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'error':
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'sequencing': return <Scan className="h-5 w-5" />;
      case 'immunohistochemistry': return <Microscope className="h-5 w-5" />;
      case 'flow_cytometry': return <Activity className="h-5 w-5" />;
      case 'mass_spectrometry': return <TestTube className="h-5 w-5" />;
      case 'pcr': return <Zap className="h-5 w-5" />;
      default: return <Flask className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      case 'routine': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const workflowPerformance = useMemo(() => {
    return workflows.map(workflow => ({
      name: workflow.name.split(' ')[0],
      throughput: workflow.throughput,
      turnaround: workflow.avg_turnaround,
      success_rate: workflow.success_rate,
      queue: workflow.queue_length
    }));
  }, [workflows]);

  const instrumentUtilization = useMemo(() => {
    return instruments.map(instrument => ({
      name: instrument.name.split(' ')[0],
      utilization: instrument.utilization,
      status: instrument.status,
      uptime: instrument.status === 'online' ? 100 : 0
    }));
  }, [instruments]);

  const sampleStatus = useMemo(() => {
    const statusCounts = samples.reduce((acc, sample) => {
      acc[sample.status] = (acc[sample.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({ status, count }));
  }, [samples]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Laboratory Information Management System
          </h1>
          <p className="text-gray-600 mt-2">
            Integrated workflow management and real-time laboratory operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadLaboratoryData} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-600">Total Samples</p>
                  <p className="text-2xl font-bold text-violet-800">{metrics.total_samples.toLocaleString()}</p>
                  <p className="text-xs text-violet-600">+{metrics.samples_today} today</p>
                </div>
                <TestTube className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Avg Turnaround</p>
                  <p className="text-2xl font-bold text-blue-800">{metrics.avg_turnaround} days</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-800">{metrics.success_rate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Instrument Uptime</p>
                  <p className="text-2xl font-bold text-yellow-800">{metrics.instrument_uptime}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="instruments">Instruments</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {getWorkflowIcon(workflow.type)}
                      <span className="text-lg font-semibold">{workflow.name}</span>
                    </CardTitle>
                    {getStatusIcon(workflow.status)}
                  </div>
                  <Badge variant="secondary" className="w-fit capitalize">{workflow.type.replace('_', ' ')}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Throughput</p>
                      <p className="text-lg font-semibold">{workflow.throughput}/day</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Turnaround</p>
                      <p className="text-lg font-semibold">{workflow.avg_turnaround} days</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Success Rate</p>
                      <p className="text-lg font-semibold">{workflow.success_rate}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Queue Length</p>
                      <p className="text-lg font-semibold">{workflow.queue_length}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Samples:</span>
                      <span className="font-medium">{workflow.current_samples}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Start Batch
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instruments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {instruments.map((instrument) => (
              <Card key={instrument.id} className="border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{instrument.name}</CardTitle>
                    {getStatusIcon(instrument.status)}
                  </div>
                  <p className="text-sm text-gray-600">{instrument.model}</p>
                  <Badge variant="outline" className="w-fit capitalize">{instrument.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilization</span>
                      <span>{instrument.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${instrument.utilization}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Location</p>
                      <p className="text-sm">{instrument.location}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Operating Hours</p>
                      <p className="text-sm">{instrument.operating_hours.toLocaleString()}</p>
                    </div>
                  </div>

                  {instrument.temperature && (
                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <span className="text-sm font-semibold">{instrument.temperature}°C</span>
                    </div>
                  )}

                  <div className="pt-2 border-t text-xs text-gray-500">
                    <p>Last calibration: {new Date(instrument.last_calibration).toLocaleDateString()}</p>
                    <p>Next maintenance: {new Date(instrument.next_maintenance).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5 text-violet-600" />
                <span>Sample Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {samples.map((sample) => (
                  <div key={sample.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{sample.id}</span>
                        <span className="text-sm text-gray-500">Patient: {sample.patient_id}</span>
                      </div>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1 capitalize">{sample.sample_type}</Badge>
                        <span className="text-xs text-gray-500">{sample.barcode}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getPriorityColor(sample.priority)}>
                          {sample.priority}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {sample.tests_ordered.length} test(s)
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">{sample.location}</p>
                        <p className="text-xs text-gray-500">{sample.storage_conditions}</p>
                      </div>
                      
                      <Badge variant={
                        sample.status === 'reported' ? 'default' :
                        sample.status === 'processing' ? 'secondary' :
                        sample.status === 'analyzed' ? 'outline' : 'destructive'
                      }>
                        {sample.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {protocols.map((protocol) => (
              <Card key={protocol.id} className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{protocol.name}</CardTitle>
                    {protocol.validated && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">{protocol.type}</Badge>
                    <Badge variant="outline">v{protocol.version}</Badge>
                    <Badge variant="outline">{protocol.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Steps</p>
                      <p className="text-lg font-semibold">{protocol.steps.length}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Est. Time</p>
                      <p className="text-lg font-semibold">{Math.floor(protocol.estimated_time / 60)}h {protocol.estimated_time % 60}m</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Protocol Steps</p>
                    <div className="space-y-2">
                      {protocol.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <span>{step.order}. {step.description}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{step.duration}min</span>
                            {step.critical_control_point && (
                              <Target className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                      {protocol.steps.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{protocol.steps.length - 3} more steps
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t text-xs text-gray-500">
                    <p>Approved: {new Date(protocol.approval_date).toLocaleDateString()}</p>
                    <p>Quality Controls: {protocol.quality_controls.length}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-violet-600" />
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{result.test_name}</h4>
                        <p className="text-sm text-gray-500">Sample: {result.sample_id}</p>
                      </div>
                      <Badge variant={
                        result.interpretation === 'normal' ? 'default' :
                        result.interpretation === 'abnormal' ? 'destructive' :
                        result.interpretation === 'critical' ? 'destructive' : 'secondary'
                      }>
                        {result.interpretation}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Result</p>
                        <p className="text-lg font-semibold">{result.result_value} {result.units}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Reference Range</p>
                        <p>{result.reference_range}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Method</p>
                        <p>{result.method}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">TAT</p>
                        <p>{result.turnaround_time} days</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      <div className="flex justify-between">
                        <span>Technologist: {result.technologist}</span>
                        <span>Verified by: {result.verified_by}</span>
                        <span>Reported: {new Date(result.report_date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workflowPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="throughput" fill="#8b5cf6" name="Throughput/day" />
                    <Bar dataKey="success_rate" fill="#10b981" name="Success Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sample Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sampleStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                    >
                      {sampleStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Instrument Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={instrumentUtilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="utilization" fill="#06b6d4" name="Utilization %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LIMSIntegration;