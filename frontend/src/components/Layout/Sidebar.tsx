import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, getRoleConfig, RolePermissions } from '../../utils/roleConfig';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
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

  // Fetch small admin badges (users and audit totals) for super admins only
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (user?.role !== 'super_admin') return;
        const d = await fetch('/api/admin/dashboard');
        if (d.ok) {
          const body = await d.json();
          if (!cancelled) setAdminBadges(prev => ({ ...prev, users: { total: body?.stats?.users?.total || 0, active: body?.stats?.users?.active || 0 } }));
        }
      } catch {}
      try {
        if (user?.role !== 'super_admin') return;
        const a = await fetch('/api/admin/audit?page=1&limit=1');
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
    const groups = [
      {
        title: user?.role === 'patient' ? 'My Care' : user?.role === 'caregiver' ? 'Care Management' : 'Overview',
        items: [
          { 
            path: '/', 
            label: user?.role === 'patient' ? 'My Dashboard' : user?.role === 'caregiver' ? 'Care Dashboard' : 'Dashboard', 
            icon: Activity, 
            description: user?.role === 'patient' ? 'Your treatment overview' : user?.role === 'caregiver' ? 'Patient care overview' : 'Overview and analytics',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student', 'patient', 'caregiver'],
            requiresPermission: null
          },
          ...(user?.role === 'patient' ? [
            { 
              path: '/my-profile', 
              label: 'My Health Profile', 
              icon: UserCheck, 
              description: 'Your medical information',
              roles: ['patient'],
              requiresPermission: null
            },
            { 
              path: '/my-medications', 
              label: 'My Medications', 
              icon: Pill, 
              description: 'Track your medications',
              roles: ['patient'],
              requiresPermission: null
            },
            { 
              path: '/my-appointments', 
              label: 'Appointments', 
              icon: Clipboard, 
              description: 'Your upcoming visits',
              roles: ['patient'],
              requiresPermission: null
            }
          ] : []),
          ...(user?.role === 'caregiver' ? [
            { 
              path: '/patient-info', 
              label: 'Patient Information', 
              icon: UserCheck, 
              description: 'View patient details',
              roles: ['caregiver'],
              requiresPermission: null
            },
            { 
              path: '/care-plan', 
              label: 'Care Plan', 
              icon: Heart, 
              description: 'Treatment and care schedule',
              roles: ['caregiver'],
              requiresPermission: null
            }
          ] : [])
        ]
      },
      {
        title: 'Clinical Care',
        items: [
          { 
            path: '/clinical', 
            label: 'Clinical Decision', 
            icon: Stethoscope, 
            description: 'Decision support tools',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: 'canViewFullPatientData'
          },
          { 
            path: '/real-time-support', 
            label: 'Real-Time Support', 
            icon: Zap, 
            description: 'Live clinical alerts & monitoring',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/patients/all', 
            label: user?.role === 'researcher' ? 'Subjects' : user?.role === 'student' ? 'Case Studies' : 'Patients', 
            icon: Users, 
            description: 'Patient management (server-backed)',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/regimens', 
            label: 'Treatment Plans', 
            icon: Heart, 
            description: 'Treatment regimens',
            roles: ['oncologist'],
            requiresPermission: 'canPrescribe'
          },
          { 
            path: '/protocols', 
            label: 'Protocols', 
            icon: FileText, 
            description: 'Clinical protocols',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Drug Information',
        items: [
          { 
            path: '/search', 
            label: 'Drug Search', 
            icon: Search, 
            description: 'Search medications',
            roles: ['oncologist', 'pharmacist', 'nurse', 'student'],
            requiresPermission: null
          },
          { 
            path: '/interactions', 
            label: user?.role === 'researcher' ? 'Adverse Events' : 'Interactions', 
            icon: AlertTriangle, 
            description: user?.role === 'researcher' ? 'Study adverse events' : 'Drug interactions',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/pain', 
            label: 'Pain Management', 
            icon: Pill, 
            description: 'Opioid MME + safety',
            roles: ['oncologist', 'pharmacist', 'nurse', 'student'],
            requiresPermission: null
          },
          { 
            path: '/opioid-risk-report', 
            label: 'Opioid Risk Report', 
            icon: Calculator, 
            description: 'Addiction risk + pharmacogenomics',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/database', 
            label: 'Drug Database', 
            icon: BookOpen, 
            description: 'Comprehensive drug information',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Advanced Tools',
        items: [
          { 
            path: '/genomics', 
            label: 'Genomics', 
            icon: Dna, 
            description: 'Pharmacogenomics',
            roles: ['oncologist', 'pharmacist', 'researcher', 'student'],
            requiresPermission: 'canAccessGenomics'
          },
          { 
            path: '/ai', 
            label: 'AI Recommendations', 
            icon: UserCheck, 
            description: 'AI-powered insights',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/trials', 
            label: 'Clinical Trials', 
            icon: TestTube, 
            description: 'Find relevant trials',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'AI & Advanced Analytics',
        items: [
          { 
            path: '/ai-decision-engine', 
            label: 'AI Decision Engine', 
            icon: Brain, 
            description: 'AI-powered clinical decision support',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/safety-alerts', 
            label: 'Safety Alert System', 
            icon: Shield, 
            description: 'Real-time drug safety monitoring',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/ml-analytics', 
            label: 'ML Analytics', 
            icon: TrendingUp, 
            description: 'Machine learning insights dashboard',
            roles: ['oncologist', 'pharmacist', 'researcher'],
            requiresPermission: null
          },
          { 
            path: '/predictive-outcomes', 
            label: 'Predictive Outcomes', 
            icon: Target, 
            description: 'Treatment outcome predictions',
            roles: ['oncologist', 'pharmacist', 'researcher'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Connected Health',
        items: [
          { 
            path: '/ehr-integration', 
            label: 'EHR Integration', 
            icon: Link2, 
            description: 'Connect Epic, Cerner, Allscripts',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/clinical-communication', 
            label: 'Clinical Communication', 
            icon: MessageSquare, 
            description: 'HIPAA-compliant team messaging',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/iot-monitoring', 
            label: 'IoT Monitoring', 
            icon: Smartphone, 
            description: 'Connected device monitoring',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Collaboration & Analytics',
        items: [
          { 
            path: '/collaboration', 
            label: 'Collaboration', 
            icon: Users, 
            description: 'Team collaboration',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/analytics', 
            label: 'Analytics', 
            icon: BarChart3, 
            description: 'Performance analytics',
            roles: ['oncologist', 'pharmacist', 'researcher'],
            requiresPermission: 'canViewAnalytics'
          },
          { 
            path: '/visitor-analytics', 
            label: 'Visitor Analytics', 
            icon: Users, 
            description: 'Site usage and visitor tracking',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/research', 
            label: 'Research', 
            icon: BarChart3, 
            description: 'Data analysis and research',
            roles: ['researcher', 'oncologist'],
            requiresPermission: 'canAccessResearch'
          },
        ]
      },
      {
        title: 'Compliance & Governance',
        items: [
          { 
            path: '/admin', 
            label: 'Admin Home', 
            icon: Shield, 
            description: 'Admin landing overview',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/admin/console', 
            label: 'Admin Console', 
            icon: SettingsIcon, 
            description: 'Administrative overview & tools',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/regulatory-compliance', 
            label: 'Regulatory Compliance', 
            icon: Shield, 
            description: 'HIPAA, FDA, GDPR compliance management',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/admin/health', 
            label: 'System Health', 
            icon: Activity, 
            description: 'Platform status and services',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/admin/audit', 
            label: 'Audit Logs', 
            icon: FileText, 
            description: 'Administrative audit trail',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/admin/users', 
            label: 'User Management', 
            icon: Users, 
            description: 'Manage user accounts and roles',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/admin/settings', 
            label: 'Admin Settings', 
            icon: SettingsIcon, 
            description: 'Maintenance and utilities',
            roles: ['super_admin'],
            requiresPermission: null
          },
          { 
            path: '/evidence-protocols', 
            label: 'Evidence-Based Protocols', 
            icon: BookOpen, 
            description: 'NCCN, ASCO, ESMO clinical guidelines',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/laboratory-integration', 
            label: 'Laboratory Integration', 
            icon: TestTube, 
            description: 'Lab results monitoring & alerts',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
          { 
            path: '/workflow-system', 
            label: 'Advanced Workflows', 
            icon: Workflow, 
            description: 'Clinical workflow automation & mobile tools',
            roles: ['oncologist', 'pharmacist', 'nurse'],
            requiresPermission: null
          },
        ]
      },
      {
        title: 'Resources',
        items: [
          { 
            path: '/help', 
            label: 'Help', 
            icon: HelpCircle, 
            description: 'Help and support',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
          { 
            path: '/auth-diagnostics', 
            label: 'Auth Diagnostics', 
            icon: Clipboard, 
            description: 'Session, server verify, profile check',
            roles: ['oncologist', 'pharmacist', 'nurse', 'researcher', 'student'],
            requiresPermission: null
          },
        ]
      },
      ...(user?.role === 'patient' || user?.role === 'caregiver' ? [{
        title: 'Education & Support',
        items: [
          // Patient quick link to Genomics
          ...(user?.role === 'patient' ? [{
            path: '/genomics',
            label: 'Analyze My Genomics',
            icon: Dna,
            description: 'Upload and analyze your genomic report',
            roles: ['patient'],
            requiresPermission: null
          }] : []),
          { 
            path: '/drug-lookup', 
            label: 'Medication Information', 
            icon: Search, 
            description: 'Learn about your medications',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          },
          { 
            path: '/side-effects', 
            label: 'Side Effects Guide', 
            icon: AlertTriangle, 
            description: 'Understanding side effects',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          },
          { 
            path: '/educational-resources', 
            label: 'Educational Resources', 
            icon: BookOpen, 
            description: 'Cancer treatment information',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          },
          { 
            path: '/stories', 
            label: 'Success Stories', 
            icon: Heart, 
            description: 'Real-world patient experiences',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          },
          { 
            path: '/education/understanding-diagnosis', 
            label: 'Understanding Diagnosis', 
            icon: BookOpen, 
            description: 'Cancer types, staging, and expectations',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          },
          { 
            path: '/support', 
            label: 'Support & Community', 
            icon: MessageSquare, 
            description: 'Connect with others',
            roles: ['patient', 'caregiver'],
            requiresPermission: null
          }
        ]
      }] : [])
    ];

    return groups;
  };

  const getFilteredGroups = () => {
    if (!user) return [];
    
    return getGroupedNavItems().map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Check if item is available for user's role
        if (!item.roles.includes(user.role)) return false;
        
        // Check permission if required
        if (item.requiresPermission && !hasPermission(user.role, item.requiresPermission as keyof RolePermissions)) {
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
                      ${isActive(path) ? `text-${roleConfig?.primaryColor || 'primary'}-700` : 'text-gray-400 group-hover:text-gray-500'}
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {adminBadges.users.active}/{adminBadges.users.total}
                            </span>
                          </Tooltip>
                        )}
                        {path === '/admin/audit' && typeof adminBadges.auditTotal === 'number' && (
                          <Tooltip content={`Total audit entries: ${adminBadges.auditTotal}`}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
          <div className="p-2 border-t border-gray-200">
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
        <div className="hidden lg:block p-2 border-t border-gray-200">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Footer info */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200">
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
