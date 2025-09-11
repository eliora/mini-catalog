import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { login as adminLoginApi } from '../api/admin';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('adminToken') || null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('isAdminLoggedIn') === 'true';
    } catch {
      return false;
    }
  });

  // Persist auth state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('isAdminLoggedIn', 'true');
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdminLoggedIn');
    }
  }, [token]);

  const login = useCallback(async (username, password) => {
    try {
      const data = await adminLoginApi(username, password);
      setToken(data.token || null);
      setIsAdmin(true);
      return data;
    } catch (error) {
      setToken(null);
      setIsAdmin(false);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(() => ({
    token,
    isAdmin,
    login,
    logout,
    getToken: () => token,
  }), [token, isAdmin, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


