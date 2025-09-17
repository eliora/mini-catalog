/**
 * @file Admin API Product Validation Utilities
 * @description Validation engine for product data using the products schema.
 */

import { PRODUCTS_TABLE } from '@/constants/products-schema.js';

// --- Type Definitions ---

export interface ProductValidationResult {
  isValid: boolean;
  errors: string[];
  cleanData?: any;
}

interface ProductValidationOptions {
  isUpdate?: boolean;
}

// --- Validation Helpers ---

const validateRef = (ref: any): boolean => typeof ref === 'string' && ref.trim().length >= 2;
const validateQuantity = (qty: any): boolean => Number.isInteger(qty) && qty >= 0;
const validatePrice = (price: any): boolean => !price || (typeof price === 'number' && price >= 0);
const sanitizeString = (str: any): string => typeof str === 'string' ? str.trim().replace(/[<>\"']/g, '') : '';
const sanitizeNumber = (num: any): number | null => {
  const parsed = parseFloat(num);
  return !isNaN(parsed) ? parsed : null;
};

/**
 * Validates product data against the products schema.
 * @param data The raw data object from the request body.
 * @param options Validation options (isUpdate, etc.)
 * @returns A ProductValidationResult object.
 */
function validateProductData(data: any, options: ProductValidationOptions = {}): ProductValidationResult {
  const { isUpdate = false } = options;
  const errors: string[] = [];
  const cleanData: any = {};

  // --- Unified Field Validation Rules ---
  const fieldRules: Array<{
    name: string;
    required?: boolean;
    validate?: (val: any) => boolean;
    sanitize?: (val: any) => any;
    error?: string;
  }> = [
    // Required fields
    { name: 'ref', required: true, validate: validateRef, sanitize: sanitizeString, error: 'Product reference must be at least 2 characters.' },
    
    // Name fields (at least one required)
    { name: 'hebrew_name', sanitize: sanitizeString },
    { name: 'english_name', sanitize: sanitizeString },
    { name: 'french_name', sanitize: sanitizeString },
    
    // Product categorization
    { name: 'product_line', sanitize: sanitizeString },
    { name: 'product_type', sanitize: sanitizeString },
    { name: 'type', sanitize: sanitizeString },
    { name: 'size', sanitize: sanitizeString },
    
    // Numeric fields
    { name: 'qty', validate: validateQuantity, sanitize: (val: any) => val === null || val === undefined ? 0 : parseInt(val, 10), error: 'Quantity must be a non-negative integer.' },
    { name: 'unit_price', validate: validatePrice, sanitize: sanitizeNumber, error: 'Price must be a non-negative number.' },
    
    // Description fields
    { name: 'description', sanitize: sanitizeString },
    { name: 'description_he', sanitize: sanitizeString },
    { name: 'short_description_he', sanitize: sanitizeString },
    { name: 'header', sanitize: sanitizeString },
    { name: 'ingredients', sanitize: sanitizeString },
    { name: 'active_ingredients_he', sanitize: sanitizeString },
    { name: 'skin_type_he', sanitize: sanitizeString },
    { name: 'usage_instructions_he', sanitize: sanitizeString },
    { name: 'notice', sanitize: sanitizeString },
    
    // Image fields
    { name: 'main_pic', sanitize: sanitizeString },
    { name: 'pics', sanitize: (val: any) => val }, // Pass through JSONB object
  ];

  // --- Process All Rules ---
  for (const rule of fieldRules) {
    const value = data[rule.name];
    const isPresent = value !== undefined && value !== null;
    const isRequired = rule.required && !isUpdate;

    if (isRequired && (!isPresent || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.error || `${rule.name} is required`);
    } else if (isPresent && rule.validate && !rule.validate(value)) {
      errors.push(rule.error!);
    } else if (isPresent && rule.sanitize) {
      const sanitizedValue = rule.sanitize(value);
      if (sanitizedValue !== null && sanitizedValue !== '') {
        cleanData[rule.name] = sanitizedValue;
      }
    }
  }

  // Special validation: at least one name is required
  if (!isUpdate && !cleanData.hebrew_name && !cleanData.english_name && !cleanData.french_name) {
    errors.push('At least one product name (Hebrew, English, or French) is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanData: errors.length === 0 ? cleanData : undefined
  };
}

/**
 * Validates data for creating a new product.
 * @param data The raw data from the request body.
 * @returns A ProductValidationResult object.
 */
export function validateCreateProduct(data: any): ProductValidationResult {
  return validateProductData(data, { isUpdate: false });
}

/**
 * Validates data for updating an existing product.
 * @param data The raw data from the request body.
 * @returns A ProductValidationResult object.
 */
export function validateUpdateProduct(data: any): ProductValidationResult {
  return validateProductData(data, { isUpdate: true });
}
