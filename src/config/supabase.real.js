import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getEnv } from '../utils/env.js';
import { randomUUID } from 'crypto';

dotenv.config();

// Supabase configuration with quote stripping
const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_ANON_KEY');

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

  // Helper method to validate UUID format
  isValidUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  // =============================
  // Feedback persistence (MVP)
  // =============================
  async insertFeedback(feedback) {
    if (!this.enabled) return null;
    try {
      const payload = {
        id: feedback.id,
        type: feedback.type,
        category: feedback.category,
        priority: feedback.priority,
        title: feedback.title,
        description: feedback.description,
        page: feedback.page || null,
        url: feedback.url || null,
        user_agent: feedback.userAgent || null,
        session_id: feedback.sessionId || null,
        timestamp: feedback.timestamp,
        status: feedback.status || 'new',
        labels: feedback.labels || [],
        estimated_effort: feedback.estimatedEffort || null,
        metadata: feedback.metadata || {},
        votes: feedback.votes || 0,
        assignee: feedback.assignee || null,
        sprint_target: feedback.sprintTarget || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await this.client
        .from('feedback')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error inserting feedback:', error);
      throw error;
    }
  }

  async listFeedback({ page = 1, limit = 50, status, priority, type } = {}) {
    if (!this.enabled) return null;
    try {
      let query = this.client.from('feedback').select('*', { count: 'exact' });
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (type) query = query.eq('type', type);
      query = query.order('timestamp', { ascending: false });
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return {
        feedback: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error listing feedback:', error);
      return null;
    }
  }

  async listAllFeedback() {
    if (!this.enabled) return null;
    try {
      const { data, error } = await this.client
        .from('feedback')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing all feedback:', error);
      return null;
    }
  }

  async updateFeedbackStatus(id, { status, assignee, sprintTarget }) {
    if (!this.enabled) return null;
    try {
      const { data, error } = await this.client
        .from('feedback')
        .update({
          status,
          assignee: assignee || null,
          sprint_target: sprintTarget || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating feedback status:', error);
      return null;
    }
  }

  // Auth admin: create Supabase Auth user (server-side only)
  async createAuthUser({ email, password, metadata = {}, email_confirm = true }) {
    if (!this.enabled) return null;
    try {
      if (!this.client?.auth?.admin) return null;
      const { data, error } = await this.client.auth.admin.createUser({
        email,
        password,
        email_confirm,
        user_metadata: metadata
      });
      if (error) throw error;
      return data?.user || null;
    } catch (error) {
      console.error('Error creating auth user:', error);
      return null;
    }
  }

  // Drug operations
  async searchDrugs(searchTerm, limit = 50) {
    if (!this.enabled) return [];
    
    try {
      // Use text search for both regular fields and array fields
      const { data, error } = await this.client
        .from('drugs')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,generic_name.ilike.%${searchTerm}%`)
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

  // Curated DDI evidence lookup (by normalized names)
  async getDDIEvidence(drugAName, drugBName) {
    if (!this.enabled) return null;
    try {
      const a = String(drugAName || '').toLowerCase();
      const b = String(drugBName || '').toLowerCase();

      // Try order A|B
      let q = await this.client
        .from('ddi_evidence')
        .select('*')
        .eq('drug_primary', a)
        .eq('drug_interactor', b)
        .limit(1);
      let row = q.data && q.data[0];

      // Try order B|A
      if (!row) {
        q = await this.client
          .from('ddi_evidence')
          .select('*')
          .eq('drug_primary', b)
          .eq('drug_interactor', a)
          .limit(1);
        row = q.data && q.data[0];
      }

      if (!row) return null;

      // Fetch status to know if stale
      let stale = false;
      if (row.uniq_hash) {
        const st = await this.client
          .from('ddi_evidence_status')
          .select('stale')
          .eq('uniq_hash', row.uniq_hash)
          .maybeSingle();
        stale = Boolean(st.data?.stale);
      }

      return {
        evidence_level: row.evidence_level || 'unknown',
        evidence_source: row.evidence_source || null,
        citations: row.citations || [],
        uniq_hash: row.uniq_hash || null,
        stale,
        severity: row.severity,
        mechanism: row.mechanism,
        recommendation: row.recommendation,
      };
    } catch (error) {
      console.error('Error getting DDI curated evidence:', error);
      return null;
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
          id: userData.id, // optional; if provided, should match auth.users id
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role || 'user',
          institution: userData.institution,
          specialty: userData.specialty,
          license_number: userData.license_number,
          is_active: userData.is_active !== undefined ? userData.is_active : true,
          last_login: userData.last_login,
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

  async deleteUser(userId) {
    if (!this.enabled) return { success: true, id: userId };
    
    try {
      // First, soft delete from users table
      const { data: userData, error: userError } = await this.client
        .from('users')
        .update({ 
          is_active: false, 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (userError) throw userError;
      
      // Then delete from Supabase auth (hard delete)
      if (this.client?.auth?.admin) {
        const { error: authError } = await this.client.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Auth user deletion failed:', authError);
          // Don't throw - soft delete was successful
        }
      }
      
      return { success: true, id: userId, user: userData };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Hard delete user - completely removes user from database and auth
   * This allows the user to register again with the same email
   */
  async hardDeleteUser(userId) {
    if (!this.enabled) return { success: true, id: userId };
    
    try {
      console.log(`🗑️ Starting hard delete for user: ${userId}`);
      
      // First, get user data before deletion for logging
      const { data: userData, error: getUserError } = await this.client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (getUserError && getUserError.code !== 'PGRST116') {
        console.error('Error fetching user for hard delete:', getUserError);
        throw getUserError;
      }
      
      // Delete related data first (in proper dependency order)
      console.log(`🧹 Deleting related data for user: ${userId}`);
      
      // Step 1: Get all patients for this user first
      let patientIds = [];
      try {
        const { data: userPatients, error: getUserPatientsError } = await this.client
          .from('patients')
          .select('id')
          .eq('user_id', userId);
        
        if (getUserPatientsError) {
          console.warn('⚠️ Could not fetch user patients:', getUserPatientsError.message);
        } else {
          patientIds = userPatients.map(p => p.id);
          console.log(`📋 Found ${patientIds.length} patients to delete`);
        }
      } catch (e) {
        console.warn('⚠️ Error fetching patients:', e.message);
      }
      
      // Step 2: Delete patient profiles (references patients.id)
      if (patientIds.length > 0) {
        try {
          const { data: deletedProfiles, error: profilesError } = await this.client
            .from('patient_profiles')
            .delete()
            .in('patient_id', patientIds)
            .select('patient_id');
          
          if (profilesError) {
            console.warn('⚠️ Patient profiles deletion failed:', profilesError.message);
          } else {
            console.log(`✅ Deleted ${deletedProfiles?.length || 0} patient profiles`);
          }
        } catch (e) {
          console.warn('⚠️ Patient profiles table might not exist');
        }
      }
      
      // Step 3: Delete patients owned by this user (now safe since profiles are gone)
      try {
        const { data: deletedPatients, error: patientsError } = await this.client
          .from('patients')
          .delete()
          .eq('user_id', userId)
          .select('id');
        if (patientsError) {
          console.warn('⚠️ Patients deletion failed:', patientsError.message);
        } else {
          console.log(`✅ Deleted ${deletedPatients?.length || 0} patients`);
        }
      } catch (e) {
        console.warn('⚠️ Patients deletion error:', e.message);
      }
      
      // Step 4: Delete admin audit logs
      try {
        const { error: auditError } = await this.client
          .from('admin_audit')
          .delete()
          .or(`actor_id.eq.${userId},target_user_id.eq.${userId}`);
        if (auditError) {
          console.warn('⚠️ Admin audit deletion failed:', auditError.message);
        } else {
          console.log('✅ Deleted admin audit records');
        }
      } catch (e) {
        console.warn('⚠️ Admin audit table might not exist');
      }
      
      // Step 5: Delete feedback submitted by this user
      try {
        const { error: feedbackError } = await this.client
          .from('feedback')
          .delete()
          .eq('user_id', userId);
        if (feedbackError) {
          console.warn('⚠️ Feedback deletion failed:', feedbackError.message);
        } else {
          console.log('✅ Deleted feedback records');
        }
      } catch (e) {
        console.warn('⚠️ Feedback table might not have user_id column');
      }
      
      // Wait a moment for database operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Delete from users table (hard delete)
      console.log(`🗑️ Hard deleting user from users table: ${userId}`);
      const { error: userDeleteError } = await this.client
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (userDeleteError) {
        console.error('Hard delete from users table failed:', userDeleteError);
        throw userDeleteError;
      }
      
      // Delete from Supabase auth (hard delete)
      console.log(`🔒 Deleting user from auth: ${userId}`);
      if (this.client?.auth?.admin) {
        const { error: authError } = await this.client.auth.admin.deleteUser(userId);
        if (authError) {
          console.error('Auth user deletion failed:', authError);
          
          // Check if user exists in auth before considering this a failure
          try {
            const { data: authUser, error: getUserError } = await this.client.auth.admin.getUserById(userId);
            if (getUserError && getUserError.status === 404) {
              console.log('✅ User not found in auth (may have been deleted already)');
            } else if (!getUserError && authUser) {
              console.warn('⚠️ User still exists in auth despite deletion error');
              // For now, log but don't fail the entire operation
            }
          } catch (checkError) {
            console.warn('⚠️ Could not verify auth user status:', checkError);
          }
        } else {
          console.log(`✅ User successfully deleted from auth: ${userId}`);
        }
      } else {
        console.warn('⚠️ Auth admin not available');
      }
      
      console.log(`✅ Hard delete completed for user: ${userId}`);
      return { 
        success: true, 
        id: userId, 
        user: userData,
        type: 'hard_delete',
        message: 'User completely removed from system. Can register again with same email.'
      };
    } catch (error) {
      console.error('Error in hard delete user:', error);
      throw error;
    }
  }

  // Data sync logging
  async logSyncActivity(logData) {
    if (!this.enabled) return { id: 'noop', ...logData };
    
    try {
      // Prefer new schema (sync_type). If the table uses legacy column names (operation_type), retry with a mapped payload.
      const base = {
        status: logData.status,
        records_processed: logData.records_processed,
        errors: logData.errors,
        started_at: logData.started_at || new Date().toISOString(),
        completed_at: logData.completed_at,
        triggered_by: logData.triggered_by || 'api'
      };
      const tryNew = async () => this.client
        .from('data_sync_log')
        .insert({ ...base, sync_type: logData.sync_type || logData.operation_type || logData.type, source: logData.source })
        .select()
        .single();
      const tryLegacy = async () => this.client
        .from('data_sync_log')
        .insert({ ...base, operation_type: logData.sync_type || logData.operation_type || logData.type, source: logData.source })
        .select()
        .single();

      let resp = await tryNew();
      if (resp.error && (resp.error.code === '42703' || /column \"sync_type\"/i.test(resp.error.message))) {
        resp = await tryLegacy();
      }
      if (resp.error) throw resp.error;
      return resp.data;
    } catch (error) {
      console.error('Error logging sync activity:', error);
      return { id: 'error', ...logData };
    }
  }

  async updateSyncStatus(id, updateData) {
    if (!this.enabled) return { id, ...updateData };
    
    try {
      const { data, error } = await this.client
        .from('data_sync_log')
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
        .order('updated_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
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
      console.log('📝 Attempting to upsert patient:', { userId, patientId: patient.id, hasData: !!patient });
      
      // Ensure patient ID is a valid UUID
      let patientId = patient.id;
      if (patientId && !this.isValidUUID(patientId)) {
        patientId = randomUUID();
        console.log('🔄 Generated new UUID for invalid patient ID:', { old: patient.id, new: patientId });
      }
      
      const now = new Date().toISOString();
      const payload = {
        id: patientId,
        user_id: userId,
        data: { ...patient, id: patientId },
        created_at: now,
        updated_at: now,
      };
      if (!payload.id) delete payload.id;
      
      console.log('📤 Supabase upsert payload:', { 
        hasId: !!payload.id, 
        userId: payload.user_id, 
        dataKeys: Object.keys(payload.data || {})
      });
      
      const { data, error } = await this.client
        .from('patients')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
        
      if (error) {
        console.error('❌ Supabase upsert error:', error);
        throw error;
      }
      
      console.log('✅ Patient upserted successfully:', { id: data.id, userId: data.user_id });
      // Best-effort: keep patient_profiles in sync
      try {
        const profile = this._buildPatientProfileRecord(patient, data.id);
        await this.client
          .from('patient_profiles')
          .upsert(profile, { onConflict: 'patient_id' });
      } catch (e) {
        console.warn('⚠️ Failed to upsert patient_profiles (non-fatal):', e?.message || e);
      }
      return data;
    } catch (error) {
      console.error('💥 Error upserting patient:', error);
      // Re-throw the error instead of swallowing it
      throw error;
    }
  }

  _buildPatientProfileRecord(patient, savedId) {
    const pid = patient?.id || savedId;
    const genetics = Array.isArray(patient?.genetics) ? patient.genetics : [];
    const meds = Array.isArray(patient?.medications) ? patient.medications : [];
    const allergies = Array.isArray(patient?.allergies) ? patient.allergies : [];
    const conditions = Array.isArray(patient?.conditions) ? patient.conditions : [];

    const current_medications = meds.map((m) => {
      try { return m?.drug?.rxcui || m?.drug?.name || ''; } catch { return ''; }
    }).filter(Boolean);
    const allergy_list = allergies.map((a) => {
      try { return a?.allergen || a; } catch { return ''; }
    }).filter(Boolean);
    const comorbidities = conditions.map((c) => {
      try { return c?.icd10Code || c?.condition || ''; } catch { return ''; }
    }).filter(Boolean);

    return {
      patient_id: String(pid),
      genetic_profile: genetics,
      current_medications,
      allergies: allergy_list,
      comorbidities,
      updated_at: new Date().toISOString(),
    };
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
