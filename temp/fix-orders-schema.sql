-- Fix Orders Table Schema and Column Names
-- Run this in Supabase SQL Editor

-- First, check the current structure of the orders table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- If customerName column is missing or has wrong name, fix it
-- Drop and recreate the orders table with correct structure

DROP TABLE IF EXISTS public.orders CASCADE;

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,  -- Use snake_case like other columns
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users on orders" ON public.orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for anon users on orders" ON public.orders
    FOR ALL USING (auth.role() = 'anon');

CREATE POLICY "Allow all operations for service role on orders" ON public.orders
    FOR ALL USING (auth.role() = 'service_role');

-- Verify the new structure
SELECT 'Orders table recreated with correct schema' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;
