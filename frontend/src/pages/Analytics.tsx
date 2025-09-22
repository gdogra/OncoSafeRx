import React from 'react';
import RealWorldAnalytics from '../components/Analytics/RealWorldAnalytics';

const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
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
  );
};

export default Analytics;