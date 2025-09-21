import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import NoAuthLayout from './components/Layout/NoAuthLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
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
const Help = lazy(() => import('./pages/Help'));
const Research = lazy(() => import('./pages/Research'));
const Profile = lazy(() => import('./pages/Profile'));
const Testing = lazy(() => import('./pages/Testing'));

const NoAuthApp: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <PatientProvider>
          <SelectionProvider>
            <ComparisonProvider>
              <NoAuthLayout>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-gray-600">Loading...</p>
                    </div>
                  </div>
                }>
                  <Routes>
                    {/* All routes are now public - no authentication required */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/drugs" element={<DrugSearch />} />
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
                </Suspense>
              </NoAuthLayout>
            </ComparisonProvider>
          </SelectionProvider>
        </PatientProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default NoAuthApp;