import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SupabaseAuthService } from '../services/authService';
import { Check, Loader2, ArrowRight } from 'lucide-react';

type RoleId = 'patient' | 'caregiver' | 'oncologist' | 'pharmacist' | 'nurse' | 'researcher' | 'student';

const ROLES: { id: RoleId; label: string; description: string; icon: string }[] = [
  { id: 'patient', label: 'Patient', description: 'I am managing my own cancer care', icon: '🧑' },
  { id: 'caregiver', label: 'Caregiver', description: 'I am a family member or friend helping with care', icon: '🤝' },
  { id: 'oncologist', label: 'Oncologist', description: 'I am a medical doctor specializing in cancer treatment', icon: '🩺' },
  { id: 'pharmacist', label: 'Pharmacist', description: 'I am a medication therapy expert', icon: '💊' },
  { id: 'nurse', label: 'Nurse', description: 'I provide patient care and treatment coordination', icon: '👩‍⚕️' },
  { id: 'researcher', label: 'Researcher', description: 'I work on clinical research and trials', icon: '🔬' },
  { id: 'student', label: 'Student', description: 'I am a medical, pharmacy, or nursing student', icon: '🎓' },
];

const AuthSelectRole: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const [selected, setSelected] = useState<RoleId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');

  // Verify we have a session; if not, bounce to /auth
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user) {
        if (!cancelled) navigate('/auth', { replace: true });
        return;
      }
      if (!cancelled) setEmail(data.session.user.email || '');
    })();
    return () => { cancelled = true };
  }, [navigate]);

  const handleContinue = async () => {
    if (!selected) return;
    setIsSaving(true);
    setError(null);

    try {
      // 1) Update Supabase user_metadata with the chosen role
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { role: selected }
      });
      if (updateErr) throw updateErr;

      // 2) Best-effort upsert to public.users table so server-side role checks work
      try {
        const { data: sess } = await supabase.auth.getSession();
        const u = sess.session?.user;
        if (u) {
          await supabase
            .from('users')
            .upsert({
              id: u.id,
              email: u.email,
              role: selected,
              first_name: (u.user_metadata?.full_name || u.user_metadata?.name || '').split(' ')[0] || null,
              last_name: (u.user_metadata?.full_name || u.user_metadata?.name || '').split(' ').slice(1).join(' ') || null,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
        }
      } catch (dbErr) {
        console.warn('Role upsert to public.users failed (non-blocking):', dbErr);
      }

      // 3) Rebuild the local profile so AuthContext reflects the new role
      try {
        await SupabaseAuthService.getCurrentUser(true);
      } catch (e) {
        console.warn('Profile rebuild after role selection failed (non-blocking):', e);
      }

      // 4) Redirect based on role
      const dest = selected === 'patient' || selected === 'caregiver' ? '/' : '/';
      navigate(dest, { replace: true });
    } catch (err: any) {
      console.error('Failed to save role:', err);
      setError(err?.message || 'Could not save role. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to OncoSafeRx</h1>
          <p className="text-gray-600">
            {email ? <>Signed in as <strong>{email}</strong>.</> : null} Tell us how you&apos;ll be using OncoSafeRx so we can tailor your experience.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">I am a...</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {ROLES.map(r => {
              const isSelected = selected === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelected(r.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">{r.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{r.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-violet-600" />}
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{r.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            You can change your role later in account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectRole;
