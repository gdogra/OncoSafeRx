import React from 'react';
import RealTimeEvidenceEngine from '../components/Evidence/RealTimeEvidenceEngine';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';
import TipCard from '../components/UI/TipCard';

const EvidenceAnalysis: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Evidence Analysis Page"
      fallbackMessage="The Evidence Analysis page is temporarily unavailable."
    >
      <div className="space-y-6">
        <TipCard id="tip-evidence-analysis">
          Start with a keyword or drug, then use the tabs to inspect sources, live updates, synthesized analysis, and predictive models. Refresh evidence to pull the latest data.
        </TipCard>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Evidence Analysis</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Continuous AI-powered synthesis of global clinical evidence with predictive modeling and real-time updates from multiple data sources.
          </p>
        </div>
        
        <RealTimeEvidenceEngine />
      </div>
    </FeatureErrorBoundary>
  );
};

export default EvidenceAnalysis;
