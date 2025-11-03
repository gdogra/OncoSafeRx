import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SignupData } from '../../types/user';
import { Eye, EyeOff, User, Mail, Building, Award, Calendar } from 'lucide-react';
import Card from '../UI/Card';
import Tooltip from '../UI/Tooltip';

const SignupForm: React.FC = () => {
  const { actions, state } = useAuth();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'patient',
    specialty: '',
    institution: '',
    licenseNumber: '',
    yearsExperience: undefined,
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (formData.role === 'oncologist' && !formData.specialty?.trim()) {
      newErrors.specialty = 'Specialty is required for oncologists';
    }
    
    if ((formData.role === 'oncologist' || formData.role === 'pharmacist') && !formData.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required for this role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsExperience' ? (value ? parseInt(value) : undefined) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      handleNextStep();
      return;
    }
    
    if (!validateStep2()) {
      return;
    }
    
    try {
      await actions.signup(formData);
    } catch (error) {
      setErrors({ submit: 'Signup failed. Please try again.' });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setErrors({});
      await actions.signInWithGoogle();
    } catch (error) {
      setErrors({ submit: 'Google sign-up failed. Please try again.' });
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', description: 'Cancer patient or caregiver' },
    { value: 'oncologist', label: 'Oncologist', description: 'Medical doctor specializing in cancer treatment' },
    { value: 'pharmacist', label: 'Pharmacist', description: 'Medication therapy expert' },
    { value: 'nurse', label: 'Nurse', description: 'Patient care and treatment coordination' },
    { value: 'researcher', label: 'Researcher', description: 'Clinical research and trials' },
    { value: 'student', label: 'Student', description: 'Medical, pharmacy, or nursing student' },
  ];

  const specialtyOptions = [
    'Medical Oncology',
    'Surgical Oncology',
    'Radiation Oncology',
    'Hematology-Oncology',
    'Gynecologic Oncology',
    'Pediatric Oncology',
    'Thoracic Oncology',
    'Neuro-Oncology',
    'Breast Oncology',
    'Gastrointestinal Oncology',
    'Genitourinary Oncology',
    'Head and Neck Oncology',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Join OncoSafeRx
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to access precision oncology tools
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                1
              </div>
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'
              }`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Account Info</span>
              <span className="text-xs text-gray-500">Professional Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <>
                {/* Step 1: Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                {/* Step 2: Professional Information */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Professional Role *
                    </label>
                    <Tooltip 
                      content="Your role determines available features, permissions, and UI customization"
                      type="help"
                      iconOnly
                    />
                  </div>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.role ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                  )}
                </div>

                {formData.role === 'oncologist' && (
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                      Specialty *
                    </label>
                    <select
                      id="specialty"
                      name="specialty"
                      value={formData.specialty || ''}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.specialty ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select specialty...</option>
                      {specialtyOptions.map(specialty => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                    {errors.specialty && (
                      <p className="mt-1 text-xs text-red-600">{errors.specialty}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                    Institution/Hospital
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="institution"
                      name="institution"
                      type="text"
                      value={formData.institution || ''}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Building className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {(formData.role === 'oncologist' || formData.role === 'pharmacist') && (
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                      License Number *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber || ''}
                        onChange={handleInputChange}
                        className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                          errors.licenseNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      <Award className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    {errors.licenseNumber && (
                      <p className="mt-1 text-xs text-red-600">{errors.licenseNumber}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="yearsExperience"
                      name="yearsExperience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsExperience || ''}
                      onChange={handleInputChange}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </>
            )}

            {errors.submit && (
              <div className="text-red-600 text-sm text-center">{errors.submit}</div>
            )}

            {state.error && (
              <div className="text-red-600 text-sm text-center">{state.error}</div>
            )}

            <div className="flex justify-between">
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Previous
                </button>
              )}
              
              <button
                type="submit"
                disabled={state.isLoading}
                className={`${currentStep === 1 ? 'w-full' : 'ml-auto'} flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {state.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : currentStep === 1 ? (
                  'Next'
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={state.isLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </a>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupForm;