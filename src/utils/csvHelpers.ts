/**
 * CSV Helpers - Utilities for CSV parsing and product transformation
 * 
 * Utility functions for handling CSV file parsing and product data transformation.
 * Extracted from CsvImport component for better maintainability and reusability.
 * 
 * Features:
 * - CSV parsing with quote handling
 * - Product data transformation
 * - Data validation and deduplication
 * - Column mapping for product fields
 * 
 * Functions:
 * - parseCSV: Parse CSV text into structured data
 * - transformProduct: Transform CSV row to product object
 * - deduplicateData: Remove duplicate entries by ref
 * - validateProductData: Validate product data
 */

// Types for CSV data structures
export interface CSVRow {
  [key: string]: string;
}

export interface ProductRow {
  'ref no': string;
  'product name': string;
  'product name 2': string;
  'size': string;
  'brand': string;
  'categories': string;
  'key ingredients': string;
  'description': string;
  'how to use': string;
  'notes': string;
  'image': string;
}

export interface ValidationResult {
  validProducts: ProductRow[];
  errors: string[];
}

export interface PreviewData {
  ref: string;
  name: string;
  name2: string;
  size: string;
  brand: string;
}

/**
 * Parse CSV text into structured data array
 * Handles quoted fields and escaped quotes properly
 */
export const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
};

/**
 * Transform CSV row to product object with proper field mapping
 */
export const transformProduct = (row: CSVRow): ProductRow => {
  const product: ProductRow = {
    'ref no': row['ref no'] || row['ref'] || row['מק"ט'] || '',
    'product name': row['product name'] || row['שם מוצר'] || '',
    'product name 2': row['product name 2'] || row['שם מוצר 2'] || '',
    'size': row['size'] || row['גודל'] || '',
    'brand': row['brand'] || row['מותג'] || '',
    'categories': row['categories'] || row['קטגוריות'] || '',
    'key ingredients': row['key ingredients'] || row['רכיבים עיקריים'] || '',
    'description': row['description'] || row['תיאור'] || '',
    'how to use': row['how to use'] || row['אופן שימוש'] || '',
    'notes': row['notes'] || row['הערות'] || '',
    'image': row['image'] || row['תמונה'] || ''
  };

  // Clean empty values
  Object.keys(product).forEach(key => {
    const typedKey = key as keyof ProductRow;
    if (product[typedKey] === '' || product[typedKey] === null || product[typedKey] === undefined) {
      product[typedKey] = '';
    }
    // Clean quotes from values
    if (typeof product[typedKey] === 'string') {
      product[typedKey] = product[typedKey].replace(/^"(.*)"$/, '$1');
    }
  });

  return product;
};

/**
 * Remove duplicate entries based on ref number
 */
export const deduplicateData = (data: CSVRow[]): CSVRow[] => {
  const seen = new Set<string>();
  return data.filter(row => {
    const refId = row['ref no'] || row['ref'] || row['מק"ט'];
    if (!refId || seen.has(refId)) {
      return false;
    }
    seen.add(refId);
    return true;
  });
};

/**
 * Validate product data for required fields
 */
export const validateProductData = (products: ProductRow[]): ValidationResult => {
  const errors: string[] = [];
  const validProducts: ProductRow[] = [];

  products.forEach((product, index) => {
    const refNo = product['ref no'];
    
    if (!refNo || !refNo.trim()) {
      errors.push(`שורה ${index + 2}: חסר מספר מוצר (ref no)`);
      return;
    }

    if (!product['product name'] || !product['product name'].trim()) {
      errors.push(`שורה ${index + 2}: חסר שם מוצר`);
      return;
    }

    validProducts.push(product);
  });

  return { validProducts, errors };
};

/**
 * Generate preview data for display
 */
export const generatePreview = (data: CSVRow[], maxRows: number = 5): PreviewData[] => {
  return data.slice(0, maxRows).map(row => ({
    ref: row['ref no'] || row['ref'] || row['מק"ט'] || '',
    name: row['product name'] || row['שם מוצר'] || '',
    name2: row['product name 2'] || row['שם מוצר 2'] || '',
    size: row['size'] || row['גודל'] || '',
    brand: row['brand'] || row['מותג'] || ''
  }));
};