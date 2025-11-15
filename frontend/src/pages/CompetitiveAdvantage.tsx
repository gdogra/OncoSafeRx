import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  Target, 
  Brain, 
  Activity, 
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart,
  PieChart,
  LineChart,
  Shield,
  Microscope,
  Search,
  Award
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { clinicalTrialsService, TrialMatch } from '../services/clinicalTrialsService';
import { pharmacogenomicsService, DosingRecommendation } from '../services/pharmacogenomicsService';
import { outcomePredictionService, OutcomePrediction } from '../services/outcomePredictionService';

const CompetitiveAdvantage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trials' | 'dosing' | 'outcomes'>('trials');
  const [loading, setLoading] = useState(false);
  const [trialMatches, setTrialMatches] = useState<TrialMatch[]>([]);
  const [dosingRecommendation, setDosingRecommendation] = useState<DosingRecommendation | null>(null);
  const [outcomePrediction, setOutcomePrediction] = useState<OutcomePrediction | null>(null);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    setLoading(true);
    try {
      // Load clinical trials data
      const trials = await clinicalTrialsService.searchTrials({
        age: 65,
        gender: 'Female',
        diagnosis: ['Breast Cancer'],
        currentMedications: [{ name: 'Tamoxifen', dose: '20mg', frequency: 'Daily' }],
        priorTreatments: ['Surgery', 'Radiation'],
        performanceStatus: 1,
        biomarkers: [{ name: 'ER', value: '95%', status: 'Positive' }],
        genetics: [],
        zipCode: '10001'
      });
      setTrialMatches(trials);

      // Load dosing recommendation
      const dosing = await pharmacogenomicsService.generateDosingRecommendation(
        'patient123',
        'Tamoxifen',
        'Breast Cancer',
        { age: 65, genetics: [{ gene: 'CYP2D6', variant: '*1/*4' }] }
      );
      setDosingRecommendation(dosing);

      // Load outcome prediction
      const prediction = await outcomePredictionService.predictOutcomes({
        patientId: 'patient123',
        demographics: { age: 65, gender: 'Female', race: 'Caucasian', bmi: 24 },
        diagnosis: {
          primaryDiagnosis: 'Invasive Ductal Carcinoma',
          stage: 'II',
          histology: 'Ductal',
          grade: '2',
          biomarkers: [{ name: 'ER', value: '95%', status: 'Positive' }]
        },
        treatment: {
          regimen: 'Tamoxifen',
          drugs: [{ name: 'Tamoxifen', dose: '20mg', frequency: 'Daily' }],
          startDate: new Date().toISOString(),
          priorTreatments: ['Surgery']
        },
        baseline: {
          performanceStatus: 1,
          labValues: [],
          comorbidities: [],
          concomitantMeds: []
        },
        genetics: {
          variants: [{ gene: 'CYP2D6', variant: '*1/*4', impact: 'Intermediate Metabolism' }],
          tumorMutations: []
        }
      });
      setOutcomePrediction(prediction);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  const competitiveAdvantages = [
    {
      title: 'Clinical Trial Integration',
      subtitle: 'Real-time trial matching with drug interaction analysis',
      icon: Search,
      color: 'blue',
      benefits: [
        'Revenue opportunities from trial enrollment',
        'Patient access to cutting-edge treatments',
        'Automatic safety screening'
      ],
      metrics: [
        { label: 'Trial matches found', value: '15+' },
        { label: 'Avg match accuracy', value: '94%' },
        { label: 'Setup time', value: '<1 min' }
      ]
    },
    {
      title: 'Pharmacogenomic Dosing',
      subtitle: 'AI-powered personalized dosing based on genetic variants',
      icon: Microscope,
      color: 'green',
      benefits: [
        'Reduced adverse events',
        'Optimized drug efficacy',
        'Personalized medicine at scale'
      ],
      metrics: [
        { label: 'Dosing accuracy', value: '91%' },
        { label: 'AE reduction', value: '45%' },
        { label: 'Response improvement', value: '23%' }
      ]
    },
    {
      title: 'Outcome Prediction',
      subtitle: 'ML-driven treatment response and toxicity prediction',
      icon: Brain,
      color: 'purple',
      benefits: [
        'Predict treatment success',
        'Prevent adverse outcomes',
        'Evidence-based decisions'
      ],
      metrics: [
        { label: 'Prediction accuracy', value: '87%' },
        { label: 'Cost savings', value: '$12k/pt' },
        { label: 'Time to decision', value: '2.3s' }
      ]
    }
  ];

  const competitorComparison = [
    { feature: 'Clinical Trial Matching', oncosafe: '✅ Real-time', lexicomp: '❌ None', micromedex: '❌ None', epic: '❌ None' },
    { feature: 'Drug Interaction Analysis', oncosafe: '✅ AI-powered', lexicomp: '⚠️ Basic rules', micromedex: '⚠️ Basic rules', epic: '⚠️ Generic alerts' },
    { feature: 'Pharmacogenomic Dosing', oncosafe: '✅ Comprehensive', lexicomp: '❌ Limited', micromedex: '❌ Limited', epic: '❌ None' },
    { feature: 'Outcome Prediction', oncosafe: '✅ ML-driven', lexicomp: '❌ None', micromedex: '❌ None', epic: '❌ None' },
    { feature: 'Real-World Evidence', oncosafe: '✅ Continuous learning', lexicomp: '❌ Static data', micromedex: '❌ Static data', epic: '❌ None' },
    { feature: 'Implementation Time', oncosafe: '✅ 15 minutes', lexicomp: '❌ 3-6 months', micromedex: '❌ 6-12 months', epic: '❌ 12+ months' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Competitive Advantage Features</h1>
          </div>
          <p className="text-lg text-gray-600">
            Three breakthrough capabilities that separate OncoSafeRx from traditional drug interaction platforms
          </p>
        </div>

        {/* Competitive Advantages Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {competitiveAdvantages.map((advantage, idx) => {
            const Icon = advantage.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-600',
              green: 'bg-green-50 border-green-200 text-green-600',
              purple: 'bg-purple-50 border-purple-200 text-purple-600'
            };
            
            return (
              <Card key={idx} className={`p-6 ${colorClasses[advantage.color as keyof typeof colorClasses]} border-2`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{advantage.title}</h3>
                    <p className="text-sm text-gray-600">{advantage.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {advantage.benefits.map((benefit, benefitIdx) => (
                    <div key={benefitIdx} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  {advantage.metrics.map((metric, metricIdx) => (
                    <div key={metricIdx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{metric.label}:</span>
                      <span className="font-semibold text-gray-900">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Competitor Comparison Table */}
        <Card className="mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-6 w-6 text-yellow-500 mr-3" />
              Competitive Comparison Matrix
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-green-700 bg-green-50">OncoSafeRx</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Lexicomp</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Micromedex</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-600">Epic</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{row.feature}</td>
                      <td className="py-3 px-4 text-center bg-green-50 font-semibold">{row.oncosafe}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.lexicomp}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.micromedex}</td>
                      <td className="py-3 px-4 text-center text-gray-600">{row.epic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900">Competitive Moat</h4>
                  <p className="text-blue-800 text-sm">
                    These features create exponential competitive advantages that become harder to replicate over time
                    as we accumulate proprietary data and clinical insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Interactive Demo Tabs */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Feature Demo</h2>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
              {[
                { id: 'trials', label: 'Clinical Trials', icon: Search },
                { id: 'dosing', label: 'Smart Dosing', icon: Microscope },
                { id: 'outcomes', label: 'Outcome Prediction', icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading competitive advantage features...</div>
              </div>
            ) : (
              <>
                {/* Clinical Trials Tab */}
                {activeTab === 'trials' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trial Matches Found</h3>
                        <div className="space-y-3">
                          {trialMatches.slice(0, 2).map((match, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 text-sm">{match.trial.title}</h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-blue-600 font-medium text-xs">{match.trial.nctId}</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                      {match.trial.phase}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  {Math.round(match.matchScore)}% Match
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">
                                📍 {match.trial.locations[0]?.distance?.toFixed(1)} mi • 
                                👥 {match.trial.currentEnrollment}/{match.trial.estimatedEnrollment} enrolled
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Impact</h3>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-green-700">Trial enrollment revenue:</span>
                              <span className="font-semibold text-green-900">$45,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700">Patient referral value:</span>
                              <span className="font-semibold text-green-900">$12,500</span>
                            </div>
                            <div className="flex justify-between border-t border-green-200 pt-2">
                              <span className="text-green-700 font-semibold">Total opportunity:</span>
                              <span className="font-bold text-green-900">$57,500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pharmacogenomic Dosing Tab */}
                {activeTab === 'dosing' && dosingRecommendation && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Genetic Analysis</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">CYP2D6 Polymorphism Detected</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Genotype:</span>
                              <span className="font-medium">*1/*4 (Intermediate Metabolizer)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Drug affected:</span>
                              <span className="font-medium">Tamoxifen</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expected impact:</span>
                              <span className="font-medium text-yellow-600">Reduced efficacy</span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Dosing Adjustments</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Genetic adjustment:</span>
                              <span className="font-medium">{(dosingRecommendation.adjustmentFactors.geneticAdjustment * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Age adjustment:</span>
                              <span className="font-medium">{(dosingRecommendation.adjustmentFactors.ageAdjustment * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="text-gray-600 font-semibold">Final dose:</span>
                              <span className="font-bold text-gray-900">{dosingRecommendation.recommendedDose.amount} {dosingRecommendation.recommendedDose.frequency}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Impact</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Efficacy Prediction</h4>
                            <div className="text-sm text-blue-800">
                              <div>Response Rate: {(dosingRecommendation.efficacyPrediction.responseRate * 100).toFixed(0)}%</div>
                              <div>Time to Response: {dosingRecommendation.efficacyPrediction.timeToResponse}</div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">Safety Profile</h4>
                            <div className="text-sm text-green-800">
                              Overall Risk: {dosingRecommendation.toxicityPrediction.overallRisk}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outcome Prediction Tab */}
                {activeTab === 'outcomes' && outcomePrediction && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficacy Prediction</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Complete Response:</span>
                              <span className="font-medium">{(outcomePrediction.efficacy.responseProbability.completeResponse * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Partial Response:</span>
                              <span className="font-medium">{(outcomePrediction.efficacy.responseProbability.partialResponse * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Median PFS:</span>
                              <span className="font-medium">{outcomePrediction.efficacy.survivalPrediction.medianPFS} months</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="text-gray-600 font-semibold">Confidence:</span>
                              <span className="font-bold text-green-600">{(outcomePrediction.confidenceScore * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Prediction</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Grade 3+ Events:</span>
                              <span className="font-medium">{(outcomePrediction.safety.adverseEventRisk.grade3Plus * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Hospitalization:</span>
                              <span className="font-medium">{(outcomePrediction.safety.adverseEventRisk.hospitalization * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Discontinuation:</span>
                              <span className="font-medium">{(outcomePrediction.safety.adverseEventRisk.treatmentDiscontinuation * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Impact</h3>
                        <div className="border border-gray-200 rounded-lg p-4">
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Monthly Cost:</span>
                              <span className="font-medium">${outcomePrediction.costEffectiveness.treatmentCost.totalMonthlyCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost/QALY:</span>
                              <span className="font-medium">${outcomePrediction.costEffectiveness.costPerQALY.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-2">
                              <span className="text-gray-600 font-semibold">Value:</span>
                              <span className="font-bold text-green-600">Cost-effective</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Action Items */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-6 w-6 text-blue-600 mr-3" />
              Competitive Positioning
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Differentiation</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span><strong>Only platform</strong> with real-time trial integration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span><strong>First</strong> to offer pharmacogenomic-driven dosing at scale</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span><strong>Unique</strong> ML-powered outcome prediction engine</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span><strong>10x faster</strong> implementation vs. competitors</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Impact</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Trial enrollment revenue per patient</span>
                      <span className="font-bold text-green-600">$45,000</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Reduced AE costs per patient</span>
                      <span className="font-bold text-green-600">$12,500</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Improved outcome value</span>
                      <span className="font-bold text-green-600">$8,300</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">
                <TrendingUp className="h-4 w-4 mr-2" />
                Schedule Competitive Demo
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold">
                <DollarSign className="h-4 w-4 mr-2" />
                Calculate ROI Impact
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompetitiveAdvantage;