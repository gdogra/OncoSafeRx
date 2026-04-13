/**
 * Real-Time FDA Safety Alerts
 * Pulls drug recalls and safety warnings from OpenFDA (free, CORS-enabled, no API key).
 */

export interface SafetyAlert {
  drugName: string
  alertType: 'recall' | 'warning' | 'label_change'
  title: string
  date: string
  severity: 'high' | 'medium' | 'low'
  description: string
  url?: string
}

// Simple in-memory cache (1 minute TTL)
const cache = new Map<string, { data: SafetyAlert[]; ts: number }>()
const CACHE_TTL = 60_000

/**
 * Fetch safety alerts for a list of drugs
 */
export async function fetchSafetyAlerts(drugNames: string[]): Promise<SafetyAlert[]> {
  const allAlerts: SafetyAlert[] = []

  for (const drug of drugNames) {
    const lower = drug.toLowerCase()
    const cached = cache.get(lower)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      allAlerts.push(...cached.data)
      continue
    }

    const alerts: SafetyAlert[] = []
    const encoded = encodeURIComponent(lower)

    try {
      // Drug enforcement (recalls)
      const enfRes = await fetch(
        `https://api.fda.gov/drug/enforcement.json?search=openfda.generic_name:"${encoded}"&limit=3`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (enfRes.ok) {
        const enfData = await enfRes.json()
        for (const r of (enfData.results || []).slice(0, 2)) {
          const isClass1 = r.classification === 'Class I'
          alerts.push({
            drugName: drug,
            alertType: 'recall',
            title: `${r.classification || 'Recall'}: ${(r.reason_for_recall || '').slice(0, 120)}`,
            date: r.report_date || r.recall_initiation_date || '',
            severity: isClass1 ? 'high' : 'medium',
            description: (r.reason_for_recall || '').slice(0, 300),
          })
        }
      }
    } catch { /* skip on timeout/error */ }

    try {
      // Boxed warnings from drug labels
      const labelRes = await fetch(
        `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encoded}"+AND+boxed_warning:[""TO*]&limit=1`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (labelRes.ok) {
        const labelData = await labelRes.json()
        const label = labelData.results?.[0]
        if (label?.boxed_warning?.[0]) {
          const warning = label.boxed_warning[0]
          alerts.push({
            drugName: drug,
            alertType: 'warning',
            title: `Boxed Warning: ${drug}`,
            date: label.effective_time || '',
            severity: 'high',
            description: warning.slice(0, 400),
          })
        }
      }
    } catch { /* skip */ }

    cache.set(lower, { data: alerts, ts: Date.now() })
    allAlerts.push(...alerts)

    // Small delay between drugs to be polite to OpenFDA
    await new Promise(r => setTimeout(r, 200))
  }

  return allAlerts.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 }
    return (sev[b.severity] || 0) - (sev[a.severity] || 0)
  })
}

/**
 * Check if there are any active alerts for the given drugs
 */
export async function hasActiveAlerts(drugNames: string[]): Promise<boolean> {
  const alerts = await fetchSafetyAlerts(drugNames)
  return alerts.length > 0
}
