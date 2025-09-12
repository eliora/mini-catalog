import { QueryClient } from '@tanstack/react-query';

/**
 * Clean QueryClient setup for e-commerce catalog
 * Optimized for infinite scroll + filtering
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 3 minutes - good balance for product data
      staleTime: 3 * 60 * 1000,
      // Keep in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests
      retry: 2,
      // Keep previous data while fetching new (critical for UX)
      keepPreviousData: true,
      // Don't refetch on window focus (avoid unnecessary calls)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  },
});

export default queryClient;