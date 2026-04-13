import React, { useMemo } from 'react'
import { AlertTriangle, Shield, Activity } from 'lucide-react'
import { analyzeCumulativeToxicity, getOverallToxicityRisk, type ToxicityResult } from '../../services/cumulativeToxicityService'

interface Props {
  drugs: string[]
}

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800',
  moderate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-800',
  none: 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
}

const CELL_COLORS: Record<string, string> = {
  active: 'bg-red-400 dark:bg-red-600',
  inactive: 'bg-gray-100 dark:bg-gray-800',
}

export default function CumulativeToxicityDashboard({ drugs }: Props) {
  const results = useMemo(() => analyzeCumulativeToxicity(drugs), [drugs])
  const overallRisk = useMemo(() => getOverallToxicityRisk(results), [results])
  const activeResults = results.filter(r => r.count > 0)

  if (drugs.length < 2) return null

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Cumulative Toxicity Analysis</h3>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${RISK_COLORS[overallRisk]}`}>
          Overall: {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)} Risk
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-500 dark:text-gray-400 font-medium py-1.5 pr-3 w-40">Domain</th>
              {drugs.map((drug, i) => (
                <th key={i} className="text-center text-gray-600 dark:text-gray-300 font-medium py-1.5 px-1 max-w-[80px] truncate" title={drug}>
                  {drug.length > 8 ? drug.slice(0, 7) + '...' : drug}
                </th>
              ))}
              <th className="text-center text-gray-500 dark:text-gray-400 font-medium py-1.5 px-2 w-16">Risk</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => (
              <tr key={result.domain} className="border-t border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-3 font-medium text-gray-700 dark:text-gray-300">{result.label}</td>
                {drugs.map((drug, i) => {
                  const isActive = result.matchingDrugs.some(d => d.toLowerCase() === drug.toLowerCase())
                  return (
                    <td key={i} className="py-2 px-1 text-center">
                      <div className={`w-6 h-6 mx-auto rounded ${isActive ? CELL_COLORS.active : CELL_COLORS.inactive}`}
                        title={isActive ? `${drug} contributes to ${result.label}` : ''} />
                    </td>
                  )
                })}
                <td className="py-2 px-2 text-center">
                  {result.risk !== 'none' && (
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${RISK_COLORS[result.risk]}`}>
                      {result.count}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monitoring Recommendations */}
      {activeResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1">
            <Shield className="h-3.5 w-3.5" /> Monitoring Recommendations
          </h4>
          {activeResults
            .sort((a, b) => b.count - a.count)
            .map(r => (
              <div key={r.domain} className={`text-xs rounded-lg px-3 py-2 border ${RISK_COLORS[r.risk]}`}>
                <div className="font-medium">{r.label} ({r.count} agent{r.count !== 1 ? 's' : ''}: {r.matchingDrugs.join(', ')})</div>
                <div className="mt-0.5 opacity-80">{r.monitoring}</div>
              </div>
            ))}
        </div>
      )}

      {activeResults.length === 0 && (
        <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          No cumulative toxicity concerns detected with the current drug combination.
        </div>
      )}
    </div>
  )
}
