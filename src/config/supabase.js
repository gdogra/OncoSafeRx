// Supabase service - automatically uses real implementation if credentials are available
// Falls back to no-op implementation for development without Supabase setup

import dotenv from 'dotenv';
dotenv.config();

// Check if Supabase credentials are available
const hasSupabaseCredentials = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// No-op Supabase service for environments without Supabase
export class NoOpSupabaseService {
  constructor() {
    this.enabled = false;
  }

  // Drug operations (no-op)
  searchDrugs(_searchTerm, _limit = 50) {
    return Promise.resolve([]);
  }

  getDrugByRxcui(_rxcui) {
    return Promise.resolve(null);
  }

  upsertDrug(drugData) {
    // pretend success and echo back
    return Promise.resolve(drugData);
  }

  // Drug interaction operations (no-op)
  getDrugInteractions(_rxcui) {
    return Promise.resolve([]);
  }

  checkMultipleInteractions(_rxcuis) {
    return Promise.resolve([]);
  }

  insertDrugInteraction(interactionData) {
    return Promise.resolve(interactionData);
  }

  // Gene operations (no-op)
  upsertGene(geneData) {
    return Promise.resolve(geneData);
  }

  getGeneDrugInteractions(_geneSymbol, _drugRxcui) {
    return Promise.resolve([]);
  }

  getCpicGuidelines() {
    return Promise.resolve([]);
  }

  insertGeneDrugInteraction(interactionData) {
    return Promise.resolve(interactionData);
  }

  // Oncology protocols (no-op)
  getOncologyProtocols(_cancerType) {
    return Promise.resolve([]);
  }

  // Clinical trials (no-op)
  getClinicalTrials(_condition, _drugs) {
    return Promise.resolve([]);
  }

  // User management (no-op)
  createUser(userData) {
    return Promise.resolve(userData);
  }

  getUserByEmail(_email) {
    return Promise.resolve(null);
  }

  getAllUsers() {
    return Promise.resolve([]);
  }

  updateUser(_userId, updateData) {
    return Promise.resolve(updateData);
  }

  // Data sync logging (no-op)
  logSyncActivity(logData) {
    return Promise.resolve({ id: 'noop', ...logData });
  }

  updateSyncStatus(id, updateData) {
    return Promise.resolve({ id, ...updateData });
  }
}

// Function to create the appropriate service
async function createSupabaseService() {
  if (hasSupabaseCredentials) {
    try {
      const { SupabaseService } = await import('./supabase.real.js');
      console.log('✅ Using real Supabase service');
      return new SupabaseService();
    } catch (error) {
      console.log('⚠️  Failed to load real Supabase service, falling back to no-op:', error.message);
      return new NoOpSupabaseService();
    }
  } else {
    console.log('⚠️  Supabase credentials not found, using no-op service');
    return new NoOpSupabaseService();
  }
}

// Create and export the service instance
const supabaseService = await createSupabaseService();
export default supabaseService;