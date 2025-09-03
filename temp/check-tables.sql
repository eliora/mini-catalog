-- Check if tables exist and create them if needed
-- Run this in Supabase SQL Editor to verify your database setup

-- Check products table
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'products';

-- Check orders table
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'orders';

-- If tables don't exist, run the full setup script below:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table matching your CSV headers EXACTLY
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ref no" TEXT UNIQUE,
    hebrew_name TEXT,
    short_description_he TEXT,
    description_he TEXT,
    skin_type_he TEXT,
    "Anwendung_he" TEXT,
    "WirkungInhaltsstoffe_he" TEXT,
    "Product Name" TEXT,
    "Product Name2" TEXT,
    "Size" TEXT,
    pic TEXT,
    all_pics TEXT,
    unit_price DECIMAL(10,2) DEFAULT 0,
    product_type TEXT DEFAULT 'Product',
    line TEXT,
    notice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Enable read access for all users') THEN
        CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Enable insert access for all users') THEN
        CREATE POLICY "Enable insert access for all users" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;
END
$$;
