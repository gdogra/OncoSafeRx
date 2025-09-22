import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Card from '../components/UI/Card';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle'|'updating'|'success'|'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // No-op: Supabase session should be present via recovery link
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (newPassword.length < 8) {
      setMessage('Password must be at least 8 characters.');
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
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
              minLength={8}
            />
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

