import React, { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Lock, Eye, Download, Upload, Clock, Users, Database, Award, Flag, Settings, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface ComplianceFramework {
  id: string;
  name: string;
  region: 'US' | 'EU' | 'Global';
  category: 'Medical Device' | 'Software' | 'Data Protection' | 'Clinical' | 'Quality Management';
  status: 'Compliant' | 'In Progress' | 'Non-Compliant' | 'Under Review';
  compliance_score: number;
  last_audit: string;
  next_audit: string;
  requirements: ComplianceRequirement[];
  certifications: Certification[];
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface ComplianceRequirement {
  id: string;
  framework_id: string;
  requirement: string;
  description: string;
  status: 'Met' | 'Partially Met' | 'Not Met' | 'Not Applicable';
  evidence: Evidence[];
  responsible_party: string;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  compliance_percentage: number;
  controls: Control[];
}

interface Evidence {
  id: string;
  type: 'Document' | 'Procedure' | 'Training' | 'Audit' | 'Test Result' | 'Certification';
  title: string;
  description: string;
  file_path?: string;
  created_date: string;
  expiry_date?: string;
  status: 'Valid' | 'Expired' | 'Pending Review';
  reviewer: string;
}

interface Control {
  id: string;
  type: 'Technical' | 'Administrative' | 'Physical';
  description: string;
  implementation_status: 'Implemented' | 'In Progress' | 'Planned' | 'Not Started';
  effectiveness: number;
  last_tested: string;
  next_test: string;
  responsible_party: string;
}

interface Certification {
  id: string;
  name: string;
  issuing_body: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'Valid' | 'Expired' | 'Pending Renewal' | 'Under Review';
  scope: string;
  risk_impact: 'Low' | 'Medium' | 'High';
}

interface AuditRecord {
  id: string;
  type: 'Internal' | 'External' | 'Regulatory' | 'Customer';
  auditor: string;
  framework: string;
  audit_date: string;
  scope: string;
  findings: AuditFinding[];
  overall_rating: 'Excellent' | 'Good' | 'Acceptable' | 'Needs Improvement' | 'Non-Compliant';
  next_audit: string;
}

interface AuditFinding {
  id: string;
  type: 'Major Non-Conformity' | 'Minor Non-Conformity' | 'Observation' | 'Opportunity for Improvement';
  description: string;
  requirement_reference: string;
  corrective_action: string;
  responsible_party: string;
  due_date: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Verified';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface DataProtectionMetrics {
  data_processing_activities: number;
  data_subjects: number;
  consent_records: number;
  data_breaches: number;
  privacy_requests: number;
  retention_policies: number;
  encryption_coverage: number;
  access_controls: number;
  training_completion: number;
}

interface QualityMetrics {
  document_control: number;
  training_records: number;
  change_controls: number;
  risk_assessments: number;
  corrective_actions: number;
  preventive_actions: number;
  management_reviews: number;
  internal_audits: number;
}

const RegulatoryCompliance: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [dataProtectionMetrics, setDataProtectionMetrics] = useState<DataProtectionMetrics | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [viewMode, setViewMode] = useState<'overview' | 'frameworks' | 'audits' | 'evidence' | 'reports'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const generateComplianceData = useCallback(() => {
    const sampleFrameworks: ComplianceFramework[] = [
      {
        id: 'fda-21cfr11',
        name: 'FDA 21 CFR Part 11',
        region: 'US',
        category: 'Software',
        status: 'Compliant',
        compliance_score: 94.2,
        last_audit: '2023-11-15',
        next_audit: '2024-11-15',
        risk_level: 'Medium',
        requirements: [
          {
            id: 'req-1',
            framework_id: 'fda-21cfr11',
            requirement: 'Electronic Record Controls',
            description: 'Systems must ensure electronic records are authentic, reliable, and equivalent to paper records',
            status: 'Met',
            evidence: [
              {
                id: 'ev-1',
                type: 'Document',
                title: 'Electronic Records Validation Protocol',
                description: 'Comprehensive validation of electronic record systems',
                created_date: '2023-08-15',
                status: 'Valid',
                reviewer: 'Quality Assurance'
              }
            ],
            responsible_party: 'IT Compliance Team',
            due_date: '2024-01-31',
            priority: 'High',
            compliance_percentage: 96,
            controls: [
              {
                id: 'ctrl-1',
                type: 'Technical',
                description: 'Digital signature implementation with PKI',
                implementation_status: 'Implemented',
                effectiveness: 95,
                last_tested: '2023-12-01',
                next_test: '2024-06-01',
                responsible_party: 'IT Security'
              }
            ]
          },
          {
            id: 'req-2',
            framework_id: 'fda-21cfr11',
            requirement: 'Electronic Signature Controls',
            description: 'Electronic signatures must be legally binding and ensure signer authentication',
            status: 'Met',
            evidence: [],
            responsible_party: 'IT Compliance Team',
            due_date: '2024-02-28',
            priority: 'High',
            compliance_percentage: 92,
            controls: []
          }
        ],
        certifications: [
          {
            id: 'cert-1',
            name: 'FDA 21 CFR Part 11 Compliance',
            issuing_body: 'Third-Party Auditor',
            certificate_number: 'FDA-21CFR11-2023-001',
            issue_date: '2023-12-01',
            expiry_date: '2024-12-01',
            status: 'Valid',
            scope: 'Electronic records and signatures for clinical software',
            risk_impact: 'High'
          }
        ]
      },
      {
        id: 'gdpr',
        name: 'EU General Data Protection Regulation',
        region: 'EU',
        category: 'Data Protection',
        status: 'Compliant',
        compliance_score: 91.8,
        last_audit: '2023-10-20',
        next_audit: '2024-10-20',
        risk_level: 'High',
        requirements: [
          {
            id: 'req-3',
            framework_id: 'gdpr',
            requirement: 'Data Protection by Design and Default',
            description: 'Implement appropriate technical and organizational measures to protect personal data',
            status: 'Met',
            evidence: [
              {
                id: 'ev-2',
                type: 'Document',
                title: 'Privacy Impact Assessment',
                description: 'Comprehensive assessment of data processing activities',
                created_date: '2023-09-15',
                status: 'Valid',
                reviewer: 'Data Protection Officer'
              }
            ],
            responsible_party: 'Data Protection Officer',
            due_date: '2024-03-31',
            priority: 'Critical',
            compliance_percentage: 89,
            controls: [
              {
                id: 'ctrl-2',
                type: 'Technical',
                description: 'Data encryption at rest and in transit',
                implementation_status: 'Implemented',
                effectiveness: 98,
                last_tested: '2023-11-15',
                next_test: '2024-05-15',
                responsible_party: 'Security Team'
              }
            ]
          }
        ],
        certifications: [
          {
            id: 'cert-2',
            name: 'GDPR Compliance Certification',
            issuing_body: 'EU Data Protection Authority',
            certificate_number: 'GDPR-2023-789',
            issue_date: '2023-11-01',
            expiry_date: '2024-11-01',
            status: 'Valid',
            scope: 'Personal data processing for healthcare applications',
            risk_impact: 'High'
          }
        ]
      },
      {
        id: 'hipaa',
        name: 'Health Insurance Portability and Accountability Act',
        region: 'US',
        category: 'Data Protection',
        status: 'Compliant',
        compliance_score: 96.5,
        last_audit: '2023-12-05',
        next_audit: '2024-12-05',
        risk_level: 'High',
        requirements: [
          {
            id: 'req-4',
            framework_id: 'hipaa',
            requirement: 'Administrative Safeguards',
            description: 'Implement administrative actions to protect electronic health information',
            status: 'Met',
            evidence: [
              {
                id: 'ev-3',
                type: 'Training',
                title: 'HIPAA Security Training Records',
                description: 'Staff training completion records for HIPAA compliance',
                created_date: '2023-11-01',
                status: 'Valid',
                reviewer: 'HR Department'
              }
            ],
            responsible_party: 'Privacy Officer',
            due_date: '2024-04-30',
            priority: 'High',
            compliance_percentage: 97,
            controls: []
          }
        ],
        certifications: [
          {
            id: 'cert-3',
            name: 'HIPAA Compliance Attestation',
            issuing_body: 'Healthcare Compliance Consultant',
            certificate_number: 'HIPAA-2023-456',
            issue_date: '2023-12-15',
            expiry_date: '2024-12-15',
            status: 'Valid',
            scope: 'Electronic protected health information systems',
            risk_impact: 'High'
          }
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001 Information Security',
        region: 'Global',
        category: 'Quality Management',
        status: 'In Progress',
        compliance_score: 78.3,
        last_audit: '2023-09-10',
        next_audit: '2024-03-10',
        risk_level: 'Medium',
        requirements: [
          {
            id: 'req-5',
            framework_id: 'iso27001',
            requirement: 'Information Security Management System',
            description: 'Establish, implement, maintain and continually improve an ISMS',
            status: 'Partially Met',
            evidence: [
              {
                id: 'ev-4',
                type: 'Audit',
                title: 'ISO 27001 Pre-Assessment Report',
                description: 'External pre-assessment audit findings and recommendations',
                created_date: '2023-09-20',
                status: 'Valid',
                reviewer: 'External Auditor'
              }
            ],
            responsible_party: 'CISO',
            due_date: '2024-06-30',
            priority: 'High',
            compliance_percentage: 75,
            controls: [
              {
                id: 'ctrl-3',
                type: 'Administrative',
                description: 'Information security policy framework',
                implementation_status: 'In Progress',
                effectiveness: 70,
                last_tested: '2023-10-01',
                next_test: '2024-04-01',
                responsible_party: 'Security Team'
              }
            ]
          }
        ],
        certifications: []
      },
      {
        id: 'fda-qsr',
        name: 'FDA Quality System Regulation',
        region: 'US',
        category: 'Medical Device',
        status: 'Compliant',
        compliance_score: 93.7,
        last_audit: '2023-08-25',
        next_audit: '2024-08-25',
        risk_level: 'High',
        requirements: [
          {
            id: 'req-6',
            framework_id: 'fda-qsr',
            requirement: 'Design Controls',
            description: 'Establish and maintain procedures to control the design of medical devices',
            status: 'Met',
            evidence: [
              {
                id: 'ev-5',
                type: 'Procedure',
                title: 'Software Design Control Procedures',
                description: 'Documented procedures for software design and development lifecycle',
                created_date: '2023-07-15',
                status: 'Valid',
                reviewer: 'Quality Manager'
              }
            ],
            responsible_party: 'R&D Manager',
            due_date: '2024-07-31',
            priority: 'High',
            compliance_percentage: 94,
            controls: []
          }
        ],
        certifications: [
          {
            id: 'cert-4',
            name: 'FDA QSR Compliance Certificate',
            issuing_body: 'Notified Body',
            certificate_number: 'QSR-2023-321',
            issue_date: '2023-09-01',
            expiry_date: '2026-09-01',
            status: 'Valid',
            scope: 'Medical device software quality system',
            risk_impact: 'High'
          }
        ]
      }
    ];

    const sampleAudits: AuditRecord[] = [
      {
        id: 'audit-1',
        type: 'External',
        auditor: 'Regulatory Compliance Partners',
        framework: 'FDA 21 CFR Part 11',
        audit_date: '2023-11-15',
        scope: 'Electronic records and signatures compliance',
        findings: [
          {
            id: 'finding-1',
            type: 'Minor Non-Conformity',
            description: 'Audit trail review procedures need enhanced documentation',
            requirement_reference: '21 CFR 11.10(e)',
            corrective_action: 'Update audit trail review SOP with detailed procedures',
            responsible_party: 'Quality Assurance',
            due_date: '2024-01-15',
            status: 'In Progress',
            risk_level: 'Low'
          }
        ],
        overall_rating: 'Good',
        next_audit: '2024-11-15'
      },
      {
        id: 'audit-2',
        type: 'Internal',
        auditor: 'Internal Audit Team',
        framework: 'GDPR',
        audit_date: '2023-10-20',
        scope: 'Data protection impact assessments and privacy controls',
        findings: [
          {
            id: 'finding-2',
            type: 'Observation',
            description: 'Consider implementing automated data retention policies',
            requirement_reference: 'Article 5(1)(e)',
            corrective_action: 'Evaluate and implement automated retention system',
            responsible_party: 'Data Protection Officer',
            due_date: '2024-03-20',
            status: 'Open',
            risk_level: 'Medium'
          }
        ],
        overall_rating: 'Excellent',
        next_audit: '2024-04-20'
      }
    ];

    const dpMetrics: DataProtectionMetrics = {
      data_processing_activities: 47,
      data_subjects: 284792,
      consent_records: 267834,
      data_breaches: 0,
      privacy_requests: 23,
      retention_policies: 12,
      encryption_coverage: 98.7,
      access_controls: 156,
      training_completion: 94.2
    };

    const qMetrics: QualityMetrics = {
      document_control: 98.5,
      training_records: 94.2,
      change_controls: 89.7,
      risk_assessments: 91.3,
      corrective_actions: 87.8,
      preventive_actions: 92.1,
      management_reviews: 95.6,
      internal_audits: 88.9
    };

    setFrameworks(sampleFrameworks);
    setAuditRecords(sampleAudits);
    setDataProtectionMetrics(dpMetrics);
    setQualityMetrics(qMetrics);
    setSelectedFramework(sampleFrameworks[0].id);
  }, []);

  useEffect(() => {
    generateComplianceData();
  }, [generateComplianceData]);

  const filteredFrameworks = frameworks.filter(framework => {
    if (filterStatus !== 'all' && framework.status !== filterStatus) return false;
    if (filterRisk !== 'all' && framework.risk_level !== filterRisk) return false;
    return true;
  });

  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  const complianceScoreData = frameworks.map(framework => ({
    name: framework.name.split(' ').slice(0, 2).join(' '),
    score: framework.compliance_score,
    target: 95
  }));

  const statusDistribution = [
    { name: 'Compliant', value: frameworks.filter(f => f.status === 'Compliant').length, color: '#10B981' },
    { name: 'In Progress', value: frameworks.filter(f => f.status === 'In Progress').length, color: '#F59E0B' },
    { name: 'Non-Compliant', value: frameworks.filter(f => f.status === 'Non-Compliant').length, color: '#EF4444' },
    { name: 'Under Review', value: frameworks.filter(f => f.status === 'Under Review').length, color: '#8B5CF6' }
  ];

  const riskDistribution = [
    { name: 'Low', value: frameworks.filter(f => f.risk_level === 'Low').length, color: '#10B981' },
    { name: 'Medium', value: frameworks.filter(f => f.risk_level === 'Medium').length, color: '#F59E0B' },
    { name: 'High', value: frameworks.filter(f => f.risk_level === 'High').length, color: '#EF4444' },
    { name: 'Critical', value: frameworks.filter(f => f.risk_level === 'Critical').length, color: '#7C2D12' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'text-green-700 bg-green-100 border-green-300';
      case 'In Progress': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'Non-Compliant': return 'text-red-700 bg-red-100 border-red-300';
      case 'Under Review': return 'text-purple-700 bg-purple-100 border-purple-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-700 bg-green-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'High': return 'text-red-700 bg-red-100';
      case 'Critical': return 'text-red-900 bg-red-200';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Regulatory Compliance Framework</h1>
            <p className="text-blue-100">
              Comprehensive compliance management for FDA, GDPR, HIPAA, and international regulations
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {Math.round(frameworks.reduce((sum, f) => sum + f.compliance_score, 0) / frameworks.length)}%
            </div>
            <div className="text-sm text-blue-100">Overall Compliance</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="overview">Compliance Overview</option>
              <option value="frameworks">Framework Details</option>
              <option value="audits">Audit Records</option>
              <option value="evidence">Evidence Management</option>
              <option value="reports">Compliance Reports</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="In Progress">In Progress</option>
              <option value="Non-Compliant">Non-Compliant</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Risk Level:</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Compliance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{frameworks.length}</div>
                  <div className="text-sm text-gray-600">Active Frameworks</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {frameworks.filter(f => f.status === 'Compliant').length}
                  </div>
                  <div className="text-sm text-gray-600">Compliant Systems</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {auditRecords.reduce((sum, audit) => sum + audit.findings.filter(f => f.status !== 'Closed').length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Open Findings</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {frameworks.reduce((sum, f) => sum + f.certifications.filter(c => c.status === 'Valid').length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Valid Certifications</div>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Scores and Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Scores by Framework</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={complianceScoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Compliance Score']} />
                  <Bar dataKey="score" fill="#3B82F6" />
                  <Bar dataKey="target" fill="#10B981" fillOpacity={0.3} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Framework Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Framework Overview */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regulatory Framework Overview</h3>
            <div className="space-y-4">
              {filteredFrameworks.map((framework) => (
                <div key={framework.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{framework.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(framework.status)}`}>
                          {framework.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(framework.risk_level)}`}>
                          {framework.risk_level} Risk
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {framework.region}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-2 font-medium">{framework.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Requirements:</span>
                          <span className="ml-2 font-medium">{framework.requirements.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Audit:</span>
                          <span className="ml-2 font-medium">{framework.last_audit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Audit:</span>
                          <span className="ml-2 font-medium">{framework.next_audit}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Compliance Progress</span>
                          <span className="text-sm font-medium">{framework.compliance_score.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${framework.compliance_score}%` }}
                          ></div>
                        </div>
                      </div>

                      {framework.certifications.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-600">Certifications: </span>
                          {framework.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className={`ml-1 px-2 py-1 text-xs rounded ${
                                cert.status === 'Valid' ? 'bg-green-100 text-green-800' :
                                cert.status === 'Expired' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {cert.name} ({cert.status})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-2xl font-bold text-blue-600">{framework.compliance_score.toFixed(0)}%</div>
                      <div className="text-sm text-gray-600">Compliance</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Protection Metrics */}
          {dataProtectionMetrics && (
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Protection Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Processing Activities</div>
                  <div className="text-xl font-bold text-blue-600">{dataProtectionMetrics.data_processing_activities}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Data Subjects</div>
                  <div className="text-xl font-bold text-green-600">{dataProtectionMetrics.data_subjects.toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Consent Records</div>
                  <div className="text-xl font-bold text-purple-600">{dataProtectionMetrics.consent_records.toLocaleString()}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Privacy Requests</div>
                  <div className="text-xl font-bold text-yellow-600">{dataProtectionMetrics.privacy_requests}</div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Data Breaches</div>
                  <div className="text-xl font-bold text-red-600">{dataProtectionMetrics.data_breaches}</div>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Encryption Coverage</div>
                  <div className="text-xl font-bold text-indigo-600">{dataProtectionMetrics.encryption_coverage}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'frameworks' && currentFramework && (
        <div className="space-y-6">
          {/* Framework Details */}
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Framework Details</h3>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {frameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>{framework.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Framework Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">{currentFramework.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{currentFramework.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(currentFramework.status)}`}>
                      {currentFramework.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskColor(currentFramework.risk_level)}`}>
                      {currentFramework.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Audit Schedule</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Audit:</span>
                    <span className="font-medium">{currentFramework.last_audit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Audit:</span>
                    <span className="font-medium">{currentFramework.next_audit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requirements:</span>
                    <span className="font-medium">{currentFramework.requirements.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certifications:</span>
                    <span className="font-medium">{currentFramework.certifications.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Compliance Score</h4>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {currentFramework.compliance_score.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${currentFramework.compliance_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Requirements</h4>
              <div className="space-y-3">
                {currentFramework.requirements.map((requirement) => (
                  <div key={requirement.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-medium text-gray-900">{requirement.requirement}</h5>
                        <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          requirement.status === 'Met' ? 'bg-green-100 text-green-800' :
                          requirement.status === 'Partially Met' ? 'bg-yellow-100 text-yellow-800' :
                          requirement.status === 'Not Met' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {requirement.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          requirement.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                          requirement.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {requirement.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Responsible Party:</span>
                        <span className="ml-2 font-medium">{requirement.responsible_party}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <span className="ml-2 font-medium">{requirement.due_date}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Compliance:</span>
                        <span className="ml-2 font-medium">{requirement.compliance_percentage}%</span>
                      </div>
                    </div>

                    {requirement.evidence.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Evidence: </span>
                        {requirement.evidence.map((evidence, index) => (
                          <span
                            key={index}
                            className={`ml-1 px-2 py-1 text-xs rounded ${
                              evidence.status === 'Valid' ? 'bg-blue-100 text-blue-800' :
                              evidence.status === 'Expired' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {evidence.title} ({evidence.type})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'audits' && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Records</h3>
          <div className="space-y-4">
            {auditRecords.map((audit) => (
              <div key={audit.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{audit.framework} Audit</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                      <span>{audit.type}</span>
                      <span>•</span>
                      <span>{audit.auditor}</span>
                      <span>•</span>
                      <span>{audit.audit_date}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    audit.overall_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    audit.overall_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                    audit.overall_rating === 'Acceptable' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {audit.overall_rating}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-600">Scope: </span>
                  <span className="text-sm font-medium">{audit.scope}</span>
                </div>

                {audit.findings.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Findings ({audit.findings.length})</h5>
                    <div className="space-y-2">
                      {audit.findings.map((finding) => (
                        <div key={finding.id} className="bg-white p-3 rounded border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className={`px-2 py-1 text-xs font-medium rounded ${
                                finding.type === 'Major Non-Conformity' ? 'bg-red-100 text-red-800' :
                                finding.type === 'Minor Non-Conformity' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {finding.type}
                              </span>
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getRiskColor(finding.risk_level)}`}>
                                {finding.risk_level} Risk
                              </span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              finding.status === 'Closed' ? 'bg-green-100 text-green-800' :
                              finding.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {finding.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                          <div className="text-xs text-gray-600">
                            <div>Reference: {finding.requirement_reference}</div>
                            <div>Responsible: {finding.responsible_party} | Due: {finding.due_date}</div>
                            <div>Corrective Action: {finding.corrective_action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 text-sm text-gray-600">
                  Next Audit: {audit.next_audit}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryCompliance;
