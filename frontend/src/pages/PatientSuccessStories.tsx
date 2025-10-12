import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import Card from '../components/UI/Card';

const PatientSuccessStories: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Educational Resources', href: '/education' },
          { label: 'Patient Success Stories' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Success Stories</h1>
        <p className="text-gray-600 mt-1">Real-world experiences from patients navigating treatment and recovery.</p>
      </div>

      <Card>
        <div className="space-y-4 p-6">
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Managing side effects during chemotherapy</li>
            <li>Finding support networks that work</li>
            <li>Returning to everyday life after treatment</li>
          </ul>
          <p className="text-sm text-gray-500">This is a preview. Full stories will appear here.</p>
        </div>
      </Card>
    </div>
  );
};

export default PatientSuccessStories;
