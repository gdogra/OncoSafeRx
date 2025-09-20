import React, { Suspense, lazy } from 'react';

// Lazy load the heavy map component
const TrialsMap = lazy(() => import('./TrialsMap'));

interface LazyMapProps {
  trials: any[];
  selectedTrial: any;
  onTrialSelect: (trial: any) => void;
}

const LazyMap: React.FC<LazyMapProps> = (props) => {
  return (
    <Suspense 
      fallback={
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      }
    >
      <TrialsMap {...props} />
    </Suspense>
  );
};

export default LazyMap;