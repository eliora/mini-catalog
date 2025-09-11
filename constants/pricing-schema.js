/**
 * PRICING SECURITY SYSTEM SCHEMA
 * Generated for Supabase project: erputcvhxxulxmldikfp
 * Last updated: September 11, 2025
 * 
 * This file documents the NEW pricing system that separates pricing data
 * from the public products table for role-based access control.
 */

// =============================================================================
// PRICES TABLE (NEW - SECURE PRICING SYSTEM)
// =============================================================================
export const PRICES_TABLE = {
  name: 'prices',
  purpose: 'Product pricing with role-based access control',
  access_control: 'Verified members and admins only',
  
  columns: {
    // System fields
    id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
    created_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    updated_at: 'TIMESTAMP WITH TIME ZONE DEFAULT now()',
    
    // Foreign key to products
    product_ref: 'TEXT NOT NULL', // References products.ref
    
    // Pricing information
    unit_price: 'NUMERIC(10,2) NOT NULL', // Main price in specified currency
    currency: 'TEXT DEFAULT \'ILS\' NOT NULL', // Currency code
    
    // Optional pricing features
    cost_price: 'NUMERIC(10,2)', // Cost price for profit calculations
    discount_price: 'NUMERIC(10,2)', // Discounted price for sales
    price_tier: 'TEXT DEFAULT \'standard\'', // Pricing tier (standard, premium, wholesale)
  },

  constraints: {
    foreign_key: 'FOREIGN KEY (product_ref) REFERENCES products(ref) ON DELETE CASCADE ON UPDATE CASCADE',
    unique_product: 'UNIQUE(product_ref)', // One price record per product
  },

  indexes: {
    product_ref: 'CREATE INDEX idx_prices_product_ref ON prices(product_ref)',
    unit_price: 'CREATE INDEX idx_prices_unit_price ON prices(unit_price)',
  },

  triggers: {
    updated_at: 'Automatically updates updated_at timestamp on row changes'
  }
};

// =============================================================================
// RLS POLICIES FOR PRICES TABLE
// =============================================================================
export const PRICES_RLS_POLICIES = {
  table: 'prices',
  rls_enabled: true,
  
  policies: [
    {
      name: 'Admin users can manage all prices',
      command: 'ALL',
      role: 'authenticated',
      condition: 'User has admin or verified_member role in users table',
      sql: `
        auth.role() = 'service_role' OR
        (
          auth.role() = 'authenticated' AND
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_role IN ('admin', 'verified_member')
          )
        )
      `
    },
    {
      name: 'Verified members can read prices',
      command: 'SELECT',
      role: 'authenticated',
      condition: 'User has verified_member or admin role',
      sql: `
        auth.role() = 'service_role' OR
        (
          auth.role() = 'authenticated' AND
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_role IN ('admin', 'verified_member')
          )
        )
      `
    },
    {
      name: 'Block anonymous access',
      command: 'ALL',
      role: 'anon',
      condition: 'NO POLICY = NO ACCESS',
      description: 'Anonymous users have no access to pricing data'
    }
  ]
};

// =============================================================================
// USER ROLES SYSTEM
// =============================================================================
export const USER_ROLES = {
  table: 'users',
  role_column: 'user_role',
  
  roles: {
    standard: {
      name: 'standard',
      description: 'Regular users - no pricing access',
      pricing_access: false,
      default: true
    },
    verified_member: {
      name: 'verified_member', 
      description: 'Verified members - can view pricing',
      pricing_access: true,
      permissions: ['view_prices', 'place_orders']
    },
    admin: {
      name: 'admin',
      description: 'Administrators - full access',
      pricing_access: true,
      permissions: ['view_prices', 'edit_prices', 'manage_users', 'place_orders']
    }
  },

  role_assignment: {
    add_column: 'ALTER TABLE public.users ADD COLUMN user_role TEXT DEFAULT \'standard\'',
    create_index: 'CREATE INDEX idx_users_user_role ON public.users(user_role)',
    make_verified: 'UPDATE public.users SET user_role = \'verified_member\' WHERE email = ?',
    make_admin: 'UPDATE public.users SET user_role = \'admin\' WHERE email = ?'
  }
};

// =============================================================================
// PRICING API MAPPING
// =============================================================================
export const PRICING_API_MAPPING = {
  // Database to Application mapping
  database_to_app: {
    'prices.product_ref': 'product.ref',
    'prices.unit_price': 'product.unitPrice',
    'prices.currency': 'product.currency',
    'prices.discount_price': 'product.discountPrice', 
    'prices.price_tier': 'product.priceTier',
    'prices.cost_price': 'product.costPrice'
  },

  // Application to Database mapping  
  app_to_database: {
    'product.ref': 'prices.product_ref',
    'product.unitPrice': 'prices.unit_price',
    'product.currency': 'prices.currency',
    'product.discountPrice': 'prices.discount_price',
    'product.priceTier': 'prices.price_tier',
    'product.costPrice': 'prices.cost_price'
  }
};

// =============================================================================
// MIGRATION IMPACT
// =============================================================================
export const MIGRATION_IMPACT = {
  products_table: {
    removed_columns: ['unit_price'],
    impact: 'Pricing data moved to separate secure table',
    backwards_compatibility: 'Application updated to fetch prices separately'
  },

  application_changes: {
    new_files: [
      'src/api/prices.js',
      'src/hooks/usePricing.js'
    ],
    updated_files: [
      'src/api/products.js',
      'src/components/ProductCard.js', 
      'src/components/ProductListItem.js'
    ],
    new_features: [
      'Role-based pricing visibility',
      'Anonymous user catalog browsing',
      'Verified member pricing access',
      'Admin pricing management'
    ]
  },

  security_improvements: {
    before: 'All users could see pricing in products table',
    after: 'Only verified members and admins can access pricing',
    rls_protection: 'Row Level Security blocks unauthorized access',
    anonymous_experience: 'Full catalog browsing without pricing'
  }
};

// =============================================================================
// DEVELOPMENT REFERENCE
// =============================================================================
export const DEVELOPMENT_REFERENCE = {
  // Check if user can view prices
  check_pricing_access: `
    import { canViewPrices } from '../api/prices';
    const hasAccess = await canViewPrices();
  `,

  // Get prices for products
  fetch_prices: `
    import { getPrices } from '../api/prices';
    const prices = await getPrices(['PROD001', 'PROD002']);
  `,

  // Use pricing hook in components
  use_pricing_hook: `
    import usePricing from '../hooks/usePricing';
    const { canViewPrices, formatPrice, getPricingMessage } = usePricing();
  `,

  // Format price for display
  format_price: `
    const priceInfo = formatPrice('PROD001');
    console.log(priceInfo.display); // "₪50.00"
  `
};

export default {
  PRICES_TABLE,
  PRICES_RLS_POLICIES, 
  USER_ROLES,
  PRICING_API_MAPPING,
  MIGRATION_IMPACT,
  DEVELOPMENT_REFERENCE
};
