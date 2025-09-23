import React, { useState } from 'react';
import AutocompleteSearch from './AutocompleteSearch';
import FilterAutocomplete, {
  THERAPEUTIC_CLASS_OPTIONS,
  MECHANISM_OPTIONS,
  INDICATION_OPTIONS,
  BIOMARKER_OPTIONS,
  APPROVAL_STATUS_OPTIONS,
  CLINICAL_TRIAL_PHASE_OPTIONS
} from './FilterAutocomplete';
import Card from '../UI/Card';
import { Search, Filter, Pill, Target, Zap, Activity, CheckCircle, Clock } from 'lucide-react';

interface SelectedFilters {
  mainSearch: string;
  therapeuticClass: string[];
  mechanisms: string[];
  indications: string[];
  biomarkers: string[];
  approvalStatus: string[];
  clinicalPhases: string[];
}

const AutocompleteDemo: React.FC = () => {
  const [filters, setFilters] = useState<SelectedFilters>({
    mainSearch: '',
    therapeuticClass: [],
    mechanisms: [],
    indications: [],
    biomarkers: [],
    approvalStatus: [],
    clinicalPhases: []
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleMainSearch = (option: any) => {
    setFilters(prev => ({ ...prev, mainSearch: option.value }));
    
    // Auto-populate related filters based on selection
    if (option.type === 'drug') {
      if (option.isOncology) {
        setFilters(prev => ({ 
          ...prev, 
          therapeuticClass: [...prev.therapeuticClass, 'antineoplastic'].filter((v, i, a) => a.indexOf(v) === i)
        }));
      }
    } else if (option.type === 'indication') {
      setFilters(prev => ({ 
        ...prev, 
        indications: [...prev.indications, option.value].filter((v, i, a) => a.indexOf(v) === i)
      }));
    } else if (option.type === 'mechanism') {
      setFilters(prev => ({ 
        ...prev, 
        mechanisms: [...prev.mechanisms, option.value].filter((v, i, a) => a.indexOf(v) === i)
      }));
    }

    // Simulate search results
    setSearchResults([
      {
        id: '1',
        name: option.label,
        type: option.type,
        description: option.description,
        category: option.category
      }
    ]);
  };

  const totalActiveFilters = 
    filters.therapeuticClass.length +
    filters.mechanisms.length +
    filters.indications.length +
    filters.biomarkers.length +
    filters.approvalStatus.length +
    filters.clinicalPhases.length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Enhanced Drug Search Autocomplete Demo
        </h1>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Experience intelligent drug discovery with comprehensive autocomplete suggestions across drugs, indications, mechanisms, and biomarkers.
        </p>
      </div>

      {/* Main Search */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-6 w-6 text-violet-600" />
            <h2 className="text-xl font-bold text-violet-800">Main Drug Search</h2>
          </div>
          <AutocompleteSearch
            placeholder="Search 1000+ drugs, indications, mechanisms, biomarkers..."
            onSelect={handleMainSearch}
            onInputChange={(value) => setFilters(prev => ({ ...prev, mainSearch: value }))}
            value={filters.mainSearch}
            maxResults={15}
            showCategories={true}
            className="w-full"
          />
          
          {/* Search Results Preview */}
          {searchResults.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-900 mb-2">Search Results:</h3>
              {searchResults.map(result => (
                <div key={result.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Pill className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">{result.name}</div>
                    <div className="text-sm text-gray-500">{result.category} • {result.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Advanced Filters */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
              {totalActiveFilters > 0 && (
                <span className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium">
                  {totalActiveFilters} active
                </span>
              )}
            </div>
            <button
              onClick={() => setFilters({
                mainSearch: '',
                therapeuticClass: [],
                mechanisms: [],
                indications: [],
                biomarkers: [],
                approvalStatus: [],
                clinicalPhases: []
              })}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Therapeutic Class */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Pill className="h-5 w-5 text-red-500" />
                <h3 className="font-medium text-gray-900">Therapeutic Class</h3>
              </div>
              <FilterAutocomplete
                options={THERAPEUTIC_CLASS_OPTIONS}
                selectedValues={filters.therapeuticClass}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, therapeuticClass: values }))}
                placeholder="Select therapeutic classes..."
                searchable={true}
                showCounts={true}
                maxSelection={3}
              />
            </div>

            {/* Mechanism of Action */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium text-gray-900">Mechanism of Action</h3>
              </div>
              <FilterAutocomplete
                options={MECHANISM_OPTIONS}
                selectedValues={filters.mechanisms}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, mechanisms: values }))}
                placeholder="Select mechanisms..."
                searchable={true}
                showCounts={true}
                maxSelection={3}
              />
            </div>

            {/* Cancer Indications */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium text-gray-900">Cancer Indications</h3>
              </div>
              <FilterAutocomplete
                options={INDICATION_OPTIONS}
                selectedValues={filters.indications}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, indications: values }))}
                placeholder="Select cancer types..."
                searchable={true}
                showCounts={true}
                maxSelection={5}
              />
            </div>

            {/* Biomarkers */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-gray-900">Biomarker Targets</h3>
              </div>
              <FilterAutocomplete
                options={BIOMARKER_OPTIONS}
                selectedValues={filters.biomarkers}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, biomarkers: values }))}
                placeholder="Select biomarkers..."
                searchable={true}
                showCounts={true}
                maxSelection={3}
              />
            </div>

            {/* Approval Status */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h3 className="font-medium text-gray-900">Approval Status</h3>
              </div>
              <FilterAutocomplete
                options={APPROVAL_STATUS_OPTIONS}
                selectedValues={filters.approvalStatus}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, approvalStatus: values }))}
                placeholder="Select approval status..."
                searchable={true}
                showCounts={true}
                maxSelection={3}
              />
            </div>

            {/* Clinical Trial Phase */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <h3 className="font-medium text-gray-900">Clinical Trial Phase</h3>
              </div>
              <FilterAutocomplete
                options={CLINICAL_TRIAL_PHASE_OPTIONS}
                selectedValues={filters.clinicalPhases}
                onSelectionChange={(values) => setFilters(prev => ({ ...prev, clinicalPhases: values }))}
                placeholder="Select trial phases..."
                searchable={true}
                showCounts={true}
                maxSelection={3}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Active Filters Summary */}
      {totalActiveFilters > 0 && (
        <Card className="border-violet-200 bg-violet-50">
          <div className="p-6">
            <h3 className="font-medium text-violet-900 mb-4">Active Search Criteria</h3>
            <div className="space-y-2">
              {filters.mainSearch && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-violet-700">Main Search:</span>
                  <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-sm">
                    {filters.mainSearch}
                  </span>
                </div>
              )}
              
              {filters.therapeuticClass.length > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium text-violet-700">Therapeutic Class:</span>
                  {filters.therapeuticClass.map(item => (
                    <span key={item} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {THERAPEUTIC_CLASS_OPTIONS.find(opt => opt.value === item)?.label || item}
                    </span>
                  ))}
                </div>
              )}

              {filters.mechanisms.length > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium text-violet-700">Mechanisms:</span>
                  {filters.mechanisms.map(item => (
                    <span key={item} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {MECHANISM_OPTIONS.find(opt => opt.value === item)?.label || item}
                    </span>
                  ))}
                </div>
              )}

              {filters.indications.length > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium text-violet-700">Indications:</span>
                  {filters.indications.map(item => (
                    <span key={item} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {INDICATION_OPTIONS.find(opt => opt.value === item)?.label || item}
                    </span>
                  ))}
                </div>
              )}

              {filters.biomarkers.length > 0 && (
                <div className="flex items-center space-x-2 flex-wrap">
                  <span className="text-sm font-medium text-violet-700">Biomarkers:</span>
                  {filters.biomarkers.map(item => (
                    <span key={item} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {BIOMARKER_OPTIONS.find(opt => opt.value === item)?.label || item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Feature Highlights */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Autocomplete Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900 mb-1">Smart Search</h4>
              <p className="text-sm text-blue-700">AI-powered suggestions with confidence scoring</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Filter className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 mb-1">Advanced Filters</h4>
              <p className="text-sm text-green-700">Comprehensive multi-select filter options</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900 mb-1">Context Aware</h4>
              <p className="text-sm text-purple-700">Auto-suggestions based on selection type</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-orange-900 mb-1">Real-time</h4>
              <p className="text-sm text-orange-700">Instant results as you type</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AutocompleteDemo;