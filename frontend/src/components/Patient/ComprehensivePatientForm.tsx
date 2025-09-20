import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Home, 
  Shield, 
  Heart, 
  Zap, 
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Info
} from 'lucide-react';
import { PatientDemographics } from '../../types';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';

interface ComprehensivePatientFormProps {
  onSubmit: (patientData: ComprehensivePatientData) => void;
  onCancel: () => void;
}

interface ComprehensivePatientData extends PatientDemographics {
  // Contact Information
  email?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Insurance & Medical Information
  insurance?: {
    provider: string;
    memberId: string;
    groupNumber?: string;
  };
  
  // Clinical Information
  primaryDiagnosis?: string;
  stage?: string;
  dateOfDiagnosis?: string;
  histology?: string;
  primarySite?: string;
  
  // Performance Status
  ecogPerformanceStatus?: 0 | 1 | 2 | 3 | 4;
  karnofskyScore?: number;
  
  // Vital Signs & Measurements
  bsa?: number;
  vitals?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  
  // Laboratory Values
  labValues?: {
    hemoglobin?: number;
    hematocrit?: number;
    wbc?: number;
    platelets?: number;
    neutrophils?: number;
    creatinine?: number;
    bun?: number;
    ast?: number;
    alt?: number;
    bilirubin?: number;
    albumin?: number;
  };
  
  // Allergies
  allergies?: Array<{
    allergen: string;
    reaction: string;
    severity: 'mild' | 'moderate' | 'severe';
    verified: boolean;
  }>;
  
  // Medical History
  medicalHistory?: Array<{
    condition: string;
    yearDiagnosed?: number;
    status: 'active' | 'resolved' | 'chronic';
  }>;
  
  // Social History
  socialHistory?: {
    smokingStatus: 'never' | 'former' | 'current';
    smokingPackYears?: number;
    alcoholUse: 'none' | 'occasional' | 'moderate' | 'heavy';
    drugUse: 'none' | 'former' | 'current';
    occupation?: string;
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  };
  
  // Family History
  familyHistory?: Array<{
    relationship: string;
    condition: string;
    ageAtDiagnosis?: number;
  }>;
  
  // Provider Information
  primaryOncologist?: string;
  referringPhysician?: string;
  treatmentCenter?: string;
}

const ComprehensivePatientForm: React.FC<ComprehensivePatientFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [activeSection, setActiveSection] = useState<string>('demographics');
  const [formData, setFormData] = useState<ComprehensivePatientData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    sex: 'male' as const,
    allergies: [],
    medicalHistory: [],
    familyHistory: []
  });
  
  const [newAllergy, setNewAllergy] = useState({ allergen: '', reaction: '', severity: 'mild' as const });
  const [newMedicalCondition, setNewMedicalCondition] = useState({ condition: '', yearDiagnosed: '', status: 'active' as const });
  const [newFamilyHistory, setNewFamilyHistory] = useState({ relationship: '', condition: '', ageAtDiagnosis: '' });

  const sections = [
    { id: 'demographics', label: 'Demographics', icon: User },
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'clinical', label: 'Clinical Info', icon: Heart },
    { id: 'vitals', label: 'Vitals & Labs', icon: Activity },
    { id: 'history', label: 'Medical History', icon: Shield },
    { id: 'social', label: 'Social History', icon: Home },
    { id: 'providers', label: 'Care Team', icon: User }
  ];

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addAllergy = () => {
    if (newAllergy.allergen && newAllergy.reaction) {
      const newAllergyWithId = {
        ...newAllergy,
        id: `allergy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        allergenType: 'drug' as const,
        dateReported: new Date().toISOString(),
        verified: false
      };
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), newAllergyWithId]
      }));
      setNewAllergy({ allergen: '', reaction: '', severity: 'mild' });
    }
  };

  const addMedicalCondition = () => {
    if (newMedicalCondition.condition) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [...(prev.medicalHistory || []), {
          ...newMedicalCondition,
          yearDiagnosed: newMedicalCondition.yearDiagnosed ? parseInt(newMedicalCondition.yearDiagnosed) : undefined
        }]
      }));
      setNewMedicalCondition({ condition: '', yearDiagnosed: '', status: 'active' });
    }
  };

  const addFamilyHistory = () => {
    if (newFamilyHistory.relationship && newFamilyHistory.condition) {
      setFormData(prev => ({
        ...prev,
        familyHistory: [...(prev.familyHistory || []), {
          ...newFamilyHistory,
          ageAtDiagnosis: newFamilyHistory.ageAtDiagnosis ? parseInt(newFamilyHistory.ageAtDiagnosis) : undefined
        }]
      }));
      setNewFamilyHistory({ relationship: '', condition: '', ageAtDiagnosis: '' });
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateRequiredFields = () => {
    const newErrors: Record<string, string> = {};

    // Required demographic fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.sex) {
      newErrors.sex = 'Sex is required';
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone format if provided
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate emergency contact if any field is filled
    if (formData.emergencyContact?.name || formData.emergencyContact?.phone || formData.emergencyContact?.relationship) {
      if (!formData.emergencyContact?.name?.trim()) {
        newErrors['emergencyContact.name'] = 'Emergency contact name is required';
      }
      if (!formData.emergencyContact?.phone?.trim()) {
        newErrors['emergencyContact.phone'] = 'Emergency contact phone is required';
      }
      if (!formData.emergencyContact?.relationship?.trim()) {
        newErrors['emergencyContact.relationship'] = 'Emergency contact relationship is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateRequiredFields()) {
      onSubmit(formData);
    } else {
      // Switch to first section with errors
      if (errors.firstName || errors.lastName || errors.dateOfBirth || errors.sex) {
        setActiveSection('demographics');
      } else if (errors.email || errors.phone) {
        setActiveSection('contact');
      }
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'demographics':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biological Sex <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) => updateFormData('sex', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other/Unknown</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.heightCm || ''}
                  onChange={(e) => updateFormData('heightCm', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  max="300"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weightKg || ''}
                  onChange={(e) => updateFormData('weightKg', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  max="500"
                  step="0.1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BSA (m²)
                  <Tooltip content="Body Surface Area - calculated automatically if height and weight provided">
                    <Info className="w-3 h-3 ml-1 inline" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={formData.bsa || ''}
                  onChange={(e) => updateFormData('bsa', e.target.value ? parseFloat(e.target.value) : undefined)}
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Record Number (MRN)
              </label>
              <input
                type="text"
                value={formData.mrn || ''}
                onChange={(e) => updateFormData('mrn', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Address</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={formData.address?.street || ''}
                  onChange={(e) => updateFormData('address.street', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.address?.city || ''}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.address?.state || ''}
                    onChange={(e) => updateFormData('address.state', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => updateFormData('emergencyContact.name', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => updateFormData('emergencyContact.relationship', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => updateFormData('emergencyContact.phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Insurance Information</h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Insurance Provider"
                  value={formData.insurance?.provider || ''}
                  onChange={(e) => updateFormData('insurance.provider', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Member ID"
                  value={formData.insurance?.memberId || ''}
                  onChange={(e) => updateFormData('insurance.memberId', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="text"
                  placeholder="Group Number"
                  value={formData.insurance?.groupNumber || ''}
                  onChange={(e) => updateFormData('insurance.groupNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'clinical':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Diagnosis</label>
                <input
                  type="text"
                  value={formData.primaryDiagnosis || ''}
                  onChange={(e) => updateFormData('primaryDiagnosis', e.target.value)}
                  placeholder="e.g., Breast Cancer, Lung Adenocarcinoma"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <input
                  type="text"
                  value={formData.stage || ''}
                  onChange={(e) => updateFormData('stage', e.target.value)}
                  placeholder="e.g., Stage IIIA, T2N1M0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Diagnosis</label>
                <input
                  type="date"
                  value={formData.dateOfDiagnosis || ''}
                  onChange={(e) => updateFormData('dateOfDiagnosis', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Site</label>
                <input
                  type="text"
                  value={formData.primarySite || ''}
                  onChange={(e) => updateFormData('primarySite', e.target.value)}
                  placeholder="e.g., Left breast, Right upper lobe"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Histology</label>
              <input
                type="text"
                value={formData.histology || ''}
                onChange={(e) => updateFormData('histology', e.target.value)}
                placeholder="e.g., Invasive ductal carcinoma, Adenocarcinoma"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ECOG Performance Status
                  <Tooltip content="0=Fully active, 1=Restricted strenuous activity, 2=Ambulatory >50% of time, 3=Limited self-care, 4=Completely disabled">
                    <Info className="w-3 h-3 ml-1 inline" />
                  </Tooltip>
                </label>
                <select
                  value={formData.ecogPerformanceStatus || ''}
                  onChange={(e) => updateFormData('ecogPerformanceStatus', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select ECOG Score</option>
                  <option value="0">0 - Fully active</option>
                  <option value="1">1 - Restricted strenuous activity</option>
                  <option value="2">2 - Ambulatory, self-care</option>
                  <option value="3">3 - Limited self-care</option>
                  <option value="4">4 - Completely disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Karnofsky Score
                  <Tooltip content="Performance status scale 0-100, where 100 = normal activity">
                    <Info className="w-3 h-3 ml-1 inline" />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={formData.karnofskyScore || ''}
                  onChange={(e) => updateFormData('karnofskyScore', e.target.value ? parseInt(e.target.value) : undefined)}
                  min="0"
                  max="100"
                  step="10"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'vitals':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Vital Signs</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BP Systolic</label>
                  <input
                    type="number"
                    value={formData.vitals?.bloodPressureSystolic || ''}
                    onChange={(e) => updateFormData('vitals.bloodPressureSystolic', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="mmHg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BP Diastolic</label>
                  <input
                    type="number"
                    value={formData.vitals?.bloodPressureDiastolic || ''}
                    onChange={(e) => updateFormData('vitals.bloodPressureDiastolic', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="mmHg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
                  <input
                    type="number"
                    value={formData.vitals?.heartRate || ''}
                    onChange={(e) => updateFormData('vitals.heartRate', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="bpm"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Laboratory Values</h4>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin</label>
                  <input
                    type="number"
                    value={formData.labValues?.hemoglobin || ''}
                    onChange={(e) => updateFormData('labValues.hemoglobin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="g/dL"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WBC</label>
                  <input
                    type="number"
                    value={formData.labValues?.wbc || ''}
                    onChange={(e) => updateFormData('labValues.wbc', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="K/μL"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platelets</label>
                  <input
                    type="number"
                    value={formData.labValues?.platelets || ''}
                    onChange={(e) => updateFormData('labValues.platelets', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="K/μL"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creatinine</label>
                  <input
                    type="number"
                    value={formData.labValues?.creatinine || ''}
                    onChange={(e) => updateFormData('labValues.creatinine', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="mg/dL"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Allergies</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Allergen"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Reaction"
                    value={newAllergy.reaction}
                    onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <select
                    value={newAllergy.severity}
                    onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value as 'mild' | 'moderate' | 'severe' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                {formData.allergies && formData.allergies.length > 0 && (
                  <div className="space-y-2">
                    {formData.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                        <span>{allergy.allergen} - {allergy.reaction} ({allergy.severity})</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            allergies: prev.allergies?.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Medical History</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Condition"
                    value={newMedicalCondition.condition}
                    onChange={(e) => setNewMedicalCondition(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Year Diagnosed"
                    value={newMedicalCondition.yearDiagnosed}
                    onChange={(e) => setNewMedicalCondition(prev => ({ ...prev, yearDiagnosed: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <select
                    value={newMedicalCondition.status}
                    onChange={(e) => setNewMedicalCondition(prev => ({ ...prev, status: e.target.value as 'active' | 'resolved' | 'chronic' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="chronic">Chronic</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={addMedicalCondition}
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                {formData.medicalHistory && formData.medicalHistory.length > 0 && (
                  <div className="space-y-2">
                    {formData.medicalHistory.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                        <span>{condition.condition} {condition.yearDiagnosed && `(${condition.yearDiagnosed})`} - {condition.status}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            medicalHistory: prev.medicalHistory?.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Family History</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Relationship"
                    value={newFamilyHistory.relationship}
                    onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Condition"
                    value={newFamilyHistory.condition}
                    onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Age at Diagnosis"
                    value={newFamilyHistory.ageAtDiagnosis}
                    onChange={(e) => setNewFamilyHistory(prev => ({ ...prev, ageAtDiagnosis: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={addFamilyHistory}
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Add
                  </button>
                </div>
                {formData.familyHistory && formData.familyHistory.length > 0 && (
                  <div className="space-y-2">
                    {formData.familyHistory.map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <span>{history.relationship} - {history.condition} {history.ageAtDiagnosis && `(age ${history.ageAtDiagnosis})`}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            familyHistory: prev.familyHistory?.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
                <select
                  value={formData.socialHistory?.smokingStatus || ''}
                  onChange={(e) => updateFormData('socialHistory.smokingStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select status</option>
                  <option value="never">Never smoker</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pack Years (if applicable)</label>
                <input
                  type="number"
                  value={formData.socialHistory?.smokingPackYears || ''}
                  onChange={(e) => updateFormData('socialHistory.smokingPackYears', e.target.value ? parseFloat(e.target.value) : undefined)}
                  step="0.5"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Use</label>
                <select
                  value={formData.socialHistory?.alcoholUse || ''}
                  onChange={(e) => updateFormData('socialHistory.alcoholUse', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select usage</option>
                  <option value="none">None</option>
                  <option value="occasional">Occasional</option>
                  <option value="moderate">Moderate</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  value={formData.socialHistory?.maritalStatus || ''}
                  onChange={(e) => updateFormData('socialHistory.maritalStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                value={formData.socialHistory?.occupation || ''}
                onChange={(e) => updateFormData('socialHistory.occupation', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      case 'providers':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Oncologist</label>
              <input
                type="text"
                value={formData.primaryOncologist || ''}
                onChange={(e) => updateFormData('primaryOncologist', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referring Physician</label>
              <input
                type="text"
                value={formData.referringPhysician || ''}
                onChange={(e) => updateFormData('referringPhysician', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Center/Hospital</label>
              <input
                type="text"
                value={formData.treatmentCenter || ''}
                onChange={(e) => updateFormData('treatmentCenter', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Create New Patient</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">Complete patient information for comprehensive clinical management</p>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex space-x-1 overflow-x-auto">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderSection()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1].id);
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                  className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Patient</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComprehensivePatientForm;