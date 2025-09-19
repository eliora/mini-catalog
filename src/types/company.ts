import { Database } from './supabase';

// Supabase generated types for company settings (fallback if table doesn't exist)
export type CompanySettingsRow = Database['public']['Tables'] extends { company_settings: { Row: unknown } }
  ? Database['public']['Tables']['company_settings']['Row']
  : {
      id: string;
      company_name: string;
      company_description?: string;
      contact_email?: string;
      contact_phone?: string;
      address?: string;
      website?: string;
      logo_url?: string;
      tax_rate?: number;
      created_at: string;
      updated_at: string;
    };

export type CompanySettingsInsert = Database['public']['Tables'] extends { company_settings: { Insert: unknown } }
  ? Database['public']['Tables']['company_settings']['Insert']
  : Partial<CompanySettingsRow>;

export type CompanySettingsUpdate = Database['public']['Tables'] extends { company_settings: { Update: unknown } }
  ? Database['public']['Tables']['company_settings']['Update']
  : Partial<CompanySettingsRow>;

// Application-specific Company interfaces
export interface CompanySettings extends CompanySettingsRow {
  // Add any computed fields here
  logoUrl?: string;
  formattedAddress?: string;
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'email' | 'website';
  url: string;
  label: string;
  icon?: string;
}

export interface CompanyState {
  settings: CompanySettings | null;
  isLoading: boolean;
  error?: string;
  lastUpdated?: Date;
  // Actions
  updateSettings: (updates: Partial<CompanySettingsUpdate>) => Promise<{ error?: string }>;
  refreshSettings: () => Promise<void>;
  // Utilities
  getSetting: <K extends keyof CompanySettings>(key: K) => CompanySettings[K] | undefined;
  getDisplayName: () => string;
  getContactInfo: () => ContactInfo;
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface CompanyFormData {
  company_name?: string;
  company_description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  // Invoice settings
  invoice_prefix?: string;
  tax_rate?: number;
  payment_terms?: string;
  bank_details?: string;
  // Display settings
  primary_color?: string;
  secondary_color?: string;
  show_prices?: boolean;
  allow_orders?: boolean;
}

export interface InvoiceSettings {
  prefix: string;
  nextNumber: number;
  taxRate: number;
  paymentTerms: string;
  bankDetails: string;
  footerText?: string;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
  breakStart?: string;
  breakEnd?: string;
}

export interface CompanyResponse<T = CompanySettings> {
  data?: T;
  error?: string;
  success: boolean;
}
