import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  CheckCircle, 
  Star, 
  Microscope,
  Stethoscope,
  Database,
  Users,
  Award,
  FileText,
  Lock,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  Brain,
  Play,
  Clock,
  DollarSign,
  Globe,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Logo from '../components/Brand/Logo';

const ClinicalLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);

  // Button click handlers
  const handleSignIn = () => {
    // Navigate to auth page
    navigate('/auth');
  };

  const handleWatchDemo = () => {
    setShowDemo(true);
  };

  const handleContactSales = () => {
    // Navigate to contact page or open contact modal
    navigate('/contact');
  };

  const handlePricing = () => {
    navigate('/auth');
  };

  const handleTryDemo = () => {
    navigate('/demo');
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <title>OncoSafeRx — Precision oncology decision support | Sign in</title>
      <meta 
        name="description" 
        content="Oncology drug interaction and pharmacogenomic decision support, with cited sources. Sign in to get started."
      />
      <meta 
        name="keywords" 
        content="drug interaction software, medication safety platform, healthcare SaaS, clinical decision support, pharmacy management software"
      />
      
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Clinical Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" aria-label="OncoSafeRx home" className="flex items-center">
                <Logo size="md" tagline />
              </Link>
              <div className="flex items-center space-x-6">
                <button onClick={handlePricing} className="text-gray-600 hover:text-gray-900 font-medium">Sign Up Free</button>
                <button onClick={handleTryDemo} className="text-gray-600 hover:text-gray-900 font-medium">Live Demo</button>
                <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium">Log In</Link>
                <Button onClick={handleSignIn} className="bg-green-600 hover:bg-green-700 font-semibold">Sign In</Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - SaaS Focus */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                {/* Success Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold mb-8">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Oncology drug safety decision support
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Oncology Drug Safety,
                  <span className="text-green-600 block">With Cited Sources</span>
                </h1>
                
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  The complete drug interaction platform trusted by healthcare teams worldwide. 
                  Interaction checks and pharmacogenomic guidance, each linked to its source.
                </p>

                {/* Key Benefits */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>Instant Setup</strong> - Deploy in under 15 minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>Cited Sources</strong> - Every alert links to its evidence</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>Encrypted</strong> - Data protected in transit and at rest</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    onClick={handleSignIn}
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 font-bold text-lg"
                  >
                    Start Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={handleWatchDemo}
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 font-bold text-lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch 2-Min Demo
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <span>✨ No cost for healthcare professionals</span>
                  <span>•</span>
                  <span>⚡ Setup in 15 minutes</span>
                  <span>•</span>
                  <span>🔒 Encrypted in transit and at rest</span>
                </div>
              </div>

              {/* Interactive Demo Preview */}
              <div className="relative">
                <Card className="p-0 bg-white border border-gray-200 shadow-xl overflow-hidden">
                  {/* Demo Header */}
                  <div className="bg-gray-900 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-sm font-medium">OncoSafeRx Dashboard</div>
                    </div>
                  </div>

                  {/* Live Demo Interface */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Drug Interaction Analysis</h3>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Live Analysis
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">Moderate Interaction Detected</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Warfarin + Ibuprofen may increase bleeding risk</div>
                          </div>
                          <div className="text-orange-600 font-bold text-sm">Level 3</div>
                        </div>

                        <div className="flex items-center p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-gray-100">Alternative Recommended</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Consider acetaminophen instead</div>
                          </div>
                          <div className="text-green-600 font-bold text-sm">Safe</div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Overlay */}
                    <div className="text-center">
                      <Button 
                        onClick={handleTryDemo}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Try Interactive Demo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">See how it works in 2 minutes</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Access Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Free for All Healthcare Professionals
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                OncoSafeRx is available to all verified healthcare professionals. Create an account to access the full platform.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card className="p-8 border-2 border-green-500 relative">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Full Access</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Everything you need for precision oncology</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-green-600">Free</span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">for all verified users</span>
                  </div>
                  <Button onClick={handleSignIn} className="w-full mb-6 bg-green-600 hover:bg-green-700 font-bold text-lg py-3">Sign In</Button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Drug interaction checking</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>80+ PGx gene-drug pairs</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>FAERS safety signals</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Biomarker therapy matching</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Regimen safety analysis</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Clinical trial matching</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Treatment timeline</span></div>
                  <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-3 shrink-0" /><span>Cost estimation</span></div>
                </div>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Role-based access ensures you see the tools relevant to your practice</p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Audit logging</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Role-based access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Everything you need to know about OncoSafeRx
              </p>
            </div>

            <div className="space-y-6">
              {/* FAQ Item 1 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      How quickly can we get started with OncoSafeRx?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Most healthcare teams are up and running within 15 minutes. Our simple setup wizard guides you through account creation, EHR integration, and team onboarding. No technical expertise required.
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Item 2 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Is OncoSafeRx HIPAA compliant?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      OncoSafeRx encrypts data in transit and at rest and keeps audit logs and role-based access controls. We are working toward formal HIPAA and SOC 2 attestations and have not yet completed them. Please do not enter real patient identifiers until a business associate agreement is in place.
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Item 3 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Can OncoSafeRx integrate with our existing EHR system?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We integrate with 20+ major EHR systems including Epic, Cerner, Allscripts, and more. Our API allows for real-time data sync and can be customized for specific workflows. Implementation typically takes 1-2 weeks.
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Item 4 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What's included?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The All features are available to verified healthcare professionals at no cost. Sign in with your email or Google account.
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Item 5 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      How accurate is the drug interaction detection?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      We have not published an accuracy figure. Interactions come from curated, cited sources and are checked against a regression test set of reviewed cases. Treat all output as decision support for a qualified clinician, not as a substitute for clinical judgment.
                    </p>
                  </div>
                </div>
              </Card>

              {/* FAQ Item 6 */}
              <Card className="p-6">
                <div className="flex justify-between items-start cursor-pointer">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      What kind of support do you provide?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Contact us for support options. Response-time and uptime commitments are agreed per customer in the service agreement.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* FAQ CTA */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">Still have questions?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleContactSales} variant="outline" className="font-semibold">
                  Contact Sales Team
                </Button>
                <Button onClick={handleSignIn} className="bg-green-600 hover:bg-green-700 font-semibold">
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-blue-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Check Your Next Regimen?
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Check drug interactions and pharmacogenomic guidance for oncology regimens. 
                Sign in to get started and see results in 30 days.
              </p>
            </div>

            {/* Urgency & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Clock className="h-6 w-6 text-green-300 mr-3" />
                  <span className="font-semibold">Setup in 15 Minutes</span>
                </div>
                <p className="text-green-100 text-sm">
                  Our setup wizard gets you running immediately. No technical expertise required.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <DollarSign className="h-6 w-6 text-green-300 mr-3" />
                  <span className="font-semibold">No Credit Card</span>
                </div>
                <p className="text-green-100 text-sm">
                  Full access for verified healthcare professionals.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-green-300 mr-3" />
                  <span className="font-semibold">Built for oncology</span>
                </div>
                <p className="text-green-100 text-sm">
                  Focused on cancer pharmacotherapy and pharmacogenomics.
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4">
              <Button 
                onClick={handleSignIn}
                size="lg" 
                className="bg-white text-green-700 hover:bg-gray-100 px-12 py-4 text-xl font-bold shadow-xl"
              >
                Sign In Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={handleWatchDemo}
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 font-semibold"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
                <span className="text-green-200">or</span>
                <Button 
                  onClick={handleContactSales}
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 font-semibold"
                >
                  Talk to Sales Team
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-green-500 border-opacity-30">
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-green-200">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>Audit logging</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>Role-based access</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Instant Setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SaaS Footer */}
        <footer className="bg-gray-900 text-gray-300 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-6">
                  <Logo size="md" tagline tone="dark" />
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Oncology drug interaction and pharmacogenomic decision support. 
                  Reduce medication errors and improve patient safety.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">© 2026 OncoSafeRx</span>
                  <span className="text-gray-600 dark:text-gray-400">|</span>
                  <span className="text-gray-500 dark:text-gray-400">Healthcare SaaS Platform</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/auth" className="text-gray-400 hover:text-white">Sign Up Free</Link></li>
                  <li><Link to="/demo" className="text-gray-400 hover:text-white">Live Demo</Link></li>
                  <li><Link to="/integrations" className="text-gray-400 hover:text-white">Integrations</Link></li>
                  <li><Link to="/api" className="text-gray-400 hover:text-white">API Docs</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/help" className="text-gray-400 hover:text-white">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Sales</Link></li>
                  <li><Link to="/status" className="text-gray-400 hover:text-white">System Status</Link></li>
                  <li><Link to="/security" className="text-gray-400 hover:text-white">Security</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm mb-4 md:mb-0">
                  Sign in to get started • Full access
                </p>
                <div className="flex items-center space-x-6">
                  <Button 
                    onClick={handleSignIn}
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 font-semibold"
                  >
                    Sign In
                  </Button>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Encrypted</span>
                    <span>•</span>
                    <span>Audit logging</span>
                    <span>•</span>
                    <span>Role-based access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Demo Modal */}
        {showDemo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">OncoSafeRx Platform Demo</h2>
                <button
                  onClick={() => setShowDemo(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Demo Video Coming Soon</p>
                    <p className="text-gray-500 text-sm">Experience our drug interaction platform</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => {
                      setShowDemo(false);
                      handleSignIn();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDemo(false);
                      handleTryDemo();
                    }}
                    variant="outline" 
                    className="border-green-600 text-green-600 hover:bg-green-50 font-semibold px-6 py-3"
                  >
                    Try Interactive Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClinicalLandingPage;