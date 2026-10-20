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

// DPYD: CPIC gene activity score = sum of the two alleles' activity (normal allele = 1).
//   AS 2 normal | 1-1.5 intermediate | 0-0.5 poor.  Previously any no-function variant (even homozygous)
//   read as "intermediate", which UNDERSTATES fluoropyrimidine risk for poor metabolizers.
const DPYD_VARIANTS = [
  { re: /\*2A|C\.1905\+1G>A/i, activity: 0 },
  { re: /\*13|C\.1679T>G/i, activity: 0 },
  { re: /C\.2846A>T/i, activity: 0.5 },
  { re: /HAPB3|C\.1236G>A|C\.1129-5923C>G/i, activity: 0.5 },
];

export function dpydActivityScore(text) {
  const found = DPYD_VARIANTS.filter((v) => v.re.test(text));
  if (!found.length) return null;
  const twoCopies = /HOMOZYGOUS|\bHOM\b|TWO COPIES|(\*2A|\*13)\s*\/\s*\1/i.test(text);
  let alleles;
  if (found.length >= 2) alleles = found.slice(0, 2).map((v) => v.activity);      // two different variants (compound)
  else if (twoCopies) alleles = [found[0].activity, found[0].activity];
  else alleles = [found[0].activity, 1];                                           // heterozygous: one normal allele
  return alleles[0] + alleles[1];
}

function mapDPYD(text) {
  const as = dpydActivityScore(text);
  if (as !== null) return as <= 0.5 ? 'Poor metabolizer' : as < 2 ? 'Intermediate metabolizer' : 'Normal metabolizer';
  if (/NO VARIANT|WILDTYPE|WILD TYPE|NORMAL/i.test(text)) return 'Normal metabolizer';
  return null;
}

function mapSLCO1B1(text) {
  // Common risk markers: c.521T>C (also called p.Val174Ala); sometimes noted as *5
  if (/SLCO1B1\s*(C\.521T>C|521C|\*5)/i.test(text)) return 'Decreased function';
  if (/SLCO1B1\s*WT|WILDTYPE|NO VARIANT/i.test(text)) return 'Normal function';
  return null;
}

function mapVKORC1(text) {
  // -1639G>A associated with lower warfarin dose requirement
  if (/VKORC1\s*(-?1639|C\.\-1639)\s*G> ?A/i.test(text)) return 'Sensitive (lower dose)';
  if (/VKORC1\s*(A\/A|AA)/i.test(text)) return 'Sensitive (lower dose)';
  if (/VKORC1\s*(G\/G|GG)/i.test(text)) return 'Normal';
  return null;
}

function mapNUDT15(text) {
  // NUDT15 *2/*3 poor metabolizer; *1/*3 intermediate
  if (/NUDT15\s*(\*2|\*3)\/(\*2|\*3)/i.test(text)) return 'Poor metabolizer';
  if (/NUDT15\s*\*1\/(\*2|\*3)/i.test(text)) return 'Intermediate metabolizer';
  if (/NUDT15\s*\*1\/\*1/i.test(text)) return 'Normal metabolizer';
  return null;
}

export function mapObservationsToPhenotypes(observations = []) {
  const phenotypes = [];
  const texts = observations.map(extractTextFromObservation);

  const mappers = [
    ['CYP2D6', mapCYP2D6],
    ['CYP2C19', mapCYP2C19],
    ['UGT1A1', mapUGT1A1],
    ['TPMT', mapTPMT],
    ['DPYD', mapDPYD],
    ['SLCO1B1', mapSLCO1B1],
    ['VKORC1', mapVKORC1],
    ['NUDT15', mapNUDT15]
  ];

  // Each gene is interpreted ONLY from observations that name that gene. Previously every mapper saw
  // the text of all observations, so e.g. "BRAF wildtype" could mark DPYD as a normal metabolizer.
  for (const [gene, fn] of mappers) {
    const own = texts.filter((t) => normalizeText(t).includes(gene));
    if (!own.length) continue;
    const ph = fn(normalizeText(own.join(' \n ')));
    if (ph) phenotypes.push({ gene, phenotype: ph });
  }

  return phenotypes;
}

export default mapObservationsToPhenotypes;

// --- HLA support (simple presence-based mapping) ---
// We extend the mapper by detecting common clinically relevant HLA alleles from text.
// Returns presence flags rather than metabolizer categories.
export function mapHLAFromObservations(observations = []) {
  const text = observations.map(extractTextFromObservation).join(' ');
  const out = [];
  const checks = [
    { gene: 'HLA-B', allele: 'HLA-B*57:01', key: /HLA[-\s]?B\*?57:?01/i, clinical: 'Risk of abacavir hypersensitivity' },
    { gene: 'HLA-B', allele: 'HLA-B*15:02', key: /HLA[-\s]?B\*?15:?02/i, clinical: 'Risk of SJS/TEN with carbamazepine' },
    { gene: 'HLA-A', allele: 'HLA-A*31:01', key: /HLA[-\s]?A\*?31:?01/i, clinical: 'Risk of hypersensitivity with carbamazepine' },
    { gene: 'HLA-B', allele: 'HLA-B*58:01', key: /HLA[-\s]?B\*?58:?01/i, clinical: 'Risk of SCAR with allopurinol' }
  ];
  for (const c of checks) {
    if (c.key.test(text)) {
      out.push({ gene: c.gene, allele: c.allele, phenotype: 'Positive', note: c.clinical });
    }
  }
  return out;
}
