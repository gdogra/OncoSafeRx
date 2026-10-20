/**
 * Turn a CDS Hooks request (context + prefetch) into prioritised findings.
 * Pure: no network, no I/O. Cards are built from these in cards.js.
 *
 * order-sign: only what a NEW draft medication order changes (interaction with the chart, QT /
 *   serotonin load it adds, PGx and renal/cardiac rules for that drug).
 * patient-view: only critical findings about the current medication list, to stay quiet on chart open.
 */
import { buildDosingInputs } from '../smart/fhirInputs.js';
import { evaluateRegimen } from '../engine/dosing/evaluate.js';
import { evaluateRegimenSafety } from '../engine/risk/qtSerotonin.js';
import { mapObservationsToPhenotypes, mapHLAFromObservations } from '../engine/pgxPhenotype.js';
import { draftDrugs, activeDrugs } from './medications.js';
import { findInteractions } from './ddi.js';
import { ddiRuleId, ddiVersion, HLA_RULES, HLA_VERSION } from './ruleIndex.js';

const bundleResources = (b) => (Array.isArray(b?.entry) ? b.entry.map((e) => e.resource).filter(Boolean) : []);
const GENE_TEXT = /(CYP2D6|CYP2C19|UGT1A1|TPMT|DPYD|NUDT15|SLCO1B1|VKORC1|HLA[-\s]?[AB])/i;
const geneObservations = (obs) => obs.filter((o) => GENE_TEXT.test(JSON.stringify([o.code, o.valueString, o.valueCodeableConcept, o.component])));
const SEV_RANK = { critical: 4, high: 3, moderate: 2, low: 1 };

export function analyze({ hook, draftOrders, prefetch = {}, now = new Date() }) {
  const patient = prefetch.patient && prefetch.patient.resourceType === 'Patient' ? prefetch.patient : null;
  const medsBundle = prefetch.medications;
  const observations = [...bundleResources(prefetch.labs), ...bundleResources(prefetch.vitals)];
  const missing = [];
  if (!patient) missing.push('patient');
  if (!medsBundle) missing.push('medication list');
  if (!prefetch.labs) missing.push('laboratory results');

  const inputs = buildDosingInputs({ patient: patient || {}, observations, medicationRequests: bundleResources(medsBundle), now });
  const { labs, patient: pt } = inputs.dosingInputs;
  const active = activeDrugs(medsBundle);
  const draft = hook === 'order-sign' ? draftDrugs(draftOrders) : [];
  const subject = hook === 'order-sign' ? draft : active; // the drugs this alert is about
  const findings = [];

  const genes = geneObservations(observations);
  const phenotypes = Object.fromEntries(mapObservationsToPhenotypes(genes).map((p) => [p.gene, p.phenotype]));
  const hla = mapHLAFromObservations(genes);

  if (subject.length) {
    // Drug-specific dosing / PGx / organ-function rules (generic protocol rules are regimen-level, not order-level)
    const dosing = evaluateRegimen({ regimen: { components: subject.map((d) => ({ name: d.name, dose: '' })) }, labs, phenotypes, patient: pt });
    for (const f of dosing.findings) if (!f.generic && f.kind !== 'cap') findings.push({ ...f, family: 'dosing' });

    // QT + serotonin: only findings that involve a subject drug
    const safety = evaluateRegimenSafety({ components: subject.map((d) => d.name), medications: active.map((d) => d.name).filter((n) => !subject.some((s) => s.name.toLowerCase() === n.toLowerCase())), labs, patient: pt });
    const involved = new Set([...safety.qt.hits, ...safety.serotonin.hits].filter((h) => h.origin === 'regimen').map((h) => h.name));
    for (const f of safety.findings) if (f.drugs.some((d) => involved.has(d))) findings.push({ ...f, family: 'safety' });

    // HLA-linked contraindications
    for (const [ruleId, r] of Object.entries(HLA_RULES)) {
      const positive = hla.some((h) => h.allele === r.allele);
      const ordered = subject.find((d) => d.name.toLowerCase().includes(r.drug));
      if (positive && ordered) {
        findings.push({ ruleId, ruleVersion: HLA_VERSION, ruleStatus: 'draft', kind: 'finding', family: 'pgx', action: 'avoid', severity: 'critical', drugs: [ordered.name],
          message: `${r.allele} positive. ${r.text}`, source: { label: r.source } });
      }
    }
  }

  // Drug-drug interactions (order-sign only: major interactions involving a new order)
  if (hook === 'order-sign' && draft.length) {
    for (const h of findInteractions({ draft, active })) {
      if (h.entry.severity !== 'major') continue; // moderate/minor are not interruptive: alert fatigue
      findings.push({
        ruleId: ddiRuleId(h.entry.drugs[0], h.entry.drugs[1]), ruleVersion: ddiVersion(h.entry), ruleStatus: 'draft', kind: 'finding', family: 'ddi',
        action: 'review', severity: 'high', drugs: [h.drugA.name, h.drugB.name],
        message: [h.entry.effect || h.entry.mechanism, h.entry.management && `Recommended: ${h.entry.management}`].filter(Boolean).map((t) => t.replace(/\.$/, '')).join('. ') + '.', interaction: h.entry,
        source: { label: 'Curated interaction list (draft, pending clinical review)' },
      });
    }
  }

  const wanted = hook === 'patient-view' ? findings.filter((f) => f.severity === 'critical' && f.kind === 'finding') : findings;
  wanted.sort((a, b) => (SEV_RANK[b.severity] || 0) - (SEV_RANK[a.severity] || 0));
  return { findings: wanted, missing, stale: inputs.staleFields, drugs: { draft: draft.map((d) => d.name), active: active.map((d) => d.name) } };
}
