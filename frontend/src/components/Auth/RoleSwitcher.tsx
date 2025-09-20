import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';
import { getRoleConfig } from '../../utils/roleConfig';
import Card from '../UI/Card';
import { 
  User, 
  ChevronDown, 
  Stethoscope, 
  Pill, 
  Heart, 
  BarChart3, 
  GraduationCap,
  Check
} from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { state, actions } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!state.user) return null;

  const roles: Array<{ 
    key: UserProfile['role']; 
    label: string; 
    icon: React.ComponentType<any>; 
    description: string;
    color: string;
  }> = [
    {
      key: 'oncologist',
      label: 'Medical Oncologist',
      icon: Stethoscope,
      description: 'Comprehensive cancer care and treatment planning',
      color: 'blue'
    },
    {
      key: 'pharmacist',
      label: 'Clinical Pharmacist',
      icon: Pill,
      description: 'Medication therapy management and safety',
      color: 'green'
    },
    {
      key: 'nurse',
      label: 'Oncology Nurse',
      icon: Heart,
      description: 'Direct patient care and medication administration',
      color: 'pink'
    },
    {
      key: 'researcher',
      label: 'Clinical Researcher',
      icon: BarChart3,
      description: 'Data analysis and research studies',
      color: 'purple'
    },
    {
      key: 'student',
      label: 'Healthcare Student',
      icon: GraduationCap,
      description: 'Learning and educational experience',
      color: 'orange'
    }
  ];

  const currentRole = roles.find(role => role.key === state.user?.role);
  const CurrentIcon = currentRole?.icon || User;

  const handleRoleChange = (newRole: UserProfile['role']) => {
    if (state.user) {
      // Create a new persona for the role
      const newPersona = {
        id: `persona-${Date.now()}`,
        name: roles.find(r => r.key === newRole)?.label || newRole,
        description: roles.find(r => r.key === newRole)?.description || '',
        role: newRole,
        experienceLevel: 'intermediate' as const,
        specialties: [],
        preferences: {
          riskTolerance: 'moderate' as const,
          alertSensitivity: 'medium' as const,
          workflowStyle: 'thorough' as const,
          decisionSupport: 'consultative' as const,
        },
        customSettings: {},
      };

      // Update user profile with new role and persona
      actions.updateProfile({ 
        role: newRole,
        persona: newPersona
      });
      
      setIsOpen(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Demo: Switch Role</h3>
        <div className="text-xs text-gray-500">
          Experience different UI perspectives
        </div>
      </div>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between p-3 border rounded-lg transition-colors ${
            isOpen ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${currentRole?.color || 'gray'}-100`}>
              <CurrentIcon className={`w-4 h-4 text-${currentRole?.color || 'gray'}-600`} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{currentRole?.label}</div>
              <div className="text-sm text-gray-500">{currentRole?.description}</div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 space-y-1">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = state.user?.role === role.key;
                
                return (
                  <button
                    key={role.key}
                    onClick={() => handleRoleChange(role.key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isSelected 
                        ? `bg-${role.color}-50 border border-${role.color}-200` 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${role.color}-100`}>
                        <RoleIcon className={`w-4 h-4 text-${role.color}-600`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className={`w-5 h-5 text-${role.color}-600`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Current Role Summary */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Current Configuration:</div>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• Navigation items: {getRoleConfig(state.user.role).navigationItems.length} visible</div>
          <div>• Quick actions: {getRoleConfig(state.user.role).quickActions.length} available</div>
          <div>• Permissions: {Object.values(getRoleConfig(state.user.role).permissions).filter(Boolean).length} granted</div>
          <div>• UI theme: {getRoleConfig(state.user.role).primaryColor} color scheme</div>
        </div>
      </div>
    </Card>
  );
};

export default RoleSwitcher;