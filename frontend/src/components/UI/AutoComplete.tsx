import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

export interface AutoCompleteOption {
  value: string;
  label: string;
  description?: string;
  category?: string;
  metadata?: any;
}

interface AutoCompleteProps {
  options: AutoCompleteOption[];
  value?: string;
  placeholder?: string;
  onSelect: (option: AutoCompleteOption) => void;
  onChange?: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  allowCustom?: boolean;
  maxResults?: number;
  minChars?: number;
  caseSensitive?: boolean;
  highlightMatches?: boolean;
  groupByCategory?: boolean;
  className?: string;
  dropdownClassName?: string;
  noResultsText?: string;
  searchKeys?: (keyof AutoCompleteOption)[];
  onSearch?: (query: string) => void;
  debounceMs?: number;
  disableFiltering?: boolean;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  options,
  value = '',
  placeholder = 'Start typing to search...',
  onSelect,
  onChange,
  loading = false,
  disabled = false,
  allowCustom = false,
  maxResults = 10,
  minChars = 1,
  caseSensitive = false,
  highlightMatches = true,
  groupByCategory = false,
  className = '',
  dropdownClassName = '',
  noResultsText = 'No results found',
  searchKeys = ['label', 'value', 'description'],
  onSearch,
  debounceMs = 300,
  disableFiltering = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Stable reference for searchKeys to prevent useEffect dependencies from changing
  const stableSearchKeys = useMemo(() => searchKeys, [searchKeys?.join(',')]);

  // Filter options based on search term (case-independent)
  const filteredOptions = useMemo(() => {
    // If filtering is disabled, return all options (server-side filtering)
    if (disableFiltering) {
      return options.slice(0, maxResults);
    }

    if (!searchTerm || searchTerm.length < minChars) return [];

    const normalizedSearchTerm = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    const filtered = options.filter(option => {
      return stableSearchKeys.some(key => {
        const fieldValue = option[key];
        if (typeof fieldValue !== 'string') return false;
        
        const normalizedFieldValue = caseSensitive ? fieldValue : fieldValue.toLowerCase();
        return normalizedFieldValue.includes(normalizedSearchTerm);
      });
    });

    // Sort by relevance (exact match first, then starts with, then contains)
    const sorted = filtered.sort((a, b) => {
      const aLabel = caseSensitive ? a.label : a.label.toLowerCase();
      const bLabel = caseSensitive ? b.label : b.label.toLowerCase();
      
      // Exact match
      if (aLabel === normalizedSearchTerm) return -1;
      if (bLabel === normalizedSearchTerm) return 1;
      
      // Starts with
      if (aLabel.startsWith(normalizedSearchTerm) && !bLabel.startsWith(normalizedSearchTerm)) return -1;
      if (bLabel.startsWith(normalizedSearchTerm) && !aLabel.startsWith(normalizedSearchTerm)) return 1;
      
      // Alphabetical
      return aLabel.localeCompare(bLabel);
    });

    return sorted.slice(0, maxResults);
  }, [searchTerm, options, minChars, maxResults, caseSensitive, disableFiltering, stableSearchKeys]);

  // Group options by category
  const groupedOptions = useMemo(() => {
    if (!groupByCategory) return { '': filteredOptions };
    
    return filteredOptions.reduce((groups, option) => {
      const category = option.category || 'Other';
      if (!groups[category]) groups[category] = [];
      groups[category].push(option);
      return groups;
    }, {} as Record<string, AutoCompleteOption[]>);
  }, [filteredOptions, groupByCategory]);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set up new debounce
    debounceRef.current = setTimeout(() => {
      setSearchTerm(newValue);
      onSearch?.(newValue);
    }, debounceMs);
    
    if (newValue.length > 0) {
      setIsOpen(true);
    }
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleSelect = (option: AutoCompleteOption) => {
    setInputValue(option.label);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(option);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    if (!isOpen) {
      if (key === 'Enter' || key === 'ArrowDown' || key.toLowerCase() === 'j') {
        setIsOpen(true);
        return;
      }
      return;
    }

    switch (key) {
      case 'ArrowDown':
      case 'j':
      case 'J':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
      case 'k':
      case 'K':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (allowCustom && inputValue) {
          onSelect({ value: inputValue, label: inputValue });
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    setSearchTerm('');
    setIsOpen(false);
    onChange?.('');
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight || !highlightMatches) return text;
    
    const normalizedText = caseSensitive ? text : text.toLowerCase();
    const normalizedHighlight = caseSensitive ? highlight : highlight.toLowerCase();
    
    const index = normalizedText.indexOf(normalizedHighlight);
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-yellow-200 font-medium">
          {text.substring(index, index + highlight.length)}
        </mark>
        {text.substring(index + highlight.length)}
      </>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled || loading}
          className="block w-full pl-9 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-500"
          autoComplete="off"
          spellCheck="false"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {loading && (
            <LoadingSpinner size="sm" />
          )}
          
          {inputValue && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
        >
          {loading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" />
              <p className="mt-2 text-sm text-gray-500">Searching...</p>
            </div>
          )}
          
          {!loading && filteredOptions.length === 0 && searchTerm.length >= minChars && (
            <div className="p-4 text-center text-sm text-gray-500">
              {noResultsText}
              {allowCustom && (
                <div className="mt-2">
                  <button
                    onClick={() => handleSelect({ value: inputValue, label: inputValue })}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Use "{inputValue}"
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!loading && filteredOptions.length > 0 && (
            <div className="py-1">
              {Object.entries(groupedOptions).map(([category, categoryOptions]) => (
                <div key={category}>
                  {groupByCategory && category && (
                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                      {category}
                    </div>
                  )}
                  
                  {categoryOptions.map((option, index) => {
                    const globalIndex = filteredOptions.indexOf(option);
                    const isHighlighted = highlightedIndex === globalIndex;
                    
                    return (
                      <button
                        key={`${option.value}-${index}`}
                        onClick={() => handleSelect(option)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                          isHighlighted ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {highlightText(option.label, searchTerm)}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-500 truncate">
                                {highlightText(option.description, searchTerm)}
                              </div>
                            )}
                          </div>
                          {isHighlighted && (
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
