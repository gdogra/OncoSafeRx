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
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DrugSearch = lazy(() => import('./pages/DrugSearch'));
const InteractionChecker = lazy(() => import('./components/Interactions/InteractionChecker'));
const GenomicsAnalysis = lazy(() => import('./components/Genomics/GenomicsAnalysis'));
const Protocols = lazy(() => import('./pages/Protocols'));
const CuratedInteractions = lazy(() => import('./pages/CuratedInteractions'));
const Regimens = lazy(() => import('./pages/Regimens'));
const Trials = lazy(() => import('./pages/Trials'));
// const Patients = lazy(() => import('./pages/EnhancedPatients'));
// const LegacyPatients = lazy(() => import('./pages/Patients'));
const ServerPatients = lazy(() => import('./pages/ServerPatients'));
const Collaboration = lazy(() => import('./pages/Collaboration'));
const AIInsights = lazy(() => import('./pages/AIInsights'));
const DrugDatabase = lazy(() => import('./pages/DrugDatabase'));
const Analytics = lazy(() => import('./pages/Analytics'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const AITreatmentPlanner = lazy(() => import('./pages/AITreatmentPlanner'));
const EHRIntegration = lazy(() => import('./components/EHR/EHRIntegration'));
const Help = lazy(() => import('./pages/Help'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const PatientProfilesDiagnostics = lazy(() => import('./pages/PatientProfilesDiagnostics'));
const AuthDiagnostics = lazy(() => import('./pages/AuthDiagnostics'));
const EnvCheck = lazy(() => import('./pages/EnvCheck'));
const ClinicalDecisionSupport = lazy(() => import('./pages/ClinicalDecisionSupport'));
const Research = lazy(() => import('./pages/Research'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Profile = lazy(() => import('./pages/Profile'));
const Testing = lazy(() => import('./pages/Testing'));
const Pain = lazy(() => import('./pages/Pain'));
const Logout = lazy(() => import('./pages/Logout'));
const AuthDebug = lazy(() => import('./pages/AuthDebug'));
const ForceLogout = lazy(() => import('./pages/ForceLogout'));

// Feature flag to disable patient UI routes (build-time)
const PATIENTS_DISABLED = String((import.meta as any)?.env?.VITE_PATIENTS_DISABLED || '').toLowerCase() === 'true';

// New Powerful AI Components
const ClinicalDecisionEngine = lazy(() => import('./components/AI/ClinicalDecisionEngine'));
const DrugSafetyAlertSystem = lazy(() => import('./components/Safety/DrugSafetyAlertSystem'));
const MLAnalyticsDashboard = lazy(() => import('./components/Analytics/MLAnalyticsDashboard'));
const ClinicalCommunicationHub = lazy(() => import('./components/Communication/ClinicalCommunicationHub'));
const IoTMonitoringSystem = lazy(() => import('./components/IoT/IoTMonitoringSystem'));
const TreatmentOutcomesEngine = lazy(() => import('./components/Predictive/TreatmentOutcomesEngine'));
const OpioidRiskReport = lazy(() => import('./components/Pain/OpioidRiskReport'));
const RealTimeClinicalSupport = lazy(() => import('./components/Clinical/RealTimeClinicalSupport'));
const EHRIntegrationDashboard = lazy(() => import('./components/Integration/EHRIntegrationDashboard'));
const RegulatoryComplianceSystem = lazy(() => import('./components/Compliance/RegulatoryComplianceSystem'));
const EvidenceBasedProtocolsSystem = lazy(() => import('./components/Protocols/EvidenceBasedProtocolsSystem'));
const LaboratoryIntegrationSystem = lazy(() => import('./components/Laboratory/LaboratoryIntegrationSystem'));
const AdvancedWorkflowSystem = lazy(() => import('./components/Workflow/AdvancedWorkflowSystem'));
const VisitorAnalyticsDashboard = lazy(() => import('./components/Analytics/VisitorAnalyticsDashboard'));
const PatientJourney = lazy(() => import('./pages/PatientJourney'));
const RoutingTest = lazy(() => import('./components/Debug/RoutingTest'));

// Component that handles initialization inside AuthProvider
function AppWithAuth() {
  // Get auth state to check if initialization is complete
  const { state } = useAuth();
  
  // Initialize visitor tracking (must be called before any conditional returns)
  useVisitorTracking();
  
  // Setup console filter for development mode
  React.useEffect(() => {
    setupConsoleFilter();
  }, []);
  
  // Wait for AuthProvider to finish initialization before rendering
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ToastProvider>
      <PatientProvider>
        <SelectionProvider>
          <ComparisonProvider>
            <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading…</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth-old" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/auth-debug" element={<AuthDebug />} />
                <Route path="/force-logout" element={<ForceLogout />} />
                <Route path="/env-check" element={<EnvCheck />} />
                
                {/* Emergency debug route - no auth logic */}
                <Route path="/emergency-debug" element={
                  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                      <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Emergency Debug</h1>
                      <p className="text-gray-600 mb-4">This route bypasses all authentication logic</p>
                      <div className="space-y-2">
                        <div className="text-sm"><strong>URL:</strong> {window.location.href}</div>
                        <div className="text-sm"><strong>Path:</strong> {window.location.pathname}</div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <a href="/auth" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Try /auth</a>
                        <a href="/logout" className="block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Try /logout</a>
                      </div>
                    </div>
                  </div>
                } />
                
                
                {/* Simple test route */}
                <Route path="/test-admin" element={
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Route Working!</h1>
                      <p className="text-gray-600">This confirms routing is working.</p>
                    </div>
                  </div>
                } />
                
                {/* Testing route - should appear BEFORE the dashboard route */}
                <Route path="/visitor-analytics" element={
                  <ProtectedRoute requiredPermission="view_visitor_analytics">
                    <Layout>
                      <VisitorAnalyticsDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/debug-routing" element={
                  <ProtectedRoute>
                    <Layout>
                      <RoutingTest />
                    </Layout>
                  </ProtectedRoute>
                } />
                

                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/search" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <DrugSearch />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/interactions" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <InteractionChecker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/curated" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
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
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
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
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
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
                <Route path="/ai-treatment-planner" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <AITreatmentPlanner />
                    </Layout>
                  </ProtectedRoute>
                } />
                {!PATIENTS_DISABLED && (
                  <>
                <Route path="/patients" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <ServerPatients />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/patients/all" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <ServerPatients />
                    </Layout>
                  </ProtectedRoute>
                } />
                  </>
                )}
                <Route path="/collaboration" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <Collaboration />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ai-insights" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <AIInsights />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/database" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
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
                <Route path="/diagnostics/patient-profiles" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher', 'admin']}>
                    <Layout>
                      <PatientProfilesDiagnostics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/pain" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <Pain />
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
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <AIRecommendations />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ehr" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
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
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/auth-diagnostics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <AuthDiagnostics />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Patient-specific routes */}
                <Route path="/my-care" element={
                  <ProtectedRoute requiredRole={['patient']}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-medications" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/care-management" element={
                  <ProtectedRoute requiredRole={['caregiver']}>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <Help />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* New Powerful AI Components Routes */}
                <Route path="/ai-decision-engine" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <ClinicalDecisionEngine />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/safety-alerts" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <DrugSafetyAlertSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ml-analytics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher']}>
                    <Layout>
                      <MLAnalyticsDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clinical-communication" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <ClinicalCommunicationHub />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/iot-monitoring" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <IoTMonitoringSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/predictive-outcomes" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher']}>
                    <Layout>
                      <TreatmentOutcomesEngine />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/opioid-risk-report" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <OpioidRiskReport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/real-time-support" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <RealTimeClinicalSupport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/ehr-integration" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <EHRIntegrationDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/regulatory-compliance" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <RegulatoryComplianceSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/evidence-protocols" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <EvidenceBasedProtocolsSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/evidence-analysis" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <EvidenceBasedProtocolsSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/patient-journey" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <PatientJourney />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/laboratory-integration" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <LaboratoryIntegrationSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/workflow-system" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <AdvancedWorkflowSystem />
                    </Layout>
                  </ProtectedRoute>
                } />
{/* Removed duplicate route - moved to top */}
                
                {/* Catch-all route for debugging - NO PROTECTED ROUTE */}
                <Route path="*" element={
                  <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                      <h1 className="text-2xl font-bold text-yellow-600 mb-4">🔍 Route Not Found</h1>
                      <p className="text-gray-600 mb-4">Current path: {window.location.pathname}</p>
                      <div className="space-y-2">
                        <a href="/auth" className="block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Go to Auth</a>
                        <a href="/force-logout" className="block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Force Logout</a>
                        <Link to="/" className="block px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">Dashboard</Link>
                      </div>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </ComparisonProvider>
        </SelectionProvider>
      </PatientProvider>
    </ToastProvider>
  );
}

// Component that handles keyboard shortcuts inside Router context
function AppWithRouter() {
  // Initialize global keyboard shortcuts (now inside Router context)
  useGlobalKeyboardShortcuts();

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
        const ignore: RegExp[] = [/^\/auth(\/|$)?/, /^\/force-logout/, /^\/logout/];
        if (last && last !== current && !ignore.some(rx => rx.test(last))) {
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
