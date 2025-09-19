-- ============================================================================
-- FIX SETTINGS RLS POLICIES
-- ============================================================================
-- This script fixes the Row Level Security policies for the settings table
-- to allow authenticated users to manage settings properly
-- ============================================================================

BEGIN;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

-- Create new policies that are more permissive for authenticated users
-- Policy 1: Allow authenticated users to view settings
CREATE POLICY "Authenticated users can view settings" ON public.settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy 2: Allow authenticated users to insert settings (for initial setup)
CREATE POLICY "Authenticated users can insert settings" ON public.settings
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy 3: Allow authenticated users to update settings
CREATE POLICY "Authenticated users can update settings" ON public.settings
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Policy 4: Allow authenticated users to delete settings (if needed)
CREATE POLICY "Authenticated users can delete settings" ON public.settings
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Alternative: If you want to restrict to admin users only, use these policies instead:
-- (Comment out the above policies and uncomment these)

/*
-- Drop the permissive policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can insert settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON public.settings;
DROP POLICY IF EXISTS "Authenticated users can delete settings" ON public.settings;

-- Create admin-only policies
CREATE POLICY "Admins can view settings" ON public.settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert settings" ON public.settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update settings" ON public.settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete settings" ON public.settings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
*/

-- Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'settings' 
ORDER BY policyname;

COMMIT;
