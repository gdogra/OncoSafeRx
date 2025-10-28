import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, ArrowRight, Search, ShieldAlert, Beaker, User, Bell, Database, Stethoscope, Dna, TestTube, BarChart3, Layers, Home, ChevronLeft } from 'lucide-react';
import TourOverlay from './TourOverlay';
import { visitorTracking } from '../../services/visitorTracking';
import { appVersion } from '../../utils/env';

type Step = {
  id: string;
  title: string;
  description: string;
  cta?: { label: string; to: string };
  icon?: React.ReactNode;
  target?: string;
};

type TourArea = 'overview' | 'drug_info' | 'interactions' | 'patients' | 'genomics' | 'clinical_trials' | 'analytics' | 'admin' | 'role_sidebar';

const LoginWizard: React.FC = () => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const userId = (state?.user as any)?.id || (state?.user as any)?.uid || '';
  const role = (state?.user as any)?.role || '';
  const [open, setOpen] = useState(false);
  const [hidePermanently, setHidePermanently] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [mode, setMode] = useState<'menu' | 'tour'>('tour');
  const [area, setArea] = useState<TourArea>('role_sidebar');
  const [visited, setVisited] = useState<Set<string>>(() => {
    try {
      const uid = userId || 'anon';
      const r = role || 'any';
      const raw = localStorage.getItem(`osrx_tour_visited:${uid}:${r}`);
      const arr = raw ? (JSON.parse(raw) as string[]) : [];
      return new Set(arr);
    } catch { return new Set(); }
  });

  const markVisited = (path: string) => {
    try {
      const next = new Set(visited);
      next.add(path);
      setVisited(next);
      const uid = userId || 'anon';
      const r = role || 'any';
      localStorage.setItem(`osrx_tour_visited:${uid}:${r}`, JSON.stringify(Array.from(next)));
    } catch {}
  };

  // Version the wizard key so new releases can relaunch the tour for users
  const storageKey = useMemo(() => {
    const ver = appVersion() || 'dev';
    return userId
      ? `osrx_wizard_seen:${ver}:${userId}:${role || 'any'}`
      : `osrx_wizard_seen:${ver}:anon:${role || 'any'}`;
  }, [userId, role]);

  useEffect(() => {
    if (!state?.isAuthenticated) return;
    try {
      const features = (window as any).__OSRX_FEATURES__ || {};
      if (features.onboardingTour === false) return;
      const seen = localStorage.getItem(storageKey) === '1';
      // Backward compatibility: ignore legacy seen flag on new versions so tour can relaunch
      // (We intentionally do NOT suppress based on legacy keys here.)
      const suppressed = localStorage.getItem('osrx_wizard_suppressed') === '1';
      
      // Check for manual tour restart via URL param or window flag
      const urlParams = new URLSearchParams(window.location.search);
      const forceRestart = urlParams.get('restart_tour') === 'true' || (window as any).__RESTART_TOUR__;
      
      if (forceRestart || (!seen && !suppressed)) {
        setOpen(true);
        if (forceRestart) {
          // Clear the restart flag
          delete (window as any).__RESTART_TOUR__;
          // Remove the URL param
          if (urlParams.get('restart_tour')) {
            urlParams.delete('restart_tour');
            window.history.replaceState({}, '', `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`);
          }
        }
      }
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

  // Menu entries for tours
  const menu: Array<{ id: TourArea; title: string; desc: string; icon: React.ReactNode }> = [
    { id: 'overview', title: 'Overview', desc: 'High-level walkthrough of key features', icon: <Home className="w-6 h-6 text-gray-700" /> },
    { id: 'role_sidebar', title: 'Full Sidebar Tour', desc: 'Walk through all features available to your role', icon: <Layers className="w-6 h-6 text-gray-600" /> },
    { id: 'drug_info', title: 'Drug Information', desc: 'Search, labels, evidence synthesis', icon: <Database className="w-6 h-6 text-blue-600" /> },
    { id: 'interactions', title: 'Interactions', desc: 'Check and understand interaction risks', icon: <ShieldAlert className="w-6 h-6 text-red-600" /> },
    { id: 'patients', title: 'Patient Workflows', desc: 'Create patients and manage medications', icon: <Stethoscope className="w-6 h-6 text-emerald-600" /> },
    { id: 'genomics', title: 'Pharmacogenomics', desc: 'Genomic biomarkers and CPIC guidelines', icon: <Dna className="w-6 h-6 text-violet-600" /> },
    { id: 'clinical_trials', title: 'Clinical Trials', desc: 'Discover and screen relevant trials', icon: <TestTube className="w-6 h-6 text-amber-600" /> },
    { id: 'analytics', title: 'Analytics', desc: 'Usage, visitor, and evidence analytics', icon: <BarChart3 className="w-6 h-6 text-sky-600" /> },
    { id: 'admin', title: 'Admin Console', desc: 'System settings, health, users, and audit', icon: <Layers className="w-6 h-6 text-gray-600" /> },
  ];

  // Registry of path -> title/description for consistent messaging
  const tourRegistry: Record<string, { title: string; description: string }> = {
    // Core features
    '/': { title: 'Dashboard', description: 'Your main dashboard with quick access to key features and recent activity.' },
    '/search': { title: 'Drug Search', description: 'Find drug details, indications, and safety insights.' },
    '/database': { title: 'Regulatory Labels', description: 'FDA-approved labels and prescribing information.' },
    '/evidence-analysis': { title: 'Evidence Analysis', description: 'Synthesize evidence from multiple sources.' },
    '/drug-intelligence': { title: 'Drug Intelligence Integrator', description: 'Real-time access to external biomedical APIs.' },
    '/multi-database-search': { title: 'Multi-Database Search', description: 'Federated search across literature and databases.' },
    '/biostatistics': { title: 'Biostatistics Tools', description: 'Survival analysis and treatment effect estimation.' },
    
    // Interactions
    '/interactions': { title: 'Interaction Checker', description: 'Check multi-drug interactions and management guidance.' },
    '/curated': { title: 'Curated Pairs', description: 'Clinically curated interaction pairs and evidence.' },
    '/interaction-matrix': { title: 'Interaction Matrix', description: 'Visual matrix view of drug-drug interactions.' },
    
    // Patient Management
    '/patients': { title: 'Patients', description: 'Create patients and manage demographics and history.' },
    '/my-medications': { title: 'My Medications', description: 'Track medications and reminders (patient portal).' },
    '/my-profile': { title: 'My Profile', description: 'Personal health profile and medication tracking.' },
    '/care-plan': { title: 'Care Plans', description: 'Comprehensive care planning and management.' },
    '/care-management': { title: 'Care Management', description: 'Advanced care coordination tools.' },
    '/medication-adherence': { title: 'Medication Adherence', description: 'Track and improve medication compliance.' },
    
    // Clinical Decision Support
    '/genomics': { title: 'Pharmacogenomics', description: 'Explore genomic biomarkers and CPIC guidelines.' },
    '/protocols': { title: 'Protocols', description: 'Evidence-based treatment protocols and guidelines.' },
    '/workflows': { title: 'Workflows', description: 'Advanced workflow management and automation.' },
    '/dosing': { title: 'Dosing Calculator', description: 'Calculate appropriate drug dosing based on patient factors.' },
    '/contraindications': { title: 'Contraindications', description: 'Review drug contraindications and warnings.' },
    
    // Research & Trials
    '/trials': { title: 'Clinical Trials', description: 'Discover trials based on condition and interventions.' },
    '/oncology-trials': { title: 'Oncology Trials', description: 'Specialized clinical trials for cancer patients.' },
    '/trial-matching': { title: 'Trial Matching', description: 'Intelligent matching of patients to clinical trials.' },
    '/biomarkers': { title: 'Biomarkers', description: 'Explore biomarker data and clinical significance.' },
    
    // Analytics & Reporting
    '/analytics': { title: 'Analytics', description: 'Usage, visitor, and evidence analytics.' },
    '/visitor-analytics': { title: 'Visitor Analytics', description: 'Site usage and visitor tracking dashboards.' },
    '/reports': { title: 'Reports', description: 'Generate clinical and usage reports.' },
    '/quality-metrics': { title: 'Quality Metrics', description: 'Track quality indicators and outcomes.' },
    
    // Education & Resources
    '/education': { title: 'Patient Education', description: 'Educational resources for patients and caregivers.' },
    '/guidelines': { title: 'Clinical Guidelines', description: 'Access to clinical practice guidelines.' },
    '/resources': { title: 'Resources', description: 'Additional clinical and educational resources.' },
    '/drug-monographs': { title: 'Drug Monographs', description: 'Detailed drug information and monographs.' },
    
    // Communication & Collaboration
    '/messaging': { title: 'Messaging', description: 'Secure messaging between healthcare providers.' },
    '/consultations': { title: 'Consultations', description: 'Request and manage specialist consultations.' },
    '/notifications': { title: 'Notifications', description: 'Manage alerts and notification preferences.' },
    
    // Profile & Settings
    '/profile': { title: 'Profile', description: 'Manage your account profile and preferences.' },
    '/settings': { title: 'Settings', description: 'Configure application settings and preferences.' },
    '/preferences': { title: 'Preferences', description: 'Customize your user experience.' },
    
    // Admin features
    '/admin': { title: 'Admin Console', description: 'Manage settings, users, audit, and system health.' },
    '/admin/health': { title: 'System Health', description: 'Review API, proxies, and connectivity.' },
    '/admin/users': { title: 'Users & Roles', description: 'View users and manage permissions.' },
    '/admin/audit': { title: 'Audit Logs', description: 'Review system audit logs.' },
    '/admin/settings': { title: 'System Settings', description: 'Manage system-wide settings.' },
    '/admin/feedback': { title: 'Feedback Management', description: 'Review and respond to user feedback.' },
    '/admin/integrations': { title: 'Integrations', description: 'Manage external system integrations.' },
    '/admin/api-keys': { title: 'API Keys', description: 'Manage API keys and access tokens.' },
  };

  const anchorExists = (path: string) => !!document.querySelector(`nav a[href="${path}"]`);
  const buildStepsFromPaths = (paths: string[]): Step[] =>
    paths
      .filter((p) => anchorExists(p))
      .map((p) => {
        const meta = tourRegistry[p] || { title: p, description: 'Explore this feature.' };
        return { id: p, title: meta.title, description: meta.description, cta: { label: 'Open', to: p }, target: `nav a[href="${p}"]` };
      });
  const buildAllFromSidebar = (): Step[] => {
    // Get all navigation links from sidebar - multiple selectors to catch different patterns
    const selectors = [
      'nav a[href^="/"]',
      '[data-sidebar-link]',
      'aside a[href^="/"]',
      '.sidebar a[href^="/"]',
      '[role="navigation"] a[href^="/"]'
    ];
    
    const anchors = Array.from(document.querySelectorAll(selectors.join(', '))) as HTMLAnchorElement[];
    const uniqueHrefs = Array.from(new Set(anchors.map(a => {
      const href = a.getAttribute('href') || a.getAttribute('data-href');
      return href && href.startsWith('/') && href !== '/' ? href : null;
    }))).filter(Boolean) as string[];
    
    // If we have very few links detected, fall back to a comprehensive list from tourRegistry
    if (uniqueHrefs.length < 10) {
      const fallbackPaths = Object.keys(tourRegistry).filter(path => path !== '/');
      const allPaths = Array.from(new Set([...uniqueHrefs, ...fallbackPaths]));
      
      const steps = allPaths.map((path) => {
        const anchor = anchors.find(a => a.getAttribute('href') === path || a.getAttribute('data-href') === path);
        const linkText = anchor?.textContent?.trim() || '';
        const meta = tourRegistry[path] || { 
          title: linkText || path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
          description: `Explore the ${linkText || path.replace('/', '').replace(/-/g, ' ')} feature.` 
        };
        
        return { 
          id: path, 
          title: meta.title, 
          description: meta.description, 
          cta: { label: 'Visit', to: path }, 
          target: `nav a[href="${path}"], [data-sidebar-link][data-href="${path}"], aside a[href="${path}"]`
        };
      });
      
      return [
        { 
          id: 'welcome-comprehensive', 
          title: 'Comprehensive App Tour', 
          description: `Welcome! This tour will walk you through ${allPaths.length}+ features available in OncoSafeRx. Each step will show you a different tool and explain how to use it.` 
        },
        ...steps
      ];
    }
    
    // Build steps with enhanced descriptions
    const steps = uniqueHrefs.map((path) => {
      const anchor = anchors.find(a => a.getAttribute('href') === path || a.getAttribute('data-href') === path);
      const linkText = anchor?.textContent?.trim() || '';
      const meta = tourRegistry[path] || { 
        title: linkText || path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        description: `Explore the ${linkText || path.replace('/', '').replace(/-/g, ' ')} feature.` 
      };
      
      return { 
        id: path, 
        title: meta.title, 
        description: meta.description, 
        cta: { label: 'Visit', to: path }, 
        target: `nav a[href="${path}"], [data-sidebar-link][data-href="${path}"], aside a[href="${path}"]`
      };
    });
    
    // Add welcome step at the beginning
    return [
      { 
        id: 'welcome-comprehensive', 
        title: 'Complete App Tour', 
        description: `Let's walk through all ${uniqueHrefs.length} features available to you based on your role. This comprehensive tour will show you every tool in your sidebar.` 
      },
      ...steps
    ];
  };

  // Steps for a selected tour area
  const stepsForArea = (a: TourArea): Step[] => {
    switch (a) {
      case 'overview':
        return [
          { id: 'welcome', title: 'Welcome to OncoSafeRx', description: 'Pick any area to explore; you can always return to this menu.' },
          { id: 'nav', title: 'Navigation', description: 'Use the left sidebar to access key features.', target: 'nav a[href="/search"]' as any },
          { id: 'profile', title: 'Profile & Alerts', description: 'Update your profile and notification preferences any time.', cta: { label: 'Open Profile', to: '/profile' }, icon: <User className="w-6 h-6 text-gray-700" /> },
        ];
      case 'role_sidebar': {
        const steps = buildAllFromSidebar();
        return steps.length > 1 ? steps : [ 
          { id: 'loading', title: 'Loading Features', description: 'Scanning your sidebar for available features... Please wait a moment for the sidebar to fully load.' },
          { id: 'sidebar-placeholder', title: 'Sidebar Tour', description: 'This tour will walk through all features available to your role. Items will appear as the sidebar loads.' } 
        ];
      }
      case 'drug_info':
        return [
          { id: '/search', title: tourRegistry['/search'].title, description: 'Type a drug in the search bar, then review details and actions.', cta: { label: 'Open Drug Search', to: '/search' }, target: '[data-tour="drug-search-input"]' },
          { id: '/database', title: tourRegistry['/database'].title, description: 'Search labels, view prescribing information, and evidence summaries.', cta: { label: 'Open Drug Database', to: '/database' }, target: '[data-tour="drug-database-search"]' },
          ...buildStepsFromPaths(['/evidence-analysis','/drug-intelligence','/multi-database-search','/biostatistics'])
        ];
      case 'interactions':
        return [
          { id: '/interactions', title: tourRegistry['/interactions'].title, description: 'Add two or more drugs using the selector below.', cta: { label: 'Open Interactions', to: '/interactions' }, target: '[data-tour="interactions-add-drug"]' },
          { id: '/interactions/check', title: 'Check Interactions', description: 'Click to analyze interactions and review severity and guidance.', cta: { label: 'Analyze', to: '/interactions' }, target: '[data-tour="interactions-check-button"]' },
          ...buildStepsFromPaths(['/curated'])
        ];
      case 'patients':
        return [
          { id: '/patients', title: tourRegistry['/patients'].title, description: 'Create patients and manage demographics and history.', cta: { label: 'Open Patients', to: '/patients' }, target: '[data-tour="patients-create-button"]' },
          { id: '/patients/medications', title: 'Add Medication', description: 'Add medications to manage therapy and safety.', cta: { label: 'Open Patients', to: '/patients' }, target: '[data-tour="patients-add-medication"]' },
          ...buildStepsFromPaths(['/my-medications','/care-plan','/care-management'])
        ];
      case 'genomics':
        // Include in-page target for guidelines search
        return [
          { id: '/genomics', title: tourRegistry['/genomics'].title, description: tourRegistry['/genomics'].description, cta: { label: 'Open Genomics', to: '/genomics' }, target: '[data-tour="genomics-guidelines-search"]' }
        ];
      case 'clinical_trials':
        return [
          { id: '/trials', title: tourRegistry['/trials'].title, description: tourRegistry['/trials'].description, cta: { label: 'Browse Trials', to: '/trials' }, target: '[data-tour="trials-search-input"]' },
        ];
      case 'analytics':
        return buildStepsFromPaths(['/analytics','/visitor-analytics']);
      case 'admin':
        return buildStepsFromPaths(['/admin','/admin/health','/admin/users','/admin/audit','/admin/settings','/admin/feedback']);
      default:
        return [];
    }
  };

  const steps: Step[] = mode === 'menu' ? [] : stepsForArea(area);

  if (!open) return null;

  const step = steps[stepIndex];

  const close = (remember = true) => {
    try {
      visitorTracking.trackCustomEvent('onboarding_close', { step: step?.id || 'menu', index: stepIndex, role });
    } catch {}
    setOpen(false);
    try {
      if (remember) localStorage.setItem(storageKey, '1');
      if (hidePermanently) localStorage.setItem('osrx_wizard_suppressed', '1');
    } catch {}
  };

  const next = () => {
    try { visitorTracking.trackCustomEvent('onboarding_next', { step: step?.id || 'menu', index: stepIndex, role }); } catch {}
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Mark completion explicitly
      try { visitorTracking.trackCustomEvent('onboarding_complete', { role, totalSteps: steps.length }); } catch {}
      // Return to menu after a tour completes
      setMode('menu');
      setStepIndex(0);
    }
  };

  const skip = () => { try { visitorTracking.trackCustomEvent('onboarding_skip', { step: step?.id || 'menu', index: stepIndex, role }); } catch {}; close(false); };

  const go = (to: string) => {
    try { visitorTracking.trackCustomEvent('onboarding_cta', { step: step?.id || 'menu', index: stepIndex, role, to }); } catch {}
    navigate(to);
    markVisited(to);
    next();
  };

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/40" onClick={() => close(false)} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'menu' ? <Home className="w-5 h-5 text-gray-700" /> : (step?.icon || null)}
              <h3 className="text-lg font-semibold text-gray-900">{mode === 'menu' ? 'Welcome! Choose a tour' : step?.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'tour' && (
                <button onClick={() => { setMode('menu'); setStepIndex(0); }} className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700" title="Back to tour menu">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Menu
                </button>
              )}
              <button onClick={() => close(false)} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Close wizard">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {/* Menu view */}
            {mode === 'menu' && (
              <>
                <p className="text-gray-700 text-sm leading-6">Pick an area of the app to explore. You can return here anytime to select a different tour.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {menu.map((m) => {
                    // Compute visited stats for this menu item
                    let visitedCount = 0;
                    let totalCount = 0;
                    if (m.id === 'role_sidebar') {
                      const anchors = Array.from(document.querySelectorAll('nav a[href^="/"]')) as HTMLAnchorElement[];
                      const hrefs = Array.from(new Set(anchors.map(a => a.getAttribute('href') || ''))).filter(Boolean) as string[];
                      totalCount = hrefs.length;
                      visitedCount = hrefs.filter(h => visited.has(h)).length;
                    } else {
                      const paths = stepsForArea(m.id as TourArea).map(s => s.cta?.to).filter(Boolean) as string[];
                      totalCount = paths.length;
                      visitedCount = paths.filter(p => visited.has(p)).length;
                    }
                    const percent = totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0;
                    return (
                      <button
                        key={m.id}
                        onClick={() => { setArea(m.id); setMode('tour'); setStepIndex(0); try { visitorTracking.trackCustomEvent('onboarding_area', { area: m.id, role }); } catch {} }}
                        className="text-left border rounded-lg p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {m.icon}
                            <div className="font-medium text-gray-900">{m.title}</div>
                          </div>
                          {totalCount > 0 && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${percent === 100 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                              title={`Visited ${visitedCount} of ${totalCount}`}>
                              {visitedCount}/{totalCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <input id="hide-permanently" type="checkbox" className="rounded border-gray-300" checked={hidePermanently} onChange={(e) => setHidePermanently(e.target.checked)} />
                    <label htmlFor="hide-permanently" className="text-xs text-gray-600">Don’t show this tour again</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={skip} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Close</button>
                  </div>
                </div>
              </>
            )}

            {/* Tour view */}
            {mode === 'tour' && step && (
              <>
                <p className="text-gray-700 text-sm leading-6">{step.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <input id="hide-permanently" type="checkbox" className="rounded border-gray-300" checked={hidePermanently} onChange={(e) => setHidePermanently(e.target.checked)} />
                    <label htmlFor="hide-permanently" className="text-xs text-gray-600">Don’t show this tour again</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setMode('menu'); setStepIndex(0); }} className="text-sm px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">Menu</button>
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
                {/* Contextual overlay if a target selector is provided */}
                {step && (step as any).target && (
                  <TourOverlay
                    targetSelector={(step as any).target}
                    title={step.title}
                    description={step.description}
                    onNext={() => {
                      const path = step?.cta?.to;
                      if (path) markVisited(path);
                      next();
                    }}
                    onSkip={skip}
                    onBackToMenu={() => { setMode('menu'); setStepIndex(0); }}
                    placement="right"
                    waitMs={7000}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWizard;
