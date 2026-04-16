import React, { useMemo, useState } from 'react';
import { AlertTriangle, Shield, ChevronDown, ChevronUp, Activity, Pill, Eye } from 'lucide-react';
import { findAllHighRiskDrugs, type HighRiskDrug } from '../../data/highRiskDrugs';

interface Drug {
  name: string;
  rxcui?: string;
}

interface Props {
  drugs: Drug[];
}

function RiskBadge({ level }: { level: 'extreme' | 'high' }) {
  return level === 'extreme' ? (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
      <AlertTriangle className="h-2.5 w-2.5" />EXTREME RISK
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
      HIGH RISK
    </span>
  );
}

function DrugWarningCard({ drug, info, defaultExpanded }: { drug: string; info: HighRiskDrug; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`rounded-lg border ${
      info.riskLevel === 'extreme'
        ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
        : 'border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30'
    }`}>
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2 flex items-center gap-2">
        <AlertTriangle className={`h-4 w-4 shrink-0 ${info.riskLevel === 'extreme' ? 'text-red-600' : 'text-orange-600'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{info.name}</span>
            <RiskBadge level={info.riskLevel} />
            {info.isNarrowTherapeuticIndex && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">NTI</span>
            )}
            {info.isISMPHighAlert && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">ISMP High-Alert</span>
            )}
            {info.isControlledSubstance && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">Controlled</span>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{info.primaryDanger}</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-red-200/50 dark:border-red-800/50 pt-2.5">
          {/* Critical Warning */}
          <div className={`flex items-start gap-2 text-xs p-2 rounded ${
            info.riskLevel === 'extreme' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
          }`}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="font-medium">{info.criticalWarning}</span>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase mb-1">
              <Shield className="h-3 w-3" />Risks
            </div>
            <div className="flex flex-wrap gap-1">
              {info.risks.map((r, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-red-100/50 dark:bg-red-900/20 text-red-700 dark:text-red-300">{r}</span>
              ))}
            </div>
          </div>

          {/* Key Interactions */}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">
              <Activity className="h-3 w-3" />Key Interactions
            </div>
            <div className="flex flex-wrap gap-1">
              {info.keyInteractions.map((k, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">{k}</span>
              ))}
            </div>
          </div>

          {/* Monitoring */}
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">
              <Eye className="h-3 w-3" />Required Monitoring
            </div>
            <ul className="space-y-0.5">
              {info.monitoring.map((m, i) => (
                <li key={i} className="text-[10px] text-gray-700 dark:text-gray-300 flex items-start gap-1">
                  <Pill className="h-2.5 w-2.5 shrink-0 mt-0.5 text-blue-500" />{m}
                </li>
              ))}
            </ul>
          </div>

          {/* Category + Use */}
          <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-3 pt-1 border-t border-gray-200/50 dark:border-gray-700/50">
            <span><strong>Category:</strong> {info.category}</span>
            <span><strong>Use:</strong> {info.use}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HighRiskDrugWarnings({ drugs }: Props) {
  const highRiskMatches = useMemo(() => {
    if (!drugs || drugs.length === 0) return [];
    const names = drugs.map(d => d.name).filter(Boolean);
    return findAllHighRiskDrugs(names);
  }, [drugs]);

  if (highRiskMatches.length === 0) return null;

  const extremeCount = highRiskMatches.filter(m => m.info.riskLevel === 'extreme').length;
  const highCount = highRiskMatches.filter(m => m.info.riskLevel === 'high').length;

  return (
    <div className="border-2 border-red-300 dark:border-red-800 rounded-xl bg-red-50/50 dark:bg-red-950/20 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-red-800 dark:text-red-200">
            High-Risk Medication{highRiskMatches.length !== 1 ? 's' : ''} Detected
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">
            {extremeCount > 0 && `${extremeCount} extreme risk`}
            {extremeCount > 0 && highCount > 0 && ' + '}
            {highCount > 0 && `${highCount} high risk`}
            {' — review safety warnings below'}
          </p>
        </div>
      </div>

      {/* Drug Warning Cards */}
      <div className="space-y-2">
        {highRiskMatches.map(({ drug, info }) => (
          <DrugWarningCard
            key={info.name}
            drug={drug}
            info={info}
            defaultExpanded={highRiskMatches.length <= 3}
          />
        ))}
      </div>

      {/* Safety Footer */}
      <div className="text-[10px] text-red-600/70 dark:text-red-400/70 border-t border-red-200/50 dark:border-red-800/50 pt-2">
        Source: ISMP High-Alert Medications List, FDA safety communications, clinical pharmacology references.
        These medications save lives when used correctly under medical supervision.
      </div>
    </div>
  );
}
