import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Star, History, X, Bookmark, Tag, Clock } from 'lucide-react';
import { useAdvancedSearch, SearchFilter } from '../../hooks/useAdvancedSearch';
import AdvancedSearchDialog from './AdvancedSearchDialog';

interface SearchWithFavoritesProps {
  onSearch: (query: string, filters?: SearchFilter) => void;
  placeholder?: string;
  showFilters?: boolean;
  className?: string;
}

const SearchWithFavorites: React.FC<SearchWithFavoritesProps> = ({
  onSearch,
  placeholder = "Search drugs, interactions, protocols...",
  showFilters = true,
  className = ""
}) => {
  const {
    query,
    suggestions,
    recentSearches,
    favorites,
    favoritesByType,
    activeFiltersCount,
    setQuery,
    performSearch,
    addToFavorites,
    isFavorite
  } = useAdvancedSearch();

  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowQuickAccess(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setShowQuickAccess(false);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch(finalQuery);
      performSearch();
      setShowSuggestions(false);
      setShowQuickAccess(false);
      inputRef.current?.blur();
    }
  };

  const handleAdvancedSearch = (searchQuery: string, filters: SearchFilter) => {
    onSearch(searchQuery, filters);
    setShowSuggestions(false);
    setShowQuickAccess(false);
  };

  const handleInputFocus = () => {
    if (query.length === 0) {
      setShowQuickAccess(true);
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
      setShowQuickAccess(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowQuickAccess(false);
      inputRef.current?.blur();
    }
  };

  const addToFavoritesFromSearch = (item: string, type: 'drug' | 'interaction' | 'protocol') => {
    addToFavorites({
      type,
      itemId: `search_${Date.now()}`,
      name: item,
      notes: `Added from search: "${query}"`,
      tags: ['search']
    });
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setShowSuggestions(false);
                setShowQuickAccess(true);
                inputRef.current?.focus();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
          
          {showFilters && (
            <button
              onClick={() => setIsAdvancedSearchOpen(true)}
              className={`p-2 rounded-lg transition-colors ${
                activeFiltersCount > 0
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              title="Advanced Search & Filters"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {(showSuggestions || showQuickAccess) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Quick Access (when input is empty) */}
          {showQuickAccess && (
            <div className="p-4">
              <div className="space-y-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                        >
                          <span>{search}</span>
                          <History className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Favorite Drugs */}
                {favoritesByType.drug && favoritesByType.drug.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">Favorite Drugs</span>
                    </div>
                    <div className="space-y-1">
                      {favoritesByType.drug.slice(0, 3).map((fav) => (
                        <button
                          key={fav.id}
                          onClick={() => handleSearch(fav.name)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                        >
                          <span>{fav.name}</span>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Bookmark className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Quick Actions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSearch('oncology drugs')}
                      className="px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                    >
                      Oncology Drugs
                    </button>
                    <button
                      onClick={() => handleSearch('drug interactions')}
                      className="px-3 py-2 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded transition-colors"
                    >
                      Interactions
                    </button>
                    <button
                      onClick={() => handleSearch('clinical protocols')}
                      className="px-3 py-2 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                    >
                      Protocols
                    </button>
                    <button
                      onClick={() => setIsAdvancedSearchOpen(true)}
                      className="px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      Advanced Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center justify-between group"
                >
                  <span>{suggestion}</span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToFavoritesFromSearch(suggestion, 'drug');
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Add to favorites"
                    >
                      <Star className={`h-3 w-3 ${
                        isFavorite('drug', suggestion) ? 'text-yellow-500 fill-current' : 'text-gray-400'
                      }`} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No suggestions */}
          {showSuggestions && suggestions.length === 0 && query.length > 2 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No suggestions found</p>
              <button
                onClick={() => setIsAdvancedSearchOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Try advanced search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advanced Search Dialog */}
      <AdvancedSearchDialog
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
};

export default SearchWithFavorites;