import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/UI/Card';
import Tooltip from '../components/UI/Tooltip';
import { Activity, Search, AlertTriangle, Dna, FileText, Users, TrendingUp, Shield } from 'lucide-react';

const Dashboard: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: 'Drug Search',
      description: 'Search and explore comprehensive drug information from RxNorm and FDA databases',
      link: '/search',
      color: 'bg-blue-500',
    },
    {
      icon: AlertTriangle,
      title: 'Interaction Checker',
      description: 'Check for potential drug-drug interactions and safety alerts',
      link: '/interactions',
      color: 'bg-yellow-500',
    },
    {
      icon: Dna,
      title: 'Genomics Analysis',
      description: 'Explore pharmacogenomic guidelines and gene-drug interactions',
      link: '/genomics',
      color: 'bg-purple-500',
    },
    {
      icon: FileText,
      title: 'Clinical Protocols',
      description: 'Access oncology treatment protocols and NCCN guidelines',
      link: '/protocols',
      color: 'bg-green-500',
    },
  ];

  const stats = [
    {
      icon: Users,
      label: 'Active Users',
      value: '2,847',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      icon: Search,
      label: 'Drug Searches',
      value: '45,212',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      icon: AlertTriangle,
      label: 'Interactions Checked',
      value: '8,924',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      icon: Shield,
      label: 'Safety Alerts',
      value: '156',
      change: '-5%',
      changeType: 'negative' as const,
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Activity className="w-10 h-10 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900">OncoSafeRx</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Advanced oncology drug interaction and pharmacogenomic analysis platform for precision medicine
        </p>
      </div>

      {/* Role Switcher Demo */}
      <div className="mb-8">
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} padding="sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <div className="flex items-baseline">
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Tooltip
                key={index}
                content={`Click to access ${feature.title} - ${feature.description}`}
                position="bottom"
              >
                <Link to={feature.link}>
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary-500">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            New to OncoSafeRx? Start by searching for a drug to explore its safety profile, 
            check for interactions, or analyze pharmacogenomic factors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/search"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Start Drug Search
            </Link>
            <Link
              to="/interactions"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Check Interactions
            </Link>
          </div>
        </div>
      </Card>

      {/* Recent Activity / News */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <span className="text-gray-600">Updated CPIC guidelines for CYP2D6</span>
              <span className="text-gray-400">2 days ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">New FDA drug safety alerts integrated</span>
              <span className="text-gray-400">1 week ago</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Enhanced interaction checking algorithms</span>
              <span className="text-gray-400">2 weeks ago</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Database Coverage</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Interaction Accuracy</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Genomic Guidelines</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;