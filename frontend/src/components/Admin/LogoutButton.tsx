import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LogoutButton: React.FC = () => {
  const { actions, state } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    actions.logout();
    navigate('/login');
  };

  // Show logout button when authenticated

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
      style={{ zIndex: 9999 }} // Force high z-index
    >
      <LogOut className="w-4 h-4" />
      <span>{state.isAuthenticated ? 'Logout' : 'Not Logged In'}</span>
    </button>
  );
};

export default LogoutButton;