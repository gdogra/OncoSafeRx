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
  Target,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Calendar as CalendarIcon,
  User,
  Users2,
  Building,
  Clipboard,
  Timer,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Plus,
  Edit3,
  Archive,
  Settings,
  ChevronDown,
  ChevronUp
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

interface ImplementationPlan {
  id: string;
  protocolId: string;
  title: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: string;
  targetDate: string;
  completionDate?: string;
  progress: number;
  assignedTeam: string[];
  checklistItems: ChecklistItem[];
  milestones: Milestone[];
  barriers: Barrier[];
  resources: Resource[];
}

interface ChecklistItem {
  id: string;
  category: 'infrastructure' | 'training' | 'workflow' | 'documentation' | 'quality';
  title: string;
  description: string;
  isCompleted: boolean;
  completedBy?: string;
  completedDate?: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
  dependencies: string[];
}

interface Barrier {
  id: string;
  category: 'resource' | 'technical' | 'policy' | 'training' | 'resistance';
  description: string;
  impact: 'high' | 'medium' | 'low';
  status: 'identified' | 'addressing' | 'resolved';
  mitigationPlan: string;
  owner: string;
}

interface Resource {
  id: string;
  type: 'training' | 'documentation' | 'tools' | 'personnel' | 'budget';
  title: string;
  description: string;
  status: 'available' | 'needed' | 'in-progress';
  cost?: number;
  timeline: string;
}

interface AnalyticsData {
  protocolUsage: {
    protocolId: string;
    views: number;
    downloads: number;
    implementations: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  outcomeMetrics: {
    metric: string;
    current: number;
    target: number;
    trend: number;
    period: string;
  }[];
  complianceTracking: {
    protocolId: string;
    complianceRate: number;
    deviations: number;
    lastAssessment: string;
  }[];
  userEngagement: {
    activeUsers: number;
    avgSessionTime: number;
    mostViewedCategories: string[];
    feedbackScore: number;
  };
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
  const [implementationPlans, setImplementationPlans] = useState<ImplementationPlan[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEvidenceLevel, setSelectedEvidenceLevel] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol | null>(null);
  const [selectedImplementationPlan, setSelectedImplementationPlan] = useState<ImplementationPlan | null>(null);

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

      // Initialize implementation plans
      setImplementationPlans([
        {
          id: 'impl-001',
          protocolId: 'nccn-breast-2024',
          title: 'NCCN Breast Cancer Protocol Implementation',
          status: 'in-progress',
          startDate: '2024-01-01',
          targetDate: '2024-03-31',
          progress: 65,
          assignedTeam: ['Dr. Smith', 'Nurse Johnson', 'Pharmacist Lee'],
          checklistItems: [
            {
              id: 'check-001',
              category: 'infrastructure',
              title: 'Setup HER2 testing laboratory workflow',
              description: 'Establish validated HER2 testing protocols with certified laboratories',
              isCompleted: true,
              completedBy: 'Lab Manager Wilson',
              completedDate: '2024-01-15',
              priority: 'high',
              estimatedHours: 24
            },
            {
              id: 'check-002',
              category: 'training',
              title: 'Train oncology staff on new protocols',
              description: 'Comprehensive training on NCCN breast cancer guidelines updates',
              isCompleted: true,
              completedBy: 'Dr. Smith',
              completedDate: '2024-01-20',
              priority: 'high',
              estimatedHours: 16
            },
            {
              id: 'check-003',
              category: 'workflow',
              title: 'Integrate multidisciplinary team meetings',
              description: 'Establish weekly MDT meetings for treatment planning',
              isCompleted: false,
              priority: 'medium',
              estimatedHours: 8
            },
            {
              id: 'check-004',
              category: 'documentation',
              title: 'Update clinical pathways documentation',
              description: 'Revise all clinical pathway documents to reflect new guidelines',
              isCompleted: false,
              priority: 'medium',
              estimatedHours: 12
            },
            {
              id: 'check-005',
              category: 'quality',
              title: 'Implement quality monitoring system',
              description: 'Setup automated tracking for protocol adherence and outcomes',
              isCompleted: false,
              priority: 'high',
              estimatedHours: 20
            }
          ],
          milestones: [
            {
              id: 'mile-001',
              title: 'Infrastructure Setup Complete',
              description: 'All testing and workflow infrastructure in place',
              targetDate: '2024-01-31',
              isCompleted: true,
              completedDate: '2024-01-28',
              dependencies: []
            },
            {
              id: 'mile-002',
              title: 'Staff Training Complete',
              description: 'All clinical staff trained on new protocols',
              targetDate: '2024-02-15',
              isCompleted: true,
              completedDate: '2024-02-12',
              dependencies: ['mile-001']
            },
            {
              id: 'mile-003',
              title: 'Workflow Integration',
              description: 'New protocols fully integrated into clinical workflow',
              targetDate: '2024-03-15',
              isCompleted: false,
              dependencies: ['mile-002']
            },
            {
              id: 'mile-004',
              title: 'Quality Assurance',
              description: 'Quality monitoring and feedback systems operational',
              targetDate: '2024-03-31',
              isCompleted: false,
              dependencies: ['mile-003']
            }
          ],
          barriers: [
            {
              id: 'barrier-001',
              category: 'resource',
              description: 'Limited pathology lab capacity for HER2 testing',
              impact: 'medium',
              status: 'addressing',
              mitigationPlan: 'Partnering with external certified laboratory for overflow testing',
              owner: 'Lab Manager Wilson'
            },
            {
              id: 'barrier-002',
              category: 'training',
              description: 'Staff scheduling conflicts for training sessions',
              impact: 'low',
              status: 'resolved',
              mitigationPlan: 'Implemented multiple training sessions and online modules',
              owner: 'Dr. Smith'
            }
          ],
          resources: [
            {
              id: 'resource-001',
              type: 'training',
              title: 'NCCN Guidelines Training Program',
              description: 'Comprehensive online and in-person training modules',
              status: 'available',
              cost: 5000,
              timeline: '2 weeks'
            },
            {
              id: 'resource-002',
              type: 'tools',
              title: 'Quality Monitoring Software',
              description: 'Automated protocol adherence tracking system',
              status: 'in-progress',
              cost: 15000,
              timeline: '6 weeks'
            },
            {
              id: 'resource-003',
              type: 'documentation',
              title: 'Updated Clinical Pathways',
              description: 'Revised documentation reflecting new guidelines',
              status: 'needed',
              timeline: '3 weeks'
            }
          ]
        },
        {
          id: 'impl-002',
          protocolId: 'asco-lung-2024',
          title: 'ASCO NSCLC Immunotherapy Protocol',
          status: 'planning',
          startDate: '2024-02-01',
          targetDate: '2024-05-31',
          progress: 15,
          assignedTeam: ['Dr. Chen', 'Nurse Davis', 'Pharmacist Kim'],
          checklistItems: [
            {
              id: 'check-006',
              category: 'infrastructure',
              title: 'Setup PD-L1 testing capabilities',
              description: 'Establish validated PD-L1 testing with appropriate scoring',
              isCompleted: false,
              priority: 'high',
              estimatedHours: 32
            },
            {
              id: 'check-007',
              category: 'training',
              title: 'Immunotherapy administration training',
              description: 'Train nursing staff on immunotherapy protocols and toxicity management',
              isCompleted: false,
              priority: 'high',
              estimatedHours: 24
            }
          ],
          milestones: [
            {
              id: 'mile-005',
              title: 'PD-L1 Testing Operational',
              description: 'PD-L1 testing capability fully operational',
              targetDate: '2024-03-15',
              isCompleted: false,
              dependencies: []
            }
          ],
          barriers: [
            {
              id: 'barrier-003',
              category: 'technical',
              description: 'Need specialized equipment for PD-L1 testing',
              impact: 'high',
              status: 'identified',
              mitigationPlan: 'Equipment procurement and validation in progress',
              owner: 'Dr. Chen'
            }
          ],
          resources: [
            {
              id: 'resource-004',
              type: 'tools',
              title: 'PD-L1 Testing Equipment',
              description: 'Immunohistochemistry equipment for PD-L1 testing',
              status: 'needed',
              cost: 85000,
              timeline: '12 weeks'
            }
          ]
        }
      ]);

      // Initialize analytics data
      setAnalyticsData({
        protocolUsage: [
          {
            protocolId: 'nccn-breast-2024',
            views: 1547,
            downloads: 412,
            implementations: 23,
            trend: 'up'
          },
          {
            protocolId: 'asco-lung-2024',
            views: 1203,
            downloads: 338,
            implementations: 18,
            trend: 'up'
          },
          {
            protocolId: 'esmo-crc-2024',
            views: 892,
            downloads: 267,
            implementations: 15,
            trend: 'stable'
          }
        ],
        outcomeMetrics: [
          {
            metric: 'Protocol Adherence Rate',
            current: 87.5,
            target: 90.0,
            trend: 2.3,
            period: 'Last 30 days'
          },
          {
            metric: 'Time to Treatment',
            current: 14.2,
            target: 12.0,
            trend: -1.8,
            period: 'Days (avg)'
          },
          {
            metric: 'Patient Outcomes Score',
            current: 8.4,
            target: 8.5,
            trend: 0.7,
            period: 'Scale 1-10'
          },
          {
            metric: 'Cost Efficiency',
            current: 92.1,
            target: 95.0,
            trend: 1.5,
            period: 'Percentage'
          }
        ],
        complianceTracking: [
          {
            protocolId: 'nccn-breast-2024',
            complianceRate: 91.2,
            deviations: 8,
            lastAssessment: '2024-01-20'
          },
          {
            protocolId: 'asco-lung-2024',
            complianceRate: 85.7,
            deviations: 12,
            lastAssessment: '2024-01-18'
          },
          {
            protocolId: 'esmo-crc-2024',
            complianceRate: 88.9,
            deviations: 6,
            lastAssessment: '2024-01-19'
          }
        ],
        userEngagement: {
          activeUsers: 156,
          avgSessionTime: 18.7,
          mostViewedCategories: ['Treatment Guidelines', 'Diagnostic Protocols', 'Safety Guidelines'],
          feedbackScore: 4.2
        }
      });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return PlayCircle;
      case 'planning': return Timer;
      case 'on-hold': return PauseCircle;
      default: return StopCircle;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBarrierStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'addressing': return 'bg-yellow-100 text-yellow-800';
      case 'identified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderImplementationTab = () => {
    if (selectedImplementationPlan) {
      return renderImplementationPlanDetail();
    }

    return (
      <div className="space-y-6">
        {/* Implementation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Plans</h3>
                <p className="text-sm text-gray-600">Currently implementing</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {implementationPlans.filter(p => p.status === 'in-progress').length}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
                <p className="text-sm text-gray-600">Successfully implemented</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {implementationPlans.filter(p => p.status === 'completed').length}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Timer className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Avg Progress</h3>
                <p className="text-sm text-gray-600">Across all plans</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {Math.round(implementationPlans.reduce((acc, p) => acc + p.progress, 0) / implementationPlans.length)}%
            </div>
          </div>
        </div>

        {/* Implementation Plans List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Plans</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>New Plan</span>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {implementationPlans.map(plan => {
              const StatusIcon = getStatusIcon(plan.status);
              const completedItems = plan.checklistItems.filter(item => item.isCompleted).length;
              const totalItems = plan.checklistItems.length;
              const completedMilestones = plan.milestones.filter(m => m.isCompleted).length;
              const totalMilestones = plan.milestones.length;

              return (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <StatusIcon className="w-5 h-5 text-gray-600" />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                          {plan.status.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h4>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{plan.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${plan.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{completedItems}/{totalItems}</div>
                      <div className="text-xs text-gray-500">Checklist Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{completedMilestones}/{totalMilestones}</div>
                      <div className="text-xs text-gray-500">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{plan.barriers.filter(b => b.status !== 'resolved').length}</div>
                      <div className="text-xs text-gray-500">Active Barriers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{plan.assignedTeam.length}</div>
                      <div className="text-xs text-gray-500">Team Members</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{plan.assignedTeam.slice(0, 2).join(', ')}</span>
                        {plan.assignedTeam.length > 2 && (
                          <span className="text-sm text-gray-500">+{plan.assignedTeam.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedImplementationPlan(plan)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderImplementationPlanDetail = () => {
    if (!selectedImplementationPlan) return null;

    const plan = selectedImplementationPlan;
    const StatusIcon = getStatusIcon(plan.status);

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button 
          onClick={() => setSelectedImplementationPlan(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowRight className="w-4 h-4 transform rotate-180" />
          <span>Back to Implementation Plans</span>
        </button>

        {/* Plan Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <StatusIcon className="w-6 h-6 text-gray-600" />
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                  {plan.status.replace('-', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.targetDate).toLocaleDateString()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span className="font-semibold">{plan.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${plan.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Edit3 className="w-4 h-4" />
                <span>Edit Plan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Assigned Team</h4>
              <div className="space-y-1">
                {plan.assignedTeam.map(member => (
                  <div key={member} className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{member}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Timeline</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Started: {new Date(plan.startDate).toLocaleDateString()}</div>
                <div>Target: {new Date(plan.targetDate).toLocaleDateString()}</div>
                {plan.completionDate && (
                  <div>Completed: {new Date(plan.completionDate).toLocaleDateString()}</div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Checklist: {plan.checklistItems.filter(item => item.isCompleted).length}/{plan.checklistItems.length}</div>
                <div>Milestones: {plan.milestones.filter(m => m.isCompleted).length}/{plan.milestones.length}</div>
                <div>Barriers: {plan.barriers.filter(b => b.status !== 'resolved').length} active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Implementation Checklist</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {plan.checklistItems.map(item => (
                <div key={item.id} className={`border rounded-lg p-4 ${item.isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <input 
                          type="checkbox" 
                          checked={item.isCompleted}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          readOnly
                        />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority} priority
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <h4 className={`text-base font-medium mb-1 ${item.isCompleted ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Estimated: {item.estimatedHours}h</span>
                        {item.isCompleted && item.completedBy && (
                          <>
                            <span>•</span>
                            <span>Completed by {item.completedBy}</span>
                            <span>•</span>
                            <span>{new Date(item.completedDate!).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {plan.milestones.map((milestone, index) => (
                <div key={milestone.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      milestone.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {milestone.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    {index < plan.milestones.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-medium mb-1 ${milestone.isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                      {milestone.isCompleted && milestone.completedDate && (
                        <>
                          <span>•</span>
                          <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barriers and Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barriers */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Implementation Barriers</h3>
            </div>
            <div className="p-6 space-y-4">
              {plan.barriers.map(barrier => (
                <div key={barrier.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBarrierStatusColor(barrier.status)}`}>
                        {barrier.status}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        barrier.impact === 'high' ? 'bg-red-100 text-red-800' :
                        barrier.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {barrier.impact} impact
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{barrier.description}</p>
                  <div className="text-xs text-gray-600">
                    <div className="mb-1"><strong>Mitigation:</strong> {barrier.mitigationPlan}</div>
                    <div><strong>Owner:</strong> {barrier.owner}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Required Resources</h3>
            </div>
            <div className="p-6 space-y-4">
              {plan.resources.map(resource => (
                <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {resource.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.status === 'available' ? 'bg-green-100 text-green-800' :
                        resource.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resource.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Timeline: {resource.timeline}</span>
                    {resource.cost && <span>Cost: ${resource.cost.toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />;
      case 'stable': return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderAnalyticsTab = () => {
    if (!analyticsData) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Active Users</h3>
                <p className="text-sm text-gray-600">Monthly active</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{analyticsData.userEngagement.activeUsers}</div>
            <div className="text-sm text-gray-500 mt-1">+12% vs last month</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Avg Session</h3>
                <p className="text-sm text-gray-600">Minutes per visit</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">{analyticsData.userEngagement.avgSessionTime}</div>
            <div className="text-sm text-gray-500 mt-1">+8% vs last month</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Download className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Downloads</h3>
                <p className="text-sm text-gray-600">Total this month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-600">
              {analyticsData.protocolUsage.reduce((acc, p) => acc + p.downloads, 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">+15% vs last month</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Satisfaction</h3>
                <p className="text-sm text-gray-600">User feedback</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">{analyticsData.userEngagement.feedbackScore}/5</div>
            <div className="text-sm text-gray-500 mt-1">Based on 234 reviews</div>
          </div>
        </div>

        {/* Protocol Usage Analytics */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Protocol Usage Analytics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {analyticsData.protocolUsage.map(usage => {
                const protocol = protocols.find(p => p.id === usage.protocolId);
                return (
                  <div key={usage.protocolId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {protocol?.title || 'Unknown Protocol'}
                        </h4>
                        <p className="text-sm text-gray-600">{protocol?.organization}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(usage.trend)}
                        <span className="text-sm text-gray-600">{usage.trend}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{usage.views.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Total Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{usage.downloads.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{usage.implementations}</div>
                        <div className="text-xs text-gray-500">Implementations</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Outcome Metrics */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Clinical Outcome Metrics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsData.outcomeMetrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-900">{metric.metric}</h4>
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.trend > 0 ? '+' : ''}{metric.trend}%
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Current</span>
                      <span>Target</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{metric.current}</span>
                      <span className="text-lg font-medium text-gray-600">{metric.target}</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          metric.current >= metric.target ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">{metric.period}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Tracking */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Protocol Compliance Tracking</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {analyticsData.complianceTracking.map(compliance => {
                const protocol = protocols.find(p => p.id === compliance.protocolId);
                return (
                  <div key={compliance.protocolId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold text-gray-900 mb-1">
                          {protocol?.title || 'Unknown Protocol'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Last assessed: {new Date(compliance.lastAssessment).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{compliance.complianceRate}%</div>
                        <div className="text-xs text-gray-500">Compliance Rate</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              compliance.complianceRate >= 90 ? 'bg-green-500' :
                              compliance.complianceRate >= 75 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${compliance.complianceRate}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-center">
                        <div className="text-lg font-bold text-orange-600">{compliance.deviations}</div>
                        <div className="text-xs text-gray-500">Deviations</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Engagement Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Viewed Categories */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Most Viewed Categories</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.userEngagement.mostViewedCategories.map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-gold-100 text-gold-800' :
                        index === 1 ? 'bg-silver-100 text-silver-800' :
                        index === 2 ? 'bg-bronze-100 text-bronze-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category}</span>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${100 - (index * 25)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage Trends Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Usage Trends</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Interactive Charts</h4>
                <p className="text-gray-600 text-sm">Detailed usage trends and analytics charts would be displayed here with a charting library like Chart.js or D3.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Export and Reporting */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Analytics Reports</h3>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <PieChart className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-gray-900 mb-1">Usage Summary</h4>
                <p className="text-xs text-gray-600">Monthly protocol usage and adoption rates</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-gray-900 mb-1">Outcome Metrics</h4>
                <p className="text-xs text-gray-600">Clinical outcomes and improvement tracking</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <Gauge className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="text-sm font-medium text-gray-900 mb-1">Compliance Report</h4>
                <p className="text-xs text-gray-600">Protocol adherence and deviation analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          {activeTab === 'implementation' && renderImplementationTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
        </>
      )}
    </div>
  );
};

export default EvidenceBasedProtocolsSystem;