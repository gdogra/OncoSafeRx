import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Users, 
  FileText, 
  Share, 
  MoreVertical,
  Send,
  Paperclip,
  Mic,
  Camera,
  Monitor,
  Calendar,
  Clock,
  MapPin,
  Star,
  Search,
  Filter,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Edit3,
  Download,
  Upload,
  Eye,
  ThumbsUp,
  MessageCircle,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Target,
  Heart,
  Brain,
  Stethoscope,
  Pill,
  TestTube,
  Microscope,
  BookOpen,
  UserCheck,
  Archive,
  Pin,
  Flag
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image' | 'voice' | 'system';
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  reactions?: Array<{
    emoji: string;
    users: string[];
  }>;
  threadId?: string;
  isEdited?: boolean;
  editedAt?: string;
  priority?: 'normal' | 'high' | 'urgent';
  mentions?: string[];
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'direct' | 'patient_case' | 'emergency';
  participants: string[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  unreadCount: number;
  isArchived: boolean;
  isPinned: boolean;
  patientId?: string;
  tags: string[];
  privacy: 'open' | 'restricted' | 'confidential';
}

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
  timezone: string;
  isTyping?: boolean;
}

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  participants: string[];
  organizer: string;
  type: 'tumor_board' | 'consultation' | 'team_meeting' | 'patient_case' | 'educational';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recording?: string;
  agenda?: string[];
  notes?: string;
  patientId?: string;
}

interface SharedDocument {
  id: string;
  name: string;
  type: 'protocol' | 'guideline' | 'case_study' | 'lab_result' | 'imaging' | 'treatment_plan';
  sharedBy: string;
  sharedAt: string;
  permissions: 'view' | 'edit' | 'comment';
  tags: string[];
  version: string;
  size: number;
  lastModified: string;
  collaborators: string[];
  comments: number;
}

export const RealTimeCollaborationPlatform: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'meetings' | 'documents' | 'workspace' | 'analytics'>('chat');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock data initialization
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        role: 'Medical Oncologist',
        department: 'Oncology',
        status: 'online',
        lastSeen: '2024-10-17T12:00:00Z',
        timezone: 'PST'
      },
      {
        id: '2',
        name: 'Jennifer Martinez',
        role: 'Oncology Nurse',
        department: 'Nursing',
        status: 'online',
        lastSeen: '2024-10-17T12:05:00Z',
        timezone: 'PST'
      },
      {
        id: '3',
        name: 'Dr. Michael Thompson',
        role: 'Clinical Pharmacist',
        department: 'Pharmacy',
        status: 'away',
        lastSeen: '2024-10-17T11:30:00Z',
        timezone: 'PST'
      },
      {
        id: '4',
        name: 'Dr. Lisa Park',
        role: 'Radiologist',
        department: 'Radiology',
        status: 'busy',
        lastSeen: '2024-10-17T10:15:00Z',
        timezone: 'PST'
      }
    ];

    const mockChannels: Channel[] = [
      {
        id: 'general',
        name: 'General Discussion',
        description: 'General team communication',
        type: 'public',
        participants: ['1', '2', '3', '4'],
        createdBy: '1',
        createdAt: '2024-10-01T09:00:00Z',
        lastActivity: '2024-10-17T11:45:00Z',
        unreadCount: 3,
        isArchived: false,
        isPinned: true,
        tags: ['general', 'team'],
        privacy: 'open'
      },
      {
        id: 'tumor-board',
        name: 'Tumor Board Cases',
        description: 'Weekly tumor board discussions',
        type: 'private',
        participants: ['1', '3', '4'],
        createdBy: '1',
        createdAt: '2024-10-01T09:00:00Z',
        lastActivity: '2024-10-17T10:30:00Z',
        unreadCount: 0,
        isArchived: false,
        isPinned: true,
        tags: ['tumor-board', 'cases'],
        privacy: 'restricted'
      },
      {
        id: 'emergency',
        name: 'Emergency Alerts',
        description: 'Urgent patient alerts and emergency communications',
        type: 'emergency',
        participants: ['1', '2', '3'],
        createdBy: '1',
        createdAt: '2024-10-01T09:00:00Z',
        lastActivity: '2024-10-17T08:15:00Z',
        unreadCount: 1,
        isArchived: false,
        isPinned: true,
        tags: ['emergency', 'alerts'],
        privacy: 'confidential'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: '2',
        senderName: 'Jennifer Martinez',
        senderRole: 'Oncology Nurse',
        content: 'Patient in room 204 is experiencing severe nausea. Should we adjust the anti-emetic protocol?',
        timestamp: '2024-10-17T11:45:00Z',
        type: 'text',
        priority: 'high',
        mentions: ['1']
      },
      {
        id: '2',
        senderId: '1',
        senderName: 'Dr. Sarah Chen',
        senderRole: 'Medical Oncologist',
        content: 'Yes, let\'s increase the ondansetron to 8mg q8h and add dexamethasone 4mg daily. I\'ll update the orders.',
        timestamp: '2024-10-17T11:47:00Z',
        type: 'text',
        reactions: [{ emoji: '👍', users: ['2', '3'] }]
      },
      {
        id: '3',
        senderId: '3',
        senderName: 'Dr. Michael Thompson',
        senderRole: 'Clinical Pharmacist',
        content: 'Checking for any interactions with current medications. All clear. Orders verified.',
        timestamp: '2024-10-17T11:50:00Z',
        type: 'text'
      }
    ];

    const mockMeetings: Meeting[] = [
      {
        id: '1',
        title: 'Weekly Tumor Board',
        description: 'Review complex cases and treatment plans',
        startTime: '2024-10-18T14:00:00Z',
        duration: 120,
        participants: ['1', '3', '4'],
        organizer: '1',
        type: 'tumor_board',
        status: 'scheduled',
        agenda: ['Case 1: Breast cancer staging', 'Case 2: Lung cancer treatment options', 'New protocol review']
      },
      {
        id: '2',
        title: 'Patient Case Consultation',
        description: 'Discuss treatment options for complex case',
        startTime: '2024-10-17T15:30:00Z',
        duration: 30,
        participants: ['1', '2'],
        organizer: '1',
        type: 'consultation',
        status: 'in_progress',
        patientId: 'patient-1'
      }
    ];

    const mockDocuments: SharedDocument[] = [
      {
        id: '1',
        name: 'Breast Cancer Treatment Protocol v2.1',
        type: 'protocol',
        sharedBy: '1',
        sharedAt: '2024-10-17T09:00:00Z',
        permissions: 'view',
        tags: ['breast-cancer', 'protocol', 'treatment'],
        version: '2.1',
        size: 2048576,
        lastModified: '2024-10-15T16:30:00Z',
        collaborators: ['1', '2', '3'],
        comments: 5
      },
      {
        id: '2',
        name: 'Lab Results - Patient Rodriguez',
        type: 'lab_result',
        sharedBy: '2',
        sharedAt: '2024-10-17T11:00:00Z',
        permissions: 'view',
        tags: ['lab-results', 'urgent'],
        version: '1.0',
        size: 512000,
        lastModified: '2024-10-17T10:45:00Z',
        collaborators: ['1', '2', '3'],
        comments: 2
      }
    ];

    setUsers(mockUsers);
    setChannels(mockChannels);
    setMessages(mockMessages);
    setMeetings(mockMeetings);
    setDocuments(mockDocuments);
    setSelectedChannel('general');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChannel) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: '1', // Current user
      senderName: 'Dr. Sarah Chen',
      senderRole: 'Medical Oncologist',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      default: return '';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ChannelList: React.FC = () => (
    <div className="space-y-1">
      {channels.map(channel => (
        <button
          key={channel.id}
          onClick={() => setSelectedChannel(channel.id)}
          className={`w-full text-left p-3 rounded-lg transition-colors ${
            selectedChannel === channel.id 
              ? 'bg-blue-100 text-blue-900' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {channel.type === 'emergency' && <AlertCircle className="h-4 w-4 mr-2 text-red-500" />}
              {channel.type === 'private' && <Shield className="h-4 w-4 mr-2 text-blue-500" />}
              {channel.type === 'public' && <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />}
              <span className="font-medium">{channel.name}</span>
              {channel.isPinned && <Pin className="h-3 w-3 ml-1 text-yellow-500" />}
            </div>
            {channel.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {channel.unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
        </button>
      ))}
    </div>
  );

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <div className={`p-4 ${getPriorityColor(message.priority)}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <UserCheck className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">{message.senderName}</span>
            <span className="text-xs text-gray-500">{message.senderRole}</span>
            <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
            {message.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                message.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                message.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {message.priority}
              </span>
            )}
          </div>
          <p className="text-gray-800">{message.content}</p>
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="flex items-center space-x-1 bg-gray-100 rounded-full px-2 py-1 text-xs hover:bg-gray-200"
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const UserList: React.FC = () => (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 text-sm mb-3">Team Members</h3>
      {users.map(user => (
        <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="relative">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-gray-600" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.role}</p>
          </div>
          {user.isTyping && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-Time Collaboration Platform</h1>
        <p className="text-gray-600">Seamless communication and coordination for care teams</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'chat', label: 'Team Chat', icon: MessageSquare },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'documents', label: 'Shared Documents', icon: FileText },
            { id: 'workspace', label: 'Collaborative Workspace', icon: Users },
            { id: 'analytics', label: 'Communication Analytics', icon: TrendingUp }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
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

      {/* Team Chat Tab */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-12 gap-6 h-96">
          {/* Channels Sidebar */}
          <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Channels</h2>
              <button className="p-1 text-gray-400 hover:text-blue-600">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <ChannelList />
          </div>

          {/* Main Chat Area */}
          <div className="col-span-6 bg-white rounded-lg border border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {channels.find(c => c.id === selectedChannel)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {channels.find(c => c.id === selectedChannel)?.participants.length} participants
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                    <Video className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Search className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {typingUsers.length > 0 && (
                <div className="p-4 text-sm text-gray-500">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Paperclip className="h-4 w-4" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                </div>
                <button 
                  className={`p-2 ${isVoiceMode ? 'text-red-600' : 'text-gray-400 hover:text-blue-600'}`}
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button 
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={handleSendMessage}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Team Members Sidebar */}
          <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-4">
            <UserList />
          </div>
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Team Meetings</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Meeting
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetings.map(meeting => (
              <div key={meeting.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    meeting.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    meeting.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {meeting.status.replace('_', ' ').charAt(0).toUpperCase() + meeting.status.replace('_', ' ').slice(1)}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(meeting.startTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(meeting.startTime).toLocaleTimeString()} ({meeting.duration} min)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {meeting.participants.length} participants
                  </div>
                </div>

                {meeting.agenda && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Agenda</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {meeting.agenda.slice(0, 2).map((item, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                          {item}
                        </li>
                      ))}
                      {meeting.agenda.length > 2 && (
                        <li className="text-gray-500">+{meeting.agenda.length - 2} more items</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  {meeting.status === 'scheduled' && (
                    <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Join Meeting
                    </button>
                  )}
                  {meeting.status === 'in_progress' && (
                    <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700">
                      Join Now
                    </button>
                  )}
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Shared Documents</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">v{doc.version}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Shared by {users.find(u => u.id === doc.sharedBy)?.name}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(doc.lastModified).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {doc.comments} comments
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{doc.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Open
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <Download className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborative Workspace Tab */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Collaborative Workspace</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Virtual Whiteboard</h3>
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Interactive whiteboard for visual collaboration</p>
                  <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Start Whiteboard
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Screen Sharing</h3>
              <div className="bg-gray-50 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Share your screen with team members</p>
                  <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Share Screen
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Active Collaborations</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Tumor Board Case Review</p>
                    <p className="text-sm text-blue-700">3 participants actively collaborating</p>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Join
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Treatment Protocol Update</p>
                    <p className="text-sm text-green-700">2 participants reviewing document</p>
                  </div>
                </div>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communication Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Communication Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Messages Today</p>
                  <p className="text-2xl font-bold text-blue-900">247</p>
                  <p className="text-xs text-green-600">↑ 15% from yesterday</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-green-900">12m</p>
                  <p className="text-xs text-green-600">↓ 3m from last week</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-900">28</p>
                  <p className="text-xs text-purple-600">↑ 4 from last week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Communication Insights</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Peak Communication Hours</p>
                    <p className="text-sm text-blue-700">Most team communications occur between 9 AM - 11 AM and 2 PM - 4 PM</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Response Efficiency</p>
                    <p className="text-sm text-green-700">Emergency channel response time is 30% faster than general discussions</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <p className="font-medium text-yellow-900">Improvement Opportunity</p>
                    <p className="text-sm text-yellow-700">Consider scheduling more regular check-ins for complex patient cases</p>
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

export default RealTimeCollaborationPlatform;