import React from 'react';
import PredictiveEfficacyScoring from '../components/AI/PredictiveEfficacyScoring';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const EfficacyScoring: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Efficacy Scoring Page"
      fallbackMessage="The Efficacy Scoring page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Predictive Efficacy Scoring</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered treatment efficacy predictions with confidence intervals and multi-factor analysis.
          </p>
        </div>
        
        <PredictiveEfficacyScoring />
      </div>
    </FeatureErrorBoundary>
  );
};

export default EfficacyScoring;