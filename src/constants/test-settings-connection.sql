-- ============================================================================
-- TEST SETTINGS CONNECTION AND FIELD MAPPING
-- ============================================================================
-- Run this to test if the settings table is working correctly
-- ============================================================================

-- Test 1: Check if settings table exists and has data
SELECT COUNT(*) as total_settings FROM public.settings;

-- Test 2: Check all available columns
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'settings' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 3: Try to insert a test record (will fail if constraints are violated)
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
  'Test Company',
  'Test Description',
  'test@example.com',
  '050-1234567',
  'Test Address',
  'Test Business',
  '123456789',
  '987654321',
  'Test Tagline',
  'https://example.com/logo.png',
  'https://example.com/logo.png',
  '#1976d2',
  '#dc004e',
  'Asia/Jerusalem',
  'ILS',
  true,
  0.18,
  true,
  true,
  false,
  'Test Footer',
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

-- Test 4: Try to update the record
UPDATE public.settings 
SET 
  company_name = 'Updated Test Company',
  company_email = 'updated@example.com',
  updated_at = now()
WHERE company_name = 'Test Company';

-- Test 5: Check if the update worked
SELECT company_name, company_email, updated_at 
FROM public.settings 
WHERE company_name = 'Updated Test Company';

-- Test 6: Clean up test data
DELETE FROM public.settings WHERE company_name = 'Updated Test Company';
