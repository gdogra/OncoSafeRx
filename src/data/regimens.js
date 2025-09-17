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
];

export default REGIMENS;
