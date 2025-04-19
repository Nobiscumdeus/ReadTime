// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
//import { getCurrentUser, logout, isAuthenticated } from '../services/authService';
import { getCurrentUser,logout,isAuthenticated } from '../services/authService';


interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  isAuthenticated: false,
  logout: () => {},
  setUser: () => {},
});

//export const useAuth = () => useContext(AuthContext);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (isAuthenticated()) {
        try {
          const userData = await getCurrentUser();
          setCurrentUser(userData);
        } catch (error) {
          console.error('Error loading user:', error);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const setUser = (user: User) => {
    setCurrentUser(user);
  };

  const value = {
    currentUser,
    loading,
    isAuthenticated: Boolean(currentUser),
    logout: handleLogout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

//export default AuthContext;