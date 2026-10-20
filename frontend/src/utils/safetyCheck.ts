import type { AdjustRequest, Finding, OverrideBody, Severity, SmartPatient } from '../services/safetyCheckService';

export interface FormState {
  sex: string; ageYears: string; weightKg: string; heightCm: string; serumCreatinineMgDl: string;
  ANC: string; platelets: string; LVEF: string; QTc: string; potassium: string; magnesium: string;
  DPYD: string; UGT1A1: string;
}

export const EMPTY_FORM: FormState = {
  sex: '', ageYears: '', weightKg: '', heightCm: '', serumCreatinineMgDl: '',
  ANC: '', platelets: '', LVEF: '', QTc: '', potassium: '', magnesium: '', DPYD: '', UGT1A1: '',
};

export interface NumericField { key: keyof FormState; label: string; unit: string; min: number; max: number; step: string; group: 'patient' | 'labs'; provenanceKey?: string }

export const NUMERIC_FIELDS: NumericField[] = [
  { key: 'ageYears', label: 'Age', unit: 'years', min: 0, max: 120, step: '1', group: 'patient' },
  { key: 'weightKg', label: 'Weight', unit: 'kg', min: 1, max: 400, step: '0.1', group: 'patient', provenanceKey: 'weightKg' },
  { key: 'heightCm', label: 'Height', unit: 'cm', min: 30, max: 250, step: '0.1', group: 'patient', provenanceKey: 'heightCm' },
  { key: 'serumCreatinineMgDl', label: 'Serum creatinine', unit: 'mg/dL', min: 0.1, max: 20, step: '0.01', group: 'patient', provenanceKey: 'creatinine' },
  { key: 'ANC', label: 'ANC', unit: '/µL', min: 0, max: 100000, step: '10', group: 'labs', provenanceKey: 'ANC' },
  { key: 'platelets', label: 'Platelets', unit: '/µL', min: 0, max: 2000000, step: '1000', group: 'labs', provenanceKey: 'platelets' },
  { key: 'LVEF', label: 'LVEF', unit: '%', min: 5, max: 90, step: '1', group: 'labs', provenanceKey: 'LVEF' },
  { key: 'QTc', label: 'QTc', unit: 'ms', min: 200, max: 800, step: '1', group: 'labs', provenanceKey: 'QTc' },
  { key: 'potassium', label: 'Potassium', unit: 'mmol/L', min: 1, max: 9, step: '0.1', group: 'labs', provenanceKey: 'potassium' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg/dL', min: 0.2, max: 6, step: '0.1', group: 'labs', provenanceKey: 'magnesium' },
];

export const PHENOTYPE_OPTIONS = ['', 'Normal metabolizer', 'Intermediate metabolizer', 'Poor metabolizer'];

export const OVERRIDE_REASONS: { code: string; label: string }[] = [
  { code: 'not_clinically_relevant', label: 'Not clinically relevant for this patient' },
  { code: 'previously_tolerated', label: 'Patient has tolerated this before' },
  { code: 'benefit_outweighs_risk', label: 'Benefit outweighs risk' },
  { code: 'dose_already_adjusted', label: 'Dose already adjusted' },
  { code: 'monitoring_in_place', label: 'Monitoring is in place' },
  { code: 'no_alternative_available', label: 'No suitable alternative available' },
  { code: 'other', label: 'Other (explain)' },
];

const str = (n: number | undefined) => (n === undefined || n === null ? '' : String(n));

/** Pre-fill the form from EHR data. Values the server withheld (stale/unconvertible) stay blank. */
export function formFromSmart(p: SmartPatient): FormState {
  const { patient, labs } = p.dosingInputs;
  return {
    ...EMPTY_FORM,
    sex: patient.sex || '', ageYears: str(patient.ageYears), weightKg: str(patient.weightKg), heightCm: str(patient.heightCm),
    serumCreatinineMgDl: str(patient.serumCreatinineMgDl),
    ANC: str(labs.ANC), platelets: str(labs.platelets), LVEF: str(labs.LVEF), QTc: str(labs.QTc),
    potassium: str(labs.potassium), magnesium: str(labs.magnesium),
  };
}

/** Which fields came from the EHR (and so should carry a provenance chip). */
export function ehrFields(p: SmartPatient): Set<keyof FormState> {
  const out = new Set<keyof FormState>();
  const { patient, labs } = p.dosingInputs;
  if (patient.sex) out.add('sex');
  if (patient.ageYears !== undefined) out.add('ageYears');
  if (patient.weightKg !== undefined) out.add('weightKg');
  if (patient.heightCm !== undefined) out.add('heightCm');
  if (patient.serumCreatinineMgDl !== undefined) out.add('serumCreatinineMgDl');
  for (const k of ['ANC', 'platelets', 'LVEF', 'QTc', 'potassium', 'magnesium'] as const) if (labs[k] !== undefined) out.add(k);
  return out;
}

export interface FieldError { field: keyof FormState; message: string }

/** Build the /api/dosing/adjust body. Blank fields are omitted so the server reports them as data gaps. */
export function buildRequest(form: FormState, regimenId: string, medications: string[]): { body?: AdjustRequest; errors: FieldError[] } {
  const errors: FieldError[] = [];
  if (!regimenId) return { errors: [{ field: 'sex', message: 'Choose a regimen' }] };
  const patient: Record<string, number | string> = {};
  const labs: Record<string, number> = {};
  for (const f of NUMERIC_FIELDS) {
    const raw = form[f.key].trim();
    if (raw === '') continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < f.min || n > f.max) {
      errors.push({ field: f.key, message: `${f.label} must be between ${f.min} and ${f.max} ${f.unit}` });
      continue;
    }
    if (f.group === 'patient') patient[f.key] = n; else labs[f.key] = n;
  }
  if (form.sex) patient.sex = form.sex;
  const phenotypes: Record<string, string> = {};
  if (form.DPYD) phenotypes.DPYD = form.DPYD;
  if (form.UGT1A1) phenotypes.UGT1A1 = form.UGT1A1;
  if (errors.length) return { errors };
  return { body: { regimenId, patient, labs, phenotypes, medications: medications.map((m) => m.trim()).filter(Boolean) }, errors };
}

const ORDER: Severity[] = ['critical', 'high', 'moderate', 'low'];

export function groupFindings(findings: Finding[]) {
  const actionable = findings.filter((f) => f.kind === 'finding');
  const gaps = findings.filter((f) => f.kind === 'data_gap');
  const bySeverity = ORDER.map((s) => ({ severity: s, items: actionable.filter((f) => f.severity === s) })).filter((g) => g.items.length);
  return { bySeverity, gaps, total: actionable.length };
}

export const SEVERITY_LABEL: Record<Severity, string> = { critical: 'Critical', high: 'High', moderate: 'Moderate', low: 'Low' };

export const ACTION_LABEL: Record<string, string> = {
  avoid: 'Avoid', hold: 'Hold', delay: 'Delay cycle', reduce_dose: 'Reduce dose', cap: 'Dose cap', monitor: 'Monitor', review: 'Review', info: 'Information',
};

export function overrideBody(f: Finding, action: 'accept' | 'override', regimenId: string, reasonCode?: string, reasonText?: string): OverrideBody {
  return {
    action, source: 'dosing', ruleId: f.ruleId, ...(f.ruleVersion ? { ruleVersion: f.ruleVersion } : {}),
    ...(action === 'override' ? { reasonCode } : {}),
    ...(action === 'override' && reasonText?.trim() ? { reasonText: reasonText.trim() } : {}),
    context: { regimenId, surface: 'safety-check' },
  };
}

export function ageLabel(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
