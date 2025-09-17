#!/usr/bin/env node

import { RxNormService } from '../services/rxnormService.js';
import { executeMutation, MUTATIONS } from '../config/hasura.js';
import { Drug } from '../models/Drug.js';

const rxnormService = new RxNormService();

// Common oncology drugs to sync initially
const ONCOLOGY_DRUGS = [
  'fluorouracil', 'irinotecan', 'oxaliplatin', 'bevacizumab', 'trastuzumab',
  'pembrolizumab', 'nivolumab', 'olaparib', 'carboplatin', 'paclitaxel',
  'doxorubicin', 'cyclophosphamide', 'cisplatin', 'gemcitabine', 'docetaxel',
  'rituximab', 'cetuximab', 'erlotinib', 'imatinib', 'sorafenib'
];

// Cardiovascular and supportive care drugs commonly used in oncology
const SUPPORTIVE_DRUGS = [
  'warfarin', 'clopidogrel', 'aspirin', 'atorvastatin', 'metoprolol',
  'lisinopril', 'ondansetron', 'prochlorperazine', 'lorazepam', 'furosemide'
];

class RxNormSyncService {
  constructor() {
    this.syncLogId = null;
    this.stats = {
      processed: 0,
      added: 0,
      updated: 0,
      errors: []
    };
  }

  async startSync() {
    console.log('🚀 Starting RxNorm sync...');
    
    try {
      // Log sync start
      const syncLog = await executeMutation(MUTATIONS.LOG_SYNC_ACTIVITY, {
        log: {
          source: 'rxnorm',
          sync_type: 'oncology_focused',
          status: 'running'
        }
      });
      
      this.syncLogId = syncLog.insert_data_sync_log_one.id;
      console.log(`📝 Sync logged with ID: ${this.syncLogId}`);

      // Sync oncology drugs
      console.log('🔬 Syncing oncology drugs...');
      await this.syncDrugList(ONCOLOGY_DRUGS, 'oncology');

      // Sync supportive care drugs
      console.log('💊 Syncing supportive care drugs...');
      await this.syncDrugList(SUPPORTIVE_DRUGS, 'supportive');

      // Update sync status to completed
      await this.completeSyncLog('completed');
      
      console.log('✅ RxNorm sync completed successfully!');
      console.log(`📊 Stats: ${this.stats.processed} processed, ${this.stats.added} added, ${this.stats.updated} updated`);
      
    } catch (error) {
      console.error('❌ RxNorm sync failed:', error.message);
      this.stats.errors.push(error.message);
      await this.completeSyncLog('failed');
      process.exit(1);
    }
  }

  async syncDrugList(drugNames, category) {
    for (const drugName of drugNames) {
      try {
        console.log(`  📋 Processing ${drugName}...`);
        
        // Search for the drug
        const searchResults = await rxnormService.searchDrugs(drugName);
        
        if (searchResults.length === 0) {
          console.log(`    ⚠️  No results found for ${drugName}`);
          this.stats.errors.push(`No results found for ${drugName}`);
          continue;
        }

        // Take the first result (usually the most relevant)
        const drugResult = searchResults[0];
        
        // Get detailed information
        const drugDetails = await rxnormService.getDrugDetails(drugResult.rxcui);
        
        if (!drugDetails) {
          console.log(`    ⚠️  Could not get details for ${drugName} (RXCUI: ${drugResult.rxcui})`);
          this.stats.errors.push(`Could not get details for ${drugName}`);
          continue;
        }

        // Prepare drug data for Hasura
        const drugData = {
          rxcui: drugDetails.rxcui,
          name: drugDetails.name,
          generic_name: drugDetails.genericName,
          brand_names: drugDetails.brandNames || [],
          active_ingredients: drugDetails.activeIngredients || [],
          dosage_forms: drugDetails.dosageForms || [],
          strengths: drugDetails.strengths || [],
          fda_application_number: drugDetails.fdaApplicationNumber,
          ndc: drugDetails.ndc,
          therapeutic_class: drugDetails.therapeuticClass || category,
          indication: drugDetails.indication,
          contraindications: drugDetails.contraindications || [],
          warnings: drugDetails.warnings || [],
          adverse_reactions: drugDetails.adverseReactions || [],
          dosing: drugDetails.dosing || {},
          metabolism: drugDetails.metabolism || {}
        };

        // Insert/update in Hasura
        const result = await executeMutation(MUTATIONS.UPSERT_DRUG, {
          drug: drugData
        });

        if (result.insert_drugs_one) {
          this.stats.added++;
          console.log(`    ✅ Added ${drugDetails.name} (RXCUI: ${drugDetails.rxcui})`);
        } else {
          this.stats.updated++;
          console.log(`    🔄 Updated ${drugDetails.name} (RXCUI: ${drugDetails.rxcui})`);
        }

        this.stats.processed++;

        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`    ❌ Error processing ${drugName}:`, error.message);
        this.stats.errors.push(`Error processing ${drugName}: ${error.message}`);
      }
    }
  }

  async completeSyncLog(status) {
    if (this.syncLogId) {
      await executeMutation(MUTATIONS.UPDATE_SYNC_STATUS, {
        id: this.syncLogId,
        status,
        records_processed: this.stats.processed,
        records_added: this.stats.added,
        records_updated: this.stats.updated,
        errors: this.stats.errors,
        completed_at: new Date().toISOString()
      });
    }
  }
}

// Run the sync if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const syncService = new RxNormSyncService();
  syncService.startSync().catch(console.error);
}

export default RxNormSyncService;