import React, { useState } from 'react';
import { Dna, Shield, Target } from 'lucide-react';
import BiomarkerMatcher from '../components/Biomarker/BiomarkerMatcher';
import RegimenChecker from '../components/Regimen/RegimenChecker';

type Tab = 'biomarker' | 'regimen';

export default function PrecisionMedicine() {
  const [activeTab, setActiveTab] = useState<Tab>('biomarker');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Precision Medicine</h1>
          <p className="text-gray-500 mt-2">
            Evidence-based biomarker matching and regimen safety analysis
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5">
          <button
            onClick={() => setActiveTab('biomarker')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'biomarker'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Target className="h-4 w-4" />
            Biomarker Therapy Matcher
          </button>
          <button
            onClick={() => setActiveTab('regimen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'regimen'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Shield className="h-4 w-4" />
            Regimen Safety Analyzer
          </button>
        </div>

        {/* Tab content */}
        {activeTab === 'biomarker' && <BiomarkerMatcher />}
        {activeTab === 'regimen' && <RegimenChecker />}
      </div>
    </div>
  );
}
