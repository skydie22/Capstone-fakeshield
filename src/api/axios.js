import axios from 'axios';

const api = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance khusus untuk request publik (tanpa token)
export const publicApi = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: otomatis attach JWT token ke setiap request pada instance 'api'
api.interceptors.request.use(
  (config) => {
    // Ambil token dari storage mana pun yang ada
    const token = localStorage.getItem('fs_token') || sessionStorage.getItem('fs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token expired pada instance 'api'
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Bersihkan seluruh kemungkinan storage secara agresif
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace('/auth');
    }
    return Promise.reject(error);
  }
);

export default api;
