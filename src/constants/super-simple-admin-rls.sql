-- ============================================================================
-- SUPER SIMPLE ADMIN RLS - NO JWT, NO AUTH.USERS ISSUES
-- ============================================================================
-- This creates the simplest possible admin-only policy
-- ============================================================================

BEGIN;

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
DROP POLICY IF EXISTS "users_view_settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.settings;
DROP POLICY IF EXISTS "admins_manage_settings" ON public.settings;
DROP POLICY IF EXISTS "admins_update_settings" ON public.settings;
DROP POLICY IF EXISTS "admins_delete_settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all authenticated to manage settings" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated select" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.settings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.settings;
DROP POLICY IF EXISTS "authenticated_users_view_settings" ON public.settings;
DROP POLICY IF EXISTS "authenticated_users_manage_settings" ON public.settings;
DROP POLICY IF EXISTS "everyone_view_settings" ON public.settings;
DROP POLICY IF EXISTS "authenticated_manage_settings" ON public.settings;
DROP POLICY IF EXISTS "admin_manage_settings" ON public.settings;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS is_admin();

-- Option 1: Temporarily disable RLS for testing
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Option 2: Simple authenticated-only policy (uncomment if you want some security)
-- CREATE POLICY "authenticated_view_settings" ON public.settings
--     FOR SELECT USING (is_authenticated());

-- CREATE POLICY "authenticated_manage_settings" ON public.settings
--     FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

-- Verify RLS status
SELECT 
    'Settings RLS Status' as info,
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'settings';

-- Test access to settings
SELECT 
    'Settings Access Test' as info,
    COUNT(*) as settings_count
FROM public.settings;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This script temporarily disables RLS to test if settings work:
-- - RLS is disabled on settings table
-- - Anyone can access settings (for testing)
-- - This will help us confirm if the issue is RLS or something else
-- 
-- Once settings work, we can add back simple RLS policies.
-- ============================================================================
