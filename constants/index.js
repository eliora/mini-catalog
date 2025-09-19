// ============================================================================
// DATABASE CONSTANTS - Main Export File
// ============================================================================
// Centralized exports for all database schema constants
// ============================================================================

// Table schemas
export { default as USERS_TABLE, USERS_HELPERS, USERS_QUERIES } from './users-schema.js';
export { default as ORDERS_TABLE, ORDERS_HELPERS, ORDERS_QUERIES, ORDER_ITEM_TEMPLATE } from './orders-schema.js';
export { default as PRODUCTS_TABLE, PRODUCTS_HELPERS, PRODUCTS_QUERIES, PRODUCT_IMAGES_TEMPLATE } from './products-schema.js';
export { default as PRICES_TABLE, PRICES_HELPERS, PRICES_QUERIES, PRICE_RECORD_TEMPLATE, BULK_PRICING_TIER } from './prices-schema.js';
export { default as SETTINGS_TABLE, SETTINGS_HELPERS, SETTINGS_QUERIES, SETTINGS_TEMPLATES } from './settings-schema.js';

// Common database utilities
export const DATABASE_CONFIG = {
  schema: 'public',
  
  // Common field types
  fieldTypes: {
    UUID: 'uuid',
    TEXT: 'text',
    JSONB: 'jsonb',
    TIMESTAMP: 'timestamp with time zone',
    NUMERIC: 'numeric',
    VARCHAR: 'character varying',
    BOOLEAN: 'boolean'
  },
  
  // Common constraints
  constraints: {
    PRIMARY_KEY: 'PRIMARY KEY',
    FOREIGN_KEY: 'FOREIGN KEY',
    UNIQUE: 'UNIQUE',
    NOT_NULL: 'NOT NULL',
    CHECK: 'CHECK'
  },
  
  // Common default values
  defaults: {
    NOW: 'now()',
    UUID_V4: 'extensions.uuid_generate_v4()',
    EMPTY_ARRAY: '[]',
    EMPTY_OBJECT: '{}'
  }
};

// RLS Policy helpers
export const RLS_HELPERS = {
  // Check if user owns record
  ownsRecord: (userId, recordUserId) => userId === recordUserId,
  
  // Check admin access
  hasAdminAccess: (userRole) => userRole === 'admin',
  
  // Check verified member access
  hasVerifiedAccess: (userRole) => ['verified_members', 'admin'].includes(userRole),
  
  // Format policy name
  formatPolicyName: (action, table, condition = '') => {
    return `${action} ${table}${condition ? ` ${condition}` : ''}`;
  }
};

// Query builders
export const QUERY_BUILDERS = {
  // Build SELECT query with conditions
  select: (table, columns = '*', conditions = '', orderBy = '', limit = '') => {
    let query = `SELECT ${columns} FROM public.${table}`;
    if (conditions) query += ` WHERE ${conditions}`;
    if (orderBy) query += ` ORDER BY ${orderBy}`;
    if (limit) query += ` LIMIT ${limit}`;
    return query;
  },
  
  // Build INSERT query
  insert: (table, data) => {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
    return `INSERT INTO public.${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  },
  
  // Build UPDATE query
  update: (table, data, idColumn = 'id') => {
    const sets = Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const idIndex = Object.keys(data).length + 1;
    return `UPDATE public.${table} SET ${sets} WHERE ${idColumn} = $${idIndex} RETURNING *`;
  },
  
  // Build DELETE query
  delete: (table, idColumn = 'id') => {
    return `DELETE FROM public.${table} WHERE ${idColumn} = $1 RETURNING *`;
  }
};

// Validation helpers
export const VALIDATORS = {
  // Validate UUID format
  isUUID: (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
  
  // Validate email format
  isEmail: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  // Validate JSONB structure
  isValidJSON: (value) => {
    try {
      JSON.parse(typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  // Validate enum value
  isValidEnum: (value, enumObject) => {
    return Object.values(enumObject).includes(value);
  }
};

// Error messages
export const ERROR_MESSAGES = {
  INVALID_UUID: 'Invalid UUID format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_JSON: 'Invalid JSON format',
  INVALID_ENUM: 'Invalid enum value',
  REQUIRED_FIELD: 'This field is required',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Record not found',
  DUPLICATE_KEY: 'Record already exists'
};

const DATABASE_CONSTANTS = {
  USERS_TABLE,
  ORDERS_TABLE,
  PRODUCTS_TABLE,
  PRICES_TABLE,
  SETTINGS_TABLE,
  DATABASE_CONFIG,
  RLS_HELPERS,
  QUERY_BUILDERS,
  VALIDATORS,
  ERROR_MESSAGES,
};

export default DATABASE_CONSTANTS;

