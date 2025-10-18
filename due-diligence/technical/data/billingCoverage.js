// Simple CPT/coverage reference data. Values illustrative only.

export const PGX_CPT = [
  { code: '81225', name: 'CYP2D6', type: 'single-gene', notes: 'Common PGx gene', status: 'covered-variable' },
  { code: '81226', name: 'CYP2C19', type: 'single-gene', notes: 'Clopidogrel activation', status: 'covered-variable' },
  { code: '81418', name: 'PGx panel (≥6 genes)', type: 'panel', notes: 'Multi-gene PGx panel', status: 'covered-limited' },
  { code: '0345U', name: 'Psychiatric PGx panel', type: 'proprietary', notes: 'Category I U code', status: 'payer-specific' }
];

export const PAYER_NOTES = [
  { payer: 'Medicare', policy: 'LCD varies by MAC; coverage for select genes/panels', updated: '2025-01-01' },
  { payer: 'UnitedHealthcare', policy: 'Coverage policies vary; some panels excluded in psych use cases', updated: '2025-01-01' }
];

export default { PGX_CPT, PAYER_NOTES };

