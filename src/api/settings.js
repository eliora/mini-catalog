import { supabase } from '../config/supabase';

// Helper function to add timeout to any promise
const withTimeout = (promise, timeoutMs = 8000, operation = 'Operation') => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`${operation} timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Default company settings
const DEFAULT_SETTINGS = {
  companyName: 'Jean Darcel',
  companyDescription: 'מערכת ניהול הזמנות',
  companyTagline: 'אתר מקצועי למוצרי יופי',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  invoiceFooter: 'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות',
  companyLogo: '',
  taxRate: 17 // Default VAT rate in Israel (17%)
};

/**
 * Get company settings
 */
export const getCompanySettings = async () => {
  try {
    // If env is missing, return defaults (no noisy console logs)
    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      return DEFAULT_SETTINGS;
    }

    const { data, error } = await withTimeout(
      supabase
        .from('settings')
        .select('*')
        .maybeSingle(),
      5000,
      'Load settings'
    );

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // If no settings exist, return defaults
    if (!data) {
      return DEFAULT_SETTINGS;
    }

    // Map database fields (snake_case) to React state (camelCase)
    return {
      companyName: data.company_name || DEFAULT_SETTINGS.companyName,
      companyDescription: data.company_description || DEFAULT_SETTINGS.companyDescription,
      companyTagline: DEFAULT_SETTINGS.companyTagline, // Not stored in DB
      companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
      companyPhone: data.company_phone || DEFAULT_SETTINGS.companyPhone,
      companyEmail: data.company_email || DEFAULT_SETTINGS.companyEmail,
      invoiceFooter: DEFAULT_SETTINGS.invoiceFooter, // Not stored in DB
      companyLogo: data.company_logo || DEFAULT_SETTINGS.companyLogo,
      taxRate: data.tax_rate || DEFAULT_SETTINGS.taxRate
    };
  } catch (error) {
    console.error('Error fetching company settings:', error);
    // Return defaults on error
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save company settings
 */
export const saveCompanySettings = async (settings) => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up environment variables.');
    }

    // First, try to get existing settings
    const { data: existing } = await withTimeout(
      supabase
        .from('settings')
        .select('id')
        .maybeSingle(),
      15000,
      'Check existing settings'
    );

    let result;
    
    if (existing) {
      // Update existing settings
      result = await withTimeout(
        supabase
          .from('settings')
          .update({
            company_name: settings.companyName,
            company_description: settings.companyDescription,
            company_address: settings.companyAddress,
            company_phone: settings.companyPhone,
            company_email: settings.companyEmail,
            company_logo: settings.companyLogo,
            tax_rate: settings.taxRate,
            currency: 'ILS', // Default currency
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single(),
        8000,
        'Update settings'
      );
    } else {
      // Insert new settings
      result = await withTimeout(
        supabase
          .from('settings')
          .insert({
            company_name: settings.companyName,
            company_description: settings.companyDescription,
            company_address: settings.companyAddress,
            company_phone: settings.companyPhone,
            company_email: settings.companyEmail,
            company_logo: settings.companyLogo,
            tax_rate: settings.taxRate,
            currency: 'ILS', // Default currency
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single(),
        8000,
        'Insert settings'
      );
    }

    if (result.error) {
      throw result.error;
    }

    return {
      companyName: result.data.company_name,
      companyDescription: result.data.company_description,
      companyTagline: settings.companyTagline, // Return what was sent (not stored in DB)
      companyAddress: result.data.company_address,
      companyPhone: result.data.company_phone,
      companyEmail: result.data.company_email,
      invoiceFooter: settings.invoiceFooter, // Return what was sent (not stored in DB)
      companyLogo: result.data.company_logo,
      taxRate: result.data.tax_rate
    };
  } catch (error) {
    console.error('Error saving company settings:', error);
    throw error;
  }
};

/**
 * Create company_settings table if it doesn't exist
 */
export const initializeCompanySettings = async () => {
  try {
    // Try to create the table (this will fail if it already exists, which is fine)
    const { error } = await supabase.rpc('create_company_settings_table');
    
    if (error && !error.message.includes('already exists')) {
      console.warn('Could not create company_settings table:', error);
    }
  } catch (error) {
    console.warn('Could not initialize company settings:', error);
  }
};
