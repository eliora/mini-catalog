/**
 * @file Universal Admin Resource Hook
 * @description Reusable hook for admin CRUD operations across all management modules
 * Based on the client management authentication and API pattern
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Generic interfaces
interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Client management API response structure (the working pattern)
interface ApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationState;
  filters?: Record<string, unknown>;
  sorting?: { sortBy: string; sortOrder: string };
  stats?: Record<string, unknown>;
  error?: string;
}

interface UseAdminResourceOptions<T> {
  resource: 'clients' | 'products' | 'orders';
  endpoint: string;
  transformer?: (data: unknown) => T;
  initialFilters?: Record<string, unknown>;
  autoFetch?: boolean;
}

interface UseAdminResourceReturn<T> {
  // Data state
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  availableFilters: Record<string, unknown>;
  stats: Record<string, unknown>;
  
  // Actions
  fetchData: (page?: number, limit?: number, filters?: Record<string, unknown>) => Promise<void>;
  createItem: (itemData: Record<string, unknown>) => Promise<void>;
  updateItem: (itemData: Record<string, unknown>, id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  
  // Utility
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useAdminResource = <T extends { id: string }>({
  resource,
  endpoint,
  transformer,
  initialFilters = {},
  autoFetch = true
}: UseAdminResourceOptions<T>): UseAdminResourceReturn<T> => {
  
  // State management (same pattern as useClientManagement)
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20, // Default 20 rows per page
    total: 0,
    totalPages: 0
  });
  const [availableFilters, setAvailableFilters] = useState<Record<string, unknown>>({});
  const [stats, setStats] = useState<Record<string, unknown>>({});

  // Use ref to store current pagination values to avoid dependency issues
  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  // Fetch data (same pattern as fetchClients)
  const fetchData = useCallback(async (
    page = 1, 
    limit = 20, // Default 20 rows per page
    filters: Record<string, unknown> = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        ...initialFilters
      });
      
      // Always add limit parameter
      params.append('limit', limit.toString());
      
      // Add dynamic filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`${endpoint}?${params}`);
      
      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('אין לך הרשאות לגשת למידע זה. אנא התחבר מחדש.');
        }
        if (response.status === 403) {
          throw new Error('אין לך הרשאות מנהל לגשת למידע זה.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${resource}`);
      }

      const apiResponse: ApiResponse<T> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || `Failed to fetch ${resource}`);
      }

      // Get data array based on resource type
      const items = (apiResponse as unknown as Record<string, unknown>)[resource] as T[] || (apiResponse.data as T[]) || [];
      
      // Apply transformer if provided
      const transformedData = transformer 
        ? items.map(transformer) 
        : items;
      
      setData(transformedData);
      
      // Set pagination (always present in client management)
      setPagination(apiResponse.pagination);
      
      // Set available filters if available
      if (apiResponse.filters) {
        setAvailableFilters(apiResponse.filters);
      }
      
      // Set stats if available
      if (apiResponse.stats) {
        setStats(apiResponse.stats);
      }

    } catch (err) {
      console.error(`Error fetching ${resource}:`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${resource}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [resource, endpoint, transformer, initialFilters]);

  // Create item (same pattern as handleSaveClient)
  const createItem = useCallback(async (itemData: Record<string, unknown>) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        throw new Error('אין לך הרשאות לבצע פעולה זו. אנא התחבר מחדש.');
      }
      if (response.status === 403) {
        throw new Error('אין לך הרשאות מנהל לבצע פעולה זו.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to create ${resource.slice(0, -1)}`);
    }

    // Refresh data after creation
    await fetchData(paginationRef.current.page, paginationRef.current.limit, {});
  }, [endpoint, resource, fetchData, paginationRef]); // Include paginationRef

  // Update item (same pattern as handleSaveClient)
  const updateItem = useCallback(async (itemData: Record<string, unknown>, id: string) => {
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData)
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        throw new Error('אין לך הרשאות לבצע פעולה זו. אנא התחבר מחדש.');
      }
      if (response.status === 403) {
        throw new Error('אין לך הרשאות מנהל לבצע פעולה זו.');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update ${resource.slice(0, -1)}`);
    }

    // Refresh data after update
    await fetchData(paginationRef.current.page, paginationRef.current.limit, {});
  }, [endpoint, resource, fetchData, paginationRef]); // Include paginationRef

  // Delete item (same pattern as handleDeleteClient)
  const deleteItem = useCallback(async (id: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק ${resource.slice(0, -1)} זה?`)) {
      return;
    }

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('אין לך הרשאות לבצע פעולה זו. אנא התחבר מחדש.');
        }
        if (response.status === 403) {
          throw new Error('אין לך הרשאות מנהל לבצע פעולה זו.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${resource.slice(0, -1)}`);
      }

      // Refresh data after deletion
      await fetchData(paginationRef.current.page, paginationRef.current.limit, {});
    } catch (err) {
      console.error(`Error deleting ${resource.slice(0, -1)}:`, err);
      setError(err instanceof Error ? err.message : `Failed to delete ${resource.slice(0, -1)}. Please try again.`);
    }
  }, [endpoint, resource, fetchData, paginationRef]); // Include paginationRef

  // Refresh current data
  const refresh = useCallback(async () => {
    await fetchData(paginationRef.current.page, paginationRef.current.limit, {});
  }, [fetchData, paginationRef]); // Include paginationRef

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);


  // Use ref to store fetchData function to avoid dependency issues
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Auto-fetch on mount (same as useClientManagement)
  useEffect(() => {
    if (autoFetch) {
      fetchDataRef.current(1, 20, {}); // Default 20 rows per page
    }
  }, [autoFetch]); // Only depend on autoFetch to prevent infinite loops

  return {
    // Data state
    data,
    loading,
    error,
    pagination,
    availableFilters,
    stats,

    // Actions
    fetchData,
    createItem,
    updateItem,
    deleteItem,

    // Utility
    refresh,
    clearError
  };
};
