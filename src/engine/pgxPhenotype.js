// PGx phenotype mapping engine (expanded MVP)
// Accepts FHIR Observations/DiagnosticReport-like objects and returns gene phenotypes

function normalizeText(s) {
  return (s || '').toString().trim().toUpperCase();
}

function extractTextFromObservation(obs = {}) {
  const parts = [];
  const fields = [
    obs?.code?.text,
    obs?.code?.coding?.[0]?.display,
    obs?.valueString,
    obs?.valueCodeableConcept?.text,
    obs?.value,
    obs?.interpretation?.text
  ];
  fields.forEach((f) => f && parts.push(f));
  if (Array.isArray(obs.component)) {
    for (const c of obs.component) {
      if (c?.code?.text) parts.push(c.code.text);
      if (c?.valueString) parts.push(c.valueString);
      if (c?.valueCodeableConcept?.text) parts.push(c.valueCodeableConcept.text);
    }
  }
  return normalizeText(parts.join(' '));
}

function matchDiplotype(text, gene, patterns) {
  for (const p of patterns) {
    const probe = normalizeText(`${gene} ${p.match}`);
    if (text.includes(probe) || text.includes(normalizeText(p.match))) {
      return p.phenotype;
    }
  }
  return null;
}

function mapCYP2D6(text) {
  // Simple rules: PM if two no-function (*4/*4, *5), IM if one no-function, UM if duplication xN of *1/*2, NM otherwise
  if (/(CYP2D6\s*)?\*4\/\*4|\*5\/\*5/i.test(text)) return 'Poor metabolizer';
  if (/\*1xN|\*2xN|\*1\/*1xN|\*2\/*2xN/i.test(text)) return 'Ultra-rapid metabolizer';
  // Common reduced-function alleles: *10, *41
  if (/\*1\/\*4|\*1\/\*5|\*2\/\*4|\*2\/\*5|\*1\/\*10|\*1\/\*41|\*2\/\*10|\*2\/\*41|\*10\/\*10|\*41\/\*41/i.test(text)) return 'Intermediate metabolizer';
  if (/\*1\/\*1|\*1\/\*2|\*2\/\*2/i.test(text)) return 'Normal metabolizer';
  return null;
}

function mapCYP2C19(text) {
  if (/(CYP2C19\s*)?\*2\/\*2|\*2\/\*3|\*3\/\*3/i.test(text)) return 'Poor metabolizer';
  if (/\*1\/\*2|\*1\/\*3/i.test(text)) return 'Intermediate metabolizer';
  if (/\*1\/\*17/i.test(text)) return 'Rapid metabolizer';
  if (/\*17\/\*17/i.test(text)) return 'Ultra-rapid metabolizer';
  if (/\*1\/\*1/i.test(text)) return 'Normal metabolizer';
  return null;
}

function mapUGT1A1(text) {
  if (/UGT1A1\s*\*28\/\*28/i.test(text)) return 'Poor metabolizer';
  if (/UGT1A1\s*\*1\/\*28/i.test(text)) return 'Intermediate metabolizer';
  if (/UGT1A1\s*\*1\/\*1/i.test(text)) return 'Normal metabolizer';
  return null;
}

function mapTPMT(text) {
  if (/TPMT\s*(\*2|\*3A|\*3C)\/(\*2|\*3A|\*3C)/i.test(text)) return 'Poor metabolizer';
  if (/TPMT\s*\*1\/(\*2|\*3A|\*3C)/i.test(text)) return 'Intermediate metabolizer';
  if (/TPMT\s*\*1\/\*1/i.test(text)) return 'Normal metabolizer';
  return null;
}

function mapDPYD(text) {
  if (/DPYD\s*(\*2A|C\.1905\+1G>A|C\.2846A>T|HAPB3|C\.1679T>G|\*13|C\.1236G>A)/i.test(text)) return 'Intermediate metabolizer';
  // Truly poor is rare; if homozygous for no-function variants (not detected here), treat as poor.
  if (/NO VARIANT|WILDTYPE/i.test(text)) return 'Normal metabolizer';
  return null;
}

export function mapObservationsToPhenotypes(observations = []) {
  const phenotypes = [];
  const texts = observations.map(extractTextFromObservation);
  const joined = normalizeText(texts.join(' \n '));

  const mappers = [
    ['CYP2D6', mapCYP2D6],
    ['CYP2C19', mapCYP2C19],
    ['UGT1A1', mapUGT1A1],
    ['TPMT', mapTPMT],
    ['DPYD', mapDPYD]
  ];

  for (const [gene, fn] of mappers) {
    const ph = fn(joined);
    if (ph) phenotypes.push({ gene, phenotype: ph });
  }

  return phenotypes;
}

export default mapObservationsToPhenotypes;
