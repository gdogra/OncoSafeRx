import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 9, 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">1. Overview</h2>
          <p>
            OncoSafeRx ("we", "our", "the Platform") is committed to protecting user privacy and
            handling health-related data responsibly. This Privacy Policy explains what data we
            collect, how we use it, and your rights regarding that data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">2. Data We Collect</h2>
          <h3 className="text-lg font-medium mt-4">Account Information</h3>
          <p>When you create an account: name, email address, professional role, institution (optional).</p>

          <h3 className="text-lg font-medium mt-4">Usage Data</h3>
          <p>
            Drug searches, interaction checks performed, features accessed. This data is used to
            improve the Platform and is not shared with third parties.
          </p>

          <h3 className="text-lg font-medium mt-4">Clinical Data (if entered)</h3>
          <p>
            Patient biomarker profiles, medication lists, or genomic data entered for interaction
            checking or biomarker matching. This data is processed in-session and is NOT stored
            permanently unless you explicitly save it to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">3. How We Use Your Data</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide drug interaction checking and clinical decision support services</li>
            <li>Personalize your experience (saved searches, preferences)</li>
            <li>Improve the accuracy and completeness of our clinical databases</li>
            <li>Generate anonymized, aggregated usage statistics</li>
            <li>Communicate service updates and safety alerts</li>
          </ul>
          <p className="mt-2">
            <strong>We do NOT sell user data to third parties. We do NOT use clinical data
            entered by users for advertising purposes.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">4. Data Storage and Security</h2>
          <p>
            Data is stored in Supabase (PostgreSQL) with encryption at rest and in transit.
            Authentication is handled through Supabase Auth with industry-standard security practices.
          </p>
          <p>
            We implement reasonable administrative, technical, and physical safeguards to protect
            your data. However, no internet-based system is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">5. HIPAA Compliance Notice</h2>
          <p>
            OncoSafeRx is designed as a clinical reference tool, not an electronic health record (EHR).
            If you are a covered entity under HIPAA and wish to use OncoSafeRx with protected health
            information (PHI), please contact us to discuss a Business Associate Agreement (BAA).
          </p>
          <p>
            <strong>Do not enter identifiable patient information</strong> (names, dates of birth,
            medical record numbers) into the Platform unless a BAA is in place.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">6. Third-Party Services</h2>
          <p>The Platform uses the following third-party services:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Supabase</strong> — Authentication and database hosting</li>
            <li><strong>Netlify</strong> — Web hosting and serverless functions</li>
            <li><strong>Sentry</strong> — Error tracking (no clinical data)</li>
          </ul>
          <p className="mt-2">
            External clinical data APIs (RxNorm, DailyMed, OpenFDA, ClinicalTrials.gov, NCI) are
            queried on your behalf but no user data is sent to these services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">7. Your Rights</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access, correct, or delete your account data at any time</li>
            <li>Export your data in a machine-readable format</li>
            <li>Opt out of non-essential communications</li>
            <li>Request deletion of all data associated with your account</li>
          </ul>
          <p className="mt-2">Contact privacy@oncosaferx.com for any data requests.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify registered users of
            material changes via email.
          </p>
        </section>
      </div>
    </div>
  );
}
