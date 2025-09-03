-- Fix Row Level Security (RLS) Policies for CSV Import
-- Run this in Supabase SQL Editor to fix the RLS policy issues

-- First, check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'products';

-- Drop existing restrictive policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable all access for service role on products" ON public.products;

-- Create new permissive policies for the CSV import to work
CREATE POLICY "Allow all operations for authenticated users" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for anon users" ON public.products
    FOR ALL USING (auth.role() = 'anon');

CREATE POLICY "Allow all operations for service role" ON public.products
    FOR ALL USING (auth.role() = 'service_role');

-- Alternative: If you want to disable RLS temporarily for testing
-- (WARNING: This makes the table publicly accessible - use only for testing!)
-- ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;

-- Check if orders table has the same issue
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';

-- Fix orders table policies too
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for service role on orders" ON public.orders;

CREATE POLICY "Allow all operations for authenticated users on orders" ON public.orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for anon users on orders" ON public.orders
    FOR ALL USING (auth.role() = 'anon');

CREATE POLICY "Allow all operations for service role on orders" ON public.orders
    FOR ALL USING (auth.role() = 'service_role');

-- Verify the policies were created
SELECT 'Products table policies:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'products';

SELECT 'Orders table policies:' as info;
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'orders';
