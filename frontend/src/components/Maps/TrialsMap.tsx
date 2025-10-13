import React from 'react';

interface TrialsMapProps {
  trials: any[];
  selectedTrial: any;
  onTrialSelect: (trial: any) => void;
}

// Lightweight placeholder map to satisfy lazy import and typings
const TrialsMap: React.FC<TrialsMapProps> = ({ trials = [], selectedTrial, onTrialSelect }) => {
  return (
    <div className="h-96 bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-600 mb-2">Map preview (placeholder)</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-auto h-72">
        {trials.map((t, idx) => (
          <button
            key={t?.nct_id || t?.nctId || idx}
            onClick={() => onTrialSelect?.(t)}
            className={`text-left p-2 rounded border ${selectedTrial === t ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="font-medium text-gray-900">{t?.title || 'Trial'}</div>
            <div className="text-xs text-gray-600">{t?.nct_id || t?.nctId || ''}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrialsMap;

