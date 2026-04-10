import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, Dna, Target, FlaskConical, Pill,
  ChevronRight, ChevronLeft, Check, ArrowRight, Stethoscope
} from 'lucide-react';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to OncoSafeRx',
    subtitle: 'Precision Oncology Decision Support',
    description: 'OncoSafeRx helps oncologists make safer, evidence-based treatment decisions. Let\'s walk through the key features.',
    icon: Stethoscope,
    color: 'blue',
  },
  {
    id: 'interactions',
    title: 'Drug Interaction Checking',
    subtitle: 'Beyond pairwise — regimen-level analysis',
    description: 'Check all pairwise interactions within a chemotherapy regimen AND against the patient\'s concomitant medications. Get cumulative toxicity alerts across 7 domains (nephrotoxicity, cardiotoxicity, myelosuppression, etc.).',
    icon: Shield,
    color: 'red',
    action: { label: 'Try Interaction Checker', path: '/interactions' },
  },
  {
    id: 'biomarkers',
    title: 'Precision Therapy Matching',
    subtitle: '40+ actionable biomarker-therapy mappings',
    description: 'Select a tumor type and detected biomarkers → see all FDA-approved targeted therapies, immunotherapy options, and matched clinical trials. Covers EGFR, ALK, BRAF, BRCA, MSI-H, TMB, HER2, KRAS, and more.',
    icon: Target,
    color: 'purple',
    action: { label: 'Try Biomarker Matcher', path: '/precision-medicine' },
  },
  {
    id: 'pgx',
    title: 'Pharmacogenomics',
    subtitle: '80+ gene-drug pairs with CPIC/FDA evidence',
    description: 'Check DPYD before fluoropyrimidines, UGT1A1 before irinotecan, CYP2D6 before tamoxifen — every CPIC Level A guideline relevant to oncology. PMID citations for every recommendation.',
    icon: Dna,
    color: 'amber',
    action: { label: 'View PGx Guidelines', path: '/genomics' },
  },
  {
    id: 'safety',
    title: 'Real-World Safety Data',
    subtitle: 'FDA FAERS adverse event intelligence',
    description: 'See the top adverse events, serious outcomes (death, hospitalization), and frequently co-reported drugs for any medication — powered by the FDA\'s FAERS database with millions of reports.',
    icon: Pill,
    color: 'orange',
    action: { label: 'Search Drugs', path: '/search' },
  },
  {
    id: 'trials',
    title: 'Clinical Trial Matching',
    subtitle: 'NCI + ClinicalTrials.gov integration',
    description: 'Find relevant clinical trials by biomarker, cancer type, and location. Biomarker-matched trials appear automatically when you use the Precision Therapy Matcher.',
    icon: FlaskConical,
    color: 'green',
    action: { label: 'Find Trials', path: '/trials' },
  },
];

/**
 * Oncologist onboarding walkthrough.
 * Shows key features with quick-start actions.
 */
export default function OncologistOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const Icon = step.icon;

  const colorClasses: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', iconBg: 'bg-blue-100 dark:bg-blue-900/30' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', iconBg: 'bg-red-100 dark:bg-red-900/30' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', iconBg: 'bg-purple-100 dark:bg-purple-900/30' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', iconBg: 'bg-amber-100 dark:bg-amber-900/30' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-100 dark:bg-orange-900/30' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800', iconBg: 'bg-green-100 dark:bg-green-900/30' },
  };

  const c = colorClasses[step.color] || colorClasses.blue;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 mb-6`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`h-6 w-6 ${c.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`text-lg font-bold ${c.text}`}>{step.title}</h3>
            <span className="text-xs text-gray-400">
              {currentStep + 1} / {STEPS.length}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{step.subtitle}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>

          {/* Action button */}
          {step.action && (
            <button
              onClick={() => navigate(step.action!.path)}
              className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${c.text} ${c.iconBg} rounded-lg hover:opacity-80 transition-opacity`}
            >
              {step.action.label}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress dots + navigation */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep ? `${c.text} scale-125` : 'bg-gray-300 dark:bg-gray-600'
              }`}
              style={i === currentStep ? { backgroundColor: 'currentColor' } : undefined}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { localStorage.setItem('oncosaferx_onboarding_dismissed', 'true'); setDismissed(true); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip tour
          </button>
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                localStorage.setItem('oncosaferx_onboarding_dismissed', 'true');
                setDismissed(true);
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg transition-colors ${
              isLast ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 dark:bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isLast ? (
              <>
                <Check className="h-3 w-3" /> Get Started
              </>
            ) : (
              <>
                Next <ChevronRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
