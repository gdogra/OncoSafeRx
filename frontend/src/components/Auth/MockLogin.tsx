import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const MockLogin: React.FC = () => {
  const { state, actions } = useAuth();

  useEffect(() => {
    // Auto-login with mock user if not authenticated
    if (!state.isAuthenticated && !state.isLoading) {
      actions.login({
        email: 'demo@oncosaferx.com',
        password: 'demo'
      });
    }
  }, [state.isAuthenticated, state.isLoading, actions]);

  return null; // This component doesn't render anything
};

export default MockLogin;