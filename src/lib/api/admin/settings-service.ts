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
  address?: string | null;
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
  address: null,
  logo_url: undefined,
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

export async function getSettings(supabase: any): Promise<CompanySettings> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data: settings, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return settings || DEFAULT_SETTINGS;
}

export async function updateSettings(supabase: any, settingsData: Partial<CompanySettings>): Promise<CompanySettings> { // eslint-disable-line @typescript-eslint/no-explicit-any
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

export function validateSettings(data: Record<string, unknown>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.company_name || String(data.company_name).trim().length < 2) {
    errors.push('Company name must be at least 2 characters');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
    errors.push('Invalid email format');
  }

  if (data.tax_rate && (typeof data.tax_rate !== 'number' || data.tax_rate < 0 || data.tax_rate > 100)) {
    errors.push('Tax rate must be a number between 0 and 100');
  }

  if (data.primary_color && !/^#[0-9A-F]{6}$/i.test(String(data.primary_color))) {
    errors.push('Primary color must be a valid hex color');
  }

  if (data.secondary_color && !/^#[0-9A-F]{6}$/i.test(String(data.secondary_color))) {
    errors.push('Secondary color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
