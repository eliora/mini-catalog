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
  InputLabel
} from "@mui/material";
import { 
  Save, 
  Refresh,
  Business,
  LocationOn,
  Phone,
  Email
} from "@mui/icons-material";
import { H5, H6, Paragraph } from "@/components/Typography";
import { FlexBetween, FlexBox } from "@/components/flex-box";
import { Formik } from "formik";
import * as yup from "yup";

// Form validation schema
const validationSchema = yup.object().shape({
  companyName: yup.string().required("שם החברה הוא שדה חובה"),
  businessNumber: yup.string().required("מספר עסק הוא שדה חובה"),
  vatNumber: yup.string().required("מספר עוסק מורשה הוא שדה חובה"),
  address: yup.string().required("כתובת החברה הוא שדה חובה"),
  city: yup.string().required("עיר הוא שדה חובה"),
  zipCode: yup.string().required("מיקוד הוא שדה חובה"),
  phone: yup.string().required("טלפון הוא שדה חובה"),
  email: yup.string().email("כתובת אימייל לא תקינה").required("אימייל הוא שדה חובה"),
});

interface CompanySettingsFormValues {
  companyName: string;
  businessNumber: string;
  vatNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  isVatRegistered: boolean;
  businessType: string;
}

export default function CompanySettings() {
  const initialValues: CompanySettingsFormValues = {
    companyName: 'פורטל לקוסמטיקאיות בע"מ',
    businessNumber: "516123456",
    vatNumber: "123456789",
    address: "רחוב הברושים 15",
    city: "תל אביב",
    zipCode: "6473925",
    country: "ישראל",
    phone: "03-1234567",
    email: "info@cosmetics-portal.co.il",
    website: "https://www.cosmetics-portal.co.il",
    description: "חברה מובילה בתחום הקוסמטיקה והיופי",
    isVatRegistered: true,
    businessType: "retail"
  };

  const handleFormSubmit = async (values: CompanySettingsFormValues) => {
    try {
      console.log("Saving company settings:", values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("פרטי החברה נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving company settings:", error);
      alert("שגיאה בשמירת פרטי החברה");
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
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Company Information */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "primary.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Business color="primary" />
                      <H6 sx={{ fontWeight: 700 }}>מידע עסקי</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
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

                      <Grid item md={6} xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>סוג עסק</InputLabel>
                          <Select
                            name="businessType"
                            value={values.businessType}
                            label="סוג עסק"
                            onChange={handleChange}
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="retail">קמעונאות</MenuItem>
                            <MenuItem value="wholesale">סיטונאות</MenuItem>
                            <MenuItem value="manufacturing">ייצור</MenuItem>
                            <MenuItem value="services">שירותים</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item md={6} xs={12}>
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

                      <Grid item md={6} xs={12}>
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

                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={values.isVatRegistered}
                              onChange={(e) => setFieldValue("isVatRegistered", e.target.checked)}
                              color="primary"
                            />
                          }
                          label='עוסק מורשה במע"מ'
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Address Information */}
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "info.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <LocationOn color="info" />
                      <H6 sx={{ fontWeight: 700 }}>כתובת</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name="address"
                          label="רחוב ומספר בית"
                          value={values.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.address && errors.address)}
                          helperText={touched.address && errors.address}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="city"
                          label="עיר"
                          value={values.city}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.city && errors.city)}
                          helperText={touched.city && errors.city}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="zipCode"
                          label="מיקוד"
                          value={values.zipCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={Boolean(touched.zipCode && errors.zipCode)}
                          helperText={touched.zipCode && errors.zipCode}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                        />
                      </Grid>

                      <Grid item md={4} xs={12}>
                        <TextField
                          fullWidth
                          name="country"
                          label="מדינה"
                          value={values.country}
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
              <Grid item xs={12}>
                <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid", borderColor: "success.200" }}>
                  <CardContent>
                    <FlexBox alignItems="center" gap={2} mb={2}>
                      <Phone color="success" />
                      <H6 sx={{ fontWeight: 700 }}>פרטי יצירת קשר</H6>
                    </FlexBox>
                    
                    <Grid container spacing={2}>
                      <Grid item md={6} xs={12}>
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

                      <Grid item md={6} xs={12}>
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

                      <Grid item xs={12}>
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

                      <Grid item xs={12}>
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

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <FlexBetween>
                  <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
                    שינויים בפרטי החברה ישפיעו על מסמכים רשמיים
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
