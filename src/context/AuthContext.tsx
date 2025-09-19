'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, Session } from '@supabase/supabase-js';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { AuthState, AuthUser, UserProfile, SignInFormData, SignUpFormData, AuthResponse, UserRole } from '@/types/auth';
import { Database } from '@/types/supabase';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // React Query client for cache management
  const queryClient = useQueryClient();
  
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | undefined>();

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      // First check if user exists in users table (for admin role)
      const { data: userData, error: userError } = await supabaseBrowserClient
        .from('users')
        .select('id, email, user_role, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Create profile object
      const profileData: UserProfile = userData ? {
        id: String((userData as Record<string, unknown>).id || ''),
        email: String((userData as Record<string, unknown>).email || ''),
        name: String((userData as Record<string, unknown>).name || ''),
        business_name: (userData as Record<string, unknown>).business_name as string | null,
        phone_number: (userData as Record<string, unknown>).phone_number as string | null,
        address: (userData as Record<string, unknown>).address as unknown,
        user_roles: (userData as Record<string, unknown>).user_roles as string[] || ['standard'],
        status: String((userData as Record<string, unknown>).status || 'active'),
        created_at: String((userData as Record<string, unknown>).created_at || ''),
        updated_at: String((userData as Record<string, unknown>).updated_at || ''),
        last_login: (userData as Record<string, unknown>).last_login as string | null,
        user_role: String((userData as Record<string, unknown>).user_role || 'standard'),
        first_name: String((userData as Record<string, unknown>).name || '').split(' ')[0] || '',
        last_name: String((userData as Record<string, unknown>).name || '').split(' ').slice(1).join(' ') || ''
      } : {
        id: userId,
        email: user?.email || '',
        name: '',
        business_name: null,
        phone_number: null,
        address: null,
        user_roles: ['standard'],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: null,
        user_role: 'standard',
        first_name: '',
        last_name: ''
      };

      setProfile(profileData);

      // Update user object with profile
      setUser(prev => prev ? {
        ...prev,
        profile: profileData
      } : null);

    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [user?.email]);

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing auth state...');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // Get initial session
        const { data: { session }, error } = await supabaseBrowserClient.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          setUser(null);
          setSession(null);
          setError(error.message);
        } else {
          console.log('📱 Initial session:', session?.user ? `User: ${session.user.email}` : 'No session found');
          setSession(session);
          
          if (session?.user) {
            const authUser: AuthUser = {
              ...session.user,
              profile: undefined // Will be loaded separately
            };
            setUser(authUser);
            
            // Load user profile
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setError(error instanceof Error ? error.message : 'Auth initialization failed');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
          setIsLoading(false);
          console.log('✅ Auth initialization completed');
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user ? `User: ${session.user.email}` : 'No user');
      
      if (!mounted) return;
      
      setSession(session);
      setIsLoading(false);
      setError(undefined);

      if (session?.user) {
        const authUser: AuthUser = {
          ...session.user,
          profile: undefined
        };
        setUser(authUser);
        
        // Load user profile
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await loadUserProfile(session.user.id);
        }
      } else {
        setUser(null);
        setProfile(null);
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing cache');
          queryClient.clear();
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient, loadUserProfile]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      console.log('✅ Sign in successful');
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, userData?: Partial<UserProfile>): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
        options: {
          data: userData || {},
        },
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      console.log('✅ Sign up successful');
      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out with React Query cache clearing
  const signOut = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Clear React Query cache to prevent stale data issues
      queryClient.clear();
      console.log('🗑️ React Query cache cleared on logout');
      
      // Sign out from Supabase
      const { error } = await supabaseBrowserClient.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setError(error.message);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      setError(error instanceof Error ? error.message : 'Sign out failed');
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { error } = await supabaseBrowserClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'No authenticated user' };
    
    setIsLoading(true);
    setError(undefined);
    
    try {
      const { data, error } = await supabaseBrowserClient
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        setError(error.message);
        return { error: error.message };
      }

      // Update local profile state
      if (data) {
        setProfile(data as unknown as UserProfile);
        setUser(prev => prev ? {
          ...prev,
          profile: data as unknown as UserProfile
        } : null);
      }

      return {};
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Utility functions
  const isAuthenticated = useCallback((): boolean => {
    return !!user;
  }, [user]);

  const hasRole = useCallback((role: string): boolean => {
    return profile?.user_role === role;
  }, [profile]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const value = useMemo((): AuthState => ({
    // State
    user,
    session,
    profile,
    isLoading,
    isInitializing,
    error,
    
    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    
    // Utilities
    isAuthenticated,
    hasRole,
    isAdmin,
  }), [
    user,
    session, 
    profile,
    isLoading,
    isInitializing,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    isAuthenticated,
    hasRole,
    isAdmin
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
