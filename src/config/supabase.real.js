import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase client if credentials are available
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
} else {
  console.log('⚠️  Supabase credentials not found, using no-op service');
}

export class SupabaseService {
  constructor() {
    this.client = supabase;
    this.enabled = !!supabase;
  }

  // Drug operations
  async searchDrugs(searchTerm, limit = 50) {
    if (!this.enabled) return [];
    
    try {
      const { data, error } = await this.client
        .from('drugs')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%,brand_names.ilike.%${searchTerm}%`)
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching drugs:', error);
      return [];
    }
  }

  async getDrugByRxcui(rxcui) {
    if (!this.enabled) return null;
    
    try {
      const { data, error } = await this.client
        .from('drugs')
        .select('*')
        .eq('rxcui', rxcui)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data;
    } catch (error) {
      console.error('Error getting drug by RXCUI:', error);
      return null;
    }
  }

  async upsertDrug(drugData) {
    if (!this.enabled) return drugData;
    
    try {
      const { data, error } = await this.client
        .from('drugs')
        .upsert({
          rxcui: drugData.rxcui,
          name: drugData.name,
          generic_name: drugData.genericName || drugData.generic_name,
          brand_names: drugData.brandNames || drugData.brand_names,
          active_ingredients: drugData.activeIngredients || drugData.active_ingredients,
          drug_class: drugData.drugClass || drugData.drug_class,
          route: drugData.route,
          dosage_form: drugData.dosageForm || drugData.dosage_form,
          strength: drugData.strength,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting drug:', error);
      return drugData;
    }
  }

  // Drug interaction operations
  async getDrugInteractions(rxcui) {
    if (!this.enabled) return [];
    
    try {
      const { data, error } = await this.client
        .from('drug_interactions')
        .select(`
          *,
          drug1:drug1_rxcui(name, generic_name),
          drug2:drug2_rxcui(name, generic_name)
        `)
        .or(`drug1_rxcui.eq.${rxcui},drug2_rxcui.eq.${rxcui}`);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting drug interactions:', error);
      return [];
    }
  }

  async checkMultipleInteractions(rxcuis) {
    if (!this.enabled) return [];
    
    try {
      const { data, error } = await this.client
        .from('drug_interactions')
        .select(`
          *,
          drug1:drugs!drug_interactions_drug1_rxcui_fkey(rxcui, name, generic_name),
          drug2:drugs!drug_interactions_drug2_rxcui_fkey(rxcui, name, generic_name)
        `)
        .in('drug1_rxcui', rxcuis)
        .in('drug2_rxcui', rxcuis);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking multiple interactions:', error);
      return [];
    }
  }

  async insertDrugInteraction(interactionData) {
    if (!this.enabled) return interactionData;
    
    try {
      const { data, error } = await this.client
        .from('drug_interactions')
        .insert({
          drug1_rxcui: interactionData.drug1_rxcui,
          drug2_rxcui: interactionData.drug2_rxcui,
          severity: interactionData.severity,
          mechanism: interactionData.mechanism,
          effect: interactionData.effect,
          management: interactionData.management,
          evidence_level: interactionData.evidence_level,
          sources: interactionData.sources,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting drug interaction:', error);
      return interactionData;
    }
  }

  // Gene operations
  async upsertGene(geneData) {
    if (!this.enabled) return geneData;
    
    try {
      const { data, error } = await this.client
        .from('genes')
        .upsert({
          symbol: geneData.symbol,
          name: geneData.name,
          chromosome: geneData.chromosome,
          function: geneData.function,
          aliases: geneData.aliases,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting gene:', error);
      return geneData;
    }
  }

  async getGeneDrugInteractions(geneSymbol, drugRxcui = null) {
    if (!this.enabled) return [];
    
    try {
      let query = this.client
        .from('gene_drug_interactions')
        .select(`
          *,
          gene:genes(symbol, name),
          drug:drugs(rxcui, name, generic_name)
        `)
        .eq('gene_symbol', geneSymbol);
      
      if (drugRxcui) {
        query = query.eq('drug_rxcui', drugRxcui);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting gene-drug interactions:', error);
      return [];
    }
  }

  async getCpicGuidelines() {
    if (!this.enabled) return [];
    
    try {
      const { data, error } = await this.client
        .from('cpic_guidelines')
        .select(`
          *,
          gene:genes(symbol, name),
          drug:drugs(rxcui, name, generic_name)
        `);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting CPIC guidelines:', error);
      return [];
    }
  }

  async insertGeneDrugInteraction(interactionData) {
    if (!this.enabled) return interactionData;
    
    try {
      const { data, error } = await this.client
        .from('gene_drug_interactions')
        .insert({
          gene_symbol: interactionData.gene_symbol,
          drug_rxcui: interactionData.drug_rxcui,
          phenotype: interactionData.phenotype,
          recommendation: interactionData.recommendation,
          evidence_level: interactionData.evidence_level,
          sources: interactionData.sources,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting gene-drug interaction:', error);
      return interactionData;
    }
  }

  // Oncology protocols
  async getOncologyProtocols(cancerType = null) {
    if (!this.enabled) return [];
    
    try {
      let query = this.client
        .from('oncology_protocols')
        .select('*');
      
      if (cancerType) {
        query = query.eq('cancer_type', cancerType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting oncology protocols:', error);
      return [];
    }
  }

  // Clinical trials
  async getClinicalTrials(condition, drugs = null) {
    if (!this.enabled) return [];
    
    try {
      let query = this.client
        .from('clinical_trials')
        .select('*')
        .ilike('condition', `%${condition}%`);
      
      if (drugs && drugs.length > 0) {
        query = query.overlaps('intervention_drugs', drugs);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting clinical trials:', error);
      return [];
    }
  }

  // User management
  async createUser(userData) {
    if (!this.enabled) return userData;
    
    try {
      const { data, error } = await this.client
        .from('users')
        .insert({
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'user',
          institution: userData.institution,
          specialty: userData.specialty,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return userData;
    }
  }

  async getUserByEmail(email) {
    if (!this.enabled) return null;
    
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getAllUsers() {
    if (!this.enabled) return [];
    
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUser(userId, updateData) {
    if (!this.enabled) return updateData;
    
    try {
      const { data, error } = await this.client
        .from('users')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return updateData;
    }
  }

  // Data sync logging
  async logSyncActivity(logData) {
    if (!this.enabled) return { id: 'noop', ...logData };
    
    try {
      const { data, error } = await this.client
        .from('sync_logs')
        .insert({
          sync_type: logData.sync_type,
          status: logData.status,
          records_processed: logData.records_processed,
          errors: logData.errors,
          started_at: logData.started_at || new Date().toISOString(),
          completed_at: logData.completed_at
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging sync activity:', error);
      return { id: 'error', ...logData };
    }
  }

  async updateSyncStatus(id, updateData) {
    if (!this.enabled) return { id, ...updateData };
    
    try {
      const { data, error } = await this.client
        .from('sync_logs')
        .update({
          status: updateData.status,
          records_processed: updateData.records_processed,
          errors: updateData.errors,
          completed_at: updateData.completed_at || new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating sync status:', error);
      return { id, ...updateData };
    }
  }

  // Patients API
  async listPatientsByUser(userId) {
    if (!this.enabled) return [];
    try {
      const { data, error } = await this.client
        .from('patients')
        .select('id,user_id,data,created_at,updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing patients:', error);
      return [];
    }
  }

  async upsertPatient(userId, patient) {
    if (!this.enabled) return patient;
    try {
      const payload = {
        id: patient.id,
        user_id: userId,
        data: patient,
        updated_at: new Date().toISOString(),
      };
      if (!payload.id) delete payload.id;
      const { data, error } = await this.client
        .from('patients')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting patient:', error);
      return patient;
    }
  }

  async deletePatient(userId, patientId) {
    if (!this.enabled) return true;
    try {
      const { error } = await this.client
        .from('patients')
        .delete()
        .eq('id', patientId)
        .eq('user_id', userId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting patient:', error);
      return false;
    }
  }
}

// Create and export the service instance
const supabaseService = new SupabaseService();
export default supabaseService;
