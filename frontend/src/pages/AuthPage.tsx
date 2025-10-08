import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignupData, LoginData } from '../types/user';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Building, 
  Award, 
  Calendar,
  Activity,
  ArrowLeft,
  Check,
  AlertCircle
} from 'lucide-react';
import Card from '../components/UI/Card';
import { useToast } from '../components/UI/Toast';
import Tooltip from '../components/UI/Tooltip';

const AuthPage: React.FC = () => {
  const { actions, state } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data states
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'oncologist',
    specialty: '',
    institution: '',
    licenseNumber: '',
    yearsExperience: undefined,
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetMessage, setResetMessage] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { showToast } = useToast();
  const [authModeInfo, setAuthModeInfo] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState<boolean>(() => {
    try { return localStorage.getItem('osrx_use_auth_proxy') === 'true' } catch { return false }
  });
  const [forceProxy, setForceProxy] = useState<boolean>(() => {
    try { return localStorage.getItem('osrx_force_proxy') === 'true' } catch { return false }
  });
  const [proxyEnabled, setProxyEnabled] = useState<boolean | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [state.isAuthenticated, navigate, location]);

  // Read auth path meta for diagnostics
  useEffect(() => {
    try {
      const raw = localStorage.getItem('osrx_auth_path');
      if (raw) {
        const meta = JSON.parse(raw);
        if (meta?.path && meta?.at) {
          setAuthModeInfo(`Auth mode: ${meta.path} @ ${new Date(meta.at).toLocaleTimeString()}`);
        }
      }
    } catch {}
  }, [state.isAuthenticated, state.error]);

  // Persist proxy toggle
  useEffect(() => {
    try { localStorage.setItem('osrx_use_auth_proxy', useProxy ? 'true' : 'false') } catch {}
  }, [useProxy]);
  useEffect(() => {
    try { localStorage.setItem('osrx_force_proxy', forceProxy ? 'true' : 'false') } catch {}
  }, [forceProxy]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const backend = (import.meta as any)?.env?.VITE_BACKEND_URL || 'https://oncosaferx-backend.onrender.com'
        const tryOne = async (u: string) => {
          const ctl = new AbortController();
          const t = setTimeout(() => ctl.abort(), 1500);
          try { const r = await fetch(u, { signal: ctl.signal }); return r.ok ? await r.json() : null } finally { clearTimeout(t) }
        }
        const a = await tryOne('/api/supabase-auth/health') || await tryOne(`${backend}/api/supabase-auth/health`)
        if (!cancelled) setProxyEnabled(Boolean(a?.proxyEnabled))
      } catch { if (!cancelled) setProxyEnabled(null) }
    })();
    return () => { cancelled = true }
  }, []);

  // Role options for signup
  const roleOptions = [
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

  // Validation functions
  const validateSignin = () => {
    const newErrors: Record<string, string> = {};
    
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!signupData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!signupData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (signupData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (signupData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (signupData.role === 'oncologist' && !signupData.specialty?.trim()) {
      newErrors.specialty = 'Specialty is required for oncologists';
    }
    
    if ((signupData.role === 'oncologist' || signupData.role === 'pharmacist') && !signupData.licenseNumber?.trim()) {
      newErrors.licenseNumber = 'License number is required for this role';
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleSignin = async (e: React.FormEvent) => {
    console.log('🎯 Form submitted:', { email: loginData.email, hasPassword: !!loginData.password });
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent any potential page reloads
    if (e.target) {
      (e.target as HTMLFormElement).style.pointerEvents = 'none';
    }
    
    const isValid = validateSignin();
    console.log('✅ Form validation result:', isValid);
    if (!isValid) {
      console.log('❌ Validation failed, errors:', errors);
      if (e.target) {
        (e.target as HTMLFormElement).style.pointerEvents = 'auto';
      }
      return;
    }
    
    console.log('🚀 Starting login process...');
    try {
      console.log('🔄 About to call actions.login...');
      // Add explicit promise handling to prevent unhandled rejections
      const loginPromise = actions.login(loginData);
      console.log('🔄 Login promise created, waiting for result...');
      const result = await loginPromise;
      console.log('✅ Login completed successfully:', result);
    } catch (error) {
      console.error('❌ Login failed in handleSignin:', error);
      console.error('❌ Login error full details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack',
        type: typeof error,
        error
      });
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      // Re-enable form
      if (e.target) {
        (e.target as HTMLFormElement).style.pointerEvents = 'auto';
      }
    }
  };

  const handleResetPassword = async () => {
    setResetMessage('');
    const email = loginData.email.trim();
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Enter your email above, then click Forgot password' }));
      return;
    }
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { SupabaseAuthService } = await import('../services/authService');
      await SupabaseAuthService.requestPasswordReset(email, redirectTo);
      setResetMessage('Password reset email sent. Check your inbox.');
    } catch (e: any) {
      setErrors(prev => ({ ...prev, submit: e?.message || 'Failed to send reset email' }));
    }
  };

  const handleMagicLink = async () => {
    const email = loginData.email.trim();
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Enter your email above, then click Magic link' }));
      return;
    }
    try {
      const redirectTo = `${window.location.origin}/`;
      const { SupabaseAuthService } = await import('../services/authService');
      await SupabaseAuthService.requestMagicLink(email, redirectTo);
      showToast('success', 'Magic link sent. Check your email.');
    } catch (e: any) {
      setErrors(prev => ({ ...prev, submit: e?.message || 'Failed to send magic link' }));
      showToast('error', e?.message || 'Failed to send magic link');
    }
  };

  const handleVerifyOtp = async () => {
    setErrors(prev => ({ ...prev, submit: '' }));
    try {
      const { SupabaseAuthService } = await import('../services/authService');
      const profile = await SupabaseAuthService.verifyEmailOtp(loginData.email, otpCode);
      showToast('success', `Welcome back, ${profile.firstName || profile.email}`);
    } catch (e: any) {
      setErrors(prev => ({ ...prev, submit: e?.message || 'Failed to verify code' }));
      showToast('error', e?.message || 'Failed to verify code');
    }
  };

  const handleResendConfirmation = async () => {
    const email = loginData.email.trim();
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Enter your email above, then click Resend confirmation' }));
      return;
    }
    try {
      const redirectTo = `${window.location.origin}/`;
      const { SupabaseAuthService } = await import('../services/authService');
      await SupabaseAuthService.resendConfirmation(email, redirectTo);
      showToast('success', 'Confirmation email sent');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to resend confirmation');
    }
  };

  const handleSignupNext = () => {
    if (validateSignupStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupStep2()) return;
    
    try {
      await actions.signup(signupData);
    } catch (error) {
      console.error('❌ Signup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setErrors({ submit: errorMessage });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (mode === 'signin') {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setSignupData(prev => ({
        ...prev,
        [field]: field === 'yearsExperience' ? (value ? parseInt(value) : undefined) : value
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setLoginData({ email: '', password: '' });
    setSignupData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'oncologist',
      specialty: '',
      institution: '',
      licenseNumber: '',
      yearsExperience: undefined,
    });
    setConfirmPassword('');
    setErrors({});
    setCurrentStep(1);
    setAcceptedTerms(false);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  if (state.isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">OncoSafeRx</h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' 
              ? 'Sign in to access precision oncology tools' 
              : 'Join the precision oncology platform'
            }
          </p>
          <div className="mt-2 text-xs text-gray-500">
            Proxy enabled: {proxyEnabled === null ? 'checking…' : proxyEnabled ? 'yes' : 'no'} • Use proxy: {useProxy ? 'on' : 'off'} • Force proxy: {forceProxy ? 'on' : 'off'} {authModeInfo ? `• ${authModeInfo}` : ''}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border-0">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignin} className="space-y-6">
              {authModeInfo && (
                <div className="text-xs text-gray-500">{authModeInfo}</div>
              )}
              {import.meta.env.MODE !== 'production' && (
                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={useProxy}
                      onChange={(e) => setUseProxy(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Use server auth proxy on failure</span>
                  </label>
                  <label className="inline-flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={forceProxy}
                      onChange={(e) => setForceProxy(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span>Force proxy-first</span>
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      const forced = localStorage.getItem('osrx_force_production') === 'true'
                      if (forced) {
                        localStorage.removeItem('osrx_force_production')
                        showToast('success', 'Force production disabled');
                      } else {
                        localStorage.setItem('osrx_force_production', 'true')
                        showToast('success', 'Force production enabled');
                      }
                    }}
                  >
                    Toggle force production
                  </button>
                </div>
              )}
              <div>
                <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={loginData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                  {resetMessage && <span className="text-xs text-green-700">{resetMessage}</span>}
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <button type="button" onClick={handleResendConfirmation} className="font-medium text-primary-600 hover:text-primary-500">
                    Resend confirmation
                  </button>
                  <button type="button" onClick={handleMagicLink} className="font-medium text-blue-600 hover:text-blue-500">Magic link</button>
                  <button type="button" onClick={() => setShowOtp(!showOtp)} className="font-medium text-violet-600 hover:text-violet-500">{showOtp ? 'Hide code' : 'Have a code?'}</button>
                </div>
              </div>

              {(errors.submit || state.error) && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.submit || state.error}</p>
                </div>
              )}

              {showOtp && (
                <div className="space-y-2 p-3 border border-violet-200 rounded-md bg-violet-50">
                  <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700">Enter verification code</label>
                  <input
                    id="otp-code"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="6-digit code"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <button type="button" onClick={handleVerifyOtp} className="px-3 py-2 bg-violet-600 text-white rounded text-sm hover:bg-violet-700">Verify code</button>
                </div>
              )}

              <button
                type="submit"
                disabled={state.isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleSignupNext(); } : handleSignupSubmit} className="space-y-6">
              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
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

              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <div className="mt-1">
                        <input
                          id="firstName"
                          type="text"
                          required
                          value={signupData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.firstName ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <div className="mt-1">
                        <input
                          id="lastName"
                          type="text"
                          required
                          value={signupData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                    <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={signupData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
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
                    <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signupData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
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

              {/* Step 2: Professional Information */}
              {currentStep === 2 && (
                <>
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
                      required
                      value={signupData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className={`block w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
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

                  {signupData.role === 'oncologist' && (
                    <div>
                      <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                        Specialty *
                      </label>
                      <select
                        id="specialty"
                        value={signupData.specialty || ''}
                        onChange={(e) => handleInputChange('specialty', e.target.value)}
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
                        type="text"
                        value={signupData.institution || ''}
                        onChange={(e) => handleInputChange('institution', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Building className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {(signupData.role === 'oncologist' || signupData.role === 'pharmacist') && (
                    <div>
                      <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                        License Number *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          id="licenseNumber"
                          type="text"
                          value={signupData.licenseNumber || ''}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
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
                        type="number"
                        min="0"
                        max="50"
                        value={signupData.yearsExperience || ''}
                        onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className={`h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${
                        errors.terms ? 'border-red-300' : ''
                      }`}
                    />
                    <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                      I accept the{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-500">
                        Privacy Policy
                      </a>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="mt-1 text-xs text-red-600">{errors.terms}</p>
                  )}
                </>
              )}

              {(errors.submit || state.error) && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-600">{errors.submit || state.error}</p>
                </div>
              )}

              <div className="flex justify-between">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
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
          )}
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center space-y-4">
        {/* Admin Console Link */}
        <div>
          <a 
            href="/admin/login" 
            className="text-sm text-gray-600 hover:text-primary-600 underline"
          >
            Admin Console
          </a>
        </div>
        
        <p className="text-xs text-gray-500">
          By using OncoSafeRx, you agree to our terms and privacy policy.
          <br />
          This platform is for healthcare professionals only.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
