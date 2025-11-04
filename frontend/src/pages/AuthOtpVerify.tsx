import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { Phone, RefreshCw, CheckCircle, ArrowLeft, Shield } from 'lucide-react';

const AuthOtpVerify: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { phone, email } = React.useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return {
        phone: params.get('phone') || '',
        email: params.get('email') || ''
      };
    } catch { 
      return { phone: '', email: '' }; 
    }
  }, [location.search]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return 'your phone';
    if (phone.length <= 7) return phone;
    // Show country code + last 4 digits: +1****1234
    const countryCodeEnd = phone.indexOf('1') + 1; // Find end of country code
    const visibleStart = phone.slice(0, Math.min(3, countryCodeEnd));
    const visibleEnd = phone.slice(-4);
    const masked = '*'.repeat(Math.max(0, phone.length - visibleStart.length - visibleEnd.length));
    return `${visibleStart}${masked}${visibleEnd}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, ''); // Remove non-digits
    const newOtp = [...otp];
    
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    setError('');
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Call OTP verification API
      const response = await fetch('/api/supabase-auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          token: otpCode,
          type: 'sms'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(errorData.error || 'Invalid verification code');
      }

      const result = await response.json();
      console.log('✅ OTP verification successful:', result);

      // Check if we got a session/user back from OTP verification
      if (result.user && result.access_token) {
        console.log('✅ OTP verification returned valid session, going to dashboard');
        navigate('/dashboard');
      } else if (result.user) {
        console.log('✅ OTP verification successful but user needs to sign in, going to login');
        // User is verified but we don't have a session, redirect to login
        navigate('/auth?mode=signin&verified=true');
      } else {
        console.log('⚠️ OTP verification successful but unexpected response format');
        // Fallback to dashboard
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('❌ OTP verification failed:', error);
      setError(error instanceof Error ? error.message : 'Verification failed. Please try again.');
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/supabase-auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          type: 'sms'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      // Reset timer
      setResendTimer(30);
      setCanResend(false);
      
      console.log('✅ OTP resent successfully');
    } catch (error) {
      console.error('❌ Failed to resend OTP:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <div className="space-y-6 p-2 text-center">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Phone</h1>
            <p className="text-gray-600">
              We sent a 6-digit verification code to{' '}
              <span className="font-medium">{formatPhoneDisplay(phone)}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter verification code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-12 h-12 text-center text-lg font-semibold border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      error ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isVerifying || otp.join('').length !== 6}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Code
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleResend}
                disabled={!canResend || isResending}
                className={`text-sm font-medium ${
                  canResend 
                    ? 'text-primary-600 hover:text-primary-700' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {isResending ? (
                  <span className="flex items-center">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </span>
                ) : canResend ? (
                  'Resend code'
                ) : (
                  `Resend in ${resendTimer}s`
                )}
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-3 h-3 mr-1 inline" />
                Back to signup
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthOtpVerify;