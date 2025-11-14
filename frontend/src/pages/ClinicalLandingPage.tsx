import React from 'react';
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
  Brain
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const ClinicalLandingPage: React.FC = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <title>OncoSafeRx - Clinical Decision Support for Oncology Drug Interactions | Evidence-Based Medicine</title>
      <meta 
        name="description" 
        content="AI-powered drug interaction intelligence for oncology teams. Detect high-risk interactions, optimize pharmacogenomic dosing, and improve patient safety with evidence-based clinical decision support."
      />
      <meta 
        name="keywords" 
        content="oncology drug interactions, pharmacogenomics, clinical decision support, medication safety, cancer care, drug-drug interactions"
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
                <Link to="/research" className="text-gray-600 hover:text-gray-900 font-medium">Research</Link>
                <Link to="/docs" className="text-gray-600 hover:text-gray-900 font-medium">Documentation</Link>
                <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium">Clinician Access</Link>
                <Button className="bg-blue-700 hover:bg-blue-800">Request Demo</Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Clinical Focus */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                {/* Clinical Badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-8">
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Clinical Decision Support
                </div>
                
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  Clinical Decision Support for
                  <span className="text-blue-700 block">Oncology Drug Safety</span>
                </h1>
                
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  AI-powered drug interaction analysis designed for cancer care teams. Reduce medication errors, 
                  optimize patient safety, and support evidence-based prescribing decisions at the point of care.
                </p>

                <p className="text-lg text-gray-600 mb-8 font-medium">
                  Trusted by oncology practices to identify high-risk interactions in complex cancer treatment regimens.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 font-semibold">
                    Request Clinical Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-blue-700 text-blue-700 hover:bg-blue-50 px-8 py-3 font-semibold">
                    View Evidence Summary
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    HIPAA Ready
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Evidence-Based
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Clinical Quality
                  </div>
                </div>
              </div>

              {/* Clinical Workflow Visualization */}
              <div className="relative">
                <Card className="p-8 bg-white border-2 border-blue-100">
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Clinical Decision Workflow</h3>
                    <p className="text-sm text-gray-600">Evidence-based interaction analysis in real-time</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Input Patient Data</div>
                        <div className="text-sm text-gray-600">Demographics, genetics, current medications</div>
                      </div>
                      <Database className="h-5 w-5 text-blue-600" />
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Analyze Drug Interactions</div>
                        <div className="text-sm text-gray-600">AI-powered screening against clinical evidence</div>
                      </div>
                      <Brain className="h-5 w-5 text-orange-600" />
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Detect High-Risk Interactions</div>
                        <div className="text-sm text-gray-600">Real-time alerts with severity scoring</div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">4</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">Recommend Alternatives</div>
                        <div className="text-sm text-gray-600">Evidence-based dosing and substitutions</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Problem → Solution Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Problem */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  The Challenge in Oncology Medication Safety
                </h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    Cancer patients receive an average of <strong>12+ concurrent medications</strong>, creating complex 
                    interaction risks that standard drug databases don't adequately address.
                  </p>
                  <p>
                    Oncology-specific protocols, novel agents, and patient comorbidities require specialized 
                    clinical decision support that goes beyond generic drug interaction checkers.
                  </p>
                </div>
                
                {/* Problem Stats */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-700"><strong>Complex polypharmacy</strong> in cancer treatment</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-700"><strong>Novel agents</strong> with limited interaction data</span>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-700"><strong>Patient-specific factors</strong> affecting drug metabolism</span>
                  </div>
                </div>
              </div>

              {/* Solution */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Evidence-Based Clinical Decision Support
                </h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>
                    OncoSafeRx provides <strong>real-time analysis</strong> of drug interactions specifically 
                    validated for oncology practice.
                  </p>
                  <p>
                    Our clinical engine integrates FDA drug labels, NCCN guidelines, and peer-reviewed 
                    oncology research to deliver actionable safety recommendations for cancer care teams.
                  </p>
                </div>

                {/* Solution Benefits */}
                <div className="mt-8 space-y-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700"><strong>Oncology-specific</strong> interaction analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700"><strong>Real-time alerts</strong> at point of care</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700"><strong>Evidence-based recommendations</strong> from clinical literature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target User Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Built for Oncology Healthcare Professionals
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Designed specifically for the unique needs of cancer care teams and the complexity 
                of oncology medication management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Oncologists */}
              <Card className="p-6 text-center bg-white hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Oncologists</h3>
                <p className="text-gray-600 text-sm">
                  Access comprehensive interaction analysis for novel cancer therapies and combination regimens
                </p>
              </Card>

              {/* Clinical Pharmacists */}
              <Card className="p-6 text-center bg-white hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Clinical Pharmacists</h3>
                <p className="text-gray-600 text-sm">
                  Validate dosing decisions with oncology-specific evidence and interaction data
                </p>
              </Card>

              {/* Oncology Nurses */}
              <Card className="p-6 text-center bg-white hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-orange-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Oncology Nurses</h3>
                <p className="text-gray-600 text-sm">
                  Receive safety alerts tailored to cancer patient monitoring protocols
                </p>
              </Card>

              {/* Clinical Researchers */}
              <Card className="p-6 text-center bg-white hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="h-8 w-8 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Clinical Researchers</h3>
                <p className="text-gray-600 text-sm">
                  Leverage evidence-based tools for protocol development and patient safety oversight
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features/Outcomes Module */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Clinical-Grade Drug Safety Intelligence
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Advanced clinical capabilities designed for the complexities of oncology medication management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Real-time Screening */}
              <Card className="p-8 bg-white border border-gray-200 hover:border-blue-200 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-blue-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Real-time Interaction Screening</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Immediate analysis of drug-drug, drug-disease, and drug-food interactions using 
                  oncology-validated algorithms
                </p>
              </Card>

              {/* Evidence-Based Recommendations */}
              <Card className="p-8 bg-white border border-gray-200 hover:border-green-200 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Evidence-Based Recommendations</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Clinical guidance derived from FDA labels, CPIC guidelines, and peer-reviewed 
                  oncology literature
                </p>
              </Card>

              {/* Severity-Graded Alerts */}
              <Card className="p-8 bg-white border border-gray-200 hover:border-orange-200 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                  <AlertTriangle className="h-6 w-6 text-orange-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Severity-Graded Alerts</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Prioritized warnings with clinical context specific to cancer patient populations
                </p>
              </Card>

              {/* Dosing Support */}
              <Card className="p-8 bg-white border border-gray-200 hover:border-purple-200 transition-colors">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-purple-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dosing Support</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Pharmacogenomic-informed dosing recommendations for chemotherapy and supportive 
                  care medications
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Evidence & Credibility Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Validated by Research, Trusted by Clinicians
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built on peer-reviewed clinical evidence and validated through rigorous testing 
                with leading oncology centers nationwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Clinical Evidence */}
              <Card className="p-8 text-center bg-white">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Clinical Evidence Base</h3>
                <p className="text-gray-600 mb-4">
                  Built on CPIC guidelines, FDA drug labels, and peer-reviewed pharmacogenomic research 
                  from leading medical journals.
                </p>
                <div className="text-sm text-blue-700 font-semibold">15+ Clinical Studies Referenced</div>
              </Card>

              {/* Regulatory Compliance */}
              <Card className="p-8 text-center bg-white">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Regulatory Standards</h3>
                <p className="text-gray-600 mb-4">
                  HIPAA compliant, FDA 21 CFR Part 11 ready, and designed to meet clinical quality 
                  standards for healthcare technology.
                </p>
                <div className="text-sm text-green-700 font-semibold">Enterprise Security Certified</div>
              </Card>

              {/* Clinical Validation */}
              <Card className="p-8 text-center bg-white">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-orange-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Clinical Validation</h3>
                <p className="text-gray-600 mb-4">
                  Validated through pilot programs with leading cancer centers, demonstrating 
                  measurable improvements in medication safety.
                </p>
                <div className="text-sm text-orange-700 font-semibold">IRB Approved Studies</div>
              </Card>
            </div>

            {/* Compliance Badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 py-8 border-t border-gray-200">
              <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
                <Lock className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
                <Shield className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-700">FDA 21 CFR Part 11</span>
              </div>
              <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
                <CheckCircle className="h-5 w-5 text-gray-600 mr-2" />
                <span className="font-semibold text-gray-700">SOC 2 Type II</span>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical Testimonial */}
        <section className="py-20 bg-blue-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl italic mb-8 leading-relaxed">
                "OncoSafeRx has fundamentally changed how we approach medication safety in our practice. 
                The clinical decision support is invaluable, and the pharmacogenomic insights have prevented 
                several serious adverse events. This is evidence-based medicine at its best."
              </blockquote>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Dr. Sarah M. Johnson, MD, PhD</div>
                <div className="text-blue-200">Chief of Medical Oncology</div>
                <div className="text-blue-200">Regional Cancer Institute</div>
              </div>
            </div>
          </div>
        </section>

        {/* About & Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About OncoSafeRx</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Founded by healthcare technology experts with deep clinical experience, 
                  OncoSafeRx emerged from the urgent need to address medication safety in oncology care.
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Our mission is to empower safer oncology care through evidence-based drug interaction 
                  intelligence, trusted by healthcare innovators worldwide.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Evidence-Based Foundation</h4>
                      <p className="text-gray-600">Built on peer-reviewed research and clinical guidelines</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Clinical Expertise</h4>
                      <p className="text-gray-600">Developed in partnership with leading oncologists and pharmacists</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Continuous Innovation</h4>
                      <p className="text-gray-600">Regularly updated with latest clinical evidence and guidelines</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Clinical Advisory Board</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-blue-700">SJ</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Sarah Johnson, MD, PhD</div>
                      <div className="text-sm text-gray-600">Medical Oncology, Pharmacogenomics</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-green-700">MC</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Michael Chen, PharmD</div>
                      <div className="text-sm text-gray-600">Clinical Pharmacy, Drug Interactions</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      <span className="font-bold text-orange-700">AR</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Dr. Anna Rodriguez, MD</div>
                      <div className="text-sm text-gray-600">Hematology-Oncology, Clinical Research</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Transform Your Clinical Practice with Evidence-Based Drug Intelligence
            </h2>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Join leading oncology centers using OncoSafeRx to enhance medication safety, 
              improve patient outcomes, and advance precision medicine.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 px-10 py-4 text-lg font-bold">
                Request Clinical Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-10 py-4 text-lg font-bold"
              >
                Download Research Brief
              </Button>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-blue-200">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                IRB Approved Studies
              </div>
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Enterprise Security
              </div>
              <div className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Real-time Clinical Support
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Measurable Outcomes
              </div>
            </div>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className="bg-gray-900 text-gray-300 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-base">OS</span>
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">OncoSafeRx</span>
                    <div className="text-sm text-gray-400">Clinical Decision Support</div>
                  </div>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Evidence-based drug interaction intelligence for oncology teams. 
                  Advancing medication safety through clinical innovation.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">© 2024 OncoSafeRx</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-500">Clinical Technology for Healthcare Professionals</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Clinical Resources</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/research" className="text-gray-400 hover:text-white">Clinical Studies</Link></li>
                  <li><Link to="/documentation" className="text-gray-400 hover:text-white">API Documentation</Link></li>
                  <li><Link to="/guidelines" className="text-gray-400 hover:text-white">Clinical Guidelines</Link></li>
                  <li><Link to="/validation" className="text-gray-400 hover:text-white">Validation Studies</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact Clinical Team</Link></li>
                  <li><Link to="/training" className="text-gray-400 hover:text-white">Training Resources</Link></li>
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-500 text-sm">
                This platform is intended for healthcare professionals only. 
                Clinical decisions should always be made in consultation with qualified medical professionals.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ClinicalLandingPage;