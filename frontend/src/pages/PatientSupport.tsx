import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { MessageSquare, Phone, Mail, Users, Heart, Clock, Calendar, MapPin, ExternalLink, Shield, Bell, Info, Star, User, Video, HeadphonesIcon } from 'lucide-react';

interface SupportResource {
  id: string;
  title: string;
  description: string;
  type: 'hotline' | 'support-group' | 'counseling' | 'financial' | 'emergency';
  availability: string;
  contact?: string;
  rating?: number;
  isAvailable: boolean;
}

interface CareTeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  contact: string;
  availability: string;
  isOnline: boolean;
}

const PatientSupport: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  const [selectedTab, setSelectedTab] = useState<'team' | 'support' | 'emergency' | 'community'>('team');

  // Button handlers
  const handleSendMessage = (memberId: string) => {
    const member = careTeam.find(m => m.id === memberId);
    if (member) {
      const message = `I would like to schedule a consultation or ask questions about my treatment plan.`;
      if (confirm(`Send message to ${member.name}?\n\n"${message}"`)) {
        alert(`Message sent to ${member.name} successfully!\n\nThey will respond within their availability hours: ${member.availability}`);
      }
    }
  };

  const handleVideoCall = (memberId: string) => {
    const member = careTeam.find(m => m.id === memberId);
    if (member && member.isOnline) {
      if (confirm(`Start video call with ${member.name}?\n\nThis will initiate a secure video consultation.`)) {
        alert(`Connecting to ${member.name}...\n\nIn a real implementation, this would:\n• Open secure video platform\n• Connect with healthcare provider\n• Enable HIPAA-compliant communication`);
      }
    }
  };

  const handleAccessResource = (resourceId: string) => {
    alert(`Opening resource...\n\nThis would provide access to educational materials, support groups, or other patient resources.`);
  };

  const handleJoinMeeting = () => {
    if (confirm('Join the next support group meeting?\n\nMeetings are held weekly and provide peer support from other patients.')) {
      alert('Joining support group meeting...\n\nYou will receive a calendar invitation with the meeting details.');
    }
  };

  const handleLearnMore = (topic: string) => {
    alert(`Learning more about ${topic}...\n\nThis would open detailed information and resources about this topic.`);
  };

  const handleVisitForum = () => {
    if (confirm('Visit the patient community forum?\n\nConnect with other patients, share experiences, and get support.')) {
      alert('Opening patient forum...\n\nThis would take you to a secure patient community platform.');
    }
  };

  const careTeam: CareTeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Smith',
      role: 'Oncologist',
      specialty: 'Medical Oncology',
      contact: 'Message available',
      availability: 'Mon-Fri 9am-5pm',
      isOnline: true
    },
    {
      id: '2',
      name: 'Jennifer Chen, RN',
      role: 'Nurse Navigator',
      specialty: 'Patient Care Coordination',
      contact: 'Available now',
      availability: 'Mon-Fri 8am-6pm',
      isOnline: true
    },
    {
      id: '3',
      name: 'Dr. Michael Johnson',
      role: 'Pharmacist',
      specialty: 'Oncology Pharmacy',
      contact: 'Next available: 2pm',
      availability: 'Mon-Fri 10am-4pm',
      isOnline: false
    },
    {
      id: '4',
      name: 'Lisa Rodriguez, LCSW',
      role: 'Social Worker',
      specialty: 'Psychosocial Support',
      contact: 'Message available',
      availability: 'Tue, Thu 1pm-5pm',
      isOnline: true
    }
  ];

  const supportResources: SupportResource[] = [
    {
      id: '1',
      title: 'Cancer Support Hotline',
      description: '24/7 support from trained counselors who understand cancer journey',
      type: 'hotline',
      availability: '24/7',
      contact: '1-800-CANCER-1',
      rating: 4.9,
      isAvailable: true
    },
    {
      id: '2',
      title: 'Weekly Support Group',
      description: 'Connect with other patients going through similar experiences',
      type: 'support-group',
      availability: 'Thursdays 6pm-7:30pm',
      contact: 'Virtual meeting',
      rating: 4.7,
      isAvailable: true
    },
    {
      id: '3',
      title: 'Financial Assistance Program',
      description: 'Help with treatment costs, insurance, and financial planning',
      type: 'financial',
      availability: 'Mon-Fri 9am-5pm',
      contact: 'Schedule appointment',
      rating: 4.8,
      isAvailable: true
    },
    {
      id: '4',
      title: 'Individual Counseling',
      description: 'One-on-one sessions with licensed mental health professionals',
      type: 'counseling',
      availability: 'By appointment',
      contact: 'Schedule consultation',
      rating: 4.9,
      isAvailable: true
    },
    {
      id: '5',
      title: 'Emergency Support Line',
      description: 'Immediate assistance for urgent medical or emotional needs',
      type: 'emergency',
      availability: '24/7',
      contact: '911 or 1-800-URGENT',
      isAvailable: true
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotline': return Phone;
      case 'support-group': return Users;
      case 'counseling': return HeadphonesIcon;
      case 'financial': return Shield;
      case 'emergency': return Bell;
      default: return MessageSquare;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotline': return 'bg-blue-100 text-blue-600';
      case 'support-group': return 'bg-green-100 text-green-600';
      case 'counseling': return 'bg-purple-100 text-purple-600';
      case 'financial': return 'bg-orange-100 text-orange-600';
      case 'emergency': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs: Array<{ id: 'team' | 'support' | 'emergency' | 'community'; label: string; icon: any }> = [
    { id: 'team', label: 'Care Team', icon: Users },
    { id: 'support', label: 'Support Resources', icon: Heart },
    { id: 'emergency', label: 'Emergency Contacts', icon: Bell },
    { id: 'community', label: 'Community', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support & Communication</h1>
        <p className="text-gray-600 mt-1">Connect with your care team and access support resources</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Emergency</h3>
              <p className="text-red-700 text-sm">Call 911</p>
            </div>
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Message Care Team</h3>
              <p className="text-blue-700 text-sm">Send secure message</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Support Hotline</h3>
              <p className="text-green-700 text-sm">1-800-CANCER-1</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
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

        <div className="p-6">
          {/* Care Team Tab */}
          {selectedTab === 'team' && (
            <div className="space-y-6">
              <Alert type="info" title="Secure Communication">
                All messages with your care team are encrypted and HIPAA-compliant. Response times may vary by provider.
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {careTeam.map((member) => (
                  <Card key={member.id}>
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          {member.isOnline && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Online</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{member.role}</p>
                        <p className="text-sm text-gray-500 mb-3">{member.specialty}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{member.availability}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{member.contact}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <button 
                            onClick={() => handleSendMessage(member.id)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Send Message
                          </button>
                          {member.isOnline && (
                            <button 
                              onClick={() => handleVideoCall(member.id)}
                              className="px-3 py-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50"
                              title="Start video call"
                            >
                              <Video className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Support Resources Tab */}
          {selectedTab === 'support' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {supportResources.filter(r => r.type !== 'emergency').map((resource) => {
                  const Icon = getTypeIcon(resource.type);
                  return (
                    <Card key={resource.id}>
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getTypeColor(resource.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                            {resource.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">{resource.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{resource.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{resource.availability}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{resource.contact}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => handleAccessResource(resource.id)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Access Resource
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {selectedTab === 'emergency' && (
            <div className="space-y-6">
              <Alert type="warning" title="Medical Emergency">
                If you are experiencing a medical emergency, call 911 immediately. For urgent but non-emergency situations, use the contacts below.
              </Alert>

              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-red-50 border-red-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Medical Emergency</h3>
                      <p className="text-red-700">Life-threatening situations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-900">911</p>
                      <p className="text-red-700 text-sm">Call immediately</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900">After-Hours Oncology</h3>
                      <p className="text-orange-700">Urgent medical questions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-orange-900">(555) 123-4567</p>
                      <p className="text-orange-700 text-sm">24/7 available</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HeadphonesIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900">Crisis Support</h3>
                      <p className="text-blue-700">Mental health crisis support</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-900">988</p>
                      <p className="text-blue-700 text-sm">Suicide & Crisis Lifeline</p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">Cancer Support Hotline</h3>
                      <p className="text-green-700">Emotional support and guidance</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-900">1-800-CANCER-1</p>
                      <p className="text-green-700 text-sm">24/7 support</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {selectedTab === 'community' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Support Group</h3>
                    <p className="text-gray-600 mb-4">Join other patients for peer support and shared experiences</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Thursdays 6:00 PM</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>Virtual Meeting</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleJoinMeeting}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Join Next Meeting
                    </button>
                  </div>
                </Card>

                <Card>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Caregiver Support</h3>
                    <p className="text-gray-600 mb-4">Resources and support for family members and caregivers</p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center justify-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Tuesdays 7:00 PM</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>In-person & Virtual</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleLearnMore('Support Groups')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Learn More
                    </button>
                  </div>
                </Card>
              </div>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Online Community Forum</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Connect with others 24/7</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Share experiences, ask questions, and find support from other patients and survivors in our secure online community.
                      </p>
                      <button 
                        onClick={handleVisitForum}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                      >
                        Visit Forum
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSupport;
