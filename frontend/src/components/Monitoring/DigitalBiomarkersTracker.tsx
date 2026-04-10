import React from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

/**
 * Digital Biomarkers Tracker — placeholder.
 *
 * The previous implementation generated simulated vital signs and
 * biomarker data from Math.random(). Replaced with an honest placeholder
 * until real IoT/wearable device integration is available.
 */
export default function DigitalBiomarkersTracker() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Activity className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Digital Biomarkers</h2>
          <p className="text-sm text-gray-500">Patient-reported outcomes &amp; wearable data</p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Integration Required
          </span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Digital biomarker tracking requires integration with patient wearable devices
          or institutional IoT systems. This feature will be available once device
          connectivity is configured.
        </p>
      </div>
    </div>
  );
}
