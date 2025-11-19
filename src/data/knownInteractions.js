// Comprehensive curated interaction database for clinical decision support
// Updated with extensive oncology, cardiovascular, pain management, and general medicine interactions

export const KNOWN_INTERACTIONS = [
  // ============================================================================
  // ANTICOAGULATION & BLEEDING RISK INTERACTIONS
  // ============================================================================
  {
    drugs: ['aspirin', 'warfarin'],
    severity: 'major',
    mechanism: 'Additive anticoagulant/antiplatelet effects',
    effect: 'Significantly increased bleeding risk',
    management: 'Avoid combination or monitor very closely; frequent INR checks',
    evidence_level: 'A',
    sources: ['Clinical literature', 'FDA guidelines'],
    rxcui: ['1191', '11289']
  },
  {
    drugs: ['warfarin', 'amiodarone'],
    severity: 'major',
    mechanism: 'CYP2C9 inhibition increases warfarin exposure',
    effect: 'Significantly increased bleeding risk',
    management: 'Reduce warfarin dose by 25-50%; monitor INR closely',
    evidence_level: 'A',
    sources: ['Cardiology guidelines', 'FDA'],
    rxcui: ['11289', '703']
  },
  {
    drugs: ['warfarin', 'fluconazole'],
    severity: 'major',
    mechanism: 'CYP2C9 inhibition',
    effect: 'Increased anticoagulation effect',
    management: 'Monitor INR daily; consider dose reduction',
    evidence_level: 'A',
    sources: ['Clinical pharmacology'],
    rxcui: ['11289', '4450']
  },
  {
    drugs: ['warfarin', 'trimethoprim-sulfamethoxazole'],
    severity: 'major',
    mechanism: 'CYP2C9 inhibition and protein binding displacement',
    effect: 'Increased bleeding risk',
    management: 'Monitor INR frequently; adjust warfarin dose',
    evidence_level: 'A',
    sources: ['Clinical studies'],
    rxcui: ['11289', '8576']
  },
  {
    drugs: ['dabigatran', 'rifampin'],
    severity: 'major',
    mechanism: 'P-glycoprotein induction reduces dabigatran exposure',
    effect: 'Reduced anticoagulant efficacy',
    management: 'Avoid combination; use alternative anticoagulant',
    evidence_level: 'B',
    sources: ['FDA label'],
    rxcui: ['1037042', '9384']
  },
  {
    drugs: ['rivaroxaban', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 and P-glycoprotein inhibition',
    effect: 'Increased bleeding risk',
    management: 'Avoid combination; monitor for bleeding signs',
    evidence_level: 'A',
    sources: ['FDA warnings'],
    rxcui: ['1114195', '6135']
  },
  
  // ============================================================================
  // ONCOLOGY DRUG INTERACTIONS - COMPREHENSIVE COVERAGE
  // ============================================================================
  {
    drugs: ['bevacizumab', 'sunitinib'],
    severity: 'major',
    mechanism: 'Additive anti-angiogenic effects',
    effect: 'Severe hypertension and arterial thromboembolism',
    management: 'Avoid combination; monitor blood pressure closely if unavoidable',
    evidence_level: 'A',
    sources: ['FDA warnings', 'Oncology guidelines'],
    rxcui: ['722963', '395503']
  },
  {
    drugs: ['trastuzumab', 'anthracyclines'],
    severity: 'major',
    mechanism: 'Additive cardiotoxicity',
    effect: 'Cardiomyopathy and heart failure risk',
    management: 'Avoid concurrent use; monitor cardiac function if sequential therapy',
    evidence_level: 'A',
    sources: ['FDA black box warning', 'Cardio-oncology guidelines'],
    rxcui: ['224905', '3639']
  },
  {
    drugs: ['tamoxifen', 'paroxetine'],
    severity: 'major',
    mechanism: 'Strong CYP2D6 inhibition reduces formation of active metabolite (endoxifen)',
    effect: 'Reduced efficacy of tamoxifen therapy',
    management: 'Avoid potent CYP2D6 inhibitors; consider alternatives (venlafaxine)',
    evidence_level: 'B',
    sources: ['Breast cancer guidelines'],
    rxcui: ['10324', '32937']
  },
  {
    drugs: ['tamoxifen', 'fluoxetine'],
    severity: 'major',
    mechanism: 'CYP2D6 inhibition reduces active metabolite formation',
    effect: 'Decreased breast cancer survival',
    management: 'Switch to non-CYP2D6 inhibiting antidepressant',
    evidence_level: 'A',
    sources: ['Breast cancer guidelines'],
    rxcui: ['10324', '4493']
  },
  {
    drugs: ['imatinib', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases imatinib exposure',
    effect: 'Severe myelosuppression and hepatotoxicity',
    management: 'Reduce imatinib dose by 25-50%; monitor closely',
    evidence_level: 'A',
    sources: ['FDA', 'Clinical pharmacology'],
    rxcui: ['282464', '6135']
  },
  {
    drugs: ['erlotinib', 'rifampin'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces erlotinib levels',
    effect: 'Loss of therapeutic efficacy',
    management: 'Increase erlotinib dose or avoid rifampin',
    evidence_level: 'A',
    sources: ['Oncology guidelines'],
    rxcui: ['358263', '9384']
  },
  {
    drugs: ['capecitabine', 'warfarin'],
    severity: 'major',
    mechanism: 'Enhanced anticoagulant effect via CYP2C9',
    effect: 'Severe bleeding and elevated INR',
    management: 'Monitor INR frequently; adjust warfarin dose',
    evidence_level: 'A',
    sources: ['FDA', 'Oncology literature'],
    rxcui: ['194000', '11289']
  },
  {
    drugs: ['sorafenib', 'warfarin'],
    severity: 'major',
    mechanism: 'Enhanced anticoagulation via CYP2C9 inhibition',
    effect: 'Increased bleeding risk',
    management: 'Monitor INR frequently; consider dose adjustment',
    evidence_level: 'B',
    sources: ['FDA label', 'Clinical studies'],
    rxcui: ['608144', '11289']
  },
  {
    drugs: ['methotrexate', 'trimethoprim-sulfamethoxazole'],
    severity: 'major',
    mechanism: 'Reduced folate metabolism and renal clearance',
    effect: 'Severe bone marrow toxicity',
    management: 'Avoid combination; use alternative antibiotic',
    evidence_level: 'A',
    sources: ['Rheumatology guidelines'],
    rxcui: ['6851', '8576']
  },
  {
    drugs: ['methotrexate', 'probenecid'],
    severity: 'major',
    mechanism: 'Reduced renal clearance of methotrexate',
    effect: 'Severe methotrexate toxicity',
    management: 'Avoid combination; monitor methotrexate levels',
    evidence_level: 'A',
    sources: ['Oncology guidelines'],
    rxcui: ['6851', '8698']
  },
  {
    drugs: ['pemetrexed', 'nsaids'],
    severity: 'major',
    mechanism: 'Reduced renal clearance of pemetrexed',
    effect: 'Severe myelosuppression and mucositis',
    management: 'Avoid NSAIDs 2 days before through 2 days after pemetrexed',
    evidence_level: 'A',
    sources: ['FDA label', 'Oncology guidelines'],
    rxcui: ['373757', '26548']
  },
  {
    drugs: ['docetaxel', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases docetaxel exposure',
    effect: 'Severe neutropenia and toxicity',
    management: 'Avoid strong CYP3A4 inhibitors during treatment',
    evidence_level: 'B',
    sources: ['FDA label'],
    rxcui: ['72962', '6135']
  },
  {
    drugs: ['paclitaxel', 'carboplatin'],
    severity: 'moderate',
    mechanism: 'Sequence-dependent interaction',
    effect: 'Enhanced myelosuppression if carboplatin given first',
    management: 'Administer paclitaxel before carboplatin',
    evidence_level: 'A',
    sources: ['Clinical trials'],
    rxcui: ['56946', '40048']
  },
  {
    drugs: ['cisplatin', 'gentamicin'],
    severity: 'major',
    mechanism: 'Additive nephrotoxicity and ototoxicity',
    effect: 'Kidney damage and hearing loss',
    management: 'Monitor renal function and audiometry',
    evidence_level: 'A',
    sources: ['Oncology guidelines'],
    rxcui: ['2555', '4814']
  },
  {
    drugs: ['bleomycin', 'oxygen'],
    severity: 'major',
    mechanism: 'Enhanced pulmonary toxicity',
    effect: 'Severe pneumonitis',
    management: 'Minimize oxygen concentration during surgery',
    evidence_level: 'A',
    sources: ['Anesthesiology guidelines'],
    rxcui: ['1341', '7812']
  },
  
  // ============================================================================
  // PAIN MANAGEMENT & OPIOID INTERACTIONS
  // ============================================================================
  {
    drugs: ['oxycodone', 'ketoconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases oxycodone exposure',
    effect: 'Enhanced sedation and respiratory depression',
    management: 'Avoid or reduce oxycodone dose; monitor closely',
    evidence_level: 'B',
    sources: ['FDA'],
    rxcui: ['7804', '6135']
  },
  {
    drugs: ['fentanyl', 'clarithromycin'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases fentanyl levels',
    effect: 'Risk of fatal respiratory depression',
    management: 'Avoid combination; consider alternative antibiotic',
    evidence_level: 'A',
    sources: ['FDA'],
    rxcui: ['4337', '21212']
  },
  {
    drugs: ['methadone', 'amiodarone'],
    severity: 'major',
    mechanism: 'Additive QT prolongation',
    effect: 'Torsades de pointes risk',
    management: 'Avoid combination; ECG monitoring if unavoidable',
    evidence_level: 'B',
    sources: ['Cardiology guidelines'],
    rxcui: ['6813', '703']
  },
  {
    drugs: ['tramadol', 'sertraline'],
    severity: 'major',
    mechanism: 'Serotonin syndrome risk',
    effect: 'Hyperthermia, altered mental status, neuromuscular abnormalities',
    management: 'Avoid combination; use alternative analgesic',
    evidence_level: 'B',
    sources: ['FDA warnings', 'Pain management guidelines'],
    rxcui: ['10689', '36437']
  },
  {
    drugs: ['tramadol', 'fluoxetine'],
    severity: 'major',
    mechanism: 'Serotonergic toxicity risk; CYP2D6 inhibition reduces analgesia',
    effect: 'Serotonin syndrome; decreased tramadol effectiveness',
    management: 'Avoid combination; consider non-serotonergic analgesic',
    evidence_level: 'B',
    sources: ['FDA warnings'],
    rxcui: ['10689', '4493']
  },
  {
    drugs: ['morphine', 'gabapentin'],
    severity: 'moderate',
    mechanism: 'Additive CNS depressant effects',
    effect: 'Enhanced sedation and respiratory depression',
    management: 'Start with lower doses; monitor closely',
    evidence_level: 'C',
    sources: ['Pain management literature'],
    rxcui: ['7052', '25480']
  },
  {
    drugs: ['fentanyl', 'rifampin'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces fentanyl exposure',
    effect: 'Loss of analgesic efficacy',
    management: 'Avoid rifampin or increase fentanyl dose significantly',
    evidence_level: 'B',
    sources: ['Anesthesiology studies'],
    rxcui: ['4337', '9384']
  },
  
  // ============================================================================
  // CARDIOVASCULAR DRUG INTERACTIONS
  // ============================================================================
  {
    drugs: ['digoxin', 'amiodarone'],
    severity: 'major',
    mechanism: 'P-glycoprotein inhibition increases digoxin levels',
    effect: 'Digoxin toxicity risk',
    management: 'Reduce digoxin dose by 50%; monitor levels closely',
    evidence_level: 'A',
    sources: ['Cardiovascular pharmacology'],
    rxcui: ['3407', '703']
  },
  {
    drugs: ['digoxin', 'quinidine'],
    severity: 'major',
    mechanism: 'P-glycoprotein inhibition and displacement',
    effect: 'Severe digoxin toxicity in elderly',
    management: 'Reduce digoxin dose by 50%; monitor levels',
    evidence_level: 'A',
    sources: ['Geriatric cardiology'],
    rxcui: ['3407', '9068']
  },
  {
    drugs: ['amiodarone', 'simvastatin'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases simvastatin exposure',
    effect: 'Myopathy and rhabdomyolysis risk',
    management: 'Limit simvastatin to 20mg daily; consider pravastatin',
    evidence_level: 'A',
    sources: ['ACC/AHA guidelines'],
    rxcui: ['703', '36567']
  },
  {
    drugs: ['verapamil', 'digoxin'],
    severity: 'moderate',
    mechanism: 'P-glycoprotein inhibition increases digoxin levels',
    effect: 'Digoxin toxicity',
    management: 'Reduce digoxin dose by 25%; monitor levels',
    evidence_level: 'A',
    sources: ['Cardiology references'],
    rxcui: ['11170', '3407']
  },
  {
    drugs: ['amlodipine', 'simvastatin'],
    severity: 'moderate',
    mechanism: 'CYP3A4 inhibition increases statin exposure',
    effect: 'Myopathy risk',
    management: 'Limit simvastatin to 20mg daily',
    evidence_level: 'A',
    sources: ['FDA recommendations'],
    rxcui: ['17767', '36567']
  },
  {
    drugs: ['diltiazem', 'metoprolol'],
    severity: 'moderate',
    mechanism: 'Additive negative chronotropic effects',
    effect: 'Bradycardia and heart block risk',
    management: 'Monitor heart rate and conduction; dose reduction may be needed',
    evidence_level: 'B',
    sources: ['Clinical experience'],
    rxcui: ['3443', '6918']
  },
  {
    drugs: ['enalapril', 'spironolactone'],
    severity: 'moderate',
    mechanism: 'Additive hyperkalemic effects',
    effect: 'Hyperkalemia risk',
    management: 'Monitor serum potassium regularly',
    evidence_level: 'A',
    sources: ['Nephrology guidelines'],
    rxcui: ['3827', '9997']
  },
  {
    drugs: ['lisinopril', 'potassium supplements'],
    severity: 'moderate',
    mechanism: 'Additive hyperkalemic effects',
    effect: 'Hyperkalemia risk',
    management: 'Monitor serum potassium levels regularly',
    evidence_level: 'A',
    sources: ['Cardiology guidelines'],
    rxcui: ['29046', '8588']
  },
  
  // ============================================================================
  // NEUROPSYCHIATRIC DRUG INTERACTIONS
  // ============================================================================
  {
    drugs: ['fluoxetine', 'tramadol'],
    severity: 'major',
    mechanism: 'Serotonin syndrome risk',
    effect: 'Hyperthermia, rigidity, altered consciousness',
    management: 'Avoid combination; consider alternative antidepressant or analgesic',
    evidence_level: 'A',
    sources: ['FDA warnings'],
    rxcui: ['4493', '10689']
  },
  {
    drugs: ['lithium', 'hydrochlorothiazide'],
    severity: 'major',
    mechanism: 'Reduced lithium clearance',
    effect: 'Lithium toxicity risk',
    management: 'Monitor lithium levels frequently; adjust dose as needed',
    evidence_level: 'A',
    sources: ['Psychiatry guidelines'],
    rxcui: ['6448', '5487']
  },
  {
    drugs: ['phenytoin', 'carbamazepine'],
    severity: 'moderate',
    mechanism: 'Mutual CYP3A4 induction',
    effect: 'Reduced efficacy of both anticonvulsants',
    management: 'Monitor seizure control; may need dose adjustments',
    evidence_level: 'B',
    sources: ['Neurology guidelines'],
    rxcui: ['8183', '2002']
  },
  {
    drugs: ['carbamazepine', 'oral contraceptives'],
    severity: 'moderate',
    mechanism: 'CYP3A4 induction reduces contraceptive efficacy',
    effect: 'Risk of unintended pregnancy',
    management: 'Use additional contraceptive methods',
    evidence_level: 'A',
    sources: ['Reproductive health guidelines'],
    rxcui: ['2002', '311']
  },
  {
    drugs: ['valproic acid', 'lamotrigine'],
    severity: 'moderate',
    mechanism: 'Inhibition of lamotrigine glucuronidation',
    effect: 'Lamotrigine toxicity including serious rash',
    management: 'Start lamotrigine at lower dose; titrate slowly',
    evidence_level: 'A',
    sources: ['Epilepsy guidelines'],
    rxcui: ['11118', '48527']
  },
  {
    drugs: ['clozapine', 'ciprofloxacin'],
    severity: 'major',
    mechanism: 'CYP1A2 inhibition increases clozapine levels',
    effect: 'Increased risk of seizures and agranulocytosis',
    management: 'Monitor clozapine levels and CBC; reduce dose',
    evidence_level: 'A',
    sources: ['Psychiatry guidelines'],
    rxcui: ['2626', '2551']
  },
  
  // ============================================================================
  // ANTIBIOTIC & ANTIMICROBIAL INTERACTIONS
  // ============================================================================
  {
    drugs: ['theophylline', 'ciprofloxacin'],
    severity: 'major',
    mechanism: 'CYP1A2 inhibition reduces theophylline clearance',
    effect: 'Theophylline toxicity with seizures possible',
    management: 'Avoid combination or reduce theophylline dose significantly',
    evidence_level: 'A',
    sources: ['FDA', 'Clinical studies'],
    rxcui: ['10379', '2551']
  },
  {
    drugs: ['warfarin', 'ciprofloxacin'],
    severity: 'moderate',
    mechanism: 'CYP1A2/3A4 inhibition increases warfarin exposure',
    effect: 'Increased INR and bleeding risk',
    management: 'Monitor INR closely; adjust warfarin dose if needed',
    evidence_level: 'B',
    sources: ['Clinical studies'],
    rxcui: ['11289', '2551']
  },
  {
    drugs: ['rifampin', 'oral contraceptives'],
    severity: 'major',
    mechanism: 'CYP3A4 induction reduces contraceptive efficacy',
    effect: 'High risk of unintended pregnancy',
    management: 'Use alternative contraceptive methods during treatment',
    evidence_level: 'A',
    sources: ['TB treatment guidelines'],
    rxcui: ['9384', '311']
  },
  {
    drugs: ['azithromycin', 'warfarin'],
    severity: 'moderate',
    mechanism: 'Enhanced anticoagulation effect',
    effect: 'Increased bleeding risk',
    management: 'Monitor INR more frequently during antibiotic course',
    evidence_level: 'B',
    sources: ['Clinical studies'],
    rxcui: ['18631', '11289']
  },
  {
    drugs: ['vancomycin', 'furosemide'],
    severity: 'moderate',
    mechanism: 'Additive nephrotoxicity',
    effect: 'Increased kidney damage risk',
    management: 'Monitor renal function closely',
    evidence_level: 'B',
    sources: ['Nephrology literature'],
    rxcui: ['11124', '4603']
  },
  
  // ============================================================================
  // DIABETES & ENDOCRINE INTERACTIONS
  // ============================================================================
  {
    drugs: ['metformin', 'contrast media'],
    severity: 'major',
    mechanism: 'Risk of lactic acidosis with renal impairment',
    effect: 'Potentially fatal lactic acidosis',
    management: 'Hold metformin 48h before and after contrast administration',
    evidence_level: 'A',
    sources: ['Radiology guidelines', 'FDA'],
    rxcui: ['6809', '72107']
  },
  {
    drugs: ['metformin', 'cimetidine'],
    severity: 'moderate',
    mechanism: 'Reduced renal clearance of metformin',
    effect: 'Risk of lactic acidosis',
    management: 'Monitor renal function; consider alternative H2 blocker',
    evidence_level: 'B',
    sources: ['Endocrinology guidelines'],
    rxcui: ['6809', '2541']
  },
  {
    drugs: ['glyburide', 'fluconazole'],
    severity: 'moderate',
    mechanism: 'CYP2C9 inhibition increases glyburide exposure',
    effect: 'Severe hypoglycemia risk',
    management: 'Monitor blood glucose closely; reduce glyburide dose',
    evidence_level: 'B',
    sources: ['Diabetes management guidelines'],
    rxcui: ['4821', '4450']
  },
  {
    drugs: ['insulin', 'atenolol'],
    severity: 'moderate',
    mechanism: 'Beta-blocker masks hypoglycemia symptoms',
    effect: 'Unrecognized hypoglycemia',
    management: 'Monitor blood glucose frequently; patient education',
    evidence_level: 'B',
    sources: ['Diabetes guidelines'],
    rxcui: ['5856', '1202']
  },
  {
    drugs: ['levothyroxine', 'calcium carbonate'],
    severity: 'moderate',
    mechanism: 'Chelation reduces levothyroxine absorption',
    effect: 'Hypothyroidism',
    management: 'Separate administration by 4 hours',
    evidence_level: 'A',
    sources: ['Endocrinology guidelines'],
    rxcui: ['10582', '1378']
  },
  
  // ============================================================================
  // IMMUNOSUPPRESSIVE DRUG INTERACTIONS
  // ============================================================================
  {
    drugs: ['tacrolimus', 'fluconazole'],
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases tacrolimus exposure',
    effect: 'Nephrotoxicity and immunosuppression',
    management: 'Monitor tacrolimus levels; reduce dose significantly',
    evidence_level: 'A',
    sources: ['Transplant guidelines'],
    rxcui: ['42316', '4450']
  },
  {
    drugs: ['cyclosporine', 'simvastatin'],
    severity: 'major',
    mechanism: 'Increased statin exposure via CYP3A4 inhibition',
    effect: 'Severe myopathy and rhabdomyolysis',
    management: 'Avoid combination; use pravastatin if statin needed',
    evidence_level: 'A',
    sources: ['Transplant guidelines'],
    rxcui: ['3008', '36567']
  },
  {
    drugs: ['tacrolimus', 'diltiazem'],
    severity: 'moderate',
    mechanism: 'CYP3A4 inhibition increases tacrolimus levels',
    effect: 'Enhanced immunosuppression and nephrotoxicity',
    management: 'Monitor tacrolimus levels; reduce dose',
    evidence_level: 'A',
    sources: ['Transplant guidelines'],
    rxcui: ['42316', '3443']
  },
  
  // ============================================================================
  // DRUG CLASS INTERACTIONS & GENERAL MEDICINE
  // ============================================================================
  {
    drugs: ['simvastatin', 'gemfibrozil'],
    severity: 'major',
    mechanism: 'Inhibition of simvastatin glucuronidation',
    effect: 'Severe myopathy and rhabdomyolysis risk',
    management: 'Avoid combination; use alternative statin if needed',
    evidence_level: 'A',
    sources: ['FDA warning'],
    rxcui: ['36567', '25025']
  },
  {
    drugs: ['colchicine', 'clarithromycin'],
    severity: 'major',
    mechanism: 'CYP3A4 and P-glycoprotein inhibition',
    effect: 'Colchicine toxicity with organ failure',
    management: 'Reduce colchicine dose significantly or avoid',
    evidence_level: 'A',
    sources: ['FDA warnings'],
    rxcui: ['2683', '21212']
  },
  {
    drugs: ['sildenafil', 'nitroglycerin'],
    severity: 'major',
    mechanism: 'Additive vasodilation',
    effect: 'Severe hypotension and cardiovascular collapse',
    management: 'Absolute contraindication; avoid combination',
    evidence_level: 'A',
    sources: ['FDA black box warning'],
    rxcui: ['136411', '7517']
  },
  {
    drugs: ['allopurinol', 'azathioprine'],
    severity: 'major',
    mechanism: 'Inhibition of azathioprine metabolism',
    effect: 'Severe bone marrow suppression',
    management: 'Reduce azathioprine dose by 75%; monitor blood counts',
    evidence_level: 'A',
    sources: ['Rheumatology guidelines'],
    rxcui: ['519', '2azathioprine']
  }
];

export default KNOWN_INTERACTIONS;
