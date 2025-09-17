import React, { useState, useCallback } from 'react';
import { Drug, DrugSearchResult } from '../../types';
import { drugService } from '../../services/api';
import DrugSearchBar from '../DrugSearch/DrugSearchBar';
import Alert from '../UI/Alert';
import { Pill, Plus } from 'lucide-react';

interface DrugSelectorProps {
  onDrugSelect: (drug: Drug) => void;
}

const DrugSelector: React.FC<DrugSelectorProps> = ({ onDrugSelect }) => {
  const [searchResults, setSearchResults] = useState<DrugSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await drugService.searchDrugs(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search drugs');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrugSelect = (drug: Drug) => {
    onDrugSelect(drug);
    setSearchResults(null);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      <DrugSearchBar
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search for a medication to add..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {searchResults && searchResults.count > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Found {searchResults.count} results for "{searchResults.query}"
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.results.slice(0, 10).map((drug) => (
              <div
                key={`${drug.rxcui}-${drug.tty}`}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleDrugSelect(drug)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {drug.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">RXCUI: {drug.rxcui}</p>
                        {drug.tty && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {drug.tty}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          {searchResults.count > 10 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Showing first 10 results. Refine your search for more specific results.
              </p>
            </div>
          )}
        </div>
      )}

      {searchResults && searchResults.count === 0 && (
        <Alert type="info">
          No drugs found matching "{searchResults.query}". Try a different search term.
        </Alert>
      )}
    </div>
  );
};

export default DrugSelector;