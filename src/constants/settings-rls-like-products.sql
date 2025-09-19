-- ============================================================================
-- SETTINGS RLS LIKE PRODUCTS TABLE
-- ============================================================================
-- This follows the exact same RLS pattern as the products table
-- ============================================================================

BEGIN;

-- Drop all existing settings policies
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

-- Drop any functions and dependent objects
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Create policies exactly like products table
-- Policy 1: Anyone can view settings (like products)
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
CREATE POLICY "Anyone can view settings" ON public.settings
    FOR SELECT USING (true);

-- Policy 2: Admins can manage settings (like products)
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Verify the policies are created
SELECT 
    'Settings RLS Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'settings' 
ORDER BY policyname;

-- Test access to settings
SELECT 
    'Settings Access Test' as info,
    COUNT(*) as settings_count
FROM public.settings;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This follows the EXACT same pattern as products table:
-- 1. "Anyone can view settings" - FOR SELECT USING (true)
-- 2. "Admins can manage settings" - Uses public.users table with role check
-- 
-- If this doesn't work, then the issue is with the public.users table
-- or the user's role not being set to 'admin' in the users table.
-- ============================================================================
