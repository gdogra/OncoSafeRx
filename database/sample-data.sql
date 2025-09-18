-- Sample data for OncoSafeRx database
-- This script populates the database with initial data for development and testing

-- Insert sample genes
INSERT INTO genes (symbol, name, chromosome, function, aliases) VALUES
('CYP2D6', 'Cytochrome P450 2D6', '22q13.2', 'Drug metabolism enzyme', ARRAY['CYP2D', 'P450-DB1']),
('CYP2C19', 'Cytochrome P450 2C19', '10q23.33', 'Drug metabolism enzyme', ARRAY['CYP2C', 'CPCJ']),
('CYP2C9', 'Cytochrome P450 2C9', '10q23.33', 'Drug metabolism enzyme', ARRAY['CYP2C9*1', 'P450-PB']),
('UGT1A1', 'UDP Glucuronosyltransferase 1A1', '2q37.1', 'Drug conjugation enzyme', ARRAY['UGT1', 'BILIARY1']),
('TPMT', 'Thiopurine S-methyltransferase', '6p22.3', 'Thiopurine metabolism', ARRAY['TPMT*1']),
('DPYD', 'Dihydropyrimidine dehydrogenase', '1p21.3', 'Pyrimidine metabolism', ARRAY['DHP', 'DPD']),
('VKORC1', 'Vitamin K epoxide reductase complex subunit 1', '16p11.2', 'Vitamin K metabolism', ARRAY['VKOR']),
('SLCO1B1', 'Solute carrier organic anion transporter 1B1', '12p12.1', 'Drug transport', ARRAY['OATP1B1']),
('ABCB1', 'ATP Binding Cassette Subfamily B Member 1', '7q21.12', 'Drug efflux pump', ARRAY['MDR1', 'P-gp']),
('CYP3A4', 'Cytochrome P450 3A4', '7q22.1', 'Drug metabolism enzyme', ARRAY['CYP3A', 'HLP'])
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample drugs (common oncology and general medications)
INSERT INTO drugs (rxcui, name, generic_name, brand_names, drug_class, route, dosage_form, strength) VALUES
('243670', 'aspirin 81 MG Oral Tablet', 'aspirin', ARRAY['Bayer', 'Ecotrin', 'St. Joseph'], 'NSAID', 'oral', 'tablet', '81 mg'),
('855332', 'warfarin sodium 5 MG Oral Tablet', 'warfarin', ARRAY['Coumadin', 'Jantoven'], 'Anticoagulant', 'oral', 'tablet', '5 mg'),
('1191', 'aspirin', 'aspirin', ARRAY['ASA', 'Aspirin'], 'NSAID', 'oral', 'tablet', 'various'),
('5640', 'ibuprofen', 'ibuprofen', ARRAY['Advil', 'Motrin'], 'NSAID', 'oral', 'tablet', 'various'),
('161', 'acetaminophen', 'acetaminophen', ARRAY['Tylenol'], 'Analgesic', 'oral', 'tablet', 'various'),
('11289', 'warfarin', 'warfarin', ARRAY['Coumadin'], 'Anticoagulant', 'oral', 'tablet', 'various'),
('42347', 'methotrexate', 'methotrexate', ARRAY['Trexall', 'Rheumatrex'], 'Antimetabolite', 'oral/injection', 'tablet/injection', 'various'),
('40048', 'cyclophosphamide', 'cyclophosphamide', ARRAY['Cytoxan'], 'Alkylating agent', 'oral/injection', 'tablet/injection', 'various'),
('3639', 'doxorubicin', 'doxorubicin', ARRAY['Adriamycin'], 'Anthracycline', 'injection', 'injection', 'various'),
('56946', 'fluorouracil', 'fluorouracil', ARRAY['5-FU', 'Adrucil'], 'Antimetabolite', 'injection', 'injection', 'various'),
('1819', 'carboplatin', 'carboplatin', ARRAY['Paraplatin'], 'Platinum compound', 'injection', 'injection', 'various'),
('1734104', 'pembrolizumab', 'pembrolizumab', ARRAY['Keytruda'], 'PD-1 inhibitor', 'injection', 'injection', 'various'),
('1437205', 'nivolumab', 'nivolumab', ARRAY['Opdivo'], 'PD-1 inhibitor', 'injection', 'injection', 'various'),
('1598392', 'atezolizumab', 'atezolizumab', ARRAY['Tecentriq'], 'PD-L1 inhibitor', 'injection', 'injection', 'various'),
('2555237', 'osimertinib', 'osimertinib', ARRAY['Tagrisso'], 'EGFR inhibitor', 'oral', 'tablet', 'various')
ON CONFLICT (rxcui) DO NOTHING;

-- Insert sample drug interactions
INSERT INTO drug_interactions (drug1_rxcui, drug2_rxcui, severity, mechanism, effect, management, evidence_level, sources) VALUES
('243670', '855332', 'major', 'Additive anticoagulant/antiplatelet effects', 'Significantly increased bleeding risk', 'Avoid combination or monitor very closely; frequent INR checks', 'A', ARRAY['LOCAL', 'Clinical literature']),
('1191', '5640', 'moderate', 'Competitive inhibition at COX reduces aspirin antiplatelet effect', 'Reduced cardioprotective effect of low-dose aspirin', 'Separate dosing (ibuprofen 8h before or 30min after aspirin) or use other analgesic', 'B', ARRAY['LOCAL']),
('42347', '161', 'minor', 'Potential hepatotoxicity', 'Increased risk of liver toxicity with chronic use', 'Monitor liver function tests', 'C', ARRAY['LOCAL']),
('40048', '56946', 'moderate', 'Synergistic myelosuppression', 'Increased bone marrow suppression', 'Monitor CBC closely, consider dose reduction', 'B', ARRAY['Oncology protocols']),
('3639', '1819', 'major', 'Additive cardiotoxicity', 'Increased risk of heart failure', 'Monitor cardiac function closely; consider dose limits', 'A', ARRAY['FDA warnings', 'Clinical studies'])
ON CONFLICT (drug1_rxcui, drug2_rxcui) DO NOTHING;

-- Insert sample gene-drug interactions
INSERT INTO gene_drug_interactions (gene_symbol, drug_rxcui, phenotype, recommendation, evidence_level, sources, dose_adjustment) VALUES
('CYP2D6', '1191', 'PM', 'Normal dosing for antiplatelet effect', 'A', ARRAY['CPIC'], 'None'),
('CYP2C19', '1191', 'PM', 'Consider alternative antiplatelet therapy', 'A', ARRAY['CPIC'], 'None'),
('VKORC1', '11289', 'Low expression', 'Use lower warfarin doses', 'A', ARRAY['CPIC', 'FDA'], '25-50% reduction'),
('CYP2C9', '11289', 'PM', 'Use significantly lower warfarin doses', 'A', ARRAY['CPIC'], '50-75% reduction'),
('UGT1A1', '42347', '*28/*28', 'Consider dose reduction for high-dose therapy', 'B', ARRAY['CPIC'], '30% reduction'),
('TPMT', '42347', 'PM', 'Use alternative therapy or drastically reduce dose', 'A', ARRAY['CPIC'], '90% reduction'),
('DPYD', '56946', 'PM', 'Avoid fluorouracil or use significant dose reduction', 'A', ARRAY['CPIC', 'FDA'], '80-100% reduction')
ON CONFLICT (gene_symbol, drug_rxcui, phenotype) DO NOTHING;

-- Insert sample CPIC guidelines
INSERT INTO cpic_guidelines (gene_symbol, drug_rxcui, guideline_version, recommendation_level, phenotype_recommendations, publication_date, doi) VALUES
('CYP2C19', '1191', 'v2.0', 'Strong', 
'{"UM": "Consider alternative antiplatelet therapy", "RM": "Normal therapy", "NM": "Normal therapy", "IM": "Consider alternative therapy", "PM": "Consider alternative antiplatelet therapy"}',
'2013-04-01', '10.1002/cpt.61'),
('VKORC1', '11289', 'v1.0', 'Strong',
'{"Low": "Use lower warfarin doses", "Intermediate": "Normal dosing with close monitoring", "High": "May need higher doses"}',
'2017-01-01', '10.1002/cpt.668'),
('UGT1A1', '42347', 'v1.0', 'Moderate',
'{"*1/*1": "Normal dosing", "*1/*28": "Normal dosing with monitoring", "*28/*28": "Consider dose reduction for high-dose therapy"}',
'2014-01-01', '10.1002/cpt.52')
ON CONFLICT (gene_symbol, drug_rxcui, guideline_version) DO NOTHING;

-- Insert sample oncology protocols
INSERT INTO oncology_protocols (name, abbreviation, cancer_type, indication, line_of_therapy, cycle_length_days, total_cycles, drugs, premedications, monitoring_schedule) VALUES
('FOLFOX-6', 'FOLFOX-6', 'Colorectal Cancer', 'Metastatic colorectal cancer', 1, 14, 12,
'[
  {"drug": "oxaliplatin", "rxcui": "40790", "dose": "85", "unit": "mg/m2", "day": 1, "route": "IV"},
  {"drug": "leucovorin", "rxcui": "6067", "dose": "400", "unit": "mg/m2", "day": 1, "route": "IV"},
  {"drug": "fluorouracil", "rxcui": "56946", "dose": "400", "unit": "mg/m2", "day": 1, "route": "IV bolus"},
  {"drug": "fluorouracil", "rxcui": "56946", "dose": "2400", "unit": "mg/m2", "day": "1-2", "route": "IV continuous"}
]',
'[{"drug": "ondansetron", "dose": "8 mg", "timing": "30 min before chemo"}]',
'[{"test": "CBC", "frequency": "Before each cycle"}, {"test": "CMP", "frequency": "Before each cycle"}]'),

('AC-T', 'AC-T', 'Breast Cancer', 'Adjuvant breast cancer', 1, 21, 8,
'[
  {"drug": "doxorubicin", "rxcui": "3639", "dose": "60", "unit": "mg/m2", "day": 1, "route": "IV", "cycles": "1-4"},
  {"drug": "cyclophosphamide", "rxcui": "40048", "dose": "600", "unit": "mg/m2", "day": 1, "route": "IV", "cycles": "1-4"},
  {"drug": "paclitaxel", "rxcui": "56946", "dose": "175", "unit": "mg/m2", "day": 1, "route": "IV", "cycles": "5-8"}
]',
'[{"drug": "ondansetron", "dose": "8 mg"}, {"drug": "dexamethasone", "dose": "12 mg"}]',
'[{"test": "CBC", "frequency": "Before each cycle"}, {"test": "ECHO/MUGA", "frequency": "Baseline, after cycle 4"}]')
ON CONFLICT (name) DO NOTHING;

-- Insert sample clinical trials
INSERT INTO clinical_trials (nct_id, title, condition, intervention_type, intervention_drugs, phase, status, primary_endpoint) VALUES
('NCT12345678', 'Study of Pembrolizumab in Advanced Melanoma', 'Melanoma', 'Drug', ARRAY['pembrolizumab'], 'Phase III', 'Recruiting', 'Overall Survival'),
('NCT87654321', 'Combination Therapy for Non-Small Cell Lung Cancer', 'Non-Small Cell Lung Cancer', 'Drug', ARRAY['nivolumab', 'carboplatin'], 'Phase II', 'Active', 'Progression-Free Survival'),
('NCT11111111', 'Precision Medicine Trial for Colorectal Cancer', 'Colorectal Cancer', 'Drug', ARRAY['fluorouracil', 'oxaliplatin'], 'Phase I/II', 'Recruiting', 'Maximum Tolerated Dose')
ON CONFLICT (nct_id) DO NOTHING;

-- Insert sample patient cases for education
INSERT INTO patient_cases (case_name, description, demographics, medical_history, current_medications, expected_interactions, difficulty_level, specialty) VALUES
('Anticoagulation Challenge', 'Elderly patient on warfarin considering aspirin for cardiovascular protection',
'{"age": 75, "gender": "male", "race": "Caucasian", "weight": "80 kg"}',
ARRAY['Atrial fibrillation', 'Coronary artery disease', 'Hypertension'],
'[{"drug": "warfarin", "rxcui": "11289", "dose": "5 mg daily"}, {"drug": "metoprolol", "dose": "50 mg BID"}]',
'[{"drugs": ["warfarin", "aspirin"], "severity": "major", "reason": "Bleeding risk"}]',
'intermediate', 'Cardiology'),

('Chemotherapy Drug Interaction', 'Cancer patient receiving FOLFOX with drug interaction concerns',
'{"age": 62, "gender": "female", "race": "Asian", "weight": "65 kg"}',
ARRAY['Colorectal cancer', 'Hypertension', 'Depression'],
'[{"drug": "fluorouracil", "rxcui": "56946"}, {"drug": "oxaliplatin", "rxcui": "40790"}, {"drug": "sertraline", "dose": "50 mg daily"}]',
'[{"drugs": ["fluorouracil", "warfarin"], "severity": "moderate", "reason": "Enhanced anticoagulation"}]',
'advanced', 'Oncology')
ON CONFLICT (case_name) DO NOTHING;

-- Insert initial system configuration
INSERT INTO system_config (key, value, description) VALUES 
('drug_interaction_check_limit', '10', 'Maximum drugs per interaction check'),
('enable_experimental_features', 'false', 'Enable beta features'),
('default_interaction_sources', '["LOCAL", "RXNORM", "CPIC"]', 'Default sources for interaction checking'),
('pgx_genes_enabled', '["CYP2D6", "CYP2C19", "CYP2C9", "UGT1A1", "TPMT", "DPYD"]', 'Pharmacogenomic genes to analyze'),
('email_notifications_enabled', 'true', 'Enable email notifications for alerts')
ON CONFLICT (key) DO NOTHING;

-- Create some sample users (this would typically be handled by Supabase Auth)
-- INSERT INTO users (email, full_name, role, institution, specialty) VALUES
-- ('admin@oncosaferx.com', 'System Administrator', 'admin', 'OncoSafeRx', 'Administration'),
-- ('doc@example.com', 'Dr. Jane Smith', 'physician', 'General Hospital', 'Oncology'),
-- ('pharm@example.com', 'PharmD John Doe', 'pharmacist', 'General Hospital', 'Clinical Pharmacy');

-- Insert sample interaction check logs (for analytics)
INSERT INTO interaction_checks (drug_rxcuis, interactions_found, highest_severity, created_at) VALUES
(ARRAY['243670', '855332'], 1, 'major', NOW() - INTERVAL '1 day'),
(ARRAY['1191', '5640'], 1, 'moderate', NOW() - INTERVAL '2 days'),
(ARRAY['42347', '161', '40048'], 2, 'moderate', NOW() - INTERVAL '3 days'),
(ARRAY['3639', '1819'], 1, 'major', NOW() - INTERVAL '4 days'),
(ARRAY['161'], 0, null, NOW() - INTERVAL '5 days');

-- Insert sample sync logs
INSERT INTO sync_logs (sync_type, status, records_processed, records_inserted, started_at, completed_at) VALUES
('rxnorm', 'completed', 1500, 1450, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week' + INTERVAL '2 hours'),
('cpic', 'completed', 45, 40, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks' + INTERVAL '30 minutes'),
('fda', 'partial', 800, 750, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '1 hour');

-- Refresh materialized views
SELECT refresh_drug_stats();

COMMIT;