import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import DrugSearch from './pages/DrugSearch';
import InteractionChecker from './components/Interactions/InteractionChecker';
import GenomicsAnalysis from './components/Genomics/GenomicsAnalysis';
import Protocols from './pages/Protocols';
import CuratedInteractions from './pages/CuratedInteractions';
import Regimens from './pages/Regimens';
import Trials from './pages/Trials';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<DrugSearch />} />
          <Route path="/interactions" element={<InteractionChecker />} />
          <Route path="/curated" element={<CuratedInteractions />} />
          <Route path="/regimens" element={<Regimens />} />
          <Route path="/trials" element={<Trials />} />
          <Route path="/genomics" element={<GenomicsAnalysis />} />
          <Route path="/protocols" element={<Protocols />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
