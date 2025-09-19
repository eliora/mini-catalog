
// Direct CompanySettings interface based on actual database schema
export interface CompanySettings {
  id: string;
  company_name: string | null;
  company_description: string | null;
  company_email: string | null;
  company_phone: string | null;
  company_address: string | null;
  company_logo: string | null;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  timezone: string | null;
  business_name: string | null;
  registration_number: string | null;
  tax_id: string | null;
  is_vat_registered: boolean | null;
  currency: string | null;
  tax_rate: number | null;
  prices_include_tax: boolean | null;
  show_prices_with_tax: boolean | null;
  enable_tax_exempt: boolean | null;
  invoice_footer_text: string | null;
  free_shipping_threshold: number | null;
  standard_shipping_cost: number | null;
  express_shipping_cost: number | null;
  enable_local_delivery: boolean | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notification_settings: any | null;
  maintenance_mode: boolean | null;
  debug_mode: boolean | null;
  enable_reviews: boolean | null;
  enable_wishlist: boolean | null;
  enable_notifications: boolean | null;
  session_timeout: number | null;
  max_login_attempts: number | null;
  backup_frequency: string | null;
  cache_duration: number | null;
  created_at: string | null;
  updated_at: string | null;
  // Legacy field mappings for backward compatibility
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
  formattedAddress?: string;
  socialLinks?: SocialLink[];
}

export type CompanySettingsInsert = Partial<CompanySettings>;
export type CompanySettingsUpdate = Partial<CompanySettings>;

// Application-specific Company interfaces

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
  updateSettings: (updates: Partial<CompanySettings>) => Promise<{ error?: string }>;
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
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  business_name?: string;
  registration_number?: string;
  tax_id?: string;
  tagline?: string;
  company_logo?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  timezone?: string;
  currency?: string;
  is_vat_registered?: boolean;
  tax_rate?: number;
  prices_include_tax?: boolean;
  show_prices_with_tax?: boolean;
  enable_tax_exempt?: boolean;
  free_shipping_threshold?: number;
  standard_shipping_cost?: number;
  express_shipping_cost?: number;
  enable_local_delivery?: boolean;
  invoice_footer_text?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notification_settings?: any;
  maintenance_mode?: boolean;
  debug_mode?: boolean;
  enable_reviews?: boolean;
  enable_wishlist?: boolean;
  enable_notifications?: boolean;
  session_timeout?: number;
  max_login_attempts?: number;
  backup_frequency?: string;
  cache_duration?: number;
  // Legacy fields for backward compatibility
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  // Invoice settings
  invoice_prefix?: string;
  payment_terms?: string;
  bank_details?: string;
  // Display settings
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
