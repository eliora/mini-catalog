/**
 * useCompanySettings Hook - Company settings management
 * 
 * Custom hook for managing company settings data and operations.
 * Handles loading, saving, logo upload, and form state management.
 * 
 * Features:
 * - Settings loading from API
 * - Form state management
 * - Logo upload handling
 * - Save operations with validation
 * - Error handling and notifications
 * 
 * Returns:
 * - Settings data and form state
 * - Actions: save, load, upload logo, delete logo
 * - UI state: loading, saving, snackbar
 */

import { useState, useEffect } from 'react';
import { getCompanySettings, saveCompanySettings } from '../api/settings';
import { useCompany } from '../context/CompanyContext';

const useCompanySettings = () => {
  const { refreshSettings } = useCompany();
  
  // ===== FORM STATE =====
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
  
  // ===== UI STATE =====
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ===== LOAD SETTINGS =====
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getCompanySettings();
      if (data) {
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בטעינת הגדרות החברה',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== SAVE SETTINGS =====
  const saveSettings = async () => {
    try {
      setSaving(true);
      await saveCompanySettings(settings);
      
      // Refresh global company context
      await refreshSettings();
      
      setSnackbar({
        open: true,
        message: 'הגדרות נשמרו בהצלחה',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving company settings:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בשמירת הגדרות',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  // ===== FORM HANDLERS =====
  const handleChange = (field) => (event) => {
    setSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbar({
          open: true,
          message: 'גודל הקובץ חייב להיות פחות מ-5MB',
          severity: 'error'
        });
        return;
      }

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

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // ===== LOAD ON MOUNT =====
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    // Data
    settings,
    loading,
    saving,
    snackbar,
    
    // Actions
    saveSettings,
    loadSettings,
    handleChange,
    handleLogoUpload,
    handleLogoDelete,
    closeSnackbar
  };
};

export default useCompanySettings;
