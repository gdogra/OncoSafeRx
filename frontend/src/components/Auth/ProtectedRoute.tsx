import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRBAC } from '../../utils/rbac';
import AdminAccessDenied from '../Admin/AdminAccessDenied';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  requiredPermission?: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login'
}) => {
  const { state } = useAuth();
  const rbac = useRBAC(state.user);
  const location = useLocation();
  

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated || !state.user) {
    // Enhanced debugging for production auth issues
    console.error('🚨 ProtectedRoute: Authentication failed', {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      userRole: state.user?.role,
      currentPath: location.pathname,
      authState: state
    });
    
    // Redirect to auth page, saving the attempted location
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check permission-based access first (preferred)
  if (requiredPermission) {
    if (!rbac.hasPermission(requiredPermission)) {
      if (location.pathname.startsWith('/admin')) {
        return <AdminAccessDenied />;
      }
      try { (window as any)?.showToast?.('error', 'Access denied'); } catch {}
      return <Navigate to="/" replace />;
    }
  } 
  // Fallback to role-based access (legacy)
  else if (requiredRole) {
    // Optional controlled bypass via env (default: off)
    const emergencyBypass = String((import.meta as any)?.env?.VITE_AUTH_EMERGENCY_BYPASS || '').toLowerCase() === 'true';

    // Primary check on user.role (the main role field)
    const hasRequiredRole = requiredRole.includes(state.user.role);
    
    // Enhanced debugging for production
    console.log('🔍 ProtectedRoute Debug v3.0 EMERGENCY:', {
      requiredRole,
      userRole: state.user.role,
      hasRequiredRole,
      emergencyBypass,
      hostname: window.location.hostname,
      userObject: state.user,
      currentPath: location.pathname
    });
    
    // Optional: allow access only if explicitly enabled via env
    if (emergencyBypass) {
      console.warn('⚠️ AUTH BYPASS ENABLED via VITE_AUTH_EMERGENCY_BYPASS');
      return <>{children}</>;
    }
    
    if (!hasRequiredRole) {
      if (location.pathname.startsWith('/admin')) {
        return <AdminAccessDenied />;
      }
      try { (window as any)?.showToast?.('error', 'Access denied'); } catch {}
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
