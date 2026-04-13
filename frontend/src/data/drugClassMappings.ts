/**
 * Drug-to-therapeutic-class mappings for alternative finding.
 * Ported from src/services/drugAlternativesService.js
 */

export const DRUG_CLASSES: Record<string, string> = {
  // Oncology
  doxorubicin: 'ANTHRACYCLINE', epirubicin: 'ANTHRACYCLINE', idarubicin: 'ANTHRACYCLINE',
  carboplatin: 'PLATINUM', cisplatin: 'PLATINUM', oxaliplatin: 'PLATINUM',
  paclitaxel: 'TAXANE', docetaxel: 'TAXANE', 'nab-paclitaxel': 'TAXANE',
  fluorouracil: 'ANTIMETABOLITE', capecitabine: 'ANTIMETABOLITE', gemcitabine: 'ANTIMETABOLITE', methotrexate: 'ANTIMETABOLITE', pemetrexed: 'ANTIMETABOLITE',
  imatinib: 'TKI', erlotinib: 'TKI', gefitinib: 'TKI', osimertinib: 'TKI', sunitinib: 'TKI', sorafenib: 'TKI', crizotinib: 'TKI', alectinib: 'TKI',
  nivolumab: 'CHECKPOINT_INHIBITOR', pembrolizumab: 'CHECKPOINT_INHIBITOR', atezolizumab: 'CHECKPOINT_INHIBITOR', ipilimumab: 'CHECKPOINT_INHIBITOR', durvalumab: 'CHECKPOINT_INHIBITOR',
  trastuzumab: 'ANTI_HER2', pertuzumab: 'ANTI_HER2', 'ado-trastuzumab': 'ANTI_HER2',
  bevacizumab: 'ANTI_VEGF', ramucirumab: 'ANTI_VEGF',
  tamoxifen: 'SERM', raloxifene: 'SERM',
  letrozole: 'AROMATASE_INHIBITOR', anastrozole: 'AROMATASE_INHIBITOR', exemestane: 'AROMATASE_INHIBITOR',
  vincristine: 'VINCA', vinblastine: 'VINCA', vinorelbine: 'VINCA',
  cyclophosphamide: 'ALKYLATING', ifosfamide: 'ALKYLATING', temozolomide: 'ALKYLATING', busulfan: 'ALKYLATING',
  etoposide: 'TOPOISOMERASE_II', topotecan: 'TOPOISOMERASE_I', irinotecan: 'TOPOISOMERASE_I',
  bortezomib: 'PROTEASOME_INHIBITOR', carfilzomib: 'PROTEASOME_INHIBITOR', ixazomib: 'PROTEASOME_INHIBITOR',
  thalidomide: 'IMID', lenalidomide: 'IMID', pomalidomide: 'IMID',
  // Pain Management
  morphine: 'OPIOID', oxycodone: 'OPIOID', hydromorphone: 'OPIOID', fentanyl: 'OPIOID', codeine: 'OPIOID', tramadol: 'OPIOID', hydrocodone: 'OPIOID', methadone: 'OPIOID',
  ibuprofen: 'NSAID', naproxen: 'NSAID', celecoxib: 'NSAID', ketorolac: 'NSAID', diclofenac: 'NSAID', meloxicam: 'NSAID',
  acetaminophen: 'ANALGESIC',
  // Cardiovascular
  warfarin: 'ANTICOAGULANT', enoxaparin: 'ANTICOAGULANT', heparin: 'ANTICOAGULANT', apixaban: 'DOAC', rivaroxaban: 'DOAC',
  clopidogrel: 'ANTIPLATELET', aspirin: 'ANTIPLATELET', prasugrel: 'ANTIPLATELET', ticagrelor: 'ANTIPLATELET',
  lisinopril: 'ACE_INHIBITOR', enalapril: 'ACE_INHIBITOR', ramipril: 'ACE_INHIBITOR',
  losartan: 'ARB', valsartan: 'ARB', irbesartan: 'ARB',
  amlodipine: 'CCB', nifedipine: 'CCB', diltiazem: 'CCB', verapamil: 'CCB',
  metoprolol: 'BETA_BLOCKER', atenolol: 'BETA_BLOCKER', propranolol: 'BETA_BLOCKER', carvedilol: 'BETA_BLOCKER',
  atorvastatin: 'STATIN', rosuvastatin: 'STATIN', simvastatin: 'STATIN', pravastatin: 'STATIN',
  amiodarone: 'ANTIARRHYTHMIC', sotalol: 'ANTIARRHYTHMIC', flecainide: 'ANTIARRHYTHMIC',
  // GI
  omeprazole: 'PPI', esomeprazole: 'PPI', lansoprazole: 'PPI', pantoprazole: 'PPI', rabeprazole: 'PPI',
  ondansetron: 'ANTIEMETIC_5HT3', granisetron: 'ANTIEMETIC_5HT3', palonosetron: 'ANTIEMETIC_5HT3',
  // Antibiotics
  ciprofloxacin: 'FLUOROQUINOLONE', levofloxacin: 'FLUOROQUINOLONE', moxifloxacin: 'FLUOROQUINOLONE',
  azithromycin: 'MACROLIDE', clarithromycin: 'MACROLIDE', erythromycin: 'MACROLIDE',
  amoxicillin: 'PENICILLIN', ampicillin: 'PENICILLIN',
  vancomycin: 'GLYCOPEPTIDE', daptomycin: 'LIPOPEPTIDE',
  // Antifungals
  fluconazole: 'AZOLE_ANTIFUNGAL', ketoconazole: 'AZOLE_ANTIFUNGAL', voriconazole: 'AZOLE_ANTIFUNGAL', itraconazole: 'AZOLE_ANTIFUNGAL', posaconazole: 'AZOLE_ANTIFUNGAL',
  micafungin: 'ECHINOCANDIN', caspofungin: 'ECHINOCANDIN', anidulafungin: 'ECHINOCANDIN',
  // Psych
  fluoxetine: 'SSRI', sertraline: 'SSRI', paroxetine: 'SSRI', citalopram: 'SSRI', escitalopram: 'SSRI',
  venlafaxine: 'SNRI', duloxetine: 'SNRI', desvenlafaxine: 'SNRI',
  gabapentin: 'GABAPENTINOID', pregabalin: 'GABAPENTINOID',
  // Immunosuppressants
  cyclosporine: 'CALCINEURIN_INHIBITOR', tacrolimus: 'CALCINEURIN_INHIBITOR',
}

/**
 * Get all drugs in the same therapeutic class
 */
export function getSameClassDrugs(drugName: string): string[] {
  const cls = DRUG_CLASSES[drugName.toLowerCase()]
  if (!cls) return []
  return Object.entries(DRUG_CLASSES)
    .filter(([name, c]) => c === cls && name !== drugName.toLowerCase())
    .map(([name]) => name)
}

/**
 * Get the therapeutic class of a drug
 */
export function getDrugClass(drugName: string): string | null {
  return DRUG_CLASSES[drugName.toLowerCase()] || null
}
