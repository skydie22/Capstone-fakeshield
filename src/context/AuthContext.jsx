import { createContext, useReducer, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('fs_token') || null,
  isAuthenticated: !!localStorage.getItem('fs_token'),
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

  useEffect(() => {
    const fetchUser = async () => {
      if (!state.token) {
        dispatch({ type: 'FETCH_USER_FAILURE' });
        return;
      }
      try {
        const response = await api.get('/api/auth/me');
        dispatch({
          type: 'FETCH_USER_SUCCESS',
          payload: { user: response.data, token: state.token },
        });
      } catch (error) {
        dispatch({ type: 'FETCH_USER_FAILURE' });
      }
    };

    fetchUser();
  }, [state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('fs_token', token);
      localStorage.setItem('fs_user', JSON.stringify(user));
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
      localStorage.removeItem('fs_token');
      localStorage.removeItem('fs_user');
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

  const logout = () => {
    localStorage.removeItem('fs_token');
    localStorage.removeItem('fs_user');
    dispatch({ type: 'LOGOUT' });
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
