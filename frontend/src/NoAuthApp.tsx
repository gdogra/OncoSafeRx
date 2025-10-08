import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import NoAuthLayout from './components/Layout/NoAuthLayout';
import ErrorBoundary from './components/ErrorBoundary';
import AccessibilityProvider from './components/Accessibility/AccessibilityProvider';
import SkipLink from './components/Accessibility/SkipLink';
import AccessibilityToolbar from './components/Accessibility/AccessibilityToolbar';

// Import all components directly to avoid Suspense issues
import Dashboard from './pages/Dashboard';
import DrugSearch from './pages/DrugSearch';
import InteractionChecker from './components/Interactions/InteractionChecker';
import GenomicsAnalysis from './components/Genomics/GenomicsAnalysis';
import ProtocolsAndRegimens from './pages/ProtocolsAndRegimens';
import CuratedInteractions from './pages/CuratedInteractions';
import AdvancedTrials from './pages/AdvancedTrials';
// import Patients from './pages/Patients';
import Collaboration from './pages/Collaboration';
import AIInsights from './pages/AIInsights';
import DrugDatabase from './pages/DrugDatabase';
import Analytics from './pages/Analytics';
import AIRecommendations from './pages/AIRecommendations';
import Help from './pages/Help';
import Research from './pages/Research';
import Profile from './pages/Profile';
import Testing from './pages/Testing';
import DrugSearchAndInteractions from './pages/DrugSearchAndInteractions';

// Import new groundbreaking AI features
import AITreatmentPlanner from './pages/AITreatmentPlanner';
import GenomicMatcher from './pages/GenomicMatcher';
import EfficacyScoring from './pages/EfficacyScoring';
import OutcomePredictor from './pages/OutcomePredictor';
import ClinicalTrialMatcher from './pages/ClinicalTrialMatcher';
import PracticeROI from './pages/PracticeROI';
import PatientJourney from './pages/PatientJourney';
import EvidenceAnalysis from './pages/EvidenceAnalysis';
import RiskAssessment from './pages/RiskAssessment';

const NoAuthApp: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AccessibilityProvider>
          <SkipLink />
          <PatientProvider>
            <SelectionProvider>
              <ComparisonProvider>
                <NoAuthLayout>
                  <Routes>
                    {/* All routes are now public - no authentication required */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/drugs" element={<DrugSearchAndInteractions />} />
                    <Route path="/search" element={<DrugSearchAndInteractions />} />
                    <Route path="/drug-search-interactions" element={<DrugSearchAndInteractions />} />
                    <Route path="/interactions" element={<DrugSearchAndInteractions />} />
                    <Route path="/curated" element={<CuratedInteractions />} />
                    <Route path="/protocols-regimens" element={<ProtocolsAndRegimens />} />
                    {/* Legacy routes for backwards compatibility */}
                    <Route path="/regimens" element={<ProtocolsAndRegimens />} />
                    <Route path="/protocols" element={<ProtocolsAndRegimens />} />
                    <Route path="/trials" element={<AdvancedTrials />} />
                    <Route path="/genomics" element={<GenomicsAnalysis />} />
                    <Route path="/patients" element={<ServerPatients />} />
                    <Route path="/collaboration" element={<Collaboration />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/ai-recommendations" element={<AIRecommendations />} />
                    <Route path="/database" element={<DrugDatabase />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/research" element={<Research />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/testing" element={<Testing />} />
                    
                    {/* New AI-Powered Features - First of their kind */}
                    <Route path="/ai-treatment-planner" element={<AITreatmentPlanner />} />
                    <Route path="/genomic-matcher" element={<GenomicMatcher />} />
                    <Route path="/efficacy-scoring" element={<EfficacyScoring />} />
                    <Route path="/outcome-predictor" element={<OutcomePredictor />} />
                    <Route path="/clinical-trial-matcher" element={<ClinicalTrialMatcher />} />
                    <Route path="/practice-roi" element={<PracticeROI />} />
                    <Route path="/patient-journey" element={<PatientJourney />} />
                    <Route path="/evidence-analysis" element={<EvidenceAnalysis />} />
                    <Route path="/risk-assessment" element={<RiskAssessment />} />
                    
                    {/* Catch-all redirect to dashboard */}
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
                  <AccessibilityToolbar />
                </NoAuthLayout>
              </ComparisonProvider>
            </SelectionProvider>
          </PatientProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default NoAuthApp;
