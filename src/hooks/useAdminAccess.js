/**
 * Hook for checking admin access
 * Show admin panel only to users with admin role
 * Prices shown to any authenticated user (controlled by Supabase RLS)
 */

import { useAuth } from '../context/AuthContext';

export const useAdminAccess = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  return {
    // Admin panel access (only for admin role)
    isAdmin,
    
    // Utility aliases
    canAccessAdmin: isAdmin,
    hasAccess: isAdmin,
    
    // User state
    isAuthenticated,
    
    // Access checker
    canAccess: (requireAdmin = true) => requireAdmin ? isAdmin : isAuthenticated
  };
};

export default useAdminAccess;
