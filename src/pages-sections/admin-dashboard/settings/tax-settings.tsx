"use client";

import { useState } from "react";
import {
  Grid,
  Button,
  TextField,
  Box,
  Typography,
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
  Chip
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Receipt,
  LocalShipping,
  CurrencyExchange,
  Percent
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";

// Form validation schema
const validationSchema = yup.object().shape({
  vatRate: yup.number().min(0).max(100).required('שיעור מע"מ הוא שדה חובה'),
  currency: yup.string().required("מטבע הוא שדה חובה"),
  shippingCost: yup.number().min(0).required("עלות משלוח הוא שדה חובה"),
  freeShippingThreshold: yup.number().min(0)
});

interface TaxSettingsFormValues {
  vatRate: number;
  vatIncluded: boolean;
  currency: string;
  currencySymbol: string;
  shippingCost: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  taxExemptProducts: boolean;
  roundingMethod: string;
  displayPricesWithVat: boolean;
  invoiceFooterText: string;
}

export default function TaxSettings() {
  const initialValues: TaxSettingsFormValues = {
    vatRate: 17,
    vatIncluded: true,
    currency: "ILS",
    currencySymbol: "₪",
    shippingCost: 25,
    freeShippingEnabled: true,
    freeShippingThreshold: 200,
    taxExemptProducts: false,
    roundingMethod: "round",
    displayPricesWithVat: true,
    invoiceFooterText: 'תודה שבחרתם בנו! המחירים כולל מע"מ'
  };

  const handleFormSubmit = async (values: TaxSettingsFormValues) => {
    try {
      console.log("Saving tax settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("הגדרות המיסוי נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving tax settings:", error);
      alert("שגיאה בשמירת הגדרות המיסוי");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>מיסוי ומשלוח</H5>
        <Paragraph color="grey.600">
          נהל הגדרות מע"מ, מטבע, משלוח ותצוגת מחירים
        </Paragraph>
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* VAT Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Receipt color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות מע"מ</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          name="vatRate"
                          label='שיעור מע"מ'
                          type="number"
                          value={values.vatRate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.vatRate && errors.vatRate)}
                          helperText={touched.vatRate && errors.vatRate}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>שיטת עיגול</InputLabel>
                          <Select
                            name="roundingMethod"
                            value={values.roundingMethod}
                            label="שיטת עיגול"
                            onChange={handleChange}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="round">עיגול רגיל</MenuItem>
                            <MenuItem value="floor">עיגול כלפי מטה</MenuItem>
                            <MenuItem value="ceil">עיגול כלפי מעלה</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.vatIncluded}
                                onChange={(e) => setFieldValue("vatIncluded", e.target.checked)}
                                color="primary"
                              />
                            }
                            label='המחירים כוללים מע"מ'
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.displayPricesWithVat}
                                onChange={(e) => setFieldValue("displayPricesWithVat", e.target.checked)}
                                color="primary"
                              />
                            }
                            label='הצג מחירים כולל מע"מ בקטלוג'
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.taxExemptProducts}
                                onChange={(e) => setFieldValue("taxExemptProducts", e.target.checked)}
                                color="primary"
                              />
                            }
                            label='אפשר מוצרים פטורים ממע"מ'
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Currency Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <CurrencyExchange color="success" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות מטבע</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>מטבע</InputLabel>
                          <Select
                            name="currency"
                            value={values.currency}
                            label="מטבע"
                            onChange={handleChange}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="ILS">
                              <FlexBox alignItems="center" gap={1}>
                                <Chip label="₪" size="small" />
                                שקל ישראלי (ILS)
                              </FlexBox>
                            </MenuItem>
                            <MenuItem value="USD">
                              <FlexBox alignItems="center" gap={1}>
                                <Chip label="$" size="small" />
                                דולר אמריקאי (USD)
                              </FlexBox>
                            </MenuItem>
                            <MenuItem value="EUR">
                              <FlexBox alignItems="center" gap={1}>
                                <Chip label="€" size="small" />
                                יורו (EUR)
                              </FlexBox>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          name="currencySymbol"
                          label="סמל מטבע"
                          value={values.currencySymbol}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Shipping Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <LocalShipping color="info" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות משלוח</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          name="shippingCost"
                          label="עלות משלוח"
                          type="number"
                          value={values.shippingCost}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.shippingCost && errors.shippingCost)}
                          helperText={touched.shippingCost && errors.shippingCost}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">{values.currencySymbol}</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          name="freeShippingThreshold"
                          label="סכום למשלוח חינם"
                          type="number"
                          value={values.freeShippingThreshold}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.freeShippingThreshold && errors.freeShippingThreshold)}
                          helperText={touched.freeShippingThreshold && errors.freeShippingThreshold}
                          disabled={!values.freeShippingEnabled}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">{values.currencySymbol}</InputAdornment>,
                          }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.freeShippingEnabled}
                              onChange={(e) => setFieldValue("freeShippingEnabled", e.target.checked)}
                              color="primary"
                            />
                          }
                          label="אפשר משלוח חינם מסכום מינימלי"
                        />
                        {values.freeShippingEnabled && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            משלוח חינם יופעל אוטומטית עבור הזמנות מעל {values.freeShippingThreshold} {values.currencySymbol}
                          </Alert>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Invoice Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Percent color="warning" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות חשבוניות</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          name="invoiceFooterText"
                          label="טקסט בתחתית החשבונית"
                          value={values.invoiceFooterText}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FlexBetween>
                  <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                    שינויים בהגדרות המיסוי ישפיעו על כל המחירים והחשבוניות
                  </Alert>
                  <FlexBox gap={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      sx={{ borderRadius: 2 }}
                    >
                      איפוס
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      disabled={isSubmitting}
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
    </Box>
  );
}
