import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, PERMISSIONS, useRBAC } from '../../utils/rbac';

interface AdminCredentials {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [credentials, setCredentials] = useState<AdminCredentials>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { actions, state } = useAuth();
  const navigate = useNavigate();
  const rbac = useRBAC(state.user);
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const nextPath = search.get('next') || '/admin';

  // Check if user is already logged in and has admin access
  React.useEffect(() => {
    console.log('AdminLogin useEffect - Auth state:', { isAuthenticated: state.isAuthenticated, hasUser: !!state.user });
    if (state.isAuthenticated && state.user) {
      const canAccess = rbac.canAccessAdminConsole();
      console.log('AdminLogin useEffect - Can access admin console:', canAccess);
      if (canAccess) {
        console.log('AdminLogin useEffect - Navigating to', nextPath);
        navigate(nextPath);
      } else {
        console.log('AdminLogin useEffect - User lacks admin privileges');
        setError('Current user does not have administrator privileges. Please login with an admin account.');
      }
    }
  }, [state.isAuthenticated, state.user, rbac, navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use Supabase authentication
      await actions.login(credentials);
      // Navigation will be handled by useEffect after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AdminCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Console Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your administrator account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your admin email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !credentials.email || !credentials.password}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                'Sign In to Admin Console'
              )}
            </button>
          </div>
        </form>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Development Access</h3>
          <div className="space-y-2 text-xs text-blue-800">
            <div>
              <strong>Test Credentials:</strong> Use gdogra@gmail.com or demo@oncosaferx.com with any password
            </div>
            <div>
              <strong>Role:</strong> Authenticated as Oncologist with admin privileges
            </div>
            <div>
              <strong>Demo Mode:</strong> Use demo@oncosaferx.com / demo123 if VITE_ALLOW_DEMO_LOGIN is enabled
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Security Notice</p>
              <p className="mt-1">
                Admin access is logged and monitored. All administrative actions are recorded for audit purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            OncoSafeRx Admin Console • Secure Healthcare Analytics Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
