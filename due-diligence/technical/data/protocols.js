// Oncology treatment protocols with evidence-based guidelines

export const PROTOCOLS = [
  {
    id: 'folfox',
    name: 'FOLFOX',
    cancerType: 'Colorectal Cancer',
    stage: 'Advanced',
    drugs: ['Fluorouracil', 'Oxaliplatin', 'Leucovorin'],
    duration: '12 weeks',
    responseRate: '45%',
    source: 'NCCN',
    indication: 'First-line treatment for metastatic colorectal cancer',
    efficacyData: {
      overallSurvival: '20.3 months',
      progressionFreeSurvival: '9.0 months',
      responseRate: '45%',
      diseaseControlRate: '75%'
    },
    toxicityProfile: {
      grade3_4: '70%',
      commonAEs: ['Neuropathy', 'Neutropenia', 'Diarrhea', 'Fatigue'],
      seriousAEs: ['Febrile neutropenia', 'Severe neuropathy', 'Severe diarrhea']
    },
    contraindications: [
      'Severe renal impairment (CrCl < 30 mL/min)',
      'Severe hepatic impairment',
      'History of severe allergic reaction to platinum compounds',
      'Pregnancy or breastfeeding'
    ],
    monitoring: [
      'CBC with differential before each cycle',
      'Comprehensive metabolic panel',
      'Neuropathy assessment (CIPN-20 scale)',
      'Performance status evaluation'
    ]
  },
  {
    id: 'folfiri',
    name: 'FOLFIRI',
    cancerType: 'Colorectal Cancer',
    stage: 'Advanced',
    drugs: ['Fluorouracil', 'Irinotecan', 'Leucovorin'],
    duration: '12 weeks',
    responseRate: '35%',
    source: 'NCCN',
    indication: 'Second-line treatment for metastatic colorectal cancer',
    efficacyData: {
      overallSurvival: '18.5 months',
      progressionFreeSurvival: '7.2 months',
      responseRate: '35%',
      diseaseControlRate: '68%'
    },
    toxicityProfile: {
      grade3_4: '65%',
      commonAEs: ['Diarrhea', 'Neutropenia', 'Nausea', 'Fatigue'],
      seriousAEs: ['Severe diarrhea', 'Febrile neutropenia', 'Severe dehydration']
    },
    contraindications: [
      'UGT1A1*28 homozygosity (relative contraindication)',
      'Severe renal impairment',
      'Severe hepatic impairment',
      'History of severe irinotecan allergy'
    ],
    monitoring: [
      'CBC with differential before each cycle',
      'UGT1A1 genotyping (recommended)',
      'Diarrhea management plan',
      'Hydration status assessment'
    ]
  },
  {
    id: 'ac-t',
    name: 'AC-T',
    cancerType: 'Breast Cancer',
    stage: 'Early Stage',
    drugs: ['Adriamycin', 'Cyclophosphamide', 'Taxol'],
    duration: '16 weeks',
    responseRate: '70%',
    source: 'NCCN',
    indication: 'Adjuvant treatment for early-stage breast cancer',
    efficacyData: {
      diseaseFreeeSurvival: '85% at 5 years',
      overallSurvival: '90% at 5 years',
      pathologicalCompleteResponse: '30% (neoadjuvant)',
      recurrenceReduction: '35%'
    },
    toxicityProfile: {
      grade3_4: '75%',
      commonAEs: ['Neutropenia', 'Nausea', 'Fatigue', 'Alopecia', 'Neuropathy'],
      seriousAEs: ['Febrile neutropenia', 'Cardiomyopathy', 'Secondary malignancy']
    },
    contraindications: [
      'LVEF < 50% or below institutional lower limit of normal',
      'Previous anthracycline therapy reaching cumulative dose limits',
      'Severe hepatic impairment',
      'Pregnancy'
    ],
    monitoring: [
      'CBC with differential weekly during AC',
      'ECHO or MUGA before treatment and every 3 cycles',
      'Liver function tests',
      'Neuropathy assessment during taxane phase'
    ]
  },
  {
    id: 'tch',
    name: 'TCH',
    cancerType: 'Breast Cancer',
    stage: 'HER2+',
    drugs: ['Docetaxel', 'Carboplatin', 'Trastuzumab'],
    duration: '18 weeks',
    responseRate: '85%',
    source: 'NCCN',
    indication: 'Neoadjuvant treatment for HER2-positive breast cancer',
    efficacyData: {
      pathologicalCompleteResponse: '60%',
      diseaseFreeeSurvival: '88% at 3 years',
      overallSurvival: '95% at 3 years',
      responseRate: '85%'
    },
    toxicityProfile: {
      grade3_4: '55%',
      commonAEs: ['Neutropenia', 'Fatigue', 'Neuropathy', 'Thrombocytopenia'],
      seriousAEs: ['Febrile neutropenia', 'Cardiac dysfunction', 'Severe neuropathy']
    },
    contraindications: [
      'LVEF < 50%',
      'HER2-negative disease',
      'Severe renal impairment',
      'Previous trastuzumab-related cardiac toxicity'
    ],
    monitoring: [
      'CBC with differential before each cycle',
      'ECHO or MUGA at baseline and every 3 cycles',
      'HER2 status confirmation',
      'Neuropathy assessment'
    ]
  },
  {
    id: 'chop',
    name: 'CHOP',
    cancerType: 'Lymphoma',
    stage: 'All stages',
    drugs: ['Cyclophosphamide', 'Doxorubicin', 'Vincristine', 'Prednisone'],
    duration: '18 weeks',
    responseRate: '60%',
    source: 'NCCN',
    indication: 'Standard treatment for diffuse large B-cell lymphoma',
    efficacyData: {
      overallSurvival: '65% at 5 years',
      progressionFreeSurvival: '55% at 5 years',
      completeResponse: '60%',
      overallResponse: '80%'
    },
    toxicityProfile: {
      grade3_4: '80%',
      commonAEs: ['Neutropenia', 'Nausea', 'Fatigue', 'Peripheral neuropathy'],
      seriousAEs: ['Febrile neutropenia', 'Cardiomyopathy', 'Severe neuropathy', 'Tumor lysis syndrome']
    },
    contraindications: [
      'LVEF < 50%',
      'Severe hepatic impairment',
      'Previous anthracycline therapy at maximum doses',
      'Severe neuropathy'
    ],
    monitoring: [
      'CBC with differential before each cycle',
      'ECHO or MUGA at baseline and during treatment',
      'Liver function tests',
      'Neuropathy assessment',
      'Tumor lysis syndrome monitoring'
    ]
  },
  {
    id: 'r-chop',
    name: 'R-CHOP',
    cancerType: 'Lymphoma',
    stage: 'All stages',
    drugs: ['Rituximab', 'Cyclophosphamide', 'Doxorubicin', 'Vincristine', 'Prednisone'],
    duration: '18 weeks',
    responseRate: '80%',
    source: 'NCCN',
    indication: 'First-line treatment for diffuse large B-cell lymphoma',
    efficacyData: {
      overallSurvival: '80% at 5 years',
      progressionFreeSurvival: '70% at 5 years',
      completeResponse: '80%',
      overallResponse: '95%'
    },
    toxicityProfile: {
      grade3_4: '75%',
      commonAEs: ['Neutropenia', 'Infusion reactions', 'Fatigue', 'Neuropathy'],
      seriousAEs: ['Febrile neutropenia', 'Severe infusion reactions', 'HBV reactivation', 'PML (rare)']
    },
    contraindications: [
      'Active hepatitis B infection (without prophylaxis)',
      'Severe immunodeficiency',
      'History of severe rituximab allergic reaction',
      'Live vaccine administration within 4 weeks'
    ],
    monitoring: [
      'Hepatitis B screening before treatment',
      'CBC with differential before each cycle',
      'Infusion reaction monitoring',
      'Immunoglobulin levels',
      'Cardiac function assessment'
    ]
  }
];

export default PROTOCOLS;