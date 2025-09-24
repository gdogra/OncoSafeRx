// Role-Based Access Control (RBAC) System for OncoSafeRx

// Import the UserProfile type instead of defining a separate User interface
import { UserProfile } from '../types/user';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy: number; // Higher number = more privileges
  isSystemRole: boolean;
}

// Define all system permissions
export const PERMISSIONS: Record<string, Permission> = {
  // Analytics permissions
  VIEW_VISITOR_ANALYTICS: {
    id: 'view_visitor_analytics',
    name: 'View Visitor Analytics',
    description: 'Access visitor tracking and usage analytics',
    resource: 'analytics',
    action: 'read'
  },
  MANAGE_ANALYTICS: {
    id: 'manage_analytics',
    name: 'Manage Analytics',
    description: 'Configure analytics settings and export data',
    resource: 'analytics',
    action: 'write'
  },
  VIEW_REALTIME_ANALYTICS: {
    id: 'view_realtime_analytics',
    name: 'View Real-time Analytics',
    description: 'Access live visitor tracking and real-time metrics',
    resource: 'analytics',
    action: 'read'
  },

  // Admin console permissions
  ADMIN_CONSOLE_ACCESS: {
    id: 'admin_console_access',
    name: 'Admin Console Access',
    description: 'Access administrative dashboard and controls',
    resource: 'admin',
    action: 'read'
  },
  MANAGE_USERS: {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Create, update, and deactivate user accounts',
    resource: 'users',
    action: 'write'
  },
  MANAGE_ROLES: {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Create and modify user roles and permissions',
    resource: 'roles',
    action: 'write'
  },
  VIEW_AUDIT_LOGS: {
    id: 'view_audit_logs',
    name: 'View Audit Logs',
    description: 'Access system audit logs and compliance reports',
    resource: 'audit',
    action: 'read'
  },
  MANAGE_SYSTEM_SETTINGS: {
    id: 'manage_system_settings',
    name: 'Manage System Settings',
    description: 'Configure system-wide settings and preferences',
    resource: 'system',
    action: 'write'
  },

  // Clinical permissions
  VIEW_PATIENT_DATA: {
    id: 'view_patient_data',
    name: 'View Patient Data',
    description: 'Access patient information and medical records',
    resource: 'patients',
    action: 'read'
  },
  EDIT_PATIENT_DATA: {
    id: 'edit_patient_data',
    name: 'Edit Patient Data',
    description: 'Modify patient information and medical records',
    resource: 'patients',
    action: 'write'
  },
  PRESCRIBE_MEDICATIONS: {
    id: 'prescribe_medications',
    name: 'Prescribe Medications',
    description: 'Create and modify medication prescriptions',
    resource: 'prescriptions',
    action: 'write'
  },
  VIEW_DRUG_INTERACTIONS: {
    id: 'view_drug_interactions',
    name: 'View Drug Interactions',
    description: 'Access drug interaction checking tools',
    resource: 'interactions',
    action: 'read'
  },
  ACCESS_PROTOCOLS: {
    id: 'access_protocols',
    name: 'Access Clinical Protocols',
    description: 'View clinical protocols and treatment guidelines',
    resource: 'protocols',
    action: 'read'
  },
  MANAGE_PROTOCOLS: {
    id: 'manage_protocols',
    name: 'Manage Clinical Protocols',
    description: 'Create and modify clinical protocols',
    resource: 'protocols',
    action: 'write'
  },

  // Reporting permissions
  GENERATE_REPORTS: {
    id: 'generate_reports',
    name: 'Generate Reports',
    description: 'Create and export various system reports',
    resource: 'reports',
    action: 'write'
  },
  VIEW_COMPLIANCE_REPORTS: {
    id: 'view_compliance_reports',
    name: 'View Compliance Reports',
    description: 'Access regulatory compliance and audit reports',
    resource: 'compliance',
    action: 'read'
  }
};

// Define system roles
export const ROLES: Record<string, Role> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access with all privileges',
    permissions: Object.keys(PERMISSIONS),
    hierarchy: 100,
    isSystemRole: true
  },
  SYSTEM_ADMIN: {
    id: 'system_admin',
    name: 'System Administrator',
    description: 'Administrative access to system management and analytics',
    permissions: [
      'admin_console_access',
      'view_visitor_analytics',
      'manage_analytics',
      'view_realtime_analytics',
      'manage_users',
      'manage_roles',
      'view_audit_logs',
      'manage_system_settings',
      'generate_reports',
      'view_compliance_reports'
    ],
    hierarchy: 90,
    isSystemRole: true
  },
  ANALYTICS_ADMIN: {
    id: 'analytics_admin',
    name: 'Analytics Administrator',
    description: 'Specialized role for analytics and reporting management',
    permissions: [
      'view_visitor_analytics',
      'manage_analytics',
      'view_realtime_analytics',
      'generate_reports',
      'view_compliance_reports',
      'view_audit_logs'
    ],
    hierarchy: 70,
    isSystemRole: true
  },
  ONCOLOGIST: {
    id: 'oncologist',
    name: 'Oncologist',
    description: 'Medical oncology specialist with full clinical access',
    permissions: [
      'view_patient_data',
      'edit_patient_data',
      'prescribe_medications',
      'view_drug_interactions',
      'access_protocols',
      'manage_protocols',
      'generate_reports',
      'admin_console_access',
      'view_visitor_analytics',
      'manage_analytics'
    ],
    hierarchy: 60,
    isSystemRole: true
  },
  PHARMACIST: {
    id: 'pharmacist',
    name: 'Pharmacist',
    description: 'Pharmaceutical specialist with medication management access',
    permissions: [
      'view_patient_data',
      'edit_patient_data',
      'prescribe_medications',
      'view_drug_interactions',
      'access_protocols',
      'generate_reports'
    ],
    hierarchy: 50,
    isSystemRole: true
  },
  NURSE: {
    id: 'nurse',
    name: 'Nurse',
    description: 'Nursing professional with patient care access',
    permissions: [
      'view_patient_data',
      'edit_patient_data',
      'view_drug_interactions',
      'access_protocols'
    ],
    hierarchy: 40,
    isSystemRole: true
  },
  RESEARCHER: {
    id: 'researcher',
    name: 'Researcher',
    description: 'Research professional with data analysis access',
    permissions: [
      'view_patient_data',
      'view_drug_interactions',
      'access_protocols',
      'generate_reports'
    ],
    hierarchy: 30,
    isSystemRole: true
  },
  STUDENT: {
    id: 'student',
    name: 'Student',
    description: 'Educational access with limited permissions',
    permissions: [
      'view_drug_interactions',
      'access_protocols'
    ],
    hierarchy: 10,
    isSystemRole: true
  }
};

class RBACService {
  // Check if user has specific permission
  hasPermission(user: UserProfile, permissionId: string): boolean {
    // Check direct permissions
    if (user.permissions?.includes(permissionId)) {
      return true;
    }

    // Check role-based permissions
    return user.roles?.some(roleId => {
      const role = ROLES[roleId.toUpperCase()];
      return role && role.permissions.includes(permissionId);
    }) ?? false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(user: UserProfile, permissionIds: string[]): boolean {
    return permissionIds.some(permissionId => this.hasPermission(user, permissionId));
  }

  // Check if user has all specified permissions
  hasAllPermissions(user: UserProfile, permissionIds: string[]): boolean {
    return permissionIds.every(permissionId => this.hasPermission(user, permissionId));
  }

  // Check if user has specific role
  hasRole(user: UserProfile, roleId: string): boolean {
    return user.roles?.includes(roleId) ?? false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(user: UserProfile, roleIds: string[]): boolean {
    return roleIds.some(roleId => this.hasRole(user, roleId));
  }

  // Get user's highest hierarchy level
  getUserHierarchyLevel(user: UserProfile): number {
    if (!user.roles || user.roles.length === 0) return 0;
    const userRoles = user.roles.map(roleId => ROLES[roleId.toUpperCase()]).filter(Boolean);
    return userRoles.length > 0 ? Math.max(...userRoles.map(role => role.hierarchy)) : 0;
  }

  // Check if user can access admin console
  canAccessAdminConsole(user: UserProfile): boolean {
    return this.hasPermission(user, 'admin_console_access') || 
           this.hasAnyRole(user, ['super_admin', 'system_admin', 'analytics_admin']);
  }

  // Check if user can view analytics
  canViewAnalytics(user: UserProfile): boolean {
    return this.hasPermission(user, 'view_visitor_analytics');
  }

  // Check if user can manage analytics
  canManageAnalytics(user: UserProfile): boolean {
    return this.hasPermission(user, 'manage_analytics');
  }

  // Get permissions for a role
  getRolePermissions(roleId: string): Permission[] {
    const role = ROLES[roleId.toUpperCase()];
    if (!role) return [];
    
    return role.permissions.map(permId => PERMISSIONS[permId.toUpperCase()]).filter(Boolean);
  }

  // Get all user permissions (direct + role-based)
  getUserPermissions(user: UserProfile): Permission[] {
    const allPermissionIds = new Set<string>();
    
    // Add direct permissions
    user.permissions?.forEach(permId => allPermissionIds.add(permId));
    
    // Add role-based permissions
    user.roles?.forEach(roleId => {
      const role = ROLES[roleId.toUpperCase()];
      if (role) {
        role.permissions.forEach(permId => allPermissionIds.add(permId));
      }
    });
    
    return Array.from(allPermissionIds)
      .map(permId => PERMISSIONS[permId.toUpperCase()])
      .filter(Boolean);
  }

  // Validate role hierarchy for operations
  canManageUser(adminUser: UserProfile, targetUser: UserProfile): boolean {
    const adminLevel = this.getUserHierarchyLevel(adminUser);
    const targetLevel = this.getUserHierarchyLevel(targetUser);
    
    return adminLevel > targetLevel && this.hasPermission(adminUser, 'manage_users');
  }

  // Generate permission matrix for role
  generatePermissionMatrix(roleId: string): Record<string, boolean> {
    const role = ROLES[roleId.toUpperCase()];
    const matrix: Record<string, boolean> = {};
    
    Object.keys(PERMISSIONS).forEach(permId => {
      matrix[permId] = role ? role.permissions.includes(permId) : false;
    });
    
    return matrix;
  }
}

// Create singleton instance
export const rbacService = new RBACService();

// Helper function for React components
export const useRBAC = (user: UserProfile | null) => {
  if (!user) {
    return {
      hasPermission: () => false,
      hasRole: () => false,
      canAccessAdminConsole: () => false,
      canViewAnalytics: () => false,
      canManageAnalytics: () => false,
      getUserPermissions: () => [],
      getUserHierarchyLevel: () => 0
    };
  }

  return {
    hasPermission: (permissionId: string) => rbacService.hasPermission(user, permissionId),
    hasRole: (roleId: string) => rbacService.hasRole(user, roleId),
    hasAnyRole: (roleIds: string[]) => rbacService.hasAnyRole(user, roleIds),
    canAccessAdminConsole: () => rbacService.canAccessAdminConsole(user),
    canViewAnalytics: () => rbacService.canViewAnalytics(user),
    canManageAnalytics: () => rbacService.canManageAnalytics(user),
    getUserPermissions: () => rbacService.getUserPermissions(user),
    getUserHierarchyLevel: () => rbacService.getUserHierarchyLevel(user)
  };
};

export default rbacService;