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
          <h1 className="text-2xl font-bold text-gray-900">Account Created Successfully!</h1>
          <p className="text-gray-600">
            Your OncoSafeRx account has been created and you can start using the platform immediately. 
            {email && (
              <>
                {' '}You may receive a confirmation email at <strong>{email}</strong> for your records.
              </>
            )}
          </p>
          <div className="bg-green-50 border border-green-200 p-3 rounded text-green-900 text-sm">
            ✓ No email confirmation required - your account is ready to use!
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
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Enter OncoSafeRx
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

