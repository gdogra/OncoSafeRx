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
  Settings,
  Database,
  Users
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

  const renderReports = () => (
    <div className="space-y-6">
      {/* Report Generation Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Compliance Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => generateAuditReport('hipaa')}
            className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <FileText className="w-12 h-12 text-blue-600 mb-3" />
            <h4 className="font-medium text-blue-900 mb-1">HIPAA Compliance Report</h4>
            <p className="text-sm text-blue-700 text-center">Generate comprehensive HIPAA audit and compliance status report</p>
          </button>
          
          <button 
            onClick={() => generateAuditReport('fda')}
            className="flex flex-col items-center p-6 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
          >
            <FileCheck className="w-12 h-12 text-green-600 mb-3" />
            <h4 className="font-medium text-green-900 mb-1">FDA 21 CFR Part 11 Report</h4>
            <p className="text-sm text-green-700 text-center">Electronic records and signatures compliance assessment</p>
          </button>
          
          <button 
            onClick={() => generateAuditReport('gdpr')}
            className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Shield className="w-12 h-12 text-purple-600 mb-3" />
            <h4 className="font-medium text-purple-900 mb-1">GDPR Compliance Report</h4>
            <p className="text-sm text-purple-700 text-center">Data protection and privacy compliance status</p>
          </button>
          
          <button 
            onClick={() => generateAuditReport('comprehensive')}
            className="flex flex-col items-center p-6 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
          >
            <Archive className="w-12 h-12 text-orange-600 mb-3" />
            <h4 className="font-medium text-orange-900 mb-1">Comprehensive Audit Report</h4>
            <p className="text-sm text-orange-700 text-center">All frameworks combined compliance overview</p>
          </button>
          
          <button 
            onClick={() => exportComplianceData('csv')}
            className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <Download className="w-12 h-12 text-gray-600 mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Raw Data Export</h4>
            <p className="text-sm text-gray-700 text-center">Export raw compliance data for analysis</p>
          </button>
          
          <button 
            onClick={() => generateAuditReport('custom')}
            className="flex flex-col items-center p-6 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
          >
            <Settings className="w-12 h-12 text-indigo-600 mb-3" />
            <h4 className="font-medium text-indigo-900 mb-1">Custom Report Builder</h4>
            <p className="text-sm text-indigo-700 text-center">Create custom compliance reports with selected criteria</p>
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                <option value="all">All Report Types</option>
                <option value="hipaa">HIPAA Reports</option>
                <option value="fda">FDA Reports</option>
                <option value="gdpr">GDPR Reports</option>
                <option value="custom">Custom Reports</option>
              </select>
              <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.status === 'final' ? 'bg-green-100 text-green-800' :
                        report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {report.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        report.reportType === 'hipaa' ? 'bg-blue-100 text-blue-800' :
                        report.reportType === 'fda' ? 'bg-green-100 text-green-800' :
                        report.reportType === 'gdpr' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.reportType.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Generated:</span> {new Date(report.generatedDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Period:</span> {report.timeframe}
                      </div>
                      <div>
                        <span className="font-medium">Generated by:</span> {report.generatedBy}
                      </div>
                    </div>

                    {report.findings.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Key Findings ({report.findings.length})</h5>
                        <div className="space-y-2">
                          {report.findings.slice(0, 2).map(finding => (
                            <div key={finding.id} className="bg-white rounded p-3 border">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                      finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                      finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {finding.severity}
                                    </span>
                                  </div>
                                  <h6 className="text-sm font-medium text-gray-900">{finding.title}</h6>
                                  <p className="text-xs text-gray-600 mt-1">{finding.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {report.findings.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              + {report.findings.length - 2} more findings
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Scheduling */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Automated Report Scheduling</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>HIPAA Monthly Report</option>
                <option>FDA Quarterly Report</option>
                <option>GDPR Annual Report</option>
                <option>Comprehensive Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Semi-annually</option>
                <option>Annually</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
              <input 
                type="email" 
                placeholder="compliance@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Next Report Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );

  const renderPolicies = () => (
    <div className="space-y-6">
      {/* Policy Categories */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Organizational Policies & Procedures</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="w-4 h-4" />
              <span>Upload Policy</span>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { name: 'Privacy Policies', count: 12, color: 'blue', icon: Lock },
              { name: 'Security Procedures', count: 8, color: 'red', icon: Shield },
              { name: 'Data Handling', count: 15, color: 'green', icon: Database },
              { name: 'Audit Procedures', count: 6, color: 'purple', icon: FileCheck },
              { name: 'Training Materials', count: 24, color: 'orange', icon: Users },
              { name: 'Emergency Protocols', count: 4, color: 'yellow', icon: AlertTriangle }
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className={`bg-${category.color}-50 border border-${category.color}-200 rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium text-${category.color}-900`}>{category.name}</h4>
                      <p className={`text-sm text-${category.color}-700`}>{category.count} documents</p>
                    </div>
                    <Icon className={`w-8 h-8 text-${category.color}-600`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Policy Documents */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Policy Documents</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search policies..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Categories</option>
                <option value="privacy">Privacy Policies</option>
                <option value="security">Security Procedures</option>
                <option value="data">Data Handling</option>
                <option value="audit">Audit Procedures</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                id: 'pol-001',
                title: 'HIPAA Privacy Policy',
                category: 'Privacy Policies',
                version: '3.2',
                lastUpdated: '2024-01-15',
                status: 'Active',
                owner: 'Privacy Officer',
                reviewDate: '2024-07-15',
                description: 'Comprehensive policy outlining HIPAA privacy requirements and procedures for handling protected health information.'
              },
              {
                id: 'pol-002',
                title: 'Data Encryption Standards',
                category: 'Security Procedures',
                version: '2.1',
                lastUpdated: '2023-12-10',
                status: 'Active',
                owner: 'CISO',
                reviewDate: '2024-06-10',
                description: 'Technical standards and procedures for data encryption at rest and in transit.'
              },
              {
                id: 'pol-003',
                title: 'Incident Response Procedure',
                category: 'Security Procedures',
                version: '1.5',
                lastUpdated: '2023-11-20',
                status: 'Under Review',
                owner: 'Security Team',
                reviewDate: '2024-05-20',
                description: 'Step-by-step procedures for responding to security incidents and data breaches.'
              },
              {
                id: 'pol-004',
                title: 'Data Retention Policy',
                category: 'Data Handling',
                version: '2.0',
                lastUpdated: '2024-01-08',
                status: 'Active',
                owner: 'Data Protection Officer',
                reviewDate: '2025-01-08',
                description: 'Policy defining data retention periods and deletion procedures for different types of data.'
              },
              {
                id: 'pol-005',
                title: 'User Access Control Policy',
                category: 'Security Procedures',
                version: '3.0',
                lastUpdated: '2023-10-30',
                status: 'Pending Approval',
                owner: 'IT Security',
                reviewDate: '2024-04-30',
                description: 'Policy governing user access rights, authentication, and authorization procedures.'
              }
            ].map((policy) => (
              <div key={policy.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{policy.title}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        policy.status === 'Active' ? 'bg-green-100 text-green-800' :
                        policy.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                        policy.status === 'Pending Approval' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {policy.status}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        v{policy.version}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{policy.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Category:</span> {policy.category}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span> {policy.owner}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {policy.lastUpdated}
                      </div>
                      <div>
                        <span className="font-medium">Next Review:</span> {policy.reviewDate}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex flex-col space-y-2">
                    <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm">
                      <Settings className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Review Schedule</h3>
          <div className="space-y-3">
            {[
              { name: 'HIPAA Privacy Policy', dueDate: '2024-07-15', daysLeft: 95 },
              { name: 'Data Encryption Standards', dueDate: '2024-06-10', daysLeft: 60 },
              { name: 'Incident Response Procedure', dueDate: '2024-05-20', daysLeft: 39 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-600">Due: {item.dueDate}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    item.daysLeft < 30 ? 'bg-red-100 text-red-800' :
                    item.daysLeft < 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.daysLeft} days
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Training Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Training Completion</span>
              <span className="text-sm font-medium">87%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
            
            <div className="space-y-2 mt-4">
              {[
                { policy: 'HIPAA Privacy', completion: 95 },
                { policy: 'Data Security', completion: 82 },
                { policy: 'Incident Response', completion: 74 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.policy}</span>
                  <span className="font-medium">{item.completion}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'policies' && renderPolicies()}
    </div>
  );
};

export default RegulatoryComplianceSystem;