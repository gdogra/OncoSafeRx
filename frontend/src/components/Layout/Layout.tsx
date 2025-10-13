import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MobileLayout from '../Mobile/MobileLayout';
import FeedbackButton from '../Feedback/FeedbackButton';
import ComparisonTray from '../Comparison/ComparisonTray';
import SkipLinks from '../UI/SkipLinks';
ConnectivityStatus
import ConnectivityStatus from '../UI/ConnectivityStatus';
import ThemeToggle from '../UI/ThemeToggle';
import HealthBanner from '../System/HealthBanner';
import LogoutButton from '../Admin/LogoutButton';
import { useIsMobile } from '../../hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Use mobile layout for very small screens (< 640px)
  if (window.innerWidth < 640) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  return (
    <>
      {/* Skip Links for keyboard navigation */}
      <SkipLinks 
        links={[
          { href: '#main-content', label: 'Skip to main content' },
          { href: '#navigation', label: 'Skip to navigation' },
          { href: '#search', label: 'Skip to search' }
        ]}
      />
      
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobile ? sidebarOpen : sidebarExpanded} 
          onToggle={toggleSidebar} 
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        {isMobile && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">OncoSafeRx</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-10 text-right">
                <ConnectivityStatus compact />
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main id="main-content" className="flex-1 overflow-y-auto bg-gray-50" tabIndex={-1}>
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {/* Global connectivity widget for desktop */}
            {!isMobile && (
              <div className="flex justify-end items-center gap-3 mb-4">
                <ThemeToggle />
                <ConnectivityStatus />
              </div>
            )}
            {/* System health banner (auto-hides when healthy) */}
            <HealthBanner className="mb-4" />
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-500 text-center sm:text-left">
                © 2024 OncoSafeRx. Built for precision oncology and pharmacogenomics.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Global Feedback Button */}
      <FeedbackButton />
      
      {/* Drug Comparison Tray */}
      <ComparisonTray />

      {/* Auth path indicator (dev/debug) */}
      {String((import.meta as any)?.env?.VITE_SHOW_AUTH_PATH || '') === 'true' && (
        <div className="fixed bottom-3 left-3 z-50 text-xs text-gray-700 bg-white/90 border border-gray-200 rounded px-2 py-1 shadow-sm">
          {(() => {
            try {
              const raw = window.localStorage.getItem('osrx_auth_path');
              if (!raw) return 'Auth: n/a';
              const meta = JSON.parse(raw);
              return `Auth: ${meta.path} @ ${new Date(meta.at).toLocaleTimeString()}`;
            } catch {
              return 'Auth: n/a';
            }
          })()}
        </div>
      )}

      {/* Logout Button */}
      <LogoutButton />
    </div>
    </>
  );
};

export default Layout;
