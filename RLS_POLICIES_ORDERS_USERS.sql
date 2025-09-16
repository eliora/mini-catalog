-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES - Orders and Users
-- ============================================================================
-- Comprehensive security policies for orders and users tables
-- ============================================================================

-- Step 1: Enable RLS on tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Drop existing users policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Public can view user profiles" ON public.users;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can manage all users (insert, update, delete)
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow user registration (insert new users)
CREATE POLICY "Allow user registration" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================================
-- ORDERS TABLE POLICIES
-- ============================================================================

-- Drop existing orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON public.orders;

-- Users can view their own orders (by client_id)
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (client_id = auth.uid());

-- Users can create orders for themselves
CREATE POLICY "Users can create orders" ON public.orders
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Users can update their own orders (only pending/confirmed status)
CREATE POLICY "Users can update own orders" ON public.orders
    FOR UPDATE USING (
        client_id = auth.uid() 
        AND status IN ('pending', 'confirmed')
    );

-- Users can delete their own pending orders
CREATE POLICY "Users can delete own orders" ON public.orders
    FOR DELETE USING (
        client_id = auth.uid() 
        AND status = 'pending'
    );

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- ADDITIONAL POLICIES FOR ENHANCED SECURITY
-- ============================================================================

-- Verified members can see other verified members (for B2B features)
CREATE POLICY "Verified members can see other verified members" ON public.users
    FOR SELECT USING (
        user_role = 'verified_members' 
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND user_role IN ('verified_members', 'admin')
        )
    );

-- Staff can view orders in processing/shipped status
CREATE POLICY "Staff can view processing orders" ON public.orders
    FOR SELECT USING (
        status IN ('processing', 'shipped', 'delivered')
        AND EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'user')
            AND user_role IN ('admin', 'verified_members')
        )
    );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show all policies for users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users' 
AND schemaname = 'public'
ORDER BY policyname;

-- Show all policies for orders table  
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders' 
AND schemaname = 'public'
ORDER BY policyname;

-- Test policy functionality
-- Show current user's orders (should only show their own)
SELECT 
    id,
    client_id,
    total_amount,
    status,
    created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 5;

-- Show current user's profile (should only show their own)
SELECT 
    id,
    email,
    full_name,
    role,
    user_role,
    status
FROM public.users
WHERE id = auth.uid();

-- ============================================================================
-- POLICY SUMMARY
-- ============================================================================

DO $$
DECLARE
    users_policies_count INTEGER;
    orders_policies_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO users_policies_count
    FROM pg_policies 
    WHERE tablename = 'users' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO orders_policies_count
    FROM pg_policies 
    WHERE tablename = 'orders' AND schemaname = 'public';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS POLICIES SETUP COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'USERS TABLE: % policies created', users_policies_count;
    RAISE NOTICE '  ✅ Users can view/update own profile';
    RAISE NOTICE '  ✅ Admins can manage all users';
    RAISE NOTICE '  ✅ User registration allowed';
    RAISE NOTICE '  ✅ Verified members can see each other';
    RAISE NOTICE '';
    RAISE NOTICE 'ORDERS TABLE: % policies created', orders_policies_count;
    RAISE NOTICE '  ✅ Users can view/create/update own orders';
    RAISE NOTICE '  ✅ Users can delete pending orders';
    RAISE NOTICE '  ✅ Admins can manage all orders';
    RAISE NOTICE '  ✅ Staff can view processing orders';
    RAISE NOTICE '';
    RAISE NOTICE 'SECURITY FEATURES:';
    RAISE NOTICE '  🔒 Row Level Security enabled';
    RAISE NOTICE '  🔒 Role-based access control';
    RAISE NOTICE '  🔒 Status-based order permissions';
    RAISE NOTICE '  🔒 B2B verified member features';
    RAISE NOTICE '============================================';
END $$;

