import React from 'react';
import PracticeROIDashboard from '../components/Analytics/PracticeROIDashboard';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const PracticeROI: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Practice ROI Page"
      fallbackMessage="The Practice ROI page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Practice Analytics & ROI</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive precision medicine implementation impact analysis with financial ROI and performance benchmarking.
          </p>
        </div>
        
        <PracticeROIDashboard />
      </div>
    </FeatureErrorBoundary>
  );
};

export default PracticeROI;