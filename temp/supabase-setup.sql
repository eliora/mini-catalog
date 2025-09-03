-- Supabase Database Setup SQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref TEXT UNIQUE NOT NULL,
    productName TEXT,
    productName2 TEXT,
    line TEXT,
    notice TEXT,
    size TEXT,
    unitPrice DECIMAL(10,2),
    productType TEXT,
    mainPic TEXT,
    pics JSONB,
    description TEXT,
    activeIngredients TEXT,
    usageInstructions TEXT,
    highlights JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customerName TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_ref ON products(ref);
CREATE INDEX IF NOT EXISTS idx_products_line ON products(line);
CREATE INDEX IF NOT EXISTS idx_products_productName ON products(productName);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- Create policies for orders (admin only)
CREATE POLICY "Enable all access for service role" ON orders
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for product management (admin only)
CREATE POLICY "Enable all access for service role on products" ON products
    FOR ALL USING (auth.role() = 'service_role');
