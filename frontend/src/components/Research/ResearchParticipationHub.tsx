import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  Award, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Heart,
  Brain,
  Activity,
  Zap,
  Globe,
  ChevronRight,
  Info,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';
import researchParticipationService, { ResearchStudy, ParticipationHistory, ResearchPreferences } from '../../services/researchParticipationService';

interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  phase: 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV' | 'Observational';
  sponsor: string;
  institution: string;
  location: string;
  status: 'Recruiting' | 'Not Recruiting' | 'Completed' | 'Suspended';
  eligibilityCriteria: string[];
  primaryOutcome: string;
  estimatedDuration: string;
  participantCount: number;
  maxParticipants: number;
  startDate: string;
  estimatedCompletion: string;
  matchScore: number;
  category: 'Treatment' | 'Prevention' | 'Supportive Care' | 'Diagnostic' | 'Screening';
  compensation: string;
  requirements: string[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  genomicRequirements?: string[];
  exclusionCriteria: string[];
}

interface ParticipationHistory {
  studyId: string;
  studyTitle: string;
  status: 'Active' | 'Completed' | 'Withdrawn' | 'Screening';
  enrollmentDate: string;
  lastUpdate: string;
  nextAppointment?: string;
}

interface ResearchPreferences {
  maxDistance: number;
  phases: string[];
  categories: string[];
  genomicDataSharing: boolean;
  compensationRequired: boolean;
  notifications: {
    newMatches: boolean;
    studyUpdates: boolean;
    appointments: boolean;
  };
}

export const ResearchParticipationHub: React.FC = () => {
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<ResearchStudy[]>([]);
  const [participationHistory, setParticipationHistory] = useState<ParticipationHistory[]>([]);
  const [preferences, setPreferences] = useState<ResearchPreferences>({
    maxDistance: 50,
    phases: ['Phase I', 'Phase II', 'Phase III'],
    categories: ['Treatment', 'Prevention'],
    genomicDataSharing: true,
    compensationRequired: false,
    notifications: {
      newMatches: true,
      studyUpdates: true,
      appointments: true
    }
  });
  const [activeTab, setActiveTab] = useState<'browse' | 'matches' | 'history' | 'preferences'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudy, setSelectedStudy] = useState<ResearchStudy | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>('default-patient');
  const [matches, setMatches] = useState<ResearchStudy[]>([]);

  useEffect(() => {
    loadResearchData();
  }, [patientId]);

  const loadResearchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studiesData, matchesData, historyData, preferencesData] = await Promise.all([
        researchParticipationService.getAvailableStudies(patientId),
        researchParticipationService.getPersonalizedMatches(patientId),
        researchParticipationService.getParticipationHistory(patientId),
        researchParticipationService.getResearchPreferences(patientId)
      ]);

      setStudies(studiesData);
      setMatches(matchesData);
      setParticipationHistory(historyData);
      if (preferencesData) {
        setPreferences(preferencesData);
      }
    } catch (error) {
      console.error('Failed to load research data:', error);
      setError('Failed to load research data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterStudies();
  }, [studies, searchTerm, preferences]);

  const filterStudies = async () => {
    try {
      const filtered = await researchParticipationService.getAvailableStudies(patientId, {
        searchTerm,
        phases: preferences.phases,
        categories: preferences.categories,
        maxDistance: preferences.maxDistance,
        compensationRequired: preferences.compensationRequired
      });
      
      setFilteredStudies(filtered);
    } catch (error) {
      console.error('Failed to filter studies:', error);
      // Fallback to client-side filtering
      let filtered = studies.filter(study => {
        if (searchTerm && !study.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !study.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        if (preferences.phases.length > 0 && !preferences.phases.includes(study.phase)) {
          return false;
        }
        if (preferences.categories.length > 0 && !preferences.categories.includes(study.category)) {
          return false;
        }
        return true;
      });

      filtered.sort((a, b) => b.matchScore - a.matchScore);
      setFilteredStudies(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recruiting': return 'text-green-600 bg-green-100';
      case 'Not Recruiting': return 'text-yellow-600 bg-yellow-100';
      case 'Completed': return 'text-gray-600 bg-gray-100';
      case 'Suspended': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase I': return 'text-blue-600 bg-blue-100';
      case 'Phase II': return 'text-purple-600 bg-purple-100';
      case 'Phase III': return 'text-green-600 bg-green-100';
      case 'Phase IV': return 'text-orange-600 bg-orange-100';
      case 'Observational': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const StudyCard: React.FC<{ study: ResearchStudy }> = ({ study }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
         onClick={() => setSelectedStudy(study)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{study.title}</h3>
          <div className="flex gap-2 mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
              {study.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(study.phase)}`}>
              {study.phase}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
              {study.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{study.matchScore}%</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2">{study.description}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center text-gray-500">
          <MapPin className="h-4 w-4 mr-2" />
          {study.location}
        </div>
        <div className="flex items-center text-gray-500">
          <Users className="h-4 w-4 mr-2" />
          {study.participantCount}/{study.maxParticipants} enrolled
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="h-4 w-4 mr-2" />
          {study.estimatedDuration}
        </div>
        <div className="flex items-center text-gray-500">
          <Award className="h-4 w-4 mr-2" />
          {study.compensation}
        </div>
      </div>
    </div>
  );

  const StudyDetailModal: React.FC<{ study: ResearchStudy; onClose: () => void }> = ({ study, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{study.title}</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(study.status)}`}>
                  {study.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(study.phase)}`}>
                  {study.phase}
                </span>
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{study.matchScore}% Match</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Study Description</h3>
            <p className="text-gray-700">{study.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Study Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium">{study.institution}</p>
                    <p className="text-sm text-gray-500">Sponsor: {study.sponsor}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{study.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p>Started: {new Date(study.startDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">Est. completion: {new Date(study.estimatedCompletion).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{study.participantCount}/{study.maxParticipants} participants enrolled</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-medium">{study.contactInfo.name}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{study.contactInfo.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{study.contactInfo.email}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Eligibility Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">Inclusion Criteria</h4>
                <ul className="space-y-1">
                  {study.eligibilityCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-2">Exclusion Criteria</h4>
                <ul className="space-y-1">
                  {study.exclusionCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{criteria}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {study.genomicRequirements && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Genomic Requirements</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="space-y-1">
                  {study.genomicRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-center">
                      <Brain className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Study Requirements & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {study.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Compensation</h4>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">{study.compensation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Primary Outcome</h3>
            <p className="text-gray-700">{study.primaryOutcome}</p>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button 
              onClick={async () => {
                const success = await researchParticipationService.expressInterest(patientId, study.id);
                if (success) {
                  alert('Interest expressed successfully!');
                  onClose();
                } else {
                  alert('Failed to express interest. Please try again.');
                }
              }}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Express Interest
            </button>
            <button 
              onClick={async () => {
                const success = await researchParticipationService.saveStudy(patientId, study.id);
                if (success) {
                  alert('Study saved successfully!');
                } else {
                  alert('Failed to save study. Please try again.');
                }
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Save for Later
            </button>
            <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Participation Hub</h1>
        <p className="text-gray-600">Discover and participate in cutting-edge cancer research studies tailored to your profile</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading research data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={loadResearchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      {!loading && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'browse', label: 'Browse Studies', icon: Search },
              { id: 'matches', label: 'My Matches', icon: Star },
              { id: 'history', label: 'Participation History', icon: Clock },
              { id: 'preferences', label: 'Preferences', icon: Filter }
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
      )}

      {/* Browse Studies Tab */}
      {activeTab === 'browse' && !loading && (
        <div>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search studies by title, condition, or treatment..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Study Phase</label>
                    <div className="space-y-2">
                      {['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Observational'].map(phase => (
                        <label key={phase} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.phases.includes(phase)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferences(prev => ({ ...prev, phases: [...prev.phases, phase] }));
                              } else {
                                setPreferences(prev => ({ ...prev, phases: prev.phases.filter(p => p !== phase) }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{phase}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Study Category</label>
                    <div className="space-y-2">
                      {['Treatment', 'Prevention', 'Supportive Care', 'Diagnostic', 'Screening'].map(category => (
                        <label key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.categories.includes(category)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPreferences(prev => ({ ...prev, categories: [...prev.categories, category] }));
                              } else {
                                setPreferences(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Distance: {preferences.maxDistance} miles
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="500"
                      value={preferences.maxDistance}
                      onChange={(e) => setPreferences(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Studies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStudies.map(study => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>

          {filteredStudies.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => researchParticipationService.getRecommendedStudies(patientId).then(setFilteredStudies)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Star className="w-4 h-4 mr-2" />
                Show Recommended Studies
              </button>
            </div>
          )}
        </div>
      )}

      {/* My Matches Tab */}
      {activeTab === 'matches' && !loading && (
        <div>
          {matches.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No personalized matches found</h3>
              <p className="text-gray-500 mb-4">Complete your profile to get personalized study recommendations.</p>
              <button
                onClick={() => setActiveTab('preferences')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                Update Preferences
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {matches.map(study => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participation History Tab */}
      {activeTab === 'history' && !loading && (
        <div className="space-y-6">
          {participationHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No participation history</h3>
              <p className="text-gray-500 mb-4">You haven't participated in any research studies yet.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse Studies
              </button>
            </div>
          ) : (
            participationHistory.map(participation => (
            <div key={participation.studyId} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{participation.studyTitle}</h3>
                  <p className="text-sm text-gray-500">Enrolled: {new Date(participation.enrollmentDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  participation.status === 'Active' ? 'bg-green-100 text-green-800' :
                  participation.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {participation.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Last Update: </span>
                  <span>{new Date(participation.lastUpdate).toLocaleDateString()}</span>
                </div>
                {participation.nextAppointment && (
                  <div>
                    <span className="text-gray-500">Next Appointment: </span>
                    <span className="font-medium">{new Date(participation.nextAppointment).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && !loading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Research Preferences</h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.genomicDataSharing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, genomicDataSharing: e.target.checked }))}
                  className="mr-3"
                />
                <span>Allow sharing of genomic data for research purposes</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.compensationRequired}
                  onChange={(e) => setPreferences(prev => ({ ...prev, compensationRequired: e.target.checked }))}
                  className="mr-3"
                />
                <span>Only show studies with compensation</span>
              </label>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Notification Preferences</h3>
              <div className="space-y-3">
                {Object.entries(preferences.notifications).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={async (e) => {
                        const newPreferences = {
                          ...preferences,
                          notifications: { ...preferences.notifications, [key]: e.target.checked }
                        };
                        setPreferences(newPreferences);
                        await researchParticipationService.updateResearchPreferences(patientId, newPreferences);
                      }}
                      className="mr-3"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Detail Modal */}
      {selectedStudy && (
        <StudyDetailModal study={selectedStudy} onClose={() => setSelectedStudy(null)} />
      )}
    </div>
  );
};

export default ResearchParticipationHub;