import React, { useState } from 'react';
import { Dna, Target, Shield, Search, ChevronRight, ExternalLink, Pill } from 'lucide-react';
import api from '../../services/api';

interface Therapy {
  drug: string;
  line: string;
  evidence: string;
  note: string;
}

interface BiomarkerMatch {
  biomarker: string;
  therapies: Therapy[];
}

interface PgxAlert {
  drug: string;
  guidelines: Array<{ phenotype: string; recommendation: string; evidence: string; sources: string[] }>;
}

interface MatchResults {
  targetedTherapies: BiomarkerMatch[];
  immunotherapies: BiomarkerMatch[];
  pgxAlerts: Array<{ drug: string; guidelines: PgxAlert['guidelines'] }>;
  clinicalTrialBiomarkers: string[];
}

const COMMON_BIOMARKERS = [
  'EGFR exon 19 del', 'EGFR L858R', 'EGFR T790M', 'ALK fusion', 'ROS1 fusion',
  'BRAF V600E', 'KRAS G12C', 'KRAS wild-type', 'NTRK fusion', 'RET fusion',
  'MET exon 14 skipping', 'HER2 amplification', 'BRCA1 mutation', 'BRCA2 mutation',
  'MSI-H / dMMR', 'TMB-High', 'PD-L1 ≥50%', 'PD-L1 1-49%',
  'PIK3CA mutation', 'FLT3-ITD', 'IDH1 R132', 'IDH2 mutation', 'BCR-ABL1',
];

const TUMOR_TYPES = [
  'NSCLC', 'Breast', 'Colorectal', 'Melanoma', 'Ovarian', 'Prostate',
  'Pancreatic', 'AML', 'CML', 'Gastric/GEJ', 'Cholangiocarcinoma',
  'Thyroid', 'Medullary Thyroid Cancer', 'Head and Neck',
];

/**
 * Interactive biomarker-to-therapy matcher.
 * Oncologist selects tumor type + biomarkers → sees all FDA-approved targeted therapies.
 */
export default function BiomarkerMatcher() {
  const [cancerType, setCancerType] = useState('');
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<string[]>([]);
  const [medications, setMedications] = useState('');
  const [results, setResults] = useState<MatchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleBiomarker = (bm: string) => {
    setSelectedBiomarkers(prev =>
      prev.includes(bm) ? prev.filter(b => b !== bm) : [...prev, bm]
    );
  };

  const handleMatch = async () => {
    if (!cancerType) { setError('Please select a tumor type'); return; }
    if (selectedBiomarkers.length === 0) { setError('Please select at least one biomarker'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/biomarkers/patient-match', {
        cancerType,
        biomarkers: selectedBiomarkers,
        medications: medications.split(',').map(m => m.trim()).filter(Boolean),
      });
      setResults(res.data?.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
          <Dna className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Precision Therapy Matcher</h2>
          <p className="text-sm text-gray-500">Match tumor biomarkers to FDA-approved targeted therapies</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        {/* Tumor Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tumor Type
          </label>
          <select
            value={cancerType}
            onChange={(e) => setCancerType(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select tumor type...</option>
            {TUMOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Biomarker Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Detected Biomarkers
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_BIOMARKERS.map(bm => (
              <button
                key={bm}
                onClick={() => toggleBiomarker(bm)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
                  selectedBiomarkers.includes(bm)
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-purple-300'
                }`}
              >
                {bm}
              </button>
            ))}
          </div>
        </div>

        {/* Concomitant Medications (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Current Medications <span className="text-gray-400">(optional, comma-separated)</span>
          </label>
          <input
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="e.g., tamoxifen, warfarin, omeprazole"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleMatch}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              Find Matched Therapies
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Targeted Therapies */}
          {results.targetedTherapies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                  Targeted Therapies ({results.targetedTherapies.reduce((s, t) => s + t.therapies.length, 0)} options)
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.targetedTherapies.map((match, i) => (
                  <div key={i} className="p-4">
                    <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      {match.biomarker}
                    </h4>
                    <div className="space-y-2">
                      {match.therapies.map((t, j) => (
                        <div key={j} className="flex items-start gap-3 pl-3 border-l-2 border-green-200 dark:border-green-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{t.drug}</span>
                              <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                {t.line}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{t.note}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Evidence: {t.evidence}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Immunotherapies */}
          {results.immunotherapies.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Immunotherapy Options
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.immunotherapies.map((match, i) => (
                  <div key={i} className="p-4">
                    <h4 className="text-sm font-semibold text-blue-600 mb-2">{match.biomarker}</h4>
                    <div className="space-y-2">
                      {match.therapies.map((t, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{t.drug}</span>
                          <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-1.5 py-0.5 rounded">{t.line}</span>
                          <span className="text-xs text-gray-400">— {t.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PGx Alerts */}
          {results.pgxAlerts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <Dna className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Pharmacogenomic Alerts
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.pgxAlerts.map((alert, i) => (
                  <div key={i} className="p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {alert.drug}
                    </h4>
                    {alert.guidelines.map((g: any, j: number) => (
                      <div key={j} className="text-xs text-gray-600 dark:text-gray-400 ml-3 mb-1">
                        <span className="font-medium text-amber-700 dark:text-amber-400">{g.phenotype}:</span>{' '}
                        {g.recommendation}
                        {g.sources && (
                          <span className="text-gray-400 ml-1">[{g.sources.join(', ')}]</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {results.targetedTherapies.length === 0 &&
           results.immunotherapies.length === 0 &&
           results.pgxAlerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No matched therapies found for this biomarker profile.</p>
              <p className="text-xs mt-1">Consider clinical trial matching for investigational options.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
