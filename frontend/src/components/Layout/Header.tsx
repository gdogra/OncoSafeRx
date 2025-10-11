import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Search, AlertTriangle, Dna, FileText, HelpCircle, Users, Stethoscope, LogIn, LogOut, User as UserIcon, ChevronDown, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { interactionService } from '../../services/api';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, actions } = useAuth();
  const [hasSupabaseSession, setHasSupabaseSession] = useState<boolean>(false);
  const [accountOpen, setAccountOpen] = useState<boolean>(false);
  const signInProdOnly = (import.meta as any)?.env?.VITE_SIGNIN_PROD_ONLY === 'true';
  const canShowSignIn = !signInProdOnly || (import.meta as any)?.env?.MODE === 'production';
  const accountRef = useRef<HTMLDivElement | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const [curatedCount, setCuratedCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    // Check Supabase session presence
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSupabaseSession(!!data?.session);
    }).catch(() => {});
    interactionService
      .getKnownInteractions({ limit: 1 })
      .then((data) => {
        if (mounted) setCuratedCount(data.total ?? data.count ?? null);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Close account menu on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!accountOpen) return;
      const el = accountRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [accountOpen]);

  const isPatientRole = (() => {
    try {
      const u = state.user as any;
      const roles: string[] = Array.isArray(u?.roles) ? u.roles : (u?.role ? [u.role] : []);
      return roles.includes('patient') || roles.includes('caregiver');
    } catch { return false; }
  })();

  const navItems = isPatientRole
    ? [
        { path: '/my-care', label: 'My Care', icon: Activity },
        { path: '/care-plan', label: 'Care Plan', icon: FileText },
        { path: '/education', label: 'Education', icon: BookOpen },
        { path: '/support', label: 'Support', icon: Users },
        { path: '/my-medications', label: 'Medications', icon: Stethoscope },
        { path: '/my-appointments', label: 'Appointments', icon: Calendar },
        { path: '/help', label: 'Help', icon: HelpCircle },
      ]
    : [
        { path: '/', label: 'Dashboard', icon: Activity },
        { path: '/clinical', label: 'Clinical Decision', icon: Stethoscope },
        { path: '/patients/all', label: 'Patients', icon: Users },
        { path: '/collaboration', label: 'Collaboration', icon: Users },
        { path: '/ai-insights', label: 'AI Insights', icon: Activity },
        { path: '/search', label: 'Drug Search', icon: Search },
        { path: '/interactions', label: 'Interactions', icon: AlertTriangle },
        { path: '/genomics', label: 'Genomics', icon: Dna },
        { path: '/regimens', label: 'Regimens', icon: FileText },
        { path: '/curated', label: 'Curated', icon: FileText },
        { path: '/trials', label: 'Trials', icon: FileText },
        { path: '/protocols', label: 'Protocols', icon: FileText },
        { path: '/help', label: 'Help', icon: HelpCircle },
      ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">OncoSafeRx</h1>
                <p className="text-xs text-gray-500">Precision Oncology Platform</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {path === '/curated' && curatedCount !== null && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {curatedCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Account / Auth controls */}
          <div className="hidden md:flex items-center gap-3 relative" ref={accountRef}>
            {state.isAuthenticated && state.user ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <button
                  className="inline-flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100"
                  onClick={() => setAccountOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                >
                  {/* Avatar */}
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-[11px]">
                    {(state.user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[160px]" title={state.user.email}>{state.user.email}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-3 py-2 text-xs text-gray-700 border-b flex items-center justify-between">
                      <span className="inline-flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="truncate max-w-[140px]" title={state.user.email}>{state.user.email}</span>
                      </span>
                      <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                        {String(state.user.role || 'user')}
                      </span>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500 border-b">
                      {hasSupabaseSession ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Supabase session</span>
                      ) : (
                        canShowSignIn && (
                          <Link
                            to={`/auth?next=${encodeURIComponent(location.pathname)}`}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            title="Sign in via Supabase"
                            onClick={() => setAccountOpen(false)}
                          >
                            <LogIn className="w-3.5 h-3.5" /> Sign in
                          </Link>
                        )
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/auth-diagnostics"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setAccountOpen(false)}
                      >
                        Auth Diagnostics
                      </Link>
                    </div>
                    <div className="border-t py-1">
                      <button
                        onClick={() => { actions.logout(); setAccountOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              canShowSignIn ? (
                <Link
                  to={`/auth?next=${encodeURIComponent(location.pathname)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Sign in via Supabase"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              ) : null
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(path)
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="mt-2 border-t pt-2">
              {state.isAuthenticated && state.user ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 truncate max-w-[60%]" title={state.user.email}>{state.user.email}</div>
                  <button onClick={() => { actions.logout(); setMobileMenuOpen(false); }} className="px-3 py-1.5 text-sm bg-gray-100 rounded">Logout</button>
                </div>
              ) : (
                <Link to={`/auth?next=${encodeURIComponent(location.pathname)}`} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm bg-blue-600 text-white rounded">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
