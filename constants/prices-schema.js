// ============================================================================
// PRICES TABLE SCHEMA - Database Constants
// ============================================================================
// Complete schema definition for the prices table
// ============================================================================

export const PRICES_TABLE = {
  name: 'prices',
  schema: 'public',
  
  // Column definitions
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      default: 'extensions.uuid_generate_v4()'
    },
    product_ref: {
      type: 'text',
      nullable: false,
      references: 'products(ref)',
      onDelete: 'CASCADE'
    },
    unit_price: {
      type: 'numeric(10,2)',
      nullable: false
    },
    cost_price: {
      type: 'numeric(10,2)',
      nullable: true
    },
    discount_price: {
      type: 'numeric(10,2)',
      nullable: true
    },
    currency: {
      type: 'varchar(3)',
      nullable: false,
      default: 'ILS'
    },
    created_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    },
    updated_at: {
      type: 'timestamp with time zone',
      nullable: false,
      default: 'now()'
    }
  },

  // Constraints
  constraints: {
    primary: 'prices_pkey',
    foreign: ['fk_prices_product_ref'],
    check: [
      'prices_unit_price_check',
      'prices_cost_price_check',
      'prices_discount_price_check',
      'prices_currency_check'
    ]
  },

  // Indexes
  indexes: [
    'idx_prices_product_ref',
    'idx_prices_currency',
    'idx_prices_unit_price',
    'idx_prices_created_at'
  ],

  // Triggers
  triggers: [
    'update_prices_updated_at'
  ],

  // Currency codes (ISO 4217)
  currencies: {
    ILS: 'ILS', // Israeli Shekel
    USD: 'USD', // US Dollar
    EUR: 'EUR', // Euro
    GBP: 'GBP'  // British Pound
  },

  // Price types
  priceTypes: {
    UNIT: 'unit_price',
    COST: 'cost_price',
    DISCOUNT: 'discount_price'
  },

  // RLS Policies
  policies: [
    'Everyone can view prices',
    'Admins can manage all prices',
    'Verified members can view cost prices'
  ]
};

// Helper functions for working with prices
export const PRICES_HELPERS = {
  // Calculate profit margin
  calculateMargin: (unitPrice, costPrice) => {
    if (!unitPrice || !costPrice || costPrice === 0) return 0;
    return ((unitPrice - costPrice) / costPrice) * 100;
  },

  // Calculate profit amount
  calculateProfit: (unitPrice, costPrice) => {
    if (!unitPrice || !costPrice) return 0;
    return unitPrice - costPrice;
  },

  // Calculate discount percentage
  calculateDiscountPercentage: (unitPrice, discountPrice) => {
    if (!unitPrice || !discountPrice || unitPrice === 0) return 0;
    return ((unitPrice - discountPrice) / unitPrice) * 100;
  },

  // Get effective price (discount or unit price)
  getEffectivePrice: (priceRecord) => {
    return priceRecord?.discount_price || priceRecord?.unit_price || 0;
  },

  // Check if product has discount
  hasDiscount: (priceRecord) => {
    return priceRecord?.discount_price && 
           priceRecord.discount_price < priceRecord.unit_price;
  },

  // Format price with currency
  formatPrice: (price, currency = 'ILS', locale = 'he-IL') => {
    if (!price) return '';
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } catch {
      return `${price} ${currency}`;
    }
  },

  // Format price without currency symbol
  formatPriceValue: (price, locale = 'he-IL') => {
    if (!price) return '0.00';
    
    try {
      return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } catch {
      return price.toFixed(2);
    }
  },

  // Convert currency (basic conversion - would need exchange rates API)
  convertCurrency: (amount, fromCurrency, toCurrency, exchangeRate = 1) => {
    if (fromCurrency === toCurrency) return amount;
    return amount * exchangeRate;
  },

  // Validate price data
  validatePrice: (priceData) => {
    const errors = [];
    
    if (!priceData.product_ref) {
      errors.push('Product reference is required');
    }
    
    if (!priceData.unit_price || priceData.unit_price <= 0) {
      errors.push('Valid unit price is required');
    }
    
    if (priceData.cost_price && priceData.cost_price < 0) {
      errors.push('Cost price cannot be negative');
    }
    
    if (priceData.discount_price) {
      if (priceData.discount_price < 0) {
        errors.push('Discount price cannot be negative');
      }
      if (priceData.discount_price >= priceData.unit_price) {
        errors.push('Discount price must be less than unit price');
      }
    }
    
    if (priceData.currency && !Object.values(PRICES_TABLE.currencies).includes(priceData.currency)) {
      errors.push('Invalid currency code');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Calculate bulk pricing tiers
  calculateBulkPricing: (basePrice, quantity, tiers = []) => {
    let effectivePrice = basePrice;
    
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        effectivePrice = tier.discountType === 'percentage' 
          ? basePrice * (1 - tier.discount / 100)
          : basePrice - tier.discount;
      }
    }
    
    return {
      unitPrice: effectivePrice,
      totalPrice: effectivePrice * quantity,
      savings: (basePrice - effectivePrice) * quantity
    };
  },

  // Get price comparison data
  getPriceComparison: (currentPrice, previousPrice) => {
    if (!previousPrice) return null;
    
    const difference = currentPrice - previousPrice;
    const percentageChange = (difference / previousPrice) * 100;
    
    return {
      difference,
      percentageChange,
      direction: difference > 0 ? 'increase' : difference < 0 ? 'decrease' : 'same'
    };
  }
};

// SQL queries for common operations
export const PRICES_QUERIES = {
  // Select price by product reference
  SELECT_BY_PRODUCT_REF: `
    SELECT * FROM public.prices 
    WHERE product_ref = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `,
  
  // Select all prices for a product (price history)
  SELECT_PRICE_HISTORY: `
    SELECT * FROM public.prices 
    WHERE product_ref = $1 
    ORDER BY created_at DESC
  `,
  
  // Select current prices for all products
  SELECT_CURRENT_PRICES: `
    SELECT DISTINCT ON (product_ref) 
      product_ref, unit_price, cost_price, discount_price, currency, updated_at
    FROM public.prices 
    ORDER BY product_ref, created_at DESC
  `,
  
  // Select prices with product information
  SELECT_WITH_PRODUCTS: `
    SELECT pr.*, p.hebrew_name, p.english_name, p.product_line, p.qty
    FROM public.prices pr
    JOIN public.products p ON pr.product_ref = p.ref
    ORDER BY pr.created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  // Insert new price record
  INSERT_PRICE: `
    INSERT INTO public.prices (product_ref, unit_price, cost_price, discount_price, currency)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  
  // Update price record
  UPDATE_PRICE: `
    UPDATE public.prices 
    SET unit_price = $2, cost_price = $3, discount_price = $4, currency = $5
    WHERE id = $1
    RETURNING *
  `,
  
  // Update price by product reference (creates new record)
  UPDATE_PRICE_BY_REF: `
    INSERT INTO public.prices (product_ref, unit_price, cost_price, discount_price, currency)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,
  
  // Delete price record
  DELETE_PRICE: `
    DELETE FROM public.prices 
    WHERE id = $1 
    RETURNING *
  `,
  
  // Get price statistics
  SELECT_PRICE_STATS: `
    SELECT 
      currency,
      COUNT(*) as price_count,
      AVG(unit_price) as avg_unit_price,
      MIN(unit_price) as min_unit_price,
      MAX(unit_price) as max_unit_price,
      AVG(CASE WHEN cost_price IS NOT NULL THEN (unit_price - cost_price) / cost_price * 100 END) as avg_margin
    FROM public.prices 
    GROUP BY currency
  `,
  
  // Get products with discounts
  SELECT_DISCOUNTED_PRODUCTS: `
    SELECT pr.*, p.hebrew_name, p.english_name
    FROM public.prices pr
    JOIN public.products p ON pr.product_ref = p.ref
    WHERE pr.discount_price IS NOT NULL 
      AND pr.discount_price < pr.unit_price
    ORDER BY (pr.unit_price - pr.discount_price) DESC
  `,
  
  // Get profit analysis
  SELECT_PROFIT_ANALYSIS: `
    SELECT 
      pr.product_ref,
      p.hebrew_name,
      p.english_name,
      pr.unit_price,
      pr.cost_price,
      (pr.unit_price - pr.cost_price) as profit_amount,
      CASE 
        WHEN pr.cost_price > 0 THEN 
          ((pr.unit_price - pr.cost_price) / pr.cost_price * 100)
        ELSE NULL 
      END as profit_margin
    FROM public.prices pr
    JOIN public.products p ON pr.product_ref = p.ref
    WHERE pr.cost_price IS NOT NULL
    ORDER BY profit_margin DESC NULLS LAST
  `,
  
  // Search prices by product name or reference
  SEARCH_PRICES: `
    SELECT pr.*, p.hebrew_name, p.english_name, p.product_line
    FROM public.prices pr
    JOIN public.products p ON pr.product_ref = p.ref
    WHERE 
      p.hebrew_name ILIKE $1 OR 
      p.english_name ILIKE $1 OR 
      pr.product_ref ILIKE $1 OR
      p.product_line ILIKE $1
    ORDER BY pr.updated_at DESC
    LIMIT $2 OFFSET $3
  `
};

// Bulk pricing tier template
export const BULK_PRICING_TIER = {
  minQuantity: 1,
  discount: 0, // Amount or percentage
  discountType: 'percentage' // 'percentage' or 'amount'
};

// Price record template
export const PRICE_RECORD_TEMPLATE = {
  product_ref: '',
  unit_price: 0.00,
  cost_price: null,
  discount_price: null,
  currency: 'ILS'
};

export default PRICES_TABLE;
