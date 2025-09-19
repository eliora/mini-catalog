"use client";

import { useState, useEffect } from "react";
import {
  Grid,
  Button,
  TextField,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Avatar,
  Snackbar
} from "@mui/material";
import { 
  Delete, 
  Save, 
  Refresh,
  Image as ImageIcon 
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";
import { useCompany } from "@/context/CompanyContext";

// Form validation schema
const validationSchema = yup.object().shape({
  siteName: yup.string(),
  siteDescription: yup.string(),
  welcomeMessage: yup.string(),
  contactEmail: yup.string().email("כתובת אימייל לא תקינה"),
  supportPhone: yup.string(),
  logoUrl: yup.string().url("כתובת URL לא תקינה"),
  logoUrlCompact: yup.string().url("כתובת URL לא תקינה")
});

interface GeneralSettingsFormValues {
  siteName: string;
  siteDescription: string;
  welcomeMessage: string;
  contactEmail: string;
  supportPhone: string;
  logoUrl: string;
  logoUrlCompact: string;
}

export default function GeneralSettings() {
  const { settings, updateSettings } = useCompany();
  const [, setLogoPreview] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Set logo preview from existing settings
  useEffect(() => {
    if (settings?.logo_url) {
      setLogoPreview(settings.logo_url);
    }
  }, [settings, setLogoPreview]);

  const initialValues: GeneralSettingsFormValues = {
    siteName: settings?.company_name || "",
    siteDescription: settings?.company_description || "",
    welcomeMessage: settings?.company_description || "",
    contactEmail: settings?.company_email || "",
    supportPhone: settings?.company_phone || "",
    logoUrl: settings?.logo_url || "",
    logoUrlCompact: settings?.logo_url_compact || ""
  };

  const handleLogoUrlChange = (url: string) => {
    setLogoPreview(url);
  };


  const handleFormSubmit = async (values: GeneralSettingsFormValues) => {
    try {
      console.log("Saving general settings:", values);
      
      // Map form values to database fields
      const updates = {
        company_name: values.siteName,
        company_description: values.siteDescription,
        company_email: values.contactEmail,
        company_phone: values.supportPhone,
        logo_url: values.logoUrl, // Include logo URL from form
        logo_url_compact: values.logoUrlCompact, // Include compact logo URL from form
      };

      const result = await updateSettings(updates);
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: `שגיאה בשמירת ההגדרות: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: "ההגדרות נשמרו בהצלחה!",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת ההגדרות",
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>הגדרות כלליות</H5>
        <Paragraph color="grey.600">
          נהל את המידע הבסיסי של האתר, לוגו וההגדרות הכלליות
        </Paragraph>
      </Box>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Logo URL Section */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <FlexBox flexDirection="column" gap={2}>
                      <H6 sx={{ mb: 1 }}>לוגו האתר</H6>
                      <Paragraph color="grey.600" fontSize="0.85rem" sx={{ mb: 2 }}>
                        הזן כתובת URL של הלוגו (מומלץ גודל: 300x300 פיקסלים)
                      </Paragraph>
                      
                      <TextField
                        fullWidth
                        label="כתובת URL של הלוגו"
                        placeholder="https://example.com/logo.png"
                        name="logoUrl"
                        value={values.logoUrl}
                        onChange={(e) => {
                          handleChange(e);
                          handleLogoUrlChange(e.target.value);
                        }}
                        onBlur={handleBlur}
                        error={touched.logoUrl && Boolean(errors.logoUrl)}
                        helperText={touched.logoUrl && errors.logoUrl}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        label="כתובת URL של הלוגו הקומפקטי"
                        placeholder="https://example.com/logo-compact.png"
                        name="logoUrlCompact"
                        value={values.logoUrlCompact}
                        onChange={(e) => {
                          handleChange(e);
                          handleLogoUrlChange(e.target.value);
                        }}
                        onBlur={handleBlur}
                        error={touched.logoUrlCompact && Boolean(errors.logoUrlCompact)}
                        helperText={touched.logoUrlCompact && errors.logoUrlCompact}
                        sx={{ mb: 2 }}
                      />
                      
                      {values.logoUrl && (
                        <Box sx={{ textAlign: "center" }}>
                          <Avatar
                            src={values.logoUrl}
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: 2,
                              border: "3px solid",
                              borderColor: "primary.main",
                              mx: "auto"
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 60 }} />
                          </Avatar>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Delete />}
                            onClick={() => {
                              setFieldValue('logoUrl', '');
                              setLogoPreview(null);
                            }}
                            sx={{ mt: 2 }}
                          >
                            הסר לוגו
                          </Button>
                        </Box>
                      )}
                    </FlexBox>
                  </CardContent>
                </Card>
              </Grid>

              {/* Site Information */}
              <Grid size={{ xs: 12 }}>
                <H6 sx={{ mb: 2, fontWeight: 700 }}>מידע כללי על האתר</H6>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  name="siteName"
                  label="שם האתר"
                  value={values.siteName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.siteName && errors.siteName)}
                  helperText={touched.siteName && errors.siteName}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  name="contactEmail"
                  label="אימייל יצירת קשר"
                  type="email"
                  value={values.contactEmail}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.contactEmail && errors.contactEmail)}
                  helperText={touched.contactEmail && errors.contactEmail}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  name="siteDescription"
                  label="תיאור האתר"
                  value={values.siteDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.siteDescription && errors.siteDescription)}
                  helperText={touched.siteDescription && errors.siteDescription}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  name="welcomeMessage"
                  label="הודעת ברוכים הבאים"
                  value={values.welcomeMessage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.welcomeMessage && errors.welcomeMessage)}
                  helperText={touched.welcomeMessage && errors.welcomeMessage}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ md: 6, xs: 12 }}>
                <TextField
                  fullWidth
                  name="supportPhone"
                  label="טלפון תמיכה"
                  value={values.supportPhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(touched.supportPhone && errors.supportPhone)}
                  helperText={touched.supportPhone && errors.supportPhone}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
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
