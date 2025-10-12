import React from 'react';
import EnhancedGenomicsAnalysis from './EnhancedGenomicsAnalysis';
import Breadcrumbs from '../UI/Breadcrumbs';
import FeatureErrorBoundary from '../ErrorBoundary/FeatureErrorBoundary';

const GenomicsAnalysis: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Pharmacogenomics Analysis"
      fallbackMessage="The genomics analysis feature is temporarily unavailable. This may be due to data processing issues or connectivity problems."
    >
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Genomics' }]} />
        <EnhancedGenomicsAnalysis />
      </div>
    </FeatureErrorBoundary>
  );
};

export default GenomicsAnalysis;
