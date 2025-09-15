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
import { useCompany } from '@/context/CompanyContext';

interface CompanySettingsFormData {
  companyName: string;
  companyDescription: string;
  companyTagline: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  invoiceFooter: string;
  companyLogo: string;
  taxRate: number;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UseCompanySettingsResult {
  // Data
  settings: CompanySettingsFormData;
  loading: boolean;
  saving: boolean;
  snackbar: SnackbarState;
  
  // Actions
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  handleChange: (field: keyof CompanySettingsFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleLogoDelete: () => void;
  closeSnackbar: () => void;
}

// Client-side API functions for company settings
const getCompanySettings = async (): Promise<CompanySettingsFormData | null> => {
  const response = await fetch('/api/settings');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch company settings: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch company settings');
  }
  
  // Transform API response to form data structure
  const apiData = data.data;
  return {
    companyName: apiData.company_name || '',
    companyDescription: apiData.company_description || '',
    companyTagline: apiData.company_tagline || '',
    companyAddress: apiData.address || '',
    companyPhone: apiData.contact_phone || '',
    companyEmail: apiData.contact_email || '',
    invoiceFooter: apiData.invoice_footer || '',
    companyLogo: apiData.logo_url || '',
    taxRate: apiData.tax_rate || 17
  };
};

const saveCompanySettings = async (settings: CompanySettingsFormData): Promise<void> => {
  // Transform form data to API structure
  const apiData = {
    company_name: settings.companyName,
    company_description: settings.companyDescription,
    company_tagline: settings.companyTagline,
    address: settings.companyAddress,
    contact_phone: settings.companyPhone,
    contact_email: settings.companyEmail,
    invoice_footer: settings.invoiceFooter,
    logo_url: settings.companyLogo,
    tax_rate: settings.taxRate
  };

  const response = await fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    throw new Error(`Failed to save company settings: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to save company settings');
  }
};

const useCompanySettings = (): UseCompanySettingsResult => {
  const { refreshSettings } = useCompany();
  
  // ===== FORM STATE =====
  const [settings, setSettings] = useState<CompanySettingsFormData>({
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
  const [snackbar, setSnackbar] = useState<SnackbarState>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

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
  const handleChange = (field: keyof CompanySettingsFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'taxRate' ? parseFloat(event.target.value) || 0 : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
          companyLogo: e.target?.result as string || ''
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
