import React from 'react';
import OutcomePredictorComponent from '../components/AI/OutcomePredictor';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const OutcomePredictor: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Outcome Predictor Page"
      fallbackMessage="The Outcome Predictor page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Outcome Predictor</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered survival curves, quality of life predictions, and biomarker trajectories with probability analysis.
          </p>
        </div>
        
        <OutcomePredictorComponent />
      </div>
    </FeatureErrorBoundary>
  );
};

export default OutcomePredictor;