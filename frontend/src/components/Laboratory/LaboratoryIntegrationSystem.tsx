import React, { useState, useEffect } from 'react';
import { 
  TestTube, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock,
  User,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Filter,
  Search,
  BarChart3,
  LineChart,
  Zap,
  Bell,
  Eye,
  Plus,
  ArrowRight,
  Target,
  Shield
} from 'lucide-react';

interface LabResult {
  id: string;
  testName: string;
  testCode: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical-high' | 'critical-low' | 'abnormal';
  collectionDate: string;
  resultDate: string;
  patientId: string;
  patientName: string;
  orderingPhysician: string;
  laboratory: string;
  methodology: string;
  comments?: string;
}

interface LabAlert {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  currentValue: number | string;
  previousValue?: number | string;
  unit: string;
  alertType: 'critical' | 'trending' | 'drug-interaction' | 'protocol-deviation';
  severity: 'immediate' | 'urgent' | 'routine';
  message: string;
  recommendations: string[];
  triggeredDate: string;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  relatedMedications: string[];
  protocolReference?: string;
}

interface LabMonitoringRule {
  id: string;
  name: string;
  description: string;
  testCodes: string[];
  conditions: MonitoringCondition[];
  alertThresholds: AlertThreshold[];
  frequency: string;
  enabled: boolean;
  associatedDrugs: string[];
  cancerTypes: string[];
  createdBy: string;
  lastModified: string;
}

interface MonitoringCondition {
  parameter: string;
  operator: 'greater_than' | 'less_than' | 'equals' | 'range' | 'change_rate';
  value: number | string;
  timeframe?: string;
}

interface AlertThreshold {
  severity: 'immediate' | 'urgent' | 'routine';
  condition: MonitoringCondition;
  message: string;
  recommendations: string[];
}

interface LabSystem {
  id: string;
  name: string;
  type: 'LIS' | 'EMR' | 'LIMS';
  vendor: string;
  version: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  testsSupported: string[];
  hl7Support: boolean;
  fhirSupport: boolean;
  apiEndpoint?: string;
}

const LaboratoryIntegrationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'results' | 'alerts' | 'monitoring' | 'systems'>('dashboard');
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [labAlerts, setLabAlerts] = useState<LabAlert[]>([]);
  const [monitoringRules, setMonitoringRules] = useState<LabMonitoringRule[]>([]);
  const [labSystems, setLabSystems] = useState<LabSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    initializeLaboratoryData();
  }, []);

  const acknowledgeAlert = (alertId: string) => {
    setLabAlerts(prev => prev.map(alert => 
      alert.id === alertId
        ? {
            ...alert,
            acknowledgedBy: 'Current User', // In real app, get from auth context
            acknowledgedDate: new Date().toISOString()
          }
        : alert
    ));
  };

  const initializeLaboratoryData = () => {
    setLoading(true);
    
    setTimeout(() => {
      setLabSystems([
        {
          id: 'cerner-lab',
          name: 'Cerner PowerChart Lab',
          type: 'LIS',
          vendor: 'Oracle Cerner',
          version: '2023.1',
          connectionStatus: 'connected',
          lastSync: '2024-01-20T14:30:00Z',
          testsSupported: ['CBC', 'CMP', 'LFT', 'Coag', 'Tumor Markers'],
          hl7Support: true,
          fhirSupport: true,
          apiEndpoint: 'https://lab.cerner.com/api/v1'
        },
        {
          id: 'epic-lab',
          name: 'Epic Beaker Laboratory',
          type: 'LIS',
          vendor: 'Epic Systems',
          version: '2023',
          connectionStatus: 'connected',
          lastSync: '2024-01-20T14:25:00Z',
          testsSupported: ['Chemistry', 'Hematology', 'Microbiology', 'Molecular'],
          hl7Support: true,
          fhirSupport: true,
          apiEndpoint: 'https://lab.epic.com/api/fhir/r4'
        },
        {
          id: 'labcorp-connect',
          name: 'LabCorp Connect',
          type: 'LIMS',
          vendor: 'Laboratory Corporation of America',
          version: '3.2',
          connectionStatus: 'syncing',
          lastSync: '2024-01-20T13:45:00Z',
          testsSupported: ['Genomics', 'Pharmacogenomics', 'Biomarkers'],
          hl7Support: true,
          fhirSupport: false
        }
      ]);

      setLabResults([
        {
          id: 'result-001',
          testName: 'White Blood Cell Count',
          testCode: 'WBC',
          value: 2.1,
          unit: 'K/uL',
          referenceRange: '4.0-11.0',
          status: 'critical-low',
          collectionDate: '2024-01-20T08:00:00Z',
          resultDate: '2024-01-20T10:30:00Z',
          patientId: 'patient-123',
          patientName: 'Sarah Chen',
          orderingPhysician: 'Dr. Michael Park',
          laboratory: 'Epic Beaker Laboratory',
          methodology: 'Flow Cytometry',
          comments: 'Repeat in 24 hours if on chemotherapy'
        },
        {
          id: 'result-002',
          testName: 'Alanine Aminotransferase',
          testCode: 'ALT',
          value: 145,
          unit: 'U/L',
          referenceRange: '7-56',
          status: 'high',
          collectionDate: '2024-01-20T08:00:00Z',
          resultDate: '2024-01-20T10:15:00Z',
          patientId: 'patient-456',
          patientName: 'James Wilson',
          orderingPhysician: 'Dr. Lisa Rodriguez',
          laboratory: 'Cerner PowerChart Lab',
          methodology: 'Enzymatic',
          comments: 'Monitor hepatotoxicity'
        },
        {
          id: 'result-003',
          testName: 'Creatinine',
          testCode: 'CREAT',
          value: 2.8,
          unit: 'mg/dL',
          referenceRange: '0.7-1.3',
          status: 'critical-high',
          collectionDate: '2024-01-20T07:30:00Z',
          resultDate: '2024-01-20T09:45:00Z',
          patientId: 'patient-789',
          patientName: 'Maria Garcia',
          orderingPhysician: 'Dr. Sarah Chen',
          laboratory: 'Epic Beaker Laboratory',
          methodology: 'Jaffe Method'
        },
        {
          id: 'result-004',
          testName: 'CA 19-9',
          testCode: 'CA199',
          value: 450,
          unit: 'U/mL',
          referenceRange: '<37',
          status: 'critical-high',
          collectionDate: '2024-01-19T08:00:00Z',
          resultDate: '2024-01-19T16:00:00Z',
          patientId: 'patient-321',
          patientName: 'Robert Kim',
          orderingPhysician: 'Dr. Michael Park',
          laboratory: 'LabCorp Connect',
          methodology: 'Chemiluminescent Immunoassay'
        }
      ]);

      setLabAlerts([
        {
          id: 'alert-001',
          patientId: 'patient-123',
          patientName: 'Sarah Chen',
          testName: 'White Blood Cell Count',
          currentValue: 2.1,
          previousValue: 3.8,
          unit: 'K/uL',
          alertType: 'critical',
          severity: 'immediate',
          message: 'Critical neutropenia detected - immediate intervention required',
          recommendations: [
            'Hold chemotherapy',
            'Consider G-CSF support',
            'Monitor for infection signs',
            'Repeat CBC in 24 hours'
          ],
          triggeredDate: '2024-01-20T10:30:00Z',
          relatedMedications: ['Carboplatin', 'Paclitaxel'],
          protocolReference: 'NCCN Guidelines - Myelosuppression Management'
        },
        {
          id: 'alert-002',
          patientId: 'patient-789',
          patientName: 'Maria Garcia',
          testName: 'Creatinine',
          currentValue: 2.8,
          previousValue: 1.2,
          unit: 'mg/dL',
          alertType: 'drug-interaction',
          severity: 'immediate',
          message: 'Acute kidney injury - nephrotoxic drug detected',
          recommendations: [
            'Hold cisplatin immediately',
            'Assess hydration status',
            'Consider dose reduction if resuming',
            'Nephrology consultation'
          ],
          triggeredDate: '2024-01-20T09:45:00Z',
          relatedMedications: ['Cisplatin'],
          protocolReference: 'FDA Drug Label - Cisplatin Nephrotoxicity'
        },
        {
          id: 'alert-003',
          patientId: 'patient-456',
          patientName: 'James Wilson',
          testName: 'ALT',
          currentValue: 145,
          previousValue: 35,
          unit: 'U/L',
          alertType: 'trending',
          severity: 'urgent',
          message: 'Rising liver enzymes - hepatotoxicity monitoring needed',
          recommendations: [
            'Check total bilirubin',
            'Review hepatotoxic medications',
            'Consider dose modification',
            'Repeat LFTs in 48-72 hours'
          ],
          triggeredDate: '2024-01-20T10:15:00Z',
          relatedMedications: ['Methotrexate', 'Imatinib']
        }
      ]);

      setMonitoringRules([
        {
          id: 'rule-001',
          name: 'Chemotherapy-Induced Neutropenia',
          description: 'Monitor for severe neutropenia in patients receiving myelosuppressive chemotherapy',
          testCodes: ['WBC', 'ANC', 'PLT'],
          conditions: [
            { parameter: 'WBC', operator: 'less_than', value: 3.0 },
            { parameter: 'ANC', operator: 'less_than', value: 1.0 }
          ],
          alertThresholds: [
            {
              severity: 'immediate',
              condition: { parameter: 'ANC', operator: 'less_than', value: 0.5 },
              message: 'Severe neutropenia - immediate intervention required',
              recommendations: ['Hold chemotherapy', 'G-CSF support', 'Infection monitoring']
            }
          ],
          frequency: 'Before each cycle',
          enabled: true,
          associatedDrugs: ['Carboplatin', 'Paclitaxel', 'Doxorubicin', 'Cyclophosphamide'],
          cancerTypes: ['Breast Cancer', 'Lung Cancer', 'Lymphoma'],
          createdBy: 'Dr. Michael Park',
          lastModified: '2024-01-15T10:00:00Z'
        },
        {
          id: 'rule-002',
          name: 'Platinum-Based Nephrotoxicity',
          description: 'Monitor renal function in patients receiving platinum-based chemotherapy',
          testCodes: ['CREAT', 'BUN', 'eGFR'],
          conditions: [
            { parameter: 'CREAT', operator: 'greater_than', value: 1.5 },
            { parameter: 'eGFR', operator: 'less_than', value: 60 }
          ],
          alertThresholds: [
            {
              severity: 'immediate',
              condition: { parameter: 'CREAT', operator: 'change_rate', value: 50, timeframe: '7d' },
              message: 'Acute kidney injury detected',
              recommendations: ['Hold cisplatin', 'Nephrology consult', 'Hydration assessment']
            }
          ],
          frequency: 'Weekly during treatment',
          enabled: true,
          associatedDrugs: ['Cisplatin', 'Carboplatin', 'Oxaliplatin'],
          cancerTypes: ['Testicular Cancer', 'Ovarian Cancer', 'Colorectal Cancer'],
          createdBy: 'Dr. Lisa Rodriguez',
          lastModified: '2024-01-12T14:30:00Z'
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical-high':
      case 'critical-low':
        return 'text-red-600 bg-red-100';
      case 'high':
      case 'low':
        return 'text-orange-600 bg-orange-100';
      case 'abnormal':
        return 'text-yellow-600 bg-yellow-100';
      case 'normal':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'immediate':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'urgent':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'routine':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'syncing':
        return 'text-blue-600 bg-blue-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{labAlerts.filter(alert => !alert.acknowledgedBy).length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Results</p>
              <p className="text-2xl font-bold text-orange-600">
                {labResults.filter(result => result.status.includes('critical')).length}
              </p>
            </div>
            <TestTube className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected Systems</p>
              <p className="text-2xl font-bold text-green-600">
                {labSystems.filter(system => system.connectionStatus === 'connected').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monitoring Rules</p>
              <p className="text-2xl font-bold text-blue-600">{monitoringRules.filter(rule => rule.enabled).length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recent Critical Alerts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Critical Laboratory Alerts</h3>
        </div>
        <div className="p-6">
          {labAlerts.filter(alert => alert.severity === 'immediate').slice(0, 3).map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg border mb-4 last:mb-0 ${getAlertSeverityColor(alert.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{alert.patientName}</span>
                    <span className="text-sm">• {alert.testName}</span>
                  </div>
                  <p className="text-sm mb-2">{alert.message}</p>
                  <div className="text-xs space-y-1">
                    <div>Current: {alert.currentValue} {alert.unit}</div>
                    {alert.previousValue && <div>Previous: {alert.previousValue} {alert.unit}</div>}
                    {alert.relatedMedications.length > 0 && (
                      <div>Medications: {alert.relatedMedications.join(', ')}</div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(alert.triggeredDate).toLocaleString()}
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs font-medium mb-1">Recommendations:</p>
                <ul className="text-xs space-y-1">
                  {alert.recommendations.slice(0, 2).map((rec, index) => (
                    <li key={index}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Laboratory System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {labSystems.map(system => (
              <div key={system.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{system.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConnectionStatusColor(system.connectionStatus)}`}>
                    {system.connectionStatus}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{system.vendor} {system.version}</p>
                <div className="text-xs text-gray-500">
                  <div>Type: {system.type}</div>
                  <div>Last sync: {new Date(system.lastSync).toLocaleString()}</div>
                  <div>Tests: {system.testsSupported.length} supported</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLabResults = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lab results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Results</option>
            <option value="critical">Critical Only</option>
            <option value="abnormal">Abnormal Only</option>
            <option value="normal">Normal Only</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Laboratory Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {labResults.map(result => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.patientName}</div>
                      <div className="text-sm text-gray-500">{result.orderingPhysician}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{result.testName}</div>
                      <div className="text-sm text-gray-500">{result.testCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {result.value} {result.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.referenceRange}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                      {result.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(result.resultDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {result.laboratory}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      {labAlerts.map(alert => (
        <div key={alert.id} className={`p-6 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-semibold">{alert.patientName}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAlertSeverityColor(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                  {alert.alertType.replace('-', ' ')}
                </span>
              </div>
              <h4 className="text-base font-medium mb-1">{alert.testName}</h4>
              <p className="text-sm mb-3">{alert.message}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(alert.triggeredDate).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium mb-2">Lab Values</h5>
              <div className="space-y-1 text-sm">
                <div>Current: <span className="font-medium">{alert.currentValue} {alert.unit}</span></div>
                {alert.previousValue && (
                  <div>Previous: <span className="font-medium">{alert.previousValue} {alert.unit}</span></div>
                )}
              </div>
              
              {alert.relatedMedications.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Related Medications</h5>
                  <div className="flex flex-wrap gap-1">
                    {alert.relatedMedications.map(med => (
                      <span key={med} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium mb-2">Recommendations</h5>
              <ul className="space-y-1 text-sm">
                {alert.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
              
              {alert.protocolReference && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Protocol Reference</h5>
                  <p className="text-sm text-blue-600">{alert.protocolReference}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {alert.acknowledgedBy ? (
                <span>Acknowledged by {alert.acknowledgedBy} on {new Date(alert.acknowledgedDate!).toLocaleString()}</span>
              ) : (
                <span>Awaiting acknowledgment</span>
              )}
            </div>
            {!alert.acknowledgedBy && (
              <button 
                onClick={() => acknowledgeAlert(alert.id)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Acknowledge Alert
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonitoringRules = () => (
    <div className="space-y-6">
      {monitoringRules.map(rule => (
        <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {rule.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Test Codes</h4>
              <div className="flex flex-wrap gap-1">
                {rule.testCodes.map(code => (
                  <span key={code} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Associated Drugs</h4>
              <div className="flex flex-wrap gap-1">
                {rule.associatedDrugs.slice(0, 3).map(drug => (
                  <span key={drug} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {drug}
                  </span>
                ))}
                {rule.associatedDrugs.length > 3 && (
                  <span className="text-xs text-gray-500">+{rule.associatedDrugs.length - 3} more</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Cancer Types</h4>
              <div className="flex flex-wrap gap-1">
                {rule.cancerTypes.slice(0, 2).map(type => (
                  <span key={type} className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    {type}
                  </span>
                ))}
                {rule.cancerTypes.length > 2 && (
                  <span className="text-xs text-gray-500">+{rule.cancerTypes.length - 2} more</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Created by {rule.createdBy} • Frequency: {rule.frequency}
              </div>
              <div>
                Last modified: {new Date(rule.lastModified).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading laboratory integration data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TestTube className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laboratory Integration & Monitoring</h1>
            <p className="text-gray-600">Real-time lab result monitoring with intelligent alerting and clinical decision support</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'results', label: 'Lab Results', icon: TestTube },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'monitoring', label: 'Monitoring Rules', icon: Shield },
            { id: 'systems', label: 'Lab Systems', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'alerts' && labAlerts.filter(alert => !alert.acknowledgedBy).length > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                    {labAlerts.filter(alert => !alert.acknowledgedBy).length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'results' && renderLabResults()}
      {activeTab === 'alerts' && renderAlerts()}
      {activeTab === 'monitoring' && renderMonitoringRules()}
      {activeTab === 'systems' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lab Systems Configuration</h3>
          <p className="text-gray-600">Laboratory system connections and configuration will be managed here.</p>
        </div>
      )}
    </div>
  );
};

export default LaboratoryIntegrationSystem;