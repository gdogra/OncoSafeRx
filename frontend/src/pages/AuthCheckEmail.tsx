import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';

const AuthCheckEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const email = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return params.get('email') || '';
    } catch { return ''; }
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
          <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-600">
            We sent a confirmation link to {email ? <strong>{email}</strong> : 'your email address'}. Click the link to verify your
            account and finish setting up OncoSafeRx.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-900 text-sm">
            If you don’t see the email, check your spam or junk folder, or resend it below.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          </div>
          {sent && (
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

