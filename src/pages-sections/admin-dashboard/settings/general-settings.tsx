"use client";

import { useState, useEffect } from "react";
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
  Avatar,
  LinearProgress,
  Snackbar
} from "@mui/material";
import { 
  CloudUpload, 
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
  siteName: yup.string().required("שם האתר הוא שדה חובה"),
  siteDescription: yup.string().required("תיאור האתר הוא שדה חובה"),
  welcomeMessage: yup.string().required("הודעת ברוכים הבאים הוא שדה חובה"),
  contactEmail: yup.string().email("כתובת אימייל לא תקינה").required("אימייל יצירת קשר הוא שדה חובה"),
  supportPhone: yup.string().required("טלפון תמיכה הוא שדה חובה")
});

interface GeneralSettingsFormValues {
  siteName: string;
  siteDescription: string;
  welcomeMessage: string;
  contactEmail: string;
  supportPhone: string;
  logo?: File;
}

export default function GeneralSettings() {
  const { settings, updateSettings, isLoading } = useCompany();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const initialValues: GeneralSettingsFormValues = {
    siteName: settings?.company_name || "פורטל לקוסמטיקאיות",
    siteDescription: settings?.company_description || "מערכת הזמנות מתקדמת לקוסמטיקאיות עם קטלוג מוצרים, מערכת תשלומים ופאנל ניהול",
    welcomeMessage: settings?.company_description || "ברוכים הבאים לפורטל הקוסמטיקה המתקדם שלנו",
    contactEmail: settings?.contact_email || "info@cosmetics-portal.co.il",
    supportPhone: settings?.contact_phone || "03-1234567"
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setUploadProgress(0);
  };

  const handleFormSubmit = async (values: GeneralSettingsFormValues) => {
    try {
      console.log("Saving general settings:", values);
      
      // Map form values to database fields
      const updates = {
        company_name: values.siteName,
        company_description: values.siteDescription,
        contact_email: values.contactEmail,
        contact_phone: values.supportPhone,
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
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Logo Upload Section */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "2px dashed", borderColor: "grey.300" }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <FlexBox flexDirection="column" alignItems="center" gap={2}>
                      {logoPreview ? (
                        <Box sx={{ position: "relative" }}>
                          <Avatar
                            src={logoPreview}
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: 2,
                              border: "3px solid",
                              borderColor: "primary.main"
                            }}
                          >
                            <ImageIcon sx={{ fontSize: 60 }} />
                          </Avatar>
                          <Box
                            onClick={handleRemoveLogo}
                            sx={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: "error.main",
                              color: "white",
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Delete fontSize="small" />
                          </Box>
                        </Box>
                      ) : (
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: "grey.100",
                            borderRadius: 2,
                            border: "2px dashed",
                            borderColor: "grey.400"
                          }}
                        >
                          <CloudUpload sx={{ fontSize: 60, color: "grey.500" }} />
                        </Avatar>
                      )}

                      <Box>
                        <H6 sx={{ mb: 1 }}>לוגו האתר</H6>
                        <Paragraph color="grey.600" fontSize="0.85rem" sx={{ mb: 2 }}>
                          העלה לוגו באיכות גבוהה. מומלץ גודל: 300x300 פיקסלים
                        </Paragraph>

                        {isUploading && (
                          <Box sx={{ width: 200, mb: 2 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                            <Typography variant="caption" color="text.secondary">
                              מעלה... {uploadProgress}%
                            </Typography>
                          </Box>
                        )}

                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="logo-upload"
                          type="file"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                        />
                        <label htmlFor="logo-upload">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            disabled={isUploading}
                            sx={{ borderRadius: 2 }}
                          >
                            {logoPreview ? "החלף לוגו" : "העלה לוגו"}
                          </Button>
                        </label>
                      </Box>
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
