import { evaluateQt, evaluateSerotonin, normalizeDrugs, evaluateRegimenSafety, SAFETY_LISTS_VERSION } from '../../../src/engine/risk/qtSerotonin.js';
import { evaluateRegimen } from '../../../src/engine/dosing/evaluate.js';
import REGIMENS from '../../../src/data/regimens.js';

const meds = (...n) => normalizeDrugs({ medications: n });
const qtIds = (r) => r.findings.map((f) => f.ruleId);
const qt = (names, extra = {}) => evaluateQt({ drugs: meds(...names), ...extra });
const ser = (names) => evaluateSerotonin({ drugs: meds(...names) });

describe('QT screen', () => {
  test('no QT drugs -> no findings', () => expect(qt(['metformin', '5-FU (infusion)']).findings).toEqual([]));

  test('one known-risk drug is moderate and asks for ECG/electrolytes it does not have', () => {
    const r = qt(['ondansetron']);
    expect(qtIds(r)).toEqual(expect.arrayContaining(['QT-MODERATE', 'QT-DATA-GAP']));
    expect(r.findings.find((f) => f.ruleId === 'QT-DATA-GAP').message).toMatch(/QTc.*potassium.*magnesium/);
  });

  test('two known-risk drugs -> critical review', () => {
    const r = qt(['ondansetron', 'citalopram']);
    expect(r.findings[0]).toMatchObject({ ruleId: 'QT-MULTIPLE-KNOWN', severity: 'critical', action: 'review' });
  });

  test('common ondansetron + PPI is NOT escalated without other factors (alert-fatigue guard)', () => {
    const ids = qtIds(qt(['ondansetron', 'omeprazole']));
    expect(ids).toContain('QT-MODERATE');
    expect(ids).not.toContain('QT-ELEVATED');
  });

  test('...but is escalated when hypokalemia is present', () => {
    expect(qtIds(qt(['ondansetron', 'omeprazole'], { labs: { potassium: 3.1 } }))).toContain('QT-ELEVATED');
  });

  test('known + possible -> elevated; QTc >= 500 with a QT drug -> avoid', () => {
    expect(qtIds(qt(['ondansetron', 'lapatinib']))).toContain('QT-ELEVATED');
    const r = qt(['nilotinib'], { labs: { QTc: 510 } });
    expect(r.findings[0]).toMatchObject({ ruleId: 'QT-BASELINE-CRITICAL', action: 'avoid' });
  });

  test('sex-specific prolonged-QTc thresholds (>=450 ms men, >=460 ms women)', () => {
    expect(qt(['ondansetron'], { labs: { QTc: 455 }, patient: { sex: 'male' } }).factors).toContain('qtc_prolonged');
    expect(qt(['ondansetron'], { labs: { QTc: 455 }, patient: { sex: 'female' } }).factors).not.toContain('qtc_prolonged');
    expect(qt(['ondansetron'], { labs: { QTc: 465 }, patient: { sex: 'female' } }).factors).toContain('qtc_prolonged');
  });

  test('provided ECG and electrolytes remove the data-gap finding', () => {
    const r = qt(['ondansetron'], { labs: { QTc: 430, potassium: 4.2, magnesium: 2.0 } });
    expect(qtIds(r)).not.toContain('QT-DATA-GAP');
  });

  test('whole-word matching: escitalopram is not also citalopram; brand names resolve', () => {
    expect(qt(['escitalopram']).hits.map((h) => h.name)).toEqual(['escitalopram']);
    expect(qt(['Zofran 8 mg IV']).hits.map((h) => h.name)).toEqual(['ondansetron']);
  });

  test('unknown risk conditions are ignored, known ones count', () => {
    expect(qt(['ondansetron'], { riskConditions: ['bogus', 'heart_failure'] }).factors).toEqual(['heart_failure']);
  });
});

describe('serotonin screen', () => {
  test('single agent never flags', () => expect(ser(['sertraline']).findings).toEqual([]));
  test('MAOI-type + serotonergic -> critical avoid (linezolid + sertraline)', () => {
    expect(ser(['linezolid', 'sertraline']).findings[0]).toMatchObject({ ruleId: 'SEROTONIN-MAOI-COMBINATION', action: 'avoid', severity: 'critical' });
  });
  test('two strong agents -> review', () => expect(ser(['sertraline', 'tramadol']).findings[0].ruleId).toBe('SEROTONIN-MULTIPLE-HIGH'));
  test('antidepressant + 5-HT3 antiemetic -> moderate monitor', () => {
    expect(ser(['sertraline', 'ondansetron']).findings[0]).toMatchObject({ ruleId: 'SEROTONIN-MODERATE', action: 'monitor' });
  });
  test('two mild agents -> low info', () => expect(ser(['ondansetron', 'metoclopramide']).findings[0]).toMatchObject({ ruleId: 'SEROTONIN-LOW', action: 'info' }));
});

describe('integration with regimen evaluation', () => {
  const regimen = REGIMENS.find((r) => r.id === 'FOLFOX-6');
  test('concomitant meds are screened alongside the regimen; findings carry the lists version', () => {
    const r = evaluateRegimen({ regimen, medications: ['ondansetron', 'sertraline', 'citalopram'], patient: {} });
    const ids = r.findings.map((f) => f.ruleId);
    expect(ids).toEqual(expect.arrayContaining(['QT-MULTIPLE-KNOWN', 'SEROTONIN-MULTIPLE-HIGH']));
    expect(r.findings.find((f) => f.ruleId === 'QT-MULTIPLE-KNOWN').ruleVersion).toBe(SAFETY_LISTS_VERSION);
    expect(r.interactionScreens.qtDrugs.length).toBeGreaterThan(0);
  });
  test('no medications -> no QT/serotonin findings for a regimen without such drugs', () => {
    const ids = evaluateRegimen({ regimen, patient: {} }).findings.map((f) => f.ruleId);
    expect(ids.filter((i) => /^(QT|SEROTONIN)/.test(i))).toEqual([]);
  });
  test('regimen safety helper handles empty input', () => {
    expect(evaluateRegimenSafety({ components: [], medications: undefined }).findings).toEqual([]);
  });
});
