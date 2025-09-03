-- Comprehensive Orders Table Fix
-- This script ensures the orders table is properly configured
-- Run this in Supabase SQL Editor

-- Step 1: Check current database schema
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'orders' AND schemaname = 'public';

-- Step 2: If table exists, check its columns
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 3: Drop and recreate the table with correct schema
DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);

-- Step 5: Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for different access levels
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all operations for anon users on orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all operations for service role on orders" ON public.orders;

-- Allow anyone to insert orders (for customers)
CREATE POLICY "Allow insert for all users" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read their own orders (if we add user_id later)
CREATE POLICY "Allow read for authenticated users" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access (for admin)
CREATE POLICY "Allow all for service role" ON public.orders
    FOR ALL USING (auth.role() = 'service_role');

-- Step 7: Verify the setup
SELECT 'Orders table recreated successfully' as status;

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'orders';
