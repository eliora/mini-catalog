-- ============================================================================
-- UPDATE USERS TABLE SCHEMA - Add Client Management Fields
-- ============================================================================
-- This script adds missing columns to your users table to make it work
-- better for client/customer management while keeping Supabase Auth integration
-- ============================================================================

-- Step 1: Add missing columns for client management
-- Add business_name for business customers
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Add phone_number for customer contact
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);

-- Add address as JSONB for flexible address storage
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS address JSONB;

-- Add status for account management
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Add last_login tracking
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Step 2: Add check constraint for status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'users_status_check' 
        AND constraint_schema = 'public'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended'));
        
        RAISE NOTICE 'Status check constraint added';
    ELSE
        RAISE NOTICE 'Status check constraint already exists';
    END IF;
END $$;

-- Step 3: Update user_role constraint to include more roles
-- Drop existing constraint if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_user_role_check;

-- Add new constraint with more role options
ALTER TABLE public.users 
ADD CONSTRAINT users_user_role_check 
CHECK (user_role IN ('standard', 'verified_members', 'customer', 'admin'));

-- Step 4: Create additional indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_business_name ON public.users(business_name);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Step 5: Update existing users with default values where needed
-- Set default status for existing users
UPDATE public.users 
SET status = 'active' 
WHERE status IS NULL;

-- Set user_role to 'customer' for users with role 'user' (if they don't have user_role set)
UPDATE public.users 
SET user_role = 'customer' 
WHERE role = 'user' AND (user_role IS NULL OR user_role = 'standard');

-- Keep admin users as admin
UPDATE public.users 
SET user_role = 'admin' 
WHERE role = 'admin';

-- Step 6: Show the updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 7: Show sample data with new structure
SELECT 
    id,
    email,
    full_name,
    business_name,
    phone_number,
    role,
    user_role,
    status,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- Step 8: Verification queries
SELECT 
    'Total users' as metric,
    COUNT(*) as count
FROM public.users

UNION ALL

SELECT 
    'Active users' as metric,
    COUNT(*) as count
FROM public.users 
WHERE status = 'active'

UNION ALL

SELECT 
    'Admin users' as metric,
    COUNT(*) as count
FROM public.users 
WHERE role = 'admin'

UNION ALL

SELECT 
    'Customer users' as metric,
    COUNT(*) as count
FROM public.users 
WHERE user_role = 'customer';

-- Step 9: Test the orders_with_clients view still works
SELECT 
    id,
    client_name,
    client_email,
    client_role,
    client_user_role,
    total_amount,
    status
FROM public.orders_with_clients
ORDER BY created_at DESC
LIMIT 5;

-- Final completion message
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'USERS TABLE SCHEMA UPDATE COMPLETE!';
    RAISE NOTICE 'Added columns: business_name, phone_number, address, status, last_login';
    RAISE NOTICE 'Updated constraints and indexes';
    RAISE NOTICE 'Table is now ready for full client management';
    RAISE NOTICE '============================================';
END $$;
