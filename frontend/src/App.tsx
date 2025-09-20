import React, { useEffect, Suspense, lazy } from 'react';
import { appVersion } from './utils/env';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import ErrorBoundary from './components/ErrorBoundary';
import SecurityManager from './utils/security';
import PerformanceMonitor from './utils/performance';
import PWAManager from './utils/pwa';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import FeedbackButton from './components/Feedback/FeedbackButton';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DrugSearch = lazy(() => import('./pages/DrugSearch'));
const InteractionChecker = lazy(() => import('./components/Interactions/InteractionChecker'));
const GenomicsAnalysis = lazy(() => import('./components/Genomics/GenomicsAnalysis'));
const Protocols = lazy(() => import('./pages/Protocols'));
const CuratedInteractions = lazy(() => import('./pages/CuratedInteractions'));
const Regimens = lazy(() => import('./pages/Regimens'));
const Trials = lazy(() => import('./pages/Trials'));
const Patients = lazy(() => import('./pages/Patients'));
const Collaboration = lazy(() => import('./pages/Collaboration'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const DrugDatabase = lazy(() => import('./pages/DrugDatabase'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const EHRIntegration = lazy(() => import('./components/EHR/EHRIntegration'));
const Help = lazy(() => import('./pages/Help'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const ClinicalDecisionSupport = lazy(() => import('./pages/ClinicalDecisionSupport'));
const Research = lazy(() => import('./pages/Research'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Testing = lazy(() => import('./pages/Testing'));

function App() {
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    // Initialize production-ready features
    SecurityManager.initialize();
    PerformanceMonitor.initialize();
    PWAManager.initialize();

    // Initialize Sentry (optional, behind env)
    const dsn = (import.meta as any)?.env?.VITE_SENTRY_DSN;
    if (dsn) {
      import('./utils/sentry').then((m) => m.initSentry(dsn)).catch(() => {});
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <PatientProvider>
            <SelectionProvider>
              <ComparisonProvider>
            <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading…</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <Layout>
                      <DrugSearch />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/interactions" element={
                  <ProtectedRoute>
                    <Layout>
                      <InteractionChecker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/curated" element={
                  <ProtectedRoute>
                    <Layout>
                      <CuratedInteractions />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/regimens" element={
                  <ProtectedRoute requiredRole={['oncologist']}>
                    <Layout>
                      <Regimens />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/trials" element={
                  <ProtectedRoute>
                    <Layout>
                      <Trials />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/genomics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher']}>
                    <Layout>
                      <GenomicsAnalysis />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/protocols" element={
                  <ProtectedRoute>
                    <Layout>
                      <Protocols />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clinical" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <ClinicalDecisionSupport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/patients" element={
                  <ProtectedRoute>
                    <Layout>
                      <Patients />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/collaboration" element={
                  <ProtectedRoute>
                    <Layout>
                      <Collaboration />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ai-insights" element={
                  <ProtectedRoute>
                    <Layout>
                      <AIInsights />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/database" element={
                  <ProtectedRoute>
                    <Layout>
                      <DrugDatabase />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher']}>
                    <Layout>
                      <Analytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/research" element={
                  <ProtectedRoute requiredRole={['researcher', 'oncologist']}>
                    <Layout>
                      <Research />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ai" element={
                  <ProtectedRoute>
                    <Layout>
                      <AIRecommendations />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ehr" element={
                  <ProtectedRoute>
                    <Layout>
                      <EHRIntegration />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/feedback" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist']}>
                    <Layout>
                      <FeedbackAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/testing" element={
                  <ProtectedRoute>
                    <Layout>
                      <Testing />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
            </ComparisonProvider>
            </SelectionProvider>
          </PatientProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
