-- ============================================================================
-- ADMIN-ONLY SETTINGS RLS - WORKS WITHOUT AUTH.USERS PERMISSION ISSUES
-- ============================================================================
-- This creates admin-only policies using JWT token instead of auth.users table
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

-- Create a function to check if user is admin using JWT token
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user has admin role in their JWT token metadata
    -- auth.jwt() returns jsonb, so we need to cast properly
    RETURN COALESCE(
        ((auth.jwt()::jsonb ->> 'user_metadata')::jsonb ->> 'role') = 'admin',
        false
    );
END;
$$;

-- Policy 1: Everyone can view settings (including non-authenticated users)
CREATE POLICY "everyone_view_settings" ON public.settings
    FOR SELECT USING (true);

-- Policy 2: Only admins can create/update/delete settings
CREATE POLICY "admin_manage_settings" ON public.settings
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

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

-- Test the admin function
SELECT 
    'Admin Function Test' as info,
    is_admin() as is_current_user_admin,
    auth.uid() as current_user_id,
    auth.jwt() ->> 'user_metadata' as user_metadata;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This creates admin-only management using JWT token:
-- - Everyone can view settings
-- - Only users with role='admin' in JWT user_metadata can manage
-- - Uses auth.jwt() instead of auth.users table (no permission issues)
-- - Requires your user to have role='admin' in their JWT token metadata
-- 
-- To set admin role in Supabase:
-- 1. Go to Authentication > Users
-- 2. Find your user
-- 3. Edit user metadata: {"role": "admin"}
-- ============================================================================
