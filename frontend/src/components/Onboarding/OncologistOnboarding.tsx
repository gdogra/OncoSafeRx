import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Search, Dna, Target, FlaskConical, Pill, Bookmark,
  ChevronRight, ChevronLeft, Check, ArrowRight, Stethoscope, AlertTriangle,
  X
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  /** Concrete clinical scenario users will recognize. Rendered as a callout. */
  scenario?: string;
  /** Specific things to look for / tips on this screen. */
  tips?: string[];
  icon: React.ElementType;
  color: 'blue' | 'red' | 'purple' | 'amber' | 'orange' | 'green' | 'pink';
  action?: { label: string; path: string };
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to OncoSafeRx',
    subtitle: 'Precision oncology decision support',
    description:
      'OncoSafeRx surfaces evidence-based safety, pharmacogenomic, and trial-matching data so you can make faster, safer treatment decisions. The 60-second tour below covers everything you need.',
    scenario:
      'Designed for a busy clinic — you should be able to look up a patient question in under 30 seconds.',
    tips: [
      'Built around CPIC, FDA, NCI, and ClinicalTrials.gov source data',
      'Every recommendation cites its source (PMIDs, FDA labels, CPIC guidelines)',
      'Use ← → keys to navigate the tour, or click any step dot below',
    ],
    icon: Stethoscope,
    color: 'blue',
  },
  {
    id: 'disclaimer',
    title: 'Clinical decision support — not a replacement',
    subtitle: 'Read this once, then we move on',
    description:
      'OncoSafeRx is a decision-support tool. Every drug interaction, biomarker match, and trial recommendation here is meant to inform — not replace — your clinical judgment, institutional protocols, and discussion with the patient.',
    scenario:
      'Verify dosing in your hospital formulary. Confirm interactions with your pharmacy. Always corroborate biomarker findings with the original lab report.',
    tips: [
      'Data sources can lag real-world reporting by days to weeks',
      'Drug coverage is broad but not exhaustive — search returns "no match" sometimes',
      'A persistent banner on every clinical screen reminds you of this',
    ],
    icon: AlertTriangle,
    color: 'amber',
  },
  {
    id: 'search',
    title: 'Drug Search — your starting point',
    subtitle: 'Type any drug name to begin a workflow',
    description:
      'Search by generic or brand name. Each result has FDA-label safety, RxNorm metadata, FAERS adverse-event statistics, and shortcuts into interaction checks and biomarker matching.',
    scenario:
      'Looking up "irinotecan" pulls up the label, top 10 reported AEs from 2M+ FAERS reports, and a one-click jump into the UGT1A1 PGx guideline.',
    tips: [
      'Type-ahead matches both generic + brand names',
      'Click "Add to interaction check" to start a regimen review',
      'Click any drug result to see real-world AE frequencies',
    ],
    icon: Search,
    color: 'blue',
    action: { label: 'Open Drug Search', path: '/search' },
  },
  {
    id: 'interactions',
    title: 'Drug Interactions',
    subtitle: 'Regimen-level safety check across 7 toxicity domains',
    description:
      'Add every drug your patient is on (chemo + concomitant meds + supplements). OncoSafeRx surfaces pairwise interactions AND cumulative toxicity — additive nephrotoxicity, cardiotoxicity, myelosuppression, QT prolongation, hepatotoxicity, neurotoxicity, and bleeding risk.',
    scenario:
      'A 68-year-old on FOLFOX + warfarin + amiodarone + methotrexate gets cumulative QT + bleeding + nephrotoxicity flags before the regimen would otherwise look "fine on each pair."',
    tips: [
      'Pairwise alerts cite mechanism + clinical management',
      'Cumulative-toxicity warnings highlight which 3+ drug combinations are stacking risk',
      'Severity ranks: Major (avoid), Moderate (monitor), Minor (note)',
    ],
    icon: Shield,
    color: 'red',
    action: { label: 'Open Interaction Checker', path: '/interactions' },
  },
  {
    id: 'precision',
    title: 'Precision Therapy Matching',
    subtitle: '40+ actionable biomarker → therapy mappings',
    description:
      'Pick a tumor type, pick the biomarkers reported on the patient\'s NGS panel, and get FDA-approved targeted therapies + immunotherapy candidates + matched trials in one screen.',
    scenario:
      'NSCLC with EGFR L858R + PD-L1 50% → osimertinib (1L), then chemo+pembro options, plus 12 active trials in your region (auto-pulled from ClinicalTrials.gov).',
    tips: [
      'Covers EGFR, ALK, ROS1, BRAF, BRCA1/2, HER2, KRAS G12C, MSI-H, TMB-H, NTRK, RET, MET',
      'Each match includes the FDA approval reference + key trial citation',
      'Trial list refreshes each visit — don\'t cache stale matches',
    ],
    icon: Target,
    color: 'purple',
    action: { label: 'Open Precision Matcher', path: '/precision-medicine' },
  },
  {
    id: 'pgx',
    title: 'Pharmacogenomics',
    subtitle: '80+ gene-drug pairs, every CPIC Level A oncology guideline',
    description:
      'Before prescribing fluoropyrimidines, irinotecan, tamoxifen, mercaptopurines, codeine — check the relevant PGx gene status. CPIC + FDA recommendations with PMIDs cited inline.',
    scenario:
      'DPYD c.1905+1G>A heterozygous → start 5-FU at 50% dose, monitor for severe toxicity. Citation: CPIC 2018, PMID 29152729.',
    tips: [
      'Search by gene OR drug — both directions work',
      'Filter to "actionable in next 24h" if you only want what changes today\'s plan',
      'Every recommendation links back to the underlying CPIC publication',
    ],
    icon: Dna,
    color: 'amber',
    action: { label: 'View PGx Guidelines', path: '/genomics' },
  },
  {
    id: 'trials',
    title: 'Clinical Trial Matching',
    subtitle: 'NCI + ClinicalTrials.gov, biomarker- and geo-aware',
    description:
      'Search by condition, biomarker, and patient location. Trials matched to the biomarkers from your Precision Matcher session show up automatically. Map view groups trials by recruiting site.',
    scenario:
      'Patient in metro Boston with KRAS G12C NSCLC, ECOG 1, prior platinum → 8 actively recruiting trials within 50 miles, with eligibility highlights and contact info.',
    tips: [
      'Filter by phase, recruitment status, distance from ZIP code',
      'Click any trial to see eligibility criteria + contact email',
      'Saved patient context auto-populates the search',
    ],
    icon: FlaskConical,
    color: 'green',
    action: { label: 'Find Trials', path: '/trials' },
  },
  {
    id: 'curated',
    title: 'Curated Interactions',
    subtitle: 'Pre-vetted, peer-reviewed high-risk combinations',
    description:
      'When you only have 30 seconds, this is the fastest read: a curated list of clinically significant interactions — ondansetron + apalutamide, allopurinol + azathioprine, warfarin + capecitabine — with severity, mechanism, and management in one card.',
    scenario:
      'Use this when triaging — if a curated entry exists, you have an authoritative summary without combing through pairwise screening output.',
    tips: [
      'Curated entries are reviewed quarterly; non-curated come from automated screening',
      'Bookmark the ones you reference often; they pin to the top',
      'Each card shows last-reviewed date so you know it\'s current',
    ],
    icon: Bookmark,
    color: 'pink',
    action: { label: 'View Curated List', path: '/curated' },
  },
  {
    id: 'wrap',
    title: 'You\'re ready — your first 60-second workflow',
    subtitle: 'A suggested path for your first patient lookup',
    description:
      'Try this sequence on a real (or mock) case to see the system end-to-end. The whole thing should take under a minute on warm cache.',
    tips: [
      '1. Drug Search → type the patient\'s primary chemotherapy agent',
      '2. Click "Add to interaction check" → add concomitant meds + supplements',
      '3. Review pairwise + cumulative toxicity alerts',
      '4. If genomic data exists, jump to Precision Matcher; if not, check PGx for actionable genes',
      '5. Hit Trials with the patient\'s ZIP + biomarkers if you\'re looking for trial options',
      'You can replay this tour anytime by clicking the "?" Help button in the navigation bar',
    ],
    icon: Check,
    color: 'green',
  },
];

const STORAGE_KEY = 'oncosaferx_onboarding_dismissed';

/**
 * Mark the tour as not-yet-seen so it shows on the next dashboard visit.
 * Exported for the "Replay tour" button in the navigation/help menu.
 */
export function replayOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

/**
 * Oncologist onboarding walkthrough. Renders inline on the Dashboard
 * until dismissed. Each step has a clinical scenario + 2-3 specific
 * tips so the user learns what they're looking AT, not just where to
 * click. Replayable from the help menu via replayOnboarding().
 */
export default function OncologistOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  // Honor the persistent dismiss flag on mount
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setDismissed(true);
      }
    } catch {}
  }, []);

  // Keyboard navigation: ←, →, Esc
  useEffect(() => {
    if (dismissed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
      else if (e.key === 'ArrowLeft') setCurrentStep(s => Math.max(s - 1, 0));
      else if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed]);

  if (dismissed) return null;

  const handleDismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch {}
    setDismissed(true);
  };

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const Icon = step.icon;

  const colorClasses: Record<Step['color'], { bg: string; text: string; border: string; iconBg: string; scenarioBg: string }> = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', iconBg: 'bg-blue-100 dark:bg-blue-900/30', scenarioBg: 'bg-blue-100/60 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' },
    red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', iconBg: 'bg-red-100 dark:bg-red-900/30', scenarioBg: 'bg-red-100/60 dark:bg-red-900/30 border-red-200 dark:border-red-700' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', iconBg: 'bg-purple-100 dark:bg-purple-900/30', scenarioBg: 'bg-purple-100/60 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', iconBg: 'bg-amber-100 dark:bg-amber-900/30', scenarioBg: 'bg-amber-100/60 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', iconBg: 'bg-orange-100 dark:bg-orange-900/30', scenarioBg: 'bg-orange-100/60 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800', iconBg: 'bg-green-100 dark:bg-green-900/30', scenarioBg: 'bg-green-100/60 dark:bg-green-900/30 border-green-200 dark:border-green-700' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800', iconBg: 'bg-pink-100 dark:bg-pink-900/30', scenarioBg: 'bg-pink-100/60 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700' },
  };

  const c = colorClasses[step.color];

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 mb-6 relative`}>
      {/* Close (X) — always visible, top-right */}
      <button
        onClick={handleDismiss}
        aria-label="Close tour"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <div className={`w-12 h-12 ${c.iconBg} rounded-xl flex items-center justify-center shrink-0`}>
          <Icon className={`h-6 w-6 ${c.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h3 className={`text-lg font-bold ${c.text}`}>{step.title}</h3>
            <span className="text-xs text-gray-400">
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{step.subtitle}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>

          {/* Clinical scenario callout */}
          {step.scenario && (
            <div className={`mt-3 p-3 border rounded-lg ${c.scenarioBg}`}>
              <div className={`text-[11px] uppercase tracking-wider font-semibold ${c.text} mb-1`}>
                Example
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{step.scenario}</p>
            </div>
          )}

          {/* Tip list */}
          {step.tips && step.tips.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {step.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full bg-current ${c.text} shrink-0`} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action button — context jumps you straight to the screen */}
          {step.action && (
            <button
              onClick={() => navigate(step.action!.path)}
              className={`mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium ${c.text} ${c.iconBg} rounded-lg hover:opacity-80 transition-opacity`}
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
              aria-label={`Step ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep ? 'scale-125' : 'opacity-40'
              }`}
              style={{ backgroundColor: i === currentStep ? 'currentColor' : undefined }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
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
              if (isLast) handleDismiss();
              else setCurrentStep(prev => prev + 1);
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
