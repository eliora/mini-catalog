import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    console.log('🚀 Initializing auth state...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      } else {
        console.log('📱 Initial session:', session?.user ? `User: ${session.user.email}` : 'No session');
      }
      setUser(session?.user ?? null);
      setInitializing(false);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user ? `User: ${session.user.email}` : 'No user');
      
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle sign up confirmation
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in, create/update user profile
        await createOrUpdateUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Create or update user profile in our users table
  const createOrUpdateUserProfile = async (authUser) => {
    try {
      console.log('🔄 Checking user profile for:', authUser.email);
      
      // First, check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
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
        const { error } = await supabase
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
        const { error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
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
  const signUp = useCallback(async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
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
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with OAuth provider (Google, Facebook, etc.)
  const signInWithProvider = useCallback(async (provider) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
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
      const signOutPromise = supabase.auth.signOut();
      
      const { error } = await Promise.race([signOutPromise, timeoutPromise]);
      
      if (error) {
        
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
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
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
  const updatePassword = useCallback(async (newPassword) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
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
  const getUserProfile = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }, [user]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user');

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return data;
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
