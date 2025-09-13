import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Divider,
  Stack,
  Avatar
} from '@mui/material';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getCompanySettings, saveCompanySettings } from '../../api/settings';
import { useCompany } from '../../context/CompanyContext';

const CompanySettings = () => {
  const { refreshSettings } = useCompany();
  const [settings, setSettings] = useState({
    companyName: '',
    companyDescription: '',
    companyTagline: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    invoiceFooter: '',
    companyLogo: '',
    taxRate: 17
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בטעינת הגדרות החברה',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Convert to base64 for simple storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          companyLogo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setSettings(prev => ({
      ...prev,
      companyLogo: ''
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveCompanySettings(settings);
      // Refresh the global company context
      await refreshSettings();
      setSnackbar({
        open: true,
        message: 'הגדרות החברה נשמרו בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      let errorMessage = 'שגיאה בשמירת הגדרות החברה';
      
      if (error.message.includes('Missing Supabase') || error.message.includes('environment')) {
        errorMessage = 'שגיאה: חסרות הגדרות Supabase. יש להגדיר קובץ .env.local';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'שגיאת רשת: בדוק את החיבור לאינטרנט';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    loadSettings();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>טוען הגדרות...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            הגדרות החברה
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          הגדרות אלו יופיעו בהזמנות המודפסות ובמסמכי החברה
        </Typography>

        <Grid container spacing={3}>
          {/* Company Basic Info */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              פרטי החברה הבסיסיים
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שם החברה"
              value={settings.companyName}
              onChange={handleChange('companyName')}
              placeholder="Jean Darcel"
              helperText="השם הראשי של החברה (יופיע בכותרת הזמנות)"
              sx={{ }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                לוגו החברה
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={settings.companyLogo}
                  sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}
                >
                  <BusinessIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                    size="small"
                  >
                    העלה לוגו
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </Button>
                  {settings.companyLogo && (
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteIcon />}
                      size="small"
                      onClick={handleLogoDelete}
                    >
                      מחק לוגו
                    </Button>
                  )}
                </Stack>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                יופיע בכותרת האתר (לא במובייל) ובהזמנות מודפסות
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="תיאור החברה"
              value={settings.companyDescription}
              onChange={handleChange('companyDescription')}
              placeholder="מערכת ניהול הזמנות"
              helperText="תיאור קצר של החברה או השירות"
              sx={{ }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="סלוגן/תיאור מורחב"
              value={settings.companyTagline}
              onChange={handleChange('companyTagline')}
              placeholder="אתר מקצועי למוצרי יופי"
              helperText="סלוגן או תיאור מורחב (יופיע מתחת לשם החברה)"
              sx={{ }}
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              פרטי יצירת קשר
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="כתובת החברה"
              value={settings.companyAddress}
              onChange={handleChange('companyAddress')}
              placeholder="רחוב XXX, עיר, מיקוד"
              helperText="כתובת מלאה של החברה (אופציונלי)"
              sx={{ }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="טלפון"
              value={settings.companyPhone}
              onChange={handleChange('companyPhone')}
              placeholder="03-1234567"
              helperText="מספר טלפון ליצירת קשר"
              sx={{ }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="אימייל"
              type="email"
              value={settings.companyEmail}
              onChange={handleChange('companyEmail')}
              placeholder="info@company.com"
              helperText="כתובת אימייל ליצירת קשר"
              sx={{ }}
            />
          </Grid>

          {/* Invoice Settings */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
              הגדרות הזמנות
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="טקסט תחתון בהזמנות"
              value={settings.invoiceFooter}
              onChange={handleChange('invoiceFooter')}
              placeholder="מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות"
              helperText="הטקסט שיופיע בתחתית הזמנות מודפסות"
              sx={{ }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="שיעור מס (%)"
              type="number"
              value={settings.taxRate}
              onChange={handleChange('taxRate')}
              placeholder="17"
              helperText="שיעור המע״מ באחוזים (למשל: 17 עבור 17%)"
              sx={{ }}
              InputProps={{
                inputProps: { 
                  min: 0, 
                  max: 100, 
                  step: 0.01 
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={saving}
          >
            אפס שינויים
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ minWidth: 120 }}
          >
            {saving ? 'שומר...' : 'שמור הגדרות'}
          </Button>
        </Box>
      </Paper>

      {/* Preview Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
          תצוגה מקדימה
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          כך יופיעו הפרטים בהזמנות מודפסות:
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {settings.companyName || 'שם החברה'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {settings.companyDescription || 'תיאור החברה'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {settings.companyTagline || 'סלוגן החברה'}
          </Typography>
          {settings.companyAddress && (
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              כתובת: {settings.companyAddress}
            </Typography>
          )}
          {(settings.companyPhone || settings.companyEmail) && (
            <Typography variant="caption" display="block">
              {settings.companyPhone && `טל: ${settings.companyPhone}`}
              {settings.companyPhone && settings.companyEmail && ' | '}
              {settings.companyEmail && `מייל: ${settings.companyEmail}`}
            </Typography>
          )}
        </Paper>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanySettings;
