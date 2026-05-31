import { createContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('fs_token') || sessionStorage.getItem('fs_token') || null,
  isAuthenticated: !!(localStorage.getItem('fs_token') || sessionStorage.getItem('fs_token')),
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'FETCH_USER_START':
      return { ...state, isLoading: true };
    case 'LOGIN_SUCCESS':
    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token || state.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
    case 'FETCH_USER_FAILURE':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const logoutSilently = () => {
    // Daftar semua kunci yang digunakan aplikasi
    const keys = ['fs_token', 'fs_user', 'fs_login_at'];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Hapus juga data lain yang mungkin ada (fallback)
    localStorage.clear();
    sessionStorage.clear();
  };

  const logout = () => {
    logoutSilently();
    dispatch({ type: 'LOGOUT' });
    // Gunakan replace: true untuk hindari user kembali ke halaman ber-token via back button
    window.location.replace('/auth');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('fs_token') || sessionStorage.getItem('fs_token');
      const loginAt = localStorage.getItem('fs_login_at') || sessionStorage.getItem('fs_login_at');
      
      if (!token) {
        dispatch({ type: 'FETCH_USER_FAILURE' });
        return;
      }

      // Cek kedaluwarsa 7 hari HANYA jika menggunakan localStorage (Remember Me)
      if (localStorage.getItem('fs_token') && loginAt) {
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const isExpired = Date.now() - parseInt(loginAt) > sevenDays;
        
        if (isExpired) {
          logout();
          return;
        }
      }
      
      try {
        const response = await api.get('/api/auth/me');
        const user = response.data;
        dispatch({
          type: 'FETCH_USER_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        dispatch({ type: 'FETCH_USER_FAILURE' });
      }
    };

    fetchUser();
  }, [state.token]);

  const login = async (email, password, remember = false) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      // Pilih storage: localStorage (permanen) atau sessionStorage (sementara)
      const storage = remember ? localStorage : sessionStorage;
      
      storage.setItem('fs_token', token);
      storage.setItem('fs_user', JSON.stringify(user));
      storage.setItem('fs_login_at', Date.now().toString());
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      logoutSilently(); // Bersihkan sisa session lama
      dispatch({ type: 'REGISTER_SUCCESS' });
      return {
        success: true,
        message: response.data?.message || 'Registrasi berhasil, silakan login untuk melanjutkan',
      };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
