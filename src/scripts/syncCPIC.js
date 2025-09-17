#!/usr/bin/env node

import { executeMutation, MUTATIONS } from '../config/hasura.js';

// CPIC Level A pharmacogenomic recommendations
// This data would typically come from CPIC API, but using curated data for MVP
const CPIC_GUIDELINES = [
  {
    gene: {
      symbol: 'DPYD',
      name: 'Dihydropyrimidine Dehydrogenase',
      chromosome: '1',
      function: '5-fluorouracil metabolism enzyme',
      clinical_significance: 'Essential for 5-FU toxicity prevention'
    },
    drugInteractions: [
      {
        drug_name: 'fluorouracil',
        search_terms: ['fluorouracil', '5-FU', 'Adrucil'],
        phenotype: 'DPYD deficiency',
        recommendation: 'Avoid use or reduce dose by 50% or more',
        evidence_level: 'A',
        implications: 'Severe toxicity risk with normal 5-FU dosing',
        dosage_adjustment: 'Start with 50% dose reduction',
        sources: ['CPIC', 'FDA']
      }
    ]
  },
  {
    gene: {
      symbol: 'UGT1A1',
      name: 'UDP Glucuronosyltransferase Family 1 Member A1',
      chromosome: '2',
      function: 'Drug conjugation enzyme',
      clinical_significance: 'Important for irinotecan metabolism'
    },
    drugInteractions: [
      {
        drug_name: 'irinotecan',
        search_terms: ['irinotecan', 'Camptosar'],
        phenotype: 'UGT1A1*28/*28',
        recommendation: 'Reduce starting dose by 1 level',
        evidence_level: 'A',
        implications: 'Increased risk of neutropenia',
        dosage_adjustment: 'Reduce starting dose by 25-50%',
        sources: ['CPIC', 'FDA']
      }
    ]
  },
  {
    gene: {
      symbol: 'CYP2C19',
      name: 'Cytochrome P450 Family 2 Subfamily C Member 19',
      chromosome: '10',
      function: 'Drug metabolism enzyme',
      clinical_significance: 'Important for metabolism of antiplatelet agents and proton pump inhibitors'
    },
    drugInteractions: [
      {
        drug_name: 'clopidogrel',
        search_terms: ['clopidogrel', 'Plavix'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Alternative antiplatelet therapy',
        evidence_level: 'A',
        implications: 'Reduced efficacy of clopidogrel',
        dosage_adjustment: 'Use prasugrel or ticagrelor instead',
        sources: ['CPIC', 'FDA']
      }
    ]
  },
  {
    gene: {
      symbol: 'CYP2C9',
      name: 'Cytochrome P450 Family 2 Subfamily C Member 9',
      chromosome: '10',
      function: 'Drug metabolism enzyme',
      clinical_significance: 'Key enzyme for warfarin and NSAID metabolism'
    },
    drugInteractions: [
      {
        drug_name: 'warfarin',
        search_terms: ['warfarin', 'Coumadin'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Reduce dose by 25-50%',
        evidence_level: 'A',
        implications: 'Increased bleeding risk',
        dosage_adjustment: 'Start with lower dose and monitor INR closely',
        sources: ['CPIC', 'FDA']
      }
    ]
  },
  {
    gene: {
      symbol: 'TPMT',
      name: 'Thiopurine S-Methyltransferase',
      chromosome: '6',
      function: 'Thiopurine metabolism enzyme',
      clinical_significance: 'Critical for thiopurine drug safety'
    },
    drugInteractions: [
      {
        drug_name: 'azathioprine',
        search_terms: ['azathioprine', 'Imuran'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Reduce dose by 90% or avoid',
        evidence_level: 'A',
        implications: 'Severe bone marrow toxicity risk',
        dosage_adjustment: 'Start with 10% of standard dose',
        sources: ['CPIC', 'FDA']
      },
      {
        drug_name: '6-mercaptopurine',
        search_terms: ['6-mercaptopurine', 'mercaptopurine', 'Purinethol'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Reduce dose by 90% or avoid',
        evidence_level: 'A',
        implications: 'Severe bone marrow toxicity risk',
        dosage_adjustment: 'Start with 10% of standard dose',
        sources: ['CPIC', 'FDA']
      }
    ]
  },
  {
    gene: {
      symbol: 'CYP2D6',
      name: 'Cytochrome P450 Family 2 Subfamily D Member 6',
      chromosome: '22',
      function: 'Drug metabolism enzyme',
      clinical_significance: 'Critical for metabolism of many psychiatric and pain medications'
    },
    drugInteractions: [
      {
        drug_name: 'codeine',
        search_terms: ['codeine'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Avoid codeine, use alternative analgesic',
        evidence_level: 'A',
        implications: 'Lack of analgesic efficacy',
        dosage_adjustment: 'Use morphine or other non-codeine opioid',
        sources: ['CPIC', 'FDA']
      },
      {
        drug_name: 'tramadol',
        search_terms: ['tramadol', 'Ultram'],
        phenotype: 'Poor Metabolizer',
        recommendation: 'Avoid tramadol, use alternative analgesic',
        evidence_level: 'A',
        implications: 'Lack of analgesic efficacy',
        dosage_adjustment: 'Use morphine or other non-tramadol opioid',
        sources: ['CPIC', 'FDA']
      }
    ]
  }
];

class CPICSyncService {
  constructor() {
    this.syncLogId = null;
    this.stats = {
      processed: 0,
      genesAdded: 0,
      interactionsAdded: 0,
      errors: []
    };
  }

  async startSync() {
    console.log('🧬 Starting CPIC guidelines sync...');
    
    try {
      // Log sync start
      const syncLog = await executeMutation(MUTATIONS.LOG_SYNC_ACTIVITY, {
        log: {
          source: 'cpic',
          sync_type: 'level_a_guidelines',
          status: 'running'
        }
      });
      
      this.syncLogId = syncLog.insert_data_sync_log_one.id;
      console.log(`📝 Sync logged with ID: ${this.syncLogId}`);

      // Process each gene and its drug interactions
      for (const guideline of CPIC_GUIDELINES) {
        await this.processGeneGuideline(guideline);
      }

      // Update sync status to completed
      await this.completeSyncLog('completed');
      
      console.log('✅ CPIC sync completed successfully!');
      console.log(`📊 Stats: ${this.stats.genesAdded} genes, ${this.stats.interactionsAdded} interactions`);
      
    } catch (error) {
      console.error('❌ CPIC sync failed:', error.message);
      this.stats.errors.push(error.message);
      await this.completeSyncLog('failed');
      process.exit(1);
    }
  }

  async processGeneGuideline(guideline) {
    const { gene, drugInteractions } = guideline;
    
    try {
      console.log(`🧬 Processing gene: ${gene.symbol}`);

      // Insert/update gene
      const geneResult = await executeMutation(`
        mutation UpsertGene($gene: genes_insert_input!) {
          insert_genes_one(
            object: $gene
            on_conflict: {
              constraint: genes_symbol_key
              update_columns: [name, chromosome, function, clinical_significance, updated_at]
            }
          ) {
            id
            symbol
          }
        }
      `, {
        gene: {
          symbol: gene.symbol,
          name: gene.name,
          chromosome: gene.chromosome,
          function: gene.function,
          clinical_significance: gene.clinical_significance
        }
      });

      this.stats.genesAdded++;
      console.log(`  ✅ Gene ${gene.symbol} processed`);

      // Process drug interactions for this gene
      for (const interaction of drugInteractions) {
        await this.processDrugInteraction(gene.symbol, interaction);
      }

    } catch (error) {
      console.error(`❌ Error processing gene ${gene.symbol}:`, error.message);
      this.stats.errors.push(`Error processing gene ${gene.symbol}: ${error.message}`);
    }
  }

  async processDrugInteraction(geneSymbol, interaction) {
    try {
      console.log(`  💊 Processing drug interaction: ${geneSymbol} - ${interaction.drug_name}`);

      // For MVP, we'll use placeholder RXCUIs
      // In production, this would search the drugs table or RxNorm API
      const drugRxcuiMap = {
        'fluorouracil': '40048',
        'irinotecan': '39998',
        'clopidogrel': '42463',
        'warfarin': '11289',
        'azathioprine': '6387',
        '6-mercaptopurine': '18631',
        'codeine': '2670',
        'tramadol': '10689'
      };

      const drugRxcui = drugRxcuiMap[interaction.drug_name];
      
      if (!drugRxcui) {
        console.log(`    ⚠️  No RXCUI mapping for ${interaction.drug_name}`);
        this.stats.errors.push(`No RXCUI mapping for ${interaction.drug_name}`);
        return;
      }

      // Insert gene-drug interaction
      const interactionData = {
        gene_symbol: geneSymbol,
        drug_rxcui: drugRxcui,
        phenotype: interaction.phenotype,
        recommendation: interaction.recommendation,
        evidence_level: interaction.evidence_level,
        implications: interaction.implications,
        dosage_adjustment: interaction.dosage_adjustment,
        sources: interaction.sources
      };

      const result = await executeMutation(MUTATIONS.INSERT_GENE_DRUG_INTERACTION, {
        interaction: interactionData
      });

      this.stats.interactionsAdded++;
      console.log(`    ✅ Added interaction: ${geneSymbol} - ${interaction.drug_name}`);

    } catch (error) {
      console.error(`    ❌ Error processing interaction ${geneSymbol} - ${interaction.drug_name}:`, error.message);
      this.stats.errors.push(`Error processing interaction ${geneSymbol} - ${interaction.drug_name}: ${error.message}`);
    }
  }

  async completeSyncLog(status) {
    if (this.syncLogId) {
      await executeMutation(MUTATIONS.UPDATE_SYNC_STATUS, {
        id: this.syncLogId,
        status,
        records_processed: this.stats.genesAdded + this.stats.interactionsAdded,
        records_added: this.stats.interactionsAdded,
        records_updated: 0,
        errors: this.stats.errors,
        completed_at: new Date().toISOString()
      });
    }
  }
}

// Run the sync if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const syncService = new CPICSyncService();
  syncService.startSync().catch(console.error);
}

export default CPICSyncService;