import React, { useState } from 'react';
import { Shield, AlertTriangle, Pill, Dna, Plus, X, Zap, Activity } from 'lucide-react';
import api from '../../services/api';

interface Interaction {
  drug1: string;
  drug2: string;
  severity: string;
  mechanism: string;
  effect: string;
  management: string;
}

interface CumulativeToxicity {
  domain: string;
  severity: string;
  count: number;
  drugs: string[];
  monitoring: string;
  risk: string;
}

interface Recommendation {
  priority: string;
  type: string;
  message: string;
  drugs: string[];
}

interface AnalysisResult {
  summary: {
    totalDrugs: number;
    totalInteractions: number;
    majorInteractions: number;
    moderateInteractions: number;
    overallRisk: string;
  };
  interactions: {
    withinRegimen: Interaction[];
    regimenVsConcomitant: Interaction[];
  };
  cumulativeToxicities: CumulativeToxicity[];
  pgxAlerts: any[];
  recommendations: Recommendation[];
}

const COMMON_REGIMENS: Record<string, string[]> = {
  'FOLFOX': ['fluorouracil', 'leucovorin', 'oxaliplatin'],
  'FOLFIRI': ['fluorouracil', 'leucovorin', 'irinotecan'],
  'FOLFIRINOX': ['fluorouracil', 'leucovorin', 'irinotecan', 'oxaliplatin'],
  'R-CHOP': ['rituximab', 'cyclophosphamide', 'doxorubicin', 'vincristine', 'prednisone'],
  'AC-T': ['doxorubicin', 'cyclophosphamide', 'paclitaxel'],
  'TC': ['docetaxel', 'cyclophosphamide'],
  'Carboplatin/Paclitaxel': ['carboplatin', 'paclitaxel'],
  'Cisplatin/Etoposide': ['cisplatin', 'etoposide'],
  'Gemcitabine/Cisplatin': ['gemcitabine', 'cisplatin'],
  'Pembrolizumab + Chemo': ['pembrolizumab', 'carboplatin', 'pemetrexed'],
};

/**
 * Regimen-level interaction checker.
 * Users input their chemo regimen + concomitant meds → get a full safety analysis.
 */
export default function RegimenChecker() {
  const [regimenDrugs, setRegimenDrugs] = useState<string[]>([]);
  const [concomitantDrugs, setConcomitantDrugs] = useState<string[]>([]);
  const [newDrug, setNewDrug] = useState('');
  const [addingTo, setAddingTo] = useState<'regimen' | 'concomitant'>('regimen');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addDrug = () => {
    const drug = newDrug.trim().toLowerCase();
    if (!drug) return;
    if (addingTo === 'regimen') {
      if (!regimenDrugs.includes(drug)) setRegimenDrugs(prev => [...prev, drug]);
    } else {
      if (!concomitantDrugs.includes(drug)) setConcomitantDrugs(prev => [...prev, drug]);
    }
    setNewDrug('');
  };

  const loadPreset = (name: string) => {
    setRegimenDrugs(COMMON_REGIMENS[name] || []);
    setResult(null);
  };

  const analyze = async () => {
    if (regimenDrugs.length === 0) { setError('Add at least one regimen drug'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/regimen/analyze', {
        regimenDrugs,
        concomitantDrugs,
        pgxProfile: {},
      });
      setResult(res.data?.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'moderate': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
  };

  const severityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      major: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      minor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return colors[severity] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
          <Shield className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Regimen Safety Analyzer</h2>
          <p className="text-sm text-gray-500">Check interactions, cumulative toxicity, and PGx alerts for your complete treatment plan</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        {/* Quick presets */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Quick Load Regimen</label>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(COMMON_REGIMENS).map(name => (
              <button
                key={name}
                onClick={() => loadPreset(name)}
                className="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Drug input */}
        <div className="flex gap-2">
          <select
            value={addingTo}
            onChange={(e) => setAddingTo(e.target.value as 'regimen' | 'concomitant')}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 text-xs"
          >
            <option value="regimen">Regimen Drug</option>
            <option value="concomitant">Other Medication</option>
          </select>
          <input
            type="text"
            value={newDrug}
            onChange={(e) => setNewDrug(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDrug()}
            placeholder="Type drug name and press Enter..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
          />
          <button onClick={addDrug} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Drug pills */}
        <div className="flex flex-wrap gap-2">
          {regimenDrugs.map(d => (
            <span key={`r-${d}`} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full text-xs border border-blue-200 dark:border-blue-800">
              <Pill className="h-3 w-3" /> {d}
              <button onClick={() => setRegimenDrugs(prev => prev.filter(x => x !== d))} className="ml-0.5 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {concomitantDrugs.map(d => (
            <span key={`c-${d}`} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-600">
              <Pill className="h-3 w-3" /> {d}
              <button onClick={() => setConcomitantDrugs(prev => prev.filter(x => x !== d))} className="ml-0.5 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading || regimenDrugs.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Analyze Regimen Safety
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className={`rounded-xl border p-4 ${riskColor(result.summary.overallRisk)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                <span className="text-lg font-bold capitalize">
                  {result.summary.overallRisk} Risk
                </span>
              </div>
              <div className="text-right text-sm">
                <p>{result.summary.totalDrugs} drugs analyzed</p>
                <p>{result.summary.totalInteractions} interactions found</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-800 dark:text-red-300">
                  Action Required ({result.recommendations.length})
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 flex items-start gap-3">
                    <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                      rec.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {rec.priority}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{rec.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactions */}
          {result.interactions.withinRegimen.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Regimen Interactions ({result.interactions.withinRegimen.length})
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.interactions.withinRegimen.map((ix, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {ix.drug1} + {ix.drug2}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${severityBadge(ix.severity)}`}>
                        {ix.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{ix.effect}</p>
                    {ix.management && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Management: {ix.management}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cumulative Toxicity */}
          {result.cumulativeToxicities.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cumulative Toxicity Risks
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.cumulativeToxicities.map((tox, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{tox.domain}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tox.risk === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {tox.count} agents
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{tox.drugs.join(', ')}</p>
                    <p className="text-xs text-blue-600 mt-1">{tox.monitoring}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PGx Alerts */}
          {result.pgxAlerts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 flex items-center gap-2">
                <Dna className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                  Pharmacogenomic Alerts ({result.pgxAlerts.length} drugs)
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {result.pgxAlerts.map((alert, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{alert.drug}</span>
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                        {alert.gene}
                      </span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">{alert.patientPhenotype}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
