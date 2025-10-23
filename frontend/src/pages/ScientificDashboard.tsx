import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scientistMode, isScientistMode } from '../utils/scientistMode';
import Card from '../components/UI/Card';
import { 
  Database, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Search, 
  HelpCircle,
  FlaskConical,
  BarChart3,
  TestTube,
  Dna
} from 'lucide-react';

const ScientificDashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const userRole = user?.role || 'student';
  
  type EvidenceItem = {
    icon: any;
    title: string;
    description: string;
    link: string;
    methodology: string;
    dataSource: string;
    lastUpdated: string;
    evidenceLevel: string;
  };

  // Core evidence-based research tools
  const evidenceTools: EvidenceItem[] = [
    {
      icon: AlertTriangle,
      title: 'Drug-Drug Interaction Evidence',
      description: 'Systematic analysis of oncology drug interactions from regulatory filings and clinical studies',
      link: '/interactions',
      methodology: 'Meta-analysis of clinical trial data, FDA labels, and pharmacokinetic studies',
      dataSource: 'ClinicalTrials.gov, DailyMed, PubMed',
      lastUpdated: 'Weekly',
      evidenceLevel: 'Level A-B'
    },
    {
      icon: Database,
      title: 'Regulatory Label Database',
      description: 'Searchable repository of FDA-approved oncology drug labels and prescribing information',
      link: '/database',
      methodology: 'Automated extraction from FDA Orange Book and DailyMed',
      dataSource: 'FDA DailyMed, Orange Book',
      lastUpdated: 'Daily',
      evidenceLevel: 'Regulatory Standard'
    },
    {
      icon: FlaskConical,
      title: 'Clinical Trial Registry',
      description: 'Curated oncology clinical trials with intervention mapping and outcome data',
      link: '/trials',
      methodology: 'Systematic curation from trial registries with manual validation',
      dataSource: 'ClinicalTrials.gov, EudraCT',
      lastUpdated: 'Weekly',
      evidenceLevel: 'Primary Source'
    },
    {
      icon: Dna,
      title: 'Pharmacogenomic Evidence',
      description: 'Genomic biomarker associations with drug efficacy and toxicity profiles',
      link: '/genomics',
      methodology: 'CPIC guideline integration with population pharmacokinetic modeling',
      dataSource: 'CPIC, PharmGKB, FDA',
      lastUpdated: 'Monthly',
      evidenceLevel: 'Level A-B'
    },
    {
      icon: FileText,
      title: 'Evidence-Based Protocols',
      description: 'Treatment protocols derived from systematic literature review and guideline analysis',
      link: '/protocols',
      methodology: 'Systematic review of NCCN, ASCO, and ESMO guidelines',
      dataSource: 'NCCN, ASCO, ESMO',
      lastUpdated: 'Quarterly',
      evidenceLevel: 'Consensus Guidelines'
    },
    {
      icon: BarChart3,
      title: 'Population Analytics',
      description: 'Real-world evidence analysis from oncology practice patterns and outcomes',
      link: '/analytics',
      methodology: 'Retrospective cohort analysis with propensity score matching',
      dataSource: 'De-identified EHR data',
      lastUpdated: 'Monthly',
      evidenceLevel: 'Real-World Evidence'
    }
  ];

  const researcherTools: EvidenceItem[] = [
    {
      icon: Search,
      title: 'Multi-Database Search',
      description: 'Federated search across multiple oncology databases and literature repositories',
      link: '/search',
      methodology: 'Boolean logic with MeSH term mapping and citation indexing',
      dataSource: 'PubMed, Embase, Cochrane',
      lastUpdated: 'Real-time',
      evidenceLevel: 'Literature Synthesis'
    },
    {
      icon: TrendingUp,
      title: 'Biostatistical Analysis',
      description: 'Statistical analysis tools for survival analysis and treatment effect estimation',
      link: '/biostatistics',
      methodology: 'Kaplan-Meier estimation, Cox proportional hazards, meta-analysis',
      dataSource: 'User-provided data',
      lastUpdated: 'N/A',
      evidenceLevel: 'Analytical Tool'
    },
    {
      icon: TestTube,
      title: 'Laboratory Integration',
      description: 'Integration with laboratory information systems for real-time biomarker data',
      link: '/laboratory-integration',
      methodology: 'FHIR-compliant API integration with laboratory systems',
      dataSource: 'Laboratory LIS systems',
      lastUpdated: 'Real-time',
      evidenceLevel: 'Laboratory Standard'
    }
  ];

  const getToolsForRole = (): EvidenceItem[] => {
    const baseTools = evidenceTools;
    
    if (['researcher', 'oncologist'].includes(userRole)) {
      return [...baseTools, ...researcherTools];
    }
    
    return baseTools;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Scientific Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mono text-gray-900">
                {scientistMode.scientific.title}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {scientistMode.scientific.subtitle}
              </p>
            </div>
            <div className="text-xs text-gray-500 text-right">
              <div>Data Sources: {scientistMode.primaryDataSource}</div>
              <div>Update Frequency: {scientistMode.dataUpdateFrequency}</div>
              <div className="mt-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                Scientist Mode Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h2 className="text-lg font-mono text-gray-800 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scientistMode.scientific.navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="p-3 bg-white border border-gray-200 rounded hover:border-gray-300 transition-colors"
              >
                <div className="text-sm font-mono text-gray-900">{item.label}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Evidence Tools Grid */}
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-mono text-gray-800 mb-4">Evidence Analysis Tools</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getToolsForRole().map((tool, index) => (
                <Card key={index} className="hover:border-gray-300 transition-all duration-200">
                  <Link to={tool.link} className="block h-full">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <tool.icon className="w-6 h-6 text-gray-600" />
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                          {tool.evidenceLevel}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-mono text-gray-900 mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        <div>
                          <span className="font-mono">Methodology:</span> {tool.methodology}
                        </div>
                        <div>
                          <span className="font-mono">Data Source:</span> {tool.dataSource}
                        </div>
                        <div>
                          <span className="font-mono">Updated:</span> {tool.lastUpdated}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* API Documentation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-mono text-gray-900">API Documentation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Programmatic access to evidence databases and analysis tools for research integration.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/help"
                className="p-3 border border-gray-200 rounded hover:border-gray-300 transition-colors"
              >
                <div className="text-sm font-mono text-gray-900">REST API Reference</div>
                <div className="text-xs text-gray-500">Endpoints, authentication, rate limits</div>
              </Link>
              <a
                href="/api/openapi.yaml"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded hover:border-gray-300 transition-colors"
              >
                <div className="text-sm font-mono text-gray-900">OpenAPI Specification</div>
                <div className="text-xs text-gray-500">Machine-readable API schema</div>
              </a>
            </div>
          </div>

          {/* Citation Information */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-mono text-gray-900 mb-4">Citation & Attribution</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>Recommended Citation:</strong> OncoSafeRx Evidence Explorer. Drug-Drug Interaction Database. 
                Version {(import.meta as any)?.env?.VITE_APP_VERSION || '1.0.0'}. 
                Accessed {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </div>
              <div>
                <strong>Primary Data Sources:</strong> {scientistMode.primaryDataSource}
              </div>
              <div>
                <strong>Methodology:</strong> Systematic extraction and curation of drug interaction evidence 
                from regulatory documents, clinical trial reports, and peer-reviewed literature.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificDashboard;