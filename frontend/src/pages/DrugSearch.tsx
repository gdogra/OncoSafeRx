import React, { useEffect, useMemo, useState } from 'react';
import { Drug, DrugSearchResult } from '../types';
import { drugService } from '../services/api';
import SimpleDrugSearch from '../components/DrugSearch/SimpleDrugSearch';
import PredictiveSearchBar from '../components/DrugSearch/PredictiveSearchBar';
import DrugSearchResults from '../components/DrugSearch/DrugSearchResults';
import DrugCard from '../components/DrugSearch/DrugCard';
import SearchWithFavorites from '../components/Search/SearchWithFavorites';
import ImprovedDrugSearch from '../components/DrugSearch/ImprovedDrugSearch';
import AutocompleteSearch from '../components/DrugSearch/AutocompleteSearch';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { useToast } from '../components/UI/Toast';
// Using existing UI components instead of shadcn
import { 
  Search, History, Star, Database, Filter, X, Brain, Zap, Target, 
  Activity, TrendingUp, Clock, CheckCircle, AlertTriangle, 
  BookOpen, Microscope, Pill, Heart, Shield, Sparkles,
  ChevronDown, ChevronUp, BarChart3, Users, Globe,
  RefreshCw, Download, Upload, Settings, Info
} from 'lucide-react';
import { useSelection } from '../context/SelectionContext';
import { analytics } from '../utils/analytics';
import { getPins, clearPins, togglePin, reorderPins } from '../utils/pins';
import { SearchFilter as AdvancedSearchFilter } from '../hooks/useAdvancedSearch';
import { useUrlState, useUrlFilters, useUrlPagination, useUrlSort } from '../hooks/useUrlState';
import { useUserPreferences, useRecentSearches } from '../hooks/useLocalStorage';

interface SearchFilters {
  drugType?: string;
  category?: string;
  hasInteractions?: boolean;
  hasGenomics?: boolean;
  approvalStatus?: string;
  sortBy?: string;
}

const DrugSearchInner: React.FC = () => {
  const selection = useSelection();
  
  // Search state with URL persistence
  const [searchQuery, setSearchQuery] = useUrlState<string>('q', { defaultValue: '' });
  
  // Filter state with URL persistence
  const [filters, updateFilters, clearFilters] = useUrlFilters({
    onlyOncology: false,
    onlyPinned: false,
    drugType: '',
    category: '',
    hasInteractions: false,
    hasGenomics: false,
    approvalStatus: '',
    BN: false,
    SCD: false,
    SBD: false,
    IN: false,
    MIN: false
  });
  
  // Pagination with URL persistence
  const { page, pageSize, setPage, setPageSize, resetPagination } = useUrlPagination(1, 20);
  
  // Sort state with URL persistence
  const { sortBy, sortDirection, updateSort } = useUrlSort<string>('relevance', 'desc');
  
  // User preferences in localStorage
  const { preferences, updatePreference } = useUserPreferences({
    defaultPageSize: 20,
    showDescriptions: true,
    compactView: false
  }, 'drug_search_preferences');
  
  // Recent searches in localStorage
  const { searches: searchHistory, addSearch } = useRecentSearches(10, 'drug_search_history');
  
  // Component state
  const [searchResults, setSearchResults] = useState<DrugSearchResult | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinsTick, setPinsTick] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'advanced' | 'ai'>('advanced');
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [drugAnalytics, setDrugAnalytics] = useState<any>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentInteractions, setRecentInteractions] = useState<any[]>([]);
  const [rxnormOfflineToast, setRxnormOfflineToast] = useState<boolean>(false);
  const [rxnormToastDismissed, setRxnormToastDismissed] = useState<boolean>(false);
  const { showToast } = useToast();
  const [connStatus, setConnStatus] = useState<'unknown'|'online'|'offline'|'error'>('unknown');
  const [connTesting, setConnTesting] = useState<boolean>(false);
  const [connCheckedAt, setConnCheckedAt] = useState<string | null>(null);
  const [basicSuggestions, setBasicSuggestions] = useState<Array<{ name: string; rxcui?: string | null }>>([]);
  const [basicSuggestionsOffline, setBasicSuggestionsOffline] = useState<boolean>(false);
  const [basicSuggestionsLoading, setBasicSuggestionsLoading] = useState<boolean>(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('rxnorm_offline_toast_dismissed') === '1';
    setRxnormToastDismissed(dismissed);
    // Test connectivity on component mount
    testConnectivity();
  }, []);

  async function testConnectivity() {
    try {
      setConnTesting(true);
      const resp = await fetch(`/api/drugs/search?q=aspirin`, { method: 'GET' });
      if (!resp.ok) {
        setConnStatus('error');
      } else {
        const data = await resp.json();
        // Check if we have RxNorm data (online) or local data only (offline)
        const isOnline = data?.sources?.rxnorm > 0;
        setConnStatus(isOnline ? 'online' : 'offline');
      }
      setConnCheckedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Connectivity test failed:', e);
      setConnStatus('error');
      setConnCheckedAt(new Date().toLocaleTimeString());
    } finally {
      setConnTesting(false);
    }
  }
  
  // Derived state
  const activeTtySet = useMemo(() => new Set(
    Object.entries(filters)
      .filter(([key, value]) => ['BN', 'SCD', 'SBD', 'IN', 'MIN'].includes(key) && value)
      .map(([key]) => key)
  ), [filters]);
  const pinnedList = useMemo(() => Object.entries(getPins()).map(([rxcui, v]) => ({ rxcui, name: v.name })), [pinsTick]);

  const handleAdvancedSearch = async (query: string, advancedFilters?: AdvancedSearchFilter) => {
    // Update URL state
    setSearchQuery(query);
    
    // Add to search history
    if (query && String(query).trim()) {
      addSearch(String(query).trim());
    }
    
    // Reset pagination when searching
    resetPagination();
    
    // Convert advanced filters to our search filters format and update state
    if (advancedFilters?.category) {
      updateFilters({ category: advancedFilters.category });
    }
    
    return handleSearch(query);
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setSelectedDrug(null);

    try {
      // Build search parameters with filters
      const searchParams = new URLSearchParams({ q: query });
      
      if (filters?.drugType) searchParams.append('type', filters.drugType);
      if (filters?.category) searchParams.append('category', filters.category);
      if (filters?.hasInteractions) searchParams.append('hasInteractions', 'true');
      if (filters?.hasGenomics) searchParams.append('hasGenomics', 'true');
      if (filters?.sortBy) searchParams.append('sort', filters.sortBy);

      const results = await drugService.searchDrugs(query);
      
      // Apply client-side filtering and sorting if needed
      let filteredResults = results.results;
      
      // Sort results based on filter
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'name':
            filteredResults.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'recent':
            // This would require additional backend support
            break;
          case 'popular':
            // This would require usage statistics
            break;
          default:
            // Keep default relevance order
            break;
        }
      }
      
      const finalResults = { ...results, results: filteredResults };
      setSearchResults(finalResults);
      try { analytics.logSearch(query, finalResults?.count); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search drugs');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrugSelectFromSearch = (drug: Drug) => {
    // When user selects from autocomplete, show detailed view directly
    handleDrugSelect(drug);
  };


  const handleDrugSelect = async (drug: Drug) => {
    setSelectedDrug(drug);
    selection.addDrug(drug);
    setLoading(true);
    
    // Try to get detailed information
    try {
      const details = await drugService.getDrugDetails(drug.rxcui);
      setSelectedDrug({ ...drug, ...details });
    } catch (err) {
      console.warn('Failed to load drug details:', err);
      // Keep the basic drug info from search results
    } finally {
      setLoading(false);
    }
  };

  const handleBackToResults = () => {
    setSelectedDrug(null);
  };

  // Keyboard shortcuts: "/" to focus input, Esc clears view
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const el = document.getElementById('drug-search-input') as HTMLInputElement | null;
        if (el) { e.preventDefault(); el.focus(); }
      } else if (e.key === 'Escape') {
        setSelectedDrug(null);
        setSearchResults(null);
      } else if (e.key.toLowerCase() === 'r' && !e.metaKey && !e.ctrlKey) {
        // Reset filters
        updateFilters({ BN: false, SCD: false, SBD: false, IN: false, MIN: false, onlyOncology: false });
      } else if (e.key.toLowerCase() === 'o' && !e.metaKey && !e.ctrlKey) {
        // Toggle oncology filter
        updateFilters({ onlyOncology: !filters.onlyOncology });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Fetch suggestions for basic mode panel
  useEffect(() => {
    let abort = false;
    if (searchMode !== 'basic' || !searchQuery || String(searchQuery).trim().length < 2) {
      setBasicSuggestions([]);
      setBasicSuggestionsOffline(false);
      return;
    }
    setBasicSuggestionsLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/drugs/search?q=${encodeURIComponent(searchQuery)}`);
        if (!resp.ok) throw new Error('suggestions failed');
        const data = await resp.json();
        if (abort) return;
        setBasicSuggestions((data.results || []).slice(0, 8).map((s: any) => ({ name: s.name, rxcui: s.rxcui })));
        setBasicSuggestionsOffline(!data.sources?.rxnorm || data.sources.rxnorm === 0);
      } catch {
        if (!abort) { setBasicSuggestions([]); setBasicSuggestionsOffline(false); }
      } finally {
        if (!abort) setBasicSuggestionsLoading(false);
      }
    }, 300);
    return () => { abort = true; clearTimeout(t); };
  }, [searchMode, searchQuery]);

  const handleQuickSearch = (query: string) => {
    handleSearch(query);
  };

  if (selectedDrug) {
    return (
      <div className="space-y-6">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">Drug Selected Successfully!</h3>
              <p className="text-sm text-green-700">
                You've selected <strong>{selectedDrug.name}</strong>. Explore the options below to analyze interactions, genomics, or clinical protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToResults}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>←</span>
          <span>Back to Search Results</span>
        </button>

        {/* Drug Details */}
        {loading ? (
          <Card>
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading drug details...</p>
              </div>
            </div>
          </Card>
        ) : (
          <DrugCard drug={selectedDrug} showDetails={true} />
        )}

        {/* Additional Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card padding="sm" className="text-center">
            <div className="text-primary-600 mb-2">
              <Search className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">View Interactions</h3>
            <p className="text-sm text-gray-600 mb-3">Check drug-drug interactions</p>
            <button 
              onClick={() => window.open(`/interactions?drug=${selectedDrug.rxcui}`, '_blank')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Check Interactions →
            </button>
          </Card>

          <Card padding="sm" className="text-center">
            <div className="text-purple-600 mb-2">
              <Star className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Genomic Analysis</h3>
            <p className="text-sm text-gray-600 mb-3">View pharmacogenomic factors</p>
            <button 
              onClick={() => window.open(`/genomics?drug=${selectedDrug.rxcui}`, '_blank')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Analyze Genomics →
            </button>
          </Card>

          <Card padding="sm" className="text-center">
            <div className="text-green-600 mb-2">
              <History className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Clinical Trials</h3>
            <p className="text-sm text-gray-600 mb-3">Find relevant studies</p>
            <button 
              onClick={() => window.open(`/protocols?drug=${selectedDrug.name}`, '_blank')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View Trials →
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* RxNorm Offline Toast (one-time) */}
      {rxnormOfflineToast && !rxnormToastDismissed && (() => { showToast('warning', 'RxNorm offline: using limited suggestions'); setRxnormOfflineToast(false); return null; })()}
      {/* Enhanced Header with AI Insights */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-indigo-600/10 rounded-2xl" />
        <div className="relative p-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent Drug Discovery
            </h1>
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-violet-600" />
              <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                AI-Powered
              </span>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
            Advanced drug search with AI-powered insights, molecular analysis, and personalized recommendations
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-violet-200">
              <div className="flex items-center space-x-2 text-violet-600 mb-2">
                <Pill className="w-5 h-5" />
                <span className="font-medium">Drug Database</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">50,000+</div>
              <div className="text-sm text-gray-600">Medications</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-600 mb-2">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Interactions</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">2.5M+</div>
              <div className="text-sm text-gray-600">Drug Pairs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200">
              <div className="flex items-center space-x-2 text-green-600 mb-2">
                <Microscope className="w-5 h-5" />
                <span className="font-medium">Clinical Trials</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">25,000+</div>
              <div className="text-sm text-gray-600">Active Studies</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
              <div className="flex items-center space-x-2 text-purple-600 mb-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Oncology Focus</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">5,000+</div>
              <div className="text-sm text-gray-600">Cancer Drugs</div>
            </div>
          </div>
          
          {pinnedList.length > 0 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-medium text-gray-700">
                {pinnedList.length} Pinned Medication{pinnedList.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Connectivity status + test */}
      <div className="flex items-center justify-center mt-2">
        <div className="inline-flex items-center gap-3 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2">
          <div className="inline-flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              connStatus === 'online' ? 'bg-green-500' : connStatus === 'offline' ? 'bg-amber-500' : connStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span>
              {connStatus === 'online' && 'RxNorm connectivity: Online'}
              {connStatus === 'offline' && 'RxNorm connectivity: Offline (fallback)'}
              {connStatus === 'error' && 'RxNorm connectivity: Error'}
              {connStatus === 'unknown' && 'RxNorm connectivity: Unknown'}
              {connCheckedAt ? ` • Checked ${connCheckedAt}` : ''}
            </span>
          </div>
          <button
            onClick={testConnectivity}
            disabled={connTesting}
            className="text-blue-700 hover:text-blue-800 underline disabled:opacity-60"
          >
            {connTesting ? 'Testing…' : 'Test connectivity'}
          </button>
        </div>
      </div>

      {/* Search Mode Selector */}
      <div className="flex items-center justify-center space-x-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { mode: 'basic', label: 'Basic Search', icon: Search },
            { mode: 'advanced', label: 'Advanced Filters', icon: Filter },
            { mode: 'ai', label: 'AI Assistant', icon: Brain }
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode as typeof searchMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                searchMode === mode
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Interface Based on Mode */}
      {searchMode === 'basic' && (
        <div className="max-w-4xl mx-auto">
          <AutocompleteSearch
            placeholder="Search drugs by name, indication, or mechanism..."
            onSelect={(option) => {
              setSearchQuery(option.value);
              // If this is a drug option, treat it as a direct drug selection
              if (option.type === 'drug') {
                // Create a drug object from the autocomplete option
                const drug: Drug = {
                  rxcui: option.id,
                  name: option.label,
                  synonym: option.value,
                  tty: 'SBD'
                };
                handleDrugSelect(drug);
              } else {
                // For non-drug options (indications, mechanisms), do a search
                handleSearch(option.value);
              }
            }}
            onInputChange={(value) => setSearchQuery(value)}
            value={searchQuery}
            loading={loading}
            maxResults={8}
            showCategories={true}
            className="w-full"
            onOfflineChange={(offline) => {
              if (offline) {
                if (!rxnormToastDismissed) setRxnormOfflineToast(true);
              } else {
                setRxnormOfflineToast(false);
              }
            }}
          />
          <div className="flex items-center justify-center mt-4">
            <button 
              onClick={() => handleSearch(searchQuery)}
              disabled={loading || !searchQuery || !String(searchQuery).trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-8 py-3 text-lg rounded-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search Drugs</span>
            </button>
          </div>
          {/* Top matches after analyzing */}
          {searchQuery && String(searchQuery).trim().length >= 2 && (
            <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">Top matches</div>
                {basicSuggestionsOffline && (
                  <div className="text-[11px] text-gray-500">Using offline suggestions</div>
                )}
              </div>
              <div className="p-3">
                {basicSuggestionsLoading ? (
                  <div className="text-xs text-gray-500">Analyzing…</div>
                ) : basicSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {basicSuggestions.map((s, i) => (
                      <button
                        key={`${s.rxcui || s.name}-${i}`}
                        onClick={() => setSearchQuery(s.name)}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                        title={s.rxcui ? `RXCUI ${s.rxcui}` : s.name}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">No matches</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {searchMode === 'advanced' && (
        <ImprovedDrugSearch onOfflineChange={(offline) => {
          if (offline) {
            if (!rxnormToastDismissed) setRxnormOfflineToast(true);
          } else {
            setRxnormOfflineToast(false);
          }
        }} />
      )}
      
      {searchMode === 'ai' && (
        <div className="space-y-6">
          <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="h-6 w-6 text-violet-600" />
                <h2 className="text-xl font-bold text-violet-800">AI Drug Discovery Assistant</h2>
                <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                  Beta
                </span>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Sparkles className="h-8 w-8 text-violet-600" />
                  <span className="text-2xl font-bold text-violet-800">Ask the AI</span>
                </div>
                <p className="text-gray-600 mb-6">
                  Describe your patient case, treatment goals, or ask questions about drug therapy
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 cursor-pointer hover:bg-blue-50 border border-blue-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Find Similar Drugs</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Find drugs similar to pembrolizumab for lung cancer"
                  </p>
                </div>
                
                <div className="p-4 cursor-pointer hover:bg-green-50 border border-green-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-2 text-green-600 mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-medium">Biomarker Matching</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "What drugs target HER2-positive breast cancer?"
                  </p>
                </div>
                
                <div className="p-4 cursor-pointer hover:bg-purple-50 border border-purple-200 rounded-lg bg-white">
                  <div className="flex items-center space-x-2 text-purple-600 mb-2">
                    <Zap className="h-5 w-5" />
                    <span className="font-medium">Drug Interactions</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    "Check interactions between warfarin and chemotherapy"
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  id="ai-input"
                  placeholder="Describe your patient case or ask a question about drug therapy..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 h-32 resize-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Info className="h-4 w-4" />
                    <span>AI responses are for educational purposes only</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (searchQuery && String(searchQuery).trim()) {
                        setAiInsights({ 
                          query: searchQuery,
                          response: "AI assistant is currently in development. For now, please use the basic or advanced search modes to find specific drugs and their interactions.",
                          suggestions: [
                            "Try searching for specific drug names",
                            "Use the advanced filters to narrow your search",
                            "Check drug interactions in the interaction checker"
                          ]
                        });
                      }
                    }}
                    disabled={!searchQuery || !String(searchQuery).trim() || loading}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-indigo-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Brain className="h-4 w-4" />
                    <span>Ask AI Assistant</span>
                  </button>
                </div>
              </div>
              
              {/* AI Response */}
              {aiInsights && (
                <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-violet-600" />
                    <span className="font-medium text-violet-800">AI Response</span>
                  </div>
                  <p className="text-gray-700 mb-4">{aiInsights.response}</p>
                  {aiInsights.suggestions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {aiInsights.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Access Pills and Filters - Only show for basic/advanced modes */}
      {(searchMode === 'basic' || searchMode === 'advanced') && (
        <div className="space-y-4">
        {/* Pinned quick access chips */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 mr-1">Pinned:</span>
            {pinnedList.length === 0 ? (
              <span className="text-xs text-gray-400">No pinned drugs yet</span>
            ) : (
              pinnedList.slice(0, 10).map((p, idx) => (
                <div
                  key={p.rxcui}
                  className="inline-flex items-center pl-2 pr-1 py-1 rounded-full text-xs bg-yellow-50 text-yellow-800 border border-yellow-200"
                  title={`Pinned: ${p.name}`}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.setData('text/plain', p.rxcui); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const dragged = e.dataTransfer.getData('text/plain');
                    if (!dragged || dragged === p.rxcui) return;
                    const list = pinnedList.slice(0, 10).map(x => x.rxcui);
                    const from = list.indexOf(dragged);
                    const to = idx;
                    if (from === -1 || to === -1) return;
                    list.splice(to, 0, list.splice(from, 1)[0]);
                    reorderPins(list);
                    setPinsTick(x => x + 1);
                  }}
                >
                  <button
                    onClick={() => handleSearch(p.name)}
                    className="px-0.5 mr-1 hover:underline"
                    aria-label={`Search for ${p.name}`}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(p.rxcui, p.name); setPinsTick((x) => x + 1); }}
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-yellow-100"
                    aria-label={`Unpin ${p.name}`}
                    title="Unpin"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded-full border ${filters.onlyPinned ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'text-gray-600 bg-gray-50 border-gray-200 hover:text-gray-800'}`}
              onClick={() => updateFilters({ onlyPinned: !filters.onlyPinned })}
              aria-pressed={filters.onlyPinned}
              aria-label={`Show only pinned ${filters.onlyPinned ? 'on' : 'off'}`}
              title="Show only pinned in results"
            >
              Show only pinned
            </button>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => {
                if (!searchResults || !Array.isArray(searchResults.results)) return;
                const pins = getPins();
                const oncoNames = ['pembrolizumab','nivolumab','fluorouracil','cisplatin','doxorubicin','paclitaxel','tamoxifen','imatinib'];
                const visible = searchResults.results.filter((drug) => {
                  const ttyOk = activeTtySet.size === 0 || (drug.tty ? activeTtySet.has(drug.tty) : false);
                  const isOnco = oncoNames.some(n => (drug.name || '').toLowerCase().includes(n));
                  const oncoOk = !filters.onlyOncology || isOnco;
                  return ttyOk && oncoOk && pins[drug.rxcui];
                });
                visible.forEach(d => { if (pins[d.rxcui]) togglePin(d.rxcui, d.name); });
                setPinsTick(x => x + 1);
              }}
              aria-label="Unpin all shown results"
              title="Unpin all shown in results"
            >
              Unpin Shown
            </button>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => { clearPins(); setPinsTick((x) => x + 1); }}
              aria-label="Clear pinned drugs"
            >
              Clear Pins
            </button>
          </div>
        </div>
        
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 mr-1">Filters:</span>
        {['BN','SCD','SBD','IN','MIN'].map((tty) => (
          <button
            key={tty}
            type="button"
            onClick={() => updateFilters({ [tty]: !filters[tty as keyof typeof filters] })}
            className={`px-2 py-1 rounded-full text-xs border ${filters[tty as keyof typeof filters] ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
            aria-pressed={filters[tty as keyof typeof filters]}
            aria-label={`Filter ${tty} ${filters[tty as keyof typeof filters] ? 'on' : 'off'}`}
          >
            {tty}
          </button>
        ))}
        <button
          type="button"
          onClick={() => updateFilters({ onlyOncology: !filters.onlyOncology })}
          className={`px-2 py-1 rounded-full text-xs border ${filters.onlyOncology ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
          aria-pressed={filters.onlyOncology}
          aria-label={`Oncology filter ${filters.onlyOncology ? 'on' : 'off'}`}
        >
          Oncology
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ onlyPinned: !filters.onlyPinned })}
          className={`px-2 py-1 rounded-full text-xs border ${filters.onlyPinned ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
          aria-pressed={filters.onlyPinned}
          aria-label={`Pinned filter ${filters.onlyPinned ? 'on' : 'off'}`}
        >
          Pinned only
        </button>
        <button
          type="button"
          onClick={() => updateFilters({ BN: false, SCD: false, SBD: false, IN: false, MIN: false, onlyOncology: false })}
          className="px-2 py-1 rounded-full text-xs border bg-gray-50 text-gray-600 border-gray-200"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => {
            if (!searchResults || !Array.isArray(searchResults.results)) return;
            const pins = getPins();
            const oncoNames = ['pembrolizumab','nivolumab','fluorouracil','cisplatin','doxorubicin','paclitaxel','tamoxifen','imatinib'];
            const visible = searchResults.results.filter((drug) => {
              const ttyOk = activeTtySet.size === 0 || (drug.tty ? activeTtySet.has(drug.tty) : false);
              const isOnco = oncoNames.some(n => (drug.name || '').toLowerCase().includes(n));
              const oncoOk = !filters.onlyOncology || isOnco;
              return ttyOk && oncoOk;
            });
            visible.forEach(d => { if (!pins[d.rxcui]) togglePin(d.rxcui, d.name); });
            setPinsTick((x) => x + 1);
          }}
          className="px-2 py-1 rounded-full text-xs border bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
          aria-label="Pin all shown results"
        >
          Pin All Shown
        </button>
      </div>

      {/* Search Results - Only show if we have results */}
      {searchResults && (
        <div className={`grid ${selectedDrug ? 'md:grid-cols-2 gap-6' : ''}`}>
          <div>
            <DrugSearchResults
              results={searchResults}
              loading={loading}
              error={error}
              onDrugSelect={handleDrugSelect}
              filters={{ onlyOncology: filters.onlyOncology, onlyPinned: filters.onlyPinned, tty: activeTtySet }}
              pinVersion={pinsTick}
            />
          </div>
          {selectedDrug && (
            <div>
              <DrugCard drug={selectedDrug} showDetails={true} />
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!searchResults && !loading && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Search Features</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-1">
                  <Search className="w-4 h-4" />
                  <span>Search Capabilities</span>
                </h4>
                <ul className="space-y-1">
                  <li>• Search by generic or brand name</li>
                  <li>• Partial name matching supported</li>
                  <li>• Case-insensitive search</li>
                  <li>• Search by drug categories</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2 flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Quick Access</span>
                </h4>
                <ul className="space-y-1">
                  <li>• Organized drug shortcuts by category</li>
                  <li>• Common medications readily available</li>
                  <li>• Oncology drugs for cancer care</li>
                  <li>• Cardiovascular medications</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Tip:</strong> Use the quick access buttons above for common medications, or search directly by typing the drug name.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Data Sources */}
      <Alert type="info" title="Data Sources">
        Drug information is sourced from RxNorm (National Library of Medicine), FDA's DailyMed database, 
        and our curated database of oncology medications. Data is regularly updated to ensure accuracy.
      </Alert>
    </div>
  );
};

const DrugSearch: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Drug Search"
      fallbackMessage="The drug search feature is temporarily unavailable. This may be due to database connectivity or processing issues."
    >
      <DrugSearchInner />
    </FeatureErrorBoundary>
  );
};

export default DrugSearch;
