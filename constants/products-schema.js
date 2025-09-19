// ============================================================================
// PRODUCTS TABLE SCHEMA - Database Constants
// ============================================================================
// Complete schema definition for the products table
// ============================================================================

export const PRODUCTS_TABLE = {
  name: 'products',
  schema: 'public',
  
  // Column definitions
  columns: {
    id: {
      type: 'uuid',
      nullable: false,
      primary: true,
      default: 'extensions.uuid_generate_v4()'
    },
    ref: {
      type: 'text',
      nullable: false,
      unique: true
    },
    hebrew_name: {
      type: 'text',
      nullable: true
    },
    header: {
      type: 'text',
      nullable: true
    },
    short_description_he: {
      type: 'text',
      nullable: true
    },
    description_he: {
      type: 'text',
      nullable: true
    },
    skin_type_he: {
      type: 'text',
      nullable: true
    },
    usage_instructions_he: {
      type: 'text',
      nullable: true
    },
    active_ingredients_he: {
      type: 'text',
      nullable: true
    },
    ingredients: {
      type: 'text',
      nullable: true
    },
    french_name: {
      type: 'text',
      nullable: true
    },
    english_name: {
      type: 'text',
      nullable: true
    },
    size: {
      type: 'text',
      nullable: true
    },
    product_line: {
      type: 'text',
      nullable: true
    },
    main_pic: {
      type: 'text',
      nullable: true
    },
    pics: {
      type: 'jsonb',
      nullable: true,
      default: '[]'
    },
    type: {
      type: 'text',
      nullable: true
    },
    product_type: {
      type: 'text',
      nullable: true
    },
    qty: {
      type: 'integer',
      nullable: true,
      default: 0
    },
    unit_price: {
      type: 'numeric(10,2)',
      nullable: true
    },
    description: {
      type: 'text',
      nullable: true
    },
    active_ingredients: {
      type: 'text',
      nullable: true
    },
    usage_instructions: {
      type: 'text',
      nullable: true
    },
    notice: {
      type: 'text',
      nullable: true
    },
    product_name: {
      type: 'text',
      nullable: true
    },
    product_name_2: {
      type: 'text',
      nullable: true
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
    primary: 'products_pkey',
    unique: ['products_ref_key'],
    check: [
      'products_qty_check'
    ]
  },

  // Indexes
  indexes: [
    'idx_products_ref',
    'idx_products_hebrew_name',
    'idx_products_english_name',
    'idx_products_product_type',
    'idx_products_type',
    'idx_products_product_line'
  ],

  // Triggers
  triggers: [
    'update_products_updated_at'
  ],

  // Stock status helpers
  stockStatus: {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock'
  },

  // Language fields mapping
  languageFields: {
    name: {
      hebrew: 'hebrew_name',
      english: 'english_name',
      french: 'french_name'
    },
    description: {
      hebrew: 'description_he',
      english: 'description',
      short_hebrew: 'short_description_he'
    }
  },

  // RLS Policies
  policies: [
    'Everyone can view active products',
    'Admins can manage all products',
    'Verified members can view detailed product info'
  ]
};

// Helper functions for working with products
export const PRODUCTS_HELPERS = {
  // Get product name in preferred language
  getName: (product, language = 'hebrew') => {
    switch (language) {
      case 'hebrew':
        return product?.hebrew_name || product?.english_name || product?.ref;
      case 'english':
        return product?.english_name || product?.hebrew_name || product?.ref;
      case 'french':
        return product?.french_name || product?.english_name || product?.hebrew_name || product?.ref;
      default:
        return product?.hebrew_name || product?.english_name || product?.ref;
    }
  },

  // Get product description in preferred language
  getDescription: (product, language = 'hebrew') => {
    switch (language) {
      case 'hebrew':
        return product?.description_he || product?.description || '';
      case 'english':
        return product?.description || product?.description_he || '';
      default:
        return product?.description_he || product?.description || '';
    }
  },

  // Get stock status
  getStockStatus: (qty) => {
    if (qty === 0) return PRODUCTS_TABLE.stockStatus.OUT_OF_STOCK;
    if (qty < 10) return PRODUCTS_TABLE.stockStatus.LOW_STOCK;
    return PRODUCTS_TABLE.stockStatus.IN_STOCK;
  },

  // Get stock status color for UI
  getStockStatusColor: (qty) => {
    const status = PRODUCTS_HELPERS.getStockStatus(qty);
    const colors = {
      [PRODUCTS_TABLE.stockStatus.IN_STOCK]: 'success',
      [PRODUCTS_TABLE.stockStatus.LOW_STOCK]: 'warning',
      [PRODUCTS_TABLE.stockStatus.OUT_OF_STOCK]: 'error'
    };
    return colors[status] || 'default';
  },

  // Format price with currency
  formatPrice: (price, currency = 'ILS') => {
    if (!price) return '';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: currency
    }).format(price);
  },

  // Parse product images from JSONB
  parseImages: (pics) => {
    if (!pics) return { main: null, gallery: [], thumbnails: [] };
    
    try {
      const parsed = typeof pics === 'string' ? JSON.parse(pics) : pics;
      return {
        main: parsed.main || null,
        gallery: parsed.gallery || [],
        thumbnails: parsed.thumbnails || []
      };
    } catch {
      return { main: null, gallery: [], thumbnails: [] };
    }
  },

  // Validate product data
  validateProduct: (product) => {
    const errors = [];
    
    if (!product.ref) errors.push('Product reference is required');
    if (!product.hebrew_name && !product.english_name) {
      errors.push('At least one product name is required');
    }
    if (product.qty && product.qty < 0) {
      errors.push('Quantity cannot be negative');
    }
    if (product.unit_price && product.unit_price < 0) {
      errors.push('Price cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Search products
  buildSearchQuery: (searchTerm, filters = {}) => {
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    // Text search
    if (searchTerm) {
      conditions.push(`(
        hebrew_name ILIKE $${paramIndex} OR 
        english_name ILIKE $${paramIndex} OR 
        french_name ILIKE $${paramIndex} OR 
        ref ILIKE $${paramIndex} OR
        product_line ILIKE $${paramIndex}
      )`);
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }

    // Product line filter
    if (filters.productLine) {
      conditions.push(`product_line = $${paramIndex}`);
      params.push(filters.productLine);
      paramIndex++;
    }

    // Product type filter
    if (filters.productType) {
      conditions.push(`product_type = $${paramIndex}`);
      params.push(filters.productType);
      paramIndex++;
    }

    // Stock status filter
    if (filters.stockStatus) {
      switch (filters.stockStatus) {
        case 'in_stock':
          conditions.push('qty > 10');
          break;
        case 'low_stock':
          conditions.push('qty > 0 AND qty <= 10');
          break;
        case 'out_of_stock':
          conditions.push('qty = 0');
          break;
      }
    }

    return {
      conditions: conditions.join(' AND '),
      params
    };
  }
};

// SQL queries for common operations
export const PRODUCTS_QUERIES = {
  // Select product by ID
  SELECT_BY_ID: `
    SELECT * FROM public.products WHERE id = $1
  `,
  
  // Select product by reference
  SELECT_BY_REF: `
    SELECT * FROM public.products WHERE ref = $1
  `,
  
  // Select all products with pagination
  SELECT_ALL: `
    SELECT * FROM public.products 
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  // Select products by product line
  SELECT_BY_PRODUCT_LINE: `
    SELECT * FROM public.products 
    WHERE product_line = $1 
    ORDER BY hebrew_name, english_name
  `,
  
  // Select products with current prices
  SELECT_WITH_PRICES: `
    SELECT p.*, pr.unit_price as current_price, pr.cost_price, pr.discount_price
    FROM public.products p
    LEFT JOIN public.prices pr ON p.ref = pr.product_ref
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  // Insert new product
  INSERT_PRODUCT: `
    INSERT INTO public.products (
      ref, hebrew_name, english_name, french_name, product_line, 
      product_type, type, size, qty, unit_price, description, 
      description_he, short_description_he, header, ingredients,
      active_ingredients_he, skin_type_he, usage_instructions_he,
      notice, main_pic, pics
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
    RETURNING *
  `,
  
  // Update product
  UPDATE_PRODUCT: `
    UPDATE public.products 
    SET hebrew_name = $2, english_name = $3, french_name = $4,
        product_line = $5, product_type = $6, type = $7, size = $8,
        qty = $9, unit_price = $10, description = $11, description_he = $12,
        short_description_he = $13, header = $14, ingredients = $15,
        active_ingredients_he = $16, skin_type_he = $17, 
        usage_instructions_he = $18, notice = $19, main_pic = $20, pics = $21
    WHERE id = $1
    RETURNING *
  `,
  
  // Update stock quantity
  UPDATE_STOCK: `
    UPDATE public.products 
    SET qty = $2
    WHERE id = $1
    RETURNING *
  `,
  
  // Search products
  SEARCH_PRODUCTS: `
    SELECT * FROM public.products 
    WHERE 
      hebrew_name ILIKE $1 OR 
      english_name ILIKE $1 OR 
      french_name ILIKE $1 OR 
      ref ILIKE $1 OR
      product_line ILIKE $1
    ORDER BY 
      CASE 
        WHEN ref ILIKE $1 THEN 1
        WHEN hebrew_name ILIKE $1 THEN 2
        WHEN english_name ILIKE $1 THEN 3
        ELSE 4
      END,
      hebrew_name, english_name
    LIMIT $2 OFFSET $3
  `,
  
  // Get product statistics
  SELECT_STATS: `
    SELECT 
      COUNT(*) as total_products,
      COUNT(CASE WHEN qty > 0 THEN 1 END) as in_stock_count,
      COUNT(CASE WHEN qty = 0 THEN 1 END) as out_of_stock_count,
      COUNT(DISTINCT product_line) as product_lines_count,
      AVG(unit_price) as avg_price
    FROM public.products
  `,
  
  // Get low stock products
  SELECT_LOW_STOCK: `
    SELECT * FROM public.products 
    WHERE qty > 0 AND qty <= 10
    ORDER BY qty ASC, hebrew_name
  `,
  
  // Get product lines
  SELECT_PRODUCT_LINES: `
    SELECT DISTINCT product_line 
    FROM public.products 
    WHERE product_line IS NOT NULL
    ORDER BY product_line
  `,
  
  // Get product types
  SELECT_PRODUCT_TYPES: `
    SELECT DISTINCT product_type 
    FROM public.products 
    WHERE product_type IS NOT NULL
    ORDER BY product_type
  `
};

// Product image structure template
export const PRODUCT_IMAGES_TEMPLATE = {
  main: '', // Main product image URL
  gallery: [], // Array of gallery image URLs
  thumbnails: [] // Array of thumbnail image URLs
};

export default PRODUCTS_TABLE;
