// Lightweight no-op Supabase service for environments without Supabase/Hasura
// This avoids importing '@supabase/supabase-js' (and its Headers dependency)
// while preserving the same interface used across the app.

export class SupabaseService {
  constructor() {
    this.enabled = false;
  }

  // Drug operations (no-op)
  async searchDrugs(_searchTerm, _limit = 50) {
    return [];
  }

  async getDrugByRxcui(_rxcui) {
    return null;
  }

  async upsertDrug(drugData) {
    // pretend success and echo back
    return drugData;
  }

  // Drug interaction operations (no-op)
  async getDrugInteractions(_rxcui) {
    return [];
  }

  async checkMultipleInteractions(_rxcuis) {
    return [];
  }

  async insertDrugInteraction(interactionData) {
    return interactionData;
  }

  // Gene operations (no-op)
  async upsertGene(geneData) {
    return geneData;
  }

  async getGeneDrugInteractions(_geneSymbol, _drugRxcui) {
    return [];
  }

  async getCpicGuidelines() {
    return [];
  }

  async insertGeneDrugInteraction(interactionData) {
    return interactionData;
  }

  // Oncology protocols (no-op)
  async getOncologyProtocols(_cancerType) {
    return [];
  }

  // Clinical trials (no-op)
  async getClinicalTrials(_condition, _drugs) {
    return [];
  }

  // Data sync logging (no-op)
  async logSyncActivity(logData) {
    return { id: 'noop', ...logData };
  }

  async updateSyncStatus(id, updateData) {
    return { id, ...updateData };
  }
}

export default new SupabaseService();
