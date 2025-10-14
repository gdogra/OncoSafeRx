import React from 'react';
import Breadcrumbs from '../components/UI/Breadcrumbs';
import AuthTokenDebugger from '../components/Debug/AuthTokenDebugger';

const TokenDebug: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Home', href: '/' }, 
        { label: 'Debug', href: '/debug-routing' }, 
        { label: 'Token Debug' }
      ]} />
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Authentication Token Debug</h1>
        <p className="text-gray-600 mt-1">Analyze JWT tokens and authentication state for troubleshooting</p>
      </div>

      <AuthTokenDebugger />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">How to use this tool:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Check if your user role is correctly set in the "Current User State" section</li>
          <li>• Verify that tokens are not expired and contain the expected role information</li>
          <li>• Use "Test Admin Endpoint" to verify if the current tokens work with admin APIs</li>
          <li>• Check browser console for detailed error messages and API responses</li>
          <li>• If backend JWT is missing or invalid, try logging out and back in</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenDebug;