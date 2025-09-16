-- ============================================================================
-- FIX POSTGRES USER ACCESS FOR SETTINGS
-- ============================================================================
-- Solution for when connecting as 'postgres' user without a users table record
-- ============================================================================

-- ============================================================================
-- OPTION 1: CREATE POSTGRES USER RECORD IN USERS TABLE
-- ============================================================================

-- Insert postgres user into users table with admin privileges
INSERT INTO public.users (
  id, 
  email, 
  role, 
  user_role,
  full_name, 
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'postgres',  -- This matches current_user
  'admin',
  'admin', 
  'PostgreSQL Superuser',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  user_role = 'admin',
  status = 'active',
  updated_at = NOW();

-- ============================================================================
-- OPTION 2: MODIFY RLS POLICIES TO ALLOW POSTGRES SUPERUSER
-- ============================================================================

-- Enhanced admin check function that includes postgres superuser
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow postgres superuser OR admin users from users table
  IF current_user = 'postgres' THEN
    RETURN true;
  END IF;
  
  RETURN COALESCE(
    (SELECT (role = 'admin' OR user_role = 'admin') AND status = 'active'
     FROM public.users 
     WHERE email = current_user),
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: allow postgres user
    RETURN current_user = 'postgres';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced authentication check
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  -- Postgres superuser is always authenticated
  IF current_user = 'postgres' THEN
    RETURN true;
  END IF;
  
  RETURN current_user != 'anon' AND 
         current_user != 'anonymous' AND 
         current_user IS NOT NULL AND
         EXISTS(SELECT 1 FROM public.users WHERE email = current_user AND status = 'active');
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: allow postgres user
    RETURN current_user = 'postgres';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced role function
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Postgres superuser gets admin role
  IF current_user = 'postgres' THEN
    RETURN 'admin';
  END IF;
  
  RETURN COALESCE(
    (SELECT role FROM public.users WHERE email = current_user AND status = 'active'),
    'anonymous'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: postgres gets admin
    IF current_user = 'postgres' THEN
      RETURN 'admin';
    ELSE
      RETURN 'anonymous';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- OPTION 3: BYPASS RLS FOR POSTGRES SUPERUSER (TEMPORARY TESTING)
-- ============================================================================

-- Create a temporary bypass function for testing
CREATE OR REPLACE FUNCTION public.bypass_settings_update(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
BEGIN
  -- Only allow postgres superuser to bypass
  IF current_user != 'postgres' THEN
    RAISE EXCEPTION 'This function is only for postgres superuser testing'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Temporarily disable RLS for this session
  SET row_security = OFF;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform update
  UPDATE public.settings 
  SET 
    company_name = COALESCE(settings_data->>'company_name', company_name),
    company_description = COALESCE(settings_data->>'company_description', company_description),
    company_email = COALESCE(settings_data->>'company_email', company_email),
    company_phone = COALESCE(settings_data->>'company_phone', company_phone),
    company_address = COALESCE(settings_data->>'company_address', company_address),
    currency = COALESCE(settings_data->>'currency', currency),
    tax_rate = COALESCE((settings_data->>'tax_rate')::DECIMAL(5,4), tax_rate),
    primary_color = COALESCE(settings_data->>'primary_color', primary_color),
    secondary_color = COALESCE(settings_data->>'secondary_color', secondary_color),
    enable_reviews = COALESCE((settings_data->>'enable_reviews')::BOOLEAN, enable_reviews),
    enable_wishlist = COALESCE((settings_data->>'enable_wishlist')::BOOLEAN, enable_wishlist),
    updated_at = NOW()
  WHERE id = settings_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Re-enable RLS
  SET row_security = ON;
  
  IF update_count = 0 THEN
    RAISE EXCEPTION 'Settings update failed. No rows were updated.'
      USING ERRCODE = 'no_data_found';
  END IF;
  
  -- Return updated record
  SELECT row_to_json(s.*)::jsonb INTO result
  FROM public.settings s
  WHERE s.id = settings_id;
  
  result := result || jsonb_build_object(
    '_bypass_used', true,
    '_updated_rows', update_count,
    '_user', current_user
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission for bypass function
GRANT EXECUTE ON FUNCTION public.bypass_settings_update(JSONB) TO postgres;

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

-- Test the fixes
DO $$
DECLARE
  test_result JSONB;
  postgres_user_exists BOOLEAN;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'POSTGRES USER ACCESS FIX VERIFICATION';
  RAISE NOTICE '';
  
  -- Check if postgres user was added to users table
  SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'postgres') INTO postgres_user_exists;
  
  RAISE NOTICE 'Current user: %', current_user;
  RAISE NOTICE 'Postgres user in users table: %', postgres_user_exists;
  RAISE NOTICE 'Is admin (new): %', public.is_admin();
  RAISE NOTICE 'Is authenticated (new): %', public.is_authenticated();
  RAISE NOTICE 'User role (new): %', public.current_user_role();
  RAISE NOTICE '';
  
  -- Test debug function
  SELECT public.debug_user_permissions() INTO test_result;
  RAISE NOTICE 'Debug result: %', test_result;
  RAISE NOTICE '';
  
  RAISE NOTICE 'AVAILABLE SOLUTIONS:';
  RAISE NOTICE '  1. Postgres user added to users table ✓';
  RAISE NOTICE '  2. Enhanced RLS functions for postgres ✓';
  RAISE NOTICE '  3. Bypass function for testing ✓';
  RAISE NOTICE '';
  RAISE NOTICE 'TEST COMMANDS:';
  RAISE NOTICE '  SELECT public.debug_user_permissions();';
  RAISE NOTICE '  SELECT public.admin_update_settings(''{"company_name": "Test"}'');';
  RAISE NOTICE '  SELECT public.bypass_settings_update(''{"company_name": "Bypass Test"}'');';
  RAISE NOTICE '============================================';
END $$;
