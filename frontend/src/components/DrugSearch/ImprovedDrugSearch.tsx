import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Brain,
  Target,
  Zap,
  Activity,
  Microscope,
  Pill,
  Heart,
  Shield,
  Sparkles,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Users,
  Globe,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Info,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus
} from 'lucide-react';
import Card from '../UI/Card';
import EnhancedDrugResults from './EnhancedDrugResults';
import { togglePin } from '../../utils/pins';
import SolidDrugSearch from './SolidDrugSearch';
import FilterAutocomplete, {
  THERAPEUTIC_CLASS_OPTIONS,
  MECHANISM_OPTIONS,
  INDICATION_OPTIONS,
  BIOMARKER_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  CLINICAL_TRIAL_PHASE_OPTIONS
} from './FilterAutocomplete';

interface DrugSearchFilters {
  query: string;
  drugType: string[];
  therapeuticClass: string[];
  mechanismOfAction: string[];
  indication: string[];
  biomarker: string[];
  approvalStatus: string[];
  clinicalTrialPhase: string[];
  hasInteractions: boolean;
  hasGenomicFactors: boolean;
  requiresMonitoring: boolean;
  isOncologyDrug: boolean;
  isOrphanDrug: boolean;
  hasBlackBoxWarning: boolean;
}

interface AISearchSuggestion {
  type: 'drug' | 'indication' | 'mechanism' | 'biomarker' | 'class' | 'symptom';
  text: string;
  confidence: number;
  category: string;
  description?: string;
  relevantDrugs?: string[];
  alternativeTerms?: string[];
}

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'similar_drugs' | 'alternative_therapy' | 'combination' | 'monitoring' | 'contraindication';
  confidence: number;
  evidence_level: 'high' | 'moderate' | 'low';
  drug_suggestions?: string[];
  reasoning: string;
}

const ImprovedDrugSearch: React.FC<{ onOfflineChange?: (offline: boolean) => void }> = ({ onOfflineChange }) => {
  const [filters, setFilters] = useState<DrugSearchFilters>({
    query: '',
    drugType: [],
    therapeuticClass: [],
    mechanismOfAction: [],
    indication: [],
    biomarker: [],
    approvalStatus: [],
    clinicalTrialPhase: [],
    hasInteractions: false,
    hasGenomicFactors: false,
    requiresMonitoring: false,
    isOncologyDrug: false,
    isOrphanDrug: false,
    hasBlackBoxWarning: false
  });

  const [searchSuggestions, setSearchSuggestions] = useState<AISearchSuggestion[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiMode, setAiMode] = useState<'search' | 'recommend' | 'analyze'>('search');
  const [activeTab, setActiveTab] = useState('therapeutic');
  const [serverSuggestions, setServerSuggestions] = useState<Array<{ name: string; rxcui?: string | null }>>([]);
  const [serverSuggestionsOffline, setServerSuggestionsOffline] = useState<boolean>(false);
  const [serverSuggestionsLoading, setServerSuggestionsLoading] = useState<boolean>(false);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [pinnedOnly, setPinnedOnly] = useState<boolean>(false);
  const [selectedRxcui, setSelectedRxcui] = useState<string | null>(null);
  const [variants, setVariants] = useState<Array<{ rxcui: string; name: string; tty: string }>>([]);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variantLoading, setVariantLoading] = useState<boolean>(false);
  const [details, setDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [interactionSummary, setInteractionSummary] = useState<{ total: number; major: number; moderate: number; minor: number } | null>(null);
  const [interactionLoading, setInteractionLoading] = useState<boolean>(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  const filterOptions = {
    drugType: [
      { value: 'brand', label: 'Brand Name' },
      { value: 'generic', label: 'Generic' },
      { value: 'biosimilar', label: 'Biosimilar' },
      { value: 'combination', label: 'Combination' },
      { value: 'investigational', label: 'Investigational' }
    ],
    therapeuticClass: [
      { value: 'antineoplastic', label: 'Antineoplastic Agents' },
      { value: 'immunotherapy', label: 'Immunotherapy' },
      { value: 'targeted_therapy', label: 'Targeted Therapy' },
      { value: 'chemotherapy', label: 'Chemotherapy' },
      { value: 'hormone_therapy', label: 'Hormone Therapy' },
      { value: 'supportive_care', label: 'Supportive Care' },
      { value: 'pain_management', label: 'Pain Management' },
      { value: 'antiemetic', label: 'Antiemetic' }
    ],
    mechanismOfAction: [
      { value: 'kinase_inhibitor', label: 'Kinase Inhibitor' },
      { value: 'monoclonal_antibody', label: 'Monoclonal Antibody' },
      { value: 'checkpoint_inhibitor', label: 'Checkpoint Inhibitor' },
      { value: 'alkylating_agent', label: 'Alkylating Agent' },
      { value: 'antimetabolite', label: 'Antimetabolite' },
      { value: 'topoisomerase_inhibitor', label: 'Topoisomerase Inhibitor' },
      { value: 'proteasome_inhibitor', label: 'Proteasome Inhibitor' },
      { value: 'angiogenesis_inhibitor', label: 'Angiogenesis Inhibitor' }
    ],
    indication: [
      { value: 'breast_cancer', label: 'Breast Cancer' },
      { value: 'lung_cancer', label: 'Lung Cancer' },
      { value: 'colorectal_cancer', label: 'Colorectal Cancer' },
      { value: 'melanoma', label: 'Melanoma' },
      { value: 'leukemia', label: 'Leukemia' },
      { value: 'lymphoma', label: 'Lymphoma' },
      { value: 'prostate_cancer', label: 'Prostate Cancer' },
      { value: 'ovarian_cancer', label: 'Ovarian Cancer' },
      { value: 'pancreatic_cancer', label: 'Pancreatic Cancer' },
      { value: 'brain_tumor', label: 'Brain Tumor' }
    ],
    biomarker: [
      { value: 'her2_positive', label: 'HER2+' },
      { value: 'er_pr_positive', label: 'ER/PR+' },
      { value: 'triple_negative', label: 'Triple Negative' },
      { value: 'egfr_mutation', label: 'EGFR Mutation' },
      { value: 'kras_mutation', label: 'KRAS Mutation' },
      { value: 'brca_mutation', label: 'BRCA1/2 Mutation' },
      { value: 'pd_l1_positive', label: 'PD-L1+' },
      { value: 'msi_high', label: 'MSI-H' },
      { value: 'tmb_high', label: 'TMB-H' }
    ],
    approvalStatus: [
      { value: 'fda_approved', label: 'FDA Approved' },
      { value: 'ema_approved', label: 'EMA Approved' },
      { value: 'breakthrough_therapy', label: 'Breakthrough Therapy' },
      { value: 'fast_track', label: 'Fast Track' },
      { value: 'orphan_drug', label: 'Orphan Drug' },
      { value: 'conditional_approval', label: 'Conditional Approval' }
    ],
    clinicalTrialPhase: [
      { value: 'phase_1', label: 'Phase I' },
      { value: 'phase_2', label: 'Phase II' },
      { value: 'phase_3', label: 'Phase III' },
      { value: 'phase_4', label: 'Phase IV' },
      { value: 'post_marketing', label: 'Post-Marketing' }
    ]
  };

  const generateAISuggestions = async (query: string): Promise<AISearchSuggestion[]> => {
    if (!query || query.length < 2) return [];

    const mockSuggestions: AISearchSuggestion[] = [
      {
        type: 'drug',
        text: 'pembrolizumab',
        confidence: 0.95,
        category: 'PD-1 Inhibitor',
        description: 'Checkpoint inhibitor for multiple cancer types',
        relevantDrugs: ['nivolumab', 'atezolizumab'],
        alternativeTerms: ['Keytruda', 'PD-1 inhibitor']
      },
      {
        type: 'indication',
        text: 'non-small cell lung cancer',
        confidence: 0.88,
        category: 'Oncology',
        description: 'Most common type of lung cancer',
        relevantDrugs: ['osimertinib', 'erlotinib', 'gefitinib']
      },
      {
        type: 'mechanism',
        text: 'EGFR tyrosine kinase inhibitor',
        confidence: 0.82,
        category: 'Targeted Therapy',
        description: 'Targets EGFR signaling pathway',
        relevantDrugs: ['osimertinib', 'erlotinib', 'afatinib']
      }
    ];

    return mockSuggestions.filter(s => 
      s.text.toLowerCase().includes(query.toLowerCase()) ||
      s.category.toLowerCase().includes(query.toLowerCase()) ||
      s.alternativeTerms?.some(term => term.toLowerCase().includes(query.toLowerCase()))
    );
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (filters.query) {
        const suggestions = await generateAISuggestions(filters.query);
        setSearchSuggestions(suggestions);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query]);

  // Fetch server suggestions for the visible query (debounced)
  useEffect(() => {
    let abort = false;
    if (!filters.query || filters.query.trim().length < 2) {
      setServerSuggestions([]);
      setServerSuggestionsOffline(false);
      return;
    }
    setServerSuggestionsLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/drugs/suggestions?q=${encodeURIComponent(filters.query)}&limit=8`);
        if (!resp.ok) throw new Error('suggestions failed');
        const data = await resp.json();
        if (abort) return;
        setServerSuggestions((data.suggestions || []).map((s: any) => ({ name: s.name, rxcui: s.rxcui })));
        setServerSuggestionsOffline(!!data.offline);
        onOfflineChange?.(!!data.offline);
      } catch {
        if (!abort) {
          // Graceful offline fallback with a small local list
          const LOCAL: Array<{ name: string; rxcui?: string | null }> = [
            { name: 'aspirin' },
            { name: 'ibuprofen' },
            { name: 'acetaminophen' },
            { name: 'clopidogrel' },
            { name: 'warfarin' },
            { name: 'omeprazole' },
            { name: 'simvastatin' },
            { name: 'levodopa' },
          ];
          const q = filters.query.toLowerCase();
          const fallback = LOCAL.filter(d => d.name.includes(q)).slice(0, 8);
          setServerSuggestions(fallback);
          setServerSuggestionsOffline(true);
          onOfflineChange?.(true);
        }
      } finally {
        if (!abort) setServerSuggestionsLoading(false);
      }
    }, 300);
    return () => { abort = true; clearTimeout(t); };
  }, [filters.query, onOfflineChange]);

  const handleFilterChange = (category: keyof DrugSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleMultiSelectFilter = (category: keyof DrugSearchFilters, value: string) => {
    setFilters(prev => {
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues
      };
    });
  };

  const runSearch = async () => {
    const q = (filters.query || '').trim();
    if (q.length < 2) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    try {
      const resp = await fetch(`/api/drugs/search?q=${encodeURIComponent(q)}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      setSearchResults(results);
    } catch (e: any) {
      setSearchError(e?.message || 'Search failed');
    } finally {
      setSearchLoading(false);
    }
  };

  // Load variants on selected RXCUI change
  useEffect(() => {
    const loadVariants = async () => {
      if (!selectedRxcui) { setVariants([]); setVariantError(null); return; }
      setVariantLoading(true);
      setVariantError(null);
      try {
        const resp = await fetch(`/api/drugs/${encodeURIComponent(selectedRxcui)}/variants`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setVariants(Array.isArray(data?.variants) ? data.variants : []);
      } catch (e: any) {
        setVariantError(e?.message || 'Failed to load variations');
        setVariants([]);
      } finally {
        setVariantLoading(false);
      }
    };
    loadVariants();
  }, [selectedRxcui]);

  // Load details for selected RXCUI
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedRxcui) { setDetails(null); setDetailsError(null); return; }
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const resp = await fetch(`/api/drugs/${encodeURIComponent(selectedRxcui)}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setDetails(data);
      } catch (e: any) {
        setDetailsError(e?.message || 'Failed to load details');
        setDetails(null);
      } finally {
        setDetailsLoading(false);
      }
    };
    loadDetails();
  }, [selectedRxcui]);

  // Load interaction summary for selected RXCUI
  useEffect(() => {
    const load = async () => {
      if (!selectedRxcui) { setInteractionSummary(null); setInteractionError(null); return; }
      setInteractionLoading(true);
      setInteractionError(null);
      try {
        const resp = await fetch(`/api/drugs/${encodeURIComponent(selectedRxcui)}/interactions`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        const stored = data?.interactions?.stored || [];
        const external = data?.interactions?.external || [];
        const all = [...stored, ...external];
        const sev = (s: any) => String(s || '').toLowerCase();
        const major = all.filter((i: any) => sev(i.severity).includes('major') || sev(i.severity).includes('high')).length;
        const moderate = all.filter((i: any) => sev(i.severity).includes('moderate')).length;
        const minor = all.filter((i: any) => sev(i.severity).includes('minor') || sev(i.severity).includes('low')).length;
        setInteractionSummary({ total: all.length, major, moderate, minor });
      } catch (e: any) {
        setInteractionError(e?.message || 'Failed to load interaction summary');
        setInteractionSummary(null);
      } finally {
        setInteractionLoading(false);
      }
    };
    load();
  }, [selectedRxcui]);

  // duplicate variants loader removed

  const clearAllFilters = () => {
    setFilters({
      query: '',
      drugType: [],
      therapeuticClass: [],
      mechanismOfAction: [],
      indication: [],
      biomarker: [],
      approvalStatus: [],
      clinicalTrialPhase: [],
      hasInteractions: false,
      hasGenomicFactors: false,
      requiresMonitoring: false,
      isOncologyDrug: false,
      isOrphanDrug: false,
      hasBlackBoxWarning: false
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'query') return;
      if (Array.isArray(value) && value.length > 0) count++;
      if (typeof value === 'boolean' && value) count++;
    });
    return count;
  };

  const renderEnhancedFilter = (
    category: keyof DrugSearchFilters,
    options: any[],
    title: string,
    icon: React.ReactNode
  ) => {
    const selectedValues = filters[category] as string[];
    
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          {icon}
          <h4 className="font-medium text-gray-900">{title}</h4>
        </div>
        <FilterAutocomplete
          options={options}
          selectedValues={selectedValues}
          onSelectionChange={(values) => {
            setFilters(prev => ({ ...prev, [category]: values }));
          }}
          placeholder={`Select ${title.toLowerCase()}...`}
          searchable={true}
          showCounts={true}
          maxSelection={5}
        />
      </Card>
    );
  };

  const TabButton = ({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg ${
        isActive 
          ? 'bg-violet-100 text-violet-700 border border-violet-200' 
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* AI-Powered Search Interface */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-violet-600" />
            <h2 className="text-xl font-bold text-violet-800">AI-Enhanced Drug Search</h2>
            <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
              Neural Engine v2.0
            </span>
          </div>
          
          {/* Main Search Input with Autocomplete */}
          <div className="mb-4">
            <SolidDrugSearch
              placeholder="Search by drug name, indication, mechanism, biomarker, or ask a question..."
              value={filters.query}
              onChange={(v) => handleFilterChange('query', v)}
              onSelect={(opt) => {
                handleFilterChange('query', opt.name);
                if (opt.rxcui && /^\d+$/.test(String(opt.rxcui))) {
                  setSelectedRxcui(String(opt.rxcui));
                }
              }}
              maxResults={12}
              onOfflineChange={onOfflineChange}
              onAutoResolve={(opt) => {
                // Auto-populate choices when user input exactly matches a drug
                handleFilterChange('query', opt.name);
                if (opt.rxcui && /^\d+$/.test(String(opt.rxcui))) {
                  setSelectedRxcui(String(opt.rxcui));
                }
              }}
            />
          </div>

          {/* Server suggestions panel removed: SolidDrugSearch handles suggestions */}

          {/* AI Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-4">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('query', suggestion.text)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 text-left"
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'drug' && <Pill className="h-4 w-4 text-blue-500" />}
                      {suggestion.type === 'indication' && <Target className="h-4 w-4 text-red-500" />}
                      {suggestion.type === 'mechanism' && <Zap className="h-4 w-4 text-purple-500" />}
                      {suggestion.type === 'biomarker' && <Activity className="h-4 w-4 text-green-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{suggestion.text}</div>
                      <div className="text-xs text-gray-500">{suggestion.category}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-400 mt-1">{suggestion.description}</div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">AI Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { mode: 'search', label: 'Smart Search', icon: Search },
                { mode: 'recommend', label: 'Recommendations', icon: Target },
                { mode: 'analyze', label: 'Deep Analysis', icon: BarChart3 }
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setAiMode(mode as typeof aiMode)}
                  className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    aiMode === mode
                      ? 'bg-white text-violet-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
              {getActiveFiltersCount() > 0 && (
                <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
              >
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span>{showAdvancedFilters ? 'Hide' : 'Show'} Filters</span>
              </button>
            </div>
          </div>
          
          {showAdvancedFilters && (
            <div className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <TabButton isActive={activeTab === 'therapeutic'} onClick={() => setActiveTab('therapeutic')}>
                  Therapeutic
                </TabButton>
                <TabButton isActive={activeTab === 'molecular'} onClick={() => setActiveTab('molecular')}>
                  Molecular
                </TabButton>
                <TabButton isActive={activeTab === 'clinical'} onClick={() => setActiveTab('clinical')}>
                  Clinical
                </TabButton>
                <TabButton isActive={activeTab === 'regulatory'} onClick={() => setActiveTab('regulatory')}>
                  Regulatory
                </TabButton>
                <TabButton isActive={activeTab === 'safety'} onClick={() => setActiveTab('safety')}>
                  Safety
                </TabButton>
              </div>

              {activeTab === 'therapeutic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderEnhancedFilter(
                    'therapeuticClass',
                    THERAPEUTIC_CLASS_OPTIONS,
                    'Therapeutic Class',
                    <Heart className="h-4 w-4 text-red-500" />
                  )}
                  {renderEnhancedFilter(
                    'indication',
                    INDICATION_OPTIONS,
                    'Cancer Indication',
                    <Target className="h-4 w-4 text-blue-500" />
                  )}
                  {renderEnhancedFilter(
                    'mechanismOfAction',
                    MECHANISM_OPTIONS,
                    'Mechanism of Action',
                    <Zap className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              )}

              {activeTab === 'molecular' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderEnhancedFilter(
                    'biomarker',
                    BIOMARKER_OPTIONS,
                    'Biomarker Targets',
                    <Activity className="h-4 w-4 text-green-500" />
                  )}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Microscope className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium text-gray-900">Molecular Features</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasGenomicFactors}
                            onChange={(e) => handleFilterChange('hasGenomicFactors', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Has Genomic Factors</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasInteractions}
                            onChange={(e) => handleFilterChange('hasInteractions', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Has Drug Interactions</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'clinical' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderEnhancedFilter(
                    'clinicalTrialPhase',
                    CLINICAL_TRIAL_PHASE_OPTIONS,
                    'Clinical Trial Phase',
                    <Clock className="h-4 w-4 text-orange-500" />
                  )}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium text-gray-900">Patient Factors</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.requiresMonitoring}
                            onChange={(e) => handleFilterChange('requiresMonitoring', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Requires Monitoring</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.isOncologyDrug}
                            onChange={(e) => handleFilterChange('isOncologyDrug', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Oncology Drugs Only</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'regulatory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderEnhancedFilter(
                    'approvalStatus',
                    APPROVAL_STATUS_OPTIONS,
                    'Approval Status',
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium text-gray-900">Regulatory Features</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.isOrphanDrug}
                            onChange={(e) => handleFilterChange('isOrphanDrug', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Orphan Drug Status</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <h4 className="font-medium text-gray-900">Safety Alerts</h4>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.hasBlackBoxWarning}
                            onChange={(e) => handleFilterChange('hasBlackBoxWarning', e.target.checked)}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700">Black Box Warning</span>
                        </label>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Search Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={runSearch}
            disabled={searchLoading || !filters.query || filters.query.trim().length < 2}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg hover:from-violet-700 hover:to-indigo-700 flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>Search Drugs</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Get AI Recommendations</span>
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Results</span>
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Powered by OncoSafeRx Neural Engine
        </div>
      </div>

      {/* Inline Results Panel */}
      <div className="mt-4">
        {/* Variations panel */}
        {selectedRxcui && (
          <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Variations for RXCUI {selectedRxcui}</div>
              {variantLoading && <div className="text-xs text-gray-500">Loading…</div>}
            </div>
            {variantError && (
              <div className="text-xs text-red-600">{variantError}</div>
            )}
            {!variantError && variants.length === 0 && !variantLoading && (
              <div className="text-xs text-gray-500">No variations found</div>
            )}
            {variants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {variants.slice(0, 30).map(v => (
                  <button
                    key={v.rxcui}
                    onClick={() => setSelectedRxcui(v.rxcui)}
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                    title={v.tty}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected variant details */}
        {selectedRxcui && (
          <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Details</div>
              {detailsLoading && <div className="text-xs text-gray-500">Loading…</div>}
            </div>
            {detailsError && <div className="text-xs text-red-600">{detailsError}</div>}
            {!detailsError && !detailsLoading && details && (
              <div className="text-sm text-gray-800 space-y-1">
                <div><span className="text-gray-500">Name:</span> {details.name}</div>
                {details.generic_name && (
                  <div><span className="text-gray-500">Generic:</span> {details.generic_name}</div>
                )}
                {Array.isArray(details.brand_names) && details.brand_names.length > 0 && (
                  <div><span className="text-gray-500">Brands:</span> {details.brand_names.join(', ')}</div>
                )}
                {Array.isArray(details.dosage_forms) && details.dosage_forms.length > 0 && (
                  <div><span className="text-gray-500">Dosage forms:</span> {details.dosage_forms.join(', ')}</div>
                )}
                {Array.isArray(details.strengths) && details.strengths.length > 0 && (
                  <div><span className="text-gray-500">Strengths:</span> {details.strengths.join(', ')}</div>
                )}
                <div className="pt-2">
                  <div className="text-xs text-gray-500">Interaction summary</div>
                  {interactionLoading && <div className="text-xs text-gray-500">Checking…</div>}
                  {interactionError && <div className="text-xs text-red-600">{interactionError}</div>}
                  {!interactionLoading && !interactionError && interactionSummary && (
                    <div className="flex gap-3 text-xs text-gray-700">
                      <span>Total: {interactionSummary.total}</span>
                      <span>Major: {interactionSummary.major}</span>
                      <span>Moderate: {interactionSummary.moderate}</span>
                      <span>Minor: {interactionSummary.minor}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      onClick={() => {
                        try {
                          const key = 'osrx_interaction_basket';
                          const list = JSON.parse(localStorage.getItem(key) || '[]');
                          if (!list.find((d: any) => d.id === selectedRxcui)) {
                            list.push({ id: selectedRxcui, name: details.name });
                            localStorage.setItem(key, JSON.stringify(list.slice(-10)));
                          }
                          if (window.location.pathname !== '/interactions') window.location.href = '/interactions';
                        } catch {}
                      }}
                    >
                      Check interactions for this drug
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      onClick={() => {
                        try { localStorage.setItem('osrx_selected_drug', JSON.stringify(details)); } catch {}
                        window.location.href = '/database';
                      }}
                    >
                      View full profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Inline results toolbar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={pinnedOnly}
                onChange={(e) => setPinnedOnly(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Pinned only
            </label>
          </div>
          <div>
            <button
              type="button"
              onClick={() => { if (window.location.pathname !== '/interactions') window.location.href = '/interactions'; }}
              className="text-sm px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go to Interactions
            </button>
          </div>
        </div>
        {searchLoading && (
          <div className="text-sm text-gray-600">Searching…</div>
        )}
        {searchError && (
          <div className="text-sm text-red-600">{searchError}</div>
        )}
        {!searchLoading && !searchError && searchResults.length > 0 && (
          <EnhancedDrugResults
            drugs={searchResults
              .map((d: any) => ({
              id: d.rxcui || d.id || d.name,
              name: d.name,
              genericName: d.generic_name || d.genericName || d.name,
              therapeuticClass: d.insights?.therapeuticClass || d.therapeutic_class || 'Unknown',
              mechanismOfAction: d.insights?.mechanism || d.mechanism || 'Unknown',
              indication: d.insights?.indications || (d.indication ? [d.indication] : []),
              fdaApproved: true,
              safetyScore: 0,
              efficacyScore: 0,
              evidenceLevel: 'moderate',
              hasInteractions: false,
              hasGenomicFactors: false,
              requiresMonitoring: false,
              costTier: 'moderate',
              routeOfAdministration: [],
              dosageForm: [],
              keyBenefits: [],
              keyRisks: [],
              commonSideEffects: [],
              monitoringRequirements: [],
              contraindications: [],
              patientSuitability: [],
              relatedDrugs: [],
              clinicalTrials: 0,
              publications: 0,
              isOncologyDrug: !!d.insights?.isOncologyDrug,
              isOrphanDrug: !!d.insights?.isOrphanDrug,
            }))
            .filter((drug: any) => {
              if (!pinnedOnly) return true;
              try {
                const pins = JSON.parse(localStorage.getItem('oncosaferx_pins') || '{}');
                return !!pins[String(drug.id)];
              } catch { return false; }
            })}
            loading={false}
            error={undefined}
            onDrugSelect={(drug) => {
              // Set the query and load details for the selected RXCUI if available
              setFilters(prev => ({ ...prev, query: drug.name }));
              if (drug?.id && /^\d+$/.test(String(drug.id))) {
                setSelectedRxcui(String(drug.id));
              }
            }}
            onPin={(drug) => {
              if (drug?.id && drug?.name) {
                togglePin(String(drug.id), String(drug.name));
              }
            }}
            onAddToInteractions={(drug) => {
              try {
                const key = 'osrx_interaction_basket';
                const list = JSON.parse(localStorage.getItem(key) || '[]');
                if (!list.find((d: any) => d.id === drug.id)) {
                  list.push({ id: drug.id, name: drug.name });
                  localStorage.setItem(key, JSON.stringify(list.slice(-10)));
                }
                // Optional: navigate to interactions page
                if (window.location.pathname !== '/interactions') {
                  window.location.href = '/interactions';
                }
              } catch {}
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ImprovedDrugSearch;
