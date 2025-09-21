// Curated CPIC Level A guidelines for local use (no external DB)
// Structure approximates the Supabase/Hasura-backed schema used elsewhere

export const CPIC_GUIDELINES_DB = [
  {
    gene_symbol: 'DPYD',
    gene: { name: 'Dihydropyrimidine Dehydrogenase' },
    drug_rxcui: '40048',
    drug: { name: 'Fluorouracil', generic_name: 'fluorouracil' },
    phenotype: 'DPYD deficiency',
    recommendation: 'Avoid use or reduce dose by 50% or more',
    evidence_level: 'A',
    implications: 'Severe toxicity risk with normal 5-FU dosing',
    dosage_adjustment: 'Start with 50% dose reduction',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'UGT1A1',
    gene: { name: 'UDP Glucuronosyltransferase Family 1 Member A1' },
    drug_rxcui: '39998',
    drug: { name: 'Irinotecan', generic_name: 'irinotecan' },
    phenotype: 'UGT1A1*28/*28',
    recommendation: 'Reduce starting dose by 1 level',
    evidence_level: 'A',
    implications: 'Increased risk of neutropenia',
    dosage_adjustment: 'Reduce starting dose by 25-50%',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'CYP2C19',
    gene: { name: 'Cytochrome P450 Family 2 Subfamily C Member 19' },
    drug_rxcui: '42463',
    drug: { name: 'Clopidogrel', generic_name: 'clopidogrel' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Alternative antiplatelet therapy',
    evidence_level: 'A',
    implications: 'Reduced efficacy of clopidogrel',
    dosage_adjustment: 'Use prasugrel or ticagrelor instead',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'CYP2C9',
    gene: { name: 'Cytochrome P450 Family 2 Subfamily C Member 9' },
    drug_rxcui: '11289',
    drug: { name: 'Warfarin', generic_name: 'warfarin' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Reduce dose by 25-50%',
    evidence_level: 'A',
    implications: 'Increased bleeding risk',
    dosage_adjustment: 'Start with lower dose and monitor INR closely',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'TPMT',
    gene: { name: 'Thiopurine S-Methyltransferase' },
    drug_rxcui: '6387',
    drug: { name: 'Azathioprine', generic_name: 'azathioprine' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Reduce dose by 90% or avoid',
    evidence_level: 'A',
    implications: 'Severe bone marrow toxicity risk',
    dosage_adjustment: 'Start with 10% of standard dose',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'TPMT',
    gene: { name: 'Thiopurine S-Methyltransferase' },
    drug_rxcui: '18631',
    drug: { name: '6-Mercaptopurine', generic_name: 'mercaptopurine' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Reduce dose by 90% or avoid',
    evidence_level: 'A',
    implications: 'Severe bone marrow toxicity risk',
    dosage_adjustment: 'Start with 10% of standard dose',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'CYP2D6',
    gene: { name: 'Cytochrome P450 Family 2 Subfamily D Member 6' },
    drug_rxcui: '2670',
    drug: { name: 'Codeine', generic_name: 'codeine' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Avoid codeine, use alternative analgesic',
    evidence_level: 'A',
    implications: 'Lack of analgesic efficacy',
    dosage_adjustment: 'Use morphine or other non-codeine opioid',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'CYP2D6',
    gene: { name: 'Cytochrome P450 Family 2 Subfamily D Member 6' },
    drug_rxcui: '10689',
    drug: { name: 'Tramadol', generic_name: 'tramadol' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Avoid tramadol, use alternative analgesic',
    evidence_level: 'A',
    implications: 'Lack of analgesic efficacy',
    dosage_adjustment: 'Use morphine or other non-tramadol opioid',
    sources: ['CPIC', 'FDA']
  }
  ,
  // --- HLA examples (presence-based risk alleles) ---
  {
    gene_symbol: 'HLA-B',
    gene: { name: 'Human Leukocyte Antigen B' },
    drug_rxcui: '1596450',
    drug: { name: 'Abacavir', generic_name: 'abacavir' },
    phenotype: 'HLA-B*57:01 positive',
    recommendation: 'Do not use abacavir',
    evidence_level: 'A',
    implications: 'High risk of hypersensitivity reaction',
    dosage_adjustment: 'Avoid drug',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'HLA-B',
    gene: { name: 'Human Leukocyte Antigen B' },
    drug_rxcui: '2002',
    drug: { name: 'Carbamazepine', generic_name: 'carbamazepine' },
    phenotype: 'HLA-B*15:02 positive',
    recommendation: 'Avoid carbamazepine',
    evidence_level: 'A',
    implications: 'Increased risk of SJS/TEN',
    dosage_adjustment: 'Avoid drug; consider alternatives',
    sources: ['CPIC', 'FDA']
  },
  {
    gene_symbol: 'HLA-A',
    gene: { name: 'Human Leukocyte Antigen A' },
    drug_rxcui: '2002',
    drug: { name: 'Carbamazepine', generic_name: 'carbamazepine' },
    phenotype: 'HLA-A*31:01 positive',
    recommendation: 'Consider alternatives to reduce hypersensitivity risk',
    evidence_level: 'A',
    implications: 'Higher risk of hypersensitivity reactions',
    dosage_adjustment: 'Avoid drug when possible',
    sources: ['CPIC']
  },
  {
    gene_symbol: 'HLA-B',
    gene: { name: 'Human Leukocyte Antigen B' },
    drug_rxcui: '3529',
    drug: { name: 'Allopurinol', generic_name: 'allopurinol' },
    phenotype: 'HLA-B*58:01 positive',
    recommendation: 'Avoid allopurinol',
    evidence_level: 'A',
    implications: 'Risk of severe cutaneous adverse reactions',
    dosage_adjustment: 'Avoid drug; use alternatives (e.g., febuxostat if appropriate)',
    sources: ['CPIC', 'FDA']
  }
  ,
  // NUDT15 for thiopurines (adds to TPMT guidance)
  {
    gene_symbol: 'NUDT15',
    gene: { name: 'Nudix Hydrolase 15' },
    drug_rxcui: '18631',
    drug: { name: '6-Mercaptopurine', generic_name: 'mercaptopurine' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Drastically reduce dose or avoid; consider alternative therapy',
    evidence_level: 'A',
    implications: 'Severe myelosuppression risk',
    dosage_adjustment: 'Start with 10% of standard dose or avoid',
    sources: ['CPIC']
  },
  {
    gene_symbol: 'NUDT15',
    gene: { name: 'Nudix Hydrolase 15' },
    drug_rxcui: '6387',
    drug: { name: 'Azathioprine', generic_name: 'azathioprine' },
    phenotype: 'Poor Metabolizer',
    recommendation: 'Consider alternative non-thiopurine therapy',
    evidence_level: 'A',
    implications: 'Severe myelosuppression risk',
    dosage_adjustment: 'If used, start at 10% of standard dose',
    sources: ['CPIC']
  },
  // VKORC1 for warfarin
  {
    gene_symbol: 'VKORC1',
    gene: { name: 'Vitamin K Epoxide Reductase Complex Subunit 1' },
    drug_rxcui: '11289',
    drug: { name: 'Warfarin', generic_name: 'warfarin' },
    phenotype: 'Sensitive (lower dose)',
    recommendation: 'Start with lower initial dose; consider genotype-based algorithm',
    evidence_level: 'A',
    implications: 'Higher bleeding risk at standard dose',
    dosage_adjustment: 'Reduce starting dose by 10-30% and monitor INR',
    sources: ['CPIC', 'FDA']
  },
  // SLCO1B1 for statins (non-oncology, illustrative)
  {
    gene_symbol: 'SLCO1B1',
    gene: { name: 'Solute Carrier Organic Anion Transporter Family Member 1B1' },
    drug_rxcui: null,
    drug: { name: 'Simvastatin', generic_name: 'simvastatin' },
    phenotype: 'Decreased function (c.521T>C)',
    recommendation: 'Use lower dose or alternative statin (e.g., pravastatin)',
    evidence_level: 'A',
    implications: 'Increased myopathy risk',
    dosage_adjustment: 'Avoid high doses; consider alternative statin',
    sources: ['CPIC']
  }
];

export default CPIC_GUIDELINES_DB;
