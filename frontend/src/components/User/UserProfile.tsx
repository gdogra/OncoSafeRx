import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile as UserProfileType, UserPreferences } from '../../types/user';
import { 
  User, 
  Mail, 
  Building, 
  Award, 
  Calendar, 
  Settings, 
  Bell, 
  Palette, 
  Monitor,
  Stethoscope,
  Eye,
  EyeOff,
  Save,
  Camera,
  Users
} from 'lucide-react';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';
import PersonaSelector from './PersonaSelector';

const UserProfile: React.FC = () => {
  const { state, actions } = useAuth();
  const { user } = state;
  
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'persona' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfileType>>(user || {});
  const [editedPreferences, setEditedPreferences] = useState<UserPreferences>(user?.preferences || {} as UserPreferences);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    console.log('🔄 Profile save button clicked!');
    console.log('🔍 Current editedUser:', editedUser);
    console.log('🔍 Actions available:', !!actions);
    console.log('🔍 updateProfile function:', typeof actions?.updateProfile);
    try {
      console.log('🚀 Calling actions.updateProfile...');
      await actions.updateProfile(editedUser);
      console.log('✅ Profile update successful');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
    }
  };

  const handleSavePreferences = async () => {
    console.log('🎨 Preferences save button clicked!');
    console.log('🔍 Current editedPreferences:', editedPreferences);
    try {
      console.log('🚀 Calling actions.updateProfile with preferences...');
      await actions.updateProfile({ preferences: editedPreferences });
      console.log('✅ Preferences update successful');
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      // This would normally call an API endpoint
      console.log('Password change requested');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const specialtyOptions = [
    'Medical Oncology',
    'Surgical Oncology',
    'Radiation Oncology',
    'Hematology-Oncology',
    'Gynecologic Oncology',
    'Pediatric Oncology',
    'Thoracic Oncology',
    'Neuro-Oncology',
    'Breast Oncology',
    'Gastrointestinal Oncology',
    'Genitourinary Oncology',
    'Head and Neck Oncology',
  ];

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'persona', label: 'Testing Persona', icon: Users },
    { id: 'security', label: 'Security', icon: Eye }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href="/auth-diagnostics"
            className="hidden sm:inline-flex items-center px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            title="Open Auth Diagnostics"
          >
            Auth Diagnostics
          </a>
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-semibold text-primary-700">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </span>
          </div>
          <Tooltip content="Upload profile picture (feature coming soon)" position="left">
            <button className="p-2 text-gray-400 hover:text-gray-600 cursor-not-allowed">
              <Camera className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            <Tooltip 
              content={isEditing ? "Save your profile changes" : "Edit your profile information"}
              position="bottom"
            >
              <button
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            </Tooltip>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isEditing ? editedUser.firstName || '' : user.firstName}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={isEditing ? editedUser.lastName || '' : user.lastName}
                onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!isEditing}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={isEditing ? editedUser.email || '' : user.email}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <Mail className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Role
              </label>
              <div className="relative">
                <select
                  value={isEditing ? editedUser.role || '' : user.role}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, role: e.target.value as any }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                >
                  <option value="oncologist">Oncologist</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="nurse">Nurse</option>
                  <option value="researcher">Researcher</option>
                  <option value="student">Student</option>
                </select>
                <Stethoscope className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {(user.role === 'oncologist' || (isEditing && editedUser.role === 'oncologist')) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={isEditing ? editedUser.specialty || '' : user.specialty || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, specialty: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                >
                  <option value="">Select specialty...</option>
                  {specialtyOptions.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={isEditing ? editedUser.institution || '' : user.institution || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, institution: e.target.value }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <Building className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {(user.role === 'oncologist' || user.role === 'pharmacist' || 
              (isEditing && (editedUser.role === 'oncologist' || editedUser.role === 'pharmacist'))) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={isEditing ? editedUser.licenseNumber || '' : user.licenseNumber || ''}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    disabled={!isEditing}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                  />
                  <Award className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={isEditing ? editedUser.yearsExperience || '' : user.yearsExperience || ''}
                  onChange={(e) => setEditedUser(prev => ({ ...prev, yearsExperience: parseInt(e.target.value) || undefined }))}
                  disabled={!isEditing}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'preferences' && (
        <Card className="p-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Preferences</h2>
              
              {/* Theme Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Theme
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setEditedPreferences(prev => ({ ...prev, theme: theme as any }))}
                      className={`p-3 border rounded-lg text-sm font-medium capitalize ${
                        editedPreferences.theme === theme
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email notifications' },
                    { key: 'push', label: 'Push notifications' },
                    { key: 'criticalAlerts', label: 'Critical alerts' },
                    { key: 'weeklyReports', label: 'Weekly reports' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={editedPreferences.notifications?.[key as keyof typeof editedPreferences.notifications] || false}
                        onChange={(e) => setEditedPreferences(prev => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [key]: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dashboard Preferences */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  Dashboard
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default View
                    </label>
                    <select
                      value={editedPreferences.dashboard?.defaultView || 'overview'}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          defaultView: e.target.value as any
                        }
                      }))}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="overview">Overview</option>
                      <option value="patients">Patients</option>
                      <option value="interactions">Interactions</option>
                      <option value="genomics">Genomics</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Compact mode</span>
                    <input
                      type="checkbox"
                      checked={editedPreferences.dashboard?.compactMode || false}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        dashboard: {
                          ...prev.dashboard,
                          compactMode: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'persona' && (
        <div>
          <PersonaSelector />
        </div>
      )}

      {activeTab === 'security' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePasswordChange}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Account Created:</span>
                    <div className="text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Login:</span>
                    <div className="text-gray-600">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
