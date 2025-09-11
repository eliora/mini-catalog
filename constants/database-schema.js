/**
 * DATABASE SCHEMA DOCUMENTATION
 * Generated from ACTUAL Supabase project: erputcvhxxulxmldikfp
 * Last updated: September 11, 2025
 * Total products: 296 rows
 */

// =============================================================================
// PRODUCTS TABLE STRUCTURE (ACTUAL SCHEMA)
// =============================================================================
export const PRODUCTS_TABLE = {
  name: 'products',
  columns: {
    // System fields
    id: 'UUID PRIMARY KEY', // System-generated UUID
    created_at: 'TIMESTAMP WITH TIME ZONE',
    updated_at: 'TIMESTAMP WITH TIME ZONE',
    
    // Product identifiers
    ref: 'TEXT', // Product reference number (e.g., "12")
    
    // Product names and descriptions
    hebrew_name: 'TEXT', // Hebrew product name (main display name)
    english_name: 'TEXT', // English product name
    french_name: 'TEXT', // French product name
    header: 'TEXT', // Product header/title
    short_description_he: 'TEXT', // Short Hebrew description
    description_he: 'TEXT', // Full Hebrew description (HTML content)
    
    // Product categorization
    skin_type_he: 'TEXT', // Hebrew skin type classification (e.g., "עור יבש, עור עייף, עור רגיש")
    product_line: 'TEXT', // Product line/series (e.g., "Promoartikel")
    type: 'TEXT', // Product type (e.g., "cabin / Kabi")
    product_type: 'TEXT', // Additional product type classification (e.g., "ערכות")
    
    // Product details
    usage_instructions_he: 'TEXT', // Hebrew usage instructions (HTML content)
    active_ingredients_he: 'TEXT', // Hebrew active ingredients (HTML content)
    ingredients: 'JSON/NULL', // Full ingredients list (currently null)
    
    // Pricing and inventory
    unit_price: 'NUMERIC', // Product price (e.g., 80)
    size: 'TEXT', // Product size/volume (e.g., "ערכה")
    qty: 'INTEGER', // Available quantity (e.g., 48)
    
    // Images
    main_pic: 'JSON/NULL', // Main product image URL (currently null)
    pics: 'JSON/NULL', // Additional product images (currently null)
    
    // Legacy/unused fields
    description: 'JSON/NULL', // Legacy field (null)
    active_ingredients: 'JSON/NULL', // Legacy field (null)
    usage_instructions: 'JSON/NULL', // Legacy field (null)
    notice: 'JSON/NULL', // Legacy field (null)
    product_name: 'JSON/NULL', // Legacy field (null)
    product_name_2: 'JSON/NULL', // Legacy field (null)
  }
};

// =============================================================================
// SETTINGS TABLE STRUCTURE (ACTUAL SCHEMA)
// =============================================================================
export const SETTINGS_TABLE = {
  name: 'settings',
  columns: {
    // System fields
    id: 'UUID PRIMARY KEY',
    created_at: 'TIMESTAMP WITH TIME ZONE',
    updated_at: 'TIMESTAMP WITH TIME ZONE',
    
    // Company information
    company_name: 'TEXT', // e.g., "Jean Darcel"
    company_description: 'TEXT', // e.g., "קטלוג מוצרים"
    company_logo: 'JSON/NULL',
    company_address: 'JSON/NULL',
    company_phone: 'JSON/NULL',
    company_email: 'JSON/NULL',
    
    // Business settings
    tax_rate: 'NUMERIC', // e.g., 18
    currency: 'TEXT', // e.g., "ILS"
  }
};

// =============================================================================
// USERS TABLE STRUCTURE (ACTUAL SCHEMA)
// =============================================================================
export const USERS_TABLE = {
  name: 'users',
  columns: {
    // Note: Table exists but is empty (0 rows)
    // Structure unknown - needs to be populated to inspect
  }
};

// =============================================================================
// ORDERS TABLE STRUCTURE (ACTUAL SCHEMA)
// =============================================================================
export const ORDERS_TABLE = {
  name: 'orders',
  columns: {
    // Note: Table exists but is empty (0 rows)
    // Structure unknown - needs to be populated to inspect
  }
};

// =============================================================================
// COLUMN MAPPING (Database → Application)
// =============================================================================
export const COLUMN_MAPPING = {
  // Database column → Application property
  'ref': 'ref',
  'hebrew_name': 'productName', // Primary display name
  'english_name': 'productName2', // Secondary display name
  'french_name': 'frenchName',
  'short_description_he': 'short_description_he',
  'description_he': 'description',
  'skin_type_he': 'skinType',
  'product_line': 'productLine', // NOTE: Database uses 'product_line', not 'line'
  'type': 'type',
  'product_type': 'productType',
  'usage_instructions_he': 'usageInstructions',
  'active_ingredients_he': 'activeIngredients',
  'ingredients': 'ingredients',
  'unit_price': 'unitPrice', // NOTE: Database uses 'unit_price', not 'price'
  'size': 'size',
  'qty': 'qty',
  'main_pic': 'mainPic',
  'pics': 'pics'
};

// =============================================================================
// COMMON QUERIES
// =============================================================================
export const COMMON_QUERIES = {
  // Basic product listing (optimized for catalog view)
  CATALOG_PRODUCTS: `
    SELECT 
      ref,
      hebrew_name,
      english_name,
      short_description_he,
      main_pic,
      unit_price,
      size,
      product_line,
      type,
      product_type,
      skin_type_he,
      qty
    FROM products
    WHERE qty > 0
    ORDER BY hebrew_name
  `,
  
  // Detailed product view (for accordion expansion)
  PRODUCT_DETAILS: `
    SELECT 
      ref,
      description_he,
      active_ingredients_he,
      usage_instructions_he,
      ingredients,
      header,
      french_name,
      pics
    FROM products
    WHERE ref = $1
  `,
  
  // Product search
  SEARCH_PRODUCTS: `
    SELECT * FROM products
    WHERE 
      ref ILIKE '%' || $1 || '%' OR
      hebrew_name ILIKE '%' || $1 || '%' OR
      english_name ILIKE '%' || $1 || '%'
  `,
  
  // Get unique product lines
  PRODUCT_LINES: `
    SELECT DISTINCT product_line
    FROM products
    WHERE product_line IS NOT NULL
    ORDER BY product_line
  `,
  
  // Get unique skin types
  SKIN_TYPES: `
    SELECT DISTINCT skin_type_he
    FROM products
    WHERE skin_type_he IS NOT NULL
    ORDER BY skin_type_he
  `
};

// =============================================================================
// DATA VALIDATION RULES
// =============================================================================
export const VALIDATION_RULES = {
  ref: {
    required: true,
    type: 'string',
    description: 'Unique product reference identifier'
  },
  hebrew_name: {
    required: true,
    type: 'string',
    description: 'Primary product name in Hebrew'
  },
  unit_price: {
    required: false,
    type: 'number',
    min: 0,
    description: 'Product price in local currency'
  },
  qty: {
    required: false,
    type: 'integer',
    min: 0,
    description: 'Available inventory quantity'
  }
};

// =============================================================================
// IMAGE HANDLING
// =============================================================================
export const IMAGE_CONFIG = {
  main_pic: {
    description: 'Primary product image URL',
    formats: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: '5MB',
    recommended: '800x800px'
  },
  pics: {
    description: 'Additional product images',
    format: 'Pipe-separated URLs or JSON array',
    example: 'url1.jpg | url2.jpg | url3.jpg',
    maxImages: 10
  }
};

// =============================================================================
// BUSINESS LOGIC CONSTANTS
// =============================================================================
export const BUSINESS_RULES = {
  CURRENCY: '₪', // Israeli Shekel
  DEFAULT_LANGUAGE: 'he', // Hebrew
  FALLBACK_LANGUAGE: 'en', // English
  
  // Display priorities
  NAME_PRIORITY: ['hebrew_name', 'english_name', 'french_name'],
  DESCRIPTION_PRIORITY: ['description_he', 'short_description_he'],
  
  // Inventory rules
  LOW_STOCK_THRESHOLD: 10,
  OUT_OF_STOCK: 0,
  
  // Image processing
  IMAGE_LAZY_LOADING: true,
  THUMBNAIL_SIZE: 72, // pixels (1.6x from original 45px)
  MAIN_IMAGE_HEIGHT: { xs: 160, md: 180 }, // responsive heights
};

export default {
  PRODUCTS_TABLE,
  COLUMN_MAPPING,
  COMMON_QUERIES,
  VALIDATION_RULES,
  IMAGE_CONFIG,
  BUSINESS_RULES
};
