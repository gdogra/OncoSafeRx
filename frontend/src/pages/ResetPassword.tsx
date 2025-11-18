import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Card from '../components/UI/Card';
import { SecurityManager } from '../utils/security';
import { Check, AlertCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle'|'updating'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    requirements: { [key: string]: boolean };
  } | null>(null);

  useEffect(() => {
    // No-op: Supabase session should be present via recovery link
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const validation = SecurityManager.validatePassword(newPassword);
    if (!validation.isValid) {
      const failedRequirements = Object.entries(validation.requirements)
        .filter(([_, isValid]) => !isValid)
        .map(([requirement]) => {
          switch (requirement) {
            case 'minLength': return 'at least 8 characters';
            case 'hasUppercase': return 'uppercase letter';
            case 'hasLowercase': return 'lowercase letter';
            case 'hasNumber': return 'number';
            case 'hasSpecialChar': return 'special character';
            case 'noCommonWords': return 'avoid common words';
            default: return requirement;
          }
        });
      setMessage(`Password must include: ${failedRequirements.join(', ')}`);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setStatus('updating');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setStatus('error');
      setMessage(error.message || 'Failed to update password.');
    } else {
      setStatus('success');
      setMessage('Password updated. You can now sign in with your new password.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Reset Password</h1>
        <p className="text-sm text-gray-600 mb-4">Enter a new password for your account.</p>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                const value = e.target.value;
                setNewPassword(value);
                if (value) {
                  setPasswordValidation(SecurityManager.validatePassword(value));
                } else {
                  setPasswordValidation(null);
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            {newPassword && passwordValidation && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md border">
                <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  {Object.entries(passwordValidation.requirements).map(([requirement, isValid]) => {
                    const label = {
                      minLength: 'At least 8 characters',
                      hasUppercase: 'At least one uppercase letter (A-Z)',
                      hasLowercase: 'At least one lowercase letter (a-z)',
                      hasNumber: 'At least one number (0-9)',
                      hasSpecialChar: 'At least one special character (!@#$%^&*(),.?":{}|<>)',
                      noCommonWords: 'No common words (password, 123456, etc.)'
                    }[requirement] || requirement;
                    
                    return (
                      <div key={requirement} className="flex items-center space-x-2">
                        {isValid ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs ${isValid ? 'text-green-700' : 'text-red-600'}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    {passwordValidation.isValid ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Strong password!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-700 font-medium">
                          Complete all requirements above
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              minLength={8}
            />
          </div>
          {message && (
            <div className={`text-sm ${status === 'error' ? 'text-red-700' : 'text-green-700'}`}>{message}</div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-60"
            disabled={status === 'updating'}
          >
            {status === 'updating' ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;

