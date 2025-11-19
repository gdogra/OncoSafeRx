import {
  AgentContext,
  MissingField,
  RunDataQualityAgentInput,
  RunDataQualityAgentOutput,
} from './types.ts';

export async function runDataQualityAgent(
  input: RunDataQualityAgentInput,
  _ctx: AgentContext,
): Promise<RunDataQualityAgentOutput> {
  if (!input || !input.patient_id) throw new Error('Invalid input: patient_id is required');

  const missing: MissingField[] = [];

  // Age/sex baseline
  if (!input.demographics?.age) missing.push({ field: 'demographics.age', reason_needed: 'Dose adjustments and trial eligibility often depend on age.' });
  if (!input.demographics?.sex) missing.push({ field: 'demographics.sex', reason_needed: 'Some regimens and toxicities vary by sex.' });

  // Allergies
  if (!input.allergies || input.allergies.length === 0) {
    missing.push({ field: 'allergies', reason_needed: 'Hypersensitivity risk and cross-reactivity assessment require allergy history.' });
  }

  // Renal function
  const egfr = input.labs?.renal?.egfr;
  const creatinine = input.labs?.renal?.creatinine;
  if (!egfr && !creatinine) {
    missing.push({ field: 'labs.renal.egfr_or_creatinine', reason_needed: 'Many oncology drugs require renal dosing or are nephrotoxic.' });
  }

  // Hepatic function
  const hepatic = input.labs?.hepatic;
  if (!hepatic?.ast || !hepatic?.alt || !hepatic?.bilirubin) {
    missing.push({ field: 'labs.hepatic.panel', reason_needed: 'Hepatotoxicity and dosing adjustments require AST/ALT/bilirubin.' });
  }

  // Med list
  if (!input.medications || input.medications.length === 0) {
    missing.push({ field: 'medications', reason_needed: 'DDI analysis requires at least one medication.' });
  } else {
    // Context-aware checks: ask for renal/hepatic labs if meds likely require it
    const names = input.medications.map((m) => m.drug_name.toLowerCase());
    const renal_flag = names.some((n) => ['cisplatin', 'carboplatin', 'pemetrexed', 'capecitabine'].includes(n));
    const hepatic_flag = names.some((n) => ['pazopanib', 'sunitinib', 'regorafenib', 'imatinib'].includes(n));
    if (renal_flag && !egfr && !creatinine) {
      missing.push({ field: 'labs.renal.egfr', reason_needed: 'Selected drugs require renal dosing; eGFR needed for safety.' });
    }
    if (hepatic_flag && (!hepatic?.ast || !hepatic?.alt || !hepatic?.bilirubin)) {
      missing.push({ field: 'labs.hepatic.panel', reason_needed: 'Selected drugs require hepatic monitoring; AST/ALT/bilirubin needed.' });
    }
  }

  const status: RunDataQualityAgentOutput['status'] = missing.length === 0 ? 'sufficient' : 'insufficient';

  const impact =
    status === 'sufficient'
      ? 'Available data is likely sufficient for a baseline safety assessment.'
      : 'Insufficient data to safely assess interactions/dosing; collect missing items to reduce risk.';

  const questions: string[] = [];
  if (missing.find((m) => m.field.startsWith('labs.renal'))) {
    questions.push('When were the most recent renal labs obtained?');
  }
  if (missing.find((m) => m.field.startsWith('labs.hepatic'))) {
    questions.push('When were the most recent hepatic labs obtained?');
  }
  if (missing.find((m) => m.field === 'allergies')) {
    questions.push('Any known drug allergies or prior infusion reactions?');
  }

  return {
    status,
    missing_fields: missing,
    recommended_questions_for_clinician_or_patient: questions,
    impact_on_safety_assessment: impact,
  };
}

