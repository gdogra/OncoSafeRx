import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SimpleAuthProvider } from './context/SimpleAuthContext';
import SimpleProtectedRoute from './components/Auth/SimpleProtectedRoute';
import Layout from './components/Layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const SimpleAuth = lazy(() => import('./pages/SimpleAuth'));

const SimpleApp: React.FC = () => {
  return (
    <Router>
      <SimpleAuthProvider>
        <Suspense fallback={<div className="p-4 text-sm text-gray-500">Loading…</div>}>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<SimpleAuth />} />
            
            {/* Protected route */}
            <Route path="/" element={
              <SimpleProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </SimpleProtectedRoute>
            } />
            
            {/* Catch-all redirect to dashboard */}
            <Route path="*" element={
              <SimpleProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </SimpleProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </SimpleAuthProvider>
    </Router>
  );
};

export default SimpleApp;