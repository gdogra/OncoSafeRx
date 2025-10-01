import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Search, AlertTriangle, Dna, FileText, HelpCircle, Users, Stethoscope, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { interactionService } from '../../services/api';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, actions } = useAuth();
  const [hasSupabaseSession, setHasSupabaseSession] = useState<boolean>(false);

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

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Activity },
    { path: '/clinical', label: 'Clinical Decision', icon: Stethoscope },
    { path: '/patients', label: 'Patients', icon: Users },
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
          <div className="hidden md:flex items-center gap-3">
            {state.isAuthenticated && state.user ? (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <UserIcon className="w-4 h-4" />
                <span className="truncate max-w-[160px]" title={state.user.email}>{state.user.email}</span>
                {hasSupabaseSession ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Supabase</span>
                ) : (
                  <Link
                    to={`/auth?next=${encodeURIComponent(location.pathname)}`}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    title="Sign in via Supabase"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign in
                  </Link>
                )}
                <button
                  onClick={() => actions.logout()}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <Link
                to={`/auth?next=${encodeURIComponent(location.pathname)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                title="Sign in via Supabase"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
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
