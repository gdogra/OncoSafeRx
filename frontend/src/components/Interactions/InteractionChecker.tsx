import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drug, InteractionCheckResult } from '../../types';
import { interactionService } from '../../services/api';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';
import InteractionResults from './InteractionResults';
import DrugSelector from './DrugSelector';
import { AlertTriangle, Plus, X } from 'lucide-react';

const InteractionChecker: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [results, setResults] = useState<InteractionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.find(d => d.rxcui === drug.rxcui)) {
      setSelectedDrugs([...selectedDrugs, drug]);
      setResults(null); // Clear previous results when drugs change
    }
  };

  const handleRemoveDrug = (rxcui: string) => {
    setSelectedDrugs(selectedDrugs.filter(drug => drug.rxcui !== rxcui));
    setResults(null); // Clear previous results when drugs change
  };

  const handleCheckInteractions = async () => {
    if (selectedDrugs.length < 2) {
      setError('Please select at least 2 drugs to check for interactions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await interactionService.checkInteractions(
        selectedDrugs.map(drug => drug.rxcui)
      );
      setResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check interactions');
    } finally {
      setLoading(false);
    }
  };

  const getTotalInteractions = () => {
    if (!results) return 0;
    return results.interactions.stored.length + results.interactions.external.length;
  };

  const getHighestSeverity = () => {
    if (!results) return null;
    
    const allInteractions = [...results.interactions.stored, ...results.interactions.external];
    const severities = allInteractions.map(i => i.severity);
    
    if (severities.includes('major')) return 'major';
    if (severities.includes('moderate')) return 'moderate';
    if (severities.includes('minor')) return 'minor';
    return 'unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <AlertTriangle className="w-8 h-8 text-warning-600" />
          <h1 className="text-3xl font-bold text-gray-900">Drug Interaction Checker</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Check for potential interactions between multiple medications. Add drugs to your list and analyze their compatibility.
        </p>
      </div>

      {/* Drug Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Medications</h2>
        
        <DrugSelector onDrugSelect={handleAddDrug} />
        
        {/* Selected Drugs List */}
        {selectedDrugs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Selected Drugs ({selectedDrugs.length})
            </h3>
            <div className="space-y-2">
              {selectedDrugs.map((drug) => (
                <div
                  key={drug.rxcui}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {selectedDrugs.indexOf(drug) + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{drug.name}</p>
                      <p className="text-sm text-gray-500">RXCUI: {drug.rxcui}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDrug(drug.rxcui)}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={handleCheckInteractions}
            disabled={selectedDrugs.length < 2 || loading}
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="border-white" />
                <span>Checking Interactions...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Check for Interactions</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              if (selectedDrugs.length >= 2) {
                const a = selectedDrugs[0]?.name || '';
                const b = selectedDrugs[1]?.name || '';
                const params = new URLSearchParams({ drugA: a, drugB: b, resolveRx: 'true' });
                navigate({ pathname: '/curated', search: `?${params.toString()}` });
              }
            }}
            disabled={selectedDrugs.length < 2}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>See Curated Pairs</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert type="error" title="Interaction Check Failed">
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      {results && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Interaction Analysis</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {results.sources && (
                <>
                  <span>Stored: {results.sources.stored}</span>
                  <span>External: {results.sources.external}</span>
                </>
              )}
            </div>
          </div>

          {getTotalInteractions() === 0 ? (
            <Alert type="success" title="No Interactions Found">
              No known interactions were found between the selected medications. However, always consult with a healthcare professional before taking multiple medications.
            </Alert>
          ) : (
            <Alert 
              type={getHighestSeverity() === 'major' ? 'error' : getHighestSeverity() === 'moderate' ? 'warning' : 'info'}
              title={`${getTotalInteractions()} Interaction${getTotalInteractions() !== 1 ? 's' : ''} Found`}
            >
              {getHighestSeverity() === 'major' && 'Critical interactions detected. Consult healthcare provider immediately.'}
              {getHighestSeverity() === 'moderate' && 'Moderate interactions found. Review with healthcare provider.'}
              {getHighestSeverity() === 'minor' && 'Minor interactions detected. Monitor for side effects.'}
              {getHighestSeverity() === 'unknown' && 'Interactions found with unknown severity. Consult healthcare provider.'}
            </Alert>
          )}
        </div>
      )}

      {/* Detailed Results */}
      {results && <InteractionResults results={results} />}
    </div>
  );
};

export default InteractionChecker;
