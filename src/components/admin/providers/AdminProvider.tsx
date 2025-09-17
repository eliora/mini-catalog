/**
 * Admin Provider Component
 * 
 * Provides admin-specific context and state management.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AdminContextType {
  isAdminLoading: boolean;
  adminPermissions: string[];
  hasPermission: (permission: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: React.ReactNode;
}

const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);

  const loadAdminPermissions = useCallback(async () => {
    if (!user) {
      setAdminPermissions([]);
      setIsAdminLoading(false);
      return;
    }

    try {
      // In a real implementation, fetch permissions from API
      // For now, we'll simulate admin permissions
      const mockPermissions = [
        'admin.clients.read',
        'admin.clients.write',
        'admin.clients.delete',
        'admin.products.read',
        'admin.products.write',
        'admin.products.delete',
        'admin.orders.read',
        'admin.orders.write',
        'admin.orders.delete',
        'admin.settings.read',
        'admin.settings.write'
      ];
      
      setAdminPermissions(mockPermissions);
    } catch (error) {
      console.error('Failed to load admin permissions:', error);
      setAdminPermissions([]);
    } finally {
      setIsAdminLoading(false);
    }
  }, [user]);

  const hasPermission = (permission: string): boolean => {
    return adminPermissions.includes(permission);
  };

  const refreshPermissions = async () => {
    setIsAdminLoading(true);
    await loadAdminPermissions();
  };

  useEffect(() => {
    loadAdminPermissions();
  }, [user, loadAdminPermissions]);

  const value: AdminContextType = {
    isAdminLoading,
    adminPermissions,
    hasPermission,
    refreshPermissions
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminProvider;
