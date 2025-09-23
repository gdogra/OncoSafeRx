import React from 'react';
import AIDashboard from '../components/AI/AIDashboard';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const AIInsights: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="AI Insights Dashboard"
      fallbackMessage="The AI insights feature is temporarily unavailable. This may be due to AI service connectivity or processing issues."
    >
      <AIDashboard />
    </FeatureErrorBoundary>
  );
};

export default AIInsights;