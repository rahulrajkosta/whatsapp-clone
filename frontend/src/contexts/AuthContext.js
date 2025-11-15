import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      authAPI.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch((error) => {
          console.log('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      setUser(response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error:  'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
