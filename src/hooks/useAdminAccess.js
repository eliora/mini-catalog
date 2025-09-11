/**
 * Hook for checking admin access using Supabase authentication
 * Uses JWT custom claims and user_role from users table
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAdminAccess = () => {
  const { user, isAuthenticated, getUserProfile } = useAuth();
  const [adminInfo, setAdminInfo] = useState({
    isAdmin: false,
    isVerifiedMember: false,
    userRole: 'standard',
    loading: true,
    error: null
  });

  // Check if user has admin access
  const checkAdminAccess = useCallback(async () => {
    try {
      setAdminInfo(prev => ({ ...prev, loading: true, error: null }));

      if (!isAuthenticated || !user) {
        setAdminInfo({
          isAdmin: false,
          isVerifiedMember: false,
          userRole: 'anonymous',
          loading: false,
          error: null
        });
        return false;
      }

      // Method 1: Check JWT custom claims (app_metadata)
      let userRole = 'standard';
      
      // Check if user has role in app_metadata (set by Supabase admin)
      if (user.app_metadata?.role) {
        userRole = user.app_metadata.role;
      }
      // Check if user has role in user_metadata (set during signup)
      else if (user.user_metadata?.role) {
        userRole = user.user_metadata.role;
      }
      // Method 2: Fallback to database users table
      else {
        try {
          const profile = await getUserProfile();
          userRole = profile?.user_role || 'standard';
        } catch (err) {
          console.warn('Could not fetch user profile, using default role');
        }
      }

      const isAdmin = userRole === 'admin';
      const isVerifiedMember = userRole === 'verified_member' || isAdmin;

      setAdminInfo({
        isAdmin,
        isVerifiedMember,
        userRole,
        loading: false,
        error: null
      });

      return isAdmin;
    } catch (error) {
      console.error('Error checking admin access:', error);
      setAdminInfo({
        isAdmin: false,
        isVerifiedMember: false,
        userRole: 'unknown',
        loading: false,
        error: error.message
      });
      return false;
    }
  }, [isAuthenticated, user, getUserProfile]);

  // Initialize admin access check
  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  // Set user as admin (for testing/development)
  const setUserAsAdmin = useCallback(async () => {
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      // Update user role in database
      const profile = await getUserProfile();
      if (profile) {
        // This would typically be done through an admin API
        console.log('To set user as admin, update user_role in database or app_metadata');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error setting user as admin:', error);
      throw error;
    }
  }, [user, getUserProfile]);

  return {
    // Admin status
    isAdmin: adminInfo.isAdmin,
    isVerifiedMember: adminInfo.isVerifiedMember,
    userRole: adminInfo.userRole,
    loading: adminInfo.loading,
    error: adminInfo.error,
    
    // Functions
    checkAdminAccess,
    setUserAsAdmin,
    refreshAccess: checkAdminAccess,
    
    // Utility
    canAccessAdmin: adminInfo.isAdmin,
    canViewPrices: adminInfo.isVerifiedMember,
  };
};

export default useAdminAccess;
