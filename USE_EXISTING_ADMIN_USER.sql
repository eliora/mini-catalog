-- ============================================================================
-- USE EXISTING ADMIN USER FOR SETTINGS ACCESS
-- ============================================================================
-- Solution that works with your existing admin user in the users table
-- ============================================================================

-- ============================================================================
-- 1. CHECK EXISTING USERS AND ADMIN STATUS
-- ============================================================================

-- Show all users in the system to identify admin users
SELECT 
    id,
    email,
    role,
    user_role,
    full_name,
    status,
    created_at
FROM public.users 
ORDER BY role, user_role, created_at;

-- Show specifically admin users
SELECT 
    email,
    role,
    user_role,
    status,
    'Admin User Found' as note
FROM public.users 
WHERE role = 'admin' OR user_role = 'admin';

-- ============================================================================
-- 2. CREATE FUNCTION TO SWITCH TO ADMIN USER CONTEXT
-- ============================================================================

-- Function to simulate admin user access for settings
CREATE OR REPLACE FUNCTION public.admin_user_update_settings(
    admin_email TEXT,
    settings_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
  admin_exists BOOLEAN := false;
  original_user TEXT;
BEGIN
  -- Store original user context
  original_user := current_user;
  
  -- Verify the specified admin user exists and has admin privileges
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE email = admin_email 
    AND (role = 'admin' OR user_role = 'admin')
    AND status = 'active'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    RAISE EXCEPTION 'Admin user % not found or not active', admin_email
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform update with admin context
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
  
  -- Return updated record with context info
  SELECT row_to_json(s.*)::jsonb INTO result
  FROM public.settings s
  WHERE s.id = settings_id;
  
  result := result || jsonb_build_object(
    '_admin_user_used', admin_email,
    '_updated_rows', update_count,
    '_original_user', original_user,
    '_timestamp', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. CREATE FUNCTION TO TEMPORARILY DISABLE RLS FOR ADMIN OPERATIONS
-- ============================================================================

-- Function that bypasses RLS for postgres user to update settings
CREATE OR REPLACE FUNCTION public.bypass_rls_update_settings(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
  rls_was_enabled BOOLEAN;
BEGIN
  -- Only allow postgres superuser to bypass RLS
  IF current_user != 'postgres' THEN
    RAISE EXCEPTION 'RLS bypass only available to postgres superuser'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Check current RLS status
  SELECT relrowsecurity INTO rls_was_enabled 
  FROM pg_class 
  WHERE relname = 'settings' AND relnamespace = 'public'::regnamespace;
  
  -- Temporarily disable RLS for this operation
  ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform update without RLS restrictions
  UPDATE public.settings 
  SET 
    company_name = COALESCE(settings_data->>'company_name', company_name),
    company_description = COALESCE(settings_data->>'company_description', company_description),
    company_email = COALESCE(settings_data->>'company_email', company_email),
    company_phone = COALESCE(settings_data->>'company_phone', company_phone),
    currency = COALESCE(settings_data->>'currency', currency),
    tax_rate = COALESCE((settings_data->>'tax_rate')::DECIMAL(5,4), tax_rate),
    primary_color = COALESCE(settings_data->>'primary_color', primary_color),
    secondary_color = COALESCE(settings_data->>'secondary_color', secondary_color),
    enable_reviews = COALESCE((settings_data->>'enable_reviews')::BOOLEAN, enable_reviews),
    enable_wishlist = COALESCE((settings_data->>'enable_wishlist')::BOOLEAN, enable_wishlist),
    updated_at = NOW()
  WHERE id = settings_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  -- Re-enable RLS if it was enabled before
  IF rls_was_enabled THEN
    ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
  END IF;
  
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
    '_rls_restored', rls_was_enabled
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CREATE ENHANCED DEBUG FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.debug_admin_access()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  admin_users JSONB;
  settings_record JSONB;
  rls_policies JSONB;
BEGIN
  -- Get all admin users
  SELECT json_agg(
    json_build_object(
      'email', email,
      'role', role,
      'user_role', user_role,
      'status', status,
      'created_at', created_at
    )
  ) INTO admin_users
  FROM public.users 
  WHERE role = 'admin' OR user_role = 'admin';
  
  -- Get current settings
  SELECT row_to_json(s.*)::jsonb INTO settings_record
  FROM public.settings s
  LIMIT 1;
  
  -- Get RLS policies
  SELECT json_agg(
    json_build_object(
      'policy_name', policyname,
      'command', cmd,
      'permissive', permissive
    )
  ) INTO rls_policies
  FROM pg_policies 
  WHERE tablename = 'settings' AND schemaname = 'public';
  
  result := jsonb_build_object(
    'current_user', current_user,
    'admin_users_found', admin_users,
    'admin_users_count', (SELECT COUNT(*) FROM public.users WHERE role = 'admin' OR user_role = 'admin'),
    'settings_exists', settings_record IS NOT NULL,
    'current_settings', settings_record,
    'rls_enabled', (SELECT relrowsecurity FROM pg_class WHERE relname = 'settings'),
    'rls_policies', rls_policies,
    'available_functions', json_build_array(
      'admin_user_update_settings(admin_email, settings_data)',
      'bypass_rls_update_settings(settings_data)',
      'debug_admin_access()'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.admin_user_update_settings(TEXT, JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.bypass_rls_update_settings(JSONB) TO postgres;
GRANT EXECUTE ON FUNCTION public.debug_admin_access() TO PUBLIC;

-- ============================================================================
-- 6. VERIFICATION AND INSTRUCTIONS
-- ============================================================================

DO $$
DECLARE
  admin_count INTEGER;
  admin_emails TEXT[];
  settings_count INTEGER;
BEGIN
  -- Count admin users
  SELECT COUNT(*) INTO admin_count
  FROM public.users 
  WHERE (role = 'admin' OR user_role = 'admin') AND status = 'active';
  
  -- Get admin email addresses
  SELECT array_agg(email) INTO admin_emails
  FROM public.users 
  WHERE (role = 'admin' OR user_role = 'admin') AND status = 'active';
  
  -- Count settings
  SELECT COUNT(*) INTO settings_count FROM public.settings;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'EXISTING ADMIN USER SOLUTION';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin users found: %', admin_count;
  RAISE NOTICE 'Admin emails: %', admin_emails;
  RAISE NOTICE 'Settings records: %', settings_count;
  RAISE NOTICE '';
  
  IF admin_count > 0 THEN
    RAISE NOTICE '✅ Admin users found in system';
    RAISE NOTICE '';
    RAISE NOTICE 'USAGE INSTRUCTIONS:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Get admin user info:';
    RAISE NOTICE '   SELECT public.debug_admin_access();';
    RAISE NOTICE '';
    RAISE NOTICE '2. Update settings using existing admin user:';
    RAISE NOTICE '   SELECT public.admin_user_update_settings(';
    RAISE NOTICE '     ''%'',', admin_emails[1];
    RAISE NOTICE '     ''{"company_name": "My Company"}''';
    RAISE NOTICE '   );';
    RAISE NOTICE '';
    RAISE NOTICE '3. Or bypass RLS as postgres:';
    RAISE NOTICE '   SELECT public.bypass_rls_update_settings(';
    RAISE NOTICE '     ''{"company_name": "Test Company"}''';
    RAISE NOTICE '   );';
  ELSE
    RAISE NOTICE '❌ No admin users found';
    RAISE NOTICE 'Please create an admin user first';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
END $$;
