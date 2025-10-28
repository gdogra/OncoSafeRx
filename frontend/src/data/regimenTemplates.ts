// Curated oncology regimen templates for workflow system
export default [
  {
    id: 'folfox-adjuvant',
    name: 'FOLFOX (Adjuvant)',
    description: 'Standard adjuvant chemotherapy for colorectal cancer',
    category: 'chemotherapy',
    indication: 'Colorectal cancer (adjuvant)',
    steps: [
      {
        id: 'pre-assessment',
        title: 'Pre-treatment Assessment',
        type: 'assessment',
        description: 'Complete blood count, comprehensive metabolic panel, ECOG performance status',
        required: true,
        estimatedDuration: 30
      },
      {
        id: 'oxaliplatin',
        title: 'Oxaliplatin Administration',
        type: 'treatment',
        description: 'Oxaliplatin 85 mg/m² IV over 2 hours in 250-500 mL D5W',
        required: true,
        estimatedDuration: 120,
        safeguards: [
          'Monitor for infusion reactions',
          'Assess peripheral neuropathy before each cycle'
        ]
      },
      {
        id: 'leucovorin',
        title: 'Leucovorin Administration',
        type: 'treatment',
        description: 'Leucovorin 400 mg/m² IV over 2 hours concurrent with oxaliplatin',
        required: true,
        estimatedDuration: 120
      },
      {
        id: 'fluorouracil-bolus',
        title: '5-FU Bolus',
        type: 'treatment',
        description: '5-Fluorouracil 400 mg/m² IV bolus',
        required: true,
        estimatedDuration: 15
      },
      {
        id: 'fluorouracil-infusion',
        title: '5-FU Continuous Infusion',
        type: 'treatment',
        description: '5-Fluorouracil 2400 mg/m² IV continuous infusion over 46 hours',
        required: true,
        estimatedDuration: 2760
      }
    ],
    doseRules: {
      cycle_length: 14,
      total_cycles: 12,
      dose_modifications: [
        {
          parameter: 'anc',
          ranges: [
            { min: 1500, max: null, action: 'proceed', message: 'Normal ANC - proceed with full dose' },
            { min: 1000, max: 1499, action: 'reduce_25', message: 'Mild neutropenia - reduce doses by 25%' },
            { min: 500, max: 999, action: 'delay', message: 'Moderate neutropenia - delay until ANC ≥1500' },
            { min: null, max: 499, action: 'hold', message: 'Severe neutropenia - hold treatment, consider G-CSF' }
          ]
        },
        {
          parameter: 'platelets',
          ranges: [
            { min: 100000, max: null, action: 'proceed', message: 'Normal platelets - proceed with full dose' },
            { min: 75000, max: 99999, action: 'reduce_25', message: 'Mild thrombocytopenia - reduce doses by 25%' },
            { min: 50000, max: 74999, action: 'reduce_50', message: 'Moderate thrombocytopenia - reduce doses by 50%' },
            { min: null, max: 49999, action: 'hold', message: 'Severe thrombocytopenia - hold treatment' }
          ]
        },
        {
          parameter: 'neuropathy',
          ranges: [
            { grade: 0, action: 'proceed', message: 'No neuropathy - proceed with oxaliplatin' },
            { grade: 1, action: 'proceed', message: 'Grade 1 neuropathy - proceed with monitoring' },
            { grade: 2, action: 'reduce_oxali', message: 'Grade 2 neuropathy - reduce oxaliplatin by 25%' },
            { grade: 3, action: 'hold_oxali', message: 'Grade 3+ neuropathy - hold oxaliplatin, continue 5-FU/LV' }
          ]
        }
      ]
    }
  },
  {
    id: 'carboplatin-paclitaxel',
    name: 'Carboplatin + Paclitaxel',
    description: 'Standard chemotherapy for ovarian, lung, and other solid tumors',
    category: 'chemotherapy',
    indication: 'Ovarian cancer, Non-small cell lung cancer',
    steps: [
      {
        id: 'pre-assessment',
        title: 'Pre-treatment Assessment',
        type: 'assessment',
        description: 'CBC with differential, CMP, creatinine clearance calculation',
        required: true,
        estimatedDuration: 30
      },
      {
        id: 'premedication',
        title: 'Premedication',
        type: 'supportive',
        description: 'Dexamethasone 20mg PO/IV, diphenhydramine 50mg IV, H2 blocker',
        required: true,
        estimatedDuration: 30
      },
      {
        id: 'paclitaxel',
        title: 'Paclitaxel Administration',
        type: 'treatment',
        description: 'Paclitaxel 175 mg/m² IV over 3 hours',
        required: true,
        estimatedDuration: 180,
        safeguards: [
          'Monitor for hypersensitivity reactions',
          'Use non-PVC tubing and in-line filter'
        ]
      },
      {
        id: 'carboplatin',
        title: 'Carboplatin Administration',
        type: 'treatment',
        description: 'Carboplatin AUC 5-6 IV over 30-60 minutes',
        required: true,
        estimatedDuration: 60,
        safeguards: [
          'Calculate dose using Calvert formula',
          'Monitor for hypersensitivity reactions'
        ]
      }
    ],
    doseRules: {
      cycle_length: 21,
      total_cycles: 6,
      dose_modifications: [
        {
          parameter: 'anc',
          ranges: [
            { min: 1500, max: null, action: 'proceed', message: 'Normal ANC - proceed with full dose' },
            { min: 1000, max: 1499, action: 'reduce_25', message: 'Reduce doses by 25%' },
            { min: null, max: 999, action: 'delay', message: 'Delay until ANC ≥1500' }
          ]
        },
        {
          parameter: 'platelets',
          ranges: [
            { min: 100000, max: null, action: 'proceed', message: 'Normal platelets - proceed' },
            { min: 75000, max: 99999, action: 'reduce_25', message: 'Reduce doses by 25%' },
            { min: null, max: 74999, action: 'delay', message: 'Delay until platelets ≥100,000' }
          ]
        },
        {
          parameter: 'creatinine_clearance',
          ranges: [
            { min: 60, max: null, action: 'proceed', message: 'Normal renal function - proceed' },
            { min: 30, max: 59, action: 'reduce_carbo', message: 'Reduce carboplatin dose (AUC 4-5)' },
            { min: null, max: 29, action: 'contraindicated', message: 'Carboplatin contraindicated' }
          ]
        }
      ]
    }
  },
  {
    id: 'pembrolizumab-mono',
    name: 'Pembrolizumab Monotherapy',
    description: 'Anti-PD-1 immunotherapy for various solid tumors',
    category: 'immunotherapy',
    indication: 'Melanoma, NSCLC, MSI-H tumors',
    steps: [
      {
        id: 'pre-assessment',
        title: 'Pre-treatment Assessment',
        type: 'assessment',
        description: 'CBC, CMP, thyroid function, autoimmune history assessment',
        required: true,
        estimatedDuration: 30
      },
      {
        id: 'pembrolizumab',
        title: 'Pembrolizumab Administration',
        type: 'treatment',
        description: 'Pembrolizumab 200mg IV over 30 minutes every 3 weeks OR 400mg IV over 30 minutes every 6 weeks',
        required: true,
        estimatedDuration: 30,
        safeguards: [
          'Monitor for immune-related adverse events',
          'Assess for signs of pneumonitis, hepatitis, colitis'
        ]
      }
    ],
    doseRules: {
      cycle_length: 21, // or 42 for Q6W dosing
      total_cycles: null, // Continue until progression
      dose_modifications: [
        {
          parameter: 'immune_toxicity',
          ranges: [
            { grade: '1', action: 'proceed', message: 'Grade 1 irAE - monitor closely, consider supportive care' },
            { grade: '2', action: 'hold_steroids', message: 'Grade 2 irAE - hold treatment, start prednisone 1-2 mg/kg/day' },
            { grade: '3-4', action: 'discontinue', message: 'Grade 3-4 irAE - permanently discontinue, high-dose steroids' }
          ]
        }
      ]
    }
  }
];