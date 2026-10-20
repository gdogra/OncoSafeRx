import { describe, expect, it } from 'vitest';
import { EMPTY_FORM, buildRequest, ehrFields, formFromSmart, groupFindings, overrideBody, ageLabel } from '../safetyCheck';
import type { Finding, SmartPatient } from '../../services/safetyCheckService';

const smart = (over: Partial<SmartPatient['dosingInputs']> = {}): SmartPatient => ({
  patientId: 'p1', provenance: {}, staleFields: [], staleValues: {}, unconverted: [], medicationsUnresolved: 0, notes: [],
  dosingInputs: { patient: { sex: 'female', ageYears: 62, weightKg: 70 }, labs: { ANC: 1200, potassium: 3.2 }, medications: ['Ondansetron'], ...over },
});

const f = (over: Partial<Finding>): Finding => ({ ruleId: 'R', kind: 'finding', action: 'avoid', severity: 'critical', message: 'm', drugs: ['x'], ...over });

describe('formFromSmart / ehrFields', () => {
  it('prefills only what the EHR supplied and leaves withheld values blank', () => {
    const form = formFromSmart(smart());
    expect(form).toMatchObject({ sex: 'female', ageYears: '62', weightKg: '70', ANC: '1200', potassium: '3.2', QTc: '', platelets: '' });
    expect([...ehrFields(smart())].sort()).toEqual(['ANC', 'ageYears', 'potassium', 'sex', 'weightKg']);
  });
});

describe('buildRequest', () => {
  it('omits blank fields so the server reports them as data gaps, and trims medications', () => {
    const { body, errors } = buildRequest({ ...EMPTY_FORM, ageYears: '60', ANC: '1500', DPYD: 'Poor metabolizer' }, 'FOLFOX-6', [' ondansetron ', '']);
    expect(errors).toEqual([]);
    expect(body).toEqual({ regimenId: 'FOLFOX-6', patient: { ageYears: 60 }, labs: { ANC: 1500 }, phenotypes: { DPYD: 'Poor metabolizer' }, medications: ['ondansetron'] });
  });

  it('rejects out-of-range and non-numeric values instead of sending them', () => {
    const { body, errors } = buildRequest({ ...EMPTY_FORM, weightKg: '7000', QTc: 'abc', potassium: '4.0' }, 'CAPOX', []);
    expect(body).toBeUndefined();
    expect(errors.map((e) => e.field).sort()).toEqual(['QTc', 'weightKg']);
  });

  it('requires a regimen', () => {
    expect(buildRequest(EMPTY_FORM, '', []).body).toBeUndefined();
  });
});

describe('groupFindings', () => {
  it('orders by severity and separates data gaps', () => {
    const g = groupFindings([f({ ruleId: 'A', severity: 'high' }), f({ ruleId: 'B', severity: 'critical' }), f({ ruleId: 'G', kind: 'data_gap', action: 'info', severity: 'moderate' })]);
    expect(g.bySeverity.map((x) => x.severity)).toEqual(['critical', 'high']);
    expect(g.gaps.map((x) => x.ruleId)).toEqual(['G']);
    expect(g.total).toBe(2);
  });
});

describe('overrideBody', () => {
  it('carries rule id + version and never a patient identifier', () => {
    const b = overrideBody(f({ ruleId: 'DPYD-POOR', ruleVersion: 'abc123abc123' }), 'override', 'FOLFOX-6', 'other', '  palliative  ');
    expect(b).toEqual({ action: 'override', source: 'dosing', ruleId: 'DPYD-POOR', ruleVersion: 'abc123abc123', reasonCode: 'other', reasonText: 'palliative', context: { regimenId: 'FOLFOX-6', surface: 'safety-check' } });
    expect(JSON.stringify(b)).not.toMatch(/patient/i);
  });
  it('an acknowledgement has no reason', () => {
    expect(overrideBody(f({}), 'accept', 'X')).not.toHaveProperty('reasonCode');
  });
});

describe('ageLabel', () => {
  it('formats', () => { expect(ageLabel(0)).toBe('today'); expect(ageLabel(1)).toBe('1 day ago'); expect(ageLabel(5)).toBe('5 days ago'); });
});
