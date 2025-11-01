// Comprehensive oncology drug database with interaction profiles
export const oncologyDrugs = {
  // Immunotherapy agents
  pembrolizumab: {
    rxcui: '1734104',
    name: 'Pembrolizumab',
    brandNames: ['Keytruda'],
    category: 'PD-1 inhibitor',
    route: 'IV',
    mechanisms: ['PD-1_inhibition'],
    metabolism: 'proteolytic_degradation',
    halfLife: '22 days',
    oncologyIndications: ['melanoma', 'lung_cancer', 'breast_cancer', 'head_neck'],
    commonDoses: ['200mg Q3W', '400mg Q6W'],
    blackBoxWarnings: ['immune_related_adverse_events'],
    contraindications: ['active_autoimmune_disease']
  },

  nivolumab: {
    rxcui: '1437205',
    name: 'Nivolumab',
    brandNames: ['Opdivo'],
    category: 'PD-1 inhibitor',
    route: 'IV',
    mechanisms: ['PD-1_inhibition'],
    metabolism: 'proteolytic_degradation',
    halfLife: '25 days',
    oncologyIndications: ['melanoma', 'lung_cancer', 'renal_cell', 'head_neck'],
    commonDoses: ['240mg Q2W', '480mg Q4W'],
    blackBoxWarnings: ['immune_related_adverse_events']
  },

  // Chemotherapy agents
  doxorubicin: {
    rxcui: '3639',
    name: 'Doxorubicin',
    brandNames: ['Adriamycin'],
    category: 'Anthracycline',
    route: 'IV',
    mechanisms: ['DNA_intercalation', 'topoisomerase_II_inhibition'],
    metabolism: 'hepatic_CYP3A4',
    halfLife: '20-48 hours',
    oncologyIndications: ['breast_cancer', 'lymphoma', 'sarcoma', 'leukemia'],
    commonDoses: ['60mg/m2 Q3W', 'AC: 60mg/m2 Q3W x4'],
    blackBoxWarnings: ['cardiotoxicity', 'secondary_malignancies'],
    majorToxicities: ['cardiomyopathy', 'myelosuppression', 'alopecia'],
    doseModifications: {
      hepatic: 'Reduce dose for elevated bilirubin',
      cardiac: 'Monitor LVEF, cumulative dose <300mg/m2'
    }
  },

  carboplatin: {
    rxcui: '1819',
    name: 'Carboplatin',
    brandNames: ['Paraplatin'],
    category: 'Platinum compound',
    route: 'IV',
    mechanisms: ['DNA_crosslinking'],
    metabolism: 'renal_elimination',
    halfLife: '2-6 hours',
    oncologyIndications: ['ovarian_cancer', 'lung_cancer', 'breast_cancer'],
    commonDoses: ['AUC 5-6 Q3W', 'AUC 2 weekly'],
    majorToxicities: ['thrombocytopenia', 'neutropenia', 'nephrotoxicity'],
    doseModifications: {
      renal: 'Calvert formula for dosing',
      hematologic: 'Hold for ANC <1500, PLT <100k'
    }
  },

  // Targeted therapies
  trastuzumab: {
    rxcui: '209333',
    name: 'Trastuzumab',
    brandNames: ['Herceptin'],
    category: 'HER2 inhibitor',
    route: 'IV',
    mechanisms: ['HER2_inhibition'],
    metabolism: 'proteolytic_degradation',
    halfLife: '28 days',
    oncologyIndications: ['HER2_positive_breast_cancer', 'HER2_positive_gastric'],
    commonDoses: ['8mg/kg loading, then 6mg/kg Q3W'],
    blackBoxWarnings: ['cardiotoxicity'],
    biomarkers: ['HER2_overexpression', 'HER2_amplification']
  },

  // Oral targeted agents
  imatinib: {
    rxcui: '282388',
    name: 'Imatinib',
    brandNames: ['Gleevec'],
    category: 'Tyrosine kinase inhibitor',
    route: 'oral',
    mechanisms: ['BCR_ABL_inhibition', 'c_KIT_inhibition'],
    metabolism: 'hepatic_CYP3A4',
    halfLife: '18 hours',
    oncologyIndications: ['CML', 'GIST', 'ALL_Ph_positive'],
    commonDoses: ['400mg daily', '600mg daily'],
    majorToxicities: ['fluid_retention', 'myelosuppression', 'hepatotoxicity'],
    drugInteractions: ['CYP3A4_strong_inhibitors', 'CYP3A4_strong_inducers']
  },

  // Hormonal agents
  tamoxifen: {
    rxcui: '10324',
    name: 'Tamoxifen',
    brandNames: ['Nolvadex'],
    category: 'SERM',
    route: 'oral',
    mechanisms: ['estrogen_receptor_modulation'],
    metabolism: 'hepatic_CYP2D6_CYP3A4',
    halfLife: '5-7 days',
    oncologyIndications: ['ER_positive_breast_cancer'],
    commonDoses: ['20mg daily x 5-10 years'],
    majorToxicities: ['thromboembolism', 'endometrial_cancer', 'hot_flashes'],
    geneticFactors: ['CYP2D6_poor_metabolizers']
  }
};

// Drug-drug interactions database
export const drugInteractions = {
  // Critical interactions
  'doxorubicin-trastuzumab': {
    severity: 'critical',
    mechanism: 'Additive cardiotoxicity',
    effect: 'Synergistic risk of cardiomyopathy and heart failure',
    incidence: '4-28%',
    onset: '2-6 months',
    management: [
      'Avoid concurrent use if possible',
      'If concurrent use necessary, monitor LVEF every 3 months',
      'Consider sequential rather than concurrent therapy',
      'Cardio-oncology consultation recommended'
    ],
    evidenceLevel: 'A',
    sources: ['FDA_warning', 'Clinical_trials', 'Meta_analysis'],
    monitoringPlan: [
      'Baseline ECHO or MUGA',
      'LVEF monitoring every 3 months during treatment',
      'Monitor for signs/symptoms of heart failure',
      'Consider cardiac biomarkers (troponin, BNP)'
    ]
  },

  'carboplatin-aminoglycosides': {
    severity: 'major',
    mechanism: 'Additive nephrotoxicity and ototoxicity',
    effect: 'Increased risk of kidney damage and hearing loss',
    incidence: '10-30%',
    onset: 'Days to weeks',
    management: [
      'Avoid concurrent use when possible',
      'If necessary, increase monitoring frequency',
      'Ensure adequate hydration',
      'Consider alternative antibiotics'
    ],
    evidenceLevel: 'B',
    monitoringPlan: [
      'Daily creatinine monitoring',
      'Audiometry if prolonged use',
      'Monitor electrolytes',
      'Assess for tinnitus/hearing changes'
    ]
  },

  'imatinib-ketoconazole': {
    severity: 'major',
    mechanism: 'CYP3A4 inhibition increases imatinib exposure',
    effect: '3-5 fold increase in imatinib plasma levels',
    incidence: '100% (pharmacokinetic)',
    onset: 'Hours to days',
    management: [
      'Reduce imatinib dose by 50-75%',
      'Monitor for increased toxicity',
      'Consider alternative antifungal if possible',
      'Increase monitoring frequency'
    ],
    evidenceLevel: 'A',
    monitoringPlan: [
      'Weekly CBC for first month',
      'LFTs every 2 weeks',
      'Monitor for fluid retention',
      'Watch for GI toxicity'
    ]
  },

  'tamoxifen-paroxetine': {
    severity: 'major',
    mechanism: 'CYP2D6 inhibition reduces tamoxifen efficacy',
    effect: 'Reduced formation of active metabolite endoxifen',
    incidence: 'Variable (genetic dependent)',
    onset: 'Immediate (metabolic)',
    management: [
      'Avoid strong CYP2D6 inhibitors',
      'Consider alternative antidepressants (citalopram, venlafaxine)',
      'CYP2D6 genotyping may be helpful',
      'Monitor treatment response closely'
    ],
    evidenceLevel: 'B',
    monitoringPlan: [
      'Annual mammography',
      'Clinical breast exams',
      'Monitor for recurrence',
      'Consider endoxifen levels if available'
    ]
  },

  // Moderate interactions
  'pembrolizumab-corticosteroids': {
    severity: 'moderate',
    mechanism: 'Immunosuppression may reduce pembrolizumab efficacy',
    effect: 'Potential reduction in immune system activation',
    incidence: 'Unknown',
    onset: 'Days to weeks',
    management: [
      'Use lowest effective steroid dose',
      'Consider steroid-sparing agents',
      'Monitor treatment response',
      'Taper steroids when possible'
    ],
    evidenceLevel: 'C',
    monitoringPlan: [
      'Regular tumor assessments',
      'Monitor for immune-related AEs',
      'Consider steroid taper schedule'
    ]
  },

  // Supportive care interactions
  'metoclopramide-ondansetron': {
    severity: 'moderate',
    mechanism: 'Opposing effects on dopamine receptors',
    effect: 'Potential reduction in antiemetic efficacy',
    incidence: 'Theoretical',
    onset: 'Immediate',
    management: [
      'Space dosing by 2-4 hours',
      'Consider alternative antiemetics',
      'Monitor antiemetic effectiveness'
    ],
    evidenceLevel: 'C'
  }
};

// Drug-condition interactions
export const drugConditionInteractions = {
  'doxorubicin-heart_failure': {
    severity: 'critical',
    contraindication: true,
    effect: 'Worsening of existing cardiomyopathy',
    management: 'Absolute contraindication in severe heart failure'
  },

  'imatinib-liver_disease': {
    severity: 'major',
    effect: 'Increased drug exposure and hepatotoxicity',
    management: 'Dose reduction and increased monitoring required'
  },

  'carboplatin-kidney_disease': {
    severity: 'major',
    effect: 'Increased nephrotoxicity risk',
    management: 'Dose adjustment based on creatinine clearance'
  }
};

// Pharmacogenomic associations
export const pharmacogenomics = {
  CYP2D6: {
    drugs: ['tamoxifen', 'codeine', 'tramadol'],
    phenotypes: {
      poor_metabolizer: {
        frequency: '7% (Caucasian), 2% (Asian)',
        implications: 'Reduced tamoxifen efficacy, increased codeine toxicity risk'
      },
      extensive_metabolizer: {
        frequency: '77% (Caucasian)',
        implications: 'Normal drug metabolism'
      },
      ultrarapid_metabolizer: {
        frequency: '1-2% (Caucasian), 29% (Ethiopian)',
        implications: 'Rapid metabolism, potential treatment failure'
      }
    }
  },

  DPYD: {
    drugs: ['fluorouracil', 'capecitabine'],
    phenotypes: {
      poor_metabolizer: {
        frequency: '0.2%',
        implications: 'Severe fluoropyrimidine toxicity risk',
        recommendation: 'Avoid or drastically reduce dose'
      }
    }
  },

  UGT1A1: {
    drugs: ['irinotecan'],
    phenotypes: {
      poor_metabolizer: {
        frequency: '10% (Caucasian), 16% (Asian)',
        implications: 'Increased risk of severe diarrhea and neutropenia',
        recommendation: 'Reduce starting dose by 25-50%'
      }
    }
  }
};

export default {
  oncologyDrugs,
  drugInteractions,
  drugConditionInteractions,
  pharmacogenomics
};