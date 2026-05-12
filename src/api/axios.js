import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: otomatis attach JWT token ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;
