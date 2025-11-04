import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const AuthCheckEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const { email, isSuccess } = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return {
        email: params.get('email') || '',
        isSuccess: params.get('success') === 'true'
      };
    } catch { 
      return { email: '', isSuccess: false }; 
    }
  }, [location.search]);

  const resend = async () => {
    if (!email) return;
    setSending(true);
    setSent(false);
    try {
      const { SupabaseAuthService } = await import('../services/authService');
      await SupabaseAuthService.resendConfirmation(email);
      setSent(true);
    } catch {
      setSent(false);
      alert('Failed to resend confirmation email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <div className="space-y-4 p-2 text-center">
          <div className="flex items-center justify-center">
            <Mail className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuccess ? 'Account Created Successfully!' : 'Check your email'}
          </h1>
          <p className="text-gray-600">
            {isSuccess ? (
              <>
                Your OncoSafeRx account has been created and you can start using the platform immediately. 
                {email && (
                  <>
                    {' '}Welcome to OncoSafeRx, <strong>{email}</strong>!
                  </>
                )}
              </>
            ) : (
              <>
                We sent a confirmation link to {email ? <strong>{email}</strong> : 'your email address'}. Click the link to verify your
                account and finish setting up OncoSafeRx.
              </>
            )}
          </p>
          <div className={`p-3 rounded text-sm ${
            isSuccess 
              ? 'bg-green-50 border border-green-200 text-green-900'
              : 'bg-yellow-50 border border-yellow-200 text-yellow-900'
          }`}>
            {isSuccess ? (
              '🎉 Your account is ready to use! Click below to start exploring.'
            ) : (
              'If you don\'t see the email, check your spam or junk folder, or resend it below.'
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isSuccess ? (
              // Success page - show prominent "Enter OncoSafeRx" button
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Enter OncoSafeRx
              </button>
            ) : (
              // Email confirmation page - show resend and back options
              <>
                <button
                  onClick={resend}
                  disabled={!email || sending}
                  className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${sending ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'}`}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${sending ? 'animate-spin' : ''}`} />
                  Resend confirmation
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </button>
              </>
            )}
          </div>
          {sent && !isSuccess && (
            <div className="flex items-center justify-center text-green-700 bg-green-50 border border-green-200 p-2 rounded text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmation email sent
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AuthCheckEmail;

