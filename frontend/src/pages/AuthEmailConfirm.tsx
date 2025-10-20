import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthEmailConfirm: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          setTimeout(() => navigate('/', { replace: true }), 1500);
        }
      } catch {}
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <div className="text-center space-y-4 p-2">
          <div className="flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Email Confirmed</h1>
          <p className="text-gray-600">
            Your email has been successfully verified for your OncoSafeRx account.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 text-sm text-left">
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 mt-0.5" />
              <div>
                <div className="font-medium">What this means</div>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>You can now sign in and access clinical tools.</li>
                  <li>We’ll use this email for important account notices.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continue to sign in
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
            >
              Go to dashboard
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Didn’t sign up? You can safely ignore this email.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthEmailConfirm;
