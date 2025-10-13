import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

interface DrugSearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  inputId?: string;
  className?: string;
}

const DrugSearchBar: React.FC<DrugSearchBarProps> = ({
  onSearch,
  loading = false,
  placeholder = "Search drugs by name (e.g., aspirin, ibuprofen)...",
  value,
  onChange,
  inputId,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue.trim()) {
      onSearch(localValue.trim());
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange?.('');
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={inputId}
          type="text"
          value={value !== undefined ? value : localValue}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleClear();
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          disabled={loading}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {(value || localValue) && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading ? (
            <div className="pr-3">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <button
              type="submit"
              disabled={!localValue.trim()}
              className="mr-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default DrugSearchBar;
