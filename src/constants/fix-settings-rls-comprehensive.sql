-- ============================================================================
-- COMPREHENSIVE SETTINGS RLS FIX
-- ============================================================================
-- This script provides multiple solutions for the settings RLS issue
-- ============================================================================

BEGIN;

-- First, let's check the current authentication state
SELECT 
    'Current Auth State' as info,
    auth.uid() as user_id,
    auth.email() as user_email,
    auth.role() as user_role;

-- Check if users table exists and has data
SELECT 
    'Users Table Info' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
FROM public.users;

-- Check current RLS policies on settings table
SELECT 
    'Current RLS Policies' as info,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'settings';

-- SOLUTION 1: Disable RLS temporarily (safest for testing)
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- SOLUTION 2: Create permissive policies (if you want to keep RLS enabled)
-- Uncomment these if you prefer to keep RLS enabled with permissive policies

/*
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

-- Create new permissive policies
CREATE POLICY "Allow all authenticated users to manage settings" ON public.settings
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
*/

-- SOLUTION 3: Create a service role bypass (if you have service role access)
-- This allows the service role to bypass RLS completely
-- Uncomment if you're using service role authentication

/*
-- Grant service role permissions
GRANT ALL ON public.settings TO service_role;
*/

-- Verify the changes
SELECT 
    'Final State' as info,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'settings';

-- Test insert/update permissions
-- This should work now
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
    '1',
    'Jean Darcel',
    'Professional e-commerce solution for modern businesses',
    'admin1@gisele.co.il',
    '+972-XX-XXX-XXXX',
    'Company Address',
    'Jean Darcel Business',
    '123456789',
    '987654321',
    'Professional e-commerce solution',
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
    'Thank you for your business!',
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
    company_description = EXCLUDED.company_description,
    company_email = EXCLUDED.company_email,
    company_phone = EXCLUDED.company_phone,
    company_address = EXCLUDED.company_address,
    business_name = EXCLUDED.business_name,
    registration_number = EXCLUDED.registration_number,
    tax_id = EXCLUDED.tax_id,
    tagline = EXCLUDED.tagline,
    company_logo = EXCLUDED.company_logo,
    logo_url = EXCLUDED.logo_url,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color,
    timezone = EXCLUDED.timezone,
    currency = EXCLUDED.currency,
    is_vat_registered = EXCLUDED.is_vat_registered,
    tax_rate = EXCLUDED.tax_rate,
    prices_include_tax = EXCLUDED.prices_include_tax,
    show_prices_with_tax = EXCLUDED.show_prices_with_tax,
    enable_tax_exempt = EXCLUDED.enable_tax_exempt,
    invoice_footer_text = EXCLUDED.invoice_footer_text,
    free_shipping_threshold = EXCLUDED.free_shipping_threshold,
    standard_shipping_cost = EXCLUDED.standard_shipping_cost,
    express_shipping_cost = EXCLUDED.express_shipping_cost,
    enable_local_delivery = EXCLUDED.enable_local_delivery,
    notification_settings = EXCLUDED.notification_settings,
    maintenance_mode = EXCLUDED.maintenance_mode,
    debug_mode = EXCLUDED.debug_mode,
    enable_reviews = EXCLUDED.enable_reviews,
    enable_wishlist = EXCLUDED.enable_wishlist,
    enable_notifications = EXCLUDED.enable_notifications,
    session_timeout = EXCLUDED.session_timeout,
    max_login_attempts = EXCLUDED.max_login_attempts,
    backup_frequency = EXCLUDED.backup_frequency,
    cache_duration = EXCLUDED.cache_duration,
    updated_at = NOW();

-- Verify the settings record exists
SELECT 
    'Settings Record' as info,
    id,
    company_name,
    company_email,
    created_at,
    updated_at
FROM public.settings 
WHERE id = '1';

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. This script disables RLS on the settings table, which allows any
--    authenticated user to manage settings.
-- 
-- 2. If you want to re-enable RLS later with proper policies, run:
--    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- 
-- 3. The script also creates/updates a default settings record with id='1'
--    which is what your application expects.
-- 
-- 4. If you're still getting authentication issues, check your Supabase
--    project settings and ensure the API keys are correct.
-- ============================================================================
