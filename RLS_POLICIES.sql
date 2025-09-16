-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Run this AFTER creating the main schema
-- These policies control data access based on user roles
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view and update their own profile
CREATE POLICY "profiles_own_profile" ON public.profiles
    FOR ALL USING (auth.uid()::text = id::text);

-- Admins can manage all profiles
CREATE POLICY "profiles_admin_all" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- PRODUCTS TABLE POLICIES
-- ============================================================================

-- Everyone can view products (public catalog)
CREATE POLICY "products_public_select" ON public.products
    FOR SELECT USING (true);

-- Only admins can modify products
CREATE POLICY "products_admin_modify" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

CREATE POLICY "products_admin_update" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

CREATE POLICY "products_admin_delete" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- PRICES TABLE POLICIES (Role-based pricing)
-- ============================================================================

-- Standard users see basic prices (you can modify this logic)
CREATE POLICY "prices_standard_users" ON public.prices
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND ('verified_members' = ANY(user_roles) OR 'admin' = ANY(user_roles))
        )
    );

-- Verified members and admins see all prices
CREATE POLICY "prices_verified_and_admin" ON public.prices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND ('verified_members' = ANY(user_roles) OR 'admin' = ANY(user_roles))
        )
    );

-- Only admins can modify prices
CREATE POLICY "prices_admin_modify" ON public.prices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Users can view their own orders
CREATE POLICY "orders_own_orders" ON public.orders
    FOR SELECT USING (client_id = auth.uid());

-- Users can create orders for themselves
CREATE POLICY "orders_create_own" ON public.orders
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Users can update their own pending orders
CREATE POLICY "orders_update_own_pending" ON public.orders
    FOR UPDATE USING (
        client_id = auth.uid() AND 
        status IN ('pending', 'processing')
    );

-- Admins can manage all orders
CREATE POLICY "orders_admin_all" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- SETTINGS TABLE POLICIES
-- ============================================================================

-- Everyone can read settings (for public info like company name)
CREATE POLICY "settings_public_read" ON public.settings
    FOR SELECT USING (true);

-- Only admins can modify settings
CREATE POLICY "settings_admin_modify" ON public.settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- USERS TABLE POLICIES (Admin management)
-- ============================================================================

-- Only admins can manage users table
CREATE POLICY "users_admin_only" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
        )
    );

-- ============================================================================
-- BYPASS RLS FOR SERVICE ROLE (API calls)
-- ============================================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT ALL ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;

GRANT ALL ON public.prices TO authenticated;
GRANT SELECT ON public.prices TO anon;

GRANT ALL ON public.orders TO authenticated;

GRANT ALL ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;

GRANT ALL ON public.users TO authenticated;

-- Grant sequence permissions (for auto-increment if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================================================
-- HELPER FUNCTIONS FOR ROLE CHECKING
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND 'admin' = ANY(user_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user has specific role
CREATE OR REPLACE FUNCTION public.has_role(role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role_name = ANY(user_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's profile
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS public.profiles AS $$
    SELECT * FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES SETUP COMPLETE
-- ============================================================================

