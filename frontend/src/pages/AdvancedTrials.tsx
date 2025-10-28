import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useSelection } from '../context/SelectionContext';
import { usePatient } from '../context/PatientContext';
import { clinicalTrialsService } from '../services/clinicalTrialsService';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Heart,
  Shield,
  Star,
  Clock,
  Globe,
  Filter,
  Sparkles,
  Microscope,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  Download,
  Share2,
  Bookmark,
  RefreshCw,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Info,
  Award,
  Beaker,
  DatabaseIcon,
  Navigation,
  Car,
  Map,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Trial {
  nct_id: string;
  title: string;
  condition: string;
  phase: string;
  status: string;
  sponsor: string;
  brief_summary: string;
  detailed_description?: string;
  eligibility_criteria: string;
  primary_outcome: string;
  secondary_outcome?: string;
  biomarkers?: string[];
  line_of_therapy?: string;
  enrollment_target: number;
  enrollment_current: number;
  locations: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lon: number;
    status: string;
    contact?: {
      name: string;
      phone: string;
      email: string;
    };
    distance?: number;
  }[];
  start_date: string;
  completion_date?: string;
  last_update: string;
  interventions: string[];
  arms: {
    name: string;
    type: string;
    description: string;
  }[];
  inclusion_criteria: string[];
  exclusion_criteria: string[];
  age_range: {
    min: number;
    max: number;
  };
  score?: number;
  match_reasons?: string[];
  eligibility_score?: number;
  distance?: number;
}

interface PatientProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  cancer_type: string;
  stage: string;
  biomarkers: string[];
  prior_treatments: string[];
  performance_status: number;
  comorbidities: string[];
  location: {
    lat: number;
    lon: number;
    city: string;
    state: string;
  };
}

const AdvancedTrials: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selection = useSelection();
  const { state } = usePatient();
  const { currentPatient } = state;
  
  // State management
  const [trials, setTrials] = useState<Trial[]>([]);
  const [filteredTrials, setFilteredTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMatchingEnabled, setAiMatchingEnabled] = useState(true);
  const [showEligibilityChecker, setShowEligibilityChecker] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    condition: '',
    phase: '',
    status: '',
    biomarker: '',
    location: '',
    maxDistance: 100,
    minEnrollment: 0,
    showOnlyRecruiting: true
  });

  // User location for distance calculation
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  
  // Patient profile for AI matching
  const [patientProfile, setPatientProfile] = useState<Partial<PatientProfile>>({
    age: undefined,
    gender: undefined,
    cancer_type: '',
    stage: '',
    biomarkers: [],
    prior_treatments: [],
    performance_status: undefined,
    comorbidities: []
  });
  
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'enrollment' | 'phase'>('relevance');
  const [expandedTrialId, setExpandedTrialId] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocationForDirections, setSelectedLocationForDirections] = useState<any>(null);

  // Distance calculation utility
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Direction utilities
  const getDirectionsUrl = (location: any, provider: 'google' | 'apple' | 'waze') => {
    const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
    const coords = `${location.lat},${location.lon}`;
    
    switch (provider) {
      case 'google':
        if (userLocation) {
          return `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${coords}`;
        }
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
      
      case 'apple':
        if (userLocation) {
          return `http://maps.apple.com/?saddr=${userLocation.lat},${userLocation.lon}&daddr=${coords}`;
        }
        return `http://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`;
      
      case 'waze':
        return `https://waze.com/ul?ll=${coords}&navigate=yes`;
      
      default:
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
    }
  };

  const openDirections = (location: any, provider: 'google' | 'apple' | 'waze') => {
    const url = getDirectionsUrl(location, provider);
    window.open(url, '_blank');
  };

  // Mock data for demonstration
  const mockTrials: Trial[] = [
    {
      nct_id: 'NCT05123456',
      title: 'Phase III Study of Novel CAR-T Therapy in Relapsed/Refractory B-cell Lymphoma',
      condition: 'Diffuse Large B-Cell Lymphoma',
      phase: 'Phase 3',
      status: 'Recruiting',
      sponsor: 'Memorial Sloan Kettering Cancer Center',
      brief_summary: 'This study evaluates the efficacy and safety of next-generation CAR-T cell therapy compared to standard salvage chemotherapy in patients with relapsed or refractory DLBCL.',
      detailed_description: 'A randomized, controlled trial comparing novel CD19/CD22 dual-targeting CAR-T cells versus investigator\'s choice of salvage therapy in adults with relapsed/refractory DLBCL after at least one prior line of therapy.',
      eligibility_criteria: 'Adults 18-75 years with histologically confirmed DLBCL, relapsed/refractory after ≥1 prior line, ECOG PS 0-1, adequate organ function',
      primary_outcome: 'Overall Survival at 2 years',
      secondary_outcome: 'Progression-free survival, overall response rate, safety profile',
      biomarkers: ['CD19+', 'CD22+'],
      line_of_therapy: 'Second-line or later',
      enrollment_target: 450,
      enrollment_current: 287,
      locations: [
        {
          name: 'Memorial Sloan Kettering Cancer Center',
          address: '1275 York Avenue',
          city: 'New York',
          state: 'NY',
          zip: '10065',
          country: 'USA',
          lat: 40.7648,
          lon: -73.9808,
          status: 'Recruiting',
          contact: {
            name: 'Dr. Sarah Johnson',
            phone: '(212) 639-2000',
            email: 'trialsinfo@mskcc.org'
          }
        },
        {
          name: 'MD Anderson Cancer Center',
          address: '1515 Holcombe Boulevard',
          city: 'Houston',
          state: 'TX',
          zip: '77030',
          country: 'USA',
          lat: 29.7084,
          lon: -95.3967,
          status: 'Recruiting',
          contact: {
            name: 'Dr. Michael Chen',
            phone: '(713) 792-2121',
            email: 'trials@mdanderson.org'
          }
        }
      ],
      start_date: '2023-06-15',
      completion_date: '2026-12-31',
      last_update: '2024-01-15',
      interventions: ['CAR-T Cell Therapy', 'Lymphodepletion Chemotherapy'],
      arms: [
        {
          name: 'Experimental Arm',
          type: 'Experimental',
          description: 'CD19/CD22 dual-targeting CAR-T cells following lymphodepletion'
        },
        {
          name: 'Control Arm',
          type: 'Active Comparator',
          description: 'Investigator\'s choice of salvage chemotherapy'
        }
      ],
      inclusion_criteria: [
        'Histologically confirmed DLBCL',
        'Age 18-75 years',
        'ECOG Performance Status 0-1',
        'Relapsed/refractory after ≥1 prior therapy',
        'Adequate organ function',
        'Life expectancy ≥12 weeks'
      ],
      exclusion_criteria: [
        'Active CNS involvement',
        'Prior CAR-T therapy',
        'Active autoimmune disease',
        'Pregnancy or nursing',
        'Active infection requiring systemic therapy'
      ],
      age_range: { min: 18, max: 75 },
      score: 95,
      match_reasons: ['Biomarker match: CD19+', 'Condition match: DLBCL', 'Phase 3 trial', 'Currently recruiting'],
      eligibility_score: 88,
      distance: 2.3
    },
    {
      nct_id: 'NCT05234567',
      title: 'AI-Guided Precision Immunotherapy for Advanced Solid Tumors',
      condition: 'Advanced Solid Tumors',
      phase: 'Phase 2',
      status: 'Recruiting',
      sponsor: 'Dana-Farber Cancer Institute',
      brief_summary: 'First-in-human study of AI-selected combination immunotherapy based on tumor genomics and immune profiling in patients with advanced solid tumors.',
      eligibility_criteria: 'Adults ≥18 years with advanced solid tumors, progression on standard therapy, evaluable disease, ECOG PS 0-2',
      primary_outcome: 'Overall Response Rate',
      secondary_outcome: 'Progression-free survival, overall survival, safety, biomarker analysis',
      biomarkers: ['PD-L1+', 'TMB-High', 'MSI-H'],
      line_of_therapy: 'Third-line or later',
      enrollment_target: 120,
      enrollment_current: 67,
      locations: [
        {
          name: 'Dana-Farber Cancer Institute',
          address: '450 Brookline Avenue',
          city: 'Boston',
          state: 'MA',
          zip: '02215',
          country: 'USA',
          lat: 42.3370,
          lon: -71.1055,
          status: 'Recruiting',
          contact: {
            name: 'Dr. Lisa Wang',
            phone: '(617) 632-3000',
            email: 'precision@dfci.harvard.edu'
          }
        }
      ],
      start_date: '2023-09-01',
      completion_date: '2025-06-30',
      last_update: '2024-01-20',
      interventions: ['AI-Selected Immunotherapy Combinations'],
      arms: [
        {
          name: 'AI-Guided Therapy',
          type: 'Experimental',
          description: 'Personalized immunotherapy combination selected by AI algorithm'
        }
      ],
      inclusion_criteria: [
        'Advanced solid tumor with progression on standard therapy',
        'Age ≥18 years',
        'ECOG Performance Status 0-2',
        'Evaluable disease by RECIST 1.1',
        'Adequate tumor tissue for genomic analysis'
      ],
      exclusion_criteria: [
        'Active brain metastases',
        'Autoimmune disease requiring systemic steroids',
        'Prior severe immune-related adverse events',
        'Concurrent malignancy'
      ],
      age_range: { min: 18, max: 99 },
      score: 87,
      match_reasons: ['AI-powered matching', 'Biomarker analysis included', 'Innovative approach'],
      eligibility_score: 76,
      distance: 45.7
    },
    {
      nct_id: 'NCT05345678',
      title: 'Real-Time Liquid Biopsy Guided Therapy Adaptation in Metastatic Breast Cancer',
      condition: 'Metastatic Breast Cancer',
      phase: 'Phase 2',
      status: 'Recruiting',
      sponsor: 'University of California, San Francisco',
      brief_summary: 'Study using real-time liquid biopsy monitoring to dynamically adapt targeted therapy in patients with metastatic breast cancer.',
      eligibility_criteria: 'Women with metastatic breast cancer, HER2+ or HR+/HER2-, progression on ≥1 prior therapy, ECOG PS 0-1',
      primary_outcome: 'Progression-Free Survival',
      secondary_outcome: 'Overall survival, response rate, circulating tumor DNA dynamics',
      biomarkers: ['HER2+', 'HR+', 'PIK3CA mutation', 'ESR1 mutation'],
      line_of_therapy: 'Second-line or later',
      enrollment_target: 200,
      enrollment_current: 134,
      locations: [
        {
          name: 'UCSF Helen Diller Family Comprehensive Cancer Center',
          address: '1600 Divisadero Street, 4th Floor',
          city: 'San Francisco',
          state: 'CA',
          zip: '94143',
          country: 'USA',
          lat: 37.7632,
          lon: -122.4574,
          status: 'Recruiting',
          contact: {
            name: 'Dr. Emily Rodriguez',
            phone: '(415) 476-1000',
            email: 'liquidbiopsy@ucsf.edu'
          }
        }
      ],
      start_date: '2023-04-01',
      completion_date: '2025-12-31',
      last_update: '2024-01-10',
      interventions: ['Liquid Biopsy-Guided Therapy', 'Dynamic Treatment Adaptation'],
      arms: [
        {
          name: 'Adaptive Therapy',
          type: 'Experimental',
          description: 'Treatment adapted based on real-time liquid biopsy results'
        },
        {
          name: 'Standard Therapy',
          type: 'Active Comparator',
          description: 'Standard of care targeted therapy'
        }
      ],
      inclusion_criteria: [
        'Metastatic breast cancer',
        'HER2+ or HR+/HER2-',
        'Progression on ≥1 prior systemic therapy',
        'ECOG Performance Status 0-1',
        'Measurable disease'
      ],
      exclusion_criteria: [
        'Triple negative breast cancer',
        'Active brain metastases',
        'Concurrent malignancy',
        'Pregnancy'
      ],
      age_range: { min: 18, max: 99 },
      score: 82,
      match_reasons: ['Liquid biopsy technology', 'Adaptive therapy approach', 'Currently recruiting'],
      eligibility_score: 91,
      distance: 12.1
    }
  ];

  // Load real clinical trials data
  useEffect(() => {
    loadTrialsData();
  }, [currentPatient]);

  const loadTrialsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let trialsData: Trial[] = [];
      
      if (currentPatient) {
        // Build a lightweight patient context for search
        const dob = currentPatient.demographics?.dateOfBirth;
        const derivedAge = (() => {
          try {
            if (!dob) return undefined;
            const d = new Date(dob);
            const diff = Date.now() - d.getTime();
            return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
          } catch { return undefined; }
        })();

        const patientContext = {
          conditions: (currentPatient.conditions || []).map(c => c.name || c.condition || ''),
          medications: (currentPatient.medications || []).map(m => ({ name: m.drug?.name || m.drugName || m.name || '' })),
          age: derivedAge,
          gender: (currentPatient.demographics?.sex || currentPatient.demographics?.gender || '').toLowerCase(),
          genomicData: currentPatient.genomicProfile || currentPatient.genetics || currentPatient.genomicData
        };

        const patientTrials = await clinicalTrialsService.searchTrialsForPatient(patientContext);
        trialsData = patientTrials;
      } else {
        // General search for common oncology conditions
        const generalSearch = await clinicalTrialsService.searchTrials({
          condition: 'cancer',
          recruitmentStatus: 'RECRUITING',
          pageSize: 20
        });
        trialsData = generalSearch.studies.map(trial => 
          clinicalTrialsService.transformTrialData(trial)
        );
      }
      
      setTrials(trialsData);
      setFilteredTrials(trialsData);
    } catch (err) {
      console.error('Error loading trials:', err);
      setError('Failed to load clinical trials. Please try again.');
      // Fallback to empty state instead of mock data
      setTrials([]);
      setFilteredTrials([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function
  const refreshTrials = async () => {
    await loadTrialsData();
  };

  // AI-powered matching algorithm
  const calculateTrialScore = (trial: Trial, profile: Partial<PatientProfile>): number => {
    let score = 0;
    
    // Condition matching
    if (profile.cancer_type && trial.condition.toLowerCase().includes(profile.cancer_type.toLowerCase())) {
      score += 30;
    }
    
    // Biomarker matching
    if (profile.biomarkers && trial.biomarkers) {
      const matchingBiomarkers = profile.biomarkers.filter(b => 
        trial.biomarkers!.some(tb => tb.toLowerCase().includes(b.toLowerCase()))
      );
      score += matchingBiomarkers.length * 15;
    }
    
    // Age eligibility
    if (profile.age && trial.age_range) {
      if (profile.age >= trial.age_range.min && profile.age <= trial.age_range.max) {
        score += 20;
      }
    }
    
    // Trial status
    if (trial.status === 'Recruiting') {
      score += 15;
    }
    
    // Phase preference (higher phases get more points)
    const phasePoints: { [key: string]: number } = {
      'Phase 1': 5,
      'Phase 2': 10,
      'Phase 3': 15,
      'Phase 4': 8
    };
    score += phasePoints[trial.phase] || 0;
    
    return Math.min(score, 100);
  };

  // Filter and sort trials
  useEffect(() => {
    let filtered = trials.map(trial => {
      // Calculate distances for each location if user location is available
      const trialsWithDistances = {
        ...trial,
        locations: trial.locations.map(location => ({
          ...location,
          distance: userLocation ? calculateDistance(
            userLocation.lat, 
            userLocation.lon, 
            location.lat, 
            location.lon
          ) : undefined
        }))
      };
      
      // Set trial distance to nearest location
      if (userLocation) {
        const minDistance = Math.min(...trialsWithDistances.locations.map(loc => loc.distance || Infinity));
        trialsWithDistances.distance = minDistance === Infinity ? undefined : minDistance;
      }
      
      return trialsWithDistances;
    }).filter(trial => {
      // Search query
      if (searchQuery && !trial.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !trial.condition.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filters
      if (filters.condition && !trial.condition.toLowerCase().includes(filters.condition.toLowerCase())) {
        return false;
      }
      
      if (filters.phase && trial.phase !== filters.phase) {
        return false;
      }
      
      if (filters.status && trial.status !== filters.status) {
        return false;
      }
      
      if (filters.biomarker && (!trial.biomarkers || 
          !trial.biomarkers.some(b => b.toLowerCase().includes(filters.biomarker.toLowerCase())))) {
        return false;
      }
      
      if (filters.showOnlyRecruiting && trial.status !== 'Recruiting') {
        return false;
      }
      
      // Distance filter
      if (userLocation && trial.distance && trial.distance > filters.maxDistance) {
        return false;
      }
      
      return true;
    });

    // Apply AI scoring if enabled
    if (aiMatchingEnabled && Object.keys(patientProfile).some(key => patientProfile[key as keyof PatientProfile])) {
      filtered = filtered.map(trial => ({
        ...trial,
        score: calculateTrialScore(trial, patientProfile)
      }));
    }

    // Sort trials
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return (b.score || 0) - (a.score || 0);
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'enrollment':
          return b.enrollment_current - a.enrollment_current;
        case 'phase':
          const phaseOrder = { 'Phase 1': 1, 'Phase 2': 2, 'Phase 3': 3, 'Phase 4': 4 };
          return (phaseOrder[b.phase as keyof typeof phaseOrder] || 0) - 
                 (phaseOrder[a.phase as keyof typeof phaseOrder] || 0);
        default:
          return 0;
      }
    });

    setFilteredTrials(filtered);
  }, [trials, searchQuery, filters, aiMatchingEnabled, patientProfile, sortBy, userLocation]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase 1': return 'bg-blue-100 text-blue-800';
      case 'Phase 2': return 'bg-green-100 text-green-800';
      case 'Phase 3': return 'bg-purple-100 text-purple-800';
      case 'Phase 4': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recruiting': return 'bg-green-100 text-green-800';
      case 'Active, not recruiting': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TrialCard: React.FC<{ trial: Trial }> = ({ trial }) => {
    const isExpanded = expandedTrialId === trial.nct_id;
    
    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-mono text-blue-600">{trial.nct_id}</span>
                {trial.score && (
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">{trial.score}% match</span>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{trial.title}</h3>
              <p className="text-gray-600 mb-3">{trial.brief_summary}</p>
              
              {/* Prominent Location Header */}
              <div className="mb-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Primary Location: {trial.locations[0]?.name}
                  </span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {trial.locations[0]?.address}, {trial.locations[0]?.city}, {trial.locations[0]?.state} {trial.locations[0]?.zip}
                </p>
                {trial.distance && (
                  <p className="text-xs text-green-700 font-medium mt-1">
                    📍 {trial.distance.toFixed(1)} km from your location
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setExpandedTrialId(isExpanded ? null : trial.nct_id)}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Beaker className="h-4 w-4 text-blue-500" />
              <span className={`text-xs font-medium px-2 py-1 rounded ${getPhaseColor(trial.phase)}`}>
                {trial.phase}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(trial.status)}`}>
                {trial.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                {trial.enrollment_current}/{trial.enrollment_target}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">
                  {trial.locations.length} site{trial.locations.length !== 1 ? 's' : ''}
                  {trial.distance && (
                    <span className="ml-1 font-medium text-blue-600">
                      • {trial.distance.toFixed(1)} km away
                    </span>
                  )}
                </span>
                {trial.locations.length > 0 && (
                  <span className="text-xs text-gray-500 mt-0.5">
                    {trial.locations[0].city}, {trial.locations[0].state}
                    {trial.locations.length > 1 && ` + ${trial.locations.length - 1} more`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Match Reasons */}
          {trial.match_reasons && trial.match_reasons.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Why this trial matches:</h4>
              <div className="flex flex-wrap gap-2">
                {trial.match_reasons.map((reason, index) => (
                  <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {reason}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Location Preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <MapPin className="h-4 w-4 text-blue-600 mr-1" />
              Study Locations:
            </h4>
            <div className="space-y-2">
              {trial.locations.slice(0, 2).map((location, index) => (
                <div key={index} className="flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{location.name}</p>
                    <p className="text-gray-600">{location.address}</p>
                    <p className="text-gray-600">{location.city}, {location.state} {location.zip}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(location.status)}`}>
                        {location.status}
                      </span>
                      {location.distance && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {location.distance.toFixed(1)} km away
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button 
                      onClick={() => openDirections(location, 'google')}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                      title="Get Directions"
                    >
                      <Navigation className="h-3 w-3" />
                    </button>
                    {location.contact && (
                      <button 
                        onClick={() => window.open(`tel:${location.contact?.phone}`)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                        title="Call"
                      >
                        <Phone className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {trial.locations.length > 2 && (
                <p className="text-xs text-blue-600 font-medium">
                  + {trial.locations.length - 2} more location{trial.locations.length > 3 ? 's' : ''} (click to expand)
                </p>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              {/* Biomarkers */}
              {trial.biomarkers && trial.biomarkers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Biomarkers:</h4>
                  <div className="flex flex-wrap gap-2">
                    {trial.biomarkers.map((biomarker, index) => (
                      <span key={index} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                        {biomarker}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interventions */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Interventions:</h4>
                <div className="flex flex-wrap gap-2">
                  {trial.interventions.map((intervention, index) => (
                    <span key={index} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      {intervention}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Arms */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Study Arms:</h4>
                <div className="space-y-2">
                  {trial.arms.map((arm, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">{arm.name}</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{arm.type}</span>
                      </div>
                      <p className="text-sm text-gray-600">{arm.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Eligibility Criteria:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-green-700 mb-1">Inclusion:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {trial.inclusion_criteria.slice(0, 3).map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                      {trial.inclusion_criteria.length > 3 && (
                        <li className="text-blue-600">+{trial.inclusion_criteria.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-red-700 mb-1">Exclusion:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {trial.exclusion_criteria.slice(0, 3).map((criteria, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                      {trial.exclusion_criteria.length > 3 && (
                        <li className="text-blue-600">+{trial.exclusion_criteria.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Study Locations:</h4>
                <div className="space-y-3">
                  {trial.locations.map((location, index) => (
                    <div key={index} className="border border-blue-200 rounded-lg overflow-hidden">
                      {/* Location Header */}
                      <div className="p-4 bg-blue-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{location.name}</p>
                            <div className="mt-1 space-y-0.5">
                              <p className="text-sm text-gray-600">{location.address}</p>
                              <p className="text-sm text-gray-600">{location.city}, {location.state} {location.zip}</p>
                              <p className="text-sm text-gray-500">{location.country}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(location.status)}`}>
                                {location.status}
                              </span>
                              {location.distance && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {location.distance.toFixed(1)} km away
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          {location.contact && (
                            <div className="text-right ml-4">
                              <p className="text-xs font-medium text-gray-700">{location.contact.name}</p>
                              <p className="text-xs text-gray-500">{location.contact.phone}</p>
                              <p className="text-xs text-gray-500">{location.contact.email}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-3 bg-white border-t border-blue-100">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Contact Actions */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Contact:</p>
                            <div className="flex space-x-2">
                              {location.contact && (
                                <>
                                  <button 
                                    onClick={() => window.open(`tel:${location.contact?.phone}`)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    title="Call"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>Call</span>
                                  </button>
                                  <button 
                                    onClick={() => window.open(`mailto:${location.contact?.email}`)}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                    title="Email"
                                  >
                                    <Mail className="h-3 w-3" />
                                    <span>Email</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Map & Directions */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Navigation:</p>
                            <div className="grid grid-cols-2 gap-1">
                              <button 
                                onClick={() => openDirections(location, 'google')}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                title="Google Maps Directions"
                              >
                                <Navigation className="h-3 w-3" />
                                <span>Google</span>
                              </button>
                              <button 
                                onClick={() => openDirections(location, 'apple')}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                title="Apple Maps Directions"
                              >
                                <Map className="h-3 w-3" />
                                <span>Apple</span>
                              </button>
                              <button 
                                onClick={() => openDirections(location, 'waze')}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                title="Waze Directions"
                              >
                                <Car className="h-3 w-3" />
                                <span>Waze</span>
                              </button>
                              <button 
                                onClick={() => setSelectedLocationForDirections(selectedLocationForDirections?.address === location.address ? null : location)}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                                title="Show Embedded Map"
                              >
                                <MapPin className="h-3 w-3" />
                                <span>Map</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Embedded Map */}
                        {selectedLocationForDirections?.address === location.address && (
                          <div className="mt-3 border-t border-gray-200 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-gray-700">Interactive Map:</p>
                              <button 
                                onClick={() => setSelectedLocationForDirections(null)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                <Minimize2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="w-full h-64 bg-gray-100 rounded border overflow-hidden relative">
                              <iframe
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon-0.01},${location.lat-0.01},${location.lon+0.01},${location.lat+0.01}&layer=mapnik&marker=${location.lat},${location.lon}`}
                                className="w-full h-full border-0"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`Map of ${location.name}`}
                              />
                              {/* Map overlay with location info */}
                              <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded shadow text-xs">
                                <MapPin className="h-3 w-3 text-red-500 inline mr-1" />
                                {location.name}
                              </div>
                            </div>
                            
                            {/* Map Actions */}
                            <div className="mt-2 flex justify-between items-center text-xs">
                              <div className="flex space-x-2">
                                <span className="text-gray-500">Coordinates:</span>
                                <span className="font-mono text-gray-700">{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
                              </div>
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => navigator.clipboard.writeText(`${location.lat}, ${location.lon}`)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Copy Coords
                                </button>
                                <button 
                                  onClick={() => window.open(`https://www.google.com/maps/@${location.lat},${location.lon},15z`, '_blank')}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Full Map
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">View on ClinicalTrials.gov</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Download Summary</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Bookmark className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent mb-4">
          AI-Powered Clinical Trial Matcher
        </h1>
        <p className="text-gray-600 text-lg max-w-4xl mx-auto">
          Discover cutting-edge clinical trials with AI-powered matching, real-time eligibility checking, and personalized recommendations.
        </p>
      </div>

      {/* AI Matching Controls */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-800">AI-Powered Trial Matching</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">BETA</span>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={aiMatchingEnabled}
                onChange={(e) => setAiMatchingEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable AI Matching</span>
            </label>
          </div>

          {aiMatchingEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientProfile.age || ''}
                  onChange={(e) => setPatientProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                  placeholder="Patient age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancer Type</label>
                <input
                  type="text"
                  value={patientProfile.cancer_type || ''}
                  onChange={(e) => setPatientProfile(prev => ({ ...prev, cancer_type: e.target.value }))}
                  placeholder="e.g., DLBCL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={patientProfile.stage || ''}
                  onChange={(e) => setPatientProfile(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select stage</option>
                  <option value="I">Stage I</option>
                  <option value="II">Stage II</option>
                  <option value="III">Stage III</option>
                  <option value="IV">Stage IV</option>
                  <option value="Relapsed">Relapsed</option>
                  <option value="Refractory">Refractory</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biomarkers</label>
                <input
                  type="text"
                  placeholder="e.g., CD19+, PD-L1+"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        setPatientProfile(prev => ({
                          ...prev,
                          biomarkers: [...(prev.biomarkers || []), value]
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Performance Status</label>
                <select
                  value={patientProfile.performance_status || ''}
                  onChange={(e) => setPatientProfile(prev => ({ ...prev, performance_status: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">ECOG PS</option>
                  <option value="0">0 - Fully active</option>
                  <option value="1">1 - Restricted strenuous activity</option>
                  <option value="2">2 - Ambulatory, up &gt;50% of time</option>
                  <option value="3">3 - Limited self-care</option>
                </select>
              </div>
            </div>
          )}

          {patientProfile.biomarkers && patientProfile.biomarkers.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selected Biomarkers:</label>
              <div className="flex flex-wrap gap-2">
                {patientProfile.biomarkers.map((biomarker, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full flex items-center">
                    {biomarker}
                    <button
                      onClick={() => setPatientProfile(prev => ({
                        ...prev,
                        biomarkers: prev.biomarkers?.filter((_, i) => i !== index)
                      }))}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Search Clinical Trials</h3>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by trial title, condition, or intervention..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  data-tour="trials-search-input"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Conditions</option>
                    <option value="lymphoma">Lymphoma</option>
                    <option value="breast cancer">Breast Cancer</option>
                    <option value="lung cancer">Lung Cancer</option>
                    <option value="solid tumor">Solid Tumors</option>
                  </select>
                  
                  <select
                    value={filters.phase}
                    onChange={(e) => setFilters(prev => ({ ...prev, phase: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Phases</option>
                    <option value="Phase 1">Phase 1</option>
                    <option value="Phase 2">Phase 2</option>
                    <option value="Phase 3">Phase 3</option>
                    <option value="Phase 4">Phase 4</option>
                  </select>
                  
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Recruiting">Recruiting</option>
                    <option value="Active, not recruiting">Active, not recruiting</option>
                    <option value="Completed">Completed</option>
                  </select>
                  
                  <input
                    type="text"
                    value={filters.biomarker}
                    onChange={(e) => setFilters(prev => ({ ...prev, biomarker: e.target.value }))}
                    placeholder="Biomarker (e.g., CD19+)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location Controls */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h4 className="text-sm font-medium text-blue-800">Location-Based Search</h4>
                    {userLocation && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Location detected
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={getUserLocation}
                      disabled={!!userLocation}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{userLocation ? 'Location Set' : 'Get My Location'}</span>
                    </button>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Distance (km)</label>
                      <input
                        type="number"
                        value={filters.maxDistance}
                        onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                        placeholder="100"
                        min="1"
                        max="1000"
                        disabled={!userLocation}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    
                    {userLocation && (
                      <button
                        onClick={() => setUserLocation(null)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        <span>Clear Location</span>
                      </button>
                    )}
                  </div>
                  
                  {userLocation && (
                    <div className="mt-2 text-xs text-gray-600">
                      Current location: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">View Options</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance">AI Match Score</option>
                    <option value="distance">Distance</option>
                    <option value="enrollment">Enrollment</option>
                    <option value="phase">Phase</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="recruitingOnly"
                    checked={filters.showOnlyRecruiting}
                    onChange={(e) => setFilters(prev => ({ ...prev, showOnlyRecruiting: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="recruitingOnly" className="text-sm text-gray-700">
                    Show only recruiting trials
                  </label>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Map View:</h4>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      showMap 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {showMap ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    <span>{showMap ? 'Hide Map' : 'Show All Locations'}</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Results Summary */}
      <Card className="border-green-200 bg-green-50">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DatabaseIcon className="h-5 w-5 text-green-600" />
                <span className="text-lg font-medium text-green-800">
                  {filteredTrials.length} trials found
                </span>
              </div>
              {aiMatchingEnabled && (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">
                    {filteredTrials.filter(t => (t.score || 0) > 50).length} high-confidence matches
                  </span>
                </div>
              )}
              {userLocation && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {filteredTrials.filter(t => t.distance && t.distance <= filters.maxDistance).length} within {filters.maxDistance} km
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={refreshTrials}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Results'}</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Global Map View */}
      {showMap && filteredTrials.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Trial Locations Map</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {filteredTrials.reduce((acc, trial) => acc + trial.locations.length, 0)} locations
                </span>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minimize2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="w-full h-96 bg-gray-100 rounded-lg border overflow-hidden relative">
              {userLocation ? (
                <>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation.lon-1},${userLocation.lat-1},${userLocation.lon+1},${userLocation.lat+1}&layer=mapnik&marker=${userLocation.lat},${userLocation.lon}`}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Clinical Trial Locations Map"
                  />
                  {/* Map overlay showing trial locations */}
                  <div className="absolute top-2 right-2 bg-white bg-opacity-95 p-2 rounded shadow max-w-48">
                    <h5 className="text-xs font-medium text-gray-800 mb-1">Nearby Trials:</h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {filteredTrials.slice(0, 3).map((trial, index) => (
                        <div key={index} className="text-xs">
                          <p className="font-medium text-gray-700 truncate">{trial.locations[0]?.name}</p>
                          <p className="text-gray-500">{trial.locations[0]?.city}, {trial.locations[0]?.state}</p>
                          {trial.distance && (
                            <p className="text-blue-600">{trial.distance.toFixed(1)} km away</p>
                          )}
                        </div>
                      ))}
                      {filteredTrials.length > 3 && (
                        <p className="text-xs text-blue-600">+{filteredTrials.length - 3} more trials</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Enable Location for Map View</h4>
                    <p className="text-gray-600 mb-4">
                      Allow location access to see trial locations on an interactive map
                    </p>
                    <button
                      onClick={getUserLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Get My Location
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Location Legend */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-3 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800">Recruiting</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {filteredTrials.filter(t => t.status === 'Recruiting').reduce((acc, trial) => acc + trial.locations.length, 0)} locations
                </p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-800">Active, not recruiting</span>
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  {filteredTrials.filter(t => t.status === 'Active, not recruiting').reduce((acc, trial) => acc + trial.locations.length, 0)} locations
                </p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-800">Other Status</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {filteredTrials.filter(t => t.status !== 'Recruiting' && t.status !== 'Active, not recruiting').reduce((acc, trial) => acc + trial.locations.length, 0)} locations
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Trial Results */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="p-12 text-center">
              <div className="flex items-center justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {trials.length > 0 ? 'Refreshing Results...' : 'Loading Clinical Trials...'}
              </h3>
              <p className="text-gray-600">
                {trials.length > 0 
                  ? 'Fetching the latest trial information and updating match scores...'
                  : 'Connecting to clinical trial databases and analyzing matches...'
                }
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </Card>
        ) : filteredTrials.length > 0 ? (
          filteredTrials.map(trial => (
            <TrialCard key={trial.nct_id} trial={trial} />
          ))
        ) : (
          <Card>
            <div className="p-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Trials Found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find relevant clinical trials.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    condition: '',
                    phase: '',
                    status: '',
                    biomarker: '',
                    location: '',
                    maxDistance: 100,
                    minEnrollment: 0,
                    showOnlyRecruiting: true
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Clear All Filters
              </button>
            </div>
          </Card>
        )}
      </div>

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default AdvancedTrials;
