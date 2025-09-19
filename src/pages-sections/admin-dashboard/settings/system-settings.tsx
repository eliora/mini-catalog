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
  Snackbar
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Security,
  Speed,
  Storage,
  Backup
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";
import { useCompany } from "@/context/CompanyContext";

// Form validation schema
const validationSchema = yup.object().shape({
  sessionTimeout: yup.number().min(300).max(86400).required("זמן פג תוקף הוא שדה חובה"),
  maxLoginAttempts: yup.number().min(1).max(20).required("מספר ניסיונות התחברות מקסימלי הוא שדה חובה"),
  cacheDuration: yup.number().min(60).max(3600).required("זמן שמירה במטמון הוא שדה חובה")
});

interface SystemSettingsFormValues {
  sessionTimeout: number;
  maxLoginAttempts: number;
  maintenanceMode: boolean;
  debugMode: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  enableNotifications: boolean;
  backupFrequency: string;
  cacheDuration: number;
}

export default function SystemSettings() {
  const { settings, updateSettings, isLoading } = useCompany();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const initialValues: SystemSettingsFormValues = {
    sessionTimeout: settings?.session_timeout || 3600, // Convert seconds to minutes for display
    maxLoginAttempts: settings?.max_login_attempts || 5,
    maintenanceMode: settings?.maintenance_mode || false,
    debugMode: settings?.debug_mode || false,
    enableReviews: settings?.enable_reviews || true,
    enableWishlist: settings?.enable_wishlist || true,
    enableNotifications: settings?.enable_notifications || true,
    backupFrequency: settings?.backup_frequency || 'daily',
    cacheDuration: settings?.cache_duration || 300,
  };

  const handleFormSubmit = async (values: SystemSettingsFormValues) => {
    try {
      console.log("Saving system settings:", values);
      
      // Map form values to database fields
      const updates = {
        session_timeout: values.sessionTimeout,
        max_login_attempts: values.maxLoginAttempts,
        maintenance_mode: values.maintenanceMode,
        debug_mode: values.debugMode,
        enable_reviews: values.enableReviews,
        enable_wishlist: values.enableWishlist,
        enable_notifications: values.enableNotifications,
        backup_frequency: values.backupFrequency,
        cache_duration: values.cacheDuration,
      };

      const result = await updateSettings(updates);
      
      if (result.error) {
        setSnackbar({
          open: true,
          message: `שגיאה בשמירת הגדרות המערכת: ${result.error}`,
          severity: 'error'
        });
      } else {
        setSnackbar({
          open: true,
          message: "הגדרות המערכת נשמרו בהצלחה!",
          severity: 'success'
        });
      }
    } catch (error) {
      console.error("Error saving system settings:", error);
      setSnackbar({
        open: true,
        message: "שגיאה בשמירת הגדרות המערכת",
        severity: 'error'
      });
    }
  };

  const handleBackupNow = async () => {
    try {
      console.log("Creating backup...");
      setSnackbar({
        open: true,
        message: "יצירת גיבוי... (זה יכול לקחת כמה דקות)",
        severity: 'success'
      });
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: "הגיבוי נוצר בהצלחה!",
        severity: 'success'
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      setSnackbar({
        open: true,
        message: "שגיאה ביצירת הגיבוי",
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>הגדרות מערכת</H5>
        <Paragraph color="grey.600">
          נהל הגדרות אבטחה, ביצועים ותחזוקה של המערכת
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
              {/* Security Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Security color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות אבטחה</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="sessionTimeout"
                          label="זמן פג תוקף הפעלה (שניות)"
                          type="number"
                          value={values.sessionTimeout}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.sessionTimeout && errors.sessionTimeout)}
                          helperText={touched.sessionTimeout && errors.sessionTimeout}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="maxLoginAttempts"
                          label="מספר ניסיונות התחברות מקסימלי"
                          type="number"
                          value={values.maxLoginAttempts}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.maxLoginAttempts && errors.maxLoginAttempts)}
                          helperText={touched.maxLoginAttempts && errors.maxLoginAttempts}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.maintenanceMode}
                              onChange={(e) => setFieldValue('maintenanceMode', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="מצב תחזוקה - האתר יהיה זמנית לא זמין למשתמשים"
                        />
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.debugMode}
                              onChange={(e) => setFieldValue('debugMode', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="מצב דיבוג - הצג מידע טכני מפורט"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Speed color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות ביצועים</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 6, xs: 12 }}>
                        <TextField
                          fullWidth
                          name="cacheDuration"
                          label="זמן שמירה במטמון (שניות)"
                          type="number"
                          value={values.cacheDuration}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.cacheDuration && errors.cacheDuration)}
                          helperText={touched.cacheDuration && errors.cacheDuration}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid size={{ md: 6, xs: 12 }}>
                        <FormControl fullWidth>
                          <InputLabel>תדירות גיבוי</InputLabel>
                          <Select
                            name="backupFrequency"
                            value={values.backupFrequency}
                            onChange={handleChange}
                            label="תדירות גיבוי"
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="hourly">שעתי</MenuItem>
                            <MenuItem value="daily">יומי</MenuItem>
                            <MenuItem value="weekly">שבועי</MenuItem>
                            <MenuItem value="monthly">חודשי</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Feature Settings */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Storage color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>הגדרות תכונות</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                      <Grid size={{ md: 4, xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.enableReviews}
                              onChange={(e) => setFieldValue('enableReviews', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="אפשר ביקורות על מוצרים"
                        />
                      </Grid>

                      <Grid size={{ md: 4, xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.enableWishlist}
                              onChange={(e) => setFieldValue('enableWishlist', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="אפשר רשימת משאלות"
                        />
                      </Grid>

                      <Grid size={{ md: 4, xs: 12 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.enableNotifications}
                              onChange={(e) => setFieldValue('enableNotifications', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="אפשר התראות"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Backup Management */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Backup color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>ניהול גיבויים</H6>
                    </FlexBox>
                    <Divider sx={{ mb: 3 }} />

                    <FlexBox gap={2}>
                      <Button
                        variant="contained"
                        startIcon={<Backup />}
                        onClick={handleBackupNow}
                        sx={{ borderRadius: 2 }}
                      >
                        צור גיבוי עכשיו
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Storage />}
                        sx={{ borderRadius: 2 }}
                      >
                        הורד גיבוי אחרון
                      </Button>
                    </FlexBox>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      הגיבויים מתבצעים אוטומטית לפי התדירות שנבחרה. מומלץ ליצור גיבוי ידני לפני עדכונים חשובים.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <FlexBetween>
                  <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                    שינויים בהגדרות המערכת יכולים להשפיע על ביצועי האתר
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