import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, Zap } from 'lucide-react';
import { debounce } from 'lodash';
import LoadingSpinner from '../UI/LoadingSpinner';

interface SearchSuggestion {
  id: string;
  name: string;
  generic?: string;
  brand?: string;
  category: 'drug' | 'ingredient' | 'brand' | 'synonym';
  frequency?: number;
  confidence?: number;
  rxcui?: string;
}

interface SearchHistory {
  query: string;
  timestamp: number;
  resultCount: number;
}

interface PredictiveSearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  inputId?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

const PredictiveSearchBar: React.FC<PredictiveSearchBarProps> = ({
  onSearch,
  onSuggestionSelect,
  loading = false,
  placeholder = "Search drugs by name, ingredient, or indication...",
  value,
  onChange,
  inputId = 'predictive-search',
  showHistory = true,
  showSuggestions = true,
  maxSuggestions = 8,
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const [offlineSuggestions, setOfflineSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('oncosafe_search_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, 5)); // Keep last 5 searches
      } catch (e) {
        console.warn('Failed to parse search history');
      }
    }
  }, []);

  // Save search history to localStorage
  const saveToHistory = useCallback((query: string, resultCount: number = 0) => {
    const newHistory = [
      { query, timestamp: Date.now(), resultCount },
      ...history.filter(h => h.query !== query)
    ].slice(0, 5);
    
    setHistory(newHistory);
    localStorage.setItem('oncosafe_search_history', JSON.stringify(newHistory));
  }, [history]);

  // Fetch suggestions from API with debouncing
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      
      try {
        // Try Netlify proxy first
        let response = await fetch(`/api/drugs/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`);
        
        // If 502 Bad Gateway, try direct API
        if (response.status === 502) {
          console.warn(`502 Bad Gateway for suggestions: ${query}, trying direct API...`);
          response = await fetch(`https://oncosaferx-backend.onrender.com/api/drugs/suggestions?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`);
          if (response.ok) {
            console.log(`✅ Direct API success for suggestions: ${query}`);
          }
        }
        
        if (response.ok) {
          const data = await response.json();
          const newSuggestions = data.suggestions || [];
          setSuggestions(newSuggestions);
          setOfflineSuggestions(!!data.offline);
          
          // Announce to screen readers
          if (newSuggestions.length > 0) {
            setAnnounceText(`${newSuggestions.length} suggestions available`);
          } else {
            setAnnounceText('No suggestions found');
          }
          // Clear announcement after 1 second
          setTimeout(() => setAnnounceText(''), 1000);
        } else {
          // Fallback to basic search API (aligns to server format { results: [...] })
          let fallbackResponse = await fetch(`/api/drugs/search?q=${encodeURIComponent(query)}`);
          
          // If 502 Bad Gateway, try direct API
          if (fallbackResponse.status === 502) {
            console.warn(`502 Bad Gateway for search fallback: ${query}, trying direct API...`);
            fallbackResponse = await fetch(`https://oncosaferx-backend.onrender.com/api/drugs/search?q=${encodeURIComponent(query)}`);
            if (fallbackResponse.ok) {
              console.log(`✅ Direct API success for search fallback: ${query}`);
            }
          }
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const src = fallbackData.results || fallbackData.drugs || [];
            // Transform search results to suggestions format
            const fallbackSuggestions = src.slice(0, maxSuggestions).map((drug: any) => ({
              id: drug.rxcui || drug.name,
              name: drug.name || drug.synonym,
              generic: drug.generic || undefined,
              brand: (drug.brandNames && drug.brandNames[0]) || undefined,
              category: 'drug' as const,
              rxcui: drug.rxcui,
            })) || [];
            setSuggestions(fallbackSuggestions);
            setOfflineSuggestions(false);

            if (fallbackSuggestions.length > 0) {
              setAnnounceText(`${fallbackSuggestions.length} suggestions available`);
            } else {
              setAnnounceText('No suggestions found');
            }
            setTimeout(() => setAnnounceText(''), 1000);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    [maxSuggestions]
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
    setSelectedIndex(-1);
    
    if (showSuggestions) {
      fetchSuggestions(newValue);
    }
    
    setIsOpen(newValue.length > 0);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue.trim()) {
      performSearch(localValue.trim());
    }
  };

  // Perform search and save to history
  const performSearch = (query: string) => {
    onSearch(query);
    saveToHistory(query);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setLocalValue(suggestion.name);
    onChange?.(suggestion.name);
    onSuggestionSelect?.(suggestion);
    performSearch(suggestion.name);
  };

  // Handle history item selection
  const handleHistorySelect = (historyItem: SearchHistory) => {
    setLocalValue(historyItem.query);
    onChange?.(historyItem.query);
    performSearch(historyItem.query);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [
      ...(showHistory && localValue.length === 0 ? history : []),
      ...(showSuggestions ? suggestions : [])
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          const item = items[selectedIndex];
          if ('name' in item) {
            handleSuggestionSelect(item as SearchSuggestion);
          } else {
            handleHistorySelect(item as SearchHistory);
          }
        } else if (localValue.trim()) {
          performSearch(localValue.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (showSuggestions && localValue.length >= 2) {
      fetchSuggestions(localValue);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear input
  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Render suggestion item
  const renderSuggestion = (suggestion: SearchSuggestion, index: number) => {
    const isSelected = selectedIndex === index;
    const totalHistoryItems = showHistory && localValue.length === 0 ? history.length : 0;
    const optionIndex = totalHistoryItems + index;
    
    return (
      <div
        key={suggestion.id}
        id={`${inputId}-option-${optionIndex}`}
        className={`px-4 py-3 cursor-pointer transition-colors ${
          isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleSuggestionSelect(suggestion)}
        role="option"
        aria-selected={isSelected}
        aria-describedby={`${inputId}-option-${optionIndex}-description`}
        aria-label={`${suggestion.name}${suggestion.generic && suggestion.generic !== suggestion.name ? `, generic: ${suggestion.generic}` : ''}${suggestion.brand && suggestion.brand !== suggestion.name ? `, brand: ${suggestion.brand}` : ''}`}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            suggestion.category === 'drug' ? 'bg-blue-100 text-blue-600' :
            suggestion.category === 'brand' ? 'bg-purple-100 text-purple-600' :
            suggestion.category === 'ingredient' ? 'bg-green-100 text-green-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {suggestion.confidence && suggestion.confidence > 0.8 ? (
              <Zap className="w-4 h-4" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {suggestion.name}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {suggestion.generic && suggestion.generic !== suggestion.name && (
                <span>Generic: {suggestion.generic}</span>
              )}
              {suggestion.brand && suggestion.brand !== suggestion.name && (
                <span>Brand: {suggestion.brand}</span>
              )}
              {suggestion.category === 'synonym' && <span>Alternative name</span>}
            </div>
          </div>
          {suggestion.frequency && (
            <div className="flex items-center text-xs text-gray-400">
              <TrendingUp className="w-3 h-3 mr-1" />
              {suggestion.frequency}
            </div>
          )}
        </div>
        {/* Hidden description for screen readers */}
        <div id={`${inputId}-option-${optionIndex}-description`} className="sr-only">
          {suggestion.category === 'drug' ? 'Drug' : 
           suggestion.category === 'brand' ? 'Brand name drug' : 
           suggestion.category === 'ingredient' ? 'Active ingredient' : 
           'Alternative name'}
          {suggestion.confidence && suggestion.confidence > 0.8 && ', high confidence match'}
          {suggestion.frequency && `, searched ${suggestion.frequency} times`}
        </div>
      </div>
    );
  };

  // Render history item
  const renderHistoryItem = (historyItem: SearchHistory, index: number) => {
    const isSelected = selectedIndex === index;
    
    return (
      <div
        key={`history-${historyItem.query}-${historyItem.timestamp}`}
        id={`${inputId}-history-${index}`}
        className={`px-4 py-3 cursor-pointer transition-colors ${
          isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50'
        }`}
        onClick={() => handleHistorySelect(historyItem)}
        role="option"
        aria-selected={isSelected}
        aria-label={`Recent search: ${historyItem.query}${historyItem.resultCount > 0 ? `, found ${historyItem.resultCount} results` : ''}`}
        aria-describedby={`${inputId}-history-${index}-description`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {historyItem.query}
            </div>
            <div className="text-sm text-gray-500">
              {historyItem.resultCount > 0 && `${historyItem.resultCount} results • `}
              {new Date(historyItem.timestamp).toLocaleDateString()}
            </div>
          </div>
        </div>
        {/* Hidden description for screen readers */}
        <div id={`${inputId}-history-${index}-description`} className="sr-only">
          Recent search from {new Date(historyItem.timestamp).toLocaleDateString()}
          {historyItem.resultCount > 0 && `, previously found ${historyItem.resultCount} results`}
        </div>
      </div>
    );
  };

  const showDropdown = isOpen && (
    (showHistory && localValue.length === 0 && history.length > 0) ||
    (showSuggestions && suggestions.length > 0) ||
    isLoadingSuggestions
  );

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby={`${inputId}-description ${inputId}-instructions`}
            aria-owns={showDropdown ? `${inputId}-listbox` : undefined}
            aria-activedescendant={
              selectedIndex >= 0 
                ? `${inputId}-option-${selectedIndex}` 
                : undefined
            }
            role="combobox"
            aria-label="Drug search with suggestions"
          />
          {localValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-500"
              aria-label="Clear search"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id={`${inputId}-listbox`}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
          role="listbox"
          aria-label="Search suggestions and history"
        >
          {offlineSuggestions && (
            <div className="px-4 py-2 text-[11px] text-gray-600 bg-gray-50 border-b border-gray-100">
              Using offline suggestions (RxNorm unavailable)
            </div>
          )}
          {isLoadingSuggestions && (
            <div className="px-4 py-8 text-center" role="status" aria-live="polite">
              <LoadingSpinner size="sm" />
              <p className="text-sm text-gray-500 mt-2">Finding suggestions...</p>
            </div>
          )}

          {/* History section */}
          {showHistory && localValue.length === 0 && history.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Recent Searches
              </div>
              {history.map((item, index) => renderHistoryItem(item, index))}
            </div>
          )}

          {/* Suggestions section */}
          {showSuggestions && suggestions.length > 0 && (
            <div>
              {history.length > 0 && localValue.length === 0 && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Suggestions
                </div>
              )}
              {suggestions.map((suggestion, index) => 
                renderSuggestion(suggestion, (showHistory && localValue.length === 0 ? history.length : 0) + index)
              )}
            </div>
          )}

          {/* No results */}
          {!isLoadingSuggestions && localValue.length >= 2 && suggestions.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500" role="status" aria-live="polite">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" aria-hidden="true" />
              <p className="text-sm">No suggestions found for "{localValue}"</p>
              <p className="text-xs mt-1">Try a different spelling or search term</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden instructions for screen readers */}
      <div id={`${inputId}-description`} className="sr-only">
        Search for drugs by name, brand, or active ingredient. Type at least 2 characters to see suggestions.
      </div>
      <div id={`${inputId}-instructions`} className="sr-only">
        Use arrow keys to navigate suggestions, Enter to select, Escape to close. Recent searches appear when field is empty.
      </div>
      
      {/* Live region for dynamic announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announceText}
      </div>
    </div>
  );
};

export default PredictiveSearchBar;
