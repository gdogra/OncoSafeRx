import React, { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle, Pill } from 'lucide-react';
import { Drug } from '../../types';
import { useSelection } from '../../context/SelectionContext';

interface DrugSearchResult {
  query: string;
  count: number;
  results: Drug[];
}

interface Props {
  onDrugSelect?: (drug: Drug) => void;
  placeholder?: string;
  maxResults?: number;
}

const SimpleDrugSearchNew: React.FC<Props> = ({ 
  onDrugSelect, 
  placeholder = "Search for drugs (e.g., aspirin, ibuprofen)...",
  maxResults = 10 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DrugSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selection = useSelection();

  const searchDrugs = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for:', searchQuery);
      const response = await fetch(
        `/api/drugs/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      
      console.log('📡 Response status:', response.status);
      
      if (response.status === 429) {
        // Rate limited - use fallback data
        console.log('⚠️ Rate limited, using fallback search');
        const fallbackResults = getFallbackSearchResults(searchQuery);
        setResults(fallbackResults);
        setError('API rate limited - using offline database');
        return;
      }
      
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        // Server issues - use fallback data
        console.log('⚠️ Server issues, using fallback search');
        const fallbackResults = getFallbackSearchResults(searchQuery);
        setResults(fallbackResults);
        setError('Server temporarily unavailable - using offline database');
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Search results:', data);
      
      setResults({
        query: searchQuery,
        count: data.count || 0,
        results: (data.results || []).slice(0, maxResults)
      });
    } catch (err) {
      console.error('❌ Search error:', err);
      
      // Try fallback search on any error
      console.log('🔄 Trying fallback search due to error');
      const fallbackResults = getFallbackSearchResults(searchQuery);
      if (fallbackResults.results.length > 0) {
        setResults(fallbackResults);
        setError('Using offline drug database (API temporarily unavailable)');
      } else {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback search with common drugs
  const getFallbackSearchResults = (query: string): DrugSearchResult => {
    const fallbackDrugs: Drug[] = [
      { rxcui: '161', name: 'Aspirin', tty: 'IN' },
      { rxcui: '5640', name: 'Ibuprofen', tty: 'IN' },
      { rxcui: '153165', name: 'Acetaminophen', tty: 'IN' },
      { rxcui: '11289', name: 'Warfarin', tty: 'IN' },
      { rxcui: '32968', name: 'Clopidogrel', tty: 'IN' },
      { rxcui: '1551099', name: 'Pembrolizumab', tty: 'IN' },
      { rxcui: '1367500', name: 'Nivolumab', tty: 'IN' },
      { rxcui: '5143', name: 'Fluorouracil', tty: 'IN' },
      { rxcui: '2670', name: 'Cisplatin', tty: 'IN' },
      { rxcui: '3639', name: 'Doxorubicin', tty: 'IN' },
      { rxcui: '42355', name: 'Paclitaxel', tty: 'IN' },
      { rxcui: '38218', name: 'Carboplatin', tty: 'IN' },
      { rxcui: '10324', name: 'Tamoxifen', tty: 'IN' },
      { rxcui: '282464', name: 'Imatinib', tty: 'IN' },
      { rxcui: '6809', name: 'Metformin', tty: 'IN' },
      { rxcui: '83367', name: 'Atorvastatin', tty: 'IN' },
      { rxcui: '17767', name: 'Amlodipine', tty: 'IN' },
      { rxcui: '7646', name: 'Omeprazole', tty: 'IN' },
      { rxcui: '5487', name: 'Hydrochlorothiazide', tty: 'IN' },
      { rxcui: '153008', name: 'Ibuprofen 200 MG Oral Tablet [Advil]', tty: 'SBD', generic_name: 'Ibuprofen' }
    ];

    const searchTerm = query.toLowerCase();
    const matches = fallbackDrugs.filter(drug => 
      drug.name.toLowerCase().includes(searchTerm)
    );

    return {
      query,
      count: matches.length,
      results: matches.slice(0, maxResults)
    };
  };

  // Debounced search with longer delay to prevent rate limiting
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDrugs(query);
    }, 1000); // Increased from 500ms to 1000ms

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleDrugClick = (drug: Drug) => {
    console.log('🎯 Drug selected:', drug);
    selection.addDrug(drug);
    if (onDrugSelect) {
      onDrugSelect(drug);
    }
  };

  const handleSearch = () => {
    searchDrugs(query);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-lg"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading || !query.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg font-medium"
      >
        <Search className="h-5 w-5" />
        <span>{loading ? 'Searching...' : 'Search Drugs'}</span>
      </button>

      {/* Error Display */}
      {error && (
        <div className={`border rounded-lg p-4 ${
          error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className={`h-5 w-5 ${
              error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
                ? 'text-amber-500'
                : 'text-red-500'
            }`} />
            <span className={`font-medium ${
              error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
                ? 'text-amber-700'
                : 'text-red-700'
            }`}>
              {error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
                ? 'Using Offline Database'
                : 'Search Error'
              }
            </span>
          </div>
          <p className={`mt-2 ${
            error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
              ? 'text-amber-600'
              : 'text-red-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => searchDrugs(query)}
            className={`mt-3 px-3 py-1 rounded text-sm ${
              error.includes('offline') || error.includes('unavailable') || error.includes('rate limited')
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            Retry Search
          </button>
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results for "{results.query}"
            </h3>
            <span className="text-sm text-gray-500">
              {results.count} total results, showing {results.results.length}
            </span>
          </div>

          {results.results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No drugs found matching "{results.query}"</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {results.results.map((drug) => (
                <div
                  key={`${drug.rxcui}-${drug.tty}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleDrugClick(drug)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium text-gray-900">{drug.name}</h4>
                        {drug.tty && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {drug.tty}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <span>RXCUI: {drug.rxcui}</span>
                        {drug.synonym && drug.synonym !== drug.name && (
                          <span className="ml-4">Also known as: {drug.synonym}</span>
                        )}
                      </div>
                      {drug.generic_name && drug.generic_name !== drug.name && (
                        <div className="mt-1 text-sm text-gray-600">
                          Generic: {drug.generic_name}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDrugClick(drug);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleDrugSearchNew;