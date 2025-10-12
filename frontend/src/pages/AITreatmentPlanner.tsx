import React from 'react';
import TreatmentPlanner from '../components/AI/TreatmentPlanner';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';
import Breadcrumbs from '../components/UI/Breadcrumbs';

const AITreatmentPlanner: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="AI Treatment Planner Page"
      fallbackMessage="The AI Treatment Planner page is temporarily unavailable."
    >
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'AI Treatment Planner' }]} />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Treatment Planner</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Revolutionary genomic-optimized treatment protocols powered by artificial intelligence and real-world evidence.
          </p>
        </div>
        
        <TreatmentPlanner />
      </div>
    </FeatureErrorBoundary>
  );
};

export default AITreatmentPlanner;
