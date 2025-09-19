-- ============================================================================
-- CHECK AND FIX USER ROLE
-- ============================================================================
-- This script checks the current user's role and fixes it if needed
-- ============================================================================

BEGIN;

-- Check current user info
SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- Check if user exists in users table
SELECT 
    id,
    email,
    role,
    created_at,
    updated_at
FROM public.users 
WHERE id = auth.uid();

-- If user doesn't exist or doesn't have admin role, insert/update them
INSERT INTO public.users (id, email, role, created_at, updated_at)
VALUES (
    auth.uid(),
    auth.email(),
    'admin',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- Verify the user now has admin role
SELECT 
    id,
    email,
    role,
    created_at,
    updated_at
FROM public.users 
WHERE id = auth.uid();

COMMIT;
