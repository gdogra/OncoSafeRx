import React, { useState, useEffect } from 'react';
import NoAuthSidebar from './NoAuthSidebar';
import AIChat from '../Help/AIChat';
import { useIsMobile } from '../../hooks/useResponsive';

interface NoAuthLayoutProps {
  children: React.ReactNode;
}

const NoAuthLayout: React.FC<NoAuthLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

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
      <NoAuthSidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />

      {/* Main content */}
      <div className={`min-h-screen transition-all duration-300 ${isMobile ? 'pl-0' : sidebarExpanded ? 'pl-64' : 'pl-16'}`}>
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
          <div className="h-full p-6">
            {children}
            {/* Global AI Chat for public/Evidence Explorer */}
            <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
          </div>
        </main>
      </div>
    </div>
    {/* Floating Chat Button (NoAuth) */}
    {!chatOpen && (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
        title="Chat with AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7.5 8.25h9m-9 3h6m4.5 2.25a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="text-sm">Chat</span>
      </button>
    )}
  );
};

export default NoAuthLayout;
