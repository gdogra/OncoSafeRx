import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, Filter, X, Zap, Clock, Star, AlertTriangle, Pill, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import AutoComplete, { AutoCompleteOption } from '../UI/AutoComplete';
import Card from '../UI/Card';
import { drugService } from '../../services/api';
import { Drug, DrugSearchResult } from '../../types';
import { useSelection } from '../../context/SelectionContext';

interface PowerfulDrugSearchProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  onDrugSelect: (drug: Drug) => void;
  loading?: boolean;
  className?: string;
}

interface SearchFilters {
  drugType?: string;
  category?: string;
  hasInteractions?: boolean;
  hasGenomics?: boolean;
  approvalStatus?: string;
  sortBy?: string;
}

interface SmartSuggestion {
  query: string;
  type: 'similar' | 'brand' | 'generic' | 'category' | 'interaction';
  description: string;
  icon: React.ReactNode;
}

const PowerfulDrugSearch: React.FC<PowerfulDrugSearchProps> = ({
  onSearch,
  onDrugSelect,
  loading = false,
  className = '',
}) => {
  const selection = useSelection();
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<AutoCompleteOption[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentDrugs, setRecentDrugs] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Enhanced search categories
  const drugCategories = [
    { value: '', label: 'All Categories' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'immunology', label: 'Immunology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'infectious-disease', label: 'Infectious Disease' },
    { value: 'pain-management', label: 'Pain Management' },
    { value: 'psychiatry', label: 'Psychiatry' },
  ];

  const drugTypes = [
    { value: '', label: 'All Types' },
    { value: 'BN', label: 'Brand Name' },
    { value: 'IN', label: 'Ingredient' },
    { value: 'MIN', label: 'Multiple Ingredients' },
    { value: 'PIN', label: 'Precise Ingredient' },
    { value: 'SCD', label: 'Semantic Clinical Drug' },
    { value: 'SBD', label: 'Semantic Branded Drug' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'recent', label: 'Recently Used' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'interactions', label: 'Known Interactions' },
  ];

  // Load search history and recent drugs
  useEffect(() => {
    try {
      const history = localStorage.getItem('oncosaferx_search_history');
      const recent = localStorage.getItem('oncosaferx_recent_drugs');
      
      if (history) {
        const parsedHistory = JSON.parse(history);
        // Ensure history contains only strings
        const validHistory = parsedHistory
          .filter((item: any) => typeof item === 'string')
          .slice(0, 10);
        setSearchHistory(validHistory);
      }
      if (recent) {
        const parsedRecent = JSON.parse(recent);
        // Ensure recent drugs are valid Drug objects
        const validRecent = parsedRecent
          .filter((item: any) => item && typeof item === 'object' && item.rxcui && item.name)
          .slice(0, 5);
        setRecentDrugs(validRecent);
      }
    } catch (err) {
      console.warn('Failed to load search data:', err);
      // Clear corrupted data
      localStorage.removeItem('oncosaferx_search_history');
      localStorage.removeItem('oncosaferx_recent_drugs');
    }
  }, []);

  // Generate smart suggestions based on query - memoized for stability
  const generateSmartSuggestions = useMemo(() => {
    return (searchQuery: string): SmartSuggestion[] => {
      if (!searchQuery || searchQuery.length < 3) return [];

      const suggestions: SmartSuggestion[] = [];
      const lowerQuery = searchQuery.toLowerCase();

      // Brand name suggestions
      if (lowerQuery.includes('tylenol')) {
        suggestions.push({
          query: 'acetaminophen',
          type: 'generic',
          description: 'Search for generic name',
          icon: <Pill className="w-4 h-4 text-blue-500" />
        });
      } else if (lowerQuery.includes('advil')) {
        suggestions.push({
          query: 'ibuprofen',
          type: 'generic',
          description: 'Search for generic name',
          icon: <Pill className="w-4 h-4 text-blue-500" />
        });
      }

      // Category suggestions
      if (lowerQuery.includes('cancer') || lowerQuery.includes('chemo')) {
        suggestions.push({
          query: 'oncology drugs',
          type: 'category',
          description: 'Browse oncology medications',
          icon: <Star className="w-4 h-4 text-purple-500" />
        });
      }

      // Interaction suggestions
      if (lowerQuery.includes('warfarin') || lowerQuery.includes('blood thinner')) {
        suggestions.push({
          query: 'anticoagulant interactions',
          type: 'interaction',
          description: 'Check anticoagulant interactions',
          icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
        });
      }

      // Similar drug suggestions
      const similarDrugs: Record<string, string[]> = {
        'aspirin': ['ibuprofen', 'naproxen', 'celecoxib'],
        'ibuprofen': ['aspirin', 'naproxen', 'diclofenac'],
        'warfarin': ['rivaroxaban', 'apixaban', 'dabigatran'],
        'metformin': ['glipizide', 'glyburide', 'insulin'],
      };

      Object.entries(similarDrugs).forEach(([drug, similar]) => {
        if (lowerQuery.includes(drug)) {
          similar.forEach(sim => {
            suggestions.push({
              query: sim,
              type: 'similar',
              description: `Similar to ${drug}`,
              icon: <Sparkles className="w-4 h-4 text-green-500" />
            });
          });
        }
      });

      return suggestions.slice(0, 6);
    };
  }, []);

  // Enhanced search with debouncing
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setSmartSuggestions([]);
      return;
    }

    setIsSearching(true);

    try {
      const results = await drugService.searchDrugs(searchQuery);
      
      // Create autocomplete options with enhanced descriptions
      const drugOptions: AutoCompleteOption[] = results.results.slice(0, 15).map((drug: Drug) => ({
        value: drug.rxcui,
        label: drug.name,
        description: `${drug.tty ? `${drug.tty} • ` : ''}RXCUI: ${drug.rxcui}${drug.generic_name && drug.generic_name !== drug.name ? ` • Generic: ${drug.generic_name}` : ''}`,
        category: drug.tty || 'Medications',
        metadata: drug,
      }));

      // Add search history matches
      const historyOptions: AutoCompleteOption[] = searchHistory
        .filter(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(term => ({
          value: term,
          label: term,
          description: 'From search history',
          category: 'Recent Searches',
          metadata: { isHistory: true },
        }));

      // Add recent drugs matches
      const recentOptions: AutoCompleteOption[] = recentDrugs
        .filter(drug => drug.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 3)
        .map(drug => ({
          value: drug.rxcui,
          label: drug.name,
          description: `Recently used • ${drug.tty || 'Medication'}`,
          category: 'Recently Used',
          metadata: drug,
        }));

      // Use functional state updates to avoid stale closures
      setSuggestions([...historyOptions, ...recentOptions, ...drugOptions]);
      setSmartSuggestions(generateSmartSuggestions(searchQuery));
      
    } catch (err) {
      console.warn('Search failed:', err);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchHistory, recentDrugs, generateSmartSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = (option: AutoCompleteOption) => {
    if (option.metadata?.isHistory) {
      setQuery(option.label);
      onSearch(option.label, filters);
    } else if (option.metadata) {
      const drug = option.metadata as Drug;
      onDrugSelect(drug);
      
      // Save to recent drugs
      const newRecent = [drug, ...recentDrugs.filter(d => d.rxcui !== drug.rxcui)]
        .filter(item => item && typeof item === 'object' && item.rxcui && item.name)
        .slice(0, 5);
      setRecentDrugs(newRecent);
      localStorage.setItem('oncosaferx_recent_drugs', JSON.stringify(newRecent));
    }
  };

  // Handle smart suggestion click
  const handleSmartSuggestionClick = (suggestion: SmartSuggestion) => {
    setQuery(suggestion.query);
    if (suggestion.type === 'category') {
      setFilters(prev => ({ ...prev, category: suggestion.query.split(' ')[0] }));
    }
    onSearch(suggestion.query, filters);
    
    // Save to search history
    const newHistory = [suggestion.query, ...searchHistory.filter(h => h !== suggestion.query)]
      .filter(item => typeof item === 'string')
      .slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('oncosaferx_search_history', JSON.stringify(newHistory));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
      
      // Save to search history
      const newHistory = [query.trim(), ...searchHistory.filter(h => h !== query.trim())]
        .filter(item => typeof item === 'string')
        .slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('oncosaferx_search_history', JSON.stringify(newHistory));
    }
  };

  // Filter change handler
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (query.trim()) {
      onSearch(query.trim(), newFilters);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Search Input */}
          <div className="relative">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Powerful Drug Search</h2>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
            
            <AutoComplete
              options={suggestions}
              value={query}
              placeholder="Search by drug name, RXCUI, indication, or brand name..."
              onSelect={handleSuggestionSelect}
              onChange={setQuery}
              onSearch={handleSearch}
              loading={isSearching}
              caseSensitive={false}
              highlightMatches={true}
              groupByCategory={true}
              maxResults={20}
              minChars={2}
              debounceMs={300}
              allowCustom={true}
              noResultsText="No drugs found. Try different keywords or check spelling."
              searchKeys={['label', 'description']}
              className="w-full"
              dropdownClassName="border-2 border-blue-200 shadow-lg"
              disableFiltering={true}
            />
          </div>

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Smart Suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {smartSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSmartSuggestionClick(suggestion)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-colors text-sm"
                  >
                    {suggestion.icon}
                    <span className="font-medium">{suggestion.query}</span>
                    <span className="text-gray-500">• {suggestion.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
              
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                    setSmartSuggestions([]);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drug Type</label>
                <select
                  value={filters.drugType || ''}
                  onChange={(e) => handleFilterChange('drugType', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {drugTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {drugCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Filters</label>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasInteractions || false}
                      onChange={(e) => handleFilterChange('hasInteractions', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has known interactions</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasGenomics || false}
                      onChange={(e) => handleFilterChange('hasGenomics', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Has genomic data</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Quick Access & Recent Items */}
      {!query && (searchHistory.length > 0 || recentDrugs.length > 0) && (
        <Card className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Searches */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">Recent Searches</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.slice(0, 6).map((term, index) => {
                    // Safety check to ensure term is a string
                    if (typeof term !== 'string') {
                      console.warn('Invalid search history item:', term);
                      return null;
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(term);
                          onSearch(term, filters);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Drugs */}
            {recentDrugs.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h3 className="font-medium text-gray-900">Recently Used</h3>
                </div>
                <div className="space-y-2">
                  {recentDrugs.map((drug, index) => {
                    // Safety check to ensure drug is a valid object
                    if (!drug || typeof drug !== 'object' || !drug.rxcui || !drug.name) {
                      console.warn('Invalid recent drug item:', drug);
                      return null;
                    }
                    return (
                      <button
                        key={index}
                        onClick={() => onDrugSelect(drug)}
                        className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Pill className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate">{drug.name}</div>
                          <div className="text-sm text-gray-500">RXCUI: {drug.rxcui}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 text-center">
        <span>💡 Pro tips: Use fuzzy search (e.g., "asprin" finds "aspirin"), search by RXCUI, or try partial matches</span>
      </div>
    </div>
  );
};

export default PowerfulDrugSearch;