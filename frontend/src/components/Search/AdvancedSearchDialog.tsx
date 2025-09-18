import React, { useState } from 'react';
import { X, Filter, Search, BookmarkPlus, History, Star } from 'lucide-react';
import { SearchFilter, useAdvancedSearch } from '../../hooks/useAdvancedSearch';

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilter) => void;
}

const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  isOpen,
  onClose,
  onSearch
}) => {
  const {
    query,
    filters,
    suggestions,
    recentSearches,
    history,
    favorites,
    favoritesByType,
    activeFiltersCount,
    setQuery,
    setFilters,
    clearFilters,
    performSearch
  } = useAdvancedSearch();

  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'favorites'>('search');

  if (!isOpen) return null;

  const handleSearch = () => {
    onSearch(query, filters);
    performSearch();
    onClose();
  };

  const handleFilterChange = (key: keyof SearchFilter, value: any) => {
    setFilters({ [key]: value });
  };

  const drugCategories = [
    'Alkylating Agents',
    'Antimetabolites', 
    'Topoisomerase Inhibitors',
    'Targeted Therapy',
    'Immunotherapy',
    'Hormone Therapy',
    'Supportive Care',
    'Investigational'
  ];

  const mechanisms = [
    'DNA crosslinking',
    'DNA synthesis inhibition',
    'Topoisomerase inhibition',
    'Tyrosine kinase inhibition',
    'Checkpoint inhibition',
    'Monoclonal antibody',
    'Hormone receptor antagonist',
    'Growth factor inhibition'
  ];

  const indications = [
    'Breast cancer',
    'Lung cancer',
    'Colorectal cancer',
    'Ovarian cancer',
    'Prostate cancer',
    'Melanoma',
    'Lymphoma',
    'Leukemia',
    'Head and neck cancer',
    'Gastric cancer'
  ];

  const routes = [
    'Oral',
    'Intravenous',
    'Intramuscular',
    'Subcutaneous',
    'Topical',
    'Intrathecal'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Advanced Search</h2>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Search & Filters
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Search History
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'favorites'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Favorites
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter drug name, indication, or mechanism..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestion)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Recent searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Drug Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drug Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {drugCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Mechanism */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mechanism of Action
                  </label>
                  <select
                    value={filters.mechanism}
                    onChange={(e) => handleFilterChange('mechanism', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Mechanisms</option>
                    {mechanisms.map((mechanism) => (
                      <option key={mechanism} value={mechanism}>{mechanism}</option>
                    ))}
                  </select>
                </div>

                {/* Indication */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indication
                  </label>
                  <select
                    value={filters.indication}
                    onChange={(e) => handleFilterChange('indication', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Indications</option>
                    {indications.map((indication) => (
                      <option key={indication} value={indication}>{indication}</option>
                    ))}
                  </select>
                </div>

                {/* Route of Administration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route of Administration
                  </label>
                  <select
                    value={filters.routeOfAdministration}
                    onChange={(e) => handleFilterChange('routeOfAdministration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Routes</option>
                    {routes.map((route) => (
                      <option key={route} value={route}>{route}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Boolean Filters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isOncology === true}
                    onChange={(e) => handleFilterChange('isOncology', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Oncology drugs only</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasGenomicData === true}
                    onChange={(e) => handleFilterChange('hasGenomicData', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Has genomic data</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.fdaApproved === true}
                    onChange={(e) => handleFilterChange('fdaApproved', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">FDA approved</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isOrphan === true}
                    onChange={(e) => handleFilterChange('isOrphan', e.target.checked ? true : undefined)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Orphan drugs</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Search History</h3>
                <button
                  onClick={() => {}}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear History
                </button>
              </div>
              
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No search history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setQuery(item.query);
                        setFilters(item.filters);
                        setActiveTab('search');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.query || 'Advanced search'}</span>
                        <span className="text-sm text-gray-500">
                          {item.resultCount} result{item.resultCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Favorites</h3>
              
              {Object.keys(favoritesByType).length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No favorites yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Save drugs, interactions, and protocols for quick access
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(favoritesByType).map(([type, items]) => (
                    <div key={type}>
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">
                        {type}s ({items.length})
                      </h4>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{item.name}</span>
                              <button className="text-yellow-500 hover:text-yellow-600">
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                            </div>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                            )}
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={activeFiltersCount === 0}
          >
            Clear Filters
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchDialog;