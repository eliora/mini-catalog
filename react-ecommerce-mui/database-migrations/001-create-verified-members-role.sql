-- Migration: Create verified_members role and pricing security system
-- Date: September 11, 2025
-- Purpose: Separate pricing from products to restrict access to verified members only

-- =============================================================================
-- STEP 1: Create verified_members role
-- =============================================================================

-- Create the verified_members role
-- This role will be assigned to users who are allowed to see pricing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'verified_members') THEN
        CREATE ROLE verified_members;
        COMMENT ON ROLE verified_members IS 'Users who can access product pricing information';
    END IF;
END $$;

-- Grant basic permissions to verified_members role
GRANT USAGE ON SCHEMA public TO verified_members;
GRANT SELECT ON public.products TO verified_members;

-- =============================================================================
-- NOTES FOR IMPLEMENTATION
-- =============================================================================

-- To assign users to this role, you'll need to:
-- 1. Add a 'role' or 'user_type' column to your users table
-- 2. Update user profiles to include role information
-- 3. Use JWT claims or custom claims to include role in authentication

-- Example user role assignment (to be implemented later):
-- ALTER TABLE public.users ADD COLUMN user_role TEXT DEFAULT 'standard';
-- UPDATE public.users SET user_role = 'verified_member' WHERE conditions_met;

-- For JWT integration, you might use custom claims:
-- https://supabase.com/docs/guides/auth/row-level-security#custom-claims
