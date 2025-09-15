-- Migration: Create RLS policies for prices table
-- Date: September 11, 2025
-- Purpose: Restrict pricing access to verified members and admins only

-- =============================================================================
-- STEP 4: Enable RLS and create policies for prices table
-- =============================================================================

-- Enable Row Level Security on prices table
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- POLICY 1: Admin users can manage all prices
-- =============================================================================

CREATE POLICY "Admin users can manage all prices" ON public.prices
    FOR ALL 
    USING (
        -- Check if user has admin role or is service_role
        auth.role() = 'service_role' OR
        (
            auth.role() = 'authenticated' AND
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND (user_role = 'admin' OR user_role = 'verified_member')
            )
        )
    );

-- =============================================================================
-- POLICY 2: Verified members can read prices
-- =============================================================================

CREATE POLICY "Verified members can read prices" ON public.prices
    FOR SELECT 
    USING (
        -- Allow service_role full access
        auth.role() = 'service_role' OR
        (
            auth.role() = 'authenticated' AND
            EXISTS (
                SELECT 1 FROM public.users 
                WHERE id = auth.uid() 
                AND user_role IN ('admin', 'verified_member')
            )
        )
    );

-- =============================================================================
-- POLICY 3: Block anonymous access to prices
-- =============================================================================

-- No policy for anonymous users = no access
-- This ensures pricing is completely hidden from non-authenticated users

-- =============================================================================
-- Alternative approach using JWT claims (if you prefer)
-- =============================================================================

-- If you want to use JWT custom claims instead of database roles:
-- 
-- CREATE POLICY "JWT verified members can read prices" ON public.prices
--     FOR SELECT 
--     USING (
--         auth.role() = 'service_role' OR
--         (
--             auth.role() = 'authenticated' AND
--             (
--                 auth.jwt() ->> 'user_role' = 'admin' OR
--                 auth.jwt() ->> 'user_role' = 'verified_member'
--             )
--         )
--     );

-- =============================================================================
-- Test the policies (run these after creating policies)
-- =============================================================================

-- Test 1: Anonymous user should see no prices
-- SET ROLE anon;
-- SELECT COUNT(*) FROM public.prices; -- Should return 0

-- Test 2: Authenticated user without verified role should see no prices  
-- SET ROLE authenticated;
-- SELECT COUNT(*) FROM public.prices; -- Should return 0 (unless user has role)

-- Test 3: Service role should see all prices
-- SET ROLE service_role;
-- SELECT COUNT(*) FROM public.prices; -- Should return all prices

-- Reset role
-- RESET ROLE;

-- =============================================================================
-- NOTES FOR IMPLEMENTATION
-- =============================================================================

-- 1. You need to add user_role column to users table:
--    ALTER TABLE public.users ADD COLUMN user_role TEXT DEFAULT 'standard';

-- 2. To make a user a verified member:
--    UPDATE public.users SET user_role = 'verified_member' WHERE email = 'user@example.com';

-- 3. To make a user an admin:
--    UPDATE public.users SET user_role = 'admin' WHERE email = 'admin@example.com';

-- 4. Consider adding an index on user_role for performance:
--    CREATE INDEX idx_users_user_role ON public.users(user_role);
