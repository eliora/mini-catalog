import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Supabase auth
  const supabaseAuth = useSupabaseAuth();
  
  // User role and admin check (Supabase only)
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role from Supabase when user changes
  useEffect(() => {
    const checkUserRole = async () => {
      if (supabaseAuth.user) {
        try {
          const { data, error } = await supabase.from('users')
            .select('user_role')
            .eq('id', supabaseAuth.user.id)
            .single();
          
          if (!error && data) {
            setUserRole(data.user_role);
            setIsAdmin(data.user_role === 'admin');
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setIsAdmin(false);
        }
      } else {
        setUserRole(null);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, [supabaseAuth.user]);

  // Sign out (Supabase only)
  const signOut = useCallback(() => {
    supabaseAuth.signOut();
  }, [supabaseAuth]);

  const value = useMemo(() => ({
    // Admin status (Supabase role-based)
    isAdmin,
    userRole, // Current user role from database
    
    // Supabase auth
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
  }), [isAdmin, userRole, supabaseAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


