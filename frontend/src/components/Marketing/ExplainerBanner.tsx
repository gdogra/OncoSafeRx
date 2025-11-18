import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Shield, 
  Brain, 
  Users,
  Star,
  Clock
} from 'lucide-react';
import Card from '../UI/Card';

interface ExplainerBannerProps {
  placement?: 'auth' | 'landing' | 'dashboard';
  className?: string;
}

const ExplainerBanner: React.FC<ExplainerBannerProps> = ({ 
  placement = 'auth', 
  className = '' 
}) => {
  if (placement === 'auth') {
    return (
      <Card className={`p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">Trusted by 500+ Healthcare Organizations</span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            New to OncoSafeRx?
          </h3>
          <p className="text-gray-600 mb-4">
            Discover how our AI-powered platform transforms oncology care with comprehensive 
            drug interaction checking, clinical decision support, and multi-site collaboration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/features"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              See What's Included
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-lg w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xs text-gray-600">1,142+ Drug Interactions</div>
            </div>
            <div className="text-center">
              <div className="p-2 bg-purple-100 rounded-lg w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-xs text-gray-600">AI-Powered Insights</div>
            </div>
            <div className="text-center">
              <div className="p-2 bg-green-100 rounded-lg w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-xs text-gray-600">24/7 Clinical Support</div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (placement === 'landing') {
    return (
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Transform Your Oncology Practice Today
            </h2>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              Join healthcare leaders using AI-powered clinical decision support 
              to improve patient outcomes and practice efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/features"
                className="inline-flex items-center px-6 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Explore Features
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard placement
  return (
    <Card className={`p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg mr-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Maximize Your OncoSafeRx Experience</h3>
            <p className="text-sm text-gray-600">Discover advanced features and collaboration tools</p>
          </div>
        </div>
        <Link
          to="/features"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Explore More
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </Card>
  );
};

export default ExplainerBanner;