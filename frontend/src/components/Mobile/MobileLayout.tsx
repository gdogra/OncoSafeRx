import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Activity,
  Users,
  Search,
  AlertTriangle,
  Dna,
  FileText,
  Menu,
  X,
  Home,
  Shield,
  Phone,
  MapPin,
  Clock,
  Bell
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const primaryNavItems = [
    { path: '/', label: 'Dashboard', icon: Home, color: 'blue' },
    { path: '/patients/all', label: 'Patients', icon: Users, color: 'green' },
    { path: '/search', label: 'Drugs', icon: Search, color: 'purple' },
    { path: '/interactions', label: 'Safety', icon: AlertTriangle, color: 'red' },
    { path: '/regimens', label: 'Regimens', icon: FileText, color: 'orange' },
  ];

  const secondaryNavItems = [
    { path: '/genomics', label: 'Genomics', icon: Dna },
    { path: '/curated', label: 'Curated', icon: FileText },
    { path: '/trials', label: 'Trials', icon: FileText },
    { path: '/protocols', label: 'Protocols', icon: FileText },
    { path: '/help', label: 'Help', icon: Shield },
  ];

  const getNavItemClass = (path: string, isPrimary: boolean = false) => {
    const isCurrentPath = isActive(path);
    
    if (isPrimary) {
      return `flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${
        isCurrentPath
          ? 'bg-primary-100 text-primary-700 shadow-sm'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50 active:bg-gray-100'
      }`;
    }
    
    return `flex items-center space-x-3 py-3 px-4 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
      isCurrentPath ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500' : ''
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">OncoSafeRx</h1>
              <p className="text-xs text-gray-500 leading-none">Mobile</p>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Emergency Contact */}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <Phone className="w-5 h-5" />
            </button>

            {/* Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Primary Navigation Bar (always visible) */}
        <div className="bg-white border-t border-gray-100">
          <div className="flex justify-around py-2 px-2">
            {primaryNavItems.map(({ path, label, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className={getNavItemClass(path, true)}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Slide-out Menu */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
          <div className="flex flex-col h-full">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Quick Stats */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">15</div>
                    <div className="text-xs text-gray-600">Active Patients</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-600">3</div>
                    <div className="text-xs text-gray-600">Critical Alerts</div>
                  </div>
                </div>
              </div>

              {/* Secondary Navigation */}
              <div className="py-2">
                <h3 className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tools & Resources
                </h3>
                {secondaryNavItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={getNavItemClass(path)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
              </div>

              {/* Emergency Contacts */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Emergency Contacts</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-2 bg-red-50 rounded-lg">
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="text-sm font-medium text-red-800">Pharmacy On-Call</div>
                      <div className="text-xs text-red-600">(555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-orange-50 rounded-lg">
                    <Shield className="w-4 h-4 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium text-orange-800">Poison Control</div>
                      <div className="text-xs text-orange-600">1-800-222-1222</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Dr. Clinical User</div>
                  <div className="text-xs text-gray-500">Oncology Department</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Last sync: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 pb-20">
        {children}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Link
          to="/patients/all"
          className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all duration-200"
        >
          <Users className="w-6 h-6" />
        </Link>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-6 bg-white" />
    </div>
  );
};

export default MobileLayout;
