// Minimal regimen templates (MVP)

export const REGIMENS = [
  {
    id: 'FOLFOX-6',
    name: 'FOLFOX-6',
    indication: 'Colorectal cancer',
    cycleLengthDays: 14,
    components: [
      { name: 'Oxaliplatin', dose: '85 mg/m² IV day 1' },
      { name: 'Leucovorin', dose: '400 mg/m² IV day 1' },
      { name: '5-FU (bolus)', dose: '400 mg/m² IV day 1' },
      { name: '5-FU (infusion)', dose: '2400 mg/m² CI over 46h' }
    ],
    pretreatment: ['CBC', 'CMP', 'Neuropathy assessment'],
    monitoring: ['ANC/Platelets before each cycle', 'Neuropathy watch'],
    notes: ['Adjust for neuropathy, renal function'],
    adjustments: [
      { criterion: 'ANC < 1500/µL or platelets < 100,000/µL', action: 'Delay cycle and recheck counts' },
      { criterion: 'CrCl < 30 mL/min', action: 'Consider 5-FU dose reduction and oxaliplatin caution' },
      { criterion: 'Grade ≥2 neuropathy', action: 'Reduce or omit oxaliplatin; consider switch to de-escalated regimen' }
    ]
  },
  {
    id: 'AC-T',
    name: 'AC → T',
    indication: 'Breast cancer',
    cycleLengthDays: 14,
    components: [
      { name: 'Doxorubicin', dose: '60 mg/m² IV day 1 (AC x4)' },
      { name: 'Cyclophosphamide', dose: '600 mg/m² IV day 1 (AC x4)' },
      { name: 'Paclitaxel', dose: '80 mg/m² weekly x12 or 175 mg/m² q2-3w x4' }
    ],
    pretreatment: ['CBC', 'CMP', 'Echocardiogram (LVEF)'],
    monitoring: ['ANC/Platelets', 'Cardiac function with anthracyclines'],
    notes: ['Growth factor support per risk', 'Cardiotoxicity precautions'],
    adjustments: [
      { criterion: 'LVEF < lower limit of normal', action: 'Hold anthracycline; cardiology evaluation' },
      { criterion: 'ANC < 1500/µL', action: 'Delay and/or add G-CSF per risk protocol' }
    ]
  }
  ,
  {
    id: 'FOLFIRI',
    name: 'FOLFIRI',
    indication: 'Colorectal cancer',
    cycleLengthDays: 14,
    components: [
      { name: 'Irinotecan', dose: '180 mg/m² IV day 1' },
      { name: 'Leucovorin', dose: '400 mg/m² IV day 1' },
      { name: '5-FU (bolus)', dose: '400 mg/m² IV day 1' },
      { name: '5-FU (infusion)', dose: '2400 mg/m² CI over 46h' }
    ],
    pretreatment: ['CBC', 'CMP'],
    monitoring: ['ANC/Platelets', 'Diarrhea risk management'],
    notes: ['UGT1A1 *28/*28: consider dose reduction for irinotecan'],
    adjustments: [
      { criterion: 'UGT1A1 *28/*28', action: 'Reduce irinotecan starting dose (25–50%) and monitor neutropenia' }
    ]
  },
  {
    id: 'R-CHOP',
    name: 'R-CHOP',
    indication: 'Diffuse Large B-Cell Lymphoma',
    cycleLengthDays: 21,
    components: [
      { name: 'Rituximab', dose: '375 mg/m² IV day 1' },
      { name: 'Cyclophosphamide', dose: '750 mg/m² IV day 1' },
      { name: 'Doxorubicin', dose: '50 mg/m² IV day 1' },
      { name: 'Vincristine', dose: '1.4 mg/m² (max 2 mg) IV day 1' },
      { name: 'Prednisone', dose: '100 mg PO daily days 1–5' }
    ],
    pretreatment: ['CBC', 'CMP', 'Hepatitis B screening', 'Echocardiogram'],
    monitoring: ['ANC/Platelets', 'Cardiac function with anthracyclines'],
    notes: ['HBV prophylaxis if indicated', 'Neutropenia management with G-CSF per risk'],
    adjustments: [
      { criterion: 'LVEF < limit of normal', action: 'Avoid/hold doxorubicin; cardiology evaluation' }
    ]
  },
  {
    id: 'FOLFOXIRI',
    name: 'FOLFOXIRI',
    indication: 'Metastatic colorectal cancer',
    cycleLengthDays: 14,
    components: [
      { name: 'Irinotecan', dose: '165 mg/m² IV day 1' },
      { name: 'Oxaliplatin', dose: '85 mg/m² IV day 1' },
      { name: 'Leucovorin', dose: '200 mg/m² IV day 1' },
      { name: '5-FU (infusion)', dose: '3200 mg/m² over 48h' }
    ],
    pretreatment: ['CBC', 'CMP'],
    monitoring: ['ANC/Platelets', 'Diarrhea and neuropathy monitoring'],
    notes: ['Aggressive regimen; consider patient fitness'],
    adjustments: [
      { criterion: 'UGT1A1 *28/*28', action: 'Reduce irinotecan starting dose' }
    ]
  },
  {
    id: 'CAPOX',
    name: 'CAPOX (XELOX)',
    indication: 'Colorectal cancer',
    cycleLengthDays: 21,
    components: [
      { name: 'Capecitabine', dose: '1000 mg/m² PO BID days 1–14' },
      { name: 'Oxaliplatin', dose: '130 mg/m² IV day 1' }
    ],
    pretreatment: ['CBC', 'CMP'],
    monitoring: ['ANC/Platelets', 'Hand-foot syndrome', 'Neuropathy'],
    notes: ['Renal dosing for capecitabine if CrCl < 50 mL/min'],
    adjustments: [
      { criterion: 'CrCl 30–50 mL/min', action: 'Reduce capecitabine dose (75%)' },
      { criterion: 'CrCl < 30 mL/min', action: 'Avoid capecitabine' }
    ]
  }
];

export default REGIMENS;
