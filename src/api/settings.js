import { supabase } from '../config/supabase';

// Default company settings
const DEFAULT_SETTINGS = {
  companyName: 'קטלוג מוצרים',
  companyDescription: 'מערכת ניהול הזמנות',
  companyTagline: 'אתר מקצועי למוצרי יופי',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  invoiceFooter: 'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות'
};

/**
 * Get company settings
 */
export const getCompanySettings = async () => {
  try {
    // Check if Supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, returning default settings');
      return DEFAULT_SETTINGS;
    }

    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .maybeSingle();

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
      companyTagline: data.company_tagline || DEFAULT_SETTINGS.companyTagline,
      companyAddress: data.company_address || DEFAULT_SETTINGS.companyAddress,
      companyPhone: data.company_phone || DEFAULT_SETTINGS.companyPhone,
      companyEmail: data.company_email || DEFAULT_SETTINGS.companyEmail,
      invoiceFooter: data.invoice_footer || DEFAULT_SETTINGS.invoiceFooter
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
    const { data: existing } = await supabase
      .from('company_settings')
      .select('id')
      .maybeSingle();

    let result;
    
    if (existing) {
      // Update existing settings
      result = await supabase
        .from('company_settings')
        .update({
          company_name: settings.companyName,
          company_description: settings.companyDescription,
          company_tagline: settings.companyTagline,
          company_address: settings.companyAddress,
          company_phone: settings.companyPhone,
          company_email: settings.companyEmail,
          invoice_footer: settings.invoiceFooter,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Insert new settings
      result = await supabase
        .from('company_settings')
        .insert({
          company_name: settings.companyName,
          company_description: settings.companyDescription,
          company_tagline: settings.companyTagline,
          company_address: settings.companyAddress,
          company_phone: settings.companyPhone,
          company_email: settings.companyEmail,
          invoice_footer: settings.invoiceFooter,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }

    if (result.error) {
      throw result.error;
    }

    return {
      companyName: result.data.company_name,
      companyDescription: result.data.company_description,
      companyTagline: result.data.company_tagline,
      companyAddress: result.data.company_address,
      companyPhone: result.data.company_phone,
      companyEmail: result.data.company_email,
      invoiceFooter: result.data.invoice_footer
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
