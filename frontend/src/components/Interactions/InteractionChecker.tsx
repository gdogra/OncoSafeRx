import React, { useState, useEffect } from 'react';
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
  const [altLoading, setAltLoading] = useState(false);
  const [savedPhenotypes, setSavedPhenotypes] = useState<Record<string, string> | null>(null);
  const [altError, setAltError] = useState<string | null>(null);
  const [altResults, setAltResults] = useState<any[] | null>(null);

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
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pgxPhenotypes');
      if (saved) setSavedPhenotypes(JSON.parse(saved));
    } catch {}
  }, []);
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
      {/* Detailed Results */}
      {results && <InteractionResults results={results} />}

      {/* Alternatives (beta) */}
      {selectedDrugs.length >= 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Alternatives (beta)</h2>
            <button
              onClick={async () => {
                setAltLoading(true); setAltError(null);
                try {
                  const alt = await interactionService.getKnownInteractions(); // placeholder to preserve import
                } catch {}
                try {
                  const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/alternatives/suggest`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drugs: selectedDrugs.map(d => d.rxcui), phenotypes: savedPhenotypes || {} })
                  });
                  if (!resp.ok) throw new Error(`Alt API ${resp.status}`);
                  const data = await resp.json();
                  setAltResults(data.suggestions || []);
                } catch (e) {
                  setAltError(e instanceof Error ? e.message : 'Failed to load alternatives');
                } finally { setAltLoading(false); }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
            >
              {altLoading ? 'Loading…' : 'Suggest Alternatives'}
            </button>
          </div>
          {savedPhenotypes && (
            <div className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded mb-3">Applying PGx phenotypes: {Object.entries(savedPhenotypes).map(([g,p]) => `${g}: ${p}`).join('; ')}</div>
          )}
          {altError && <Alert type="error" title="Error">{altError}</Alert>}
          {altResults && (
            <div className="space-y-4">
              {altResults.length === 0 && (
                <Alert type="info" title="No Suggestions">No alternatives available for the selected combination.</Alert>
              )}
              {altResults.map((s, idx) => (
                <div key={idx} className="p-4 border rounded-md">
                  <div className="text-sm text-gray-700">
                    Consider replacing <strong>{s.forDrug?.name}</strong> (with {s.withDrug?.name})
                    with <strong>{s.alternative?.name}</strong>.
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Reason: {s.rationale}</div>
                  {s.citations?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">Sources: {s.citations.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
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

      {/* Alternatives (beta) */}
      {selectedDrugs.length >= 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Alternatives (beta)</h2>
            <button
              onClick={async () => {
                setAltLoading(true); setAltError(null);
                try {
                  const alt = await interactionService.getKnownInteractions(); // placeholder to preserve import
                } catch {}
                try {
                  const resp = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/alternatives/suggest`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ drugs: selectedDrugs.map(d => d.rxcui), phenotypes: savedPhenotypes || {} })
                  });
                  if (!resp.ok) throw new Error(`Alt API ${resp.status}`);
                  const data = await resp.json();
                  setAltResults(data.suggestions || []);
                } catch (e) {
                  setAltError(e instanceof Error ? e.message : 'Failed to load alternatives');
                } finally { setAltLoading(false); }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
            >
              {altLoading ? 'Loading…' : 'Suggest Alternatives'}
            </button>
          </div>
          {altError && <Alert type="error" title="Error">{altError}</Alert>}
          {savedPhenotypes && (
            <div className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded mb-3">Applying PGx phenotypes: {Object.entries(savedPhenotypes).map(([g,p]) => `${g}: ${p}`).join('; ')}</div>
          )}
          {altResults && (
            <div className="space-y-4">
              {altResults.length === 0 && (
                <Alert type="info" title="No Suggestions">No alternatives available for the selected combination.</Alert>
              )}
              {altResults.map((s, idx) => (
                <div key={idx} className="p-4 border rounded-md">
                  <div className="text-sm text-gray-700">
                  {Array.isArray(s.pgx) && s.pgx.length > 0 && (
                    <div className="mt-2 space-x-2 text-xs">
                      {s.pgx.map((p: any, i: number) => (
                        <span key={i} className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded">PGx: {p.gene}: {p.phenotype}</span>
                      ))}
                    </div>
                  )}
                  {s.citations?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                      {s.citations.map((c: any, i: number) => (
                        typeof c === 'string' ? <span key={i}>{c}</span> : <a key={i} href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{c.label}</a>
                      ))}
                    </div>
                  )}
                  {s.citations?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">Sources: {s.citations.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InteractionChecker;
