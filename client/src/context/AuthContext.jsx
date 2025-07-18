// src/context/AuthContext.jsx - Authentication context
import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/auth/me').then((response) => {
        setUser(response.data);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    // Fetch user info after login
    const userRes = await api.get('/api/auth/me');
    setUser(userRes.data);
  };

  // Add register function for signup page
  const register = async (username, email, password) => {
    const response = await api.post('/api/auth/register', { username, email, password });
    localStorage.setItem('token', response.data.token);
    // Fetch user info after register
    const userRes = await api.get('/api/auth/me');
    setUser(userRes.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};