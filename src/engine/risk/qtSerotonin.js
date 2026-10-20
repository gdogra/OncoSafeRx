/**
 * Whole-regimen QT-prolongation and serotonin-syndrome screens.
 *
 * A rule-based screen over the regimen's drugs plus concomitant medications. It is NOT a
 * validated risk score. Drug lists and thresholds live in data/qt_serotonin.yaml (draft,
 * pending clinical review and a CredibleMeds data license; see that file).
 * Absence of a drug from the lists does not mean it is safe.
 */
import { createHash } from 'node:crypto';
import { SAFETY_LISTS } from './lists.generated.js';

const L = SAFETY_LISTS;
// Changes whenever any list or threshold changes, so recorded overrides tie to the lists in force.
export const SAFETY_LISTS_VERSION = createHash('sha256').update(JSON.stringify(L)).digest('hex').slice(0, 12);

const SOURCES = {
  qt: { label: 'QT drug tiers modelled on CredibleMeds (known/possible/conditional risk of TdP); verify against the live list' },
  ser: { label: 'FDA labeling for serotonergic drugs and MAO inhibitors (serotonin syndrome warnings)' },
};

const RISK_CONDITIONS = new Set(['congenital_long_qt', 'heart_failure', 'bradycardia', 'recent_mi', 'structural_heart_disease']);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function buildMatchers(entries) {
  return entries.map(({ name, ...rest }) => ({ name, re: new RegExp(`(^|[^a-z])${esc(name.toLowerCase())}($|[^a-z])`), ...rest }));
}
const QT_MATCHERS = buildMatchers(Object.entries(L.qt_drugs).flatMap(([tier, names]) => names.map((name) => ({ name, tier }))));
const SER_MATCHERS = buildMatchers(Object.entries(L.serotonergic_drugs).flatMap(([cls, names]) => names.map((name) => ({ name, cls }))));
const ALIAS = Object.entries(L.aliases).map(([a, t]) => ({ re: new RegExp(`(^|[^a-z])${esc(a.toLowerCase())}($|[^a-z])`), target: t.toLowerCase() }));

function canonicalText(input) {
  let t = String(input || '').toLowerCase().replace(/[’`]/g, "'");
  for (const { re, target } of ALIAS) if (re.test(t)) t += ` ${target}`;
  return t;
}

function classify(drugs, matchers) {
  const found = new Map();
  for (const d of drugs) {
    const text = canonicalText(d.name);
    for (const m of matchers) {
      if (m.re.test(text) && !found.has(m.name)) found.set(m.name, { name: m.name, tier: m.tier || m.cls, origin: d.origin, input: d.name });
    }
  }
  return [...found.values()];
}

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function normalizeDrugs({ components = [], medications = [] }) {
  const comp = components.map((c) => ({ name: typeof c === 'string' ? c : c.name, origin: 'regimen' }));
  const meds = (Array.isArray(medications) ? medications : []).map((m) => ({ name: typeof m === 'string' ? m : (m?.name || ''), origin: 'concomitant' }));
  return [...comp, ...meds].filter((d) => d.name);
}

function finding(ruleId, props) {
  return { ruleId, ruleVersion: SAFETY_LISTS_VERSION, ruleStatus: L.status, kind: 'finding', ...props };
}

export function evaluateQt({ drugs, labs = {}, patient = {}, riskConditions = [] }) {
  const t = L.thresholds;
  const hits = classify(drugs, QT_MATCHERS);
  const known = hits.filter((h) => h.tier === 'known');
  const possible = hits.filter((h) => h.tier === 'possible');
  const conditional = hits.filter((h) => h.tier === 'conditional');
  if (!hits.length) return { hits, factors: [], findings: [] };

  const qtc = num(labs.QTc);
  const k = num(labs.potassium);
  const mg = num(labs.magnesium);
  const female = String(patient.sex || '').toLowerCase().startsWith('f');
  const factors = [];
  if (qtc !== null && qtc >= t.qtc_critical_ms) factors.push('qtc_critical');
  else if (qtc !== null && qtc >= (female ? t.qtc_prolonged_female_ms : t.qtc_prolonged_male_ms)) factors.push('qtc_prolonged');
  if (k !== null && k < t.potassium_low_mmol_l) factors.push('hypokalemia');
  if (mg !== null && mg < t.magnesium_low_mg_dl) factors.push('hypomagnesemia');
  if (female) factors.push('female_sex');
  if (num(patient.ageYears) !== null && patient.ageYears >= t.age_risk_years) factors.push('age_65_plus');
  for (const c of riskConditions) if (RISK_CONDITIONS.has(c)) factors.push(c);

  const drivers = hits.map((h) => `${h.name} (${h.tier}${h.origin === 'concomitant' ? ', concomitant' : ''})`);
  const names = hits.map((h) => h.name);
  const significant = known.length + possible.length; // conditional drugs matter mainly through other factors
  const modifiable = factors.filter((f) => ['hypokalemia', 'hypomagnesemia'].includes(f));
  const monitorTail = ' Obtain/repeat an ECG and keep potassium and magnesium replete.';
  const out = [];

  if (factors.includes('qtc_critical') && significant >= 1) {
    out.push(finding('QT-BASELINE-CRITICAL', { action: 'avoid', severity: 'critical', drugs: names,
      message: `Baseline QTc is at or above ${t.qtc_critical_ms} ms with QT-prolonging drug(s): ${drivers.join(', ')}. Avoid or replace unless the benefit clearly outweighs the risk; correct electrolytes and involve cardiology.`,
      source: SOURCES.qt }));
  } else if (known.length >= 2 || (known.length >= 1 && factors.includes('congenital_long_qt'))) {
    out.push(finding('QT-MULTIPLE-KNOWN', { action: 'review', severity: 'critical', drugs: names,
      message: `Multiple known-risk QT drugs or known-risk drug with congenital long QT: ${drivers.join(', ')}. Review necessity, consider lower-risk alternatives for the non-essential agent(s), and monitor ECG.${monitorTail}`,
      source: SOURCES.qt }));
  } else if ((known.length >= 1 && (possible.length >= 1 || factors.length >= 2 || (conditional.length >= 1 && modifiable.length >= 1))) || significant >= 3) {
    out.push(finding('QT-ELEVATED', { action: 'monitor', severity: 'high', drugs: names,
      message: `Elevated QT risk: ${drivers.join(', ')}${factors.length ? `; risk factors: ${factors.join(', ')}` : ''}.${monitorTail}`,
      source: SOURCES.qt }));
  } else if (known.length === 1 || possible.length >= 2 || (significant >= 1 && factors.length >= 2)) {
    out.push(finding('QT-MODERATE', { action: 'monitor', severity: 'moderate', drugs: names,
      message: `QT-prolonging drug(s) present: ${drivers.join(', ')}${factors.length ? `; risk factors: ${factors.join(', ')}` : ''}. Consider a baseline ECG and electrolyte check.`,
      source: SOURCES.qt }));
  } else if (modifiable.length || significant >= 1) {
    out.push(finding('QT-LOW', { action: 'info', severity: 'low', drugs: names,
      message: `QT-related drug(s): ${drivers.join(', ')}. Risk is mainly through other factors${modifiable.length ? ` (${modifiable.join(', ')} present; correct them)` : ''}.`,
      source: SOURCES.qt }));
  }

  if (significant >= 1) {
    const gaps = [];
    if (qtc === null) gaps.push('baseline ECG/QTc');
    if (k === null) gaps.push('potassium');
    if (mg === null) gaps.push('magnesium');
    if (gaps.length) {
      out.push({ ruleId: 'QT-DATA-GAP', ruleVersion: SAFETY_LISTS_VERSION, ruleStatus: L.status, kind: 'data_gap', action: 'info', severity: 'moderate', drugs: names,
        message: `QT-prolonging drug(s) present (${drivers.join(', ')}) but no ${gaps.join(', ')} provided; those checks were not performed.`, source: SOURCES.qt });
    }
  }
  return { hits, factors, findings: out };
}

export function evaluateSerotonin({ drugs }) {
  const hits = classify(drugs, SER_MATCHERS);
  const maoi = hits.filter((h) => h.tier === 'maoi');
  const high = hits.filter((h) => h.tier === 'high');
  const moderate = hits.filter((h) => h.tier === 'moderate');
  const names = hits.map((h) => h.name);
  const drivers = hits.map((h) => `${h.name} (${h.tier})`).join(', ');
  const symptoms = ' Counsel on symptoms: agitation, tremor, sweating, diarrhea, fever, muscle rigidity or clonus.';
  const f = (ruleId, props) => [{ ruleId, ruleVersion: SAFETY_LISTS_VERSION, ruleStatus: L.status, kind: 'finding', drugs: names, source: SOURCES.ser, ...props }];
  let findings = [];
  if (hits.length < 2) return { hits, findings };
  if (maoi.length >= 1) {
    findings = f('SEROTONIN-MAOI-COMBINATION', { action: 'avoid', severity: 'critical',
      message: `MAO inhibitor (or drug with MAO-inhibiting activity) combined with other serotonergic drug(s): ${drivers}. Avoid the combination; labeling for linezolid and methylene blue allows it only in urgent situations with close monitoring.${symptoms}` });
  } else if (high.length >= 2) {
    findings = f('SEROTONIN-MULTIPLE-HIGH', { action: 'review', severity: 'high',
      message: `Two or more strongly serotonergic drugs: ${drivers}. Review necessity and dose; prefer a single agent where possible.${symptoms}` });
  } else if ((high.length >= 1 && moderate.length >= 1) || moderate.length >= 3) {
    findings = f('SEROTONIN-MODERATE', { action: 'monitor', severity: 'moderate',
      message: `Combined serotonergic load: ${drivers}. Common in oncology supportive care (e.g., antidepressant plus 5-HT3 antiemetic); monitor for serotonin toxicity.${symptoms}` });
  } else {
    findings = f('SEROTONIN-LOW', { action: 'info', severity: 'low',
      message: `Two mildly serotonergic drugs: ${drivers}. Low risk; be aware if another serotonergic agent is added.` });
  }
  return { hits, findings };
}

export function evaluateRegimenSafety({ components, medications, labs, patient, riskConditions }) {
  const drugs = normalizeDrugs({ components, medications });
  const qt = evaluateQt({ drugs, labs, patient, riskConditions });
  const serotonin = evaluateSerotonin({ drugs });
  return { qt, serotonin, findings: [...qt.findings, ...serotonin.findings] };
}
