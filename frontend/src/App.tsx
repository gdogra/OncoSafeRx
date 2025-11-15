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
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DrugSearch = lazy(() => import('./pages/DrugSearch'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ClinicalLandingPage = lazy(() => import('./pages/ClinicalLandingPage'));
const AuthenticatedRoute = lazy(() => import('./components/Auth/AuthenticatedRoute'));
const CompetitiveAdvantage = lazy(() => import('./pages/CompetitiveAdvantage'));
const ClinicalTrials = lazy(() => import('./pages/ClinicalTrials'));
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
const AdvancedAIDashboard = lazy(() => import('./pages/AdvancedAIDashboard'));
const EHRIntegration = lazy(() => import('./components/EHR/EHRIntegration'));
const Help = lazy(() => import('./pages/Help'));
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
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthDebug = lazy(() => import('./pages/AuthDebug'));
const ForceLogout = lazy(() => import('./pages/ForceLogout'));
const AuthEmailConfirm = lazy(() => import('./pages/AuthEmailConfirm'));
const AuthCheckEmail = lazy(() => import('./pages/AuthCheckEmail'));
const AuthOtpVerify = lazy(() => import('./pages/AuthOtpVerify'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// Patient-specific components
const MyMedications = lazy(() => import('./pages/MyMedications'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));
const CarePlan = lazy(() => import('./pages/CarePlan'));
const PatientEducation = lazy(() => import('./pages/PatientEducation'));
const SideEffects = lazy(() => import('./pages/SideEffects'));
const PatientSupport = lazy(() => import('./pages/PatientSupport'));
const CareManagement = lazy(() => import('./pages/CareManagement'));
const PatientSuccessStories = lazy(() => import('./pages/PatientSuccessStories'));
const ArticleUnderstandingDiagnosis = lazy(() => import('./pages/ArticleUnderstandingDiagnosis'));
const ChemoSideEffectsVideo = lazy(() => import('./pages/ChemoSideEffectsVideo'));
const NutritionDuringTreatmentPDF = lazy(() => import('./pages/NutritionDuringTreatmentPDF'));
const MeditationInteractive = lazy(() => import('./pages/MeditationInteractive'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const UserAdmin = lazy(() => import('./pages/UserAdmin'));
const AuditLogViewer = lazy(() => import('./pages/AuditLogViewer'));
const AdminSystemHealth = lazy(() => import('./pages/AdminSystemHealth'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminTrialAnalytics = lazy(() => import('./pages/AdminTrialAnalytics'));
const EnterpriseAIDashboard = lazy(() => import('./pages/EnterpriseAIDashboard'));
const FeedbackAdmin = lazy(() => import('./pages/FeedbackAdmin'));
const AdminConsole = lazy(() => import('./components/Admin/AdminConsole'));
const AdminHome = lazy(() => import('./pages/AdminHome'));
const AdminAuthDiagnostics = lazy(() => import('./pages/AdminAuthDiagnostics'));
const AdminOnboardingAnalytics = lazy(() => import('./pages/AdminOnboardingAnalytics'));
const FHIRPatients = lazy(() => import('./pages/FHIRPatients'));
const ArticleLabResults = lazy(() => import('./pages/ArticleLabResults'));
const VideoSupportNetwork = lazy(() => import('./pages/VideoSupportNetwork'));

// Advanced Patient Portal Components
const EnhancedPatientPortal = lazy(() => import('./components/Patient/EnhancedPatientPortal'));
const GenomicJourneyTracker = lazy(() => import('./components/Genomics/GenomicJourneyTracker'));
const SymptomIntelligencePlatform = lazy(() => import('./components/Symptoms/SymptomIntelligencePlatform'));
const DigitalBiomarkersTracker = lazy(() => import('./components/Monitoring/DigitalBiomarkersTracker'));
const GeneticTwinNetwork = lazy(() => import('./components/Community/GeneticTwinNetwork'));
const TreatmentSimulationLab = lazy(() => import('./components/Treatment/TreatmentSimulationLab'));
const MedicationIntelligenceEngine = lazy(() => import('./components/Medication/MedicationIntelligenceEngine'));
const ResearchParticipationHub = lazy(() => import('./components/Research/ResearchParticipationHub'));

// Advanced Care & Collaboration Components
const CareCoordinationHub = lazy(() => import('./components/Care/CareCoordinationHub'));
const RealTimeCollaborationPlatform = lazy(() => import('./components/Collaboration/RealTimeCollaborationPlatform'));
const PredictiveAnalyticsDashboard = lazy(() => import('./components/Analytics/PredictiveAnalyticsDashboard'));

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
const TokenDebug = lazy(() => import('./pages/TokenDebug'));
const Biostatistics = lazy(() => import('./pages/Biostatistics'));
const MultiDatabaseSearch = lazy(() => import('./pages/MultiDatabaseSearch'));
const EvidenceAnalysis = lazy(() => import('./pages/EvidenceAnalysis'));
const DrugIntelligenceIntegrator = lazy(() => import('./components/DrugIntelligenceIntegrator'));

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Initializing...</p>
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
            <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading…</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth-old" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/signup" element={<AuthPage />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/auth/confirm" element={<AuthEmailConfirm />} />
                <Route path="/auth/check-email" element={<AuthCheckEmail />} />
                <Route path="/auth/verify-otp" element={<AuthOtpVerify />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/logout" element={<Logout />} />
                {isDev && <Route path="/auth-debug" element={<AuthDebug />} />}
                <Route path="/force-logout" element={<ForceLogout />} />
                <Route path="/env-check" element={<EnvCheck />} />
                
                {/* Emergency/debug routes only in development */}
                {isDev && (
                  <Route path="/emergency-debug" element={
                    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Emergency Debug</h1>
                        <p className="text-gray-600 mb-4">Bypasses all authentication logic</p>
                        <div className="space-y-2">
                          <div className="text-sm"><strong>URL:</strong> {window.location.href}</div>
                          <div className="text-sm"><strong>Path:</strong> {window.location.pathname}</div>
                        </div>
                      </div>
                    </div>
                  } />
                )}
                
                
                {/* Simple test route (dev only) */}
                {isDev && (
                  <Route path="/test-admin" element={
                    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                      <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Route Working!</h1>
                        <p className="text-gray-600">This confirms routing is working.</p>
                      </div>
                    </div>
                  } />
                )}
                
                {/* Visitor analytics is a real feature; keep gated by permission */}
                <Route path="/visitor-analytics" element={
                  <ProtectedRoute requiredPermission="view_visitor_analytics">
                    <Layout>
                      <VisitorAnalyticsDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {isDev && (
                  <Route path="/debug-routing" element={
                    <ProtectedRoute>
                      <Layout>
                        <RoutingTest />
                      </Layout>
                    </ProtectedRoute>
                  } />
                )}
                
                {isDev && (
                  <Route path="/debug-tokens" element={
                    <ProtectedRoute>
                      <Layout>
                        <TokenDebug />
                      </Layout>
                    </ProtectedRoute>
                  } />
                )}
                

                {/* Protected routes */}
                {/* Landing page routes - Clinical focus */}
                <Route path="/landing" element={<ClinicalLandingPage />} />
                <Route path="/clinical" element={<ClinicalLandingPage />} />
                <Route path="/home" element={<LandingPage />} />
                
                {/* Competitive Advantage Features */}
                <Route path="/competitive-advantage" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CompetitiveAdvantage />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/clinical-trials" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ClinicalTrials />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/" element={<AuthenticatedRoute />} />
                <Route path="/dashboard" element={
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
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver']}>
                    <Layout>
                      <InteractionChecker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/curated" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver']}>
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
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver']}>
                    <Layout>
                      <Trials />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse', 'student']}>
                    <Layout>
                      <PatientEducation />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/stories" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <PatientSuccessStories />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/understanding-diagnosis" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <ArticleUnderstandingDiagnosis />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/video/chemo-side-effects" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <ChemoSideEffectsVideo />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/pdf/nutrition-during-treatment" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <NutritionDuringTreatmentPDF />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/settings/notifications" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <NotificationSettings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredPermission="admin_console_access">
                    <Layout>
                      <AdminHome />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredPermission="manage_users">
                    <Layout>
                      <UserAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/audit" element={
                  <ProtectedRoute requiredPermission="view_audit_logs">
                    <Layout>
                      <AuditLogViewer />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/health" element={
                  <ProtectedRoute requiredPermission="admin_console_access">
                    <Layout>
                      <AdminSystemHealth />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/settings" element={
                  <ProtectedRoute requiredPermission="manage_system_settings">
                    <Layout>
                      <AdminSettings />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/trial-analytics" element={
                  <ProtectedRoute requiredPermission="admin_console_access">
                    <Layout>
                      <AdminTrialAnalytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/enterprise/ai-dashboard" element={
                  <ProtectedRoute requiredPermission="admin_console_access">
                    <Layout>
                      <EnterpriseAIDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/advanced-ai" element={
                  <ProtectedRoute>
                    <Layout>
                      <AdvancedAIDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/admin/feedback" element={
                  <ProtectedRoute requiredPermission="manage_feedback">
                    <Layout>
                      <FeedbackAdmin />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/onboarding" element={
                  <ProtectedRoute requiredPermission="view_visitor_analytics">
                    <Layout>
                      <AdminOnboardingAnalytics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/console" element={
                  <ProtectedRoute requiredPermission="admin_console_access">
                    <Layout>
                      <AdminConsole />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/admin/auth-diagnostics" element={
                  <ProtectedRoute>
                    <Layout>
                      <AdminAuthDiagnostics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/article/lab-results" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <ArticleLabResults />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/video/support-network" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <VideoSupportNetwork />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education/interactive/meditation" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <MeditationInteractive />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/genomics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher', 'patient']}>
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
                  <ProtectedRoute requiredPermission="view_visitor_analytics">
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
                {/* FHIR Patients Debug */}
                <Route path="/fhir-patients" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <FHIRPatients />
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
                <Route path="/my-profile" element={
                  <ProtectedRoute requiredRole={['patient']}>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-medications" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <MyMedications />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/my-appointments" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <MyAppointments />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/care-plan" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <CarePlan />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/care-management" element={
                  <ProtectedRoute requiredRole={['caregiver']}>
                    <Layout>
                      <CareManagement />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/education" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <PatientEducation />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <PatientSupport />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Education & Support routes */}
                <Route path="/drug-lookup" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <DrugSearch />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/side-effects" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <SideEffects />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/educational-resources" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver']}>
                    <Layout>
                      <PatientEducation />
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
                <Route path="/biostatistics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher', 'student']}>
                    <Layout>
                      <Biostatistics />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/multi-database-search" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <MultiDatabaseSearch />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/evidence-analysis" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <EvidenceAnalysis />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/drug-intelligence" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher', 'student']}>
                    <Layout>
                      <DrugIntelligenceIntegrator />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Advanced Patient Portal Routes */}
                <Route path="/patient-portal" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <EnhancedPatientPortal />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/genomic-journey" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'researcher']}>
                    <Layout>
                      <GenomicJourneyTracker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/symptom-intelligence" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <SymptomIntelligencePlatform />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/biomarkers-tracking" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <DigitalBiomarkersTracker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/genetic-twins" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'researcher']}>
                    <Layout>
                      <GeneticTwinNetwork />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/treatment-simulation" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist']}>
                    <Layout>
                      <TreatmentSimulationLab />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/medication-intelligence" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'pharmacist', 'nurse']}>
                    <Layout>
                      <MedicationIntelligenceEngine />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/research-participation" element={
                  <ProtectedRoute requiredRole={['patient', 'caregiver', 'oncologist', 'researcher']}>
                    <Layout>
                      <ResearchParticipationHub />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Advanced Care & Collaboration Routes */}
                <Route path="/care-coordination" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <CareCoordinationHub />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/collaboration-platform" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'nurse', 'researcher']}>
                    <Layout>
                      <RealTimeCollaborationPlatform />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/predictive-analytics" element={
                  <ProtectedRoute requiredRole={['oncologist', 'pharmacist', 'researcher', 'admin']}>
                    <Layout>
                      <PredictiveAnalyticsDashboard />
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
