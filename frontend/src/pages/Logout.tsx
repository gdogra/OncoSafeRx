import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Logout: React.FC = () => {
  const { actions } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('🚪 Starting forced logout...');
        
        // 1. Clear Supabase session
        await supabase.auth.signOut();
        console.log('✅ Supabase signOut complete');
        
        // 2. Clear local auth context
        actions.logout();
        console.log('✅ AuthContext logout complete');
        
        // 3. Clear all local storage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Browser storage cleared');
        
        // 4. Wait a moment then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to auth page...');
          window.location.href = '/auth'; // Force page reload
        }, 1000);
        
      } catch (error) {
        console.error('❌ Logout error:', error);
        // Force redirect anyway
        setTimeout(() => {
          window.location.href = '/auth';
        }, 1000);
      }
    };

    performLogout();
  }, [actions, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">🚪 Logging Out...</h1>
        <p className="text-gray-600 mb-4">Clearing all authentication data...</p>
        
        <div className="bg-gray-100 rounded-lg p-4 text-left text-sm mb-4">
          <div className="font-medium text-gray-900 mb-2">Logout Steps:</div>
          <div className="space-y-1 text-gray-600">
            <div>✓ Clearing Supabase session</div>
            <div>✓ Clearing AuthContext</div>
            <div>✓ Clearing browser storage</div>
            <div>✓ Redirecting to auth page</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Check browser console for detailed logs
        </p>
      </div>
    </div>
  );
};

export default Logout;