// GENERATED FILE - do not edit by hand.
// Source of truth: data/ddi_curated.yaml  (schema: schemas/ddi_curated.schema.json)
// Regenerate with: npm run build:ddi
// CI fails if this file is out of date (npm run check:ddi).

export const KNOWN_INTERACTIONS = [
  {
    "drugs": [
      "capecitabine",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Increased anticoagulant effect (INR elevation)",
    "effect": "Severe bleeding and elevated INR",
    "management": "monitor",
    "evidence_level": "A",
    "sources": [
      "label",
      "0b59e98c-5b34-4b93-90f6-20526f4d4f88",
      "cdbbc317-35d3-42ba-94f0-c83891358529"
    ],
    "rxcui": [
      "194000",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0b59e98c-5b34-4b93-90f6-20526f4d4f88",
        "title": "CAPECITABINE (CAPECITABINE) TABLET, FILM COATED [NORTHSTAR RXLLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0b59e98c-5b34-4b93-90f6-20526f4d4f88",
        "matched": "warfarin",
        "snippet": "Increased Risk of Bleeding With Concomitant Use of Vitamin K Antagonists Altered coagulation parameters and/or bleeding, including death, have been reported in patients taking capecitabine concomitantly with vitamin K antagonists, such as warfarin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "capecitabine",
        "snippet": "Table 2: Examples of CYP450 Interactions with Warfarin Enzyme Inhibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, eno",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tamoxifen",
      "paroxetine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition reduces endoxifen",
    "effect": "Reduced efficacy of tamoxifen therapy",
    "management": "avoid",
    "evidence_level": "A",
    "sources": [
      "guideline",
      "CPIC-Tamoxifen-CYP2D6",
      "483bd97f-c4d0-4e23-aaa8-6334f4471e0c"
    ],
    "rxcui": [
      "10324",
      "32937"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "guideline",
        "id": "CPIC-Tamoxifen-CYP2D6",
        "url": "https://cpicpgx.org/guidelines/guideline-for-tamoxifen-and-cyp2d6/",
        "snippet": "Avoid strong CYP2D6 inhibitors with tamoxifen."
      },
      {
        "source_type": "label",
        "id": "483bd97f-c4d0-4e23-aaa8-6334f4471e0c",
        "title": "PAXIL CR (PAROXETINE HYDROCHLORIDE) TABLET, FILM COATED, EXTENDED RELEASE [APOTEX CORP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=483bd97f-c4d0-4e23-aaa8-6334f4471e0c",
        "matched": "tamoxifen",
        "snippet": "Concomitant use with Tamoxifen: Consider use of an alternative antidepressant with little or no CYP2D6 inhibition.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "5-fluorouracil",
      "leucovorin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced cytotoxicity",
    "effect": "Increased efficacy and toxicity",
    "management": "Monitor for mucositis",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "3002",
      "6470"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "82c445f5-4cb7-4457-af19-3b5b8a121b4f",
        "title": "LEUCOVORIN CALCIUM INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [GLAND PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=82c445f5-4cb7-4457-af19-3b5b8a121b4f",
        "matched": "5-fluorouracil",
        "snippet": "Leucovorin may enhance the toxicity of 5-fluorouracil (see WARNINGS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "5-fluorouracil",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Enhanced anticoagulation",
    "effect": "Bleeding risk",
    "management": "Monitor INR",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "44185",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1daf714b-704c-4bcc-b6e0-6f0eb2bfe66b",
        "title": "FAVLYXA (FLUOROURACIL) INJECTION, SOLUTION [AVYXA PHARMA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1daf714b-704c-4bcc-b6e0-6f0eb2bfe66b",
        "matched": "warfarin",
        "snippet": "DRUG INTERACTIONS 7.1 Effect of FAVLYXA on Other Drugs Vitamin K Antagonists Monitor INR and PT more frequently in patients receiving FAVLYXA and warfarin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "abacavir",
      "hla-b5701 positive"
    ],
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
    "drugs": [
      "abatacept",
      "anti-tnf agents"
    ],
    "severity": "major",
    "mechanism": "Excessive immunosuppression",
    "effect": "Serious infections",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "331869",
      "149772"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "acalabrutinib",
      "proton pump inhibitors"
    ],
    "severity": "major",
    "mechanism": "pH-dependent solubility",
    "effect": "Reduced acalabrutinib absorption",
    "management": "Take 2 hours before PPI",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "1913297",
      "40790"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dd4835ef-e1bc-4997-a399-1ffa2556fbfe",
        "title": "CALQUENCE (ACALABRUTINIB) CAPSULE, GELATIN COATED [ASTRAZENECA PHARMACEUTICALS LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dd4835ef-e1bc-4997-a399-1ffa2556fbfe",
        "matched": "proton pump inhibitors",
        "snippet": "Gastric Acid Reducing Agents: Avoid co-administration with proton pump inhibitors (PPIs).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "acarbose",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Reduced digoxin absorption",
    "effect": "Decreased digoxin efficacy",
    "management": "Monitor digoxin levels and clinical response",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "16681",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1ba7a072-03b0-41f2-be7a-101145bdef3a",
        "title": "ACARBOSE TABLET [BRYANT RANCH PREPACK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1ba7a072-03b0-41f2-be7a-101145bdef3a",
        "matched": "digoxin",
        "snippet": "Acarbose Tablets have been shown to change the bioavailability of digoxin when they are coadministered, which may require digoxin dose adjustment.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "acarbose",
        "snippet": "Digoxin concentrations decreased Acarbose, activated charcoal, albuterol, antacids, certain cancer chemotherapy or radiation therapy, cholestyramine, colestipol, extenatide, kaolin-pectin, meals high in bran, metoclopramide, miglitol, neomycin, penicillamine, phenytoin, rifampin, St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ace inhibitors",
      "potassium supplements"
    ],
    "severity": "moderate",
    "mechanism": "Reduced potassium excretion",
    "effect": "Hyperkalemia",
    "management": "Monitor serum potassium; avoid potassium supplements",
    "evidence_level": "A",
    "sources": [
      "Nephrology guidelines"
    ],
    "rxcui": [
      "35208",
      "8588"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ace inhibitors",
      "pregnancy"
    ],
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
    "drugs": [
      "ace inhibitors",
      "renal stenosis"
    ],
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
    "drugs": [
      "acetaminophen",
      "isoniazid"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced hepatotoxicity risk",
    "effect": "Liver damage",
    "management": "Limit acetaminophen dose; monitor liver function",
    "evidence_level": "B",
    "sources": [
      "Hepatology literature"
    ],
    "rxcui": [
      "161",
      "6038"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6dab7b7b-a3a9-47ef-b423-134bc6970d8b",
        "title": "ISONIAZID TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6dab7b7b-a3a9-47ef-b423-134bc6970d8b",
        "matched": "acetaminophen",
        "snippet": "Acetaminophen A report of severe acetaminophen toxicity was reported in a patient receiving isoniazid.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "acetazolamide",
      "high-dose aspirin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced salicylate toxicity",
    "effect": "CNS toxicity",
    "management": "Monitor for confusion",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "1224",
      "1191"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "240ab24b-3124-4805-80c2-36dd1945e3b3",
        "title": "ACETAZOLAMIDE TABLET [AJANTA PHARMA USA INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=240ab24b-3124-4805-80c2-36dd1945e3b3",
        "matched": "high-dose aspirin",
        "snippet": "Caution is advised for patients receiving concomitant high-dose aspirin and acetazolamide, as anorexia, tachypnea, lethargy, metabolic acidosis, coma, and death have been reported.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "activated charcoal",
      "oral medications"
    ],
    "severity": "moderate",
    "mechanism": "Adsorption of drugs",
    "effect": "Reduced drug efficacy",
    "management": "Hold other oral meds",
    "evidence_level": "A",
    "sources": [
      "Toxicology"
    ],
    "rxcui": [
      "activated_charcoal",
      "oral_medications"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "adalimumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Immunosuppression",
    "effect": "Vaccine-derived infection",
    "management": "Avoid live vaccines",
    "evidence_level": "A",
    "sources": [
      "Immunology"
    ],
    "rxcui": [
      "348001",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4cab600d-6950-409f-a6d8-d447da22cd95",
        "title": "YUSIMRY (ADALIMUMAB-AQVH) INJECTION, SOLUTION [MEITHEAL PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4cab600d-6950-409f-a6d8-d447da22cd95",
        "matched": "live vaccines",
        "snippet": "DRUG INTERACTIONS Abatacept: Increased risk of serious infection (5.1, 5.11, 7.2) Anakinra: Increased risk of serious infection (5.1, 5.7, 7.2) Live vaccines: Avoid use with YUSIMRY (5.1, 7.3) 7.1 Methotrexate Adalimumab has been studied in rheumatoid arthritis (RA) patients taking concomitant methotrexate (MTX).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "aflibercept",
      "anticoagulants"
    ],
    "severity": "moderate",
    "mechanism": "Bleeding risk",
    "effect": "Vitreous hemorrhage",
    "management": "Monitor for bleeding",
    "evidence_level": "C",
    "sources": [
      "Retinal specialists"
    ],
    "rxcui": [
      "1147220",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "albuterol",
      "propranolol"
    ],
    "severity": "major",
    "mechanism": "Beta-receptor antagonism",
    "effect": "Bronchospasm",
    "management": "Avoid non-selective beta-blockers in asthma",
    "evidence_level": "A",
    "sources": [
      "Asthma guidelines"
    ],
    "rxcui": [
      "435",
      "8787"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "alcohol",
      "acetaminophen"
    ],
    "severity": "major",
    "mechanism": "Enhanced hepatotoxicity",
    "effect": "Liver failure",
    "management": "Avoid chronic alcohol use",
    "evidence_level": "A",
    "sources": [
      "Hepatology"
    ],
    "rxcui": [
      "alcohol",
      "161"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5e143f97-fd1f-e72f-e063-6394a90a8d4f",
        "title": "ALKA-SELTZER PLUS COLD AND FLU (CHLORPHENIRAMINE MALEATE, ACETAMINOPHEN, PHENYLEPHRINE HYDROCHLORIDE, DEXTROMETHORPHAN HYDROBROMIDE TABLET) TABLET, EFFERVESCENT",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5e143f97-fd1f-e72f-e063-6394a90a8d4f",
        "matched": "alcohol",
        "snippet": "re use if you are taking the blood thinning drug warfarin taking sedatives or tranquilizers When using this product do not exceed recommended dosage may cause marked drowsiness avoid alcoholic drinks alcohol, sedatives, and tranquilizers may increase drowsiness be careful when driving a motor vehicle or operating machinery excitability may occur, especially in children Stop use and ask a doctor if pain, cough, or nas",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "alectinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Treatment failure",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "1597582",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "alemtuzumab",
      "anticoagulants"
    ],
    "severity": "major",
    "mechanism": "Immune thrombocytopenia",
    "effect": "Severe bleeding",
    "management": "Monitor platelet counts",
    "evidence_level": "A",
    "sources": [
      "MS guidelines"
    ],
    "rxcui": [
      "1403205",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "alemtuzumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Lymphocyte depletion",
    "effect": "Severe infections",
    "management": "Avoid live vaccines for years",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "1403205",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "alendronate",
      "coffee"
    ],
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
    "drugs": [
      "allopurinol",
      "azathioprine"
    ],
    "severity": "major",
    "mechanism": "Inhibition of azathioprine metabolism",
    "effect": "Severe bone marrow suppression",
    "management": "Reduce azathioprine dose by 75%; monitor blood counts",
    "evidence_level": "A",
    "sources": [
      "Rheumatology guidelines",
      "Rheumatology"
    ],
    "rxcui": [
      "519",
      "2azathioprine"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5d330416-4289-762e-e063-6294a90a532e",
        "title": "ALLOPURINOL TABLET [AVPAK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5d330416-4289-762e-e063-6294a90a532e",
        "matched": "azathioprine",
        "snippet": "Mercaptopurine or Azathioprine: Reduce mercaptopurine or azathioprine dose as recommended in the respective prescribing information.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "ceab8e8b-d022-4d0c-a552-cc5782446248",
        "title": "AZATHIOPRINE TABLET [GLENMARK PHARMACEUTICALS, INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ceab8e8b-d022-4d0c-a552-cc5782446248",
        "matched": "allopurinol",
        "snippet": "rug Interactions: Use with xanthine oxidase (XO) inhibitors: One of the pathways for inactivation of azathioprine is inhibited by XO inhibitors (allopurinol or febuxostat).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "allopurinol",
      "hla-b5801 positive"
    ],
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
    "drugs": [
      "allopurinol",
      "mercaptopurine"
    ],
    "severity": "major",
    "mechanism": "Xanthine oxidase inhibition",
    "effect": "Mercaptopurine toxicity",
    "management": "Reduce mercaptopurine dose by 75%",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "519",
      "6763"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5d330416-4289-762e-e063-6294a90a532e",
        "title": "ALLOPURINOL TABLET [AVPAK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5d330416-4289-762e-e063-6294a90a532e",
        "matched": "mercaptopurine",
        "snippet": "Mercaptopurine or Azathioprine: Reduce mercaptopurine or azathioprine dose as recommended in the respective prescribing information.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "0a366cf3-91f0-4aa4-8f34-a7a27cad8f15",
        "title": "MERCAPTOPURINE SUSPENSION [HIKMA PHARMACEUTICALS USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0a366cf3-91f0-4aa4-8f34-a7a27cad8f15",
        "matched": "allopurinol",
        "snippet": "DRUG INTERACTIONS • Allopurinol: Reduce the dose of mercaptopurine when coadministered with allopurinol.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "alosetron",
      "fluvoxamine"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Alosetron toxicity",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "85169",
      "42355"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "35cbb9d5-639b-207a-e054-00144ff88e88",
        "title": "LOTRONEX (ALOSETRON HYDROCHLORIDE) TABLET [SEBELA PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=35cbb9d5-639b-207a-e054-00144ff88e88",
        "matched": "fluvoxamine",
        "snippet": "Use with fluvoxamine is contraindicated.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "49601858-df61-4522-ac99-0d2892f92e11",
        "title": "FLUVOXAMINE MALEATE CAPSULE, EXTENDED RELEASE [UPSHER-SMITH LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=49601858-df61-4522-ac99-0d2892f92e11",
        "matched": "alosetron",
        "snippet": "Other Drugs Alosetron: See Contraindications (4), Warnings and Precautions (5.7), and Lotronex® (alosetron) package insert.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "alteplase",
      "aspirin"
    ],
    "severity": "major",
    "mechanism": "Enhanced bleeding risk",
    "effect": "Intracranial hemorrhage risk",
    "management": "Avoid aspirin within 24 hours of thrombolysis",
    "evidence_level": "A",
    "sources": [
      "Stroke guidelines"
    ],
    "rxcui": [
      "114805",
      "1191"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c669f77c-fa48-478b-a14b-80b20a0139c2",
        "title": "ACTIVASE (ALTEPLASE) KIT [GENENTECH, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c669f77c-fa48-478b-a14b-80b20a0139c2",
        "matched": "aspirin",
        "snippet": "Aspirin and heparin have been administered concomitantly with and following infusions of Activase in the management of acute myocardial infarction and pulmonary embolism, but the concomitant administration of heparin and aspirin with and following infusions of Activase for the treatment of acute ischemic stroke during the first 24 hours after symptom onset has not been investigated.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "aluminum hydroxide",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Antacid reduces digoxin absorption",
    "effect": "Decreased digoxin efficacy",
    "management": "Separate administration by 2 hours",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "261",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "amiodarone",
      "beta-blockers"
    ],
    "severity": "major",
    "mechanism": "Additive bradycardia",
    "effect": "Complete heart block",
    "management": "Monitor ECG closely",
    "evidence_level": "A",
    "sources": [
      "Electrophysiology"
    ],
    "rxcui": [
      "703",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "amiodarone",
      "elderly"
    ],
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
    "drugs": [
      "amiodarone",
      "simvastatin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases simvastatin exposure",
    "effect": "Myopathy and rhabdomyolysis risk",
    "management": "Limit simvastatin to 20mg daily; consider pravastatin",
    "evidence_level": "A",
    "sources": [
      "ACC/AHA guidelines",
      "Guidelines"
    ],
    "rxcui": [
      "703",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "simvastatin",
        "snippet": "HMG-CoA Reductase Inhibitors simvastatin, lovastatin, atorvastatin Increased plasma concentration of HMGCoA reductase inhibitor.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "amiodarone",
        "snippet": "Amiodarone, Dronedarone, Ranolazine, or Calcium Channel Blockers Clinical Impact: The risk of myopathy and rhabdomyolysis is increased by concomitant use of amiodarone, dronedarone, ranolazine, or calcium channel blockers with simvastatin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "amiodarone",
      "sun exposure"
    ],
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
    "drugs": [
      "amitriptyline",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "Multiple CYP inhibition",
    "effect": "Increased tricyclic toxicity",
    "management": "Monitor for anticholinergic effects",
    "evidence_level": "B",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "704",
      "2541"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "amlodipine",
      "clarithromycin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases amlodipine levels",
    "effect": "Enhanced hypotensive effect",
    "management": "Monitor blood pressure; consider dose reduction",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "17767",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "amlodipine",
        "snippet": "Calcium Channel Blockers: Verapamil Amlodipine Diltiazem Nifedipine Use With Caution Verapamil: Hypotension, bradyarrhythmias, and lactic acidosis have been observed in patients receiving concurrent verapamil, [see Warnings and Precautions (5.4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "amlodipine",
      "simvastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases statin exposure",
    "effect": "Myopathy risk",
    "management": "Limit simvastatin to 20mg daily",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations",
      "FDA"
    ],
    "rxcui": [
      "17767",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "58d2fbed-3904-3e31-e063-6294a90af21d",
        "title": "AMLODIPINE BESYLATE TABLET [REDPHARM DRUG]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=58d2fbed-3904-3e31-e063-6294a90af21d",
        "matched": "simvastatin",
        "snippet": "DRUG INTERACTIONS Do not exceed doses greater than 20 mg daily of simvastatin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "amlodipine",
        "snippet": "For patients taking amiodarone, amlodipine, or ranolazine, do not exceed simvastatin 20 mg daily [see DOSAGE AND ADMINISTRATION (2.5)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "amphotericin b",
      "aminoglycosides"
    ],
    "severity": "major",
    "mechanism": "Additive nephrotoxicity",
    "effect": "Acute kidney injury",
    "management": "Monitor renal function closely; avoid if possible",
    "evidence_level": "A",
    "sources": [
      "Nephrology guidelines"
    ],
    "rxcui": [
      "704",
      "4814"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "amphotericin b",
      "nephrotoxic agents"
    ],
    "severity": "major",
    "mechanism": "Additive nephrotoxicity",
    "effect": "Acute kidney injury",
    "management": "Monitor renal function closely; avoid if possible",
    "evidence_level": "A",
    "sources": [
      "Nephrology guidelines"
    ],
    "rxcui": [
      "704",
      "nephrotoxic"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "anidulafungin",
      "cyclosporine"
    ],
    "severity": "minor",
    "mechanism": "No significant interaction",
    "effect": "None expected",
    "management": "No adjustment",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "187832",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a88d9010-55fb-4a02-baff-042cd27688ea",
        "title": "ERAXIS (ANIDULAFUNGIN) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [ROERIG]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a88d9010-55fb-4a02-baff-042cd27688ea",
        "matched": "cyclosporine",
        "snippet": "DRUG INTERACTIONS 7.1 Cyclosporine Administration of multiple doses of anidulafungin and cyclosporine to healthy subjects resulted in no significant alteration in the steady state pharmacokinetics of either drug.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "anifrolumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Type I interferon inhibition",
    "effect": "Impaired viral immunity",
    "management": "Avoid live vaccines",
    "evidence_level": "A",
    "sources": [
      "Lupus treatment"
    ],
    "rxcui": [
      "2467892",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "anticholinergics",
      "elderly"
    ],
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
    "drugs": [
      "anticoagulants",
      "dong quai"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced bleeding",
    "effect": "Bleeding risk",
    "management": "Monitor closely",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "11289",
      "dong_quai"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "antihistamines",
      "alcohol"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced sedation",
    "effect": "Impaired driving and falls",
    "management": "Caution with alcohol use",
    "evidence_level": "A",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "7531",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "apixaban",
      "dual antiplatelet therapy"
    ],
    "severity": "major",
    "mechanism": "Triple antithrombotic therapy",
    "effect": "Major bleeding",
    "management": "Avoid triple therapy when possible",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "1364430",
      "32968"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "41a133ef-e461-48ad-8221-b735bdd0ec25",
        "title": "ELIQUIS (APIXABAN) TABLET, FILM COATED [APHENA PHARMA SOLUTIONS - TENNESSEE, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=41a133ef-e461-48ad-8221-b735bdd0ec25",
        "matched": "dual antiplatelet therapy",
        "snippet": "The rate of ISTH major bleeding was 2.8% per year with ELIQUIS versus 0.6% per year with placebo in patients receiving single antiplatelet therapy and was 5.9% per year with ELIQUIS versus 2.5% per year with placebo in those receiving dual antiplatelet therapy.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "apixaban",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces apixaban levels",
    "effect": "Loss of anticoagulant effect",
    "management": "Avoid combination; use alternative anticoagulant",
    "evidence_level": "A",
    "sources": [
      "FDA label"
    ],
    "rxcui": [
      "1364430",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "41a133ef-e461-48ad-8221-b735bdd0ec25",
        "title": "ELIQUIS (APIXABAN) TABLET, FILM COATED [APHENA PHARMA SOLUTIONS - TENNESSEE, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=41a133ef-e461-48ad-8221-b735bdd0ec25",
        "matched": "rifampin",
        "snippet": "Combined P-gp and Strong CYP3A4 Inducers Avoid concomitant use of ELIQUIS with combined P-gp and strong CYP3A4 inducers (e.g., rifampin, carbamazepine, phenytoin, St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "argatroban",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Additive anticoagulation with INR confusion",
    "effect": "Bleeding risk and monitoring challenges",
    "management": "Bridge carefully with INR monitoring",
    "evidence_level": "A",
    "sources": [
      "Hematology guidelines"
    ],
    "rxcui": [
      "149120",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "514ad15b-d060-9d65-e063-6294a90a6188",
        "title": "ARGATROBAN SOLUTION [PLANO PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=514ad15b-d060-9d65-e063-6294a90a6188",
        "matched": "warfarin",
        "snippet": "DRUG INTERACTIONS Heparin: Allow sufficient time for heparin’s effect on aPTT to decrease before initiating Argatroban in 0.9% Sodium Chloride Injection therapy (7.1) Warfarin: Concomitant use results in increased prolongation of PT and INR (7.2) Thrombolytic agents or glycoprotein IIb/IIIa antagonists: Safety and effectiveness of concomitant use with argatroban have not been established (7.4, 7.5) 7.1 Heparin If ar",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "argatroban",
        "snippet": "Table 3: Drugs that Can Increase the Risk of Bleeding Drug Class Specific Drugs Anticoagulants argatroban, dabigatran, bivalirudin, desirudin, heparin, lepirudin Antiplatelet Agents aspirin, cilostazol, clopidogrel, dipyridamole, prasugrel, ticlopidine Nonsteroidal Anti-Inflammatory Agents celecoxib, diclofenac, diflunisal, fenoprofen, ibuprofen, indomethacin, ketoprofen, ketorolac, mefenamic acid, naproxen, oxaprozi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "aripiprazole",
      "quinidine"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Aripiprazole toxicity",
    "management": "Reduce dose to 25%",
    "evidence_level": "A",
    "sources": [
      "Prescribing info"
    ],
    "rxcui": [
      "89013",
      "9068"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "573c6bb6-941f-4413-8c23-826025385864",
        "title": "ARIPIPRAZOLE TABLET [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=573c6bb6-941f-4413-8c23-826025385864",
        "matched": "quinidine",
        "snippet": "ions with Aripiprazole: Concomitant Drug Name or Drug Class Clinical Rationale Clinical Recommendation Strong CYP3A4 Inhibitors (e.g., itraconazole, clarithromycin) or strong CYP2D6 inhibitors (e.g., quinidine, fluoxetine, paroxetine) Concomitant use of aripiprazole with strong CYP3A4 or CYP2D6 inhibitors increased the exposure of aripiprazole compared to the use of aripiprazole alone [see Clinical Pharmacology (12.3",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "armodafinil",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Contraceptive failure",
    "management": "Use additional contraception",
    "evidence_level": "A",
    "sources": [
      "Sleep medicine"
    ],
    "rxcui": [
      "674475",
      "9072"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "aspirin",
      "children with viral illness"
    ],
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
    "drugs": [
      "aspirin",
      "methotrexate"
    ],
    "severity": "major",
    "mechanism": "Reduced methotrexate clearance",
    "effect": "Methotrexate toxicity",
    "management": "Avoid high-dose aspirin; monitor MTX levels",
    "evidence_level": "A",
    "sources": [
      "Rheumatology guidelines"
    ],
    "rxcui": [
      "1191",
      "6851"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "title": "METHOTREXATE TABLET [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "matched": "aspirin",
        "snippet": "ound drugs (e.g., oral anticoagulants, phenytoin, salicylates, sulfonamides, sulfonylureas, and tetracyclines) Probenecid Antifolate drugs (e.g., dapsone, pemetrexed, pyrimethamine and sulphonamides) Aspirin and other nonsteroidal anti-inflammatory drugs Hepatotoxic products Highly protein-bound drugs (e.g., oral anticoagulants, phenytoin, salicylates, sulfonamides, sulfonylureas, and tetracyclines) Proton pump inhib",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "aspirin",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Additive anticoagulant/antiplatelet effects",
    "effect": "Significantly increased bleeding risk",
    "management": "Avoid combination or monitor very closely; frequent INR checks",
    "evidence_level": "A",
    "sources": [
      "Clinical literature",
      "FDA guidelines"
    ],
    "rxcui": [
      "1191",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "aspirin",
        "snippet": "Table 3: Drugs that Can Increase the Risk of Bleeding Drug Class Specific Drugs Anticoagulants argatroban, dabigatran, bivalirudin, desirudin, heparin, lepirudin Antiplatelet Agents aspirin, cilostazol, clopidogrel, dipyridamole, prasugrel, ticlopidine Nonsteroidal Anti-Inflammatory Agents celecoxib, diclofenac, diflunisal, fenoprofen, ibuprofen, indomethacin, ketoprofen, ketorolac, mefenamic acid, naproxen, oxaprozi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "atenolol",
      "nifedipine"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypotensive effect",
    "effect": "Severe hypotension",
    "management": "Start with low doses",
    "evidence_level": "A",
    "sources": [
      "Clinical",
      "Hypertension guidelines"
    ],
    "rxcui": [
      "1202",
      "7240"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "atomoxetine",
      "cyp2d6 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Atomoxetine toxicity",
    "management": "Reduce atomoxetine dose",
    "evidence_level": "A",
    "sources": [
      "ADHD"
    ],
    "rxcui": [
      "135398",
      "cyp2d6_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0ab8d905-e890-4e91-a730-3e5d12f5c23f",
        "title": "ATOMOXETINE CAPSULE [GLENMARK PHARMACEUTICALS INC., USA]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0ab8d905-e890-4e91-a730-3e5d12f5c23f",
        "matched": "cyp2d6 inhibitors",
        "snippet": "Strong CYP2D6 Inhibitors Prevention or Management With concomitant use of atomoxetine and a strong CYP2D6 inhibitor, increase the titration interval [see Dosage and Administration (2.5) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "atorvastatin",
      "gemfibrozil"
    ],
    "severity": "major",
    "mechanism": "Inhibition of statin glucuronidation",
    "effect": "Severe myopathy and rhabdomyolysis",
    "management": "Avoid combination; use alternative lipid therapy",
    "evidence_level": "A",
    "sources": [
      "FDA warning"
    ],
    "rxcui": [
      "83367",
      "25025"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "title": "ATORVASTATIN CALCIUM TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "matched": "gemfibrozil",
        "snippet": "Table 2: Drug Interactions that may Increase the Risk of Myopathy and Rhabdomyolysis with Atorvastatin Cyclosporine or Gemfibrozil Clinical Impact: Atorvastatin plasma levels were significantly increased with concomitant administration of atorvastatin and cyclosporine, an inhibitor of CYP3A4 and OATP1B1 [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cf32b795-bf42-4861-b273-06d27de3f21d",
        "title": "GEMFIBROZIL (GEMFIBROZIL) TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cf32b795-bf42-4861-b273-06d27de3f21d",
        "matched": "atorvastatin",
        "snippet": "D) OATP1B1 substrates Gemfibrozil is an inhibitor of OATP1B1 transporter and may increase exposure of drugs that are substrates of OATP1B1 (e.g., atrasentan, atorvastatin, bosentan, ezetimibe, fluvastatin, glyburide, SN-38 [active metabolite of irinotecan], rosuvastatin, pitavastatin, pravastatin, rifampin, valsartan, olmesartan).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "atorvastatin",
      "grapefruit juice"
    ],
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
    "drugs": [
      "axicabtagene ciloleucel",
      "antiepileptics"
    ],
    "severity": "moderate",
    "mechanism": "CRS/ICANS management",
    "effect": "Seizure prophylaxis",
    "management": "Consider prophylactic antiepileptics",
    "evidence_level": "B",
    "sources": [
      "CAR-T protocols"
    ],
    "rxcui": [
      "2103944",
      "antiepileptics"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "azithromycin",
      "colchicine"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein inhibition",
    "effect": "Colchicine toxicity",
    "management": "Reduce colchicine dose; monitor for toxicity",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "18631",
      "2683"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f6a52c0b-45db-422e-8c22-e867a11b4439",
        "title": "AZITHROMYCIN TABLET, FILM COATED [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f6a52c0b-45db-422e-8c22-e867a11b4439",
        "matched": "colchicine",
        "snippet": "Potential Drug-Drug Interaction with Macrolides Interactions with digoxin, colchicine or phenytoin have not been reported in clinical trials with azithromycin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "azithromycin",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced anticoagulation effect",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR more frequently during antibiotic course",
    "evidence_level": "B",
    "sources": [
      "Clinical studies",
      "Studies"
    ],
    "rxcui": [
      "18631",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f6a52c0b-45db-422e-8c22-e867a11b4439",
        "title": "AZITHROMYCIN TABLET, FILM COATED [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f6a52c0b-45db-422e-8c22-e867a11b4439",
        "matched": "warfarin",
        "snippet": "Warfarin: Use with azithromycin may increase coagulation times; monitor prothrombin time.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "baclofen",
      "tramadol"
    ],
    "severity": "moderate",
    "mechanism": "Additive CNS depression",
    "effect": "Seizure risk",
    "management": "Monitor for seizures",
    "evidence_level": "B",
    "sources": [
      "FDA reports"
    ],
    "rxcui": [
      "1292",
      "10689"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "baloxavir",
      "polyvalent cations"
    ],
    "severity": "moderate",
    "mechanism": "Chelation",
    "effect": "Reduced antiviral efficacy",
    "management": "Separate administration",
    "evidence_level": "A",
    "sources": [
      "Influenza treatment"
    ],
    "rxcui": [
      "2103944",
      "polyvalent_cations"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b58b2899-4d22-41e1-8f0c-bdead8917694",
        "title": "XOFLUZA (BALOXAVIR MARBOXIL) TABLET, FILM COATED [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b58b2899-4d22-41e1-8f0c-bdead8917694",
        "matched": "polyvalent cations",
        "snippet": "Effect of Other Drugs on XOFLUZA Baloxavir may form a chelate with polyvalent cations such as calcium, aluminum, or magnesium.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "baricitinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced metabolism",
    "effect": "Reduced efficacy",
    "management": "Avoid combination if possible",
    "evidence_level": "B",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "1947736",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "basiliximab",
      "other monoclonal antibodies"
    ],
    "severity": "moderate",
    "mechanism": "Additive immunosuppression",
    "effect": "Increased infection risk",
    "management": "Monitor closely",
    "evidence_level": "B",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "203138",
      "monoclonal_antibodies"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "bedaquiline",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Loss of anti-TB efficacy",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "TB guidelines"
    ],
    "rxcui": [
      "1409275",
      "cyp3a4_inducers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1534c9ae-4948-4cf4-9f66-222a99db6d0e",
        "title": "SIRTURO (BEDAQUILINE FUMARATE) TABLET [JANSSEN PRODUCTS, LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1534c9ae-4948-4cf4-9f66-222a99db6d0e",
        "matched": "strong cyp3a4 inducers",
        "snippet": "Effect of Other Drugs on SIRTURO Strong and Moderate CYP3A4 Inducers Coadministration of SIRTURO with moderate or strong CYP3A4 inducers may decrease systemic exposure of bedaquiline.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "belatacept",
      "strong immunosuppressants"
    ],
    "severity": "major",
    "mechanism": "Over-immunosuppression",
    "effect": "Severe infections and malignancy",
    "management": "Monitor for complications",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "865183",
      "immunosuppressants"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c16ac648-d5d2-9f7d-8637-e2328572754e",
        "title": "NULOJIX (BELATACEPT) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [E.R. SQUIBB & SONS, L.L.C.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c16ac648-d5d2-9f7d-8637-e2328572754e",
        "matched": "immunosuppressants",
        "snippet": "Boxed Warning, 4, 5.1, 5.6) • Other malignancies: increased risk with all immunosuppressants; appears related to intensity and duration of use.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "belimumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "B-cell function inhibition",
    "effect": "Vaccine failure and infections",
    "management": "Complete vaccination before therapy",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "1013469",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2fa3c528-1777-4628-8a55-a69dae2381a3",
        "title": "BENLYSTA (BELIMUMAB) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION BENLYSTA (BELIMUMAB) SOLUTION [GLAXOSMITHKLINE LLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2fa3c528-1777-4628-8a55-a69dae2381a3",
        "matched": "live vaccines",
        "snippet": "Immunization: Live vaccines should not be given concurrently with BENLYSTA.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "benzodiazepines",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Additive CNS depression",
    "effect": "Fatal respiratory depression",
    "management": "Absolute contraindication",
    "evidence_level": "A",
    "sources": [
      "Toxicology"
    ],
    "rxcui": [
      "1372",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "benzodiazepines",
      "elderly"
    ],
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
    "drugs": [
      "beta-blockers",
      "asthma"
    ],
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
    "drugs": [
      "beta2-agonists",
      "beta-blockers"
    ],
    "severity": "major",
    "mechanism": "Pharmacodynamic antagonism",
    "effect": "Bronchospasm and reduced bronchodilation",
    "management": "Avoid non-selective beta-blockers in asthma",
    "evidence_level": "A",
    "sources": [
      "Asthma guidelines"
    ],
    "rxcui": [
      "1356",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "bevacizumab",
      "sunitinib"
    ],
    "severity": "major",
    "mechanism": "Additive anti-angiogenic effects",
    "effect": "Severe hypertension and arterial thromboembolism",
    "management": "Avoid combination; monitor blood pressure closely if unavoidable",
    "evidence_level": "A",
    "sources": [
      "FDA warnings",
      "Oncology guidelines",
      "Trials"
    ],
    "rxcui": [
      "722963",
      "395503"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a9479e5f-914f-46ca-95c1-327c66457e47",
        "title": "SUNITINIB MALATE CAPSULE [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a9479e5f-914f-46ca-95c1-327c66457e47",
        "matched": "bevacizumab",
        "snippet": "Thrombotic Microangiopathy Thrombotic Microangiopathy (TMA), including thrombotic thrombocytopenic purpura and hemolytic uremic syndrome, sometimes leading to renal failure or a fatal outcome, occurred in clinical trials and in postmarketing experience of sunitinib malate as monotherapy and administered in combination with bevacizumab.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "bevacizumab",
      "wound healing"
    ],
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
    "drugs": [
      "bexagliflozin",
      "strong cyp3a4 inducers"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced metabolism",
    "effect": "Reduced glucose lowering",
    "management": "Monitor glucose control",
    "evidence_level": "C",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "2601177",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "bisoprolol",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "Hepatic enzyme induction",
    "effect": "Reduced bisoprolol effectiveness",
    "management": "Monitor therapeutic response; may need dose increase",
    "evidence_level": "B",
    "sources": [
      "Clinical experience"
    ],
    "rxcui": [
      "1745",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7556f457-c4d3-49d6-b383-0ade6d489091",
        "title": "BISOPROLOL FUMARATE TABLET, FILM COATED [SUN PHARMACEUTICAL INDUSTRIES, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7556f457-c4d3-49d6-b383-0ade6d489091",
        "matched": "rifampin",
        "snippet": "Concurrent use of rifampin increases the metabolic clearance of bisoprolol fumarate, resulting in a shortened elimination half-life of bisoprolol fumarate.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "bisphosphonates",
      "aminoglycosides"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypocalcemia",
    "effect": "Severe hypocalcemia",
    "management": "Monitor calcium levels",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "1767",
      "723"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "bivalirudin",
      "thrombolytics"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Life-threatening hemorrhage",
    "management": "Use only in specialized settings with monitoring",
    "evidence_level": "A",
    "sources": [
      "Interventional cardiology"
    ],
    "rxcui": [
      "134692",
      "thrombolytic"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "42aa2630-83d6-433d-8277-0f672cf8d71d",
        "title": "BIVALIRUDIN INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [AVENACY, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=42aa2630-83d6-433d-8277-0f672cf8d71d",
        "matched": "thrombolytics",
        "snippet": "DRUG INTERACTIONS In clinical trials in patients undergoing PCI/percutaneous transluminal coronary angioplasty (PTCA), co-administration of bivalirudin with heparin, warfarin, thrombolytics, or GPIs was associated with increased risks of major bleeding events compared to patients not receiving these concomitant medications.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "bleomycin",
      "high oxygen"
    ],
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
    "drugs": [
      "bleomycin",
      "oxygen"
    ],
    "severity": "major",
    "mechanism": "Enhanced pulmonary toxicity",
    "effect": "Severe pneumonitis",
    "management": "Minimize oxygen concentration during surgery",
    "evidence_level": "A",
    "sources": [
      "Anesthesiology guidelines"
    ],
    "rxcui": [
      "1341",
      "7812"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "brexpiprazole",
      "strong cyp2d6 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Increased brexpiprazole levels",
    "management": "Reduce dose to half",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1592737",
      "cyp2d6_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "df891816-3fdb-4347-8bf0-c18bc40f1d70",
        "title": "REXULTI (BREXPIPRAZOLE) TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=df891816-3fdb-4347-8bf0-c18bc40f1d70",
        "matched": "strong cyp2d6 inhibitors",
        "snippet": "DRUG INTERACTIONS Factors Dosage Adjustments for REXULTI (2.7) Strong CYP2D6 REXULTI may be administered without dosage adjustment in patients with MDD when administered with strong CYP2D6 inhibitors (e.g., paroxetine, fluoxetine).or CYP3A4 inhibitors Administer half of recommended dosage.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "brigatinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Dose-limiting toxicity",
    "management": "Reduce brigatinib dose by 50%",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1958219",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "brimonidine",
      "tricyclic antidepressants"
    ],
    "severity": "moderate",
    "mechanism": "Alpha-2 agonist effects",
    "effect": "Severe hypotension",
    "management": "Monitor BP closely",
    "evidence_level": "B",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "2436",
      "321988"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5c4aea88-95ca-4da8-a3da-02f10c8b6623",
        "title": "BRIMONIDINE TARTRATE SOLUTION/ DROPS [PACIFIC PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5c4aea88-95ca-4da8-a3da-02f10c8b6623",
        "matched": "tricyclic antidepressants",
        "snippet": "Tricyclic antidepressants may potentially blunt the hypotensive effect of systemic clonidine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "brivaracetam",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced metabolism",
    "effect": "Reduced anticonvulsant effect",
    "management": "Increase brivaracetam dose",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1723217",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bf372f42-cfc9-4fcf-8226-3936ba8833d7",
        "title": "BRIVARACETAM TABLET, FILM COATED [EXELAN PHARMACEUTICALS, INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bf372f42-cfc9-4fcf-8226-3936ba8833d7",
        "matched": "rifampin",
        "snippet": "DRUG INTERACTIONS Rifampin: Because of decreased concentrations, increasing brivaracetam dosage in patients on concomitant rifampin is recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "buprenorphine",
      "benzodiazepines"
    ],
    "severity": "major",
    "mechanism": "Additive respiratory depression",
    "effect": "Fatal overdose",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "1819",
      "1372"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "69ec3405-78ee-4cb4-9180-9bea937a8dcd",
        "title": "BUPRENORPHINE HYDROCHLORIDE INJECTION [GLAND PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=69ec3405-78ee-4cb4-9180-9bea937a8dcd",
        "matched": "benzodiazepines",
        "snippet": "Benzodiazepines and Other Central Nervous System (CNS) Depressants Clinical Impact: Due to additive pharmacologic effect, the concomitant use of benzodiazepines or other CNS depressants, including alcohol, can increase the risk of hypotension, respiratory depression, profound sedation, coma, and death.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "bupropion",
      "ritonavir"
    ],
    "severity": "major",
    "mechanism": "CYP2B6 inhibition increases bupropion levels",
    "effect": "Seizure risk and neuropsychiatric effects",
    "management": "Reduce bupropion dose by 50%; monitor closely",
    "evidence_level": "A",
    "sources": [
      "HIV drug interactions"
    ],
    "rxcui": [
      "42347",
      "392622"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "136f29fa-a859-4efb-8365-1382716d6f8f",
        "title": "BUPROPION HYDROCHLORIDE TABLET, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=136f29fa-a859-4efb-8365-1382716d6f8f",
        "matched": "ritonavir",
        "snippet": "DRUG INTERACTIONS CYP2B6 inducers: Dose increase may be necessary if coadministered with CYP2B6 inducers (e.g., ritonavir, lopinavir, efavirenz, carbamazepine, phenobarbital, and phenytoin) based on clinical exposure, but should not exceed the maximum recommended dose.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "11f757f1-cf48-47a8-925e-918359cbd2d4",
        "title": "RITONAVIR TABLET, FILM COATED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=11f757f1-cf48-47a8-925e-918359cbd2d4",
        "matched": "bupropion",
        "snippet": "Antidepressant: bupropion ↓ bupropion↓ active metabolite, hydroxybupropion Patients receiving ritonavir and bupropion concurrently should be monitored for an adequate clinical response to bupropion.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "bupropion",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Lowered seizure threshold",
    "effect": "Increased seizure risk",
    "management": "Avoid in patients with seizure disorders",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning",
      "FDA"
    ],
    "rxcui": [
      "42347",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "83367367-5654-4078-831a-69ade48bc795",
        "title": "TRAMADOL HYDROCHLORIDE TABLET, EXTENDED RELEASE [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=83367367-5654-4078-831a-69ade48bc795",
        "matched": "bupropion",
        "snippet": "Examples Quinidine, fluoxetine, paroxetine and bupropion Inhibitors of CYP3A4 Clinical Impact: The concomitant use of tramadol hydrochloride extended-release tablets and CYP3A4 inhibitors can increase the plasma concentration of tramadol and may result in a greater amount of metabolism via CYP2D6 and greater levels of M1.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "caffeine",
      "clozapine"
    ],
    "severity": "moderate",
    "mechanism": "CYP1A2 induction",
    "effect": "Reduced clozapine levels",
    "management": "Monitor clinical response",
    "evidence_level": "B",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "2002",
      "2626"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "title": "VERSACLOZ (CLOZAPINE) SUSPENSION [TRUPHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "matched": "caffeine",
        "snippet": "Moderate or weak CYP1A2 inhibitors include oral contraceptives and caffeine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "calcipotriene",
      "salicylic acid"
    ],
    "severity": "moderate",
    "mechanism": "Chemical degradation",
    "effect": "Reduced calcipotriene efficacy",
    "management": "Avoid concomitant use; separate applications",
    "evidence_level": "A",
    "sources": [
      "Dermatology literature"
    ],
    "rxcui": [
      "19259",
      "8896"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "calcitonin",
      "lithium"
    ],
    "severity": "moderate",
    "mechanism": "Reduced calcitonin efficacy",
    "effect": "Hypercalcemia",
    "management": "Monitor calcium levels",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "1778",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c82eb602-12e1-692b-d660-f8d5b5736b54",
        "title": "CALCITONIN SALMON SPRAY, METERED [APOTEX CORP.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c82eb602-12e1-692b-d660-f8d5b5736b54",
        "matched": "lithium",
        "snippet": "Concomitant use of calcitonin salmon and lithium may lead to a reduction in plasma lithium concentrations due to increased urinary clearance of lithium.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "calcitriol",
      "thiazide diuretics"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced calcium retention",
    "effect": "Hypercalcemia",
    "management": "Monitor serum calcium",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "1756",
      "10387"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "calcium supplements",
      "levothyroxine"
    ],
    "severity": "moderate",
    "mechanism": "Impaired thyroid hormone absorption",
    "effect": "Hypothyroidism",
    "management": "Separate by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "1998",
      "10582"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "canagliflozin",
      "ugt inducers"
    ],
    "severity": "moderate",
    "mechanism": "UGT1A9 induction",
    "effect": "Reduced canagliflozin efficacy",
    "management": "Consider dose increase",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1373463",
      "ugt_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "canakinumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "IL-1β inhibition",
    "effect": "Reduced immune response",
    "management": "Complete vaccinations before therapy",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "1135305",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7d271f3b-e4f9-4d80-8dcf-28d49123f80e",
        "title": "ILARIS (CANAKINUMAB) INJECTION, SOLUTION [NOVARTIS PHARMACEUTICALS CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7d271f3b-e4f9-4d80-8dcf-28d49123f80e",
        "matched": "live vaccines",
        "snippet": "Immunization No data are available on either the effects of live vaccination or the secondary transmission of infection by live vaccines in patients receiving ILARIS.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cannabidiol",
      "clobazam"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C19 inhibition",
    "effect": "Increased clobazam metabolite",
    "management": "Monitor for sedation",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "1851286",
      "2597"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8bf27097-4870-43fb-94f0-f3d0871d1eec",
        "title": "EPIDIOLEX (CANNABIDIOL) SOLUTION [JAZZ PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8bf27097-4870-43fb-94f0-f3d0871d1eec",
        "matched": "clobazam",
        "snippet": "Effect of EPIDIOLEX on Other Drugs Antiepileptic Drugs Clobazam Concomitant use of EPIDIOLEX with clobazam increases plasma concentrations of N‑desmethylclobazam, the active metabolite of clobazam [see Clinical Pharmacology (12.3)], which may increase the risk of clobazam-related adverse reactions [see Adverse Reactions (6.1) and Warnings and Precautions (5.1, 5.2)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "capecitabine",
      "phenytoin"
    ],
    "severity": "major",
    "mechanism": "DPD inhibition",
    "effect": "5-FU toxicity",
    "management": "Monitor for severe toxicity",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "194000",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0b59e98c-5b34-4b93-90f6-20526f4d4f88",
        "title": "CAPECITABINE (CAPECITABINE) TABLET, FILM COATED [NORTHSTAR RXLLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0b59e98c-5b34-4b93-90f6-20526f4d4f88",
        "matched": "phenytoin",
        "snippet": "Vitamin K antagonists: Monitor INR more frequently and dose adjust oral vitamin K antagonist as appropriate • Phenytoin:Closely monitor phenytoin levels in patients taking capecitabine concomitantly with phenytoin and adjust the phenytoin dose as appropriate.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "capecitabine",
        "snippet": "nytoin serum levels Antiepileptic drugs Ethosuximide, felbamate, oxcarbazepine, methsuximide, topiramate Azoles Fluconazole, ketoconazole, itraconazole, miconazole, voriconazole Antineoplastic agents Capecitabine, fluorouracil Antidepressants Fluoxetine, fluvoxamine, sertraline Gastric acid reducing agents H 2antagonists (cimetidine), omeprazole Sulfonamides Sulfamethizole, sulfaphenazole, sulfadiazine, sulfamethoxaz",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "captopril",
      "allopurinol"
    ],
    "severity": "moderate",
    "mechanism": "Hypersensitivity reactions",
    "effect": "Stevens-Johnson syndrome risk",
    "management": "Monitor for skin reactions",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "1998",
      "519"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1395ba5b-2fc9-41ff-9c43-e0740d781dee",
        "title": "CAPTOPRIL TABLET [AMICI PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1395ba5b-2fc9-41ff-9c43-e0740d781dee",
        "matched": "allopurinol",
        "snippet": "Allopurinol In a study of healthy male volunteers no significant pharmacokinetic interaction occurred when captopril and allopurinol were administered concomitantly for 6 days.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "carbamazepine",
      "hla-b5701 positive"
    ],
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
    "drugs": [
      "carbamazepine",
      "macrolides"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Toxicity",
    "management": "Avoid erythromycin",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "2002",
      "4053"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "carbamazepine",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction reduces contraceptive efficacy",
    "effect": "Risk of unintended pregnancy",
    "management": "Use additional contraceptive methods",
    "evidence_level": "A",
    "sources": [
      "Reproductive health guidelines",
      "Gynecology"
    ],
    "rxcui": [
      "2002",
      "311"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "carboplatin",
      "phenytoin"
    ],
    "severity": "moderate",
    "mechanism": "Increased carboplatin clearance",
    "effect": "Reduced antitumor efficacy",
    "management": "Monitor therapeutic response; consider dose adjustment",
    "evidence_level": "B",
    "sources": [
      "Oncology literature"
    ],
    "rxcui": [
      "40048",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "carboplatin",
        "snippet": "carbonate, aluminum hydroxide, magnesium hydroxide Prevention or Management: Phenytoin and antacids should not be taken at the same time of day Antineoplastic agents usually in combination Bleomycin, carboplatin, cisplatin, doxorubicin, methotrexate Antiviral agents Fosamprenavir, nelfinavir, ritonavir Antiepileptic drugs Carbamazepine, vigabatrin Other Chronic alcohol abuse, diazepam, diazoxide, folic acid, reserpin",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cariprazine",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Loss of efficacy",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Prescribing info"
    ],
    "rxcui": [
      "1596860",
      "cyp3a4_inducers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4b5f7c65-aa2d-452a-b3db-bc85c06ff12f",
        "title": "VRAYLAR (CARIPRAZINE) CAPSULE, GELATIN COATED VRAYLAR (CARIPRAZINE) KIT [ALLERGAN, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4b5f7c65-aa2d-452a-b3db-bc85c06ff12f",
        "matched": "cyp3a4 inducers",
        "snippet": "CYP3A4 Inducers Clinical Impact: CYP3A4 is responsible for the formation and elimination of the active metabolites of cariprazine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "carisoprodol",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Additive CNS depression",
    "effect": "Respiratory depression",
    "management": "Avoid alcohol; counsel patients about risks",
    "evidence_level": "A",
    "sources": [
      "Clinical guidelines"
    ],
    "rxcui": [
      "2002",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4626a7a7-c433-4dab-8deb-e6e45de493a6",
        "title": "CARISOPRODOL TABLET [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4626a7a7-c433-4dab-8deb-e6e45de493a6",
        "matched": "alcohol",
        "snippet": "DRUG INTERACTIONS CNS depressants (e.g., alcohol, benzodiazepines, opioids, tricyclic antidepressants) - additive sedative effects (5.1, 7.1) 7.1 CNS Depressants The sedative effects of carisoprodol and other CNS depressants (e.g., alcohol, benzodiazepines, opioids, tricyclic antidepressants) may be additive.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "carvedilol",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 induction reduces carvedilol levels",
    "effect": "Loss of cardioprotective effect",
    "management": "Monitor heart rate and blood pressure",
    "evidence_level": "B",
    "sources": [
      "Cardiology literature",
      "Clinical"
    ],
    "rxcui": [
      "20352",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ab8aa773-0ed1-4d59-a1bb-f46cf882644f",
        "title": "CARVEDILOL TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ab8aa773-0ed1-4d59-a1bb-f46cf882644f",
        "matched": "rifampin",
        "snippet": "DRUG INTERACTIONS CYP P450 2D6 enzyme inhibitors may increase and rifampin may decrease carvedilol levels.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "caspofungin",
      "cyclosporine"
    ],
    "severity": "moderate",
    "mechanism": "Unknown mechanism increases liver enzymes",
    "effect": "Hepatotoxicity",
    "management": "Monitor liver function; avoid combination",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "213293",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3bad23a6-09a6-4194-9182-093ed61bc71c",
        "title": "CANCIDAS (CASPOFUNGIN ACETATE) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [MERCK SHARP & DOHME LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3bad23a6-09a6-4194-9182-093ed61bc71c",
        "matched": "cyclosporine",
        "snippet": "DRUG INTERACTIONS Cyclosporine: In two adult clinical studies, cyclosporine (one 4 mg/kg dose or two 3 mg/kg doses) increased the AUC of CANCIDAS.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "caspofungin",
      "tacrolimus"
    ],
    "severity": "moderate",
    "mechanism": "Unknown mechanism",
    "effect": "Reduced levels",
    "management": "Monitor levels",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "213293",
      "42316"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3bad23a6-09a6-4194-9182-093ed61bc71c",
        "title": "CANCIDAS (CASPOFUNGIN ACETATE) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [MERCK SHARP & DOHME LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3bad23a6-09a6-4194-9182-093ed61bc71c",
        "matched": "tacrolimus",
        "snippet": "Tacrolimus: For patients receiving CANCIDAS and tacrolimus, standard monitoring of tacrolimus trough whole blood concentrations and appropriate tacrolimus dosage adjustments are recommended.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "caspofungin",
        "snippet": "hylprednisolone, prednisone May decrease tacrolimus concentrations Monitor tacrolimus whole blood trough concentrations and adjust tacrolimus dose if needed [see Dosage and Administration (2.2, 2.6)] Caspofungin May decrease tacrolimus whole blood trough concentrations Monitor tacrolimus whole blood trough concentrations and adjust tacrolimus dose if needed [see Dosage and Administration (2.2, 2.6)]. Direct Acting An",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cc-486",
      "cyp interactions"
    ],
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
    "drugs": [
      "ccb",
      "carbamazepine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced BP control",
    "management": "Monitor BP",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "17767",
      "2002"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cd19 car-t",
      "immunoglobulins"
    ],
    "severity": "moderate",
    "mechanism": "B-cell targeting",
    "effect": "Hypogammaglobulinemia",
    "management": "Monitor Ig levels and supplement if needed",
    "evidence_level": "A",
    "sources": [
      "CAR-T management"
    ],
    "rxcui": [
      "cd19_cart",
      "immunoglobulins"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cd22 car-t",
      "b-cell function"
    ],
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
    "drugs": [
      "cefepime",
      "valproic acid"
    ],
    "severity": "major",
    "mechanism": "Valproic acid displacement",
    "effect": "Seizures and VPA reduction",
    "management": "Monitor VPA levels closely",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "2650",
      "11118"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cefotetan",
      "alcohol"
    ],
    "severity": "moderate",
    "mechanism": "Disulfiram-like reaction",
    "effect": "Nausea, vomiting, flushing",
    "management": "Avoid alcohol during therapy",
    "evidence_level": "A",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "2582",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "celecoxib",
      "lithium"
    ],
    "severity": "moderate",
    "mechanism": "Reduced renal clearance",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "140587",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d0ca85fa-8b80-4a48-a1a4-a1c181821c39",
        "title": "CELECOXIB CAPSULE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d0ca85fa-8b80-4a48-a1a4-a1c181821c39",
        "matched": "lithium",
        "snippet": "Lithium Clinical Impact: NSAIDs have produced elevations in plasma lithium levels and reductions in renal lithium clearance.The mean minimum lithium concentration increased 15%, and the renal clearance decreased by approximately 20%.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "039f188c-413a-6e64-e063-6294a90a2972",
        "title": "LITHIUM CARBONATE TABLET, EXTENDED RELEASE [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=039f188c-413a-6e64-e063-6294a90a2972",
        "matched": "celecoxib",
        "snippet": "In a study conducted in healthy subjects, mean steady-state lithium plasma levels increased approximately 17% in subjects receiving lithium 450 mg BID with celecoxib 200 mg BID as compared to subjects receiving lithium alone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "celecoxib",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "COX-2 inhibition affects platelet function",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR more frequently",
    "evidence_level": "A",
    "sources": [
      "Anticoagulation guidelines"
    ],
    "rxcui": [
      "140587",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d0ca85fa-8b80-4a48-a1a4-a1c181821c39",
        "title": "CELECOXIB CAPSULE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d0ca85fa-8b80-4a48-a1a4-a1c181821c39",
        "matched": "warfarin",
        "snippet": "Table 3: Clinically Significant Drug Interactions with Celecoxib Drugs That Interfere with Hemostasis Clinical Impact: Celecoxib and anticoagulants such as warfarin have a synergistic effect on bleeding.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "celecoxib",
        "snippet": "nts argatroban, dabigatran, bivalirudin, desirudin, heparin, lepirudin Antiplatelet Agents aspirin, cilostazol, clopidogrel, dipyridamole, prasugrel, ticlopidine Nonsteroidal Anti-Inflammatory Agents celecoxib, diclofenac, diflunisal, fenoprofen, ibuprofen, indomethacin, ketoprofen, ketorolac, mefenamic acid, naproxen, oxaprozin, piroxicam, sulindac Serotonin Reuptake Inhibitors citalopram, desvenlafaxine, duloxetine",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cenobamate",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Contraceptive failure",
    "management": "Use non-hormonal contraception",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "2103181",
      "9072"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "565c2126-57ae-4e29-b443-723bbe7e2072",
        "title": "XCOPRI TITRATION PACK (CENOBAMATE) KIT XCOPRI (CENOBAMATE) TABLET, FILM COATED XCOPRI MAINTENANCE PACK (CENOBAMATE) KIT XCOPRI (CENOBAMATE) TABLET [SK LIFE SCIE",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=565c2126-57ae-4e29-b443-723bbe7e2072",
        "matched": "oral contraceptives",
        "snippet": "Oral Contraceptives: Effectiveness of hormonal oral contraceptives may be reduced when administered concomitantly with XCOPRI.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ceritinib",
      "proton pump inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Reduced gastric acidity",
    "effect": "Decreased ceritinib absorption",
    "management": "Avoid PPIs or take with food",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1590168",
      "40790"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cetirizine",
      "ketoconazole"
    ],
    "severity": "minor",
    "mechanism": "P-glycoprotein inhibition",
    "effect": "Slightly increased cetirizine levels",
    "management": "No dose adjustment needed",
    "evidence_level": "C",
    "sources": [
      "Manufacturer data"
    ],
    "rxcui": [
      "1634",
      "6135"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "chloramphenicol",
      "infants"
    ],
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
    "drugs": [
      "chloramphenicol",
      "neonates"
    ],
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
    "drugs": [
      "chloramphenicol",
      "phenytoin"
    ],
    "severity": "major",
    "mechanism": "CYP inhibition increases phenytoin levels",
    "effect": "Phenytoin toxicity",
    "management": "Monitor phenytoin levels; reduce dose",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "2356",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "chloramphenicol",
        "snippet": "e Gastric acid reducing agents H 2antagonists (cimetidine), omeprazole Sulfonamides Sulfamethizole, sulfaphenazole, sulfadiazine, sulfamethoxazole-trimethoprim Other Acute alcohol intake, amiodarone, chloramphenicol, chlordiazepoxide, disulfiram, estrogen, fluvastatin, isoniazid, methylphenidate, phenothiazines, salicylates, ticlopidine, tolbutamide, trazodone, warfarin Drugs that may decrease phenytoin serum levels",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "chloramphenicol",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "CYP inhibition and vitamin K synthesis",
    "effect": "Severe bleeding",
    "management": "Avoid or monitor INR daily",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2556",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "chloroquine",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "Additive QT prolongation",
    "effect": "Torsades de pointes",
    "management": "Avoid combination; monitor ECG if unavoidable",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "2393",
      "703"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "eb02c52d-907c-43fb-aa8f-2f378a9087e7",
        "title": "CHLOROQUINE PHOSPHATE TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=eb02c52d-907c-43fb-aa8f-2f378a9087e7",
        "matched": "amiodarone",
        "snippet": "Arrhythmogenic drugs: There may be an increased risk of inducing ventricular arrhythmias if chloroquine is used concomitantly with other arrhythmogenic drugs, such as amiodarone or moxifloxacin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "chlorpromazine",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Seizure threshold lowering",
    "effect": "Increased seizure risk",
    "management": "Use alternative analgesic",
    "evidence_level": "B",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "2551",
      "10689"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "chlorthalidone",
      "colestipol"
    ],
    "severity": "moderate",
    "mechanism": "Bile acid sequestrant reduces absorption",
    "effect": "Reduced diuretic effect",
    "management": "Separate administration by 2-4 hours",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "2409",
      "2551"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cholestyramine",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Impaired absorption",
    "effect": "Reduced anticoagulation",
    "management": "Separate administration",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "2556",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "214ea05f-de81-4026-9df9-4ce3820668ee",
        "title": "CHOLESTYRAMINE POWDER, FOR SUSPENSION [AIPING PHARMACEUTICAL, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=214ea05f-de81-4026-9df9-4ce3820668ee",
        "matched": "warfarin",
        "snippet": "rug Interactions Cholestyramine resin may delay or reduce the absorption of concomitant oral medication such as phenylbutazone, warfarin, thiazide diuretics (acidic) or propranolol (basic), as well as tetracycline, penicillin G, phenobarbital, thyroid and thyroxine preparations, estrogens and progestins and digitalis.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ciltacabtagene autoleucel",
      "immunosuppressants"
    ],
    "severity": "major",
    "mechanism": "CAR-T cell therapy",
    "effect": "Impaired CAR-T function",
    "management": "Avoid immunosuppressants",
    "evidence_level": "A",
    "sources": [
      "CAR-T guidelines"
    ],
    "rxcui": [
      "2467892",
      "immunosuppressants"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cinacalcet",
      "cyp2d6 substrates"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Increased substrate levels",
    "management": "Monitor for toxicity",
    "evidence_level": "B",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "400583",
      "cyp2d6_substrates"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "44b548ef-1679-4d15-86ad-0d9636b48a45",
        "title": "CINACALCET TABLET, FILM COATED [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=44b548ef-1679-4d15-86ad-0d9636b48a45",
        "matched": "cyp2d6 substrates",
        "snippet": "CYP2D6 Substrates Cinacalcet is a strong inhibitor of CYP2D6.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ciprofloxacin",
      "dairy products"
    ],
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
    "drugs": [
      "cisatracurium",
      "aminoglycosides"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced neuromuscular blockade",
    "effect": "Prolonged paralysis",
    "management": "Monitor neuromuscular function",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "70217",
      "723"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "67908e20-044d-454d-9c51-bf106e817bd0",
        "title": "CISATRACURIUM BESYLATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=67908e20-044d-454d-9c51-bf106e817bd0",
        "matched": "aminoglycosides",
        "snippet": "AntibioticsExamples: aminoglycosides, tetracyclines, bacitracin, polymyxins, lincomycin, clindamycin, colistin, sodium colistimethate Local anesthetics Magnesium salts Procainamide Lithium Quinidine May prolong the neuromuscular blockade action of Cisatracurium Besylate Injection Phenytoin, Carbamazepine May increase resistance to the neuromuscular blockade action of Cisatracurium Besylate Injection resulting in shor",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cisplatin",
      "furosemide"
    ],
    "severity": "major",
    "mechanism": "Additive ototoxicity and nephrotoxicity",
    "effect": "Hearing loss and kidney failure",
    "management": "Monitor closely",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "2555",
      "4603"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "48d8f490-e9d1-4c95-ab2f-414d3f4a9df4",
        "title": "FUROSEMIDE TABLET [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=48d8f490-e9d1-4c95-ab2f-414d3f4a9df4",
        "matched": "cisplatin",
        "snippet": "There is a risk of ototoxic effects if cisplatin and furosemide are given concomitantly.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cisplatin",
      "gentamicin"
    ],
    "severity": "major",
    "mechanism": "Additive nephrotoxicity and ototoxicity",
    "effect": "Kidney damage and hearing loss",
    "management": "Monitor renal function and audiometry",
    "evidence_level": "A",
    "sources": [
      "Oncology guidelines"
    ],
    "rxcui": [
      "2555",
      "4814"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "449c9a41-d61e-49fd-b5e3-d76f74b92acf",
        "title": "GENTAMICIN SULFATE IN SODIUM CHLORIDE (GENTAMICIN SULFATE) INJECTION, SOLUTION [BAXTER HEALTHCARE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=449c9a41-d61e-49fd-b5e3-d76f74b92acf",
        "matched": "cisplatin",
        "snippet": "Concurrent and/or sequential systemic or topical use of other potentially neurotoxic and/or nephrotoxic drugs such as cisplatin, cephaloridine, kanamycin, amikacin, neomycin, polymyxin B, colistin, paromomycin, streptomycin, tobramycin, vancomycin, and viomycin, should be avoided.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cisplatin",
      "loop diuretics"
    ],
    "severity": "major",
    "mechanism": "Enhanced ototoxicity and nephrotoxicity",
    "effect": "Permanent hearing loss and kidney damage",
    "management": "Monitor renal function and audiometry",
    "evidence_level": "A",
    "sources": [
      "Oncology guidelines"
    ],
    "rxcui": [
      "2555",
      "4603"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "citalopram",
      "linezolid"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Potentially fatal serotonin toxicity",
    "management": "Discontinue SSRI before starting linezolid",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "2556",
      "104894"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a7ef6ad2-5f22-4ac7-b57a-f498bcb53be1",
        "title": "CITALOPRAM TABLET, FILM COATED [NORTHWIND HEALTH COMPANY, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a7ef6ad2-5f22-4ac7-b57a-f498bcb53be1",
        "matched": "linezolid",
        "snippet": "Intervention Citalopram is contraindicated in patients taking MAOIs, including MAOIs such as linezolid or intravenous methylene blue [see Dosage and Administration (2.5), Contraindications (4), Warnings and Precautions (5.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "citalopram",
      "metoprolol"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Enhanced beta-blockade",
    "management": "Monitor HR and BP",
    "evidence_level": "B",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "40492",
      "6918"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cladribine",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Lymphocyte depletion",
    "effect": "Severe infections",
    "management": "Avoid live vaccines for 4-6 months",
    "evidence_level": "A",
    "sources": [
      "MS treatment"
    ],
    "rxcui": [
      "2658",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e0b363cb-db83-44d6-89d0-1f7176be7459",
        "title": "CLADRIBINE TABLET [SANDOZ INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e0b363cb-db83-44d6-89d0-1f7176be7459",
        "matched": "live vaccines",
        "snippet": "Administer live-attenuated or live vaccines at least 4 to 6 weeks prior to starting cladribine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "clevidipine",
      "beta-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive negative inotropy",
    "effect": "Heart failure",
    "management": "Monitor cardiac function",
    "evidence_level": "B",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "636370",
      "7442"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a6826aa3-fabb-4ff1-a7a3-cd4c34e3a330",
        "title": "CLEVIPREX (CLEVIDIPINE) EMULSION [FRESENIUS KABI AUSTRIA GMBH]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a6826aa3-fabb-4ff1-a7a3-cd4c34e3a330",
        "matched": "beta-blockers",
        "snippet": "There is limited experience with short-duration therapy with beta-blockers as a treatment for Cleviprex-induced tachycardia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "clindamycin",
      "neuromuscular blockers"
    ],
    "severity": "major",
    "mechanism": "Enhanced neuromuscular blockade",
    "effect": "Prolonged paralysis",
    "management": "Monitor neuromuscular function",
    "evidence_level": "A",
    "sources": [
      "Anesthesiology literature"
    ],
    "rxcui": [
      "2582",
      "nmb"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "clopidogrel",
      "atorvastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 competitive inhibition",
    "effect": "Reduced clopidogrel effectiveness",
    "management": "Monitor for thrombotic events; consider pravastatin",
    "evidence_level": "B",
    "sources": [
      "Cardiology literature"
    ],
    "rxcui": [
      "32968",
      "83367"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "clopidogrel",
      "omeprazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C19 inhibition",
    "effect": "Reduced clopidogrel activation",
    "management": "Use pantoprazole instead",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "32968",
      "7646"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ab32a331-2cea-453b-bba1-5451d38edd73",
        "title": "CLOPIDOGREL BISULFATE TABLET [RISING PHARMA HOLDINGS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ab32a331-2cea-453b-bba1-5451d38edd73",
        "matched": "omeprazole",
        "snippet": "Omeprazole or E someprazole Avoid concomitant use of clopidogrel with omeprazole or esomeprazole.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "clopidogrel",
      "pantoprazole"
    ],
    "severity": "minor",
    "mechanism": "Minimal CYP2C19 inhibition",
    "effect": "Slight reduction in effect",
    "management": "Preferred PPI with clopidogrel",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "32968",
      "40790"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ab32a331-2cea-453b-bba1-5451d38edd73",
        "title": "CLOPIDOGREL BISULFATE TABLET [RISING PHARMA HOLDINGS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ab32a331-2cea-453b-bba1-5451d38edd73",
        "matched": "pantoprazole",
        "snippet": "Dexlansoprazole, lansoprazole, and pantoprazole had less effect on the antiplatelet activity of clopidogrel than did omeprazole or esomeprazole [see Warnings and Precautions (5.1) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "410d5577-e50a-44f3-aaa8-fbf391a0c261",
        "title": "PANTOPRAZOLE SODIUM TABLET, DELAYED RELEASE [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=410d5577-e50a-44f3-aaa8-fbf391a0c261",
        "matched": "clopidogrel",
        "snippet": "Clopidogrel Clinical Impact: Concomitant administration of pantoprazole and clopidogrel in healthy subjects had no clinically important effect on exposure to the active metabolite of clopidogrel or clopidogrel-induced platelet inhibition [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "clozapine",
      "ciprofloxacin"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition increases clozapine levels",
    "effect": "Increased risk of seizures and agranulocytosis",
    "management": "Monitor clozapine levels and CBC; reduce dose",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "2626",
      "2551"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "title": "VERSACLOZ (CLOZAPINE) SUSPENSION [TRUPHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "matched": "ciprofloxacin",
        "snippet": "DRUG INTERACTIONS Concomitant use of Strong CYP1A2 Inhibitors: Reduce VERSACLOZ dose to one third when coadministered with strong CYP1A2 inhibitors (e.g., fluvoxamine, ciprofloxacin, enoxacin) (2.8, 7.1).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "title": "CIPROFLOXACIN (CIPROFLOXACIN HYDROCHLORIDE) TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "matched": "clozapine",
        "snippet": "Clozapine Use with caution Careful monitoring of clozapine associated adverse reactions and appropriate adjustment of clozapine dosage during and shortly after co-administration with Ciprofloxacin are advised.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "clozapine",
      "fluvoxamine"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Clozapine toxicity",
    "management": "Reduce clozapine dose significantly",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "2626",
      "42355"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "title": "VERSACLOZ (CLOZAPINE) SUSPENSION [TRUPHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2592c9a8-fd74-4e0d-a895-b07b014cf355",
        "matched": "fluvoxamine",
        "snippet": "DRUG INTERACTIONS Concomitant use of Strong CYP1A2 Inhibitors: Reduce VERSACLOZ dose to one third when coadministered with strong CYP1A2 inhibitors (e.g., fluvoxamine, ciprofloxacin, enoxacin) (2.8, 7.1).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "49601858-df61-4522-ac99-0d2892f92e11",
        "title": "FLUVOXAMINE MALEATE CAPSULE, EXTENDED RELEASE [UPSHER-SMITH LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=49601858-df61-4522-ac99-0d2892f92e11",
        "matched": "clozapine",
        "snippet": "Clozapine: See Warnings and Precautions (5.9).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "codeine",
      "children"
    ],
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
    "drugs": [
      "codeine",
      "quinidine"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Reduced analgesia",
    "management": "Use alternative opioid",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "2670",
      "9068"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "title": "DEXTROMETHORPHAN HYDROBROMIDE AND QUINIDINE SULFATE CAPSULE [TEVA PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "matched": "codeine",
        "snippet": "In cases of prodrugs whose actions are mediated by the CYP2D6-produced metabolites (for example, codeine and hydrocodone, whose analgesic and antitussive effects appear to be mediated by morphine and hydromorphone, respectively), it may not be possible to achieve the desired clinical benefits in the presence of dextromethorphan hydrobromide and quinidine sulfate due to quinidine-mediated inhibition of CYP2D6.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "colchicine",
      "atorvastatin"
    ],
    "severity": "moderate",
    "mechanism": "Additive myopathy risk",
    "effect": "Myopathy and rhabdomyolysis",
    "management": "Monitor CK levels",
    "evidence_level": "B",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "2683",
      "83367"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dcf97364-b35f-4bc9-8a92-d3d2e05f47ac",
        "title": "COLCHICINE TABLET, FILM COATED [GRANULES PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dcf97364-b35f-4bc9-8a92-d3d2e05f47ac",
        "matched": "atorvastatin",
        "snippet": "Other Potentially Significant Drug Interactions Concomitant Drug Class or Food Noted or Anticipated Outcome Clinical Comment HMG-Co A Reductase Inhibitors: atorvastatin, fluvastatin, lovastatin, pravastatin, simvastatin Pharmacokinetic and/or pharmacodynamic interaction: the addition of one drug to a stable long-term regimen of the other has resulted in myopathy and rhabdomyolysis (including a fatality) Weigh the pot",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "title": "ATORVASTATIN CALCIUM TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4509aa67-06d4-41d1-80b6-c9bd8ad0bf07",
        "matched": "colchicine",
        "snippet": "Colchicine Clinical Impact: Cases of myopathy and rhabdomyolysis have been reported with concomitant use of colchicine with atorvastatin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "colchicine",
      "clarithromycin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 and P-glycoprotein inhibition",
    "effect": "Colchicine toxicity with organ failure",
    "management": "Reduce colchicine dose significantly or avoid",
    "evidence_level": "A",
    "sources": [
      "FDA warnings",
      "FDA"
    ],
    "rxcui": [
      "2683",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ee1583ac-c308-4beb-b602-9ecac4977026",
        "title": "COLCHICINE CAPSULE [HIKMA PHARMACEUTICALS USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ee1583ac-c308-4beb-b602-9ecac4977026",
        "matched": "clarithromycin",
        "snippet": "Fatal drug interactions have been reported when colchicine is administered with clarithromycin, a dual inhibitor of CYP3A4 and P-glycoprotein.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "colchicine",
        "snippet": "Fluconazole No Dose Adjustment F luconazole: [see Pharmacokinetics (12.3)] Anti-Gout Agents: Colchicine (in patients with renal or hepatic impairment) Colchicine (in patients with normal renal and hepatic function) Contraindicated Use With Caution C olchicine: Colchicine is a substrate for both CYP3A and the efflux transporter, P-glycoprotein (Pgp).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "colchicine",
      "cyclosporine"
    ],
    "severity": "major",
    "mechanism": "P-gp inhibition",
    "effect": "Colchicine toxicity",
    "management": "Monitor for myopathy and neuropathy",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "2683",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ee1583ac-c308-4beb-b602-9ecac4977026",
        "title": "COLCHICINE CAPSULE [HIKMA PHARMACEUTICALS USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ee1583ac-c308-4beb-b602-9ecac4977026",
        "matched": "cyclosporine",
        "snippet": "Toxicities have also been reported when colchicine is administered with inhibitors of CYP3A4 that may not be potent inhibitors of P-gp (e.g., grapefruit juice, erythromycin, verapamil), or inhibitors of P-gp that may not be potent inhibitors of CYP3A4 (e.g., cyclosporine).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "colchicine",
        "snippet": "nts Immunosuppressives Other Drugs ciprofloxacin melphalan amphotericin B azapropazon cimetidine tacrolimus fibric acidderivatives(e.g., bezafibrate, fenofibrate) methotrexate gentamicin ketoconazole colchicine ranitidine tobramycin diclofenac vancomycintrimethoprim withsulfamethoxazole naproxen sulindac During the concomitant use of a drug that may exhibit additive or synergistic renal impairment with cyclosporine,",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "colesevelam",
      "glimepiride"
    ],
    "severity": "moderate",
    "mechanism": "Reduced glimepiride absorption",
    "effect": "Decreased glycemic control",
    "management": "Give glimepiride 4 hours before colesevelam",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "203151",
      "25789"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ca9a9b7-5efd-09bf-e063-6294a90a681d",
        "title": "COLESEVELAM HYDROCHLORIDE TABLET, FILM COATED [BIONPHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ca9a9b7-5efd-09bf-e063-6294a90a681d",
        "matched": "glimepiride",
        "snippet": "DRUG INTERACTIONS Concomitant use with colesevelam hydrochloride may decrease the exposure of the following drugs:Drugs with a narrow therapeutic index (e.g., cyclosporine), phenytoin, thyroid hormone replacement therapy, warfarin, oral contraceptives containing ethinyl estradiol and norethindrone, olmesartan medoxomil, and sulfonylureas (glimepiride, glipizide, glyburide).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "61be3059-6400-4fe4-b4ac-b07344f1362f",
        "title": "GLIMEPIRIDE (GLIMEPIRIDE) TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=61be3059-6400-4fe4-b4ac-b07344f1362f",
        "matched": "colesevelam",
        "snippet": "Colesevelam: Coadministration may reduce glimepiride absorption.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "corticosteroids",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Immunosuppression increases infection risk",
    "effect": "Vaccine-induced infection",
    "management": "Contraindicated with high-dose steroids",
    "evidence_level": "A",
    "sources": [
      "CDC guidelines",
      "Immunology"
    ],
    "rxcui": [
      "8638",
      "live_vaccine"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "crizotinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Subtherapeutic levels",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "ALK inhibitors"
    ],
    "rxcui": [
      "1240131",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "cyclobenzaprine",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Serotonin toxicity",
    "management": "Avoid combination; use alternative muscle relaxant",
    "evidence_level": "B",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "2998",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3baeda95-d098-437a-b360-87a9c3f3fd9b",
        "title": "CYCLOBENZAPRINE HYDROCHLORIDE TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3baeda95-d098-437a-b360-87a9c3f3fd9b",
        "matched": "tramadol",
        "snippet": "Postmarketing cases of serotonin syndrome have been reported during combined use of Cyclobenzaprine Hydrochloride and other drugs, such as selective serotonin reuptake inhibitors (SSRIs), serotonin norepinephrine reuptake inhibitors (SNRIs), tricyclic antidepressants (TCAs), tramadol, bupropion, meperidine, verapamil, or monoamine oxidase (MAO) inhibitors.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "83367367-5654-4078-831a-69ade48bc795",
        "title": "TRAMADOL HYDROCHLORIDE TABLET, EXTENDED RELEASE [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=83367367-5654-4078-831a-69ade48bc795",
        "matched": "cyclobenzaprine",
        "snippet": "icyclic antidepressants (TCAs), triptans, 5-HT3 receptor antagonists, drugs that affect the serotonin neurotransmitter system (e.g., mirtazapine, trazodone, tramadol), certain muscle relaxants (i.e., cyclobenzaprine, metaxalone), monoamine oxidase (MAO) inhibitors (those intended to treat psychiatric disorders and also others, such as linezolid and intravenous methylene blue). Monoamine Oxidase Inhibitors (MAOIs) Cli",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cyclophosphamide",
      "allopurinol"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced bone marrow toxicity",
    "effect": "Increased myelosuppression",
    "management": "Monitor blood counts closely",
    "evidence_level": "B",
    "sources": [
      "Oncology literature"
    ],
    "rxcui": [
      "3002",
      "519"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5d330416-4289-762e-e063-6294a90a532e",
        "title": "ALLOPURINOL TABLET [AVPAK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5d330416-4289-762e-e063-6294a90a532e",
        "matched": "cyclophosphamide",
        "snippet": "Cyclophosphamide and Other Cytotoxic Agents Clinical Impact Concomitant use of allopurinol with cyclophosphamide and other cytotoxic agents (doxorubicin, bleomycin, procarbazine, mechloroethamine) increases bone marrow suppression among patients with neoplastic disease, except leukemia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cyclophosphamide",
      "succinylcholine"
    ],
    "severity": "moderate",
    "mechanism": "Prolonged blockade",
    "effect": "Extended paralysis",
    "management": "Monitor function",
    "evidence_level": "B",
    "sources": [
      "Literature"
    ],
    "rxcui": [
      "3002",
      "10206"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5bad5bfc-12c0-46a2-8355-1028f108ecbf",
        "title": "CYCLOPHOSPHAMIDE (CYCLOPHOSPHAMIDE FOR INJECTION) INJECTION, POWDER, FOR SOLUTION [HISUN PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5bad5bfc-12c0-46a2-8355-1028f108ecbf",
        "matched": "succinylcholine",
        "snippet": "Prolonged apnea may occur with concurrent depolarizing muscle relaxants (e.g., succinylcholine).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cyclosporine",
      "grapefruit juice"
    ],
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
    "drugs": [
      "cyclosporine",
      "simvastatin"
    ],
    "severity": "major",
    "mechanism": "Increased statin exposure via CYP3A4 inhibition",
    "effect": "Severe myopathy and rhabdomyolysis",
    "management": "Avoid combination; use pravastatin if statin needed",
    "evidence_level": "A",
    "sources": [
      "Transplant guidelines"
    ],
    "rxcui": [
      "3008",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "simvastatin",
        "snippet": "HMG-CoA reductase inhibitors (statins) Literature and postmarketing cases of myotoxicity, including muscle pain and weakness, myositis, and rhabdomyolysis, have been reported with concomitant administration of cyclosporine with lovastatin, simvastatin, atorvastatin, pravastatin, and, rarely fluvastatin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "cyclosporine",
        "snippet": "Cyclosporine, Danazol, or Gemfibrozil Clinical Impact: The risk of myopathy and rhabdomyolysis is increased with concomitant use of cyclosporine, danazol, or gemfibrozil with simvastatin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "cyclosporine",
      "uva therapy"
    ],
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
    "drugs": [
      "cyclosporine drops",
      "systemic immunosuppressants"
    ],
    "severity": "minor",
    "mechanism": "Minimal systemic absorption",
    "effect": "Generally well tolerated",
    "management": "Monitor for infections",
    "evidence_level": "C",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "283420",
      "3008"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "dabigatran",
      "dronedarone"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein inhibition increases dabigatran",
    "effect": "Increased bleeding risk",
    "management": "Reduce dabigatran dose or avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations",
      "Guidelines"
    ],
    "rxcui": [
      "1037042",
      "233698"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3a8ec82a-c367-40dc-9302-e1896fcb05ea",
        "title": "DABIGATRAN ETEXILATE CAPSULE, COATED PELLETS [ASCEND LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3a8ec82a-c367-40dc-9302-e1896fcb05ea",
        "matched": "dronedarone",
        "snippet": "In patients with moderate renal impairment (CrCl 30 to 50 mL/min), reduce the dosage of Dabigatran Etexilate Capsules to 75 mg twice daily when administered concomitantly with the P-gp inhibitors dronedarone or systemic ketoconazole.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3bd4006a-8bad-4909-ac6d-b6d84390155c",
        "title": "MULTAQ (DRONEDARONE) TABLET, FILM COATED [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3bd4006a-8bad-4909-ac6d-b6d84390155c",
        "matched": "dabigatran",
        "snippet": "Dabigatran Dronedarone increases dabigatran plasma exposures by inhibiting the P-gp transporter [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dabigatran",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein induction reduces dabigatran exposure",
    "effect": "Reduced anticoagulant efficacy",
    "management": "Avoid combination; use alternative anticoagulant",
    "evidence_level": "B",
    "sources": [
      "FDA label"
    ],
    "rxcui": [
      "1037042",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3a8ec82a-c367-40dc-9302-e1896fcb05ea",
        "title": "DABIGATRAN ETEXILATE CAPSULE, COATED PELLETS [ASCEND LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3a8ec82a-c367-40dc-9302-e1896fcb05ea",
        "matched": "rifampin",
        "snippet": "ommended (7) 7.1 Reduction of Risk of Stroke and Systemic Embolism in Non-valvular Atrial Fibrillation in Adult Patients The concomitant use of Dabigatran Etexilate Capsules with P-gp inducers (e.g., rifampin) reduces exposure to dabigatran and should generally be avoided [see Clinical Pharmacology (12.3)]. P-gp inhibition and impaired renal function are the major independent factors that result in increased exposure",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dantrolene",
      "malignant hyperthermia"
    ],
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
    "drugs": [
      "daprodustat",
      "strong cyp2c8 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C8 inhibition",
    "effect": "Increased daprodustat levels",
    "management": "Monitor for side effects",
    "evidence_level": "B",
    "sources": [
      "Clinical trials"
    ],
    "rxcui": [
      "2467373",
      "cyp2c8_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d82aa06e-5a33-4844-99b7-4701313455a4",
        "title": "JESDUVROQ (DAPRODUSTAT) TABLET, FILM COATED [GLAXOSMITHKLINE LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d82aa06e-5a33-4844-99b7-4701313455a4",
        "matched": "strong cyp2c8 inhibitors",
        "snippet": "CYP2C8 Inhibitors Concomitant administration of strong CYP2C8 inhibitors (e.g., gemfibrozil) with JESDUVROQ is contraindicated due to a marked increase in daprodustat exposure [see Contraindications (4), Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "daptomycin",
      "statins"
    ],
    "severity": "moderate",
    "mechanism": "Additive myopathy risk",
    "effect": "Increased CPK and muscle toxicity",
    "management": "Consider statin discontinuation during treatment",
    "evidence_level": "B",
    "sources": [
      "FDA label",
      "Guidelines"
    ],
    "rxcui": [
      "298824",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7ed4d986-2aa9-43cd-9a8a-fbd11cb5ecef",
        "title": "DAPTOMYCIN IN SODIUM CHLORIDE INJECTION, SOLUTION [BAXTER HEALTHCARE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7ed4d986-2aa9-43cd-9a8a-fbd11cb5ecef",
        "matched": "hmg-coa reductase inhibitor",
        "snippet": "aureus bacteremia/endocarditis trial, some patients who received prior or concomitant treatment with an HMG-CoA reductase inhibitor developed elevated CPK [see Adverse Reactions (6.1)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "darbepoetin",
      "hypertension"
    ],
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
    "drugs": [
      "darifenacin",
      "potent cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased darifenacin exposure",
    "management": "Do not exceed 7.5mg daily",
    "evidence_level": "A",
    "sources": [
      "Prescribing info"
    ],
    "rxcui": [
      "273251",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e84f1ae3-b9a2-4a15-a299-c75373891cc1",
        "title": "DARIFENACIN TABLET, EXTENDED RELEASE [TORRENT PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e84f1ae3-b9a2-4a15-a299-c75373891cc1",
        "matched": "potent cyp3a4 inhibitors",
        "snippet": "The daily dose of darifenacin extended-release tablets should not exceed 7.5 mg when co-administered with potent CYP3A4 inhibitors (for example, ketoconazole, itraconazole, ritonavir, nelfinavir, clarithromycin and nefazadone).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dasatinib",
      "antacids"
    ],
    "severity": "moderate",
    "mechanism": "Decreased dasatinib absorption",
    "effect": "Reduced therapeutic effect",
    "management": "Separate administration by 2 hours",
    "evidence_level": "B",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "939539",
      "704"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "76e1833c-e105-5a3d-0f01-1330d8cc7ae1",
        "title": "DASATINIB (DASATINIB) TABLET, FILM COATED DASATINIB (DASATINIB) TABLET, FILM COATED [BIOCON PHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=76e1833c-e105-5a3d-0f01-1330d8cc7ae1",
        "matched": "antacids",
        "snippet": "Antacids: Avoid simultaneous administration.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dasatinib",
      "proton pump inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Reduced solubility",
    "effect": "Decreased absorption",
    "management": "Separate by 12 hours",
    "evidence_level": "B",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "436077",
      "40790"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "76e1833c-e105-5a3d-0f01-1330d8cc7ae1",
        "title": "DASATINIB (DASATINIB) TABLET, FILM COATED DASATINIB (DASATINIB) TABLET, FILM COATED [BIOCON PHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=76e1833c-e105-5a3d-0f01-1330d8cc7ae1",
        "matched": "proton pump inhibitors",
        "snippet": "H2 Antagonists and Proton Pump Inhibitors: Avoid coadministration.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "delamanid",
      "albumin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced absorption",
    "effect": "Increased delamanid levels",
    "management": "Take with food",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1535469",
      "albumin"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "desflurane",
      "sympathetic stimulation"
    ],
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
    "drugs": [
      "desmopressin",
      "loop diuretics"
    ],
    "severity": "moderate",
    "mechanism": "Opposing effects on sodium",
    "effect": "Hyponatremia risk",
    "management": "Monitor electrolytes",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "3289",
      "4603"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "539d7da2-72b8-45f9-836c-4e3351dd488e",
        "title": "DESMOPRESSIN ACETATE INJECTION, SOLUTION [SUN PHARMACEUTICAL INDUSTRIES, INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=539d7da2-72b8-45f9-836c-4e3351dd488e",
        "matched": "loop diuretics",
        "snippet": "Concomitant use with loop diuretics [see Boxed Warning].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "desmopressin",
      "tricyclic antidepressants"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced antidiuretic effect",
    "effect": "Hyponatremia",
    "management": "Monitor sodium levels",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "3289",
      "321988"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "539d7da2-72b8-45f9-836c-4e3351dd488e",
        "title": "DESMOPRESSIN ACETATE INJECTION, SOLUTION [SUN PHARMACEUTICAL INDUSTRIES, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=539d7da2-72b8-45f9-836c-4e3351dd488e",
        "matched": "tricyclic antidepressants",
        "snippet": "ugs that may Increase Risk of Hyponatremia The concomitant administration of desmopressin acetate injection with other drugs that may increase the risk of water intoxication with hyponatremia, (e.g., tricyclic antidepressants, selective serotonin re-uptake inhibitors, chlorpromazine, opiate analgesics, thiazide diuretics, NSAIDs, lamotrigine, sulfonylureas, particularly chlorpropamide, oxybutynin and carbamazepine),",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "deutetrabenazine",
      "strong cyp2d6 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition",
    "effect": "QT prolongation",
    "management": "Reduce deutetrabenazine dose",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "1723304",
      "cyp2d6_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7ea3c60a-45c7-44cc-afc2-d87fa53993c0",
        "title": "AUSTEDO (DEUTETRABENAZINE) TABLET, COATED AUSTEDO (DEUTETRABENAZINE) KIT AUSTEDO XR (DEUTETRABENAZINE) TABLET, FILM COATED, EXTENDED RELEASE [TEVA NEUROSCIENCE,",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7ea3c60a-45c7-44cc-afc2-d87fa53993c0",
        "matched": "strong cyp2d6 inhibitors",
        "snippet": "DRUG INTERACTIONS Concomitant use of strong CYP2D6 inhibitors: Maximum recommended dose of AUSTEDO XR or AUSTEDO is 36 mg per day (2.3, 7.1) Alcohol or other sedating drugs: May have additive sedation and somnolence (7.5) 7.1 Strong CYP2D6 Inhibitors A reduction in AUSTEDO XR or AUSTEDO dose may be necessary when adding a strong CYP2D6 inhibitor in patients maintained on a stable dose of AUSTEDO XR or AUSTEDO.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dexamethasone",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction reduces contraceptive efficacy",
    "effect": "Risk of unintended pregnancy",
    "management": "Use additional contraceptive methods",
    "evidence_level": "B",
    "sources": [
      "Reproductive health guidelines"
    ],
    "rxcui": [
      "3264",
      "311"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "dexamethasone",
      "phenytoin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced steroid metabolism",
    "effect": "Reduced steroid efficacy",
    "management": "Monitor clinical response",
    "evidence_level": "B",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "3264",
      "8183"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "dexmedetomidine",
      "other sedatives"
    ],
    "severity": "moderate",
    "mechanism": "Additive sedation",
    "effect": "Prolonged sedation",
    "management": "Reduce doses of both",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "68139",
      "3322"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "dextroamphetamine",
      "maoi"
    ],
    "severity": "major",
    "mechanism": "Enhanced noradrenergic activity",
    "effect": "Hypertensive crisis",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "3289",
      "7531"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e1b21fd4-8d0b-4e54-a35d-8ad84a7caa78",
        "title": "MIXED SALTS OF A SINGLE-ENTITY AMPHETAMINE PRODUCT (DEXTROAMPHETAMINE SACCHARATE, AMPHETAMINE ASPARTATE MONOHYDRATE, DEXTROAMPHETAMINE SULFATE, AMPHETAMINE SULF",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e1b21fd4-8d0b-4e54-a35d-8ad84a7caa78",
        "matched": "maoi",
        "snippet": "Drugs Having Clinically Important Interactions with Amphetamines Table 3: Drugs Having Clinically Important Interactions with Amphetamines Monoamine Oxidase Inhibitors (MAOIs) Clinical Impact MAOI antidepressants slow amphetamine metabolism, increasing amphetamines effect on the release of norepinephrine and other monoamines from adrenergic nerve endings causing headaches and other signs of hypertensive crisi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dextromethorphan-bupropion",
      "maoi"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome",
    "effect": "Hyperthermia and death",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "2387983",
      "7531"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "diabetes meds",
      "bitter melon"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced glucose lowering",
    "effect": "Hypoglycemia",
    "management": "Monitor glucose",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "26554",
      "bitter_melon"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "diclofenac",
      "methotrexate"
    ],
    "severity": "major",
    "mechanism": "Reduced renal clearance",
    "effect": "MTX toxicity",
    "management": "Avoid combination or monitor closely",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "3355",
      "6851"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0379c918-1717-40ab-81cc-268116950fd5",
        "title": "DICLOFENAC SODIUM SOLUTION [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0379c918-1717-40ab-81cc-268116950fd5",
        "matched": "methotrexate",
        "snippet": "Methotrexate Clinical Impact: Concomitant use of NSAIDs and methotrexate may increase the risk for methotrexate toxicity (e.g., neutropenia, thrombocytopenia, renal dysfunction) Intervention: During concomitant use of diclofenac sodium and methotrexate, monitor patients for methotrexate toxicity.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "digoxin",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein inhibition increases digoxin levels",
    "effect": "Digoxin toxicity risk",
    "management": "Reduce digoxin dose by 50%; monitor levels closely",
    "evidence_level": "A",
    "sources": [
      "Cardiovascular pharmacology"
    ],
    "rxcui": [
      "3407",
      "703"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "amiodarone",
        "snippet": "Pharmacokinetic Drug Interactions Digoxin concentrations increased greater than 50% Digoxin Serum Concentration Increase Digoxin AUC Increase Recommendations Amiodarone 70% NA Measure serum digoxin concentrations before initiating concomitant drugs.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "digoxin",
        "snippet": "Negative Chronotropes digoxin, beta blockers, verapamil, diltiazem, clonidine, ivabradine Potentiates the electrophysiologic and hemodynamic effects of amiodarone, resulting in bradycardia, sinus arrest, and AV block.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "digoxin",
      "elderly"
    ],
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
    "drugs": [
      "digoxin",
      "ginseng"
    ],
    "severity": "moderate",
    "mechanism": "Variable effects",
    "effect": "Unpredictable levels",
    "management": "Monitor levels",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "3407",
      "206584"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "ginseng",
        "snippet": "Some traditional Chinese and Ayurvedic medicine substances like Chan Su, Siberian Ginseng, Asian Ginseng, Ashwagandha or Dashen can cause similar interference.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "digoxin",
      "high fiber foods"
    ],
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
    "drugs": [
      "digoxin",
      "quinidine"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein inhibition and displacement",
    "effect": "Severe digoxin toxicity in elderly",
    "management": "Reduce digoxin dose by 50%; monitor levels",
    "evidence_level": "A",
    "sources": [
      "Geriatric cardiology"
    ],
    "rxcui": [
      "3407",
      "9068"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "quinidine",
        "snippet": "Captopril 58% 39% Clarithromycin NA 70% Dronedarone NA 150% Gentamicin 129% to 212% NA Erythromycin 100% NA Itraconazole 80% NA Lapatinib NA 180% Propafenone NA 60% to 270% Quinidine 100% NA Ranolazine 50% NA Ritonavir NA 86% Telaprevir 50% 85% Tetracycline 100% NA Verapamil 50% to 75% NA Digoxin concentrations increased less than 50% Atorvastatin 22% 15% Measure serum digoxin concentrations before initiating concomi",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "title": "DEXTROMETHORPHAN HYDROBROMIDE AND QUINIDINE SULFATE CAPSULE [TEVA PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "matched": "digoxin",
        "snippet": "Digoxin: Increased digoxin substrate plasma concentration may occur.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "digoxin",
      "spironolactone"
    ],
    "severity": "moderate",
    "mechanism": "Assay interference",
    "effect": "False levels",
    "management": "Use specific assays",
    "evidence_level": "B",
    "sources": [
      "Laboratory"
    ],
    "rxcui": [
      "3407",
      "9997"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "spironolactone",
        "snippet": "lol 16% 14% Conivaptan 33% 43% Diltiazem 20% NA Indomethacin 40% NA Mirabegron 29% 27% Nefazodone 27% 15% Nifedipine 45% NA Propantheline 24% 24% Quinine NA 33% Rabeprazole 29% 19% Saquinavir 27% 49% Spironolactone 25% NA Telmisartan 20% to 49% NA Ticagrelor 31% 28% Tolvaptan 30% 20% Trimethoprim 22% to 28% NA Digoxin concentrations increased, but magnitude is unclear Alprazolam, azithromycin, cyclosporine, diclofena",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "768563dc-a619-44dc-b97f-1a7e71fd56a0",
        "title": "SPIRONOLACTONE TABLET [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=768563dc-a619-44dc-b97f-1a7e71fd56a0",
        "matched": "digoxin",
        "snippet": "Digoxin: Spironolactone can interfere with radioimmunologic assays of digoxin exposure (7.4).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "digoxin",
      "verapamil"
    ],
    "severity": "major",
    "mechanism": "P-gp inhibition",
    "effect": "Toxicity",
    "management": "Reduce dose 25%",
    "evidence_level": "A",
    "sources": [
      "Guidelines",
      "Cardiology references"
    ],
    "rxcui": [
      "3407",
      "11170"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "verapamil",
        "snippet": "icin 129% to 212% NA Erythromycin 100% NA Itraconazole 80% NA Lapatinib NA 180% Propafenone NA 60% to 270% Quinidine 100% NA Ranolazine 50% NA Ritonavir NA 86% Telaprevir 50% 85% Tetracycline 100% NA Verapamil 50% to 75% NA Digoxin concentrations increased less than 50% Atorvastatin 22% 15% Measure serum digoxin concentrations before initiating concomitant drugs. Reduce digoxin concentrations by decreasing the dose b",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "5467dad4-f3ba-4036-b5f4-4d2d4d5abc34",
        "title": "VERAPAMIL HYDROCHLORIDE TABLET, FILM COATED, EXTENDED RELEASE [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5467dad4-f3ba-4036-b5f4-4d2d4d5abc34",
        "matched": "digoxin",
        "snippet": "Digitalis: Clinical use of verapamil in digitalized patients has shown the combination to be well tolerated if digoxin doses are properly adjusted.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dihydroergotamine",
      "cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Ergot toxicity",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "3366",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b81397b0-910d-4eb4-8fee-a9a3c9d94d63",
        "title": "TRUDHESA (DIHYDROERGOTAMINE MESYLATE) SPRAY, METERED [IMPEL PHARMACEUTICALS LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b81397b0-910d-4eb4-8fee-a9a3c9d94d63",
        "matched": "cyp3a4 inhibitors",
        "snippet": "CYP3A4 Inhibitors There have been rare reports of serious adverse events in connection with the coadministration of intravenous administration of dihydroergotamine and strong CYP3A4 inhibitors, such as protease inhibitors (e.g., ritonavir, nelfinavir, indinavir), macrolide antibiotics (e.g., erythromycin, clarithromycin), and antifungals (e.g., ketoconazole, itraconazole), resulting in vasospasm that led to",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "diltiazem",
      "atorvastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Myopathy risk",
    "management": "Monitor CK levels",
    "evidence_level": "A",
    "sources": [
      "Cardiology",
      "Studies"
    ],
    "rxcui": [
      "3443",
      "83367"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "diltiazem",
      "metoprolol"
    ],
    "severity": "moderate",
    "mechanism": "Additive negative chronotropic effects",
    "effect": "Bradycardia and heart block risk",
    "management": "Monitor heart rate and conduction; dose reduction may be needed",
    "evidence_level": "B",
    "sources": [
      "Clinical experience"
    ],
    "rxcui": [
      "3443",
      "6918"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3ecff825-34ea-4535-b935-627bf2c13d93",
        "title": "METOPROLOL TARTRATE TABLET [ADVAGEN PHARMA LTD]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3ecff825-34ea-4535-b935-627bf2c13d93",
        "matched": "diltiazem",
        "snippet": "Concomitant use of glycosides, clonidine, and diltiazem and verapamil with beta-blockers can increase the risk of bradycardia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "diltiazem",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces diltiazem levels",
    "effect": "Loss of therapeutic effect",
    "management": "Monitor therapeutic response; increase dose as needed",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "3443",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2dc2b889-8443-4f7f-83be-86c68e179804",
        "title": "CARTIA XT (DILTIAZEM HYDROCHLORIDE) CAPSULE, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2dc2b889-8443-4f7f-83be-86c68e179804",
        "matched": "rifampin",
        "snippet": "Rifampin: Coadministration of rifampin with diltiazem lowered the diltiazem plasma concentrations to undetectable levels.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dimethyl fumarate",
      "live vaccines"
    ],
    "severity": "moderate",
    "mechanism": "Immunosuppression",
    "effect": "Reduced vaccine efficacy",
    "management": "Avoid live vaccines",
    "evidence_level": "B",
    "sources": [
      "MS guidelines"
    ],
    "rxcui": [
      "1146016",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "diphenhydramine",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Additive CNS depression",
    "effect": "Severe sedation and impairment",
    "management": "Avoid alcohol; warn patients about driving",
    "evidence_level": "A",
    "sources": [
      "Clinical guidelines"
    ],
    "rxcui": [
      "3498",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d9f650b5-3c27-17cf-e053-2995a90af48a",
        "title": "DIPHENHYDRAMINE HYDROCHLORIDE CAPSULE [WALGREEN COMPANY]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d9f650b5-3c27-17cf-e053-2995a90af48a",
        "matched": "alcohol",
        "snippet": "g due to an enlarged prostate gland Ask a doctor or pharmacist before use if you are taking sedatives or tranquilizers When using this product  marked drowsiness may occur  avoid alcoholic drinks  alcohol, sedatives and tranquilizers may increase drowsiness  use caution when driving a motor vehicle or operating machinery  excitability may occur, especially in children If pregnant or breast-feeding, ask a health",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dipyridamole",
      "adenosine"
    ],
    "severity": "major",
    "mechanism": "Enhanced adenosine effects",
    "effect": "Severe bradycardia and heart block",
    "management": "Reduce adenosine dose by 50%",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "3521",
      "60"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a6e652e1-b2e4-47ba-bed2-c5e902f8b8f1",
        "title": "ASPIRIN AND EXTENDED - RELEASE DIPYRIDAMOLE CAPSULES, 25 MG / 200 MG (ASPIRIN AND EXTENDED - RELEASE DIPYRIDAMOLE) CAPSULE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a6e652e1-b2e4-47ba-bed2-c5e902f8b8f1",
        "matched": "adenosine",
        "snippet": "DRUG INTERACTIONS • Co-administration with anticoagulants, antiplatelets, or NSAIDs can increase risk of bleeding (7.1) • Decreased renal function can occur with co-administration with NSAIDs (7.1) 7.1 Drug Interaction Study Information Obtained From Literature Adenosinergic agents (e.g., adenosine, regadenoson) Dipyridamole has been reported to increase the plasma levels and cardiovascular effects of adenosine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "9508caf5-0e3a-4d32-909d-bff7ea40ec30",
        "title": "ADENOSINE INJECTION [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9508caf5-0e3a-4d32-909d-bff7ea40ec30",
        "matched": "dipyridamole",
        "snippet": "Adenosine effects are potentiated by dipyridamole.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dobutamine",
      "beta-blockers"
    ],
    "severity": "major",
    "mechanism": "Pharmacologic antagonism",
    "effect": "Reduced inotropic effect",
    "management": "May need higher doses",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "3616",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "docetaxel",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases docetaxel exposure",
    "effect": "Severe neutropenia and toxicity",
    "management": "Avoid strong CYP3A4 inhibitors during treatment",
    "evidence_level": "B",
    "sources": [
      "FDA label"
    ],
    "rxcui": [
      "72962",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2fb017fd-e55e-43ef-9024-07f2d412b37b",
        "title": "DOCETAXEL (DOCETAXEL ANHYDROUS) INJECTION, SOLUTION [MYLAN INSTITUTIONAL LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2fb017fd-e55e-43ef-9024-07f2d412b37b",
        "matched": "ketoconazole",
        "snippet": "In vivo studies showed that the exposure of docetaxel increased 2.2-fold when it was coadministered with ketoconazole, a potent inhibitor of CYP3A4.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dofetilide",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "Renal tubular secretion inhibition",
    "effect": "Dofetilide toxicity",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "73274",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a10633a6-4518-4a87-a880-faaa33bdbec6",
        "title": "DOFETILIDE 0.125MG CAPSULE DOFETILIDE 0.25MG CAPSULE DOFETILIDE 0.5MG CAPSULE [GRANULES PHARMACEUTICALS INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a10633a6-4518-4a87-a880-faaa33bdbec6",
        "matched": "ketoconazole",
        "snippet": "The concomitant use of verapamil or the cation transport system inhibitors cimetidine, trimethoprim (alone or in combination with sulfamethoxazole), or ketoconazole with dofetilide is contraindicated (see WARNINGS and PRECAUTIONS, Drug-Drug Interactions), as each of these drugs cause a substantial increase in dofetilide plasma concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "doripenem",
      "valproic acid"
    ],
    "severity": "major",
    "mechanism": "VPA level reduction",
    "effect": "Breakthrough seizures",
    "management": "Consider alternative antibiotic",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "703103",
      "11118"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "doxorubicin",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Reduced clearance",
    "effect": "Toxicity",
    "management": "Monitor levels",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "3639",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "doxorubicin",
      "trastuzumab"
    ],
    "severity": "major",
    "mechanism": "Additive cardiotoxicity",
    "effect": "Cardiomyopathy and heart failure",
    "management": "Avoid concurrent use; monitor cardiac function",
    "evidence_level": "A",
    "sources": [
      "Cardio-oncology guidelines",
      "Cardio-oncology"
    ],
    "rxcui": [
      "3639",
      "224905"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "285d2142-5bfa-401c-9246-7de21c4451af",
        "title": "HERCESSI (TRASTUZUMAB-STRF) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION HERCESSI (TRASTUZUMAB-STRF) KIT [ACCORD BIOPHARMA INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=285d2142-5bfa-401c-9246-7de21c4451af",
        "matched": "doxorubicin",
        "snippet": "bAnthracycline (doxorubicin) and cyclophosphamide.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dronedarone",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "P-gp inhibition",
    "effect": "Increased digoxin levels",
    "management": "Reduce digoxin dose by 50%",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "233698",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3bd4006a-8bad-4909-ac6d-b6d84390155c",
        "title": "MULTAQ (DRONEDARONE) TABLET, FILM COATED [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3bd4006a-8bad-4909-ac6d-b6d84390155c",
        "matched": "digoxin",
        "snippet": "Digoxin: Consider discontinuation or halve dose of digoxin before treatment and monitor digoxin levels.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "dronedarone",
        "snippet": "Captopril 58% 39% Clarithromycin NA 70% Dronedarone NA 150% Gentamicin 129% to 212% NA Erythromycin 100% NA Itraconazole 80% NA Lapatinib NA 180% Propafenone NA 60% to 270% Quinidine 100% NA Ranolazine 50% NA Ritonavir NA 86% Telaprevir 50% 85% Tetracycline 100% NA Verapamil 50% to 75% NA Digoxin concentrations increased less than 50% Atorvastatin 22% 15% Measure serum digoxin concentrations before initiating concomi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "droperidol",
      "other qt drugs"
    ],
    "severity": "major",
    "mechanism": "QT prolongation",
    "effect": "Torsades de pointes",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "3781",
      "qt_drugs"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "dulaglutide",
      "warfarin"
    ],
    "severity": "minor",
    "mechanism": "Delayed gastric emptying",
    "effect": "Variable warfarin absorption",
    "management": "Monitor INR more frequently",
    "evidence_level": "C",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "1551291",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "463050bd-2b1c-40f5-b3c3-0a04bb433309",
        "title": "TRULICITY (DULAGLUTIDE) INJECTION, SOLUTION [ELI LILLY AND COMPANY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=463050bd-2b1c-40f5-b3c3-0a04bb433309",
        "matched": "warfarin",
        "snippet": "Monitor drug levels of oral medications with a narrow therapeutic index (e.g., warfarin) when concomitantly administered with TRULICITY.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "duloxetine",
      "thioridazine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition increases thioridazine levels",
    "effect": "QT prolongation and cardiac arrhythmias",
    "management": "Avoid combination; use alternative antipsychotic",
    "evidence_level": "A",
    "sources": [
      "FDA contraindication"
    ],
    "rxcui": [
      "72625",
      "10737"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "fb37745f-fb40-4f7f-8143-ea1874c38e1b",
        "title": "DULOXETINE CAPSULE, DELAYED RELEASE [ANI PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=fb37745f-fb40-4f7f-8143-ea1874c38e1b",
        "matched": "thioridazine",
        "snippet": "n patients with a history of seizure disorder (5.1) Blood pressure increases: Monitor blood pressure prior to initiating treatment and periodically throughout treatment (5.11) Inhibitors of CYP1A2 or Thioridazine: Avoid co-administration with duloxetine (5.12) Hyponatremia: Can occur in association with SIADH; consider discontinuation (5.13) Glucose Control in Diabetes: DPNP patients, increases in fasting blood gluco",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "duloxetine",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome",
    "effect": "Hyperthermia and rigidity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "39786",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "fb37745f-fb40-4f7f-8143-ea1874c38e1b",
        "title": "DULOXETINE CAPSULE, DELAYED RELEASE [ANI PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=fb37745f-fb40-4f7f-8143-ea1874c38e1b",
        "matched": "tramadol",
        "snippet": "The risk is increased with concomitant use of other serotonergic drugs (including triptans, tricyclic antidepressants, fentanyl, lithium, tramadol, meperidine, methadone, tryptophan, buspirone, amphetamines, and St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "dutasteride",
      "cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased dutasteride levels",
    "management": "Monitor for side effects",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "152923",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cf1cbcbf-f466-4caf-9ba1-2faccdc2a3cf",
        "title": "DUTASTERIDE CAPSULE, LIQUID FILLED [HUMANWELL PURACAP PHARMACEUTICAL (WUHAN), LTD.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cf1cbcbf-f466-4caf-9ba1-2faccdc2a3cf",
        "matched": "cyp3a4 inhibitors",
        "snippet": "The effect of potent CYP3A4 inhibitors on dutasteride has not been studied.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "duvelisib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased duvelisib exposure",
    "management": "Reduce duvelisib dose",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2103944",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e3c5ac56-e1f6-473a-bc73-687836534780",
        "title": "COPIKTRA (DUVELISIB) CAPSULE [SECURA BIO, INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e3c5ac56-e1f6-473a-bc73-687836534780",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "DRUG INTERACTIONS CYP3A4 inhibitors: Reduce COPIKTRA dose to 15 mg twice daily when co-administered with strong CYP3A4 inhibitors.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "echinacea",
      "immunosuppressants"
    ],
    "severity": "moderate",
    "mechanism": "Immune stimulation",
    "effect": "Counteraction",
    "management": "Avoid in transplant",
    "evidence_level": "C",
    "sources": [
      "Theoretical",
      "Transplant"
    ],
    "rxcui": [
      "258331",
      "42316"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "eculizumab",
      "meningococcal infection"
    ],
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
    "drugs": [
      "edoxaban",
      "phenytoin"
    ],
    "severity": "major",
    "mechanism": "P-glycoprotein induction reduces edoxaban levels",
    "effect": "Loss of anticoagulant protection",
    "management": "Avoid combination; use alternative anticoagulant",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "1549683",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "edoxaban",
        "snippet": "estrogens, furosemide, oral contraceptives, paroxetine, quinidine, rifampin, sertraline, theophylline, and vitamin D Drugs whose level is decreased by phenytoin Anticoagulants Apixaban, dabigatran, edoxaban, rivaroxaban Antiepileptic drugs The effect of phenytoin on phenobarbital, valproic acid and sodium valproate serum levels is unpredictable Carbamazepine, felbamate, lamotrigine, topiramate, oxcarbazepine, lacos",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "edoxaban",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "P-gp induction",
    "effect": "Reduced anticoagulation",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1549380",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e77d3400-56ad-11e3-949a-0800200c9a66",
        "title": "SAVAYSA (EDOXABAN TOSYLATE) TABLET, FILM COATED [DAIICHI SANKYO INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e77d3400-56ad-11e3-949a-0800200c9a66",
        "matched": "rifampin",
        "snippet": "Rifampin: Avoid concomitant use (7.2) 7.1 Anticoagulants, Antiplatelets, Thrombolytics, and SSRIs/SNRIs Co-administration of anticoagulants, antiplatelet drugs, thrombolytics and SSRIs or SNRIs may increase the risk of bleeding.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "efavirenz",
      "voriconazole"
    ],
    "severity": "major",
    "mechanism": "CYP2C19 induction reduces voriconazole levels",
    "effect": "Antifungal treatment failure",
    "management": "Avoid combination; use alternative antifungal",
    "evidence_level": "A",
    "sources": [
      "HIV/opportunistic infection guidelines"
    ],
    "rxcui": [
      "195085",
      "121243"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ec61f069-632e-4628-b9b1-701d381a1a06",
        "title": "EFAVIRENZ, EMTRICITABINE AND TENOFOVIR DISOPROXIL FUMARATE TABLET, FILM COATED [BRYANT RANCH PREPACK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ec61f069-632e-4628-b9b1-701d381a1a06",
        "matched": "voriconazole",
        "snippet": "voriconazole ↓ voriconazole­ ↑ efavirenz Coadministration of efavirenz, emtricitabine and tenofovir disoproxil fumarate with voriconazole is contraindicated [see Contraindications (4)] because it may lead to reduced therapeutic effect of voriconazole and increased risk of EFV-associated adverse reactions Anti-infective: clarithromycin ↓ clarithromycin ↑ 14-OH metabolite Consider alternatives to macrolide antibiotics",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "c620b2d7-3c2b-4252-8cfc-2f322d624435",
        "title": "VORICONAZOLE TABLET, FILM COATED [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c620b2d7-3c2b-4252-8cfc-2f322d624435",
        "matched": "efavirenz",
        "snippet": "ma Exposure (C max and AUC τ after 200 mg every 12 hours) Recommendations for Voriconazole Dosage Adjustment/Comments Rifampin* and Rifabutin* (CYP450 Induction) Significantly Reduced Contraindicated Efavirenz (400 mg every 24 hours)** (CYP450 Induction) Efavirenz (300 mg every 24 hours)** (CYP450 Induction) Significantly Reduced Slight Decrease in AUCτ Contraindicated When voriconazole is coadministered with efavire",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "elranatamab",
      "immunosuppressants"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced immunosuppression",
    "effect": "Increased infection risk",
    "management": "Monitor for infections",
    "evidence_level": "B",
    "sources": [
      "Multiple myeloma"
    ],
    "rxcui": [
      "elranatamab",
      "immunosuppressants"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "eluxadoline",
      "opioids"
    ],
    "severity": "moderate",
    "mechanism": "Additive constipating effects",
    "effect": "Severe constipation",
    "management": "Monitor bowel function",
    "evidence_level": "B",
    "sources": [
      "Gastroenterology"
    ],
    "rxcui": [
      "1716220",
      "7052"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7821bd40-4c84-4984-951b-6436ae20421a",
        "title": "VIBERZI (ELUXADOLINE) TABLET, FILM COATED [ALLERGAN, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7821bd40-4c84-4984-951b-6436ae20421a",
        "matched": "opioids",
        "snippet": "Examples: alosetron, anticholinergics, opioids Table 3: Established and Other Potentially Clinically Relevant Interactions Affecting Drugs Co-Administered with VIBERZI OATP1B1 and BCRP Substrate Clinical Impact: VIBERZI may increase the exposure of co-administered OATP1B1 and BCRP substrates.Increased exposure to rosuvastatin when co-administered with VIBERZI with a potential for increased risk of myopathy/rhabdomyol",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "emapalumab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "IFN-γ neutralization",
    "effect": "Severe infections",
    "management": "Avoid live vaccines",
    "evidence_level": "A",
    "sources": [
      "Immunology"
    ],
    "rxcui": [
      "2103185",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a865e0ef-8685-4f69-8838-648c4f3bab47",
        "title": "GAMIFANT (EMAPALUMAB-LZSG) INJECTION [SWEDISH ORPHAN BIOVITRUM AB (PUBL)]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a865e0ef-8685-4f69-8838-648c4f3bab47",
        "matched": "live vaccines",
        "snippet": "Live Vaccines: Do not administer live or live attenuated vaccines to patients receiving GAMIFANT.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "empagliflozin",
      "lithium"
    ],
    "severity": "moderate",
    "mechanism": "Volume depletion",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "1545653",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0fdd0255-0055-65f3-b2c0-db8fbb87beae",
        "title": "SYNJARDY (EMPAGLIFLOZIN AND METFORMIN HYDROCHLORIDE) TABLET [BOEHRINGER INGELHEIM PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0fdd0255-0055-65f3-b2c0-db8fbb87beae",
        "matched": "lithium",
        "snippet": "Lithium Clinical Impact Concomitant use of an SGLT2 inhibitor with lithium may decrease serum lithium concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "enalapril",
      "lithium"
    ],
    "severity": "major",
    "mechanism": "Reduced lithium clearance",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels closely",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "3827",
      "6448"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "enalapril",
      "spironolactone"
    ],
    "severity": "moderate",
    "mechanism": "Additive hyperkalemic effects",
    "effect": "Hyperkalemia risk",
    "management": "Monitor serum potassium regularly",
    "evidence_level": "A",
    "sources": [
      "Nephrology guidelines",
      "Guidelines"
    ],
    "rxcui": [
      "3827",
      "9997"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "enoxaparin",
      "aspirin"
    ],
    "severity": "moderate",
    "mechanism": "Additive anticoagulant effects",
    "effect": "Increased bleeding risk",
    "management": "Monitor for bleeding signs; use with caution",
    "evidence_level": "A",
    "sources": [
      "Anticoagulation guidelines"
    ],
    "rxcui": [
      "67108",
      "1191"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "entrectinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Entrectinib accumulation",
    "management": "Reduce entrectinib dose",
    "evidence_level": "A",
    "sources": [
      "NTRK inhibitors"
    ],
    "rxcui": [
      "2179555",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "epinephrine",
      "beta-blockers"
    ],
    "severity": "major",
    "mechanism": "Unopposed alpha effects",
    "effect": "Paradoxical hypertension",
    "management": "Use glucagon for beta-blocker overdose",
    "evidence_level": "A",
    "sources": [
      "Emergency medicine"
    ],
    "rxcui": [
      "3992",
      "7442"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "67578b56-7540-487e-1fba-481255620e78",
        "title": "MARCAINE (BUPIVACAINE HYDROCHLORIDE) INJECTION, SOLUTION MARCAINE WITH EPINEPHRINE (BUPIVACAINE HYDROCHLORIDE AND EPINEPHRINE BITARTRATE) INJECTION, SOLUTION [H",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=67578b56-7540-487e-1fba-481255620e78",
        "matched": "beta-blockers",
        "snippet": "Patients on beta-blockers may not manifest changes in heart rate, but blood pressure monitoring can detect a transient rise in systolic blood pressure.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "epoetin alfa",
      "iron deficiency"
    ],
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
    "drugs": [
      "eptifibatide",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Severe hemorrhage",
    "management": "Avoid combination; use in specialized settings only",
    "evidence_level": "A",
    "sources": [
      "Interventional cardiology"
    ],
    "rxcui": [
      "149331",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "erdafitinib",
      "strong cyp2c9 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 induction",
    "effect": "Reduced erdafitinib exposure",
    "management": "Increase dose if tolerated",
    "evidence_level": "B",
    "sources": [
      "Bladder cancer"
    ],
    "rxcui": [
      "2103156",
      "cyp2c9_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ergotamine",
      "triptans"
    ],
    "severity": "major",
    "mechanism": "Additive vasoconstriction",
    "effect": "Coronary artery spasm",
    "management": "Avoid within 24 hours",
    "evidence_level": "A",
    "sources": [
      "Headache medicine"
    ],
    "rxcui": [
      "4024",
      "10379"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "erlotinib",
      "proton pump inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Reduced gastric acidity",
    "effect": "Decreased erlotinib absorption",
    "management": "Separate administration",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "353181",
      "40790"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a3b2d622-b4d5-4819-862b-f8fd3adcec6f",
        "title": "ERLOTINIB (ERLOTINIB) TABLET, FILM COATED [CAMBER PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a3b2d622-b4d5-4819-862b-f8fd3adcec6f",
        "matched": "proton pump inhibitors",
        "snippet": "Drugs the Increase Gastric pH Co-administration of erlotinib with proton pump inhibitors (e.g., omeprazole) and H-2 receptor antagonists (e.g., ranitidine) decreased erlotinib exposure [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "erlotinib",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces erlotinib levels",
    "effect": "Loss of therapeutic efficacy",
    "management": "Increase erlotinib dose or avoid rifampin",
    "evidence_level": "A",
    "sources": [
      "Oncology guidelines"
    ],
    "rxcui": [
      "358263",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a3b2d622-b4d5-4819-862b-f8fd3adcec6f",
        "title": "ERLOTINIB (ERLOTINIB) TABLET, FILM COATED [CAMBER PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a3b2d622-b4d5-4819-862b-f8fd3adcec6f",
        "matched": "rifampin",
        "snippet": "Increase the erlotinib dosage if co-administration with CYP3A4 inducers (e.g., carbamazepine, phenytoin, rifampin, rifabutin, rifapentine, phenobarbital and St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ertapenem",
      "valproic acid"
    ],
    "severity": "major",
    "mechanism": "Decreased VPA levels",
    "effect": "Loss of seizure control",
    "management": "Monitor and adjust VPA dose",
    "evidence_level": "A",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "324022",
      "11118"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5b050245-aa03-4e28-e063-6394a90aeabc",
        "title": "ERTAPENEM (ERTAPENEM SODIUM) INJECTION [APOTEX CORP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5b050245-aa03-4e28-e063-6394a90aeabc",
        "matched": "valproic acid",
        "snippet": "The concomitant use of ertapenem and valproic acid/divalproex sodium is generally not recommended.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "title": "VALPROIC ACID CAPSULE, LIQUID FILLED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "matched": "ertapenem",
        "snippet": "Carbapenem Antibiotics A clinically significant reduction in serum valproic acid concentration has been reported in patients receiving carbapenem antibiotics (for example, ertapenem, imipenem, meropenem; this is not a complete list) and may result in loss of seizure control.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ertugliflozin",
      "simvastatin"
    ],
    "severity": "minor",
    "mechanism": "No significant interaction",
    "effect": "Safe combination",
    "management": "No dose adjustment",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1992672",
      "36567"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "erythromycin",
      "digoxin"
    ],
    "severity": "major",
    "mechanism": "P-gp inhibition",
    "effect": "Toxicity",
    "management": "Monitor levels",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "4053",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "erythromycin",
        "snippet": "Captopril 58% 39% Clarithromycin NA 70% Dronedarone NA 150% Gentamicin 129% to 212% NA Erythromycin 100% NA Itraconazole 80% NA Lapatinib NA 180% Propafenone NA 60% to 270% Quinidine 100% NA Ranolazine 50% NA Ritonavir NA 86% Telaprevir 50% 85% Tetracycline 100% NA Verapamil 50% to 75% NA Digoxin concentrations increased less than 50% Atorvastatin 22% 15% Measure serum digoxin concentrations before initiating concomi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "erythromycin",
      "terfenadine"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases terfenadine levels",
    "effect": "Cardiac arrhythmias and death",
    "management": "Absolute contraindication - terfenadine withdrawn",
    "evidence_level": "A",
    "sources": [
      "Historical FDA warning"
    ],
    "rxcui": [
      "4053",
      "terfenadine"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "escitalopram",
      "pimozide"
    ],
    "severity": "major",
    "mechanism": "Additive QT prolongation",
    "effect": "Torsades de pointes risk",
    "management": "Absolute contraindication",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning"
    ],
    "rxcui": [
      "321988",
      "8331"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "76a8aedd-7853-4d3f-9a00-f8222f55bea8",
        "title": "ESCITALOPRAM TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=76a8aedd-7853-4d3f-9a00-f8222f55bea8",
        "matched": "pimozide",
        "snippet": "Pimozide Clinical Impact: Concomitant use of racemic citalopram with pimozide increases plasma concentrations of pimozide, a drug with a narrow therapeutic index, and may increase the risk of QT prolongation and/or ventricular arrhythmias compared to use of racemic citalopram alone [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "esketamine",
      "cns depressants"
    ],
    "severity": "moderate",
    "mechanism": "Additive sedation",
    "effect": "Respiratory depression",
    "management": "Monitor respiratory status",
    "evidence_level": "A",
    "sources": [
      "Clinical trials"
    ],
    "rxcui": [
      "2103192",
      "cns_depressants"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d81a6a79-a74a-44b7-822c-0dfa3036eaed",
        "title": "SPRAVATO (ESKETAMINE HYDROCHLORIDE) SOLUTION [JANSSEN PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d81a6a79-a74a-44b7-822c-0dfa3036eaed",
        "matched": "cns depressants",
        "snippet": "DRUG INTERACTIONS 7.1 Central Nervous System Depressants Concomitant use with CNS depressants (e.g., benzodiazepines, opioids, alcohol) may increase sedation [see Warnings and Precautions (5.1)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "eslicarbazepine",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "Enzyme induction",
    "effect": "Contraceptive failure",
    "management": "Use additional contraception",
    "evidence_level": "A",
    "sources": [
      "Epilepsy"
    ],
    "rxcui": [
      "1115573",
      "9072"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "22f29752-614f-caaf-b595-9deae8a3e3ff",
        "title": "ESLICARBAZEPINE ACETATE TABLET [APOTEX CORP.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=22f29752-614f-caaf-b595-9deae8a3e3ff",
        "matched": "oral contraceptives",
        "snippet": "Oral Contraceptives Because concomitant use of eslicarbazepine acetate and ethinylestradiol and levonorgestrel is associated with lower plasma levels of these hormones, females of reproductive potential should use additional or alternative non-hormonal birth control.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "esmolol",
      "calcium channel blockers"
    ],
    "severity": "major",
    "mechanism": "Additive negative effects",
    "effect": "Asystole",
    "management": "Monitor cardiac rhythm",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "33624",
      "18867"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "eszopiclone",
      "fluoxetine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased eszopiclone exposure",
    "management": "Consider dose reduction",
    "evidence_level": "B",
    "sources": [
      "Manufacturer data"
    ],
    "rxcui": [
      "616240",
      "4493"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "etanercept",
      "anakinra"
    ],
    "severity": "major",
    "mechanism": "Additive immunosuppression",
    "effect": "Severe infections",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "128689",
      "353061"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a002b40c-097d-47a5-957f-7a7b1807af7f",
        "title": "ENBREL (ETANERCEPT) KIT ENBREL (ETANERCEPT) SOLUTION [IMMUNEX CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a002b40c-097d-47a5-957f-7a7b1807af7f",
        "matched": "anakinra",
        "snippet": "Live vaccines – Avoid concurrent administration with Enbrel (5.8, 7.1) Anakinra – Increased risk of serious infection (5.12, 7.2) Abatacept – Increased risk of serious adverse events, including infections (5.12, 7.2) Cyclophosphamide – Not recommended for use with Enbrel.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d9d74915-6606-4570-9c52-c4001d3177de",
        "title": "KINERET (ANAKINRA) INJECTION, SOLUTION [SWEDISH ORPHAN BIOVITRUM AB (PUBL)]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d9d74915-6606-4570-9c52-c4001d3177de",
        "matched": "etanercept",
        "snippet": "A higher rate of serious infections has been observed in RA patients treated with concurrent KINERET and etanercept therapy than in patients treated with etanercept alone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "etomidate",
      "adrenal insufficiency"
    ],
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
    "drugs": [
      "etomidate",
      "adrenal suppression"
    ],
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
    "drugs": [
      "everolimus",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Immunosuppression",
    "effect": "Vaccine-induced infection",
    "management": "Avoid live vaccines",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "141704",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "43ef3c29-0e25-4fdd-aea1-06a20af9bbab",
        "title": "EVEROLIMUS TABLET [AUROBINDO PHARMA LIMITED]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=43ef3c29-0e25-4fdd-aea1-06a20af9bbab",
        "matched": "live vaccines",
        "snippet": "hematologic changes or symptoms (5.15) New Onset Diabetes After Transplantation: Monitor serum glucose (5.16) Male Infertility: Azoospermia or oligospermia may occur (5.18, 13.1) Immunizations: Avoid live vaccines (5.19) Embryo-Fetal Toxicity: Advise females of reproductive potential of the potential risk to a fetus and to use effective contraception during treatment with everolimus and for 8 weeks after final dose (",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "exenatide",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Delayed gastric emptying",
    "effect": "Altered warfarin absorption",
    "management": "Monitor INR",
    "evidence_level": "C",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "60548",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e6cb5c8f-e97f-4a6a-95a4-939fd2393949",
        "title": "EXENATIDE INJECTION [AMNEAL PHARMACEUTICALS LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e6cb5c8f-e97f-4a6a-95a4-939fd2393949",
        "matched": "warfarin",
        "snippet": "Warfarin Clinical Impact In a drug interaction study, exenatide did not have a significant effect on INR [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ezetimibe",
      "fibrates"
    ],
    "severity": "moderate",
    "mechanism": "Additive risk of cholelithiasis",
    "effect": "Gallstone formation",
    "management": "Monitor for biliary symptoms",
    "evidence_level": "B",
    "sources": [
      "Lipid guidelines"
    ],
    "rxcui": [
      "341248",
      "25025"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c37c695b-fb40-423c-9b73-d1aa58a34db9",
        "title": "EZETIMIBE TABLET [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c37c695b-fb40-423c-9b73-d1aa58a34db9",
        "matched": "fibrates",
        "snippet": "Fibrates Clinical Impact: Both fenofibrate and ezetimibe may increase cholesterol excretion into the bile, leading to cholelithiasis.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "famotidine",
      "atazanavir"
    ],
    "severity": "major",
    "mechanism": "Reduced atazanavir absorption",
    "effect": "HIV treatment failure",
    "management": "Give atazanavir 2h before or 10h after famotidine",
    "evidence_level": "A",
    "sources": [
      "HIV guidelines"
    ],
    "rxcui": [
      "4278",
      "249617"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "55730918-d9e8-eaad-e063-6394a90aeda2",
        "title": "FAMOTIDINE TABLET, FILM COATED [REDPHARM DRUG]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=55730918-d9e8-eaad-e063-6394a90aeda2",
        "matched": "atazanavir",
        "snippet": "See the prescribing information for other drugs dependent on gastric pH for absorption for administration instructions, including atazanavir, erlotinib, ketoconazole, itraconazole, ledipasvir/sofosbuvir, nilotinib, and rilpivirine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "7fbea274-d6b5-4faa-bbf0-05fefab42114",
        "title": "ATAZANAVIR SULFATE (ATAZANAVIR) CAPSULE [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7fbea274-d6b5-4faa-bbf0-05fefab42114",
        "matched": "famotidine",
        "snippet": "An H2RA dose comparable to famotidine 20 mg once daily up to a dose comparable to famotidine 40 mg twice daily can be used with atazanavir 300 mg with ritonavir 100 mg in treatment-naive patients.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "favipiravir",
      "repaglinide"
    ],
    "severity": "moderate",
    "mechanism": "Aldehyde oxidase inhibition",
    "effect": "Prolonged hypoglycemia",
    "management": "Monitor glucose closely",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1567226",
      "73044"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "febuxostat",
      "azathioprine"
    ],
    "severity": "major",
    "mechanism": "Xanthine oxidase inhibition",
    "effect": "Azathioprine toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "73274",
      "1256"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f2c338dc-5bab-49f4-a4ac-d8dea8afeea5",
        "title": "FEBUXOSTAT TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f2c338dc-5bab-49f4-a4ac-d8dea8afeea5",
        "matched": "azathioprine",
        "snippet": "DRUG INTERACTIONS Concomitant administration of febuxostat with XO substrate drugs, azathioprine or mercaptopurine could increase plasma concentrations of these drugs resulting in severe toxicity.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "ceab8e8b-d022-4d0c-a552-cc5782446248",
        "title": "AZATHIOPRINE TABLET [GLENMARK PHARMACEUTICALS, INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ceab8e8b-d022-4d0c-a552-cc5782446248",
        "matched": "febuxostat",
        "snippet": "rug Interactions: Use with xanthine oxidase (XO) inhibitors: One of the pathways for inactivation of azathioprine is inhibited by XO inhibitors (allopurinol or febuxostat).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fedratinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Fedratinib toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2103156",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f0f55a2a-4e0c-4cba-8571-03e1424486d7",
        "title": "INREBIC (FEDRATINIB HYDROCHLORIDE) CAPSULE [CELGENE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f0f55a2a-4e0c-4cba-8571-03e1424486d7",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "DRUG INTERACTIONS • Strong CYP3A4 Inhibitors: Reduce INREBIC dose as recommended (2.3, 7.1).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "felodipine",
      "grapefruit juice"
    ],
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
    "drugs": [
      "fenfluramine",
      "stiripentol"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Fenfluramine toxicity",
    "management": "Reduce fenfluramine dose",
    "evidence_level": "B",
    "sources": [
      "Dravet syndrome"
    ],
    "rxcui": [
      "2045526",
      "127373"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e88f360e-33ad-4cd6-b2de-5ef885857c5d",
        "title": "FINTEPLA (FENFLURAMINE) SOLUTION [UCB, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e88f360e-33ad-4cd6-b2de-5ef885857c5d",
        "matched": "stiripentol",
        "snippet": "DRUG INTERACTIONS Dose adjustment is required for patients taking stiripentol plus clobazam.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fentanyl",
      "azole antifungals"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Severe respiratory depression",
    "management": "Reduce fentanyl dose significantly",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "4337",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bfa8018a-4cbc-434b-e09e-782872b0340a",
        "title": "FENTANYL CITRATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bfa8018a-4cbc-434b-e09e-782872b0340a",
        "matched": "azole",
        "snippet": "Examples: Macrolide antibiotics (e.g., erythromycin), azole-antifungal agents (e.g., ketoconazole), protease inhibitors (e.g., ritonavir), grapefruit juice.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fentanyl",
      "benzodiazepines"
    ],
    "severity": "major",
    "mechanism": "Respiratory depression",
    "effect": "Fatal depression",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "4337",
      "1372"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bfa8018a-4cbc-434b-e09e-782872b0340a",
        "title": "FENTANYL CITRATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bfa8018a-4cbc-434b-e09e-782872b0340a",
        "matched": "benzodiazepines",
        "snippet": "Examples: Rifampin, carbamazepine, phenytoin Benzodiazepines and Other Central Nervous System (CNS) Depressants Clinical Impact: The concomitant use of Fentanyl Citrate Injection with CNS depressants may result in decreased pulmonary artery pressure and may cause hypotension.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fentanyl",
      "clarithromycin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases fentanyl levels",
    "effect": "Risk of fatal respiratory depression",
    "management": "Avoid combination; consider alternative antibiotic",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "4337",
      "21212"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "fentanyl",
      "rifampin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces fentanyl exposure",
    "effect": "Loss of analgesic efficacy",
    "management": "Avoid rifampin or increase fentanyl dose significantly",
    "evidence_level": "B",
    "sources": [
      "Anesthesiology studies"
    ],
    "rxcui": [
      "4337",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bfa8018a-4cbc-434b-e09e-782872b0340a",
        "title": "FENTANYL CITRATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bfa8018a-4cbc-434b-e09e-782872b0340a",
        "matched": "rifampin",
        "snippet": "Examples: Rifampin, carbamazepine, phenytoin Benzodiazepines and Other Central Nervous System (CNS) Depressants Clinical Impact: The concomitant use of Fentanyl Citrate Injection with CNS depressants may result in decreased pulmonary artery pressure and may cause hypotension.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ferric gluconate",
      "oral medications"
    ],
    "severity": "minor",
    "mechanism": "No significant oral interactions",
    "effect": "Generally safe",
    "management": "Standard monitoring",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "885",
      "oral_medications"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "fexofenadine",
      "apple juice"
    ],
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
    "drugs": [
      "finasteride",
      "alpha-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypotensive effects",
    "effect": "Orthostatic hypotension",
    "management": "Monitor BP when initiating",
    "evidence_level": "B",
    "sources": [
      "Urology"
    ],
    "rxcui": [
      "4531",
      "229"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "fingolimod",
      "class ia antiarrhythmics"
    ],
    "severity": "major",
    "mechanism": "Additive cardiac effects",
    "effect": "Heart block",
    "management": "Monitor cardiac function",
    "evidence_level": "A",
    "sources": [
      "MS treatment"
    ],
    "rxcui": [
      "1102261",
      "9068"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "flecainide",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition increases flecainide levels",
    "effect": "Proarrhythmic effects",
    "management": "Reduce flecainide dose by 50%; monitor levels",
    "evidence_level": "A",
    "sources": [
      "Electrophysiology guidelines"
    ],
    "rxcui": [
      "4441",
      "703"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "flecainide",
        "snippet": "Antiarrhythmics quinidine, procainamide, flecainide Reserve concomitant use for patients who are unresponsive to a single agent.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "flecainide",
      "ritonavir"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Flecainide toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "HIV cardiology"
    ],
    "rxcui": [
      "4316",
      "83939"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "11f757f1-cf48-47a8-925e-918359cbd2d4",
        "title": "RITONAVIR TABLET, FILM COATED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=11f757f1-cf48-47a8-925e-918359cbd2d4",
        "matched": "flecainide",
        "snippet": "Antiarrhythmics: amiodarone, dronedarone, flecainide, propafenone, quinidine ↑ antiarrhythmics Contraindicated due to potential for cardiac arrhythmias [see Contraindications (4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fluconazole",
      "phenytoin"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition increases phenytoin levels",
    "effect": "Phenytoin toxicity with ataxia",
    "management": "Monitor phenytoin levels; reduce dose",
    "evidence_level": "A",
    "sources": [
      "Clinical studies",
      "Studies"
    ],
    "rxcui": [
      "4450",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "98ac5455-d26c-4780-a5a3-bf8d85917626",
        "title": "FLUCONAZOLE TABLET [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=98ac5455-d26c-4780-a5a3-bf8d85917626",
        "matched": "phenytoin",
        "snippet": "Phenytoin: Phenytoin AUC was determined after 4 days of phenytoin dosing (200 mg daily, orally for 3 days followed by 250 mg intravenously for one dose) both with and without the administration of fluconazole (oral fluconazole 200 mg daily for 16 days) in 10 normal male volunteers.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "fluconazole",
        "snippet": "t Affect Phenytoin Concentrations Interacting Agent Examples Drugs that may increase phenytoin serum levels Antiepileptic drugs Ethosuximide, felbamate, oxcarbazepine, methsuximide, topiramate Azoles Fluconazole, ketoconazole, itraconazole, miconazole, voriconazole Antineoplastic agents Capecitabine, fluorouracil Antidepressants Fluoxetine, fluvoxamine, sertraline Gastric acid reducing agents H 2antagonists (cimetidi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fludrocortisone",
      "amphotericin"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypokalemia",
    "effect": "Severe potassium depletion",
    "management": "Monitor potassium closely",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "4416",
      "698"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "933e28ef-05e8-419e-a786-21eab67f33a2",
        "title": "FLUDROCORTISONE ACETATE TABLET [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=933e28ef-05e8-419e-a786-21eab67f33a2",
        "matched": "amphotericin",
        "snippet": "Amphotericin B or potassium-depleting diuretics (benzothiadiazines and related drugs, ethacrynic acid and furosemide)—enhanced hypokalemia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fludrocortisone",
      "phenytoin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced metabolism",
    "effect": "Loss of mineralocorticoid effect",
    "management": "Monitor electrolytes and BP",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "4416",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "933e28ef-05e8-419e-a786-21eab67f33a2",
        "title": "FLUDROCORTISONE ACETATE TABLET [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=933e28ef-05e8-419e-a786-21eab67f33a2",
        "matched": "phenytoin",
        "snippet": "Barbiturates, phenytoin, or rifampin—increased metabolic clearance of fludrocortisone acetate because of the induction of hepatic enzymes.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "flumazenil",
      "tricyclic antidepressant overdose"
    ],
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
    "drugs": [
      "fluoroquinolones",
      "adolescents"
    ],
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
    "drugs": [
      "fluoroquinolones",
      "children"
    ],
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
    "drugs": [
      "fluoroquinolones",
      "sun exposure"
    ],
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
    "drugs": [
      "fluoroquinolones",
      "theophylline"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Theophylline toxicity",
    "management": "Monitor theophylline levels",
    "evidence_level": "A",
    "sources": [
      "Pulmonology"
    ],
    "rxcui": [
      "387207",
      "10379"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "fluorouracil",
      "leucovorin"
    ],
    "severity": "major",
    "mechanism": "Enhanced 5-FU toxicity through folate rescue",
    "effect": "Severe mucositis and myelosuppression",
    "management": "Careful dose calculation and monitoring required",
    "evidence_level": "A",
    "sources": [
      "FDA label",
      "Clinical trials"
    ],
    "rxcui": [
      "44185",
      "6120"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "82c445f5-4cb7-4457-af19-3b5b8a121b4f",
        "title": "LEUCOVORIN CALCIUM INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [GLAND PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=82c445f5-4cb7-4457-af19-3b5b8a121b4f",
        "matched": "fluorouracil",
        "snippet": "Leucovorin may enhance the toxicity of 5-fluorouracil (see WARNINGS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fluoxetine",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Hyperthermia, rigidity, altered consciousness",
    "management": "Avoid combination; consider alternative antidepressant or analgesic",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "4493",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8b8fe00e-7a2f-486b-9b72-465a494d8939",
        "title": "FLUOXETINE (FLUOXETINE HYDROCHLORIDE) CAPSULE [REMEDYREPACK INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8b8fe00e-7a2f-486b-9b72-465a494d8939",
        "matched": "tramadol",
        "snippet": "The risk is increased with concomitant use of other serotonergic drugs (including triptans, tricyclic antidepressants, fentanyl, lithium, tramadol, tryptophan, meperidine, methadone, buspirone, amphetamines, and St.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "83367367-5654-4078-831a-69ade48bc795",
        "title": "TRAMADOL HYDROCHLORIDE TABLET, EXTENDED RELEASE [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=83367367-5654-4078-831a-69ade48bc795",
        "matched": "fluoxetine",
        "snippet": "Examples Quinidine, fluoxetine, paroxetine and bupropion Inhibitors of CYP3A4 Clinical Impact: The concomitant use of tramadol hydrochloride extended-release tablets and CYP3A4 inhibitors can increase the plasma concentration of tramadol and may result in a greater amount of metabolism via CYP2D6 and greater levels of M1.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "fondaparinux",
      "platelet inhibitors"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Severe hemorrhage",
    "management": "Avoid triple therapy; monitor closely",
    "evidence_level": "A",
    "sources": [
      "Anticoagulation guidelines"
    ],
    "rxcui": [
      "274783",
      "32968"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4b65f642-87f7-4da5-a9c9-02cd1f8d9d16",
        "title": "FONDAPARINUX SODIUM INJECTION, SOLUTION [MYLAN INSTITUTIONAL LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4b65f642-87f7-4da5-a9c9-02cd1f8d9d16",
        "matched": "platelet inhibitors",
        "snippet": "DRUG INTERACTIONS In clinical studies performed with fondaparinux sodium, the concomitant use of oral anticoagulants (warfarin sodium), platelet inhibitors (acetylsalicylic acid), NSAIDs (piroxicam), and digoxin did not significantly affect the pharmacokinetics/pharmacodynamics of fondaparinux sodium.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "formoterol",
      "beta-blockers"
    ],
    "severity": "major",
    "mechanism": "Pharmacologic antagonism",
    "effect": "Bronchospasm",
    "management": "Avoid non-selective beta-blockers",
    "evidence_level": "A",
    "sources": [
      "Asthma guidelines"
    ],
    "rxcui": [
      "108588",
      "7442"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8f399784-f257-4f31-b3dc-368bf2a1864d",
        "title": "DULERA (MOMETASONE FUROATE AND FORMOTEROL FUMARATE DIHYDRATE) AEROSOL [ORGANON LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8f399784-f257-4f31-b3dc-368bf2a1864d",
        "matched": "beta-blockers",
        "snippet": "Beta-blockers: Use with caution and only when medically necessary.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "formoterol",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases formoterol levels",
    "effect": "Enhanced cardiovascular effects",
    "management": "Monitor heart rate and blood pressure",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "57855",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8f399784-f257-4f31-b3dc-368bf2a1864d",
        "title": "DULERA (MOMETASONE FUROATE AND FORMOTEROL FUMARATE DIHYDRATE) AEROSOL [ORGANON LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8f399784-f257-4f31-b3dc-368bf2a1864d",
        "matched": "ketoconazole",
        "snippet": "After oral administration of ketoconazole, a strong inhibitor of CYP3A4, the mean plasma concentration of orally inhaled mometasone furoate increased.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "furosemide",
      "gentamicin"
    ],
    "severity": "major",
    "mechanism": "Enhanced ototoxicity and nephrotoxicity",
    "effect": "Permanent hearing loss and kidney damage",
    "management": "Monitor renal function and hearing",
    "evidence_level": "A",
    "sources": [
      "Nephrology guidelines"
    ],
    "rxcui": [
      "4603",
      "4814"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "449c9a41-d61e-49fd-b5e3-d76f74b92acf",
        "title": "GENTAMICIN SULFATE IN SODIUM CHLORIDE (GENTAMICIN SULFATE) INJECTION, SOLUTION [BAXTER HEALTHCARE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=449c9a41-d61e-49fd-b5e3-d76f74b92acf",
        "matched": "furosemide",
        "snippet": "rug Interactions The concurrent use of gentamicin with potent diuretics, such as ethacrynic acid or furosemide, should be avoided, since certain diuretics by themselves may cause ototoxicity.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "furosemide",
      "lithium"
    ],
    "severity": "major",
    "mechanism": "Increased lithium reabsorption",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels; consider thiazide alternative",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "4603",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "48d8f490-e9d1-4c95-ab2f-414d3f4a9df4",
        "title": "FUROSEMIDE TABLET [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=48d8f490-e9d1-4c95-ab2f-414d3f4a9df4",
        "matched": "lithium",
        "snippet": "Lithium generally should not be given with diuretics because they reduce lithium's renal clearance and add a high risk of lithium toxicity.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "garlic",
      "saquinavir"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced HIV drug levels",
    "management": "Avoid high-dose garlic supplements",
    "evidence_level": "B",
    "sources": [
      "HIV studies"
    ],
    "rxcui": [
      "4504",
      "83515"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b8b53129-06ab-4143-b9b7-7675e49a52ef",
        "title": "INVIRASE (SAQUINAVIR MESYLATE) TABLET, FILM COATED [STATE OF FLORIDA DOH CENTRAL PHARMACY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b8b53129-06ab-4143-b9b7-7675e49a52ef",
        "matched": "garlic",
        "snippet": "Garlic Capsules ↓ Saquinavir Coadministration of garlic capsules and saquinavir is not recommended due to the potential for garlic capsules to induce the metabolism of saquinavir which may result in sub-therapeutic saquinavir concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "garlic supplements",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Antiplatelet effects",
    "effect": "Enhanced bleeding risk",
    "management": "Monitor INR; avoid large doses",
    "evidence_level": "C",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "211088",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "gatifloxacin",
      "glyburide"
    ],
    "severity": "major",
    "mechanism": "Glucose metabolism alteration",
    "effect": "Severe hypoglycemia or hyperglycemia",
    "management": "Monitor blood glucose closely",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "144500",
      "4821"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "gemcitabine",
      "radiation"
    ],
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
    "drugs": [
      "ginkgo biloba",
      "aspirin"
    ],
    "severity": "moderate",
    "mechanism": "Antiplatelet effects",
    "effect": "Bleeding risk",
    "management": "Monitor bleeding",
    "evidence_level": "B",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "206584",
      "1191"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ginkgo biloba",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Antiplatelet effects enhance bleeding",
    "effect": "Increased bleeding risk",
    "management": "Avoid combination; monitor INR if used",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "206584",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "ginkgo biloba",
        "snippet": "Some botanicals may cause bleeding events when taken alone (e.g., garlic and Ginkgo biloba) and may have anticoagulant, antiplatelet, and/or fibrinolytic properties.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ginseng",
      "diabetes medications"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced glucose lowering",
    "effect": "Hypoglycemia",
    "management": "Monitor blood glucose",
    "evidence_level": "C",
    "sources": [
      "Traditional medicine"
    ],
    "rxcui": [
      "206584",
      "26554"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ginseng",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Variable effects on coagulation",
    "effect": "Unpredictable INR changes",
    "management": "Monitor INR closely if concurrent use",
    "evidence_level": "C",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "206584",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "ginseng",
        "snippet": "John's wort, ginseng).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "glimepiride",
      "miconazole"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Severe hypoglycemia",
    "management": "Monitor glucose",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "25789",
      "6932"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "61be3059-6400-4fe4-b4ac-b07344f1362f",
        "title": "GLIMEPIRIDE (GLIMEPIRIDE) TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=61be3059-6400-4fe4-b4ac-b07344f1362f",
        "matched": "miconazole",
        "snippet": "Miconazole: Severe hypoglycemia can occur when glimepiride tablets and oral miconazole are used concomitantly.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "glipizide",
      "clarithromycin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Prolonged hypoglycemia",
    "management": "Monitor glucose closely",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "4821",
      "21212"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "glipizide",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C9 induction reduces glipizide levels",
    "effect": "Loss of glycemic control",
    "management": "Monitor blood glucose; increase dose as needed",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "4821",
      "9384"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "glyburide",
      "fluconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C9 inhibition increases glyburide exposure",
    "effect": "Severe hypoglycemia risk",
    "management": "Monitor blood glucose closely; reduce glyburide dose",
    "evidence_level": "B",
    "sources": [
      "Diabetes management guidelines"
    ],
    "rxcui": [
      "4821",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "98ac5455-d26c-4780-a5a3-bf8d85917626",
        "title": "FLUCONAZOLE TABLET [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=98ac5455-d26c-4780-a5a3-bf8d85917626",
        "matched": "glyburide",
        "snippet": "See CONTRAINDICATIONS and PRECAUTIONS.) Oral hypoglycemics: The effects of fluconazole on the pharmacokinetics of the sulfonylurea oral hypoglycemic agents tolbutamide, glipizide, and glyburide were evaluated in three placebo-controlled studies in normal volunteers.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "glyburide",
      "miconazole"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Severe hypoglycemia",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "4821",
      "6922"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a56f100f-0f42-4188-81ab-04644b824040",
        "title": "GLYBURIDE TABLET [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a56f100f-0f42-4188-81ab-04644b824040",
        "matched": "miconazole",
        "snippet": "A potential interaction between oral miconazole and oral hypoglycemic agents leading to severe hypoglycemia has been reported.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "glyburide",
      "sulfonamides"
    ],
    "severity": "moderate",
    "mechanism": "Displacement from protein binding",
    "effect": "Severe hypoglycemia",
    "management": "Monitor glucose closely",
    "evidence_level": "A",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "4821",
      "10180"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a56f100f-0f42-4188-81ab-04644b824040",
        "title": "GLYBURIDE TABLET [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a56f100f-0f42-4188-81ab-04644b824040",
        "matched": "sulfonamides",
        "snippet": "rug Interactions The hypoglycemic action of sulfonylureas may be potentiated by certain drugs including non-steroidal anti-inflammatory agents and other drugs that are highly protein bound, salicylates, sulfonamides, chloramphenicol, probenecid, coumarins, monoamine oxidase inhibitors, and beta adrenergic blocking agents.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "grapefruit juice",
      "simvastatin"
    ],
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
    "drugs": [
      "green tea",
      "warfarin"
    ],
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
    "drugs": [
      "griseofulvin",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "Hepatic enzyme induction",
    "effect": "Contraceptive failure",
    "management": "Use alternative contraception",
    "evidence_level": "B",
    "sources": [
      "Gynecology"
    ],
    "rxcui": [
      "5021",
      "9072"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "growth hormone",
      "glucocorticoids"
    ],
    "severity": "moderate",
    "mechanism": "Growth inhibition",
    "effect": "Reduced growth response",
    "management": "Monitor growth velocity",
    "evidence_level": "A",
    "sources": [
      "Pediatric endocrinology"
    ],
    "rxcui": [
      "9338",
      "1347"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "haloperidol",
      "azole antifungals"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Haloperidol toxicity",
    "management": "Monitor for extrapyramidal symptoms",
    "evidence_level": "B",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "5093",
      "4450"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "haloperidol",
      "quinidine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Movement disorders",
    "management": "Monitor closely",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "5093",
      "9068"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b1ad2abd-a9d6-44e3-957b-36a73260f4f5",
        "title": "HALOPERIDOL (HALOPERIDOL LACTATE) INJECTION, SOLUTION [FRESENIUS KABI USA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b1ad2abd-a9d6-44e3-957b-36a73260f4f5",
        "matched": "quinidine",
        "snippet": "Examples include (but are not limited to): Class 1A antiarrhythmics (e.g., procainamide, quinidine, disopyramide); Class 3 antiarrhythmics (e.g., amiodarone, sotalol); and other drugs such as citalopram, erythromycin, levofloxacin, methadone, and ziprasidone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "halothane",
      "malignant hyperthermia"
    ],
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
    "drugs": [
      "heparin",
      "aspirin"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Severe hemorrhage",
    "management": "Monitor aPTT closely",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "5224",
      "1191"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "heparin",
      "dextran"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Severe hemorrhage",
    "management": "Avoid combination; monitor coagulation closely",
    "evidence_level": "A",
    "sources": [
      "Hematology literature"
    ],
    "rxcui": [
      "5224",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "301b19bc-21c2-4a35-9d29-569b08d855c4",
        "title": "HEPARIN SODIUM INJECTION [GLAND PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=301b19bc-21c2-4a35-9d29-569b08d855c4",
        "matched": "dextran",
        "snippet": "Platelet Inhibitors Drugs such as NSAIDS (including salicylic acid, ibuprofen, indomethacin, and celecoxib), dextran, phenylbutazone, thienopyridines, dipyridamole, hydroxychloroquine, glycoprotein IIb/IIIa antagonists (including abciximab, eptifibatide, and tirofiban), and others that interfere with platelet-aggregation reactions (the main hemostatic defense of heparinized patients) may induce bleeding and shoul",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3c273512-84e2-2cea-b201-12345a6bd1fe",
        "title": "LMD IN DEXTROSE (DEXTRAN 40) INJECTION, SOLUTION LMD IN SODIUM CHLORIDE (DEXTRAN 40) INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3c273512-84e2-2cea-b201-12345a6bd1fe",
        "matched": "heparin",
        "snippet": "ONTRAINDICATIONS LMD (dextran 40) is contraindicated in patients with known hypersensitivity to dextran, in those with marked hemostatic defects of all types (thrombocytopenia, hypofibrinogenemia, etc.) including those caused by drugs (heparin, warfarin, etc.), marked cardiac decompensation and in renal disease with severe oliguria or anuria.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "high-protein diet",
      "levodopa"
    ],
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
    "drugs": [
      "hydralazine",
      "isoniazid"
    ],
    "severity": "moderate",
    "mechanism": "Acetylation competition",
    "effect": "Lupus-like syndrome",
    "management": "Monitor for autoimmune symptoms",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "5470",
      "6038"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "hydrochlorothiazide",
      "allopurinol"
    ],
    "severity": "major",
    "mechanism": "Hypersensitivity syndrome",
    "effect": "Stevens-Johnson syndrome",
    "management": "Monitor for skin reactions",
    "evidence_level": "B",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "5487",
      "519"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "hydrochlorothiazide",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Hypokalemia enhances digoxin toxicity",
    "effect": "Digoxin-induced arrhythmias",
    "management": "Monitor potassium and digoxin levels",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "5487",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3bea11a3-eb07-46b2-9b91-f8a48a2f3b7e",
        "title": "LISINOPRIL AND HYDROCHLOROTHIAZIDE (LISINOPRIL AND HYDROCHLOROTHIAZIDE TABLETS) TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3bea11a3-eb07-46b2-9b91-f8a48a2f3b7e",
        "matched": "digoxin",
        "snippet": "Other Agents: Lisinopril has been used concomitantly with nitrates and/or digoxin without evidence of clinically significant adverse interactions.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "hydrochlorothiazide",
      "sun exposure"
    ],
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
    "drugs": [
      "hydrocodone",
      "muscle relaxants"
    ],
    "severity": "moderate",
    "mechanism": "Additive CNS depression",
    "effect": "Respiratory depression",
    "management": "Use lowest effective doses",
    "evidence_level": "A",
    "sources": [
      "CDC guidelines"
    ],
    "rxcui": [
      "5489",
      "7302"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "136bbd47-7a54-493f-9158-a84d39221d6c",
        "title": "HYDROCODONE BITARTRATE AND ACETAMINOPHEN TABLET [GRANULES PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=136bbd47-7a54-493f-9158-a84d39221d6c",
        "matched": "muscle relaxants",
        "snippet": "Depressants Due to additive pharmacologic effect, the concomitant use of benzodiazepines and other CNS depressants, such as benzodiazepines and other sedative hypnotics, anxiolytics, tranquilizers, muscle relaxants, general anesthetics, antipsychotics, gabapentinoids (gabapentin or pregabalin), and other opioids, including alcohol, can increase the risk of hypotension, respiratory depression, profound sedation, com",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "hydrocodone",
      "promethazine"
    ],
    "severity": "major",
    "mechanism": "Respiratory depression",
    "effect": "Life-threatening depression",
    "management": "Avoid in children",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "5489",
      "8698"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "hydrocortisone",
      "barbiturates"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced hepatic metabolism",
    "effect": "Adrenal insufficiency risk",
    "management": "Increase hydrocortisone dose",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "5492",
      "1156"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "hydroxychloroquine",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "P-gp inhibition",
    "effect": "Increased digoxin levels",
    "management": "Monitor digoxin levels",
    "evidence_level": "B",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "5521",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ca218af-b3f4-512a-e063-6394a90a3ec6",
        "title": "HYDROXYCHLOROQUINE SULFATE TABLET [APHENA PHARMA SOLUTIONS - TENNESSEE, LLC ]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ca218af-b3f4-512a-e063-6394a90a3ec6",
        "matched": "digoxin",
        "snippet": "Digoxin Concomitant hydroxychloroquine sulfate tablets and digoxin therapy may result in increased serum digoxin levels.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ibrutinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Ibrutinib toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "1439106",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "idecabtagene vicleucel",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "T-cell modification",
    "effect": "Vaccine-derived infections",
    "management": "Avoid live vaccines",
    "evidence_level": "A",
    "sources": [
      "CAR-T protocols"
    ],
    "rxcui": [
      "2467373",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b90c1fe7-f5cc-464e-958a-af36e9c26d7c",
        "title": "ABECMA (IDECABTAGENE VICLEUCEL) SUSPENSION [CELGENE CORPORATION]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b90c1fe7-f5cc-464e-958a-af36e9c26d7c",
        "matched": "live vaccines",
        "snippet": "Use of Live Vaccines The safety of immunization with live viral vaccines during or following ABECMA treatment has not been studied.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "imatinib",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases imatinib exposure",
    "effect": "Severe myelosuppression and hepatotoxicity",
    "management": "Reduce imatinib dose by 25-50%; monitor closely",
    "evidence_level": "A",
    "sources": [
      "FDA",
      "Clinical pharmacology"
    ],
    "rxcui": [
      "282464",
      "6135"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "imatinib",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Increased bleeding risk",
    "management": "Use LMWH instead",
    "evidence_level": "B",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "282388",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c0611fc0-b217-4988-acd4-b8c629ce489b",
        "title": "IMATINIB MESYLATE TABLET, FILM COATED [BLUEPOINT LABORATORIES]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c0611fc0-b217-4988-acd4-b8c629ce489b",
        "matched": "warfarin",
        "snippet": "Patients who require anticoagulation should receive low-molecular weight or standard heparin and not warfarin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "imatinib",
        "snippet": "avir, bicalutamide, cilostazol, cimetidine, ciprofloxacin, clarithromycin, conivaptan, cyclosporine, darunavir/ritonavir, diltiazem, erythromycin, fluconazole, fluoxetine, fluvoxamine, fosamprenavir, imatinib, indinavir, isoniazid, itraconazole, ketoconazole, lopinavir/ritonavir, nefazodone, nelfinavir, nilotinib, oral contraceptives, posaconazole, ranitidine, ranolazine, ritonavir, saquinavir, telithromycin, tiprana",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "imipenem",
      "seizure medications"
    ],
    "severity": "major",
    "mechanism": "Seizure threshold lowering",
    "effect": "Increased seizure risk",
    "management": "Use alternative antibiotic",
    "evidence_level": "A",
    "sources": [
      "Infectious disease"
    ],
    "rxcui": [
      "5691",
      "seizure_meds"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "imipramine",
      "epinephrine"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced pressor response",
    "effect": "Severe hypertension",
    "management": "Use epinephrine with caution; monitor blood pressure",
    "evidence_level": "B",
    "sources": [
      "Anesthesiology guidelines"
    ],
    "rxcui": [
      "5691",
      "3992"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "db007ac0-020e-4962-8903-7497ab96a74e",
        "title": "IMIPRAMINE HYDROCHLORIDE TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=db007ac0-020e-4962-8903-7497ab96a74e",
        "matched": "epinephrine",
        "snippet": "Avoid the use of preparations, such as decongestants and local anesthetics, that contain any sympathomimetic amine (e.g., epinephrine, norepinephrine), since it has been reported that tricyclic antidepressants can potentiate the effects of catecholamines.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "incretin mimetics",
      "insulin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced glucose lowering",
    "effect": "Severe hypoglycemia",
    "management": "Reduce insulin dose appropriately",
    "evidence_level": "A",
    "sources": [
      "Diabetes"
    ],
    "rxcui": [
      "60548",
      "5856"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "indapamide",
      "lithium"
    ],
    "severity": "major",
    "mechanism": "Increased lithium reabsorption",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels frequently",
    "evidence_level": "A",
    "sources": [
      "Psychiatry literature"
    ],
    "rxcui": [
      "5764",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a30ff81d-420b-40ea-83d8-670260a93fff",
        "title": "WIDAPLIK (TELMISARTAN, AMLODIPINE AND INDAPAMIDE) TABLET [AZURITY PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a30ff81d-420b-40ea-83d8-670260a93fff",
        "matched": "lithium",
        "snippet": "Lithium: Increases in serum lithium concentrations and toxicity have been reported during concomitant administration of lithium with angiotensin II receptor antagonists including telmisartan.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "infliximab",
      "azathioprine"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced immunosuppression",
    "effect": "Opportunistic infections",
    "management": "Monitor for infections",
    "evidence_level": "B",
    "sources": [
      "Gastroenterology"
    ],
    "rxcui": [
      "149772",
      "1256"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dbf738c4-3fac-4422-a9d8-51d9c83a8789",
        "title": "RENFLEXIS (INFLIXIMAB) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [ORGANON LLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dbf738c4-3fac-4422-a9d8-51d9c83a8789",
        "matched": "azathioprine",
        "snippet": "Due to the risk of HSTCL carefully assess the risk/benefit especially if the patient has Crohn's disease or ulcerative colitis, is male, and is receiving azathioprine or 6-mercaptopurine treatment.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "insulin",
      "ace inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced insulin sensitivity",
    "effect": "Hypoglycemia",
    "management": "Monitor glucose and adjust insulin",
    "evidence_level": "B",
    "sources": [
      "Diabetes"
    ],
    "rxcui": [
      "5856",
      "35208"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5328761e-59d3-ca7a-e063-6394a90ae810",
        "title": "LANGLARA (INSULIN GLARGINE-ALDY) INJECTION, SOLUTION [LANEXA BIOLOGICS, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5328761e-59d3-ca7a-e063-6394a90ae810",
        "matched": "ace inhibitors",
        "snippet": "Table 8: Clinically Significant Drug Interactions with LANGLARA Drugs that May Increase the Risk of Hypoglycemia Drugs: Antidiabetic agents, ACE inhibitors, angiotensin II receptor blocking agents, disopyramide, fibrates, fluoxetine, monoamine oxidase inhibitors, pentoxifylline, pramlintide, salicylates, somatostatin analogs (e.g., octreotide), sulfonamide antibiotics, GLP-1 receptor agonists, DPP-4 inhibitors, and S",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "insulin",
      "atenolol"
    ],
    "severity": "moderate",
    "mechanism": "Beta-blocker masks hypoglycemia symptoms",
    "effect": "Unrecognized hypoglycemia",
    "management": "Monitor blood glucose frequently; patient education",
    "evidence_level": "B",
    "sources": [
      "Diabetes guidelines"
    ],
    "rxcui": [
      "5856",
      "1202"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1494d5f7-8620-46da-8bca-69b76cd17635",
        "title": "ATENOLOL AND CHLORTHALIDONE TABLET [NORTHSTAR RX LLC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1494d5f7-8620-46da-8bca-69b76cd17635",
        "matched": "insulin",
        "snippet": "Insulin requirements in diabetic patients may be increased, decreased or unchanged; latent diabetes mellitus may become manifest during chlorthalidone administration.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "insulin",
      "beta-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Masked hypoglycemia symptoms",
    "effect": "Unrecognized hypoglycemia",
    "management": "Monitor glucose more frequently",
    "evidence_level": "A",
    "sources": [
      "Diabetes guidelines"
    ],
    "rxcui": [
      "5856",
      "7442"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5328761e-59d3-ca7a-e063-6394a90ae810",
        "title": "LANGLARA (INSULIN GLARGINE-ALDY) INJECTION, SOLUTION [LANEXA BIOLOGICS, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5328761e-59d3-ca7a-e063-6394a90ae810",
        "matched": "beta-blockers",
        "snippet": "Drugs that May Increase or Decrease the Blood Glucose Lowering Effect of LANGLARA Drugs: Alcohol, beta-blockers, clonidine, and lithium salts.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "insulin",
      "chromium"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced glucose lowering",
    "effect": "Hypoglycemia",
    "management": "Monitor glucose",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "5856",
      "chromium"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "insulin",
      "octreotide"
    ],
    "severity": "moderate",
    "mechanism": "Opposing glycemic effects",
    "effect": "Variable glucose control",
    "management": "Monitor glucose closely",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "5856",
      "7597"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5328761e-59d3-ca7a-e063-6394a90ae810",
        "title": "LANGLARA (INSULIN GLARGINE-ALDY) INJECTION, SOLUTION [LANEXA BIOLOGICS, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5328761e-59d3-ca7a-e063-6394a90ae810",
        "matched": "octreotide",
        "snippet": "gents, ACE inhibitors, angiotensin II receptor blocking agents, disopyramide, fibrates, fluoxetine, monoamine oxidase inhibitors, pentoxifylline, pramlintide, salicylates, somatostatin analogs (e.g., octreotide), sulfonamide antibiotics, GLP-1 receptor agonists, DPP-4 inhibitors, and SGLT-2 inhibitors. Intervention: Dosage reductions and increased frequency of glucose monitoring may be required when LANGLARA is coadm",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "9502860d-0261-4d69-a4be-827a5376d356",
        "title": "OCTREOTIDE ACETATE INJECTION, SOLUTION [HIKMA PHARMACEUTICALS USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9502860d-0261-4d69-a4be-827a5376d356",
        "matched": "insulin",
        "snippet": "DRUG INTERACTIONS The following drugs require monitoring and possible dose adjustment when used with octreotide acetate injection: cyclosporine, insulin, oral hypoglycemic agents, beta-blockers, and bromocriptine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "insulin",
      "quinolones"
    ],
    "severity": "moderate",
    "mechanism": "Variable glucose effects",
    "effect": "Glucose fluctuations",
    "management": "Monitor glucose closely",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "5856",
      "26785"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ipratropium",
      "atropine"
    ],
    "severity": "moderate",
    "mechanism": "Additive anticholinergic effects",
    "effect": "Enhanced anticholinergic toxicity",
    "management": "Monitor for confusion, dry mouth, constipation",
    "evidence_level": "B",
    "sources": [
      "Clinical experience"
    ],
    "rxcui": [
      "5470",
      "1202"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ac641027-929e-694d-80cd-bf770dc51aa6",
        "title": "IPRATROPIUM BROMIDE SPRAY, METERED [APOTEX CORP.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ac641027-929e-694d-80cd-bf770dc51aa6",
        "matched": "atropine",
        "snippet": "ONTRAINDICATIONS Ipratropium bromide nasal solution, 0.03% is contraindicated in patients with a history of hypersensitivity to atropine or its derivatives, or to any of the other ingredients.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ipratropium",
      "tiotropium"
    ],
    "severity": "moderate",
    "mechanism": "Additive anticholinergic effects",
    "effect": "Enhanced side effects",
    "management": "Avoid combination",
    "evidence_level": "B",
    "sources": [
      "COPD guidelines"
    ],
    "rxcui": [
      "5470",
      "352213"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7b656b14-fcaa-2741-f6f0-e0be48971c02",
        "title": "SPIRIVA RESPIMAT (TIOTROPIUM BROMIDE INHALATION SPRAY) SPRAY, METERED [BOEHRINGER INGELHEIM PHARMACEUTICALS, INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7b656b14-fcaa-2741-f6f0-e0be48971c02",
        "matched": "ipratropium",
        "snippet": "CONTRAINDICATIONS SPIRIVA RESPIMAT is contraindicated in patients with a hypersensitivity to tiotropium, ipratropium, or any component of this product [see Warnings and Precautions (5.2)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "iron sucrose",
      "oral iron"
    ],
    "severity": "minor",
    "mechanism": "Different routes",
    "effect": "No interaction",
    "management": "Can use together",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "135616",
      "6179"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3f109bdb-a412-43b2-84c7-9dad05e85a71",
        "title": "IRON SUCROSE INJECTION, SOLUTION [MYLAN INSTITUTIONAL LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f109bdb-a412-43b2-84c7-9dad05e85a71",
        "matched": "oral iron",
        "snippet": "DRUG INTERACTIONS Iron sucrose may reduce the absorption of concomitantly administered oral iron preparations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "iron supplements",
      "tea/coffee"
    ],
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
    "drugs": [
      "isavuconazole",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Treatment failure",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Antifungal guidelines"
    ],
    "rxcui": [
      "1596603",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "isosorbide mononitrate",
      "sildenafil"
    ],
    "severity": "major",
    "mechanism": "Additive vasodilation",
    "effect": "Life-threatening hypotension",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "6960",
      "136411"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6a582db5-eb45-4320-98c1-55517d7d8c38",
        "title": "ISOSORBIDE MONONITRATE TABLET, EXTENDED RELEASE [AMERICAN HEALTH PACKAGING]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6a582db5-eb45-4320-98c1-55517d7d8c38",
        "matched": "sildenafil",
        "snippet": "ARNINGS Amplification of the vasodilatory effects of isosorbide mononitrate by sildenafil can result in severe hypotension.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "isotretinoin",
      "pregnancy"
    ],
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
    "drugs": [
      "isotretinoin",
      "vitamin a"
    ],
    "severity": "major",
    "mechanism": "Vitamin A toxicity",
    "effect": "Hypervitaminosis A",
    "management": "Avoid vitamin A supplements",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "6066",
      "11248"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "27b3cf26-f22e-5b70-1c24-009933b7c6ee",
        "title": "ZENATANE (ISOTRETINOIN) CAPSULE, GELATIN COATED [DR. REDDY'S LABORATORIES LIMITED ]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=27b3cf26-f22e-5b70-1c24-009933b7c6ee",
        "matched": "vitamin a",
        "snippet": "DRUG INTERACTIONS Vitamin A: Avoid concomitant use (7.1) Tetracyclines: Avoid concomitant use (7.2) 7.1 Vitamin A Avoid concomitant use of Zenatane with supplements containing vitamin A.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "itraconazole",
      "cyclosporine"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Nephrotoxicity",
    "management": "Monitor levels",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "28031",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "23126370-8d6a-4027-bd8f-860e2776ba3a",
        "title": "ITRACONAZOLE CAPSULE [ALEMBIC PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=23126370-8d6a-4027-bd8f-860e2776ba3a",
        "matched": "cyclosporine",
        "snippet": "Budesonide (inhalation) a Budesonide (non­-­­­inhalation) Ciclesonide (inhalation) Cyclosporine (IV) a Cyclosporine (non-IV) Dexamethasonea Fluticasone (inhalation) a Fluticasone (nasal)Methylprednisolonea Tacrolimus (IV) a Tacrolimus (oral) Monitor for adverse reactions.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "itraconazole",
        "snippet": "gs That Increase Cyclosporine Concentrations Calcium Channel Blockers Antifungals Antibiotics Glucocorticoids Other Drugs diltiazem fluconazole azithromycin methylprednisolone Allopurinol nicardipine itraconazole clarithromycin Amiodarone verapamil ketoconazole erythromycin Bromocriptine voriconazole quinupristin/ dalfopristin colchicine danazol imatinib metoclopramide nefazodone oral contraceptives HIV Protease inhi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "itraconazole",
      "digoxin"
    ],
    "severity": "major",
    "mechanism": "P-gp inhibition",
    "effect": "Toxicity",
    "management": "Monitor levels",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "28031",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "itraconazole",
        "snippet": "Captopril 58% 39% Clarithromycin NA 70% Dronedarone NA 150% Gentamicin 129% to 212% NA Erythromycin 100% NA Itraconazole 80% NA Lapatinib NA 180% Propafenone NA 60% to 270% Quinidine 100% NA Ranolazine 50% NA Ritonavir NA 86% Telaprevir 50% 85% Tetracycline 100% NA Verapamil 50% to 75% NA Digoxin concentrations increased less than 50% Atorvastatin 22% 15% Measure serum digoxin concentrations before initiating concomi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "itraconazole",
      "midazolam"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition dramatically increases midazolam",
    "effect": "Prolonged sedation",
    "management": "Avoid oral midazolam; reduce IV dose significantly",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "28031",
      "6960"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "23126370-8d6a-4027-bd8f-860e2776ba3a",
        "title": "ITRACONAZOLE CAPSULE [ALEMBIC PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=23126370-8d6a-4027-bd8f-860e2776ba3a",
        "matched": "midazolam",
        "snippet": "Antipsychotics, Anxiolytics and Hypnotics Alprazolama Midazolam (IV) a Aripiprazolea QuetiapineBuspironea Cariprazine RamelteonDiazepama Risperidonea Haloperidola Suvorexant Monitor for adverse reactions.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "2b29422e-54d5-4a49-8522-e9cf752368c3",
        "title": "NAYZILAM (MIDAZOLAM) SPRAY [UCB, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2b29422e-54d5-4a49-8522-e9cf752368c3",
        "matched": "itraconazole",
        "snippet": "Examples: Moderate CYP3A4 inhibitors: erythromycin, diltiazem, verapamil Strong CYP3A4 inhibitors: ketoconazole, itraconazole, clarithromycin 7.2 Opioids Clinical Impact: The concomitant use of benzodiazepines and opioids increases the risk of respiratory depression because of actions at different receptor sites in the CNS that control respiration.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ivabradine",
      "diltiazem"
    ],
    "severity": "major",
    "mechanism": "Enhanced bradycardia",
    "effect": "Severe bradycardia",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "European guidelines"
    ],
    "rxcui": [
      "77492",
      "3443"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "676907d3-b374-4baa-8422-c04706409540",
        "title": "IVABRADINE TABLET, FILM COATED [NOVADOZ PHARMACEUTICALS LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=676907d3-b374-4baa-8422-c04706409540",
        "matched": "diltiazem",
        "snippet": "Examples of moderate CYP3A4 inhibitors include diltiazem, verapamil, and grapefruit juice [see Warnings and Precautions (5.3) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "2dc2b889-8443-4f7f-83be-86c68e179804",
        "title": "CARTIA XT (DILTIAZEM HYDROCHLORIDE) CAPSULE, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2dc2b889-8443-4f7f-83be-86c68e179804",
        "matched": "ivabradine",
        "snippet": "Ivabradine: Concurrent use of diltiazem increases exposure to ivabradine and may exacerbate bradycardia and conduction disturbances.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "kava",
      "alprazolam"
    ],
    "severity": "major",
    "mechanism": "Additive CNS depression",
    "effect": "Severe sedation and coma risk",
    "management": "Avoid combination; counsel about risks",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "258331",
      "596"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "kava",
      "hepatotoxic drugs"
    ],
    "severity": "major",
    "mechanism": "Additive hepatotoxicity",
    "effect": "Liver failure",
    "management": "Avoid combination",
    "evidence_level": "B",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "206585",
      "hepatotoxic"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ketamine",
      "increased intracranial pressure"
    ],
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
    "drugs": [
      "ketamine",
      "psychiatric disorders"
    ],
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
    "drugs": [
      "ketoconazole",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Enhanced effect",
    "effect": "Bleeding risk",
    "management": "Monitor INR",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "6135",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "ketoconazole",
        "snippet": "profloxacin, clarithromycin, conivaptan, cyclosporine, darunavir/ritonavir, diltiazem, erythromycin, fluconazole, fluoxetine, fluvoxamine, fosamprenavir, imatinib, indinavir, isoniazid, itraconazole, ketoconazole, lopinavir/ritonavir, nefazodone, nelfinavir, nilotinib, oral contraceptives, posaconazole, ranitidine, ranolazine, ritonavir, saquinavir, telithromycin, tipranavir, voriconazole, zileuton armodafinil, ampre",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ketorolac",
      "ace inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Reduced prostaglandin synthesis",
    "effect": "Acute kidney injury",
    "management": "Monitor renal function",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "6142",
      "35208"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "18b450d2-e715-4710-a1d8-22b782f87f9c",
        "title": "KETOROLAC TROMETHAMINE TABLET, FILM COATED [PREFERRED PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=18b450d2-e715-4710-a1d8-22b782f87f9c",
        "matched": "ace inhibitors",
        "snippet": "ACE Inhibitors/Angiotensin II Receptor Antagonists Concomitant use of ACE inhibitors and/or angiotensin II receptor antagonists may increase the risk of renal impairment, particularly in volume-depleted patients.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lacosamide",
      "sodium channel blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive sodium channel effects",
    "effect": "PR interval prolongation",
    "management": "Monitor ECG",
    "evidence_level": "B",
    "sources": [
      "Epilepsy"
    ],
    "rxcui": [
      "752061",
      "sodium_blockers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ca5b043-533e-2d1a-e063-6294a90a8d4a",
        "title": "LACOSAMIDE TABLET [AVPAK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ca5b043-533e-2d1a-e063-6294a90a8d4a",
        "matched": "sodium channel blockers",
        "snippet": "Concomitant Medications that Affect Cardiac Conduction Lacosamide should be used with caution in patients on concomitant medications that affect cardiac conduction (sodium channel blockers, beta-blockers, calcium channel blockers, potassium channel blockers) including those that prolong PR interval (including sodium channel blocking AEDs), because of a risk of AV block, bradycardia, or ventricular tachyarrhythmia",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lamotrigine",
      "oral contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "Glucuronidation induction reduces lamotrigine levels",
    "effect": "Increased seizure risk",
    "management": "Monitor seizure control; may need dose increase",
    "evidence_level": "A",
    "sources": [
      "Epilepsy guidelines",
      "Epilepsy"
    ],
    "rxcui": [
      "48527",
      "311"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a4d89cd9-c5d8-490f-996d-fc15b47c7b21",
        "title": "LAMOTRIGINE TABLET [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a4d89cd9-c5d8-490f-996d-fc15b47c7b21",
        "matched": "oral contraceptives",
        "snippet": "Estrogen-containing oral contraceptives decrease lamotrigine concentrations by approximately 50%.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lansoprazole",
      "sucralfate"
    ],
    "severity": "moderate",
    "mechanism": "Delayed gastric emptying reduces PPI absorption",
    "effect": "Reduced acid suppression",
    "management": "Give PPI 30 minutes before sucralfate",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "17128",
      "10156"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7daa1721-f92b-4096-b19e-4d27fc8acb51",
        "title": "LANSOPRAZOLE TABLET, ORALLY DISINTEGRATING, DELAYED RELEASE [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7daa1721-f92b-4096-b19e-4d27fc8acb51",
        "matched": "sucralfate",
        "snippet": "Sucralfate Clinical Impact: Decreased and delayed absorption of lansoprazole [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lanthanum carbonate",
      "quinolones"
    ],
    "severity": "moderate",
    "mechanism": "Chelation",
    "effect": "Reduced antibiotic efficacy",
    "management": "Separate by 2 hours",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "186653",
      "26785"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bb263fe8-2bdf-4dba-807f-194f54a73654",
        "title": "LANTHANUM CARBONATE TABLET, CHEWABLE [PRASCO LABORATORIES]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb263fe8-2bdf-4dba-807f-194f54a73654",
        "matched": "quinolones",
        "snippet": "Examples of relevant classes of compounds where antacids have been demonstrated to reduce bioavailability include antibiotics (such as quinolones, ampicillin, and tetracyclines), thyroid hormones, ACE inhibitors, statin lipid regulators, and anti-malarials.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "larotrectinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Loss of efficacy",
    "management": "Avoid strong inducers",
    "evidence_level": "A",
    "sources": [
      "Precision oncology"
    ],
    "rxcui": [
      "2103185",
      "cyp3a4_inducers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0c8ca614-58b2-4aa4-83d3-0387a8f782fd",
        "title": "VITRAKVI (LAROTRECTINIB) CAPSULE VITRAKVI (LAROTRECTINIB) SOLUTION, CONCENTRATE [BAYER HEALTHCARE PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0c8ca614-58b2-4aa4-83d3-0387a8f782fd",
        "matched": "strong cyp3a4 inducers",
        "snippet": "Strong CYP3A4 Inducers: Avoid coadministration of strong CYP3A4 inducers with VITRAKVI.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "latanoprost",
      "thimerosal-containing drops"
    ],
    "severity": "minor",
    "mechanism": "Precipitation in eye",
    "effect": "Reduced efficacy",
    "management": "Separate administration by 5 minutes",
    "evidence_level": "B",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "135616",
      "thimerosal"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "leflunomide",
      "hepatotoxic drugs"
    ],
    "severity": "major",
    "mechanism": "Additive hepatotoxicity",
    "effect": "Liver failure",
    "management": "Monitor LFTs closely",
    "evidence_level": "A",
    "sources": [
      "Hepatology"
    ],
    "rxcui": [
      "131656",
      "hepatotoxic"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "753453c5-8a7a-878e-3ce7-1d1edce718a9",
        "title": "LEFLUNOMIDE TABLET [APOTEX CORP. ]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=753453c5-8a7a-878e-3ce7-1d1edce718a9",
        "matched": "hepatotoxic drugs",
        "snippet": "Use caution when leflunomide is given with other potentially hepatotoxic drugs.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "levetiracetam",
      "oral contraceptives"
    ],
    "severity": "minor",
    "mechanism": "No significant interaction",
    "effect": "None",
    "management": "No adjustment needed",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "131725",
      "9072"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "levodopa",
      "pyridoxine"
    ],
    "severity": "major",
    "mechanism": "Enhanced peripheral decarboxylation",
    "effect": "Reduced levodopa efficacy",
    "management": "Avoid vitamin B6 supplements",
    "evidence_level": "A",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "6047",
      "8484"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "levofloxacin",
      "nsaids"
    ],
    "severity": "moderate",
    "mechanism": "CNS stimulation",
    "effect": "Seizure risk",
    "management": "Use caution",
    "evidence_level": "B",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "82122",
      "26548"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "levofloxacin",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Enhanced anticoagulant effect",
    "effect": "Increased INR and bleeding risk",
    "management": "Monitor INR closely during antibiotic course",
    "evidence_level": "A",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "82122",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b8defac4-9deb-433b-928e-0ef4ee0123a2",
        "title": "LEVOFLOXACIN TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b8defac4-9deb-433b-928e-0ef4ee0123a2",
        "matched": "warfarin",
        "snippet": "Warfarin Effect may be enhanced.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "levothyroxine",
      "calcium carbonate"
    ],
    "severity": "moderate",
    "mechanism": "Chelation reduces levothyroxine absorption",
    "effect": "Hypothyroidism",
    "management": "Separate administration by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology guidelines",
      "Studies"
    ],
    "rxcui": [
      "10582",
      "1378"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cba64919-3b74-a03a-e053-2995a90a3d89",
        "title": "LEVOTHYROXINE SODIUM TABLET [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cba64919-3b74-a03a-e053-2995a90a3d89",
        "matched": "calcium carbonate",
        "snippet": "Drug or Drug Class Effect Phosphate Binders (e.g., calcium carbonate, ferrous sulfate, sevelamer, lanthanum) Phosphate binders may bind to levothyroxine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "levothyroxine",
      "cholestyramine"
    ],
    "severity": "moderate",
    "mechanism": "Impaired absorption",
    "effect": "Hypothyroidism",
    "management": "Separate by 4-6 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "10582",
      "2556"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cba64919-3b74-a03a-e053-2995a90a3d89",
        "title": "LEVOTHYROXINE SODIUM TABLET [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cba64919-3b74-a03a-e053-2995a90a3d89",
        "matched": "cholestyramine",
        "snippet": "Bile Acid Sequestrants (e.g., colesevelam, cholestyramine, colestipol) Ion Exchange Resins (e.g., Kayexalate) Bile acid sequestrants and ion exchange resins are known to decrease levothyroxine absorption.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "levothyroxine",
      "iron supplements"
    ],
    "severity": "moderate",
    "mechanism": "Chelation reduces levothyroxine absorption",
    "effect": "Hypothyroidism",
    "management": "Separate administration by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology guidelines",
      "Endocrine"
    ],
    "rxcui": [
      "10582",
      "6045"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "levothyroxine",
      "soy products"
    ],
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
    "drugs": [
      "licorice",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Hypokalemia from glycyrrhizin",
    "effect": "Enhanced digoxin toxicity",
    "management": "Monitor potassium levels",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "licorice",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "lincomycin",
      "neuromuscular blockers"
    ],
    "severity": "major",
    "mechanism": "Enhanced neuromuscular blockade",
    "effect": "Prolonged paralysis",
    "management": "Monitor neuromuscular function",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "6270",
      "7302"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "linezolid",
      "tyramine-rich foods"
    ],
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
    "drugs": [
      "liraglutide",
      "oral medications"
    ],
    "severity": "minor",
    "mechanism": "Delayed gastric emptying",
    "effect": "Delayed absorption",
    "management": "Space oral meds appropriately",
    "evidence_level": "B",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "475968",
      "oral_meds"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bb66a46c-9019-4a98-8e5d-581109facfba",
        "title": "LIRAGLUTIDE INJECTION, SOLUTION [ORBICULAR PHARMACEUTICAL TECHNOLOGIES PRIVATE LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb66a46c-9019-4a98-8e5d-581109facfba",
        "matched": "oral medications",
        "snippet": "DRUG INTERACTIONS Effects of delayed gastric emptying on oral medications:Liraglutide injection delays gastric emptying and may impact absorption of concomitantly administered oral medications (7).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lisinopril",
      "aliskiren"
    ],
    "severity": "major",
    "mechanism": "Dual RAAS blockade",
    "effect": "Hyperkalemia and renal failure",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Trials"
    ],
    "rxcui": [
      "29046",
      "325646"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5eff766f-82e2-4cd6-e053-2a91aa0a4782",
        "title": "LISINOPRIL TABLET [ST. MARY'S MEDICAL PARK PHARMACY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5eff766f-82e2-4cd6-e053-2a91aa0a4782",
        "matched": "aliskiren",
        "snippet": "Dual Blockade of the Renin-Angiotensin System (RAS) Dual blockade of the RAS with angiotensin receptor blockers, ACE inhibitors, or aliskiren is associated with increased risks of hypotension, hyperkalemia, and changes in renal function (including acute renal failure) compared to monotherapy.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lisinopril",
      "potassium supplements"
    ],
    "severity": "moderate",
    "mechanism": "Additive hyperkalemic effects",
    "effect": "Hyperkalemia risk",
    "management": "Monitor serum potassium levels regularly",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "29046",
      "8588"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5eff766f-82e2-4cd6-e053-2a91aa0a4782",
        "title": "LISINOPRIL TABLET [ST. MARY'S MEDICAL PARK PHARMACY]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5eff766f-82e2-4cd6-e053-2a91aa0a4782",
        "matched": "potassium supplements",
        "snippet": "Risk factors for the development of hyperkalemia include renal insufficiency, diabetes mellitus, and the concomitant use of potassium-sparing diuretics, potassium supplements and/or potassium-containing salt substitutes [see Drug Interactions (7.1)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lisinopril",
      "trimethoprim"
    ],
    "severity": "moderate",
    "mechanism": "Additive hyperkalemic effects",
    "effect": "Hyperkalemia",
    "management": "Monitor serum potassium",
    "evidence_level": "A",
    "sources": [
      "Nephrology literature"
    ],
    "rxcui": [
      "29046",
      "10829"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "lisocabtagene maraleucel",
      "corticosteroids"
    ],
    "severity": "major",
    "mechanism": "CAR-T cell suppression",
    "effect": "Reduced efficacy",
    "management": "Avoid unless treating CRS/ICANS",
    "evidence_level": "A",
    "sources": [
      "CAR-T management"
    ],
    "rxcui": [
      "2179555",
      "1347"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "594bb413-af3b-4b97-afb3-bfe2b174f2ed",
        "title": "BREYANZI (LISOCABTAGENE MARALEUCEL) KIT [JUNO THERAPEUTICS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=594bb413-af3b-4b97-afb3-bfe2b174f2ed",
        "matched": "corticosteroids",
        "snippet": "At the first sign of CRS, institute treatment with supportive care, tocilizumab, or tocilizumab and corticosteroids as indicated [see Dosage and Administration (2.2, 2.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lithium",
      "caffeine"
    ],
    "severity": "moderate",
    "mechanism": "Increased lithium clearance",
    "effect": "Reduced lithium levels",
    "management": "Monitor lithium levels with caffeine changes",
    "evidence_level": "B",
    "sources": [
      "Psychiatry literature"
    ],
    "rxcui": [
      "6448",
      "caffeine"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "lithium",
      "hydrochlorothiazide"
    ],
    "severity": "major",
    "mechanism": "Reduced lithium clearance",
    "effect": "Lithium toxicity risk",
    "management": "Monitor lithium levels frequently; adjust dose as needed",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "6448",
      "5487"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "31a3d1cb-0f52-4818-965d-7584374bb23e",
        "title": "HYDROCHLOROTHIAZIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=31a3d1cb-0f52-4818-965d-7584374bb23e",
        "matched": "lithium",
        "snippet": "Lithium - generallyshould not be given with diluretics.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lithium",
      "ibuprofen"
    ],
    "severity": "major",
    "mechanism": "Reduced clearance",
    "effect": "Lithium toxicity",
    "management": "Use acetaminophen",
    "evidence_level": "A",
    "sources": [
      "Guidelines",
      "Psychiatry"
    ],
    "rxcui": [
      "6448",
      "5640"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "138edf0b-d7da-44b6-b010-d311a37087fe",
        "title": "IBUPROFEN TABLET, FILM COATED [MEDCORE LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=138edf0b-d7da-44b6-b010-d311a37087fe",
        "matched": "lithium",
        "snippet": "Lithium Ibuprofen produced an elevation of plasma lithium levels and a reduction in renal lithium clearance in a study of eleven normal volunteers.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lithium",
      "nsaids"
    ],
    "severity": "major",
    "mechanism": "Reduced lithium clearance",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels; use acetaminophen instead",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "6448",
      "26548"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "039f188c-413a-6e64-e063-6294a90a2972",
        "title": "LITHIUM CARBONATE TABLET, EXTENDED RELEASE [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=039f188c-413a-6e64-e063-6294a90a2972",
        "matched": "nsaids",
        "snippet": "Nonsteroidal Anti-Inflammatory Drugs (NSAIDS):Lithium levels should be closely monitored when patients initiate or discontinue NSAID use.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "loratadine",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases active metabolite",
    "effect": "Enhanced antihistamine effect",
    "management": "Monitor for increased sedation",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "6253",
      "2541"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "lorlatinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Lorlatinib toxicity",
    "management": "Reduce lorlatinib dose",
    "evidence_level": "A",
    "sources": [
      "ALK+ NSCLC"
    ],
    "rxcui": [
      "2049829",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "losartan",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C9 induction reduces active metabolite",
    "effect": "Reduced antihypertensive effect",
    "management": "Monitor blood pressure; consider dose increase",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "52175",
      "9384"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "losartan",
      "spironolactone"
    ],
    "severity": "moderate",
    "mechanism": "Additive hyperkalemia",
    "effect": "Severe hyperkalemia",
    "management": "Monitor potassium closely",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "52175",
      "9997"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "lubiprostone",
      "methadone"
    ],
    "severity": "moderate",
    "mechanism": "Potential for nausea",
    "effect": "Severe nausea and vomiting",
    "management": "Monitor symptoms",
    "evidence_level": "C",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "723756",
      "6813"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "333acede-5075-464f-9418-4b22d43eef3c",
        "title": "LUBIPROSTONE CAPSULE [AMNEAL PHARMACEUTICALS LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=333acede-5075-464f-9418-4b22d43eef3c",
        "matched": "methadone",
        "snippet": "DRUG INTERACTIONS 7.1 Methadone Diphenylheptane opioids (e.g., methadone) have been shown in nonclinical studies to dose-dependently reduce the activation of ClC-2 by lubiprostone in the gastrointestinal tract.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "lumateperone",
      "moderate cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased exposure",
    "management": "Monitor for side effects",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "2179491",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "db730b06-6351-47fd-8183-e61e61bbead5",
        "title": "CAPLYTA (LUMATEPERONE) CAPSULE [INTRA-CELLULAR THERAPIES, INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=db730b06-6351-47fd-8183-e61e61bbead5",
        "matched": "moderate cyp3a4 inhibitors",
        "snippet": "Moderate CYP3A4 inhibitors: Recommended dosage is 21 mg once daily.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "luspatercept",
      "anticoagulants"
    ],
    "severity": "moderate",
    "mechanism": "Thrombotic risk",
    "effect": "Increased thrombosis",
    "management": "Consider anticoagulation",
    "evidence_level": "B",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2284929",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "magnesium hydroxide",
      "bisacodyl"
    ],
    "severity": "moderate",
    "mechanism": "Premature enteric coating dissolution",
    "effect": "Gastric irritation",
    "management": "Separate administration by 1 hour",
    "evidence_level": "B",
    "sources": [
      "Pharmaceutical studies"
    ],
    "rxcui": [
      "6468",
      "1656"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "mannitol",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "Electrolyte changes",
    "effect": "Enhanced digoxin toxicity",
    "management": "Monitor electrolytes",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "6804",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ba7bf864-8a4d-4262-8fd1-00174fa2f9d1",
        "title": "MANNITOL INJECTION, SOLUTION [ICU MEDICAL INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ba7bf864-8a4d-4262-8fd1-00174fa2f9d1",
        "matched": "digoxin",
        "snippet": "Drugs Affected by Electrolyte Imbalances The development of electrolyte imbalances (e.g., hyperkalemia, hypokalemia) associated with mannitol administration may result in cardiac adverse reactions in patients receiving drugs that are sensitive to such imbalances (e.g., digoxin, drugs that prolong the QT interval, neuromuscular blocking agents) [see Warnings and Precautions (5.4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "maoi",
      "bipolar disorder"
    ],
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
    "drugs": [
      "mefloquine",
      "halofantrine"
    ],
    "severity": "major",
    "mechanism": "Additive cardiotoxicity",
    "effect": "Fatal arrhythmias",
    "management": "Absolute contraindication",
    "evidence_level": "A",
    "sources": [
      "WHO guidelines"
    ],
    "rxcui": [
      "6876",
      "halofantrine"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "09716a24-d7da-42b2-af29-c03a1b6670bd",
        "title": "MEFLOQUINE HYDROCHLORIDE TABLET [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=09716a24-d7da-42b2-af29-c03a1b6670bd",
        "matched": "halofantrine",
        "snippet": "Halofantrine Halofantrine should not be administered with mefloquine or within 15 weeks of the last dose of mefloquine due to the risk of a potentially fatal prolongation of the QTc interval (see WARNINGS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "meloxicam",
      "lithium"
    ],
    "severity": "major",
    "mechanism": "Reduced lithium clearance",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels; avoid if possible",
    "evidence_level": "A",
    "sources": [
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "77492",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "dcf1ecd1-08a0-8e47-e053-2a95a90abdc7",
        "title": "SYMBRAVO (MELOXICAM, RIZATRIPTAN) TABLET [AXSOME THERAPEUTICS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dcf1ecd1-08a0-8e47-e053-2a95a90abdc7",
        "matched": "lithium",
        "snippet": "Lithium: Monitor for increases in lithium plasma levels (7.1) Methotrexate: Monitor for increases methotrexate plasma levels.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "meropenem",
      "valproic acid"
    ],
    "severity": "major",
    "mechanism": "VPA level reduction",
    "effect": "Breakthrough seizures",
    "management": "Avoid combination or supplement VPA",
    "evidence_level": "A",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "6827",
      "11118"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "74ff19b5-6156-4a27-affb-744b0ce1aeec",
        "title": "MEROPENEM INJECTION, POWDER, FOR SOLUTION [WG CRITICAL CARE, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=74ff19b5-6156-4a27-affb-744b0ce1aeec",
        "matched": "valproic acid",
        "snippet": "DRUG INTERACTIONS 1 Co-administration of Meropenem for injection with probenecid inhibits renal excretion of meropenem and is therefore not recommended (7.1) 2 The concomitant use of Meropenem for injection and valproic acid or divalproex sodium is generally not recommended.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "title": "VALPROIC ACID CAPSULE, LIQUID FILLED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "matched": "meropenem",
        "snippet": "Carbapenem Antibiotics A clinically significant reduction in serum valproic acid concentration has been reported in patients receiving carbapenem antibiotics (for example, ertapenem, imipenem, meropenem; this is not a complete list) and may result in loss of seizure control.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "mesalamine",
      "azathioprine"
    ],
    "severity": "moderate",
    "mechanism": "Inhibition of TPMT",
    "effect": "Enhanced myelotoxicity",
    "management": "Monitor CBC closely",
    "evidence_level": "B",
    "sources": [
      "IBD guidelines"
    ],
    "rxcui": [
      "6960",
      "1256"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "54cfed92-5e28-4a4d-a70f-2a60b5b54c12",
        "title": "MESALAMINE SUSPENSION [KLM LABORATORIES PRIVATE LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=54cfed92-5e28-4a4d-a70f-2a60b5b54c12",
        "matched": "azathioprine",
        "snippet": "Azathioprine or 6-Mercaptopurine: Increased risk of blood dyscrasias; monitor complete blood cell counts and platelet counts.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metformin",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Lactic acidosis risk",
    "effect": "Fatal acidosis",
    "management": "Avoid excessive alcohol",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "6809",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "title": "METFORMIN HYDROCHLORIDE TABLET, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "matched": "alcohol",
        "snippet": "Alcohol Clinical Impact: Alcohol is known to potentiate the effect of metformin on lactate metabolism.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metformin",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "Reduced renal clearance of metformin",
    "effect": "Risk of lactic acidosis",
    "management": "Monitor renal function; consider alternative H2 blocker",
    "evidence_level": "B",
    "sources": [
      "Endocrinology guidelines"
    ],
    "rxcui": [
      "6809",
      "2541"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "title": "METFORMIN HYDROCHLORIDE TABLET, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "matched": "cimetidine",
        "snippet": "Examples: Ranolazine, vandetanib, dolutegravir, and cimetidine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metformin",
      "contrast dye"
    ],
    "severity": "major",
    "mechanism": "Lactic acidosis risk",
    "effect": "Metabolic acidosis",
    "management": "Hold 48h before/after procedure",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "6809",
      "contrast"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "metformin",
      "contrast media"
    ],
    "severity": "major",
    "mechanism": "Risk of lactic acidosis with renal impairment",
    "effect": "Potentially fatal lactic acidosis",
    "management": "Hold metformin 48h before and after contrast administration",
    "evidence_level": "A",
    "sources": [
      "Radiology guidelines",
      "FDA"
    ],
    "rxcui": [
      "6809",
      "72107"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "metformin",
      "heart failure"
    ],
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
    "drugs": [
      "metformin",
      "iodinated contrast"
    ],
    "severity": "major",
    "mechanism": "Lactic acidosis risk",
    "effect": "Severe metabolic acidosis",
    "management": "Hold metformin 48h before/after",
    "evidence_level": "A",
    "sources": [
      "Radiology"
    ],
    "rxcui": [
      "6809",
      "iodinated_contrast"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "title": "METFORMIN HYDROCHLORIDE TABLET, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=104b5f5b-cc83-450d-82ec-1fd20c4f7119",
        "matched": "iodinated contrast",
        "snippet": "Radiological Studies with Contrast:Administration of intravascular iodinated contrast agents in metformin treated patients has led to an acute decrease in renal function and the occurrence of lactic acidosis.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methadone",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "Additive QT prolongation",
    "effect": "Torsades de pointes risk",
    "management": "Avoid combination; ECG monitoring if unavoidable",
    "evidence_level": "B",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "6813",
      "703"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "methadone",
      "fluconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Respiratory depression",
    "management": "Reduce methadone dose",
    "evidence_level": "A",
    "sources": [
      "Pain management"
    ],
    "rxcui": [
      "6813",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c54baaee-8ea4-45f5-a5c8-bb84cf86832f",
        "title": "METHADONE HYDROCHLORIDE TABLET [VISTAPHARM, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c54baaee-8ea4-45f5-a5c8-bb84cf86832f",
        "matched": "fluconazole",
        "snippet": "ketoconazole), protease inhibitors (e.g., ritonavir), fluconazole, fluvoxamine, some selective serotonin reuptake inhibitors (SSRIs) (e.g., sertraline, fluvoxamine).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "98ac5455-d26c-4780-a5a3-bf8d85917626",
        "title": "FLUCONAZOLE TABLET [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=98ac5455-d26c-4780-a5a3-bf8d85917626",
        "matched": "methadone",
        "snippet": "Methadone:Fluconazole may enhance the serum concentration of methadone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methimazole",
      "carbamazepine"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced hepatic metabolism",
    "effect": "Reduced methimazole efficacy",
    "management": "Monitor thyroid function",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "6835",
      "2002"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "methimazole",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Altered vitamin K metabolism",
    "effect": "Enhanced anticoagulant effect",
    "management": "Monitor INR closely during thyroid treatment",
    "evidence_level": "B",
    "sources": [
      "Clinical experience"
    ],
    "rxcui": [
      "6916",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f69edfa9-0efb-4fe8-aeab-50f7baeebb6a",
        "title": "METHIMAZOLE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f69edfa9-0efb-4fe8-aeab-50f7baeebb6a",
        "matched": "warfarin",
        "snippet": "rug Interactions Anticoagulants (oral):Due to potential inhibition of vitamin K activity by methimazole, the activity of oral anticoagulants (e.g., warfarin) may be increased; additional monitoring of PT/INR should be considered, especially before surgical procedures.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methocarbamol",
      "pyridostigmine"
    ],
    "severity": "moderate",
    "mechanism": "Antagonistic effects at neuromuscular junction",
    "effect": "Reduced effectiveness of both drugs",
    "management": "Monitor therapeutic response",
    "evidence_level": "C",
    "sources": [
      "Theoretical"
    ],
    "rxcui": [
      "6876",
      "8892"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d217bd1d-0b6e-4a4c-a47b-de73b94e8b13",
        "title": "METHOCARBAMOL TABLET [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d217bd1d-0b6e-4a4c-a47b-de73b94e8b13",
        "matched": "pyridostigmine",
        "snippet": "Methocarbamol may inhibit the effect of pyridostigmine bromide.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methotrexate",
      "acitretin"
    ],
    "severity": "major",
    "mechanism": "Additive hepatotoxicity",
    "effect": "Severe liver damage",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "6851",
      "1221"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a6546625-acb8-460e-b34e-f795bfb3680a",
        "title": "ACITRETIN CAPSULE [SIGMAPHARM LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a6546625-acb8-460e-b34e-f795bfb3680a",
        "matched": "methotrexate",
        "snippet": "Methotrexate: An increased risk of hepatitis has been reported to result from combined use of methotrexate and etretinate.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methotrexate",
      "folic acid"
    ],
    "severity": "moderate",
    "mechanism": "Reduced MTX efficacy",
    "effect": "Treatment failure",
    "management": "Use leucovorin instead",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "6851",
      "4143"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "title": "METHOTREXATE TABLET [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "matched": "folic acid",
        "snippet": "Folic Acid Coadministration of methotrexate with folic acid or its derivatives decreases the clinical effectiveness of methotrexate in patients with neoplastic diseases.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "368b69a8-a021-47e3-a6d7-e3497d7363b1",
        "title": "FOLIC ACID TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=368b69a8-a021-47e3-a6d7-e3497d7363b1",
        "matched": "methotrexate",
        "snippet": "Folate deficiency may result from increased loss of folate, as in renal dialysis and/or interference with metabolism (e.g., folic acid antagonists such as methotrexate); the administration of anticonvulsants, such as diphenylhydantoin, primidone, and barbiturates; alcohol consumption and, especially, alcoholic cirrhosis; and the administration of pyrimethamine and nitrofurantoin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methotrexate",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Immunosuppression prevents vaccine response",
    "effect": "Vaccine failure and infection risk",
    "management": "Avoid live vaccines; use killed vaccines",
    "evidence_level": "A",
    "sources": [
      "CDC immunization guidelines"
    ],
    "rxcui": [
      "6851",
      "live_vaccine"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "title": "METHOTREXATE TABLET [AMERICAN HEALTH PACKAGING]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "matched": "live vaccines",
        "snippet": "Immunizations and Risk Live Vaccines: Immunizations with live vaccines is not recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methotrexate",
      "probenecid"
    ],
    "severity": "major",
    "mechanism": "Reduced renal clearance of methotrexate",
    "effect": "Severe methotrexate toxicity",
    "management": "Avoid combination; monitor methotrexate levels",
    "evidence_level": "A",
    "sources": [
      "Oncology guidelines",
      "Guidelines",
      "Rheumatology"
    ],
    "rxcui": [
      "6851",
      "8698"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "title": "METHOTREXATE TABLET [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aafd97c1-3a0a-42b2-845a-a9db9bb7d876",
        "matched": "probenecid",
        "snippet": "ding neomycin) Oral or intravenous penicillin or sulfonamide antibiotics Highly protein-bound drugs (e.g., oral anticoagulants, phenytoin, salicylates, sulfonamides, sulfonylureas, and tetracyclines) Probenecid Antifolate drugs (e.g., dapsone, pemetrexed, pyrimethamine and sulphonamides) Aspirin and other nonsteroidal anti-inflammatory drugs Hepatotoxic products Highly protein-bound drugs (e.g., oral anticoagulants,",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "573e61e5-f5e1-4119-9d8e-d9a961a1baa9",
        "title": "PROBENECID AND COLCHICINE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=573e61e5-f5e1-4119-9d8e-d9a961a1baa9",
        "matched": "methotrexate",
        "snippet": "In animals and in humans, probenecid has been reported to increase plasma concentrations of methotrexate (see WARNINGS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methotrexate",
      "trimethoprim-sulfamethoxazole"
    ],
    "severity": "major",
    "mechanism": "Reduced folate metabolism and renal clearance",
    "effect": "Severe bone marrow toxicity",
    "management": "Avoid combination; use alternative antibiotic",
    "evidence_level": "A",
    "sources": [
      "Rheumatology guidelines",
      "Rheumatology"
    ],
    "rxcui": [
      "6851",
      "8576"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "methylphenidate",
      "pressor agents"
    ],
    "severity": "major",
    "mechanism": "Enhanced sympathetic effects",
    "effect": "Hypertensive crisis",
    "management": "Monitor BP closely",
    "evidence_level": "A",
    "sources": [
      "ADHD guidelines"
    ],
    "rxcui": [
      "6901",
      "pressor_agents"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "methylprednisolone",
      "cyclosporine"
    ],
    "severity": "moderate",
    "mechanism": "Mutual inhibition of metabolism",
    "effect": "Increased levels of both drugs",
    "management": "Monitor for toxicity; consider dose reductions",
    "evidence_level": "A",
    "sources": [
      "Transplant literature"
    ],
    "rxcui": [
      "6922",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a363f0cd-9c8e-4622-9271-171706846b96",
        "title": "METHYLPREDNISOLONE ACETATE INJECTION, SUSPENSION [SANDOZ INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a363f0cd-9c8e-4622-9271-171706846b96",
        "matched": "cyclosporine",
        "snippet": "Cyclosporine: Increased activity of both cyclosporine and corticosteroids may occur when the two are used concurrently.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "methylprednisolone",
        "snippet": "Drugs That Increase Cyclosporine Concentrations Calcium Channel Blockers Antifungals Antibiotics Glucocorticoids Other Drugs diltiazem fluconazole azithromycin methylprednisolone Allopurinol nicardipine itraconazole clarithromycin Amiodarone verapamil ketoconazole erythromycin Bromocriptine voriconazole quinupristin/ dalfopristin colchicine danazol imatinib metoclopramide nefazodone oral contraceptives HIV Protease i",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "methylprednisolone",
      "cyp3a4 inducers"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced steroid metabolism",
    "effect": "Reduced anti-inflammatory effect",
    "management": "Increase steroid dose",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "6902",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "metoclopramide",
      "levodopa"
    ],
    "severity": "major",
    "mechanism": "Dopamine receptor antagonism",
    "effect": "Worsening of Parkinson symptoms",
    "management": "Avoid metoclopramide in Parkinson patients",
    "evidence_level": "A",
    "sources": [
      "Movement disorder guidelines"
    ],
    "rxcui": [
      "6915",
      "6047"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "9e3c796b-2e68-4bcc-b927-18a58bea4703",
        "title": "CARBIDOPA-LEVODOPA (CARBIDOPA AND LEVODOPA) TABLET [ADVAGEN PHARMA LTD.,]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9e3c796b-2e68-4bcc-b927-18a58bea4703",
        "matched": "metoclopramide",
        "snippet": "Although metoclopramide may increase the bioavailability of levodopa by increasing gastric emptying, metoclopramide may also adversely affect disease control by its dopamine receptor antagonistic properties.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metoprolol",
      "fluoxetine"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition increases metoprolol levels",
    "effect": "Enhanced beta-blockade",
    "management": "Monitor heart rate and blood pressure",
    "evidence_level": "B",
    "sources": [
      "Clinical pharmacology",
      "Studies"
    ],
    "rxcui": [
      "6918",
      "4493"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3ecff825-34ea-4535-b935-627bf2c13d93",
        "title": "METOPROLOL TARTRATE TABLET [ADVAGEN PHARMA LTD]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3ecff825-34ea-4535-b935-627bf2c13d93",
        "matched": "fluoxetine",
        "snippet": "CYP2D6 Inhibitors Drugs that are strong inhibitors of CYP2D6 such as quinidine, fluoxetine, paroxetine, and propafenone were shown to double metoprolol concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metronidazole",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Aldehyde dehydrogenase inhibition",
    "effect": "Disulfiram-like reaction with nausea, vomiting",
    "management": "Avoid alcohol during and 72h after treatment",
    "evidence_level": "A",
    "sources": [
      "Clinical evidence",
      "Clinical"
    ],
    "rxcui": [
      "6932",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8f1de4ca-a005-4ca9-a43a-380429c80d6f",
        "title": "METRONIDAZOLE TABLET [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8f1de4ca-a005-4ca9-a43a-380429c80d6f",
        "matched": "alcohol",
        "snippet": "Interaction with Alcohol Use of oral metronidazole is associated with a disulfiram-like reaction to alcohol, including abdominal cramps, nausea, vomiting, headaches, and flushing.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "metronidazole",
      "disulfiram"
    ],
    "severity": "major",
    "mechanism": "Aldehyde inhibition",
    "effect": "Severe reaction",
    "management": "Separate by 2 weeks",
    "evidence_level": "A",
    "sources": [
      "Experience",
      "Case reports"
    ],
    "rxcui": [
      "6932",
      "3467"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8f1de4ca-a005-4ca9-a43a-380429c80d6f",
        "title": "METRONIDAZOLE TABLET [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8f1de4ca-a005-4ca9-a43a-380429c80d6f",
        "matched": "disulfiram",
        "snippet": "rug Interactions Disulfiram Psychotic reactions have been reported in alcoholic patients who are using metronidazole and disulfiram concurrently.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "b90f8ff4-4fb3-46ab-8149-cb55f24a4044",
        "title": "DISULFIRAM TABLET [ALVOGEN INC.]",
        "section": "Contraindications",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b90f8ff4-4fb3-46ab-8149-cb55f24a4044",
        "matched": "metronidazole",
        "snippet": "ONTRAINDICATIONS Patients who are receiving or have recently received metronidazole, paraldehyde, alcohol, or alcohol-containing preparations, e.g., cough syrups, tonics and the like, should not be given disulfiram.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "micafungin",
      "nifedipine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased levels",
    "management": "Monitor BP",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "445635",
      "7240"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a95f901e-0ac4-4ec0-9720-9c6a066cd06c",
        "title": "MICAFUNGIN IN SODIUM CHLORIDE INJECTION [BAXTER HEALTHCARE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a95f901e-0ac4-4ec0-9720-9c6a066cd06c",
        "matched": "nifedipine",
        "snippet": "DRUG INTERACTIONS Monitor for sirolimus, itraconazole or nifedipine toxicity, and dosage of sirolimus, itraconazole or nifedipine should be reduced, if necessary.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "midazolam",
      "grapefruit juice"
    ],
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
    "drugs": [
      "milrinone",
      "phosphodiesterase inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Additive effects",
    "effect": "Severe hypotension",
    "management": "Monitor hemodynamics",
    "evidence_level": "B",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "30131",
      "pde_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "mirtazapine",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Additive CNS depression",
    "effect": "Severe sedation and respiratory depression",
    "management": "Avoid alcohol; counsel patients about risks",
    "evidence_level": "A",
    "sources": [
      "Clinical guidelines"
    ],
    "rxcui": [
      "15996",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "df06ea51-a962-49d0-a449-137e2220ce7e",
        "title": "MIRTAZAPINE TABLET, FILM COATED [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=df06ea51-a962-49d0-a449-137e2220ce7e",
        "matched": "alcohol",
        "snippet": "Benzodiazepines and Alcohol Clinical Impact The concomitant use of benzodiazepines or alcohol with mirtazapine tablets increases the impairment of cognitive and motor skills produced by mirtazapine tablets alone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "mirtazapine",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Protein binding displacement",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR closely",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "15996",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "df06ea51-a962-49d0-a449-137e2220ce7e",
        "title": "MIRTAZAPINE TABLET, FILM COATED [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=df06ea51-a962-49d0-a449-137e2220ce7e",
        "matched": "warfarin",
        "snippet": "Warfarin Clinical Impact The concomitant use of warfarin with mirtazapine tablets may result in an increase in INR [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "modafinil",
      "cyclosporine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced cyclosporine levels",
    "management": "Monitor cyclosporine levels",
    "evidence_level": "B",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "73072",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bfe1b1b7-52ec-41b3-94d6-ac56036eea80",
        "title": "MODAFINIL TABLET [ASCLEMED USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bfe1b1b7-52ec-41b3-94d6-ac56036eea80",
        "matched": "cyclosporine",
        "snippet": "DRUG INTERACTIONS Effects of Modafinil on CYP3A4/5 Substrates The clearance of drugs that are substrates for CYP3A4/5 (e.g., steroidal contraceptives, cyclosporine, midazolam, and triazolam) may be increased by modafinil via induction of metabolic enzymes, which results in lower systemic exposure.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "molidustat",
      "cyp2c19 polymorphism"
    ],
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
    "drugs": [
      "momelotinib",
      "cyp1a2 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Increased momelotinib exposure",
    "management": "Monitor for toxicity",
    "evidence_level": "B",
    "sources": [
      "Clinical trials"
    ],
    "rxcui": [
      "momelotinib",
      "cyp1a2_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "monoamine oxidase inhibitors",
      "tyramine foods"
    ],
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
    "drugs": [
      "montelukast",
      "phenobarbital"
    ],
    "severity": "moderate",
    "mechanism": "CYP induction",
    "effect": "Reduced montelukast efficacy",
    "management": "Monitor asthma control",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "9129",
      "8134"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "morphine",
      "gabapentin"
    ],
    "severity": "moderate",
    "mechanism": "Additive CNS effects",
    "effect": "Enhanced sedation",
    "management": "Lower doses",
    "evidence_level": "B",
    "sources": [
      "Guidelines",
      "Pain management literature",
      "Pain management",
      "Pain research"
    ],
    "rxcui": [
      "7052",
      "25480"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "be420e8b-bcb0-49b5-bb4d-1df8b9959809",
        "title": "MORPHINE SULFATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=be420e8b-bcb0-49b5-bb4d-1df8b9959809",
        "matched": "gabapentin",
        "snippet": "Examples: Benzodiazepines and other sedatives/hypnotics, anxiolytics, tranquilizers, muscle relaxants, general anesthetics, antipsychotics, gabapentinoids (gabapentin or pregabalin), other opioids, alcohol.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "16542ee6-0e0e-4d3c-8b32-60ff6ef48846",
        "title": "GABAPENTIN CAPSULE [SCIEGEN PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=16542ee6-0e0e-4d3c-8b32-60ff6ef48846",
        "matched": "morphine",
        "snippet": "DRUG INTERACTIONS Concentrations increased by morphine; may need dose adjustment (5.4, 7.1) 7.1 Opioids Respiratory depression and sedation, sometimes resulting in death, have been reported following coadministration of gabapentin with opioids (e.g., morphine, hydrocodone, oxycodone, buprenorphine) [see Warnings and Precautions (5.8)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "moxifloxacin",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "Additive QT prolongation",
    "effect": "Torsades de pointes risk",
    "management": "Avoid combination; monitor ECG if unavoidable",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "131725",
      "703"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5c2a9116-d6e4-429e-88bb-bb6bfedac2f0",
        "title": "MOXIFLOXACIN HYDROCHLORIDE TABLETS, 400 MG TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5c2a9116-d6e4-429e-88bb-bb6bfedac2f0",
        "matched": "amiodarone",
        "snippet": "ons, such as clinically significant bradycardia and acute myocardial ischemia, • Uncorrected hypokalemia or hypomagnesemia • Class IA (for example, quinidine, procainamide) or Class III (for example, amiodarone, sotalol) antiarrhythmic agents • Other drugs that prolong the QT interval such as cisapride, erythromycin, antipsychotics, and tricyclic antidepressants Elderly patients using intravenous moxifloxacin hydroch",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "muscle relaxants",
      "alcohol"
    ],
    "severity": "moderate",
    "mechanism": "Additive CNS effects",
    "effect": "Severe sedation and ataxia",
    "management": "Avoid alcohol during therapy",
    "evidence_level": "A",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "7302",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "mycophenolate",
      "antacids"
    ],
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Decreased immunosuppression",
    "management": "Separate administration",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "74478",
      "897"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f2eafcbb-77ab-461e-aa09-9cc4123eb3bd",
        "title": "MYCOPHENOLATE MOFETIL TABLET, FILM COATED [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f2eafcbb-77ab-461e-aa09-9cc4123eb3bd",
        "matched": "antacids",
        "snippet": "DRUG INTERACTIONS • See FPI for drugs that may interfere with systemic exposure and reduce mycophenolate mofetil efficacy: antacids with magnesium or aluminum hydroxide, proton pump inhibitors, drugs that interfere with enterohepatic recirculation, telmisartan, calcium-free phosphate binders.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "naloxone",
      "buprenorphine"
    ],
    "severity": "moderate",
    "mechanism": "High affinity competition",
    "effect": "Limited reversal efficacy",
    "management": "Use higher naloxone doses",
    "evidence_level": "B",
    "sources": [
      "Emergency medicine"
    ],
    "rxcui": [
      "7242",
      "1819"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b59ee3cc-9604-4abc-81be-897e2f42aa67",
        "title": "NALOXONE HYDROCHLORIDE INJECTION, SOLUTION [SOMERSET THERAPEUTICS, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b59ee3cc-9604-4abc-81be-897e2f42aa67",
        "matched": "buprenorphine",
        "snippet": "rug Interactions Large doses of naloxone are required to antagonize buprenorphine since the latter has a long duration of action due to its slow rate of binding and subsequent slow dissociation from the opioid receptor.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "69ec3405-78ee-4cb4-9180-9bea937a8dcd",
        "title": "BUPRENORPHINE HYDROCHLORIDE INJECTION [GLAND PHARMA LIMITED]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=69ec3405-78ee-4cb4-9180-9bea937a8dcd",
        "matched": "naloxone",
        "snippet": "Management of respiratory depression may include close observation, supportive measures, and use of opioid overdose reversal agents (e.g., naloxone, nalmefene), depending on the patient's clinical status [see OVERDOSAGE].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "naloxone",
      "clonidine overdose"
    ],
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
    "drugs": [
      "naproxen",
      "sun exposure"
    ],
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
    "drugs": [
      "natalizumab",
      "immunosuppressants"
    ],
    "severity": "major",
    "mechanism": "Over-immunosuppression",
    "effect": "PML risk",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "MS guidelines"
    ],
    "rxcui": [
      "1649483",
      "immunosuppressants"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c5fdde91-1989-4dd2-9129-4f3323ea2962",
        "title": "TYSABRI (NATALIZUMAB) INJECTION [BIOGEN INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c5fdde91-1989-4dd2-9129-4f3323ea2962",
        "matched": "immunosuppressants",
        "snippet": "DRUG INTERACTIONS Because of the potential for increased risk of PML and other infections, Crohn's disease patients receiving TYSABRI should not be treated with concomitant immunosuppressants (e.g., 6-mercaptopurine, azathioprine, cyclosporine, or methotrexate) or inhibitors of TNF-α, and corticosteroids should be tapered in those patients with Crohn's disease who are on chronic corticosteroids when they start TYSAB",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nebivolol",
      "fluconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Increased nebivolol exposure",
    "management": "Monitor for excessive beta-blockade",
    "evidence_level": "C",
    "sources": [
      "Manufacturer data"
    ],
    "rxcui": [
      "52175",
      "4450"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "neostigmine",
      "atropine"
    ],
    "severity": "minor",
    "mechanism": "Complementary effects",
    "effect": "Reversal without bradycardia",
    "management": "Standard combination",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "7175",
      "1202"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "673140f7-273e-4543-98b5-6b12c59f540b",
        "title": "NEOSTIGMINE METHYLSULFATE INJECTION [PAR HEALTH USA, LLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=673140f7-273e-4543-98b5-6b12c59f540b",
        "matched": "atropine",
        "snippet": "WARNINGS AND PRECAUTIONS Bradycardia: Atropine or glycopyrrolate should be administered prior to neostigmine methylsulfate injection to lessen risk of bradycardia.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "niacin",
      "statins"
    ],
    "severity": "moderate",
    "mechanism": "Additive myopathy risk",
    "effect": "Increased muscle toxicity",
    "management": "Monitor CPK levels; start with low doses",
    "evidence_level": "B",
    "sources": [
      "Clinical experience"
    ],
    "rxcui": [
      "7454",
      "36567"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "nicardipine",
      "fentanyl"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypotension",
    "effect": "Severe hypotension",
    "management": "Monitor BP closely",
    "evidence_level": "B",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "7243",
      "4337"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "nifedipine",
      "grapefruit juice"
    ],
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
    "drugs": [
      "nilotinib",
      "proton pump inhibitors"
    ],
    "severity": "major",
    "mechanism": "Reduced nilotinib absorption in alkaline pH",
    "effect": "Loss of therapeutic efficacy",
    "management": "Take nilotinib 2h before or 10h after PPI",
    "evidence_level": "A",
    "sources": [
      "FDA label"
    ],
    "rxcui": [
      "784015",
      "40790"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e27c3e09-bc4f-4f01-be05-1c43ac72285d",
        "title": "NILOTINIB CAPSULE [CIPLA USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e27c3e09-bc4f-4f01-be05-1c43ac72285d",
        "matched": "proton pump inhibitors",
        "snippet": "Proton Pump Inhibitors: Use short-acting antacids or H2 blockers as an alternative to proton pump inhibitors.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nintedanib",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "P-gp and CYP3A4 inhibition",
    "effect": "Increased nintedanib exposure",
    "management": "Monitor for toxicity",
    "evidence_level": "B",
    "sources": [
      "Pulmonology"
    ],
    "rxcui": [
      "1592737",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4ecf7f05-4a95-b98c-e063-6394a90ab896",
        "title": "NINTEDANIB CAPSULE [GOLDEN STATE MEDICAL SUPPLY, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4ecf7f05-4a95-b98c-e063-6394a90ab896",
        "matched": "ketoconazole",
        "snippet": "Coadministration with oral doses of a P-gp and CYP3A4 inhibitor, ketoconazole, increased exposure to nintedanib by 60%.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nirmatrelvir-ritonavir",
      "strong cyp3a4 substrates"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Substrate toxicity",
    "management": "Avoid or reduce substrate dose",
    "evidence_level": "A",
    "sources": [
      "COVID treatment"
    ],
    "rxcui": [
      "2587250",
      "cyp3a4_substrates"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "nisoldipine",
      "phenytoin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces nisoldipine levels",
    "effect": "Loss of antihypertensive effect",
    "management": "Consider alternative calcium channel blocker",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "55301",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a52b773a-44f9-442f-a4be-39f79a558bd2",
        "title": "NISOLDIPINE TABLET, FILM COATED, EXTENDED RELEASE [HERITAGE PHARMACEUTICALS INC. D/B/A AVET PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a52b773a-44f9-442f-a4be-39f79a558bd2",
        "matched": "phenytoin",
        "snippet": "Coadministration of phenytoin with a dose bioequivalent to 34 mg nisoldipine extended-release tablets in epileptic patients lowered the nisoldipine plasma concentrations to undetectable levels.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "nisoldipine",
        "snippet": "Phenytoin when given with the combination of fosamprenavir and ritonavir may increase the concentration of amprenavir Calcium channel blockers Nifedipine, nimodipine, nisoldipine, verapamil Other Albendazole (decreases active metabolite), chlorpropamide, clozapine, cyclosporine, digoxin, disopyramide, folic acid, methadone, mexiletine, praziquantel, quetiapine 7.3 Hyperammonemia with Concomitant Use of Valproate Conc",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nitrofurantoin",
      "magnesium"
    ],
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Treatment failure",
    "management": "Separate administration",
    "evidence_level": "B",
    "sources": [
      "Urology"
    ],
    "rxcui": [
      "7454",
      "6547"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "nitrous oxide",
      "vitamin b12 deficiency"
    ],
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
    "drugs": [
      "norepinephrine",
      "tcas"
    ],
    "severity": "major",
    "mechanism": "Enhanced sympathetic effects",
    "effect": "Severe hypertension",
    "management": "Use alternative vasopressor",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "7531",
      "321988"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "nortriptyline",
      "quinidine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition increases tricyclic levels",
    "effect": "Cardiac conduction abnormalities",
    "management": "Monitor ECG and tricyclic levels",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "7531",
      "9068"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3c57301f-5128-295e-e063-6394a90ad99e",
        "title": "NORTRIPTYLINE HYDROCHLORIDE CAPSULE [ST. MARY'S MEDICAL PARK PHARMACY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3c57301f-5128-295e-e063-6394a90ad99e",
        "matched": "quinidine",
        "snippet": "The drugs that inhibit cytochrome P450 2D6 include some that are not metabolized by the enzyme (quinidine; cimetidine) and many that are substrates for P450 2D6 (many other antidepressants, phenothiazines, and the Type 1C antiarrhythmics propafenone and flecainide).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nsaids",
      "aspirin"
    ],
    "severity": "moderate",
    "mechanism": "Competitive COX-1 inhibition",
    "effect": "Reduced cardioprotection",
    "management": "Separate timing appropriately",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "7804",
      "1191"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c994d693-a505-4794-8803-4b91098b6517",
        "title": "REGULAR STRENGTH ENTERIC COATED ASPIRIN (ASPIRIN) TABLET, COATED [REMEDYREPACK INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c994d693-a505-4794-8803-4b91098b6517",
        "matched": "nsaids",
        "snippet": "ce is higher if you: are age 60 or older have had stomach ulcers or bleeding problems take a blood thinning (anticoagulant) or steroid drug take other drugs containing prescription or nonprescription NSAIDs (aspirin, ibuprofen, naproxen, or others) have 3 or more alcoholic drinks every day while using this product take more or for a longer time than directed Do not use if you are allergic to aspirin or any other pain",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "nsaids",
      "chronic kidney disease"
    ],
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
    "drugs": [
      "nsaids",
      "elderly"
    ],
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
    "drugs": [
      "nsaids",
      "heart failure"
    ],
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
    "drugs": [
      "ocrelizumab",
      "hepatitis b reactivation"
    ],
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
    "drugs": [
      "octreotide",
      "cyclosporine"
    ],
    "severity": "moderate",
    "mechanism": "Reduced cyclosporine absorption",
    "effect": "Organ rejection risk",
    "management": "Monitor cyclosporine levels",
    "evidence_level": "B",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "7597",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "9502860d-0261-4d69-a4be-827a5376d356",
        "title": "OCTREOTIDE ACETATE INJECTION, SOLUTION [HIKMA PHARMACEUTICALS USA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9502860d-0261-4d69-a4be-827a5376d356",
        "matched": "cyclosporine",
        "snippet": "DRUG INTERACTIONS The following drugs require monitoring and possible dose adjustment when used with octreotide acetate injection: cyclosporine, insulin, oral hypoglycemic agents, beta-blockers, and bromocriptine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "octreotide",
        "snippet": "John’s Wort rifampin oxcarbazepine octreotide phenobarbital orlistat phenytoin sulfinpyrazone terbinafine ticlopidine Bosentan Coadministration of bosentan (250 to 1000 mg every 12 hours based on tolerability) and cyclosporine (300 mg every 12 hours for 2 days then dosing to achieve a Cmin of 200 to 250 ng/mL) for 7 days in healthy subjects resulted in decreases in the cyclosporine mean dose-normalized AUC, Cmax, and",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "olanzapine",
      "carbamazepine"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 induction",
    "effect": "Loss of efficacy",
    "management": "Increase dose",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "61381",
      "2002"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2ae07ad4-4e58-4740-9f02-035ec061fefc",
        "title": "OLANZAPINE TABLET [CADILA PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2ae07ad4-4e58-4740-9f02-035ec061fefc",
        "matched": "carbamazepine",
        "snippet": "Carbamazepine: Increased clearance of olanzapine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "omalizumab",
      "live vaccines"
    ],
    "severity": "moderate",
    "mechanism": "Immunomodulation",
    "effect": "Reduced vaccine efficacy",
    "management": "Avoid live vaccines",
    "evidence_level": "C",
    "sources": [
      "Immunology"
    ],
    "rxcui": [
      "298298",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "omeprazole",
      "diazepam"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C19 inhibition reduces diazepam clearance",
    "effect": "Prolonged sedation",
    "management": "Consider dose reduction or shorter-acting benzodiazepine",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "7646",
      "3322"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "omeprazole",
      "iron"
    ],
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Iron deficiency",
    "management": "Separate doses",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "7646",
      "6045"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ondansetron",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Serotonin toxicity",
    "management": "Avoid combination; use alternative antiemetic",
    "evidence_level": "B",
    "sources": [
      "FDA warnings",
      "FDA"
    ],
    "rxcui": [
      "7604",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "61758670-91ab-4422-8d9d-e8ca87eecae8",
        "title": "ONDANSETRON INJECTION [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=61758670-91ab-4422-8d9d-e8ca87eecae8",
        "matched": "tramadol",
        "snippet": "Tramadol Although there are no data on pharmacokinetic drug interactions between ondansetron and tramadol, data from two small trials indicate that concomitant use of ondansetron may result in reduced analgesic activity of tramadol.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "opioids",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Synergistic respiratory depression",
    "effect": "Fatal overdose",
    "management": "Avoid concurrent use",
    "evidence_level": "A",
    "sources": [
      "CDC"
    ],
    "rxcui": [
      "7052",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "orelabrutinib",
      "cyp3a4 interactions"
    ],
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
    "drugs": [
      "orlistat",
      "cyclosporine"
    ],
    "severity": "moderate",
    "mechanism": "Reduced absorption",
    "effect": "Organ rejection risk",
    "management": "Separate by 3 hours",
    "evidence_level": "B",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "37925",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a2d3bd73-f3af-4ea5-a57c-66b0004cfe4f",
        "title": "ALLI (ORLISTAT) CAPSULE [HALEON US HOLDINGS LLC]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a2d3bd73-f3af-4ea5-a57c-66b0004cfe4f",
        "matched": "cyclosporine",
        "snippet": "Allergy alert: do not use if you are allergic to any of the ingredients in orlistat capsules Do not use if you are taking cyclosporine if you have been diagnosed with problems absorbing food if you are not overweight Ask a doctor before use if you have ever had gallbladder problems kidney disease or kidney stones pancreatitis Ask a doctor or pharmacist before use if you are taking any of the following prescription me",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "title": "CYCLOSPORINE CAPSULE, LIQUID FILLED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aaf79e72-26bf-4152-9cd1-10d8c30fa4fe",
        "matched": "orlistat",
        "snippet": "Compounds that decrease cyclosporine absorption, such as orlistat, should be avoided.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "osimertinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced EGFR inhibition",
    "management": "Avoid strong inducers",
    "evidence_level": "A",
    "sources": [
      "Lung cancer"
    ],
    "rxcui": [
      "1790421",
      "cyp3a4_inducers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5e81b4a7-b971-45e1-9c31-29cea8c87ce7",
        "title": "TAGRISSO (OSIMERTINIB) TABLET, FILM COATED [ASTRAZENECA PHARMACEUTICALS LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5e81b4a7-b971-45e1-9c31-29cea8c87ce7",
        "matched": "strong cyp3a4 inducer",
        "snippet": "If not possible, increase TAGRISSO to 160 mg daily in patients receiving a strong CYP3A4 inducer.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "oxaliplatin",
      "ice"
    ],
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
    "drugs": [
      "oxcarbazepine",
      "felodipine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced antihypertensive effect",
    "management": "Monitor BP",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "28439",
      "25789"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "oxycodone",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "CNS depression",
    "effect": "Respiratory failure",
    "management": "Avoid alcohol",
    "evidence_level": "A",
    "sources": [
      "CDC"
    ],
    "rxcui": [
      "7804",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "title": "OXYCODONE AND ACETAMINOPHEN TABLET [GRANULES PHARMACEUTICALS INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "matched": "alcohol",
        "snippet": "Risks are increased in patients with a personal or family history of substance abuse (including drug or alcohol abuse or addiction) or mental illness (e.g., major depression).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "oxycodone",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases oxycodone exposure",
    "effect": "Enhanced sedation and respiratory depression",
    "management": "Avoid or reduce oxycodone dose; monitor closely",
    "evidence_level": "B",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "7804",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "title": "OXYCODONE AND ACETAMINOPHEN TABLET [GRANULES PHARMACEUTICALS INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "matched": "ketoconazole",
        "snippet": "ome P450 3A4 Inhibitors and Inducers Concomitant use of Oxycodone and Acetaminophen Tablets with a CYP3A4 inhibitor, such as macrolide antibiotics (e.g., erythromycin), azole-antifungal agents (e.g., ketoconazole), and protease inhibitors (e.g., ritonavir), may increase plasma concentrations of oxycodone hydrochloride and prolong opioid adverse reactions, which may cause potentially fatal respiratory depression [see",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "oxycontin",
      "alcohol"
    ],
    "severity": "major",
    "mechanism": "Enhanced CNS depression",
    "effect": "Fatal respiratory depression",
    "management": "Absolute avoidance",
    "evidence_level": "A",
    "sources": [
      "FDA black box"
    ],
    "rxcui": [
      "7804",
      "alcohol"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bfdfe235-d717-4855-a3c8-a13d26dadede",
        "title": "OXYCONTIN (OXYCODONE HYDROCHLORIDE) TABLET, FILM COATED, EXTENDED RELEASE [KNOA PHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bfdfe235-d717-4855-a3c8-a13d26dadede",
        "matched": "alcohol",
        "snippet": "Examples: Rifampin, carbamazepine, phenytoin Benzodiazepines and Other Central Nervous System (CNS) Depressants Clinical Impact: Due to additive pharmacologic effect, the concomitant use of benzodiazepines or other CNS depressants, including alcohol, can increase the risk of hypotension, respiratory depression, profound sedation, coma, and death [see Warnings and Precautions (5.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ozanimod",
      "mao inhibitors"
    ],
    "severity": "major",
    "mechanism": "Enhanced serotonergic effects",
    "effect": "Serotonin syndrome",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "2179495",
      "7531"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "93ce2fab-edfb-4804-8074-963071de51e4",
        "title": "ZEPOSIA (OZANIMOD HYDROCHLORIDE) CAPSULE ZEPOSIA 7-DAY STARTER PACK (OZANIMOD HYDROCHLORIDE) KIT ZEPOSIA STARTER KIT (OZANIMOD HYDROCHLORIDE) KIT [CELGENE CORPO",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=93ce2fab-edfb-4804-8074-963071de51e4",
        "matched": "mao inhibitors",
        "snippet": "Potential effects on efficacy or safety with co-administration of MAO inhibitors because of altered exposures of ozanimod and/or its metabolites cannot be ruled out.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "paclitaxel",
      "carboplatin"
    ],
    "severity": "moderate",
    "mechanism": "Sequence-dependent interaction",
    "effect": "Enhanced myelosuppression if carboplatin given first",
    "management": "Administer paclitaxel before carboplatin",
    "evidence_level": "A",
    "sources": [
      "Clinical trials",
      "Oncology protocols"
    ],
    "rxcui": [
      "56946",
      "40048"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "135502ff-002c-4a29-ba93-60855cf44f31",
        "title": "PACLITAXEL 100MG PER VIAL (PACLITAXEL PROTEIN-BOUND PARTICLES) INJECTION, POWDER, LYOPHILIZED, FOR SUSPENSION [EXELAN PHARMACEUTICALS INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=135502ff-002c-4a29-ba93-60855cf44f31",
        "matched": "carboplatin",
        "snippet": "In patients with NSCLC, resume treatment if recommended at permanently reduced doses for both weekly paclitaxel protein-bound particles for injectable suspension (albumin-bound) and every-3-week carboplatin after ANC recovers to at least 1500 cells/mm3 and platelet count of at least 100,000 cells/mm3 on Day 1 or to an ANC of at least 500 cells/mm3 and platelet count of at least 50,000 cells/mm3on Days 8 or 15 of the",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "paclitaxel",
      "doxorubicin"
    ],
    "severity": "moderate",
    "mechanism": "Sequence-dependent pharmacokinetics",
    "effect": "Enhanced cardiotoxicity if doxorubicin first",
    "management": "Administer paclitaxel before doxorubicin",
    "evidence_level": "A",
    "sources": [
      "Clinical trials"
    ],
    "rxcui": [
      "56946",
      "3639"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "pacritinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased pacritinib levels",
    "management": "Reduce pacritinib dose",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2467373",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4b5ab444-0e1a-4984-99db-76ad11a298ee",
        "title": "VONJO (PACRITINIB) CAPSULE [SOBI, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4b5ab444-0e1a-4984-99db-76ad11a298ee",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "Concomitant use of VONJO with strong and moderate CYP3A4 inhibitors increases pacritinib exposure, which may increase the risk of exposure-related adverse reactions [see Clinical Pharmacology (12.3)] Co-administration of VONJO with strong CYP3A4 inhibitors is contraindicated [see Contraindications (4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pancuronium",
      "phenytoin"
    ],
    "severity": "moderate",
    "mechanism": "Accelerated metabolism",
    "effect": "Resistance to paralysis",
    "management": "Increase neuromuscular blocker dose",
    "evidence_level": "B",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "7984",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "pancuronium",
        "snippet": "Neuromuscular blocking agents Cisatracurium, pancuronium, rocuronium and vecuronium: resistance to the neuromuscular blocking action of the nondepolarizing neuromuscular blocking agents has occurred in patients chronically administered phenytoin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pantoprazole",
      "methotrexate"
    ],
    "severity": "moderate",
    "mechanism": "Potential reduced renal clearance",
    "effect": "Increased methotrexate toxicity risk",
    "management": "Monitor for MTX toxicity with high-dose MTX",
    "evidence_level": "C",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "40790",
      "6851"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "410d5577-e50a-44f3-aaa8-fbf391a0c261",
        "title": "PANTOPRAZOLE SODIUM TABLET, DELAYED RELEASE [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=410d5577-e50a-44f3-aaa8-fbf391a0c261",
        "matched": "methotrexate",
        "snippet": "Methotrexate Clinical Impact: Concomitant use of PPIs with methotrexate (primarily at high dose) may elevate and prolong serum concentrations of methotrexate and/or its metabolite hydroxymethotrexate, possibly leading to methotrexate toxicities.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "paricalcitol",
      "digitalis"
    ],
    "severity": "moderate",
    "mechanism": "Hypercalcemia enhances digitalis toxicity",
    "effect": "Cardiac arrhythmias",
    "management": "Monitor calcium and digoxin levels",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "400583",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7259652f-81bc-4ad1-bba5-d01f9fac1b80",
        "title": "ZEMPLAR (PARICALCITOL) INJECTION, SOLUTION [ABBVIE INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7259652f-81bc-4ad1-bba5-d01f9fac1b80",
        "matched": "digitalis",
        "snippet": "Digitalis Compounds Clinical Impact ZEMPLAR can cause hypercalcemia which can potentiate the risk of digitalis toxicity.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "paroxetine",
      "codeine"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Reduced analgesia",
    "management": "Use alternative opioid",
    "evidence_level": "A",
    "sources": [
      "Pain management"
    ],
    "rxcui": [
      "32937",
      "2670"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "parsaclisib",
      "cyp3a4 interactions"
    ],
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
    "drugs": [
      "pegcetacoplan",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Complement inhibition",
    "effect": "Increased infection risk",
    "management": "Complete vaccinations before therapy",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2103177",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "peginesatide",
      "antibody formation"
    ],
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
    "drugs": [
      "pemetrexed",
      "nsaids"
    ],
    "severity": "major",
    "mechanism": "Reduced renal clearance of pemetrexed",
    "effect": "Severe myelosuppression and mucositis",
    "management": "Avoid NSAIDs 2 days before through 2 days after pemetrexed",
    "evidence_level": "A",
    "sources": [
      "FDA label",
      "Oncology guidelines"
    ],
    "rxcui": [
      "373757",
      "26548"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "pemigatinib",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Pemigatinib toxicity",
    "management": "Reduce dose to 9mg daily",
    "evidence_level": "A",
    "sources": [
      "FGFR inhibitors"
    ],
    "rxcui": [
      "2284524",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "pentamidine",
      "foscarnet"
    ],
    "severity": "major",
    "mechanism": "Additive nephrotoxicity",
    "effect": "Severe renal failure",
    "management": "Avoid combination",
    "evidence_level": "B",
    "sources": [
      "HIV guidelines"
    ],
    "rxcui": [
      "8134",
      "12588"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "490a231d-bb24-403d-9733-1a562ecd5917",
        "title": "PENTAMIDINE ISETHIONATE INHALANT [XGEN PHARMACEUTICALS DJB, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=490a231d-bb24-403d-9733-1a562ecd5917",
        "matched": "foscarnet",
        "snippet": "Because the nephrotoxic effects may be additive, the concomitant or sequential use of pentamidine isethionate and other nephrotoxic drugs such as aminoglycosides, amphotericin B, cisplatin, foscarnet, or vancomycin should be closely monitored and avoided, if possible.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "29743168-6dd7-4ee0-bc02-10dbcf2b7896",
        "title": "FOSCARNET SODIUM INJECTION, SOLUTION [SOMERSET THERAPEUTICS, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=29743168-6dd7-4ee0-bc02-10dbcf2b7896",
        "matched": "pentamidine",
        "snippet": "rug Interactions A possible drug interaction of foscarnet sodium injection and intravenous pentamidine has been described.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "perampanel",
      "carbamazepine"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Perampanel inefficacy",
    "management": "Increase perampanel dose significantly",
    "evidence_level": "A",
    "sources": [
      "Epilepsy"
    ],
    "rxcui": [
      "1183795",
      "2002"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5fc14d5a-d0c2-4417-860d-e382c2d38e26",
        "title": "PERAMPANEL TABLET, FILM COATED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5fc14d5a-d0c2-4417-860d-e382c2d38e26",
        "matched": "carbamazepine",
        "snippet": "DRUG INTERACTIONS Contraceptives: 12 mg once daily may decrease the effectiveness of hormonal contraceptives containing levonorgestrel (7.1) Moderate and Strong CYP3A4 Inducers (including carbamazepine, oxcarbazepine, and phenytoin): increase clearance of perampanel and decrease perampanel plasma concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "phenothiazines",
      "sun exposure"
    ],
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
    "drugs": [
      "phenylephrine",
      "maoi"
    ],
    "severity": "major",
    "mechanism": "Enhanced sympathetic activity",
    "effect": "Hypertensive crisis",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "8113",
      "7531"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4cea0781-2513-4030-8568-62dec253f866",
        "title": "PHENYLEPHRINE HYDROCHLORIDE INJECTION [LIFESTAR PHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4cea0781-2513-4030-8568-62dec253f866",
        "matched": "maoi",
        "snippet": "DRUG INTERACTIONS Agonistic effects (increase in phenylephrine hydrochloride blood pressure effect) can occur with monoamine oxidase inhibitors (MAOI), oxytocin and oxytocic drugs, tricyclic antidepressants, angiotensin and aldosterone, atropine, steroids, norepinephrine transporter inhibitors, ergot alkaloids.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "phenytoin",
      "carbamazepine"
    ],
    "severity": "moderate",
    "mechanism": "Mutual enzyme induction",
    "effect": "Reduced levels of both",
    "management": "Monitor levels of both drugs",
    "evidence_level": "A",
    "sources": [
      "Epilepsy",
      "Neurology guidelines"
    ],
    "rxcui": [
      "8183",
      "2002"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "carbamazepine",
        "snippet": "he same time of day Antineoplastic agents usually in combination Bleomycin, carboplatin, cisplatin, doxorubicin, methotrexate Antiviral agents Fosamprenavir, nelfinavir, ritonavir Antiepileptic drugs Carbamazepine, vigabatrin Other Chronic alcohol abuse, diazepam, diazoxide, folic acid, reserpine, rifampin, St. John's wort The induction potency of St. John's wort may vary widely based on preparation., sucralfate, the",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "359585dc-ad0f-465b-b5c4-c4204bef0b0a",
        "title": "CARBAMAZEPINE SUSPENSION [PRECISION DOSE, INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=359585dc-ad0f-465b-b5c4-c4204bef0b0a",
        "matched": "phenytoin",
        "snippet": "Limited evidence suggests that HLA-B*1502 may be a risk factor for the development of SJS/TEN in patients of Chinese ancestry taking other antiepileptic drugs associated with SJS/TEN, including phenytoin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "phenytoin",
      "cyt p450 variants"
    ],
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
    "drugs": [
      "phenytoin",
      "folic acid"
    ],
    "severity": "moderate",
    "mechanism": "Reduced phenytoin levels",
    "effect": "Seizure breakthrough",
    "management": "Monitor levels",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "8183",
      "4143"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "folic acid",
        "snippet": "carboplatin, cisplatin, doxorubicin, methotrexate Antiviral agents Fosamprenavir, nelfinavir, ritonavir Antiepileptic drugs Carbamazepine, vigabatrin Other Chronic alcohol abuse, diazepam, diazoxide, folic acid, reserpine, rifampin, St. John's wort The induction potency of St. John's wort may vary widely based on preparation., sucralfate, theophylline Drugs that may either increase or decrease phenytoin serum levels",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "368b69a8-a021-47e3-a6d7-e3497d7363b1",
        "title": "FOLIC ACID TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=368b69a8-a021-47e3-a6d7-e3497d7363b1",
        "matched": "phenytoin",
        "snippet": "rug Interactions There is evidence that the anticonvulsant action of phenytoin is antagonized by folic acid.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "phenytoin",
      "isoniazid"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition increases phenytoin levels",
    "effect": "Phenytoin toxicity with ataxia, confusion",
    "management": "Monitor phenytoin levels; reduce dose if needed",
    "evidence_level": "A",
    "sources": [
      "Neurology literature",
      "Neurology"
    ],
    "rxcui": [
      "8183",
      "6038"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "isoniazid",
        "snippet": "Sulfonamides Sulfamethizole, sulfaphenazole, sulfadiazine, sulfamethoxazole-trimethoprim Other Acute alcohol intake, amiodarone, chloramphenicol, chlordiazepoxide, disulfiram, estrogen, fluvastatin, isoniazid, methylphenidate, phenothiazines, salicylates, ticlopidine, tolbutamide, trazodone, warfarin Drugs that may decrease phenytoin serum levels Antacids Antacids may affect absorption of phenytoin. Calcium carbonat",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "6dab7b7b-a3a9-47ef-b423-134bc6970d8b",
        "title": "ISONIAZID TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6dab7b7b-a3a9-47ef-b423-134bc6970d8b",
        "matched": "phenytoin",
        "snippet": "Phenytoin Isoniazid may increase serum levels of phenytoin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "phenytoin",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Protein binding displacement",
    "effect": "Initial bleeding risk",
    "management": "Monitor INR closely initially",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "8183",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "warfarin",
        "snippet": "r Acute alcohol intake, amiodarone, chloramphenicol, chlordiazepoxide, disulfiram, estrogen, fluvastatin, isoniazid, methylphenidate, phenothiazines, salicylates, ticlopidine, tolbutamide, trazodone, warfarin Drugs that may decrease phenytoin serum levels Antacids Antacids may affect absorption of phenytoin. Calcium carbonate, aluminum hydroxide, magnesium hydroxide Prevention or Management: Phenytoin and antacids sh",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "phenytoin",
        "snippet": "tine, norfloxacin, oral contraceptives, phenylpropanolamine, propafenone, propranolol, terbinafine, thiabendazole, ticlopidine, verapamil, zileuton montelukast, moricizine, omeprazole, phenobarbital, phenytoin, cigarette smoking CYP3A4 alprazolam, amiodarone, amlodipine, amprenavir, aprepitant, atorvastatin, atazanavir, bicalutamide, cilostazol, cimetidine, ciprofloxacin, clarithromycin, conivaptan, cyclosporine, dar",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pilocarpine",
      "atropine"
    ],
    "severity": "major",
    "mechanism": "Pharmacodynamic antagonism",
    "effect": "Loss of therapeutic effect",
    "management": "Avoid combination; effects are antagonistic",
    "evidence_level": "A",
    "sources": [
      "Pharmacology principles"
    ],
    "rxcui": [
      "8120",
      "1202"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6272ccac-b543-404d-9938-8583bb59ed2c",
        "title": "PILOCARPINE HYDROCHLORIDE TABLET, FILM COATED [AMNEAL PHARMACEUTICALS NY LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6272ccac-b543-404d-9938-8583bb59ed2c",
        "matched": "atropine",
        "snippet": "These effects should be considered when anticholinergic properties may be contributing to the therapeutic effect of concomitant medication (e.g., atropine, inhaled ipratropium).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pimavanserin",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "QT prolongation",
    "management": "Reduce pimavanserin dose by half",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "1723476",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1e6bea44-57d6-4bac-9328-46e1ee59f83b",
        "title": "NUPLAZID (PIMAVANSERIN TARTRATE) CAPSULE NUPLAZID (PIMAVANSERIN TARTRATE) TABLET, COATED [ACADIA PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1e6bea44-57d6-4bac-9328-46e1ee59f83b",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "DRUG INTERACTIONS Strong CYP3A4 Inhibitors: Reduce NUPLAZID dose to 10 mg once daily.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pimozide",
      "macrolide antibiotics"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Pimozide cardiotoxicity",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Psychiatry"
    ],
    "rxcui": [
      "8331",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "70b079e2-a1f7-4a93-8685-d60a4d7c1280",
        "title": "PIMOZIDE TABLET [PAR HEALTH USA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=70b079e2-a1f7-4a93-8685-d60a4d7c1280",
        "matched": "macrolide antibiotics",
        "snippet": "Also, the use of macrolide antibiotics in patients with prolonged QT intervals has been rarely associated with ventricular arrhythmias.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pioglitazone",
      "gemfibrozil"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C8 inhibition increases pioglitazone levels",
    "effect": "Enhanced hypoglycemic effect",
    "management": "Monitor blood glucose; consider dose reduction",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "33738",
      "25025"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "title": "PIOGLITAZONE AND METFORMIN HYDROCHLORIDE TABLET [MACLEODS PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "matched": "gemfibrozil",
        "snippet": "DRUG INTERACTIONS • Strong CYP2C8 inhibitors (e.g., gemfibrozil): Limit pioglitazone and metformin hydrochloride dose to 15 mg/850 mg daily.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cf32b795-bf42-4861-b273-06d27de3f21d",
        "title": "GEMFIBROZIL (GEMFIBROZIL) TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cf32b795-bf42-4861-b273-06d27de3f21d",
        "matched": "pioglitazone",
        "snippet": "C) CYP2C8 Substrates Gemfibrozil is a strong inhibitor of CYP2C8 and may increase exposure of drugs mainly metabolized by CYP2C8 (e.g., dabrafenib, enzalutamide, loperamide, montelukast, paclitaxel, pioglitazone, rosiglitazone).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pioglitazone",
      "insulin"
    ],
    "severity": "moderate",
    "mechanism": "Fluid retention",
    "effect": "Heart failure risk",
    "management": "Monitor for edema",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "33738",
      "5856"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "title": "PIOGLITAZONE AND METFORMIN HYDROCHLORIDE TABLET [MACLEODS PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "matched": "insulin",
        "snippet": "Use of insulin secretagogues or insulin use may increase the risk for hypoglycemia and may require dose reduction.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pioglitazone",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C8 induction",
    "effect": "Reduced glucose control",
    "management": "Monitor glucose closely",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "33738",
      "9384"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "title": "PIOGLITAZONE AND METFORMIN HYDROCHLORIDE TABLET [MACLEODS PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5ff2cd9e-a579-48f5-845f-c37a68372a34",
        "matched": "rifampin",
        "snippet": "CYP2C8 inducers (e.g., rifampin) may decrease pioglitazone concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pirfenidone",
      "ciprofloxacin"
    ],
    "severity": "moderate",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Increased pirfenidone levels",
    "management": "Reduce pirfenidone dose",
    "evidence_level": "B",
    "sources": [
      "Pulmonology"
    ],
    "rxcui": [
      "696181",
      "2551"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "73db516f-8c80-431f-8190-33081718cf8d",
        "title": "PIRFENIDONE TABLET, FILM COATED [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=73db516f-8c80-431f-8190-33081718cf8d",
        "matched": "ciprofloxacin",
        "snippet": "DRUG INTERACTIONS Moderate (e.g., ciprofloxacin) and strong inhibitors of CYP1A2 (e.g., fluvoxamine) increase systemic exposure of pirfenidone and may alter the adverse reaction profile of pirfenidone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "polymyxin",
      "aminoglycosides"
    ],
    "severity": "major",
    "mechanism": "Additive nephrotoxicity",
    "effect": "Acute kidney injury",
    "management": "Monitor creatinine closely",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "8549",
      "723"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "pomalidomide",
      "strong cyp1a2 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Increased pomalidomide levels",
    "management": "Monitor for toxicity",
    "evidence_level": "B",
    "sources": [
      "Multiple myeloma"
    ],
    "rxcui": [
      "1138470",
      "cyp1a2_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b8c3b7f3-7e72-47af-be23-133e7bb3db59",
        "title": "POMALIDOMIDE CAPSULE [NOVADOZ PHARMACEUTICALS LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b8c3b7f3-7e72-47af-be23-133e7bb3db59",
        "matched": "strong cyp1a2 inhibitors",
        "snippet": "DRUG INTERACTIONS Strong CYP1A2 Inhibitors: Avoid concomitant use of strong CYP1A2 inhibitors.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ponesimod",
      "class iii antiarrhythmics"
    ],
    "severity": "major",
    "mechanism": "Additive QT effects",
    "effect": "Torsades de pointes",
    "management": "Monitor ECG",
    "evidence_level": "A",
    "sources": [
      "MS guidelines"
    ],
    "rxcui": [
      "2596735",
      "class_iii_antiarrhythmics"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "posaconazole",
      "digoxin"
    ],
    "severity": "major",
    "mechanism": "P-gp inhibition",
    "effect": "Toxicity",
    "management": "Monitor levels",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "282446",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e0e8023a-3c82-e455-a57b-ccc0206ad156",
        "title": "POSACONAZOLE TABLET, DELAYED RELEASE [BIOCON PHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e0e8023a-3c82-e455-a57b-ccc0206ad156",
        "matched": "digoxin",
        "snippet": "nz, cimetidine Avoid coadministration unless the benefit outweighs the risks (7.1, 7.2) Other drugs metabolized by CYP3A4 Consider dosage adjustment and monitor for adverse effects and toxicity (7.2) Digoxin Monitor digoxin plasma concentrations (7.2) Fosamprenavir Monitor for breakthrough fungal infections (7.1) 7.1 Effects of Other Drugs on Posaconazole and Noxafil PowderMix Posaconazole is primarily metabolized vi",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "posaconazole",
      "tacrolimus"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases tacrolimus levels",
    "effect": "Nephrotoxicity and immunosuppression",
    "management": "Monitor tacrolimus levels; reduce dose significantly",
    "evidence_level": "A",
    "sources": [
      "Transplant guidelines"
    ],
    "rxcui": [
      "282446",
      "42316"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e0e8023a-3c82-e455-a57b-ccc0206ad156",
        "title": "POSACONAZOLE TABLET, DELAYED RELEASE [BIOCON PHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e0e8023a-3c82-e455-a57b-ccc0206ad156",
        "matched": "tacrolimus",
        "snippet": "Tacrolimus At initiation of posaconazole treatment, reduce the tacrolimus dosage to approximately one-third of the original tacrolimus dosage.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "posaconazole",
        "snippet": "Administration (2.2, 2.6) and Clinical Pharmacology (12.3)] Strong CYP3A Inhibitors 3: Protease inhibitors (e.g, nelfinavir, telaprevir, boceprevir, ritonavir), azole antifungals (e.g., voriconazole, posaconazole, itraconazole, ketoconazole), antibiotics (e.g., clarithromycin, troleandomycin, chloramphenicol), nefazodone, letermovir, schisandra sphenanthera extracts May increase tacrolimus whole blood trough concentr",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pramlintide",
      "rapid-acting insulin"
    ],
    "severity": "moderate",
    "mechanism": "Delayed gastric emptying",
    "effect": "Severe hypoglycemia",
    "management": "Reduce mealtime insulin by 50%",
    "evidence_level": "A",
    "sources": [
      "Diabetes guidelines"
    ],
    "rxcui": [
      "69862",
      "5856"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "prasugrel",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Additive bleeding risk",
    "effect": "Severe hemorrhage",
    "management": "Avoid combination; enhanced monitoring if unavoidable",
    "evidence_level": "A",
    "sources": [
      "Antiplatelet guidelines"
    ],
    "rxcui": [
      "613391",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f51e64e0-f556-65d0-a876-fb709aaeefea",
        "title": "PRASUGREL TABLET, FILM COATED [APOTEX CORP.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f51e64e0-f556-65d0-a876-fb709aaeefea",
        "matched": "warfarin",
        "snippet": "Warfarin Coadministration of prasugrel tablets and warfarin increases the risk of bleeding [see Warnings and Precautions (5.1) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "prasugrel",
        "snippet": "se the Risk of Bleeding Drug Class Specific Drugs Anticoagulants argatroban, dabigatran, bivalirudin, desirudin, heparin, lepirudin Antiplatelet Agents aspirin, cilostazol, clopidogrel, dipyridamole, prasugrel, ticlopidine Nonsteroidal Anti-Inflammatory Agents celecoxib, diclofenac, diflunisal, fenoprofen, ibuprofen, indomethacin, ketoprofen, ketorolac, mefenamic acid, naproxen, oxaprozin, piroxicam, sulindac Seroton",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pravastatin",
      "clarithromycin"
    ],
    "severity": "moderate",
    "mechanism": "Transporter inhibition",
    "effect": "Increased pravastatin levels",
    "management": "Monitor for myopathy symptoms",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "42463",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "42ccbca7-fa52-4df9-8f1a-ea7da7312883",
        "title": "PRAVASTATIN SODIUM TABLET [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=42ccbca7-fa52-4df9-8f1a-ea7da7312883",
        "matched": "clarithromycin",
        "snippet": "Select Macrolide Antibiotics Clinical Impact: The risk of myopathy and rhabdomyolysis is increased by concomitant use of clarithromycin or erythromycin with pravastatin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "pravastatin",
        "snippet": "Gastroprokinetic Agents: Cisapride Contraindicated C isapride: [See Contraindications (4.2)] Lipid-lowering agents: Lomitapide Lovastatin Simvastatin Atorvastatin Pravastatin Fluvastatin Contraindicated Use With Caution No Dose Adjustment Lomitapide, L ovastatin, Simvastatin: Clarithromycin may increase the exposure of these drugs by inhibition of CYP3A metabolism, thereby increasing the risk of toxicities from these",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "prednisolone drops",
      "systemic steroids"
    ],
    "severity": "moderate",
    "mechanism": "Additive steroid effects",
    "effect": "Systemic steroid side effects",
    "management": "Monitor for systemic effects",
    "evidence_level": "B",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "8640",
      "1347"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "prednisone",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases steroid levels",
    "effect": "Enhanced corticosteroid effects",
    "management": "Monitor for Cushing syndrome; reduce steroid dose",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "8638",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "199ed6a6-d9d9-49de-b383-5933a026591b",
        "title": "PREDNISONE TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=199ed6a6-d9d9-49de-b383-5933a026591b",
        "matched": "ketoconazole",
        "snippet": "Drugs which inhibit CYP 3A4 (e.g., ketoconazole, itraconazole, ritonavir, indinavir, macrolide antibiotics such as erythromycin) have the potential to result in increased plasma concentrations of corticosteroids.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "prednisone",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "Immunosuppression prevents vaccine response",
    "effect": "Vaccine failure and infection risk",
    "management": "Avoid live vaccines; give killed vaccines 2+ weeks prior",
    "evidence_level": "A",
    "sources": [
      "CDC immunization guidelines"
    ],
    "rxcui": [
      "8638",
      "live_vaccine"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "prednisone",
      "nsaids"
    ],
    "severity": "major",
    "mechanism": "GI ulceration",
    "effect": "Peptic ulcers",
    "management": "PPI prophylaxis",
    "evidence_level": "A",
    "sources": [
      "Guidelines",
      "Gastroenterology"
    ],
    "rxcui": [
      "8638",
      "26548"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "199ed6a6-d9d9-49de-b383-5933a026591b",
        "title": "PREDNISONE TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=199ed6a6-d9d9-49de-b383-5933a026591b",
        "matched": "nsaids",
        "snippet": "Nonsteroidal Anti-Inflammatory Agents (NSAIDS) Concomitant use of aspirin (or other nonsteroidal anti-inflammatory agents) and corticosteroids increases the risk of gastrointestinal side effects.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pregabalin",
      "oxycodone"
    ],
    "severity": "moderate",
    "mechanism": "Additive sedation",
    "effect": "Enhanced respiratory depression",
    "management": "Monitor respiratory status",
    "evidence_level": "B",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "187832",
      "7804"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "59da1a16-d409-49eb-9b44-397c77006043",
        "title": "PREGABALIN CAPSULE [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=59da1a16-d409-49eb-9b44-397c77006043",
        "matched": "oxycodone",
        "snippet": "Pharmacodynamics Multiple oral doses of pregabalin were co-administered with oxycodone, lorazepam, or ethanol.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "title": "OXYCODONE AND ACETAMINOPHEN TABLET [GRANULES PHARMACEUTICALS INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cc966d57-7cdc-4de3-bbcf-718e2fce9cb7",
        "matched": "pregabalin",
        "snippet": "ther CNS depressants, including alcohol (e.g., non-benzodiazepine sedatives/hypnotics, anxiolytics, tranquilizers, muscle relaxants, general anesthetics, antipsychotics, gabapentinoids [gabapentin or pregabalin], and other opioids). Because of these risks, reserve concomitant prescribing of these drugs for use in patients for whom alternative treatment options are inadequate. Observational studies have demonstrated t",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "pretomanid",
      "hepatotoxic drugs"
    ],
    "severity": "major",
    "mechanism": "Additive hepatotoxicity",
    "effect": "Severe liver injury",
    "management": "Monitor LFTs closely",
    "evidence_level": "B",
    "sources": [
      "TB treatment"
    ],
    "rxcui": [
      "2168327",
      "hepatotoxic"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "procainamide",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "Reduced renal clearance",
    "effect": "Procainamide toxicity",
    "management": "Monitor procainamide and NAPA levels",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "8610",
      "2541"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "promethazine",
      "codeine"
    ],
    "severity": "major",
    "mechanism": "Additive respiratory depression",
    "effect": "Life-threatening respiratory depression",
    "management": "Avoid in children <16 years; use with extreme caution",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning"
    ],
    "rxcui": [
      "8698",
      "2670"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "propafenone",
      "metoprolol"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition increases metoprolol levels",
    "effect": "Excessive beta-blockade",
    "management": "Monitor heart rate and blood pressure",
    "evidence_level": "A",
    "sources": [
      "Cardiology literature"
    ],
    "rxcui": [
      "8754",
      "6918"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2ecd6452-ccc3-493f-9a4a-69f0fbf67a42",
        "title": "PROPAFENONE HYDROCHLORIDE CAPSULE, EXTENDED RELEASE [NORTHSTAR RX LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2ecd6452-ccc3-493f-9a4a-69f0fbf67a42",
        "matched": "metoprolol",
        "snippet": "In 4 patients, administration of metoprolol with propafenone increased the metoprolol plasma concentrations at steady state by 100% to 400%.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3ecff825-34ea-4535-b935-627bf2c13d93",
        "title": "METOPROLOL TARTRATE TABLET [ADVAGEN PHARMA LTD]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3ecff825-34ea-4535-b935-627bf2c13d93",
        "matched": "propafenone",
        "snippet": "CYP2D6 Inhibitors Drugs that are strong inhibitors of CYP2D6 such as quinidine, fluoxetine, paroxetine, and propafenone were shown to double metoprolol concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "propofol",
      "fentanyl"
    ],
    "severity": "moderate",
    "mechanism": "Additive respiratory depression",
    "effect": "Apnea",
    "management": "Monitor respiratory status",
    "evidence_level": "A",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "8782",
      "4337"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f23fe3c5-aa37-4ecc-ad76-f13c1a1dabe2",
        "title": "PROPOFOL INJECTION, EMULSION [ANTHEA PHARMA PRIVATE LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f23fe3c5-aa37-4ecc-ad76-f13c1a1dabe2",
        "matched": "fentanyl",
        "snippet": "DRUG INTERACTIONS Opioids and Sedatives The induction dose requirements of propofol injectable emulsion may be reduced in patients with intramuscular or intravenous premedication, particularly with opioids (e.g., morphine, meperidine, and fentanyl, etc.) and combinations of opioids and sedatives (e.g., benzodiazepines, barbiturates, chloral hydrate, droperidol, etc.).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "propofol infusion syndrome",
      "high doses"
    ],
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
    "drugs": [
      "propranolol",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "Hepatic metabolism inhibition",
    "effect": "Enhanced beta-blockade",
    "management": "Use ranitidine instead",
    "evidence_level": "A",
    "sources": [
      "Studies",
      "Clinical studies"
    ],
    "rxcui": [
      "8787",
      "2541"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "title": "PROPRANOLOL HYDROCHLORIDE TABLET [PROFICIENT RX LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "matched": "cimetidine",
        "snippet": "Substrates or Inhibitors of CYP2D6 Blood levels and/ or toxicity of propranolol may be increased by coadministration with substrates or inhibitors of CYP2D6, such as amiodarone, cimetidine, delavudin, fluoxetine, paroxetine, quinidine, and ritonavir.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "496e258d-a5fd-42da-9a86-73afc8be359b",
        "title": "CIMETIDINE TABLET, FILM COATED [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=496e258d-a5fd-42da-9a86-73afc8be359b",
        "matched": "propranolol",
        "snippet": "rug Interactions Cimetidine, apparently through an effect on certain microsomal enzyme systems, has been reported to reduce the hepatic metabolism of warfarin-type anticoagulants, phenytoin, propranolol, nifedipine, chlordiazepoxide, diazepam, certain tricyclic antidepressants, lidocaine, theophylline and metronidazole, thereby delaying elimination and increasing blood levels of these drugs.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "propranolol",
      "insulin"
    ],
    "severity": "moderate",
    "mechanism": "Beta-blockade masks hypoglycemia symptoms",
    "effect": "Unrecognized severe hypoglycemia",
    "management": "Monitor blood glucose frequently; patient education",
    "evidence_level": "A",
    "sources": [
      "Diabetes guidelines",
      "Endocrinology"
    ],
    "rxcui": [
      "8787",
      "5856"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "title": "PROPRANOLOL HYDROCHLORIDE TABLET [PROFICIENT RX LP]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "matched": "insulin",
        "snippet": "Diabetes and Hypoglycemia Beta-adrenergic blockade may prevent the appearance of certain premonitory signs and symptoms (pulse rate and pressure changes) of acute hypoglycemia, especially in labile insulin-dependent diabetics.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "propylthiouracil",
      "theophylline"
    ],
    "severity": "moderate",
    "mechanism": "Altered theophylline metabolism",
    "effect": "Increased theophylline levels",
    "management": "Monitor theophylline levels",
    "evidence_level": "C",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "8794",
      "10379"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b0c23a2c-b250-4c0d-9b2a-c1483faa2ca0",
        "title": "PROPYLTHIOURACIL TABLET [PAR HEALTH USA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b0c23a2c-b250-4c0d-9b2a-c1483faa2ca0",
        "matched": "theophylline",
        "snippet": "Theophylline: Theophylline clearance may decrease when hyperthyroid patients on a stable theophylline regimen become euthyroid; a reduced dose of theophylline may be needed.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "propylthiouracil",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced anticoagulation",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR closely",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "8918",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b0c23a2c-b250-4c0d-9b2a-c1483faa2ca0",
        "title": "PROPYLTHIOURACIL TABLET [PAR HEALTH USA, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b0c23a2c-b250-4c0d-9b2a-c1483faa2ca0",
        "matched": "warfarin",
        "snippet": "rug Interactions Anticoagulants (oral): Due to the potential inhibition of vitamin K activity by propylthiouracil, the activity of oral anticoagulants (e.g., warfarin) may be increased; additional monitoring of PT/INR should be considered, especially before surgical procedures.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "proton pump inhibitors",
      "clopidogrel"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C19 inhibition",
    "effect": "Reduced antiplatelet effect",
    "management": "Use pantoprazole or H2 blocker",
    "evidence_level": "A",
    "sources": [
      "Cardiology",
      "Cardiology guidelines"
    ],
    "rxcui": [
      "40790",
      "32968"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "proton pump inhibitors",
      "elderly"
    ],
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
    "drugs": [
      "psychotropics",
      "elderly"
    ],
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
    "drugs": [
      "quetiapine",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Severe sedation",
    "management": "Reduce dose significantly",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "73178",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6953175c-78ec-442c-b91d-97dfb57db933",
        "title": "QUETIAPINE EXTENDED RELEASE (QUETIAPINE) TABLET, FILM COATED, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6953175c-78ec-442c-b91d-97dfb57db933",
        "matched": "ketoconazole",
        "snippet": "DRUG INTERACTIONS • Concomitant use of strong CYP3A4 inhibitors:Reduce quetiapine dose to one-sixth when coadministered with strong CYP3A4 inhibitors (e.g., ketoconazole, ritonavir) (2.5, 7.1, 12.3) • Concomitant use of strong CYP3A4 inducers:Increase quetiapine dose up to 5 fold when used in combination with a chronic treatment (more than 7 to 14 days) of potent CYP3A4 inducers (e.g., phenytoin, rifampin, St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "quetiapine",
      "phenytoin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced quetiapine efficacy",
    "management": "Increase quetiapine dose",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "51272",
      "8183"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6953175c-78ec-442c-b91d-97dfb57db933",
        "title": "QUETIAPINE EXTENDED RELEASE (QUETIAPINE) TABLET, FILM COATED, EXTENDED RELEASE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6953175c-78ec-442c-b91d-97dfb57db933",
        "matched": "phenytoin",
        "snippet": "DRUG INTERACTIONS • Concomitant use of strong CYP3A4 inhibitors:Reduce quetiapine dose to one-sixth when coadministered with strong CYP3A4 inhibitors (e.g., ketoconazole, ritonavir) (2.5, 7.1, 12.3) • Concomitant use of strong CYP3A4 inducers:Increase quetiapine dose up to 5 fold when used in combination with a chronic treatment (more than 7 to 14 days) of potent CYP3A4 inducers (e.g., phenytoin, rifampin, St.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "46d5c0d1-a97b-46d9-8cf4-994780673337",
        "title": "PHENYTOIN SODIUM CAPSULE, EXTENDED RELEASE [MAJOR PHARMACEUTICALS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=46d5c0d1-a97b-46d9-8cf4-994780673337",
        "matched": "quetiapine",
        "snippet": "e, nimodipine, nisoldipine, verapamil Other Albendazole (decreases active metabolite), chlorpropamide, clozapine, cyclosporine, digoxin, disopyramide, folic acid, methadone, mexiletine, praziquantel, quetiapine 7.3 Hyperammonemia with Concomitant Use of Valproate Concomitant administration of phenytoin and valproate has been associated with an increased risk of valproate-associated hyperammonemia. Patients treated co",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "quinapril",
      "tetracycline"
    ],
    "severity": "moderate",
    "mechanism": "Chelation reduces quinapril absorption",
    "effect": "Reduced antihypertensive effect",
    "management": "Separate administration by 2-3 hours",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "35208",
      "10395"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a62d0ed3-8fcc-45fb-9246-b57b08a11f60",
        "title": "QUINAPRIL (QUINAPRIL HYDROCHLORIDE) TABLET, FILM COATED [BRYANT RANCH PREPACK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a62d0ed3-8fcc-45fb-9246-b57b08a11f60",
        "matched": "tetracycline",
        "snippet": "Tetracycline and other drugs that interact with magnesium Simultaneous administration of tetracycline with quinapril hydrochloride reduced the absorption of tetracycline by approximately 28% to 37%, possibly due to the high magnesium content in quinapril tablets.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "quinidine",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases quinidine levels",
    "effect": "Quinidine toxicity and arrhythmias",
    "management": "Avoid combination; monitor quinidine levels",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "9068",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "title": "DEXTROMETHORPHAN HYDROBROMIDE AND QUINIDINE SULFATE CAPSULE [TEVA PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "matched": "ketoconazole",
        "snippet": "Strong and moderate CYP3A inhibitors include, but are not limited to, atazanavir, clarithromycin, indinavir, itraconazole, ketoconazole, nefazodone, nelfinavir, ritonavir, saquinavir, telithromycin, amprenavir, aprepitant, diltiazem, erythromycin, fluconazole, fosamprenavir, grapefruit juice, and verapamil.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "quinidine",
      "verapamil"
    ],
    "severity": "major",
    "mechanism": "Additive negative inotropic effects",
    "effect": "Heart failure exacerbation",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "9068",
      "11170"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "title": "DEXTROMETHORPHAN HYDROBROMIDE AND QUINIDINE SULFATE CAPSULE [TEVA PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8ef0fcf1-d0b3-45ae-bd11-479aa7ea8896",
        "matched": "verapamil",
        "snippet": "Strong and moderate CYP3A inhibitors include, but are not limited to, atazanavir, clarithromycin, indinavir, itraconazole, ketoconazole, nefazodone, nelfinavir, ritonavir, saquinavir, telithromycin, amprenavir, aprepitant, diltiazem, erythromycin, fluconazole, fosamprenavir, grapefruit juice, and verapamil.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "4f6ae43f-c28a-4eac-9b19-8b5d0c12dfaa",
        "title": "VERAPAMIL HYDROCHLORIDE INJECTION, SOLUTION [HENRY SCHEIN, INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4f6ae43f-c28a-4eac-9b19-8b5d0c12dfaa",
        "matched": "quinidine",
        "snippet": "Quinidine: Intravenous verapamil has been administered to a small number of patients receiving oral quinidine without the occurrence of serious adverse effects.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "quinolones",
      "nsaids"
    ],
    "severity": "moderate",
    "mechanism": "CNS stimulation and seizure risk",
    "effect": "Increased seizure threshold lowering",
    "management": "Use caution in patients with seizure history",
    "evidence_level": "B",
    "sources": [
      "FDA warnings"
    ],
    "rxcui": [
      "26785",
      "26548"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "rabbit anti-thymocyte globulin",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "T-cell depletion",
    "effect": "Life-threatening infections",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "1157813",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bbd8ab99-552e-4b81-aca4-6b0c7af8b9ae",
        "title": "THYMOGLOBULIN (ANTI-THYMOCYTE GLOBULIN (RABBIT)) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [GENZYME CORPORATION]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bbd8ab99-552e-4b81-aca4-6b0c7af8b9ae",
        "matched": "live vaccines",
        "snippet": "Immunization with attenuated live vaccines is not recommended for patients who have recently received THYMOGLOBULIN.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "radioactive iodine",
      "lithium"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced thyroid uptake",
    "effect": "Hypothyroidism",
    "management": "Monitor thyroid function",
    "evidence_level": "B",
    "sources": [
      "Nuclear medicine"
    ],
    "rxcui": [
      "radioactive_iodine",
      "6448"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ramipril",
      "indomethacin"
    ],
    "severity": "moderate",
    "mechanism": "NSAID reduces ACE inhibitor efficacy",
    "effect": "Reduced antihypertensive effect",
    "management": "Monitor blood pressure; avoid NSAIDs if possible",
    "evidence_level": "A",
    "sources": [
      "Hypertension guidelines"
    ],
    "rxcui": [
      "35296",
      "5781"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ranibizumab",
      "anti-vegf agents"
    ],
    "severity": "major",
    "mechanism": "Systemic vegf inhibition",
    "effect": "Thromboembolic events",
    "management": "Monitor for arterial events",
    "evidence_level": "B",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "351297",
      "anti_vegf"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ranitidine",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "Reduced ketoconazole absorption in alkaline pH",
    "effect": "Antifungal treatment failure",
    "management": "Give ketoconazole 2h before H2 blocker",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "8767",
      "6135"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ranolazine",
      "simvastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Statin myopathy",
    "management": "Limit simvastatin to 20mg",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "35829",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d74f3dea-7357-4e9a-be9a-2f498a44108a",
        "title": "RANOLAZINE TABLET, EXTENDED RELEASE [ZYDUS LIFESCIENCES LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d74f3dea-7357-4e9a-be9a-2f498a44108a",
        "matched": "simvastatin",
        "snippet": "CYP3A substrates: Limit simvastatin to 20 mg when used with ranolazine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "ranolazine",
        "snippet": "Amiodarone, Dronedarone, Ranolazine, or Calcium Channel Blockers Clinical Impact: The risk of myopathy and rhabdomyolysis is increased by concomitant use of amiodarone, dronedarone, ranolazine, or calcium channel blockers with simvastatin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ravulizumab",
      "encapsulated bacteria"
    ],
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
    "drugs": [
      "remdesivir",
      "chloroquine"
    ],
    "severity": "moderate",
    "mechanism": "Antagonistic antiviral effects",
    "effect": "Reduced remdesivir efficacy",
    "management": "Avoid combination",
    "evidence_level": "B",
    "sources": [
      "COVID studies"
    ],
    "rxcui": [
      "2284960",
      "2393"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c0978fa8-53ff-4ca2-82a7-567fd3e958ca",
        "title": "VEKLURY (REMDESIVIR) INJECTION VEKLURY (REMDESIVIR) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [GILEAD SCIENCES, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c0978fa8-53ff-4ca2-82a7-567fd3e958ca",
        "matched": "chloroquine",
        "snippet": "DRUG INTERACTIONS 7.1 Effects of Other Drugs on VEKLURY Due to potential antagonism based on data from cell culture experiments, concomitant use of VEKLURY with chloroquine phosphate or hydroxychloroquine sulfate is not recommended [see Warnings and Precautions (5.3) and Microbiology (12.4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "repaglinide",
      "clarithromycin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 and OATP1B1 inhibition",
    "effect": "Severe hypoglycemia",
    "management": "Avoid combination; use alternative antibiotic",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations"
    ],
    "rxcui": [
      "72143",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6ae28683-28cc-408e-90f9-6a3dddfc668d",
        "title": "REPAGLINIDE TABLET [BRYANT RANCH PREPACK]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6ae28683-28cc-408e-90f9-6a3dddfc668d",
        "matched": "clarithromycin",
        "snippet": "Examples: Drugs that are known to inhibit CYP3A4 include antifungal agents (ketoconazole, itraconazole) and antibacterial agents (clarithromycin, erythromycin).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "repaglinide",
        "snippet": "these drugs [see Contraindications (4.5) and Warnings and Precautions (5.4)] Atorvastatin, Pravastatin, Fluvastatin: [See Warnings and Precautions (5.4)] Hypoglycemic Agents: Nateglinide Pioglitazone Repaglinide Rosiglitazone Insulin Use With Caution Nateglinide, Pioglitazone, Repaglinide, Rosiglitazone: [See Warnings and Precautions (5.4) and Adverse Reactions (6.2)] I nsulin: [See Warnings and Precautions (5.4) and",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rexulti",
      "strong cyp3a4 and 2d6 dual inhibitors"
    ],
    "severity": "major",
    "mechanism": "Dual pathway inhibition",
    "effect": "Severe dose-dependent toxicity",
    "management": "Reduce to 25% of normal dose",
    "evidence_level": "A",
    "sources": [
      "Drug interactions"
    ],
    "rxcui": [
      "1592737",
      "dual_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "rifabutin",
      "clarithromycin"
    ],
    "severity": "moderate",
    "mechanism": "Bidirectional CYP inhibition",
    "effect": "Uveitis and increased levels",
    "management": "Reduce rifabutin dose",
    "evidence_level": "A",
    "sources": [
      "HIV guidelines"
    ],
    "rxcui": [
      "55672",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "baf8ec98-bd0c-4b87-a7ee-813335431b89",
        "title": "RIFABUTIN CAPSULE [ANI PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=baf8ec98-bd0c-4b87-a7ee-813335431b89",
        "matched": "clarithromycin",
        "snippet": "This effect may reduce the efficacy of standard doses of such drugs, which include itraconazole, clarithromycin, and saquinavir.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "rifabutin",
        "snippet": "Cytochrome P450 Inducers: Rifabutin Use With Caution R ifabutin: Concomitant administration of rifabutin and clarithromycin resulted in an increase in rifabutin, and decrease in clarithromycin serum levels together with an increased risk of uveitis (see Rifabutin under “Drugs That Affect Clarithromycin” in the table below).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rifampin",
      "oral contraceptives"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces contraceptive efficacy",
    "effect": "High risk of unintended pregnancy",
    "management": "Use alternative contraceptive methods during treatment",
    "evidence_level": "A",
    "sources": [
      "TB treatment guidelines"
    ],
    "rxcui": [
      "9384",
      "311"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "rifaximin",
      "cyclosporine"
    ],
    "severity": "minor",
    "mechanism": "P-gp inhibition",
    "effect": "Increased rifaximin absorption",
    "management": "No dose adjustment needed",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "208518",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c5e8e2fd-7087-4b78-9181-cc259c0be2f1",
        "title": "XIFAXAN (RIFAXIMIN) TABLET [SALIX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c5e8e2fd-7087-4b78-9181-cc259c0be2f1",
        "matched": "cyclosporine",
        "snippet": "P-glycoprotein Inhibitors Concomitant administration of cyclosporine, an inhibitor of P-gp and OATPs significantly increased the systemic exposure of rifaximin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rilonacept",
      "immunosuppressants"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced immunosuppression",
    "effect": "Increased infection risk",
    "management": "Monitor closely for infections",
    "evidence_level": "B",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "835900",
      "immunosuppressants"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ad965f38-dd22-4607-a673-2fb92f3b527a",
        "title": "ARCALYST (RILONACEPT) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [KINIKSA PHARMACEUTICALS (UK), LTD.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ad965f38-dd22-4607-a673-2fb92f3b527a",
        "matched": "immunosuppressants",
        "snippet": "Treatment with immunosuppressants, including ARCALYST, may result in an increase in the risk of malignancies.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "risperidone",
      "fluoxetine"
    ],
    "severity": "moderate",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Enhanced effects",
    "management": "Monitor for side effects",
    "evidence_level": "A",
    "sources": [
      "Pharmacology",
      "Studies"
    ],
    "rxcui": [
      "35636",
      "4493"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ab1cf6fd-9932-47fc-8736-476cc53a13fa",
        "title": "RISPERIDONE SOLUTION [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ab1cf6fd-9932-47fc-8736-476cc53a13fa",
        "matched": "fluoxetine",
        "snippet": "Fluoxetine, paroxetine, and other CYP 2D6 enzyme inhibitors increase plasma concentrations of risperidone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ritonavir",
      "sildenafil"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition dramatically increases sildenafil",
    "effect": "Severe hypotension",
    "management": "Reduce sildenafil dose to 25mg every 48 hours",
    "evidence_level": "A",
    "sources": [
      "HIV drug interactions"
    ],
    "rxcui": [
      "392622",
      "136411"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "11f757f1-cf48-47a8-925e-918359cbd2d4",
        "title": "RITONAVIR TABLET, FILM COATED [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=11f757f1-cf48-47a8-925e-918359cbd2d4",
        "matched": "sildenafil",
        "snippet": "PDE5 Inhibitors:avanafil sildenafil, tadalafil, vardenafil ↑ avanafil ↑ sildenafil ↑ tadalafil ↑ vardenafil Sildenafil when used for the treatment of pulmonary arterial hypertension (Revatio®) is contraindicated due to the potential for sildenafil-associated adverse events, including visual abnormalities, hypotension, prolonged erection, and syncope [see Contraindications (4)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "d00eab37-9476-c176-e053-2995a90a9ebb",
        "title": "SILDENAFIL TABLET, FILM COATED [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d00eab37-9476-c176-e053-2995a90a9ebb",
        "matched": "ritonavir",
        "snippet": "Ritonavir and other Potent CYP3A Inhibitors Concomitant use of sildenafil tablets with ritonavir and other potent CYP3A inhibitors is not recommended [see Clinical Pharmacology (12.3) ].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rituximab",
      "all vaccines"
    ],
    "severity": "major",
    "mechanism": "B-cell depletion prevents antibody response",
    "effect": "Complete vaccine failure",
    "management": "Vaccinate before rituximab or delay",
    "evidence_level": "A",
    "sources": [
      "Immunization guidelines"
    ],
    "rxcui": [
      "121191",
      "vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "rituximab",
      "cisplatin"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced nephrotoxicity",
    "effect": "Acute kidney injury",
    "management": "Aggressive hydration",
    "evidence_level": "B",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "121191",
      "2555"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f941fc61-f7a3-4e4a-ab7c-87c1667fa05b",
        "title": "RUXIENCE (RITUXIMAB-PVVR) INJECTION, SOLUTION [PFIZER LABORATORIES DIV PFIZER INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f941fc61-f7a3-4e4a-ab7c-87c1667fa05b",
        "matched": "cisplatin",
        "snippet": "Renal toxicity when used in combination with cisplatin (5.8).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rituximab",
      "hepatitis b reactivation"
    ],
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
    "drugs": [
      "rituximab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "B-cell depletion prevents immune response",
    "effect": "Vaccine-induced infection risk",
    "management": "Avoid live vaccines during and 12 months after treatment",
    "evidence_level": "A",
    "sources": [
      "CDC guidelines",
      "Immunization recommendations",
      "Hematology"
    ],
    "rxcui": [
      "121191",
      "live_vaccine"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f941fc61-f7a3-4e4a-ab7c-87c1667fa05b",
        "title": "RUXIENCE (RITUXIMAB-PVVR) INJECTION, SOLUTION [PFIZER LABORATORIES DIV PFIZER INC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f941fc61-f7a3-4e4a-ab7c-87c1667fa05b",
        "matched": "live vaccines",
        "snippet": "For patients treated with RUXIENCE, physicians should review the patient's vaccination status and patients should, if possible, be brought up-to-date with all immunizations in agreement with current immunization guidelines prior to initiating RUXIENCE and administer non-live vaccines at least 4 weeks prior to a course of RUXIENCE.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rivaroxaban",
      "carbamazepine"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces rivaroxaban exposure",
    "effect": "Reduced anticoagulant efficacy",
    "management": "Avoid combination; consider warfarin",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "1114195",
      "2002"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d6de1719-6fbd-4386-9f81-d65980dc4bd8",
        "title": "RIVAROXABAN TABLET [LIFESTAR PHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d6de1719-6fbd-4386-9f81-d65980dc4bd8",
        "matched": "carbamazepine",
        "snippet": "Drugs that Induce Cytochrome P450 3A Enzymes and Drug Transport Systems Avoid concomitant use of rivaroxaban with drugs that are combined P-gp and strong CYP3A inducers (e.g., carbamazepine, phenytoin, rifampin, St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rivaroxaban",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 and P-glycoprotein inhibition",
    "effect": "Increased bleeding risk",
    "management": "Avoid combination; monitor for bleeding signs",
    "evidence_level": "A",
    "sources": [
      "FDA warnings",
      "FDA"
    ],
    "rxcui": [
      "1114195",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d6de1719-6fbd-4386-9f81-d65980dc4bd8",
        "title": "RIVAROXABAN TABLET [LIFESTAR PHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d6de1719-6fbd-4386-9f81-d65980dc4bd8",
        "matched": "ketoconazole",
        "snippet": "Drugs that Inhibit Cytochrome P450 3A Enzymes and Drug Transport Systems Interaction with Combined P-gp and Strong CYP3A Inhibitors Avoid concomitant administration of rivaroxaban with known combined P-gp and strong CYP3A inhibitors (e.g., ketoconazole and ritonavir) [see Warnings and Precautions (5.6) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rizatriptan",
      "propranolol"
    ],
    "severity": "moderate",
    "mechanism": "Hepatic metabolism inhibition",
    "effect": "Increased triptan levels",
    "management": "Reduce rizatriptan dose",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "83733",
      "8787"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4de33a24-db69-444a-b04d-c69ccba57ab2",
        "title": "RIZATRIPTAN BENZOATE TABLET, ORALLY DISINTEGRATING [GLENMARK PHARMACEUTICALS INC., USA]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4de33a24-db69-444a-b04d-c69ccba57ab2",
        "matched": "propranolol",
        "snippet": "DRUG INTERACTIONS 7.1 Propranolol The dose of rizatriptan benzoate should be adjusted in propranolol-treated patients, as propranolol has been shown to increase the plasma AUC of rizatriptan by 70% [see Dosage and Administration (2.4) and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "title": "PROPRANOLOL HYDROCHLORIDE TABLET [PROFICIENT RX LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e289160e-0f3a-4667-b8ba-9c93fbf21a30",
        "matched": "rizatriptan",
        "snippet": "Substrates or Inhibitors of CYP1A2 Blood levels and/ or toxicity of propranolol may be increased by coadministration with substrates or inhibitors of CYP1A2, such as imipramine, cimetidine, ciprofloxacin, fluvoxamine, isoniazid, ritonavir, theophylline, zileuton, zolmitriptan, and rizatriptan.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rocuronium",
      "aminoglycosides"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced neuromuscular blockade",
    "effect": "Prolonged paralysis",
    "management": "Monitor neuromuscular function",
    "evidence_level": "A",
    "sources": [
      "Anesthesiology"
    ],
    "rxcui": [
      "73056",
      "723"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a18fce42-0f3d-4354-845e-57c37ac3a147",
        "title": "ROCURONIUM BROMIDE INJECTION, SOLUTION [BAXTER HEALTHCARE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a18fce42-0f3d-4354-845e-57c37ac3a147",
        "matched": "aminoglycosides",
        "snippet": "Antibiotics Drugs which may enhance the neuromuscular blocking action of nondepolarizing agents such as rocuronium bromide injection include certain antibiotics (e.g., aminoglycosides; vancomycin; tetracyclines; bacitracin; polymyxins; colistin; and sodium colistimethate).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "roflumilast",
      "rifampin"
    ],
    "severity": "moderate",
    "mechanism": "CYP induction",
    "effect": "Reduced roflumilast efficacy",
    "management": "Avoid combination",
    "evidence_level": "B",
    "sources": [
      "COPD"
    ],
    "rxcui": [
      "1040028",
      "9384"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "rosiglitazone",
      "gemfibrozil"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C8 inhibition",
    "effect": "Increased rosiglitazone levels",
    "management": "Monitor for edema and CHF",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "84108",
      "4441"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "0789dc6b-db34-44a6-8a5d-fdcc8e4ce8fd",
        "title": "AVANDAMET (ROSIGLITAZONE MALEATE AND METFORMIN HYDROCHLORIDE) TABLET, FILM COATED [PHYSICIANS TOTAL CARE, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=0789dc6b-db34-44a6-8a5d-fdcc8e4ce8fd",
        "matched": "gemfibrozil",
        "snippet": "DRUG INTERACTIONS Inhibitors of CYP2C8 (e.g., gemfibrozil) may increase rosiglitazone levels.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cf32b795-bf42-4861-b273-06d27de3f21d",
        "title": "GEMFIBROZIL (GEMFIBROZIL) TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cf32b795-bf42-4861-b273-06d27de3f21d",
        "matched": "rosiglitazone",
        "snippet": "C) CYP2C8 Substrates Gemfibrozil is a strong inhibitor of CYP2C8 and may increase exposure of drugs mainly metabolized by CYP2C8 (e.g., dabrafenib, enzalutamide, loperamide, montelukast, paclitaxel, pioglitazone, rosiglitazone).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "rosuvastatin",
      "cyclosporine"
    ],
    "severity": "major",
    "mechanism": "OATP1B1 inhibition increases statin exposure",
    "effect": "Severe myopathy and rhabdomyolysis",
    "management": "Limit rosuvastatin to 5mg daily",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations"
    ],
    "rxcui": [
      "301542",
      "3008"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4ccbaa83-d57a-421e-88a8-1cee42d4207b",
        "title": "ROSUVASTATIN CALCIUM TABLET, FILM COATED [ASCEND LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4ccbaa83-d57a-421e-88a8-1cee42d4207b",
        "matched": "cyclosporine",
        "snippet": "Cyclosporine Prevention or Management: In patients taking cyclosporine, do not exceed a dosage of rosuvastatin tablets 5 mg once daily.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "roxadustat",
      "phosphate binders"
    ],
    "severity": "moderate",
    "mechanism": "Impaired absorption",
    "effect": "Reduced roxadustat efficacy",
    "management": "Separate administration",
    "evidence_level": "B",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "2103156",
      "phosphate_binders"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ruxolitinib",
      "fluconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased ruxolitinib exposure",
    "management": "Reduce ruxolitinib dose",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "1359197",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "f1c82580-87ae-11e0-bc84-0002a5d5c51b",
        "title": "JAKAFI (RUXOLITINIB) TABLET JAKAFI XR (RUXOLITINIB) TABLET, EXTENDED RELEASE [INCYTE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=f1c82580-87ae-11e0-bc84-0002a5d5c51b",
        "matched": "fluconazole",
        "snippet": "DRUG INTERACTIONS Fluconazole: Avoid concomitant use with fluconazole doses greater than 200 mg.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sacubitril-valsartan",
      "ace inhibitors"
    ],
    "severity": "major",
    "mechanism": "Dual RAAS blockade",
    "effect": "Angioedema risk",
    "management": "36-hour washout period",
    "evidence_level": "A",
    "sources": [
      "Heart failure guidelines"
    ],
    "rxcui": [
      "1656328",
      "35208"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "salmeterol",
      "ketoconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Salmeterol toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "9858",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ccf98c0a-fc40-4e08-bdf2-145fe4537db5",
        "title": "FLUTICASONE PROPIONATE AND SALMETEROL DISKUS (FLUTICASONE PROPIONATE AND SALMETEROL) POWDER [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ccf98c0a-fc40-4e08-bdf2-145fe4537db5",
        "matched": "ketoconazole",
        "snippet": "Strong cytochrome P450 3A4 inhibitors (e.g., ritonavir, ketoconazole): Use not recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sarilumab",
      "cyp450 substrates"
    ],
    "severity": "moderate",
    "mechanism": "IL-6 receptor antagonism normalizes CYP",
    "effect": "Increased substrate levels",
    "management": "Monitor substrate levels",
    "evidence_level": "B",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "1890878",
      "cyp_substrates"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "827bc01c-d379-4266-a18c-c7f904b76af3",
        "title": "KEVZARA (SARILUMAB) INJECTION, SOLUTION [SANOFI-AVENTIS U.S. LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=827bc01c-d379-4266-a18c-c7f904b76af3",
        "matched": "cyp450 substrates",
        "snippet": "Interactions with CYP450 Substrates Various in vitro and limited in vivo human studies have shown that cytokines and cytokine modulators can influence the expression and activity of specific cytochrome P450 (CYP) enzymes and therefore have the potential to alter the pharmacokinetics of concomitantly administered drugs that are substrates of these enzymes.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "saw palmetto",
      "anticoagulants"
    ],
    "severity": "moderate",
    "mechanism": "Potential bleeding risk",
    "effect": "Enhanced bleeding",
    "management": "Monitor for bleeding",
    "evidence_level": "C",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "235516",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "saw palmetto",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Anticoagulant effects",
    "effect": "Bleeding risk",
    "management": "Monitor INR",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "258326",
      "11289"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sedatives",
      "passionflower"
    ],
    "severity": "moderate",
    "mechanism": "Additive sedation",
    "effect": "Enhanced drowsiness",
    "management": "Avoid combination",
    "evidence_level": "C",
    "sources": [
      "Traditional"
    ],
    "rxcui": [
      "3322",
      "passionflower"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "selinexor",
      "cyp3a4 inducers"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced metabolism",
    "effect": "Reduced selinexor efficacy",
    "management": "Avoid strong inducers",
    "evidence_level": "B",
    "sources": [
      "Multiple myeloma"
    ],
    "rxcui": [
      "2284524",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "semaglutide",
      "oral medications"
    ],
    "severity": "minor",
    "mechanism": "Delayed gastric emptying",
    "effect": "Delayed oral drug absorption",
    "management": "Time oral medications appropriately",
    "evidence_level": "B",
    "sources": [
      "Diabetes"
    ],
    "rxcui": [
      "1991302",
      "oral_medications"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "27f15fac-7d98-4114-a2ec-92494a91da98",
        "title": "OZEMPIC (ORAL SEMAGLUTIDE) TABLET RYBELSUS (ORAL SEMAGLUTIDE) TABLET [NOVO NORDISK PHARMACEUTICAL INDUSTRIES, LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=27f15fac-7d98-4114-a2ec-92494a91da98",
        "matched": "oral medications",
        "snippet": "Consider increased clinical or laboratory monitoring when co-administered with other oral medications that have a narrow therapeutic index or that require clinical monitoring.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sertraline",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Hyperthermia, altered mental status, neuromuscular abnormalities",
    "management": "Avoid combination; use alternative analgesic",
    "evidence_level": "A",
    "sources": [
      "FDA warnings",
      "Pain management guidelines"
    ],
    "rxcui": [
      "36437",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "91b4c802-9c6b-49bb-b5a7-661e1917ef34",
        "title": "SERTRALINE HYDROCHLORIDE TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=91b4c802-9c6b-49bb-b5a7-661e1917ef34",
        "matched": "tramadol",
        "snippet": "The risk is increased with concomitant use ofother serotonergic drugs (including triptans, tricyclic antidepressants, fentanyl, lithium, tramadol, meperidine, methadone, tryptophan, buspirone, amphetamines, and St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sevelamer",
      "levothyroxine"
    ],
    "severity": "moderate",
    "mechanism": "Impaired absorption",
    "effect": "Hypothyroidism",
    "management": "Separate administration by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "135616",
      "10582"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "90caaf0e-de31-48bc-8286-c02ef380e8b2",
        "title": "SEVELAMER CARBONATE TABLET, FILM COATED [ATLANTIC BIOLOGICALS CORPS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=90caaf0e-de31-48bc-8286-c02ef380e8b2",
        "matched": "levothyroxine",
        "snippet": "For oral medication where a reduction in the bioavailability of that medication would have a clinically significant effect on its safety or efficacy (e.g., cyclosporine, tacrolimus, levothyroxine), consider separation of the timing of the administration of the two drugs [see Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cba64919-3b74-a03a-e053-2995a90a3d89",
        "title": "LEVOTHYROXINE SODIUM TABLET [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cba64919-3b74-a03a-e053-2995a90a3d89",
        "matched": "sevelamer",
        "snippet": "Drug or Drug Class Effect Phosphate Binders (e.g., calcium carbonate, ferrous sulfate, sevelamer, lanthanum) Phosphate binders may bind to levothyroxine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sevoflurane",
      "compound a"
    ],
    "severity": "moderate",
    "mechanism": "CO2 absorbent degradation",
    "effect": "Nephrotoxicity",
    "management": "Use fresh CO2 absorbent",
    "evidence_level": "B",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "9314",
      "compound_a"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c808afe1-ebf1-44cf-9187-09656331bff5",
        "title": "SEVOFLURANE LIQUID [SHANDONG NEW TIME PHARMACEUTICAL CO., LTD.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c808afe1-ebf1-44cf-9187-09656331bff5",
        "matched": "compound a",
        "snippet": "ARNINGS Risk of Renal Injury Although data from controlled clinical studies at low flow rates are limited, findings taken from patient and animal studies suggest that there is a potential for renal injury which is presumed due to Compound A.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sglt2 inhibitors",
      "ketosis-prone conditions"
    ],
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
    "drugs": [
      "sildenafil",
      "alpha-blockers"
    ],
    "severity": "major",
    "mechanism": "Hypotensive effects",
    "effect": "Syncope",
    "management": "Start low dose",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "136411",
      "596"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d00eab37-9476-c176-e053-2995a90a9ebb",
        "title": "SILDENAFIL TABLET, FILM COATED [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d00eab37-9476-c176-e053-2995a90a9ebb",
        "matched": "alpha-blockers",
        "snippet": "Concomitant alpha-blockers or amlodipine: Note additive blood pressure lowering effects.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sildenafil",
      "nitrates"
    ],
    "severity": "major",
    "mechanism": "Additive vasodilation",
    "effect": "Severe hypotension",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "136411",
      "7417"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d00eab37-9476-c176-e053-2995a90a9ebb",
        "title": "SILDENAFIL TABLET, FILM COATED [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d00eab37-9476-c176-e053-2995a90a9ebb",
        "matched": "nitrates",
        "snippet": "DRUG INTERACTIONS Nitrates Concomitant use of sildenafil tablets with nitrates in any form is contraindicated [see Contraindications (4) ].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sildenafil",
      "nitroglycerin"
    ],
    "severity": "major",
    "mechanism": "Additive vasodilation",
    "effect": "Severe hypotension and cardiovascular collapse",
    "management": "Absolute contraindication; avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning"
    ],
    "rxcui": [
      "136411",
      "7517"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5dbd638f-35b6-366c-e063-6294a90a5c5e",
        "title": "NITROGLYCERIN TABLET [NUCARE PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5dbd638f-35b6-366c-e063-6294a90a5c5e",
        "matched": "sildenafil",
        "snippet": "PDE-5-Inhibitors such as avanafil, sildenafil, vardenafil, and tadalafil have been shown to potentiate the hypotensive effects of organic nitrates.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "siltuximab",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "CYP enzyme normalization",
    "effect": "Variable anticoagulation",
    "management": "Monitor INR closely",
    "evidence_level": "B",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "1659131",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8d663642-f52e-49c0-a023-2da083fdfc0b",
        "title": "SYLVANT (SILTUXIMAB) INJECTION, POWDER, FOR SOLUTION [RECORDATI RARE DISEASES, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8d663642-f52e-49c0-a023-2da083fdfc0b",
        "matched": "warfarin",
        "snippet": "Upon initiation or discontinuation of SYLVANT, in patients being treated with CYP450 substrates with a narrow therapeutic index, perform therapeutic monitoring of effect (e.g., warfarin) or drug concentration (e.g., cyclosporine or theophylline) as needed and adjust dose.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "simvastatin",
      "gemfibrozil"
    ],
    "severity": "major",
    "mechanism": "Inhibition of simvastatin glucuronidation",
    "effect": "Severe myopathy and rhabdomyolysis risk",
    "management": "Avoid combination; use alternative statin if needed",
    "evidence_level": "A",
    "sources": [
      "FDA warning"
    ],
    "rxcui": [
      "36567",
      "25025"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "3f6fad0b-0278-433f-86db-761b673a5803",
        "title": "SIMVASTATIN TABLET, FILM COATED [PREFERRED PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=3f6fad0b-0278-433f-86db-761b673a5803",
        "matched": "gemfibrozil",
        "snippet": "Cyclosporine, Danazol, or Gemfibrozil Clinical Impact: The risk of myopathy and rhabdomyolysis is increased with concomitant use of cyclosporine, danazol, or gemfibrozil with simvastatin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cf32b795-bf42-4861-b273-06d27de3f21d",
        "title": "GEMFIBROZIL (GEMFIBROZIL) TABLET, FILM COATED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cf32b795-bf42-4861-b273-06d27de3f21d",
        "matched": "simvastatin",
        "snippet": "Drug Interactions (A) HMG-CoA Reductase Inhibitors The concomitant administration of gemfibrozil with simvastatin is contraindicated (see CONTRAINDICATIONS and WARNINGS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "siponimod",
      "strong cyp2c9 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Siponimod accumulation",
    "management": "Contraindicated in poor metabolizers",
    "evidence_level": "A",
    "sources": [
      "MS treatment"
    ],
    "rxcui": [
      "2103944",
      "cyp2c9_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "44492772-5aed-4627-bd85-e8e89f308bb3",
        "title": "MAYZENT (SIPONIMOD) TABLET, FILM COATED [NOVARTIS PHARMACEUTICALS CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=44492772-5aed-4627-bd85-e8e89f308bb3",
        "matched": "strong cyp2c9 inhibitors",
        "snippet": "CYP2C9 and Dual CYP2C9/3A4 Inhibitors: Strong CYP2C9 inhibitors increase siponimod exposure; concomitant use with MAYZENT is not recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sirolimus",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Organ rejection",
    "management": "Increase dose and monitor levels",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "35623",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sitagliptin",
      "digoxin"
    ],
    "severity": "minor",
    "mechanism": "P-gp inhibition",
    "effect": "Slightly increased digoxin",
    "management": "Monitor digoxin levels",
    "evidence_level": "B",
    "sources": [
      "Studies",
      "Manufacturer data"
    ],
    "rxcui": [
      "593411",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "solifenacin",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Anticholinergic toxicity",
    "management": "Reduce dose or avoid",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "274762",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "fbd6e753-1ed2-418a-8667-c674b215eabb",
        "title": "SOLIFENACIN SUCCINATE TABLET, COATED [MACLEODS PHARMACEUTICALS LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=fbd6e753-1ed2-418a-8667-c674b215eabb",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "DRUG INTERACTIONS CYP3A4 Inhibitors: Do not exceed the 5 mg dose of solifenacin succinate tablets with concomitant use of strong CYP3A4 inhibitors.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "somatropin",
      "corticosteroids"
    ],
    "severity": "moderate",
    "mechanism": "Growth inhibition",
    "effect": "Reduced growth response",
    "management": "Monitor growth velocity",
    "evidence_level": "A",
    "sources": [
      "Pediatric endocrine"
    ],
    "rxcui": [
      "9338",
      "1347"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "62b01d29-90f0-45b2-a0c4-3a750ba36c8a",
        "title": "SEROSTIM (SOMATROPIN) KIT [EMD SERONO, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=62b01d29-90f0-45b2-a0c4-3a750ba36c8a",
        "matched": "corticosteroids",
        "snippet": "These data suggest that somatropin administration may alter the clearance of compounds metabolized by CYP450 liver enzymes (e.g., corticosteroids, sex steroids, anticonvulsants, cyclosporine).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sorafenib",
      "doxorubicin"
    ],
    "severity": "major",
    "mechanism": "Additive cardiotoxicity",
    "effect": "Heart failure",
    "management": "Monitor cardiac function",
    "evidence_level": "B",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "681450",
      "3639"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sorafenib",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Enhanced anticoagulation via CYP2C9 inhibition",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR frequently; consider dose adjustment",
    "evidence_level": "B",
    "sources": [
      "FDA label",
      "Clinical studies"
    ],
    "rxcui": [
      "608144",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "faa9d847-2cd5-6538-e053-6394a90aa92b",
        "title": "SORAFENIB TABLET, FILM COATED [GOLDEN STATE MEDICAL SUPPLY, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=faa9d847-2cd5-6538-e053-6394a90aa92b",
        "matched": "warfarin",
        "snippet": "Concomitant Use of Warfarin The concomitant use of sorafenib tablets and warfarin may increase the risk of bleeding or increased the INR.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sotagliflozin",
      "digoxin"
    ],
    "severity": "minor",
    "mechanism": "No significant interaction",
    "effect": "Safe combination",
    "management": "Standard monitoring",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1551102",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1a46614e-05f6-421a-b6f4-d6f8760d643a",
        "title": "INPEFA (SOTAGLIFLOZIN) TABLET [LEXICON PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1a46614e-05f6-421a-b6f4-d6f8760d643a",
        "matched": "digoxin",
        "snippet": "DRUG INTERACTIONS Digoxin: Monitor digoxin levels.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sotalol",
      "clarithromycin"
    ],
    "severity": "major",
    "mechanism": "QT prolongation",
    "effect": "Torsades de pointes",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "10156",
      "21212"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "title": "CLARITHROMYCIN TABLET, FILM COATED, EXTENDED RELEASE [ACTAVIS PHARMA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d5be5f12-6392-4d7d-ab23-ebc205ac1a85",
        "matched": "sotalol",
        "snippet": "arithromycin Drugs That Are Affected By Clarithromycin Drug(s) with P h armacokinetics Affected by Clarithromycin Recommendation Comments Antiarrhythmics: Disopyramide Quinidine Dofetilide Amiodarone Sotalol Procainamide Not Recommended Disopyramide, Quinidine: There have been postmarketing reports of torsades de pointes occurring with concurrent use of clarithromycin and quinidine or disopyramide. Electrocardiograms",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "spironolactone",
      "ace inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Additive hyperkalemic effects",
    "effect": "Hyperkalemia risk",
    "management": "Monitor serum potassium regularly",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines"
    ],
    "rxcui": [
      "9997",
      "35208"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "768563dc-a619-44dc-b97f-1a7e71fd56a0",
        "title": "SPIRONOLACTONE TABLET [AUROBINDO PHARMA LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=768563dc-a619-44dc-b97f-1a7e71fd56a0",
        "matched": "ace inhibitors",
        "snippet": "Examples of drugs that can increase potassium include: ACE inhibitors angiotensin receptor blockers non-steroidal anti-inflammatory drugs (NSAIDs) heparin and low molecular weight heparin trimethoprim 7.2 Lithium Like other diuretics, spironolactone reduces the renal clearance of lithium, thus increasing the risk of lithium toxicity.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "st johns wort",
      "digoxin"
    ],
    "severity": "major",
    "mechanism": "P-gp induction",
    "effect": "Reduced levels",
    "management": "Avoid herb",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "258326",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "st johns wort",
      "oral contraceptives"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction reduces contraceptive levels",
    "effect": "Unintended pregnancy",
    "management": "Use additional contraceptive methods",
    "evidence_level": "A",
    "sources": [
      "Reproductive health literature"
    ],
    "rxcui": [
      "258326",
      "311"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "statins",
      "red yeast rice"
    ],
    "severity": "moderate",
    "mechanism": "Additive myopathy",
    "effect": "Muscle toxicity",
    "management": "Avoid combination",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "36567",
      "red_yeast"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "stimulants",
      "hypertension"
    ],
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
    "drugs": [
      "stiripentol",
      "valproate"
    ],
    "severity": "moderate",
    "mechanism": "Metabolic inhibition",
    "effect": "Increased valproate levels",
    "management": "Monitor valproate levels",
    "evidence_level": "B",
    "sources": [
      "Pediatric epilepsy"
    ],
    "rxcui": [
      "127373",
      "11118"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "58304ba8-9779-4658-811e-94ffe08c3f16",
        "title": "DIACOMIT (STIRIPENTOL) CAPSULE DIACOMIT (STIRIPENTOL) POWDER, FOR SUSPENSION [BIOCODEX, INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=58304ba8-9779-4658-811e-94ffe08c3f16",
        "matched": "valproate",
        "snippet": "In some cases, decreasing the dose of concomitant valproate by 30% per week can reduce the decrease in appetite and weight.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "succinylcholine",
      "plasma cholinesterase deficiency"
    ],
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
    "drugs": [
      "sucralfate",
      "levothyroxine"
    ],
    "severity": "moderate",
    "mechanism": "Impaired absorption",
    "effect": "Hypothyroidism",
    "management": "Separate by 4 hours",
    "evidence_level": "A",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "10156",
      "10582"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cba64919-3b74-a03a-e053-2995a90a3d89",
        "title": "LEVOTHYROXINE SODIUM TABLET [NUCARE PHARMACEUTICALS,INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cba64919-3b74-a03a-e053-2995a90a3d89",
        "matched": "sucralfate",
        "snippet": "Other drugs: Proton Pump Inhibitors Sucralfate Antacids (e.g., aluminum & magnesium hydroxides, simethicone) Gastric acidity is an essential requirement for adequate absorption of levothyroxine.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sucralfate",
      "quinolones"
    ],
    "severity": "moderate",
    "mechanism": "Aluminum chelation reduces absorption",
    "effect": "Reduced antibiotic efficacy",
    "management": "Separate administration by 2-6 hours",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "10156",
      "26785"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sugammadex",
      "hormonal contraceptives"
    ],
    "severity": "moderate",
    "mechanism": "Steroid binding",
    "effect": "Contraceptive failure",
    "management": "Use backup contraception for 7 days",
    "evidence_level": "A",
    "sources": [
      "Anesthesia"
    ],
    "rxcui": [
      "847259",
      "9072"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "56400560-a2df-4126-b424-9e4b91e53a8b",
        "title": "SUGAMMADEX INJECTION, SOLUTION [SHANDONG NEW TIME PHARMACEUTICAL CO., LTD.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=56400560-a2df-4126-b424-9e4b91e53a8b",
        "matched": "hormonal contraceptives",
        "snippet": "Hormonal contraceptives:Patients must use an additional, non-hormonal method of contraception for 7 days following sugammadex administration.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sulfasalazine",
      "folate"
    ],
    "severity": "moderate",
    "mechanism": "Folate antagonism",
    "effect": "Megaloblastic anemia",
    "management": "Supplement with folate",
    "evidence_level": "A",
    "sources": [
      "Gastroenterology"
    ],
    "rxcui": [
      "9524",
      "4143"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sulfisoxazole",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "Protein binding displacement",
    "effect": "Enhanced anticoagulant effect",
    "management": "Monitor INR closely",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "10180",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "60d1aea0-f106-4b20-8ef4-7a80e37f8a50",
        "title": "ERYTHROMYCIN ETHYLSUCCINATE AND SULFISOXAZOLE ACETYL GRANULE, FOR SUSPENSION [REBEL DISTRIBUTORS CORP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=60d1aea0-f106-4b20-8ef4-7a80e37f8a50",
        "matched": "warfarin",
        "snippet": "See CONTRAINDICATIONS.) It has been reported that sulfisoxazole may prolong the prothrombin time in patients who are receiving the anticoagulant warfarin.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "sulfonamides",
      "lamotrigine"
    ],
    "severity": "major",
    "mechanism": "Hypersensitivity syndrome",
    "effect": "Toxic epidermal necrolysis",
    "management": "Avoid in patients with sulfa allergy",
    "evidence_level": "B",
    "sources": [
      "Neurology"
    ],
    "rxcui": [
      "10180",
      "6878"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sulfonamides",
      "sun exposure"
    ],
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
    "drugs": [
      "sulfonylureas",
      "alcohol"
    ],
    "severity": "moderate",
    "mechanism": "Disulfiram-like reaction and hypoglycemia",
    "effect": "Severe hypoglycemia and flushing",
    "management": "Limit alcohol intake; monitor blood glucose",
    "evidence_level": "B",
    "sources": [
      "Diabetes management"
    ],
    "rxcui": [
      "26554",
      "alcohol"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sulfonylureas",
      "beta-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Masked hypoglycemia",
    "effect": "Unrecognized low glucose",
    "management": "Use selective beta-blockers",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "26554",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "sumatriptan",
      "ergotamine"
    ],
    "severity": "major",
    "mechanism": "Additive vasoconstriction",
    "effect": "Coronary artery spasm",
    "management": "Avoid within 24 hours",
    "evidence_level": "A",
    "sources": [
      "Migraine guidelines"
    ],
    "rxcui": [
      "10379",
      "4024"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "7a5f3bb3-147c-49b4-bd62-fdb4af775f8a",
        "title": "SUMATRIPTAN TABLET, FILM COATED [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7a5f3bb3-147c-49b4-bd62-fdb4af775f8a",
        "matched": "ergotamine",
        "snippet": "Because these effects may be additive, use of ergotamine-containing or ergot-type medications (like dihydroergotamine or methysergide) and sumatriptan tablets within 24 hours of each other is contraindicated.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tacrolimus",
      "diltiazem"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases tacrolimus levels",
    "effect": "Enhanced immunosuppression and nephrotoxicity",
    "management": "Monitor tacrolimus levels; reduce dose",
    "evidence_level": "A",
    "sources": [
      "Transplant guidelines"
    ],
    "rxcui": [
      "42316",
      "3443"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "diltiazem",
        "snippet": "Mild or Moderate CYP3A Inhibitors: Clotrimazole, antibiotics (e.g., erythromycin, fluconazole), calcium channel blockers (e.g., verapamil, diltiazem, nifedipine, nicardipine), amiodarone, danazol, ethinyl estradiol, cimetidine, lansoprazole and omeprazole May increase tacrolimus whole blood trough concentrations and increase the risk of serious adverse reactions (e.g., neurotoxicity, QT prolongation) [see Warnings an",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tacrolimus",
      "fluconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases tacrolimus exposure",
    "effect": "Nephrotoxicity and immunosuppression",
    "management": "Monitor tacrolimus levels; reduce dose significantly",
    "evidence_level": "A",
    "sources": [
      "Transplant guidelines",
      "Guidelines"
    ],
    "rxcui": [
      "42316",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "fluconazole",
        "snippet": "Mild or Moderate CYP3A Inhibitors: Clotrimazole, antibiotics (e.g., erythromycin, fluconazole), calcium channel blockers (e.g., verapamil, diltiazem, nifedipine, nicardipine), amiodarone, danazol, ethinyl estradiol, cimetidine, lansoprazole and omeprazole May increase tacrolimus whole blood trough concentrations and increase the risk of serious adverse reactions (e.g., neurotoxicity, QT prolongation) [see Warnings an",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "98ac5455-d26c-4780-a5a3-bf8d85917626",
        "title": "FLUCONAZOLE TABLET [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=98ac5455-d26c-4780-a5a3-bf8d85917626",
        "matched": "tacrolimus",
        "snippet": "See PRECAUTIONS.) Tacrolimus: There have been published reports that an interaction exists when fluconazole is administered concomitantly with tacrolimus, leading to increased serum levels of tacrolimus.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tacrolimus",
      "nifedipine"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased levels",
    "management": "Monitor levels",
    "evidence_level": "B",
    "sources": [
      "Literature"
    ],
    "rxcui": [
      "42316",
      "7240"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "nifedipine",
        "snippet": "Mild or Moderate CYP3A Inhibitors: Clotrimazole, antibiotics (e.g., erythromycin, fluconazole), calcium channel blockers (e.g., verapamil, diltiazem, nifedipine, nicardipine), amiodarone, danazol, ethinyl estradiol, cimetidine, lansoprazole and omeprazole May increase tacrolimus whole blood trough concentrations and increase the risk of serious adverse reactions (e.g., neurotoxicity, QT prolongation) [see Warnings an",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tacrolimus",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Tacrolimus toxicity",
    "management": "Reduce dose and monitor levels",
    "evidence_level": "A",
    "sources": [
      "Transplant"
    ],
    "rxcui": [
      "42316",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "bd9fea26-0236-d437-c7df-4b7636210875",
        "title": "TACROLIMUS CAPSULE, GELATIN COATED [PANACEA BIOTEC LIMITED]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bd9fea26-0236-d437-c7df-4b7636210875",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "Interactions with CYP3A4 Inhibitors and Inducers When co-administering tacrolimus with strong CYP3A4 inhibitors (e.g., telaprevir, boceprevir, ritonavir, ketoconazole, itraconazole, voriconazole, clarithromycin) and strong inducers (e.g., rifampin, rifabutin), adjustments in the dosing regimen of tacrolimus and subsequent frequent monitoring of tacrolimus whole blood trough concentrations and tacrolimus-associat",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tadalafil",
      "alpha-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive hypotensive effects",
    "effect": "Symptomatic hypotension",
    "management": "Stable alpha-blocker dose required",
    "evidence_level": "A",
    "sources": [
      "Urology"
    ],
    "rxcui": [
      "110635",
      "229"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "66e24ced-0008-40cb-b242-9d9add1f665c",
        "title": "TADALAFIL TABLET [PREFERRED PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=66e24ced-0008-40cb-b242-9d9add1f665c",
        "matched": "alpha-blockers",
        "snippet": "DRUG INTERACTIONS • Tadalafil tablets can potentiate the hypotensive effects of nitrates, alpha-blockers, antihypertensives or alcohol (7.1).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tamoxifen",
      "fluoxetine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition reduces active metabolite formation",
    "effect": "Decreased breast cancer survival",
    "management": "Switch to non-CYP2D6 inhibiting antidepressant",
    "evidence_level": "A",
    "sources": [
      "Breast cancer guidelines",
      "Breast cancer"
    ],
    "rxcui": [
      "10324",
      "4493"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tamsulosin",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased tamsulosin exposure",
    "management": "Use with caution",
    "evidence_level": "A",
    "sources": [
      "Urology"
    ],
    "rxcui": [
      "73473",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "6142d7b6-e5ea-1af0-e053-2991aa0a00cd",
        "title": "TAMSULOSIN HYDROCHLORIDE CAPSULE [ST. MARY'S MEDICAL PARK PHARMACY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=6142d7b6-e5ea-1af0-e053-2991aa0a00cd",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "Since CYP2D6 PMs cannot be readily identified and the potential for significant increase in tamsulosin exposure exists when tamsulosin hydrochloride 0.4 mg is co-administered with strong CYP3A4 inhibitors in CYP2D6 PMs, tamsulosin hydrochloride capsules 0.4 mg should not be used in combination with strong inhibitors of CYP3A4 (e.g., ketoconazole) [see Warnings and Precautions (5.2)and Clinical Pharmacology (12.3)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tapentadol",
      "maoi"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome",
    "effect": "Hyperthermia and death",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "562223",
      "7531"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5b769a76-5ca5-b2e9-e063-6394a90a1b1b",
        "title": "TAPENTADOL HYDROCHLORIDE TABLET, FILM COATED [AVKARE]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5b769a76-5ca5-b2e9-e063-6394a90a1b1b",
        "matched": "maoi",
        "snippet": "Monoamine Oxidase Inhibitors (MAOIs) Clinical Impact: MAOI interactions with opioids may manifest as serotonin syndrome or opioid toxicity (e.g., respiratory depression, coma) [see Warnings and Precautions (5.3)] Intervention: Do not use tapentadol tablets in patients taking MAOIs or within 14 days of stopping such treatment.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "teclistamab",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "B-cell depletion",
    "effect": "Severe infections",
    "management": "Avoid live vaccines during therapy",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2608042",
      "live_vaccines"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tegaserod",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased tegaserod levels",
    "management": "Reduce dose",
    "evidence_level": "B",
    "sources": [
      "Gastroenterology"
    ],
    "rxcui": [
      "274783",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "telithromycin",
      "simvastatin"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases statin levels",
    "effect": "Rhabdomyolysis risk",
    "management": "Suspend statin during antibiotic course",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations"
    ],
    "rxcui": [
      "274786",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ba1cca98-f350-4655-88e3-6ef990779fb9",
        "title": "KETEK (TELITHROMYCIN) TABLET, FILM COATED [PHYSICIANS TOTAL CARE, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ba1cca98-f350-4655-88e3-6ef990779fb9",
        "matched": "simvastatin",
        "snippet": "See CONTRAINDICATIONS) In a pharmacokinetic study, simvastatin levels were increased due to CYP 3A4 inhibition by telithromycin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "52a46269-2262-4052-a3ff-5455523f591f",
        "title": "EZETIMIBE AND SIMVASTATIN TABLET [NORTHSTAR RX LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=52a46269-2262-4052-a3ff-5455523f591f",
        "matched": "telithromycin",
        "snippet": "Examples: Select azole anti-fungals (e.g., itraconazole, ketoconazole, posaconazole, and voriconazole), select macrolide antibiotics (e.g., erythromycin and clarithromycin, telithromycin), select HIV protease inhibitors (e.g., nelfinavir, ritonavir, and darunavir/ritonavir), select HCV protease inhibitors (e.g., boceprevir and telaprevir), cobicistat-containing products, and nefazodone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "temozolomide",
      "valproic acid"
    ],
    "severity": "moderate",
    "mechanism": "Histone deacetylase inhibition enhances DNA damage",
    "effect": "Increased myelosuppression",
    "management": "Monitor blood counts more frequently",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "85533",
      "11118"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tenofovir",
      "didanosine"
    ],
    "severity": "major",
    "mechanism": "Increased didanosine exposure",
    "effect": "Enhanced mitochondrial toxicity",
    "management": "Avoid combination; use alternative NRTI",
    "evidence_level": "A",
    "sources": [
      "HIV guidelines"
    ],
    "rxcui": [
      "329138",
      "3467"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "41bd03ea-b92e-459c-968b-c9095ae90aef",
        "title": "EMTRICITABINE AND TENOFOVIR DISOPROXIL FUMARATE TABLET, FILM COATED [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=41bd03ea-b92e-459c-968b-c9095ae90aef",
        "matched": "didanosine",
        "snippet": "DRUG INTERACTIONS • Tenofovir disoproxil fumarate increases didanosine concentrations.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "829e744d-7bd4-43dc-9b58-ffb016cb8e67",
        "title": "DIDANOSINE CAPSULE, DELAYED RELEASE PELLETS [PHYSICIANS TOTAL CARE, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=829e744d-7bd4-43dc-9b58-ffb016cb8e67",
        "matched": "tenofovir",
        "snippet": "tenofovir disoproxil fumarate ↑didanosine concentration A dose reduction of didanosine delayed-release capsules to the following dosage once daily taken together with tenofovir disoproxil fumarate and a light meal (400 kcalories or less and 20% fat or less) or in the fasted state is recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "teriflunomide",
      "methotrexate"
    ],
    "severity": "major",
    "mechanism": "Additive hepatotoxicity",
    "effect": "Severe liver injury",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "1146006",
      "6851"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "37f04f8b-001e-66ff-4574-cc34cebce61c",
        "title": "TERIFLUNOMIDE (TERIFLUNOMIDE) TABLET, FILM COATED [BIOCON PHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=37f04f8b-001e-66ff-4574-cc34cebce61c",
        "matched": "methotrexate",
        "snippet": "In patients taking teriflunomide, exposure of drugs which are OAT3 substrates (e.g., cefaclor, cimetidine, ciprofloxacin, penicillin G, ketoprofen, furosemide, methotrexate, zidovudine) may be increased.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tetracycline",
      "children"
    ],
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
    "drugs": [
      "tetracycline",
      "dairy products"
    ],
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
    "drugs": [
      "tetracyclines",
      "children <8 years"
    ],
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
    "drugs": [
      "tetracyclines",
      "sun exposure"
    ],
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
    "drugs": [
      "thalidomide",
      "sedatives"
    ],
    "severity": "major",
    "mechanism": "Additive sedation",
    "effect": "Severe somnolence",
    "management": "Avoid combination or reduce doses",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "10324",
      "3322"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2eda833b-1357-4ed4-a093-194524fcb061",
        "title": "THALOMID (THALIDOMIDE) CAPSULE [CELGENE CORPORATION]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2eda833b-1357-4ed4-a093-194524fcb061",
        "matched": "sedative",
        "snippet": "DRUG INTERACTIONS • Use caution if other drugs which have sedative and hypnotic properties, slow cardiac conduction and/or cause peripheral neuropathy must be used.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "theophylline",
      "charcoal-broiled foods"
    ],
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
    "drugs": [
      "theophylline",
      "cimetidine"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition reduces theophylline clearance",
    "effect": "Theophylline toxicity with arrhythmias",
    "management": "Monitor theophylline levels; use alternative H2 blocker",
    "evidence_level": "A",
    "sources": [
      "Pulmonology guidelines"
    ],
    "rxcui": [
      "10379",
      "2541"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "78a99bfe-6ebe-4ace-80b0-ee019921435e",
        "title": "THEOPHYLLINE SOLUTION [CRANBURY PHARMACEUTICALS, LLC]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=78a99bfe-6ebe-4ace-80b0-ee019921435e",
        "matched": "cimetidine",
        "snippet": "e hepatitis Reduced renal function in infants < 3 months of age Sepsis with multi-organ failure Shock Cessation of Smoking Drug Interactions Adding a drug that inhibits theophylline metabolism (e.g., cimetidine, erythromycin, tacrine) or stopping a concurrently administered drug that enhances theophylline metabolism (e.g., carbamazepine, rifampin). (see PRECAUTIONS, Drug Interactions, Table II). When Signs or Symptom",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "496e258d-a5fd-42da-9a86-73afc8be359b",
        "title": "CIMETIDINE TABLET, FILM COATED [TEVA PHARMACEUTICALS USA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=496e258d-a5fd-42da-9a86-73afc8be359b",
        "matched": "theophylline",
        "snippet": "rug Interactions Cimetidine, apparently through an effect on certain microsomal enzyme systems, has been reported to reduce the hepatic metabolism of warfarin-type anticoagulants, phenytoin, propranolol, nifedipine, chlordiazepoxide, diazepam, certain tricyclic antidepressants, lidocaine, theophylline and metronidazole, thereby delaying elimination and increasing blood levels of these drugs.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "theophylline",
      "ciprofloxacin"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition reduces theophylline clearance",
    "effect": "Theophylline toxicity with seizures possible",
    "management": "Avoid combination or reduce theophylline dose significantly",
    "evidence_level": "A",
    "sources": [
      "FDA",
      "Clinical studies"
    ],
    "rxcui": [
      "10379",
      "2551"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "882657ae-e15b-4c86-a571-b55460bd4726",
        "title": "THEOPHYLLINE (ANHYDROUS) (THEOPHYLLINE ANHYDROUS) TABLET, EXTENDED RELEASE [PROFICIENT RX LP]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=882657ae-e15b-4c86-a571-b55460bd4726",
        "matched": "ciprofloxacin",
        "snippet": "increase Ciprofloxacin Similar to cimetidine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "title": "CIPROFLOXACIN (CIPROFLOXACIN HYDROCHLORIDE) TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "matched": "theophylline",
        "snippet": "Contraindicated Concomitant administration of tizanidine and Ciprofloxacin is contraindicated due to the potentiation of hypotensive and sedative effects of tizanidine [ see Contraindications (4.2)] Theophylline Avoid Use (Plasma Exposure Likely to be Increased and Prolonged) Concurrent administration of Ciprofloxacin with theophylline may result in increased risk of a patient developing central nervous system (CNS)",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "theophylline",
      "quinolones"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Theophylline toxicity",
    "management": "Monitor levels closely",
    "evidence_level": "A",
    "sources": [
      "Pulmonology"
    ],
    "rxcui": [
      "10379",
      "26785"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "theophylline",
      "zileuton"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition increases theophylline levels",
    "effect": "Theophylline toxicity",
    "management": "Monitor theophylline levels; reduce dose by 50%",
    "evidence_level": "A",
    "sources": [
      "Pulmonology guidelines"
    ],
    "rxcui": [
      "10379",
      "131422"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aee65202-fddb-497f-9f11-17cc727cb157",
        "title": "ZYFLO (ZILEUTON) TABLET [CHIESI USA, INC.]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aee65202-fddb-497f-9f11-17cc727cb157",
        "matched": "theophylline",
        "snippet": "Co-administration of ZYFLO and theophylline results in, on average, an approximate doubling of serum theophylline concentrations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "thiazide diuretics",
      "sun exposure"
    ],
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
    "drugs": [
      "thiazolidinediones",
      "insulin"
    ],
    "severity": "moderate",
    "mechanism": "Additive fluid retention",
    "effect": "Heart failure exacerbation",
    "management": "Monitor for edema and CHF",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "33738",
      "5856"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5328761e-59d3-ca7a-e063-6394a90ae810",
        "title": "LANGLARA (INSULIN GLARGINE-ALDY) INJECTION, SOLUTION [LANEXA BIOLOGICS, LLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5328761e-59d3-ca7a-e063-6394a90ae810",
        "matched": "thiazolidinediones",
        "snippet": "Fluid retention and heart failure with concomitant use of thiazolidinediones (TZDs): Observe for signs and symptoms of heart failure; consider dosage reduction or discontinuation of TZD if heart failure occurs.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "thioridazine",
      "fluvoxamine"
    ],
    "severity": "major",
    "mechanism": "CYP2D6 inhibition",
    "effect": "Thioridazine cardiotoxicity",
    "management": "Contraindicated",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "10502",
      "42355"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "1fd16a99-e856-4a37-9dae-c443714fac14",
        "title": "THIORIDAZINE HYDROCHLORIDE TABLET, FILM COATED [SAFECOR HEALTH LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=1fd16a99-e856-4a37-9dae-c443714fac14",
        "matched": "fluvoxamine",
        "snippet": "rug Interactions Reduced cytochrome P450 2D6 isozyme activity, drugs which inhibit this isozyme (e.g., fluoxetine and paroxetine), and certain other drugs (e.g., fluvoxamine, propranolol, and pindolol) appear to appreciably inhibit the metabolism of thioridazine.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "49601858-df61-4522-ac99-0d2892f92e11",
        "title": "FLUVOXAMINE MALEATE CAPSULE, EXTENDED RELEASE [UPSHER-SMITH LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=49601858-df61-4522-ac99-0d2892f92e11",
        "matched": "thioridazine",
        "snippet": "Thioridazine: See Contraindications (4) and Warnings and Precautions (5.4).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ticagrelor",
      "digoxin"
    ],
    "severity": "moderate",
    "mechanism": "P-gp inhibition",
    "effect": "Increased digoxin levels",
    "management": "Monitor digoxin levels",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1116632",
      "3407"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d68b79ab-3104-410e-a63f-9919a23625af",
        "title": "TICAGRELOR TABLET, FILM COATED [ALEMBIC PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d68b79ab-3104-410e-a63f-9919a23625af",
        "matched": "digoxin",
        "snippet": "Monitor digoxin levels with initiation of or any change in ticagrelor.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "dfac7f13-28be-423d-9389-9089da29da17",
        "title": "DIGOXIN TABLET [AMNEAL PHARMACEUTICALS OF NEW YORK LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=dfac7f13-28be-423d-9389-9089da29da17",
        "matched": "ticagrelor",
        "snippet": "Indomethacin 40% NA Mirabegron 29% 27% Nefazodone 27% 15% Nifedipine 45% NA Propantheline 24% 24% Quinine NA 33% Rabeprazole 29% 19% Saquinavir 27% 49% Spironolactone 25% NA Telmisartan 20% to 49% NA Ticagrelor 31% 28% Tolvaptan 30% 20% Trimethoprim 22% to 28% NA Digoxin concentrations increased, but magnitude is unclear Alprazolam, azithromycin, cyclosporine, diclofenac, diphenoxylate, epoprostenol, esomeprazole, ib",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "ticagrelor",
      "simvastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases statin levels",
    "effect": "Myopathy risk",
    "management": "Limit simvastatin to 40mg daily",
    "evidence_level": "A",
    "sources": [
      "FDA recommendations"
    ],
    "rxcui": [
      "1116632",
      "36567"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "d68b79ab-3104-410e-a63f-9919a23625af",
        "title": "TICAGRELOR TABLET, FILM COATED [ALEMBIC PHARMACEUTICALS INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=d68b79ab-3104-410e-a63f-9919a23625af",
        "matched": "simvastatin",
        "snippet": "Patients receiving more than 40 mg per day of simvastatin or lovastatin, or more than 20 mg per day of rosuvastatin may be at increased risk of statin-related adverse effects.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tigecycline",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "Altered gut flora affects vitamin K",
    "effect": "Enhanced anticoagulant effect",
    "management": "Monitor INR during treatment",
    "evidence_level": "B",
    "sources": [
      "Clinical studies",
      "FDA"
    ],
    "rxcui": [
      "391551",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "50605463-2dc2-4b27-bc51-4d87bb9a8539",
        "title": "TIGECYCLINE INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION [SANDOZ INC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=50605463-2dc2-4b27-bc51-4d87bb9a8539",
        "matched": "warfarin",
        "snippet": "DRUG INTERACTIONS • Warfarin: Suitable anticoagulation test should be monitored if tigecycline is administered to patients receiving warfarin.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "tigecycline",
        "snippet": "ons with Warfarin Enzyme Inhibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, enoxacin, famotidine, fluvoxamine, metho",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "timolol drops",
      "oral beta-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive beta-blockade",
    "effect": "Systemic beta-blocker effects",
    "management": "Monitor heart rate and blood pressure",
    "evidence_level": "B",
    "sources": [
      "Ophthalmology guidelines"
    ],
    "rxcui": [
      "10600",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "timolol eye drops",
      "oral beta-blockers"
    ],
    "severity": "moderate",
    "mechanism": "Additive beta-blockade",
    "effect": "Bradycardia and hypotension",
    "management": "Monitor cardiac status",
    "evidence_level": "A",
    "sources": [
      "Ophthalmology"
    ],
    "rxcui": [
      "10600",
      "7442"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tirzepatide",
      "oral contraceptives"
    ],
    "severity": "minor",
    "mechanism": "Delayed absorption",
    "effect": "Reduced contraceptive efficacy",
    "management": "Take OC 1 hour before injection",
    "evidence_level": "B",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "2601723",
      "9072"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "487cd7e7-434c-4925-99fa-aa80b1cc776b",
        "title": "ZEPBOUND (TIRZEPATIDE) INJECTION, SOLUTION ZEPBOUND (TIRZEPATIDE) INJECTION, SOLUTION ZEPBOUND KWIKPEN (TIRZEPATIDE) INJECTION, SOLUTION [ELI LILLY AND COMPANY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=487cd7e7-434c-4925-99fa-aa80b1cc776b",
        "matched": "oral contraceptive",
        "snippet": "Advise patients using oral hormonal contraceptives to switch to a non-oral contraceptive method, or add a barrier method of contraception for 4 weeks after initiation with ZEPBOUND and for 4 weeks after each dose escalation.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tisagenlecleucel",
      "live vaccines"
    ],
    "severity": "major",
    "mechanism": "B-cell aplasia",
    "effect": "Life-threatening infections",
    "management": "Complete vaccination before therapy",
    "evidence_level": "A",
    "sources": [
      "CAR-T protocols"
    ],
    "rxcui": [
      "2015150",
      "live_vaccines"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "aad3ba54-dfd3-4cb3-9e2b-c5ef89559189",
        "title": "KYMRIAH (TISAGENLECLEUCEL) INJECTION, SUSPENSION [NOVARTIS PHARMACEUTICALS CORPORATION]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=aad3ba54-dfd3-4cb3-9e2b-c5ef89559189",
        "matched": "live vaccines",
        "snippet": "Immunization with Live Vaccine The safety of immunization with live vaccines during or following KYMRIAH treatment has not been studied.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tizanidine",
      "ciprofloxacin"
    ],
    "severity": "major",
    "mechanism": "CYP1A2 inhibition",
    "effect": "Severe hypotension",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "FDA"
    ],
    "rxcui": [
      "17128",
      "2551"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "17ca23af-c88f-4235-930a-d7568051696f",
        "title": "TIZANIDINE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=17ca23af-c88f-4235-930a-d7568051696f",
        "matched": "ciprofloxacin",
        "snippet": "Strong CYP1A2 Inhibitors Concomitant use of tizanidine hydrochloride with strong cytochrome P450 1A2 (CYP1A2) inhibitors (e.g., fluvoxamine, ciprofloxacin) is contraindicated.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "title": "CIPROFLOXACIN (CIPROFLOXACIN HYDROCHLORIDE) TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "matched": "tizanidine",
        "snippet": "Table 9: Drugs That are Affected by and Affecting Ciprofloxacin Drugs That are Affected by Ciprofloxacin Drug(s) Recommendation Comments Tizanidine Contraindicated Concomitant administration of tizanidine and Ciprofloxacin is contraindicated due to the potentiation of hypotensive and sedative effects of tizanidine [ see Contraindications (4.2)] Theophylline Avoid Use (Plasma Exposure Likely to be Increased and Prolon",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tocilizumab",
      "statins"
    ],
    "severity": "moderate",
    "mechanism": "CYP enzyme normalization",
    "effect": "Increased statin levels",
    "management": "Monitor lipid levels",
    "evidence_level": "B",
    "sources": [
      "Rheumatology"
    ],
    "rxcui": [
      "364157",
      "36567"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tolterodine",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Tolterodine toxicity",
    "management": "Reduce tolterodine dose",
    "evidence_level": "A",
    "sources": [
      "Urology"
    ],
    "rxcui": [
      "72143",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "8cd23ff7-71ba-4391-95bd-a3a7f347713d",
        "title": "TOLTERODINE TARTRATE (TOLTERODINE) CAPSULE, EXTENDED RELEASE [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=8cd23ff7-71ba-4391-95bd-a3a7f347713d",
        "matched": "ketoconazole",
        "snippet": "Potent CYP3A4 Inhibitors Ketoconazole (200 mg daily), a potent CYP3A4 inhibitor, increased the mean C max and AUC of tolterodine by 2- and 2.5-fold, respectively, in CYP2D6 poor metabolizers.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "topiramate",
      "lithium"
    ],
    "severity": "moderate",
    "mechanism": "Reduced renal clearance",
    "effect": "Lithium toxicity",
    "management": "Monitor lithium levels",
    "evidence_level": "B",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "38404",
      "6448"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "a01b2631-263f-4b28-9820-9a5bed2f8d5c",
        "title": "TOPIRAMATE CAPSULE, EXTENDED RELEASE [ASCEND LABORATORIES, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=a01b2631-263f-4b28-9820-9a5bed2f8d5c",
        "matched": "lithium",
        "snippet": "DRUG INTERACTIONS • Contraceptives: Decreased contraceptive efficacy and increased breakthrough bleeding, especially at doses greater than 200 mg per day (7.5) • Monitor lithium levels if lithium is used with high-dose topiramate extended-release capsules (7.8) 7.1 Alcohol Alcohol use is contraindicated within 6 hours prior to and 6 hours after topiramate extended-release capsules administration [see Contraindicatio",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "torsemide",
      "probenecid"
    ],
    "severity": "moderate",
    "mechanism": "Reduced renal secretion of torsemide",
    "effect": "Increased torsemide levels",
    "management": "Monitor for enhanced diuretic effect",
    "evidence_level": "B",
    "sources": [
      "Clinical pharmacology"
    ],
    "rxcui": [
      "38413",
      "8698"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "26a3af16-39fc-482d-8a8e-9473af4b0e3f",
        "title": "TORSEMIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=26a3af16-39fc-482d-8a8e-9473af4b0e3f",
        "matched": "probenecid",
        "snippet": "Organic Anion Drugs Coadministration of organic anion drugs (e.g., probenecid) that undergo significant renal tubular secretion have the potential to reduce secretion of torsemide into the proximal tubule and thereby decreases the diuretic activity of torsemide.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "trastuzumab",
      "anthracyclines"
    ],
    "severity": "major",
    "mechanism": "Additive cardiotoxicity",
    "effect": "Cardiomyopathy and heart failure risk",
    "management": "Avoid concurrent use; monitor cardiac function if sequential therapy",
    "evidence_level": "A",
    "sources": [
      "FDA black box warning",
      "Cardio-oncology guidelines"
    ],
    "rxcui": [
      "224905",
      "3639"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "285d2142-5bfa-401c-9246-7de21c4451af",
        "title": "HERCESSI (TRASTUZUMAB-STRF) INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION HERCESSI (TRASTUZUMAB-STRF) KIT [ACCORD BIOPHARMA INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=285d2142-5bfa-401c-9246-7de21c4451af",
        "matched": "anthracyclines",
        "snippet": "DRUG INTERACTIONS Anthracyclines Patients who receive anthracycline after stopping trastuzumab products may be at increased risk of cardiac dysfunction because of trastuzumab products estimated long washout period [see Clinical Pharmacology (12.3)] If possible, avoid anthracycline-based therapy for up to 7 months after stopping trastuzumab products.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "trazodone",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases trazodone levels",
    "effect": "Enhanced sedation and cardiac effects",
    "management": "Reduce trazodone dose; monitor for arrhythmias",
    "evidence_level": "B",
    "sources": [
      "Clinical studies",
      "Studies"
    ],
    "rxcui": [
      "10737",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5de7eaca-63a2-05bd-e063-6294a90a7db0",
        "title": "TRAZODONE HYDROCHLORIDE TABLET [ST. MARY'S MEDICAL PARK PHARMACY]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5de7eaca-63a2-05bd-e063-6294a90a7db0",
        "matched": "ketoconazole",
        "snippet": "Examples itraconazole, ketoconazole, clarithromycin, indinavir Strong CYP3A4 Inducers Clinical Impact The concomitant use of trazodone and strong CYP3A4 inducers decreased the exposure of trazodone compared to the use of trazodone alone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "tretinoin",
      "benzoyl peroxide"
    ],
    "severity": "moderate",
    "mechanism": "Chemical incompatibility and irritation",
    "effect": "Severe skin irritation",
    "management": "Use at different times of day",
    "evidence_level": "A",
    "sources": [
      "Dermatology guidelines"
    ],
    "rxcui": [
      "11089",
      "1191"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tretinoin",
      "tetracyclines"
    ],
    "severity": "major",
    "mechanism": "Increased intracranial pressure",
    "effect": "Pseudotumor cerebri",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Dermatology"
    ],
    "rxcui": [
      "10689",
      "10395"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "tricyclic antidepressants",
      "elderly"
    ],
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
    "drugs": [
      "tricyclic antidepressants",
      "glaucoma"
    ],
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
    "drugs": [
      "tricyclics",
      "bph"
    ],
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
    "drugs": [
      "tyramine-rich foods",
      "maoi"
    ],
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
    "drugs": [
      "umbralisib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Treatment failure",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Oncology"
    ],
    "rxcui": [
      "2284524",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "vadadustat",
      "proton pump inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Altered gastric pH",
    "effect": "Variable absorption",
    "management": "Monitor hemoglobin response",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "2467892",
      "40790"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "valbenazine",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Reduced efficacy",
    "management": "Increase valbenazine dose",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "1827857",
      "cyp3a4_inducers"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4c970164-cafb-421f-9eb5-c226ef0a3417",
        "title": "INGREZZA (VALBENAZINE) CAPSULE INGREZZA (VALBENAZINE) KIT INGREZZA SPRINKLE (VALBENAZINE) CAPSULE [NEUROCRINE BIOSCIENCES, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c970164-cafb-421f-9eb5-c226ef0a3417",
        "matched": "strong cyp3a4 inducers",
        "snippet": "Use of strong CYP3A4 inducers with INGREZZA or INGREZZA SPRINKLE Concomitant use is not recommended.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "valerian",
      "sedatives"
    ],
    "severity": "moderate",
    "mechanism": "CNS depression",
    "effect": "Enhanced sedation",
    "management": "Avoid combination",
    "evidence_level": "C",
    "sources": [
      "Experience",
      "Clinical"
    ],
    "rxcui": [
      "258331",
      "3322"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "valproic acid",
      "aspirin"
    ],
    "severity": "major",
    "mechanism": "Reye syndrome risk",
    "effect": "Hepatic failure",
    "management": "Avoid in children",
    "evidence_level": "A",
    "sources": [
      "Guidelines"
    ],
    "rxcui": [
      "11118",
      "1191"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "title": "VALPROIC ACID CAPSULE, LIQUID FILLED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "matched": "aspirin",
        "snippet": "Therefore increased monitoring of valproate and concomitant drug concentrations and dosage adjustment are indicated whenever enzyme-inducing or inhibiting drugs are introduced or withdrawn (7.1) Aspirin, carbapenem antibiotics, estrogen-containing hormonal contraceptives: Monitoring of valproate concentrations is recommended (7.1) Co-administration of valproate can affect the pharmacokinetics of other drugs (e.g.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "valproic acid",
      "lamotrigine"
    ],
    "severity": "moderate",
    "mechanism": "Inhibition of lamotrigine glucuronidation",
    "effect": "Lamotrigine toxicity including serious rash",
    "management": "Start lamotrigine at lower dose; titrate slowly",
    "evidence_level": "A",
    "sources": [
      "Epilepsy guidelines",
      "Guidelines"
    ],
    "rxcui": [
      "11118",
      "48527"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "title": "VALPROIC ACID CAPSULE, LIQUID FILLED [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=ec41025a-ed7d-48c8-9005-08e3a9417f30",
        "matched": "lamotrigine",
        "snippet": "diazepam, ethosuximide, lamotrigine, phenytoin) by inhibiting their metabolism or protein binding displacement (7.2) Patients stabilized on rufinamide should begin valproate therapy at a low dose, and titrate to clinically effective dose (7.2) Dosage adjustment of amitriptyline/nortriptyline, propofol, warfarin, and zidovudine may be necessary if used concomitantly with Valproic Acid Capsules (7.2) Topiramate: Hypera",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "vancomycin",
      "furosemide"
    ],
    "severity": "moderate",
    "mechanism": "Additive nephrotoxicity",
    "effect": "Increased kidney damage risk",
    "management": "Monitor renal function closely",
    "evidence_level": "B",
    "sources": [
      "Nephrology literature",
      "Studies"
    ],
    "rxcui": [
      "11124",
      "4603"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "vardenafil",
      "class ia antiarrhythmics"
    ],
    "severity": "major",
    "mechanism": "QT prolongation",
    "effect": "Torsades de pointes",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "143078",
      "9068"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "vasopressin",
      "cardiac glycosides"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced cardiac sensitivity",
    "effect": "Arrhythmias",
    "management": "Monitor ECG",
    "evidence_level": "B",
    "sources": [
      "Critical care"
    ],
    "rxcui": [
      "11170",
      "3407"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "vasopressin",
      "chlorpropamide"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced antidiuretic effect",
    "effect": "Severe hyponatremia",
    "management": "Monitor sodium levels",
    "evidence_level": "B",
    "sources": [
      "Endocrinology"
    ],
    "rxcui": [
      "11170",
      "2468"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "53372911-5a55-dfac-e063-6394a90ae2f6",
        "title": "VASOPRESSIN INJECTION [HF ACQUISITION CO LLC, DBA HEALTHFIRST]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=53372911-5a55-dfac-e063-6394a90ae2f6",
        "matched": "chlorpropamide",
        "snippet": "Drugs Suspected of Causing SIADH Use with drugs suspected of causing SIADH (e.g., SSRIs, tricyclic antidepressants, haloperidol, chlorpropamide, enalapril, methyldopa, pentamidine, vincristine, cyclophosphamide, ifosfamide, felbamate) may increase the pressor effect in addition to the antidiuretic effect of vasopressin injection.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "vecuronium",
      "liver disease"
    ],
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
    "drugs": [
      "venetoclax",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Venetoclax toxicity",
    "management": "Reduce venetoclax dose significantly",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "1731011",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b118a40d-6b56-cee3-10f6-ded821a97018",
        "title": "VENCLEXTA (VENETOCLAX) KIT VENCLEXTA (VENETOCLAX) TABLET, FILM COATED [ABBVIE INC.]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b118a40d-6b56-cee3-10f6-ded821a97018",
        "matched": "cyp3a4 inhibitors",
        "snippet": "For patients with CLL/SLL or AML, reduce the dose of VENCLEXTA when coadministered with moderate CYP3A4 inhibitors or P-gp inhibitors [see Dosage and Administration (2.6) and Drug Interactions (7.1)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "venlafaxine",
      "linezolid"
    ],
    "severity": "major",
    "mechanism": "MAO inhibition",
    "effect": "Serotonin syndrome",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Warnings"
    ],
    "rxcui": [
      "39786",
      "274783"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e81a2daf-b8b2-7c05-b532-bc775700b100",
        "title": "VENLAFAXINE TABLET, EXTENDED RELEASE [ALMATICA PHARMA LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e81a2daf-b8b2-7c05-b532-bc775700b100",
        "matched": "linezolid",
        "snippet": "Intervention Concomitant use of Venlafaxine Extended-Release Tablets is contraindicated in patients taking MAOIs, including MAOIs such as linezolid or intravenous methylene blue [see Dosage and Administration (2.9), Contraindications (4), and Warnings and Precautions (5.2)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "venlafaxine",
      "tramadol"
    ],
    "severity": "major",
    "mechanism": "Serotonin syndrome risk",
    "effect": "Hyperthermia, altered mental status, neuromuscular abnormalities",
    "management": "Avoid combination; use alternative analgesic",
    "evidence_level": "A",
    "sources": [
      "FDA warnings",
      "Psychiatry guidelines"
    ],
    "rxcui": [
      "39786",
      "10689"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "e81a2daf-b8b2-7c05-b532-bc775700b100",
        "title": "VENLAFAXINE TABLET, EXTENDED RELEASE [ALMATICA PHARMA LLC]",
        "section": "Warnings and Precautions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=e81a2daf-b8b2-7c05-b532-bc775700b100",
        "matched": "tramadol",
        "snippet": "The risk is increased with concomitant use of other serotonergic drugs (including triptans, tricyclic antidepressants, fentanyl, lithium, tramadol, meperidine, methadone, tryptophan, buspirone, amphetamines, and St.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "verapamil",
      "dantrolene"
    ],
    "severity": "major",
    "mechanism": "Additive negative inotropic effects",
    "effect": "Cardiovascular collapse",
    "management": "Avoid combination; life-threatening interaction",
    "evidence_level": "A",
    "sources": [
      "Case reports"
    ],
    "rxcui": [
      "11170",
      "2980"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c10e7eb1-0155-43ff-aa56-8cd468e8e84d",
        "title": "DANTROLENE SODIUM CAPSULE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c10e7eb1-0155-43ff-aa56-8cd468e8e84d",
        "matched": "verapamil",
        "snippet": "Cardiovascular collapse in patients treated simultaneously with verapamil and Dantrolene Sodium is rare.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "verapamil",
      "lovastatin"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Rhabdomyolysis risk",
    "management": "Use pravastatin instead",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "11170",
      "6472"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "5467dad4-f3ba-4036-b5f4-4d2d4d5abc34",
        "title": "VERAPAMIL HYDROCHLORIDE TABLET, FILM COATED, EXTENDED RELEASE [A-S MEDICATION SOLUTIONS]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=5467dad4-f3ba-4036-b5f4-4d2d4d5abc34",
        "matched": "lovastatin",
        "snippet": "Limit the daily dose of lovastatin to 40 mg.",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "7b86160d-74a9-4774-b5b3-5641e686991f",
        "title": "LOVASTATIN TABLET [BLUEPOINT LABORATORIES]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=7b86160d-74a9-4774-b5b3-5641e686991f",
        "matched": "verapamil",
        "snippet": "Danazol, diltiazem, dronedarone or verapamil with higher doses of lovastatin The dose of lovastatin should not exceed 20 mg daily in patients receiving concomitant medication with danazol, diltiazem, dronedarone, or verapamil.The benefits of the use of lovastatin in patients receiving danazol, diltiazem, dronedarone, or verapamil should be carefully weighed against the risks of these combinations.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "vincristine",
      "azole antifungals"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases vincristine levels",
    "effect": "Severe peripheral neuropathy",
    "management": "Avoid strong azole antifungals; consider alternatives",
    "evidence_level": "A",
    "sources": [
      "FDA safety alert",
      "Hematology"
    ],
    "rxcui": [
      "5775",
      "142"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "vincristine",
      "itraconazole"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition increases vincristine levels",
    "effect": "Severe peripheral neuropathy",
    "management": "Avoid azole antifungals; consider alternatives",
    "evidence_level": "A",
    "sources": [
      "FDA safety communications"
    ],
    "rxcui": [
      "5775",
      "28031"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "b22e4c8e-dbe1-4d4b-a026-e1812974071c",
        "title": "VINCRISTINE SULFATE INJECTION, SOLUTION [HOSPIRA, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=b22e4c8e-dbe1-4d4b-a026-e1812974071c",
        "matched": "itraconazole",
        "snippet": "Concurrent administration of vincristine sulfate with itraconazole or fluconazole (known inhibitors of the CYP3A metabolic pathway) has been reported to cause an earlier onset and/or an increased severity of neuromuscular side effects (see ADVERSE REACTIONS).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "voclosporin",
      "strong cyp3a4 inhibitors"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Voclosporin toxicity",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "2284603",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "9f489295-1156-52c7-5fd0-5c4c52f9b813",
        "title": "LUPKYNIS (VOCLOSPORIN) CAPSULE [AURINIA PHARMA U.S., INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=9f489295-1156-52c7-5fd0-5c4c52f9b813",
        "matched": "strong cyp3a4 inhibitors",
        "snippet": "Co-administration of LUPKYNIS with strong CYP3A4 inhibitors (e.g., ketoconazole, itraconazole, clarithromycin) is contraindicated [see Contraindications (4)].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "voriconazole",
      "warfarin"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Bleeding risk",
    "management": "Reduce dose",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "121243",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "c620b2d7-3c2b-4252-8cfc-2f322d624435",
        "title": "VORICONAZOLE TABLET, FILM COATED [AMERICAN HEALTH PACKAGING]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=c620b2d7-3c2b-4252-8cfc-2f322d624435",
        "matched": "warfarin",
        "snippet": "Warfarin* (CYP2C9 Inhibition) Other Oral Coumarin Anticoagulants (CYP2C9/3A4 Inhibition) Prothrombin Time Significantly Increased Not Studied In Vivo or In Vitro for other Oral Coumarin Anticoagulants, but Drug Plasma Exposure Likely to be Increased If patients receiving coumarin preparations are treated simultaneously with voriconazole, the prothrombin time or other suitable anticoagulation tests should be monitored",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "voriconazole",
        "snippet": "arin Enzyme Inhibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, enoxacin, famotidine, fluvoxamine, methoxsalen, mexil",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "vraylar",
      "moderate cyp3a4 inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition",
    "effect": "Increased cariprazine exposure",
    "management": "Consider dose reduction",
    "evidence_level": "B",
    "sources": [
      "Clinical"
    ],
    "rxcui": [
      "1596860",
      "cyp3a4_inhibitors"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "4b5f7c65-aa2d-452a-b3db-bc85c06ff12f",
        "title": "VRAYLAR (CARIPRAZINE) CAPSULE, GELATIN COATED VRAYLAR (CARIPRAZINE) KIT [ALLERGAN, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4b5f7c65-aa2d-452a-b3db-bc85c06ff12f",
        "matched": "moderate cyp3a4 inhibitors",
        "snippet": "Clinically Significant Drug Interactions with VRAYLAR Strong or Moderate CYP3A4 Inhibitors Clinical Impact: Concomitant use of VRAYLAR with a strong or moderate CYP3A4 inhibitor increases the exposures of cariprazine and its major active metabolite, didesmethylcariprazine (DDCAR), compared to use of VRAYLAR alone [see Clinical Pharmacology (12.3) ].",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "warfarin",
      "acetaminophen"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced anticoagulant effect",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR with regular use",
    "evidence_level": "B",
    "sources": [
      "Clinical studies",
      "Anticoagulation"
    ],
    "rxcui": [
      "11289",
      "161"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "37ded76a-ee8d-f22c-e063-6394a90a00c2",
        "title": "MUCINEX COLD, FLU, AND SORE THROAT (ACETAMINOPHEN, GUAIFENESIN) CAPSULE, LIQUID FILLED [RECKITT BENCKISER LLC]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=37ded76a-ee8d-f22c-e063-6394a90a00c2",
        "matched": "warfarin",
        "snippet": "such as occurs with smoking, asthma, chronic bronchitis, or emphysema ■ cough that occurs with too much phlegm (mucus) Ask a doctor or pharmacist before use if you are taking the blood thinning drug warfarin When using this product do not use more than directed Stop use and ask a doctor if ■ pain or cough gets worse or lasts more than 7 days ■ fever gets worse or lasts more than 3 days ■ redness or swelling is prese",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "warfarin",
      "amiodarone"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition increases warfarin exposure",
    "effect": "Significantly increased bleeding risk",
    "management": "Reduce warfarin dose by 25-50%; monitor INR closely",
    "evidence_level": "A",
    "sources": [
      "Cardiology guidelines",
      "FDA",
      "Anticoagulation guidelines"
    ],
    "rxcui": [
      "11289",
      "703"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "amiodarone",
        "snippet": "Table 2: Examples of CYP450 Interactions with Warfarin Enzyme Inhibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, eno",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "4c149392-a4f0-4e2d-a13f-2b94810005de",
        "title": "AMIODARONE HYDROCHLORIDE TABLET [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=4c149392-a4f0-4e2d-a13f-2b94810005de",
        "matched": "warfarin",
        "snippet": "Warfarin Potentiates anticoagulant response and can result in serious or fatal bleeding.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "warfarin",
      "ciprofloxacin"
    ],
    "severity": "moderate",
    "mechanism": "CYP1A2/3A4 inhibition increases warfarin exposure",
    "effect": "Increased INR and bleeding risk",
    "management": "Monitor INR closely; adjust warfarin dose if needed",
    "evidence_level": "B",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "11289",
      "2551"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "ciprofloxacin",
        "snippet": "zole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, enoxacin, famotidine, fluvoxamine, methoxsalen, mexiletine, norfloxacin, oral contraceptives, phenylpropanolamine, propafenone, propranolol, terbinafine, thiabendazole, ticlopidine, verapamil,",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "title": "CIPROFLOXACIN (CIPROFLOXACIN HYDROCHLORIDE) TABLET, FILM COATED [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=bb2edaca-6cf2-4100-83f5-8ce142f68e59",
        "matched": "warfarin",
        "snippet": "Monitor prothrombin time and INR frequently during and shortly after co-administration of Ciprofloxacin with an oral anti-coagulant (for example, warfarin).",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "warfarin",
      "coq10"
    ],
    "severity": "moderate",
    "mechanism": "Reduced anticoagulation",
    "effect": "Thrombosis risk",
    "management": "Monitor INR",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "11289",
      "coq10"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "warfarin",
      "cranberry juice"
    ],
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
    "drugs": [
      "warfarin",
      "elderly"
    ],
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
  },
  {
    "drugs": [
      "warfarin",
      "fish oil"
    ],
    "severity": "moderate",
    "mechanism": "Antiplatelet effects",
    "effect": "Enhanced bleeding",
    "management": "Monitor INR",
    "evidence_level": "C",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "11289",
      "fish_oil"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "warfarin",
      "fluconazole"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Increased anticoagulation effect",
    "management": "Monitor INR daily; consider dose reduction",
    "evidence_level": "A",
    "sources": [
      "Clinical pharmacology",
      "Studies"
    ],
    "rxcui": [
      "11289",
      "4450"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "fluconazole",
        "snippet": "Table 2: Examples of CYP450 Interactions with Warfarin Enzyme Inhibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, eno",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "98ac5455-d26c-4780-a5a3-bf8d85917626",
        "title": "FLUCONAZOLE TABLET [SPORTPHARM LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=98ac5455-d26c-4780-a5a3-bf8d85917626",
        "matched": "warfarin",
        "snippet": "See PRECAUTIONS.) Warfarin:There was a significant increase in prothrombin time response (area under the prothrombin time-time curve) following a single dose of warfarin (15 mg) administered to 13 normal male volunteers following oral fluconazole 200 mg administered daily for 14 days as compared to the administration of warfarin alone.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "warfarin",
      "green leafy vegetables"
    ],
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
    "drugs": [
      "warfarin",
      "thyroid hormones"
    ],
    "severity": "moderate",
    "mechanism": "Increased metabolism of clotting factors",
    "effect": "Enhanced anticoagulant effect",
    "management": "Monitor INR when starting/stopping thyroid therapy",
    "evidence_level": "B",
    "sources": [
      "Endocrinology literature"
    ],
    "rxcui": [
      "11289",
      "10582"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "warfarin",
      "trimethoprim-sulfamethoxazole"
    ],
    "severity": "major",
    "mechanism": "CYP2C9 inhibition and protein binding displacement",
    "effect": "Increased bleeding risk",
    "management": "Monitor INR frequently; adjust warfarin dose",
    "evidence_level": "A",
    "sources": [
      "Clinical studies",
      "Hematology"
    ],
    "rxcui": [
      "11289",
      "8576"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "warfarin",
      "vitamin e"
    ],
    "severity": "moderate",
    "mechanism": "Enhanced bleeding",
    "effect": "Bleeding risk",
    "management": "Monitor INR",
    "evidence_level": "C",
    "sources": [
      "Reports"
    ],
    "rxcui": [
      "11289",
      "11250"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "warfarin",
      "vitamin k foods"
    ],
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
    "drugs": [
      "zafirlukast",
      "warfarin"
    ],
    "severity": "moderate",
    "mechanism": "CYP2C9 inhibition",
    "effect": "Enhanced anticoagulation",
    "management": "Monitor INR",
    "evidence_level": "A",
    "sources": [
      "Studies"
    ],
    "rxcui": [
      "25078",
      "11289"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "baba507f-6557-4551-815c-9ab6606e4ee1",
        "title": "ZAFIRLUKAST TABLET, COATED [STRIDES PHARMA SCIENCE LIMITED]",
        "section": "Warnings",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=baba507f-6557-4551-815c-9ab6606e4ee1",
        "matched": "warfarin",
        "snippet": "Concomitant Warfarin Administration: Coadministration of zafirlukast with warfarin results in a clinically significant increase in prothrombin time (PT).",
        "retrieved": "2026-10-20"
      },
      {
        "source_type": "label",
        "id": "cdbbc317-35d3-42ba-94f0-c83891358529",
        "title": "WARFARIN SODIUM TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=cdbbc317-35d3-42ba-94f0-c83891358529",
        "matched": "zafirlukast",
        "snippet": "hibitors Inducers CYP2C9 amiodarone, capecitabine, cotrimoxazole, etravirine, fluconazole, fluvastatin, fluvoxamine, metronidazole, miconazole, oxandrolone, sulfinpyrazone, tigecycline, voriconazole, zafirlukast aprepitant, bosentan, carbamazepine, phenobarbital, rifampin CYP1A2 acyclovir, allopurinol, caffeine, cimetidine, ciprofloxacin, disulfiram, enoxacin, famotidine, fluvoxamine, methoxsalen, mexiletine, norflox",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "zaleplon",
      "cimetidine"
    ],
    "severity": "moderate",
    "mechanism": "Aldehyde oxidase inhibition",
    "effect": "Increased zaleplon levels",
    "management": "Reduce zaleplon dose or use alternative H2 blocker",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "39999",
      "2541"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "2cc7adee-2c4c-4fed-9914-545e70dba773",
        "title": "ZALEPLON CAPSULE [PD-RX PHARMACEUTICALS, INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=2cc7adee-2c4c-4fed-9914-545e70dba773",
        "matched": "cimetidine",
        "snippet": "Drugs That Inhibit Both Aldehyde Oxidase and CYP3A4 Cimetidine: Cimetidine inhibits both aldehyde oxidase (in vitro) and CYP3A4 (in vitro and in vivo), the primary and secondary enzymes, respectively, responsible for zaleplon metabolism.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "zanubrutinib",
      "strong cyp3a4 inducers"
    ],
    "severity": "major",
    "mechanism": "CYP3A4 induction",
    "effect": "Loss of efficacy",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Hematology"
    ],
    "rxcui": [
      "2179555",
      "cyp3a4_inducers"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "ziprasidone",
      "azithromycin"
    ],
    "severity": "major",
    "mechanism": "QT prolongation",
    "effect": "Torsades de pointes",
    "management": "Avoid combination",
    "evidence_level": "A",
    "sources": [
      "Cardiology"
    ],
    "rxcui": [
      "58919",
      "18631"
    ],
    "citation_status": "unverified"
  },
  {
    "drugs": [
      "zolpidem",
      "ketoconazole"
    ],
    "severity": "moderate",
    "mechanism": "CYP3A4 inhibition increases zolpidem levels",
    "effect": "Enhanced sedation and next-day impairment",
    "management": "Reduce zolpidem dose; monitor for excessive sedation",
    "evidence_level": "A",
    "sources": [
      "Clinical studies"
    ],
    "rxcui": [
      "39968",
      "6135"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "83510333-f07d-4b81-a3ae-2801d114bd31",
        "title": "ZOLPIDEM TARTRATE TABLET [CARDINAL HEALTH 107, LLC]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=83510333-f07d-4b81-a3ae-2801d114bd31",
        "matched": "ketoconazole",
        "snippet": "John's wort): Combination use may decrease effect (7.2) • Ketoconazole: Combination use may increase effect (7.2) 7.1 CNS-Active Drugs CNS Depressants Coadministration of zolpidem with other CNS depressants increases the risk of CNS depression.",
        "retrieved": "2026-10-20"
      }
    ]
  },
  {
    "drugs": [
      "zonisamide",
      "carbonic anhydrase inhibitors"
    ],
    "severity": "moderate",
    "mechanism": "Additive metabolic acidosis",
    "effect": "Severe acidosis and kidney stones",
    "management": "Monitor acid-base status",
    "evidence_level": "B",
    "sources": [
      "Nephrology"
    ],
    "rxcui": [
      "25861",
      "1925"
    ],
    "citation_status": "label_mention",
    "citations": [
      {
        "source_type": "label",
        "id": "40094d96-e979-4b3e-840f-a96677480f96",
        "title": "ZONISAMIDE CAPSULE [REMEDYREPACK INC.]",
        "section": "Drug Interactions",
        "url": "https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=40094d96-e979-4b3e-840f-a96677480f96",
        "matched": "carbonic anhydrase inhibitors",
        "snippet": "Other Carbonic Anhydrase Inhibitors:Concomitant use of zonisamide, a carbonic anhydrase inhibitor, with any other carbonic anhydrase inhibitor (e.g., topiramate, acetazolamide or dichlorphenamide), may increase the severity of metabolic acidosis and may also increase the risk of kidney stone formation or the risk of hyperammonemia.",
        "retrieved": "2026-10-20"
      }
    ]
  }
];

export default KNOWN_INTERACTIONS;
