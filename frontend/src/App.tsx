import React, { useEffect } from 'react';
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
import Dashboard from './pages/Dashboard';
import DrugSearch from './pages/DrugSearch';
import InteractionChecker from './components/Interactions/InteractionChecker';
import GenomicsAnalysis from './components/Genomics/GenomicsAnalysis';
import Protocols from './pages/Protocols';
import CuratedInteractions from './pages/CuratedInteractions';
import Regimens from './pages/Regimens';
import Trials from './pages/Trials';
import Patients from './pages/Patients';
import Collaboration from './pages/Collaboration';
import AIInsights from './pages/AIInsights';
import DrugDatabase from './pages/DrugDatabase';
import Analytics from './pages/Analytics';
import AIRecommendations from './pages/AIRecommendations';
import EHRIntegration from './components/EHR/EHRIntegration';
import Help from './pages/Help';
import FeedbackAdmin from './pages/FeedbackAdmin';
import ClinicalDecisionSupport from './pages/ClinicalDecisionSupport';

function App() {
  useEffect(() => {
    // Initialize production-ready features
    SecurityManager.initialize();
    PerformanceMonitor.initialize();
    PWAManager.initialize();
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <PatientProvider>
          <SelectionProvider>
            <Layout>
          {/* Minimal visible header to confirm render */}
          <div className="text-xs text-gray-500 mb-2">Env: {appVersion()}</div>
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
