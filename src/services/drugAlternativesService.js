import axios from 'axios';

class DrugAlternativesService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 1000 * 60 * 60; // 1 hour cache
    
    // Drug class mappings for therapeutic alternatives
    this.drugClasses = {
      // Cardiovascular
      'lisinopril': 'ACE_INHIBITORS',
      'enalapril': 'ACE_INHIBITORS', 
      'ramipril': 'ACE_INHIBITORS',
      'telma': 'ARB', // Indian brand of telmisartan
      'losartan': 'ARB',
      'valsartan': 'ARB',
      'irbesartan': 'ARB',
      'telmisartan': 'ARB',
      'amlodipine': 'CCB_DIHYDROPYRIDINE',
      'nifedipine': 'CCB_DIHYDROPYRIDINE',
      'cilicar': 'CCB_DIHYDROPYRIDINE', // Indian brand of cilnidipine
      'diltiazem': 'CCB_NON_DIHYDROPYRIDINE',
      'verapamil': 'CCB_NON_DIHYDROPYRIDINE',
      'metoprolol': 'BETA_BLOCKERS',
      'metpure': 'BETA_BLOCKERS', // Indian brand of metoprolol
      'atenolol': 'BETA_BLOCKERS',
      'propranolol': 'BETA_BLOCKERS',
      'carvedilol': 'BETA_BLOCKERS',
      'atorvastatin': 'STATINS',
      'atorva': 'STATINS', // Indian brand of atorvastatin
      'simvastatin': 'STATINS',
      'rosuvastatin': 'STATINS',
      'rosuvas': 'STATINS', // Indian brand of rosuvastatin
      'pravastatin': 'STATINS',
      'warfarin': 'ANTICOAGULANTS',
      'rivaroxaban': 'DOAC',
      'apixaban': 'DOAC',
      'dabigatran': 'DOAC',
      
      // Analgesics
      'acetaminophen': 'NON_OPIOID_ANALGESICS',
      'paracetamol': 'NON_OPIOID_ANALGESICS',
      'ibuprofen': 'NSAIDS',
      'naproxen': 'NSAIDS',
      'diclofenac': 'NSAIDS',
      'celecoxib': 'COX2_INHIBITORS',
      'aspirin': 'SALICYLATES',
      'morphine': 'OPIOIDS',
      'oxycodone': 'OPIOIDS',
      'fentanyl': 'OPIOIDS',
      'tramadol': 'ATYPICAL_OPIOIDS',
      
      // Antidiabetics
      'metformin': 'BIGUANIDES',
      'glycomet': 'BIGUANIDES', // Indian brand of metformin
      'glipizide': 'SULFONYLUREAS',
      'glyburide': 'SULFONYLUREAS',
      'glimepiride': 'SULFONYLUREAS',
      'amaryl': 'SULFONYLUREAS', // Indian brand of glimepiride
      'sitagliptin': 'DPP4_INHIBITORS',
      'januvia': 'DPP4_INHIBITORS', // Brand of sitagliptin
      'linagliptin': 'DPP4_INHIBITORS',
      'pioglitazone': 'TZD',
      'insulin': 'INSULIN',
      'human mixtard': 'INSULIN', // Common insulin in India
      
      // Gastrointestinal
      'omeprazole': 'PPI',
      'omez': 'PPI', // Indian brand of omeprazole
      'pantoprazole': 'PPI',
      'pantop': 'PPI', // Indian brand of pantoprazole
      'esomeprazole': 'PPI',
      'nexium': 'PPI', // Brand of esomeprazole
      'lansoprazole': 'PPI',
      'famotidine': 'H2_BLOCKERS',
      'pepcid': 'H2_BLOCKERS', // Brand of famotidine
      'ranitidine': 'H2_BLOCKERS',
      'rantac': 'H2_BLOCKERS', // Indian brand of ranitidine
      
      // Antibiotics
      'amoxicillin': 'PENICILLINS',
      'amoxil': 'PENICILLINS', // Brand of amoxicillin
      'ampicillin': 'PENICILLINS',
      'cephalexin': 'CEPHALOSPORINS',
      'cefixime': 'CEPHALOSPORINS',
      'cefazolin': 'CEPHALOSPORINS',
      'azithromycin': 'MACROLIDES',
      'azee': 'MACROLIDES', // Indian brand of azithromycin
      'clarithromycin': 'MACROLIDES',
      'ciprofloxacin': 'FLUOROQUINOLONES',
      'cipro': 'FLUOROQUINOLONES', // Brand of ciprofloxacin
      'levofloxacin': 'FLUOROQUINOLONES',
      'doxycycline': 'TETRACYCLINES',
      'doxy': 'TETRACYCLINES', // Common short name
      'minocycline': 'TETRACYCLINES',
      
      // Diuretics
      'furosemide': 'LOOP_DIURETICS',
      'dytor': 'LOOP_DIURETICS', // Indian brand of furosemide
      'bumetanide': 'LOOP_DIURETICS',
      
      // Antihypertensives (Alpha-2 agonists)
      'clonidine': 'ALPHA2_AGONISTS',
      'arkamin': 'ALPHA2_AGONISTS', // Indian brand of clonidine
      
      // Anticonvulsants
      'oxcarbazepine': 'ANTICONVULSANTS',
      'oxra': 'ANTICONVULSANTS', // Indian brand of oxcarbazepine
      'carbamazepine': 'ANTICONVULSANTS',
      'phenytoin': 'ANTICONVULSANTS',
      
      // Sedatives/Hypnotics
      'zolpidem': 'Z_DRUGS',
      'zolfresh': 'Z_DRUGS', // Indian brand of zolpidem
      'zopiclone': 'Z_DRUGS',
      
      // Probiotics
      'probowel': 'PROBIOTICS', // Indian probiotic
      'lactobacillus': 'PROBIOTICS',
      
      // Potassium binders
      'kbind': 'POTASSIUM_BINDERS', // Indian brand of calcium polystyrene sulfonate
      'kayexalate': 'POTASSIUM_BINDERS',
      
      // Common Indian medicines
      'paracetamol': 'NON_OPIOID_ANALGESICS',
      'crocin': 'NON_OPIOID_ANALGESICS', // Indian brand of paracetamol
      'dolo': 'NON_OPIOID_ANALGESICS', // Indian brand of paracetamol
      'combiflam': 'NSAIDS', // Indian combination of ibuprofen + paracetamol
      'brufen': 'NSAIDS', // Indian brand of ibuprofen
      'voveran': 'NSAIDS', // Indian brand of diclofenac
      'aspirin': 'SALICYLATES',
      'disprin': 'SALICYLATES', // Indian brand of aspirin
      
      // Thyroid medications
      'levothyroxine': 'THYROID_HORMONES',
      'eltroxin': 'THYROID_HORMONES', // Indian brand of levothyroxine
      'thyronorm': 'THYROID_HORMONES', // Indian brand of levothyroxine
      
      // Antacids
      'eno': 'ANTACIDS', // Popular Indian antacid
      'gelusil': 'ANTACIDS', // Indian antacid brand
      'digene': 'ANTACIDS', // Indian antacid brand
      
      // Cough and cold
      'dextromethorphan': 'COUGH_SUPPRESSANTS',
      'benadryl': 'ANTIHISTAMINES', // Brand name
      'cetirizine': 'ANTIHISTAMINES',
      'zyrtec': 'ANTIHISTAMINES', // Brand of cetirizine
      'allegra': 'ANTIHISTAMINES', // Brand of fexofenadine
      
      // Vitamins commonly prescribed in India
      'calcium': 'CALCIUM_SUPPLEMENTS',
      'shelcal': 'CALCIUM_SUPPLEMENTS', // Indian calcium brand
      'calcimax': 'CALCIUM_SUPPLEMENTS', // Indian calcium brand
      'vitamin d3': 'VITAMIN_D',
      'uprise': 'VITAMIN_D', // Indian vitamin D3 brand
      'iron': 'IRON_SUPPLEMENTS',
      'autrin': 'IRON_SUPPLEMENTS', // Indian iron supplement
      'folic acid': 'B_VITAMINS',
      'vitamin b12': 'B_VITAMINS',
      
      // Oncology
      'doxorubicin': 'ANTHRACYCLINES',
      'epirubicin': 'ANTHRACYCLINES',
      'cyclophosphamide': 'ALKYLATING_AGENTS',
      'carboplatin': 'PLATINUM_COMPOUNDS',
      'cisplatin': 'PLATINUM_COMPOUNDS',
      'oxaliplatin': 'PLATINUM_COMPOUNDS',
      'paclitaxel': 'TAXANES',
      'docetaxel': 'TAXANES',
      'fluorouracil': 'ANTIMETABOLITES',
      '5-fu': 'ANTIMETABOLITES',
      'capecitabine': 'ANTIMETABOLITES',
      'gemcitabine': 'ANTIMETABOLITES',
      'methotrexate': 'ANTIMETABOLITES'
    };
    
    // Therapeutic alternatives by drug class
    this.therapeuticAlternatives = {
      'ACE_INHIBITORS': ['lisinopril', 'enalapril', 'ramipril', 'benazepril'],
      'ARB': ['losartan', 'valsartan', 'irbesartan', 'olmesartan', 'telmisartan', 'telma'],
      'CCB_DIHYDROPYRIDINE': ['amlodipine', 'cilicar', 'nifedipine', 'felodipine'],
      'CCB_NON_DIHYDROPYRIDINE': ['diltiazem', 'verapamil'],
      'BETA_BLOCKERS': ['metoprolol', 'metpure', 'atenolol', 'propranolol', 'carvedilol'],
      'STATINS': ['atorvastatin', 'atorva', 'simvastatin', 'rosuvastatin', 'rosuvas', 'pravastatin'],
      'DOAC': ['rivaroxaban', 'apixaban', 'dabigatran', 'edoxaban'],
      'NSAIDS': ['ibuprofen', 'brufen', 'naproxen', 'diclofenac', 'voveran', 'indomethacin', 'combiflam'],
      'COX2_INHIBITORS': ['celecoxib', 'rofecoxib'],
      'SULFONYLUREAS': ['glipizide', 'glyburide', 'glimepiride', 'amaryl'],
      'DPP4_INHIBITORS': ['sitagliptin', 'januvia', 'linagliptin', 'saxagliptin'],
      'PPI': ['omeprazole', 'omez', 'pantoprazole', 'pantop', 'esomeprazole', 'nexium', 'lansoprazole'],
      'BIGUANIDES': ['metformin', 'glycomet'],
      'NON_OPIOID_ANALGESICS': ['acetaminophen', 'paracetamol', 'crocin', 'dolo'],
      'H2_BLOCKERS': ['famotidine', 'cimetidine', 'nizatidine'],
      'PENICILLINS': ['amoxicillin', 'ampicillin', 'penicillin'],
      'CEPHALOSPORINS': ['cephalexin', 'cefazolin', 'ceftriaxone'],
      'MACROLIDES': ['azithromycin', 'clarithromycin', 'erythromycin'],
      'FLUOROQUINOLONES': ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
      'ANTHRACYCLINES': ['doxorubicin', 'epirubicin', 'daunorubicin'],
      'PLATINUM_COMPOUNDS': ['carboplatin', 'cisplatin', 'oxaliplatin'],
      'TAXANES': ['paclitaxel', 'docetaxel', 'cabazitaxel'],
      'ANTIMETABOLITES': ['fluorouracil', 'capecitabine', 'gemcitabine', 'methotrexate'],
      
      // New drug classes for Indian medications
      'LOOP_DIURETICS': ['furosemide', 'dytor', 'bumetanide', 'torsemide'],
      'ALPHA2_AGONISTS': ['clonidine', 'arkamin', 'methyldopa'],
      'ANTICONVULSANTS': ['oxcarbazepine', 'oxra', 'carbamazepine', 'phenytoin', 'valproate'],
      'Z_DRUGS': ['zolpidem', 'zolfresh', 'zopiclone', 'zaleplon'],
      'PROBIOTICS': ['probowel', 'lactobacillus', 'bifidobacterium', 'saccharomyces'],
      'POTASSIUM_BINDERS': ['kbind', 'kayexalate', 'patiromer', 'sodium zirconium'],
      
      // Additional Indian medication classes
      'THYROID_HORMONES': ['levothyroxine', 'eltroxin', 'thyronorm'],
      'ANTACIDS': ['eno', 'gelusil', 'digene', 'magnesium hydroxide'],
      'ANTIHISTAMINES': ['cetirizine', 'zyrtec', 'allegra', 'benadryl', 'fexofenadine'],
      'CALCIUM_SUPPLEMENTS': ['calcium', 'shelcal', 'calcimax', 'calcium carbonate'],
      'VITAMIN_D': ['vitamin d3', 'uprise', 'cholecalciferol'],
      'IRON_SUPPLEMENTS': ['iron', 'autrin', 'ferrous sulfate'],
      'B_VITAMINS': ['folic acid', 'vitamin b12', 'methylcobalamin'],
      'SALICYLATES': ['aspirin', 'disprin', 'acetylsalicylic acid'],
      'COUGH_SUPPRESSANTS': ['dextromethorphan', 'codeine'],
      'INSULIN': ['insulin', 'human mixtard', 'regular insulin']
    };
    
    // Drug interaction severity database
    this.interactionMatrix = {
      'warfarin': {
        'aspirin': { severity: 'major', mechanism: 'Additive bleeding risk' },
        'ibuprofen': { severity: 'moderate', mechanism: 'Increased bleeding risk' },
        'acetaminophen': { severity: 'minor', mechanism: 'Minimal interaction' },
        'amoxicillin': { severity: 'moderate', mechanism: 'Enhanced anticoagulation' }
      },
      'metformin': {
        'iodinated contrast': { severity: 'major', mechanism: 'Lactic acidosis risk' },
        'alcohol': { severity: 'moderate', mechanism: 'Hypoglycemia risk' }
      },
      'simvastatin': {
        'clarithromycin': { severity: 'major', mechanism: 'CYP3A4 inhibition' },
        'gemfibrozil': { severity: 'major', mechanism: 'Rhabdomyolysis risk' }
      }
    };
  }

  /**
   * Find therapeutic alternatives for a given drug combination
   */
  async findAlternatives(drugCombination, patientProfile = {}) {
    try {
      const cacheKey = JSON.stringify({ drugCombination, patientProfile });
      
      // Check cache
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      const alternatives = [];
      
      // Analyze each drug in the combination
      for (let i = 0; i < drugCombination.length; i++) {
        const targetDrug = drugCombination[i];
        const otherDrugs = drugCombination.filter((_, index) => index !== i);
        
        const drugAlternatives = await this.findDrugAlternatives(
          targetDrug, 
          otherDrugs, 
          patientProfile
        );
        
        alternatives.push(...drugAlternatives);
      }
      
      // Sort by safety score and efficacy
      alternatives.sort((a, b) => (b.safetyScore + b.efficacyScore) - (a.safetyScore + a.efficacyScore));
      
      // Cache result
      this.cache.set(cacheKey, {
        data: alternatives,
        timestamp: Date.now()
      });
      
      return alternatives;

    } catch (error) {
      console.error('Error finding drug alternatives:', error);
      throw new Error('Failed to find drug alternatives');
    }
  }

  /**
   * Find alternatives for a specific drug
   */
  async findDrugAlternatives(targetDrug, otherDrugs, patientProfile) {
    const drugName = this.normalizeDrugName(targetDrug.name || targetDrug);
    const drugClass = this.drugClasses[drugName.toLowerCase()];
    
    if (!drugClass) {
      return [{
        forDrug: targetDrug,
        alternative: null,
        rationale: 'No therapeutic alternatives identified in database',
        safetyScore: 0,
        efficacyScore: 0,
        evidenceLevel: 'low',
        costImpact: 'unknown',
        formularyStatus: 'check-coverage',
        contraindications: [],
        clinicalNotes: 'Manual review recommended for alternative selection'
      }];
    }
    
    const alternatives = this.therapeuticAlternatives[drugClass] || [];
    const validAlternatives = [];
    
    for (const altDrugName of alternatives) {
      if (altDrugName.toLowerCase() === drugName.toLowerCase()) continue;
      
      // Check for interactions with other drugs
      const interactionAnalysis = this.analyzeInteractions(altDrugName, otherDrugs);
      
      // Check patient-specific factors
      const patientSuitability = this.assessPatientSuitability(altDrugName, patientProfile);
      
      if (interactionAnalysis.overallRisk <= 2 && patientSuitability.suitable) { // Scale 0-3
        validAlternatives.push({
          forDrug: targetDrug,
          alternative: {
            name: this.formatDrugName(altDrugName),
            genericName: altDrugName,
            drugClass: drugClass,
            route: this.getDrugRoute(altDrugName),
            strength: this.getTypicalStrength(altDrugName)
          },
          rationale: this.generateRationale(altDrugName, drugName, interactionAnalysis),
          safetyScore: Math.max(0, 100 - (interactionAnalysis.overallRisk * 25)),
          efficacyScore: this.calculateEfficacyScore(altDrugName, drugName),
          evidenceLevel: this.getEvidenceLevel(altDrugName, drugName),
          costImpact: this.estimateCostImpact(altDrugName, drugName),
          formularyStatus: this.getFormularyStatus(altDrugName),
          contraindications: patientSuitability.contraindications,
          clinicalNotes: this.generateClinicalNotes(altDrugName, patientProfile),
          interactionDetails: interactionAnalysis.details,
          monitoringRequirements: this.getMonitoringRequirements(altDrugName),
          dosageAdjustments: patientSuitability.dosageAdjustments
        });
      }
    }
    
    return validAlternatives.slice(0, 3); // Return top 3 alternatives
  }

  /**
   * Analyze drug interactions for a potential alternative
   */
  analyzeInteractions(drugName, otherDrugs) {
    let totalRisk = 0;
    const details = [];
    
    for (const otherDrug of otherDrugs) {
      const otherDrugName = this.normalizeDrugName(otherDrug.name || otherDrug);
      const interaction = this.checkInteraction(drugName, otherDrugName);
      
      if (interaction) {
        const riskScore = this.getSeverityScore(interaction.severity);
        totalRisk += riskScore;
        details.push({
          drug: otherDrugName,
          severity: interaction.severity,
          mechanism: interaction.mechanism,
          riskScore
        });
      }
    }
    
    return {
      overallRisk: Math.min(totalRisk, 3), // Cap at 3
      details,
      riskLevel: totalRisk === 0 ? 'low' : totalRisk <= 1 ? 'moderate' : 'high'
    };
  }

  /**
   * Check for specific drug-drug interaction
   */
  checkInteraction(drug1, drug2) {
    const interaction1 = this.interactionMatrix[drug1.toLowerCase()]?.[drug2.toLowerCase()];
    const interaction2 = this.interactionMatrix[drug2.toLowerCase()]?.[drug1.toLowerCase()];
    
    return interaction1 || interaction2 || null;
  }

  /**
   * Convert severity to numeric score
   */
  getSeverityScore(severity) {
    switch (severity.toLowerCase()) {
      case 'major': return 3;
      case 'moderate': return 2;
      case 'minor': return 1;
      default: return 0;
    }
  }

  /**
   * Assess patient suitability for alternative drug
   */
  assessPatientSuitability(drugName, patientProfile) {
    const contraindications = [];
    const dosageAdjustments = [];
    let suitable = true;
    
    // Age-based considerations
    if (patientProfile.age) {
      if (patientProfile.age >= 65) {
        if (['diphenhydramine', 'amitriptyline'].includes(drugName.toLowerCase())) {
          contraindications.push('Avoid in elderly due to anticholinergic effects');
          suitable = false;
        }
      }
      
      if (patientProfile.age < 18) {
        if (['aspirin', 'doxycycline'].includes(drugName.toLowerCase())) {
          contraindications.push('Contraindicated in pediatric patients');
          suitable = false;
        }
      }
    }
    
    // Renal function considerations
    if (patientProfile.renalFunction === 'impaired') {
      if (['metformin', 'gabapentin'].includes(drugName.toLowerCase())) {
        dosageAdjustments.push('Dose reduction required for renal impairment');
      }
    }
    
    // Hepatic function considerations
    if (patientProfile.hepaticFunction === 'impaired') {
      if (['acetaminophen', 'statins'].some(drug => drugName.toLowerCase().includes(drug))) {
        dosageAdjustments.push('Caution with hepatic impairment');
      }
    }
    
    // Allergy considerations
    if (patientProfile.allergies) {
      for (const allergy of patientProfile.allergies) {
        if (this.checkAllergyContraindication(drugName, allergy)) {
          contraindications.push(`Contraindicated due to ${allergy} allergy`);
          suitable = false;
        }
      }
    }
    
    return {
      suitable,
      contraindications,
      dosageAdjustments
    };
  }

  /**
   * Check for allergy-based contraindications
   */
  checkAllergyContraindication(drugName, allergy) {
    const allergyMap = {
      'penicillin': ['amoxicillin', 'ampicillin', 'penicillin'],
      'sulfa': ['sulfamethoxazole', 'trimethoprim'],
      'aspirin': ['aspirin', 'salicylates']
    };
    
    const contraindicated = allergyMap[allergy.toLowerCase()] || [];
    return contraindicated.some(drug => drugName.toLowerCase().includes(drug));
  }

  /**
   * Generate rationale for alternative selection
   */
  generateRationale(altDrug, originalDrug, interactionAnalysis) {
    const reasons = [];
    
    if (interactionAnalysis.overallRisk === 0) {
      reasons.push('No known drug interactions');
    } else if (interactionAnalysis.overallRisk <= 1) {
      reasons.push('Lower interaction risk profile');
    }
    
    reasons.push('Same therapeutic class');
    reasons.push('Similar efficacy profile');
    
    return reasons.join('; ');
  }

  /**
   * Calculate efficacy score relative to original drug
   */
  calculateEfficacyScore(altDrug, originalDrug) {
    // Base score is 85 for same-class alternatives
    let score = 85;
    
    // Preferred agents in class get higher scores
    const preferredAgents = {
      'lisinopril': 95, // First-line ACE inhibitor
      'atorvastatin': 95, // Potent statin
      'metformin': 95, // First-line diabetes
      'omeprazole': 90, // Well-studied PPI
      'amoxicillin': 90 // First-line antibiotic
    };
    
    return preferredAgents[altDrug.toLowerCase()] || score;
  }

  /**
   * Get evidence level for alternative
   */
  getEvidenceLevel(altDrug, originalDrug) {
    // Most alternatives in same class have high evidence
    return 'high';
  }

  /**
   * Estimate cost impact
   */
  estimateCostImpact(altDrug, originalDrug) {
    const genericDrugs = [
      'lisinopril', 'metformin', 'simvastatin', 'omeprazole', 
      'amoxicillin', 'metoprolol', 'amlodipine'
    ];
    
    if (genericDrugs.includes(altDrug.toLowerCase())) {
      return 'lower'; // Generic likely cheaper
    }
    
    return 'similar';
  }

  /**
   * Get formulary status
   */
  getFormularyStatus(drugName) {
    const tier1Drugs = [
      'lisinopril', 'metformin', 'simvastatin', 'omeprazole',
      'amoxicillin', 'metoprolol', 'amlodipine'
    ];
    
    if (tier1Drugs.includes(drugName.toLowerCase())) {
      return 'likely-covered';
    }
    
    return 'check-coverage';
  }

  /**
   * Generate clinical notes
   */
  generateClinicalNotes(drugName, patientProfile) {
    const notes = [];
    
    if (patientProfile.age >= 65) {
      notes.push('Consider reduced starting dose in elderly patients');
    }
    
    if (patientProfile.renalFunction === 'impaired') {
      notes.push('Monitor renal function');
    }
    
    if (patientProfile.hepaticFunction === 'impaired') {
      notes.push('Monitor liver function');
    }
    
    return notes.join('; ') || 'Standard monitoring recommended';
  }

  /**
   * Get monitoring requirements
   */
  getMonitoringRequirements(drugName) {
    const monitoring = {
      'lisinopril': ['Blood pressure', 'Renal function', 'Potassium'],
      'metformin': ['Blood glucose', 'Renal function', 'Vitamin B12'],
      'atorvastatin': ['Lipid panel', 'Liver function'],
      'warfarin': ['INR', 'Bleeding signs'],
      'omeprazole': ['Symptom relief', 'Magnesium (long-term)']
    };
    
    return monitoring[drugName.toLowerCase()] || ['Clinical response', 'Adverse effects'];
  }

  /**
   * Utility functions
   */
  normalizeDrugName(name) {
    return name.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  formatDrugName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  getDrugRoute(drugName) {
    const ivDrugs = ['doxorubicin', 'cisplatin', 'carboplatin'];
    return ivDrugs.includes(drugName.toLowerCase()) ? 'IV' : 'Oral';
  }

  getTypicalStrength(drugName) {
    const strengths = {
      'lisinopril': '10 mg',
      'metformin': '500 mg',
      'atorvastatin': '20 mg',
      'omeprazole': '20 mg',
      'amoxicillin': '500 mg'
    };
    
    return strengths[drugName.toLowerCase()] || 'Variable';
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new DrugAlternativesService();