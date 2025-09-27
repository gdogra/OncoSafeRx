import React, { useState } from 'react';
import { Drug } from '../types';
import SimpleDrugSearchNew from '../components/DrugSearch/SimpleDrugSearchNew';
import DrugCard from '../components/DrugSearch/DrugCard';
import Card from '../components/UI/Card';
import { useSelection } from '../context/SelectionContext';
import { Pill, ArrowLeft, Users } from 'lucide-react';

const DrugSearchSimple: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const selection = useSelection();

  const handleDrugSelect = (drug: Drug) => {
    console.log('🎯 Main page: Drug selected:', drug);
    setSelectedDrug(drug);
    selection.addDrug(drug);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-3">
          <Pill className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Drug Search</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search our comprehensive database of medications. Click on any drug to view details and add it to your selection.
        </p>
      </div>

      {/* Selection Status */}
      {selection.selectedDrugs.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                {selection.selectedDrugs.length} drug{selection.selectedDrugs.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selection.selectedDrugs.map((drug) => (
                <span
                  key={drug.rxcui}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {drug.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {selectedDrug ? (
        /* Drug Details View */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDrug(null)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to search</span>
          </button>
          
          <Card>
            <DrugCard
              drug={selectedDrug}
              showDetails={true}
              showTooltips={true}
            />
          </Card>
        </div>
      ) : (
        /* Search View */
        <Card>
          <SimpleDrugSearchNew
            onDrugSelect={handleDrugSelect}
            placeholder="Search for drugs (e.g., aspirin, ibuprofen, pembrolizumab)..."
            maxResults={20}
          />
        </Card>
      )}

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-2">Debug Information:</div>
          <div>• Selected drugs: {selection.selectedDrugs.length}</div>
          <div>• Current view: {selectedDrug ? 'Drug details' : 'Search'}</div>
          <div>• API endpoint: https://oncosaferx.onrender.com/api</div>
        </div>
      </Card>
    </div>
  );
};

export default DrugSearchSimple;