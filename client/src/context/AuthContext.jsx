import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userJSON = localStorage.getItem('user');
        if (userJSON) {
          setUser(JSON.parse(userJSON));
        }
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await api.post('/users/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/users/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });

      // Server no longer auto-logs-in users on register; return response for the UI
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const response = await api.post('/users/reset-password', { email });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      setError(message);
      throw err;
    }
  };

  const verifyEmail = async (token) => {
    try {
      setError(null);
      
      const response = await api.post('/users/verify-email', { token });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Email verification failed';
      setError(message);
      throw err;
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    try {
      setError(null);
      
      const response = await api.post('/users/confirm-password-reset', { token, newPassword });
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset confirmation failed';
      setError(message);
      throw err;
    }
  };

  const submitApplication = async (applicationData) => {
    try {
      setError(null);
      
      const response = await api.post('/users/submit-application', applicationData);

      // If submission succeeded, update local user object to include the saved application
      const returnedApp = response.data?.application;
      if (returnedApp && user) {
        const updatedUser = { ...user, application: returnedApp, applicationSubmitted: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Application submission failed';
      setError(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      logout,
      resetPassword,
      verifyEmail,
      confirmPasswordReset,
      submitApplication,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
