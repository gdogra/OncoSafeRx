import React, { useState, useEffect } from 'react';
import { ehrIntegrationService, EHRSystem, FHIRTransformService } from '../../services/ehrIntegration';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  Link2, 
  Database, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Monitor,
  Key,
  Shield,
  Globe,
  Server,
  Cloud,
  Zap,
  Activity,
  FileText,
  Users,
  Pill,
  TestTube,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  Clock,
  CheckSquare,
  Eye,
  EyeOff
} from 'lucide-react';

interface ConnectionStatus {
  connected: boolean;
  system?: EHRSystem;
  token?: boolean;
  lastSync?: Date;
  syncedRecords?: {
    patients: number;
    medications: number;
    labResults: number;
    allergies: number;
    conditions: number;
  };
}

interface SyncOperation {
  id: string;
  type: 'full' | 'incremental' | 'patient' | 'medications' | 'labs';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  recordsProcessed: number;
  recordsTotal: number;
  errors: string[];
}

const EHRIntegrationDashboard: React.FC = () => {
  const [ehrSystems, setEHRSystems] = useState<EHRSystem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({ connected: false });
  const [selectedEHR, setSelectedEHR] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({
    clientId: '',
    clientSecret: '',
    apiKey: '',
    endpoint: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState<string>('');
  const [syncOperations, setSyncOperations] = useState<SyncOperation[]>([]);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(300); // 5 minutes

  useEffect(() => {
    loadEHRSystems();
    loadConnectionStatus();
    
    // Set up auto-sync if enabled
    if (isAutoSync && connectionStatus.connected) {
      const interval = setInterval(() => {
        performIncrementalSync();
      }, syncInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [isAutoSync, syncInterval, connectionStatus.connected]);

  const loadEHRSystems = () => {
    const systems = ehrIntegrationService.getAvailableEHRSystems();
    setEHRSystems(systems);
  };

  const loadConnectionStatus = () => {
    const status = ehrIntegrationService.getConnectionStatus();
    setConnectionStatus({
      ...status,
      lastSync: new Date(Date.now() - Math.random() * 3600000), // Random time in last hour
      syncedRecords: {
        patients: Math.floor(Math.random() * 1000) + 500,
        medications: Math.floor(Math.random() * 5000) + 2000,
        labResults: Math.floor(Math.random() * 10000) + 5000,
        allergies: Math.floor(Math.random() * 500) + 200,
        conditions: Math.floor(Math.random() * 2000) + 1000
      }
    });
  };

  const handleConnect = async () => {
    if (!selectedEHR) return;
    
    setIsConnecting(true);
    try {
      const success = await ehrIntegrationService.connectToEHR(selectedEHR, credentials);
      if (success) {
        loadConnectionStatus();
        // Start initial sync
        await performFullSync();
      } else {
        // Handle OAuth2 redirect or show error
        console.log('Connection requires additional authentication steps');
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    ehrIntegrationService.disconnect();
    loadConnectionStatus();
    setSyncOperations([]);
  };

  const handleTestConnection = async (ehrId: string) => {
    setIsTesting(ehrId);
    try {
      const success = await ehrIntegrationService.testConnection(ehrId);
      console.log(`Test connection to ${ehrId}: ${success ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('Test connection failed:', error);
    } finally {
      setIsTesting('');
      loadEHRSystems();
    }
  };

  const performFullSync = async () => {
    const operation: SyncOperation = {
      id: Date.now().toString(),
      type: 'full',
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsTotal: 1000, // Estimated
      errors: []
    };

    setSyncOperations(prev => [operation, ...prev]);

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncOperations(prev => prev.map(op => {
        if (op.id === operation.id && op.status === 'running') {
          const newProcessed = Math.min(op.recordsProcessed + Math.floor(Math.random() * 50) + 10, op.recordsTotal);
          if (newProcessed >= op.recordsTotal) {
            return {
              ...op,
              status: 'completed',
              recordsProcessed: newProcessed,
              endTime: new Date()
            };
          }
          return { ...op, recordsProcessed: newProcessed };
        }
        return op;
      }));
    }, 1000);

    // Complete after simulation
    setTimeout(() => {
      clearInterval(interval);
      loadConnectionStatus();
    }, 10000);
  };

  const performIncrementalSync = async () => {
    if (!connectionStatus.connected) return;

    const operation: SyncOperation = {
      id: Date.now().toString(),
      type: 'incremental',
      status: 'running',
      startTime: new Date(),
      recordsProcessed: 0,
      recordsTotal: Math.floor(Math.random() * 100) + 20,
      errors: []
    };

    setSyncOperations(prev => [operation, ...prev.slice(0, 9)]); // Keep last 10 operations

    // Simulate quick incremental sync
    setTimeout(() => {
      setSyncOperations(prev => prev.map(op => {
        if (op.id === operation.id) {
          return {
            ...op,
            status: 'completed',
            recordsProcessed: op.recordsTotal,
            endTime: new Date()
          };
        }
        return op;
      }));
      loadConnectionStatus();
    }, 3000);
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'testing': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-50 border-green-200';
      case 'testing': return 'bg-blue-50 border-blue-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EHR Integration Dashboard</h1>
              <p className="text-gray-600">
                Connect OncoSafeRx with your Electronic Health Record system
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {connectionStatus.connected && (
              <button
                onClick={performFullSync}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Full Sync</span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Connection Status */}
      {connectionStatus.connected && (
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Connected to {connectionStatus.system?.name}</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{connectionStatus.syncedRecords?.patients || 0}</div>
              <div className="text-sm text-gray-600">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{connectionStatus.syncedRecords?.medications || 0}</div>
              <div className="text-sm text-gray-600">Medications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{connectionStatus.syncedRecords?.labResults || 0}</div>
              <div className="text-sm text-gray-600">Lab Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{connectionStatus.syncedRecords?.allergies || 0}</div>
              <div className="text-sm text-gray-600">Allergies</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Last sync: {connectionStatus.lastSync?.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isAutoSync}
                    onChange={(e) => setIsAutoSync(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-600">Auto-sync</span>
                </label>
                {isAutoSync && (
                  <select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value={60}>1 min</option>
                    <option value={300}>5 min</option>
                    <option value={900}>15 min</option>
                    <option value={3600}>1 hour</option>
                  </select>
                )}
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Disconnect
            </button>
          </div>
        </Card>
      )}

      {/* Available EHR Systems */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <Database className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Available EHR Systems</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ehrSystems.map((system) => (
            <div key={system.id} className={`border rounded-lg p-4 ${getSystemStatusColor(system.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSystemStatusIcon(system.status)}
                  <h3 className="font-semibold text-gray-900">{system.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleTestConnection(system.id)}
                    disabled={isTesting === system.id}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Test Connection"
                  >
                    {isTesting === system.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedEHR(selectedEHR === system.id ? '' : system.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{system.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FHIR:</span>
                  <span className="font-medium">{system.fhirVersion || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auth:</span>
                  <span className="font-medium capitalize">{system.authType.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-1">Capabilities:</div>
                <div className="flex flex-wrap gap-1">
                  {system.capabilities.slice(0, 3).map((cap, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 text-xs rounded ${
                        cap.supported ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {cap.feature.replace('_', ' ')}
                    </span>
                  ))}
                  {system.capabilities.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{system.capabilities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {selectedEHR === system.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    {system.authType === 'oauth2' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Client ID</label>
                          <input
                            type="text"
                            value={credentials.clientId}
                            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                            placeholder="Enter client ID"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Client Secret</label>
                          <div className="relative">
                            <input
                              type={showCredentials ? 'text' : 'password'}
                              value={credentials.clientSecret}
                              onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                              className="w-full text-sm border border-gray-300 rounded px-2 py-1 pr-8"
                              placeholder="Enter client secret"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCredentials(!showCredentials)}
                              className="absolute right-2 top-1 text-gray-400 hover:text-gray-600"
                            >
                              {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {system.authType === 'api_key' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">API Key</label>
                        <div className="relative">
                          <input
                            type={showCredentials ? 'text' : 'password'}
                            value={credentials.apiKey}
                            onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 pr-8"
                            placeholder="Enter API key"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCredentials(!showCredentials)}
                            className="absolute right-2 top-1 text-gray-400 hover:text-gray-600"
                          >
                            {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Endpoint (Optional)</label>
                      <input
                        type="url"
                        value={credentials.endpoint}
                        onChange={(e) => setCredentials(prev => ({ ...prev, endpoint: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                        placeholder={system.apiEndpoint || "Enter custom endpoint"}
                      />
                    </div>

                    <button
                      onClick={handleConnect}
                      disabled={isConnecting || connectionStatus.connected}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Sync Operations History */}
      {syncOperations.length > 0 && (
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <RefreshCw className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Sync Operations</h2>
          </div>

          <div className="space-y-4">
            {syncOperations.map((operation) => (
              <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getSyncStatusIcon(operation.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{operation.type} Sync</h3>
                      <p className="text-sm text-gray-600">
                        Started: {operation.startTime.toLocaleTimeString()}
                        {operation.endTime && ` • Duration: ${formatDuration(operation.startTime, operation.endTime)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {operation.recordsProcessed} / {operation.recordsTotal} records
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((operation.recordsProcessed / operation.recordsTotal) * 100)}% complete
                    </div>
                  </div>
                </div>

                {operation.status === 'running' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(operation.recordsProcessed / operation.recordsTotal) * 100}%` }}
                    ></div>
                  </div>
                )}

                {operation.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Errors:</h4>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {operation.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Integration Documentation */}
      <Card>
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="w-6 h-6 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">Integration Documentation</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">FHIR R4 Support</h3>
            <p className="text-sm text-gray-600 mb-3">
              Full support for FHIR R4 resources including Patient, Medication, Observation, and more.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>View FHIR Documentation</span>
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">SMART on FHIR</h3>
            <p className="text-sm text-gray-600 mb-3">
              Launch OncoSafeRx directly from your EHR with patient context using SMART on FHIR.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>SMART Launch Guide</span>
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">CDS Hooks</h3>
            <p className="text-sm text-gray-600 mb-3">
              Real-time clinical decision support integration with medication ordering workflows.
            </p>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>CDS Hooks Setup</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EHRIntegrationDashboard;