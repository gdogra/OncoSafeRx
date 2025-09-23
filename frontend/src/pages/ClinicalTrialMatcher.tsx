import React from 'react';
import TrialMatcher from '../components/ClinicalTrials/TrialMatcher';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const ClinicalTrialMatcher: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Clinical Trial Matcher Page"
      fallbackMessage="The Clinical Trial Matcher page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Clinical Trial Matcher</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Intelligent trial matching with automated enrollment assistance powered by machine learning and real-time data.
          </p>
        </div>
        
        <TrialMatcher />
      </div>
    </FeatureErrorBoundary>
  );
};

export default ClinicalTrialMatcher;