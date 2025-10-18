// Partner decision support stub (e.g., GeneDose Live / InformedDNA-like API)
// This is a local placeholder returning structure compatible with app needs.

const ENABLED = process.env.PARTNER_PGX_ENABLED === 'true';

export class PartnerPGxService {
  constructor() {
    this.enabled = ENABLED;
  }

  async summarizeMedList({ medications = [], phenotypes = {} }) {
    if (!this.enabled) {
      return { enabled: false, message: 'Partner PGx service disabled', summary: null };
    }
    // Mock: aggregate PGx risks across all meds
    const issues = [];
    const actions = [];

    const meds = medications.map((m) => (typeof m === 'string' ? { name: m } : m));

    for (const m of meds) {
      const name = (m.name || '').toLowerCase();
      if (name.includes('clopidogrel') && /poor|intermediate/i.test(phenotypes?.CYP2C19 || '')) {
        issues.push({ drug: m.name, gene: 'CYP2C19', level: 'high', note: 'Reduced activation expected' });
        actions.push({ drug: m.name, recommendation: 'Use prasugrel or ticagrelor', evidence: 'Guideline A' });
      }
      if (name.includes('irinotecan') && /\*28/i.test(phenotypes?.UGT1A1 || '')) {
        issues.push({ drug: m.name, gene: 'UGT1A1', level: 'medium', note: 'Neutropenia risk' });
        actions.push({ drug: m.name, recommendation: 'Reduce starting dose 25–50%', evidence: 'Guideline A' });
      }
      if (name.includes('codeine') && /poor/i.test(phenotypes?.CYP2D6 || '')) {
        issues.push({ drug: m.name, gene: 'CYP2D6', level: 'high', note: 'Lack of analgesia' });
        actions.push({ drug: m.name, recommendation: 'Avoid codeine; use morphine', evidence: 'Guideline A' });
      }
    }

    return {
      enabled: true,
      vendor: 'PartnerPGx (stub)',
      summary: {
        medications: meds.map((m) => m.name || m.rxcui || String(m)),
        issues,
        actions,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export default new PartnerPGxService();

