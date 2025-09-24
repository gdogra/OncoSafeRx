import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Upload, 
  Search,
  Filter,
  Calendar,
  User,
  Lock,
  Eye,
  EyeOff,
  FileCheck,
  AlertCircle,
  Bookmark,
  Tag,
  Archive,
  RefreshCw,
  Settings
} from 'lucide-react';

interface ComplianceAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: 'patient' | 'medication' | 'report' | 'protocol' | 'system';
  resourceId: string;
  details: string;
  ipAddress: string;
  sessionId: string;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  regulatoryFramework: string[];
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  version: string;
  effectiveDate: string;
  requirements: ComplianceRequirement[];
  status: 'active' | 'pending' | 'deprecated';
  jurisdiction: string;
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  implementation: string;
  validationCriteria: string;
  documentation: string[];
  lastAssessed: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
}

interface AuditReport {
  id: string;
  title: string;
  generatedDate: string;
  reportType: 'hipaa' | 'fda' | 'gdpr' | 'hitech' | 'custom';
  timeframe: string;
  findings: ComplianceFinding[];
  status: 'draft' | 'final' | 'submitted';
  generatedBy: string;
}

interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  recommendation: string;
  framework: string;
  requirement: string;
  remediation: string;
  timeline: string;
}

const RegulatoryComplianceSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit-logs' | 'frameworks' | 'reports' | 'policies'>('dashboard');
  const [auditLogs, setAuditLogs] = useState<ComplianceAuditLog[]>([]);
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [reports, setReports] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFramework, setFilterFramework] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    initializeComplianceData();
  }, []);

  const initializeComplianceData = () => {
    // Simulate loading real compliance data
    setLoading(true);
    
    setTimeout(() => {
      setFrameworks([
        {
          id: 'hipaa',
          name: 'HIPAA (Health Insurance Portability and Accountability Act)',
          description: 'US federal law protecting healthcare data privacy and security',
          version: '2013 Final Omnibus Rule',
          effectiveDate: '2013-09-23',
          status: 'active',
          jurisdiction: 'United States',
          requirements: [
            {
              id: 'hipaa-164.312-a-1',
              title: 'Access Control (§164.312(a)(1))',
              description: 'Assign unique name/number for identifying and tracking user identity',
              category: 'Administrative Safeguards',
              severity: 'critical',
              implementation: 'User authentication with unique identifiers implemented',
              validationCriteria: 'Each user has unique login credentials',
              documentation: ['User Access Control Policy', 'Authentication Logs'],
              lastAssessed: '2024-01-15',
              status: 'compliant'
            },
            {
              id: 'hipaa-164.312-e-1',
              title: 'Transmission Security (§164.312(e)(1))',
              description: 'Implement technical safeguards to prevent unauthorized access to ePHI during transmission',
              category: 'Technical Safeguards',
              severity: 'critical',
              implementation: 'TLS 1.3 encryption for all data transmission',
              validationCriteria: 'All network traffic encrypted in transit',
              documentation: ['Encryption Certificate', 'Network Security Assessment'],
              lastAssessed: '2024-01-10',
              status: 'compliant'
            }
          ]
        },
        {
          id: 'fda-21cfr11',
          name: 'FDA 21 CFR Part 11',
          description: 'Electronic Records and Electronic Signatures',
          version: '1997 Final Rule',
          effectiveDate: '1997-08-20',
          status: 'active',
          jurisdiction: 'United States',
          requirements: [
            {
              id: 'cfr11-11.10-a',
              title: 'Validation of Systems (§11.10(a))',
              description: 'System validation to ensure accuracy, reliability, consistent performance',
              category: 'System Controls',
              severity: 'high',
              implementation: 'Validation testing suite with documented procedures',
              validationCriteria: 'All system functions validated and documented',
              documentation: ['Validation Protocol', 'Test Results'],
              lastAssessed: '2024-01-08',
              status: 'compliant'
            }
          ]
        },
        {
          id: 'gdpr',
          name: 'GDPR (General Data Protection Regulation)',
          description: 'EU regulation on data protection and privacy',
          version: '2016/679',
          effectiveDate: '2018-05-25',
          status: 'active',
          jurisdiction: 'European Union',
          requirements: [
            {
              id: 'gdpr-art-32',
              title: 'Security of Processing (Article 32)',
              description: 'Implement appropriate technical and organizational measures',
              category: 'Security',
              severity: 'critical',
              implementation: 'Data encryption, access controls, regular security assessments',
              validationCriteria: 'Data protection measures documented and tested',
              documentation: ['Security Policy', 'Risk Assessment'],
              lastAssessed: '2024-01-12',
              status: 'compliant'
            }
          ]
        }
      ]);

      setAuditLogs([
        {
          id: 'log-001',
          timestamp: '2024-01-20T14:30:00Z',
          userId: 'user-123',
          userName: 'Dr. Sarah Chen',
          action: 'VIEW_PATIENT_RECORD',
          resourceType: 'patient',
          resourceId: 'patient-456',
          details: 'Accessed patient medical history for treatment review',
          ipAddress: '192.168.1.100',
          sessionId: 'sess-abc123',
          complianceStatus: 'compliant',
          regulatoryFramework: ['HIPAA', 'HITECH']
        },
        {
          id: 'log-002',
          timestamp: '2024-01-20T13:15:00Z',
          userId: 'user-789',
          userName: 'Dr. Michael Park',
          action: 'EXPORT_MEDICATION_DATA',
          resourceType: 'medication',
          resourceId: 'med-789',
          details: 'Exported medication interaction report without patient consent documentation',
          ipAddress: '192.168.1.101',
          sessionId: 'sess-def456',
          complianceStatus: 'warning',
          regulatoryFramework: ['HIPAA', 'FDA 21 CFR Part 11']
        },
        {
          id: 'log-003',
          timestamp: '2024-01-20T12:00:00Z',
          userId: 'user-456',
          userName: 'Pharmacist Lisa Rodriguez',
          action: 'MODIFY_PROTOCOL',
          resourceType: 'protocol',
          resourceId: 'protocol-123',
          details: 'Updated dosing protocol without proper authorization',
          ipAddress: '192.168.1.102',
          sessionId: 'sess-ghi789',
          complianceStatus: 'violation',
          regulatoryFramework: ['FDA 21 CFR Part 11']
        }
      ]);

      setReports([
        {
          id: 'report-001',
          title: 'Monthly HIPAA Compliance Audit',
          generatedDate: '2024-01-15T09:00:00Z',
          reportType: 'hipaa',
          timeframe: '2023-12-01 to 2023-12-31',
          status: 'final',
          generatedBy: 'Compliance Officer',
          findings: [
            {
              id: 'finding-001',
              severity: 'medium',
              title: 'Incomplete Access Logs',
              description: 'Some user access events lack sufficient detail for audit trails',
              recommendation: 'Enhance logging system to capture additional user activity details',
              framework: 'HIPAA',
              requirement: '§164.312(b)',
              remediation: 'Update logging configuration and test thoroughly',
              timeline: '30 days'
            }
          ]
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const getComplianceScore = () => {
    const totalRequirements = frameworks.reduce((acc, framework) => acc + framework.requirements.length, 0);
    const compliantRequirements = frameworks.reduce((acc, framework) => 
      acc + framework.requirements.filter(req => req.status === 'compliant').length, 0
    );
    return totalRequirements > 0 ? Math.round((compliantRequirements / totalRequirements) * 100) : 0;
  };

  const generateAuditReport = (type: string) => {
    // Simulate report generation
    console.log(`Generating ${type} audit report...`);
    alert(`${type.toUpperCase()} audit report generation initiated. Report will be available in the Reports tab.`);
  };

  const exportComplianceData = (format: string) => {
    // Simulate data export
    console.log(`Exporting compliance data as ${format}...`);
    alert(`Compliance data export as ${format} initiated.`);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Compliance Score</h3>
            <div className="text-3xl font-bold">{getComplianceScore()}%</div>
            <p className="text-blue-100 mt-1">Overall regulatory compliance rating</p>
          </div>
          <Shield className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Frameworks</p>
              <p className="text-2xl font-bold text-gray-900">{frameworks.filter(f => f.status === 'active').length}</p>
            </div>
            <FileCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Audit Violations</p>
              <p className="text-2xl font-bold text-red-600">
                {auditLogs.filter(log => log.complianceStatus === 'violation').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reports</p>
              <p className="text-2xl font-bold text-orange-600">
                {reports.filter(report => report.status === 'draft').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Audit</p>
              <p className="text-sm font-medium text-gray-900">Jan 15, 2024</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Recent Violations */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Compliance Issues</h3>
        </div>
        <div className="p-6">
          {auditLogs.filter(log => log.complianceStatus !== 'compliant').slice(0, 3).map(log => (
            <div key={log.id} className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
              <div className={`p-1 rounded-full ${
                log.complianceStatus === 'violation' ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                {log.complianceStatus === 'violation' ? 
                  <AlertCircle className="w-4 h-4 text-red-600" /> :
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                }
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{log.action.replace(/_/g, ' ')}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">User: {log.userName}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">Frameworks: {log.regulatoryFramework.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => generateAuditReport('hipaa')}
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="font-medium text-blue-900">Generate HIPAA Report</span>
            </button>
            
            <button 
              onClick={() => generateAuditReport('fda')}
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FileCheck className="w-6 h-6 text-green-600" />
              <span className="font-medium text-green-900">Generate FDA Report</span>
            </button>
            
            <button 
              onClick={() => exportComplianceData('pdf')}
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Download className="w-6 h-6 text-purple-600" />
              <span className="font-medium text-purple-900">Export All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterFramework}
            onChange={(e) => setFilterFramework(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Frameworks</option>
            <option value="HIPAA">HIPAA</option>
            <option value="FDA 21 CFR Part 11">FDA 21 CFR Part 11</option>
            <option value="GDPR">GDPR</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Framework
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.resourceType} ({log.resourceId})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      log.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                      log.complianceStatus === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.complianceStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.regulatoryFramework.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFrameworks = () => (
    <div className="space-y-6">
      {frameworks.map(framework => (
        <div key={framework.id} className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">Version: {framework.version}</span>
                  <span className="text-xs text-gray-500">Jurisdiction: {framework.jurisdiction}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    framework.status === 'active' ? 'bg-green-100 text-green-800' :
                    framework.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {framework.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Requirements</h4>
            <div className="space-y-4">
              {framework.requirements.map(requirement => (
                <div key={requirement.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium text-gray-900">{requirement.title}</h5>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          requirement.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          requirement.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          requirement.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {requirement.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Implementation: {requirement.implementation}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      requirement.status === 'compliant' ? 'bg-green-100 text-green-800' :
                      requirement.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      requirement.status === 'non-compliant' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {requirement.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
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
          <span className="text-gray-600">Loading compliance data...</span>
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
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Regulatory Compliance & Documentation</h1>
            <p className="text-gray-600">Comprehensive regulatory compliance management and audit system</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Shield },
            { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
            { id: 'frameworks', label: 'Frameworks', icon: Bookmark },
            { id: 'reports', label: 'Reports', icon: FileCheck },
            { id: 'policies', label: 'Policies', icon: Settings }
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'audit-logs' && renderAuditLogs()}
      {activeTab === 'frameworks' && renderFrameworks()}
      {activeTab === 'reports' && (
        <div className="text-center py-12">
          <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Section</h3>
          <p className="text-gray-600">Compliance reports and documentation will be displayed here.</p>
        </div>
      )}
      {activeTab === 'policies' && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Policies Section</h3>
          <p className="text-gray-600">Organizational policies and procedures will be managed here.</p>
        </div>
      )}
    </div>
  );
};

export default RegulatoryComplianceSystem;