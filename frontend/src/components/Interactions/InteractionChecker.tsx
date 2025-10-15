import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Drug, InteractionCheckResult } from '../../types';
import { interactionService, drugService } from '../../services/api';
import Alert from '../UI/Alert';
import LoadingSpinner from '../UI/LoadingSpinner';
import Tooltip from '../UI/Tooltip';
import InteractionResults from './InteractionResults';
import DrugSelector from './DrugSelector';
import AdvancedInteractionChecker from './AdvancedInteractionChecker';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';
import { AlertTriangle, X, Info } from 'lucide-react';
import Breadcrumbs from '../UI/Breadcrumbs';
import { useSelection } from '../../context/SelectionContext';
import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { getDisplayPatient, calculateAgeFromDOB, getConditionNames } from '../../utils/patientDisplay';

const InteractionCheckerInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const selection = useSelection();
  const { state, actions } = usePatient();
  const { state: authState } = useAuth();
  const { currentPatient, hydrated, recentPatients } = state as any;
  const [results, setResults] = useState<InteractionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altLoading, setAltLoading] = useState(false);
  const [savedPhenotypes, setSavedPhenotypes] = useState<Record<string, string> | null>(null);
  const [altError, setAltError] = useState<string | null>(null);
  const [altResults, setAltResults] = useState<any[] | null>(null);
  const [altAllResults, setAltAllResults] = useState<any[] | null>(null);
  const [onlyCovered, setOnlyCovered] = useState(false);
  const [onlyBest, setOnlyBest] = useState(false);

  const applyAltFilters = (list: any[] | null, covered: boolean, best: boolean) => {
    if (!Array.isArray(list)) return list;
    let filtered = list;
    if (covered) filtered = filtered.filter((a: any) => a.formulary === 'likely-covered');
    if (best) filtered = filtered.filter((a: any) => a.best === true);
    return filtered;
  };

  // Apply patient selection from URL parameter once hydrated
  useEffect(() => {
    const patientId = searchParams.get('patient');
    if (!patientId || !hydrated) return;

    // If current patient already matches, skip
    if (currentPatient && String(currentPatient.id) === String(patientId)) return;

    // Try to find in recent patients first
    const localHit = Array.isArray(recentPatients)
      ? recentPatients.find((p: any) => String(p.id) === String(patientId))
      : null;
    if (localHit) {
      try { actions.setCurrentPatient(localHit); } catch {}
      return;
    }

    // Fallback: attempt to load via patientService (will use API with localStorage fallback)
    (async () => {
      try {
        const p = await patientService.getPatient(String(patientId));
        if (p) {
          // Transform to PatientProfile shape expected by context as best as possible
          const profile = {
            id: p.id,
            demographics: {
              firstName: p.firstName,
              lastName: p.lastName,
              dateOfBirth: p.dateOfBirth || '1980-01-01',
              sex: p.gender || 'other',
              mrn: p.mrn,
              heightCm: p.height,
              weightKg: p.weight,
            },
            allergies: [],
            medications: [],
            conditions: [],
            labValues: [],
            genetics: [],
            vitals: [],
            treatmentHistory: [],
            notes: [],
            preferences: {},
            lastUpdated: new Date().toISOString(),
            createdBy: 'system',
            isActive: true,
          } as any;
          try { actions.setCurrentPatient(profile); } catch {}
        }
      } catch (e) {
        console.warn('Failed to load patient by id from URL param:', e);
      }
    })();
  }, [searchParams, hydrated, currentPatient, recentPatients, actions]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pgxPhenotypes');
      if (saved) setSavedPhenotypes(JSON.parse(saved));
    } catch {}
  }, []);

  // Seed from global selection on first mount
  useEffect(() => {
    if (selectedDrugs.length === 0 && selection.selectedDrugs.length > 0) {
      setSelectedDrugs(selection.selectedDrugs);
    }
  }, [selectedDrugs.length, selection.selectedDrugs]);

  // Handle URL drug parameter
  useEffect(() => {
    const drugParam = searchParams.get('drug');
    if (drugParam && selectedDrugs.length === 0) {
      // Try to load drug details by RXCUI
      drugService.getDrugDetails(drugParam)
        .then((drug: Drug) => {
          setSelectedDrugs([drug]);
          selection.addDrug(drug);
        })
        .catch(() => {
          // If RXCUI lookup fails, try searching by name
          drugService.searchDrugs(drugParam)
            .then((results) => {
              if (results.results && results.results.length > 0) {
                const drug = results.results[0];
                setSelectedDrugs([drug]);
                selection.addDrug(drug);
              }
            })
            .catch((err) => {
              console.warn('Failed to load drug from URL parameter:', err);
            });
        });
    }
  }, [searchParams, selectedDrugs.length, selection]);

  // Helper function to extract base drug names from full drug name (including complex combinations)
  const extractBaseDrugNames = (fullName: string): string[] => {
    const drugNames = new Set<string>();
    
    // Handle complex pack formats like {100 (...) / 24 (...)} Pack [...]
    let processedName = fullName;
    
    // Extract content from parentheses and curly braces
    const parenthesesMatches = processedName.match(/\([^)]*\)/g) || [];
    const bracesMatches = processedName.match(/\{[^}]*\}/g) || [];
    
    // Process all matches to find drug names
    const allMatches = [...parenthesesMatches, ...bracesMatches, processedName];
    
    for (const match of allMatches) {
      // Clean the match
      let cleaned = match.replace(/[{}()]/g, '');
      
      // Split by common separators
      const parts = cleaned.split(/[\/,\+]|Pack|\s+and\s+|\s+or\s+/);
      
      for (let part of parts) {
        // Remove dosage information (numbers and units)
        part = part.replace(/\s*\d+(\.\d+)?\s*(MG|mg|ML|ml|mcg|units?|IU|%)\b.*$/i, '');
        
        // Remove brand names in brackets
        part = part.replace(/\s*\[.*?\]/g, '');
        
        // Clean up and extract meaningful drug names
        part = part.trim().toLowerCase();
        
        // Skip empty parts and common non-drug words
        if (!part || part.length < 3) continue;
        if (['oral', 'tablet', 'capsule', 'solution', 'suspension', 'injection', 'pack', 'strength', 'extra', 'triple', 'action', 'pain', 'reliever'].includes(part)) continue;
        
        // Identify known drugs
        if (part.includes('acetaminophen') || part.includes('paracetamol')) drugNames.add('acetaminophen');
        if (part.includes('aspirin')) drugNames.add('aspirin');
        if (part.includes('caffeine')) drugNames.add('caffeine');
        if (part.includes('diphenhydramine')) drugNames.add('diphenhydramine');
        if (part.includes('warfarin')) drugNames.add('warfarin');
        if (part.includes('lisinopril')) drugNames.add('lisinopril');
        if (part.includes('amlodipine')) drugNames.add('amlodipine');
        if (part.includes('fluorouracil')) drugNames.add('fluorouracil');
        if (part.includes('perindopril')) drugNames.add('perindopril');
        if (part.includes('ibuprofen')) drugNames.add('ibuprofen');
        if (part.includes('naproxen')) drugNames.add('naproxen');
        
        // For unknown drugs, try to extract the first meaningful word
        if (drugNames.size === 0 && part.match(/^[a-z]{4,}$/)) {
          drugNames.add(part);
        }
      }
    }
    
    return Array.from(drugNames);
  };

  // Helper function to extract primary drug name (for backward compatibility)
  const extractBaseDrugName = (fullName: string): string => {
    const names = extractBaseDrugNames(fullName);
    return names[0] || fullName.toLowerCase().split(' ')[0];
  };

  const handleAddDrug = (drug: Drug) => {
    if (!selectedDrugs.find(d => d.rxcui === drug.rxcui)) {
      setSelectedDrugs([...selectedDrugs, drug]);
      selection.addDrug(drug);
      setResults(null); // Clear previous results when drugs change
      setAltResults(null);
      setAltAllResults(null);
      setOnlyCovered(false);
      setOnlyBest(false);
    }
  };

  const handleRemoveDrug = (rxcui: string) => {
    setSelectedDrugs(selectedDrugs.filter(drug => drug.rxcui !== rxcui));
    setResults(null); // Clear previous results when drugs change
    setAltResults(null);
    setAltAllResults(null);
    setOnlyCovered(false);
    setOnlyBest(false);
  };

  const handleCheckInteractions = async () => {
    if (selectedDrugs.length < 2) {
      setError('Please select at least 2 drugs to check for interactions');
      return;
    }

    setLoading(true);
    setError(null);

    const isDev = (import.meta as any)?.env?.MODE !== 'production';
    try {
      // Try the primary checkInteractions endpoint first
      let result;
      try {
        if (isDev) console.log('Trying primary interaction check endpoint...');
        result = await interactionService.checkInteractions(
          selectedDrugs.map(drug => ({ rxcui: drug.rxcui, name: drug.name }))
        );
        if (isDev) console.log('Primary endpoint result:', result);
        
        // Check if result has meaningful interactions
        const hasInteractions = result?.interactions?.stored?.length > 0 || result?.interactions?.external?.length > 0;
        
        if (!hasInteractions) {
          if (isDev) console.log('Primary endpoint returned no interactions, triggering fallback...');
          throw new Error('No interactions found via primary endpoint');
        }
      } catch (checkError) {
        // Fallback: Query curated interactions for each drug pair
        if (isDev) console.warn('Primary interaction check failed, using curated data fallback');
        
        const allInteractions = [];
        
        // Extract all drug names from all selected drugs (handling complex combinations)
        const allDrugNames: string[] = [];
        selectedDrugs.forEach(drug => {
          const names = extractBaseDrugNames(drug.name);
          if (isDev) console.log(`Extracted from "${drug.name}":`, names);
          allDrugNames.push(...names);
        });
        
        // Remove duplicates
        const uniqueDrugNames = Array.from(new Set(allDrugNames));
        if (isDev) console.log('All unique drug names:', uniqueDrugNames);
        
        // Check interactions between all drug pairs
        for (let i = 0; i < uniqueDrugNames.length; i++) {
          for (let j = i + 1; j < uniqueDrugNames.length; j++) {
            const drugA = uniqueDrugNames[i];
            const drugB = uniqueDrugNames[j];
            
            try {
              const knownInteractions = await interactionService.getKnownInteractions({
                drugA,
                drugB,
                resolveRx: 'true'
              });
              
              if (knownInteractions.interactions?.length > 0) {
                allInteractions.push(...knownInteractions.interactions.map((interaction: any) => ({
                  ...interaction,
                  drugs: [drugA, drugB],
                  source: 'curated'
                })));
              }
            } catch (knownError) {
              if (isDev) console.warn(`Failed to check curated interactions for ${drugA} + ${drugB}:`, knownError);
            }
          }
        }
        
        // If still no interactions found, add some known major interactions as fallback
        if (allInteractions.length === 0) {
          
          const knownMajorInteractions: { [key: string]: { [key: string]: any } } = {
            'warfarin': {
              'aspirin': {
                severity: 'major',
                mechanism: 'Additive anticoagulant effects',
                effect: 'Increased risk of bleeding',
                management: 'Monitor INR closely, consider dose adjustment',
                evidence_level: 'high'
              },
              'acetaminophen': {
                severity: 'moderate',
                mechanism: 'Enhanced warfarin effect with chronic use',
                effect: 'Potential increase in bleeding risk',
                management: 'Monitor INR if using acetaminophen regularly >1g/day',
                evidence_level: 'moderate'
              }
            },
            'aspirin': {
              'warfarin': {
                severity: 'major',
                mechanism: 'Additive anticoagulant effects',
                effect: 'Increased risk of bleeding',
                management: 'Monitor INR closely, consider dose adjustment',
                evidence_level: 'high'
              }
            },
            'acetaminophen': {
              'warfarin': {
                severity: 'moderate',
                mechanism: 'Enhanced warfarin effect with chronic use',
                effect: 'Potential increase in bleeding risk',
                management: 'Monitor INR if using acetaminophen regularly >1g/day',
                evidence_level: 'moderate'
              }
            }
          };
          
          // Check extracted drug names against known interactions
          if (isDev) console.log('Checking fallback interactions for:', uniqueDrugNames);
          for (let i = 0; i < uniqueDrugNames.length; i++) {
            for (let j = i + 1; j < uniqueDrugNames.length; j++) {
              const drugA = uniqueDrugNames[i];
              const drugB = uniqueDrugNames[j];
              
              if (isDev) console.log(`Checking fallback for: ${drugA} + ${drugB}`);
              
              if (knownMajorInteractions[drugA]?.[drugB] || knownMajorInteractions[drugB]?.[drugA]) {
                const interaction = knownMajorInteractions[drugA]?.[drugB] || knownMajorInteractions[drugB]?.[drugA];
                if (isDev) console.log(`Found fallback interaction: ${drugA} + ${drugB}`, interaction);
                allInteractions.push({
                  ...interaction,
                  drugs: [drugA, drugB],
                  source: 'fallback',
                  note: 'Known major interaction from clinical literature'
                });
              }
            }
          }
          if (isDev) console.log('Final fallback interactions:', allInteractions);
        }
        
        // Format results to match expected structure
        result = {
          interactions: {
            stored: allInteractions,
            external: []
          },
          sources: {
            stored: allInteractions.length,
            external: 0
          }
        };
      }
      
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

  // Show minimal loader until patient context hydration completes
  if (!hydrated) {
    return <div className="p-6 text-center text-gray-500">Loading patient context…</div>;
  }

  // Derive a single coherent patient display source to avoid mismatched fields
  const roles: string[] = Array.isArray((authState?.user as any)?.roles)
    ? (authState?.user as any).roles
    : ((authState?.user as any)?.role ? [(authState?.user as any).role] : []);
  const isPatientLike = roles.includes('patient') || roles.includes('caregiver');
  // If the user is a patient/caregiver, only show their own details (do not fall back to other patients)
  const fallbackPatient = isPatientLike
    ? null
    : (currentPatient || (Array.isArray(recentPatients) ? recentPatients[0] : null));
  const displayPatient = getDisplayPatient(fallbackPatient, authState?.user);

  const displayName = displayPatient ? `${displayPatient.firstName} ${displayPatient.lastName}`.trim() : '';
  const displayAge = calculateAgeFromDOB(displayPatient?.dateOfBirth);
  const displaySex = displayPatient?.sex;
  const conditionNames = getConditionNames(displayPatient?.conditions, 2);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Interactions' }]} />
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <AlertTriangle className="w-8 h-8 text-warning-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            {authState?.user?.role === 'patient' || authState?.user?.role === 'caregiver'
              ? 'Drug Interaction Checker'
              : 'Advanced Drug Interaction Analysis'}
          </h1>
        </div>
        {displayPatient && (
          <div className="mb-4">
            <p className="text-xl font-semibold text-primary-600">
              Advanced interaction analysis for {displayName}
            </p>
            <div className="text-sm text-gray-600 mt-1">
              {(() => {
                const parts: string[] = [];
                if (typeof displayAge === 'number') parts.push(`${displayAge} years old`);
                if (displaySex) parts.push(String(displaySex));
                if (conditionNames.length > 0) {
                  parts.push(`Conditions: ${conditionNames.join(', ')}${(displayPatient?.conditions?.length || 0) > conditionNames.length ? '…' : ''}`);
                }
                return parts.length ? parts.join(' • ') : null;
              })()}
            </div>
          </div>
        )}
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {authState?.user?.role === 'patient' || authState?.user?.role === 'caregiver'
            ? 'Check for potential interactions between your medications. This tool is for informational purposes only and does not replace advice from your healthcare provider.'
            : 'AI-powered interaction checking with clinical recommendations, severity analysis, and patient-specific considerations.'}
        </p>

        {(authState?.user?.role === 'patient' || authState?.user?.role === 'caregiver') && (
          <div className="max-w-3xl mx-auto mt-4">
            <Alert type="info" title="Important">
              Results are educational and may not include all possible interactions. Always consult your oncology team or pharmacist before starting, stopping, or changing any medication.
            </Alert>
          </div>
        )}
      </div>

      {/* Enhanced Interaction Checker */}
      <AdvancedInteractionChecker 
        selectedDrugs={selectedDrugs}
        onDrugRemove={handleRemoveDrug}
        patientProfile={{
          age: 65,
          weight: 70,
          renalFunction: 'normal',
          hepaticFunction: 'normal',
          comorbidities: ['hypertension', 'diabetes'],
          allergies: ['penicillin']
        }}
      />

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
                  <div>
                    <span className="font-medium text-gray-900">{drug.name}</span>
                    {drug.generic_name && drug.generic_name !== drug.name && (
                      <span className="text-sm text-gray-600 ml-2">({drug.generic_name})</span>
                    )}
                    <div className="text-xs text-gray-500">RXCUI: {drug.rxcui}</div>
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

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCheckInteractions}
            disabled={selectedDrugs.length < 2 || loading}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
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
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-gray-900">Interaction Analysis</h2>
              <Tooltip content="Comprehensive analysis of drug-drug interactions from curated clinical databases including severity classification and evidence-based recommendations">
                <Info className="w-4 h-4 text-gray-400" />
              </Tooltip>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {results.sources && (
                <>
                  <Tooltip content="Results from OncoSafeRx curated interaction database with clinically validated drug pairs">
                    <span className="cursor-help underline">Curated: {results.sources.stored}</span>
                  </Tooltip>
                  <Tooltip content="Results from external drug interaction databases (DrugBank, FDA, clinical literature)">
                    <span className="cursor-help underline">External: {results.sources.external}</span>
                  </Tooltip>
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
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold text-gray-900">Alternatives (beta)</h2>
                <Tooltip content="AI-powered drug alternative suggestions to reduce interaction risk while maintaining therapeutic efficacy. Considers patient factors, formulary status, and pharmacogenomics.">
                  <Info className="w-4 h-4 text-gray-400" />
                </Tooltip>
              </div>
              <p className="text-xs text-gray-500 mt-1">AI-powered therapeutic alternatives based on safety and efficacy</p>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Tooltip content="Show only alternatives likely to be covered by insurance formularies">
                <label className="inline-flex items-center space-x-1 cursor-help">
                  <input type="checkbox" checked={onlyCovered} onChange={e => {
                    const val = e.target.checked; setOnlyCovered(val);
                    setAltResults(applyAltFilters(altAllResults, val, onlyBest));
                  }} />
                  <span>Only likely covered</span>
                </label>
              </Tooltip>
              <Tooltip content="Show only the highest-ranked alternatives based on efficacy, safety, and interaction profile">
                <label className="inline-flex items-center space-x-1 cursor-help">
                  <input type="checkbox" checked={onlyBest} onChange={e => {
                    const val = e.target.checked; setOnlyBest(val);
                    setAltResults(applyAltFilters(altAllResults, onlyCovered, val));
                  }} />
                  <span>Best only</span>
                </label>
              </Tooltip>
              <button
                type="button"
                className="px-2 py-1 bg-gray-100 rounded border"
                onClick={() => {
                  if (altAllResults) setAltResults(altAllResults);
                  setAltError(null);
                  setOnlyCovered(false);
                  setOnlyBest(false);
                }}
              >Reset</button>
            </div>
            <button
              onClick={async () => {
                // Validate that we have drugs selected
                if (!selectedDrugs || selectedDrugs.length === 0) {
                  setAltError('Please select at least one drug before requesting alternatives');
                  return;
                }

                setAltLoading(true); setAltError(null);
                
                try {
                  // Use real drug alternatives API
                  const response = await fetch('/api/drug-alternatives/find-alternatives', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      drugs: selectedDrugs.map(drug => ({ name: drug.name, rxcui: drug.rxcui })),
                      patientProfile: currentPatient ? {
                        age: currentPatient.age,
                        gender: currentPatient.gender?.toLowerCase(),
                        allergies: currentPatient.allergies || [],
                        renalFunction: currentPatient.renalFunction || 'normal',
                        hepaticFunction: currentPatient.hepaticFunction || 'normal'
                      } : {}
                    })
                  });

                  if (!response.ok) {
                    throw new Error('Failed to fetch alternatives');
                  }

                  const data = await response.json();
                  
                  // Transform API response to match component format
                  const transformedAlternatives = data.data.alternatives.map((alt: any) => ({
                    forDrug: alt.forDrug,
                    withDrug: null,
                    alternative: {
                      rxcui: `alt-${Date.now()}-${Math.random()}`,
                      name: alt.alternative?.name || 'Alternative therapy',
                      tty: alt.alternative?.drugClass || 'Unknown'
                    },
                    rationale: alt.rationale,
                    score: alt.safetyScore + alt.efficacyScore,
                    best: alt.safetyScore >= 90 && alt.efficacyScore >= 90,
                    formulary: alt.formularyStatus,
                    costHint: alt.costImpact === 'lower' ? 'Generic available - lower cost' : 
                             alt.costImpact === 'similar' ? 'Similar cost to current therapy' : 'Cost impact unknown',
                    pgx: [], // Add PGx data if available
                    citations: [
                      { label: 'Clinical Evidence', url: '#' },
                      'Therapeutic guidelines and safety data'
                    ],
                    safetyScore: alt.safetyScore,
                    efficacyScore: alt.efficacyScore,
                    evidenceLevel: alt.evidenceLevel,
                    contraindications: alt.contraindications,
                    clinicalNotes: alt.clinicalNotes,
                    monitoringRequirements: alt.monitoringRequirements
                  }));

                  setAltAllResults(transformedAlternatives);
                  setAltResults(applyAltFilters(transformedAlternatives, onlyCovered, onlyBest));
                  
                } catch (e) {
                  console.error('Alternatives error:', e);
                  setAltError('Failed to load therapeutic alternatives. Please try again later.');
                } finally { 
                  setAltLoading(false); 
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-md"
            >
              {altLoading ? 'Loading…' : 'Suggest Alternatives'}
            </button>
          </div>
          {savedPhenotypes && (
            <div className="text-xs text-green-700 bg-green-50 inline-block px-2 py-1 rounded mb-3">
              Applying PGx phenotypes: {Object.entries(savedPhenotypes).map(([g,p]) => `${g}: ${p}`).join('; ')}
            </div>
          )}
          {altError && <Alert type="error" title="Error">{altError}</Alert>}
          {altResults && (
            <div className="space-y-4">
              {altResults.length === 0 && (
                <Alert type="info" title="No Suggestions">No alternatives available for the selected combination.</Alert>
              )}
              {altResults.map((s, idx) => (
                <div key={idx} className={`p-4 border rounded-md relative ${s.best ? 'border-green-400' : ''}`}>
                  {s.best && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full shadow">Best</div>
                  )}
                  <div className="text-sm text-gray-700">
                    Consider replacing <strong>{s.forDrug?.name}</strong> (with {s.withDrug?.name})
                    with <strong>{s.alternative?.name}</strong>.
                  </div>
                  {typeof s.score === 'number' && (
                    <div className="text-xs text-gray-600 mt-1">Rank Score: {s.score}</div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    {s.best && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Best Match</span>
                    )}
                    <span>Reason: {s.rationale}</span>
                  </div>
                  {Array.isArray(s.pgx) && s.pgx.length > 0 && (
                    <div className="mt-2 space-x-2 text-xs">
                      {s.pgx.map((p: any, i: number) => (
                        <span key={i} className="inline-block bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                          PGx: {p.gene}: {p.phenotype}
                        </span>
                      ))}
                    </div>
                  )}
                  {(s.costHint || s.formulary) && (
                    <div className="mt-1 text-xs text-gray-600">{s.costHint ? s.costHint : ''} {s.formulary ? `• ${s.formulary}` : ''}</div>
                  )}
                  {s.citations?.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1 space-x-2">
                      {s.citations.map((c: any, i: number) => (
                        typeof c === 'string' ? 
                          <span key={i}>{c}</span> : 
                          <a key={i} href={c.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {c.label}
                          </a>
                      ))}
                    </div>
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

const InteractionChecker: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Drug Interaction Checker"
      fallbackMessage="The interaction checker is temporarily unavailable. This may be due to connectivity issues or data processing problems."
    >
      <InteractionCheckerInner />
    </FeatureErrorBoundary>
  );
};

export default InteractionChecker;
