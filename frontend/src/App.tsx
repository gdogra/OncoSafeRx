import React, { useEffect, Suspense, lazy } from 'react';
import { appVersion } from './utils/env';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import SecurityManager from './utils/security';
import PerformanceMonitor from './utils/performance';
import PWAManager from './utils/pwa';
import Layout from './components/Layout/Layout';
import FeedbackButton from './components/Feedback/FeedbackButton';
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

function App() {
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
        <PatientProvider>
          <SelectionProvider>
            <Layout>
              {/* Minimal visible header to confirm render */}
              <div className="text-xs text-gray-500 mb-2">Env: {appVersion()}</div>
              <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading…</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/search" element={<DrugSearch />} />
                  <Route path="/interactions" element={<InteractionChecker />} />
                  <Route path="/curated" element={<CuratedInteractions />} />
                  <Route path="/regimens" element={<Regimens />} />
                  <Route path="/trials" element={<Trials />} />
                  <Route path="/genomics" element={<GenomicsAnalysis />} />
                  <Route path="/protocols" element={<Protocols />} />
                  <Route path="/clinical" element={<ClinicalDecisionSupport />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/collaboration" element={<Collaboration />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/database" element={<DrugDatabase />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/ai" element={<AIRecommendations />} />
                  <Route path="/ehr" element={<EHRIntegration />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/admin/feedback" element={<FeedbackAdmin />} />
                </Routes>
              </Suspense>
            </Layout>
            
            {/* Global Feedback Button */}
            <FeedbackButton />
          </SelectionProvider>
        </PatientProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
