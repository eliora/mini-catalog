/**
 * Settings Management Service Layer
 */

export interface CompanySettings {
  id?: number;
  company_name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: any;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  tax_rate?: number;
  currency?: string;
  timezone?: string;
  enable_reviews?: boolean;
  enable_wishlist?: boolean;
  enable_notifications?: boolean;
  maintenance_mode?: boolean;
  debug_mode?: boolean;
}

export const DEFAULT_SETTINGS: CompanySettings = {
  company_name: 'Your Company',
  tagline: '',
  description: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Israel'
  },
  logo_url: null,
  primary_color: '#1976d2',
  secondary_color: '#dc004e',
  tax_rate: 18,
  currency: 'ILS',
  timezone: 'Asia/Jerusalem',
  enable_reviews: true,
  enable_wishlist: true,
  enable_notifications: true,
  maintenance_mode: false,
  debug_mode: false
};

export async function getSettings(supabase: any): Promise<CompanySettings> {
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return settings || DEFAULT_SETTINGS;
}

export async function updateSettings(supabase: any, settingsData: Partial<CompanySettings>): Promise<CompanySettings> {
  const { data: settings, error } = await supabase
    .from('settings')
    .upsert({
      id: '1', // Single settings record
      ...settingsData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return settings;
}

export function validateSettings(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.company_name || data.company_name.trim().length < 2) {
    errors.push('Company name must be at least 2 characters');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.tax_rate && (typeof data.tax_rate !== 'number' || data.tax_rate < 0 || data.tax_rate > 100)) {
    errors.push('Tax rate must be a number between 0 and 100');
  }

  if (data.primary_color && !/^#[0-9A-F]{6}$/i.test(data.primary_color)) {
    errors.push('Primary color must be a valid hex color');
  }

  if (data.secondary_color && !/^#[0-9A-F]{6}$/i.test(data.secondary_color)) {
    errors.push('Secondary color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
