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

interface CSVRow {
  [key: string]: string;
}

interface ProductData {
  ref: string; // Changed from 'ref no' to match Supabase schema
  product_name: string; // Changed from 'product name' to match schema
  product_name_2?: string; // Changed from 'product name 2' to match schema
  size?: string;
  brand?: string;
  categories?: string;
  key_ingredients?: string; // Changed from 'key ingredients' to match schema
  description?: string;
  how_to_use?: string; // Changed from 'how to use' to match schema
  notes?: string;
  main_pic?: string; // Changed from 'image' to match schema
}

interface ValidationResult {
  validProducts: ProductData[];
  errors: string[];
}

interface PreviewData {
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
export const transformProduct = (row: CSVRow): ProductData => {
  const product: ProductData = {
    ref: row['ref no'] || row['ref'] || row['מק"ט'] || '',
    product_name: row['product name'] || row['שם מוצר'] || '',
    product_name_2: row['product name 2'] || row['שם מוצר 2'] || '',
    size: row['size'] || row['גודל'] || '',
    brand: row['brand'] || row['מותג'] || '',
    categories: row['categories'] || row['קטגוריות'] || '',
    key_ingredients: row['key ingredients'] || row['רכיבים עיקריים'] || '',
    description: row['description'] || row['תיאור'] || '',
    how_to_use: row['how to use'] || row['אופן שימוש'] || '',
    notes: row['notes'] || row['הערות'] || '',
    main_pic: row['image'] || row['תמונה'] || ''
  };

  // Clean empty values and quotes
  Object.keys(product).forEach(key => {
    const typedKey = key as keyof ProductData;
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
export const validateProductData = (products: ProductData[]): ValidationResult => {
  const errors: string[] = [];
  const validProducts: ProductData[] = [];

  products.forEach((product, index) => {
    const refNo = product.ref;
    
    if (!refNo || !refNo.trim()) {
      errors.push(`שורה ${index + 2}: חסר מספר מוצר (ref)`);
      return;
    }

    if (!product.product_name || !product.product_name.trim()) {
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
