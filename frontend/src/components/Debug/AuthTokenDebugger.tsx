import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, RefreshCw, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import Card from '../UI/Card';
import { useAuth } from '../../context/AuthContext';
import { forceRefreshAndTest } from '../../utils/tokenRefresh';

const AuthTokenDebugger: React.FC = () => {
  const { state } = useAuth();
  const [showTokens, setShowTokens] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeTokens = () => {
    setLoading(true);
    try {
      const supabaseTokens = localStorage.getItem('osrx_auth_tokens');
      const backendJwt = localStorage.getItem('osrx_backend_jwt');
      
      let supabaseData = null;
      let backendData = null;
      
      // Parse Supabase tokens
      if (supabaseTokens) {
        try {
          const parsed = JSON.parse(supabaseTokens);
          const token = parsed.access_token;
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            supabaseData = {
              token: token,
              payload: payload,
              expires: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown',
              isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false
            };
          }
        } catch (e) {
          supabaseData = { error: 'Failed to parse Supabase token' };
        }
      }

      // Parse backend JWT
      if (backendJwt) {
        try {
          const parsed = JSON.parse(backendJwt);
          const token = parsed.token;
          if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            backendData = {
              token: token,
              payload: payload,
              expires: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Unknown',
              isExpired: payload.exp ? Date.now() > payload.exp * 1000 : false
            };
          }
        } catch (e) {
          backendData = { error: 'Failed to parse backend JWT' };
        }
      }

      setDebugInfo({
        user: state.user,
        supabase: supabaseData,
        backend: backendData,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Token analysis failed:', error);
    }
    setLoading(false);
  };

  const testAdminEndpoint = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${debugInfo?.supabase?.token || debugInfo?.backend?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Admin endpoint test:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Admin endpoint response:', data);
      } else {
        const error = await response.text();
        console.error('Admin endpoint error:', error);
      }
    } catch (error) {
      console.error('Admin endpoint test failed:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    analyzeTokens();
  }, [state.user]);

  const formatToken = (token: string) => {
    if (!token) return 'None';
    if (!showTokens) return `${token.substring(0, 20)}...${token.substring(token.length - 10)}`;
    return token;
  };

  const getStatusIcon = (data: any) => {
    if (!data) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (data.error) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (data.isExpired) return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Authentication Token Debugger</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTokens(!showTokens)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showTokens ? 'Hide' : 'Show'} Tokens</span>
            </button>
            <button
              onClick={analyzeTokens}
              disabled={loading}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Current User State</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Email:</strong> {debugInfo.user?.email || 'Not available'}</div>
                <div><strong>Role:</strong> {debugInfo.user?.role || 'Not available'}</div>
                <div><strong>Roles Array:</strong> {debugInfo.user?.roles?.join(', ') || 'Not available'}</div>
                <div><strong>Is Authenticated:</strong> {state.isAuthenticated ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Supabase Token */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                {getStatusIcon(debugInfo.supabase)}
                <h3 className="font-medium text-gray-900">Supabase Token</h3>
              </div>
              {debugInfo.supabase ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> {debugInfo.supabase.error ? 'Error' : debugInfo.supabase.isExpired ? 'Expired' : 'Valid'}</div>
                  {debugInfo.supabase.error && <div className="text-red-600"><strong>Error:</strong> {debugInfo.supabase.error}</div>}
                  {debugInfo.supabase.payload && (
                    <>
                      <div><strong>Email:</strong> {debugInfo.supabase.payload.email}</div>
                      <div><strong>Role (metadata):</strong> {debugInfo.supabase.payload.user_metadata?.role || 'Not set'}</div>
                      <div><strong>Expires:</strong> {debugInfo.supabase.expires}</div>
                      <div><strong>Token:</strong> <code className="bg-white px-2 py-1 rounded text-xs break-all">{formatToken(debugInfo.supabase.token)}</code></div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">No Supabase token found</div>
              )}
            </div>

            {/* Backend JWT */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                {getStatusIcon(debugInfo.backend)}
                <h3 className="font-medium text-gray-900">Backend JWT</h3>
              </div>
              {debugInfo.backend ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> {debugInfo.backend.error ? 'Error' : debugInfo.backend.isExpired ? 'Expired' : 'Valid'}</div>
                  {debugInfo.backend.error && <div className="text-red-600"><strong>Error:</strong> {debugInfo.backend.error}</div>}
                  {debugInfo.backend.payload && (
                    <>
                      <div><strong>Email:</strong> {debugInfo.backend.payload.email}</div>
                      <div><strong>Role:</strong> {debugInfo.backend.payload.role || 'Not set'}</div>
                      <div><strong>Expires:</strong> {debugInfo.backend.expires}</div>
                      <div><strong>Token:</strong> <code className="bg-white px-2 py-1 rounded text-xs break-all">{formatToken(debugInfo.backend.token)}</code></div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">No backend JWT found</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={testAdminEndpoint}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                <Shield className="w-4 h-4" />
                <span>Test Admin Endpoint</span>
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              </button>
              
              <button
                onClick={forceRefreshAndTest}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>Force Refresh Tokens</span>
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Last analyzed: {debugInfo.timestamp}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AuthTokenDebugger;