-- ============================================================================
-- PRODUCTION DATABASE SCHEMA - Mini Catalog E-commerce
-- ============================================================================
-- Essential tables only - no sample data
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING VIEWS AND TABLES (if you need a clean recreation)
-- ============================================================================
-- Uncomment the following lines if you need to recreate everything from scratch
-- DROP VIEW IF EXISTS public.orders_with_clients CASCADE;
-- DROP TABLE IF EXISTS public.orders CASCADE;
-- DROP TABLE IF EXISTS public.prices CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TABLE IF EXISTS public.settings CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- USERS TABLE - Client/User Management (Already exists in your database)
-- ============================================================================
-- Note: This table already exists in your database with the structure:
-- id, email, role, full_name, created_at, updated_at, user_role
-- We'll use this existing table instead of creating a new profiles table

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    user_role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRODUCTS TABLE - Product Catalog
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ref VARCHAR(100) NOT NULL UNIQUE,
    hebrew_name VARCHAR(255),
    english_name VARCHAR(255),
    french_name VARCHAR(255),
    product_line VARCHAR(100),
    product_type VARCHAR(100),
    type VARCHAR(100),
    size VARCHAR(50),
    qty INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2),
    description TEXT,
    description_he TEXT,
    short_description_he TEXT,
    header VARCHAR(255),
    ingredients TEXT,
    active_ingredients_he TEXT,
    skin_type_he VARCHAR(255),
    usage_instructions_he TEXT,
    notice TEXT,
    main_pic VARCHAR(500),
    pics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PRICES TABLE - Product Pricing
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_ref VARCHAR(100) NOT NULL REFERENCES public.products(ref) ON DELETE CASCADE,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    discount_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ILS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORDERS TABLE - Order Management
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SETTINGS TABLE - System Configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255),
    company_description TEXT,
    company_email VARCHAR(255),
    company_phone VARCHAR(50),
    company_address TEXT,
    company_logo VARCHAR(500),
    currency VARCHAR(3) DEFAULT 'ILS',
    tax_rate DECIMAL(5,4) DEFAULT 0.18,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USERS TABLE - Admin Authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    user_role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_ref ON public.products(ref);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_product_line ON public.products(product_line);

-- Full-text search indexes (using simple configuration for Hebrew)
CREATE INDEX IF NOT EXISTS idx_products_search_he ON public.products USING gin(to_tsvector('simple', COALESCE(hebrew_name, '') || ' ' || COALESCE(description_he, '')));
CREATE INDEX IF NOT EXISTS idx_products_search_en ON public.products USING gin(to_tsvector('english', COALESCE(english_name, '') || ' ' || COALESCE(description, '')));

-- Prices indexes
CREATE INDEX IF NOT EXISTS idx_prices_product_ref ON public.prices(product_ref);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Additional users indexes (basic ones already created above)
-- Note: Main indexes already created above, avoiding duplicates

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON public.prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT SETTINGS RECORD
-- ============================================================================

INSERT INTO public.settings (company_name, currency, tax_rate) 
VALUES ('Mini Catalog E-commerce', 'ILS', 0.18)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ESSENTIAL VIEWS
-- ============================================================================

-- Check if orders table has the correct structure before creating views
DO $$
BEGIN
    -- Check if client_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'client_id'
    ) THEN
        RAISE EXCEPTION 'ERROR: orders table does not have client_id column. Please ensure the orders table was created properly.';
    END IF;
END $$;

-- Orders with client information (for admin panel)
CREATE OR REPLACE VIEW public.orders_with_clients AS
SELECT 
    o.id,
    o.client_id,
    o.items,
    o.total_amount,
    o.status,
    o.notes,
    o.created_at,
    o.updated_at,
    u.full_name as client_name,
    u.email as client_email,
    u.role as client_role,
    u.user_role as client_user_role
FROM public.orders o
LEFT JOIN public.users u ON o.client_id = u.id;

