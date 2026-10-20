/**
 * Turn FHIR resources into the inputs of /api/dosing/adjust.
 *
 * Safety rule: a value is used ONLY if its LOINC code is recognised AND its unit is one we can convert
 * exactly. Anything else is reported in `unconverted` and left out, so the dosing engine reports a
 * data gap instead of acting on a mis-scaled number.
 */
const DAY_MS = 86_400_000;

// field -> { loinc codes, units: { unit: multiplier to canonical } , canonical unit label }
const LAB_SPECS = {
  ANC:        { loinc: ['26499-4', '751-8'], canonical: '/uL',   units: { '10*3/uL': 1000, '10*3/mm3': 1000, '10*9/L': 1000, '/uL': 1, '/mm3': 1, 'cells/uL': 1 }, maxAgeDays: 7 },
  platelets:  { loinc: ['777-3', '26515-7'], canonical: '/uL',   units: { '10*3/uL': 1000, '10*3/mm3': 1000, '10*9/L': 1000, '/uL': 1, '/mm3': 1, 'cells/uL': 1 }, maxAgeDays: 7 },
  creatinine: { loinc: ['2160-0'],           canonical: 'mg/dL', units: { 'mg/dL': 1, 'umol/L': 1 / 88.4, 'µmol/L': 1 / 88.4 }, maxAgeDays: 14 },
  potassium:  { loinc: ['2823-3'],           canonical: 'mmol/L', units: { 'mmol/L': 1, 'meq/L': 1, 'mEq/L': 1 }, maxAgeDays: 7 },
  magnesium:  { loinc: ['19123-9'],          canonical: 'mg/dL', units: { 'mg/dL': 1, 'mmol/L': 2.43 }, maxAgeDays: 14 },
  QTc:        { loinc: ['8634-8'],           canonical: 'ms',    units: { ms: 1 }, maxAgeDays: 30 },
  LVEF:       { loinc: ['10230-1'],          canonical: '%',     units: { '%': 1 }, maxAgeDays: 90 },
  weightKg:   { loinc: ['29463-7'],          canonical: 'kg',    units: { kg: 1, '[lb_av]': 0.45359237, lb: 0.45359237 }, maxAgeDays: 90 },
  heightCm:   { loinc: ['8302-2'],           canonical: 'cm',    units: { cm: 1, '[in_i]': 2.54, in: 2.54 }, maxAgeDays: 3650 },
};

const OK_STATUS = new Set(['final', 'amended', 'corrected']);

const obsDate = (o) => o.effectiveDateTime || o.effectivePeriod?.end || o.effectivePeriod?.start || o.issued || null;
const obsCodes = (o) => (o.code?.coding || []).filter((c) => !c.system || /loinc/i.test(c.system)).map((c) => c.code);

export function ageYears(birthDate, now = new Date()) {
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

export function pickObservations(observations, now = new Date()) {
  const values = {}; const provenance = {}; const unconverted = [];
  for (const [field, spec] of Object.entries(LAB_SPECS)) {
    const candidates = observations
      .filter((o) => o.resourceType === 'Observation' && OK_STATUS.has(o.status) && obsCodes(o).some((c) => spec.loinc.includes(c)) && o.valueQuantity && obsDate(o))
      .sort((a, b) => new Date(obsDate(b)) - new Date(obsDate(a)));
    if (!candidates.length) continue;
    const o = candidates[0];
    const unit = o.valueQuantity.code || o.valueQuantity.unit;
    const mult = spec.units[unit];
    const raw = Number(o.valueQuantity.value);
    if (mult === undefined || !Number.isFinite(raw) || raw <= 0) {
      unconverted.push({ field, reason: mult === undefined ? `unrecognised unit "${unit}"` : 'non-positive or non-numeric value', value: o.valueQuantity.value, unit });
      continue;
    }
    const ageDays = Math.floor((now - new Date(obsDate(o))) / DAY_MS);
    values[field] = Math.round(raw * mult * 100) / 100;
    provenance[field] = { date: obsDate(o), ageDays, stale: ageDays > spec.maxAgeDays, unit: spec.canonical };
  }
  return { values, provenance, unconverted };
}

export function medicationNames(requests) {
  const names = []; let unresolved = 0;
  for (const r of requests) {
    if (r.resourceType !== 'MedicationRequest' || r.status !== 'active') continue;
    const cc = r.medicationCodeableConcept;
    const name = cc?.text || cc?.coding?.find((c) => c.display)?.display;
    if (name) names.push(name); else unresolved++;
  }
  return { names: [...new Set(names)], unresolved };
}

export function buildDosingInputs({ patient, observations = [], medicationRequests = [], now = new Date() }) {
  const { values, provenance, unconverted } = pickObservations(observations, now);
  const meds = medicationNames(medicationRequests);
  // Stale values are NOT passed to the dosing engine: a week-old ANC must read as "no ANC", not as a pass.
  const fresh = (k) => values[k] !== undefined && !provenance[k].stale;
  const sex = ['male', 'female'].includes(patient?.gender) ? patient.gender : undefined;
  const dosingInputs = {
    patient: {
      ...(sex ? { sex } : {}),
      ...(ageYears(patient?.birthDate, now) !== null ? { ageYears: ageYears(patient.birthDate, now) } : {}),
      ...(fresh('weightKg') ? { weightKg: values.weightKg } : {}),
      ...(fresh('heightCm') ? { heightCm: values.heightCm } : {}),
      ...(fresh('creatinine') ? { serumCreatinineMgDl: values.creatinine } : {}),
    },
    labs: Object.fromEntries(['ANC', 'platelets', 'LVEF', 'QTc', 'potassium', 'magnesium'].filter(fresh).map((k) => [k, values[k]])),
    medications: meds.names,
  };
  const staleFields = Object.entries(provenance).filter(([, p]) => p.stale).map(([f]) => f);
  return {
    dosingInputs,
    provenance,
    staleFields,
    staleValues: Object.fromEntries(staleFields.map((f) => [f, values[f]])),
    unconverted,
    medicationsUnresolved: meds.unresolved,
    notes: [
      ...(staleFields.length ? [`Excluded as too old: ${staleFields.join(', ')}. Provide current values; the dosing check will report them as missing.`] : []),
      ...(meds.unresolved ? [`${meds.unresolved} active medication order(s) reference a Medication resource and were not resolved.`] : []),
    ],
  };
}
