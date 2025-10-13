import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SignupData } from '../types/user';

// Mock supabase client used inside authService
let mockDbProfile: any = null;
vi.mock('../lib/supabase', () => {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => ({ data: mockDbProfile, error: null }),
  };
  return { supabase: { from: () => chain, auth: { getSession: async () => ({ data: { session: null } }) } } };
});

// Import after mocks
import { SupabaseAuthService as S } from './authService';

// Helper to call private method through any cast
const build = async (user: any, fallback?: SignupData) => {
  return await (S as any)['buildUserProfile'](user, fallback);
};

describe('AuthService role resolution', () => {
  beforeEach(() => { mockDbProfile = null; });

  it('prefers user_metadata.role over database role', async () => {
    mockDbProfile = { id: 'u1', role: 'pharmacist' };
    const user = { id: 'u1', email: 'a@b.com', user_metadata: { role: 'oncologist' } };
    const profile = await build(user);
    expect(profile.role).toBe('oncologist');
    expect(profile.roles).toContain('oncologist');
  });

  it('falls back to database role when metadata missing', async () => {
    mockDbProfile = { id: 'u2', role: 'nurse' };
    const user = { id: 'u2', email: 'c@d.com', user_metadata: {} };
    const profile = await build(user);
    expect(profile.role).toBe('nurse');
    expect(profile.roles).toContain('nurse');
  });

  it('defaults to patient when neither metadata nor DB role exists', async () => {
    mockDbProfile = null;
    const user = { id: 'u3', email: 'e@f.com', user_metadata: {} };
    const profile = await build(user);
    expect(profile.role).toBe('patient');
    expect(profile.roles).toContain('patient');
  });
});

