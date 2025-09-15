-- Migration: Setup admin user with proper roles
-- Date: September 11, 2025
-- Purpose: Create admin user and set up proper role-based access

-- =============================================================================
-- STEP 1: Add admin role support to users table (if not exists)
-- =============================================================================

-- Ensure user_role column exists with proper values
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'standard';

-- Add check constraint for valid roles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage 
        WHERE table_name = 'users' AND constraint_name = 'valid_user_roles'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT valid_user_roles 
        CHECK (user_role IN ('standard', 'verified_member', 'admin'));
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_user_role ON public.users(user_role);

-- =============================================================================
-- STEP 2: Create admin user (replace with your actual email)
-- =============================================================================

-- Method 1: If you have a Supabase auth user, update their role
-- Replace 'your-email@example.com' with your actual email address
UPDATE public.users 
SET user_role = 'admin', updated_at = timezone('utc'::text, now())
WHERE email = 'your-email@example.com';

-- Method 2: If the user doesn't exist in users table, create them
-- (This assumes you already have a Supabase auth account)
-- Replace the email with your actual email
INSERT INTO public.users (id, email, user_role, created_at, updated_at)
SELECT 
    auth.uid() as id,
    'your-email@example.com' as email,
    'admin' as user_role,
    timezone('utc'::text, now()) as created_at,
    timezone('utc'::text, now()) as updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'your-email@example.com'
)
AND auth.uid() IS NOT NULL;

-- =============================================================================
-- STEP 3: Update RLS policies for admin access
-- =============================================================================

-- Create or replace admin check function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin via users table
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND user_role = 'admin'
  );
END;
$$;

-- Create or replace verified member check function
CREATE OR REPLACE FUNCTION public.is_verified_member_or_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is verified member or admin
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND user_role IN ('verified_member', 'admin')
  );
END;
$$;

-- =============================================================================
-- STEP 4: Update existing RLS policies to use admin function
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can manage all prices" ON public.prices;
DROP POLICY IF EXISTS "Verified members can read prices" ON public.prices;
DROP POLICY IF EXISTS "Admins can manage all prices" ON public.prices;

-- Create new admin-aware policies for prices table
CREATE POLICY "Admin users can manage all prices" ON public.prices
    FOR ALL 
    USING (
        auth.role() = 'service_role' OR
        public.is_admin_user()
    );

CREATE POLICY "Verified members and admins can read prices" ON public.prices
    FOR SELECT 
    USING (
        auth.role() = 'service_role' OR
        public.is_verified_member_or_admin()
    );

-- =============================================================================
-- STEP 5: Verification and testing
-- =============================================================================

-- Check current admin users
SELECT 
    id,
    email, 
    user_role,
    created_at,
    updated_at
FROM public.users 
WHERE user_role = 'admin';

-- Test admin function (run this while logged in as admin)
-- SELECT public.is_admin_user() as am_i_admin;

-- Test verified member function
-- SELECT public.is_verified_member_or_admin() as can_i_see_prices;

-- =============================================================================
-- STEP 6: Instructions for manual setup
-- =============================================================================

-- TO MAKE YOURSELF AN ADMIN:
-- 1. First, sign up/sign in to your app with your email
-- 2. Then run this SQL with your actual email:
--    UPDATE public.users SET user_role = 'admin' WHERE email = 'YOUR_ACTUAL_EMAIL@example.com';
-- 3. Refresh your app and try accessing /admin

-- TO MAKE SOMEONE A VERIFIED MEMBER:
-- UPDATE public.users SET user_role = 'verified_member' WHERE email = 'member@example.com';

-- TO CHECK ALL USER ROLES:
-- SELECT email, user_role FROM public.users ORDER BY user_role, email;

DO $$
BEGIN
    RAISE NOTICE '✅ SUCCESS: Admin role system is now configured!';
    RAISE NOTICE '🔧 NEXT STEP: Update the email in this script and run:';
    RAISE NOTICE '   UPDATE public.users SET user_role = ''admin'' WHERE email = ''YOUR_EMAIL'';';
    RAISE NOTICE '🚀 Then refresh your app and try /admin route!';
END $$;
