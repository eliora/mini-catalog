-- ============================================================================
-- SIMPLE SETTINGS RLS - MINIMAL APPROACH
-- ============================================================================
-- Simple, working RLS policies for the settings table
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

-- Policy 1: Everyone can view settings (including non-authenticated users)
CREATE POLICY "everyone_view_settings" ON public.settings
    FOR SELECT USING (true);

-- Policy 2: Only admins can create/update/delete settings
-- Using a simple approach that checks if user exists in auth.users with admin role
CREATE POLICY "admins_manage_settings" ON public.settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "admins_update_settings" ON public.settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "admins_delete_settings" ON public.settings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Verify the policy is created
SELECT 
    'Settings RLS Policy' as info,
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
-- Simple RLS policies for settings:
-- - Policy 1: Everyone can view settings (including non-authenticated users)
-- - Policy 2: Only admins can create/update/delete settings
-- - Uses auth.users table to check admin role
-- - Minimal complexity while maintaining security
-- ============================================================================
