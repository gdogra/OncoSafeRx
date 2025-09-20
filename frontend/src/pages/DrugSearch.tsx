import React, { useEffect, useMemo, useState } from 'react';
import { Drug, DrugSearchResult } from '../types';
import { drugService } from '../services/api';
import SimpleDrugSearch from '../components/DrugSearch/SimpleDrugSearch';
import PredictiveSearchBar from '../components/DrugSearch/PredictiveSearchBar';
import DrugSearchResults from '../components/DrugSearch/DrugSearchResults';
import DrugCard from '../components/DrugSearch/DrugCard';
import SearchWithFavorites from '../components/Search/SearchWithFavorites';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { Search, History, Star, Database, Filter, X } from 'lucide-react';
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

const DrugSearch: React.FC = () => {
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
    if (query.trim()) {
      addSearch(query.trim());
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
    
    // Try to get detailed information
    try {
      const details = await drugService.getDrugDetails(drug.rxcui);
      setSelectedDrug({ ...drug, ...details });
    } catch (err) {
      console.warn('Failed to load drug details:', err);
      // Keep the basic drug info from search results
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
        setTtyFilters({ BN:false,SCD:false,SBD:false,IN:false,MIN:false });
        setOnlyOncology(false);
      } else if (e.key.toLowerCase() === 'o' && !e.metaKey && !e.ctrlKey) {
        // Toggle oncology filter
        setOnlyOncology((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleQuickSearch = (query: string) => {
    handleSearch(query);
  };

  if (selectedDrug) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBackToResults}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>←</span>
          <span>Back to Search Results</span>
        </button>

        {/* Drug Details */}
        <DrugCard drug={selectedDrug} showDetails={true} />

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Database className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            Drug Search
            {pinnedList.length > 0 && (
              <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200" title={`${pinnedList.length} pinned`}>
                <Star className="w-3 h-3 mr-1" /> {pinnedList.length}
              </span>
            )}
          </h1>
          <Search className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Search our comprehensive drug database with quick access shortcuts for common medications.
        </p>
      </div>

      {/* Enhanced Predictive Search Interface */}
      <div className="space-y-4">
        <div className="max-w-4xl mx-auto">
          <div id="search" role="search" aria-label="Drug search">
            <PredictiveSearchBar
              onSearch={handleAdvancedSearch}
              placeholder="Search drugs by name, ingredient, or indication... (type to see suggestions)"
              showHistory={true}
              showSuggestions={true}
              maxSuggestions={6}
              loading={loading}
            onSuggestionSelect={(suggestion) => {
              analytics.track('drug_suggestion_selected', {
                suggestion: suggestion.name,
                category: suggestion.category,
                confidence: suggestion.confidence
              });
              handleAdvancedSearch(suggestion.name);
            }}
            />
          </div>
        </div>
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
              className={`text-xs px-2 py-1 rounded-full border ${onlyPinned ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'text-gray-600 bg-gray-50 border-gray-200 hover:text-gray-800'}`}
              onClick={() => setOnlyPinned(v => !v)}
              aria-pressed={onlyPinned}
              aria-label={`Show only pinned ${onlyPinned ? 'on' : 'off'}`}
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
                  const oncoOk = !onlyOncology || isOnco;
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
        
        {/* Legacy Simple Search (hidden by default, can be toggled) */}
        <details className="group">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Show traditional search interface</span>
          </summary>
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <SimpleDrugSearch
        onSearch={handleSearch}
        onDrugSelect={handleDrugSelectFromSearch}
        loading={loading}
        className="w-full"
      />

      {/* Insights: Most selected (local) */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Most Selected (last 30 days)</h3>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => { analytics.clearSelections(); setSearchResults(r => r); }}
              aria-label="Clear most selected history"
            >
              Clear
            </button>
            <span className="text-xs text-gray-400">Local device</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {analytics.getTopSelections(30, 6).length === 0 ? (
            <div className="text-xs text-gray-500">No selections yet. Selections you make will appear here.</div>
          ) : (
            analytics.getTopSelections(30, 6).map((d) => (
              <button
                key={d.rxcui}
                onClick={() => handleSearch(d.name)}
                className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                title={`${d.name} • ${d.count}x`}
              >
                {d.name}
              </button>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 underline"
              onClick={() => { analytics.clearSearches(); setSearchResults(r => r); }}
              aria-label="Clear recent searches"
            >
              Clear
            </button>
            <span className="text-xs text-gray-400">Local device</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {analytics.getRecentSearches(10).length === 0 ? (
            <div className="text-xs text-gray-500">No searches yet. Try typing a query.</div>
          ) : (
            analytics.getRecentSearches(10).map((q, i) => (
              <button
                key={`${q}-${i}`}
                onClick={() => handleSearch(q)}
                className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                title={`Search: ${q}`}
              >
                {q}
              </button>
            ))
          )}
        </div>
      </Card>
          </div>
        </details>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 mr-1">Filters:</span>
        {['BN','SCD','SBD','IN','MIN'].map((tty) => (
          <button
            key={tty}
            type="button"
            onClick={() => setTtyFilters((prev) => ({ ...prev, [tty]: !prev[tty] }))}
            className={`px-2 py-1 rounded-full text-xs border ${ttyFilters[tty] ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
            aria-pressed={ttyFilters[tty]}
            aria-label={`Filter ${tty} ${ttyFilters[tty] ? 'on' : 'off'}`}
          >
            {tty}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOnlyOncology((v) => !v)}
          className={`px-2 py-1 rounded-full text-xs border ${onlyOncology ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
          aria-pressed={onlyOncology}
          aria-label={`Oncology filter ${onlyOncology ? 'on' : 'off'}`}
        >
          Oncology
        </button>
        <button
          type="button"
          onClick={() => setOnlyPinned((v) => !v)}
          className={`px-2 py-1 rounded-full text-xs border ${onlyPinned ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
          aria-pressed={onlyPinned}
          aria-label={`Pinned filter ${onlyPinned ? 'on' : 'off'}`}
        >
          Pinned only
        </button>
        <button
          type="button"
          onClick={() => { setTtyFilters({ BN:false,SCD:false,SBD:false,IN:false,MIN:false }); setOnlyOncology(false); }}
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
              const oncoOk = !onlyOncology || isOnco;
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

      {/* Results with optional preview */}
      <div className={`grid ${selectedDrug ? 'md:grid-cols-2 gap-6' : ''}`}>
        <div>
          <DrugSearchResults
            results={searchResults}
            loading={loading}
            error={error}
            onDrugSelect={handleDrugSelect}
            filters={{ onlyOncology, onlyPinned, tty: activeTtySet }}
            pinVersion={pinsTick}
          />
        </div>
        {selectedDrug && (
          <div>
            <DrugCard drug={selectedDrug} showDetails={true} />
          </div>
        )}
      </div>

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

export default DrugSearch;
