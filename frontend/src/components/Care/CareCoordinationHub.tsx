import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Phone, 
  Video, 
  FileText, 
  Heart,
  Activity,
  TrendingUp,
  Bell,
  Map,
  Shield,
  Target,
  Zap,
  Brain,
  Stethoscope,
  Pill,
  Hospital,
  UserCheck,
  Send,
  Filter,
  Download,
  Plus,
  Edit3,
  Share,
  Eye,
  AlertCircle,
  ChevronRight,
  Search,
  Mail
} from 'lucide-react';
import { careplanService, type CareTeamMember, type CareTask, type CarePlan, type CommunicationThread } from '../../services/careplanService';
import { useToast } from '../UI/Toast';
import Alert from '../UI/Alert';
import { useVisitorTracking } from '../../hooks/useVisitorTracking';


export const CareCoordinationHub: React.FC = () => {
  const { showToast } = useToast();
  const { trackEvent } = useVisitorTracking();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'plans' | 'communication' | 'analytics'>('overview');
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [carePlans, setCarePlans] = useState<CarePlan[]>([]);
  const [communications, setCommunications] = useState<CommunicationThread[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [teamData, tasksData, plansData, communicationsData] = await Promise.all([
          careplanService.getCareTeam(),
          careplanService.getCareTasks(),
          careplanService.getCarePlans(),
          careplanService.getCommunications()
        ]);
        
        setCareTeam(teamData);
        setCareTasks(tasksData);
        setCarePlans(plansData);
        setCommunications(communicationsData);
        
        // Track care coordination hub view
        trackEvent('care_coordination_hub_viewed', {
          tab: activeTab,
          team_size: teamData.length,
          tasks_count: tasksData.length,
          plans_count: plansData.length
        });
      } catch (err) {
        setError('Failed to load care coordination data');
        console.error('Error fetching care coordination data:', err);
        
        // Track error
        trackEvent('care_coordination_hub_error', {
          error: 'failed_to_load_data',
          tab: activeTab
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, trackEvent]);

  const handleTaskStatusUpdate = async (taskId: string, newStatus: CareTask['status']) => {
    try {
      // Track task update attempt
      trackEvent('care_task_status_update_attempted', {
        task_id: taskId,
        new_status: newStatus,
        tab: activeTab
      });
      
      await careplanService.updateTaskStatus(taskId, newStatus);
      setCareTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      showToast('success', 'Task status updated successfully');
      
      // Track successful update
      trackEvent('care_task_status_updated', {
        task_id: taskId,
        new_status: newStatus,
        tab: activeTab
      });
    } catch (err) {
      showToast('error', 'Failed to update task status');
      
      // Track error
      trackEvent('care_task_status_update_error', {
        task_id: taskId,
        new_status: newStatus,
        error: 'update_failed',
        tab: activeTab
      });
    }
  };

  const handleSendMessage = async (subject: string, content: string, recipients: string[]) => {
    try {
      // Track message attempt
      trackEvent('care_message_send_attempted', {
        recipients_count: recipients.length,
        has_subject: !!subject,
        tab: activeTab
      });
      
      await careplanService.sendMessage(subject, content, recipients);
      showToast('success', 'Message sent successfully');
      
      // Refresh communications
      const updatedCommunications = await careplanService.getCommunications();
      setCommunications(updatedCommunications);
      
      // Track successful send
      trackEvent('care_message_sent', {
        recipients_count: recipients.length,
        tab: activeTab
      });
    } catch (err) {
      showToast('error', 'Failed to send message');
      
      // Track error
      trackEvent('care_message_send_error', {
        recipients_count: recipients.length,
        error: 'send_failed',
        tab: activeTab
      });
    }
  };

  // Track tab changes
  const handleTabChange = (newTab: 'overview' | 'team' | 'tasks' | 'plans' | 'communication' | 'analytics') => {
    setActiveTab(newTab);
    
    trackEvent('care_coordination_tab_changed', {
      from_tab: activeTab,
      to_tab: newTab
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading care coordination data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert type="error" title="Failed to Load Data">
          {error}
        </Alert>
      </div>
    );
  }

  // Old mock data initialization removed
  /*
    const mockCareTeam: CareTeamMember[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        role: 'oncologist',
        specialty: 'Medical Oncology',
        hospital: 'Memorial Cancer Center',
        department: 'Oncology',
        email: 'sarah.chen@memorial.org',
        phone: '(555) 123-4567',
        availability: 'available',
        lastActive: '2024-10-17T10:30:00Z',
        certifications: ['Board Certified Oncology', 'Immunotherapy Specialist'],
        yearsExperience: 12
      },
      {
        id: '2',
        name: 'Jennifer Martinez, RN',
        role: 'nurse',
        specialty: 'Oncology Nursing',
        hospital: 'Memorial Cancer Center',
        department: 'Infusion Center',
        email: 'j.martinez@memorial.org',
        phone: '(555) 123-4568',
        availability: 'busy',
        lastActive: '2024-10-17T09:45:00Z',
        certifications: ['OCN', 'Chemotherapy Administration'],
        yearsExperience: 8
      },
      {
        id: '3',
        name: 'Dr. Michael Thompson',
        role: 'pharmacist',
        specialty: 'Oncology Pharmacy',
        hospital: 'Memorial Cancer Center',
        department: 'Pharmacy',
        email: 'michael.thompson@memorial.org',
        phone: '(555) 123-4569',
        availability: 'available',
        lastActive: '2024-10-17T11:15:00Z',
        certifications: ['Board Certified Oncology Pharmacist', 'PharmD'],
        yearsExperience: 15
      }
    ];

    const mockTasks: CareTask[] = [
      {
        id: '1',
        title: 'Pre-chemo lab work review',
        description: 'Review CBC, CMP, and liver function tests before next chemotherapy cycle',
        type: 'lab',
        priority: 'high',
        status: 'pending',
        assignedTo: '1',
        assignedBy: '1',
        dueDate: '2024-10-18T09:00:00Z',
        createdAt: '2024-10-16T14:30:00Z',
        patientId: 'patient-1'
      },
      {
        id: '2',
        title: 'Medication interaction review',
        description: 'Check for interactions with new antiemetic prescription',
        type: 'medication',
        priority: 'medium',
        status: 'in_progress',
        assignedTo: '3',
        assignedBy: '1',
        dueDate: '2024-10-17T16:00:00Z',
        createdAt: '2024-10-17T08:00:00Z',
        patientId: 'patient-1'
      },
      {
        id: '3',
        title: 'Patient education on side effects',
        description: 'Provide education materials and counseling on managing neuropathy',
        type: 'education',
        priority: 'medium',
        status: 'pending',
        assignedTo: '2',
        assignedBy: '1',
        dueDate: '2024-10-19T10:00:00Z',
        createdAt: '2024-10-17T10:00:00Z',
        patientId: 'patient-1'
      }
    ];

    const mockCarePlans: CarePlan[] = [
      {
        id: '1',
        patientId: 'patient-1',
        patientName: 'Emily Rodriguez',
        diagnosis: 'Breast Cancer',
        stage: 'Stage IIIA',
        treatmentPhase: 'active',
        primaryOncologist: '1',
        startDate: '2024-09-15',
        nextReviewDate: '2024-10-20',
        goals: [
          'Complete neoadjuvant chemotherapy',
          'Achieve tumor reduction >50%',
          'Maintain quality of life',
          'Prepare for surgical resection'
        ],
        milestones: [
          {
            id: 'm1',
            title: 'Complete Cycle 4 of AC',
            targetDate: '2024-10-25',
            status: 'in_progress',
            description: 'Fourth cycle of Adriamycin and Cyclophosphamide'
          },
          {
            id: 'm2',
            title: 'Pre-surgical imaging',
            targetDate: '2024-11-10',
            status: 'not_started',
            description: 'MRI and CT to assess tumor response'
          }
        ],
        riskFactors: ['Family history', 'BRCA1 positive'],
        allergies: ['Penicillin', 'Shellfish'],
        currentMedications: ['Doxorubicin', 'Cyclophosphamide', 'Ondansetron', 'Dexamethasone']
      }
    ];

    const mockCommunications: CommunicationThread[] = [
      {
        id: '1',
        subject: 'Lab results concern - elevated liver enzymes',
        participants: ['1', '3'],
        patientId: 'patient-1',
        type: 'urgent',
        lastMessage: {
          sender: '3',
          content: 'Recommend dose reduction for next cycle. ALT is 3x upper limit.',
          timestamp: '2024-10-17T11:30:00Z',
          read: false
        },
        unreadCount: 2,
        priority: 'urgent'
      },
      {
        id: '2',
        subject: 'Patient experiencing severe nausea',
        participants: ['1', '2'],
        patientId: 'patient-1',
        type: 'symptoms',
        lastMessage: {
          sender: '2',
          content: 'Patient called this morning reporting persistent nausea despite anti-emetics',
          timestamp: '2024-10-17T09:15:00Z',
          read: true
        },
        unreadCount: 0,
        priority: 'high'
      }
    ];

    // Mock data removed - now using real API data
    */
  // }, []);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTasks = careTasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const CareTeamCard: React.FC<{ member: CareTeamMember }> = ({ member }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAvailabilityColor(member.availability)} rounded-full border-2 border-white`}></div>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{member.role}</p>
            <p className="text-xs text-gray-500">{member.specialty}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
            <Phone className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
            <Video className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Hospital className="h-4 w-4 mr-2" />
          {member.hospital}
        </div>
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {member.email}
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          {member.yearsExperience} years experience
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-wrap gap-1">
          {member.certifications.slice(0, 2).map((cert, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {cert}
            </span>
          ))}
          {member.certifications.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{member.certifications.length - 2} more
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const TaskCard: React.FC<{ task: CareTask }> = ({ task }) => {
    const assignedMember = careTeam.find(member => member.id === task.assignedTo);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <UserCheck className="h-4 w-4 mr-1" />
            {assignedMember?.name || 'Unassigned'}
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Care Coordination Hub</h1>
        <p className="text-gray-600">Streamline care team collaboration and patient management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'team', label: 'Care Team', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'plans', label: 'Care Plans', icon: Heart },
            { id: 'communication', label: 'Communication', icon: MessageSquare },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as any)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Care Team Members</p>
                  <p className="text-2xl font-bold text-blue-900">{careTeam.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Urgent Tasks</p>
                  <p className="text-2xl font-bold text-yellow-900">{careTasks.filter(t => t.priority === 'urgent').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Active Care Plans</p>
                  <p className="text-2xl font-bold text-green-900">{carePlans.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-600">Unread Messages</p>
                  <p className="text-2xl font-bold text-red-900">{communications.reduce((sum, comm) => sum + comm.unreadCount, 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {careTasks.slice(0, 3).map((task, index) => {
                const IconComponent = task.status === 'completed' ? CheckCircle : 
                                   task.priority === 'urgent' ? AlertTriangle : Users;
                const bgColor = task.status === 'completed' ? 'bg-green-50' :
                              task.priority === 'urgent' ? 'bg-yellow-50' : 'bg-blue-50';
                const iconColor = task.status === 'completed' ? 'text-green-600' :
                                task.priority === 'urgent' ? 'text-yellow-600' : 'text-blue-600';
                
                return (
                  <div key={task.id} className={`flex items-center p-3 ${bgColor} rounded-lg`}>
                    <IconComponent className={`h-5 w-5 ${iconColor} mr-3`} />
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-gray-500">{new Date(task.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
              {careTasks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Care Team Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Care Team Members</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careTeam.map(member => (
              <CareTeamCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Care Tasks</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Care Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Care Plans</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Care Plan
            </button>
          </div>
          
          {carePlans.map(plan => (
            <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{plan.patientName}</h3>
                  <p className="text-gray-600">{plan.diagnosis} - {plan.stage}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    plan.treatmentPhase === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {plan.treatmentPhase.charAt(0).toUpperCase() + plan.treatmentPhase.slice(1)} Treatment
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment Goals</h4>
                  <ul className="space-y-1">
                    {plan.goals.map((goal, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <Target className="h-3 w-3 mr-2 text-blue-500" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                  <div className="space-y-2">
                    {plan.milestones.map(milestone => (
                      <div key={milestone.id} className="flex items-center text-sm">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in_progress' ? 'bg-blue-500' :
                          milestone.status === 'delayed' ? 'bg-red-500' : 'bg-gray-300'
                        }`}></div>
                        <div>
                          <p className="text-gray-900">{milestone.title}</p>
                          <p className="text-gray-500">{new Date(milestone.targetDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Next Review:</span>
                      <span className="ml-2 text-gray-900">{new Date(plan.nextReviewDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk Factors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.riskFactors.map((factor, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Communications</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Send className="h-4 w-4 mr-2" />
              New Message
            </button>
          </div>
          
          <div className="space-y-4">
            {communications.map(thread => (
              <div key={thread.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-900">{thread.subject}</h3>
                      {thread.unreadCount > 0 && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          {thread.unreadCount} new
                        </span>
                      )}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        thread.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        thread.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {thread.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{thread.lastMessage.content}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>From: {careTeam.find(m => m.id === thread.lastMessage.sender)?.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(thread.lastMessage.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Care Coordination Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Task Completion Rate</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-green-600">85%</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">On-time completion</p>
                  <p className="text-xs text-green-600">↑ 12% from last month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Average Response Time</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">2.3h</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Team communication</p>
                  <p className="text-xs text-blue-600">↓ 30min from last month</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Patient Satisfaction</h3>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-yellow-600">4.8</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Average rating</p>
                  <p className="text-xs text-yellow-600">↑ 0.3 from last month</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Care Coordination Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">AI Recommendation</p>
                    <p className="text-sm text-blue-700">Consider scheduling more frequent team meetings. Communication gaps detected in high-complexity cases.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Performance Insight</p>
                    <p className="text-sm text-green-700">Task completion rates have improved 15% since implementing the new care coordination protocols.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Attention Needed</p>
                    <p className="text-sm text-yellow-700">3 patients have care plan reviews overdue. Consider automated reminders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareCoordinationHub;