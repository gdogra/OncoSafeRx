import React from 'react';
import RealWorldAnalytics from '../components/Analytics/RealWorldAnalytics';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import FeatureErrorBoundary from '../components/ErrorBoundary/FeatureErrorBoundary';

const Analytics: React.FC = () => {
  return (
    <FeatureErrorBoundary 
      featureName="Real-World Analytics"
      fallbackMessage="The analytics dashboard is temporarily unavailable. This may be due to data processing or connectivity issues."
    >
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]} />
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Analytics' }]} />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Real-World Analytics</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced analytics and insights from real-world evidence, treatment outcomes, and population data to drive evidence-based decisions.
          </p>
        </div>
        
        <RealWorldAnalytics 
          timeRange="6M"
          cancerType="all"
          patientCohort="all"
        />
      </div>
    </FeatureErrorBoundary>
  );
};

export default Analytics;