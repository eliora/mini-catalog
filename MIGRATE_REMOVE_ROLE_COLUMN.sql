-- ============================================================================
-- SCRIPT TO SAFELY REMOVE THE REDUNDANT 'role' COLUMN FROM THE 'users' TABLE
-- ============================================================================
-- This script handles objects that depend on the 'role' column.
-- Instead of using CASCADE which deletes dependencies, we will alter them first.
-- Run each step carefully in your Supabase SQL Editor.

-- STEP 1: Modify Database Views
-- ---------------------------------
-- First, we need to update any views that select the 'role' column.
-- NOTE: You must replace the view definitions below with your actual view definitions,
--       only changing the reference from 'u.role' to 'u.user_role'.
--
-- To find a view's definition, run this query:
-- SELECT pg_get_viewdef('your_view_name_here', true);
--
-- Then, copy the result into the CREATE OR REPLACE VIEW command below and make the change.

-- Modify the 'current_user_role' view (EXAMPLE - REPLACE WITH YOURS)
CREATE OR REPLACE VIEW public.current_user_role AS
SELECT
    u.id,
    u.user_role -- <-- CHANGE THIS from u.role
FROM
    public.users u
WHERE
    u.id = auth.uid();

-- Modify the 'orders_with_clients' view (EXAMPLE - REPLACE WITH YOURS)
CREATE OR REPLACE VIEW public.orders_with_clients AS
SELECT
    o.*,
    u.full_name as client_name,
    u.email as client_email,
    u.user_role as client_role -- <-- CHANGE THIS from u.role
FROM
    public.orders o
JOIN
    public.users u ON o.client_id = u.id;


-- STEP 2: Modify Row Level Security (RLS) Policies
-- ----------------------------------------------------
-- Next, we drop and recreate the security policies that reference the 'role' column.
-- NOTE: The definitions below are common patterns. Please verify them against your
-- actual policies in the Supabase Dashboard under Authentication -> Policies before running.

-- Policy on 'users' table
DROP POLICY IF EXISTS "Admin users can manage all users" ON public.users;
CREATE POLICY "Admin users can manage all users"
ON public.users FOR ALL
USING ((SELECT user_role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Policy on 'orders' table
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;
CREATE POLICY "Admins can manage all orders"
ON public.orders FOR ALL
USING ((SELECT user_role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Policy on 'settings_audit' table
DROP POLICY IF EXISTS "Admins can view settings audit" ON public.settings_audit;
CREATE POLICY "Admins can view settings audit"
ON public.settings_audit FOR SELECT
USING ((SELECT user_role FROM public.users WHERE id = auth.uid()) = 'admin');


-- STEP 3: Drop the Column
-- --------------------------
-- After modifying all dependencies, you can now safely drop the column.
ALTER TABLE public.users
DROP COLUMN IF EXISTS role;

-- FINAL STEP: Refresh the schema cache
-- In the Supabase Dashboard, navigate to API -> and click "Reload schema".
-- This ensures the changes are reflected in the auto-generated API.

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
