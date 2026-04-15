

// Simple store equivalent using Context will be built with React Context for auth state to meet typical specific requirements or just standard Context. Here we use basic React Context for Auth.
// Wait, we need auth context.

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('mm_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('mm_lang', language);
  }, [language]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Sync theme
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (user?.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [user?.theme]);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data);
      toast.success('Logged in successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      setUser(res.data);
      toast.success('Registered successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const res = await api.post('/auth/google', { idToken });
      setUser(res.data);
      toast.success('Logged in with Google');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/update-profile', data);
      setUser(res.data);
      toast.success('Profile updated');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile, language, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
