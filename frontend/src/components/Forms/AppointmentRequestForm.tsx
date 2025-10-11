import React, { useState } from 'react';
import Card from '../UI/Card';
import Alert from '../UI/Alert';
import { Calendar, Clock, User, MapPin, MessageSquare, X, Check } from 'lucide-react';

interface AppointmentRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentRequestData) => void;
}

export interface AppointmentRequestData {
  type: string;
  provider: string;
  preferredDates: string[];
  preferredTimes: string[];
  reason: string;
  isUrgent: boolean;
  preferredLocation: string;
  isVirtual: boolean;
  notes: string;
}

const AppointmentRequestForm: React.FC<AppointmentRequestFormProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<AppointmentRequestData>({
    type: '',
    provider: '',
    preferredDates: [],
    preferredTimes: [],
    reason: '',
    isUrgent: false,
    preferredLocation: 'main-office',
    isVirtual: false,
    notes: ''
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const appointmentTypes = [
    'Consultation',
    'Follow-up',
    'Treatment',
    'Lab Work',
    'Imaging',
    'Nutrition Consultation',
    'Mental Health Support',
    'Second Opinion'
  ];

  const providers = [
    'Dr. Sarah Smith (Oncologist)',
    'Dr. Michael Johnson (Oncologist)',
    'Lisa Martinez (Nutritionist)',
    'Dr. Emily Chen (Mental Health)',
    'Any Available Provider'
  ];

  const timeSlots = [
    '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  const handleAddPreferredDate = () => {
    if (selectedDate && !formData.preferredDates.includes(selectedDate)) {
      setFormData({
        ...formData,
        preferredDates: [...formData.preferredDates, selectedDate]
      });
      setSelectedDate('');
    }
  };

  const handleRemovePreferredDate = (date: string) => {
    setFormData({
      ...formData,
      preferredDates: formData.preferredDates.filter(d => d !== date)
    });
  };

  const handleAddPreferredTime = () => {
    if (selectedTime && !formData.preferredTimes.includes(selectedTime)) {
      setFormData({
        ...formData,
        preferredTimes: [...formData.preferredTimes, selectedTime]
      });
      setSelectedTime('');
    }
  };

  const handleRemovePreferredTime = (time: string) => {
    setFormData({
      ...formData,
      preferredTimes: formData.preferredTimes.filter(t => t !== time)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.provider || !formData.reason) {
      alert('Please fill in all required fields.');
      return;
    }

    if (formData.preferredDates.length === 0) {
      alert('Please select at least one preferred date.');
      return;
    }

    onSubmit(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Request Appointment</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Provider *
              </label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select provider</option>
                {providers.map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Appointment *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please describe the reason for your appointment..."
                required
              />
            </div>

            {/* Preferred Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Dates *
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddPreferredDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.preferredDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredDates.map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(date)}
                        <button
                          type="button"
                          onClick={() => handleRemovePreferredDate(date)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preferred Times */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Times
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select preferred time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPreferredTime}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.preferredTimes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredTimes.map((time, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {time}
                        <button
                          type="button"
                          onClick={() => handleRemovePreferredTime(time)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Location Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Preference
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="virtual"
                    checked={formData.isVirtual}
                    onChange={(e) => setFormData({...formData, isVirtual: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="virtual" className="text-sm text-gray-700">
                    Virtual appointment preferred
                  </label>
                </div>
                {!formData.isVirtual && (
                  <select
                    value={formData.preferredLocation}
                    onChange={(e) => setFormData({...formData, preferredLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="main-office">Main Office - Cancer Center</option>
                    <option value="satellite-clinic">Satellite Clinic - Downtown</option>
                    <option value="hospital">Hospital Campus</option>
                  </select>
                )}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({...formData, isUrgent: e.target.checked})}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700">
                  This is an urgent request
                </label>
              </div>
              {formData.isUrgent && (
                <Alert type="warning" title="Urgent Request">
                  Urgent requests will be reviewed within 24 hours. For immediate medical concerns, please contact your care team directly or call the emergency line.
                </Alert>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any additional information you'd like to share..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentRequestForm;