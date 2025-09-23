import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  Dna, 
  FileText, 
  HelpCircle, 
  Users, 
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Pill,
  TestTube,
  BookOpen,
  BarChart3,
  Heart,
  Clipboard,
  GraduationCap
} from 'lucide-react';

interface NoAuthSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const NoAuthSidebar: React.FC<NoAuthSidebarProps> = ({ isOpen, onToggle, expanded, onExpandedChange }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // All navigation items - no role restrictions
  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: Activity,
      description: 'Overview and quick access'
    },
    {
      label: 'Drug Search & Interactions',
      path: '/drug-search-interactions',
      icon: Stethoscope,
      description: 'Search drugs and check interactions'
    },
    {
      label: 'Genomics',
      path: '/genomics',
      icon: Dna,
      description: 'Pharmacogenomic analysis'
    },
    {
      label: 'Protocols & Regimens',
      path: '/protocols-regimens',
      icon: FileText,
      description: 'Treatment protocols & dosing regimens'
    },
    {
      label: 'Curated Data',
      path: '/curated',
      icon: BookOpen,
      description: 'Curated interactions'
    },
    {
      label: 'AI Clinical Trials',
      path: '/trials',
      icon: TestTube,
      description: 'AI-powered trial matching & eligibility'
    },
    {
      label: 'Patients',
      path: '/patients',
      icon: Users,
      description: 'Patient management'
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      description: 'Usage analytics'
    },
    {
      label: 'AI Insights',
      path: '/ai-insights',
      icon: GraduationCap,
      description: 'AI-powered insights'
    },
    {
      label: 'Research',
      path: '/research',
      icon: Heart,
      description: 'Research tools'
    },
    {
      label: 'Help',
      path: '/help',
      icon: HelpCircle,
      description: 'Help and documentation'
    }
  ];

  const toggleExpanded = () => onExpandedChange(!expanded);

  return (
    <aside className={`
      fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-lg
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${expanded ? 'w-64' : 'w-16'}
      lg:translate-x-0
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`flex items-center space-x-3 ${!expanded && 'justify-center'}`}>
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {expanded && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">OncoSafeRx</h1>
                <p className="text-xs text-gray-500">Precision Oncology</p>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleExpanded}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                      ${active
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      ${!expanded && 'justify-center'}
                    `}
                    title={!expanded ? item.label : undefined}
                  >
                    <Icon className={`w-5 h-5 ${expanded ? 'mr-3' : ''} ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                    {expanded && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className={`${!expanded && 'text-center'}`}>
            {expanded ? (
              <div className="text-xs text-gray-500">
                <p>OncoSafeRx v1.0</p>
                <p>No authentication required</p>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <Stethoscope className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NoAuthSidebar;