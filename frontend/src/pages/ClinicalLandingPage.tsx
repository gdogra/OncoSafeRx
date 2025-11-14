import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const ClinicalLandingPage: React.FC = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <title>OncoSafeRx - #1 Drug Interaction Platform for Healthcare Teams | 14-Day Free Trial</title>
      <meta 
        name="description" 
        content="Join 500+ healthcare teams using OncoSafeRx to reduce medication errors by 67%. Real-time drug interaction alerts, automated safety protocols. Start your 14-day free trial today."
      />
      <meta 
        name="keywords" 
        content="drug interaction software, medication safety platform, healthcare SaaS, clinical decision support, pharmacy management software"
      />
      
      <div className="min-h-screen bg-white">
        {/* Clinical Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-base">OS</span>
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">OncoSafeRx</span>
                  <div className="text-xs text-gray-500 font-medium">Clinical Decision Support</div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</Link>
                <Link to="/demo" className="text-gray-600 hover:text-gray-900 font-medium">Live Demo</Link>
                <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium">Log In</Link>
                <Button className="bg-green-600 hover:bg-green-700 font-semibold">Start Free Trial</Button>
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
                  #1 Drug Safety Platform • 500+ Healthcare Teams
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Reduce Medication Errors by
                  <span className="text-green-600 block">67% in 30 Days</span>
                </h1>
                
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  The complete drug interaction platform trusted by healthcare teams worldwide. 
                  Real-time alerts, automated safety protocols, and seamless EHR integration.
                </p>

                {/* Key Benefits */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>Instant Setup</strong> - Deploy in under 15 minutes</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>94% Accuracy Rate</strong> - AI-powered interaction detection</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span><strong>SOC 2 Compliant</strong> - Enterprise-grade security</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 font-bold text-lg">
                    Start 14-Day Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 font-bold text-lg">
                    <Play className="mr-2 h-5 w-5" />
                    Watch 2-Min Demo
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>✨ No credit card required</span>
                  <span>•</span>
                  <span>⚡ Setup in 15 minutes</span>
                  <span>•</span>
                  <span>🔒 HIPAA compliant</span>
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
                        <h3 className="font-semibold text-gray-900">Drug Interaction Analysis</h3>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Live Analysis
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Moderate Interaction Detected</div>
                            <div className="text-sm text-gray-600">Warfarin + Ibuprofen may increase bleeding risk</div>
                          </div>
                          <div className="text-orange-600 font-bold text-sm">Level 3</div>
                        </div>

                        <div className="flex items-center p-3 bg-green-50 rounded border-l-4 border-green-400">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">Alternative Recommended</div>
                            <div className="text-sm text-gray-600">Consider acetaminophen instead</div>
                          </div>
                          <div className="text-green-600 font-bold text-sm">Safe</div>
                        </div>
                      </div>
                    </div>

                    {/* CTA Overlay */}
                    <div className="text-center">
                      <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3">
                        <Play className="mr-2 h-4 w-4" />
                        Try Interactive Demo
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">See how it works in 2 minutes</p>
                    </div>
                  </div>
                </Card>

                {/* Floating metrics */}
                <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2.3s</div>
                    <div className="text-xs text-gray-600">Avg Response</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">94%</div>
                    <div className="text-xs text-gray-600">Accuracy Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof & Customer Logos */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 font-medium mb-8">Trusted by 500+ healthcare organizations worldwide</p>
            
            {/* Customer Logos Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-70 mb-12">
              {/* Placeholder logos - replace with actual customer logos */}
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
              <div className="bg-gray-200 rounded-lg p-4 h-16 flex items-center justify-center">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Healthcare Teams</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">67%</div>
                <div className="text-gray-600">Error Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">2.3s</div>
                <div className="text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Start with our free trial. No credit card required. Upgrade anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Starter Plan */}
              <Card className="p-8 border border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                  <p className="text-gray-600 mb-6">Perfect for small practices</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$49</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Button variant="outline" className="w-full mb-6 font-semibold">Start Free Trial</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Up to 50 patients</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Basic interaction alerts</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Email support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Mobile app access</span>
                  </div>
                </div>
              </Card>

              {/* Professional Plan - Popular */}
              <Card className="p-8 border-2 border-green-500 relative bg-green-50">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                  <p className="text-gray-600 mb-6">For growing healthcare teams</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">$149</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <Button className="w-full mb-6 bg-green-600 hover:bg-green-700 font-bold">Start Free Trial</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Up to 500 patients</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Advanced AI analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>EHR integration</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Custom reporting</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>API access</span>
                  </div>
                </div>
              </Card>

              {/* Enterprise Plan */}
              <Card className="p-8 border border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                  <p className="text-gray-600 mb-6">For large healthcare systems</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <Button variant="outline" className="w-full mb-6 font-semibold">Contact Sales</Button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Unlimited patients</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>White-label solution</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>SLA guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-3" />
                    <span>Training & onboarding</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pricing Footer */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">All plans include 14-day free trial • No setup fees • Cancel anytime</p>
              <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>HIPAA Ready</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>99.9% Uptime SLA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Loved by Healthcare Teams Worldwide
              </h2>
              <p className="text-xl text-gray-600">
                See how OncoSafeRx is transforming medication safety for healthcare professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <Card className="p-8 bg-white">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "OncoSafeRx reduced our medication errors by 73% in the first month. The real-time alerts are incredibly accurate and have prevented several serious adverse events."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-blue-700 text-lg">SM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Sarah Martinez</div>
                    <div className="text-sm text-gray-600">Chief Pharmacist, City Medical Center</div>
                  </div>
                </div>
              </Card>

              {/* Testimonial 2 */}
              <Card className="p-8 bg-white">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "Setup took 10 minutes and our team was productive immediately. The EHR integration is seamless and the support team is outstanding."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-green-700 text-lg">JC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. James Chen</div>
                    <div className="text-sm text-gray-600">Medical Director, Regional Healthcare</div>
                  </div>
                </div>
              </Card>

              {/* Testimonial 3 */}
              <Card className="p-8 bg-white">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "The ROI was immediate. We've prevented costly readmissions and our staff confidence in prescribing has increased dramatically."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="font-bold text-purple-700 text-lg">AL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Dr. Anna Lopez</div>
                    <div className="text-sm text-gray-600">VP of Quality, Metro Health System</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* CTA in testimonials */}
            <div className="text-center mt-12">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4">
                Join 500+ Happy Customers
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-gray-500 mt-4">Start your free trial today • No credit card required</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
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
                    <p className="text-gray-600">
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
                    <p className="text-gray-600">
                      Yes, OncoSafeRx is fully HIPAA compliant and SOC 2 Type II certified. All data is encrypted in transit and at rest, with comprehensive audit logs and access controls. We sign BAAs with all customers.
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
                    <p className="text-gray-600">
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
                      What's included in the free trial?
                    </h3>
                    <p className="text-gray-600">
                      The 14-day free trial includes full access to all features, unlimited patient records, EHR integration, and priority support. No credit card required, no setup fees, and you can upgrade or cancel anytime.
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
                    <p className="text-gray-600">
                      Our AI-powered system achieves 94% accuracy in detecting clinically significant drug interactions. We continuously update our database with the latest clinical evidence and FDA safety communications.
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
                    <p className="text-gray-600">
                      Professional plans include priority email and phone support with 4-hour response times. Enterprise customers get dedicated account management, training sessions, and 99.9% uptime SLA.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* FAQ CTA */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">Still have questions?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="font-semibold">
                  Contact Sales Team
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 font-semibold">
                  Start Free Trial
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
                Ready to Reduce Medication Errors by 67%?
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Join 500+ healthcare teams using OncoSafeRx to improve patient safety. 
                Start your free trial today and see results in 30 days.
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
                  14-day free trial with full access to all features. Cancel anytime.
                </p>
              </div>
              
              <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-green-300 mr-3" />
                  <span className="font-semibold">Trusted by 500+</span>
                </div>
                <p className="text-green-100 text-sm">
                  Healthcare teams worldwide trust OncoSafeRx for medication safety.
                </p>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="space-y-4">
              <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 px-12 py-4 text-xl font-bold shadow-xl">
                Start Your Free Trial Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
                <span className="text-green-200">or</span>
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 font-semibold">
                  Talk to Sales Team
                </Button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-green-500 border-opacity-30">
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-green-200">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" />
                  <span>HIPAA Ready</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>99.9% Uptime</span>
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
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-base">OS</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">OncoSafeRx</span>
                    <div className="text-sm text-gray-400">#1 Drug Interaction Platform</div>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  The complete drug interaction platform trusted by 500+ healthcare teams worldwide. 
                  Reduce medication errors and improve patient safety.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">© 2024 OncoSafeRx</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500">Healthcare SaaS Platform</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
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
                  Start your free trial today • No credit card required
                </p>
                <div className="flex items-center space-x-6">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 font-semibold">
                    Start Free Trial
                  </Button>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>SOC 2 Compliant</span>
                    <span>•</span>
                    <span>HIPAA Ready</span>
                    <span>•</span>
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ClinicalLandingPage;