import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Dna, 
  MessageCircle, 
  Heart, 
  Share2, 
  Shield, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Award, 
  Bookmark, 
  Settings, 
  Search, 
  Filter, 
  Video, 
  Phone, 
  Mail, 
  Lock, 
  Globe, 
  AlertCircle,
  CheckCircle,
  UserPlus,
  MessageSquare,
  Gift
} from 'lucide-react';
import Card from '../UI/Card';

interface GeneticProfile {
  mutations: string[];
  cancerType: string;
  tumorMarkers: string[];
  hereditarySyndromes: string[];
  pharmacogenomics: string[];
  compatibilityScore: number;
}

interface GeneticTwin {
  id: string;
  userId: string;
  firstName: string;
  lastInitial: string;
  age: number;
  location: string;
  diagnosisDate: Date;
  treatmentPhase: 'newly_diagnosed' | 'active_treatment' | 'maintenance' | 'survivor' | 'caregiver';
  geneticProfile: GeneticProfile;
  sharedExperiences: string[];
  mentorshipStatus: 'mentor' | 'mentee' | 'peer' | 'none';
  communicationPreferences: {
    video: boolean;
    phone: boolean;
    messaging: boolean;
    inPerson: boolean;
  };
  profilePhoto?: string;
  bio: string;
  lastActive: Date;
  connectionCount: number;
  helpfulVotes: number;
  verifiedStatus: boolean;
  privacyLevel: 'open' | 'selective' | 'private';
}

interface MatchingCriteria {
  geneticSimilarity: number;
  treatmentPhase: string[];
  ageRange: [number, number];
  location: string;
  mentorshipPreference: string;
  cancerType: string[];
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  geneticFocus: string[];
  memberCount: number;
  isPrivate: boolean;
  lastActivity: Date;
  moderators: string[];
  tags: string[];
}

interface CommunityInsight {
  title: string;
  description: string;
  relevantGenes: string[];
  participantCount: number;
  confidence: number;
  category: 'treatment' | 'lifestyle' | 'symptoms' | 'outcomes';
}

const GeneticTwinNetwork: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matches' | 'groups' | 'insights' | 'privacy'>('matches');
  const [geneticTwins, setGeneticTwins] = useState<GeneticTwin[]>([]);
  const [supportGroups, setSupportGroups] = useState<SupportGroup[]>([]);
  const [communityInsights, setCommunityInsights] = useState<CommunityInsight[]>([]);
  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    geneticSimilarity: 80,
    treatmentPhase: ['active_treatment', 'maintenance'],
    ageRange: [25, 65],
    location: 'Any',
    mentorshipPreference: 'peer',
    cancerType: ['breast', 'ovarian']
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTwin, setSelectedTwin] = useState<GeneticTwin | null>(null);

  useEffect(() => {
    // Mock data initialization
    setGeneticTwins([
      {
        id: '1',
        userId: 'user_1',
        firstName: 'Sarah',
        lastInitial: 'J',
        age: 34,
        location: 'Seattle, WA',
        diagnosisDate: new Date('2023-03-15'),
        treatmentPhase: 'active_treatment',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC', 'TP53 R273H'],
          cancerType: 'Triple-negative breast cancer',
          tumorMarkers: ['ER-', 'PR-', 'HER2-'],
          hereditarySyndromes: ['Hereditary breast and ovarian cancer syndrome'],
          pharmacogenomics: ['CYP2D6 *1/*4'],
          compatibilityScore: 94
        },
        sharedExperiences: ['Neoadjuvant chemotherapy', 'PARP inhibitor therapy', 'Genetic counseling'],
        mentorshipStatus: 'mentor',
        communicationPreferences: {
          video: true,
          phone: true,
          messaging: true,
          inPerson: false
        },
        bio: 'BRCA1 carrier who has navigated the journey from diagnosis to current maintenance therapy. Happy to share experiences and support others.',
        lastActive: new Date(),
        connectionCount: 23,
        helpfulVotes: 87,
        verifiedStatus: true,
        privacyLevel: 'selective'
      },
      {
        id: '2',
        userId: 'user_2',
        firstName: 'Maria',
        lastInitial: 'R',
        age: 29,
        location: 'Austin, TX',
        diagnosisDate: new Date('2024-01-20'),
        treatmentPhase: 'newly_diagnosed',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC'],
          cancerType: 'Invasive ductal carcinoma',
          tumorMarkers: ['ER+', 'PR+', 'HER2-'],
          hereditarySyndromes: ['Hereditary breast and ovarian cancer syndrome'],
          pharmacogenomics: ['CYP2D6 *1/*1'],
          compatibilityScore: 89
        },
        sharedExperiences: ['Recently diagnosed', 'Genetic testing', 'Treatment planning'],
        mentorshipStatus: 'mentee',
        communicationPreferences: {
          video: false,
          phone: false,
          messaging: true,
          inPerson: false
        },
        bio: 'Newly diagnosed and looking for support from others who have walked this path.',
        lastActive: new Date(Date.now() - 3600000),
        connectionCount: 3,
        helpfulVotes: 12,
        verifiedStatus: true,
        privacyLevel: 'open'
      },
      {
        id: '3',
        userId: 'user_3',
        firstName: 'Jennifer',
        lastInitial: 'L',
        age: 42,
        location: 'Boston, MA',
        diagnosisDate: new Date('2020-08-10'),
        treatmentPhase: 'survivor',
        geneticProfile: {
          mutations: ['BRCA1 c.5266dupC', 'CHEK2 1100delC'],
          cancerType: 'Invasive lobular carcinoma',
          tumorMarkers: ['ER+', 'PR+', 'HER2+'],
          hereditarySyndromes: ['Hereditary breast and ovarian cancer syndrome'],
          pharmacogenomics: ['CYP2D6 *1/*4', 'CYP3A4 *1/*1B'],
          compatibilityScore: 92
        },
        sharedExperiences: ['Completed treatment', 'Reconstruction surgery', 'Survivorship planning'],
        mentorshipStatus: 'mentor',
        communicationPreferences: {
          video: true,
          phone: true,
          messaging: true,
          inPerson: true
        },
        bio: '4-year survivor passionate about supporting newly diagnosed patients through their journey.',
        lastActive: new Date(Date.now() - 1800000),
        connectionCount: 45,
        helpfulVotes: 156,
        verifiedStatus: true,
        privacyLevel: 'open'
      }
    ]);

    setSupportGroups([
      {
        id: '1',
        name: 'BRCA1 Warriors',
        description: 'Support group for BRCA1 mutation carriers navigating prevention and treatment decisions',
        geneticFocus: ['BRCA1'],
        memberCount: 234,
        isPrivate: false,
        lastActivity: new Date(),
        moderators: ['sarah_j', 'jennifer_l'],
        tags: ['BRCA1', 'prevention', 'treatment', 'family planning']
      },
      {
        id: '2',
        name: 'Triple Negative Support Circle',
        description: 'Private group for triple-negative breast cancer patients and survivors',
        geneticFocus: ['BRCA1', 'BRCA2', 'TP53'],
        memberCount: 89,
        isPrivate: true,
        lastActivity: new Date(Date.now() - 3600000),
        moderators: ['maria_r'],
        tags: ['triple-negative', 'chemotherapy', 'PARP inhibitors']
      },
      {
        id: '3',
        name: 'Young Adults with Hereditary Cancer',
        description: 'Support network for adults under 40 with hereditary cancer syndromes',
        geneticFocus: ['BRCA1', 'BRCA2', 'TP53', 'CHEK2', 'ATM'],
        memberCount: 156,
        isPrivate: false,
        lastActivity: new Date(Date.now() - 7200000),
        moderators: ['genetic_counselor_1', 'peer_mentor_2'],
        tags: ['young adults', 'hereditary', 'fertility', 'career']
      }
    ]);

    setCommunityInsights([
      {
        title: 'PARP Inhibitor Response Patterns',
        description: 'BRCA1 carriers show 85% response rate to olaparib maintenance therapy',
        relevantGenes: ['BRCA1'],
        participantCount: 127,
        confidence: 89,
        category: 'treatment'
      },
      {
        title: 'Exercise and Recovery Correlation',
        description: 'Regular moderate exercise correlates with 40% faster recovery in BRCA+ patients',
        relevantGenes: ['BRCA1', 'BRCA2'],
        participantCount: 203,
        confidence: 76,
        category: 'lifestyle'
      },
      {
        title: 'Prophylactic Surgery Satisfaction',
        description: '92% of BRCA carriers report satisfaction with prophylactic mastectomy decision',
        relevantGenes: ['BRCA1', 'BRCA2'],
        participantCount: 85,
        confidence: 94,
        category: 'outcomes'
      }
    ]);
  }, []);

  const filteredTwins = geneticTwins.filter(twin => 
    twin.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    twin.geneticProfile.mutations.some(mutation => 
      mutation.toLowerCase().includes(searchQuery.toLowerCase())
    ) ||
    twin.geneticProfile.cancerType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTreatmentPhaseColor = (phase: string) => {
    switch (phase) {
      case 'newly_diagnosed': return 'bg-red-100 text-red-800';
      case 'active_treatment': return 'bg-orange-100 text-orange-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'survivor': return 'bg-green-100 text-green-800';
      case 'caregiver': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMentorshipIcon = (status: string) => {
    switch (status) {
      case 'mentor': return <Award className="w-4 h-4 text-gold-600" />;
      case 'mentee': return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'peer': return <Users className="w-4 h-4 text-purple-600" />;
      default: return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleConnect = (twin: GeneticTwin) => {
    setSelectedTwin(twin);
    // In real implementation, this would open a connection modal
    console.log('Connecting with', twin.firstName);
  };

  const handleJoinGroup = (groupId: string) => {
    // In real implementation, this would join the support group
    console.log('Joining group', groupId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Dna className="w-8 h-8 mr-3 text-blue-600" />
            Genetic Twin Network
          </h1>
          <p className="text-gray-600 mt-1">
            Connect with others who share your genetic profile and experiences
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            <span>Become a Mentor</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Settings className="w-4 h-4" />
            <span>Privacy Settings</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'matches', label: 'Genetic Matches', icon: Dna },
            { id: 'groups', label: 'Support Groups', icon: Users },
            { id: 'insights', label: 'Community Insights', icon: TrendingUp },
            { id: 'privacy', label: 'Privacy & Safety', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Genetic Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, genes, or cancer type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Genetic Twins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTwins.map((twin) => (
              <Card key={twin.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-700">
                        {twin.firstName.charAt(0)}{twin.lastInitial}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {twin.firstName} {twin.lastInitial}.
                      </h3>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{twin.location}</span>
                        {twin.verifiedStatus && (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getMentorshipIcon(twin.mentorshipStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityColor(twin.geneticProfile.compatibilityScore)}`}>
                      {twin.geneticProfile.compatibilityScore}% match
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTreatmentPhaseColor(twin.treatmentPhase)}`}>
                    {twin.treatmentPhase.replace('_', ' ')}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Shared Genetics</h4>
                  <div className="flex flex-wrap gap-1">
                    {twin.geneticProfile.mutations.slice(0, 2).map((mutation, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {mutation.split(' ')[0]}
                      </span>
                    ))}
                    {twin.geneticProfile.mutations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{twin.geneticProfile.mutations.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{twin.bio}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{twin.connectionCount} connections</span>
                  <span>{twin.helpfulVotes} helpful votes</span>
                  <span>Active {twin.lastActive.getHours()}h ago</span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConnect(twin)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Bookmark className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Support Groups Tab */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supportGroups.map((group) => (
              <Card key={group.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{group.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{group.memberCount} members</span>
                      {group.isPrivate && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>

                <p className="text-sm text-gray-700 mb-4">{group.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Genetic Focus</h4>
                  <div className="flex flex-wrap gap-1">
                    {group.geneticFocus.map((gene, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {gene}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {group.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Last activity: {group.lastActivity.toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      group.isPrivate
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {group.isPrivate ? 'Request to Join' : 'Join Group'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Community Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Community-Generated Insights
            </h2>
            <div className="space-y-4">
              {communityInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                      <p className="text-sm text-gray-700">{insight.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.category === 'treatment' ? 'bg-blue-100 text-blue-800' :
                      insight.category === 'lifestyle' ? 'bg-green-100 text-green-800' :
                      insight.category === 'symptoms' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {insight.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{insight.participantCount} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{insight.confidence}% confidence</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {insight.relevantGenes.map((gene, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {gene}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Privacy & Safety Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy & Safety Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Profile Visibility</h3>
                <div className="space-y-2">
                  {[
                    { id: 'open', label: 'Open', description: 'Visible to all verified community members' },
                    { id: 'selective', label: 'Selective', description: 'Visible only to approved connections' },
                    { id: 'private', label: 'Private', description: 'Hidden from search, invite-only' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="privacy"
                        value={option.id}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Data Sharing Preferences</h3>
                <div className="space-y-3">
                  {[
                    { id: 'genetic_data', label: 'Share genetic mutation details' },
                    { id: 'treatment_history', label: 'Share treatment history' },
                    { id: 'outcome_data', label: 'Contribute to research outcomes' },
                    { id: 'location', label: 'Show approximate location' }
                  ].map((pref) => (
                    <label key={pref.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{pref.label}</span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Safety Guidelines</h4>
                    <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                      <li>• Never share personal contact information publicly</li>
                      <li>• All genetic data is anonymized and encrypted</li>
                      <li>• Report any inappropriate behavior to moderators</li>
                      <li>• Medical advice should come from healthcare providers</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GeneticTwinNetwork;