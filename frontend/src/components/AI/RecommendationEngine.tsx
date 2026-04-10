import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function RecommendationEngine({ patient }: { patient?: any }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">AI Recommendations</span>
      </div>
      <p className="text-sm text-amber-700 dark:text-amber-400">
        For evidence-based treatment recommendations, use the{' '}
        <a href="/precision-medicine" className="underline font-medium">Precision Medicine</a> biomarker matcher
        or the <a href="/interactions" className="underline font-medium">Interaction Checker</a>.
      </p>
    </div>
  );
}
