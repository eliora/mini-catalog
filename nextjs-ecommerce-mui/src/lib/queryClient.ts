import { QueryClient } from '@tanstack/react-query';

/**
 * Clean QueryClient setup for e-commerce catalog
 * Optimized for infinite scroll + filtering
 */
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 3 minutes - good balance for product data
      staleTime: 3 * 60 * 1000,
      // Keep in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests
      retry: 2,
      // Don't refetch on window focus (avoid unnecessary calls)
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
    },
  },
});

// Global query client for client-side
let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) browserQueryClient = createQueryClient();
    return browserQueryClient;
  }
};
