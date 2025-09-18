import React, { useState, useCallback } from 'react';
import { Drug, DrugSearchResult } from '../../types';
import { drugService } from '../../services/api';
import DrugSearchBar from '../DrugSearch/DrugSearchBar';
import Alert from '../UI/Alert';
import Tooltip from '../UI/Tooltip';
import { Pill, Plus, Info, Clock, Search, Tag } from 'lucide-react';

interface DrugSelectorProps {
  onDrugSelect: (drug: Drug) => void;
}

// Common drug shortcuts for quick access
const drugShortcuts = [
  { term: 'aspirin', label: 'Aspirin', category: 'Pain Relief' },
  { term: 'ibuprofen', label: 'Ibuprofen', category: 'Pain Relief' },
  { term: 'warfarin', label: 'Warfarin', category: 'Anticoagulant' },
  { term: 'metformin', label: 'Metformin', category: 'Diabetes' },
  { term: 'atorvastatin', label: 'Atorvastatin', category: 'Cholesterol' },
  { term: 'omeprazole', label: 'Omeprazole', category: 'Acid Reducer' },
  { term: 'lisinopril', label: 'Lisinopril', category: 'Blood Pressure' },
  { term: 'amlodipine', label: 'Amlodipine', category: 'Blood Pressure' },
  { term: 'levothyroxine', label: 'Levothyroxine', category: 'Thyroid' },
  { term: 'clopidogrel', label: 'Clopidogrel', category: 'Antiplatelet' },
  { term: 'fluorouracil', label: 'Fluorouracil', category: 'Oncology' },
  { term: 'cisplatin', label: 'Cisplatin', category: 'Oncology' },
];

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

  // Handle shortcut selection
  const handleShortcutClick = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  // Get drug type tooltip content
  const getDrugTypeTooltip = (drug: Drug) => (
    <div className="space-y-1 text-xs">
      <div className="font-semibold">Drug Information:</div>
      <div>RXCUI: {drug.rxcui}</div>
      {drug.tty && <div>Type: {drug.tty}</div>}
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-gray-300">Click to add to interaction analysis</div>
      </div>
    </div>
  );

  // Get clinical considerations tooltip
  const getClinicalConsiderations = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold text-purple-200">Clinical Considerations:</div>
      <ul className="space-y-1 list-disc list-inside">
        <li>Verify drug name and strength</li>
        <li>Check for generic/brand equivalents</li>
        <li>Consider patient allergies</li>
        <li>Review indication and dosing</li>
      </ul>
    </div>
  );


  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">Add Medication</h3>
        <Tooltip
          content={getClinicalConsiderations()}
          type="clinical"
          iconOnly
          position="right"
        />
      </div>

      <DrugSearchBar
        onSearch={handleSearch}
        loading={loading}
        placeholder="Search for a medication to add..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* Quick Drug Shortcuts */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Quick Access:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {drugShortcuts.map((shortcut) => (
            <button
              key={shortcut.term}
              onClick={() => handleShortcutClick(shortcut.term)}
              className="flex flex-col items-start p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">{shortcut.label}</span>
              <span className="text-xs text-gray-500">{shortcut.category}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {searchResults && searchResults.count > 0 && (
        <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Found {searchResults.count} results for "{searchResults.query}"
              </p>
              <Tooltip
                content="Click on any medication to add it to your interaction analysis"
                type="info"
                iconOnly
                position="left"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.results.slice(0, 10).map((drug) => (
              <Tooltip
                key={`${drug.rxcui}-${drug.tty}`}
                content={getDrugTypeTooltip(drug)}
                position="right"
                maxWidth="max-w-xs"
              >
                <div
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
              </Tooltip>
            ))}
          </div>
          {searchResults.count > 10 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500">
                  Showing first 10 results. Refine your search for more specific results.
                </p>
              </div>
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