import React, { useState, useCallback, useEffect } from 'react';
import Card from './UI/Card';
import { Loader2, Search, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { dataIntegrationService } from '../services/dataIntegrationService';
import TipCard from './UI/TipCard';

interface DrugData {
  dailyMed: any;
  fdaLabels: any;
  fdaEvents: any;
  rxnorm: any;
  pubmed: any;
  clinicalTrials: any;
}

interface InteractionData {
  rxnorm: any;
  fdaEvents: any;
  pubmed: any;
  clinicalTrials: any;
}

const DrugIntelligenceIntegrator: React.FC = () => {
  const [drugName, setDrugName] = useState('');
  const [drug1, setDrug1] = useState('');
  const [drug2, setDrug2] = useState('');
  const [drugData, setDrugData] = useState<DrugData | null>(null);
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'drug-info' | 'interactions'>('drug-info');
  const [rxnormSuggestion, setRxnormSuggestion] = useState<string | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [nameSuggestLoading, setNameSuggestLoading] = useState(false);
  const [drug1Suggestions, setDrug1Suggestions] = useState<string[]>([]);
  const [drug1SuggestLoading, setDrug1SuggestLoading] = useState(false);
  const [drug2Suggestions, setDrug2Suggestions] = useState<string[]>([]);
  const [drug2SuggestLoading, setDrug2SuggestLoading] = useState(false);

  const searchDrugInfo = useCallback(async () => {
    if (!drugName.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await dataIntegrationService.getComprehensiveDrugInfo(drugName);
      setDrugData(data);
      // Compute RxNorm-based suggestion
      try {
        const concepts: string[] = [];
        const groups = data?.rxnorm?.data?.drugGroup?.conceptGroup || [];
        groups.forEach((g: any) => (g.conceptProperties || []).forEach((cp: any) => cp?.name && concepts.push(String(cp.name))));
        const best = pickBestSuggestion(drugName, concepts);
        setRxnormSuggestion(best);
      } catch { setRxnormSuggestion(null); }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drug information');
    } finally {
      setLoading(false);
    }
  }, [drugName]);

  const searchInteractions = useCallback(async () => {
    if (!drug1.trim() || !drug2.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const data = await dataIntegrationService.searchDrugInteractions(drug1, drug2);
      setInteractionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interaction data');
    } finally {
      setLoading(false);
    }
  }, [drug1, drug2]);

  // Debounced RxNorm suggestions for main drugName
  useEffect(() => {
    const q = drugName.trim();
    if (q.length < 2) { setNameSuggestions([]); return; }
    setNameSuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await dataIntegrationService.searchRxNormDrugs(q);
        const names: string[] = [];
        const groups = resp?.data?.drugGroup?.conceptGroup || [];
        groups.forEach((g: any) => (g.conceptProperties || []).forEach((cp: any) => cp?.name && names.push(String(cp.name))));
        const unique = Array.from(new Set(names));
        // prioritize prefix matches, then others
        const prefix = unique.filter(n => n.toLowerCase().startsWith(q.toLowerCase()));
        const rest = unique.filter(n => !n.toLowerCase().startsWith(q.toLowerCase()));
        setNameSuggestions([...prefix, ...rest].slice(0, 8));
      } catch { setNameSuggestions([]); } finally { setNameSuggestLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [drugName]);

  // Debounced suggestions for interaction drug1
  useEffect(() => {
    const q = drug1.trim();
    if (q.length < 2) { setDrug1Suggestions([]); return; }
    setDrug1SuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await dataIntegrationService.searchRxNormDrugs(q);
        const names: string[] = [];
        const groups = resp?.data?.drugGroup?.conceptGroup || [];
        groups.forEach((g: any) => (g.conceptProperties || []).forEach((cp: any) => cp?.name && names.push(String(cp.name))));
        const unique = Array.from(new Set(names));
        const prefix = unique.filter(n => n.toLowerCase().startsWith(q.toLowerCase()));
        const rest = unique.filter(n => !n.toLowerCase().startsWith(q.toLowerCase()));
        setDrug1Suggestions([...prefix, ...rest].slice(0, 6));
      } catch { setDrug1Suggestions([]); } finally { setDrug1SuggestLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [drug1]);

  // Debounced suggestions for interaction drug2
  useEffect(() => {
    const q = drug2.trim();
    if (q.length < 2) { setDrug2Suggestions([]); return; }
    setDrug2SuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        const resp = await dataIntegrationService.searchRxNormDrugs(q);
        const names: string[] = [];
        const groups = resp?.data?.drugGroup?.conceptGroup || [];
        groups.forEach((g: any) => (g.conceptProperties || []).forEach((cp: any) => cp?.name && names.push(String(cp.name))));
        const unique = Array.from(new Set(names));
        const prefix = unique.filter(n => n.toLowerCase().startsWith(q.toLowerCase()));
        const rest = unique.filter(n => !n.toLowerCase().startsWith(q.toLowerCase()));
        setDrug2Suggestions([...prefix, ...rest].slice(0, 6));
      } catch { setDrug2Suggestions([]); } finally { setDrug2SuggestLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [drug2]);

  const renderDataSource = (title: string, data: any, color: string) => {
    if (!data) {
      return (
        <Card className="opacity-50">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs font-medium rounded border border-${color}-200 text-${color}-700`}>
                {title}
              </span>
              <span className="text-gray-500 text-sm">No data</span>
            </div>
          </div>
        </Card>
      );
    }

    const resultCount = Array.isArray(data.data?.results) ? data.data.results.length :
                       Array.isArray(data.data?.data) ? data.data.data.length :
                       Array.isArray(data.data?.studies) ? data.data.studies.length :
                       typeof data.data?.count === 'number' ? data.data.count :
                       'Available';

    // Simple spelling suggestions for common drug names
    const suggestionsMap: Record<string, string> = {
      asprin: 'aspirin',
      ibuprophen: 'ibuprofen',
      amoxicillan: 'amoxicillin',
      metformine: 'metformin',
      warfrin: 'warfarin',
      paracetemol: 'acetaminophen',
      cetirizne: 'cetirizine',
      omperazole: 'omeprazole',
      clopidegrel: 'clopidogrel'
    };

    const lowerName = drugName.trim().toLowerCase();
    const spellingSuggestion = suggestionsMap[lowerName] || null;
    const effectiveSuggestion = spellingSuggestion || rxnormSuggestion;

    // Special rendering for DailyMed search to show label links
    if (title === 'DailyMed' && Array.isArray(data?.data?.data)) {
      const items = data.data.data as Array<{ setid: string; title: string }>;
      if (items.length === 0) {
        return (
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                    {title}
                  </span>
                  <span className="text-gray-600 text-sm">No results</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-700 mb-3">No DailyMed labels found for “{drugName}”.</div>
              {effectiveSuggestion && (
                <button
                  className="text-sm text-blue-700 hover:underline"
                  onClick={() => {
                    setDrugName(effectiveSuggestion);
                    setTimeout(() => searchDrugInfo(), 0);
                  }}
                >
                  Did you mean: {effectiveSuggestion}?
                </button>
              )}
            </div>
          </Card>
        );
      }
      return (
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                  {title}
                </span>
                <span className="text-gray-600 text-sm">{items.length} results</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
            </div>
            <ul className="space-y-2">
              {items.slice(0, 5).map((it) => (
                <li key={it.setid} className="text-sm">
                  <a
                    href={`https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${encodeURIComponent(it.setid)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 hover:underline"
                  >
                    {it.title || it.setid}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      );
    }

    // Friendly empty state for OpenFDA sources
    if ((title === 'FDA Labels' || title === 'FDA Events' || title === 'FDA Adverse Events')) {
      const items = Array.isArray(data?.data?.results) ? data.data.results : [];
      if (items.length === 0) {
        return (
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                    {title}
                  </span>
                  <span className="text-gray-600 text-sm">No results</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-700 mb-3">No FDA {title.toLowerCase()} found for “{drugName}”.</div>
              {(effectiveSuggestion) && (
                <button
                  className="text-sm text-blue-700 hover:underline"
                  onClick={() => {
                    setDrugName(effectiveSuggestion);
                    // Kick off a new search after setting
                    setTimeout(() => searchDrugInfo(), 0);
                  }}
                >
                  Did you mean: {effectiveSuggestion}?
                </button>
              )}
            </div>
          </Card>
        );
      }
    }

    // Friendly empty state for PubMed
    if (title === 'PubMed') {
      const articlesObj = data?.data?.articles || {};
      const articles = Object.values(articlesObj);
      if (!articles || articles.length === 0) {
        return (
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                    {title}
                  </span>
                  <span className="text-gray-600 text-sm">No results</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-700 mb-3">No PubMed articles found for “{drugName}”. Try broader terms.</div>
              {effectiveSuggestion && (
                <button
                  className="text-sm text-blue-700 hover:underline"
                  onClick={() => {
                    setDrugName(effectiveSuggestion);
                    setTimeout(() => searchDrugInfo(), 0);
                  }}
                >
                  Did you mean: {effectiveSuggestion}?
                </button>
              )}
            </div>
          </Card>
        );
      }
    }

    return (
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800 border-${color}-200`}>
                {title}
              </span>
              <span className="text-gray-600 text-sm">{resultCount} results</span>
            </div>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            Source: {data.source} • {new Date(data.timestamp).toLocaleTimeString()}
          </div>
          {typeof data.query !== 'undefined' && (
            <div className="text-xs bg-gray-50 p-2 rounded mb-2">
              Query: {typeof data.query === 'string' ? data.query : JSON.stringify(data.query)}
            </div>
          )}
          <div className="text-sm text-gray-700">
            {JSON.stringify(data.data, null, 2).slice(0, 200)}...
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <TipCard id="tip-drug-intel">
        Enter a drug to fetch information from RxNorm, DailyMed, FDA, PubMed, and ClinicalTrials. Compare sources side‑by‑side, then switch to the Interactions tab to check a drug pair.
      </TipCard>
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Drug Intelligence Integrator</h2>
        <p className="text-gray-600 mt-1">
          Real-time access to DailyMed, OpenFDA, ClinicalTrials.gov, PubMed, and RxNorm APIs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('drug-info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'drug-info'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comprehensive Drug Info
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'interactions'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Drug Interactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'drug-info' && (
            <div className="space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Drug Information Search</h3>
                  <div className="flex gap-2 mb-2" data-tour="drug-intel-search">
                    <input
                      type="text"
                      placeholder="Enter drug name (e.g., aspirin, ibuprofen)"
                      value={drugName}
                      onChange={(e) => setDrugName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchDrugInfo()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={searchDrugInfo}
                      disabled={loading || !drugName.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Search
                    </button>
                  </div>
                  {nameSuggestions.length > 0 && (
                    <div className="mb-4 border border-gray-200 rounded-md divide-y bg-white">
                      {nameSuggestions.map((sug) => (
                        <button
                          key={sug}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                          onClick={() => { setDrugName(sug); setTimeout(() => searchDrugInfo(), 0); }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  {drugData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                      {renderDataSource('RxNorm', drugData.rxnorm, 'blue')}
                      {renderDataSource('DailyMed', drugData.dailyMed, 'green')}
                      {renderDataSource('FDA Labels', drugData.fdaLabels, 'purple')}
                      {renderDataSource('FDA Events', drugData.fdaEvents, 'red')}
                      {renderDataSource('PubMed', drugData.pubmed, 'yellow')}
                      {renderDataSource('Clinical Trials', drugData.clinicalTrials, 'indigo')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Drug Interaction Search</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2" data-tour="drug-intel-interactions">
                    <input
                      type="text"
                      placeholder="First drug"
                      value={drug1}
                      onChange={(e) => setDrug1(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Second drug"
                      value={drug2}
                      onChange={(e) => setDrug2(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                      onClick={searchInteractions} 
                      disabled={loading || !drug1.trim() || !drug2.trim()}
                      className="flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Find Interactions
                    </button>
                  </div>
                  {(drug1Suggestions.length > 0 || drug2Suggestions.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {drug1Suggestions.length > 0 && (
                        <div className="border border-gray-200 rounded-md divide-y bg-white">
                          {drug1Suggestions.map((sug) => (
                            <button
                              key={`d1-${sug}`}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                              onClick={() => setDrug1(sug)}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                      {drug2Suggestions.length > 0 && (
                        <div className="border border-gray-200 rounded-md divide-y bg-white">
                          {drug2Suggestions.map((sug) => (
                            <button
                              key={`d2-${sug}`}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                              onClick={() => setDrug2(sug)}
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {interactionData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {renderDataSource('RxNorm Interactions', interactionData.rxnorm, 'blue')}
                      {renderDataSource('FDA Adverse Events', interactionData.fdaEvents, 'red')}
                      {renderDataSource('PubMed Literature', interactionData.pubmed, 'yellow')}
                      {renderDataSource('Clinical Trials', interactionData.clinicalTrials, 'indigo')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <div className="text-blue-800">
            <strong>Data Sources:</strong> This integrator provides real-time access to official biomedical APIs.
            All data is fetched through secure server-side proxies with rate limiting and error handling.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugIntelligenceIntegrator;

// Helper: pick best suggestion by simple Levenshtein distance
function pickBestSuggestion(input: string, candidates: string[]): string | null {
  const src = (input || '').trim().toLowerCase();
  if (!src || candidates.length === 0) return null;
  let best: { s: string; d: number } | null = null;
  candidates.forEach((c) => {
    const name = String(c || '').toLowerCase();
    if (!name) return;
    const d = levenshtein(src, name);
    if (best == null || d < best.d) best = { s: c, d };
  });
  // Only suggest if reasonably close and not identical
  if (best && best.d > 0 && best.d <= Math.max(2, Math.floor(src.length * 0.3))) return best.s;
  return null;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}
