/**
 * Data Helper Utilities
 * Functions to help with data parsing and validation
 */

/**
 * Parse JSON field safely
 */
export const parseJsonField = (field) => {
  if (!field) return null;
  if (typeof field === 'object') return field;
  
  try {
    return JSON.parse(field);
  } catch (error) {
    console.warn('Failed to parse JSON field:', field);
    return null;
  }
};

/**
 * Check if content should be rendered based on various conditions
 */
export const shouldRenderContent = (content) => {
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
 * Format price with currency
 */
export const formatPrice = (price, currency = '₪') => {
  if (!price || isNaN(price)) return '';
  const numPrice = parseFloat(price);
  if (numPrice === 0) return 'חינם';
  return `${numPrice.toFixed(2)} ${currency}`;
};

/**
 * Sanitize HTML content for safe rendering
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
};

/**
 * Extract text content from HTML
 */
export const extractTextFromHtml = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

/**
 * Format product reference for display
 */
export const formatProductRef = (ref) => {
  if (!ref) return '';
  return ref.toString().toUpperCase();
};

/**
 * Check if a string contains HTML tags
 */
export const containsHtml = (str) => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};
