import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { Pill, Clock, AlertTriangle, CheckCircle, Calendar, Bell, Info, Plus, Edit, Trash2 } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions: string;
  sideEffects?: string[];
  isActive: boolean;
  nextDose?: string;
  adherence?: number;
}

const MyMedications: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  // Mock medication data for patient view
  const [medications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Carboplatin',
      dosage: '400mg',
      frequency: 'Every 3 weeks',
      startDate: '2024-01-15',
      prescribedBy: 'Dr. Smith',
      instructions: 'Administered intravenously over 30-60 minutes',
      sideEffects: ['Fatigue', 'Nausea', 'Hair loss'],
      isActive: true,
      nextDose: '2024-10-15',
      adherence: 95
    },
    {
      id: '2',
      name: 'Ondansetron',
      dosage: '8mg',
      frequency: 'Twice daily as needed',
      startDate: '2024-01-15',
      prescribedBy: 'Dr. Smith',
      instructions: 'Take 30 minutes before meals or at first sign of nausea',
      sideEffects: ['Headache', 'Constipation'],
      isActive: true,
      adherence: 88
    },
    {
      id: '3',
      name: 'Prednisone',
      dosage: '10mg',
      frequency: 'Once daily',
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      prescribedBy: 'Dr. Johnson',
      instructions: 'Take with food to reduce stomach irritation',
      sideEffects: ['Increased appetite', 'Difficulty sleeping'],
      isActive: false,
      adherence: 92
    }
  ]);

  const activeMedications = medications.filter(med => med.isActive);
  const completedMedications = medications.filter(med => !med.isActive);

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 90) return 'text-green-600 bg-green-100';
    if (adherence >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
          <p className="text-gray-600 mt-1">Track your current medications and treatment plan</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Medications</p>
              <p className="text-2xl font-bold text-gray-900">{activeMedications.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(activeMedications.reduce((sum, med) => sum + (med.adherence || 0), 0) / activeMedications.length || 0)}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Dose</p>
              <p className="text-lg font-semibold text-gray-900">
                {activeMedications.find(med => med.nextDose) ? 'Today' : 'None scheduled'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Important Notice */}
      <Alert type="info" title="Important">
        Always take your medications exactly as prescribed by your healthcare team. If you experience any concerning side effects or have questions, contact your care team immediately.
      </Alert>

      {/* Active Medications */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Active Medications</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Tap medication for details</span>
          </div>
        </div>

        {activeMedications.length > 0 ? (
          <div className="space-y-4">
            {activeMedications.map((medication) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{medication.name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                      {medication.adherence && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getAdherenceColor(medication.adherence)}`}>
                          {medication.adherence}% adherence
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Dosage:</strong> {medication.dosage}
                        </p>
                        <p className="text-gray-600">
                          <strong>Frequency:</strong> {medication.frequency}
                        </p>
                        <p className="text-gray-600">
                          <strong>Prescribed by:</strong> {medication.prescribedBy}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Started:</strong> {formatDate(medication.startDate)}
                        </p>
                        {medication.nextDose && (
                          <p className="text-gray-600">
                            <strong>Next dose:</strong> {formatDate(medication.nextDose)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-700 text-sm">{medication.instructions}</p>
                    </div>

                    {medication.sideEffects && medication.sideEffects.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-900 mb-1">Common side effects:</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.map((effect, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No active medications</p>
          </div>
        )}
      </Card>

      {/* Completed/Previous Medications */}
      {completedMedications.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Previous Medications</h2>
          <div className="space-y-4">
            {completedMedications.map((medication) => (
              <div key={medication.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-700">{medication.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Completed</span>
                      {medication.adherence && (
                        <span className={`px-2 py-1 text-xs rounded-full ${getAdherenceColor(medication.adherence)}`}>
                          {medication.adherence}% adherence
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Dosage:</strong> {medication.dosage}
                        </p>
                        <p className="text-gray-600">
                          <strong>Duration:</strong> {formatDate(medication.startDate)} - {medication.endDate ? formatDate(medication.endDate) : 'Ongoing'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Prescribed by:</strong> {medication.prescribedBy}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Medication Reminders */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Medication Reminders</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Set up medication reminders</h3>
              <p className="text-blue-700 text-sm mt-1">
                Never miss a dose! Set up notifications on your phone or use a pill organizer to stay on track with your medication schedule.
              </p>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Contact Care Team */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">Contact Your Care Team</h3>
              <p className="text-green-700 text-sm mt-1">
                Have questions about your medications or experiencing side effects? Your care team is here to help.
              </p>
              <div className="mt-3 space-x-3">
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                  Message Care Team
                </button>
                <button className="px-4 py-2 border border-green-600 text-green-600 text-sm rounded-lg hover:bg-green-50">
                  Call Emergency Line
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MyMedications;