/** Build CDS Hooks 2.0 cards from findings. */
import { cardUuid } from './ruleIndex.js';

export const OVERRIDE_REASON_SYSTEM = 'https://oncosaferx.com/cds/override-reasons';
export const OVERRIDE_REASONS = [
  { code: 'not_clinically_relevant', display: 'Not clinically relevant for this patient' },
  { code: 'previously_tolerated', display: 'Patient has tolerated this combination before' },
  { code: 'benefit_outweighs_risk', display: 'Benefit outweighs risk' },
  { code: 'dose_already_adjusted', display: 'Dose already adjusted' },
  { code: 'monitoring_in_place', display: 'Monitoring is in place' },
  { code: 'no_alternative_available', display: 'No suitable alternative available' },
].map((r) => ({ ...r, system: OVERRIDE_REASON_SYSTEM }));

const MAX_CARDS = 4;
const trunc = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
const SOURCE = { label: 'OncoSafeRx decision support (draft rules, pending clinical review)' };

const INDICATOR = { critical: 'critical', high: 'warning', moderate: 'info', low: 'info' };
const TITLE = {
  dosing: (f) => `${f.action === 'avoid' ? 'Avoid' : f.action === 'hold' ? 'Hold' : f.action === 'reduce_dose' ? 'Dose adjustment' : 'Check'}: ${f.drugs.join(', ')}`,
  safety: (f) => (f.ruleId.startsWith('QT') ? `QT risk: ${f.drugs.slice(0, 3).join(' + ')}` : `Serotonin syndrome risk: ${f.drugs.slice(0, 3).join(' + ')}`),
  ddi: (f) => `Major interaction: ${f.drugs.join(' + ')}`,
  pgx: (f) => `Pharmacogenomic contraindication: ${f.drugs.join(', ')}`,
};

export function cardFor(finding) {
  const links = [];
  for (const c of finding.interaction?.citations || []) if (c.source_type === 'label' && c.url) links.push({ label: trunc(`FDA label: ${(c.title || 'DailyMed').replace(/\s*\[.*$/, '')}`, 80), url: c.url, type: 'absolute' });
  const citationNote = finding.interaction?.citation_status === 'label_mention' ? '' : finding.family === 'ddi' ? '\n\n_No FDA-label citation is attached to this interaction yet._' : '';
  const card = {
    uuid: cardUuid(finding.ruleId, finding.ruleVersion),
    summary: trunc(finding.kind === 'data_gap' ? finding.message.split(/(?<=\.)\s/)[0] : (TITLE[finding.family] || ((f) => f.message))(finding), 140),
    indicator: INDICATOR[finding.severity] || 'info',
    detail: `${finding.message}\n\n_Rule ${finding.ruleId} · status: ${finding.ruleStatus || 'draft'} · ${finding.source?.label || ''}_${citationNote}`,
    source: SOURCE,
    ...(links.length ? { links: links.slice(0, 2) } : {}),
  };
  if (card.indicator !== 'info') card.overrideReasons = OVERRIDE_REASONS;
  return card;
}

export function buildCards({ findings, missing = [], stale = [] }) {
  const cards = [];
  const actionable = findings.filter((f) => f.kind === 'finding');
  const gaps = findings.filter((f) => f.kind === 'data_gap');
  const ranked = [...actionable, ...gaps];
  for (const f of ranked.slice(0, MAX_CARDS)) cards.push(cardFor(f));
  if (ranked.length > MAX_CARDS) {
    cards.push({
      uuid: cardUuid('CDS-MORE-FINDINGS', '1'), indicator: 'info',
      summary: `${ranked.length - MAX_CARDS} more lower-priority finding(s) not shown`,
      detail: ranked.slice(MAX_CARDS).map((f) => `- ${f.ruleId}`).join('\n'), source: SOURCE,
    });
  }
  if (missing.length || stale.length) {
    cards.push({
      uuid: cardUuid('CDS-DATA-UNAVAILABLE', '1'), indicator: 'info',
      summary: 'Some patient data was not available for this check',
      detail: [missing.length ? `Not provided by the EHR: ${missing.join(', ')}.` : '', stale.length ? `Too old to use: ${stale.join(', ')}.` : '', 'Checks that depend on this data were not performed.'].filter(Boolean).join(' '),
      source: SOURCE,
    });
  }
  return cards;
}
