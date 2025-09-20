import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? <LoginForm /> : <SignupForm />}
      
      {/* Toggle between login and signup - this could also be handled via routing */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 shadow-lg"
        >
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;