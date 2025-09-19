-- ============================================================================
-- ULTRA SIMPLE SETTINGS RLS - NO AUTH.USERS TABLE ACCESS
-- ============================================================================
-- This avoids the "permission denied for table users" error by not accessing auth.users
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

-- Option 1: Everyone can view, authenticated users can manage
CREATE POLICY "everyone_view_settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "authenticated_manage_settings" ON public.settings
    FOR ALL USING (is_authenticated()) WITH CHECK (is_authenticated());

-- Option 2: If you want admin-only management, uncomment this and comment out Option 1
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

-- CREATE POLICY "everyone_view_settings" ON public.settings
--     FOR SELECT USING (true);

-- CREATE POLICY "admin_manage_settings" ON public.settings
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

-- Test access to settings
SELECT 
    'Settings Access Test' as info,
    COUNT(*) as settings_count
FROM public.settings;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- Option 1 (Active): Simple approach
-- - Everyone can view settings
-- - Any authenticated user can manage settings
-- - No auth.users table access = no permission errors
-- 
-- Option 2 (Commented): Admin-only management
-- - Uses auth.jwt() to check user metadata
-- - Requires proper JWT setup with role in user_metadata
-- - Uncomment if you need admin-only access
-- 
-- Both options avoid the "permission denied for table users" error.
-- ============================================================================
