import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * Drug Safety Alert System — placeholder.
 *
 * The previous implementation generated simulated safety alerts
 * from Math.random(). Replaced with an honest placeholder that
 * directs users to the real FAERS-powered safety tools.
 */
export default function DrugSafetyAlertSystem() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Drug Safety Alerts</h2>
          <p className="text-sm text-gray-500">Real-time safety monitoring</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Use Evidence-Based Safety Tools
          </span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          For real-world drug safety data, use the{' '}
          <a href="/precision-medicine" className="underline font-medium">Regimen Safety Analyzer</a>{' '}
          which checks interactions, cumulative toxicity, and PGx alerts using FDA FAERS
          and CPIC evidence.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a href="/interactions" className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interaction Checker</span>
        </a>
        <a href="/precision-medicine" className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Precision Medicine</span>
        </a>
      </div>
    </div>
  );
}
