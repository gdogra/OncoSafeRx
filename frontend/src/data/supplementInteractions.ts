/**
 * Drug-Food/Supplement Interaction Data
 * Common supplements that interact with oncology and supportive care drugs.
 * Uses same shape as FALLBACK_INTERACTIONS for unified processing.
 */

export const SUPPLEMENT_INTERACTIONS = [
  // St. John's Wort — potent CYP3A4/P-gp inducer
  { drugs: ["st. john's wort", 'imatinib'], severity: 'major', mechanism: 'CYP3A4 induction reduces imatinib levels by 30-40%', effect: 'Subtherapeutic imatinib — risk of treatment failure', management: 'Discontinue St. John\'s Wort immediately. No safe combination.', evidence_level: 'A', sources: ['FDA Label', 'NCCN'] },
  { drugs: ["st. john's wort", 'irinotecan'], severity: 'major', mechanism: 'CYP3A4 induction reduces active SN-38 metabolite', effect: 'Reduced irinotecan efficacy', management: 'Avoid combination. Discontinue 2 weeks before chemotherapy.', evidence_level: 'A', sources: ['Clinical studies'] },
  { drugs: ["st. john's wort", 'erlotinib'], severity: 'major', mechanism: 'CYP3A4 induction reduces erlotinib exposure by ~60%', effect: 'Treatment failure — subtherapeutic TKI levels', management: 'Contraindicated. Discontinue St. John\'s Wort.', evidence_level: 'A', sources: ['FDA Label'] },
  { drugs: ["st. john's wort", 'cyclosporine'], severity: 'major', mechanism: 'CYP3A4 and P-glycoprotein induction', effect: 'Organ rejection risk from subtherapeutic cyclosporine', management: 'Contraindicated combination.', evidence_level: 'A', sources: ['FDA', 'Transplant guidelines'] },
  { drugs: ["st. john's wort", 'tamoxifen'], severity: 'major', mechanism: 'CYP3A4 induction alters tamoxifen metabolism', effect: 'Reduced endoxifen levels — may decrease breast cancer protection', management: 'Avoid combination.', evidence_level: 'B', sources: ['Clinical literature'] },
  { drugs: ["st. john's wort", 'warfarin'], severity: 'major', mechanism: 'CYP3A4/2C9 induction reduces warfarin levels', effect: 'Subtherapeutic anticoagulation — thromboembolic risk', management: 'Avoid. If unavoidable, increase INR monitoring frequency.', evidence_level: 'A', sources: ['FDA'] },

  // Grapefruit — CYP3A4 inhibitor
  { drugs: ['grapefruit', 'oxycodone'], severity: 'major', mechanism: 'CYP3A4 inhibition increases oxycodone exposure', effect: 'Enhanced sedation and respiratory depression', management: 'Avoid grapefruit juice with opioids metabolized by CYP3A4.', evidence_level: 'B', sources: ['Clinical studies'] },
  { drugs: ['grapefruit', 'tacrolimus'], severity: 'major', mechanism: 'CYP3A4 inhibition increases tacrolimus levels', effect: 'Nephrotoxicity and immunosuppression toxicity', management: 'Avoid grapefruit entirely during tacrolimus therapy.', evidence_level: 'A', sources: ['FDA Label'] },
  { drugs: ['grapefruit', 'simvastatin'], severity: 'major', mechanism: 'CYP3A4 inhibition dramatically increases statin levels', effect: 'Rhabdomyolysis risk', management: 'Avoid grapefruit. Consider rosuvastatin (not CYP3A4-dependent).', evidence_level: 'A', sources: ['FDA'] },
  { drugs: ['grapefruit', 'nilotinib'], severity: 'moderate', mechanism: 'CYP3A4 inhibition increases nilotinib exposure', effect: 'Increased QT prolongation and hepatotoxicity risk', management: 'Avoid grapefruit and Seville oranges.', evidence_level: 'B', sources: ['FDA Label'] },

  // Turmeric/Curcumin — antiplatelet + CYP inhibition
  { drugs: ['turmeric', 'warfarin'], severity: 'moderate', mechanism: 'Antiplatelet activity potentiates anticoagulation', effect: 'Increased bleeding risk', management: 'Limit turmeric supplements. Monitor INR closely if used.', evidence_level: 'B', sources: ['Clinical literature'] },
  { drugs: ['curcumin', 'warfarin'], severity: 'moderate', mechanism: 'Antiplatelet activity potentiates anticoagulation', effect: 'Increased bleeding risk', management: 'Limit curcumin supplements. Monitor INR closely.', evidence_level: 'B', sources: ['Clinical literature'] },
  { drugs: ['turmeric', 'tamoxifen'], severity: 'moderate', mechanism: 'CYP3A4 and CYP2C9 inhibition may alter tamoxifen metabolism', effect: 'Altered endoxifen levels', management: 'Use with caution. Monitor for tamoxifen side effects.', evidence_level: 'C', sources: ['In vitro data'] },

  // Green Tea (EGCG) — affects bortezomib
  { drugs: ['green tea', 'bortezomib'], severity: 'major', mechanism: 'EGCG directly binds and inactivates bortezomib boronic acid moiety', effect: 'Complete loss of bortezomib anticancer activity', management: 'Avoid all green tea products during bortezomib therapy.', evidence_level: 'A', sources: ['Blood 2009', 'Clinical studies'] },
  { drugs: ['green tea', 'iron'], severity: 'moderate', mechanism: 'Tannins chelate iron, reducing absorption by 60-90%', effect: 'Iron deficiency worsening — critical in chemo-induced anemia', management: 'Separate intake by at least 2 hours.', evidence_level: 'B', sources: ['Nutrition studies'] },

  // Vitamin E — antiplatelet
  { drugs: ['vitamin e', 'warfarin'], severity: 'moderate', mechanism: 'Vitamin E has antiplatelet properties at high doses (>400 IU)', effect: 'Increased bleeding risk', management: 'Limit vitamin E to <400 IU/day. Monitor INR.', evidence_level: 'B', sources: ['Clinical literature'] },
  { drugs: ['vitamin e', 'aspirin'], severity: 'moderate', mechanism: 'Additive antiplatelet effects', effect: 'Increased bleeding risk', management: 'Limit vitamin E supplementation during antiplatelet therapy.', evidence_level: 'B', sources: ['Clinical literature'] },

  // Fish Oil (Omega-3) — anticoagulant potentiation
  { drugs: ['fish oil', 'warfarin'], severity: 'moderate', mechanism: 'Omega-3 fatty acids may potentiate anticoagulant effects', effect: 'Increased INR and bleeding risk', management: 'Monitor INR more frequently. Doses >3g/day increase risk.', evidence_level: 'B', sources: ['Clinical studies'] },
  { drugs: ['omega-3', 'warfarin'], severity: 'moderate', mechanism: 'Omega-3 fatty acids may potentiate anticoagulant effects', effect: 'Increased INR and bleeding risk', management: 'Monitor INR more frequently.', evidence_level: 'B', sources: ['Clinical studies'] },

  // Echinacea — immunomodulation concerns
  { drugs: ['echinacea', 'cyclosporine'], severity: 'moderate', mechanism: 'Immunostimulant effect may counteract immunosuppression', effect: 'Risk of graft rejection or autoimmune flare', management: 'Avoid echinacea during immunosuppressive therapy.', evidence_level: 'C', sources: ['Pharmacology references'] },
  { drugs: ['echinacea', 'methotrexate'], severity: 'moderate', mechanism: 'Hepatotoxicity risk + immunomodulation', effect: 'Potential additive liver damage', management: 'Avoid during methotrexate therapy.', evidence_level: 'C', sources: ['Herbal medicine literature'] },

  // Ginger — antiplatelet
  { drugs: ['ginger', 'warfarin'], severity: 'minor', mechanism: 'Mild antiplatelet activity', effect: 'Slightly increased bleeding risk at high doses', management: 'Culinary amounts likely safe. Avoid concentrated supplements.', evidence_level: 'C', sources: ['Clinical literature'] },

  // Milk Thistle (Silymarin) — CYP inhibition
  { drugs: ['milk thistle', 'imatinib'], severity: 'moderate', mechanism: 'CYP3A4/2C9 inhibition may increase imatinib levels', effect: 'Increased imatinib toxicity', management: 'Use with caution. Monitor for imatinib side effects.', evidence_level: 'C', sources: ['Pharmacokinetic studies'] },

  // Cannabis/CBD
  { drugs: ['cbd', 'warfarin'], severity: 'moderate', mechanism: 'CYP2C9 inhibition increases warfarin levels', effect: 'Elevated INR — bleeding risk', management: 'If CBD is used, increase INR monitoring frequency.', evidence_level: 'B', sources: ['Clinical case reports', 'FDA'] },
  { drugs: ['cbd', 'clobazam'], severity: 'major', mechanism: 'CYP2C19 inhibition increases active metabolite levels', effect: 'Excessive sedation', management: 'Reduce clobazam dose if CBD is co-administered.', evidence_level: 'A', sources: ['FDA Label (Epidiolex)'] },
]

/**
 * Known supplement names for UI matching
 */
export const KNOWN_SUPPLEMENTS = [
  "St. John's Wort", 'Grapefruit', 'Turmeric', 'Curcumin', 'Green Tea',
  'Vitamin E', 'Fish Oil', 'Omega-3', 'Echinacea', 'Ginger',
  'Milk Thistle', 'CBD', 'Garlic', 'Ginkgo Biloba', 'Valerian',
  'Kava', 'Saw Palmetto', 'Black Cohosh', 'Melatonin',
]
