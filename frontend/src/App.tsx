import React, { useEffect, Suspense, lazy } from 'react';
// Deployment test - timestamp: 2025-10-09-21:20 UTC - Fix MIME type errors
import { appVersion } from './utils/env';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import ErrorBoundary from './components/ErrorBoundary';
import EnvDiagnosticsBanner from './components/System/EnvDiagnosticsBanner';
import SessionRestorer from './components/System/SessionRestorer';
import { ToastProvider } from './components/UI/Toast';
import ScientificTheme from './components/Scientific/ScientificTheme';
import SecurityManager from './utils/security';
import PerformanceMonitor from './utils/performance';
import PWAManager from './utils/pwa';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import FeedbackButton from './components/Feedback/FeedbackButton';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import setupErrorSuppression from './utils/errorSuppression';
import { checkForUpdates } from './utils/versionCheck';
import { setupConsoleFilter } from './utils/consoleFilter';
// ── Core pages ────────────────────────────────────────────────
const DrugSearch = lazy(() => import('./pages/DrugSearch'));
const InteractionChecker = lazy(() => import('./components/Interactions/InteractionChecker'));
const CuratedInteractions = lazy(() => import('./pages/CuratedInteractions'));
const GenomicsAnalysis = lazy(() => import('./components/Genomics/GenomicsAnalysis'));
const PrecisionMedicine = lazy(() => import('./pages/PrecisionMedicine'));
const Trials = lazy(() => import('./pages/Trials'));
const ClinicalTrials = lazy(() => import('./pages/ClinicalTrials'));
const Profile = lazy(() => import('./pages/Profile'));

// ── Auth pages ───────────────────────────────────────────────
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AuthSelectRole = lazy(() => import('./pages/AuthSelectRole'));
const AuthCheckEmail = lazy(() => import('./pages/AuthCheckEmail'));
const AuthOtpVerify = lazy(() => import('./pages/AuthOtpVerify'));
const AuthEmailConfirm = lazy(() => import('./pages/AuthEmailConfirm'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForceLogout = lazy(() => import('./pages/ForceLogout'));
const Logout = lazy(() => import('./pages/Logout'));

// ── Admin ────────────────────────────────────────────────────
const AdminHome = lazy(() => import('./pages/AdminHome'));
const UserAdmin = lazy(() => import('./pages/UserAdmin'));

// ── Legal + utility ──────────────────────────────────────────
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ClinicalLandingPage = lazy(() => import('./pages/ClinicalLandingPage'));

// Feature flag to disable patient UI routes (build-time)

// Component that handles initialization inside AuthProvider
function AppWithAuth() {
  // Get auth state to check if initialization is complete
  const { state } = useAuth();
  // Initialize global keyboard shortcuts (inside AuthProvider)
  useGlobalKeyboardShortcuts();
  
  // Initialize visitor tracking (must be called before any conditional returns)
  useVisitorTracking();
  
  // Setup console filter for development mode
  React.useEffect(() => {
    setupConsoleFilter();
  }, []);
  
  // Wait for AuthProvider to finish initialization before rendering
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    );
  }
  
  const isDev = (import.meta as any)?.env?.MODE !== 'production';

  return (
    <ScientificTheme>
      <ToastProvider>
        {/* DEPLOYMENT TEST: Fixed styling and role restrictions - v2.1 */}
        <PatientProvider>
          <SelectionProvider>
            <ComparisonProvider>
            <Suspense fallback={<div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading…</div>}>
              <Routes>
                {/* ── Public routes ──────────────────────────── */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/select-role" element={<AuthSelectRole />} />
                <Route path="/auth/check-email" element={<AuthCheckEmail />} />
                <Route path="/auth/otp-verify" element={<AuthOtpVerify />} />
                <Route path="/auth/email-confirm" element={<AuthEmailConfirm />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/force-logout" element={<ForceLogout />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/landing" element={<ClinicalLandingPage />} />
                <Route path="/terms-of-service" element={<Layout><TermsOfService /></Layout>} />
                <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />

                {/* ── Core app routes (interaction checker is the homepage) ── */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout><InteractionChecker /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout><InteractionChecker /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/interactions" element={
                  <ProtectedRoute>
                    <Layout><InteractionChecker /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Layout><DrugSearch /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/curated-interactions" element={
                  <ProtectedRoute>
                    <Layout><CuratedInteractions /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/curated" element={
                  <ProtectedRoute>
                    <Layout><CuratedInteractions /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/precision-medicine" element={
                  <ProtectedRoute>
                    <Layout><PrecisionMedicine /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/genomics" element={
                  <ProtectedRoute>
                    <Layout><GenomicsAnalysis /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/trials" element={
                  <ProtectedRoute>
                    <Layout><Trials /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clinical-trials" element={
                  <ProtectedRoute>
                    <Layout><ClinicalTrials /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout><Profile /></Layout>
                  </ProtectedRoute>
                } />

                {/* ── Admin routes ─────────────────────────── */}
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                    <Layout><AdminHome /></Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole={['admin', 'super_admin']}>
                    <Layout><UserAdmin /></Layout>
                  </ProtectedRoute>
                } />

                {/* ── 404 ─────────────────────────────────── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            </ComparisonProvider>
          </SelectionProvider>
        </PatientProvider>
      </ToastProvider>
    </ScientificTheme>
  );
}

// Component that handles keyboard shortcuts inside Router context
function AppWithRouter() {
  // Keyboard shortcuts moved into AppWithAuth to ensure AuthProvider is present

  // Persist and restore last route across refreshes
  const RoutePersistence: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Save path on change
    useEffect(() => {
      try {
        const path = location.pathname + (location.search || '');
        localStorage.setItem('osrx_last_path', path);
      } catch {}
    }, [location.pathname, location.search]);

    // Restore last path once per session
    useEffect(() => {
      try {
        const restored = sessionStorage.getItem('osrx_restored') === '1';
        if (restored) return;
        const current = location.pathname + (location.search || '');
        const last = localStorage.getItem('osrx_last_path') || '';
        // Do not override when navigating to admin or debug routes
        const ignore: RegExp[] = [/^\/auth(\/|$)?/, /^\/force-logout/, /^\/logout/, /^\/admin(\/|$)?/, /^\/debug/];
        // Only restore if current is a neutral entry route (root or dashboard)
        const isNeutral = /^\/$/.test(current) || /^\/dashboard(\/|$)?/.test(current);
        if (isNeutral && last && last !== current && !ignore.some(rx => rx.test(last))) {
          navigate(last, { replace: true });
        }
        sessionStorage.setItem('osrx_restored', '1');
      } catch {}
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
  };

  return (
    <AuthProvider>
      {/* SessionRestorer must be inside AuthProvider to access useAuth */}
      <SessionRestorer />
      <RoutePersistence />
      <AppWithAuth />
    </AuthProvider>
  );
}

function App() {
  // Restore full application UI with Router and providers
  useEffect(() => {
    // Initialize production-ready features
    SecurityManager.initialize();
    PerformanceMonitor.initialize();
    PWAManager.initialize();
    setupErrorSuppression();
    // Apply stored theme ASAP
    try {
      const stored = localStorage.getItem('osrx_theme');
      if (stored) {
        const root = document.documentElement;
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const useDark = stored === 'dark' || (stored === 'auto' && prefersDark);
        root.classList[useDark ? 'add' : 'remove']('dark');
        root.setAttribute('data-theme', stored || 'light');
      }
    } catch {}
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AppWithRouter />
      </Router>
    </ErrorBoundary>
  );
}
export default App;

// Force redeploy to fix MIME type errors - build cache issue
