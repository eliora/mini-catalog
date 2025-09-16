-- ============================================================================
-- 🚀 ADMIN PANEL DATABASE MIGRATION SCRIPT
-- ============================================================================
-- Convert current database schema to match ADMIN_DATABASE_SCHEMA.md
-- This script handles: Users, Products, Orders, Prices, and Settings tables
-- 
-- File Location: Root of Next.js project
-- Target Schema: Based on ADMIN_DATABASE_SCHEMA.md documentation
-- ============================================================================

BEGIN;

-- ============================================================================
-- 📋 STEP 1: CREATE USERS TABLE (replaces profiles)
-- ============================================================================
-- This addresses the "Could not find the table 'public.profiles'" error

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    role text NOT NULL DEFAULT 'user',
    full_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    user_role text DEFAULT 'standard',
    business_name text,
    phone_number varchar(50),
    address jsonb,
    status varchar(20) DEFAULT 'active',
    last_login timestamp with time zone
);

-- Add constraints for users table
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'admin'));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE public.users ADD CONSTRAINT users_status_check 
    CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_user_role_check 
    CHECK (user_role IN ('standard', 'verified_members', 'customer', 'admin'));

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users USING btree (role);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users USING btree (user_role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users USING btree (status);
CREATE INDEX IF NOT EXISTS idx_users_business_name ON public.users USING btree (business_name);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users USING btree (phone_number);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 📦 STEP 2: UPDATE PRODUCTS TABLE SCHEMA
-- ============================================================================

-- Ensure products table exists with correct structure
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ref text NOT NULL UNIQUE,
    hebrew_name text,
    english_name text,
    french_name text,
    product_line text,
    product_type text,
    type text,
    size text,
    qty integer,
    unit_price numeric(10,2),
    description text,
    description_he text,
    short_description_he text,
    header text,
    ingredients text,
    active_ingredients_he text,
    skin_type_he text,
    usage_instructions_he text,
    notice text,
    main_pic text,
    pics jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add any missing columns to existing products table
DO $$
BEGIN
    -- Add columns that might be missing
    BEGIN
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hebrew_name text;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS english_name text;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS french_name text;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active_ingredients_he text;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS usage_instructions_he text;
        ALTER TABLE public.products ADD COLUMN IF NOT EXISTS pics jsonb;
    EXCEPTION
        WHEN duplicate_column THEN
            NULL; -- Column already exists
    END;
END $$;

-- Create indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_ref ON public.products USING btree (ref);
CREATE INDEX IF NOT EXISTS idx_products_product_line ON public.products USING btree (product_line);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products USING btree (product_type);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products USING btree (created_at);

-- Create trigger for products updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 💰 STEP 3: UPDATE PRICES TABLE SCHEMA
-- ============================================================================

-- Ensure prices table matches documentation
CREATE TABLE IF NOT EXISTS public.prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_ref text NOT NULL REFERENCES public.products(ref) ON DELETE CASCADE,
    unit_price numeric(10,2) NOT NULL,
    cost_price numeric(10,2),
    discount_price numeric(10,2),
    currency text DEFAULT 'ILS',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for prices table
CREATE INDEX IF NOT EXISTS idx_prices_product_ref ON public.prices USING btree (product_ref);
CREATE INDEX IF NOT EXISTS idx_prices_unit_price ON public.prices USING btree (unit_price);

-- Create trigger for prices updated_at
DROP TRIGGER IF EXISTS update_prices_updated_at ON public.prices;
CREATE TRIGGER update_prices_updated_at
    BEFORE UPDATE ON public.prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 🛒 STEP 4: CREATE ORDERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    items jsonb NOT NULL DEFAULT '[]',
    total_amount numeric(10,2) NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'pending',
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    client_id uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add constraints for orders table
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Create indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders USING btree (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders USING btree (client_id);

-- Create trigger for orders updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ⚙️ STEP 5: CREATE SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name text,
    company_description text,
    company_email text,
    company_phone text,
    company_address text,
    company_logo text,
    currency text DEFAULT 'ILS',
    tax_rate numeric(5,4) DEFAULT 0.18,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create trigger for settings updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings if none exist
INSERT INTO public.settings (
    company_name,
    company_description,
    currency,
    tax_rate
) 
SELECT 
    'Mini Catalog E-commerce',
    'Professional e-commerce platform',
    'ILS',
    0.18
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- ============================================================================
-- 🔐 STEP 6: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
CREATE POLICY "Admins can manage all users" ON public.users
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Products table policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Prices table policies
DROP POLICY IF EXISTS "Authenticated users can view prices" ON public.prices;
CREATE POLICY "Authenticated users can view prices" ON public.prices
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage prices" ON public.prices;
CREATE POLICY "Admins can manage prices" ON public.prices
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Orders table policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
    FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders" ON public.orders
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Settings table policies
DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;
CREATE POLICY "Authenticated users can view settings" ON public.settings
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;
CREATE POLICY "Admins can manage settings" ON public.settings
    USING (EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- ============================================================================
-- 📊 STEP 7: VERIFICATION AND REPORTING
-- ============================================================================

-- Create a view to show migration status
CREATE OR REPLACE VIEW public.migration_status AS
WITH table_info AS (
    SELECT 
        'users' as table_name,
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'users') as column_count
    FROM public.users
    UNION ALL
    SELECT 
        'products' as table_name,
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'products') as column_count
    FROM public.products
    UNION ALL
    SELECT 
        'prices' as table_name,
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'prices') as column_count
    FROM public.prices
    UNION ALL
    SELECT 
        'orders' as table_name,
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'orders') as column_count
    FROM public.orders
    UNION ALL
    SELECT 
        'settings' as table_name,
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = 'settings') as column_count
    FROM public.settings
)
SELECT 
    table_name,
    record_count,
    column_count,
    CASE 
        WHEN table_name = 'users' AND column_count >= 11 THEN '✅'
        WHEN table_name = 'products' AND column_count >= 24 THEN '✅'
        WHEN table_name = 'prices' AND column_count >= 7 THEN '✅'
        WHEN table_name = 'orders' AND column_count >= 8 THEN '✅'
        WHEN table_name = 'settings' AND column_count >= 10 THEN '✅'
        ELSE '❌'
    END as status
FROM table_info;

-- Show migration results
DO $$
DECLARE
    result RECORD;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '🚀 ADMIN PANEL DATABASE MIGRATION COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    
    FOR result IN 
        SELECT * FROM public.migration_status ORDER BY table_name
    LOOP
        RAISE NOTICE '% % - Records: %, Columns: %', 
            result.status, 
            UPPER(result.table_name), 
            result.record_count, 
            result.column_count;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 CREATED TABLES:';
    RAISE NOTICE '  • users (replaces profiles - fixes API errors)';
    RAISE NOTICE '  • products (enhanced with missing fields)';
    RAISE NOTICE '  • prices (normalized pricing structure)';
    RAISE NOTICE '  • orders (with client relationships)';
    RAISE NOTICE '  • settings (system configuration)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 SECURITY FEATURES:';
    RAISE NOTICE '  • Row Level Security (RLS) enabled';
    RAISE NOTICE '  • Role-based access policies';
    RAISE NOTICE '  • Supabase Auth integration';
    RAISE NOTICE '';
    RAISE NOTICE '📈 PERFORMANCE FEATURES:';
    RAISE NOTICE '  • Optimized indexes on key columns';
    RAISE NOTICE '  • Auto-updating timestamps';
    RAISE NOTICE '  • Foreign key constraints';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '============================================';
END $$;

-- Final verification
SELECT 
    'Migration completed at: ' || CURRENT_TIMESTAMP as summary,
    (SELECT COUNT(*) FROM public.migration_status WHERE status = '✅') as successful_tables,
    (SELECT COUNT(*) FROM public.migration_status WHERE status = '❌') as failed_tables;

COMMIT;

-- ============================================================================
-- 🔧 POST-MIGRATION TASKS
-- ============================================================================

-- Show the migration status view
SELECT * FROM public.migration_status ORDER BY table_name;

-- Show sample data to verify structure
SELECT 
    'users' as table_name,
    COUNT(*) as total_records
FROM public.users
UNION ALL
SELECT 
    'products' as table_name,
    COUNT(*) as total_records
FROM public.products
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records
FROM public.orders;

-- Show all indexes created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'products', 'prices', 'orders', 'settings')
ORDER BY tablename, indexname;
