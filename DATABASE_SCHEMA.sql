-- ============================================================================
-- Mini Catalog E-commerce Admin Panel - Complete Database Schema
-- ============================================================================
-- This SQL script creates all tables, indexes, and constraints for the
-- Mini Catalog E-commerce Admin Panel based on ADMIN_DATABASE_SCHEMA.md
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (Client Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    business_name VARCHAR(255),
    phone_number VARCHAR(50),
    address JSONB,
    user_roles TEXT[] DEFAULT ARRAY['standard'],
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_roles ON public.profiles USING GIN(user_roles);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Comments for profiles table
COMMENT ON TABLE public.profiles IS 'Client/user profiles for the e-commerce system';
COMMENT ON COLUMN public.profiles.user_roles IS 'Array of user roles: standard, verified_members, admin';
COMMENT ON COLUMN public.profiles.address IS 'JSON object containing street, city, state, postal_code, country';

-- ============================================================================
-- 2. PRODUCTS TABLE (Product Management)
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

-- Indexes for products table
CREATE INDEX IF NOT EXISTS idx_products_ref ON public.products(ref);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_product_line ON public.products(product_line);
CREATE INDEX IF NOT EXISTS idx_products_hebrew_name ON public.products(hebrew_name);
CREATE INDEX IF NOT EXISTS idx_products_english_name ON public.products(english_name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

-- Full-text search indexes (using simple configuration for Hebrew)
CREATE INDEX IF NOT EXISTS idx_products_search_he ON public.products USING gin(to_tsvector('simple', COALESCE(hebrew_name, '') || ' ' || COALESCE(description_he, '')));
CREATE INDEX IF NOT EXISTS idx_products_search_en ON public.products USING gin(to_tsvector('english', COALESCE(english_name, '') || ' ' || COALESCE(description, '')));

-- Comments for products table
COMMENT ON TABLE public.products IS 'Product catalog with multi-language support';
COMMENT ON COLUMN public.products.ref IS 'Product reference/SKU - unique identifier';
COMMENT ON COLUMN public.products.pics IS 'JSON array of additional product image URLs';

-- ============================================================================
-- 3. PRICES TABLE (Product Pricing)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_ref VARCHAR(100) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    discount_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'ILS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_prices_product_ref FOREIGN KEY (product_ref) REFERENCES public.products(ref) ON DELETE CASCADE
);

-- Indexes for prices table
CREATE INDEX IF NOT EXISTS idx_prices_product_ref ON public.prices(product_ref);
CREATE INDEX IF NOT EXISTS idx_prices_currency ON public.prices(currency);

-- Comments for prices table
COMMENT ON TABLE public.prices IS 'Product pricing information with support for cost and discount prices';

-- ============================================================================
-- 4. ORDERS TABLE (Order Management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_orders_client_id FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON public.orders(total_amount);

-- GIN index for JSON items search
CREATE INDEX IF NOT EXISTS idx_orders_items ON public.orders USING GIN(items);

-- Comments for orders table
COMMENT ON TABLE public.orders IS 'Customer orders with client relationship';
COMMENT ON COLUMN public.orders.items IS 'JSON array of order items with product_id, product_name, quantity, unit_price, etc.';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, processing, shipped, delivered, completed, cancelled';

-- ============================================================================
-- 5. SETTINGS TABLE (System Configuration)
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

-- Insert default settings record
INSERT INTO public.settings (company_name, currency, tax_rate) 
VALUES ('Mini Catalog E-commerce', 'ILS', 0.18)
ON CONFLICT DO NOTHING;

-- Comments for settings table
COMMENT ON TABLE public.settings IS 'System-wide configuration settings';
COMMENT ON COLUMN public.settings.tax_rate IS 'Tax rate as decimal (0.18 = 18% VAT)';

-- ============================================================================
-- 6. USERS TABLE (System Users - Admin Authentication)
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

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Comments for users table
COMMENT ON TABLE public.users IS 'System users for admin authentication';

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prices_updated_at 
    BEFORE UPDATE ON public.prices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON public.settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Prices policies (role-based access)
CREATE POLICY "Standard users see standard prices" ON public.prices
    FOR SELECT USING (
        NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'verified_members' = ANY(user_roles)
        )
    );

CREATE POLICY "Verified members see all prices" ON public.prices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND ('verified_members' = ANY(user_roles) OR 'admin' = ANY(user_roles))
        )
    );

CREATE POLICY "Admins can manage prices" ON public.prices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Settings policies (admin only)
CREATE POLICY "Admins can manage settings" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users policies (admin only)
CREATE POLICY "Admins can manage users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Sample profiles
INSERT INTO public.profiles (id, email, name, business_name, phone_number, user_roles, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'sarah@example.com', 'שרה כהן', 'חברת השיווק שלי', '050-1234567', ARRAY['verified_members'], 'active'),
    ('550e8400-e29b-41d4-a716-446655440002', 'rachel@example.com', 'רחל לוי', NULL, '052-9876543', ARRAY['standard'], 'active'),
    ('550e8400-e29b-41d4-a716-446655440003', 'admin@example.com', 'מנהל מערכת', 'Mini Catalog', '03-1234567', ARRAY['admin'], 'active')
ON CONFLICT (email) DO NOTHING;

-- Sample products
INSERT INTO public.products (ref, hebrew_name, english_name, product_line, product_type, size, unit_price, description_he) VALUES
    ('SKU001', 'סרום ויטמין C', 'Vitamin C Serum', 'פרימיום', 'סרום', '30ml', 189.00, 'סרום מרוכז לטיפול בפיגמנטציה והבהרת העור'),
    ('SKU002', 'קרם לחות יום', 'Day Moisturizer', 'בסיסי', 'קרם', '50ml', 129.00, 'קרם לחות עשיר לעור יבש'),
    ('SKU003', 'מסכת פנים', 'Face Mask', 'פרימיום', 'מסכה', '75ml', 79.00, 'מסכת חימר לניקוי עמוק')
ON CONFLICT (ref) DO NOTHING;

-- Sample prices
INSERT INTO public.prices (product_ref, unit_price, cost_price, currency) VALUES
    ('SKU001', 189.00, 95.00, 'ILS'),
    ('SKU002', 129.00, 65.00, 'ILS'),
    ('SKU003', 79.00, 40.00, 'ILS')
ON CONFLICT DO NOTHING;

-- Sample orders
INSERT INTO public.orders (client_id, items, total_amount, status, notes) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 
     '[{"product_id": "SKU001", "product_name": "סרום ויטמין C", "quantity": 2, "unit_price": 189.00, "total_price": 378.00}]',
     378.00, 'completed', 'הזמנה ראשונה'),
    ('550e8400-e29b-41d4-a716-446655440002',
     '[{"product_id": "SKU002", "product_name": "קרם לחות יום", "quantity": 1, "unit_price": 129.00, "total_price": 129.00}]',
     129.00, 'processing', NULL)
ON CONFLICT DO NOTHING;

-- Sample admin user
INSERT INTO public.users (id, email, full_name, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', 'admin@example.com', 'מנהל מערכת', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 10. USEFUL VIEWS FOR REPORTING
-- ============================================================================

-- View: Orders with client information
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
    p.name as client_name,
    p.email as client_email,
    p.business_name as client_business_name,
    p.phone_number as client_phone,
    p.user_roles as client_roles,
    p.status as client_status
FROM public.orders o
LEFT JOIN public.profiles p ON o.client_id = p.id;

-- View: Product inventory summary
CREATE OR REPLACE VIEW public.product_inventory AS
SELECT 
    p.id,
    p.ref,
    p.hebrew_name,
    p.english_name,
    p.product_line,
    p.product_type,
    p.size,
    p.qty,
    pr.unit_price,
    pr.cost_price,
    CASE 
        WHEN p.qty > 10 THEN 'In Stock'
        WHEN p.qty > 0 THEN 'Low Stock'
        ELSE 'Out of Stock'
    END as stock_status
FROM public.products p
LEFT JOIN public.prices pr ON p.ref = pr.product_ref;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Mini Catalog E-commerce Database Schema Creation Complete!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Created Tables:';
    RAISE NOTICE '  ✓ profiles (Client Management)';
    RAISE NOTICE '  ✓ products (Product Catalog)';
    RAISE NOTICE '  ✓ prices (Product Pricing)';
    RAISE NOTICE '  ✓ orders (Order Management)';
    RAISE NOTICE '  ✓ settings (System Configuration)';
    RAISE NOTICE '  ✓ users (Admin Authentication)';
    RAISE NOTICE '';
    RAISE NOTICE 'Features Enabled:';
    RAISE NOTICE '  ✓ UUID Primary Keys';
    RAISE NOTICE '  ✓ Automatic Timestamps';
    RAISE NOTICE '  ✓ Foreign Key Constraints';
    RAISE NOTICE '  ✓ Indexes for Performance';
    RAISE NOTICE '  ✓ Row Level Security (RLS)';
    RAISE NOTICE '  ✓ Full-Text Search';
    RAISE NOTICE '  ✓ Sample Data';
    RAISE NOTICE '  ✓ Reporting Views';
    RAISE NOTICE '============================================================================';
END $$;
