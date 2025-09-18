import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Settings,
  Plus,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  Activity,
  Globe,
  Server,
  Link,
  Eye,
  EyeOff,
  Key,
  Users,
  Clock
} from 'lucide-react';

interface SystemIntegration {
  id: string;
  name: string;
  type: 'EHR' | 'LIMS' | 'Pharmacy' | 'API' | 'Database' | 'Cloud';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  protocol: 'FHIR' | 'HL7' | 'REST' | 'SOAP' | 'SQL' | 'GraphQL';
  endpoint: string;
  lastSync: string;
  dataTypes: string[];
  volume: number;
  latency: number;
  errorRate: number;
  uptime: number;
  version?: string;
  authentication: 'OAuth2' | 'API Key' | 'Certificate' | 'Basic Auth';
  encryptionLevel: 'TLS 1.2' | 'TLS 1.3' | 'AES-256' | 'End-to-End';
}

interface DataFlow {
  id: string;
  source: string;
  destination: string;
  dataType: string;
  volume: number;
  frequency: string;
  lastTransfer: string;
  status: 'active' | 'paused' | 'error';
  transformations: string[];
}

interface ComplianceMetric {
  standard: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  score: number;
  requirements: { name: string; met: boolean; description: string }[];
  lastAudit: string;
}

const InteroperabilityManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<SystemIntegration[]>([]);
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [activeTab, setActiveTab] = useState<'systems' | 'dataflows' | 'compliance' | 'monitoring'>('systems');
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<SystemIntegration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInteroperabilityData();
  }, []);

  const loadInteroperabilityData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockIntegrations: SystemIntegration[] = [
        {
          id: '1',
          name: 'Epic EHR System',
          type: 'EHR',
          status: 'connected',
          protocol: 'FHIR',
          endpoint: 'https://api.epic.com/fhir/R4',
          lastSync: '2024-01-15T14:30:00Z',
          dataTypes: ['Patient Data', 'Medications', 'Lab Results', 'Allergies'],
          volume: 15420,
          latency: 245,
          errorRate: 0.02,
          uptime: 99.95,
          version: 'R4',
          authentication: 'OAuth2',
          encryptionLevel: 'TLS 1.3'
        },
        {
          id: '2',
          name: 'Cerner PowerChart',
          type: 'EHR',
          status: 'connected',
          protocol: 'FHIR',
          endpoint: 'https://fhir.cerner.com/r4',
          lastSync: '2024-01-15T14:25:00Z',
          dataTypes: ['Patient Data', 'Orders', 'Results'],
          volume: 8930,
          latency: 312,
          errorRate: 0.05,
          uptime: 99.87,
          version: 'R4',
          authentication: 'OAuth2',
          encryptionLevel: 'TLS 1.3'
        },
        {
          id: '3',
          name: 'Hospital Pharmacy System',
          type: 'Pharmacy',
          status: 'connected',
          protocol: 'HL7',
          endpoint: 'hl7.hospital.local:8080',
          lastSync: '2024-01-15T14:28:00Z',
          dataTypes: ['Dispensing Records', 'Inventory', 'Drug Interactions'],
          volume: 5240,
          latency: 189,
          errorRate: 0.01,
          uptime: 99.99,
          version: 'v2.8',
          authentication: 'Certificate',
          encryptionLevel: 'TLS 1.2'
        },
        {
          id: '4',
          name: 'Laboratory Information System',
          type: 'LIMS',
          status: 'error',
          protocol: 'REST',
          endpoint: 'https://api.labcorp.com/v2',
          lastSync: '2024-01-15T10:15:00Z',
          dataTypes: ['Lab Results', 'Test Orders', 'Reference Ranges'],
          volume: 3450,
          latency: 456,
          errorRate: 2.3,
          uptime: 97.2,
          authentication: 'API Key',
          encryptionLevel: 'TLS 1.2'
        },
        {
          id: '5',
          name: 'Clinical Trials Database',
          type: 'Database',
          status: 'pending',
          protocol: 'GraphQL',
          endpoint: 'https://trials.nih.gov/graphql',
          lastSync: '2024-01-14T22:00:00Z',
          dataTypes: ['Trial Data', 'Eligibility Criteria', 'Outcomes'],
          volume: 1250,
          latency: 567,
          errorRate: 0.15,
          uptime: 98.5,
          authentication: 'API Key',
          encryptionLevel: 'TLS 1.3'
        }
      ];

      const mockDataFlows: DataFlow[] = [
        {
          id: '1',
          source: 'Epic EHR System',
          destination: 'OncoSafeRx Database',
          dataType: 'Patient Demographics',
          volume: 1250,
          frequency: 'Real-time',
          lastTransfer: '2024-01-15T14:30:00Z',
          status: 'active',
          transformations: ['Data Mapping', 'Validation', 'Encryption']
        },
        {
          id: '2',
          source: 'OncoSafeRx Database',
          destination: 'Hospital Pharmacy System',
          dataType: 'Drug Interaction Alerts',
          volume: 340,
          frequency: 'Real-time',
          lastTransfer: '2024-01-15T14:28:00Z',
          status: 'active',
          transformations: ['Alert Formatting', 'Priority Assignment']
        },
        {
          id: '3',
          source: 'Laboratory Information System',
          destination: 'OncoSafeRx Database',
          dataType: 'Lab Results',
          volume: 890,
          frequency: 'Every 15 minutes',
          lastTransfer: '2024-01-15T14:15:00Z',
          status: 'error',
          transformations: ['Unit Conversion', 'Reference Range Mapping']
        }
      ];

      const mockCompliance: ComplianceMetric[] = [
        {
          standard: 'HIPAA',
          status: 'compliant',
          score: 98,
          requirements: [
            { name: 'Data Encryption', met: true, description: 'All data encrypted in transit and at rest' },
            { name: 'Access Controls', met: true, description: 'Role-based access implemented' },
            { name: 'Audit Logs', met: true, description: 'Comprehensive audit logging active' },
            { name: 'Data Minimization', met: false, description: 'Some unnecessary data collection identified' }
          ],
          lastAudit: '2024-01-01'
        },
        {
          standard: 'FHIR R4',
          status: 'compliant',
          score: 95,
          requirements: [
            { name: 'Resource Conformance', met: true, description: 'All resources conform to FHIR R4 spec' },
            { name: 'Security Implementation', met: true, description: 'OAuth2 and SMART on FHIR implemented' },
            { name: 'Terminology Binding', met: true, description: 'Standard terminologies used' },
            { name: 'Capability Statement', met: true, description: 'Accurate capability statement published' }
          ],
          lastAudit: '2024-01-10'
        },
        {
          standard: 'HL7 v2.8',
          status: 'partial',
          score: 82,
          requirements: [
            { name: 'Message Structure', met: true, description: 'Proper HL7 message formatting' },
            { name: 'Acknowledgments', met: true, description: 'ACK/NACK handling implemented' },
            { name: 'Error Handling', met: false, description: 'Enhanced error reporting needed' },
            { name: 'Encoding Standards', met: true, description: 'UTF-8 encoding properly implemented' }
          ],
          lastAudit: '2024-01-05'
        }
      ];

      setIntegrations(mockIntegrations);
      setDataFlows(mockDataFlows);
      setComplianceMetrics(mockCompliance);
    } catch (error) {
      console.error('Error loading interoperability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      connected: { bg: 'bg-green-100', text: 'text-green-800', label: 'Connected' },
      disconnected: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Disconnected' },
      error: { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      paused: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Paused' },
      compliant: { bg: 'bg-green-100', text: 'text-green-800', label: 'Compliant' },
      'non-compliant': { bg: 'bg-red-100', text: 'text-red-800', label: 'Non-Compliant' },
      partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partially Compliant' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disconnected;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EHR': return <Database className="w-5 h-5 text-blue-500" />;
      case 'LIMS': return <Activity className="w-5 h-5 text-purple-500" />;
      case 'Pharmacy': return <Shield className="w-5 h-5 text-green-500" />;
      case 'API': return <Globe className="w-5 h-5 text-orange-500" />;
      case 'Database': return <Server className="w-5 h-5 text-gray-500" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-cyan-500" />;
      default: return <Link className="w-5 h-5 text-gray-400" />;
    }
  };

  const tabs = [
    { id: 'systems', label: 'Connected Systems', icon: Database },
    { id: 'dataflows', label: 'Data Flows', icon: Activity },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'monitoring', label: 'Monitoring', icon: Eye }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Interoperability Manager</h2>
              <p className="text-sm text-gray-600">
                Manage system integrations, data flows, and compliance standards
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={loadInteroperabilityData}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowAddIntegration(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Integration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'systems' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(integration.type)}
                      <div>
                        <h3 className="font-medium text-gray-900">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.type} • {integration.protocol}</p>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(integration.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{integration.uptime}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Latency:</span>
                      <span className="font-medium">{integration.latency}ms</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Daily Volume:</span>
                      <span className="font-medium">{integration.volume.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lock className="w-3 h-3" />
                        <span>{integration.authentication} • {integration.encryptionLevel}</span>
                      </div>
                      <div>Last sync: {new Date(integration.lastSync).toLocaleString()}</div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {integration.dataTypes.slice(0, 3).map((type, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {type}
                        </span>
                      ))}
                      {integration.dataTypes.length > 3 && (
                        <span className="text-xs text-gray-500">+{integration.dataTypes.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedIntegration(integration)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dataflows' && (
          <div className="space-y-4">
            {dataFlows.map((flow) => (
              <div key={flow.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{flow.source}</div>
                      <div className="text-xs text-gray-500">Source</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 border-t border-gray-300"></div>
                      <Activity className="w-4 h-4 text-blue-500" />
                      <div className="w-8 border-t border-gray-300"></div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{flow.destination}</div>
                      <div className="text-xs text-gray-500">Destination</div>
                    </div>
                  </div>
                  {getStatusBadge(flow.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data Type:</span>
                    <p className="font-medium">{flow.dataType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Volume:</span>
                    <p className="font-medium">{flow.volume.toLocaleString()} records</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>
                    <p className="font-medium">{flow.frequency}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Transfer:</span>
                    <p className="font-medium">{new Date(flow.lastTransfer).toLocaleString()}</p>
                  </div>
                </div>
                
                {flow.transformations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Transformations:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {flow.transformations.map((transform, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {transform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {complianceMetrics.map((metric) => (
              <div key={metric.standard} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{metric.standard}</h3>
                      <p className="text-sm text-gray-600">Last audit: {new Date(metric.lastAudit).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{metric.score}%</div>
                    {getStatusBadge(metric.status)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {metric.requirements.map((req, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      {req.met ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{req.name}</div>
                        <div className="text-sm text-gray-600">{req.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {integrations.filter(i => i.status === 'connected').length}
                    </div>
                    <div className="text-sm text-green-700">Connected Systems</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-900">
                      {integrations.filter(i => i.status === 'error' || i.status === 'pending').length}
                    </div>
                    <div className="text-sm text-yellow-700">Issues Detected</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {dataFlows.filter(f => f.status === 'active').length}
                    </div>
                    <div className="text-sm text-blue-700">Active Data Flows</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health Overview</h3>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(integration.type)}
                      <span className="font-medium">{integration.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{integration.uptime}%</div>
                        <div className="text-gray-500">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{integration.latency}ms</div>
                        <div className="text-gray-500">Latency</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{integration.errorRate}%</div>
                        <div className="text-gray-500">Error Rate</div>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteroperabilityManager;