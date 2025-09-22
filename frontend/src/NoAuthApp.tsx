import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import NoAuthLayout from './components/Layout/NoAuthLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Import all components directly to avoid Suspense issues
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
import Help from './pages/Help';
import Research from './pages/Research';
import Profile from './pages/Profile';
import Testing from './pages/Testing';

const NoAuthApp: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <PatientProvider>
          <SelectionProvider>
            <ComparisonProvider>
              <NoAuthLayout>
                <Routes>
                    {/* All routes are now public - no authentication required */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/drugs" element={<DrugSearch />} />
                    <Route path="/search" element={<DrugSearch />} />
                    <Route path="/interactions" element={<InteractionChecker />} />
                    <Route path="/curated" element={<CuratedInteractions />} />
                    <Route path="/regimens" element={<Regimens />} />
                    <Route path="/trials" element={<Trials />} />
                    <Route path="/genomics" element={<GenomicsAnalysis />} />
                    <Route path="/protocols" element={<Protocols />} />
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/collaboration" element={<Collaboration />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/ai-recommendations" element={<AIRecommendations />} />
                    <Route path="/database" element={<DrugDatabase />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/research" element={<Research />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/testing" element={<Testing />} />
                    
                    {/* Catch-all redirect to dashboard */}
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
              </NoAuthLayout>
            </ComparisonProvider>
          </SelectionProvider>
        </PatientProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default NoAuthApp;