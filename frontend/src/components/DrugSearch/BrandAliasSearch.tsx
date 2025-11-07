import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { debounce } from 'lodash';
import { drugService } from '../../services/api';

interface BrandAlias {
  brand: string;
  generic: string | null;
  relevance: 'high' | 'medium';
}

interface BrandAliasSearchProps {
  onAliasSelect?: (brand: string, generic: string | null) => void;
  placeholder?: string;
  className?: string;
  showTitle?: boolean;
}

const BrandAliasSearch: React.FC<BrandAliasSearchProps> = ({
  onAliasSelect,
  placeholder = "Search brand names (e.g., Arkamin, Tylenol, Lipitor)...",
  className = "",
  showTitle = true
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BrandAlias[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setShowResults(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await drugService.searchBrandAliases(searchQuery);
        setResults(data.results || []);
        setShowResults(true);
        
        if (data.message) {
          console.warn('Brand alias search warning:', data.message);
        }
      } catch (err) {
        console.error('Brand alias search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
        setShowResults(false);
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms delay
    []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      debouncedSearch(value.trim());
    } else {
      setResults([]);
      setShowResults(false);
      setLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = results[selectedIndex];
          handleAliasSelect(selected);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle alias selection
  const handleAliasSelect = (alias: BrandAlias) => {
    setQuery(`${alias.brand} → ${alias.generic || 'No generic mapping'}`);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onAliasSelect) {
      onAliasSelect(alias.brand, alias.generic);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setError(null);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Brand Name Lookup
          </h3>
          <p className="text-sm text-gray-600">
            Search for brand names to find their generic equivalents. Supports international brand names.
          </p>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {/* Search Results */}
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {results.length === 0 ? (
            <div className="p-3 text-sm text-gray-500 text-center">
              No brand aliases found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {results.map((alias, index) => (
                <button
                  key={`${alias.brand}-${index}`}
                  onClick={() => handleAliasSelect(alias)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">
                      {alias.brand}
                    </span>
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {alias.generic || <em className="text-gray-400">No generic mapping</em>}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alias.relevance === 'high' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Exact match
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500">
        Start typing a brand name to see instant suggestions. Use arrow keys to navigate, Enter to select.
      </div>
    </div>
  );
};

export default BrandAliasSearch;