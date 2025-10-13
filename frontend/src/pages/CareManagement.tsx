import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import { Users, Calendar, Pill, Heart, Clock, Bell, MessageSquare, Phone, MapPin, Activity, AlertTriangle, CheckCircle, User, FileText, Stethoscope } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  relationship: string;
  diagnosis: string;
  stage: string;
  treatmentPlan: string;
  nextAppointment: string;
  medications: number;
  lastUpdate: string;
  status: 'stable' | 'improving' | 'concerning';
}

interface Appointment {
  id: string;
  type: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

interface CareTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  category: 'medication' | 'appointment' | 'care' | 'admin';
}

const CareManagement: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;

  const [selectedTab, setSelectedTab] = useState<'overview' | 'appointments' | 'medications' | 'tasks'>('overview');

  // Mock patient data - in real app this would come from API
  const patient: Patient = {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Mother',
    diagnosis: 'Breast Cancer',
    stage: 'Stage II',
    treatmentPlan: 'Chemotherapy + Surgery',
    nextAppointment: '2024-10-15',
    medications: 4,
    lastUpdate: '2024-10-11',
    status: 'stable'
  };

  const upcomingAppointments: Appointment[] = [
    {
      id: '1',
      type: 'Oncology Consultation',
      provider: 'Dr. Sarah Smith',
      date: '2024-10-15',
      time: '10:00 AM',
      location: 'Cancer Center - Building A, Room 205',
      notes: 'Bring medication list and recent lab results'
    },
    {
      id: '2',
      type: 'Chemotherapy Session',
      provider: 'Infusion Center',
      date: '2024-10-18',
      time: '9:00 AM',
      location: 'Cancer Center - Infusion Suite',
      notes: 'Pre-medications at 8:30 AM'
    },
    {
      id: '3',
      type: 'Lab Work',
      provider: 'Laboratory',
      date: '2024-10-20',
      time: '8:00 AM',
      location: 'Cancer Center - Lab',
      notes: 'Fasting required'
    }
  ];

  const careTasks: CareTask[] = [
    {
      id: '1',
      title: 'Prepare for oncology appointment',
      description: 'Gather recent lab results, medication list, and list of questions',
      dueDate: '2024-10-14',
      priority: 'high',
      completed: false,
      category: 'appointment'
    },
    {
      id: '2',
      title: 'Pick up prescription refills',
      description: 'Anti-nausea medication and pain management prescription',
      dueDate: '2024-10-13',
      priority: 'high',
      completed: false,
      category: 'medication'
    },
    {
      id: '3',
      title: 'Schedule follow-up with surgeon',
      description: 'Book post-chemotherapy surgical consultation',
      dueDate: '2024-10-16',
      priority: 'medium',
      completed: false,
      category: 'appointment'
    },
    {
      id: '4',
      title: 'Update insurance information',
      description: 'Verify coverage for upcoming treatments',
      dueDate: '2024-10-17',
      priority: 'medium',
      completed: true,
      category: 'admin'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-600';
      case 'improving': return 'bg-blue-100 text-blue-600';
      case 'concerning': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'low': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication': return Pill;
      case 'appointment': return Calendar;
      case 'care': return Heart;
      case 'admin': return FileText;
      default: return CheckCircle;
    }
  };

  const pendingTasks = careTasks.filter(task => !task.completed);
  const completedTasks = careTasks.filter(task => task.completed);

  const tabs: Array<{ id: 'overview' | 'appointments' | 'medications' | 'tasks'; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'tasks', label: 'Care Tasks', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Care Management</h1>
          <p className="text-gray-600 mt-1">Coordinate and manage care for {patient.name}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Contact Care Team
        </button>
      </div>

      {/* Patient Status Card */}
      <Card>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{patient.name}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                {patient.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600"><strong>Relationship:</strong> {patient.relationship}</p>
                <p className="text-gray-600"><strong>Diagnosis:</strong> {patient.diagnosis}</p>
                <p className="text-gray-600"><strong>Stage:</strong> {patient.stage}</p>
              </div>
              <div>
                <p className="text-gray-600"><strong>Treatment:</strong> {patient.treatmentPlan}</p>
                <p className="text-gray-600"><strong>Active Medications:</strong> {patient.medications}</p>
                <p className="text-gray-600"><strong>Last Update:</strong> {new Date(patient.lastUpdate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600"><strong>Next Appointment:</strong></p>
                <p className="text-lg font-semibold text-blue-600">{new Date(patient.nextAppointment).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Call Provider</h3>
              <p className="text-gray-600 text-sm">Quick contact</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Schedule</h3>
              <p className="text-gray-600 text-sm">Book appointment</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Medications</h3>
              <p className="text-gray-600 text-sm">Manage meds</p>
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Reminders</h3>
              <p className="text-gray-600 text-sm">Set alerts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Important Alerts */}
      <Alert type="warning" title="Upcoming Lab Work">
        Lab work scheduled for Oct 20th requires fasting. No food or drink (except water) after midnight.
      </Alert>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`group inline-flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Appointments */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Appointments</h3>
                  <div className="space-y-3">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{appointment.type}</h4>
                          <span className="text-sm text-gray-500">{new Date(appointment.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{appointment.provider}</p>
                        <p className="text-gray-500 text-sm">{appointment.time}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Pending Tasks */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
                  <div className="space-y-3">
                    {pendingTasks.slice(0, 3).map((task) => {
                      const Icon = getCategoryIcon(task.category);
                      return (
                        <div key={task.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-0.5">
                            <Icon className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900">{task.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{task.description}</p>
                            <p className="text-gray-500 text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* Care Coordination */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Team Communication</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Stay Connected</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Keep the care team updated on {patient.name}'s condition, side effects, and any concerns. 
                        Regular communication helps ensure the best possible care.
                      </p>
                      <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Send Update to Care Team
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Appointments Tab */}
          {selectedTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Schedule New
                </button>
              </div>

              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{appointment.type}</h4>
                          <p className="text-gray-600">{appointment.provider}</p>
                          <div className="mt-2 space-y-1 text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <strong>Note:</strong> {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Reschedule
                        </button>
                        <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Medications Tab */}
          {selectedTab === 'medications' && (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Medication Management</h3>
              <p className="text-gray-600 mb-4">
                View and manage {patient.name}'s medications, dosing schedules, and side effects.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                View Medications
              </button>
            </div>
          )}

          {/* Tasks Tab */}
          {selectedTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Care Tasks</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add Task
                </button>
              </div>

              {/* Pending Tasks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pending ({pendingTasks.length})</h4>
                <div className="space-y-3">
                  {pendingTasks.map((task) => {
                    const Icon = getCategoryIcon(task.category);
                    return (
                      <Card key={task.id}>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-medium text-gray-900">{task.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                {task.priority} priority
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            <p className="text-gray-500 text-xs">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          </div>
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Mark Complete
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recently Completed</h4>
                  <div className="space-y-3">
                    {completedTasks.map((task) => {
                      const Icon = getCategoryIcon(task.category);
                      return (
                        <Card key={task.id} className="bg-gray-50">
                          <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-gray-700">{task.title}</h5>
                                <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                                  Completed
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">{task.description}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareManagement;
