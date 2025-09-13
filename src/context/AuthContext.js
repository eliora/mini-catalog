import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // React Query client for cache management
  const queryClient = useQueryClient();
  
  // Supabase auth
  const supabaseAuth = useSupabaseAuth();
  
  // Admin check for admin panel access
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (supabaseAuth.user) {
        try {
          const { data, error } = await supabase.from('users')
            .select('user_role')
            .eq('id', supabaseAuth.user.id)
            .single();
          
          // Show admin panel only to admin role
          setIsAdmin(!error && data?.user_role === 'admin');
        } catch (err) {
          console.error('Error checking admin role:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [supabaseAuth.user]);

  // Sign out with React Query cache clearing
  const signOut = useCallback(async () => {
    try {
      // Clear React Query cache to prevent stale data issues
      queryClient.clear();
      console.log('🗑️ React Query cache cleared on logout');
      
      // Sign out from Supabase
      await supabaseAuth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Still clear cache even if signOut fails
      queryClient.clear();
    }
  }, [supabaseAuth, queryClient]);

  const value = useMemo(() => ({
    // Supabase auth
    user: supabaseAuth.user,
    isAuthenticated: supabaseAuth.isAuthenticated,
    isVerified: supabaseAuth.isVerified,
    loading: supabaseAuth.loading,
    initializing: supabaseAuth.initializing,
    
    // Admin panel access (only for admin role)
    isAdmin,
    
    // Supabase auth methods
    signUp: supabaseAuth.signUp,
    signIn: supabaseAuth.signIn,
    signInWithProvider: supabaseAuth.signInWithProvider,
    signOut,
    resetPassword: supabaseAuth.resetPassword,
    updatePassword: supabaseAuth.updatePassword,
    getUserProfile: supabaseAuth.getUserProfile,
    updateUserProfile: supabaseAuth.updateUserProfile,
  }), [isAdmin, supabaseAuth, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


