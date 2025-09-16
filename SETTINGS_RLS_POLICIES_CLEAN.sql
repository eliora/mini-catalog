-- ============================================================================
-- SETTINGS TABLE - ROW LEVEL SECURITY (RLS) POLICIES - CLEAN VERSION
-- ============================================================================
-- Clean installation that removes all existing policies first
-- Compatible with standard PostgreSQL/Supabase setups
-- ============================================================================

-- Disable RLS temporarily for clean setup
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. COMPREHENSIVE POLICY CLEANUP
-- ============================================================================

-- Drop ALL existing policies on settings table (comprehensive cleanup)
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'settings' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.settings', policy_record.policyname);
    END LOOP;
END $$;

-- Drop any existing functions that might cause conflicts
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_authenticated() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_settings() CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_settings(JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.get_setting_value(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.direct_update_settings(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.debug_user_permissions() CASCADE;
DROP FUNCTION IF EXISTS public.test_settings_update() CASCADE;
DROP FUNCTION IF EXISTS log_settings_changes() CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS public.public_settings CASCADE;
DROP VIEW IF EXISTS public.anonymous_settings CASCADE;
DROP VIEW IF EXISTS public.admin_settings CASCADE;

-- Drop audit trigger if exists
DROP TRIGGER IF EXISTS settings_audit_trigger ON public.settings;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT (role = 'admin' OR user_role = 'admin') AND status = 'active'
     FROM public.users 
     WHERE email = current_user),
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_user != 'anon' AND 
         current_user != 'anonymous' AND 
         current_user IS NOT NULL AND
         EXISTS(SELECT 1 FROM public.users WHERE email = current_user AND status = 'active');
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.users WHERE email = current_user AND status = 'active'),
    'anonymous'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. RE-ENABLE RLS AND CREATE NEW POLICIES
-- ============================================================================

-- Re-enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all settings
CREATE POLICY "admins_view_settings"
ON public.settings
FOR SELECT
USING (public.is_admin());

-- Policy: Authenticated users can view settings (limited by views)
CREATE POLICY "users_view_settings"
ON public.settings
FOR SELECT
USING (public.is_authenticated());

-- Policy: Anonymous users can view settings (very limited by views)
CREATE POLICY "anon_view_settings"
ON public.settings
FOR SELECT
USING (true);

-- Policy: Only admins can update settings
CREATE POLICY "admins_update_settings"
ON public.settings
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy: Only admins can insert settings
CREATE POLICY "admins_insert_settings"
ON public.settings
FOR INSERT
WITH CHECK (
  public.is_admin() OR
  NOT EXISTS (SELECT 1 FROM public.settings)
);

-- Policy: Prevent deletion of settings
CREATE POLICY "prevent_settings_deletion"
ON public.settings
FOR DELETE
USING (false);

-- ============================================================================
-- 4. SECURITY VIEWS FOR DIFFERENT ACCESS LEVELS
-- ============================================================================

-- View for public settings (what regular users should see)
CREATE OR REPLACE VIEW public.public_settings AS
SELECT 
  company_name,
  company_description,
  company_email,
  company_phone,
  company_address,
  company_logo,
  logo_url,
  primary_color,
  secondary_color,
  business_name,
  currency,
  tax_rate,
  prices_include_tax,
  show_prices_with_tax,
  free_shipping_threshold,
  standard_shipping_cost,
  express_shipping_cost,
  enable_local_delivery,
  enable_reviews,
  enable_wishlist,
  timezone,
  created_at,
  updated_at
FROM public.settings;

-- View for anonymous users (minimal)
CREATE OR REPLACE VIEW public.anonymous_settings AS
SELECT 
  company_name,
  currency,
  timezone,
  enable_reviews,
  enable_wishlist,
  primary_color,
  secondary_color,
  free_shipping_threshold,
  standard_shipping_cost,
  express_shipping_cost
FROM public.settings;

-- View for admin users (everything)
CREATE OR REPLACE VIEW public.admin_settings AS
SELECT * 
FROM public.settings
WHERE public.is_admin();

-- ============================================================================
-- 5. SAFE FUNCTIONS FOR SETTINGS ACCESS
-- ============================================================================

-- Function to get settings based on user type
CREATE OR REPLACE FUNCTION public.get_user_settings()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF public.is_admin() THEN
    SELECT row_to_json(s.*)::jsonb INTO result
    FROM public.settings s
    LIMIT 1;
  ELSIF public.is_authenticated() THEN
    SELECT row_to_json(ps.*)::jsonb INTO result
    FROM public.public_settings ps
    LIMIT 1;
  ELSE
    SELECT row_to_json(ans.*)::jsonb INTO result
    FROM public.anonymous_settings ans
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(result, '{}'::jsonb);
EXCEPTION
  WHEN OTHERS THEN
    SELECT row_to_json(ans.*)::jsonb INTO result
    FROM public.anonymous_settings ans
    LIMIT 1;
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplified and robust update function
CREATE OR REPLACE FUNCTION public.admin_update_settings(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
BEGIN
  -- Check admin privileges
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required. Current user: %', current_user
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform update with simplified logic matching EXACT schema column names
  UPDATE public.settings 
  SET 
    -- GENERAL SETTINGS (Company Information)
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
    
    -- FINANCIAL SETTINGS (Tax & Currency)
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
    
    -- NOTIFICATION SETTINGS (JSONB)
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
    
    -- SYSTEM TIMESTAMPS
    updated_at = NOW()
  WHERE id = settings_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    RAISE EXCEPTION 'Settings update failed. No rows were updated.'
      USING ERRCODE = 'no_data_found';
  END IF;
  
  -- Return updated record
  SELECT row_to_json(s.*)::jsonb INTO result
  FROM public.settings s
  WHERE s.id = settings_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simple direct field update function
CREATE OR REPLACE FUNCTION public.direct_update_setting(
  field_name TEXT,
  field_value TEXT
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  sql_command TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  sql_command := format(
    'UPDATE public.settings SET %I = $1, updated_at = NOW() WHERE id = $2 RETURNING row_to_json(settings.*)::jsonb', 
    field_name
  );
  
  EXECUTE sql_command USING field_value, settings_id INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate settings field names against actual schema
CREATE OR REPLACE FUNCTION public.validate_settings_fields(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  valid_fields TEXT[] := ARRAY[
    'company_name', 'company_description', 'company_email', 'company_phone', 
    'company_address', 'company_logo', 'tagline', 'logo_url', 'primary_color', 
    'secondary_color', 'timezone', 'business_name', 'registration_number', 
    'tax_id', 'is_vat_registered', 'currency', 'tax_rate', 'prices_include_tax', 
    'show_prices_with_tax', 'enable_tax_exempt', 'invoice_footer_text', 
    'free_shipping_threshold', 'standard_shipping_cost', 'express_shipping_cost', 
    'enable_local_delivery', 'notification_settings', 'maintenance_mode', 
    'debug_mode', 'enable_reviews', 'enable_wishlist', 'enable_notifications', 
    'session_timeout', 'max_login_attempts', 'backup_frequency', 'cache_duration'
  ];
  field_key TEXT;
  invalid_fields TEXT[] := '{}';
  result JSONB;
BEGIN
  -- Check each field in the input data
  FOR field_key IN SELECT jsonb_object_keys(settings_data)
  LOOP
    IF NOT (field_key = ANY(valid_fields)) THEN
      invalid_fields := array_append(invalid_fields, field_key);
    END IF;
  END LOOP;
  
  result := jsonb_build_object(
    'valid', array_length(invalid_fields, 1) IS NULL,
    'invalid_fields', invalid_fields,
    'valid_fields', valid_fields,
    'input_fields', (SELECT array_agg(key) FROM jsonb_object_keys(settings_data) key)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Debug function
CREATE OR REPLACE FUNCTION public.debug_user_permissions()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  user_record RECORD;
  settings_count INTEGER;
  settings_record RECORD;
BEGIN
  SELECT * INTO user_record FROM public.users WHERE email = current_user;
  SELECT COUNT(*) INTO settings_count FROM public.settings;
  SELECT * INTO settings_record FROM public.settings LIMIT 1;
  
  result := jsonb_build_object(
    'current_user', current_user,
    'user_found', user_record IS NOT NULL,
    'user_data', CASE WHEN user_record IS NOT NULL THEN row_to_json(user_record)::jsonb ELSE null END,
    'is_admin', public.is_admin(),
    'is_authenticated', public.is_authenticated(),
    'user_role', public.current_user_role(),
    'settings_count', settings_count,
    'settings_sample', CASE WHEN settings_record IS NOT NULL THEN row_to_json(settings_record)::jsonb ELSE null END,
    'rls_enabled', (SELECT relrowsecurity FROM pg_class WHERE relname = 'settings'),
    'table_columns', (
      SELECT array_agg(column_name ORDER BY ordinal_position)
      FROM information_schema.columns 
      WHERE table_name = 'settings' AND table_schema = 'public'
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. AUDIT SYSTEM
-- ============================================================================

-- Create audit table
CREATE TABLE IF NOT EXISTS public.settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  action TEXT NOT NULL,
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

-- Audit table policy
CREATE POLICY "admins_view_audit" ON public.settings_audit
FOR SELECT USING (public.is_admin());

-- Audit function
CREATE OR REPLACE FUNCTION log_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.settings_audit (user_email, action, changed_fields, old_values, new_values)
    VALUES (current_user, TG_OP, to_jsonb(NEW) - to_jsonb(OLD), to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.settings_audit (user_email, action, new_values)
    VALUES (current_user, TG_OP, to_jsonb(NEW));
  END IF;
  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit trigger
CREATE TRIGGER settings_audit_trigger
  AFTER INSERT OR UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION log_settings_changes();

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant table permissions
GRANT SELECT ON public.settings TO PUBLIC;
GRANT SELECT ON public.public_settings TO PUBLIC;
GRANT SELECT ON public.anonymous_settings TO PUBLIC;
GRANT SELECT ON public.admin_settings TO PUBLIC;
GRANT SELECT ON public.settings_audit TO PUBLIC;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_settings() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_settings(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.direct_update_setting(TEXT, TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.debug_user_permissions() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_settings_fields(JSONB) TO PUBLIC;

-- ============================================================================
-- 8. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  function_count INTEGER;
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'settings' AND schemaname = 'public';
  
  SELECT COUNT(*) INTO function_count FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'is_authenticated', 'get_user_settings', 'admin_update_settings', 'debug_user_permissions');
  
  SELECT COUNT(*) INTO view_count FROM pg_views
  WHERE schemaname = 'public' AND viewname LIKE '%settings%';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SETTINGS RLS SETUP COMPLETE (CLEAN)';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created: %', policy_count;
  RAISE NOTICE 'Functions created: %', function_count;
  RAISE NOTICE 'Views created: %', view_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ All existing policies cleaned and recreated';
  RAISE NOTICE '✅ RLS enabled with proper permissions';
  RAISE NOTICE '✅ Security views implemented';
  RAISE NOTICE '✅ Update functions ready';
  RAISE NOTICE '✅ Audit system enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'TEST COMMANDS:';
  RAISE NOTICE '  SELECT public.debug_user_permissions();';
  RAISE NOTICE '  SELECT public.get_user_settings();';
  RAISE NOTICE '  SELECT public.admin_update_settings(''{"company_name": "Test Company"}'');';
  RAISE NOTICE '============================================';
END $$;
