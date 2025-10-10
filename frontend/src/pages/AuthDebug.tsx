import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebug: React.FC = () => {
  const { state } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Authentication Debug</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Auth State</h3>
            <div className="text-sm space-y-1">
              <div><strong>Is Authenticated:</strong> {state.isAuthenticated ? '✅ Yes' : '❌ No'}</div>
              <div><strong>Is Loading:</strong> {state.isLoading ? '⏳ Yes' : '✅ No'}</div>
              <div><strong>Error:</strong> {state.error || '✅ None'}</div>
            </div>
          </div>

          {state.user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">User Details</h3>
              <div className="text-sm space-y-1">
                <div><strong>ID:</strong> {state.user.id}</div>
                <div><strong>Email:</strong> {state.user.email}</div>
                <div><strong>Name:</strong> {state.user.firstName} {state.user.lastName}</div>
                <div><strong>Role:</strong> {state.user.role}</div>
                <div><strong>Created:</strong> {state.user.createdAt}</div>
                <div><strong>Last Login:</strong> {state.user.lastLogin}</div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Actions</h3>
            <div className="space-y-2">
              <a 
                href="/logout" 
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 mr-2"
              >
                🚪 Force Logout
              </a>
              <a 
                href="/auth" 
                className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🔑 Regular Auth
              </a>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Current URL</h3>
            <div className="text-sm">
              <div><strong>Pathname:</strong> {window.location.pathname}</div>
              <div><strong>Full URL:</strong> {window.location.href}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;