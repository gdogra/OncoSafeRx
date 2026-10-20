import { parseDose } from '../../../src/engine/dosing/parseDose.js';
import { evaluateRegimen } from '../../../src/engine/dosing/evaluate.js';
import REGIMENS from '../../../src/data/regimens.js';

const reg = (id) => REGIMENS.find((r) => r.id === id);
const ids = (res) => res.findings.map((f) => f.ruleId);

describe('parseDose', () => {
  test.each([
    ['85 mg/m² IV day 1', { kind: 'bsa', mgPerM2: 85 }],
    ['2400 mg/m² CI over 46h', { kind: 'bsa', mgPerM2: 2400 }],
    ['1.4 mg/m2', { kind: 'bsa', mgPerM2: 1.4 }],
    ['1.4 mg/m² (max 2 mg) IV day 1', { kind: 'bsa', mgPerM2: 1.4, capMg: 2 }],
    ['100 mg PO daily days 1–5', { kind: 'fixed', mg: 100 }],
  ])('%s', (text, expected) => expect(parseDose(text)).toEqual(expected));

  test('two schedules in one string are ambiguous, never guessed', () => {
    expect(parseDose('80 mg/m² weekly x12 or 175 mg/m² q2-3w x4').kind).toBe('ambiguous');
  });
});

describe('evaluateRegimen', () => {
  const patient = { heightCm: 170, weightKg: 70, ageYears: 60, serumCreatinineMgDl: 1.0, sex: 'male' };

  test('BSA-based doses are actually computed (superscript "²" regression)', () => {
    const r = evaluateRegimen({ regimen: reg('FOLFOX-6'), patient });
    const ox = r.calculatedDoses.find((d) => d.component === 'Oxaliplatin');
    expect(r.calculators.BSA).toBeCloseTo(1.82, 2);
    expect(ox.calculatedMg).toBe(Math.round(85 * r.calculators.BSA));
  });

  test('ambiguous paclitaxel schedule is not calculated', () => {
    const r = evaluateRegimen({ regimen: reg('AC-T'), patient });
    const pac = r.calculatedDoses.find((d) => d.component === 'Paclitaxel');
    expect(pac.calculatedMg).toBeUndefined();
    expect(pac.note).toMatch(/Not calculated/);
  });

  test('vincristine is capped at 2 mg (large patient)', () => {
    const r = evaluateRegimen({ regimen: reg('R-CHOP'), patient: { heightCm: 190, weightKg: 130 } });
    const v = r.calculatedDoses.find((d) => d.component === 'Vincristine');
    expect(v.calculatedMg).toBeGreaterThan(2);
    expect(v.roundedMg).toBe(2);
    expect(ids(r)).toContain('VINCRISTINE-MAX-2MG');
  });

  test('low ANC / platelets delay the cycle', () => {
    const r = evaluateRegimen({ regimen: reg('FOLFOX-6'), labs: { ANC: 1200, platelets: 80000 }, patient });
    expect(ids(r)).toEqual(expect.arrayContaining(['HEME-COUNTS-DELAY', 'HEME-PLATELETS-DELAY']));
  });

  test('capecitabine: contraindicated below CrCl 30, 75% dose at 30-50, nothing above', () => {
    expect(ids(evaluateRegimen({ regimen: reg('CAPOX'), labs: { CrCl: 25 }, patient }))).toContain('CAPECITABINE-CRCL-LT30');
    const mid = ids(evaluateRegimen({ regimen: reg('CAPOX'), labs: { CrCl: 40 }, patient }));
    expect(mid).toContain('CAPECITABINE-CRCL-30-50');
    expect(mid).not.toContain('CAPECITABINE-CRCL-LT30');
    const ok = ids(evaluateRegimen({ regimen: reg('CAPOX'), labs: { CrCl: 90 }, patient }));
    expect(ok.filter((i) => i.startsWith('CAPECITABINE-CRCL'))).toEqual([]);
  });

  test('DPYD: poor -> avoid, intermediate -> 50% reduction, normal -> nothing', () => {
    const poor = evaluateRegimen({ regimen: reg('FOLFOX-6'), phenotypes: { DPYD: 'Poor metabolizer' }, patient });
    expect(poor.findings.find((f) => f.ruleId === 'DPYD-POOR-FLUOROPYRIMIDINE').action).toBe('avoid');
    const im = evaluateRegimen({ regimen: reg('FOLFOX-6'), phenotypes: { DPYD: 'Intermediate metabolizer' }, patient });
    expect(ids(im)).toContain('DPYD-INTERMEDIATE-FLUOROPYRIMIDINE');
    expect(ids(im)).not.toContain('DPYD-POOR-FLUOROPYRIMIDINE');
    const normal = evaluateRegimen({ regimen: reg('FOLFOX-6'), phenotypes: { DPYD: 'Normal metabolizer' }, patient });
    expect(ids(normal).filter((i) => i.startsWith('DPYD'))).toEqual([]);
  });

  test('missing DPYD genotype is surfaced, not silently skipped', () => {
    const r = evaluateRegimen({ regimen: reg('FOLFOX-6'), patient });
    expect(ids(r)).toContain('DPYD-GENOTYPE-MISSING');
    expect(r.findings.find((f) => f.ruleId === 'DPYD-GENOTYPE-MISSING').kind).toBe('data_gap');
  });

  test('missing labs are reported as data gaps and never trigger threshold rules', () => {
    const r = evaluateRegimen({ regimen: reg('AC-T'), patient: {} });
    expect(ids(r)).toEqual(expect.arrayContaining(['ANC-MISSING', 'PLATELETS-MISSING', 'LVEF-MISSING']));
    expect(ids(r)).not.toContain('HEME-COUNTS-DELAY');
  });

  test('anthracycline with LVEF < 50 is held; rule does not fire for non-anthracycline regimens', () => {
    expect(ids(evaluateRegimen({ regimen: reg('AC-T'), labs: { LVEF: 42 }, patient }))).toContain('ANTHRACYCLINE-LVEF-LT50');
    expect(ids(evaluateRegimen({ regimen: reg('FOLFOX-6'), labs: { LVEF: 42 }, patient }))).not.toContain('ANTHRACYCLINE-LVEF-LT50');
  });

  test('UGT1A1 *28/*28 flags irinotecan only', () => {
    const p = { UGT1A1: 'Poor metabolizer' };
    expect(ids(evaluateRegimen({ regimen: reg('FOLFIRI'), phenotypes: p, patient }))).toContain('UGT1A1-POOR-IRINOTECAN');
    expect(ids(evaluateRegimen({ regimen: reg('FOLFOX-6'), phenotypes: p, patient }))).not.toContain('UGT1A1-POOR-IRINOTECAN');
  });

  test('findings are ordered most severe first; string and junk lab inputs are handled', () => {
    const r = evaluateRegimen({ regimen: reg('CAPOX'), labs: { ANC: '1200', CrCl: 'abc', platelets: -5 }, phenotypes: { DPYD: 'poor metabolizer' }, patient: {} });
    const rank = { critical: 4, high: 3, moderate: 2, low: 1 };
    const sev = r.findings.map((f) => rank[f.severity]);
    expect(sev).toEqual([...sev].sort((a, b) => b - a));
    expect(ids(r)).toContain('HEME-COUNTS-DELAY');
    expect(ids(r)).toContain('PLATELETS-MISSING');
  });

  test('every shipped rule is a draft until a reviewer is recorded', async () => {
    const { DOSING_RULES } = await import('../../../src/engine/dosing/rules.generated.js');
    for (const r of DOSING_RULES) if (r.status === 'reviewed') expect(r.reviewed_by).toBeTruthy();
  });
});
