import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import Card from '../components/UI/Card';
import Alert from '../components/UI/Alert';
import AppointmentRequestForm, { AppointmentRequestData } from '../components/Forms/AppointmentRequestForm';
import { Calendar, Clock, MapPin, User, Phone, Plus, Video, MessageSquare, Bell, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface Appointment {
  id: string;
  title: string;
  type: 'consultation' | 'treatment' | 'lab' | 'imaging' | 'follow-up';
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  preparationInstructions?: string[];
  isVirtual: boolean;
  reminder: boolean;
}

const MyAppointments: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const { state: patientState, actions } = usePatient();
  const { currentPatient } = patientState;

  const [selectedView, setSelectedView] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  // Button handlers
  const handleRequestAppointment = () => {
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = (data: AppointmentRequestData) => {
    if (!currentPatient) {
      alert('No patient selected. Please select a patient first.');
      return;
    }

    console.log('Appointment request submitted:', data);
    
    // Create new appointment from request data
    const newAppointment = {
      id: crypto.randomUUID(),
      title: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Appointment`,
      type: data.type as 'consultation' | 'treatment' | 'lab' | 'imaging' | 'follow-up',
      provider: data.provider,
      date: data.preferredDates[0] || new Date().toISOString().split('T')[0],
      time: data.preferredTimes[0] || '10:00 AM',
      duration: '60 minutes',
      location: 'To be confirmed',
      status: 'requested' as const,
      notes: data.reason,
      preparationInstructions: [],
      isVirtual: false,
      reminder: true,
      createdBy: user?.id || 'patient',
      createdAt: new Date().toISOString(),
      requestData: {
        reason: data.reason,
        urgency: data.urgency,
        preferredDates: data.preferredDates,
        preferredTimes: data.preferredTimes,
        additionalNotes: data.additionalNotes
      }
    };

    // Add appointment to patient's appointments
    const updatedAppointments = [...(currentPatient.appointments || []), newAppointment];
    actions.updatePatientData({ appointments: updatedAppointments });

    alert(`Appointment request submitted successfully!\n\nType: ${data.type}\nProvider: ${data.provider}\nReason: ${data.reason}\n\nYour request will be reviewed and you'll receive a confirmation within 24 hours.`);
    setShowAppointmentForm(false);
  };

  const handleViewDetails = (appointmentId: string) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      alert(`Appointment Details:\n\nType: ${appointment.title}\nProvider: ${appointment.provider}\nDate: ${new Date(appointment.date).toLocaleDateString()}\nTime: ${appointment.time}\nLocation: ${appointment.location}\nStatus: ${appointment.status}\n\nNotes: ${appointment.notes || 'None'}\n\nPreparation Instructions:\n• ${appointment.preparationInstructions?.join('\n• ') || 'None'}`);
    }
  };

  const handleJoinMeeting = (appointmentId: string) => {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment?.isVirtual) {
      if (confirm(`Join virtual meeting for ${appointment.title}?\n\nThis will open the video call in a new window.`)) {
        alert('Opening virtual meeting room...\n\nIn a real implementation, this would:\n• Open video conferencing platform\n• Connect you with your healthcare provider\n• Enable secure, HIPAA-compliant communication');
      }
    }
  };

  const handleReschedule = (appointmentId: string) => {
    if (!currentPatient) return;
    
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment && confirm(`Reschedule ${appointment.title}?\n\nThis will send a rescheduling request to your care team.`)) {
      const updatedAppointments = currentPatient.appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, notes: (apt.notes || '') + '\n[Rescheduling requested by patient]' }
          : apt
      );
      actions.updatePatientData({ appointments: updatedAppointments });
      alert('Rescheduling request sent successfully!\n\nYour care team will contact you within 24 hours with available alternative times.');
    }
  };

  const handleCancel = (appointmentId: string) => {
    if (!currentPatient) return;
    
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment && confirm(`Cancel ${appointment.title} on ${new Date(appointment.date).toLocaleDateString()}?\n\nThis action cannot be undone.`)) {
      const updatedAppointments = currentPatient.appointments.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled' as const }
          : apt
      );
      actions.updatePatientData({ appointments: updatedAppointments });
      alert('Appointment cancelled successfully.\n\nYou will receive a confirmation email shortly. If you need to reschedule, please contact your care team.');
    }
  };

  const handleMessageCareTeam = () => {
    const message = `I would like to discuss my upcoming appointments and any questions I have about my treatment plan.`;
    if (confirm(`Send this message to your care team?\n\n"${message}"`)) {
      alert('Message sent to your care team successfully!\n\nThey will respond within 24 hours during business days.');
    }
  };

  const handleCallOffice = () => {
    if (confirm('Call your healthcare provider office?\n\nOffice Hours: Monday-Friday 8:00 AM - 5:00 PM\nEmergency Line: Available 24/7')) {
      alert('Calling office...\n\nIn a real implementation, this would initiate a phone call to your provider\'s office.');
    }
  };

  // Get appointments from current patient or default to sample data
  const sampleAppointments: Appointment[] = [
    {
      id: '1',
      title: 'Oncology Consultation',
      type: 'consultation',
      provider: 'Dr. Sarah Smith',
      date: '2024-10-15',
      time: '10:00 AM',
      duration: '60 minutes',
      location: 'Cancer Center - Building A, Room 205',
      status: 'confirmed',
      notes: 'Discuss treatment progress and next steps',
      preparationInstructions: [
        'Bring current medication list',
        'Bring recent lab results',
        'Prepare list of questions or concerns'
      ],
      isVirtual: false,
      reminder: true
    },
    {
      id: '2',
      title: 'Chemotherapy Session',
      type: 'treatment',
      provider: 'Infusion Center Team',
      date: '2024-10-18',
      time: '9:00 AM',
      duration: '4 hours',
      location: 'Cancer Center - Infusion Suite',
      status: 'scheduled',
      notes: 'Cycle 3 of current treatment protocol',
      preparationInstructions: [
        'Take pre-medications as prescribed',
        'Eat a light breakfast',
        'Bring entertainment for long session',
        'Arrange transportation home'
      ],
      isVirtual: false,
      reminder: true
    },
    {
      id: '3',
      title: 'Lab Work - CBC & CMP',
      type: 'lab',
      provider: 'Laboratory Services',
      date: '2024-10-20',
      time: '8:00 AM',
      duration: '30 minutes',
      location: 'Cancer Center - Laboratory',
      status: 'scheduled',
      preparationInstructions: [
        'Fasting required - no food after midnight',
        'Water is allowed'
      ],
      isVirtual: false,
      reminder: true
    },
    {
      id: '4',
      title: 'Nutritionist Consultation',
      type: 'consultation',
      provider: 'Lisa Martinez, RD',
      date: '2024-10-22',
      time: '2:00 PM',
      duration: '45 minutes',
      location: 'Virtual Meeting',
      status: 'scheduled',
      notes: 'Discuss nutrition during treatment',
      isVirtual: true,
      reminder: true
    },
    {
      id: '5',
      title: 'Oncology Check-up',
      type: 'follow-up',
      provider: 'Dr. Sarah Smith',
      date: '2024-09-15',
      time: '11:00 AM',
      duration: '45 minutes',
      location: 'Cancer Center - Building A, Room 205',
      status: 'completed',
      notes: 'Treatment response evaluation',
      isVirtual: false,
      reminder: false
    }
  ];

  // Use patient appointments if available, otherwise show sample data
  const appointments = currentPatient?.appointments?.length ? 
    currentPatient.appointments : 
    sampleAppointments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-600';
      case 'scheduled': return 'bg-blue-100 text-blue-600';
      case 'requested': return 'bg-yellow-100 text-yellow-600';
      case 'completed': return 'bg-gray-100 text-gray-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return User;
      case 'treatment': return Plus;
      case 'lab': return CheckCircle;
      case 'imaging': return Calendar;
      case 'follow-up': return User;
      default: return Calendar;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-600';
      case 'treatment': return 'bg-purple-100 text-purple-600';
      case 'lab': return 'bg-green-100 text-green-600';
      case 'imaging': return 'bg-orange-100 text-orange-600';
      case 'follow-up': return 'bg-teal-100 text-teal-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const today = new Date();
  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= today && apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < today || apt.status === 'completed'
  );

  const getFilteredAppointments = () => {
    switch (selectedView) {
      case 'upcoming': return upcomingAppointments;
      case 'past': return pastAppointments;
      case 'all': return appointments;
      default: return upcomingAppointments;
    }
  };

  const nextAppointment = upcomingAppointments.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your upcoming and past appointments</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4 inline mr-2" />
          Request Appointment
        </button>
      </div>

      {/* Next Appointment Alert */}
      {nextAppointment && (
        <Alert type="info" title="Next Appointment">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{nextAppointment.title}</p>
              <p className="text-sm">{new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}</p>
              <p className="text-sm text-gray-600">{nextAppointment.provider}</p>
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                View Details
              </button>
              {nextAppointment.isVirtual && (
                <button 
                  onClick={() => handleJoinMeeting(nextAppointment.id)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  <Video className="w-4 h-4 inline mr-1" />
                  Join
                </button>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => {
                  const aptDate = new Date(apt.date);
                  return aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear();
                }).length}
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
              <p className="text-sm text-gray-600">Reminders Set</p>
              <p className="text-2xl font-bold text-gray-900">
                {appointments.filter(apt => apt.reminder).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* View Filters */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {['upcoming', 'past', 'all'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              selectedView === view
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)} 
            {view === 'upcoming' && ` (${upcomingAppointments.length})`}
            {view === 'past' && ` (${pastAppointments.length})`}
            {view === 'all' && ` (${appointments.length})`}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {getFilteredAppointments().length > 0 ? (
          getFilteredAppointments().map((appointment) => {
            const TypeIcon = getTypeIcon(appointment.type);
            return (
              <Card key={appointment.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getTypeColor(appointment.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.isVirtual && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                            Virtual
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{appointment.provider}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time} ({appointment.duration})</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                          {appointment.reminder && (
                            <div className="flex items-center space-x-2">
                              <Bell className="w-4 h-4" />
                              <span>Reminder set</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {appointment.notes && (
                        <p className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded-lg">
                          <Info className="w-4 h-4 inline mr-2" />
                          {appointment.notes}
                        </p>
                      )}

                      {appointment.preparationInstructions && appointment.preparationInstructions.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Preparation Instructions:</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {appointment.preparationInstructions.map((instruction, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{instruction}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {appointment.status === 'scheduled' || appointment.status === 'confirmed' ? (
                      <>
                        <button 
                          onClick={() => handleViewDetails(appointment.id)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View Details
                        </button>
                        {appointment.isVirtual && (
                          <button 
                            onClick={() => handleJoinMeeting(appointment.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <Video className="w-4 h-4 inline mr-1" />
                            Join Meeting
                          </button>
                        )}
                        <button 
                          onClick={() => handleReschedule(appointment.id)}
                          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(appointment.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleViewDetails(appointment.id)}
                        className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600 mb-4">
                {selectedView === 'upcoming' 
                  ? "You don't have any upcoming appointments scheduled."
                  : selectedView === 'past'
                  ? "No past appointments found."
                  : "No appointments found."
                }
              </p>
              <button 
                onClick={handleRequestAppointment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Request New Appointment
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleRequestAppointment}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Request Appointment</span>
          </button>
          
          <button 
            onClick={handleMessageCareTeam}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Message Care Team</span>
          </button>
          
          <button 
            onClick={handleCallOffice}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Phone className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Call Office</span>
          </button>
        </div>
      </Card>

      {/* Appointment Request Form */}
      <AppointmentRequestForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        onSubmit={handleAppointmentSubmit}
      />
    </div>
  );
};

export default MyAppointments;