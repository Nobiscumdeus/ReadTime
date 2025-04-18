// components/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  
  const handleLogout = (): void => {
    // Call the logout service function
    logout();
    // Redirect to home page
    navigate('/');
  };
  
  return (
    <button 
      onClick={handleLogout}
      className={`bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors ${className}`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;