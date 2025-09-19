-- ============================================================================
-- SAFE SETTINGS TABLE UPDATE
-- ============================================================================
-- Ultra-safe SQL commands to add columns to the settings table
-- No constraints, no triggers - just the essential columns
-- ============================================================================

-- Add missing columns (safe to run multiple times)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_name character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_description text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_email character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_phone character varying(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS business_name character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_number character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_id character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tagline character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_logo character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_url character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS primary_color character varying(7) DEFAULT '#1976d2';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS secondary_color character varying(7) DEFAULT '#dc004e';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS timezone character varying(50) DEFAULT 'Asia/Jerusalem';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency character varying(3) DEFAULT 'ILS';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_vat_registered boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_rate numeric(5,4) DEFAULT 0.18;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS prices_include_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS show_prices_with_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_tax_exempt boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS standard_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS express_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_local_delivery boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS invoice_footer_text text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"categories": {"orders": {"sms": false, "push": true, "email": true, "inApp": true}, "system": {"sms": false, "push": true, "email": true, "inApp": true}, "customers": {"sms": false, "push": false, "email": false, "inApp": true}, "inventory": {"sms": false, "push": false, "email": true, "inApp": true}}}';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS debug_mode boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_reviews boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_wishlist boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_notifications boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS session_timeout integer DEFAULT 3600;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS max_login_attempts integer DEFAULT 5;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS backup_frequency character varying(20) DEFAULT 'daily';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS cache_duration integer DEFAULT 300;

-- Create basic indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_company_name ON public.settings (company_name);
CREATE INDEX IF NOT EXISTS idx_settings_currency ON public.settings (currency);
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON public.settings (created_at);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings (updated_at);
CREATE INDEX IF NOT EXISTS idx_settings_notification_settings ON public.settings USING gin (notification_settings);

-- Insert default settings record if none exists
INSERT INTO public.settings (
  company_name, company_description, company_email, company_phone, company_address,
  business_name, registration_number, tax_id, tagline, company_logo, logo_url,
  primary_color, secondary_color, timezone, currency, is_vat_registered, tax_rate,
  prices_include_tax, show_prices_with_tax, enable_tax_exempt, free_shipping_threshold,
  standard_shipping_cost, express_shipping_cost, enable_local_delivery, invoice_footer_text,
  notification_settings, maintenance_mode, debug_mode, enable_reviews, enable_wishlist,
  enable_notifications, session_timeout, max_login_attempts, backup_frequency, cache_duration
) VALUES (
  'חברת דוגמה', 'תיאור החברה', 'info@example.com', '050-1234567', 'כתובת החברה',
  'שם העסק', '123456789', '987654321', 'הסלוגן שלנו', '', '',
  '#1976d2', '#dc004e', 'Asia/Jerusalem', 'ILS', true, 0.18,
  true, true, false, 0.00, 0.00, 0.00, true, 'תודה על הקנייה!',
  '{"categories": {"orders": {"sms": false, "push": true, "email": true, "inApp": true}, "system": {"sms": false, "push": true, "email": true, "inApp": true}, "customers": {"sms": false, "push": false, "email": false, "inApp": true}, "inventory": {"sms": false, "push": false, "email": true, "inApp": true}}}',
  false, false, true, true, true, 3600, 5, 'daily', 300
) ON CONFLICT (id) DO NOTHING;

-- Verify the columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
