/**
 * Pure dosing-rule evaluator. No I/O. Rules come from data/dosing_rules.yaml
 * (via the generated module) so clinicians can review them as data.
 */
import { createHash } from 'node:crypto';
import { DOSING_RULES, DOSE_CAPS } from './rules.generated.js';
import { parseDose } from './parseDose.js';
import { calculateBSA, calculateCrCl } from '../calculators.js';

// Content hash of a rule: changes whenever the rule's wording, thresholds or source change,
// so recorded overrides can be tied to the exact rule version the clinician saw.
export const ruleVersion = (rule) => createHash('sha256').update(JSON.stringify(rule)).digest('hex').slice(0, 12);
const VERSIONS = new Map([...DOSING_RULES, ...DOSE_CAPS].map((r) => [r.id, ruleVersion(r)]));

const SEVERITY_RANK = { critical: 4, high: 3, moderate: 2, low: 1 };
const UNKNOWN_PHENOTYPES = new Set(['', 'unknown', 'indeterminate', 'not tested', 'n/a', 'na', 'none']);

const num = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const norm = (s) => String(s || '').trim().toLowerCase();

function matchedComponents(rule, components) {
  if (rule.drugs.includes('*')) return components.map((c) => c.name);
  return components
    .filter((c) => rule.drugs.some((d) => norm(c.name).includes(norm(d))))
    .map((c) => c.name);
}

function phenotypeValue(phenotypes, gene) {
  const key = Object.keys(phenotypes || {}).find((k) => k.toUpperCase() === gene.toUpperCase());
  const v = key ? norm(phenotypes[key]) : '';
  return UNKNOWN_PHENOTYPES.has(v) ? null : v;
}

function conditionHolds(when, labs, phenotypes) {
  if (when.lab) {
    const v = labs[when.lab];
    if (v === null || v === undefined) return false; // absent data never triggers a threshold rule
    if (when.lt !== undefined && !(v < when.lt)) return false;
    if (when.gte !== undefined && !(v >= when.gte)) return false;
    return true;
  }
  if (when.phenotype) {
    const v = phenotypeValue(phenotypes, when.phenotype);
    return v !== null && when.in.some((p) => v.includes(norm(p)));
  }
  if (when.missing_lab) return labs[when.missing_lab] === null || labs[when.missing_lab] === undefined;
  if (when.missing_phenotype) return phenotypeValue(phenotypes, when.missing_phenotype) === null;
  return false;
}

export function evaluateRegimen({ regimen, labs = {}, phenotypes = {}, patient = {}, rounding = 5 }) {
  const components = regimen.components || [];

  const cleanLabs = {};
  for (const k of ['ANC', 'platelets', 'CrCl', 'LVEF']) cleanLabs[k] = num(labs[k]);
  const bsa = calculateBSA(patient.heightCm, patient.weightKg);
  if (cleanLabs.CrCl === null) {
    cleanLabs.CrCl = calculateCrCl({
      ageYears: patient.ageYears, weightKg: patient.weightKg,
      serumCreatinineMgDl: patient.serumCreatinineMgDl, sex: patient.sex,
    });
  }

  const findings = [];
  for (const rule of DOSING_RULES) {
    const drugs = matchedComponents(rule, components);
    if (!drugs.length) continue;
    if (!conditionHolds(rule.when, cleanLabs, phenotypes)) continue;
    findings.push({
      ruleId: rule.id, ruleVersion: VERSIONS.get(rule.id), action: rule.action, severity: rule.severity, message: rule.message,
      drugs, source: rule.source, ruleStatus: rule.status,
      kind: rule.action === 'info' ? 'data_gap' : 'finding',
    });
  }

  const unit = num(rounding) || 5;
  const calculatedDoses = components.map((c) => {
    const parsed = parseDose(c.dose);
    const base = { component: c.name, dose: c.dose };
    if (parsed.kind === 'ambiguous') return { ...base, note: `Not calculated: ${parsed.reason}. Choose the intended schedule.` };
    if (parsed.kind !== 'bsa') return base;
    if (!bsa) return { ...base, note: 'Not calculated: height and weight are needed for BSA.' };
    const calculatedMg = parsed.mgPerM2 * bsa;
    let roundedMg = Math.round(calculatedMg / unit) * unit;
    const out = { ...base, calculatedMg: Math.round(calculatedMg), roundedMg, note: `Standard dose, unadjusted. Rounded to nearest ${unit} mg.` };
    const caps = DOSE_CAPS.filter((cap) => norm(c.name).includes(norm(cap.drug)));
    const capMg = Math.min(...[parsed.capMg, ...caps.map((cap) => cap.max_mg)].filter((x) => x !== undefined), Infinity);
    if (Number.isFinite(capMg) && calculatedMg > capMg) {
      out.cappedMg = capMg;
      out.roundedMg = capMg;
      const cap = caps[0];
      findings.push({
        ruleId: cap?.id || 'DOSE-CAP', ruleVersion: VERSIONS.get(cap?.id), action: 'cap', severity: 'high',
        message: `${c.name}: calculated ${Math.round(calculatedMg)} mg exceeds the ${capMg} mg cap; capped at ${capMg} mg.`,
        drugs: [c.name], source: cap?.source || { label: 'Regimen-listed maximum dose' }, ruleStatus: cap?.status || 'draft', kind: 'finding',
      });
    }
    return out;
  });

  findings.sort((a, b) => (SEVERITY_RANK[b.severity] || 0) - (SEVERITY_RANK[a.severity] || 0));
  return { calculators: { BSA: bsa, CrCl: cleanLabs.CrCl }, findings, calculatedDoses };
}

export default evaluateRegimen;
