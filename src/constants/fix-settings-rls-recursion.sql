-- ============================================================================
-- FIX SETTINGS RLS POLICY RECURSION
-- ============================================================================
-- The error "infinite recursion detected in policy for relation 'settings'"
-- occurs when RLS policies reference each other in a circular way.
-- ============================================================================

BEGIN;

-- Drop all existing settings policies to break the recursion
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

-- Create simple, non-recursive policies
-- Policy 1: Allow authenticated users to view settings
CREATE POLICY "users_view_settings" ON public.settings
    FOR SELECT USING (is_authenticated());

-- Policy 2: Allow only admins to manage settings (insert/update/delete)
-- We'll use a simple approach that checks if user exists in auth.users with admin role
-- This avoids recursion by not referencing the public.users table
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
-- This fixes the recursion by:
-- 1. Dropping all existing policies that might be causing circular references
-- 2. Creating separate policies for SELECT vs INSERT/UPDATE/DELETE operations
-- 3. Using auth.users table instead of public.users to avoid recursion
-- 4. Checking user role in raw_user_meta_data instead of a separate users table
-- 
-- Policy Structure:
-- - SELECT: Any authenticated user can view settings
-- - INSERT/UPDATE/DELETE: Only users with role='admin' in auth.users.raw_user_meta_data
-- 
-- This approach avoids recursion by not referencing the public.users table
-- and instead uses the built-in auth.users table with metadata.
-- ============================================================================
