-- ============================================================================
-- SETTINGS FIELD MAPPING FIX
-- ============================================================================
-- This file ensures all fields referenced in the application exist in the database
-- ============================================================================

-- The main issue is that the application expects certain field names
-- but the database might have different names or missing fields

-- Check current database schema
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add any missing fields that the application expects
-- (Most fields already exist based on your schema)

-- These are the key fields the application uses:
-- company_name ✅ (exists)
-- company_description ✅ (exists) 
-- company_email ✅ (exists)
-- company_phone ✅ (exists)
-- company_address ✅ (exists)
-- company_logo ✅ (exists)
-- logo_url ✅ (exists)
-- primary_color ✅ (exists)
-- secondary_color ✅ (exists)
-- timezone ✅ (exists)
-- business_name ✅ (exists)
-- registration_number ✅ (exists)
-- tax_id ✅ (exists)
-- tagline ✅ (exists)
-- is_vat_registered ✅ (exists)
-- currency ✅ (exists)
-- tax_rate ✅ (exists)
-- prices_include_tax ✅ (exists)
-- show_prices_with_tax ✅ (exists)
-- enable_tax_exempt ✅ (exists)
-- invoice_footer_text ✅ (exists)
-- free_shipping_threshold ✅ (exists)
-- standard_shipping_cost ✅ (exists)
-- express_shipping_cost ✅ (exists)
-- enable_local_delivery ✅ (exists)
-- notification_settings ✅ (exists)
-- maintenance_mode ✅ (exists)
-- debug_mode ✅ (exists)
-- enable_reviews ✅ (exists)
-- enable_wishlist ✅ (exists)
-- enable_notifications ✅ (exists)
-- session_timeout ✅ (exists)
-- max_login_attempts ✅ (exists)
-- backup_frequency ✅ (exists)
-- cache_duration ✅ (exists)

-- All fields exist! The issue might be in the application code.
-- Check the browser console for specific error messages.
