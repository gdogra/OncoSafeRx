import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, getRoleConfig } from '../utils/roleConfig';
import Card from '../components/UI/Card';
import Tooltip from '../components/UI/Tooltip';
import { Activity, Search, AlertTriangle, Dna, FileText, Users, TrendingUp, Shield, Brain, Target, Calendar, DollarSign, Zap, Heart, FlaskConical, Database, ShieldAlert, BookOpen, Stethoscope, MessageSquare } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const userRole = user?.role || 'student';
  
  // DEBUG: Temporary user role debugging v2.1
  console.log('🔍 Dashboard Debug v2.1:', {
    userRole,
    userObject: user,
    timestamp: new Date().toISOString()
  });
  
  // Also show debug info in the UI temporarily
  const showDebug = window.location.hostname !== 'localhost';
  
  type FeatureItem = {
    icon: any;
    title: string;
    description: string;
    link: string;
    color: string;
    badge?: string;
    features: string[];
    isNew?: boolean;
  };

  // Patient-specific features
  const patientFeatures: FeatureItem[] = [
    {
      icon: Heart,
      title: 'My Care Dashboard',
      description: 'View your treatment plan, medications, and upcoming appointments',
      link: '/my-care',
      color: 'bg-blue-500',
      badge: 'Patient Portal',
      features: ['Medication tracking', 'Appointment calendar', 'Treatment timeline', 'Communication']
    },
    {
      icon: Stethoscope,
      title: 'My Medications',
      description: 'Track your medications, dosages, and side effects',
      link: '/my-medications',
      color: 'bg-green-500',
      badge: 'Personal',
      features: ['Current medications', 'Dosage tracking', 'Side effect reporting', 'Reminders']
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Learn about your condition, treatments, and how to manage your care',
      link: '/education',
      color: 'bg-purple-500',
      badge: 'Learning',
      features: ['Treatment guides', 'Side effect management', 'Nutrition tips', 'Support groups']
    },
    {
      icon: MessageSquare,
      title: 'Support & Communication',
      description: 'Connect with your care team and access support resources',
      link: '/support',
      color: 'bg-orange-500',
      badge: 'Support',
      features: ['Care team messaging', 'Support groups', 'Emergency contacts', 'Resources']
    }
  ];

  // Caregiver-specific features
  const caregiverFeatures: FeatureItem[] = [
    {
      icon: Users,
      title: 'Care Management',
      description: 'Manage and coordinate care for your loved one',
      link: '/care-management',
      color: 'bg-teal-500',
      badge: 'Caregiver',
      features: ['Patient status', 'Medication management', 'Appointment tracking', 'Care coordination']
    },
    {
      icon: Heart,
      title: 'Patient Medications',
      description: 'Track medications, reminders, and side effects',
      link: '/my-medications',
      color: 'bg-green-500',
      badge: 'Medication',
      features: ['Medication schedules', 'Side effect tracking', 'Pharmacy coordination', 'Reminders']
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Learn how to provide the best support and care',
      link: '/education',
      color: 'bg-purple-500',
      badge: 'Learning',
      features: ['Caregiver guides', 'Communication tips', 'Stress management', 'Support networks']
    },
    {
      icon: MessageSquare,
      title: 'Support Resources',
      description: 'Access support groups and resources for caregivers',
      link: '/support',
      color: 'bg-orange-500',
      badge: 'Support',
      features: ['Caregiver support', 'Respite care', 'Financial resources', 'Community groups']
    }
  ];

  // Clinical features (for healthcare providers)
  const clinicalFeatures: FeatureItem[] = [
    {
      icon: Search,
      title: 'AI-Enhanced Drug Search',
      description: 'Smart search with ML-powered suggestions, advanced filtering, and real-time oncology drug database',
      link: '/search',
      color: 'bg-blue-500',
      badge: 'AI-Powered',
      features: ['Real-time suggestions', 'Advanced filters', 'Biomarker matching', 'Evidence-based results']
    },
    {
      icon: AlertTriangle,
      title: 'Advanced Interaction Analysis',
      description: 'Comprehensive interaction checking with severity analysis, clinical recommendations, and patient-specific considerations',
      link: '/interactions',
      color: 'bg-yellow-500',
      badge: 'Clinical-Grade',
      features: ['Severity analysis', 'Clinical recommendations', 'Patient-specific', 'Evidence-based']
    },
    {
      icon: Brain,
      title: 'AI Clinical Decision Support',
      description: 'Intelligent treatment recommendations based on patient profile, genomics, and evidence-based medicine',
      link: '/clinical',
      color: 'bg-purple-500',
      badge: 'AI-Powered',
      features: ['Precision medicine', 'Genomic insights', 'Risk assessment', 'Treatment optimization']
    },
    {
      icon: Dna,
      title: 'Pharmacogenomics',
      description: 'Personalized medicine insights with genetic variant analysis and drug metabolism predictions',
      link: '/genomics',
      color: 'bg-green-500',
      badge: 'Precision Medicine',
      features: ['Genetic testing', 'Drug metabolism', 'Personalized dosing', 'Biomarker analysis']
    },
    {
      icon: TrendingUp,
      title: 'Real-World Analytics',
      description: 'Advanced analytics and insights from real-world evidence, treatment outcomes, and population data',
      link: '/analytics',
      color: 'bg-indigo-500',
      badge: 'Big Data',
      features: ['Treatment outcomes', 'Population insights', 'Efficacy analysis', 'Safety monitoring']
    },
    {
      icon: FileText,
      title: 'Clinical Protocols',
      description: 'Comprehensive oncology treatment protocols, guidelines, and evidence-based recommendations',
      link: '/protocols',
      color: 'bg-teal-500',
      badge: 'Evidence-Based',
      features: ['NCCN guidelines', 'Treatment protocols', 'Best practices', 'Clinical pathways']
    },
  ];

  // Revolutionary AI-Powered Features - First of their kind
  const aiFeatures: FeatureItem[] = [
    {
      icon: Brain,
      title: 'AI Treatment Planner',
      description: 'Revolutionary genomic-optimized treatment protocols powered by AI and real-world evidence',
      link: '/ai-treatment-planner',
      color: 'bg-gradient-to-r from-purple-600 to-blue-600',
      badge: 'FIRST OF ITS KIND',
      features: ['Genomic optimization', 'AI recommendations', 'Outcome predictions', 'Evidence synthesis'],
      isNew: true
    },
    {
      icon: Zap,
      title: 'Real-Time Genomic Matcher',
      description: 'Instant drug-gene interaction analysis with sub-second AI-powered recommendations',
      link: '/genomic-matcher',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      badge: 'BREAKTHROUGH',
      features: ['Real-time analysis', 'Instant matching', 'CPIC guidelines', 'Privacy-first'],
      isNew: true
    },
    {
      icon: Target,
      title: 'Predictive Efficacy Scoring',
      description: 'AI-powered treatment efficacy predictions with confidence intervals and multi-factor analysis',
      link: '/efficacy-scoring',
      color: 'bg-gradient-to-r from-green-500 to-teal-500',
      badge: 'AI-POWERED',
      features: ['Efficacy prediction', 'Confidence intervals', 'Multi-factor analysis', 'Evidence-graded'],
      isNew: true
    },
    {
      icon: Heart,
      title: 'Comprehensive Outcome Predictor',
      description: 'AI survival curves, quality of life predictions, and biomarker trajectories',
      link: '/outcome-predictor',
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      badge: 'REVOLUTIONARY',
      features: ['Survival curves', 'QoL predictions', 'Biomarker trends', 'Risk assessment'],
      isNew: true
    },
    {
      icon: FlaskConical,
      title: 'Clinical Trial Matcher',
      description: 'Intelligent trial matching with automated enrollment assistance and AI scoring',
      link: '/clinical-trial-matcher',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      badge: 'INNOVATIVE',
      features: ['AI matching', 'Auto-enrollment', 'Eligibility scoring', 'Real-time updates'],
      isNew: true
    },
    {
      icon: DollarSign,
      title: 'Practice ROI Analytics',
      description: 'Comprehensive precision medicine ROI analysis with financial impact and benchmarking',
      link: '/practice-roi',
      color: 'bg-gradient-to-r from-emerald-500 to-green-600',
      badge: 'BUSINESS INTELLIGENCE',
      features: ['ROI analysis', 'Cost savings', 'Benchmarking', 'Implementation metrics'],
      isNew: true
    },
    {
      icon: Calendar,
      title: 'Patient Timeline & Journey',
      description: 'AI-powered treatment journey with outcome predictions and milestone tracking',
      link: '/patient-journey',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      badge: 'PATIENT-CENTRIC',
      features: ['Timeline visualization', 'Outcome predictions', 'Milestone tracking', 'Journey optimization'],
      isNew: true
    },
    {
      icon: Database,
      title: 'Real-Time Evidence Engine',
      description: 'Continuous AI-powered synthesis of global clinical evidence with predictive modeling',
      link: '/evidence-analysis',
      color: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      badge: 'EVIDENCE-BASED',
      features: ['Real-time updates', 'Evidence synthesis', 'Predictive models', 'Global data sources'],
      isNew: true
    },
    {
      icon: ShieldAlert,
      title: 'Dynamic Risk Assessment',
      description: 'AI-powered real-time safety monitoring with predictive risk modeling and automated interventions',
      link: '/risk-assessment',
      color: 'bg-gradient-to-r from-red-500 to-orange-600',
      badge: 'SAFETY-FIRST',
      features: ['Risk prediction', 'Safety monitoring', 'Automated alerts', 'Intervention recommendations'],
      isNew: true
    }
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

  // Select features based on user role
  const getFeatures = () => {
    switch (userRole) {
      case 'patient':
        return patientFeatures;
      case 'caregiver':
        return caregiverFeatures;
      case 'oncologist':
      case 'pharmacist':
      case 'nurse':
      case 'researcher':
      case 'student':
        return [...clinicalFeatures, ...aiFeatures];
      default:
        return patientFeatures; // Default to patient view for safety
    }
  };

  const selectedFeatures = getFeatures();

  // Role-specific header text
  const getHeaderText = () => {
    switch (userRole) {
      case 'patient':
        return {
          title: 'My Cancer Care Portal',
          subtitle: 'Your personal dashboard for managing cancer treatment and care'
        };
      case 'caregiver':
        return {
          title: 'Caregiver Dashboard',
          subtitle: 'Tools and resources to help you support your loved one\'s cancer care'
        };
      default:
        return {
          title: 'OncoSafeRx',
          subtitle: 'The world\'s first AI-powered precision oncology platform with genomic optimization and predictive analytics'
        };
    }
  };

  const headerText = getHeaderText();

  return (
    <div className="space-y-8">
      
      {/* DEBUG: Temporary visible debugging */}
      {showDebug && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>DEBUG v2.1:</strong> User Role: {userRole} | Email: {user?.email} | 
          Features: {selectedFeatures.length} | Time: {new Date().toLocaleTimeString()}
        </div>
      )}
      
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Activity className="w-10 h-10 text-primary-600" />
          <h1 className="text-4xl font-bold text-gray-900">{headerText.title}</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
          {headerText.subtitle}
        </p>
        {userRole === 'patient' && (
          <div className="mt-2 mb-2">
            <Link
              to="/genomics"
              className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Dna className="w-4 h-4 mr-2" />
              Analyze My Genomics
            </Link>
          </div>
        )}
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full font-medium">
            🚀 First of its Kind
          </span>
          <span className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-3 py-1 rounded-full font-medium">
            🧬 Genomic-Optimized
          </span>
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-medium">
            ⚡ Real-Time AI
          </span>
        </div>
      </div>

      {/* Role Switcher Demo */}
      <div className="mb-8">
      </div>

      {/* Stats - Only show for clinical roles */}
      {userRole !== 'patient' && userRole !== 'caregiver' && (
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
      )}

      {/* Features section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {userRole === 'patient' ? 'Your Care Tools' : 
             userRole === 'caregiver' ? 'Caregiver Resources' : 
             'Revolutionary AI Features'}
          </h2>
          <p className="text-lg text-gray-600 mb-4">
            {userRole === 'patient' ? 'Tools to help you manage your cancer care' :
             userRole === 'caregiver' ? 'Resources to support your loved one\'s care' :
             'World\'s first AI-powered precision oncology capabilities'}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {selectedFeatures.filter(f => f.isNew).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link key={index} to={feature.link} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 border-2 border-transparent group-hover:border-purple-200 relative overflow-hidden">
                  {feature.isNew && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                        NEW
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="bg-gradient-to-r from-gray-800 to-gray-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.features.map((feat, featIndex) => (
                        <div key={featIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-2"></div>
                          {feat}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Additional Features */}
      {selectedFeatures.filter(f => !f.isNew).length > 0 && (
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userRole === 'patient' ? 'Additional Resources' : 
             userRole === 'caregiver' ? 'Additional Tools' : 
             'Core Platform Features'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'patient' ? 'More resources to support your care journey' :
             userRole === 'caregiver' ? 'Additional tools for comprehensive care support' :
             'Comprehensive oncology tools and clinical decision support'}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedFeatures.filter(f => !f.isNew).map((feature, index) => {
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
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center relative`}>
                        <Icon className="w-6 h-6 text-white" />
                        {feature.badge && (
                          <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary-600 text-white text-xs rounded-full font-medium">
                            {feature.badge === 'AI-Powered' && <Brain className="w-3 h-3" />}
                            {feature.badge !== 'AI-Powered' && feature.badge}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                          {feature.badge && feature.badge !== 'AI-Powered' && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                              {feature.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{feature.description}</p>
                        {feature.features && (
                          <div className="flex flex-wrap gap-1">
                            {feature.features.map((feat, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </div>
      )}

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
            {userRole === 'patient' && (
              <Link
                to="/genomics"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Dna className="w-4 h-4 mr-2" />
                Analyze My Genomics
              </Link>
            )}
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
