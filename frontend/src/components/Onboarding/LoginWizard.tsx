import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowRight, Search, ShieldAlert, Beaker, User, Bell } from 'lucide-react';
import { visitorTracking } from '../../services/visitorTracking';

type Step = {
  id: string;
  title: string;
  description: string;
  cta?: { label: string; to: string };
  icon?: React.ReactNode;
};

const LoginWizard: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const userId = (state?.user as any)?.id || (state?.user as any)?.uid || '';
  const role = (state?.user as any)?.role || '';
  const [open, setOpen] = useState(false);
  const [hidePermanently, setHidePermanently] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const storageKey = useMemo(() => userId ? `osrx_wizard_seen:${userId}:${role || 'any'}` : `osrx_wizard_seen:anon:${role || 'any'}`, [userId, role]);

  useEffect(() => {
    if (!state?.isAuthenticated) return;
    try {
      const features = (window as any).__OSRX_FEATURES__ || {};
      if (features.onboardingTour === false) return;
      const seen = localStorage.getItem(storageKey) === '1';
      const suppressed = localStorage.getItem('osrx_wizard_suppressed') === '1';
      if (!seen && !suppressed) setOpen(true);
    } catch { setOpen(true); }
  }, [state?.isAuthenticated, storageKey]);

  const stepsForRole = (r: string): Step[] => {
    const commonTail: Step = { id: 'profile', title: 'Profile & Alerts', description: 'Update your profile and notification preferences any time.', cta: { label: 'Open Profile', to: '/profile' }, icon: <User className="w-6 h-6 text-gray-700" /> };
    const welcome: Step = { id: 'welcome', title: 'Welcome to OncoSafeRx', description: 'A quick tour to help you get the most out of your tools.' };
    const search: Step = { id: 'search', title: 'Drug Search', description: 'Find drug details, indications, and safety insights.', cta: { label: 'Open Drug Search', to: '/search' }, icon: <Search className="w-6 h-6 text-primary-600" /> };
    const interactions: Step = { id: 'interactions', title: 'Interactions', description: 'Check interactions across multiple medications with severity and management guidance.', cta: { label: 'Open Interactions', to: '/interactions' }, icon: <ShieldAlert className="w-6 h-6 text-red-600" /> };
    const curated: Step = { id: 'curated', title: 'Curated Pairs', description: 'Explore clinically curated interaction pairs and evidence.', cta: { label: 'View Curated', to: '/curated' }, icon: <Beaker className="w-6 h-6 text-emerald-600" /> };
    const trials: Step = { id: 'trials', title: 'Clinical Trials', description: 'Discover trials relevant to your patients and biomarkers.', cta: { label: 'Browse Trials', to: '/trials' }, icon: <Beaker className="w-6 h-6 text-violet-600" /> };

    const patientSteps: Step[] = [
      welcome,
      { id: 'my-meds', title: 'My Medications', description: 'Manage your medications list and check for interactions quickly.', cta: { label: 'Open My Medications', to: '/my-profile' }, icon: <User className="w-6 h-6 text-primary-600" /> },
      interactions,
      { id: 'education', title: 'Education', description: 'Helpful resources tailored for patients and caregivers.', cta: { label: 'Patient Education', to: '/education' } },
      commonTail
    ];

    const caregiverSteps = patientSteps;

    const clinicianSteps: Step[] = [
      welcome,
      search,
      interactions,
      curated,
      trials,
      commonTail
    ];

    const researcherSteps: Step[] = [
      welcome,
      search,
      curated,
      trials,
      { id: 'analytics', title: 'Analytics', description: 'Explore usage and evidence analytics (role-permitting).', cta: { label: 'View Analytics', to: '/analytics' } },
      commonTail
    ];

    const adminSteps: Step[] = [
      welcome,
      { id: 'admin', title: 'Admin Console', description: 'Manage system settings, health, and audit logs.', cta: { label: 'Open Admin', to: '/admin' } },
      { id: 'health', title: 'System Health', description: 'Review API, RxNorm connectivity, and proxies.', cta: { label: 'System Health', to: '/admin/health' } },
      { id: 'users', title: 'Users & Roles', description: 'View and manage users and permissions.', cta: { label: 'Manage Users', to: '/admin/users' } },
      commonTail
    ];

    switch ((r || '').toLowerCase()) {
      case 'patient': return patientSteps;
      case 'caregiver': return caregiverSteps;
      case 'oncologist':
      case 'pharmacist':
      case 'nurse': return clinicianSteps;
      case 'researcher':
      case 'student': return researcherSteps;
      case 'admin':
      case 'super_admin': return adminSteps;
      default: return [welcome, search, interactions, trials, commonTail];
    }
  };

  const steps: Step[] = stepsForRole(role);

  if (!open) return null;

  const step = steps[stepIndex];

  const close = (remember = true) => {
    try {
      visitorTracking.trackCustomEvent('onboarding_close', { step: step.id, index: stepIndex, role });
    } catch {}
    setOpen(false);
    try {
      if (remember) localStorage.setItem(storageKey, '1');
      if (hidePermanently) localStorage.setItem('osrx_wizard_suppressed', '1');
    } catch {}
  };

  const next = () => {
    try { visitorTracking.trackCustomEvent('onboarding_next', { step: step.id, index: stepIndex, role }); } catch {}
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Mark completion explicitly
      try { visitorTracking.trackCustomEvent('onboarding_complete', { role, totalSteps: steps.length }); } catch {}
      close();
    }
  };

  const skip = () => { try { visitorTracking.trackCustomEvent('onboarding_skip', { step: step.id, index: stepIndex, role }); } catch {}; close(false); };

  const go = (to: string) => {
    try { visitorTracking.trackCustomEvent('onboarding_cta', { step: step.id, index: stepIndex, role, to }); } catch {}
    navigate(to);
    next();
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40" onClick={() => close(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step.icon}
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
            </div>
            <button onClick={() => close(false)} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Close wizard">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <p className="text-gray-700 text-sm leading-6">{step.description}</p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <input id="hide-permanently" type="checkbox" className="rounded border-gray-300" checked={hidePermanently} onChange={(e) => setHidePermanently(e.target.checked)} />
                <label htmlFor="hide-permanently" className="text-xs text-gray-600">Don’t show this tour again</label>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={skip} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Skip</button>
                {step.cta ? (
                  <button onClick={() => go(step.cta!.to)} className="inline-flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700">
                    {step.cta.label}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button onClick={next} className="inline-flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
              Step {stepIndex + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWizard;
