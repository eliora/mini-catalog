-- ============================================================================
-- TEST SETTINGS SAVE FUNCTIONALITY
-- ============================================================================
-- This script helps debug why settings aren't saving
-- ============================================================================

-- Check current RLS status
SELECT 
    'RLS Status' as info,
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'settings';

-- Check current policies
SELECT 
    'Current Policies' as info,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'settings' 
ORDER BY policyname;

-- Check if settings table exists and has data
SELECT 
    'Settings Data' as info,
    COUNT(*) as total_records,
    MIN(id) as first_id,
    MAX(id) as last_id
FROM public.settings;

-- Check current user authentication
SELECT 
    'Current User' as info,
    auth.uid() as user_id,
    auth.role() as user_role;

-- Test if we can select from settings
SELECT 
    'Select Test' as info,
    id,
    company_name,
    company_email,
    company_phone
FROM public.settings 
LIMIT 1;

-- Test if we can update settings (this will show permission errors)
UPDATE public.settings 
SET updated_at = now() 
WHERE id = (SELECT id FROM public.settings LIMIT 1);

-- Check if update worked
SELECT 
    'Update Test' as info,
    id,
    updated_at
FROM public.settings 
LIMIT 1;
