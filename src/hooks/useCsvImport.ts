/**
 * useCsvImport Hook - CSV import operations management
 * 
 * Custom hook for managing CSV file import operations including
 * file handling, data processing, and database operations.
 * 
 * Features:
 * - File upload and parsing
 * - Data validation and transformation
 * - Batch import with progress tracking
 * - Error handling and notifications
 * - Import confirmation workflow
 * 
 * Returns:
 * - State: file, uploading, progress, results, preview
 * - Actions: handleFileSelect, importData, resetImport
 * - UI state: snackbar, confirmDialog
 */

import { useState, useCallback } from 'react';
import { supabaseBrowserClient } from '@/lib/supabaseClient';
import { 
  parseCSV, 
  transformProduct, 
  deduplicateData, 
  validateProductData, 
  generatePreview 
} from '@/utils/csvHelpers';

interface ImportResults {
  total: number;
  imported: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UseCsvImportResult {
  // State
  file: File | null;
  uploading: boolean;
  progress: number;
  results: ImportResults | null;
  preview: any[];
  snackbar: SnackbarState;
  confirmDialog: boolean;
  
  // Actions
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  importData: () => Promise<void>;
  resetImport: () => void;
  showConfirmDialog: () => void;
  closeSnackbar: () => void;
  setConfirmDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

const useCsvImport = (onImportComplete?: () => void): UseCsvImportResult => {
  // ===== STATE =====
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResults | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'info' 
  });
  const [preview, setPreview] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // ===== FILE HANDLING =====
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setSnackbar({
        open: true,
        message: 'נא לבחור קובץ CSV בלבד',
        severity: 'error'
      });
      return;
    }

    setFile(selectedFile);
    setResults(null);
    setProgress(0);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target?.result as string);
        const uniqueData = deduplicateData(csvData);
        const previewData = generatePreview(uniqueData);
        setPreview(previewData);
        
        setSnackbar({
          open: true,
          message: `קובץ נטען בהצלחה: ${uniqueData.length} מוצרים`,
          severity: 'success'
        });
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setSnackbar({
          open: true,
          message: 'שגיאה בקריאת קובץ CSV',
          severity: 'error'
        });
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  }, []);

  // ===== IMPORT OPERATIONS =====
  const importData = useCallback(async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(5);
      setConfirmDialog(false);

      console.log('Starting CSV import process...');

      // Step 1: Read and parse file
      const csvText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
      });

      setProgress(15);

      // Step 2: Process data
      const csvData = parseCSV(csvText);
      const uniqueCsvData = deduplicateData(csvData);
      
      console.log(`Original CSV rows: ${csvData.length}, Unique rows: ${uniqueCsvData.length}`);

      const products = uniqueCsvData
        .map(transformProduct)
        .filter(p => (p as any).ref && (p as any).ref.trim());

      const { validProducts, errors } = validateProductData(products);
      
      if (errors.length > 0) {
        throw new Error(`שגיאות בנתונים: ${errors.join(', ')}`);
      }

      // Step 3: Clear existing products
      setProgress(30);
      console.log('Clearing existing products...');
      const { error: deleteError } = await supabaseBrowserClient
        .from('products')
        .delete()
        .neq('ref', ''); // Delete all non-empty records (updated field name)

      if (deleteError) {
        console.error('Error clearing products:', deleteError);
        throw deleteError;
      }

      // Step 4: Import new data in batches
      setProgress(40);
      const batchSize = 10;
      let imported = 0;
      let batchCount = 0;

      console.log(`Starting import of ${validProducts.length} products in batches of ${batchSize}`);

      for (let i = 0; i < validProducts.length; i += batchSize) {
        const batch = validProducts.slice(i, i + batchSize);
        batchCount++;

        console.log(`Processing batch ${batchCount}: ${batch.length} products`);

        const { error } = await supabaseBrowserClient
          .from('products')
          .insert(batch as any);

        if (error) {
          console.error(`Error in batch ${batchCount}:`, error);
          throw error;
        }

        imported += batch.length;
        console.log(`Batch ${batchCount} successful: ${imported}/${validProducts.length} imported`);
        setProgress(40 + (i / validProducts.length) * 55);
      }

      console.log(`Import completed: ${imported} products imported successfully`);

      // Step 5: Complete
      setProgress(100);
      setResults({ total: validProducts.length, imported });

      setSnackbar({
        open: true,
        message: `כל המוצרים הוחלפו בהצלחה - ${imported} מוצרים מיובאים`,
        severity: 'success'
      });

      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      console.error('Import error:', error);
      let errorMessage = 'שגיאה בייבוא הנתונים';
      
      if (error instanceof Error) {
        if (error.message.includes('שגיאות בנתונים')) {
          errorMessage = error.message;
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'שגיאה: קיימים מוצרים כפולים בקובץ';
        } else if (error.message.includes('violates')) {
          errorMessage = 'שגיאה בפורמט הנתונים';
        }
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [file, onImportComplete]);

  // ===== UI ACTIONS =====
  const resetImport = useCallback(() => {
    setFile(null);
    setPreview([]);
    setResults(null);
    setProgress(0);
    setConfirmDialog(false);
  }, []);

  const showConfirmDialog = useCallback(() => {
    setConfirmDialog(true);
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar]);

  return {
    // State
    file,
    uploading,
    progress,
    results,
    preview,
    snackbar,
    confirmDialog,
    
    // Actions
    handleFileSelect,
    importData,
    resetImport,
    showConfirmDialog,
    closeSnackbar,
    setConfirmDialog
  };
};

export default useCsvImport;
