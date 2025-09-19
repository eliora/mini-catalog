-- ============================================================================
-- SETTINGS TABLE UPDATE MIGRATION
-- ============================================================================
-- This file contains SQL commands to update the settings table structure
-- based on the comprehensive field definitions in settings-schema.js
-- ============================================================================

-- First, let's check if the settings table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);

-- Add all the settings fields if they don't exist
-- Company Information Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_name character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_description text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_email character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_phone character varying(50);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS business_name character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_number character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_id character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tagline character varying(255);

-- Logo and Branding Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_logo character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_url character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS primary_color character varying(7) DEFAULT '#1976d2';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS secondary_color character varying(7) DEFAULT '#dc004e';

-- Regional Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS timezone character varying(50) DEFAULT 'Asia/Jerusalem';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency character varying(3) DEFAULT 'ILS';

-- Tax Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_vat_registered boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_rate numeric(5,4) DEFAULT 0.18;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS prices_include_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS show_prices_with_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_tax_exempt boolean DEFAULT false;

-- Shipping Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS standard_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS express_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_local_delivery boolean DEFAULT true;

-- Invoice Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS invoice_footer_text text;

-- Notification Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"categories": {"orders": {"sms": false, "push": true, "email": true, "inApp": true}, "system": {"sms": false, "push": true, "email": true, "inApp": true}, "customers": {"sms": false, "push": false, "email": false, "inApp": true}, "inventory": {"sms": false, "push": false, "email": true, "inApp": true}}}';

-- System Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS maintenance_mode boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS debug_mode boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_reviews boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_wishlist boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_notifications boolean DEFAULT true;

-- Security Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS session_timeout integer DEFAULT 3600;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS max_login_attempts integer DEFAULT 5;

-- Performance Settings Fields
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS backup_frequency character varying(20) DEFAULT 'daily';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS cache_duration integer DEFAULT 300;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_settings_company_name ON public.settings USING btree (company_name);
CREATE INDEX IF NOT EXISTS idx_settings_currency ON public.settings USING btree (currency);
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON public.settings USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON public.settings USING btree (updated_at);
CREATE INDEX IF NOT EXISTS idx_settings_notification_settings ON public.settings USING gin (notification_settings);

-- Add constraints (drop first if they exist)
ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_primary_color;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_primary_color CHECK ((primary_color)::text ~ '^#[0-9A-Fa-f]{6}$'::text);

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_secondary_color;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_secondary_color CHECK ((secondary_color)::text ~ '^#[0-9A-Fa-f]{6}$'::text);

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_currency;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_currency CHECK (((currency)::text ~ '^[A-Z]{3}$'::text));

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_shipping_costs;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_shipping_costs CHECK (
  (free_shipping_threshold >= (0)::numeric) AND 
  (standard_shipping_cost >= (0)::numeric) AND 
  (express_shipping_cost >= (0)::numeric)
);

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_tax_rate;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_tax_rate CHECK (
  (tax_rate >= (0)::numeric) AND 
  (tax_rate <= (1)::numeric)
);

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_session_timeout;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_session_timeout CHECK ((session_timeout >= 300));

ALTER TABLE public.settings DROP CONSTRAINT IF EXISTS chk_settings_max_login_attempts;
ALTER TABLE public.settings ADD CONSTRAINT chk_settings_max_login_attempts CHECK (
  (max_login_attempts > 0) AND 
  (max_login_attempts <= 20)
);

-- Create triggers for audit and updated_at
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger function
CREATE OR REPLACE FUNCTION log_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log settings changes to audit table (if it exists)
  -- This is a placeholder - implement actual audit logging as needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS trigger_update_settings_updated_at ON public.settings;
CREATE TRIGGER trigger_update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Create audit trigger
DROP TRIGGER IF EXISTS settings_audit_trigger ON public.settings;
CREATE TRIGGER settings_audit_trigger
  AFTER INSERT OR UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION log_settings_changes();

-- Insert default settings record if none exists
INSERT INTO public.settings (
  company_name,
  company_description,
  company_email,
  company_phone,
  company_address,
  business_name,
  registration_number,
  tax_id,
  tagline,
  company_logo,
  logo_url,
  primary_color,
  secondary_color,
  timezone,
  currency,
  is_vat_registered,
  tax_rate,
  prices_include_tax,
  show_prices_with_tax,
  enable_tax_exempt,
  free_shipping_threshold,
  standard_shipping_cost,
  express_shipping_cost,
  enable_local_delivery,
  invoice_footer_text,
  notification_settings,
  maintenance_mode,
  debug_mode,
  enable_reviews,
  enable_wishlist,
  enable_notifications,
  session_timeout,
  max_login_attempts,
  backup_frequency,
  cache_duration
) VALUES (
  'חברת דוגמה',
  'תיאור החברה',
  'info@example.com',
  '050-1234567',
  'כתובת החברה',
  'שם העסק',
  '123456789',
  '987654321',
  'הסלוגן שלנו',
  '',
  '',
  '#1976d2',
  '#dc004e',
  'Asia/Jerusalem',
  'ILS',
  true,
  0.18,
  true,
  true,
  false,
  0.00,
  0.00,
  0.00,
  true,
  'תודה על הקנייה!',
  '{"categories": {"orders": {"sms": false, "push": true, "email": true, "inApp": true}, "system": {"sms": false, "push": true, "email": true, "inApp": true}, "customers": {"sms": false, "push": false, "email": false, "inApp": true}, "inventory": {"sms": false, "push": false, "email": true, "inApp": true}}}',
  false,
  false,
  true,
  true,
  true,
  3600,
  5,
  'daily',
  300
) ON CONFLICT (id) DO NOTHING;

-- Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current settings
SELECT * FROM public.settings LIMIT 1;

COMMIT;
