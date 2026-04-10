import React from 'react';
import { Smartphone, AlertTriangle } from 'lucide-react';

export default function IoTMonitoringSystem() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">IoT Device Monitoring</h2>
          <p className="text-sm text-gray-500">Connected health device data</p>
        </div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-300">Device Integration Required</span>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400">
          IoT monitoring requires connectivity with patient health devices. This feature will display
          real-time vitals once device APIs are configured.
        </p>
      </div>
    </div>
  );
}
