// Fallback curated interactions data for when API is not available
export const FALLBACK_INTERACTIONS = [
  {
    drugs: ['aspirin', 'warfarin'],
    severity: 'major',
    mechanism: 'Additive anticoagulant/antiplatelet effects',
    effect: 'Significantly increased bleeding risk',
    management: 'Avoid combination or monitor very closely; frequent INR checks',
    evidence_level: 'A',
    sources: ['Clinical literature', 'FDA guidelines']
  },
  {
    drugs: ['oxycodone', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases oxycodone exposure',
    effect: 'Enhanced sedation and respiratory depression',
    management: 'Avoid or reduce oxycodone dose; monitor closely',
    evidence_level: 'B',
    sources: ['FDA']
  },
  {
    drugs: ['fentanyl', 'clarithromycin'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases fentanyl levels',
    effect: 'Risk of fatal respiratory depression',
    management: 'Avoid combination; consider alternative antibiotic',
    evidence_level: 'A',
    sources: ['FDA']
  },
  {
    drugs: ['methadone', 'amiodarone'],
    severity: 'major',
    mechanism: 'Additive QT prolongation',
    effect: 'Torsades de pointes risk',
    management: 'Avoid combination; ECG monitoring if unavoidable',
    evidence_level: 'B',
    sources: ['Cardiology guidelines']
  },
  {
    drugs: ['warfarin', 'ciprofloxacin'],
    severity: 'moderate',
    mechanism: 'CYP1A2/3A4 inhibition increases warfarin exposure',
    effect: 'Increased INR and bleeding risk',
    management: 'Monitor INR closely; adjust warfarin dose if needed',
    evidence_level: 'B',
    sources: ['Clinical studies']
  },
  {
    drugs: ['digoxin', 'amiodarone'],
    severity: 'major',
    mechanism: 'P-glycoprotein inhibition increases digoxin levels',
    effect: 'Digoxin toxicity risk',
    management: 'Reduce digoxin dose by 50%; monitor levels closely',
    evidence_level: 'A',
    sources: ['Cardiovascular pharmacology']
  },
  {
    drugs: ['theophylline', 'ciprofloxacin'],
    severity: 'major',
    mechanism: 'CYP1A2 inhibition reduces theophylline clearance',
    effect: 'Theophylline toxicity with seizures possible',
    management: 'Avoid combination or reduce theophylline dose significantly',
    evidence_level: 'A',
    sources: ['FDA', 'Clinical studies']
  },
  {
    drugs: ['simvastatin', 'gemfibrozil'],
    severity: 'major',
    mechanism: 'Inhibition of simvastatin glucuronidation',
    effect: 'Severe myopathy and rhabdomyolysis risk',
    management: 'Avoid combination; use alternative statin if needed',
    evidence_level: 'A',
    sources: ['FDA warning']
  },
  {
    drugs: ['phenytoin', 'carbamazepine'],
    severity: 'moderate',
    mechanism: 'Mutual CYP3A4 induction',
    effect: 'Reduced efficacy of both anticonvulsants',
    management: 'Monitor seizure control; may need dose adjustments',
    evidence_level: 'B',
    sources: ['Neurology guidelines']
  },
  {
    drugs: ['lithium', 'hydrochlorothiazide'],
    severity: 'major',
    mechanism: 'Reduced lithium clearance',
    effect: 'Lithium toxicity risk',
    management: 'Monitor lithium levels frequently; adjust dose as needed',
    evidence_level: 'A',
    sources: ['Psychiatry guidelines']
  },
  {
    drugs: ['metformin', 'contrast media'],
    severity: 'major',
    mechanism: 'Risk of lactic acidosis with renal impairment',
    effect: 'Potentially fatal lactic acidosis',
    management: 'Hold metformin 48h before and after contrast administration',
    evidence_level: 'A',
    sources: ['Radiology guidelines', 'FDA']
  },
  {
    drugs: ['tacrolimus', 'fluconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases tacrolimus exposure',
    effect: 'Nephrotoxicity and immunosuppression',
    management: 'Monitor tacrolimus levels; reduce dose significantly',
    evidence_level: 'A',
    sources: ['Transplant guidelines']
  },
  {
    drugs: ['clopidogrel', 'omeprazole'],
    severity: 'moderate',
    mechanism: 'CYP2C19 inhibition reduces clopidogrel activation',
    effect: 'Reduced antiplatelet efficacy',
    management: 'Use pantoprazole instead; avoid omeprazole/esomeprazole',
    evidence_level: 'B',
    sources: ['FDA', 'Cardiology societies']
  },
  {
    drugs: ['erlotinib', 'rifampin'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces erlotinib exposure',
    effect: 'Loss of therapeutic efficacy',
    management: 'Avoid rifampin; use alternative anti-TB agent',
    evidence_level: 'B',
    sources: ['Oncology guidelines']
  },
  {
    drugs: ['imatinib', 'ketoconazole'],
    severity: 'moderate',
    mechanism: 'CYP3A4 inhibition increases imatinib exposure',
    effect: 'Increased toxicity risk',
    management: 'Consider imatinib dose reduction; monitor closely',
    evidence_level: 'B',
    sources: ['Oncology studies']
  },
  {
    drugs: ['pemetrexed', 'nsaids'],
    severity: 'major',
    mechanism: 'Reduced renal clearance of pemetrexed',
    effect: 'Severe myelosuppression and mucositis',
    management: 'Avoid NSAIDs 2 days before through 2 days after pemetrexed',
    evidence_level: 'A',
    sources: ['FDA label', 'Oncology guidelines']
  },
  {
    drugs: ['capecitabine', 'phenytoin'],
    severity: 'moderate',
    mechanism: 'Increased phenytoin levels via DPD inhibition',
    effect: 'Phenytoin toxicity',
    management: 'Monitor phenytoin levels; consider dose reduction',
    evidence_level: 'B',
    sources: ['Oncology literature']
  },
  {
    drugs: ['cyclophosphamide', 'allopurinol'],
    severity: 'moderate',
    mechanism: 'Enhanced bone marrow toxicity',
    effect: 'Increased myelosuppression risk',
    management: 'Monitor blood counts more frequently',
    evidence_level: 'C',
    sources: ['Oncology references']
  },
  {
    drugs: ['docetaxel', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases docetaxel exposure',
    effect: 'Severe neutropenia and toxicity',
    management: 'Avoid strong CYP3A4 inhibitors during treatment',
    evidence_level: 'B',
    sources: ['FDA label']
  },
  {
    drugs: ['paclitaxel', 'carboplatin'],
    severity: 'moderate',
    mechanism: 'Sequence-dependent interaction',
    effect: 'Enhanced myelosuppression if carboplatin given first',
    management: 'Administer paclitaxel before carboplatin',
    evidence_level: 'A',
    sources: ['Clinical trials']
  },

  // Additional Oncology Interactions
  {
    drugs: ['bevacizumab', 'sunitinib'],
    severity: 'major',
    mechanism: 'Additive anti-angiogenic effects',
    effect: 'Severe hypertension and arterial thromboembolism',
    management: 'Avoid combination; monitor blood pressure closely if unavoidable',
    evidence_level: 'A',
    sources: ['FDA warnings', 'Oncology guidelines']
  },
  {
    drugs: ['trastuzumab', 'anthracyclines'],
    severity: 'major',
    mechanism: 'Additive cardiotoxicity',
    effect: 'Cardiomyopathy and heart failure risk',
    management: 'Avoid concurrent use; monitor cardiac function if sequential therapy',
    evidence_level: 'A',
    sources: ['FDA black box warning', 'Cardio-oncology guidelines']
  },
  {
    drugs: ['pembrolizumab', 'ipilimumab'],
    severity: 'moderate',
    mechanism: 'Enhanced immune-related adverse events',
    effect: 'Increased autoimmune toxicity',
    management: 'Monitor closely for immune-related adverse events',
    evidence_level: 'B',
    sources: ['Clinical trials', 'Immuno-oncology guidelines']
  },
  {
    drugs: ['sorafenib', 'warfarin'],
    severity: 'major',
    mechanism: 'Enhanced anticoagulation via CYP2C9 inhibition',
    effect: 'Increased bleeding risk',
    management: 'Monitor INR frequently; consider dose adjustment',
    evidence_level: 'B',
    sources: ['FDA label', 'Clinical studies']
  },
  {
    drugs: ['dasatinib', 'proton pump inhibitors'],
    severity: 'moderate',
    mechanism: 'Reduced absorption due to increased gastric pH',
    effect: 'Decreased dasatinib efficacy',
    management: 'Separate administration; use H2 antagonist instead',
    evidence_level: 'B',
    sources: ['FDA label']
  },

  // Common Drug Combinations
  {
    drugs: ['metformin', 'ibuprofen'],
    severity: 'moderate',
    mechanism: 'Reduced renal function affecting metformin clearance',
    effect: 'Risk of lactic acidosis',
    management: 'Monitor renal function; use acetaminophen instead',
    evidence_level: 'B',
    sources: ['Clinical pharmacology']
  },
  {
    drugs: ['lisinopril', 'potassium supplements'],
    severity: 'moderate',
    mechanism: 'Additive hyperkalemic effects',
    effect: 'Hyperkalemia risk',
    management: 'Monitor serum potassium levels regularly',
    evidence_level: 'A',
    sources: ['Cardiology guidelines']
  },
  {
    drugs: ['tramadol', 'sertraline'],
    severity: 'major',
    mechanism: 'Serotonin syndrome risk',
    effect: 'Hyperthermia, altered mental status, neuromuscular abnormalities',
    management: 'Avoid combination; use alternative analgesic',
    evidence_level: 'B',
    sources: ['FDA warnings', 'Pain management guidelines']
  },
  {
    drugs: ['alprazolam', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases alprazolam exposure',
    effect: 'Severe sedation and respiratory depression',
    management: 'Avoid combination or reduce alprazolam dose significantly',
    evidence_level: 'A',
    sources: ['FDA']
  },
  {
    drugs: ['atorvastatin', 'clarithromycin'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases statin exposure',
    effect: 'Rhabdomyolysis and acute kidney injury',
    management: 'Temporarily discontinue statin during clarithromycin course',
    evidence_level: 'A',
    sources: ['FDA warnings']
  },

  // Cardiovascular Interactions
  {
    drugs: ['amiodarone', 'simvastatin'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases simvastatin exposure',
    effect: 'Myopathy and rhabdomyolysis risk',
    management: 'Limit simvastatin to 20mg daily; consider pravastatin',
    evidence_level: 'A',
    sources: ['ACC/AHA guidelines']
  },
  {
    drugs: ['verapamil', 'digoxin'],
    severity: 'moderate',
    mechanism: 'P-glycoprotein inhibition increases digoxin levels',
    effect: 'Digoxin toxicity',
    management: 'Reduce digoxin dose by 25%; monitor levels',
    evidence_level: 'A',
    sources: ['Cardiology references']
  },
  {
    drugs: ['diltiazem', 'metoprolol'],
    severity: 'moderate',
    mechanism: 'Additive negative chronotropic effects',
    effect: 'Bradycardia and heart block risk',
    management: 'Monitor heart rate and conduction; dose reduction may be needed',
    evidence_level: 'B',
    sources: ['Clinical experience']
  },

  // Psychiatric Medication Interactions
  {
    drugs: ['fluoxetine', 'tramadol'],
    severity: 'major',
    mechanism: 'Serotonin syndrome risk',
    effect: 'Hyperthermia, rigidity, altered consciousness',
    management: 'Avoid combination; consider alternative antidepressant or analgesic',
    evidence_level: 'A',
    sources: ['FDA warnings']
  },
  {
    drugs: ['lithium', 'losartan'],
    severity: 'moderate',
    mechanism: 'Reduced lithium clearance',
    effect: 'Lithium toxicity risk',
    management: 'Monitor lithium levels more frequently',
    evidence_level: 'B',
    sources: ['Psychiatry guidelines']
  },
  {
    drugs: ['carbamazepine', 'oral contraceptives'],
    severity: 'moderate',
    mechanism: 'CYP3A4 induction reduces contraceptive efficacy',
    effect: 'Risk of unintended pregnancy',
    management: 'Use additional contraceptive methods',
    evidence_level: 'A',
    sources: ['Reproductive health guidelines']
  },

  // Antibiotic Interactions
  {
    drugs: ['levofloxacin', 'theophylline'],
    severity: 'moderate',
    mechanism: 'CYP1A2 inhibition reduces theophylline clearance',
    effect: 'Theophylline toxicity',
    management: 'Monitor theophylline levels; consider dose reduction',
    evidence_level: 'B',
    sources: ['Clinical pharmacology']
  },
  {
    drugs: ['azithromycin', 'warfarin'],
    severity: 'moderate',
    mechanism: 'Enhanced anticoagulation effect',
    effect: 'Increased bleeding risk',
    management: 'Monitor INR more frequently during antibiotic course',
    evidence_level: 'B',
    sources: ['Clinical studies']
  },
  {
    drugs: ['rifampin', 'oral contraceptives'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces contraceptive efficacy',
    effect: 'High risk of unintended pregnancy',
    management: 'Use alternative contraceptive methods during treatment',
    evidence_level: 'A',
    sources: ['TB treatment guidelines']
  },

  // Pain Management Interactions
  {
    drugs: ['morphine', 'gabapentin'],
    severity: 'moderate',
    mechanism: 'Additive CNS depressant effects',
    effect: 'Enhanced sedation and respiratory depression',
    management: 'Start with lower doses; monitor closely',
    evidence_level: 'C',
    sources: ['Pain management literature']
  },
  {
    drugs: ['fentanyl', 'rifampin'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces fentanyl exposure',
    effect: 'Loss of analgesic efficacy',
    management: 'Avoid rifampin or increase fentanyl dose significantly',
    evidence_level: 'B',
    sources: ['Anesthesiology studies']
  },

  // Diabetes Management Interactions
  {
    drugs: ['metformin', 'cimetidine'],
    severity: 'moderate',
    mechanism: 'Reduced renal clearance of metformin',
    effect: 'Risk of lactic acidosis',
    management: 'Monitor renal function; consider alternative H2 blocker',
    evidence_level: 'B',
    sources: ['Endocrinology guidelines']
  },
  {
    drugs: ['glyburide', 'fluconazole'],
    severity: 'moderate',
    mechanism: 'CYP2C9 inhibition increases glyburide exposure',
    effect: 'Severe hypoglycemia risk',
    management: 'Monitor blood glucose closely; reduce glyburide dose',
    evidence_level: 'B',
    sources: ['Diabetes management guidelines']
  },

  // Immunosuppressive Drug Interactions
  {
    drugs: ['cyclosporine', 'simvastatin'],
    severity: 'major',
    mechanism: 'Increased statin exposure via CYP3A4 inhibition',
    effect: 'Severe myopathy and rhabdomyolysis',
    management: 'Avoid combination; use pravastatin if statin needed',
    evidence_level: 'A',
    sources: ['Transplant guidelines']
  },
  {
    drugs: ['methotrexate', 'sulfamethoxazole/trimethoprim'],
    severity: 'major',
    mechanism: 'Reduced folate metabolism and renal clearance',
    effect: 'Severe bone marrow toxicity',
    management: 'Avoid combination; use alternative antibiotic',
    evidence_level: 'A',
    sources: ['Rheumatology guidelines']
  },

  // Antiepileptic Drug Interactions
  {
    drugs: ['valproic acid', 'lamotrigine'],
    severity: 'moderate',
    mechanism: 'Inhibition of lamotrigine glucuronidation',
    effect: 'Lamotrigine toxicity including serious rash',
    management: 'Start lamotrigine at lower dose; titrate slowly',
    evidence_level: 'A',
    sources: ['Epilepsy guidelines']
  },
  {
    drugs: ['phenytoin', 'folic acid'],
    severity: 'minor',
    mechanism: 'Enhanced phenytoin metabolism',
    effect: 'Reduced phenytoin levels',
    management: 'Monitor phenytoin levels; may need dose increase',
    evidence_level: 'B',
    sources: ['Neurology literature']
  },

  // Additional High-Risk Combinations
  {
    drugs: ['sildenafil', 'nitroglycerin'],
    severity: 'major',
    mechanism: 'Additive vasodilation',
    effect: 'Severe hypotension and cardiovascular collapse',
    management: 'Absolute contraindication; avoid combination',
    evidence_level: 'A',
    sources: ['FDA black box warning']
  },
  {
    drugs: ['allopurinol', 'azathioprine'],
    severity: 'major',
    mechanism: 'Inhibition of azathioprine metabolism',
    effect: 'Severe bone marrow suppression',
    management: 'Reduce azathioprine dose by 75%; monitor blood counts',
    evidence_level: 'A',
    sources: ['Rheumatology guidelines']
  }
];

export default FALLBACK_INTERACTIONS;