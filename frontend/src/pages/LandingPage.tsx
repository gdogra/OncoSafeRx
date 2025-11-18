import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Zap, Users, CheckCircle, Star, ArrowRight } from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">Rx</span>
              </div>
              <span className="text-xl font-bold text-gray-900">OncoSafeRx</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link to="/auth" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Button>Start Free Trial</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                <Shield className="h-4 w-4 mr-2" />
                FDA-Compliant • HIPAA-Ready
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Prevent Deadly Drug Interactions in
                <span className="text-blue-600 block">Cancer Care</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                AI-powered clinical decision support that saves lives and reduces the $40B annual cost of medication errors. 
                Built specifically for oncologists and cancer care teams.
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">125k</div>
                  <div className="text-sm text-gray-600">Preventable deaths annually</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">60%</div>
                  <div className="text-sm text-gray-600">Error reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">30s</div>
                  <div className="text-sm text-gray-600">Review time vs 15min</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Watch Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  No setup fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  30-day trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  HIPAA compliant
                </div>
              </div>
            </div>

            {/* Platform Screenshot */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex-1 text-center text-sm text-gray-600">OncoSafeRx Platform</div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                        <span className="text-sm font-medium">Critical Interaction Detected</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                        <span className="text-sm font-medium">Moderate Interaction Alert</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                        <span className="text-sm font-medium">Pharmacogenomic Match</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              The $40 Billion Medication Error Crisis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every year, preventable drug interactions cost healthcare systems billions and put patient lives at risk. 
              In oncology, this problem is amplified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">125,000 Deaths</h3>
              <p className="text-gray-600">Preventable deaths annually from drug interactions in the US alone</p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">12+ Medications</h3>
              <p className="text-gray-600">Average number of simultaneous medications cancer patients take</p>
            </Card>

            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">15 Minutes</h3>
              <p className="text-gray-600">Time oncologists spend researching drug interactions per complex case</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Real-Time Drug Interaction Screening + Pharmacogenomic Insights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              OncoSafeRx transforms complex medication decisions into 30-second clinical insights, 
              specifically designed for oncology complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant FDA-Compliant Drug Interaction Alerts</h3>
                    <p className="text-gray-600">Real-time screening using RxNorm database with oncology-specific protocols</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized Dosing Based on Patient Genetics</h3>
                    <p className="text-gray-600">Pharmacogenomic recommendations using CPIC guidelines for precision medicine</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Seamless EHR Integration</h3>
                    <p className="text-gray-600">Works with Epic, Cerner, and Allscripts - no workflow disruption</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Card className="p-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white mb-4">
                  <h4 className="font-semibold mb-2">Platform Performance</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold">99.9%</div>
                      <div>Uptime</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">&lt;1s</div>
                      <div>Response time</div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-600">
                  Trusted by 50+ oncology practices nationwide
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Trusted by Leading Cancer Centers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Join oncologists nationwide who are already saving lives with OncoSafeRx
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 text-gray-900 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">5.0 from oncology professionals</span>
            </div>
            <blockquote className="text-xl italic mb-6">
              "OncoSafeRx reduced our medication review time by 80% and caught several critical interactions 
              we would have missed. It's become essential to our daily workflow."
            </blockquote>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <div className="font-semibold">Dr. Sarah Johnson, MD</div>
                <div className="text-gray-600">Chief of Oncology, Regional Cancer Center</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Start Saving Lives Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the oncologists who are already using OncoSafeRx to provide safer, more effective cancer care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
              Get Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              Schedule Demo
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              No setup fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              30-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              HIPAA compliant
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-sm">Rx</span>
                </div>
                <span className="text-xl font-bold">OncoSafeRx</span>
              </div>
              <p className="text-gray-400">
                AI-powered clinical decision support for safer cancer care.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link to="/security" className="hover:text-white">Security</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Documentation</Link></li>
                <li><Link to="/research" className="hover:text-white">Research</Link></li>
                <li><Link to="/support" className="hover:text-white">Support</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OncoSafeRx. All rights reserved. Built with precision for cancer care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;