/**
 * @file Custom Hook for Client Management Logic
 * @description Encapsulates all business logic for the client management page,
 * including state management, data fetching, and CRUD operations.
 */
import { useState, useEffect, useCallback } from 'react';
import { USERS_TABLE } from '@/constants/users-schema.js';

// --- Types ---
// (Assuming Client and UserRole types are defined in a central types file in the future)
interface Client {
  id: string;
  email: string;
  full_name: string;
  user_role: 'standard' | 'verified_members' | 'customer' | 'admin';
  business_name?: string;
  phone_number?: string;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login?: string;
  display_name?: string;
  formatted_address?: string;
  is_admin?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  clients: Client[];
  pagination: PaginationState;
  filters?: {
    available_user_roles: string[];
    available_statuses: string[];
  };
}

// --- Hook ---
export const useClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [availableFilters, setAvailableFilters] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20, // Default 20 rows per page
    total: 0,
    totalPages: 0
  });

  const fetchClients = useCallback(async (page = 1, limit = 20, filters: Record<string, unknown> = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (filters.search) params.append('search', String(filters.search));
      if (filters.user_role) params.append('user_role', String(filters.user_role));
      if (filters.status) params.append('status', String(filters.status));

      const response = await fetch(`/api/admin/client-management?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clients');
      }

      const data: ApiResponse = await response.json();
      
      setClients(data.clients);
      setPagination(data.pagination);
      
      if (data.filters) {
        setAvailableFilters(data.filters);
      }

    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserRoles = useCallback(async () => {
    try {
      const constantRoles: UserRole[] = Object.entries(USERS_TABLE.enums.USER_ROLES).map(([_key, value], index) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
        id: (index + 1).toString(),
        name: value,
        permissions: [], // Permissions can be expanded later
        description: `Description for ${value}`
      }));
      setUserRoles(constantRoles);
    } catch (err) {
      console.error('Error setting up user roles:', err);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchUserRoles();
  }, [fetchClients, fetchUserRoles]);

  const handleSaveClient = useCallback(async (clientData: Record<string, unknown>, selectedClient?: Client) => {
    const url = '/api/admin/client-management';
    const method = selectedClient ? 'PUT' : 'POST';

    const requestData = {
      ...(selectedClient && { id: selectedClient.id }),
      ...clientData,
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${selectedClient ? 'update' : 'create'} client`);
    }

    await fetchClients(pagination.page, pagination.limit);
  }, [fetchClients, pagination.page, pagination.limit]);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הלקוח? הפעולה תהפוך את הלקוח ללא פעיל.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/client-management?id=${clientId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }

      await fetchClients(pagination.page, pagination.limit);
    } catch (err) {
      console.error('Error deleting client:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete client. Please try again.');
    }
  }, [fetchClients, pagination.page, pagination.limit]);

  return {
    clients,
    userRoles,
    availableFilters,
    loading,
    error,
    pagination,
    fetchClients,
    handleSaveClient,
    handleDeleteClient
  };
};
