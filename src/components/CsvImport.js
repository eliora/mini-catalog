import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { CloudUpload as UploadIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';
import { supabase } from '../config/supabase';

const CsvImport = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [preview, setPreview] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const parseCSV = useCallback((csvText) => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = [];
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

        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
  }, []);

  const transformProduct = useCallback((csvRow) => {
    return {
      'ref no': csvRow['ref no'],
      hebrew_name: csvRow['hebrew_name'],
      short_description_he: csvRow['short_description_he'],
      description_he: csvRow['description_he'],
      skin_type_he: csvRow['skin_type_he'],
      'Anwendung_he': csvRow['Anwendung_he'],
      'WirkungInhaltsstoffe_he': csvRow['WirkungInhaltsstoffe_he'],
      'Product Name': csvRow['Product Name'],
      'Product Name2': csvRow['Product Name2'],
      'Size': csvRow['Size'],
      pic: csvRow['pic'],
      all_pics: csvRow['all_pics'],
      unit_price: 0,
      product_type: 'Product'
    };
  }, []);

  const handleFileSelect = useCallback((event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);

      // Preview first few rows
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const parsedData = parseCSV(csvText);
        setPreview(parsedData.slice(0, 3)); // Show first 3 rows
      };
      reader.readAsText(selectedFile, 'utf-8');

      setSnackbar({
        open: true,
        message: 'קובץ CSV נבחר בהצלחה',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'אנא בחר קובץ CSV תקין',
        severity: 'error'
      });
    }
  }, [parseCSV]);

  const clearExistingData = useCallback(async () => {
    try {
      console.log('Starting to clear existing products...');

      // First, get the count of existing products
      const { count: initialCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error getting initial count:', countError);
        throw countError;
      }

      console.log(`Found ${initialCount || 0} existing products to delete`);

      if ((initialCount || 0) > 0) {
        // Use TRUNCATE for faster clearing of all data
        const { error: truncateError } = await supabase.rpc('truncate_products_table');

        if (truncateError) {
          console.log('TRUNCATE not available, using DELETE instead...');
          // Fallback to DELETE if TRUNCATE RPC doesn't exist
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

          if (deleteError) throw deleteError;
        }
      }

      // Verify that data was cleared
      const { count: finalCount, error: finalCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (finalCountError) {
        console.error('Error getting final count:', finalCountError);
        throw finalCountError;
      }

      console.log(`Successfully cleared data. Remaining products: ${finalCount || 0}`);

      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setResults(null);

    try {
      // Step 1: Clear existing data first
      setProgress(5);
      await clearExistingData();
      setProgress(20);

      // Step 2: Parse CSV
      setProgress(30);
      const csvText = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file, 'utf-8');
      });

      const csvData = parseCSV(csvText);

      // Remove duplicates based on 'ref no' from the CSV data itself
      const seen = new Set();
      const uniqueCsvData = csvData.filter(row => {
        const refNo = row['ref no']?.trim();
        if (!refNo || seen.has(refNo)) {
          return false;
        }
        seen.add(refNo);
        return true;
      });

      console.log(`Original CSV rows: ${csvData.length}, Unique rows: ${uniqueCsvData.length}`);

      const products = uniqueCsvData.map(transformProduct).filter(p => p['ref no'] && p['ref no'].trim());

      // Step 3: Import data with simple insert (no upsert conflicts)
      setProgress(40);
      const batchSize = 10; // Even smaller batch size to prevent conflicts
      let imported = 0;
      let batchCount = 0;

      console.log(`Starting import of ${products.length} products in batches of ${batchSize}`);

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        batchCount++;

        console.log(`Processing batch ${batchCount}: ${batch.length} products`);

        try {
          const { error } = await supabase
            .from('products')
            .insert(batch);

          if (error) {
            console.error(`Error in batch ${batchCount}:`, error);
            console.error('Failed batch data:', batch.slice(0, 2)); // Show first 2 items
            throw error;
          }

          imported += batch.length;
          console.log(`Batch ${batchCount} successful: ${imported}/${products.length} imported`);
          setProgress(40 + (i / products.length) * 55);
        } catch (batchError) {
          console.error(`Batch ${batchCount} failed:`, batchError);
          throw batchError;
        }
      }

      console.log(`Import completed: ${imported} products imported successfully`);

      // Step 4: Complete
      setProgress(100);
      setResults({ total: products.length, imported });

      setSnackbar({
        open: true,
        message: `כל המוצרים הוחלפו בהצלחה - ${imported} מוצרים מיובאים`,
        severity: 'success'
      });

      if (onImportComplete) onImportComplete();

    } catch (error) {
      console.error('Import error:', error);

      let errorMessage = `שגיאה בייבוא: ${error.message}`;

      if (error.message.includes('duplicate key value violates unique constraint')) {
        errorMessage = 'שגיאה: קובץ ה-CSV מכיל מוצרים עם קוד אצווה כפול. אנא נקה את הקובץ מהשכפולים ונסה שוב.';
      } else if (error.message.includes('violates row-level security policy')) {
        errorMessage = 'שגיאה: בעיית הרשאות. וודא שטבלת המוצרים מוגדרת כראוי ב-Supabase.';
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setUploading(false);
      setConfirmDialog(false);
    }
  }, [file, parseCSV, transformProduct, clearExistingData, onImportComplete]);

  const handleImport = useCallback(() => {
    setConfirmDialog(true);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ייבוא מוצרים מ-CSV
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="csv-file">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              בחר קובץ CSV
            </Button>
          </label>

          {file && (
            <Chip
              label={file.name}
              color="primary"
              sx={{ ml: 2 }}
              icon={<SuccessIcon />}
            />
          )}
        </Box>

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {progress < 20 ? 'מוחק נתונים קיימים...' :
               progress < 40 ? 'מנתח קובץ CSV...' :
               progress < 100 ? 'מייבא מוצרים...' :
               'משלים ייבוא...'} {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        {preview.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              תצוגה מקדימה (3 שורות ראשונות):
            </Typography>
            <List dense>
              {preview.map((row, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`מוצר ${index + 1}: ${row.hebrew_name}`}
                    secondary={`קוד: ${row['ref no']} | מחיר: ${row['Size']}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!file || uploading}
          fullWidth
        >
          {uploading ? 'מייבא...' : 'ייבא מוצרים'}
        </Button>
      </Paper>

      {results && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body1">
            ✅ ייבוא הושלם בהצלחה!
          </Typography>
          <Typography variant="body2">
            סה"כ מוצרים בקובץ: {results.total}
          </Typography>
          <Typography variant="body2">
            מוצרים מיובאים: {results.imported}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            🔄 כל המוצרים הקיימים הוחלפו בנתונים מהקובץ
          </Typography>
        </Alert>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>אישור ייבוא</DialogTitle>
        <DialogContent>
          <Typography>
            ⚠️ פעולה זו תמחק את כל המוצרים הקיימים ותייבא מחדש מקובץ ה-CSV.
            כל הנתונים הקיימים יוחלפו בנתונים מהקובץ.
            האם להמשיך?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>ביטול</Button>
          <Button onClick={importData} variant="contained">
            אישור ייבוא
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CsvImport;
