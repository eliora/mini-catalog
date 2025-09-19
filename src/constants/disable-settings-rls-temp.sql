-- ============================================================================
-- TEMPORARILY DISABLE SETTINGS RLS FOR TESTING
-- ============================================================================
-- This script temporarily disables RLS on the settings table to test if
-- the settings functionality works without RLS restrictions.
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

-- Temporarily disable RLS on settings table
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
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
-- This script:
-- 1. Removes all RLS policies from the settings table
-- 2. Disables RLS entirely on the settings table
-- 3. Allows unrestricted access to settings for testing
-- 
-- WARNING: This makes the settings table accessible to all users (authenticated or not).
-- Use only for testing/debugging purposes.
-- 
-- To re-enable RLS later, run:
-- ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- 
-- Then apply appropriate policies.
-- ============================================================================
