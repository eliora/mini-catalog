-- TEMPORARY: Disable RLS to test CSV import
-- WARNING: This makes tables publicly accessible - use only for testing!
-- Run this in Supabase SQL Editor

-- Disable RLS temporarily for testing
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename,
       CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables
WHERE tablename IN ('products', 'orders') AND schemaname = 'public';

-- After CSV import is working, run this to re-enable RLS:
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
