// Supabase service - automatically uses real implementation if credentials are available
// Falls back to no-op implementation for development without Supabase setup

import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
dotenv.config();

// Optional flag to force offline/no-op mode (useful in restricted network/dev)
let supabaseDisabled = String(process.env.SUPABASE_DISABLED || process.env.SUPABASE_OFFLINE || '').toLowerCase() === 'true';

// Check if Supabase credentials are available and not explicitly disabled
// In production, prefer enabling Supabase if credentials are present, unless explicitly forced off
const forceDisable = String(process.env.SUPABASE_FORCE_DISABLED || '').toLowerCase() === 'true';
if ((process.env.NODE_ENV === 'production') && !forceDisable && (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY))) {
  supabaseDisabled = false;
}

const hasSupabaseCredentials = !supabaseDisabled && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

// No-op Supabase service for environments without Supabase
export class NoOpSupabaseService {
  constructor() {
    this.enabled = false;
    // Simple in-memory stores for development without Supabase
    this.users = new Map(); // key: id, value: user object
    this.patients = new Map(); // key: userId, value: Map(patientId -> record)
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
      if (user.email === email) {
        const userCopy = { ...user };
        // Manual role override for specific users
        if (email === 'gdogra@gmail.com') {
          console.log('🔧 BACKEND MANUAL OVERRIDE: Setting gdogra@gmail.com to super_admin role');
          userCopy.role = 'super_admin';
        }
        return Promise.resolve(userCopy);
      }
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

  deleteUser(userId) {
    const existing = this.users.get(userId);
    if (existing) {
      this.users.delete(userId);
      return Promise.resolve({ success: true, id: userId, user: existing });
    }
    return Promise.resolve({ success: false, id: userId, error: 'User not found' });
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
    try {
      const byUser = this.patients.get(String(userId));
      if (!byUser) return Promise.resolve([]);
      const arr = Array.from(byUser.values());
      // Sort by updated_at desc
      arr.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      return Promise.resolve(arr);
    } catch {
      return Promise.resolve([]);
    }
  }

  upsertPatient(userId, patientData) {
    // Persist in-memory for dev
    const uid = String(userId);
    const now = new Date().toISOString();
    let id = patientData.id || randomUUID();
    let byUser = this.patients.get(uid);
    if (!byUser) { byUser = new Map(); this.patients.set(uid, byUser); }
    const existing = byUser.get(String(id));
    const record = {
      id: String(id),
      user_id: uid,
      data: { ...patientData, id: String(id) },
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    byUser.set(String(id), record);
    return Promise.resolve({ ...record });
  }

  deletePatient(userId, patientId) {
    try {
      const uid = String(userId);
      const byUser = this.patients.get(uid);
      if (!byUser) return Promise.resolve(false);
      const ok = byUser.delete(String(patientId));
      return Promise.resolve(ok);
    } catch {
      return Promise.resolve(false);
    }
  }

  // Feedback (no-op / dev fallback)
  async insertFeedback(_feedback) {
    return null;
  }
  async listFeedback(_filters) {
    return null;
  }
  async listAllFeedback() {
    return null;
  }
  async updateFeedbackStatus(_id, _update) {
    return null;
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
    if (supabaseDisabled) {
      console.log('⚠️  Supabase explicitly disabled via env, using no-op service');
    } else {
      console.log('⚠️  Supabase credentials not found, using no-op service');
    }
    return new NoOpSupabaseService();
  }
}

// Create and export the service instance
const supabaseService = await createSupabaseService();
export default supabaseService;
