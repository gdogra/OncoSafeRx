import React from 'react';
import { Drug, DrugSearchResult } from '../../types';
import DrugCard from './DrugCard';
import Alert from '../UI/Alert';
import { Database, Globe } from 'lucide-react';

interface DrugSearchResultsProps {
  results: DrugSearchResult | null;
  loading: boolean;
  error: string | null;
  onDrugSelect?: (drug: Drug) => void;
}

const DrugSearchResults: React.FC<DrugSearchResultsProps> = ({
  results,
  loading,
  error,
  onDrugSelect,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" title="Search Error">
        {error}
      </Alert>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Search for drugs</p>
          <p className="text-sm">Enter a drug name to search our database and external sources</p>
        </div>
      </div>
    );
  }

  if (results.count === 0) {
    return (
      <Alert type="info" title="No Results Found">
        No drugs found matching your search query "{results.query}". Please try a different search term.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results for "{results.query}"
            </h3>
            <p className="text-sm text-gray-600">
              Found {results.count} drug{results.count !== 1 ? 's' : ''}
            </p>
          </div>
          
          {results.sources && (
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Database className="w-4 h-4" />
                <span>Local: {results.sources.local}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Globe className="w-4 h-4" />
                <span>RxNorm: {results.sources.rxnorm}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        {results.results.map((drug) => (
          <DrugCard
            key={`${drug.rxcui}-${drug.tty}`}
            drug={drug}
            onClick={onDrugSelect}
          />
        ))}
      </div>

      {/* Load More (if needed) */}
      {results.count > results.results.length && (
        <div className="text-center">
          <button className="px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
};

export default DrugSearchResults;