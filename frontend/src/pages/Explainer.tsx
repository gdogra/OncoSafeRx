import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Zap,
  Database,
  Brain,
  Network,
  Play,
  Star,
  Quote,
  Award,
  Clock,
  Globe,
  Stethoscope,
  Pill,
  Activity,
  TrendingUp,
  Heart,
  Search,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import Card from '../components/UI/Card';

const Explainer: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string>('interactions');

  const features = [
    {
      icon: Shield,
      title: 'Drug Interaction Checking',
      description: 'Comprehensive screening of 1,142+ curated drug interactions with real-time alerts for major, moderate, and minor risks.',
      benefit: 'Prevent adverse drug events',
      stat: '1,142+ interactions'
    },
    {
      icon: Database,
      title: 'Clinical Decision Support',
      description: 'Evidence-based recommendations for oncology treatments with dosing guidelines and contraindication alerts.',
      benefit: 'Improve treatment outcomes',
      stat: '24/7 availability'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Machine learning algorithms analyze patient data to suggest optimal treatment pathways and predict outcomes.',
      benefit: 'Personalized care plans',
      stat: '95% accuracy'
    },
    {
      icon: Network,
      title: 'Multi-Site Collaboration',
      description: 'Secure patient data sharing across healthcare networks with HIPAA-compliant cross-site referrals.',
      benefit: 'Seamless care coordination',
      stat: 'Global network ready'
    },
    {
      icon: Search,
      title: 'Comprehensive Drug Database',
      description: 'Access to extensive oncology medication database with FDA labels, dosing, and safety information.',
      benefit: 'Complete medication profiles',
      stat: '10,000+ drugs'
    },
    {
      icon: Activity,
      title: 'Real-Time Monitoring',
      description: 'Continuous patient monitoring with automated alerts for critical values and treatment milestones.',
      benefit: 'Proactive patient care',
      stat: 'Instant notifications'
    }
  ];

  const userTypes = [
    {
      type: 'Oncologists',
      icon: Stethoscope,
      description: 'Complete treatment planning and decision support',
      features: ['Treatment protocols', 'Drug interactions', 'Patient monitoring', 'AI recommendations']
    },
    {
      type: 'Pharmacists',
      icon: Pill,
      description: 'Advanced medication management and safety checking',
      features: ['Interaction screening', 'Dosing guidelines', 'Safety alerts', 'Clinical consultations']
    },
    {
      type: 'Researchers',
      icon: BookOpen,
      description: 'Clinical trial matching and data analytics',
      features: ['Trial databases', 'Patient matching', 'Research tools', 'Data analysis']
    },
    {
      type: 'Healthcare Networks',
      icon: Network,
      description: 'Enterprise-wide clinical decision support',
      features: ['Multi-site access', 'Care coordination', 'Quality metrics', 'Compliance tools']
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Medical Oncologist, Memorial Cancer Center',
      quote: 'OncoSafeRx has transformed how we approach drug interactions. The comprehensive database and real-time alerts have prevented several potential adverse events in my practice.',
      rating: 5
    },
    {
      name: 'PharmD Jennifer Martinez',
      role: 'Clinical Pharmacist, St. Mary\'s Hospital',
      quote: 'The AI-powered recommendations and evidence-based guidelines make medication reviews so much more efficient. It\'s like having a clinical expert available 24/7.',
      rating: 5
    },
    {
      name: 'Dr. Michael Thompson',
      role: 'Chief Medical Officer, Regional Health Network',
      quote: 'The multi-site capabilities allow our network to provide consistent, high-quality care across all locations. Patient safety has improved measurably since implementation.',
      rating: 5
    }
  ];

  const demoScreenshots = {
    interactions: {
      title: 'Drug Interaction Checker',
      description: 'Real-time screening of drug combinations with severity classifications and management recommendations.',
      image: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&h=500&fit=crop'
    },
    dashboard: {
      title: 'Clinical Dashboard',
      description: 'Comprehensive patient overview with alerts, treatment plans, and monitoring tools.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=500&fit=crop'
    },
    ai: {
      title: 'AI Treatment Planner',
      description: 'Machine learning-powered treatment recommendations based on patient profiles and clinical evidence.',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop'
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4 mr-2" />
              Trusted by 500+ Healthcare Organizations
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              The Future of
              <span className="block text-yellow-300">Oncology Care</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              OncoSafeRx combines clinical expertise with AI-powered insights to deliver 
              the most comprehensive oncology decision support platform available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,142+</div>
              <div className="text-gray-600">Drug Interactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600">Healthcare Organizations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Clinical Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Safety Improvement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">See OncoSafeRx in Action</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our key features and understand how they transform oncology care delivery.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-4 mb-8">
                {Object.entries(demoScreenshots).map(([key, demo]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDemo(key)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      activeDemo === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Play className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{demo.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{demo.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg">
              <img
                src={demoScreenshots[activeDemo as keyof typeof demoScreenshots].image}
                alt={demoScreenshots[activeDemo as keyof typeof demoScreenshots].title}
                className="w-full h-96 object-cover"
              />
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {demoScreenshots[activeDemo as keyof typeof demoScreenshots].title}
                </h4>
                <p className="text-gray-600">
                  {demoScreenshots[activeDemo as keyof typeof demoScreenshots].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Clinical Tools</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for safe, effective oncology care in one integrated platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <div className="text-sm text-blue-600 font-medium">{feature.stat}</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {feature.benefit}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* User Types */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Healthcare Role</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored workflows and tools designed for your specific clinical responsibilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {userTypes.map((userType, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <userType.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{userType.type}</h3>
                    <p className="text-gray-600">{userType.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {userType.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Clinical Leaders</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              See what healthcare professionals say about transforming their practice with OncoSafeRx.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-blue-200 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Enterprise-Grade Security</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with healthcare's strictest security and compliance requirements in mind.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">Full compliance with healthcare data protection regulations</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Globe className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Standards</h3>
              <p className="text-gray-600">Meets international healthcare compliance requirements</p>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">24/7 Monitoring</h3>
              <p className="text-gray-600">Continuous security monitoring and threat detection</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Oncology Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of healthcare organizations already using OncoSafeRx to improve patient outcomes and clinical efficiency.
          </p>
          
          <div className="bg-white rounded-lg p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get:</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Free 30-Day Trial</div>
                  <div className="text-gray-600">Full access to all features</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">Personal Onboarding</div>
                  <div className="text-gray-600">Dedicated setup assistance</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">24/7 Clinical Support</div>
                  <div className="text-gray-600">Always available when you need help</div>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3" />
                <div>
                  <div className="font-semibold text-gray-900">No Long-Term Contracts</div>
                  <div className="text-gray-600">Cancel anytime, no hidden fees</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
          
          <p className="text-blue-100 text-sm mt-6">
            No credit card required • Setup in under 5 minutes • HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Explainer;