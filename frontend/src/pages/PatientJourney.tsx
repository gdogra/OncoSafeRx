import React from 'react';
import PatientTimeline from '../components/Patient/PatientTimeline';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const PatientJourney: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Patient Journey Page"
      fallbackMessage="The Patient Journey page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Patient Timeline & Journey</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            AI-powered treatment journey visualization with outcome predictions and personalized milestone tracking.
          </p>
        </div>
        
        <PatientTimeline />
      </div>
    </FeatureErrorBoundary>
  );
};

export default PatientJourney;