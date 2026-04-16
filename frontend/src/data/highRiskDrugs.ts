/**
 * High-Risk / Most Dangerous Prescription Drugs Database
 *
 * Drugs with narrow therapeutic index, high abuse potential,
 * severe side effects, or risk of death if misused.
 *
 * Source: Clinical pharmacology references, ISMP High-Alert Medications List,
 * FDA safety communications, published clinical literature.
 *
 * Used by OncoSafeRx to flag high-risk drugs in the interaction checker
 * with additional safety warnings and monitoring requirements.
 */

export interface HighRiskDrug {
  name: string
  genericNames: string[]          // all generic name variants for matching
  brandNames: string[]
  category: string
  riskLevel: 'extreme' | 'high'
  primaryDanger: string
  use: string
  dangers: string[]
  risks: string[]
  keyInteractions: string[]
  monitoring: string[]
  criticalWarning: string         // the most important single warning
  isNarrowTherapeuticIndex: boolean
  isISMPHighAlert: boolean
  isControlledSubstance: boolean
}

export const HIGH_RISK_DRUGS: HighRiskDrug[] = [
  // ── Category 1: Narrow Therapeutic Index ────────────────────
  {
    name: 'Warfarin',
    genericNames: ['warfarin', 'warfarin sodium'],
    brandNames: ['Coumadin', 'Jantoven'],
    category: 'Blood Thinner (Anticoagulant)',
    riskLevel: 'extreme',
    primaryDanger: 'Bleeding/clotting — tiny dose changes cause hemorrhage',
    use: 'Prevents blood clots, stroke',
    dangers: ['Extremely narrow therapeutic index', 'Hundreds of drug and food interactions'],
    risks: ['Internal bleeding', 'Brain hemorrhage', 'Death'],
    keyInteractions: ['NSAIDs', 'Aspirin', 'Antibiotics', 'Antifungals', 'Amiodarone', 'Vitamin K foods'],
    monitoring: ['Frequent INR blood testing', 'Monitor for signs of bleeding', 'Dose adjustments based on INR'],
    criticalWarning: 'Leading cause of emergency hospitalizations from adverse drug events',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Digoxin',
    genericNames: ['digoxin'],
    brandNames: ['Lanoxin', 'Digitek'],
    category: 'Cardiac Glycoside',
    riskLevel: 'extreme',
    primaryDanger: 'Extremely narrow therapeutic window — fatal arrhythmias',
    use: 'Heart failure, atrial fibrillation',
    dangers: ['Therapeutic dose very close to toxic dose', 'Electrolyte changes dramatically alter toxicity'],
    risks: ['Fatal arrhythmias', 'Cardiac arrest', 'Visual disturbances', 'Nausea/vomiting'],
    keyInteractions: ['Amiodarone', 'Verapamil', 'Quinidine', 'Diuretics (via K+/Mg2+ depletion)'],
    monitoring: ['Regular serum digoxin levels (0.5-2.0 ng/mL)', 'Potassium and magnesium levels', 'ECG monitoring'],
    criticalWarning: 'Low potassium or magnesium dramatically increases toxicity risk',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Lithium',
    genericNames: ['lithium', 'lithium carbonate', 'lithium citrate'],
    brandNames: ['Lithobid', 'Eskalith'],
    category: 'Mood Stabilizer',
    riskLevel: 'extreme',
    primaryDanger: 'Toxic levels extremely close to therapeutic levels',
    use: 'Bipolar disorder',
    dangers: ['Narrow therapeutic index (0.6-1.2 mEq/L)', 'Dehydration rapidly causes toxicity'],
    risks: ['Kidney failure', 'Seizures', 'Brain damage', 'Death'],
    keyInteractions: ['NSAIDs', 'Diuretics', 'ACE inhibitors', 'ARBs'],
    monitoring: ['Regular blood level testing', 'Kidney function tests', 'Thyroid function tests', 'Hydration status'],
    criticalWarning: 'Dehydration, fever, or NSAIDs can trigger toxicity rapidly',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Phenytoin',
    genericNames: ['phenytoin', 'phenytoin sodium'],
    brandNames: ['Dilantin', 'Phenytek'],
    category: 'Antiepileptic',
    riskLevel: 'high',
    primaryDanger: 'Narrow therapeutic index with saturation kinetics',
    use: 'Epilepsy, seizure disorders',
    dangers: ['Non-linear pharmacokinetics — small dose changes cause large level changes', 'Many drug interactions'],
    risks: ['Cardiac arrhythmias', 'Cerebellar damage', 'Coma', 'Stevens-Johnson syndrome'],
    keyInteractions: ['Warfarin', 'Carbamazepine', 'Valproic acid', 'Isoniazid', 'Fluconazole'],
    monitoring: ['Regular serum levels (10-20 mcg/mL)', 'Albumin-adjusted levels', 'CBC', 'LFTs'],
    criticalWarning: 'IV administration can cause fatal heart rhythm problems (Purple Glove Syndrome)',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Methotrexate',
    genericNames: ['methotrexate', 'methotrexate sodium'],
    brandNames: ['Trexall', 'Otrexup', 'Rasuvo'],
    category: 'Chemotherapy / Immunosuppressant',
    riskLevel: 'extreme',
    primaryDanger: 'Dose errors can be fatal — weekly dosing confused with daily',
    use: 'Cancer, rheumatoid arthritis, psoriasis',
    dangers: ['Fatal if dosed daily instead of weekly (for non-cancer use)', 'Bone marrow suppression'],
    risks: ['Bone marrow suppression', 'Liver failure', 'Lung toxicity (pneumonitis)', 'Renal failure'],
    keyInteractions: ['NSAIDs', 'Trimethoprim/sulfamethoxazole', 'Penicillins', 'PPIs'],
    monitoring: ['Regular CBC with differential', 'Liver function tests', 'Renal function', 'Chest X-ray if pulmonary symptoms'],
    criticalWarning: 'Weekly dosing often confused with daily — multiple fatal errors documented',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },

  // ── Category 2: Opioids ────────────────────────────────────
  {
    name: 'Fentanyl',
    genericNames: ['fentanyl', 'fentanyl citrate'],
    brandNames: ['Duragesic', 'Actiq', 'Sublimaze', 'Abstral'],
    category: 'Opioid Analgesic',
    riskLevel: 'extreme',
    primaryDanger: '100x more potent than morphine — rapid respiratory arrest',
    use: 'Severe pain, surgical anesthesia',
    dangers: ['Extreme potency', 'Rapid onset of respiratory depression', 'Patch misuse/abuse'],
    risks: ['Respiratory depression', 'Death within minutes of overdose', 'Profound sedation'],
    keyInteractions: ['Benzodiazepines', 'Alcohol', 'CYP3A4 inhibitors (ketoconazole, erythromycin)', 'MAOIs'],
    monitoring: ['Respiratory rate', 'Oxygen saturation', 'Pain scores', 'Signs of misuse'],
    criticalWarning: 'Leading driver of overdose deaths in the US — even microgram-level errors can be fatal',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: true,
  },
  {
    name: 'Oxycodone',
    genericNames: ['oxycodone', 'oxycodone hydrochloride'],
    brandNames: ['OxyContin', 'Roxicodone', 'Percocet (with APAP)'],
    category: 'Opioid Analgesic',
    riskLevel: 'high',
    primaryDanger: 'High abuse and addiction potential',
    use: 'Moderate to severe chronic pain',
    dangers: ['Strong addiction potential', 'Tolerance development', 'Respiratory depression'],
    risks: ['Respiratory failure', 'Overdose death', 'Physical dependence'],
    keyInteractions: ['Benzodiazepines', 'Alcohol', 'CNS depressants', 'CYP3A4 inhibitors'],
    monitoring: ['Pain management efficacy', 'Signs of misuse/diversion', 'Respiratory status'],
    criticalWarning: 'Central to the opioid epidemic — prescribe with extreme caution',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: true,
  },
  {
    name: 'Methadone',
    genericNames: ['methadone', 'methadone hydrochloride'],
    brandNames: ['Dolophine', 'Methadose'],
    category: 'Opioid Analgesic / Addiction Treatment',
    riskLevel: 'high',
    primaryDanger: 'Unpredictable half-life (8-59 hours) — accumulation causes death',
    use: 'Opioid addiction treatment, chronic pain',
    dangers: ['Highly variable pharmacokinetics', 'QT prolongation', 'Accumulation over days'],
    risks: ['QT prolongation', 'Fatal arrhythmia (torsades de pointes)', 'Respiratory depression'],
    keyInteractions: ['Other QT-prolonging drugs', 'Benzodiazepines', 'CYP3A4 inhibitors/inducers'],
    monitoring: ['ECG (baseline and periodic)', 'QTc interval', 'Respiratory status', 'Drug levels'],
    criticalWarning: 'Accounts for disproportionate share of opioid deaths despite lower prescribing volume',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: true,
  },

  // ── Category 3: Benzodiazepines ────────────────────────────
  {
    name: 'Alprazolam',
    genericNames: ['alprazolam'],
    brandNames: ['Xanax'],
    category: 'Benzodiazepine',
    riskLevel: 'high',
    primaryDanger: 'High dependence risk — withdrawal can be fatal',
    use: 'Anxiety, panic disorder',
    dangers: ['Rapid physical dependence', 'Life-threatening withdrawal', 'Respiratory depression with opioids'],
    risks: ['Respiratory depression', 'Seizures on withdrawal', 'Falls', 'Cognitive impairment'],
    keyInteractions: ['Opioids (FDA Black Box Warning)', 'Alcohol', 'CNS depressants', 'CYP3A4 inhibitors'],
    monitoring: ['Duration of use', 'Signs of dependence', 'Taper schedule for discontinuation'],
    criticalWarning: 'Most prescribed and most abused benzodiazepine — never combine with opioids',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: false, isControlledSubstance: true,
  },

  // ── Category 4: Chemotherapy ────────────────────────────────
  {
    name: 'Vincristine',
    genericNames: ['vincristine', 'vincristine sulfate'],
    brandNames: ['Oncovin', 'Vincasar'],
    category: 'Vinca Alkaloid Chemotherapy',
    riskLevel: 'extreme',
    primaryDanger: 'Fatal if given intrathecally (wrong route of administration)',
    use: 'Leukemia, lymphoma',
    dangers: ['MUST be given IV only — intrathecal injection is universally fatal', 'Severe neurotoxicity'],
    risks: ['Severe peripheral neuropathy', 'Paralysis', 'Death from wrong route'],
    keyInteractions: ['CYP3A4 inhibitors (itraconazole, ketoconazole)', 'Phenytoin'],
    monitoring: ['Neurological assessment each cycle', 'Dose-reduce for neuropathy Grade 2+'],
    criticalWarning: 'MUST NEVER be given intrathecally — multiple documented fatal administration errors worldwide',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Cisplatin',
    genericNames: ['cisplatin'],
    brandNames: ['Platinol'],
    category: 'Platinum Chemotherapy',
    riskLevel: 'high',
    primaryDanger: 'Severe nephrotoxicity — requires aggressive IV hydration',
    use: 'Lung, testicular, bladder, head/neck cancer',
    dangers: ['Cumulative kidney damage', 'Often confused with carboplatin (very different dosing)'],
    risks: ['Kidney failure', 'Permanent hearing loss', 'Severe nausea/vomiting', 'Electrolyte wasting'],
    keyInteractions: ['Other nephrotoxic drugs (aminoglycosides, NSAIDs)', 'Diuretics'],
    monitoring: ['Creatinine/GFR before each cycle', 'Audiometry', 'Electrolytes (Mg2+, K+)', 'Hydration protocol'],
    criticalWarning: 'Requires aggressive IV hydration to prevent kidney failure — confusion with carboplatin dosing has caused deaths',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: false,
  },

  // ── Category 5: Cardiovascular ─────────────────────────────
  {
    name: 'Amiodarone',
    genericNames: ['amiodarone', 'amiodarone hydrochloride'],
    brandNames: ['Cordarone', 'Pacerone'],
    category: 'Antiarrhythmic',
    riskLevel: 'extreme',
    primaryDanger: 'Multi-organ toxicity — affects lungs, liver, thyroid, eyes',
    use: 'Atrial fibrillation, ventricular arrhythmias',
    dangers: ['Toxicity affects multiple organ systems', 'Half-life 40-55 days — effects persist long after stopping'],
    risks: ['Pulmonary fibrosis', 'Liver failure', 'Thyroid dysfunction', 'Corneal deposits', 'Skin discoloration'],
    keyInteractions: ['Warfarin (doubles INR)', 'Digoxin (doubles levels)', 'Statins', 'QT-prolonging drugs'],
    monitoring: ['PFTs baseline + annually', 'LFTs quarterly', 'Thyroid function q6mo', 'Eye exams annually', 'ECG'],
    criticalWarning: 'One of the most toxic commonly prescribed drugs — consider alternatives first',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Heparin',
    genericNames: ['heparin', 'heparin sodium'],
    brandNames: ['Hep-Lock'],
    category: 'Anticoagulant',
    riskLevel: 'high',
    primaryDanger: 'Weight-based dosing errors cause fatal hemorrhage',
    use: 'Blood clot prevention and treatment',
    dangers: ['Dosing errors cause fatal bleeding', 'Multiple concentration strengths cause confusion'],
    risks: ['Hemorrhage', 'HIT (Heparin-Induced Thrombocytopenia)', 'Paradoxical thrombosis'],
    keyInteractions: ['Antiplatelet agents', 'Thrombolytics', 'NSAIDs'],
    monitoring: ['aPTT monitoring', 'Platelet counts (for HIT)', 'Signs of bleeding'],
    criticalWarning: 'ISMP high-alert medication — weight-based dosing requires extreme precision',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },

  // ── Category 6: Diabetes ───────────────────────────────────
  {
    name: 'Insulin',
    genericNames: ['insulin', 'insulin lispro', 'insulin aspart', 'insulin glargine', 'insulin detemir', 'insulin regular', 'insulin NPH'],
    brandNames: ['Humalog', 'NovoLog', 'Lantus', 'Levemir', 'Humulin', 'Novolin', 'Tresiba'],
    category: 'Antidiabetic',
    riskLevel: 'extreme',
    primaryDanger: 'Wrong dose causes severe hypoglycemia — brain damage and death',
    use: 'Diabetes Type 1 and 2',
    dangers: ['Many types with different onset/duration — confusion is dangerous', 'Wrong type/dose is common error'],
    risks: ['Severe hypoglycemia', 'Brain damage', 'Coma', 'Death from low blood sugar'],
    keyInteractions: ['Beta-blockers (mask hypoglycemia symptoms)', 'Sulfonylureas', 'Alcohol'],
    monitoring: ['Blood glucose monitoring', 'HbA1c', 'Hypoglycemia awareness education'],
    criticalWarning: 'ISMP highest-alert medication — most common cause of preventable hospital deaths',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },

  // ── Category 7: Psychiatric ────────────────────────────────
  {
    name: 'Clozapine',
    genericNames: ['clozapine'],
    brandNames: ['Clozaril', 'FazaClo'],
    category: 'Atypical Antipsychotic',
    riskLevel: 'extreme',
    primaryDanger: 'Agranulocytosis — destroys white blood cells, causes fatal infections',
    use: 'Treatment-resistant schizophrenia',
    dangers: ['1-2% risk of agranulocytosis', 'Myocarditis risk', 'Metabolic syndrome'],
    risks: ['Fatal infections from neutropenia', 'Myocarditis', 'Seizures', 'Metabolic syndrome'],
    keyInteractions: ['CYP1A2 inhibitors (fluvoxamine, ciprofloxacin)', 'Carbamazepine', 'Smoking'],
    monitoring: ['Weekly CBC for first 6 months', 'Biweekly CBC for 6-12 months', 'Monthly CBC thereafter'],
    criticalWarning: 'Restricted distribution via REMS program — requires mandatory blood count registry',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'MAOIs',
    genericNames: ['phenelzine', 'tranylcypromine', 'isocarboxazid', 'selegiline'],
    brandNames: ['Nardil', 'Parnate', 'Marplan', 'Emsam'],
    category: 'Antidepressant (MAOI)',
    riskLevel: 'high',
    primaryDanger: 'Fatal hypertensive crisis from food and drug interactions',
    use: 'Treatment-resistant depression',
    dangers: ['Tyramine-containing foods cause hypertensive crisis', 'Many life-threatening drug interactions'],
    risks: ['Hypertensive crisis', 'Serotonin syndrome', 'Intracerebral hemorrhage', 'Death'],
    keyInteractions: ['SSRIs/SNRIs (serotonin syndrome)', 'Meperidine', 'Dextromethorphan', 'Tyramine foods'],
    monitoring: ['Blood pressure', 'Strict dietary compliance', 'Drug interaction screening'],
    criticalWarning: 'Tyramine foods (aged cheese, wine, cured meats) can cause fatal hypertensive crisis',
    isNarrowTherapeuticIndex: false, isISMPHighAlert: true, isControlledSubstance: false,
  },

  // ── Category 8: Immunosuppressants ─────────────────────────
  {
    name: 'Tacrolimus',
    genericNames: ['tacrolimus'],
    brandNames: ['Prograf', 'Envarsus', 'Astagraf'],
    category: 'Calcineurin Inhibitor',
    riskLevel: 'high',
    primaryDanger: 'Narrow therapeutic index — generic substitution can cause dangerous level changes',
    use: 'Organ transplant rejection prevention',
    dangers: ['Narrow therapeutic index', 'Generic substitution affects levels', 'Nephrotoxicity'],
    risks: ['Kidney failure', 'Neurotoxicity (tremor, seizures)', 'Infections', 'PTLD (lymphoma)'],
    keyInteractions: ['CYP3A4 inhibitors/inducers', 'Grapefruit', 'Azole antifungals', 'Macrolide antibiotics'],
    monitoring: ['Trough blood levels', 'Renal function', 'Blood pressure', 'Blood glucose', 'Electrolytes'],
    criticalWarning: 'Generic substitution can cause dangerous blood level changes — maintain same manufacturer',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
  {
    name: 'Cyclosporine',
    genericNames: ['cyclosporine', 'cyclosporin'],
    brandNames: ['Sandimmune', 'Neoral', 'Gengraf'],
    category: 'Calcineurin Inhibitor',
    riskLevel: 'high',
    primaryDanger: 'Cumulative kidney and liver toxicity',
    use: 'Transplant rejection prevention, autoimmune diseases',
    dangers: ['Nephrotoxicity (dose-dependent)', 'Hepatotoxicity', 'Hypertension'],
    risks: ['Renal failure', 'Liver damage', 'Hypertension', 'Lymphoma risk'],
    keyInteractions: ['Grapefruit juice (increases levels significantly)', 'Azole antifungals', 'Macrolides', 'NSAIDs'],
    monitoring: ['Trough blood levels', 'Renal function', 'LFTs', 'Blood pressure', 'Lipid panel'],
    criticalWarning: 'Grapefruit juice significantly increases blood levels — must avoid completely',
    isNarrowTherapeuticIndex: true, isISMPHighAlert: true, isControlledSubstance: false,
  },
]

/**
 * Check if a drug name matches any high-risk drug
 */
export function findHighRiskDrug(drugName: string): HighRiskDrug | null {
  const lower = drugName.toLowerCase().trim()
  return HIGH_RISK_DRUGS.find(d =>
    d.genericNames.some(g => lower.includes(g) || g.includes(lower)) ||
    d.brandNames.some(b => lower.includes(b.toLowerCase()) || b.toLowerCase().includes(lower))
  ) || null
}

/**
 * Check multiple drugs and return all high-risk matches
 */
export function findAllHighRiskDrugs(drugNames: string[]): { drug: string; info: HighRiskDrug }[] {
  const results: { drug: string; info: HighRiskDrug }[] = []
  const seen = new Set<string>()

  for (const name of drugNames) {
    const match = findHighRiskDrug(name)
    if (match && !seen.has(match.name)) {
      seen.add(match.name)
      results.push({ drug: name, info: match })
    }
  }

  // Sort by risk level: extreme first, then high
  return results.sort((a, b) => {
    const order = { extreme: 0, high: 1 }
    return (order[a.info.riskLevel] || 1) - (order[b.info.riskLevel] || 1)
  })
}

/**
 * Get categories for display
 */
export const HIGH_RISK_CATEGORIES = [
  { id: 'nti', label: 'Narrow Therapeutic Index', color: 'red' },
  { id: 'opioid', label: 'Opioids', color: 'red' },
  { id: 'benzo', label: 'Benzodiazepines', color: 'orange' },
  { id: 'chemo', label: 'Chemotherapy', color: 'red' },
  { id: 'cardio', label: 'Cardiovascular', color: 'orange' },
  { id: 'diabetes', label: 'Diabetes', color: 'orange' },
  { id: 'psych', label: 'Psychiatric', color: 'orange' },
  { id: 'immuno', label: 'Immunosuppressants', color: 'orange' },
]
