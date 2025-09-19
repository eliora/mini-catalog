/**
 * Prices API - Handles pricing data with role-based access control
 * Only verified members and admins can access pricing information
 */

import { supabaseBrowserClient } from '@/lib/supabaseClient';

export interface PriceInfo {
  unitPrice: number;
  currency: string;
  discountPrice?: number;
  priceTier: string;
  updatedAt: string;
}

export interface PricesMap {
  [productRef: string]: PriceInfo;
}

/**
 * Get prices for products (requires verified member role)
 * @param {string|string[]} productRefs - Single ref or array of product refs
 * @returns {Promise<PricesMap>} - Prices keyed by product ref
 */
export const getPrices = async (productRefs: string | string[] | null = null): Promise<PricesMap> => {
  try {
    let query = supabaseBrowserClient
      .from('prices')
      .select(`
        product_ref,
        unit_price,
        currency,
        discount_price,
        price_tier,
        updated_at
      `);

    // Filter by specific product refs if provided
    if (productRefs) {
      const refs = Array.isArray(productRefs) ? productRefs : [productRefs];
      query = query.in('product_ref', refs);
    }

    const { data, error } = await query;

    if (error) {
      // If it's a permission error, return empty object (user can't see prices)
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        console.info('User does not have permission to view prices');
        return {};
      }
      throw error;
    }

    // Convert array to object keyed by product_ref for easy lookup
    const pricesMap: PricesMap = {};
    if (data) {
      data.forEach(price => {
        pricesMap[price.product_ref] = {
          unitPrice: price.unit_price,
          currency: price.currency || 'ILS',
          discountPrice: price.discount_price || undefined,
          priceTier: price.price_tier || 'standard',
          updatedAt: price.updated_at
        };
      });
    }

    return pricesMap;
  } catch (error) {
    console.error('Error fetching prices:', error);
    // Return empty object on error so app continues to work without prices
    return {};
  }
};

/**
 * Get price for a single product
 * @param {string} productRef - Product reference
 * @returns {Promise<PriceInfo|null>} - Price object or null if not accessible
 */
export const getPrice = async (productRef: string): Promise<PriceInfo | null> => {
  const prices = await getPrices(productRef);
  return prices[productRef] || null;
};

/**
 * Check if current user can view prices
 * @returns {Promise<boolean>} - True if user has price access
 */
export const canViewPrices = async (): Promise<boolean> => {
  try {
    // Try to fetch a single price to test permissions
    const { error } = await supabaseBrowserClient
      .from('prices')
      .select('product_ref')
      .limit(1);

    if (error) {
      // Permission denied means user cannot view prices
      if (error.code === 'PGRST301' || error.message.includes('policy')) {
        return false;
      }
      // Other errors might be temporary, assume no access for safety
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking price permissions:', error);
    return false;
  }
};

/**
 * Get user's pricing tier/role information
 * @returns {Promise<Object>} - User pricing information
 */
export const getUserPricingInfo = async () => {
  try {
    const { data: { user } } = await supabaseBrowserClient.auth.getUser();
    
    if (!user) {
      return {
        canViewPrices: false,
        role: 'anonymous',
        tier: null
      };
    }

    // Check if user can view prices
    const hasAccess = await canViewPrices();

    return {
      canViewPrices: hasAccess,
      role: user.role || 'authenticated',
      tier: hasAccess ? 'verified_member' : 'standard',
      userId: user.id
    };
  } catch (error) {
    console.error('Error getting user pricing info:', error);
    return {
      canViewPrices: false,
      role: 'unknown',
      tier: null
    };
  }
};

/**
 * Admin function: Update product price
 * @param {string} productRef - Product reference
 * @param {number} unitPrice - New unit price
 * @param {Object} options - Additional price options
 * @returns {Promise<PriceInfo>} - Updated price object
 */
export const updatePrice = async (
  productRef: string, 
  unitPrice: number, 
  options: Partial<PriceInfo> = {}
): Promise<PriceInfo> => {
  try {
    const updateData = {
      unit_price: unitPrice,
      updated_at: new Date().toISOString(),
      ...options
    };

    const { data, error } = await supabaseBrowserClient
      .from('prices')
      .upsert({
        product_ref: productRef,
        ...updateData
      })
      .select()
      .single();

    if (error) throw error;

    return {
      unitPrice: data.unit_price,
      currency: data.currency,
      discountPrice: data.discount_price || undefined,
      priceTier: data.price_tier || 'standard',
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error updating price:', error);
    throw error;
  }
};

/**
 * Admin function: Delete product price
 * @param {string} productRef - Product reference
 * @returns {Promise<boolean>} - Success status
 */
export const deletePrice = async (productRef: string): Promise<boolean> => {
  try {
    const { error } = await supabaseBrowserClient
      .from('prices')
      .delete()
      .eq('product_ref', productRef);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting price:', error);
    throw error;
  }
};