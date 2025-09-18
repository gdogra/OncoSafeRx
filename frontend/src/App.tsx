import React from 'react';
import { appVersion } from './utils/env';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { SelectionProvider } from './context/SelectionContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import DrugSearch from './pages/DrugSearch';
import InteractionChecker from './components/Interactions/InteractionChecker';
import GenomicsAnalysis from './components/Genomics/GenomicsAnalysis';
import Protocols from './pages/Protocols';
import CuratedInteractions from './pages/CuratedInteractions';
import Regimens from './pages/Regimens';
import Trials from './pages/Trials';
import Patients from './pages/Patients';
import DrugDatabase from './pages/DrugDatabase';
import Analytics from './pages/Analytics';
import EHRIntegration from './components/EHR/EHRIntegration';
import Help from './pages/Help';

function App() {
  return (
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
              <Route path="/patients" element={<Patients />} />
              <Route path="/database" element={<DrugDatabase />} />
              <Route path="/ehr" element={<EHRIntegration />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </Layout>
        </SelectionProvider>
      </PatientProvider>
    </Router>
  );
}

export default App;
