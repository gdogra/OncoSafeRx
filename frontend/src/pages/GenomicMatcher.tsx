import React from 'react';
import RealTimeGenomicMatcher from '../components/Genomics/RealTimeGenomicMatcher';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const GenomicMatcher: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Genomic Matcher Page"
      fallbackMessage="The Genomic Matcher page is temporarily unavailable."
    >
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Real-Time Genomic Drug Matcher</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Instant drug-gene interaction analysis with AI-powered recommendations for precision oncology.
          </p>
        </div>
        
        <RealTimeGenomicMatcher />
      </div>
    </FeatureErrorBoundary>
  );
};

export default GenomicMatcher;