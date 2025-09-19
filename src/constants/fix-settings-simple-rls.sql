-- ============================================================================
-- SIMPLE SETTINGS RLS FIX (No auth.users table access)
-- ============================================================================
-- The error "permission denied for table users" occurs because the RLS policy
-- is trying to access auth.users table which requires special permissions.
-- This script uses a simpler approach.
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

-- Option 1: Simple approach - Allow all authenticated users to manage settings
-- This is suitable for single-tenant applications where all authenticated users are "admins"
CREATE POLICY "authenticated_users_view_settings" ON public.settings
    FOR SELECT USING (is_authenticated());

CREATE POLICY "authenticated_users_manage_settings" ON public.settings
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

-- Option 2: More restrictive approach (uncomment if you want admin-only management)
-- This uses a function to check admin role without accessing auth.users table
-- CREATE OR REPLACE FUNCTION is_admin()
-- RETURNS boolean
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- BEGIN
--     -- Check if user has admin role in their JWT token
--     RETURN COALESCE(
--         (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin',
--         false
--     );
-- END;
-- $$;

-- CREATE POLICY "authenticated_users_view_settings" ON public.settings
--     FOR SELECT USING (is_authenticated());

-- CREATE POLICY "admin_users_manage_settings" ON public.settings
--     FOR ALL USING (is_admin()) WITH CHECK (is_admin());

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

-- Test the policies by checking if we can view settings
SELECT 
    'Settings Access Test' as info,
    COUNT(*) as settings_count
FROM public.settings;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This uses a simple approach that avoids accessing auth.users table:
-- 
-- Option 1 (Active): All authenticated users can view and manage settings
-- - Suitable for single-tenant applications
-- - No complex role checking
-- - Avoids permission issues with auth.users table
-- 
-- Option 2 (Commented): Admin-only management using JWT token
-- - Uses auth.jwt() to check user metadata
-- - More secure but requires proper JWT setup
-- - Uncomment if you need admin-only access
-- 
-- Both options avoid the "permission denied for table users" error.
-- ============================================================================
