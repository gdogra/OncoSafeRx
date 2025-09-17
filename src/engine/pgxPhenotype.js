// Simple PGx phenotype mapping engine (MVP)
// Accepts FHIR Observations/DiagnosticReport-like objects and returns gene phenotypes

const GENE_RULES = {
  CYP2D6: [
    { match: '*4/*4', phenotype: 'Poor metabolizer' },
    { match: '*1/*4', phenotype: 'Intermediate metabolizer' },
    { match: '*1/*1', phenotype: 'Normal metabolizer' }
  ],
  CYP2C19: [
    { match: '*2/*2', phenotype: 'Poor metabolizer' },
    { match: '*1/*2', phenotype: 'Intermediate metabolizer' },
    { match: '*1/*1', phenotype: 'Normal metabolizer' }
  ],
  UGT1A1: [
    { match: '*28/*28', phenotype: 'Poor metabolizer' },
    { match: '*1/*28', phenotype: 'Intermediate metabolizer' },
    { match: '*1/*1', phenotype: 'Normal metabolizer' }
  ],
  TPMT: [
    { match: '*3A/*3A', phenotype: 'Poor metabolizer' },
    { match: '*1/*3A', phenotype: 'Intermediate metabolizer' },
    { match: '*1/*1', phenotype: 'Normal metabolizer' }
  ],
  DPYD: [
    { match: '*2A', phenotype: 'Poor metabolizer' },
    { match: 'c.1905+1G>A', phenotype: 'Poor metabolizer' },
    { match: 'no variant', phenotype: 'Normal metabolizer' }
  ]
};

export function mapObservationsToPhenotypes(observations = []) {
  const phenotypes = [];
  const toText = (obs) => {
    const code = obs?.code?.text || obs?.code?.coding?.[0]?.display || '';
    const val = obs?.valueString || obs?.valueCodeableConcept?.text || obs?.value || '';
    const interp = obs?.interpretation?.text || '';
    return `${code} ${val} ${interp}`.trim();
  };

  const txts = observations.map(toText).map(t => t.toUpperCase());

  Object.entries(GENE_RULES).forEach(([gene, rules]) => {
    // Find any text that contains the gene
    const joined = txts.join(' \n ');
    for (const rule of rules) {
      const probe = `${gene} ${rule.match}`.toUpperCase();
      if (joined.includes(probe) || joined.includes(rule.match.toUpperCase())) {
        phenotypes.push({ gene, phenotype: rule.phenotype });
        return; // take first match
      }
    }
  });

  return phenotypes;
}

export default mapObservationsToPhenotypes;

