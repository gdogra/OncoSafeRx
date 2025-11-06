import React, { useState, useCallback, useEffect } from 'react';
import { Pill, AlertTriangle } from 'lucide-react';
import AutoComplete, { AutoCompleteOption } from '../UI/AutoComplete';
import Tooltip from '../UI/Tooltip';
import { drugService } from '../../services/api';
import { useSelection } from '../../context/SelectionContext';
import { Drug } from '../../types';

interface EnhancedDrugSearchBarProps {
  onDrugSelect: (drug: Drug) => void;
  placeholder?: string;
  showTooltips?: boolean;
  allowMultiple?: boolean;
  maxSuggestions?: number;
  className?: string;
}

const EnhancedDrugSearchBar: React.FC<EnhancedDrugSearchBarProps> = ({
  onDrugSelect,
  placeholder = "Search for medications (e.g., aspirin, warfarin, pembrolizumab)...",
  showTooltips = true,
  allowMultiple = false,
  maxSuggestions = 10,
  className = '',
}) => {
  const selection = useSelection();
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<Drug[]>([]);

  // Local fallback drug names when API is unavailable (e.g., offline/dev sandbox)
  const FALLBACK_DRUGS = [
    'aspirin', 'ibuprofen', 'acetaminophen', 'warfarin', 'clopidogrel',
    'pembrolizumab', 'nivolumab', 'fluorouracil', 'capecitabine', 'paclitaxel',
    'cisplatin', 'carboplatin', 'doxorubicin', 'imatinib', 'tamoxifen',
    'metformin', 'atorvastatin', 'amlodipine', 'omeprazole', 'hydrochlorothiazide',
  ];

  // Additional brand aliases to improve offline suggestions and typo tolerance
  const FALLBACK_BRANDS = [
    'arkamin', 'metpure', 'probowel', 'dytor', 'cilacar', 'cilicar', 'kbind', 'oxra', 'zolfresh', 'febutaz', 'montair fx',
    'tylenol', 'advil', 'motrin', 'lipitor', 'crestor', 'zyrtec', 'allegra', 'flonase'
  ];

  const FALLBACK_SUGGESTIONS = Array.from(new Set([...FALLBACK_DRUGS, ...FALLBACK_BRANDS]));

  // Lightweight fuzzy scoring (prefix > substring > subsequence)
  const fuzzyScore = (candidate: string, query: string) => {
    const a = candidate.toLowerCase();
    const b = query.toLowerCase();
    if (!b) return 0;
    if (a === b) return 1000;
    if (a.startsWith(b)) return 800 - (a.length - b.length);
    const idx = a.indexOf(b);
    if (idx >= 0) return 600 - idx; // earlier match is better
    // subsequence score
    let i = 0, j = 0, hits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { hits++; j++; }
      i++;
    }
    return hits * 10 - (a.length - hits);
  };

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('oncosaferx_search_history');
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 5)); // Keep last 5 searches
      }
    } catch (err) {
      console.warn('Failed to load search history:', err);
    }
  }, []);

  // Save to search history
  const addToHistory = useCallback((drug: Drug) => {
    const newHistory = [
      drug,
      ...searchHistory.filter(d => d.rxcui !== drug.rxcui)
    ].slice(0, 5);
    
    setSearchHistory(newHistory);
    
    try {
      localStorage.setItem('oncosaferx_search_history', JSON.stringify(newHistory));
    } catch (err) {
      console.warn('Failed to save search history:', err);
    }
  }, [searchHistory]);

  // Search drugs with debouncing
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      // Show recent searches for short queries
      const historyOptions: AutoCompleteOption[] = searchHistory.map(drug => ({
        value: drug.rxcui,
        label: drug.name,
        description: `RXCUI: ${drug.rxcui}${drug.tty ? ` • ${drug.tty}` : ''}`,
        category: 'Recent Searches',
        metadata: drug,
      }));
      setOptions(historyOptions);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await drugService.searchDrugs(query);
      
      const drugOptions: AutoCompleteOption[] = results.results.slice(0, maxSuggestions).map((drug: Drug) => ({
        value: drug.rxcui,
        label: drug.name,
        description: `RXCUI: ${drug.rxcui}${drug.tty ? ` • ${drug.tty}` : ''}`,
        category: drug.tty || 'Medications',
        metadata: drug,
      }));

      // Add history options if query is short
      const historyOptions: AutoCompleteOption[] = query.length < 4 ? 
        searchHistory
          .filter((drug: Drug) => drug.name.toLowerCase().includes(query.toLowerCase()))
          .map((drug: Drug) => ({
            value: drug.rxcui,
            label: drug.name,
            description: `RXCUI: ${drug.rxcui}${drug.tty ? ` • ${drug.tty}` : ''}`,
            category: 'Recent Searches',
            metadata: drug,
          })) : [];
      const combined = [...historyOptions, ...drugOptions];

      // If no results from API, use a local fuzzy fallback list
      if (combined.length === 0) {
        const q = query.toLowerCase();
        const ranked = FALLBACK_SUGGESTIONS
          .map((name) => ({ name, score: fuzzyScore(name, q) }))
          .filter(x => x.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, maxSuggestions);
        const fallbackOptions: AutoCompleteOption[] = ranked.map(({ name }) => ({
          value: name,
          label: name,
          description: 'Local suggestion',
          category: 'Suggestions',
          metadata: undefined,
        }));
        setOptions(fallbackOptions);
      } else {
        setOptions(combined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search drugs');
      // On error, also provide fuzzy fallback suggestions
      const q = query.toLowerCase();
      const ranked = FALLBACK_SUGGESTIONS
        .map((name) => ({ name, score: fuzzyScore(name, q) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSuggestions);
      const fallbackOptions: AutoCompleteOption[] = ranked.map(({ name }) => ({
        value: name,
        label: name,
        description: 'Local suggestion',
        category: 'Suggestions',
        metadata: undefined,
      }));
      setOptions(fallbackOptions);
    } finally {
      setLoading(false);
    }
  }, [searchHistory, maxSuggestions]);

  // Handle drug selection
  const handleDrugSelect = async (option: AutoCompleteOption) => {
    const metaDrug = option.metadata as Drug | undefined;
    if (metaDrug) {
      addToHistory(metaDrug);
      selection.addDrug(metaDrug);
      try { const { rxcui, name } = metaDrug; (await import('../../utils/analytics')).analytics.logSelection(rxcui, name, 'autocomplete'); } catch {}
      onDrugSelect(metaDrug);
      return;
    }
    // Resolve fallback suggestion via API by full label
    try {
      const results = await drugService.searchDrugs(option.label);
      if (results.count > 0) {
        const drug = results.results[0] as Drug;
        addToHistory(drug);
        selection.addDrug(drug);
        try { const { rxcui, name } = drug; (await import('../../utils/analytics')).analytics.logSelection(rxcui, name, 'autocomplete'); } catch {}
        onDrugSelect(drug);
      }
    } catch (e) {
      // ignore resolution failure
    }
  };

  // Get search tips for tooltip
  const getSearchTips = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold">Search Tips:</div>
      <ul className="space-y-1 list-disc list-inside">
        <li>Search by generic name (e.g., "aspirin")</li>
        <li>Search by brand name (e.g., "Tylenol")</li>
        <li>Use partial names (e.g., "pembro" for pembrolizumab)</li>
        <li>Case doesn't matter (e.g., "WARFARIN" = "warfarin")</li>
      </ul>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="font-semibold">Drug Types Supported:</div>
        <div className="text-gray-600">Oncology drugs, supportive care, anticoagulants, and more</div>
      </div>
    </div>
  );

  // Get clinical safety tooltip
  const getClinicalTips = () => (
    <div className="space-y-2 text-xs">
      <div className="font-semibold text-amber-200">Clinical Safety:</div>
      <ul className="space-y-1 list-disc list-inside">
        <li>Always verify drug selection</li>
        <li>Check for interaction alerts</li>
        <li>Consider patient-specific factors</li>
        <li>Consult clinical guidelines</li>
      </ul>
      <div className="mt-2 pt-2 border-t border-amber-200">
        <div className="text-amber-200">This tool supports clinical decision-making but does not replace professional judgment</div>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <AutoComplete
            options={options}
            placeholder={placeholder}
            onSelect={handleDrugSelect}
            onSearch={handleSearch}
            loading={loading}
            caseSensitive={false}
            highlightMatches={true}
            groupByCategory={true}
            maxResults={maxSuggestions}
            minChars={2}
            debounceMs={300}
            allowCustom={false}
            noResultsText="No medications found. Try a different search term."
            searchKeys={['label', 'description']}
            className="w-full"
            dropdownClassName="border-2 border-blue-200"
            disableFiltering={true}
          />
        </div>

        {showTooltips && (
          <div className="flex items-center space-x-1">
            <Tooltip
              content={getSearchTips()}
              type="help"
              iconOnly
              position="bottom-right"
              maxWidth="max-w-sm"
            />
            
            <Tooltip
              content={getClinicalTips()}
              type="clinical"
              iconOnly
              position="bottom-right"
              maxWidth="max-w-sm"
            >
              <AlertTriangle className="w-4 h-4 text-purple-600" />
            </Tooltip>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Recent searches indicator */}
      {searchHistory.length > 0 && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <Pill className="w-3 h-3 mr-1" />
          <span>Recent: {searchHistory.slice(0, 3).map((d: Drug) => d.name).join(', ')}</span>
          {searchHistory.length > 3 && <span> and {searchHistory.length - 3} more...</span>}
        </div>
      )}
    </div>
  );
};

export default EnhancedDrugSearchBar;
