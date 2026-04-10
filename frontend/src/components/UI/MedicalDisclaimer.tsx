import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Medical disclaimer banner shown at the bottom of clinical pages.
 * Required for any clinical decision support tool to avoid liability
 * and ensure users understand the tool's limitations.
 */
export default function MedicalDisclaimer() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-8 py-4 px-6">
      <div className="max-w-4xl mx-auto flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-1">
          <p className="font-semibold text-gray-600 dark:text-gray-300">
            Clinical Decision Support — Not a Substitute for Professional Judgment
          </p>
          <p>
            OncoSafeRx provides evidence-based drug interaction data, pharmacogenomic guidelines,
            and clinical reference information sourced from CPIC, FDA labels, DailyMed, OpenFDA FAERS,
            ClinicalTrials.gov, and NCI. This information is intended to support — not replace —
            clinical decision-making by qualified healthcare professionals.
          </p>
          <p>
            Always verify recommendations against current clinical guidelines and the patient's
            complete medical history. Drug interaction data may not be exhaustive. Report any
            suspected errors to our clinical team.
          </p>
          <p className="text-gray-400">
            Data sources: CPIC Guidelines • FDA Drug Labels (DailyMed) • FDA FAERS • NCI Clinical Trials API •
            RxNorm (NLM) • ClinicalTrials.gov • PharmGKB
          </p>
        </div>
      </div>
    </div>
  );
}
