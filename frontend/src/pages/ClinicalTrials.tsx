import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Filter,
  Star,
  Clock,
  Building,
  Activity,
  Zap
} from 'lucide-react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { clinicalTrialsService, TrialMatch, ClinicalTrial, PatientProfile } from '../services/clinicalTrialsService';

const ClinicalTrials: React.FC = () => {
  const [trialMatches, setTrialMatches] = useState<TrialMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    age: 65,
    gender: 'Female',
    diagnosis: ['Breast Cancer', 'HER2-Negative'],
    currentMedications: [
      { name: 'Anastrozole', dose: '1 mg', frequency: 'Daily' },
      { name: 'Metformin', dose: '500 mg', frequency: 'Twice daily' }
    ],
    priorTreatments: ['Chemotherapy', 'Radiation therapy'],
    performanceStatus: 1,
    biomarkers: [
      { name: 'ER', value: '95%', status: 'Positive' },
      { name: 'PR', value: '80%', status: 'Positive' },
      { name: 'HER2', value: '0', status: 'Negative' }
    ],
    genetics: [],
    zipCode: '10001'
  });

  useEffect(() => {
    searchTrials();
  }, []);

  const searchTrials = async () => {
    setLoading(true);
    try {
      const matches = await clinicalTrialsService.searchTrials(patientProfile);
      setTrialMatches(matches);
    } catch (error) {
      console.error('Error searching trials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Moderate': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Trials Integration</h1>
          <p className="text-lg text-gray-600">
            Real-time trial matching with drug interaction analysis
          </p>
        </div>

        {/* Key Features Banner */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-6 w-6 text-blue-600 mr-2" />
              Competitive Advantage Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Real-time Matching</div>
                  <div className="text-sm text-gray-600">Instant trial eligibility scoring</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Drug Interaction Analysis</div>
                  <div className="text-sm text-gray-600">Trial protocol safety screening</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Outcome Tracking</div>
                  <div className="text-sm text-gray-600">Revenue opportunity identification</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Patient Summary */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Patient Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-500">Demographics</div>
                <div className="font-medium">{patientProfile.age}yo {patientProfile.gender}</div>
                <div className="text-sm text-gray-600">ECOG PS: {patientProfile.performanceStatus}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Diagnosis</div>
                <div className="font-medium">{patientProfile.diagnosis.join(', ')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Current Medications</div>
                <div className="font-medium">{patientProfile.currentMedications.length} active drugs</div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={searchTrials}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Refresh Matches'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trial Matches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Trial Matches ({trialMatches.length})
            </h2>
            
            {loading ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">Analyzing trial eligibility...</div>
              </Card>
            ) : (
              <div className="space-y-4">
                {trialMatches.map((match) => (
                  <Card 
                    key={match.trial.id} 
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTrial?.id === match.trial.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTrial(match.trial)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{match.trial.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium text-blue-600">{match.trial.nctId}</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {match.trial.phase}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(match.trial.drugInteractionRisk)}`}>
                            {match.trial.drugInteractionRisk} Risk
                          </span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(match.matchScore)}`}>
                        {Math.round(match.matchScore)}% Match
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{match.trial.sponsor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {match.trial.locations[0]?.distance?.toFixed(1)} mi away
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {match.trial.currentEnrollment}/{match.trial.estimatedEnrollment} enrolled
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{match.trial.status}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm">
                        <div className="text-gray-500 mb-1">Match Reasons:</div>
                        <ul className="text-gray-700 space-y-1">
                          {match.matchReasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {match.concerns.length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <div className="text-sm">
                          <div className="text-gray-500 mb-1">Concerns:</div>
                          <ul className="text-yellow-700 space-y-1">
                            {match.concerns.slice(0, 1).map((concern, idx) => (
                              <li key={idx} className="flex items-center">
                                <AlertTriangle className="h-3 w-3 text-yellow-500 mr-2" />
                                {concern}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Trial Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trial Details</h2>
            
            {selectedTrial ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTrial.title}</h3>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Refer Patient
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Study Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">NCT ID</div>
                        <div className="font-medium text-blue-600">{selectedTrial.nctId}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Phase</div>
                        <div className="font-medium">{selectedTrial.phase}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-medium">{selectedTrial.status}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Sponsor</div>
                        <div className="font-medium">{selectedTrial.sponsor}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Primary Endpoint</h4>
                    <p className="text-gray-700">{selectedTrial.primaryEndpoint}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Interventions</h4>
                    <div className="space-y-2">
                      {selectedTrial.interventions.map((intervention, idx) => (
                        <div key={idx} className="flex items-center">
                          <Activity className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-gray-700">{intervention}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Locations</h4>
                    <div className="space-y-2">
                      {selectedTrial.locations.map((location, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-700">{location.facility}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {location.distance?.toFixed(1)} mi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold text-yellow-800">Drug Interaction Risk</span>
                    </div>
                    <div className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(selectedTrial.drugInteractionRisk)}`}>
                      {selectedTrial.drugInteractionRisk} Risk Level
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Current medications may require modification for trial participation. 
                      Detailed interaction analysis available.
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button variant="outline" className="flex-1">
                      <Activity className="h-4 w-4 mr-2" />
                      Interaction Analysis
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Screening
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-500">Select a trial to view detailed information</div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalTrials;