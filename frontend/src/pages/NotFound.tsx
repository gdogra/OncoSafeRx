import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  Mail, 
  BookOpen, 
  Stethoscope,
  Shield,
  Users
} from 'lucide-react';
import Card from '../components/UI/Card';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const currentPath = window.location.pathname;

  const popularPages = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', description: 'Main clinical dashboard' },
    { path: '/search', icon: Search, label: 'Drug Search', description: 'Search oncology medications' },
    { path: '/interactions', icon: Shield, label: 'Interaction Checker', description: 'Check drug interactions' },
    { path: '/curated', icon: BookOpen, label: 'Curated Interactions', description: 'Browse interaction database' },
    { path: '/patients', icon: Users, label: 'Patient Management', description: 'Manage patient profiles' },
    { path: '/clinical', icon: Stethoscope, label: 'Clinical Support', description: 'Decision support tools' }
  ];

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main 404 Content */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-blue-200 mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, we'll help you get back to providing excellent patient care.
            </p>
          </div>

          {/* Current Path Info */}
          <div className="mb-8">
            <Card className="p-4 bg-yellow-50 border-yellow-200 inline-block">
              <div className="flex items-center text-yellow-800">
                <span className="font-mono text-sm">
                  Requested path: <strong>{currentPath}</strong>
                </span>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Support
            </Link>
          </div>
        </div>

        {/* Popular Pages */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Popular Clinical Tools
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularPages.map((page) => (
              <Link key={page.path} to={page.path}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border hover:border-blue-300">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-lg mr-4">
                      <page.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{page.label}</h4>
                      <p className="text-sm text-gray-600">{page.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
            <p className="mb-6 text-blue-100">
              Our clinical support team is available 24/7 to help healthcare professionals 
              navigate our oncology decision support platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/help"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Documentation
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Contact Support
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-sm">
            OncoSafeRx - Advancing Oncology Care Through Intelligent Decision Support
          </p>
          <p className="text-xs mt-2">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;