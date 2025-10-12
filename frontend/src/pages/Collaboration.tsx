import React from 'react';
import CollaborationDashboard from '../components/Collaboration/CollaborationDashboard';
import Breadcrumbs from '../components/UI/Breadcrumbs';

const Collaboration: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Collaboration' }]} />
      <CollaborationDashboard />
    </div>
  );
};

export default Collaboration;