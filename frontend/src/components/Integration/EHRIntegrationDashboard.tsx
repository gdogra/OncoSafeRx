import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

export default function EHRIntegrationDashboard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <Database className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">EHR Integration</h2>
          <p className="text-sm text-gray-500">Electronic Health Record connectivity</p>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">EHR Configuration Required</span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          EHR integration requires SMART on FHIR configuration with your institution&apos;s Epic, Cerner,
          or other FHIR-compatible EHR system. Contact your IT department to set up the connection.
        </p>
      </div>
    </div>
  );
}
