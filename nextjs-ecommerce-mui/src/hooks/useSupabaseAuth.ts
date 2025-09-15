import { useState, useEffect, useCallback } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

type UserProfile = Database['public']['Tables'] extends { users: any }
  ? Database['public']['Tables']['users']['Row']
  : {
      id: string;
      email: string;
      user_role: 'admin' | 'standard';
      created_at: string;
      updated_at: string;
    };

interface UseSupabaseAuthResult {
  // State
  user: User | null;
  loading: boolean;
  initializing: boolean;
  
  // Auth methods
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithProvider: (provider: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  
  // Profile methods
  getUserProfile: () => Promise<UserProfile | null>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  
  // Utility methods
  isAuthenticated: boolean;
  isVerified: boolean;
}

export const useSupabaseAuth = (): UseSupabaseAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state
  useEffect(() => {
    console.log('🚀 Initializing auth state...');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // Get initial session - this should work now with proper timeout handling
        const { data: { session }, error } = await supabaseBrowserClient.auth.getSession();
        
        if (!mounted) return; // Component unmounted, don't update state
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          setUser(null);
        } else {
          console.log('📱 Initial session:', session?.user ? `User: ${session.user.email}` : 'No session found');
          setUser(session?.user ?? null);
          
          // If we have a user, ensure their profile exists
          if (session?.user) {
            await createOrUpdateUserProfile(session.user);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          setInitializing(false);
          setLoading(false);
          console.log('✅ Auth initialization completed');
        }
      }
    };

    initializeAuth();

    // Listen for auth changes - this is the key part for session persistence
    const {
      data: { subscription },
    } = supabaseBrowserClient.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user ? `User: ${session.user.email}` : 'No user');
      
      if (!mounted) return; // Component unmounted, don't update state
      
      // Update user state synchronously (as recommended by Supabase docs)
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle async operations outside the listener
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, create/update user profile
        createOrUpdateUserProfile(session.user).catch(console.error);
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out, clearing state');
        // Clear any additional state here if needed
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Create or update user profile in our users table
  const createOrUpdateUserProfile = async (authUser: User) => {
    try {
      console.log('🔄 Checking user profile for:', authUser.email);
      
      // First, check if user already exists
      const { data: existingUser, error: fetchError } = await supabaseBrowserClient
        .from('users')
        .select('id, email, user_role')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing user:', fetchError);
        return;
      }

      if (existingUser) {
        // User exists, only update email and timestamp (preserve role)
        console.log('✅ User exists, preserving role:', existingUser.user_role);
        const { error } = await supabaseBrowserClient
          .from('users')
          .update({
            email: authUser.email,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUser.id);

        if (error) {
          console.error('Error updating existing user profile:', error);
        } else {
          console.log('✅ Existing user profile updated successfully');
        }
      } else {
        // New user, create with default role
        console.log('🆕 Creating new user with standard role');
        const { error } = await supabaseBrowserClient
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || '',
            user_role: 'standard', // Default role only for new users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error creating new user profile:', error);
        } else {
          console.log('✅ New user profile created successfully');
        }
      }
    } catch (err) {
      console.error('Error in createOrUpdateUserProfile:', err);
    }
  };

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, metadata: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // This will be available in user.user_metadata
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowserClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Sign in successful, auth state change will update user');
      
      // Don't manually set user - let onAuthStateChange handle it
      // This ensures proper session persistence
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with OAuth provider (Google, Facebook, etc.)
  const signInWithProvider = useCallback(async (provider: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowserClient.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign out timeout')), 5000)
      );
      
      // Race between signOut and timeout
      const signOutPromise = supabaseBrowserClient.auth.signOut();
      
      const result = await Promise.race([signOutPromise, timeoutPromise]);
      const error = (result as any)?.error;
      
      if (error) {
        console.warn('Sign out error (will clear state anyway):', error);
        // Don't throw - just clear local state and continue
      }
      
      // Always clear local state
      setUser(null);
    } catch (error) {
      console.error('❌ Sign out error (will clear state anyway):', error);
      // Always clear local state even on error
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowserClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowserClient.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user profile from our users table
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabaseBrowserClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }, [user]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('No authenticated user');

    setLoading(true);
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

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    // State
    user,
    loading,
    initializing,
    
    // Auth methods
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updatePassword,
    
    // Profile methods
    getUserProfile,
    updateUserProfile,
    
    // Utility methods
    isAuthenticated: !!user,
    isVerified: user?.email_confirmed_at != null,
  };
};
