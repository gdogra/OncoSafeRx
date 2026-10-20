// GENERATED FILE - do not edit by hand.
// Source of truth: data/non_ddi_warnings.yaml  (schema: schemas/non_ddi_warnings.schema.json)
// Patient-factor / food warnings: NOT drug-drug interactions. Regenerate with: npm run build:ddi
// CI fails if this file is out of date (npm run check:ddi).

export const NON_DDI_WARNINGS = [
  {
    "drug": "alendronate",
    "subject": "coffee",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Decreased efficacy",
    "management": "Take with water only",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "19552",
      "coffee"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "atorvastatin",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Myopathy risk",
    "management": "Avoid grapefruit",
    "evidence_level": "A",
    "sources": [
      "Pharmacology"
    ],
    "rxcui": [
      "83367",
      "grapefruit"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "title": "ATORVASTATIN CALCIUM TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "matched": "grapefruit juice",
        "snippet": "DRUG INTERACTIONS See full prescribing information for details regarding concomitant use of atorvastatin calcium with other drugs or grapefruit juice that increase the risk of myopathy and rhabdomyolysis (2.5, 7.1).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "ciprofloxacin",
    "subject": "dairy products",
    "category": "food",
    "severity": "major",
    "mechanism": "Calcium chelation",
    "effect": "Reduced efficacy",
    "management": "Separate by 2 hours",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "2551",
      "dairy"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "title": "CIPROFLOXACIN (CIPROFLOXACIN HYDROCHLORIDE) TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "matched": "dairy products",
        "snippet": "example, sevelamer, lanthanum carbonate); sucralfate; Videx ®(didanosine) chewable/buffered tablets or pediatric powder; other highly buffered drugs; or products containing calcium, iron, or zinc and dairy products) Ciprofloxacin should be taken at least two hours before or six hours after Multivalent cation-containing products administration [see Dosage and Administration (2.4)]. Decrease Ciprofloxacin absorption, r",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "cyclosporine",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Enhanced toxicity",
    "management": "Avoid completely",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "3008",
      "grapefruit"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "grapefruit juice",
        "snippet": "Grapefruit juice Grapefruit and grapefruit juice affect metabolism, increasing blood concentrations of cyclosporine, thus should be avoided.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "digoxin",
    "subject": "high fiber foods",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Decreased digoxin efficacy",
    "management": "Maintain consistent fiber intake",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "3407",
      "fiber"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "felodipine",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "major",
    "mechanism": "CYP3A4 inhibition dramatically increases levels",
    "effect": "Severe hypotension",
    "management": "Avoid grapefruit juice completely",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "25789",
      "grapefruit"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "55637724-8757-11de-8a39-0800200c9a66",
        "title": "FELODIPINE TABLET, EXTENDED RELEASE FELODIPINE TABLET, FILM COATED, EXTENDED RELEASE [PAR HEALTH USA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=55637724-8757-11de-8a39-0800200c9a66",
        "matched": "grapefruit juice",
        "snippet": "Co-administration of CYP3A4 inhibitors (e.g., ketoconazole, itraconazole, erythromycin, grapefruit juice, cimetidine) with felodipine may lead to several-fold increases in the plasma levels of felodipine, either due to an increase in bioavailability or due to a decrease in metabolism.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "fexofenadine",
    "subject": "apple juice",
    "category": "food",
    "severity": "moderate",
    "mechanism": "OATP inhibition reduces absorption",
    "effect": "Reduced antihistamine effect",
    "management": "Take with water; avoid fruit juices",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "25014",
      "apple_juice"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "iron supplements",
    "subject": "tea/coffee",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Tannins reduce iron absorption",
    "effect": "Treatment failure of iron deficiency",
    "management": "Separate administration by 2 hours",
    "evidence_level": "A",
    "sources": [
      "Hematology guidelines"
    ],
    "rxcui": [
      "6045",
      "tea"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "levodopa",
    "subject": "high-protein diet",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Competitive amino acid transport",
    "effect": "Reduced levodopa efficacy",
    "management": "Take on empty stomach",
    "evidence_level": "A",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "protein",
      "6047"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "levothyroxine",
    "subject": "soy products",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Hypothyroidism",
    "management": "Separate administration by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology guidelines"
    ],
    "rxcui": [
      "10582",
      "soy"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "linezolid",
    "subject": "tyramine-rich foods",
    "category": "food",
    "severity": "major",
    "mechanism": "MAO inhibition prevents tyramine metabolism",
    "effect": "Hypertensive crisis",
    "management": "Avoid aged cheeses, cured meats, fermented foods",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning"
    ],
    "rxcui": [
      "104894",
      "tyramine"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "maoi",
    "subject": "tyramine-rich foods",
    "category": "food",
    "severity": "major",
    "mechanism": "Inhibited tyramine metabolism",
    "effect": "Hypertensive crisis",
    "management": "Strict dietary restrictions",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "tyramine",
      "7531"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "midazolam",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Prolonged sedation",
    "management": "Avoid grapefruit juice",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "6960",
      "grapefruit"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "monoamine oxidase inhibitors",
    "subject": "tyramine foods",
    "category": "food",
    "severity": "major",
    "mechanism": "MAO inhibition prevents tyramine breakdown",
    "effect": "Hypertensive crisis",
    "management": "Strict tyramine-restricted diet",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "maoi",
      "tyramine"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "nifedipine",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases nifedipine exposure",
    "effect": "Enhanced hypotensive effect",
    "management": "Avoid grapefruit juice; monitor blood pressure",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "7240",
      "grapefruit"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "593d8ca3-c303-4512-96a6-d4860e02cd83",
        "title": "NIFEDIPINE TABLET, FILM COATED, EXTENDED RELEASE [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=593d8ca3-c303-4512-96a6-d4860e02cd83",
        "matched": "grapefruit juice",
        "snippet": "Other Interactions: Grapefruit Juice: Co-administration of nifedipine with grapefruit juice resulted in approximately a doubling in nifedipine AUC and C max with no change in half-life.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "simvastatin",
    "subject": "grapefruit juice",
    "category": "food",
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Rhabdomyolysis",
    "management": "Avoid grapefruit completely",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "grapefruit",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "grapefruit juice",
        "snippet": "DRUG INTERACTIONS • See full prescribing information for details regarding concomitant use of simvastatin with other drugs or grapefruit juice that increase the risk of myopathy and rhabdomyolysis.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "tetracycline",
    "subject": "dairy products",
    "category": "food",
    "severity": "major",
    "mechanism": "Calcium chelation reduces absorption",
    "effect": "Antibiotic treatment failure",
    "management": "Take 1 hour before or 2 hours after dairy",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "10395",
      "dairy"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5cdacbf5-67be-42eb-bd54-8acc32ea1abc",
        "title": "PYLERA (BISMUTH SUBCITRATE POTASSIUM, METRONIDAZOLE, AND TETRACYCLINE HYDROCHLORIDE) CAPSULE [H2-PHARMA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5cdacbf5-67be-42eb-bd54-8acc32ea1abc",
        "matched": "dairy products",
        "snippet": "Antacids, Multivitamins or Dairy Products: Decreased absorption of PYLERA; do not take concomitantly.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "theophylline",
    "subject": "charcoal-broiled foods",
    "category": "food",
    "severity": "moderate",
    "mechanism": "CYP1A2 induction increases clearance",
    "effect": "Reduced theophylline levels",
    "management": "Monitor theophylline levels with diet changes",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "10379",
      "charcoal"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "warfarin",
    "subject": "cranberry juice",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Potential CYP2C9 inhibition",
    "effect": "Variable effect on INR",
    "management": "Monitor INR if consuming large quantities",
    "evidence_level": "C",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "11289",
      "cranberry"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "warfarin",
    "subject": "green leafy vegetables",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Vitamin K content",
    "effect": "Reduced anticoagulation",
    "management": "Consistent intake",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "11289",
      "leafy_greens"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "green leafy vegetables",
        "snippet": "Patients taking warfarin sodium should avoid drastic changes in dietary habits, such as eating large amounts of green leafy vegetables.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "warfarin",
    "subject": "green tea",
    "category": "food",
    "severity": "moderate",
    "mechanism": "Vitamin K content",
    "effect": "Reduced anticoagulation",
    "management": "Maintain consistent intake",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "green_tea",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "warfarin",
    "subject": "vitamin k foods",
    "category": "food",
    "severity": "major",
    "mechanism": "Vitamin K antagonizes warfarin effect",
    "effect": "Reduced anticoagulation",
    "management": "Maintain consistent vitamin K intake",
    "evidence_level": "A",
    "sources": [
      "Anticoagulation guidelines"
    ],
    "rxcui": [
      "11289",
      "vitamin_k"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "cc-486",
    "subject": "cyp interactions",
    "category": "nonspecific",
    "severity": "moderate",
    "mechanism": "Multiple CYP pathways",
    "effect": "Variable drug levels",
    "management": "Monitor clinical response",
    "evidence_level": "B",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "1551102",
      "cyp_interactions"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "orelabrutinib",
    "subject": "cyp3a4 interactions",
    "category": "nonspecific",
    "severity": "moderate",
    "mechanism": "CYP3A4 substrate",
    "effect": "Variable drug levels",
    "management": "Monitor for efficacy and toxicity",
    "evidence_level": "C",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "orelabrutinib",
      "cyp3a4_interactions"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "parsaclisib",
    "subject": "cyp3a4 interactions",
    "category": "nonspecific",
    "severity": "moderate",
    "mechanism": "CYP3A4 substrate",
    "effect": "Variable exposure",
    "management": "Dose adjustment may be needed",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "parsaclisib",
      "cyp3a4_interactions"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "abacavir",
    "subject": "hla-b5701 positive",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic hypersensitivity",
    "effect": "Fatal hypersensitivity reaction",
    "management": "Mandatory screening",
    "evidence_level": "A",
    "sources": [
      "HIV guidelines"
    ],
    "rxcui": [
      "190521",
      "hla_b5701"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "ace inhibitors",
    "subject": "pregnancy",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Fetal kidney development disruption",
    "effect": "Oligohydramnios and fetal death",
    "management": "Discontinue immediately; use alternative antihypertensive",
    "evidence_level": "A",
    "sources": [
      "Obstetric guidelines"
    ],
    "rxcui": [
      "35208",
      "pregnancy"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "ace inhibitors",
    "subject": "renal stenosis",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Reduced GFR",
    "effect": "Kidney injury",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "35208",
      "stenosis"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "allopurinol",
    "subject": "hla-b5801 positive",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic hypersensitivity",
    "effect": "DRESS syndrome",
    "management": "Avoid in HLA-B*5801 positive",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "519",
      "hla_b5801"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "amiodarone",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Increased sensitivity",
    "effect": "Organ toxicity",
    "management": "Monitor closely",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "703",
      "elderly"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "elderly",
        "snippet": "Monitor thyroid function prior to treatment and periodically thereafter, particularly in elderly patients, and in any patient with a history of thyroid nodules, goiter, or other thyroid dysfunction.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "amiodarone",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Photosensitization and skin discoloration",
    "effect": "Blue-gray skin pigmentation",
    "management": "Use sun protection; may be irreversible",
    "evidence_level": "A",
    "sources": [
      "Cardiology literature"
    ],
    "rxcui": [
      "703",
      "sun"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "sun exposure",
        "snippet": "The risk may be increased in patients of fair complexion or those with excessive sun exposure.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "anticholinergics",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Age-related increased sensitivity",
    "effect": "Delirium, falls, cognitive decline",
    "management": "Avoid in elderly; use anticholinergic-sparing alternatives",
    "evidence_level": "A",
    "sources": [
      "Beers Criteria"
    ],
    "rxcui": [
      "704",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "aspirin",
    "subject": "children with viral illness",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Association with Reye syndrome",
    "effect": "Hepatic failure and encephalopathy",
    "management": "Avoid aspirin in children <16 years with viral illness",
    "evidence_level": "A",
    "sources": [
      "CDC recommendations",
      "Pediatric guidelines"
    ],
    "rxcui": [
      "1191",
      "pediatric_viral"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "benzodiazepines",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Increased CNS sensitivity",
    "effect": "Falls, confusion, cognitive impairment",
    "management": "Use lowest effective dose; consider alternatives",
    "evidence_level": "A",
    "sources": [
      "Beers Criteria",
      "Geriatrics guidelines"
    ],
    "rxcui": [
      "1372",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "beta-blockers",
    "subject": "asthma",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Bronchospasm",
    "effect": "Respiratory distress",
    "management": "Use cardioselective",
    "evidence_level": "A",
    "sources": [
      "Guidelines",
      "Pulmonology"
    ],
    "rxcui": [
      "7442",
      "asthma"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "bevacizumab",
    "subject": "wound healing",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Vegf inhibition",
    "effect": "Impaired wound healing",
    "management": "Delay surgery appropriately",
    "evidence_level": "B",
    "sources": [
      "Surgery"
    ],
    "rxcui": [
      "364938",
      "surgery"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4cdcccda-7b9a-49d0-ac50-f4605a3c0ebe",
        "title": "VEGZELMA (BEVACIZUMAB-ADCD) INJECTION, SOLUTION [CELLTRION USA, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4cdcccda-7b9a-49d0-ac50-f4605a3c0ebe",
        "matched": "wound healing",
        "snippet": "Surgery and Wound Healing Complications: In patients who experience wound healing complications during VEGZELMA treatment, withhold VEGZELMA until adequate wound healing.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "bleomycin",
    "subject": "high oxygen",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Pulmonary toxicity",
    "effect": "Pneumonitis",
    "management": "Minimize O2",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "1341",
      "oxygen"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "carbamazepine",
    "subject": "hla-b5701 positive",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic hypersensitivity",
    "effect": "Severe cutaneous reactions",
    "management": "Screen before therapy",
    "evidence_level": "A",
    "sources": [
      "Pharmacogenomics"
    ],
    "rxcui": [
      "2002",
      "hla_b5701"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "cd22 car-t",
    "subject": "b-cell function",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "B-cell depletion",
    "effect": "Prolonged B-cell aplasia",
    "management": "Monitor B-cell recovery",
    "evidence_level": "A",
    "sources": [
      "CAR-T studies"
    ],
    "rxcui": [
      "cd22_cart",
      "bcell_function"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "chloramphenicol",
    "subject": "infants",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Immature metabolism",
    "effect": "Gray baby syndrome",
    "management": "Avoid in newborns",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "2356",
      "pediatric"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "chloramphenicol",
    "subject": "neonates",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Immature glucuronidation",
    "effect": "Gray baby syndrome",
    "management": "Avoid in neonates",
    "evidence_level": "A",
    "sources": [
      "NICU guidelines"
    ],
    "rxcui": [
      "2556",
      "neonates"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "codeine",
    "subject": "children",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Variable metabolism",
    "effect": "Respiratory depression",
    "management": "Avoid <12 years",
    "evidence_level": "A",
    "sources": [
      "FDA",
      "FDA warnings"
    ],
    "rxcui": [
      "2670",
      "pediatric"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3da3efd7-e278-4d79-9130-eef3992097e4",
        "title": "CODEINE-GUAIFENESIN (CODEINE PHOSPHATE AND GUAIFENESIN) SOLUTION [WESTMINSTER PHARMACEUTICALS, LLC]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3da3efd7-e278-4d79-9130-eef3992097e4",
        "matched": "children",
        "snippet": "A special measuring device should be used to give an accurate dose of this product to children under 6 years of age.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "cyclosporine",
    "subject": "uva therapy",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Enhanced skin cancer risk",
    "effect": "Squamous cell carcinoma",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "3008",
      "uva_therapy"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "dantrolene",
    "subject": "malignant hyperthermia",
    "category": "patient_factor",
    "severity": "minor",
    "mechanism": "Specific antidote",
    "effect": "Life-saving treatment",
    "management": "First-line therapy",
    "evidence_level": "A",
    "sources": [
      "Emergency medicine"
    ],
    "rxcui": [
      "2986",
      "malignant_hyperthermia"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c10e7eb1-0155-43ff-aa56-8cd468e8e84d",
        "title": "DANTROLENE SODIUM CAPSULE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c10e7eb1-0155-43ff-aa56-8cd468e8e84d",
        "matched": "malignant hyperthermia",
        "snippet": "Until the relevance of these findings to humans is established, the combination of Dantrolene Sodium and calcium channel blockers is not recommended during the management of malignant hyperthermia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "darbepoetin",
    "subject": "hypertension",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Increased blood pressure",
    "effect": "Uncontrolled hypertension",
    "management": "Monitor BP closely",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "351841",
      "hypertension"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0fd36cb9-c4f6-4167-93c9-8530865db3f9",
        "title": "ARANESP (DARBEPOETIN ALFA) INJECTION, SOLUTION ARANESP (DARBEPOETIN ALFA) SOLUTION [AMGEN, INC]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0fd36cb9-c4f6-4167-93c9-8530865db3f9",
        "matched": "hypertension",
        "snippet": "CONTRAINDICATIONS Aranesp is contraindicated in patients with: Uncontrolled hypertension [see Warnings and Precautions (5.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "desflurane",
    "subject": "sympathetic stimulation",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Airway irritation",
    "effect": "Tachycardia and hypertension",
    "management": "Pre-treat with opioids",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "3243",
      "sympathetic_stimulation"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "digoxin",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Reduced clearance",
    "effect": "Toxicity",
    "management": "Lower doses",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "3407",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "eculizumab",
    "subject": "meningococcal infection",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Terminal complement inhibition",
    "effect": "Life-threatening meningitis",
    "management": "Mandatory vaccination and prophylaxis",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "341002",
      "meningococcal"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1fa1aa80-1c59-44d4-9841-b6c52882651b",
        "title": "EPYSQLI (ECULIZUMAB-AAGH) INJECTION, SOLUTION [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1fa1aa80-1c59-44d4-9841-b6c52882651b",
        "matched": "meningococcal infection",
        "snippet": "Closely monitor patients for early signs and symptoms of meningococcal infection and evaluate patients immediately if infection is suspected.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "epoetin alfa",
    "subject": "iron deficiency",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Iron-dependent erythropoiesis",
    "effect": "Reduced EPO response",
    "management": "Correct iron deficiency first",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "5542",
      "iron_deficiency"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1f2d0b28-9cc5-4523-80b8-637fdaf3f7a5",
        "title": "EPOGEN (EPOETIN ALFA) SOLUTION [AMGEN, INC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1f2d0b28-9cc5-4523-80b8-637fdaf3f7a5",
        "matched": "iron deficiency",
        "snippet": "Lack or Loss of Hemoglobin Response to Epogen For lack or loss of hemoglobin response to Epogen, initiate a search for causative factors (e.g., iron deficiency, infection, inflammation, bleeding).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "etomidate",
    "subject": "adrenal insufficiency",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Adrenal suppression",
    "effect": "Cardiovascular collapse",
    "management": "Avoid in sepsis",
    "evidence_level": "A",
    "sources": [
      "Emergency medicine"
    ],
    "rxcui": [
      "4058",
      "adrenal_insufficiency"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "etomidate",
    "subject": "adrenal suppression",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Adrenal steroidogenesis inhibition",
    "effect": "Adrenal insufficiency",
    "management": "Avoid in sepsis",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "4058",
      "adrenal_suppression"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "flumazenil",
    "subject": "tricyclic antidepressant overdose",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Unmasking of seizures",
    "effect": "Status epilepticus",
    "management": "Avoid in mixed overdoses",
    "evidence_level": "A",
    "sources": [
      "Toxicology"
    ],
    "rxcui": [
      "4450",
      "321988"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "fluoroquinolones",
    "subject": "adolescents",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Cartilage effects",
    "effect": "Arthropathy",
    "management": "Reserve for specific use",
    "evidence_level": "B",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "26785",
      "adolescent"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "fluoroquinolones",
    "subject": "children",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Cartilage development effects",
    "effect": "Potential arthropathy",
    "management": "Reserve for specific indications; monitor joint symptoms",
    "evidence_level": "B",
    "sources": [
      "Pediatric infectious disease guidelines"
    ],
    "rxcui": [
      "387207",
      "pediatric"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "fluoroquinolones",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Phototoxic reaction",
    "effect": "Severe burns and blistering",
    "management": "Avoid UV exposure during therapy",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "387207",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "gemcitabine",
    "subject": "radiation",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Radiosensitization",
    "effect": "Severe mucositis and toxicity",
    "management": "Dose reduction needed",
    "evidence_level": "A",
    "sources": [
      "Radiation oncology"
    ],
    "rxcui": [
      "40639",
      "radiation"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "44bcc16c-341d-49e8-a1c6-95d084667aca",
        "title": "GEMCITABINE (GEMCITABINE HYDROCHLORIDE) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [SAGENT PHARMACEUTICALS]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=44bcc16c-341d-49e8-a1c6-95d084667aca",
        "matched": "radiation",
        "snippet": "Exacerbation of Radiation Therapy Toxicity: May cause severe and life-threatening toxicity when administered during or within 7 days of radiation therapy.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "halothane",
    "subject": "malignant hyperthermia",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic susceptibility",
    "effect": "Life-threatening hyperthermia",
    "management": "Avoid in susceptible patients",
    "evidence_level": "A",
    "sources": [
      "Anesthesiology"
    ],
    "rxcui": [
      "5138",
      "malignant_hyperthermia"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "hydrochlorothiazide",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Photosensitivity reaction",
    "effect": "Erythema and blistering",
    "management": "Use broad-spectrum sunscreen",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "5487",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "isotretinoin",
    "subject": "pregnancy",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Teratogenic effects",
    "effect": "Severe birth defects",
    "management": "Absolute contraindication; reliable contraception required",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning"
    ],
    "rxcui": [
      "6066",
      "pregnancy"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "27b3cf26-f22e-5b70-1c24-009933b7c6ee",
        "title": "ZENATANE (ISOTRETINOIN) CAPSULE, GELATIN COATED [DR. REDDY'S LABORATORIES LIMITED ]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=27b3cf26-f22e-5b70-1c24-009933b7c6ee",
        "matched": "pregnancy",
        "snippet": "CONTRAINDICATIONS Zenatane is contraindicated in: Pregnancy [see Warnings and Precautions (5.1) and Use in Specific Populations (8.1)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "ketamine",
    "subject": "increased intracranial pressure",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Increased cerebral blood flow",
    "effect": "Worsening intracranial pressure",
    "management": "Avoid in head trauma",
    "evidence_level": "A",
    "sources": [
      "Neurosurgery"
    ],
    "rxcui": [
      "6130",
      "increased_icp"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "ketamine",
    "subject": "psychiatric disorders",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Dissociative effects",
    "effect": "Emergence phenomena",
    "management": "Pre-treat with benzodiazepines",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "6130",
      "psychiatric_disorders"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "maoi",
    "subject": "bipolar disorder",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Risk of manic switch",
    "effect": "Severe mania and psychosis",
    "management": "Use with mood stabilizer",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "7531",
      "bipolar"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "metformin",
    "subject": "heart failure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Lactic acidosis",
    "effect": "Acidosis risk",
    "management": "Avoid if decompensated",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "6809",
      "hf"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "title": "METFORMIN HYDROCHLORIDE TABLET, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "matched": "heart failure",
        "snippet": "Stop metformin hydrochloride extended-release tablets at the time of, or prior to, an iodinated contrast imaging procedure in patients with an eGFR between 30 and 60 mL/minute/1.73 m 2; in patients with a history of hepatic impairment, alcoholism, or heart failure; or in patients who will be administered intra-arterial iodinated contrast.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "molidustat",
    "subject": "cyp2c19 polymorphism",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Genetic variation in metabolism",
    "effect": "Variable drug levels",
    "management": "Consider genetic testing",
    "evidence_level": "B",
    "sources": [
      "Pharmacogenomics"
    ],
    "rxcui": [
      "molidustat",
      "cyp2c19_variants"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "naloxone",
    "subject": "clonidine overdose",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Alpha-2 rebound",
    "effect": "Severe hypertension",
    "management": "Use lower naloxone doses",
    "evidence_level": "B",
    "sources": [
      "Toxicology"
    ],
    "rxcui": [
      "7242",
      "2599"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "naproxen",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Photosensitization",
    "effect": "Pseudoporphyria cutanea tarda",
    "management": "Use sun protection",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "7258",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "nitrous oxide",
    "subject": "vitamin b12 deficiency",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "B12 inactivation",
    "effect": "Megaloblastic anemia",
    "management": "Check B12 levels",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "7417",
      "b12_deficiency"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "nsaids",
    "subject": "chronic kidney disease",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Nephrotoxicity",
    "effect": "Progressive damage",
    "management": "Avoid chronic use",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "26548",
      "ckd"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "nsaids",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Toxicity risk",
    "effect": "GI/renal damage",
    "management": "Prefer acetaminophen",
    "evidence_level": "A",
    "sources": [
      "Guidelines",
      "Geriatrics"
    ],
    "rxcui": [
      "26548",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "nsaids",
    "subject": "heart failure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Fluid retention and reduced prostaglandins",
    "effect": "Worsening heart failure",
    "management": "Avoid or monitor closely",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "7804",
      "heart_failure"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "ocrelizumab",
    "subject": "hepatitis b reactivation",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "B-cell depletion",
    "effect": "HBV reactivation",
    "management": "Screen and monitor for HBV",
    "evidence_level": "A",
    "sources": [
      "MS treatment"
    ],
    "rxcui": [
      "1956226",
      "hepatitis_b"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "9da42362-3bb5-4b83-b4bb-b59fd4e55f0d",
        "title": "OCREVUS (OCRELIZUMAB) INJECTION [GENENTECH, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9da42362-3bb5-4b83-b4bb-b59fd4e55f0d",
        "matched": "hepatitis b reactivation",
        "snippet": "Hepatitis B Virus (HBV) Reactivation Hepatitis B reactivation has been reported in MS patients treated with OCREVUS in the postmarketing setting.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "oxaliplatin",
    "subject": "ice",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Cold-induced peripheral neuropathy exacerbation",
    "effect": "Severe acute neuropathy and laryngeal spasm",
    "management": "Avoid cold exposure during and after infusion",
    "evidence_level": "A",
    "sources": [
      "NCCN guidelines"
    ],
    "rxcui": [
      "75009",
      "cold"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "peginesatide",
    "subject": "antibody formation",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Immune-mediated PRCA",
    "effect": "Severe anemia",
    "management": "Discontinue if PRCA suspected",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "1185253",
      "prca"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "phenothiazines",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Photosensitivity reaction",
    "effect": "Severe sunburn and pigmentation",
    "management": "Avoid sun exposure",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "8076",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "phenytoin",
    "subject": "cyt p450 variants",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic polymorphism",
    "effect": "Severe skin reactions",
    "management": "Genetic testing recommended",
    "evidence_level": "A",
    "sources": [
      "Pharmacogenomics"
    ],
    "rxcui": [
      "8183",
      "cyp_variants"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "propofol",
    "subject": "propofol infusion syndrome (high doses)",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Mitochondrial dysfunction",
    "effect": "Metabolic acidosis and death",
    "management": "Limit dose and duration",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "8782",
      "high_dose_propofol"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "proton pump inhibitors",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Long-term use effects",
    "effect": "C. diff infection and fracture risk",
    "management": "Limit to shortest duration needed",
    "evidence_level": "B",
    "sources": [
      "Geriatric guidelines"
    ],
    "rxcui": [
      "40790",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "psychotropics",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "CNS sensitivity",
    "effect": "Falls, confusion",
    "management": "Lowest doses",
    "evidence_level": "A",
    "sources": [
      "Beers"
    ],
    "rxcui": [
      "psychotropic",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "ravulizumab",
    "subject": "encapsulated bacteria",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Complement pathway inhibition",
    "effect": "Severe bacterial infections",
    "management": "Antibiotic prophylaxis may be needed",
    "evidence_level": "A",
    "sources": [
      "Immunology"
    ],
    "rxcui": [
      "2103944",
      "encapsulated_bacteria"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a9a590d9-0217-43c7-908d-e62a71279791",
        "title": "ULTOMIRIS (RAVULIZUMAB) SOLUTION, CONCENTRATE [ALEXION PHARMACEUTICALS INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a9a590d9-0217-43c7-908d-e62a71279791",
        "matched": "encapsulated bacteria",
        "snippet": "ULTOMIRIS blocks terminal complement activation; therefore, patients may have increased susceptibility to infections, especially with encapsulated bacteria, such as infections caused by Neisseria meningitidis but also Streptococcus pneumoniae, Haemophilus influenzae, and to a lesser extent, Neisseria gonorrhoeae.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drug": "rituximab",
    "subject": "hepatitis b reactivation",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "B-cell suppression",
    "effect": "Fatal hepatitis B reactivation",
    "management": "Screen and monitor for HBV",
    "evidence_level": "A",
    "sources": [
      "Hepatology"
    ],
    "rxcui": [
      "121191",
      "hepatitis_b"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "sglt2 inhibitors",
    "subject": "ketosis-prone conditions",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Enhanced ketogenesis",
    "effect": "Diabetic ketoacidosis",
    "management": "Monitor ketones and hold during illness",
    "evidence_level": "A",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "1373463",
      "dka_risk"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "stimulants",
    "subject": "hypertension",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Sympathetic activation",
    "effect": "Hypertensive crisis",
    "management": "Control BP before starting stimulants",
    "evidence_level": "A",
    "sources": [
      "ADHD guidelines"
    ],
    "rxcui": [
      "9819",
      "hypertension"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "succinylcholine",
    "subject": "plasma cholinesterase deficiency",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Genetic enzyme deficiency",
    "effect": "Prolonged paralysis",
    "management": "Screen family history",
    "evidence_level": "A",
    "sources": [
      "Anesthesiology"
    ],
    "rxcui": [
      "9906",
      "pseudocholinesterase"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "sulfonamides",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Phototoxic mechanism",
    "effect": "Skin burns and rash",
    "management": "Limit sun exposure",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "10180",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tetracycline",
    "subject": "children",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Tooth discoloration",
    "effect": "Permanent staining",
    "management": "Avoid <8 years",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "10395",
      "pediatric"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tetracyclines",
    "subject": "children <8 years",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Calcium binding in teeth and bones",
    "effect": "Permanent tooth discoloration",
    "management": "Avoid in children <8 years",
    "evidence_level": "A",
    "sources": [
      "Pediatric guidelines"
    ],
    "rxcui": [
      "10395",
      "pediatric_young"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tetracyclines",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Drug-induced photosensitization",
    "effect": "Severe sunburn and skin reactions",
    "management": "Use sunscreen and protective clothing",
    "evidence_level": "A",
    "sources": [
      "Dermatology guidelines"
    ],
    "rxcui": [
      "10395",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "thiazide diuretics",
    "subject": "sun exposure",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Photosensitization reaction",
    "effect": "Severe sunburn",
    "management": "Avoid excessive sun exposure",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "10387",
      "sun"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tricyclic antidepressants",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Anticholinergic and sedating effects",
    "effect": "Falls, cognitive impairment, arrhythmias",
    "management": "Use SSRI alternatives",
    "evidence_level": "A",
    "sources": [
      "Geriatric psychiatry"
    ],
    "rxcui": [
      "321988",
      "elderly"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tricyclic antidepressants",
    "subject": "glaucoma",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Anticholinergic effects",
    "effect": "Acute angle-closure glaucoma",
    "management": "Contraindicated in narrow-angle glaucoma",
    "evidence_level": "A",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "321988",
      "glaucoma"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "tricyclics",
    "subject": "bph",
    "category": "patient_factor",
    "severity": "moderate",
    "mechanism": "Anticholinergic effects",
    "effect": "Urinary retention",
    "management": "Use alternatives",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "704",
      "bph"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "vecuronium",
    "subject": "liver disease",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Impaired hepatic metabolism",
    "effect": "Prolonged paralysis",
    "management": "Use alternative agent",
    "evidence_level": "A",
    "sources": [
      "Hepatology"
    ],
    "rxcui": [
      "11124",
      "liver_disease"
    ],
    "citation_status": "unverified"
  },
  {
    "drug": "warfarin",
    "subject": "elderly",
    "category": "patient_factor",
    "severity": "major",
    "mechanism": "Increased bleeding risk",
    "effect": "Hemorrhage",
    "management": "Lower doses",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "11289",
      "elderly"
    ],
    "citation_status": "unverified"
  }
];

export default NON_DDI_WARNINGS;
