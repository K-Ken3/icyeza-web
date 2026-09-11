import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../utils/format';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ff_user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const persist = useCallback((token, userData) => {
    if (token) localStorage.setItem('ff_token', token);
    if (userData) {
      localStorage.setItem('ff_user', JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const handleAuthResult = useCallback(
    (data) => {
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      return handleAuthResult(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.register(formData);
      return handleAuthResult(data);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useCallback(
    (token, userData) => {
      persist(token, userData);
      return userData;
    },
    [persist]
  );

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('ff_user', JSON.stringify(next));
      return next;
    });
  };

  const refreshProfile = async () => {
    try {
      const data = await userService.getProfile();
      updateUser(data.user);
    } catch (e) {
      const msg = getErrorMessage(e);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener('ff-logout', handleLogout);
    return () => window.removeEventListener('ff-logout', handleLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, updateUser, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
