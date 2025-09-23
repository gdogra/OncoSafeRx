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
  Globe,
  Database,
  Network,
  Share2,
  Shield,
  Zap,
  Activity,
  Users,
  Building,
  Lock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Server,
  CloudLightning,
  Wifi,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

interface DataNetwork {
  id: string;
  name: string;
  type: 'clinical_trial' | 'real_world' | 'genomic' | 'pharmaceutical' | 'academic' | 'regulatory' | 'biobank' | 'registry';
  region: string;
  status: 'active' | 'syncing' | 'error' | 'maintenance';
  data_types: string[];
  patient_count: number;
  last_sync: string;
  api_endpoint: string;
  security_level: 'public' | 'restricted' | 'private' | 'classified';
  integration_score: number;
  data_quality: number;
  compliance: {
    hipaa: boolean;
    gdpr: boolean;
    gcp: boolean;
    iso27001: boolean;
  };
  metrics: {
    uptime: number;
    latency: number;
    throughput: number;
    error_rate: number;
  };
}

interface DataFlow {
  source: string;
  target: string;
  data_type: string;
  volume: number;
  frequency: 'real-time' | 'hourly' | 'daily' | 'weekly';
  status: 'active' | 'paused' | 'error';
  encryption: boolean;
}

interface SyncTask {
  id: string;
  network: string;
  data_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  start_time: string;
  estimated_completion: string;
  records_processed: number;
  total_records: number;
}

interface FederatedQuery {
  id: string;
  query: string;
  networks: string[];
  status: 'pending' | 'executing' | 'completed' | 'failed';
  results_count: number;
  execution_time: number;
  privacy_preserved: boolean;
}

interface NetworkMetrics {
  total_networks: number;
  total_patients: number;
  data_volume_gb: number;
  active_connections: number;
  avg_query_time: number;
  uptime_percentage: number;
}

const GlobalDataNetworks: React.FC = () => {
  const [networks, setNetworks] = useState<DataNetwork[]>([]);
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [federatedQueries, setFederatedQueries] = useState<FederatedQuery[]>([]);
  const [metrics, setMetrics] = useState<NetworkMetrics | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNetworkData();
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNetworkData = async () => {
    try {
      setIsLoading(true);
      
      const mockNetworks: DataNetwork[] = [
        {
          id: 'cbioportal',
          name: 'cBioPortal',
          type: 'genomic',
          region: 'Global',
          status: 'active',
          data_types: ['Mutations', 'Copy Number', 'Expression', 'Clinical'],
          patient_count: 125000,
          last_sync: new Date(Date.now() - 15 * 60000).toISOString(),
          api_endpoint: 'https://www.cbioportal.org/api',
          security_level: 'public',
          integration_score: 98,
          data_quality: 95,
          compliance: { hipaa: false, gdpr: true, gcp: true, iso27001: true },
          metrics: { uptime: 99.8, latency: 120, throughput: 1500, error_rate: 0.2 }
        },
        {
          id: 'tcga',
          name: 'The Cancer Genome Atlas',
          type: 'genomic',
          region: 'North America',
          status: 'active',
          data_types: ['WGS', 'RNA-Seq', 'Methylation', 'Clinical', 'Pathology'],
          patient_count: 33000,
          last_sync: new Date(Date.now() - 5 * 60000).toISOString(),
          api_endpoint: 'https://api.gdc.cancer.gov',
          security_level: 'restricted',
          integration_score: 96,
          data_quality: 98,
          compliance: { hipaa: true, gdpr: false, gcp: true, iso27001: true },
          metrics: { uptime: 99.9, latency: 95, throughput: 2000, error_rate: 0.1 }
        },
        {
          id: 'flatiron',
          name: 'Flatiron Health',
          type: 'real_world',
          region: 'North America',
          status: 'syncing',
          data_types: ['EHR', 'Treatments', 'Outcomes', 'Biomarkers'],
          patient_count: 280000,
          last_sync: new Date(Date.now() - 60 * 60000).toISOString(),
          api_endpoint: 'https://api.flatiron.com',
          security_level: 'private',
          integration_score: 92,
          data_quality: 94,
          compliance: { hipaa: true, gdpr: false, gcp: true, iso27001: true },
          metrics: { uptime: 99.5, latency: 200, throughput: 800, error_rate: 0.5 }
        },
        {
          id: 'seer',
          name: 'SEER Database',
          type: 'registry',
          region: 'North America',
          status: 'active',
          data_types: ['Incidence', 'Survival', 'Demographics', 'Staging'],
          patient_count: 850000,
          last_sync: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
          api_endpoint: 'https://seer.cancer.gov/api',
          security_level: 'public',
          integration_score: 89,
          data_quality: 96,
          compliance: { hipaa: false, gdpr: false, gcp: true, iso27001: false },
          metrics: { uptime: 99.2, latency: 300, throughput: 500, error_rate: 0.8 }
        },
        {
          id: 'icgc',
          name: 'International Cancer Genome Consortium',
          type: 'genomic',
          region: 'Global',
          status: 'active',
          data_types: ['WGS', 'Transcriptome', 'Epigenome', 'Clinical'],
          patient_count: 75000,
          last_sync: new Date(Date.now() - 30 * 60000).toISOString(),
          api_endpoint: 'https://dcc.icgc.org/api',
          security_level: 'restricted',
          integration_score: 94,
          data_quality: 97,
          compliance: { hipaa: false, gdpr: true, gcp: true, iso27001: true },
          metrics: { uptime: 99.7, latency: 150, throughput: 1200, error_rate: 0.3 }
        },
        {
          id: 'clinicaltrials',
          name: 'ClinicalTrials.gov',
          type: 'clinical_trial',
          region: 'Global',
          status: 'active',
          data_types: ['Protocols', 'Results', 'Participants', 'Outcomes'],
          patient_count: 2500000,
          last_sync: new Date(Date.now() - 10 * 60000).toISOString(),
          api_endpoint: 'https://clinicaltrials.gov/api',
          security_level: 'public',
          integration_score: 87,
          data_quality: 85,
          compliance: { hipaa: false, gdpr: true, gcp: false, iso27001: false },
          metrics: { uptime: 98.9, latency: 250, throughput: 600, error_rate: 1.1 }
        }
      ];

      const mockDataFlows: DataFlow[] = [
        { source: 'tcga', target: 'oncosaferx', data_type: 'genomic', volume: 1200, frequency: 'daily', status: 'active', encryption: true },
        { source: 'cbioportal', target: 'oncosaferx', data_type: 'mutations', volume: 800, frequency: 'real-time', status: 'active', encryption: true },
        { source: 'flatiron', target: 'oncosaferx', data_type: 'clinical', volume: 2400, frequency: 'hourly', status: 'active', encryption: true },
        { source: 'seer', target: 'oncosaferx', data_type: 'epidemiology', volume: 400, frequency: 'weekly', status: 'active', encryption: false },
        { source: 'icgc', target: 'oncosaferx', data_type: 'multi-omics', volume: 1600, frequency: 'daily', status: 'active', encryption: true },
        { source: 'clinicaltrials', target: 'oncosaferx', data_type: 'trials', volume: 600, frequency: 'daily', status: 'active', encryption: false }
      ];

      const mockSyncTasks: SyncTask[] = [
        {
          id: 'sync_001',
          network: 'flatiron',
          data_type: 'clinical',
          status: 'running',
          progress: 65,
          start_time: new Date(Date.now() - 45 * 60000).toISOString(),
          estimated_completion: new Date(Date.now() + 25 * 60000).toISOString(),
          records_processed: 182000,
          total_records: 280000
        },
        {
          id: 'sync_002',
          network: 'tcga',
          data_type: 'genomic',
          status: 'completed',
          progress: 100,
          start_time: new Date(Date.now() - 120 * 60000).toISOString(),
          estimated_completion: new Date(Date.now() - 15 * 60000).toISOString(),
          records_processed: 33000,
          total_records: 33000
        },
        {
          id: 'sync_003',
          network: 'cbioportal',
          data_type: 'mutations',
          status: 'pending',
          progress: 0,
          start_time: new Date(Date.now() + 30 * 60000).toISOString(),
          estimated_completion: new Date(Date.now() + 90 * 60000).toISOString(),
          records_processed: 0,
          total_records: 125000
        }
      ];

      const mockFederatedQueries: FederatedQuery[] = [
        {
          id: 'fq_001',
          query: 'SELECT * FROM patients WHERE cancer_type = "NSCLC" AND mutation = "EGFR"',
          networks: ['tcga', 'cbioportal', 'flatiron'],
          status: 'completed',
          results_count: 8432,
          execution_time: 2.4,
          privacy_preserved: true
        },
        {
          id: 'fq_002',
          query: 'SELECT survival_data FROM trials WHERE drug = "pembrolizumab"',
          networks: ['clinicaltrials', 'flatiron', 'seer'],
          status: 'executing',
          results_count: 0,
          execution_time: 0,
          privacy_preserved: true
        }
      ];

      const mockMetrics: NetworkMetrics = {
        total_networks: 6,
        total_patients: 3863000,
        data_volume_gb: 45600,
        active_connections: 24,
        avg_query_time: 1.8,
        uptime_percentage: 99.4
      };

      setNetworks(mockNetworks);
      setDataFlows(mockDataFlows);
      setSyncTasks(mockSyncTasks);
      setFederatedQueries(mockFederatedQueries);
      setMetrics(mockMetrics);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load network data');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = async () => {
    setNetworks(prev => prev.map(network => ({
      ...network,
      metrics: {
        ...network.metrics,
        uptime: Math.max(95, Math.min(100, network.metrics.uptime + (Math.random() - 0.5) * 0.2)),
        latency: Math.max(50, network.metrics.latency + (Math.random() - 0.5) * 20),
        throughput: Math.max(0, network.metrics.throughput + (Math.random() - 0.5) * 100),
        error_rate: Math.max(0, Math.min(5, network.metrics.error_rate + (Math.random() - 0.5) * 0.2))
      }
    })));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'public': return <Globe className="h-4 w-4 text-green-500" />;
      case 'restricted': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'private': return <Lock className="h-4 w-4 text-red-500" />;
      case 'classified': return <Lock className="h-4 w-4 text-red-800" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const networkTypesData = useMemo(() => {
    const types = networks.reduce((acc, network) => {
      acc[network.type] = (acc[network.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(types).map(([type, count]) => ({ type, count }));
  }, [networks]);

  const regionDistribution = useMemo(() => {
    const regions = networks.reduce((acc, network) => {
      acc[network.region] = (acc[network.region] || 0) + network.patient_count;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(regions).map(([region, patients]) => ({ region, patients }));
  }, [networks]);

  const performanceMetrics = useMemo(() => {
    return networks.map(network => ({
      name: network.name.split(' ')[0],
      uptime: network.metrics.uptime,
      latency: network.metrics.latency,
      throughput: network.metrics.throughput,
      integration_score: network.integration_score
    }));
  }, [networks]);

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
            Global Data Networks
          </h1>
          <p className="text-gray-600 mt-2">
            Federated access to worldwide cancer research and clinical data
          </p>
        </div>
        <Button onClick={loadNetworkData} className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Networks
        </Button>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-600">Total Networks</p>
                  <p className="text-2xl font-bold text-violet-800">{metrics.total_networks}</p>
                </div>
                <Network className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Patients</p>
                  <p className="text-2xl font-bold text-blue-800">{metrics.total_patients.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Data Volume</p>
                  <p className="text-2xl font-bold text-green-800">{metrics.data_volume_gb.toLocaleString()} GB</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Avg Uptime</p>
                  <p className="text-2xl font-bold text-yellow-800">{metrics.uptime_percentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="networks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="networks">Networks</TabsTrigger>
          <TabsTrigger value="flows">Data Flows</TabsTrigger>
          <TabsTrigger value="sync">Synchronization</TabsTrigger>
          <TabsTrigger value="federated">Federated Queries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="networks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {networks.map((network) => (
              <Card key={network.id} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{network.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getSecurityIcon(network.security_level)}
                      {getStatusIcon(network.status)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="capitalize">{network.type}</Badge>
                    <Badge variant="outline">{network.region}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Patients</p>
                      <p className="text-lg font-semibold">{network.patient_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Integration Score</p>
                      <p className="text-lg font-semibold">{network.integration_score}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Data Quality</p>
                      <p className="text-lg font-semibold">{network.data_quality}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Uptime</p>
                      <p className="text-lg font-semibold">{network.metrics.uptime.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Data Types</p>
                    <div className="flex flex-wrap gap-1">
                      {network.data_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-2">Compliance</p>
                    <div className="flex space-x-2">
                      {Object.entries(network.compliance).map(([standard, compliant]) => (
                        <Badge
                          key={standard}
                          variant={compliant ? "default" : "secondary"}
                          className={`text-xs ${compliant ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {standard.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      Last sync: {new Date(network.last_sync).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-violet-600" />
                <span>Active Data Flows</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataFlows.map((flow, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{flow.source}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">OncoSafeRx</span>
                      </div>
                      <Badge variant="outline">{flow.data_type}</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{flow.volume} MB/day</p>
                        <p className="text-xs text-gray-500 capitalize">{flow.frequency}</p>
                      </div>
                      {flow.encryption && <Lock className="h-4 w-4 text-green-500" />}
                      <Badge variant={flow.status === 'active' ? 'default' : 'secondary'}>
                        {flow.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-violet-600" />
                <span>Synchronization Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">{task.network} - {task.data_type}</p>
                        <p className="text-sm text-gray-500">
                          {task.records_processed.toLocaleString()} / {task.total_records.toLocaleString()} records
                        </p>
                      </div>
                      <Badge variant={
                        task.status === 'completed' ? 'default' :
                        task.status === 'running' ? 'secondary' :
                        task.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {task.status}
                      </Badge>
                    </div>
                    {task.status === 'running' && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          ETA: {new Date(task.estimated_completion).toLocaleTimeString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="federated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CloudLightning className="h-5 w-5 text-violet-600" />
                <span>Federated Queries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {federatedQueries.map((query) => (
                  <div key={query.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <code className="text-sm bg-gray-100 p-2 rounded block mb-2">
                          {query.query}
                        </code>
                        <div className="flex items-center space-x-2">
                          {query.networks.map((network) => (
                            <Badge key={network} variant="outline" className="text-xs">
                              {network}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant={
                        query.status === 'completed' ? 'default' :
                        query.status === 'executing' ? 'secondary' :
                        query.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {query.status}
                      </Badge>
                    </div>
                    {query.status === 'completed' && (
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span>Results: {query.results_count.toLocaleString()}</span>
                          <span>Time: {query.execution_time}s</span>
                        </div>
                        {query.privacy_preserved && (
                          <div className="flex items-center space-x-1 text-green-600">
                            <Shield className="h-4 w-4" />
                            <span>Privacy Preserved</span>
                          </div>
                        )}
                      </div>
                    )}
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
                <CardTitle>Network Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={networkTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                    >
                      {networkTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patient Distribution by Region</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Patients']} />
                    <Bar dataKey="patients" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Network Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="#10b981" 
                      name="Uptime (%)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="integration_score" 
                      stroke="#8b5cf6" 
                      name="Integration Score"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalDataNetworks;