import React from 'react';
import { Lock, ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminAccessDenied: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-xl w-full text-center">
        <Lock className="w-10 h-10 text-red-600 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
        <p className="text-gray-600 mb-4">Your account does not have access to this administrative page.</p>
        <div className="text-left text-sm bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
          <p className="font-medium text-gray-800 mb-1">If you believe you should have access, ask an admin to verify:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Your role in Supabase user metadata is <code>admin</code> or <code>super_admin</code></li>
            <li>Server env has <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> set</li>
            <li>Admin API is healthy (no 401/403)</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800 text-white hover:bg-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <Link to="/admin/auth-diagnostics" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50">
            <Terminal className="w-4 h-4" />
            Auth Diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDenied;

