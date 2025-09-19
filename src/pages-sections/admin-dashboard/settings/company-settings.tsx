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
  Snackbar
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Business,
  LocationOn
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";
import { useCompany } from "@/context/CompanyContext";

// Form validation schema
const validationSchema = yup.object().shape({
  companyName: yup.string().required("שם החברה הוא שדה חובה"),
  businessNumber: yup.string().required("מספר עסק הוא שדה חובה"),
  vatNumber: yup.string().required("מספר עוסק מורשה הוא שדה חובה"),
  address: yup.string().required("כתובת החברה הוא שדה חובה"),
  phone: yup.string().required("טלפון הוא שדה חובה"),
  email: yup.string().email("כתובת אימייל לא תקינה").required("אימייל הוא שדה חובה"),
});

interface CompanySettingsFormValues {
  companyName: string;
  businessNumber: string;
  vatNumber: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  isVatRegistered: boolean;
}

export default function CompanySettings() {
  const { settings, updateSettings, isLoading } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const initialValues: CompanySettingsFormValues = {
    companyName: settings?.company_name || '',
    businessNumber: settings?.registration_number || '',
    vatNumber: settings?.tax_id || '',
    address: settings?.company_address || '',
    phone: settings?.company_phone || '',
    email: settings?.company_email || '',
    website: settings?.website || '',
    description: settings?.company_description || '',
    isVatRegistered: settings?.is_vat_registered || false,
  };

  const handleFormSubmit = async (values: CompanySettingsFormValues) => {
    try {
      console.log("Saving company settings:", values);
      
      // Map form values to database fields
      const updates = {
        company_name: values.companyName,
        registration_number: values.businessNumber,
        tax_id: values.vatNumber,
        company_address: values.address,
        company_phone: values.phone,
        company_email: values.email,
        website: values.website,
        company_description: values.description,
        is_vat_registered: values.isVatRegistered,
      };

      const result = await updateSettings(updates);
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: `שגיאה בשמירת פרטי החברה: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: "פרטי החברה נשמרו בהצלחה!",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error saving company settings:", error);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת פרטי החברה",
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>פרטי החברה</H5>
        <Paragraph color="grey.600">
          נהל את פרטי החברה, כתובת, מיסוי ומידע עסקי
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
              {/* Company Information */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Business color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>מידע כללי על החברה</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="companyName"
                          label="שם החברה"
                          value={values.companyName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.companyName && errors.companyName)}
                          helperText={touched.companyName && errors.companyName}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="businessNumber"
                          label="מספר עסק"
                          value={values.businessNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.businessNumber && errors.businessNumber)}
                          helperText={touched.businessNumber && errors.businessNumber}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="vatNumber"
                          label="מספר עוסק מורשה"
                          value={values.vatNumber}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.vatNumber && errors.vatNumber)}
                          helperText={touched.vatNumber && errors.vatNumber}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="website"
                          label="אתר אינטרנט"
                          value={values.website}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          name="description"
                          label="תיאור החברה"
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Information */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <LocationOn color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>פרטי יצירת קשר</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name="address"
                          label="כתובת החברה"
                          value={values.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.address && errors.address)}
                          helperText={touched.address && errors.address}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="phone"
                          label="טלפון"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.phone && errors.phone)}
                          helperText={touched.phone && errors.phone}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="email"
                          label="אימייל"
                          type="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tax Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Business color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות מיסוי</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={values.isVatRegistered}
                          onChange={(e) => setFieldValue('isVatRegistered', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="חברה רשומה כעוסק מורשה"
                    />
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