"use client";

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
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Settings,
  Security,
  Speed,
  Storage,
  Backup,
  Download,
  Upload,
  Delete
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";

// Form validation schema
const validationSchema = yup.object().shape({
  sessionTimeout: yup.number().min(5).max(1440).required("זמן פג תוקף הוא שדה חובה"),
  maxFileSize: yup.number().min(1).max(100).required("גודל קובץ מקסימלי הוא שדה חובה"),
  backupRetention: yup.number().min(1).max(365).required("תקופת שמירת גיבויים הוא שדה חובה")
});

interface SystemSettingsFormValues {
  sessionTimeout: number;
  enableTwoFactor: boolean;
  maxFileSize: number;
  enableCache: boolean;
  cacheTimeout: number;
  enableLogging: boolean;
  logLevel: string;
  enableBackup: boolean;
  backupFrequency: string;
  backupRetention: number;
  maintenanceMode: boolean;
  debugMode: boolean;
}

export default function SystemSettings() {
  const initialValues: SystemSettingsFormValues = {
    sessionTimeout: 60,
    enableTwoFactor: false,
    maxFileSize: 10,
    enableCache: true,
    cacheTimeout: 3600,
    enableLogging: true,
    logLevel: "info",
    enableBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    maintenanceMode: false,
    debugMode: false
  };

  const backupHistory = [
    { id: 1, date: "2024-01-15 03:00", size: "245 MB", status: "success" },
    { id: 2, date: "2024-01-14 03:00", size: "243 MB", status: "success" },
    { id: 3, date: "2024-01-13 03:00", size: "241 MB", status: "success" },
    { id: 4, date: "2024-01-12 03:00", size: "238 MB", status: "failed" },
    { id: 5, date: "2024-01-11 03:00", size: "236 MB", status: "success" }
  ];

  const handleFormSubmit = async (values: SystemSettingsFormValues) => {
    try {
      console.log("Saving system settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("הגדרות המערכת נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving system settings:", error);
      alert("שגיאה בשמירת הגדרות המערכת");
    }
  };

  const handleBackupNow = async () => {
    try {
      console.log("Creating backup...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("הגיבוי נוצר בהצלחה!");
    } catch (error) {
      console.error("Error creating backup:", error);
      alert("שגיאה ביצירת גיבוי");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "success";
      case "failed": return "error";
      case "running": return "warning";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success": return "הצליח";
      case "failed": return "נכשל";
      case "running": return "רץ";
      default: return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <H5 sx={{ fontWeight: 700, mb: 1 }}>הגדרות מערכת</H5>
        <Paragraph color="grey.600">
          נהל הגדרות מתקדמות של המערכת, אבטחה, ביצועים וגיבויים
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
              {/* Security Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "error.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Security color="error" />
                      <H6 sx={{ fontWeight: 700 }}>אבטחה</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          name="sessionTimeout"
                          label="זמן פג תוקף (דקות)"
                          type="number"
                          value={values.sessionTimeout}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.sessionTimeout && errors.sessionTimeout)}
                          helperText={touched.sessionTimeout && errors.sessionTimeout}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={6} xs={12}>
                        <Box sx={{ pt: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.enableTwoFactor}
                                onChange={(e) => setFieldValue("enableTwoFactor", e.target.checked)}
                                color="primary"
                              />
                            }
                            label="אפשר אימות דו-שלבי"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Speed color="info" />
                      <H6 sx={{ fontWeight: 700 }}>ביצועים</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="maxFileSize"
                          label="גודל קובץ מקסימלי (MB)"
                          type="number"
                          value={values.maxFileSize}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.maxFileSize && errors.maxFileSize)}
                          helperText={touched.maxFileSize && errors.maxFileSize}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="cacheTimeout"
                          label="זמן תפוגת מטמון (שניות)"
                          type="number"
                          value={values.cacheTimeout}
                          onChange={handleChange}
                          disabled={!values.enableCache}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>רמת לוגים</InputLabel>
                          <Select
                            name="logLevel"
                            value={values.logLevel}
                            label="רמת לוגים"
                            onChange={handleChange}
                            disabled={!values.enableLogging}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="debug">Debug</MenuItem>
                            <MenuItem value="info">Info</MenuItem>
                            <MenuItem value="warning">Warning</MenuItem>
                            <MenuItem value="error">Error</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.enableCache}
                                onChange={(e) => setFieldValue("enableCache", e.target.checked)}
                                color="primary"
                              />
                            }
                            label="אפשר מטמון"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.enableLogging}
                                onChange={(e) => setFieldValue("enableLogging", e.target.checked)}
                                color="primary"
                              />
                            }
                            label="אפשר לוגים"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Backup Settings */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                  <CardContent>
                    <FlexBetween mb={2}>
                      <FlexBox alignItems="center" gap={2}>
                        <Backup color="success" />
                        <H6 sx={{ fontWeight: 700 }}>גיבויים</H6>
                      </FlexBox>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Backup />}
                        onClick={handleBackupNow}
                        sx={{ borderRadius: 2 }}
                      >
                        צור גיבוי עכשיו
                      </Button>
                    </FlexBetween>
                    
                    <Grid container spacing={2} mb={3}>
                      <Grid item md={4} xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>תדירות גיבוי</InputLabel>
                          <Select
                            name="backupFrequency"
                            value={values.backupFrequency}
                            label="תדירות גיבוי"
                            onChange={handleChange}
                            disabled={!values.enableBackup}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="hourly">כל שעה</MenuItem>
                            <MenuItem value="daily">יומי</MenuItem>
                            <MenuItem value="weekly">שבועי</MenuItem>
                            <MenuItem value="monthly">חודשי</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="backupRetention"
                          label="שמירת גיבויים (ימים)"
                          type="number"
                          value={values.backupRetention}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.backupRetention && errors.backupRetention)}
                          helperText={touched.backupRetention && errors.backupRetention}
                          disabled={!values.enableBackup}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <Box sx={{ pt: 2 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.enableBackup}
                                onChange={(e) => setFieldValue("enableBackup", e.target.checked)}
                                color="primary"
                              />
                            }
                            label="אפשר גיבוי אוטומטי"
                          />
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Backup History */}
                    <Box>
                      <H6 sx={{ mb: 2, fontWeight: 600 }}>היסטוריית גיבויים</H6>
                      <List sx={{ bgcolor: "grey.50", borderRadius: 2, p: 0 }}>
                        {backupHistory.map((backup, index) => (
                          <Box key={backup.id}>
                            <ListItem>
                              <ListItemText
                                primary={backup.date}
                                secondary={`גודל: ${backup.size}`}
                              />
                              <ListItemSecondaryAction>
                                <FlexBox alignItems="center" gap={1}>
                                  <Chip
                                    label={getStatusText(backup.status)}
                                    color={getStatusColor(backup.status) as any}
                                    size="small"
                                  />
                                  {backup.status === "success" && (
                                    <>
                                      <IconButton size="small" color="primary">
                                        <Download />
                                      </IconButton>
                                      <IconButton size="small" color="error">
                                        <Delete />
                                      </IconButton>
                                    </>
                                  )}
                                </FlexBox>
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < backupHistory.length - 1 && <Divider />}
                          </Box>
                        ))}
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* System Status */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "warning.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Storage color="warning" />
                      <H6 sx={{ fontWeight: 700 }}>מצב מערכת</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.maintenanceMode}
                                onChange={(e) => setFieldValue("maintenanceMode", e.target.checked)}
                                color="warning"
                              />
                            }
                            label="מצב תחזוקה (המערכת תהיה לא זמינה למשתמשים)"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={values.debugMode}
                                onChange={(e) => setFieldValue("debugMode", e.target.checked)}
                                color="error"
                              />
                            }
                            label="מצב דיבוג (הצג מידע טכני מפורט)"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FlexBetween>
                  <Alert severity="error" sx={{ flex: 1, mr: 2 }}>
                    שינויים בהגדרות המערכת עלולים להשפיע על יציבות המערכת
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
