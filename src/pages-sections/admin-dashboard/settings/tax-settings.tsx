"use client";

import React, { useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Snackbar
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Receipt,
  LocalShipping,
  Percent
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";
import { useCompany } from "@/context/CompanyContext";

// Form validation schema
const validationSchema = yup.object().shape({
  taxRate: yup.number().min(0).max(100).required('שיעור מע״מ הוא שדה חובה'),
  currency: yup.string().required("מטבע הוא שדה חובה"),
  standardShippingCost: yup.number().min(0).required("עלות משלוח רגיל הוא שדה חובה"),
  freeShippingThreshold: yup.number().min(0)
});

interface TaxSettingsFormValues {
  taxRate: number;
  pricesIncludeTax: boolean;
  currency: string;
  standardShippingCost: number;
  expressShippingCost: number;
  freeShippingThreshold: number;
  enableTaxExempt: boolean;
  showPricesWithTax: boolean;
  invoiceFooterText: string;
}

export default function TaxSettings() {
  const { settings, updateSettings, isLoading } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const initialValues: TaxSettingsFormValues = {
    taxRate: settings?.tax_rate ? (settings.tax_rate * 100) : 18, // Convert from decimal to percentage
    pricesIncludeTax: settings?.prices_include_tax || true,
    currency: settings?.currency || 'ILS',
    standardShippingCost: settings?.standard_shipping_cost || 0,
    expressShippingCost: settings?.express_shipping_cost || 0,
    freeShippingThreshold: settings?.free_shipping_threshold || 0,
    enableTaxExempt: settings?.enable_tax_exempt || false,
    showPricesWithTax: settings?.show_prices_with_tax || true,
    invoiceFooterText: settings?.invoice_footer_text || '',
  };

  const handleFormSubmit = async (values: TaxSettingsFormValues) => {
    try {
      console.log("Saving tax settings:", values);
      
      // Map form values to database fields
      const updates = {
        tax_rate: values.taxRate / 100, // Convert percentage to decimal
        prices_include_tax: values.pricesIncludeTax,
        currency: values.currency,
        standard_shipping_cost: values.standardShippingCost,
        express_shipping_cost: values.expressShippingCost,
        free_shipping_threshold: values.freeShippingThreshold,
        enable_tax_exempt: values.enableTaxExempt,
        show_prices_with_tax: values.showPricesWithTax,
        invoice_footer_text: values.invoiceFooterText,
      };

      const result = await updateSettings(updates);
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: `שגיאה בשמירת הגדרות המיסוי: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: "הגדרות המיסוי נשמרו בהצלחה!",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error saving tax settings:", error);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת הגדרות המיסוי",
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>מיסוי ומשלוח</H5>
        <Paragraph color="grey.600">
          נהל הגדרות מע״מ, מטבע, משלוח ותצוגת מחירים
        </Paragraph>
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* VAT Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Receipt color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות מע״מ</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="taxRate"
                          label="שיעור מע״מ (%)"
                          type="number"
                          value={values.taxRate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.taxRate && errors.taxRate)}
                          helperText={touched.taxRate && errors.taxRate}
                          InputProps={{
                            endAdornment: <InputAdornment position="end"><Percent /></InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>מטבע</InputLabel>
                          <Select
                            name="currency"
                            value={values.currency}
                            onChange={handleChange}
                            label="מטבע"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="ILS">₪ שקל ישראלי</MenuItem>
                            <MenuItem value="USD">$ דולר אמריקאי</MenuItem>
                            <MenuItem value="EUR">€ יורו</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.pricesIncludeTax}
                              onChange={(e) => setFieldValue('pricesIncludeTax', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="המחירים כוללים מע״מ"
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.showPricesWithTax}
                              onChange={(e) => setFieldValue('showPricesWithTax', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="הצג מחירים עם מע״מ"
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.enableTaxExempt}
                              onChange={(e) => setFieldValue('enableTaxExempt', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="אפשר פטור ממע״מ"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Shipping Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <LocalShipping color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות משלוח</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="standardShippingCost"
                          label="עלות משלוח רגיל"
                          type="number"
                          value={values.standardShippingCost}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.standardShippingCost && errors.standardShippingCost)}
                          helperText={touched.standardShippingCost && errors.standardShippingCost}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₪</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="expressShippingCost"
                          label="עלות משלוח מהיר"
                          type="number"
                          value={values.expressShippingCost}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₪</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          name="freeShippingThreshold"
                          label="סכום משלוח חינם"
                          type="number"
                          value={values.freeShippingThreshold}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.freeShippingThreshold && errors.freeShippingThreshold)}
                          helperText={touched.freeShippingThreshold && errors.freeShippingThreshold}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₪</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Invoice Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Receipt color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות חשבונית</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          name="invoiceFooterText"
                          label="טקסט תחתון בחשבונית"
                          value={values.invoiceFooterText}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="תודה שבחרתם בנו! המחירים כולל מע״מ"
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <FlexBetween>
                  <Alert severity="info" sx={{ flex: 1, mr: 2 }}>
                    שינויים יכנסו לתוקף מיד לאחר השמירה
                  </Alert>
                  <FlexBox gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      sx={{ borderRadius: 2 }}
                      onClick={() => window.location.reload()}
                    >
                      איפוס
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isSubmitting || isLoading}
                      sx={{ borderRadius: 2, minWidth: 120 }}
                    >
                      {isSubmitting ? "שומר..." : "שמור שינויים"}
                    </Button>
                  </FlexBox>
                </FlexBetween>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}