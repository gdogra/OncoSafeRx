import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  CheckSquare, 
  Clock, 
  AlertTriangle,
  Video,
  FileText,
  TrendingUp,
  Activity,
  Plus,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { 
  Team, 
  TumorBoard, 
  CommunicationThread, 
  ConsultationRequest, 
  ActionItem,
  TeamMember
} from '../../types/collaboration';
import { collaborationService } from '../../services/collaborationService';

interface TabInfo {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const CollaborationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [teams, setTeams] = useState<Team[]>([]);
  const [tumorBoards, setTumorBoards] = useState<TumorBoard[]>([]);
  const [communications, setCommunications] = useState<CommunicationThread[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [currentUserId] = useState('member_001'); // Mock current user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Generate sample data if none exists
      collaborationService.generateSampleData();
      
      setTeams(collaborationService.getTeams());
      setTumorBoards(collaborationService.getTumorBoards());
      setCommunications(collaborationService.getCommunicationThreads());
      setConsultations(collaborationService.getConsultationRequests());
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabInfo[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Dashboard overview and key metrics'
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: Users,
      description: 'Team management and member coordination'
    },
    {
      id: 'tumor-boards',
      label: 'Tumor Boards',
      icon: Calendar,
      description: 'Multidisciplinary case discussions'
    },
    {
      id: 'communications',
      label: 'Messages',
      icon: MessageCircle,
      description: 'Team communications and discussions'
    },
    {
      id: 'consultations',
      label: 'Consultations',
      icon: FileText,
      description: 'Specialty consultation requests'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Action items and task management'
    }
  ];

  const getUnreadMessageCount = (): number => {
    const unreadMessages = collaborationService.getUnreadMessages(currentUserId);
    return unreadMessages.length;
  };

  const getPendingTaskCount = (): number => {
    const allActionItems = tumorBoards.flatMap(board => board.actionItems);
    return allActionItems.filter(item => 
      item.assignedTo === currentUserId && 
      item.status === 'pending'
    ).length;
  };

  const getUpcomingBoardsCount = (): number => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tumorBoards.filter(board => {
      const boardDate = new Date(board.scheduledDate);
      return boardDate >= today && boardDate <= nextWeek;
    }).length;
  };

  const renderOverviewTab = () => {
    const unreadCount = getUnreadMessageCount();
    const pendingTasks = getPendingTaskCount();
    const upcomingBoards = getUpcomingBoardsCount();
    const pendingConsultations = consultations.filter(c => c.status === 'pending').length;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTasks}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Upcoming Boards</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingBoards}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Consultations</p>
                <p className="text-2xl font-bold text-gray-900">{pendingConsultations}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {tumorBoards.slice(0, 3).map(board => (
              <div key={board.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{board.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(board.scheduledDate).toLocaleDateString()} • {board.cases.length} cases
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  board.status === 'scheduled' 
                    ? 'bg-blue-100 text-blue-800'
                    : board.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {board.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveTab('tumor-boards')}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Schedule Board</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('consultations')}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Request Consult</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('communications')}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <MessageCircle className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-gray-900">Start Discussion</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('teams')}
              className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Users className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-gray-900">Manage Team</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTeamsTab = () => (
    <div className="space-y-6">
      {/* Team List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {teams.map(team => (
            <div key={team.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{team.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{team.members.length} members</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {team.patients.length} patients
                      </span>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      team.isActive 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="flex -space-x-2">
                  {team.members.slice(0, 3).map((member, index) => (
                    <div 
                      key={member.id}
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white"
                      title={member.name}
                    >
                      <span className="text-xs font-medium text-blue-800">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ))}
                  {team.members.length > 3 && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-xs font-medium text-gray-600">
                        +{team.members.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTumorBoardsTab = () => (
    <div className="space-y-6">
      {/* Upcoming Boards */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Tumor Boards</h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Board
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {tumorBoards.map(board => (
            <div key={board.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{board.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      board.status === 'scheduled' 
                        ? 'bg-blue-100 text-blue-800'
                        : board.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : board.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {board.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(board.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{board.duration} min</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{board.attendees.length} attendees</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <FileText className="w-4 h-4" />
                      <span>{board.cases.length} cases</span>
                    </div>
                  </div>
                  
                  {board.virtualMeetingUrl && (
                    <div className="mt-3">
                      <button className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200">
                        <Video className="w-4 h-4 mr-1" />
                        Join Meeting
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {board.actionItems.length > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-orange-600">
                      <CheckSquare className="w-4 h-4" />
                      <span>{board.actionItems.filter(a => a.status === 'pending').length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCommunicationsTab = () => (
    <div className="space-y-6">
      {/* Communication Threads */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {communications.map(thread => (
            <div key={thread.id} className="p-6 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">{thread.subject}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      thread.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : thread.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {thread.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>{thread.participants.length} participants</span>
                    <span>{thread.messages.length} messages</span>
                    <span>{new Date(thread.lastActivity).toLocaleDateString()}</span>
                  </div>
                  
                  {thread.messages.length > 0 && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {thread.messages[thread.messages.length - 1].content}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {thread.requiresResponse && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    thread.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : thread.status === 'resolved'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {thread.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {communications.length === 0 && (
            <div className="p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages</h3>
              <p className="text-gray-500">Start a new discussion to collaborate with your team</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConsultationsTab = () => (
    <div className="space-y-6">
      {/* Consultation Requests */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Consultations</h3>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Request Consultation
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {consultations.map(consult => (
            <div key={consult.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {consult.specialtyRequested} Consultation
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      consult.urgency === 'emergent' 
                        ? 'bg-red-100 text-red-800'
                        : consult.urgency === 'urgent'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {consult.urgency}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{consult.clinicalQuestion}</p>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Patient: {consult.patientId}</span>
                    <span>Requested: {new Date(consult.createdDate).toLocaleDateString()}</span>
                    {consult.responseDeadline && (
                      <span>Due: {new Date(consult.responseDeadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <span className={`px-3 py-1 text-sm rounded-full ${
                  consult.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : consult.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : consult.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {consult.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
          
          {consultations.length === 0 && (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Consultations</h3>
              <p className="text-gray-500">Request specialty consultations when needed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTasksTab = () => {
    const allActionItems = tumorBoards.flatMap(board => board.actionItems);
    const userTasks = allActionItems.filter(item => item.assignedTo === currentUserId);

    return (
      <div className="space-y-6">
        {/* Task Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {userTasks.filter(t => t.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {userTasks.filter(t => t.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {userTasks.filter(t => t.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {userTasks.filter(t => t.status === 'overdue').length}
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {userTasks.map(task => (
              <div key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{task.description}</h4>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    {task.notes && (
                      <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
                    )}
                  </div>
                  
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    task.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
            
            {userTasks.length === 0 && (
              <div className="p-12 text-center">
                <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks</h3>
                <p className="text-gray-500">You have no assigned tasks at this time</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaboration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Collaboration Dashboard</h1>
        <p className="text-gray-600">
          Coordinate multidisciplinary care and manage team communications
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mr-2 ${
                activeTab === id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              <div className="text-left">
                <div>{label}</div>
                <div className="text-xs text-gray-400">{description}</div>
              </div>
              {id === 'communications' && getUnreadMessageCount() > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {getUnreadMessageCount()}
                </span>
              )}
              {id === 'tasks' && getPendingTaskCount() > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-orange-500 rounded-full">
                  {getPendingTaskCount()}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'tumor-boards' && renderTumorBoardsTab()}
        {activeTab === 'communications' && renderCommunicationsTab()}
        {activeTab === 'consultations' && renderConsultationsTab()}
        {activeTab === 'tasks' && renderTasksTab()}
      </div>
    </div>
  );
};

export default CollaborationDashboard;