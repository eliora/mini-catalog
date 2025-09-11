import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { login as adminLoginApi } from '../api/admin';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Legacy admin auth (keep for backwards compatibility)
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

  // New Supabase auth
  const supabaseAuth = useSupabaseAuth();

  // Persist legacy auth state to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('adminToken', token);
      localStorage.setItem('isAdminLoggedIn', 'true');
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdminLoggedIn');
    }
  }, [token]);

  // Legacy admin login (keep for backwards compatibility)
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

  // Legacy logout
  const logout = useCallback(() => {
    setToken(null);
    setIsAdmin(false);
    // Also sign out from Supabase
    supabaseAuth.signOut();
  }, [supabaseAuth]);

  const value = useMemo(() => ({
    // Legacy auth (for admin panel compatibility)
    token,
    isAdmin,
    login,
    logout,
    getToken: () => token,
    
    // New Supabase auth
    user: supabaseAuth.user,
    isAuthenticated: supabaseAuth.isAuthenticated,
    isVerified: supabaseAuth.isVerified,
    loading: supabaseAuth.loading,
    initializing: supabaseAuth.initializing,
    
    // Supabase auth methods
    signUp: supabaseAuth.signUp,
    signIn: supabaseAuth.signIn,
    signInWithProvider: supabaseAuth.signInWithProvider,
    signOut: supabaseAuth.signOut,
    resetPassword: supabaseAuth.resetPassword,
    updatePassword: supabaseAuth.updatePassword,
    getUserProfile: supabaseAuth.getUserProfile,
    updateUserProfile: supabaseAuth.updateUserProfile,
  }), [token, isAdmin, login, logout, supabaseAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


