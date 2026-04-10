import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 9, 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using OncoSafeRx ("the Platform"), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Clinical Decision Support Disclaimer</h2>
          <p>
            OncoSafeRx is a clinical decision support tool, NOT a diagnostic or prescribing system.
            The Platform provides evidence-based drug interaction data, pharmacogenomic guidelines,
            and clinical reference information sourced from publicly available databases including
            CPIC, FDA drug labels (DailyMed), OpenFDA FAERS, ClinicalTrials.gov, NCI, and RxNorm.
          </p>
          <p>
            <strong>The information provided is intended to support — not replace — clinical
            decision-making by qualified healthcare professionals.</strong> Always verify
            recommendations against current clinical guidelines, the patient's complete medical
            history, and your professional judgment.
          </p>
          <p>
            OncoSafeRx does not practice medicine, provide medical diagnoses, or prescribe
            treatments. Drug interaction data may not be exhaustive. The absence of an interaction
            in our database does not mean no interaction exists.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. Intended Users</h2>
          <p>
            The Platform is designed for use by licensed healthcare professionals including
            oncologists, pharmacists, nurses, and clinical researchers. Patient-facing features
            are informational only and do not constitute medical advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Data Sources and Accuracy</h2>
          <p>
            Clinical data is sourced from authoritative public databases. While we strive for
            accuracy, data may be incomplete, outdated, or contain errors. We update our databases
            regularly but cannot guarantee real-time currency of all information.
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Drug interactions: curated database + FDA labels + published literature</li>
            <li>Pharmacogenomics: CPIC Guidelines, FDA PGx biomarker table</li>
            <li>Adverse events: FDA FAERS (voluntary reporting — limitations apply)</li>
            <li>Clinical trials: ClinicalTrials.gov, NCI Clinical Trials API</li>
            <li>Drug information: RxNorm (NLM), DailyMed (NLM)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. Limitation of Liability</h2>
          <p>
            OncoSafeRx and its operators shall not be liable for any clinical decisions made
            based on information provided by the Platform. The Platform is provided "as is"
            without warranties of any kind, express or implied, including but not limited to
            warranties of merchantability, fitness for a particular purpose, or accuracy of
            clinical data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Privacy and Data Protection</h2>
          <p>
            See our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a> for
            information about how we collect, use, and protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Reporting Errors</h2>
          <p>
            If you identify inaccurate clinical data, drug interaction information, or any
            content that could impact patient safety, please report it immediately using the
            feedback feature in the Platform or contact us at safety@oncosaferx.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the Platform after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>
      </div>
    </div>
  );
}
