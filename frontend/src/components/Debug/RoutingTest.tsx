import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RoutingTest: React.FC = () => {
  const location = useLocation();
  const { state: authState } = useAuth();
  const { user } = authState;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Routing Debug Information</h1>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Location</h3>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p><strong>Pathname:</strong> {location.pathname}</p>
              <p><strong>Search:</strong> {location.search}</p>
              <p><strong>Hash:</strong> {location.hash}</p>
              <p><strong>State:</strong> {JSON.stringify(location.state)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current User</h3>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p><strong>Is Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
              {user && (
                <>
                  <p><strong>User ID:</strong> {user.id}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Test Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <Link 
                to="/visitor-analytics" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center"
              >
                Visit Analytics
              </Link>
              <Link 
                to="/" 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center"
              >
                Dashboard
              </Link>
              <Link 
                to="/search" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
              >
                Search
              </Link>
              <Link 
                to="/interactions" 
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-center"
              >
                Interactions
              </Link>
              <Link 
                to="/protocols" 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center"
              >
                Protocols
              </Link>
              <Link 
                to="/nonexistent-route" 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center"
              >
                Test 404
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Browser Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <p><strong>URL:</strong> {window.location.href}</p>
              <p><strong>Origin:</strong> {window.location.origin}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutingTest;