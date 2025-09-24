import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Star, 
  Calendar, 
  Users, 
  TrendingUp,
  FileText,
  ExternalLink,
  Download,
  Bookmark,
  Tag,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  RefreshCw,
  Eye,
  ThumbsUp,
  MessageSquare,
  Globe,
  Award,
  Zap,
  Target
} from 'lucide-react';

interface ClinicalProtocol {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  evidenceLevel: 'A' | 'B' | 'C' | 'D';
  lastUpdated: string;
  version: string;
  organization: string;
  cancerTypes: string[];
  treatmentPhase: string[];
  ageGroups: string[];
  evidenceGrade: string;
  recommendations: ProtocolRecommendation[];
  references: ProtocolReference[];
  implementation: ImplementationGuidance;
  metrics: ProtocolMetrics;
  status: 'active' | 'under-review' | 'deprecated';
  tags: string[];
}

interface ProtocolRecommendation {
  id: string;
  level: 'strong' | 'moderate' | 'weak';
  statement: string;
  rationale: string;
  evidenceSummary: string;
  implementation: string;
  contraindications: string[];
  considerations: string[];
}

interface ProtocolReference {
  id: string;
  type: 'clinical-trial' | 'meta-analysis' | 'guideline' | 'review';
  title: string;
  authors: string;
  journal: string;
  year: number;
  pmid?: string;
  doi?: string;
  evidenceQuality: 'high' | 'moderate' | 'low' | 'very-low';
  relevanceScore: number;
}

interface ImplementationGuidance {
  prerequisites: string[];
  contraindications: string[];
  monitoringRequirements: string[];
  expectedOutcomes: string[];
  commonChallenges: string[];
  bestPractices: string[];
}

interface ProtocolMetrics {
  adoptionRate: number;
  outcomeImprovement: number;
  safetyProfile: number;
  costEffectiveness: string;
  patientSatisfaction: number;
  clinicianFeedback: number;
}

interface GuidelineOrganization {
  id: string;
  name: string;
  abbreviation: string;
  description: string;
  website: string;
  credibility: number;
  specialties: string[];
  lastSync: string;
}

const EvidenceBasedProtocolsSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'protocols' | 'guidelines' | 'organizations' | 'implementation' | 'analytics'>('protocols');
  const [protocols, setProtocols] = useState<ClinicalProtocol[]>([]);
  const [organizations, setOrganizations] = useState<GuidelineOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol | null>(null);

  useEffect(() => {
    initializeProtocolData();
  }, []);

  const initializeProtocolData = () => {
    setLoading(true);
    
    setTimeout(() => {
      setOrganizations([
        {
          id: 'nccn',
          name: 'National Comprehensive Cancer Network',
          abbreviation: 'NCCN',
          description: 'Leading cancer treatment guidelines organization',
          website: 'https://www.nccn.org',
          credibility: 95,
          specialties: ['Oncology', 'Hematology'],
          lastSync: '2024-01-20T08:00:00Z'
        },
        {
          id: 'asco',
          name: 'American Society of Clinical Oncology',
          abbreviation: 'ASCO',
          description: 'Premier oncology professional organization',
          website: 'https://www.asco.org',
          credibility: 94,
          specialties: ['Oncology', 'Clinical Research'],
          lastSync: '2024-01-19T10:00:00Z'
        },
        {
          id: 'esmo',
          name: 'European Society for Medical Oncology',
          abbreviation: 'ESMO',
          description: 'Leading European oncology organization',
          website: 'https://www.esmo.org',
          credibility: 92,
          specialties: ['Oncology', 'Molecular Medicine'],
          lastSync: '2024-01-18T14:00:00Z'
        }
      ]);

      setProtocols([
        {
          id: 'nccn-breast-2024',
          title: 'NCCN Guidelines for Breast Cancer Treatment',
          description: 'Comprehensive evidence-based guidelines for breast cancer diagnosis, treatment, and follow-up care',
          category: 'Treatment Guidelines',
          subcategory: 'Breast Cancer',
          evidenceLevel: 'A',
          lastUpdated: '2024-01-15T00:00:00Z',
          version: '1.2024',
          organization: 'NCCN',
          cancerTypes: ['Breast Cancer', 'Invasive Ductal Carcinoma', 'Lobular Carcinoma'],
          treatmentPhase: ['Diagnosis', 'Primary Treatment', 'Adjuvant', 'Metastatic'],
          ageGroups: ['Adult', 'Elderly'],
          evidenceGrade: 'Category 1',
          status: 'active',
          tags: ['chemotherapy', 'immunotherapy', 'targeted-therapy', 'surgery'],
          recommendations: [
            {
              id: 'rec-001',
              level: 'strong',
              statement: 'HER2 testing should be performed on all invasive breast cancers',
              rationale: 'HER2 status determines eligibility for targeted therapy with trastuzumab',
              evidenceSummary: 'Multiple randomized controlled trials demonstrate improved outcomes with HER2-targeted therapy',
              implementation: 'Use FDA-approved assays (IHC or FISH) in certified laboratories',
              contraindications: [],
              considerations: ['Quality assurance requirements', 'Turnaround time impact on treatment']
            },
            {
              id: 'rec-002',
              level: 'strong',
              statement: 'Neoadjuvant chemotherapy is preferred for locally advanced breast cancer',
              rationale: 'Allows for downstaging and assessment of treatment response',
              evidenceSummary: 'Phase III trials show equivalent survival with improved surgical outcomes',
              implementation: 'Multidisciplinary team evaluation required before treatment initiation',
              contraindications: ['T1N0 disease', 'Contraindications to chemotherapy'],
              considerations: ['Patient preference', 'Fertility preservation needs']
            }
          ],
          references: [
            {
              id: 'ref-001',
              type: 'clinical-trial',
              title: 'Trastuzumab plus adjuvant chemotherapy for operable HER2-positive breast cancer',
              authors: 'Piccart-Gebhart MJ, et al.',
              journal: 'N Engl J Med',
              year: 2005,
              pmid: '16236738',
              doi: '10.1056/NEJMoa052306',
              evidenceQuality: 'high',
              relevanceScore: 95
            },
            {
              id: 'ref-002',
              type: 'meta-analysis',
              title: 'Neoadjuvant chemotherapy in breast cancer: a meta-analysis of randomized trials',
              authors: 'Mauri D, et al.',
              journal: 'J Natl Cancer Inst',
              year: 2005,
              pmid: '16249345',
              doi: '10.1093/jnci/dji315',
              evidenceQuality: 'high',
              relevanceScore: 88
            }
          ],
          implementation: {
            prerequisites: ['Multidisciplinary team available', 'Pathology services', 'Imaging capabilities'],
            contraindications: ['Active infection', 'Severe comorbidities', 'Patient refusal'],
            monitoringRequirements: ['CBC with differential', 'Comprehensive metabolic panel', 'ECHO/MUGA'],
            expectedOutcomes: ['Improved overall survival', 'Disease-free survival improvement'],
            commonChallenges: ['Patient compliance', 'Side effect management', 'Drug availability'],
            bestPractices: ['Regular team meetings', 'Patient education', 'Symptom monitoring']
          },
          metrics: {
            adoptionRate: 87,
            outcomeImprovement: 23,
            safetyProfile: 92,
            costEffectiveness: 'Cost-effective',
            patientSatisfaction: 89,
            clinicianFeedback: 91
          }
        },
        {
          id: 'asco-lung-2024',
          title: 'ASCO Guidelines for Non-Small Cell Lung Cancer',
          description: 'Evidence-based recommendations for NSCLC treatment across all stages',
          category: 'Treatment Guidelines',
          subcategory: 'Lung Cancer',
          evidenceLevel: 'A',
          lastUpdated: '2024-01-10T00:00:00Z',
          version: '2024.1',
          organization: 'ASCO',
          cancerTypes: ['Non-Small Cell Lung Cancer', 'Adenocarcinoma', 'Squamous Cell Carcinoma'],
          treatmentPhase: ['Screening', 'Diagnosis', 'Treatment', 'Surveillance'],
          ageGroups: ['Adult', 'Elderly'],
          evidenceGrade: 'Strong Recommendation',
          status: 'active',
          tags: ['immunotherapy', 'targeted-therapy', 'biomarkers', 'precision-medicine'],
          recommendations: [
            {
              id: 'rec-003',
              level: 'strong',
              statement: 'PD-L1 testing should be performed on all advanced NSCLC specimens',
              rationale: 'PD-L1 expression predicts response to immune checkpoint inhibitors',
              evidenceSummary: 'Multiple phase III trials demonstrate improved outcomes with PD-1/PD-L1 inhibitors',
              implementation: 'Use validated PD-L1 assays with appropriate scoring algorithms',
              contraindications: ['Insufficient tissue', 'Poor specimen quality'],
              considerations: ['Test turnaround time', 'Laboratory certification requirements']
            }
          ],
          references: [
            {
              id: 'ref-003',
              type: 'clinical-trial',
              title: 'Pembrolizumab versus Chemotherapy for PD-L1-Positive Non-Small-Cell Lung Cancer',
              authors: 'Reck M, et al.',
              journal: 'N Engl J Med',
              year: 2016,
              pmid: '27718847',
              doi: '10.1056/NEJMoa1606774',
              evidenceQuality: 'high',
              relevanceScore: 94
            }
          ],
          implementation: {
            prerequisites: ['Molecular testing capabilities', 'Immunotherapy administration facilities'],
            contraindications: ['Autoimmune disease', 'Immunosuppressive therapy'],
            monitoringRequirements: ['Immune-related adverse events monitoring', 'Tumor response assessment'],
            expectedOutcomes: ['Improved progression-free survival', 'Overall survival benefit'],
            commonChallenges: ['Immune-related toxicities', 'Cost considerations'],
            bestPractices: ['Early toxicity recognition', 'Patient education on side effects']
          },
          metrics: {
            adoptionRate: 82,
            outcomeImprovement: 31,
            safetyProfile: 85,
            costEffectiveness: 'High-value',
            patientSatisfaction: 86,
            clinicianFeedback: 88
          }
        },
        {
          id: 'esmo-crc-2024',
          title: 'ESMO Clinical Practice Guidelines for Colorectal Cancer',
          description: 'Comprehensive guidelines for colorectal cancer management from diagnosis to survivorship',
          category: 'Treatment Guidelines',
          subcategory: 'Colorectal Cancer',
          evidenceLevel: 'A',
          lastUpdated: '2024-01-08T00:00:00Z',
          version: '2024',
          organization: 'ESMO',
          cancerTypes: ['Colorectal Cancer', 'Colon Cancer', 'Rectal Cancer'],
          treatmentPhase: ['Screening', 'Diagnosis', 'Surgery', 'Adjuvant', 'Metastatic'],
          ageGroups: ['Adult', 'Elderly'],
          evidenceGrade: 'Level I Evidence',
          status: 'active',
          tags: ['microsatellite-instability', 'targeted-therapy', 'liver-resection'],
          recommendations: [
            {
              id: 'rec-004',
              level: 'strong',
              statement: 'MSI testing should be performed on all colorectal cancers',
              rationale: 'MSI-H tumors have different prognosis and treatment response patterns',
              evidenceSummary: 'MSI status predicts response to immunotherapy and adjuvant chemotherapy benefit',
              implementation: 'Use PCR or NGS-based MSI testing or MMR protein IHC',
              contraindications: [],
              considerations: ['Cost-effectiveness', 'Test availability']
            }
          ],
          references: [
            {
              id: 'ref-004',
              type: 'guideline',
              title: 'Metastatic colorectal cancer: ESMO Clinical Practice Guidelines',
              authors: 'Cervantes A, et al.',
              journal: 'Ann Oncol',
              year: 2023,
              pmid: '37076135',
              doi: '10.1016/j.annonc.2023.03.018',
              evidenceQuality: 'high',
              relevanceScore: 96
            }
          ],
          implementation: {
            prerequisites: ['Molecular testing laboratory', 'Multidisciplinary team'],
            contraindications: ['Palliative care only', 'Poor performance status'],
            monitoringRequirements: ['CEA levels', 'Imaging studies', 'Toxicity assessment'],
            expectedOutcomes: ['Improved survival', 'Quality of life preservation'],
            commonChallenges: ['Treatment sequencing', 'Resistance development'],
            bestPractices: ['Regular tumor board review', 'Patient-centered care']
          },
          metrics: {
            adoptionRate: 79,
            outcomeImprovement: 28,
            safetyProfile: 88,
            costEffectiveness: 'Cost-effective',
            patientSatisfaction: 84,
            clinicianFeedback: 87
          }
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    const matchesEvidenceLevel = selectedEvidenceLevel === 'all' || protocol.evidenceLevel === selectedEvidenceLevel;
    
    return matchesSearch && matchesCategory && matchesEvidenceLevel;
  });

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationLevelColor = (level: string) => {
    switch (level) {
      case 'strong': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'weak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProtocolsList = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search protocols, guidelines, or treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Treatment Guidelines">Treatment Guidelines</option>
            <option value="Diagnostic Protocols">Diagnostic Protocols</option>
            <option value="Safety Guidelines">Safety Guidelines</option>
          </select>
          
          <select
            value={selectedEvidenceLevel}
            onChange={(e) => setSelectedEvidenceLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Evidence Levels</option>
            <option value="A">Level A (Highest)</option>
            <option value="B">Level B (High)</option>
            <option value="C">Level C (Moderate)</option>
            <option value="D">Level D (Low)</option>
          </select>
        </div>
      </div>

      {/* Protocol Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProtocols.map(protocol => (
          <div key={protocol.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEvidenceLevelColor(protocol.evidenceLevel)}`}>
                      Level {protocol.evidenceLevel}
                    </span>
                    <span className="text-xs text-gray-500">{protocol.organization}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{protocol.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{protocol.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cancer Types</p>
                  <div className="flex flex-wrap gap-1">
                    {protocol.cancerTypes.slice(0, 2).map(type => (
                      <span key={type} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {type}
                      </span>
                    ))}
                    {protocol.cancerTypes.length > 2 && (
                      <span className="text-xs text-gray-500">+{protocol.cancerTypes.length - 2} more</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">{protocol.metrics.adoptionRate}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">+{protocol.metrics.outcomeImprovement}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated {new Date(protocol.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{protocol.recommendations.length} recommendations</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{protocol.references.length} references</span>
                  </div>
                  <button 
                    onClick={() => setSelectedProtocol(protocol)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProtocolDetail = () => {
    if (!selectedProtocol) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedProtocol(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowRight className="w-4 h-4 transform rotate-180" />
          <span>Back to Protocols</span>
        </button>

        {/* Protocol Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEvidenceLevelColor(selectedProtocol.evidenceLevel)}`}>
                  Evidence Level {selectedProtocol.evidenceLevel}
                </span>
                <span className="inline-flex px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                  {selectedProtocol.organization}
                </span>
                <span className="text-sm text-gray-500">Version {selectedProtocol.version}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProtocol.title}</h1>
              <p className="text-gray-600">{selectedProtocol.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Cancer Types</h4>
              <div className="space-y-1">
                {selectedProtocol.cancerTypes.map(type => (
                  <span key={type} className="block text-sm text-gray-600">{type}</span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Treatment Phases</h4>
              <div className="space-y-1">
                {selectedProtocol.treatmentPhase.map(phase => (
                  <span key={phase} className="block text-sm text-gray-600">{phase}</span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h4>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Adoption: {selectedProtocol.metrics.adoptionRate}%</div>
                <div className="text-sm text-gray-600">Improvement: +{selectedProtocol.metrics.outcomeImprovement}%</div>
                <div className="text-sm text-gray-600">Safety: {selectedProtocol.metrics.safetyProfile}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
          </div>
          <div className="p-6 space-y-6">
            {selectedProtocol.recommendations.map(rec => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationLevelColor(rec.level)}`}>
                        {rec.level} recommendation
                      </span>
                    </div>
                    <h4 className="text-base font-medium text-gray-900 mb-2">{rec.statement}</h4>
                    <p className="text-sm text-gray-600 mb-3">{rec.rationale}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Implementation</h5>
                    <p className="text-gray-600">{rec.implementation}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Evidence Summary</h5>
                    <p className="text-gray-600">{rec.evidenceSummary}</p>
                  </div>
                </div>
                
                {rec.contraindications.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <h5 className="text-sm font-medium text-red-900 mb-1">Contraindications</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {rec.contraindications.map((contraindication, index) => (
                        <li key={index}>• {contraindication}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Guidance */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Guidance</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Prerequisites</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {selectedProtocol.implementation.prerequisites.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {selectedProtocol.implementation.bestPractices.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* References */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Supporting Evidence</h3>
          </div>
          <div className="p-6 space-y-4">
            {selectedProtocol.references.map(ref => (
              <div key={ref.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ref.evidenceQuality === 'high' ? 'bg-green-100 text-green-800' :
                        ref.evidenceQuality === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {ref.evidenceQuality} quality
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {ref.type.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">Relevance: {ref.relevanceScore}%</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{ref.title}</h4>
                    <p className="text-sm text-gray-600">{ref.authors} • {ref.journal} • {ref.year}</p>
                    {ref.pmid && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">PMID: {ref.pmid}</span>
                        {ref.doi && <span className="text-xs text-gray-500">DOI: {ref.doi}</span>}
                      </div>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOrganizations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map(org => (
          <div key={org.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{org.abbreviation}</h3>
                <p className="text-sm text-gray-600 mt-1">{org.name}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">{org.credibility}%</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{org.description}</p>
            
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-medium text-gray-900 mb-1">Specialties</h4>
                <div className="flex flex-wrap gap-1">
                  {org.specialties.map(specialty => (
                    <span key={specialty} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Last sync: {new Date(org.lastSync).toLocaleDateString()}</span>
                <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
                  <Globe className="w-3 h-3" />
                  <span>Website</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading evidence-based protocols...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evidence-Based Clinical Protocols</h1>
            <p className="text-gray-600">Access current, evidence-based treatment guidelines from leading organizations</p>
          </div>
        </div>
      </div>

      {selectedProtocol ? (
        renderProtocolDetail()
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'protocols', label: 'Protocols', icon: BookOpen },
                { id: 'organizations', label: 'Organizations', icon: Award },
                { id: 'implementation', label: 'Implementation', icon: Target },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
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
          {activeTab === 'protocols' && renderProtocolsList()}
          {activeTab === 'organizations' && renderOrganizations()}
          {activeTab === 'implementation' && (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Implementation Tools</h3>
              <p className="text-gray-600">Implementation checklists and monitoring tools will be available here.</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Protocol Analytics</h3>
              <p className="text-gray-600">Usage analytics and outcome tracking will be displayed here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EvidenceBasedProtocolsSystem;