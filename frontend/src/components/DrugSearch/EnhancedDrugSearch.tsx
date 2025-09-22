import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Brain, Target, Zap, AlertCircle, CheckCircle, Clock, Star, TrendingUp, Database } from 'lucide-react';
import Card from '../UI/Card';
import { Drug } from '../../types';

interface EnhancedDrugSearchProps {
  onSearch: (query: string, filters: any) => void;
  loading?: boolean;
  results?: Drug[];
}

interface SearchSuggestion {
  type: 'drug' | 'indication' | 'mechanism' | 'class';
  text: string;
  confidence: number;
  metadata?: any;
}

interface SmartFilter {
  id: string;
  label: string;
  type: 'toggle' | 'select' | 'range' | 'multi-select';
  options?: { value: string; label: string }[];
  range?: { min: number; max: number; step: number };
  aiRecommended?: boolean;
  description?: string;
}

const EnhancedDrugSearch: React.FC<EnhancedDrugSearchProps> = ({ onSearch, loading, results }) => {
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({
    oncologyOnly: false,
    fdaApproved: true,
    hasInteractions: false,
    therapeuticClass: '',
    mechanism: '',
    indication: '',
    biomarker: '',
    approvalYear: [2000, 2024],
    clinicalTrialPhase: 'all',
    pregnancyCategory: 'all',
    renalAdjustment: false,
    hepaticAdjustment: false
  });

  const smartFilters: SmartFilter[] = [
    {
      id: 'oncologyOnly',
      label: 'Oncology Drugs Only',
      type: 'toggle',
      aiRecommended: true,
      description: 'Focus on cancer treatment medications'
    },
    {
      id: 'fdaApproved',
      label: 'FDA Approved',
      type: 'toggle',
      description: 'Include only FDA-approved medications'
    },
    {
      id: 'therapeuticClass',
      label: 'Therapeutic Class',
      type: 'select',
      options: [
        { value: '', label: 'All Classes' },
        { value: 'antineoplastic', label: 'Antineoplastic Agents' },
        { value: 'immunotherapy', label: 'Immunotherapy' },
        { value: 'targeted_therapy', label: 'Targeted Therapy' },
        { value: 'chemotherapy', label: 'Chemotherapy' },
        { value: 'hormone_therapy', label: 'Hormone Therapy' },
        { value: 'supportive_care', label: 'Supportive Care' }
      ]
    },
    {
      id: 'mechanism',
      label: 'Mechanism of Action',
      type: 'multi-select',
      options: [
        { value: 'kinase_inhibitor', label: 'Kinase Inhibitor' },
        { value: 'monoclonal_antibody', label: 'Monoclonal Antibody' },
        { value: 'checkpoint_inhibitor', label: 'Checkpoint Inhibitor' },
        { value: 'alkylating_agent', label: 'Alkylating Agent' },
        { value: 'antimetabolite', label: 'Antimetabolite' },
        { value: 'topoisomerase_inhibitor', label: 'Topoisomerase Inhibitor' }
      ]
    },
    {
      id: 'indication',
      label: 'Cancer Indication',
      type: 'select',
      options: [
        { value: '', label: 'All Indications' },
        { value: 'breast_cancer', label: 'Breast Cancer' },
        { value: 'lung_cancer', label: 'Lung Cancer' },
        { value: 'colorectal_cancer', label: 'Colorectal Cancer' },
        { value: 'leukemia', label: 'Leukemia' },
        { value: 'lymphoma', label: 'Lymphoma' },
        { value: 'melanoma', label: 'Melanoma' },
        { value: 'prostate_cancer', label: 'Prostate Cancer' },
        { value: 'ovarian_cancer', label: 'Ovarian Cancer' }
      ]
    },
    {
      id: 'biomarker',
      label: 'Biomarker Target',
      type: 'select',
      options: [
        { value: '', label: 'No Biomarker Filter' },
        { value: 'her2', label: 'HER2+' },
        { value: 'er_pr', label: 'ER/PR+' },
        { value: 'egfr', label: 'EGFR' },
        { value: 'kras', label: 'KRAS' },
        { value: 'brca', label: 'BRCA1/2' },
        { value: 'pd_l1', label: 'PD-L1' },
        { value: 'msi', label: 'MSI-H' }
      ]
    },
    {
      id: 'approvalYear',
      label: 'FDA Approval Year',
      type: 'range',
      range: { min: 1950, max: 2024, step: 1 }
    },
    {
      id: 'clinicalTrialPhase',
      label: 'Clinical Trial Phase',
      type: 'select',
      options: [
        { value: 'all', label: 'All Phases' },
        { value: 'approved', label: 'FDA Approved' },
        { value: 'phase3', label: 'Phase III' },
        { value: 'phase2', label: 'Phase II' },
        { value: 'phase1', label: 'Phase I' },
        { value: 'investigational', label: 'Investigational' }
      ]
    },
    {
      id: 'hasInteractions',
      label: 'Has Known Interactions',
      type: 'toggle',
      description: 'Show drugs with documented drug-drug interactions'
    },
    {
      id: 'renalAdjustment',
      label: 'Requires Renal Adjustment',
      type: 'toggle',
      description: 'Drugs requiring dose adjustment in renal impairment'
    },
    {
      id: 'hepaticAdjustment',
      label: 'Requires Hepatic Adjustment',
      type: 'toggle',
      description: 'Drugs requiring dose adjustment in hepatic impairment'
    }
  ];

  // AI-powered search suggestions
  const generateSuggestions = (searchTerm: string): SearchSuggestion[] => {
    if (!searchTerm || searchTerm.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    
    // Drug name suggestions
    const drugSuggestions = [
      'pembrolizumab', 'nivolumab', 'ipilimumab', 'atezolizumab',
      'trastuzumab', 'bevacizumab', 'rituximab', 'cetuximab',
      'imatinib', 'dasatinib', 'nilotinib', 'bosutinib',
      'paclitaxel', 'docetaxel', 'carboplatin', 'cisplatin',
      'doxorubicin', 'cyclophosphamide', 'methotrexate', 'fluorouracil'
    ];

    drugSuggestions
      .filter(drug => drug.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(drug => {
        suggestions.push({
          type: 'drug',
          text: drug,
          confidence: 0.9
        });
      });

    // Indication suggestions
    const indicationSuggestions = [
      'breast cancer', 'lung cancer', 'melanoma', 'lymphoma',
      'leukemia', 'colorectal cancer', 'prostate cancer', 'ovarian cancer'
    ];

    indicationSuggestions
      .filter(indication => indication.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(indication => {
        suggestions.push({
          type: 'indication',
          text: indication,
          confidence: 0.8
        });
      });

    // Mechanism suggestions
    const mechanismSuggestions = [
      'kinase inhibitor', 'checkpoint inhibitor', 'monoclonal antibody',
      'alkylating agent', 'antimetabolite', 'topoisomerase inhibitor'
    ];

    mechanismSuggestions
      .filter(mechanism => mechanism.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(mechanism => {
        suggestions.push({
          type: 'mechanism',
          text: mechanism,
          confidence: 0.7
        });
      });

    return suggestions.slice(0, 8);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions(query));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const renderFilter = (filter: SmartFilter) => {
    const value = filters[filter.id];

    switch (filter.type) {
      case 'toggle':
        return (
          <label key={filter.id} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">{filter.label}</span>
            {filter.aiRecommended && <Brain className="w-4 h-4 text-primary-500" />}
          </label>
        );

      case 'select':
        return (
          <div key={filter.id} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
              {filter.aiRecommended && <Brain className="inline w-4 h-4 ml-1 text-primary-500" />}
            </label>
            <select
              value={value}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multi-select':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {filter.options?.map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentArray = Array.isArray(value) ? value : [];
                      const newArray = e.target.checked
                        ? [...currentArray, option.value]
                        : currentArray.filter(v => v !== option.value);
                      handleFilterChange(filter.id, newArray);
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'range':
        return (
          <div key={filter.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}: {Array.isArray(value) ? `${value[0]} - ${value[1]}` : value}
            </label>
            <div className="px-2">
              <input
                type="range"
                min={filter.range?.min}
                max={filter.range?.max}
                step={filter.range?.step}
                value={Array.isArray(value) ? value[0] : value}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value);
                  if (Array.isArray(value)) {
                    handleFilterChange(filter.id, [newValue, value[1]]);
                  } else {
                    handleFilterChange(filter.id, newValue);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'fdaApproved') return !value; // Default is true
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value !== '';
      if (Array.isArray(value)) return value.length > 0;
      return false;
    }).length;
  }, [filters]);

  return (
    <Card className="space-y-6">
      {/* Enhanced Search Header */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Search className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Enhanced Drug Search</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Brain className="w-4 h-4" />
          <span>AI-Powered</span>
        </div>
      </div>

      {/* Main Search Interface */}
      <div className="space-y-4">
        {/* Search Input with Suggestions */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search drugs by name, indication, mechanism, or biomarker..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* AI Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion.text);
                    setSuggestions([]);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex-shrink-0">
                    {suggestion.type === 'drug' && <Target className="w-4 h-4 text-blue-500" />}
                    {suggestion.type === 'indication' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {suggestion.type === 'mechanism' && <Zap className="w-4 h-4 text-purple-500" />}
                    {suggestion.type === 'class' && <Database className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                    <div className="text-xs text-gray-500 capitalize">{suggestion.type}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-2 border rounded-lg flex items-center space-x-2 ${
              showAdvanced
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smartFilters.map(renderFilter)}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setFilters({
                oncologyOnly: false,
                fdaApproved: true,
                hasInteractions: false,
                therapeuticClass: '',
                mechanism: '',
                indication: '',
                biomarker: '',
                approvalYear: [2000, 2024],
                clinicalTrialPhase: 'all',
                pregnancyCategory: 'all',
                renalAdjustment: false,
                hepaticAdjustment: false
              })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All Filters
            </button>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Brain className="w-4 h-4" />
              <span>AI recommendations highlighted</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {results && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{results.length}</div>
              <div className="text-sm text-gray-500">Results Found</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(d => d.fdaApproved).length}
              </div>
              <div className="text-sm text-gray-500">FDA Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {results.filter(d => d.hasInteractions).length}
              </div>
              <div className="text-sm text-gray-500">With Interactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {results.filter(d => d.oncologyDrug).length}
              </div>
              <div className="text-sm text-gray-500">Oncology Drugs</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedDrugSearch;