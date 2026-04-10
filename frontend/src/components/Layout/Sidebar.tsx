import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, getRoleConfig, RolePermissions } from '../../utils/roleConfig';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { adminApi } from '../../utils/adminApi';
import { 
  Activity, 
  Search, 
  AlertTriangle, 
  Dna, 
  FileText, 
  HelpCircle, 
  Users, 
  Stethoscope,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Pill,
  BookOpen,
  BarChart3,
  UserCheck,
  Heart,
  Clipboard,
  GraduationCap,
  LogOut,
  Brain,
  Shield,
  TrendingUp,
  MessageSquare,
  Smartphone,
  Target,
  Calculator,
  Zap,
  Link2,
  Workflow,
  TestTube
} from 'lucide-react';
import Tooltip from '../UI/Tooltip';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state: authState, actions, roleConfig } = useAuth();
  const { user } = authState;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [adminBadges, setAdminBadges] = useState<{ users?: { total: number; active: number }; auditTotal?: number }>({});

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Keyboard navigation for sidebar
  const { containerRef } = useKeyboardNavigation({
    enabled: isOpen,
    onEscape: () => {
      if (isOpen && window.innerWidth < 1024) {
        onToggle();
      }
    }
  });

  const toggleGroup = (groupTitle: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupTitle)) {
      newCollapsed.delete(groupTitle);
    } else {
      newCollapsed.add(groupTitle);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Fetch small admin badges (users and audit totals) for admin/super_admin only
  useEffect(() => {
    let cancelled = false;
    const attemptedRef = { current: false } as { current: boolean };
    const hasAnyToken = () => {
      try { return !!JSON.parse(localStorage.getItem('osrx_auth_tokens') || '{}').access_token; } catch { return false; }
    };
    const load = async () => {
      if (attemptedRef.current) return; // avoid repeated retries on re-renders
      attemptedRef.current = true;
      try {
        if (!(user?.role === 'admin' || user?.role === 'super_admin')) return;
        if (!hasAnyToken()) return;
        const d = await adminApi.get('/api/admin/dashboard');
        if (d.ok) {
          const body = await d.json();
          if (!cancelled) setAdminBadges(prev => ({ ...prev, users: { total: body?.stats?.users?.total || 0, active: body?.stats?.users?.active || 0 } }));
        }
      } catch (e: any) {
        // Reduce console noise; optionally enable query-token fallback automatically in dev
        try { if ((import.meta as any)?.env?.MODE !== 'production') localStorage.setItem('osrx_allow_query_token','true'); } catch {}
      }
      try {
        if (!(user?.role === 'admin' || user?.role === 'super_admin')) return;
        if (!hasAnyToken()) return;
        const a = await adminApi.get('/api/admin/audit?page=1&limit=1');
        if (a.ok) {
          const body = await a.json();
          if (!cancelled) setAdminBadges(prev => ({ ...prev, auditTotal: body?.pagination?.total || 0 }));
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, [user?.role]);

  // Grouped navigation items with clear Information Architecture
  const getGroupedNavItems = () => {
    const allRoles = ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver', 'admin', 'super_admin'];
    const clinicalRoles = ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'admin', 'super_admin'];
    const adminRoles = ['admin', 'super_admin'];

    const groups = [
      {
        title: 'Drug Safety',
        items: [
          {
            path: '/',
            label: 'Interaction Checker',
            icon: AlertTriangle,
            description: 'Check drug-drug interactions',
            roles: allRoles,
            requiresPermission: null
          },
          {
            path: '/search',
            label: 'Drug Search',
            icon: Search,
            description: 'Search medications by name',
            roles: allRoles,
            requiresPermission: null
          },
          {
            path: '/curated-interactions',
            label: 'Known Interactions',
            icon: Shield,
            description: 'Curated interaction database',
            roles: allRoles,
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Precision Medicine',
        items: [
          {
            path: '/precision-medicine',
            label: 'Biomarker Matcher',
            icon: Target,
            description: 'Match biomarkers to therapies',
            roles: clinicalRoles,
            requiresPermission: null
          },
          {
            path: '/genomics',
            label: 'Pharmacogenomics',
            icon: Dna,
            description: 'PGx gene-drug guidelines',
            roles: clinicalRoles,
            requiresPermission: null
          },
          {
            path: '/trials',
            label: 'Clinical Trials',
            icon: TestTube,
            description: 'Find relevant trials',
            roles: allRoles,
            requiresPermission: null
          },
        ]
      },
      ...(adminRoles.includes(user?.role || '') ? [{
        title: 'Admin',
        items: [
          {
            path: '/admin',
            label: 'Admin Home',
            icon: SettingsIcon,
            description: 'System administration',
            roles: adminRoles,
            requiresPermission: null
          },
        ]
      }] : [])
    ];

    return groups;
  };

  const allowPublicRead = (() => {
    try {
      const env = String((import.meta as any)?.env?.VITE_ALLOW_PUBLIC_READ || '').toLowerCase() === 'true';
      const ls = localStorage.getItem('osrx_allow_public_read') === 'true';
      return env || ls;
    } catch { return false; }
  })();

  const getFilteredGroups = () => {
    // In public-read mode, show read-only nav for student role
    const effUser = user || (allowPublicRead ? ({ role: 'student' } as any) : null);
    if (!effUser) return [];
    
    return getGroupedNavItems().map(group => ({
      ...group,
      items: group.items
        .filter(Boolean as any)
        .filter((item: any) => {
        // Check if item is available for user's role
        if (!item.roles.includes(effUser.role)) return false;
        
        // Check permission if required
        if (item.requiresPermission && !hasPermission(effUser.role, item.requiresPermission as keyof RolePermissions)) {
          return false;
        }

        return true;
      })
    })).filter(group => group.items.length > 0); // Only show groups with items
  };

  const filteredGroups = getFilteredGroups();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-sm z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-60' : 'w-14'}
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link 
            to="/" 
            className={`flex items-center space-x-3 transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              roleConfig ? `bg-${roleConfig.primaryColor}-600` : 'bg-primary-600'
            }`}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">OncoSafeRx</h1>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Precision Oncology'}
                </p>
              </div>
            )}
          </Link>
          
          {/* Toggle button */}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav 
          ref={(el) => {
            containerRef.current = el as unknown as HTMLElement | null;
            sidebarRef.current = el as HTMLDivElement | null;
          }}
          className="flex-1 px-2 py-4 space-y-2 overflow-y-auto"
          role="navigation"
          aria-label="Main navigation"
          tabIndex={0}
        >
          {filteredGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups.has(group.title);
            const hasActiveItem = group.items.some(item => isActive(item.path));

            return (
              <div key={group.title} className="space-y-1">
                {/* Group header */}
                {isOpen && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleGroup(group.title);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors ${
                      hasActiveItem ? 'text-primary-700' : ''
                    }`}
                    aria-expanded={!isGroupCollapsed}
                    aria-controls={`nav-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                    aria-label={`${group.title} navigation group, ${isGroupCollapsed ? 'collapsed' : 'expanded'}`}
                  >
                    <span>{group.title}</span>
                    {isGroupCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Group items */}
                <div 
                  id={`nav-group-${group.title.toLowerCase().replace(/\s+/g, '-')}`}
                  role="group"
                  aria-label={`${group.title} navigation items`}
                >
                {(!isGroupCollapsed || !isOpen) && group.items.map(({ path, label, icon: Icon, description }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => {
                      // Close mobile sidebar on navigation
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    onFocus={() => setFocusedItem(path)}
                    onBlur={() => setFocusedItem(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Navigate programmatically
                        e.currentTarget.click();
                      }
                    }}
                    className={`
                      group flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      ${isActive(path)
                        ? `bg-${roleConfig?.primaryColor || 'primary'}-50 text-${roleConfig?.primaryColor || 'primary'}-700 border-r-2 border-${roleConfig?.primaryColor || 'primary'}-700`
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100'
                      }
                      ${!isOpen ? 'justify-center' : ''}
                      ${focusedItem === path ? 'ring-2 ring-primary-500' : ''}
                    `}
                    aria-current={isActive(path) ? 'page' : undefined}
                    aria-describedby={isOpen ? `${path}-description` : undefined}
                    role="menuitem"
                  >
                    <Icon className={`
                      flex-shrink-0 transition-all duration-200
                      ${isActive(path) ? `text-${roleConfig?.primaryColor || 'primary'}-700` : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400'}
                      ${isOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}
                    `} />
                    
                    {isOpen && (
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{label}</div>
                        <div 
                          id={`${path}-description`}
                          className="text-xs text-gray-500 truncate"
                        >
                          {description}
                        </div>
                      </div>
                    )}
                    {isOpen && user?.role === 'super_admin' && (
                      <div className="ml-2">
                        {path === '/admin/users' && adminBadges.users && (
                          <Tooltip content={`Active ${adminBadges.users.active} of ${adminBadges.users.total}`}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:text-gray-200">
                              {adminBadges.users.active}/{adminBadges.users.total}
                            </span>
                          </Tooltip>
                        )}
                        {path === '/admin/audit' && typeof adminBadges.auditTotal === 'number' && (
                          <Tooltip content={`Total audit entries: ${adminBadges.auditTotal}`}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:text-gray-200">
                              {adminBadges.auditTotal}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    )}
                    
                    {!isOpen && (
                      <Tooltip content={label} position="right">
                        <span className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {label}
                        </span>
                      </Tooltip>
                    )}
                  </Link>
                ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User section with logout */}
        {user && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} mb-2`}>
              {isOpen && (
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 min-w-0 flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary-700">
                      {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName || 'Unknown'} {user.lastName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                </Link>
              )}
              
              {!isOpen && (
                <Link
                  to="/profile"
                  className="group flex items-center justify-center w-8 h-8 bg-primary-100 rounded-full hover:bg-primary-200 transition-colors relative"
                  title="User Profile"
                >
                  <span className="text-sm font-medium text-primary-700">
                    {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || '?'}
                  </span>
                  <span className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    User Profile
                  </span>
                </Link>
              )}
              
              {isOpen ? (
                <button
                  onClick={() => actions.logout()}
                  className="flex items-center px-2 py-1.5 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-700 text-gray-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="ml-2">Sign out</span>
                </button>
              ) : (
                <Tooltip content="Sign out of OncoSafeRx" position="right">
                  <button
                    onClick={() => actions.logout()}
                    className="group flex items-center p-2 text-sm font-medium rounded-lg hover:bg-red-50 hover:text-red-700 text-gray-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {/* Toggle button for desktop */}
        <div className="hidden lg:block p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Footer info */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 text-center">
              <div>Version 2.1.0</div>
              <div className="mt-1">© 2024 OncoSafeRx</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
