import { useInfiniteQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products';

/**
 * FIXED: Proper cross-section multiple choice filtering
 * Handles all combinations of filters correctly
 */
export const useProductsInfiniteQuery = (filters = {}, searchTerm = '') => {
  const {
    selectedLines = [],
    selectedProductTypes = [],
    selectedSkinTypes = [],
    selectedTypes = []
  } = filters;

  // Check if we have any filters at all
  const hasAnyFilters = selectedLines.length > 0 || 
                       selectedProductTypes.length > 0 || 
                       selectedSkinTypes.length > 0 || 
                       selectedTypes.length > 0;

  // Create stable query key that includes ALL filter parameters
  const queryKey = [
    'products-infinite',
    {
      search: searchTerm.trim().toLowerCase(),
      lines: [...selectedLines].sort(),
      productTypes: [...selectedProductTypes].sort(),
      skinTypes: [...selectedSkinTypes].sort(),
      types: [...selectedTypes].sort(),
      hasFilters: hasAnyFilters
    }
  ];

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    
    queryFn: async ({ pageParam = 1 }) => {
      let result;
      
      // STRATEGY: Use server-side filtering ONLY when beneficial
      // Otherwise, load more data and filter client-side for better cross-sections
      
      if (!hasAnyFilters && !searchTerm.trim()) {
        // No filters: Load all products (server-side pagination only)
        result = await getProducts('', '', pageParam, 50, {});
        
      } else if (searchTerm.trim() && !hasAnyFilters) {
        // Search only: Use server-side search (most efficient)
        result = await getProducts(searchTerm.trim(), '', pageParam, 50, {});
        
      } else if (selectedLines.length === 1 && selectedProductTypes.length <= 1 && 
                selectedSkinTypes.length <= 1 && selectedTypes.length <= 1) {
        // Simple single-selection filters: Use server-side (efficient)
        const apiFilters = {
          productType: selectedProductTypes[0] || '',
          skinType: selectedSkinTypes[0] || '',
          type: selectedTypes[0] || ''
        };
        
        result = await getProducts(
          searchTerm.trim(),
          selectedLines[0] || '',
          pageParam,
          50,
          apiFilters
        );
        
      } else {
        // Complex multi-selection or cross-section filters: 
        // Load broader dataset and filter client-side for accuracy
        result = await getProducts(
          searchTerm.trim(), // Keep search term server-side
          '', // No line filter server-side
          pageParam,
          100, // Larger page size to compensate for client filtering
          {} // No server filters
        );
      }

      return {
        products: result.products || [],
        pagination: result.pagination || { 
          page: pageParam, 
          hasMore: false, 
          total: 0 
        }
      };
    },

    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore 
        ? lastPage.pagination.page + 1 
        : undefined;
    },

    // Critical for UX - keep previous data while fetching
    keepPreviousData: true,
    
    // Cache settings
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    
    // Enable by default
    enabled: true,
  });

  // Flatten all pages into single array
  const allProducts = infiniteQuery.data?.pages?.flatMap(page => page.products) || [];

  // FIXED: Comprehensive client-side filtering for cross-sections
  const filteredProducts = allProducts.filter(product => {
    // Apply line filters (ANY match if multiple lines selected)
    if (selectedLines.length > 0) {
      const hasMatchingLine = selectedLines.some(line => 
        product.product_line?.toLowerCase().includes(line.toLowerCase()) ||
        product.skin_type_he?.toLowerCase().includes(line.toLowerCase())
      );
      if (!hasMatchingLine) return false;
    }

    // Apply product type filters (ANY match if multiple types selected)
    if (selectedProductTypes.length > 0) {
      const hasMatchingType = selectedProductTypes.some(type =>
        product.product_type?.toLowerCase().includes(type.toLowerCase())
      );
      if (!hasMatchingType) return false;
    }

    // Apply skin type filters (ANY match if multiple skin types selected)
    if (selectedSkinTypes.length > 0) {
      const hasMatchingSkinType = selectedSkinTypes.some(skinType =>
        product.skin_type_he?.toLowerCase().includes(skinType.toLowerCase())
      );
      if (!hasMatchingSkinType) return false;
    }

    // Apply type filters (ANY match if multiple types selected)
    if (selectedTypes.length > 0) {
      const hasMatchingProductType = selectedTypes.some(type =>
        product.type?.toLowerCase().includes(type.toLowerCase())
      );
      if (!hasMatchingProductType) return false;
    }

    // Product passes ALL filter categories (cross-section filtering)
    return true;
  });

  return {
    // Data
    products: filteredProducts,
    
    // Loading states
    isLoading: infiniteQuery.isLoading,
    isFetching: infiniteQuery.isFetching,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    
    // Error handling
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    
    // Pagination
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
    
    // Actions
    refetch: infiniteQuery.refetch
  };
};

export default useProductsInfiniteQuery;
