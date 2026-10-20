/** Extract drug names and RxNorm codes from FHIR MedicationRequest / draft-order resources. */
const RXNORM = /rxnorm|nlm\.nih\.gov\/research\/umls\/rxnorm/i;

export function drugFromMedicationRequest(r) {
  const cc = r?.medicationCodeableConcept;
  if (!cc) return null;
  const name = cc.text || cc.coding?.find((c) => c.display)?.display || null;
  const rxcui = (cc.coding || []).filter((c) => RXNORM.test(c.system || '') && c.code).map((c) => String(c.code));
  return name ? { name, rxcui } : null;
}

export function draftDrugs(draftOrders) {
  const entries = Array.isArray(draftOrders?.entry) ? draftOrders.entry : [];
  const out = [];
  for (const e of entries) {
    const r = e.resource;
    if (r?.resourceType === 'MedicationRequest' && ['draft', 'active', undefined].includes(r.status)) {
      const d = drugFromMedicationRequest(r);
      if (d) out.push(d);
    }
  }
  return dedupe(out);
}

export function activeDrugs(medicationBundle) {
  const entries = Array.isArray(medicationBundle?.entry) ? medicationBundle.entry : [];
  const out = [];
  for (const e of entries) {
    const r = e.resource;
    if (r?.resourceType === 'MedicationRequest' && r.status === 'active') {
      const d = drugFromMedicationRequest(r);
      if (d) out.push(d);
    }
  }
  return dedupe(out);
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((d) => { const k = d.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}
