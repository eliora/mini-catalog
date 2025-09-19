-- ============================================================================
-- FIX SETTINGS RLS POLICIES (Following Prices Table Pattern)
-- ============================================================================
-- This script fixes the settings RLS policies to match the prices table pattern
-- ============================================================================

BEGIN;

-- Drop existing settings policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

-- Create new policies following the prices table pattern
-- Policy 1: Allow authenticated users to view settings (like prices)
CREATE POLICY "Authenticated users can view settings" ON public.settings
    FOR SELECT USING (is_authenticated());

-- Policy 2: Allow admins to manage settings (like prices)
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

-- Test the policies by checking if we can view settings
SELECT 
    'Settings Access Test' as info,
    COUNT(*) as settings_count
FROM public.settings;

COMMIT;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This follows the exact same pattern as the prices table:
-- 1. Authenticated users can VIEW settings (SELECT)
-- 2. Only admins can MANAGE settings (INSERT/UPDATE/DELETE)
-- 
-- The key difference from the original settings policies is that we now
-- have separate policies for SELECT vs other operations, just like prices.
-- ============================================================================
