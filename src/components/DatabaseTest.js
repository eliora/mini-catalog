import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  TextField,
  Divider,
  Chip
} from '@mui/material';
import { createOrder, getOrders } from '../api/orders';
import { supabase } from '../config/supabase';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const runBasicTest = async () => {
    try {
      console.log('Running basic Supabase test...');
      const { data, error } = await supabase
        .from('products')
        .select('count', { count: 'exact', head: true });

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        basic: { success: true, count: data, error: null }
      }));

      setSnackbar({
        open: true,
        message: 'בדיקה בסיסית עברה בהצלחה',
        severity: 'success'
      });

    } catch (error) {
      console.error('Basic test failed:', error);
      setTestResults(prev => ({
        ...prev,
        basic: { success: false, count: null, error: error.message }
      }));

      setSnackbar({
        open: true,
        message: `בדיקה בסיסית נכשלה: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const runOrdersTest = async () => {
    try {
      console.log('Testing orders table...');

      // Test insert
      const testOrder = {
        customerName: 'Test Customer',
        total: 99.99,
        items: [{ ref: 'TEST001', productName: 'Test Product', quantity: 1 }]
      };

      const insertResult = await createOrder(testOrder);
      console.log('Insert result:', insertResult);

      // Test select
      const orders = await getOrders();
      console.log('Orders count:', orders.length);

      setTestResults(prev => ({
        ...prev,
        orders: {
          success: true,
          insertResult,
          ordersCount: orders.length,
          error: null
        }
      }));

      setSnackbar({
        open: true,
        message: 'בדיקת הזמנות עברה בהצלחה',
        severity: 'success'
      });

    } catch (error) {
      console.error('Orders test failed:', error);
      setTestResults(prev => ({
        ...prev,
        orders: {
          success: false,
          insertResult: null,
          ordersCount: null,
          error: error.message
        }
      }));

      setSnackbar({
        open: true,
        message: `בדיקת הזמנות נכשלה: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const clearTestData = async () => {
    try {
      console.log('Clearing test data...');
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('customer_name', 'Test Customer');

      if (error) throw error;

      setSnackbar({
        open: true,
        message: 'נתוני בדיקה נמחקו בהצלחה',
        severity: 'success'
      });

    } catch (error) {
      console.error('Clear test data failed:', error);
      setSnackbar({
        open: true,
        message: `מחיקת נתוני בדיקה נכשלה: ${error.message}`,
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        בדיקות מסד נתונים
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          בדיקות זמינות
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={runBasicTest}>
            בדיקה בסיסית
          </Button>
          <Button variant="outlined" onClick={runOrdersTest}>
            בדיקת הזמנות
          </Button>
          <Button variant="outlined" onClick={clearTestData}>
            נקה נתוני בדיקה
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          תוצאות בדיקות
        </Typography>

        {testResults.basic && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">בדיקה בסיסית:</Typography>
            {testResults.basic.success ? (
              <Chip label={`✅ הצליח - ${testResults.basic.count} מוצרים`} color="success" />
            ) : (
              <Chip label={`❌ נכשל - ${testResults.basic.error}`} color="error" />
            )}
          </Box>
        )}

        {testResults.orders && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">בדיקת הזמנות:</Typography>
            {testResults.orders.success ? (
              <Box>
                <Chip label={`✅ הצליח - ${testResults.orders.ordersCount} הזמנות`} color="success" />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  מזהה הזמנה: {testResults.orders.insertResult?.id}
                </Typography>
              </Box>
            ) : (
              <Chip label={`❌ נכשל - ${testResults.orders.error}`} color="error" />
            )}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          מידע תיקון
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          אם הבדיקות נכשלות, העתק והרץ את הקוד הבא ב-Supabase SQL Editor:
        </Typography>

        <TextField
          multiline
          fullWidth
          rows={8}
          value={`-- Run this in Supabase SQL Editor
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for all users" ON public.orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for authenticated users" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for service role" ON public.orders
    FOR ALL USING (auth.role() = 'service_role');`}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            fontFamily: 'monospace',
            '& .MuiInputBase-input': {
              fontSize: '0.8rem'
            }
          }}
        />
      </Paper>

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

export default DatabaseTest;
