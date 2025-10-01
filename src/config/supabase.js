// Supabase service - automatically uses real implementation if credentials are available
// Falls back to no-op implementation for development without Supabase setup

import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();

// Check if Supabase credentials are available
const hasSupabaseCredentials = process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// No-op Supabase service for environments without Supabase
export class NoOpSupabaseService {
  constructor() {
    this.enabled = false;
    // Simple in-memory stores for development without Supabase
    this.users = new Map(); // key: id, value: user object
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
    // Persist a user in-memory for local development
    const id = userData.id || randomUUID();
    const now = new Date();
    const user = {
      id,
      email: userData.email,
      full_name: userData.full_name || '',
      role: userData.role || 'user',
      institution: userData.institution || null,
      specialty: userData.specialty || null,
      license_number: userData.license_number || null,
      password_hash: userData.password_hash, // used by authRoutes login
      is_active: userData.is_active !== undefined ? userData.is_active : true,
      created_at: now,
      updated_at: now,
      last_login: null,
      preferences: userData.preferences || {}
    };
    this.users.set(id, user);
    return Promise.resolve({ ...user });
  }

  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return Promise.resolve({ ...user });
    }
    return Promise.resolve(null);
  }

  getAllUsers() {
    return Promise.resolve(Array.from(this.users.values()).map(u => ({ ...u })));
  }

  updateUser(userId, updateData) {
    const existing = this.users.get(userId);
    if (!existing) return Promise.resolve({ ...updateData });
    const updated = { ...existing, ...updateData, updated_at: new Date() };
    this.users.set(userId, updated);
    return Promise.resolve({ ...updated });
  }

  // Data sync logging (no-op)
  logSyncActivity(logData) {
    return Promise.resolve({ id: 'noop', ...logData });
  }

  updateSyncStatus(id, updateData) {
    return Promise.resolve({ id, ...updateData });
  }

  // Patient management (no-op) - needed for patient routes
  listPatientsByUser(userId) {
    // Return empty array - no patients stored in no-op mode
    return Promise.resolve([]);
  }

  upsertPatient(userId, patientData) {
    // Simulate successful save with generated ID
    const id = patientData.id || randomUUID();
    return Promise.resolve({ 
      id, 
      user_id: userId,
      data: patientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  deletePatient(userId, patientId) {
    // Simulate successful deletion
    return Promise.resolve(true);
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
