-- ============================================================================
-- FIX SETTINGS SCHEMA MISMATCH
-- ============================================================================
-- This file adds only the missing columns to match the constants/settings-schema.js
-- Based on comparison with the provided database schema
-- ============================================================================

-- Check what columns are missing by running this first:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'settings' AND table_schema = 'public' ORDER BY column_name;

-- Add only the columns that are actually missing
-- (Most columns already exist in your database)

-- These columns might be missing:
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS company_logo character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS logo_url character varying(500);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS primary_color character varying(7) DEFAULT '#1976d2';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS secondary_color character varying(7) DEFAULT '#dc004e';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS timezone character varying(50) DEFAULT 'Asia/Jerusalem';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS business_name character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS registration_number character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_id character varying(100);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tagline character varying(255);
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS is_vat_registered boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS currency character varying(3) DEFAULT 'ILS';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS tax_rate numeric(5,4) DEFAULT 0.18;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS prices_include_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS show_prices_with_tax boolean DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_tax_exempt boolean DEFAULT false;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS invoice_footer_text text;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS standard_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS express_shipping_cost numeric(10,2) DEFAULT 0.00;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS enable_local_delivery boolean DEFAULT true;
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

-- Verify the current schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
