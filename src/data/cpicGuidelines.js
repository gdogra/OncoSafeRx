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
];

export default CPIC_GUIDELINES_DB;

