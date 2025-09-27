import React, { useState, useEffect, useMemo } from 'react';
import { Drug, InteractionCheckResult } from '../types';
import { drugService, interactionService } from '../services/api';
import AutocompleteSearch from '../components/DrugSearch/AutocompleteSearch';
import InteractionResults from '../components/Interactions/InteractionResults';
import AdvancedInteractionChecker from '../components/Interactions/AdvancedInteractionChecker';
import DrugCard from '../components/DrugSearch/DrugCard';
import DrugSelectionTable from '../components/DrugSearch/DrugSelectionTable';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';
import { 
  Search, 
  Plus, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Shield, 
  Users,
  Clock,
  Pill,
  Target,
  Activity,
  Brain,
  Info,
  RefreshCw
} from 'lucide-react';
import { useSelection } from '../context/SelectionContext';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

const DroppableArea: React.FC<{ children: React.ReactNode; id: string; className?: string }> = ({ children, id, className = '' }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''} transition-all duration-200`}
    >
      {children}
    </div>
  );
};

const DrugSearchAndInteractionsInner: React.FC = () => {
  const selection = useSelection();
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interactionResults, setInteractionResults] = useState<InteractionCheckResult | null>(null);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeDrug, setActiveDrug] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Initialize with selected drugs from context
  useEffect(() => {
    if (selection.selectedDrugs.length > 0) {
      setSelectedDrugs(selection.selectedDrugs);
    }
    // Merge in any drugs stored in the local interaction basket
    try {
      const raw = localStorage.getItem('osrx_interaction_basket') || '[]';
      const basket = JSON.parse(raw) as Array<{ id: string; name: string }>;
      if (Array.isArray(basket) && basket.length) {
        const toAdd: Drug[] = basket.map(d => ({ rxcui: d.id, name: d.name, synonym: d.name, tty: 'SBD' }));
        // Avoid duplicates
        setSelectedDrugs(prev => {
          const exists = new Set(prev.map(x => x.rxcui));
          const merged = [...prev, ...toAdd.filter(d => !exists.has(d.rxcui))];
          return merged;
        });
      }
    } catch {}
  }, [selection.selectedDrugs]);

  // Auto-check interactions when drugs change
  useEffect(() => {
    if (selectedDrugs.length >= 2) {
      checkInteractions();
    } else {
      setInteractionResults(null);
      setInteractionError(null);
    }
  }, [selectedDrugs]);

  const handleDrugSelect = async (option: any) => {
    if (option.type === 'drug') {
      const drug: Drug = {
        rxcui: option.id,
        name: option.label,
        synonym: option.value,
        tty: 'SBD'
      };

      // Check if drug is already selected
      if (selectedDrugs.find(d => d.rxcui === drug.rxcui)) {
        setError(`${drug.name} is already selected`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      setSelectedDrugs(prev => [...prev, drug]);
      selection.addDrug(drug);
      setSearchQuery('');
    }
  };

  const handleDrugRemove = (rxcui: string) => {
    setSelectedDrugs(prev => prev.filter(drug => drug.rxcui !== rxcui));
    selection.removeDrug(rxcui);
  };

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return;

    setInteractionLoading(true);
    setInteractionError(null);

    try {
      const drugs = selectedDrugs.map(d => ({ rxcui: d.rxcui, name: d.name }));
      const result = await interactionService.checkInteractions(drugs);
      setInteractionResults(result);
    } catch (err) {
      setInteractionError(err instanceof Error ? err.message : 'Failed to check interactions');
    } finally {
      setInteractionLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'major':
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'moderate':
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'minor':
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getInteractionSummary = () => {
    if (!interactionResults?.interactions) return null;

    // Combine stored and external interactions
    const allInteractions = [
      ...(interactionResults.interactions.stored || []),
      ...(interactionResults.interactions.external || [])
    ];
    
    const majorCount = allInteractions.filter(i => i.severity === 'major').length;
    const moderateCount = allInteractions.filter(i => i.severity === 'moderate').length;
    const minorCount = allInteractions.filter(i => i.severity === 'minor').length;

    return { majorCount, moderateCount, minorCount, totalCount: allInteractions.length };
  };

  const summary = getInteractionSummary();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDrug(active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrug(null);

    if (!over) return;

    // Handle drag from search results to selected list
    if (over.id === 'selected-drugs-drop-zone') {
      const drugData = active.data.current;
      if (drugData && drugData.type === 'drug') {
        const drug: Drug = {
          rxcui: drugData.id,
          name: drugData.label,
          synonym: drugData.value,
          tty: 'SBD'
        };

        // Check if drug is already selected
        if (selectedDrugs.find(d => d.rxcui === drug.rxcui)) {
          setError(`${drug.name} is already selected`);
          setTimeout(() => setError(null), 3000);
          return;
        }

        setSelectedDrugs(prev => [...prev, drug]);
        selection.addDrug(drug);
      }
    }

    // Handle reordering within selected drugs
    if (over.id !== active.id && over.data.current?.sortable) {
      const oldIndex = selectedDrugs.findIndex(drug => drug.rxcui === active.id);
      const newIndex = selectedDrugs.findIndex(drug => drug.rxcui === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedDrugs = arrayMove(selectedDrugs, oldIndex, newIndex);
        setSelectedDrugs(reorderedDrugs);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Drug Search & Interaction Checker
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Search for medications and instantly check for drug-drug interactions. Build your drug list and get real-time safety analysis.
          </p>
        </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Available Drugs */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-blue-800">Available Medications</h2>
            </div>
            
            <AutocompleteSearch
              placeholder="Search and add drugs to check interactions..."
              onSelect={handleDrugSelect}
              onInputChange={setSearchQuery}
              value={searchQuery}
              loading={loading}
              maxResults={8}
              showCategories={true}
              className="w-full"
            />

            {error && (
              <Alert type="error" className="mt-4">
                {error}
              </Alert>
            )}
          </div>
        </Card>

        {/* Right Column - Selected Drugs */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Pill className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-800">Selected Medications ({selectedDrugs.length})</h2>
            </div>
            
            <DroppableArea id="selected-drugs-drop-zone" className="min-h-[200px] rounded-lg border-2 border-dashed border-green-300 p-4">
            {selectedDrugs.length > 0 ? (
              <div className="space-y-3">
                {selectedDrugs.map((drug, index) => (
                  <div key={drug.rxcui} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{drug.name}</p>
                        <p className="text-sm text-gray-500">RxCUI: {drug.rxcui}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDrugRemove(drug.rxcui)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove medication"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {selectedDrugs.length >= 2 && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={checkInteractions}
                      disabled={interactionLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      <RefreshCw className={`h-5 w-5 ${interactionLoading ? 'animate-spin' : ''}`} />
                      <span>Check Interactions</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">No medications selected</p>
                <p className="text-sm text-gray-400">Search and add medications from the left panel</p>
              </div>
            )}
            </DroppableArea>
          </div>
        </Card>
      </div>

      {/* Advanced Table View with Drag & Drop */}
      {selectedDrugs.length >= 2 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">Advanced Management</h3>
              <span className="text-sm text-gray-500">• Drag to reorder • Filter & sort</span>
            </div>
            
            <DrugSelectionTable
              drugs={selectedDrugs}
              onDrugsReorder={(reorderedDrugs) => {
                console.log('Reordering drugs:', reorderedDrugs);
                setSelectedDrugs(reorderedDrugs);
              }}
              onDrugRemove={handleDrugRemove}
              onDrugSelect={(drug) => {
                console.log('Selected drug for details:', drug);
              }}
              interactionResults={interactionResults}
              loading={interactionLoading}
            />
          </div>
        </Card>
      )}

      {/* Interaction Results Summary */}
      {selectedDrugs.length >= 2 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-medium text-gray-900">Interaction Analysis</h3>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 underline text-sm"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Analysis
              </button>
            </div>

            {interactionLoading && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Checking interactions...</p>
                </div>
              </div>
            )}

            {interactionError && (
              <Alert type="error">
                {interactionError}
              </Alert>
            )}

            {summary && !interactionLoading && (
              <div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{selectedDrugs.length}</div>
                    <div className="text-sm text-green-600">Medications</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-800">{summary.majorCount}</div>
                    <div className="text-sm text-red-600">Major Interactions</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-800">{summary.moderateCount}</div>
                    <div className="text-sm text-yellow-600">Moderate Interactions</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{summary.minorCount}</div>
                    <div className="text-sm text-blue-600">Minor Interactions</div>
                  </div>
                </div>

                {/* Interaction Results */}
                {interactionResults && (
                  <InteractionResults 
                    results={interactionResults}
                    onUpdateDrugs={setSelectedDrugs}
                  />
                )}
              </div>
            )}

            {summary?.totalCount === 0 && !interactionLoading && (
              <div className="text-center p-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">No Interactions Found</h3>
                <p className="text-green-600">
                  No significant drug-drug interactions detected between the selected medications.
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Advanced Analysis */}
      {showAdvanced && selectedDrugs.length >= 2 && (
        <AdvancedInteractionChecker
          selectedDrugs={selectedDrugs}
          onDrugRemove={handleDrugRemove}
        />
      )}

      {/* Getting Started */}
      {selectedDrugs.length === 0 && (
        <Card>
          <div className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
            <p className="text-gray-600 mb-6">
              Use the search bar above to add medications to your list. Once you have 2 or more drugs, 
              we'll automatically check for interactions and provide safety recommendations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4">
                <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Search Drugs</h4>
                <p className="text-sm text-gray-600">Type medication names to find and add them</p>
              </div>
              <div className="text-center p-4">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Check Interactions</h4>
                <p className="text-sm text-gray-600">Automatic analysis when 2+ drugs are selected</p>
              </div>
              <div className="text-center p-4">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Get Recommendations</h4>
                <p className="text-sm text-gray-600">Receive safety alerts and clinical guidance</p>
              </div>
            </div>
          </div>
        </Card>
      )}
      </div>

      <DragOverlay>
        {activeDrug ? (
          <div className="p-3 bg-white rounded-lg border border-blue-300 shadow-lg">
            <div className="flex items-center space-x-2">
              <Pill className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{activeDrug.label}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const DrugSearchAndInteractions: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Drug Search & Interactions"
      fallbackMessage="The drug search and interaction checker is temporarily unavailable."
    >
      <DrugSearchAndInteractionsInner />
    </FeatureErrorBoundary>
  );
};

export default DrugSearchAndInteractions;
