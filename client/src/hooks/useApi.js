 
// src/hooks/useApi.js - Custom hook for API calls
import { useState, useEffect } from 'react';
import api from '../services/api';

const useApi = (method, url, body = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api[method](url, body);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [method, url, JSON.stringify(body)]);

  return { data, loading, error };
};

export default useApi;