import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LandingPage from '../../pages/LandingPage';
import Dashboard from '../../pages/Dashboard';
import Layout from '../Layout/Layout';

const AuthenticatedRoute: React.FC = () => {
  const { state } = useAuth();
  const { isAuthenticated } = state;

  // Show landing page to unauthenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show dashboard to authenticated users
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default AuthenticatedRoute;