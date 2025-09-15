import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ProductDetails {
  ref: string;
  description?: string;
  description_he?: string;
  activeIngredients?: string;
  active_ingredients_he?: string;
  usageInstructions?: string;
  usage_instructions_he?: string;
  ingredients?: string;
  header?: string;
  frenchName?: string;
  french_name?: string;
  pics?: string[];
  accordionDataLoaded: boolean;
}

interface UseProductDetailsResult {
  productDetails: ProductDetails | null;
  isLoading: boolean;
  error: Error | null;
  fetchDetails: (productRef: string) => void;
}

export const useProductDetails = (): UseProductDetailsResult => {
  const [productRef, setProductRef] = useState<string | null>(null);

  const { 
    data: productDetails, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['productDetails', productRef],
    queryFn: async (): Promise<ProductDetails> => {
      if (!productRef) {
        throw new Error('Product reference is required');
      }

      const response = await fetch(`/api/products/${productRef}/details`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!productRef,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: 2,
  });

  const fetchDetails = useCallback((ref: string) => {
    setProductRef(ref);
  }, []);

  return {
    productDetails: productDetails || null,
    isLoading,
    error: error as Error | null,
    fetchDetails,
  };
};

export default useProductDetails;
