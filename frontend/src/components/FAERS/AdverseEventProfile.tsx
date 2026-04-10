import React, { useState } from 'react';
import { AlertTriangle, BarChart3, Users, Pill, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import api from '../../services/api';

interface AdverseEvent {
  rank: number;
  event: string;
  count: number;
}

interface SeriousOutcome {
  outcome: string;
  count: number;
}

interface ConcomitantDrug {
  rank: number;
  drug: string;
  coReportCount: number;
}

interface Props {
  drugName: string;
}

/**
 * FAERS Adverse Event Profile for a drug.
 * Shows top adverse events, serious outcomes, and concomitant drugs
 * from the FDA Adverse Event Reporting System.
 */
export default function AdverseEventProfile({ drugName }: Props) {
  const [events, setEvents] = useState<AdverseEvent[]>([]);
  const [outcomes, setOutcomes] = useState<SeriousOutcome[]>([]);
  const [concomitant, setConcomitant] = useState<ConcomitantDrug[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'outcomes' | 'concomitant'>('events');
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (loaded) { setExpanded(!expanded); return; }
    setLoading(true);
    setError('');
    try {
      const [eventsRes, outcomesRes, concomitantRes] = await Promise.allSettled([
        api.get(`/faers/adverse-events/${encodeURIComponent(drugName)}?limit=15`),
        api.get(`/faers/serious-outcomes/${encodeURIComponent(drugName)}`),
        api.get(`/faers/concomitant/${encodeURIComponent(drugName)}?limit=10`),
      ]);

      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.data?.events || []);
      if (outcomesRes.status === 'fulfilled') setOutcomes(outcomesRes.value.data?.data?.outcomes || []);
      if (concomitantRes.status === 'fulfilled') setConcomitant(concomitantRes.value.data?.data?.concomitant || []);

      setLoaded(true);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load FAERS data');
    } finally {
      setLoading(false);
    }
  };

  const maxEventCount = events.length > 0 ? events[0].count : 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header — click to expand */}
      <button
        onClick={fetchData}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            FDA FAERS Safety Profile
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            Real-world data
          </span>
        </div>
        {loading ? (
          <div className="h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        ) : expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20">{error}</div>
      )}

      {expanded && loaded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'events' as const, label: 'Top Adverse Events', icon: BarChart3 },
              { id: 'outcomes' as const, label: 'Serious Outcomes', icon: AlertTriangle },
              { id: 'concomitant' as const, label: 'Co-reported Drugs', icon: Pill },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-2">
                {events.length === 0 ? (
                  <p className="text-sm text-gray-500">No adverse event data available for this drug.</p>
                ) : events.map(e => (
                  <div key={e.rank} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-5 text-right">{e.rank}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {e.event.toLowerCase()}
                        </span>
                        <span className="text-xs text-gray-500">{e.count.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${(e.count / maxEventCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Outcomes Tab */}
            {activeTab === 'outcomes' && (
              <div className="space-y-3">
                {outcomes.length === 0 ? (
                  <p className="text-sm text-gray-500">No serious outcome data available.</p>
                ) : outcomes.filter(o => o.count > 0).map(o => (
                  <div key={o.outcome} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{o.outcome}</span>
                    <span className={`text-sm font-semibold ${
                      o.outcome === 'Death' ? 'text-red-600' :
                      o.outcome === 'Hospitalization' ? 'text-orange-600' :
                      'text-amber-600'
                    }`}>
                      {o.count.toLocaleString()} reports
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Concomitant Tab */}
            {activeTab === 'concomitant' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Drugs most frequently reported alongside {drugName} in adverse event reports.
                  Does NOT establish causation or interaction.
                </p>
                {concomitant.length === 0 ? (
                  <p className="text-sm text-gray-500">No concomitant drug data available.</p>
                ) : concomitant.map(c => (
                  <div key={c.rank} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {c.drug.toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500">{c.coReportCount.toLocaleString()} co-reports</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Source: FDA FAERS via OpenFDA. Voluntary reports; causality not established.
              <a href="https://www.fda.gov/drugs/surveillance/fda-adverse-event-reporting-system-faers"
                target="_blank" rel="noopener noreferrer"
                className="text-blue-500 hover:underline inline-flex items-center gap-0.5 ml-1">
                Learn more <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
