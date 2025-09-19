-- ============================================================================
-- DISABLE SETTINGS RLS (TEMPORARY)
-- ============================================================================
-- This script temporarily disables RLS on the settings table for testing
-- WARNING: This makes the settings table accessible to all users
-- ============================================================================

BEGIN;

-- Disable RLS on settings table
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'settings';

COMMIT;

-- To re-enable RLS later, run:
-- ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
