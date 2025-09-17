-- Sample data for OncoSafeRx database
-- Insert some common oncology drugs and genes for testing

-- Insert common pharmacogenomic genes
INSERT INTO genes (symbol, name, chromosome, function, clinical_significance) VALUES
('CYP2D6', 'Cytochrome P450 Family 2 Subfamily D Member 6', '22', 'Drug metabolism enzyme', 'Critical for metabolism of many psychiatric and pain medications'),
('CYP2C19', 'Cytochrome P450 Family 2 Subfamily C Member 19', '10', 'Drug metabolism enzyme', 'Important for metabolism of antiplatelet agents and proton pump inhibitors'),
('CYP2C9', 'Cytochrome P450 Family 2 Subfamily C Member 9', '10', 'Drug metabolism enzyme', 'Key enzyme for warfarin and NSAID metabolism'),
('TPMT', 'Thiopurine S-Methyltransferase', '6', 'Thiopurine metabolism enzyme', 'Critical for thiopurine drug safety'),
('DPYD', 'Dihydropyrimidine Dehydrogenase', '1', '5-fluorouracil metabolism enzyme', 'Essential for 5-FU toxicity prevention'),
('UGT1A1', 'UDP Glucuronosyltransferase Family 1 Member A1', '2', 'Drug conjugation enzyme', 'Important for irinotecan metabolism'),
('BRCA1', 'Breast Cancer 1', '17', 'DNA repair gene', 'Critical for PARP inhibitor response'),
('BRCA2', 'Breast Cancer 2', '13', 'DNA repair gene', 'Critical for PARP inhibitor response');

-- Insert common oncology drugs
INSERT INTO drugs (rxcui, name, generic_name, brand_names, active_ingredients, therapeutic_class, indication) VALUES
('40048', 'Fluorouracil', 'fluorouracil', ARRAY['Adrucil', '5-FU'], ARRAY['fluorouracil'], 'Antineoplastic', 'Colorectal cancer, breast cancer'),
('39998', 'Irinotecan', 'irinotecan', ARRAY['Camptosar'], ARRAY['irinotecan hydrochloride'], 'Antineoplastic', 'Colorectal cancer'),
('40790', 'Oxaliplatin', 'oxaliplatin', ARRAY['Eloxatin'], ARRAY['oxaliplatin'], 'Antineoplastic', 'Colorectal cancer'),
('321208', 'Bevacizumab', 'bevacizumab', ARRAY['Avastin'], ARRAY['bevacizumab'], 'Antineoplastic', 'Various solid tumors'),
('284635', 'Trastuzumab', 'trastuzumab', ARRAY['Herceptin'], ARRAY['trastuzumab'], 'Antineoplastic', 'HER2-positive breast cancer'),
('1594659', 'Olaparib', 'olaparib', ARRAY['Lynparza'], ARRAY['olaparib'], 'PARP inhibitor', 'BRCA-mutated ovarian and breast cancer'),
('1666376', 'Pembrolizumab', 'pembrolizumab', ARRAY['Keytruda'], ARRAY['pembrolizumab'], 'Immunotherapy', 'Various solid tumors'),
('1551291', 'Nivolumab', 'nivolumab', ARRAY['Opdivo'], ARRAY['nivolumab'], 'Immunotherapy', 'Various solid tumors'),
('1596439', 'Atezolizumab', 'atezolizumab', ARRAY['Tecentriq'], ARRAY['atezolizumab'], 'Immunotherapy', 'Various solid tumors'),
('42463', 'Clopidogrel', 'clopidogrel', ARRAY['Plavix'], ARRAY['clopidogrel bisulfate'], 'Antiplatelet', 'Cardiovascular protection'),
('11289', 'Warfarin', 'warfarin', ARRAY['Coumadin'], ARRAY['warfarin sodium'], 'Anticoagulant', 'Thromboembolism prevention'),
('6387', 'Azathioprine', 'azathioprine', ARRAY['Imuran'], ARRAY['azathioprine'], 'Immunosuppressant', 'Autoimmune conditions'),
('18631', '6-Mercaptopurine', '6-mercaptopurine', ARRAY['Purinethol'], ARRAY['mercaptopurine'], 'Antineoplastic', 'Acute lymphoblastic leukemia');

-- Insert gene-drug interactions (CPIC Level A recommendations)
INSERT INTO gene_drug_interactions (gene_symbol, drug_rxcui, phenotype, recommendation, evidence_level, implications, dosage_adjustment, sources) VALUES
('DPYD', '40048', 'DPYD deficiency', 'Avoid use or reduce dose by 50% or more', 'A', 'Severe toxicity risk with normal 5-FU dosing', 'Start with 50% dose reduction', ARRAY['CPIC']),
('UGT1A1', '39998', 'UGT1A1*28/*28', 'Reduce starting dose by 1 level', 'A', 'Increased risk of neutropenia', 'Reduce starting dose by 25-50%', ARRAY['CPIC']),
('CYP2C19', '42463', 'Poor Metabolizer', 'Alternative antiplatelet therapy', 'A', 'Reduced efficacy of clopidogrel', 'Use prasugrel or ticagrelor instead', ARRAY['CPIC']),
('CYP2C9', '11289', 'Poor Metabolizer', 'Reduce dose by 25-50%', 'A', 'Increased bleeding risk', 'Start with lower dose and monitor INR closely', ARRAY['CPIC']),
('TPMT', '6387', 'Poor Metabolizer', 'Reduce dose by 90% or avoid', 'A', 'Severe bone marrow toxicity risk', 'Start with 10% of standard dose', ARRAY['CPIC']),
('TPMT', '18631', 'Poor Metabolizer', 'Reduce dose by 90% or avoid', 'A', 'Severe bone marrow toxicity risk', 'Start with 10% of standard dose', ARRAY['CPIC']),
('BRCA1', '1594659', 'Pathogenic variant', 'Standard dosing recommended', 'A', 'Enhanced efficacy expected', 'Standard dosing', ARRAY['FDA label']),
('BRCA2', '1594659', 'Pathogenic variant', 'Standard dosing recommended', 'A', 'Enhanced efficacy expected', 'Standard dosing', ARRAY['FDA label']);

-- Insert common drug-drug interactions
INSERT INTO drug_interactions (drug1_rxcui, drug2_rxcui, severity, mechanism, effect, management, evidence_level, sources) VALUES
('40048', '11289', 'moderate', 'Unknown mechanism', 'Increased anticoagulant effect', 'Monitor INR more frequently', 'C', ARRAY['Clinical studies']),
('42463', '11289', 'major', 'Additive anticoagulant effects', 'Significantly increased bleeding risk', 'Avoid combination or monitor very closely', 'A', ARRAY['FDA warnings']),
('39998', '40048', 'moderate', 'Overlapping toxicities', 'Increased GI toxicity', 'Monitor for diarrhea and mucositis', 'B', ARRAY['Clinical experience']),
('6387', '11289', 'moderate', 'Hepatic metabolism competition', 'Potential increased warfarin effect', 'Monitor INR when starting/stopping azathioprine', 'C', ARRAY['Case reports']);

-- Insert sample oncology protocols
INSERT INTO oncology_protocols (protocol_name, cancer_type, stage, guideline_source, drugs, sequence_order, duration_weeks, efficacy_data, contraindications) VALUES
('FOLFOX', 'Colorectal', 'Advanced', 'NCCN', ARRAY['40048', '40790'], 1, 12, 
 '{"response_rate": "45%", "median_PFS": "9.0 months"}', 
 ARRAY['Severe neuropathy', 'Severe hepatic impairment']),
('FOLFIRI', 'Colorectal', 'Advanced', 'NCCN', ARRAY['40048', '39998'], 1, 12,
 '{"response_rate": "35%", "median_PFS": "8.7 months"}',
 ARRAY['Severe diarrhea history', 'UGT1A1*28/*28 without dose reduction']),
('Carboplatin + Paclitaxel', 'Ovarian', 'Advanced', 'NCCN', ARRAY['40048'], 1, 18,
 '{"response_rate": "70%", "median_PFS": "14.2 months"}',
 ARRAY['Severe neuropathy', 'Severe bone marrow suppression']);

-- Insert sample clinical trials
INSERT INTO clinical_trials (nct_id, title, status, phase, condition, intervention, drugs, eligibility_criteria) VALUES
('NCT04567811', 'Study of Pembrolizumab Plus Chemotherapy in Advanced Gastric Cancer', 'Recruiting', 'Phase 3', 'Gastric Cancer', 'Pembrolizumab + FOLFOX', ARRAY['1666376', '40048', '40790'], 
 'Advanced gastric adenocarcinoma, ECOG 0-1, Adequate organ function'),
('NCT04789668', 'Olaparib Maintenance in BRCA-mutated Pancreatic Cancer', 'Active', 'Phase 2', 'Pancreatic Cancer', 'Olaparib maintenance', ARRAY['1594659'],
 'BRCA1/2 germline mutation, Stable disease after platinum-based chemotherapy'),
('NCT05123456', 'Personalized Dosing Based on Pharmacogenomics', 'Recruiting', 'Phase 2', 'Various Solid Tumors', 'Genotype-guided dosing', ARRAY['40048', '39998'],
 'Solid tumor diagnosis, Willingness to undergo genetic testing');

-- Create sample data sync log entries
INSERT INTO data_sync_log (source, sync_type, status, records_processed, records_added, records_updated, started_at, completed_at) VALUES
('rxnorm', 'full', 'completed', 15000, 15000, 0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes'),
('cpic', 'incremental', 'completed', 150, 8, 12, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),
('clinicaltrials', 'incremental', 'running', 500, 25, 10, NOW() - INTERVAL '10 minutes', NULL);