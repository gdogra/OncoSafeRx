import React from 'react';
import EnhancedGenomicsAnalysis from './EnhancedGenomicsAnalysis';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

const GenomicsAnalysis: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Pharmacogenomics Analysis"
      fallbackMessage="The genomics analysis feature is temporarily unavailable. This may be due to data processing issues or connectivity problems."
    >
      <EnhancedGenomicsAnalysis />
    </FeatureErrorBoundary>
  );
};

export default GenomicsAnalysis;
