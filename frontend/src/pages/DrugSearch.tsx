import React, { useState } from 'react';
import { Drug, DrugSearchResult } from '../types';
import { drugService } from '../services/api';
import DrugSearchBar from '../components/DrugSearch/DrugSearchBar';
import DrugSearchResults from '../components/DrugSearch/DrugSearchResults';
import DrugCard from '../components/DrugSearch/DrugCard';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { Search, History, Star } from 'lucide-react';

const DrugSearch: React.FC = () => {
  const [searchResults, setSearchResults] = useState<DrugSearchResult | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory] = useState<string[]>([
    'aspirin',
    'ibuprofen', 
    'fluorouracil',
    'clopidogrel'
  ]);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    setSelectedDrug(null);

    try {
      const results = await drugService.searchDrugs(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search drugs');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrugSelect = async (drug: Drug) => {
    setSelectedDrug(drug);
    
    // Try to get detailed information
    try {
      const details = await drugService.getDrugDetails(drug.rxcui);
      setSelectedDrug({ ...drug, ...details });
    } catch (err) {
      console.warn('Failed to load drug details:', err);
      // Keep the basic drug info from search results
    }
  };

  const handleBackToResults = () => {
    setSelectedDrug(null);
  };

  const handleQuickSearch = (query: string) => {
    handleSearch(query);
  };

  if (selectedDrug) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBackToResults}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <span>←</span>
          <span>Back to Search Results</span>
        </button>

        {/* Drug Details */}
        <DrugCard drug={selectedDrug} showDetails={true} />

        {/* Additional Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card padding="sm" className="text-center">
            <div className="text-primary-600 mb-2">
              <Search className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">View Interactions</h3>
            <p className="text-sm text-gray-600 mb-3">Check drug-drug interactions</p>
            <button 
              onClick={() => window.open(`/interactions?drug=${selectedDrug.rxcui}`, '_blank')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Check Interactions →
            </button>
          </Card>

          <Card padding="sm" className="text-center">
            <div className="text-purple-600 mb-2">
              <Star className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Genomic Analysis</h3>
            <p className="text-sm text-gray-600 mb-3">View pharmacogenomic factors</p>
            <button 
              onClick={() => window.open(`/genomics?drug=${selectedDrug.rxcui}`, '_blank')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Analyze Genomics →
            </button>
          </Card>

          <Card padding="sm" className="text-center">
            <div className="text-green-600 mb-2">
              <History className="w-6 h-6 mx-auto" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Clinical Trials</h3>
            <p className="text-sm text-gray-600 mb-3">Find relevant studies</p>
            <button 
              onClick={() => window.open(`/protocols?drug=${selectedDrug.name}`, '_blank')}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View Trials →
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Search className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Drug Search</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search our comprehensive database of medications including FDA-approved drugs, generics, and brand names.
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Search Medications</h2>
          <DrugSearchBar onSearch={handleSearch} loading={loading} />
          
          {/* Quick Search Suggestions */}
          {searchHistory.length > 0 && !searchResults && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Search</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSearch(term)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Search Results */}
      <DrugSearchResults
        results={searchResults}
        loading={loading}
        error={error}
        onDrugSelect={handleDrugSelect}
      />

      {/* Help Section */}
      {!searchResults && !loading && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-900">Search Tips</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Search by:</h4>
                <ul className="space-y-1">
                  <li>• Generic name (e.g., "aspirin")</li>
                  <li>• Brand name (e.g., "Tylenol")</li>
                  <li>• Active ingredient</li>
                  <li>• RXCUI identifier</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Examples:</h4>
                <ul className="space-y-1">
                  <li>• "ibuprofen" - Find all ibuprofen products</li>
                  <li>• "Advil" - Search by brand name</li>
                  <li>• "acetaminophen" - Generic drug name</li>
                  <li>• "161" - Search by RXCUI</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Data Sources */}
      <Alert type="info" title="Data Sources">
        Drug information is sourced from RxNorm (National Library of Medicine), FDA's DailyMed database, 
        and our curated database of oncology medications. Data is regularly updated to ensure accuracy.
      </Alert>
    </div>
  );
};

export default DrugSearch;