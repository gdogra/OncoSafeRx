import React, { useState, useEffect, useRef } from 'react';
import { usePatient } from '../../context/PatientContext';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import { 
  MessageSquare, 
  Video,
  Phone,
  Mail,
  Send,
  Paperclip,
  Image,
  FileText,
  Mic,
  MicOff,
  VideoOff,
  Users,
  Calendar,
  Clock,
  Bell,
  Search,
  Filter,
  Settings,
  Shield,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Star,
  Hash,
  AtSign,
  Plus,
  X,
  Archive
} from 'lucide-react';

interface CommunicationMessage {
  id: string;
  type: 'text' | 'voice' | 'video' | 'file' | 'image' | 'alert' | 'system';
  sender: {
    id: string;
    name: string;
    role: 'physician' | 'nurse' | 'pharmacist' | 'patient' | 'system' | 'ai_assistant';
    avatar?: string;
  };
  content: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  timestamp: string;
  read_by: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  thread_id?: string;
  patient_id: string;
  encryption_level: 'standard' | 'hipaa' | 'phi_encrypted';
  mentions?: string[];
  tags?: string[];
}

interface CommunicationChannel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'department' | 'emergency' | 'ai_consultation';
  participants: {
    id: string;
    name: string;
    role: string;
    status: 'online' | 'away' | 'busy' | 'offline';
    last_seen?: string;
  }[];
  patient_id?: string;
  unread_count: number;
  last_message?: CommunicationMessage;
  created_at: string;
  security_level: 'standard' | 'hipaa_compliant' | 'phi_secure';
}

interface VideoCallSession {
  id: string;
  participants: string[];
  status: 'scheduled' | 'ongoing' | 'ended';
  start_time: string;
  end_time?: string;
  recording_available: boolean;
  patient_consent: boolean;
  call_type: 'consultation' | 'rounds' | 'emergency' | 'education';
}

const ClinicalCommunicationHub: React.FC = () => {
  const { state } = usePatient();
  const { currentPatient } = state;
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeCall, setActiveCall] = useState<VideoCallSession | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize demo data
    initializeDemoData();
    // Simulate real-time updates
    const interval = setInterval(simulateRealTimeUpdates, 5000);
    return () => clearInterval(interval);
  }, [currentPatient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeDemoData = () => {
    if (!currentPatient) return;

    const demoChannels: CommunicationChannel[] = [
      {
        id: 'channel-1',
        name: 'Oncology Team',
        type: 'group',
        participants: [
          { id: 'dr-smith', name: 'Dr. Sarah Smith', role: 'Oncologist', status: 'online' },
          { id: 'nurse-jones', name: 'Nurse Emily Jones', role: 'Oncology Nurse', status: 'online' },
          { id: 'pharm-brown', name: 'Dr. Michael Brown', role: 'Clinical Pharmacist', status: 'away' },
          { id: 'ai-assistant', name: 'OncoAI Assistant', role: 'AI Assistant', status: 'online' }
        ],
        patient_id: currentPatient.id,
        unread_count: 3,
        created_at: new Date().toISOString(),
        security_level: 'hipaa_compliant'
      },
      {
        id: 'channel-2',
        name: 'Patient Care Coordination',
        type: 'department',
        participants: [
          { id: 'coord-wilson', name: 'Lisa Wilson', role: 'Care Coordinator', status: 'online' },
          { id: 'soc-worker', name: 'James Davis', role: 'Social Worker', status: 'offline', last_seen: '2 hours ago' },
          { id: 'nutrit-garcia', name: 'Maria Garcia', role: 'Nutritionist', status: 'busy' }
        ],
        patient_id: currentPatient.id,
        unread_count: 1,
        created_at: new Date().toISOString(),
        security_level: 'phi_secure'
      },
      {
        id: 'channel-3',
        name: 'Emergency Consultation',
        type: 'emergency',
        participants: [
          { id: 'er-doc', name: 'Dr. Robert Lee', role: 'Emergency Physician', status: 'online' },
          { id: 'intensivist', name: 'Dr. Jennifer Chen', role: 'Intensivist', status: 'online' }
        ],
        unread_count: 0,
        created_at: new Date().toISOString(),
        security_level: 'hipaa_compliant'
      },
      {
        id: 'channel-4',
        name: 'AI Clinical Assistant',
        type: 'ai_consultation',
        participants: [
          { id: 'ai-clinical', name: 'OncoSafeRx AI', role: 'AI Assistant', status: 'online' },
          { id: 'current-user', name: 'You', role: 'Physician', status: 'online' }
        ],
        patient_id: currentPatient.id,
        unread_count: 0,
        created_at: new Date().toISOString(),
        security_level: 'standard'
      }
    ];

    const demoMessages: CommunicationMessage[] = [
      {
        id: 'msg-1',
        type: 'text',
        sender: { id: 'dr-smith', name: 'Dr. Sarah Smith', role: 'physician' },
        content: 'Lab results for CBC are in. Neutrophil count looks good for next cycle.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read_by: ['current-user'],
        priority: 'normal',
        patient_id: currentPatient.id,
        encryption_level: 'hipaa',
        tags: ['lab-results', 'neutrophils']
      },
      {
        id: 'msg-2',
        type: 'alert',
        sender: { id: 'system', name: 'OncoSafeRx System', role: 'system' },
        content: 'Drug interaction alert: New medication may interact with current regimen.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read_by: [],
        priority: 'high',
        patient_id: currentPatient.id,
        encryption_level: 'phi_encrypted',
        tags: ['drug-interaction', 'alert']
      },
      {
        id: 'msg-3',
        type: 'text',
        sender: { id: 'nurse-jones', name: 'Nurse Emily Jones', role: 'nurse' },
        content: 'Patient reports mild nausea this morning. Administered ondansetron 4mg IV as ordered.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        read_by: ['dr-smith'],
        priority: 'normal',
        patient_id: currentPatient.id,
        encryption_level: 'hipaa',
        tags: ['side-effects', 'medication-admin']
      },
      {
        id: 'msg-4',
        type: 'text',
        sender: { id: 'ai-assistant', name: 'OncoAI Assistant', role: 'ai_assistant' },
        content: 'Based on latest lab values and patient response, treatment appears to be well-tolerated. Consider continuing current regimen.',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read_by: [],
        priority: 'normal',
        patient_id: currentPatient.id,
        encryption_level: 'standard',
        tags: ['ai-recommendation', 'treatment-plan']
      }
    ];

    setChannels(demoChannels);
    setMessages(demoMessages);
    setActiveChannel('channel-1');
  };

  const simulateRealTimeUpdates = () => {
    // Simulate new messages, typing indicators, status updates
    const updates = [
      () => simulateTypingIndicator(),
      () => simulateStatusUpdate(),
      () => simulateNewMessage()
    ];
    
    const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
    if (Math.random() < 0.3) { // 30% chance of update
      randomUpdate();
    }
  };

  const simulateTypingIndicator = () => {
    const users = ['dr-smith', 'nurse-jones', 'ai-assistant'];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    
    setIsTyping(prev => [...prev, randomUser]);
    setTimeout(() => {
      setIsTyping(prev => prev.filter(u => u !== randomUser));
    }, 3000);
  };

  const simulateStatusUpdate = () => {
    setChannels(prev => prev.map(channel => ({
      ...channel,
      participants: channel.participants.map(p => ({
        ...p,
        status: Math.random() < 0.1 ? 
          ['online', 'away', 'busy'][Math.floor(Math.random() * 3)] as any : 
          p.status
      }))
    })));
  };

  const simulateNewMessage = () => {
    if (!currentPatient) return;

    const aiResponses = [
      'New clinical trial matching patient profile found. Would you like me to provide details?',
      'Reminder: Patient due for follow-up labs in 2 days.',
      'Drug interaction check complete. No significant interactions detected.',
      'Patient vital signs monitoring shows stable trends.',
      'New evidence-based treatment recommendation available based on recent publications.'
    ];

    const newMsg: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      sender: { id: 'ai-assistant', name: 'OncoAI Assistant', role: 'ai_assistant' },
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date().toISOString(),
      read_by: [],
      priority: 'normal',
      patient_id: currentPatient.id,
      encryption_level: 'standard',
      tags: ['ai-update']
    };

    setMessages(prev => [...prev, newMsg]);
    
    // Update channel unread count
    setChannels(prev => prev.map(channel => 
      channel.id === activeChannel 
        ? { ...channel, unread_count: channel.unread_count + 1, last_message: newMsg }
        : channel
    ));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !currentPatient || !activeChannel) return;

    const message: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      type: 'text',
      sender: { id: 'current-user', name: 'You', role: 'physician' },
      content: newMessage,
      timestamp: new Date().toISOString(),
      read_by: ['current-user'],
      priority: 'normal',
      patient_id: currentPatient.id,
      encryption_level: 'hipaa',
      attachments: selectedFiles.length > 0 ? selectedFiles.map((file, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file)
      })) : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedFiles([]);
    
    // Update channel
    setChannels(prev => prev.map(channel => 
      channel.id === activeChannel 
        ? { ...channel, last_message: message }
        : channel
    ));
  };

  const startVideoCall = () => {
    const callSession: VideoCallSession = {
      id: `call-${Date.now()}`,
      participants: ['current-user'],
      status: 'ongoing',
      start_time: new Date().toISOString(),
      recording_available: false,
      patient_consent: true,
      call_type: 'consultation'
    };
    
    setActiveCall(callSession);
  };

  const endVideoCall = () => {
    if (activeCall) {
      setActiveCall({
        ...activeCall,
        status: 'ended',
        end_time: new Date().toISOString()
      });
      setTimeout(() => setActiveCall(null), 2000);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'voice': return <Mic className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'physician': return 'text-blue-600';
      case 'nurse': return 'text-green-600';
      case 'pharmacist': return 'text-purple-600';
      case 'ai_assistant': return 'text-orange-600';
      case 'system': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low': return 'border-l-4 border-gray-500 bg-gray-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const filteredMessages = messages.filter(msg => 
    activeChannel && msg.patient_id === currentPatient?.id &&
    (searchQuery === '' || 
     msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!currentPatient) {
    return (
      <Card>
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">Clinical Communication Hub</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Select a patient to access secure clinical communication and collaboration tools
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-screen flex flex-col space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinical Communication Hub</h1>
              <p className="text-gray-600">
                Secure communication for {currentPatient.demographics.firstName} {currentPatient.demographics.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Tooltip content="HIPAA-compliant secure messaging">
              <Shield className="w-5 h-5 text-green-600" />
            </Tooltip>
            <span className="text-sm text-green-600 font-medium">End-to-End Encrypted</span>
          </div>
        </div>
      </Card>

      {/* Active Video Call */}
      {activeCall && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Video Call Active</div>
                <div className="text-sm text-gray-600">
                  {activeCall.call_type} - Started {new Date(activeCall.start_time).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-75">
                <Mic className="w-4 h-4 text-green-600" />
              </button>
              <button className="p-2 bg-white bg-opacity-50 rounded-lg hover:bg-opacity-75">
                <Video className="w-4 h-4 text-green-600" />
              </button>
              <button 
                onClick={endVideoCall}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Communication Interface */}
      <div className="flex-1 grid grid-cols-4 gap-4 h-0">
        {/* Channels Sidebar */}
        <Card className="col-span-1 p-0 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Channels</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeChannel === channel.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 truncate">{channel.name}</span>
                  </div>
                  {channel.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {channel.unread_count}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  {channel.participants.slice(0, 3).map((participant, idx) => (
                    <div key={idx} className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`}></div>
                      <span className="text-xs text-gray-600 truncate">{participant.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {channel.participants.length > 3 && (
                    <span className="text-xs text-gray-500">+{channel.participants.length - 3}</span>
                  )}
                </div>
                
                {channel.last_message && (
                  <p className="text-xs text-gray-500 truncate">
                    {channel.last_message.sender.name}: {channel.last_message.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    channel.type === 'emergency' ? 'bg-red-100 text-red-600' :
                    channel.type === 'ai_consultation' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {channel.type.replace('_', ' ')}
                  </span>
                  {channel.security_level === 'hipaa_compliant' && (
                    <Shield className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Messages Area */}
        <Card className="col-span-3 p-0 flex flex-col">
          {/* Messages Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                {activeChannel && (
                  <>
                    <h3 className="font-semibold text-gray-900">
                      {channels.find(c => c.id === activeChannel)?.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        {channels.find(c => c.id === activeChannel)?.participants.length} members
                      </span>
                      <span>•</span>
                      <span>
                        {channels.find(c => c.id === activeChannel)?.participants.filter(p => p.status === 'online').length} online
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startVideoCall}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className={`flex space-x-3 ${getPriorityColor(message.priority)} p-3 rounded-lg`}>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {message.sender.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`font-medium ${getRoleColor(message.sender.role)}`}>
                      {message.sender.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {getMessageIcon(message.type)}
                    {message.priority !== 'normal' && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                        message.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {message.priority}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-800">{message.content}</p>
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white bg-opacity-50 rounded">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                            {attachment.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.tags && message.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicators */}
            {isTyping.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-500 italic">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">
                  {isTyping.join(', ')} {isTyping.length > 1 ? 'are' : 'is'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs">{file.name}</span>
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-2 rounded-lg ${
                  isRecording 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a secure message..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Encrypted</span>
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Messages are HIPAA-compliant and end-to-end encrypted</span>
              <div className="flex items-center space-x-2">
                <span>Patient ID: {currentPatient.id}</span>
                <span>•</span>
                <span>Secure Channel</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
          }
        }}
        className="hidden"
      />
    </div>
  );
};

export default ClinicalCommunicationHub;