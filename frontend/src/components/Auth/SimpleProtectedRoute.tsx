import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '../../context/SimpleAuthContext';

interface SimpleProtectedRouteProps {
  children: React.ReactNode;
}

const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSimpleAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default SimpleProtectedRoute;