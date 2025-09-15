/**
 * Data helper utilities for parsing and processing data
 */

/**
 * Parse JSON field safely
 */
export const parseJsonField = (field: any): any => {
  if (!field) return null;
  
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.warn('Failed to parse JSON field:', field);
      return field;
    }
  }
  
  return field;
};

/**
 * Check if content should be rendered
 */
export const shouldRenderContent = (content: any): boolean => {
  if (!content) return false;
  
  if (typeof content === 'string') {
    return content.trim().length > 0;
  }
  
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  
  if (typeof content === 'object') {
    return Object.keys(content).length > 0;
  }
  
  return Boolean(content);
};

/**
 * Sanitize HTML content
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Format text for display
 */
export const formatDisplayText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/\n/g, '<br>')
    .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
};

/**
 * Extract text content from HTML
 */
export const extractTextContent = (html: string): string => {
  if (!html) return '';
  
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
};

/**
 * Format price with currency
 */
export const formatPrice = (price: number | string | null | undefined, currency: string = '₪'): string => {
  if (!price || isNaN(Number(price))) return '';
  const numPrice = parseFloat(price.toString());
  if (numPrice === 0) return 'חינם';
  return `${numPrice.toFixed(2)} ${currency}`;
};

/**
 * Format currency for payment display
 * Alternative name for formatPrice to match payment component expectations
 */
export const formatCurrency = (amount: number | string | null | undefined, currency: string = 'ILS'): string => {
  if (!amount || isNaN(Number(amount))) return '₪0.00';
  const numAmount = parseFloat(amount.toString());
  
  // Currency symbol mapping
  const currencySymbols: Record<string, string> = {
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
 * Check if a value is empty or null
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Deep merge objects
 */
export const deepMerge = (target: any, source: any): any => {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          output[key] = source[key];
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        output[key] = source[key];
      }
    });
  }
  
  return output;
};

/**
 * Check if value is an object
 */
const isObject = (item: any): boolean => {
  return item && typeof item === 'object' && !Array.isArray(item);
};
