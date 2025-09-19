-- ============================================================================
-- ENSURE SETTINGS RECORD EXISTS
-- ============================================================================
-- This file ensures there's at least one settings record with ID '1'
-- ============================================================================

-- Check if settings record exists
SELECT COUNT(*) as settings_count FROM public.settings;

-- Insert default settings record if none exists
INSERT INTO public.settings (
  id,
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
  invoice_footer_text,
  free_shipping_threshold,
  standard_shipping_cost,
  express_shipping_cost,
  enable_local_delivery,
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
  '1', -- Fixed ID for the application
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
  'תודה על הקנייה!',
  0.00,
  0.00,
  0.00,
  true,
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
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  updated_at = now();

-- Verify the record exists
SELECT id, company_name, company_email, updated_at 
FROM public.settings 
WHERE id = '1';
