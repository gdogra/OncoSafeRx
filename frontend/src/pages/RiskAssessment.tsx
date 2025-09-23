import React from 'react';
import DynamicRiskAssessment from '../components/Risk/DynamicRiskAssessment';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const RiskAssessment: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Risk Assessment Page"
      fallbackMessage="The Risk Assessment page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dynamic Risk Assessment</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered real-time safety monitoring with predictive risk modeling, automated intervention recommendations, and continuous patient safety optimization.
          </p>
        </div>
        
        <DynamicRiskAssessment />
      </div>
    </FeatureErrorBoundary>
  );
};

export default RiskAssessment;