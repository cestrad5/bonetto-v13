import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 20000,
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

// Sesión expirada (token vencido/inválido) -> forzar logout y avisar al usuario
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=1');
      }
    }
    return Promise.reject(error);
  }
);

export const getProfile = async () => {
  const response = await api.get('/api/me');
  return response.data;
};

export default api;
