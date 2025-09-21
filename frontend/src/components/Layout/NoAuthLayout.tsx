import React, { useState, useEffect } from 'react';
import NoAuthSidebar from './NoAuthSidebar';
import { useIsMobile } from '../../hooks/useResponsive';

interface NoAuthLayoutProps {
  children: React.ReactNode;
}

const NoAuthLayout: React.FC<NoAuthLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <NoAuthSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main content */}
      <div className="lg:pl-16 xl:pl-64">
        {/* Mobile header */}
        {isMobile && (
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">OncoSafeRx</h1>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NoAuthLayout;