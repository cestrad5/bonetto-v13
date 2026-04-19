import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

// Interceptor to add Firebase Token to headers
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getProfile = async () => {
  const response = await api.get('/api/me');
  return response.data;
};

export default api;
