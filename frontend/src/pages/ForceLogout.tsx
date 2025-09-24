import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const ForceLogout: React.FC = () => {
  const [step, setStep] = useState('Starting...');

  useEffect(() => {
    const performForceLogout = async () => {
      try {
        setStep('🔍 Checking current session...');
        const { data: session } = await supabase.auth.getSession();
        console.log('Current session:', session);
        
        setStep('🚪 Signing out from Supabase...');
        await supabase.auth.signOut({ scope: 'global' });
        console.log('Supabase signOut completed');
        
        setStep('🗑️ Clearing localStorage...');
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
            localStorage.removeItem(key);
            console.log('Removed:', key);
          }
        });
        
        setStep('🗑️ Clearing sessionStorage...');
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
            console.log('Removed:', key);
          }
        });
        
        setStep('🍪 Clearing cookies...');
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=");
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (name.includes('supabase') || name.includes('auth') || name.includes('sb-')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            console.log('Cleared cookie:', name);
          }
        });
        
        setStep('✅ Logout complete! Redirecting...');
        
        setTimeout(() => {
          window.location.replace('/auth');
        }, 2000);
        
      } catch (error) {
        console.error('Force logout error:', error);
        setStep('❌ Error during logout, but redirecting anyway...');
        setTimeout(() => {
          window.location.replace('/auth');
        }, 2000);
      }
    };

    performForceLogout();
  }, []);

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">🔥 Force Logout</h1>
        <p className="text-gray-600 mb-4">Aggressively clearing all authentication data...</p>
        
        <div className="bg-gray-100 rounded-lg p-4 text-left text-sm mb-4">
          <div className="font-mono text-xs">{step}</div>
        </div>
        
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
        
        <p className="text-xs text-gray-500">
          Check browser console for detailed logs
        </p>
      </div>
    </div>
  );
};

export default ForceLogout;