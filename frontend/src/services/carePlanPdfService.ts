/**
 * Care Plan PDF Export Service
 * Generates a print-optimized HTML care plan document.
 * Uses window.print() — no jspdf dependency needed.
 */

interface CarePlanData {
  patientName?: string
  patientAge?: number
  generatedDate: string
  medications: string[]
  interactions: { drugs: string[]; severity: string; score: number; mechanism: string; management: string }[]
  toxicityResults: { label: string; risk: string; matchingDrugs: string[]; monitoring: string }[]
  alternatives: { forDrug: string; alternative: string; rationale: string }[]
  pgxAlerts: { gene: string; phenotype: string; drug: string; recommendation: string }[]
  monitoringSchedule: { parameter: string; frequency: string; rationale: string }[]
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function generateCarePlanHTML(data: CarePlanData): string {
  const { patientName, patientAge, generatedDate, medications, interactions, toxicityResults, alternatives, pgxAlerts, monitoringSchedule } = data

  const activeToxicities = toxicityResults.filter(t => t.risk !== 'none')
  const majorInteractions = interactions.filter(i => i.score >= 6)

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>OncoSafeRx Care Plan</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; line-height: 1.5; color: #1a1a1a; padding: 20px; }
  h1 { font-size: 18px; color: #1e40af; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 3px; margin: 16px 0 8px; }
  h3 { font-size: 11px; font-weight: 600; margin: 8px 0 4px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1e40af; padding-bottom: 8px; margin-bottom: 12px; }
  .meta { color: #666; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 10px; }
  th { background: #f0f4ff; text-align: left; padding: 4px 6px; border: 1px solid #ddd; font-weight: 600; }
  td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: top; }
  .risk-critical { background: #fef2f2; color: #991b1b; font-weight: 600; }
  .risk-high { background: #fff7ed; color: #9a3412; font-weight: 600; }
  .risk-moderate { background: #fffbeb; color: #92400e; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; }
  .badge-red { background: #fecaca; color: #991b1b; }
  .badge-orange { background: #fed7aa; color: #9a3412; }
  .badge-green { background: #bbf7d0; color: #166534; }
  .disclaimer { font-size: 9px; color: #888; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 8px; }
  .section { page-break-inside: avoid; }
  @media print { body { padding: 0; } }
</style></head><body>

<div class="header">
  <div>
    <h1>OncoSafeRx Clinical Care Plan</h1>
    <div class="meta">${patientName ? `Patient: ${escapeHtml(patientName)}${patientAge ? ` (Age ${patientAge})` : ''}` : 'Patient care plan'}</div>
  </div>
  <div style="text-align:right">
    <div class="meta">Generated: ${escapeHtml(generatedDate)}</div>
    <div class="meta">oncosaferx.com</div>
  </div>
</div>

<div class="section">
<h2>Current Medications (${medications.length})</h2>
<table><tr><th>#</th><th>Medication</th></tr>
${medications.map((m, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(m)}</td></tr>`).join('')}
</table></div>

${majorInteractions.length > 0 ? `<div class="section">
<h2>Drug Interactions Requiring Attention (${majorInteractions.length})</h2>
<table><tr><th>Drugs</th><th>Risk</th><th>Mechanism</th><th>Management</th></tr>
${majorInteractions.map(i => `<tr class="${i.score >= 8 ? 'risk-critical' : i.score >= 6 ? 'risk-high' : ''}">
  <td>${escapeHtml(i.drugs.join(' + '))}</td>
  <td><span class="badge ${i.score >= 8 ? 'badge-red' : 'badge-orange'}">${i.score}/10</span> ${escapeHtml(i.severity)}</td>
  <td>${escapeHtml(i.mechanism)}</td>
  <td>${escapeHtml(i.management)}</td>
</tr>`).join('')}
</table></div>` : ''}

${activeToxicities.length > 0 ? `<div class="section">
<h2>Cumulative Toxicity Risks</h2>
<table><tr><th>Domain</th><th>Risk Level</th><th>Contributing Drugs</th><th>Monitoring</th></tr>
${activeToxicities.map(t => `<tr class="${t.risk === 'critical' ? 'risk-critical' : t.risk === 'high' ? 'risk-high' : 'risk-moderate'}">
  <td>${escapeHtml(t.label)}</td>
  <td><span class="badge ${t.risk === 'critical' ? 'badge-red' : t.risk === 'high' ? 'badge-orange' : 'badge-green'}">${escapeHtml(t.risk)}</span></td>
  <td>${escapeHtml(t.matchingDrugs.join(', '))}</td>
  <td>${escapeHtml(t.monitoring)}</td>
</tr>`).join('')}
</table></div>` : ''}

${alternatives.length > 0 ? `<div class="section">
<h2>Suggested Alternatives</h2>
<table><tr><th>Replace</th><th>With</th><th>Rationale</th></tr>
${alternatives.map(a => `<tr><td>${escapeHtml(a.forDrug)}</td><td><strong>${escapeHtml(a.alternative)}</strong></td><td>${escapeHtml(a.rationale)}</td></tr>`).join('')}
</table></div>` : ''}

${pgxAlerts.length > 0 ? `<div class="section">
<h2>Pharmacogenomic Considerations</h2>
<table><tr><th>Gene</th><th>Phenotype</th><th>Drug</th><th>Recommendation</th></tr>
${pgxAlerts.map(p => `<tr><td>${escapeHtml(p.gene)}</td><td>${escapeHtml(p.phenotype)}</td><td>${escapeHtml(p.drug)}</td><td>${escapeHtml(p.recommendation)}</td></tr>`).join('')}
</table></div>` : ''}

${monitoringSchedule.length > 0 ? `<div class="section">
<h2>Monitoring Schedule</h2>
<table><tr><th>Parameter</th><th>Frequency</th><th>Rationale</th></tr>
${monitoringSchedule.map(m => `<tr><td>${escapeHtml(m.parameter)}</td><td>${escapeHtml(m.frequency)}</td><td>${escapeHtml(m.rationale)}</td></tr>`).join('')}
</table></div>` : ''}

<div class="disclaimer">
  <strong>Disclaimer:</strong> This care plan is generated by OncoSafeRx for clinical decision support only.
  It does not replace professional medical judgment. All drug interactions and recommendations should be
  verified by a qualified healthcare provider before clinical action. Drug interaction data sourced from
  FDA, CPIC, and peer-reviewed clinical literature.
</div>

</body></html>`
}

/**
 * Open care plan in a new window for printing
 */
export function printCarePlan(data: CarePlanData): void {
  const html = generateCarePlanHTML(data)
  const win = window.open('', '_blank', 'width=800,height=1000')
  if (win) {
    win.document.write(html)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }
}
