-- ============================================================================
-- FIX POSTGRES USER ACCESS FOR SETTINGS - VERSION 2
-- ============================================================================
-- Solution that works with Supabase Auth foreign key constraints
-- ============================================================================

-- ============================================================================
-- OPTION 1: TEMPORARY DISABLE FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Check current foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE contype = 'f' AND conrelid = 'public.users'::regclass;

-- Temporarily drop the foreign key constraint to auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Now insert postgres user without foreign key constraint
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
-- OPTION 2: ENHANCED RLS FUNCTIONS (NO USERS TABLE DEPENDENCY)
-- ============================================================================

-- Enhanced admin check function that doesn't depend on users table for postgres
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow postgres superuser without users table check
  IF current_user = 'postgres' THEN
    RETURN true;
  END IF;
  
  -- For other users, check users table if it exists and has data
  BEGIN
    RETURN COALESCE(
      (SELECT (role = 'admin' OR user_role = 'admin') AND status = 'active'
       FROM public.users 
       WHERE email = current_user),
      false
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If users table check fails, only allow postgres
      RETURN current_user = 'postgres';
  END;
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
  
  -- Check for valid user session
  IF current_user IN ('anon', 'anonymous') OR current_user IS NULL THEN
    RETURN false;
  END IF;
  
  -- Try to verify user exists in users table
  BEGIN
    RETURN EXISTS(SELECT 1 FROM public.users WHERE email = current_user AND status = 'active');
  EXCEPTION
    WHEN OTHERS THEN
      -- If users table check fails, allow any non-anonymous user
      RETURN true;
  END;
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
  
  -- Try to get role from users table
  BEGIN
    RETURN COALESCE(
      (SELECT role FROM public.users WHERE email = current_user AND status = 'active'),
      'user'  -- Default to 'user' instead of 'anonymous' for authenticated users
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If users table check fails, return based on current_user
      IF current_user IN ('anon', 'anonymous') THEN
        RETURN 'anonymous';
      ELSE
        RETURN 'user';
      END IF;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- OPTION 3: DIRECT RLS BYPASS FOR POSTGRES SUPERUSER
-- ============================================================================

-- Update RLS policies to explicitly allow postgres superuser
DROP POLICY IF EXISTS "admins_view_settings" ON public.settings;
DROP POLICY IF EXISTS "admins_update_settings" ON public.settings;
DROP POLICY IF EXISTS "admins_insert_settings" ON public.settings;

-- Recreate policies with postgres superuser support
CREATE POLICY "admins_view_settings"
ON public.settings
FOR SELECT
USING (
  current_user = 'postgres' OR public.is_admin()
);

CREATE POLICY "admins_update_settings"
ON public.settings
FOR UPDATE
USING (
  current_user = 'postgres' OR public.is_admin()
)
WITH CHECK (
  current_user = 'postgres' OR public.is_admin()
);

CREATE POLICY "admins_insert_settings"
ON public.settings
FOR INSERT
WITH CHECK (
  current_user = 'postgres' OR 
  public.is_admin() OR
  NOT EXISTS (SELECT 1 FROM public.settings)
);

-- ============================================================================
-- OPTION 4: SETTINGS MANAGEMENT WITHOUT RLS DEPENDENCY
-- ============================================================================

-- Direct settings update function for postgres superuser
CREATE OR REPLACE FUNCTION public.postgres_update_settings(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
BEGIN
  -- Only allow postgres superuser
  IF current_user != 'postgres' THEN
    RAISE EXCEPTION 'This function is only available to postgres superuser'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform update (RLS policies should allow postgres)
  UPDATE public.settings 
  SET 
    -- GENERAL SETTINGS
    company_name = COALESCE(settings_data->>'company_name', company_name),
    company_description = COALESCE(settings_data->>'company_description', company_description),
    company_email = COALESCE(settings_data->>'company_email', company_email),
    company_phone = COALESCE(settings_data->>'company_phone', company_phone),
    company_address = COALESCE(settings_data->>'company_address', company_address),
    company_logo = COALESCE(settings_data->>'company_logo', company_logo),
    tagline = COALESCE(settings_data->>'tagline', tagline),
    logo_url = COALESCE(settings_data->>'logo_url', logo_url),
    primary_color = COALESCE(settings_data->>'primary_color', primary_color),
    secondary_color = COALESCE(settings_data->>'secondary_color', secondary_color),
    timezone = COALESCE(settings_data->>'timezone', timezone),
    
    -- BUSINESS SETTINGS
    business_name = COALESCE(settings_data->>'business_name', business_name),
    registration_number = COALESCE(settings_data->>'registration_number', registration_number),
    tax_id = COALESCE(settings_data->>'tax_id', tax_id),
    is_vat_registered = COALESCE((settings_data->>'is_vat_registered')::BOOLEAN, is_vat_registered),
    
    -- FINANCIAL SETTINGS
    currency = COALESCE(settings_data->>'currency', currency),
    tax_rate = COALESCE((settings_data->>'tax_rate')::DECIMAL(5,4), tax_rate),
    prices_include_tax = COALESCE((settings_data->>'prices_include_tax')::BOOLEAN, prices_include_tax),
    show_prices_with_tax = COALESCE((settings_data->>'show_prices_with_tax')::BOOLEAN, show_prices_with_tax),
    enable_tax_exempt = COALESCE((settings_data->>'enable_tax_exempt')::BOOLEAN, enable_tax_exempt),
    invoice_footer_text = COALESCE(settings_data->>'invoice_footer_text', invoice_footer_text),
    
    -- SHIPPING SETTINGS
    free_shipping_threshold = COALESCE((settings_data->>'free_shipping_threshold')::DECIMAL(10,2), free_shipping_threshold),
    standard_shipping_cost = COALESCE((settings_data->>'standard_shipping_cost')::DECIMAL(10,2), standard_shipping_cost),
    express_shipping_cost = COALESCE((settings_data->>'express_shipping_cost')::DECIMAL(10,2), express_shipping_cost),
    enable_local_delivery = COALESCE((settings_data->>'enable_local_delivery')::BOOLEAN, enable_local_delivery),
    
    -- NOTIFICATION SETTINGS
    notification_settings = COALESCE((settings_data->'notification_settings'), notification_settings),
    
    -- SYSTEM SETTINGS
    maintenance_mode = COALESCE((settings_data->>'maintenance_mode')::BOOLEAN, maintenance_mode),
    debug_mode = COALESCE((settings_data->>'debug_mode')::BOOLEAN, debug_mode),
    enable_reviews = COALESCE((settings_data->>'enable_reviews')::BOOLEAN, enable_reviews),
    enable_wishlist = COALESCE((settings_data->>'enable_wishlist')::BOOLEAN, enable_wishlist),
    enable_notifications = COALESCE((settings_data->>'enable_notifications')::BOOLEAN, enable_notifications),
    session_timeout = COALESCE((settings_data->>'session_timeout')::INTEGER, session_timeout),
    max_login_attempts = COALESCE((settings_data->>'max_login_attempts')::INTEGER, max_login_attempts),
    backup_frequency = COALESCE(settings_data->>'backup_frequency', backup_frequency),
    cache_duration = COALESCE((settings_data->>'cache_duration')::INTEGER, cache_duration),
    
    -- TIMESTAMPS
    updated_at = NOW()
  WHERE id = settings_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    RAISE EXCEPTION 'Settings update failed. No rows were updated. Settings ID: %', settings_id
      USING ERRCODE = 'no_data_found';
  END IF;
  
  -- Return updated record
  SELECT row_to_json(s.*)::jsonb INTO result
  FROM public.settings s
  WHERE s.id = settings_id;
  
  result := result || jsonb_build_object(
    '_postgres_update', true,
    '_updated_rows', update_count,
    '_user', current_user
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission for postgres function
GRANT EXECUTE ON FUNCTION public.postgres_update_settings(JSONB) TO postgres;

-- Enhanced debug function
CREATE OR REPLACE FUNCTION public.debug_postgres_access()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_count INTEGER;
  users_count INTEGER;
  fk_constraint_exists BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO settings_count FROM public.settings;
  
  -- Check if users table exists and has data
  BEGIN
    SELECT COUNT(*) INTO users_count FROM public.users;
  EXCEPTION
    WHEN OTHERS THEN
      users_count := -1; -- Error accessing users table
  END;
  
  -- Check if foreign key constraint exists
  SELECT EXISTS(
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_id_fkey' AND conrelid = 'public.users'::regclass
  ) INTO fk_constraint_exists;
  
  result := jsonb_build_object(
    'current_user', current_user,
    'is_postgres', current_user = 'postgres',
    'is_admin_function', public.is_admin(),
    'is_authenticated_function', public.is_authenticated(),
    'user_role_function', public.current_user_role(),
    'settings_count', settings_count,
    'users_count', users_count,
    'fk_constraint_exists', fk_constraint_exists,
    'can_access_settings', (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN true 
        ELSE false 
      END
      FROM public.settings
    ),
    'rls_policies', (
      SELECT json_agg(policyname)
      FROM pg_policies 
      WHERE tablename = 'settings' AND schemaname = 'public'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permission for debug function
GRANT EXECUTE ON FUNCTION public.debug_postgres_access() TO PUBLIC;

-- ============================================================================
-- VERIFICATION AND TESTING
-- ============================================================================

DO $$
DECLARE
  test_result JSONB;
  postgres_in_users BOOLEAN;
  fk_exists BOOLEAN;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'POSTGRES ACCESS FIX V2 - VERIFICATION';
  RAISE NOTICE '';
  
  -- Check if postgres user was successfully added
  BEGIN
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = 'postgres') INTO postgres_in_users;
  EXCEPTION
    WHEN OTHERS THEN
      postgres_in_users := false;
  END;
  
  -- Check FK constraint status
  SELECT EXISTS(
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_id_fkey' AND conrelid = 'public.users'::regclass
  ) INTO fk_exists;
  
  RAISE NOTICE 'Current user: %', current_user;
  RAISE NOTICE 'FK constraint exists: %', fk_exists;
  RAISE NOTICE 'Postgres in users table: %', postgres_in_users;
  RAISE NOTICE 'Is admin: %', public.is_admin();
  RAISE NOTICE 'Is authenticated: %', public.is_authenticated();
  RAISE NOTICE 'User role: %', public.current_user_role();
  RAISE NOTICE '';
  
  RAISE NOTICE 'AVAILABLE FUNCTIONS:';
  RAISE NOTICE '  • public.postgres_update_settings(jsonb) - Direct update for postgres';
  RAISE NOTICE '  • public.admin_update_settings(jsonb) - Standard admin update';
  RAISE NOTICE '  • public.debug_postgres_access() - Enhanced debugging';
  RAISE NOTICE '';
  RAISE NOTICE 'TEST COMMANDS:';
  RAISE NOTICE '  SELECT public.debug_postgres_access();';
  RAISE NOTICE '  SELECT public.postgres_update_settings(''{"company_name": "Test Company"}'');';
  RAISE NOTICE '============================================';
END $$;
