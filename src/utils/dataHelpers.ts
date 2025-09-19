/**
 * Data Helper Utilities
 * Functions to help with data parsing and validation
 */

// Type definitions for data helpers
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export interface JsonArray extends Array<JsonValue> {
  // This interface extends Array to provide JsonValue typing
  [key: string]: unknown; // Add index signature to avoid empty object type error
}

export type CurrencyCode = 'ILS' | 'USD' | 'EUR' | 'GBP';

export interface CurrencySymbolMap {
  [key: string]: string;
}

/**
 * Parse JSON field safely
 */
export const parseJsonField = (field: unknown): JsonValue | null => {
  if (!field) return null;
  if (typeof field === 'object') return field as JsonValue;
  
  try {
    return JSON.parse(field as string);
  } catch {
    console.warn('Failed to parse JSON field:', field);
    return null;
  }
};

/**
 * Check if content should be rendered based on various conditions
 */
export const shouldRenderContent = (content: unknown): boolean => {
  if (!content) return false;
  if (typeof content === 'string') {
    return content.trim().length > 0;
  }
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  if (typeof content === 'object') {
    return Object.keys(content as object).length > 0;
  }
  return Boolean(content);
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number | string | null | undefined, currency: string = '₪'): string => {
  if (!price || isNaN(Number(price))) return '';
  const numPrice = parseFloat(String(price));
  if (numPrice === 0) return 'חינם';
  return `${numPrice.toFixed(2)} ${currency}`;
};

/**
 * Format currency for payment display
 * Alternative name for formatPrice to match payment component expectations
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: CurrencyCode = 'ILS'): string => {
  if (!amount || isNaN(Number(amount))) return '₪0.00';
  const numAmount = parseFloat(String(amount));
  
  // Currency symbol mapping
  const currencySymbols: CurrencySymbolMap = {
    'ILS': '₪',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  
  const symbol = currencySymbols[currency] || currency;
  
  if (numAmount === 0) return `${symbol}0.00`;
  return `${symbol}${numAmount.toFixed(2)}`;
};

/**
 * Sanitize HTML content for safe rendering
 */
export const sanitizeHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
};

/**
 * Extract text content from HTML
 * Note: This function uses DOM manipulation and should only be used in client-side code
 */
export const extractTextFromHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Server-side: strip HTML tags using regex (basic fallback)
    return html.replace(/<[^>]*>/g, '');
  }
  
  // Client-side: use DOM parser
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Format product reference for display
 */
export const formatProductRef = (ref: string | number | null | undefined): string => {
  if (!ref) return '';
  return ref.toString().toUpperCase();
};

/**
 * Check if a string contains HTML tags
 */
export const containsHtml = (str: string | null | undefined): boolean => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

/**
 * Safe number parsing with fallback
 */
export const parseNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Safe string parsing with fallback
 */
export const parseString = (value: unknown, fallback: string = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

/**
 * Deep clone an object (simple implementation)
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};