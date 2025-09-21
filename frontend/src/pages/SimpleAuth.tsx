import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 SIMPLE AUTH: Form submitted!', { email, password });
    
    setLoading(true);
    setError('');
    
    try {
      // Demo credentials check
      if (email === 'demo@oncosaferx.com' && password === 'demo123') {
        console.log('✅ SIMPLE AUTH: Demo credentials accepted');
        localStorage.setItem('simpleAuth', JSON.stringify({
          user: {
            id: 'demo-user',
            email,
            firstName: 'Demo',
            lastName: 'User',
            role: 'oncologist'
          }
        }));
        navigate('/');
        return;
      }
      
      // Any other credentials for testing
      if (email && password) {
        console.log('✅ SIMPLE AUTH: Generic credentials accepted');
        localStorage.setItem('simpleAuth', JSON.stringify({
          user: {
            id: 'user-' + Date.now(),
            email,
            firstName: 'Test',
            lastName: 'User', 
            role: 'oncologist'
          }
        }));
        navigate('/');
        return;
      }
      
      setError('Please enter email and password');
    } catch (err) {
      console.error('❌ SIMPLE AUTH: Error:', err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          OncoSafeRx - Simple Auth
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Demo: demo@oncosaferx.com / demo123
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuth;