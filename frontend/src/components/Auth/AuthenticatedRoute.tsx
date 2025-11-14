import React, { Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import ClinicalLandingPage from '../../pages/ClinicalLandingPage';
import Layout from '../Layout/Layout';

// Lazy load dashboard to avoid circular imports
const Dashboard = React.lazy(() => import('../../pages/Dashboard'));

const AuthenticatedRoute: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated } = state;

  // Show clinical landing page to unauthenticated users
  if (!isAuthenticated) {
    return <ClinicalLandingPage />;
  }

  // Show dashboard to authenticated users
  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>}>
        <Dashboard />
      </Suspense>
    </Layout>
  );
};

export default AuthenticatedRoute;