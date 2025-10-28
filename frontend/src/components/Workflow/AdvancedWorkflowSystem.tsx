import React, { useState, useEffect, useMemo, useRef } from 'react';
import regimenTemplates from '../../data/regimenTemplates';
import Alert from '../UI/Alert';
import { useToast } from '../UI/Toast';
import { 
  Workflow, 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  FileText,
  MessageSquare,
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Plus,
  ArrowRight,
  BarChart3,
  Zap,
  Target,
  Layers,
  GitBranch,
  Timer,
  Bell,
  Archive,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Copy,
  Share,
  Star,
  Flag,
  TrendingUp,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'patient-care' | 'medication-review' | 'treatment-planning' | 'quality-assurance' | 'research';
  steps: WorkflowStep[];
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'moderate' | 'complex';
  specialties: string[];
  tags: string[];
  usageCount: number;
  rating: number;
  createdBy: string;
  lastModified: string;
  isPublic: boolean;
  mobileOptimized: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'decision' | 'review' | 'approval' | 'notification';
  estimatedTime: number; // minutes
  dependencies: string[];
  assignedRole: string[];
  requiredData: string[];
  checklist: ChecklistItem[];
  automationRules?: AutomationRule[];
}

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  completed: boolean;
  notes?: string;
}

interface AutomationRule {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

interface WorkflowInstance {
  id: string;
  templateId: string;
  templateName: string;
  patientId?: string;
  patientName?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  currentStep: number;
  startedDate: string;
  completedDate?: string;
  assignedTo: string[];
  progress: number;
  stepStatuses: StepStatus[];
  notes: WorkflowNote[];
}

interface StepStatus {
  stepId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  startedDate?: string;
  completedDate?: string;
  assignedTo?: string;
  timeSpent?: number;
  notes?: string;
}

interface WorkflowNote {
  id: string;
  stepId?: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'decision' | 'issue' | 'approval';
}

interface MobileOptimization {
  deviceType: 'phone' | 'tablet' | 'desktop';
  screenSize: string;
  touchOptimized: boolean;
  offlineCapable: boolean;
  quickActions: QuickAction[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  shortcut?: string;
}

const AdvancedWorkflowSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'templates' | 'instances' | 'mobile' | 'analytics'>('dashboard');
  const [workflowTemplates, setWorkflowTemplates] = useState<WorkflowTemplate[]>([]);
  const [workflowInstances, setWorkflowInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    initializeWorkflowData();
    detectDeviceType();
  }, []);

  const detectDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType('phone');
    } else if (width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  const initializeWorkflowData = () => {
    setLoading(true);
    
    setTimeout(() => {
      setWorkflowTemplates([
        {
          id: 'template-001',
          name: 'New Patient Oncology Workup',
          description: 'Comprehensive workflow for new cancer patient evaluation and treatment planning',
          category: 'patient-care',
          estimatedDuration: 120,
          difficulty: 'complex',
          specialties: ['Oncology', 'Nursing'],
          tags: ['assessment', 'staging', 'multidisciplinary'],
          usageCount: 1247,
          rating: 4.8,
          createdBy: 'Dr. Sarah Chen',
          lastModified: '2024-01-15T10:00:00Z',
          isPublic: true,
          mobileOptimized: true,
          steps: [
            {
              id: 'step-001',
              title: 'Initial Assessment',
              description: 'Complete initial patient history and physical examination',
              type: 'task',
              estimatedTime: 30,
              dependencies: [],
              assignedRole: ['oncologist', 'nurse'],
              requiredData: ['medical-history', 'physical-exam', 'vital-signs'],
              checklist: [
                { id: 'check-001', text: 'Obtain complete medical history', required: true, completed: false },
                { id: 'check-002', text: 'Perform physical examination', required: true, completed: false },
                { id: 'check-003', text: 'Document performance status', required: true, completed: false },
                { id: 'check-004', text: 'Review prior imaging', required: false, completed: false }
              ]
            },
            {
              id: 'step-002',
              title: 'Diagnostic Workup',
              description: 'Order and review necessary diagnostic tests',
              type: 'task',
              estimatedTime: 45,
              dependencies: ['step-001'],
              assignedRole: ['oncologist'],
              requiredData: ['lab-orders', 'imaging-orders'],
              checklist: [
                { id: 'check-005', text: 'Order staging imaging', required: true, completed: false },
                { id: 'check-006', text: 'Order tumor markers', required: true, completed: false },
                { id: 'check-007', text: 'Order genetic testing if indicated', required: false, completed: false }
              ]
            },
            {
              id: 'step-003',
              title: 'Multidisciplinary Review',
              description: 'Present case at tumor board for treatment planning',
              type: 'review',
              estimatedTime: 30,
              dependencies: ['step-002'],
              assignedRole: ['oncologist', 'surgeon', 'radiation-oncologist'],
              requiredData: ['staging-results', 'pathology', 'imaging'],
              checklist: [
                { id: 'check-008', text: 'Prepare case presentation', required: true, completed: false },
                { id: 'check-009', text: 'Present at tumor board', required: true, completed: false },
                { id: 'check-010', text: 'Document recommendations', required: true, completed: false }
              ]
            },
            {
              id: 'step-004',
              title: 'Treatment Planning',
              description: 'Develop comprehensive treatment plan based on recommendations',
              type: 'task',
              estimatedTime: 15,
              dependencies: ['step-003'],
              assignedRole: ['oncologist'],
              requiredData: ['tumor-board-notes', 'patient-preferences'],
              checklist: [
                { id: 'check-011', text: 'Create treatment plan', required: true, completed: false },
                { id: 'check-012', text: 'Discuss with patient', required: true, completed: false },
                { id: 'check-013', text: 'Schedule follow-up', required: true, completed: false }
              ]
            }
          ]
        },
        {
          id: 'template-002',
          name: 'Chemotherapy Safety Check',
          description: 'Pre-chemotherapy safety verification and administration workflow',
          category: 'medication-review',
          estimatedDuration: 45,
          difficulty: 'moderate',
          specialties: ['Nursing', 'Pharmacy'],
          tags: ['safety', 'verification', 'administration'],
          usageCount: 3156,
          rating: 4.9,
          createdBy: 'Lisa Rodriguez, PharmD',
          lastModified: '2024-01-18T14:30:00Z',
          isPublic: true,
          mobileOptimized: true,
          steps: [
            {
              id: 'step-005',
              title: 'Patient Identification',
              description: 'Verify patient identity using two identifiers',
              type: 'task',
              estimatedTime: 5,
              dependencies: [],
              assignedRole: ['nurse'],
              requiredData: ['patient-id', 'patient-verification'],
              checklist: [
                { id: 'check-014', text: 'Verify patient name', required: true, completed: false },
                { id: 'check-015', text: 'Verify date of birth', required: true, completed: false },
                { id: 'check-016', text: 'Check patient wristband', required: true, completed: false }
              ]
            },
            {
              id: 'step-006',
              title: 'Pre-medication Assessment',
              description: 'Assess patient readiness for chemotherapy',
              type: 'task',
              estimatedTime: 15,
              dependencies: ['step-005'],
              assignedRole: ['nurse'],
              requiredData: ['vital-signs', 'lab-results', 'symptoms'],
              checklist: [
                { id: 'check-017', text: 'Check vital signs', required: true, completed: false },
                { id: 'check-018', text: 'Review recent lab results', required: true, completed: false },
                { id: 'check-019', text: 'Assess symptoms/toxicities', required: true, completed: false },
                { id: 'check-020', text: 'Verify allergies', required: true, completed: false }
              ]
            },
            {
              id: 'step-007',
              title: 'Medication Verification',
              description: 'Double-check medication orders and preparation',
              type: 'review',
              estimatedTime: 20,
              dependencies: ['step-006'],
              assignedRole: ['pharmacist', 'nurse'],
              requiredData: ['medication-orders', 'preparation-checklist'],
              checklist: [
                { id: 'check-021', text: 'Verify medication name and dose', required: true, completed: false },
                { id: 'check-022', text: 'Check expiration dates', required: true, completed: false },
                { id: 'check-023', text: 'Confirm route of administration', required: true, completed: false },
                { id: 'check-024', text: 'Two-person verification', required: true, completed: false }
              ]
            },
            {
              id: 'step-008',
              title: 'Administration',
              description: 'Safe administration of chemotherapy',
              type: 'task',
              estimatedTime: 5,
              dependencies: ['step-007'],
              assignedRole: ['nurse'],
              requiredData: ['verified-medications', 'administration-schedule'],
              checklist: [
                { id: 'check-025', text: 'Final patient verification', required: true, completed: false },
                { id: 'check-026', text: 'Document administration', required: true, completed: false },
                { id: 'check-027', text: 'Monitor for immediate reactions', required: true, completed: false }
              ]
            }
          ]
        },
        {
          id: 'template-003',
          name: 'Treatment Response Evaluation',
          description: 'Systematic evaluation of treatment response and next steps',
          category: 'quality-assurance',
          estimatedDuration: 60,
          difficulty: 'moderate',
          specialties: ['Oncology', 'Radiology'],
          tags: ['response', 'imaging', 'assessment'],
          usageCount: 892,
          rating: 4.6,
          createdBy: 'Dr. Michael Park',
          lastModified: '2024-01-12T09:15:00Z',
          isPublic: true,
          mobileOptimized: false,
          steps: [
            {
              id: 'step-009',
              title: 'Imaging Review',
              description: 'Review follow-up imaging studies',
              type: 'review',
              estimatedTime: 30,
              dependencies: [],
              assignedRole: ['radiologist', 'oncologist'],
              requiredData: ['current-imaging', 'baseline-imaging'],
              checklist: [
                { id: 'check-028', text: 'Compare to baseline imaging', required: true, completed: false },
                { id: 'check-029', text: 'Measure target lesions', required: true, completed: false },
                { id: 'check-030', text: 'Assess new lesions', required: true, completed: false },
                { id: 'check-031', text: 'Apply RECIST criteria', required: true, completed: false }
              ]
            },
            {
              id: 'step-010',
              title: 'Clinical Assessment',
              description: 'Evaluate clinical response and patient status',
              type: 'task',
              estimatedTime: 20,
              dependencies: ['step-009'],
              assignedRole: ['oncologist'],
              requiredData: ['imaging-results', 'lab-results', 'patient-symptoms'],
              checklist: [
                { id: 'check-032', text: 'Review tumor markers', required: true, completed: false },
                { id: 'check-033', text: 'Assess symptom improvement', required: true, completed: false },
                { id: 'check-034', text: 'Evaluate performance status', required: true, completed: false }
              ]
            },
            {
              id: 'step-011',
              title: 'Treatment Planning',
              description: 'Determine next treatment steps',
              type: 'decision',
              estimatedTime: 10,
              dependencies: ['step-010'],
              assignedRole: ['oncologist'],
              requiredData: ['response-assessment', 'patient-preferences'],
              checklist: [
                { id: 'check-035', text: 'Determine response category', required: true, completed: false },
                { id: 'check-036', text: 'Plan next steps', required: true, completed: false },
                { id: 'check-037', text: 'Schedule follow-up', required: true, completed: false }
              ]
            }
          ]
        },
        // Append curated regimen templates
        ...regimenTemplates as any,
      ]);

      setWorkflowInstances([
        {
          id: 'instance-001',
          templateId: 'template-001',
          templateName: 'New Patient Oncology Workup',
          patientId: 'patient-123',
          patientName: 'Sarah Chen',
          status: 'active',
          currentStep: 2,
          startedDate: '2024-01-20T08:00:00Z',
          assignedTo: ['Dr. Michael Park', 'Nurse Johnson'],
          progress: 50,
          stepStatuses: [
            { stepId: 'step-001', status: 'completed', startedDate: '2024-01-20T08:00:00Z', completedDate: '2024-01-20T08:30:00Z', assignedTo: 'Dr. Michael Park', timeSpent: 30 },
            { stepId: 'step-002', status: 'in-progress', startedDate: '2024-01-20T08:30:00Z', assignedTo: 'Dr. Michael Park' },
            { stepId: 'step-003', status: 'pending' },
            { stepId: 'step-004', status: 'pending' }
          ],
          notes: [
            { id: 'note-001', stepId: 'step-001', author: 'Dr. Michael Park', content: 'Patient has good performance status. No significant comorbidities.', timestamp: '2024-01-20T08:25:00Z', type: 'comment' }
          ]
        },
        {
          id: 'instance-002',
          templateId: 'template-002',
          templateName: 'Chemotherapy Safety Check',
          patientId: 'patient-456',
          patientName: 'James Wilson',
          status: 'completed',
          currentStep: 4,
          startedDate: '2024-01-20T10:00:00Z',
          completedDate: '2024-01-20T10:45:00Z',
          assignedTo: ['Nurse Smith', 'PharmD Rodriguez'],
          progress: 100,
          stepStatuses: [
            { stepId: 'step-005', status: 'completed', startedDate: '2024-01-20T10:00:00Z', completedDate: '2024-01-20T10:05:00Z', timeSpent: 5 },
            { stepId: 'step-006', status: 'completed', startedDate: '2024-01-20T10:05:00Z', completedDate: '2024-01-20T10:20:00Z', timeSpent: 15 },
            { stepId: 'step-007', status: 'completed', startedDate: '2024-01-20T10:20:00Z', completedDate: '2024-01-20T10:40:00Z', timeSpent: 20 },
            { stepId: 'step-008', status: 'completed', startedDate: '2024-01-20T10:40:00Z', completedDate: '2024-01-20T10:45:00Z', timeSpent: 5 }
          ],
          notes: []
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  // Derived: filtered templates
  const filteredTemplates = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return workflowTemplates.filter(t => {
      const matchesCategory = selectedCategory === 'all' || t.category === (selectedCategory as any);
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.join(' ').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [workflowTemplates, searchTerm, selectedCategory]);

  const notify = (type: 'success'|'info'|'warning'|'error', message: string) => {
    showToast(type, message);
  };

  const startWorkflow = (template: WorkflowTemplate) => {
    const now = new Date().toISOString();
    const stepStatuses: StepStatus[] = template.steps.map((s, idx) => ({
      stepId: s.id,
      status: idx === 0 ? 'in-progress' : 'pending',
      startedDate: idx === 0 ? now : undefined
    }));
    const instance: WorkflowInstance = {
      id: `instance-${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      patientId: 'patient-demo',
      patientName: 'Demo Patient',
      status: 'active',
      currentStep: 1,
      startedDate: now,
      assignedTo: ['You'],
      progress: 0,
      stepStatuses,
      notes: []
    };
    setWorkflowInstances(prev => [instance, ...prev]);
    setActiveTab('instances');
    notify('success', `Started workflow: ${template.name}`);
  };

  const continueWorkflow = (instance: WorkflowInstance) => {
    setActiveTab('instances');
    notify('info', `Continuing workflow for ${instance.patientName}`);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'start-new-workflow': {
        const template = workflowTemplates[0] || filteredTemplates[0];
        if (template) startWorkflow(template);
        else notify('warning', 'No templates available to start.');
        break;
      }
      case 'search-patient': {
        setActiveTab('templates');
        setTimeout(() => searchInputRef.current?.focus(), 0);
        notify('info', 'Search ready — type to filter templates.');
        break;
      }
      case 'quick-safety-check': {
        notify('info', 'Launching quick safety check (demo).');
        break;
      }
      case 'emergency-workflow': {
        const emergency: WorkflowTemplate = {
          id: 'template-emergency',
          name: 'Emergency Response Protocol',
          description: 'Rapid response sequence for clinical emergencies',
          category: 'patient-care',
          estimatedDuration: 15,
          difficulty: 'complex',
          specialties: ['ER', 'Nursing'],
          tags: ['emergency','rapid'],
          usageCount: 0,
          rating: 5,
          createdBy: 'System',
          lastModified: new Date().toISOString(),
          isPublic: false,
          mobileOptimized: true,
          steps: [
            { id: 'e1', title: 'Assess ABCs', description: 'Airway, Breathing, Circulation', type: 'task', estimatedTime: 1, dependencies: [], assignedRole: ['nurse','physician'], requiredData: [], checklist: [] },
            { id: 'e2', title: 'Call Code', description: 'Alert code team', type: 'notification', estimatedTime: 1, dependencies: ['e1'], assignedRole: ['nurse'], requiredData: [], checklist: [] },
            { id: 'e3', title: 'Stabilize', description: 'Immediate stabilization measures', type: 'task', estimatedTime: 10, dependencies: ['e2'], assignedRole: ['team'], requiredData: [], checklist: [] }
          ]
        };
        startWorkflow(emergency);
        break;
      }
      default:
        notify('warning', 'Action not implemented.');
    }
  };

  const quickActions: QuickAction[] = [
    { id: 'start-workflow', label: 'Start Workflow', icon: 'Play', action: 'start-new-workflow' },
    { id: 'patient-search', label: 'Find Patient', icon: 'Search', action: 'search-patient' },
    { id: 'safety-check', label: 'Safety Check', icon: 'Shield', action: 'quick-safety-check' },
    { id: 'emergency', label: 'Emergency', icon: 'AlertTriangle', action: 'emergency-workflow' }
  ];

  const iconMap: Record<string, React.ComponentType<any>> = {
    Play,
    Search,
    Shield,
    AlertTriangle
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
        <h2 className="text-lg font-semibold mb-2">Workflow Mobile</h2>
        <p className="text-sm text-blue-100">Optimized for {deviceType} • Touch-friendly interface</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.action)}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {(() => { const Icon = iconMap[action.icon] || Play; return <Icon className="w-6 h-6 text-blue-600 mb-2" />; })()}
              <span className="text-sm font-medium text-blue-900">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Workflows</h3>
        <div className="space-y-3">
          {workflowInstances.filter(instance => instance.status === 'active').map(instance => (
            <div key={instance.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">{instance.patientName}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(instance.status)}`}>
                  {instance.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{instance.templateName}</p>
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${instance.progress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{instance.progress}%</span>
              </div>
              <button onClick={() => continueWorkflow(instance)} className="mt-2 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                Continue Workflow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Device Optimization Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mobile Optimization</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Device Type</span>
            <span className="text-sm font-medium text-gray-900 capitalize">{deviceType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Touch Optimized</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Offline Capable</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Voice Commands</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Workflows</p>
              <p className="text-2xl font-bold text-blue-600">{workflowInstances.filter(i => i.status === 'active').length}</p>
            </div>
            <Workflow className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-green-600">{workflowInstances.filter(i => i.status === 'completed').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Templates Available</p>
              <p className="text-2xl font-bold text-purple-600">{workflowTemplates.length}</p>
            </div>
            <Layers className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Completion Time</p>
              <p className="text-2xl font-bold text-orange-600">47m</p>
            </div>
            <Timer className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Workflows</h3>
        </div>
        <div className="p-6">
          {workflowInstances.filter(instance => instance.status === 'active').map(instance => (
            <div key={instance.id} className="border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-base font-medium text-gray-900">{instance.patientName}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(instance.status)}`}>
                      {instance.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{instance.templateName}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Step {instance.currentStep} of {instance.stepStatuses.length}</span>
                    <span>Started: {new Date(instance.startedDate).toLocaleString()}</span>
                    <span>Assigned: {instance.assignedTo.join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{instance.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${instance.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {instance.stepStatuses.map((step, index) => (
                    <div key={step.stepId} className={`w-3 h-3 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'in-progress' ? 'bg-blue-500' :
                      'bg-gray-300'
                    }`} title={`Step ${index + 1}: ${step.status}`} />
                  ))}
                </div>
                <button onClick={() => continueWorkflow(instance)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  Continue Workflow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Templates */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Popular Workflow Templates</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflowTemplates.slice(0, 3).map(template => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-600">{template.description}</p>
                  </div>
                  {template.mobileOptimized && (
                    <Smartphone className="w-4 h-4 text-green-500" aria-label="Mobile Optimized" />
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-gray-600">{template.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{template.usageCount} uses</span>
                  <span>{template.estimatedDuration}m</span>
                </div>
                
                <button onClick={() => startWorkflow(template)} className="mt-3 w-full px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors">
                  Start Workflow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search workflow templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                ref={searchInputRef}
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
            <option value="patient-care">Patient Care</option>
            <option value="medication-review">Medication Review</option>
            <option value="treatment-planning">Treatment Planning</option>
            <option value="quality-assurance">Quality Assurance</option>
            <option value="research">Research</option>
            <option value="chemotherapy">Chemotherapy</option>
            <option value="immunotherapy">Immunotherapy</option>
            <option value="targeted-therapy">Targeted Therapy</option>
            <option value="supportive-care">Supportive Care</option>
          </select>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {template.mobileOptimized && (
                    <Smartphone className="w-4 h-4 text-green-500" aria-label="Mobile Optimized" />
                  )}
                  {template.isPublic && (
                    <Flag className="w-4 h-4 text-blue-500" aria-label="Public Template" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-xs text-gray-500">Duration</span>
                <p className="text-sm font-medium text-gray-900">{template.estimatedDuration} minutes</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Difficulty</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(template.difficulty)}`}>
                  {template.difficulty}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500">Usage</span>
                <p className="text-sm font-medium text-gray-900">{template.usageCount} times</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">{template.rating}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs text-gray-500 mb-1 block">Specialties</span>
              <div className="flex flex-wrap gap-1">
                {template.specialties.map(specialty => (
                  <span key={specialty} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs text-gray-500 mb-1 block">Steps ({template.steps.length})</span>
              <div className="space-y-1">
                {template.steps.slice(0, 3).map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-2 text-xs">
                    <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{step.title}</span>
                    <span className="text-gray-400">({step.estimatedTime}m)</span>
                  </div>
                ))}
                {template.steps.length > 3 && (
                  <div className="text-xs text-gray-500">+{template.steps.length - 3} more steps</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                By {template.createdBy} • {new Date(template.lastModified).toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSelectedTemplate(template)}
                  className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Details
                </button>
                <button onClick={() => startWorkflow(template)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                  Start Workflow
                </button>
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
          <span className="text-gray-600">Loading workflow system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Workflow className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced Workflow & Mobile System</h1>
            <p className="text-gray-600">Streamlined clinical workflows with mobile optimization for point-of-care efficiency</p>
          </div>
        </div>
      </div>

      {/* Toasts rendered globally by ToastProvider */}

      {/* Mobile-First Quick Access (visible on smaller screens) */}
      {deviceType !== 'desktop' && (
        <div className="mb-6 lg:hidden">
          {renderMobileView()}
        </div>
      )}

      {/* Desktop Tabs */}
      <div className="hidden lg:block">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'templates', label: 'Templates', icon: Layers },
              { id: 'instances', label: 'Active Workflows', icon: Workflow },
              { id: 'mobile', label: 'Mobile Optimization', icon: Smartphone },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'instances' && workflowInstances.filter(i => i.status === 'active').length > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {workflowInstances.filter(i => i.status === 'active').length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'instances' && (
          <div className="space-y-4">
            {workflowInstances.length === 0 && (
              <div className="text-center py-12">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow instances yet</h3>
                <p className="text-gray-600">Start one from Dashboard or Templates.</p>
              </div>
            )}
            {workflowInstances.map(instance => (
              <div key={instance.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{instance.patientName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(instance.status)}`}>{instance.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">{instance.templateName}</div>
                  </div>
                  <button onClick={() => continueWorkflow(instance)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">Open</button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${instance.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'mobile' && renderMobileView()}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Analytics</h3>
            <p className="text-gray-600">Performance metrics and usage analytics will be shown here.</p>
          </div>
        )}
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Category</span>
                <div className="font-medium capitalize">{selectedTemplate.category.replace('-', ' ')}</div>
              </div>
              <div>
                <span className="text-gray-500">Duration</span>
                <div className="font-medium">{selectedTemplate.estimatedDuration} minutes</div>
              </div>
              <div>
                <span className="text-gray-500">Difficulty</span>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(selectedTemplate.difficulty)}`}>{selectedTemplate.difficulty}</div>
              </div>
              <div>
                <span className="text-gray-500">Specialties</span>
                <div className="font-medium">{selectedTemplate.specialties.join(', ')}</div>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500">Steps</span>
              <ol className="mt-2 space-y-2">
                {selectedTemplate.steps.map((s, i) => (
                  <li key={s.id} className="flex items-start space-x-2 text-sm">
                    <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs">{i + 1}</span>
                    <div>
                      <div className="font-medium text-gray-900">{s.title}</div>
                      <div className="text-gray-600">{s.description}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Dose Guidance (beta) */}
            {selectedTemplate.doseRules && (
              <DoseGuidancePanel template={selectedTemplate as any} />
            )}
            <div className="mt-6 flex items-center justify-end space-x-2">
              <button onClick={() => setSelectedTemplate(null)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
              <button onClick={() => { startWorkflow(selectedTemplate); setSelectedTemplate(null); }} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Start Workflow</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedWorkflowSystem;

// Inline subcomponent: Dose Guidance Panel
const DoseGuidancePanel: React.FC<{ template: any }> = ({ template }) => {
  const [anc, setAnc] = React.useState<string>('');
  const [platelets, setPlatelets] = React.useState<string>('');
  const [bili, setBili] = React.useState<string>('');
  const [crcl, setCrcl] = React.useState<string>('');
  const [neuropathy, setNeuropathy] = React.useState<string>('');
  const [diarrhea, setDiarrhea] = React.useState<string>('');

  // Prefill from current patient if available
  let currentPatient: any = null;
  try {
    const { usePatient } = require('../../context/PatientContext');
    const pc = usePatient();
    currentPatient = pc?.state?.currentPatient || null;
  } catch {}

  React.useEffect(() => {
    try {
      if (!currentPatient) return;
      const labs = Array.isArray(currentPatient.labValues) ? currentPatient.labValues : [];
      // Normalize lab types to canonical keys
      const canonicalMap: Record<string, string> = {
        // ANC
        'anc': 'anc',
        'absolute neutrophil count': 'anc',
        'neutrophils absolute': 'anc',
        'neutrophil absolute count': 'anc',
        'neutrophils': 'anc',
        // Platelets
        'platelets': 'platelets',
        'plt': 'platelets',
        'platelet count': 'platelets',
        // Bilirubin
        'bilirubin': 'bilirubin',
        'tbili': 'bilirubin',
        't.bili': 'bilirubin',
        'total bilirubin': 'bilirubin',
        'bilirubin total': 'bilirubin',
        // Creatinine
        'creatinine': 'creatinine',
        'serum creatinine': 'creatinine',
        'scr': 'creatinine',
        'creatinine serum': 'creatinine',
      };
      const normalizeType = (s: any) => canonicalMap[String(s || '').toLowerCase().trim()] || null;
      // Build latest map by canonical type
      const latest: Record<string, any> = {};
      labs.forEach((lab: any) => {
        const key = normalizeType(lab.labType);
        if (!key) return;
        // Prefer the latest by timestamp if present
        if (!latest[key]) latest[key] = lab;
        else {
          const curTs = new Date(latest[key]?.timestamp || 0).getTime();
          const newTs = new Date(lab?.timestamp || 0).getTime();
          if (newTs > curTs) latest[key] = lab;
        }
      });
      const ancLab = latest['anc'];
      const pltLab = latest['platelets'];
      const biliLab = latest['bilirubin'];
      const crLab = latest['creatinine'];
      if (ancLab?.value != null) setAnc(String(ancLab.value));
      if (pltLab?.value != null) setPlatelets(String(pltLab.value));
      if (biliLab?.value != null) setBili(String(biliLab.value));
      // Rough CrCl estimate if weight/age/sex available; otherwise leave CrCl blank
      if (crLab?.value != null && currentPatient.demographics) {
        const weightKg = Number(currentPatient.demographics.weightKg) || 70;
        const age = (() => {
          const dob = currentPatient.demographics.dateOfBirth;
          if (!dob) return 60;
          try { return new Date().getFullYear() - new Date(dob).getFullYear(); } catch { return 60; }
        })();
        const sex = String(currentPatient.demographics.sex || 'other').toLowerCase();
        const scr = Number(crLab.value);
        const crclEstimate = isFinite(scr) && scr > 0
          ? Math.round(((140 - age) * weightKg * (sex === 'female' ? 0.85 : 1)) / (72 * scr))
          : undefined;
        if (crclEstimate) setCrcl(String(crclEstimate));
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!currentPatient]);

  const t = template?.doseRules?.thresholds || {};

  const toNum = (v: string) => {
    const n = Number(v);
    return isFinite(n) ? n : undefined;
  };

  const suggestions = React.useMemo(() => {
    const recs: string[] = [];
    const ancV = toNum(anc); const pltV = toNum(platelets); const biliV = toNum(bili); const crV = toNum(crcl);
    const neuG = toNum(neuropathy); const diaG = toNum(diarrhea);
    if (t.ancMin && ancV !== undefined && ancV < t.ancMin) recs.push('ANC below threshold: hold treatment and repeat CBC; consider G‑CSF based on risk.');
    if (t.plateletsMin && pltV !== undefined && pltV < t.plateletsMin) recs.push('Platelets below threshold: delay treatment until recovery.');
    if (t.totalBilirubinMax && biliV !== undefined && biliV > t.totalBilirubinMax) recs.push('Elevated bilirubin: consider dose adjustment/hold per protocol.');
    if (t.crclMin && crV !== undefined && crV < t.crclMin) recs.push('Low CrCl: adjust renally cleared agents or delay per protocol.');
    if (t.neuropathyGradeHold && neuG !== undefined && neuG >= t.neuropathyGradeHold) recs.push('Neuropathy grade high: hold neurotoxic agent (e.g., oxaliplatin) and resume reduced or omit.');
    if (t.diarrheaGradeHold && diaG !== undefined && diaG >= t.diarrheaGradeHold) recs.push('Diarrhea grade high: hold offending agent (e.g., irinotecan) and manage with antidiarrheals; resume reduced.');
    return recs;
  }, [anc, platelets, bili, crcl, neuropathy, diarrhea, t]);

  return (
    <div className="mt-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-amber-900">Dose Guidance (beta)</h4>
        <span className="text-[11px] text-amber-700">Experimental — verify with institutional policy</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {t.ancMin !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">ANC (cells/µL) • min {t.ancMin}</label>
            <input value={anc} onChange={(e) => setAnc(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 1800" />
          </div>
        )}
        {t.plateletsMin !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Platelets (cells/µL) • min {t.plateletsMin}</label>
            <input value={platelets} onChange={(e) => setPlatelets(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 120000" />
          </div>
        )}
        {t.totalBilirubinMax !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Total Bilirubin (mg/dL) • max {t.totalBilirubinMax}</label>
            <input value={bili} onChange={(e) => setBili(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 1.2" />
          </div>
        )}
        {t.crclMin !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">CrCl (mL/min) • min {t.crclMin}</label>
            <input value={crcl} onChange={(e) => setCrcl(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 60" />
          </div>
        )}
        {t.neuropathyGradeHold !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Neuropathy Grade (0–4) • hold ≥ {t.neuropathyGradeHold}</label>
            <input value={neuropathy} onChange={(e) => setNeuropathy(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 1" />
          </div>
        )}
        {t.diarrheaGradeHold !== undefined && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Diarrhea Grade (0–4) • hold ≥ {t.diarrheaGradeHold}</label>
            <input value={diarrhea} onChange={(e) => setDiarrhea(e.target.value)} className="w-full border rounded px-2 py-1" placeholder="e.g., 0" />
          </div>
        )}
      </div>
      <div className="mt-3 text-sm">
        <div className="text-xs text-gray-600 mb-1">Recommendations</div>
        {suggestions.length === 0 ? (
          <div className="text-gray-600">No automatic holds suggested based on entered values. Verify per regimen policy.</div>
        ) : (
          <ul className="list-disc ml-5 space-y-1 text-gray-800">
            {suggestions.map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
        )}
        {template?.doseRules?.adjustments?.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            <div className="font-medium text-gray-700 mb-1">Additional guidance:</div>
            <ul className="list-disc ml-5 space-y-1">
              {template.doseRules.adjustments.map((a: any, i: number) => (
                <li key={i}><span className="text-gray-700">{a.condition}:</span> {a.recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
