// src/services/api.js - Axios instance for API calls
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // From .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;