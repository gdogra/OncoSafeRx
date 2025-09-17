// Local curated interaction pairs for demo/offline use (name-based matching)

export const KNOWN_INTERACTIONS = [
  {
    drugs: ['aspirin', 'warfarin'],
    severity: 'major',
    mechanism: 'Additive anticoagulant/antiplatelet effects',
    effect: 'Significantly increased bleeding risk',
    management: 'Avoid combination or monitor very closely; frequent INR checks',
    evidence_level: 'A',
    sources: ['LOCAL', 'Clinical literature']
  },
  {
    drugs: ['ibuprofen', 'warfarin'],
    severity: 'moderate',
    mechanism: 'Protein-binding displacement and possible CYP2C9 effects',
    effect: 'Increased anticoagulant effect and bleeding risk',
    management: 'Use alternative analgesic; if needed, monitor INR closely',
    evidence_level: 'B',
    sources: ['LOCAL', 'Clinical literature']
  },
  {
    drugs: ['aspirin', 'ibuprofen'],
    severity: 'moderate',
    mechanism: 'Competitive inhibition at COX reduces aspirin antiplatelet effect',
    effect: 'Reduced cardioprotective effect of low-dose aspirin',
    management: 'Separate dosing (ibuprofen 8h before or 30min after aspirin) or use other analgesic',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['clopidogrel', 'omeprazole'],
    severity: 'moderate',
    mechanism: 'CYP2C19 inhibition reduces clopidogrel activation',
    effect: 'Reduced antiplatelet efficacy; potential for thrombosis',
    management: 'Prefer pantoprazole or H2 blocker; avoid omeprazole/esomeprazole',
    evidence_level: 'B',
    sources: ['LOCAL', 'FDA']
  },
  {
    drugs: ['tramadol', 'fluoxetine'],
    severity: 'major',
    mechanism: 'Serotonergic toxicity risk; CYP2D6 inhibition reduces analgesia',
    effect: 'Serotonin syndrome; decreased tramadol effectiveness',
    management: 'Avoid combination; consider non-serotonergic analgesic',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['codeine', 'fluoxetine'],
    severity: 'moderate',
    mechanism: 'CYP2D6 inhibition blocks conversion to morphine',
    effect: 'Reduced analgesic effect of codeine',
    management: 'Use non–CYP2D6-dependent analgesic (e.g., morphine)',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  // Oncology and high-value curated pairs
  {
    drugs: ['tamoxifen', 'paroxetine'],
    severity: 'major',
    mechanism: 'Strong CYP2D6 inhibition reduces formation of active metabolite (endoxifen)',
    effect: 'Reduced efficacy of tamoxifen therapy',
    management: 'Avoid potent CYP2D6 inhibitors (e.g., paroxetine, fluoxetine); consider alternatives (venlafaxine)',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['methotrexate', 'trimethoprim'],
    severity: 'major',
    mechanism: 'Additive antifolate effects and reduced renal clearance',
    effect: 'Severe myelosuppression and mucositis risk',
    management: 'Avoid combination; if unavoidable, close monitoring and folinic acid rescue',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['methotrexate', 'sulfamethoxazole'],
    severity: 'major',
    mechanism: 'Protein-binding displacement and antifolate synergy',
    effect: 'Increased toxicity (myelosuppression)',
    management: 'Avoid combination; consider alternative antibiotics',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['methotrexate', 'ibuprofen'],
    severity: 'moderate',
    mechanism: 'Reduced renal clearance of methotrexate by NSAIDs',
    effect: 'Elevated methotrexate levels and toxicity risk',
    management: 'Avoid high-dose MTX with NSAIDs; monitor levels and toxicity',
    evidence_level: 'C',
    sources: ['LOCAL']
  },
  {
    drugs: ['warfarin', 'fluconazole'],
    severity: 'major',
    mechanism: 'CYP2C9 inhibition increases warfarin exposure',
    effect: 'Markedly increased INR and bleeding risk',
    management: 'Avoid or reduce dose with close INR monitoring',
    evidence_level: 'A',
    sources: ['LOCAL']
  },
  {
    drugs: ['warfarin', 'metronidazole'],
    severity: 'major',
    mechanism: 'Inhibition of warfarin metabolism',
    effect: 'Increased anticoagulant effect and bleeding',
    management: 'Avoid or monitor INR closely and adjust dose',
    evidence_level: 'A',
    sources: ['LOCAL']
  },
  {
    drugs: ['warfarin', 'ciprofloxacin'],
    severity: 'moderate',
    mechanism: 'Altered gut flora/vitamin K and metabolism interactions',
    effect: 'Elevated INR and bleeding risk',
    management: 'Monitor INR more frequently; adjust warfarin dose as needed',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['allopurinol', 'azathioprine'],
    severity: 'major',
    mechanism: 'Xanthine oxidase inhibition increases active thiopurine levels',
    effect: 'Severe bone marrow suppression',
    management: 'Avoid or reduce azathioprine dose to 25% with close monitoring',
    evidence_level: 'A',
    sources: ['LOCAL']
  },
  {
    drugs: ['irinotecan', 'ketoconazole'],
    severity: 'major',
    mechanism: 'Strong CYP3A4 inhibition increases SN-38 exposure',
    effect: 'Severe diarrhea and neutropenia risk',
    management: 'Avoid combination; consider alternative antifungal',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['irinotecan', 'rifampin'],
    severity: 'major',
    mechanism: 'CYP3A4 induction decreases irinotecan/SN-38 exposure',
    effect: 'Reduced antitumor efficacy',
    management: 'Avoid strong inducers; consider alternatives',
    evidence_level: 'B',
    sources: ['LOCAL']
  },
  {
    drugs: ['ondansetron', 'amiodarone'],
    severity: 'moderate',
    mechanism: 'Additive QT prolongation',
    effect: 'Risk of torsades de pointes',
    management: 'Avoid in high-risk patients; monitor ECG/electrolytes',
    evidence_level: 'C',
    sources: ['LOCAL']
  },
  {
    drugs: ['clopidogrel', 'esomeprazole'],
    severity: 'moderate',
    mechanism: 'CYP2C19 inhibition reduces clopidogrel activation',
    effect: 'Reduced antiplatelet efficacy',
    management: 'Prefer pantoprazole; avoid omeprazole/esomeprazole',
    evidence_level: 'B',
    sources: ['LOCAL', 'FDA']
  }
];

export default KNOWN_INTERACTIONS;
