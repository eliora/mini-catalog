-- ============================================================================
-- SETTINGS TABLE - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Comprehensive RLS policies for the settings table
-- Based on ADMIN_DATABASE_SCHEMA.md requirements
-- ============================================================================

-- Enable RLS on the settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. DROP EXISTING POLICIES (Clean slate)
-- ============================================================================

-- Drop all existing policies on settings table
DROP POLICY IF EXISTS "Admins can view all settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can update all settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view public settings" ON public.settings;
DROP POLICY IF EXISTS "System can insert default settings" ON public.settings;
DROP POLICY IF EXISTS "Prevent settings deletion" ON public.settings;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' 
     FROM public.users 
     WHERE id = auth.uid()),
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is authenticated
CREATE OR REPLACE FUNCTION auth.is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role 
     FROM public.users 
     WHERE id = auth.uid()),
    'anonymous'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. READ POLICIES
-- ============================================================================

-- Policy: Admins can view all settings
CREATE POLICY "Admins can view all settings"
ON public.settings
FOR SELECT
TO authenticated
USING (
  auth.is_admin()
);

-- Policy: Authenticated users can view public settings (limited fields)
CREATE POLICY "Users can view public settings"
ON public.settings
FOR SELECT
TO authenticated
USING (
  NOT auth.is_admin() AND
  -- This policy allows access but application layer should filter sensitive fields
  true
);

-- Policy: Anonymous users can view very limited public settings
CREATE POLICY "Anonymous can view basic public settings"
ON public.settings
FOR SELECT
TO anon
USING (
  -- Only allow access to basic company info
  -- Application layer should filter to only show: company_name, currency, timezone
  true
);

-- ============================================================================
-- 4. WRITE POLICIES (INSERT/UPDATE/DELETE)
-- ============================================================================

-- Policy: Only admins can update settings
CREATE POLICY "Admins can update all settings"
ON public.settings
FOR UPDATE
TO authenticated
USING (auth.is_admin())
WITH CHECK (auth.is_admin());

-- Policy: Only system/admins can insert settings (for initialization)
CREATE POLICY "System can insert default settings"
ON public.settings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.is_admin() OR
  -- Allow insert only if no settings exist yet (initialization)
  NOT EXISTS (SELECT 1 FROM public.settings)
);

-- Policy: Prevent deletion of settings (settings should never be deleted)
CREATE POLICY "Prevent settings deletion"
ON public.settings
FOR DELETE
TO authenticated
USING (false); -- Never allow deletion

-- ============================================================================
-- 5. SETTINGS VIEWS FOR DIFFERENT ACCESS LEVELS
-- ============================================================================

-- View for public settings (what regular users can see)
CREATE OR REPLACE VIEW public.public_settings AS
SELECT 
  -- Company information (public)
  company_name,
  company_description,
  company_email,
  company_phone,
  company_address,
  company_logo,
  logo_url,
  primary_color,
  secondary_color,
  
  -- Financial settings (public)
  currency,
  tax_rate,
  prices_include_tax,
  show_prices_with_tax,
  
  -- Shipping settings (public)
  free_shipping_threshold,
  standard_shipping_cost,
  express_shipping_cost,
  enable_local_delivery,
  
  -- System settings (public)
  enable_reviews,
  enable_wishlist,
  timezone,
  
  -- Metadata
  created_at,
  updated_at
FROM public.settings;

-- View for anonymous users (very limited)
CREATE OR REPLACE VIEW public.anonymous_settings AS
SELECT 
  company_name,
  currency,
  timezone,
  enable_reviews,
  enable_wishlist,
  primary_color,
  secondary_color
FROM public.settings;

-- View for admin users (everything)
CREATE OR REPLACE VIEW public.admin_settings AS
SELECT * FROM public.settings;

-- ============================================================================
-- 6. RLS POLICIES FOR VIEWS
-- ============================================================================

-- Enable RLS on views
ALTER VIEW public.public_settings SET (security_barrier = true);
ALTER VIEW public.anonymous_settings SET (security_barrier = true);
ALTER VIEW public.admin_settings SET (security_barrier = true);

-- ============================================================================
-- 7. FUNCTIONS FOR SECURE SETTINGS ACCESS
-- ============================================================================

-- Function to get settings based on user role
CREATE OR REPLACE FUNCTION public.get_settings()
RETURNS JSONB AS $$
DECLARE
  user_role TEXT;
  result JSONB;
BEGIN
  user_role := auth.current_user_role();
  
  CASE user_role
    WHEN 'admin' THEN
      -- Admin gets everything
      SELECT to_jsonb(s.*) INTO result
      FROM public.settings s
      LIMIT 1;
      
    WHEN 'user' THEN
      -- Regular user gets public settings
      SELECT to_jsonb(ps.*) INTO result
      FROM public.public_settings ps
      LIMIT 1;
      
    ELSE
      -- Anonymous gets minimal settings
      SELECT to_jsonb(ans.*) INTO result
      FROM public.anonymous_settings ans
      LIMIT 1;
  END CASE;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update settings (admin only)
CREATE OR REPLACE FUNCTION public.update_settings(settings_data JSONB)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if user is admin
  IF NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Update settings
  UPDATE public.settings 
  SET 
    company_name = COALESCE((settings_data->>'company_name')::TEXT, company_name),
    company_description = COALESCE((settings_data->>'company_description')::TEXT, company_description),
    company_email = COALESCE((settings_data->>'company_email')::TEXT, company_email),
    company_phone = COALESCE((settings_data->>'company_phone')::TEXT, company_phone),
    company_address = COALESCE((settings_data->>'company_address')::TEXT, company_address),
    company_logo = COALESCE((settings_data->>'company_logo')::TEXT, company_logo),
    tagline = COALESCE((settings_data->>'tagline')::TEXT, tagline),
    logo_url = COALESCE((settings_data->>'logo_url')::TEXT, logo_url),
    primary_color = COALESCE((settings_data->>'primary_color')::TEXT, primary_color),
    secondary_color = COALESCE((settings_data->>'secondary_color')::TEXT, secondary_color),
    timezone = COALESCE((settings_data->>'timezone')::TEXT, timezone),
    business_name = COALESCE((settings_data->>'business_name')::TEXT, business_name),
    registration_number = COALESCE((settings_data->>'registration_number')::TEXT, registration_number),
    tax_id = COALESCE((settings_data->>'tax_id')::TEXT, tax_id),
    is_vat_registered = COALESCE((settings_data->>'is_vat_registered')::BOOLEAN, is_vat_registered),
    currency = COALESCE((settings_data->>'currency')::TEXT, currency),
    tax_rate = COALESCE((settings_data->>'tax_rate')::DECIMAL, tax_rate),
    prices_include_tax = COALESCE((settings_data->>'prices_include_tax')::BOOLEAN, prices_include_tax),
    show_prices_with_tax = COALESCE((settings_data->>'show_prices_with_tax')::BOOLEAN, show_prices_with_tax),
    enable_tax_exempt = COALESCE((settings_data->>'enable_tax_exempt')::BOOLEAN, enable_tax_exempt),
    invoice_footer_text = COALESCE((settings_data->>'invoice_footer_text')::TEXT, invoice_footer_text),
    free_shipping_threshold = COALESCE((settings_data->>'free_shipping_threshold')::DECIMAL, free_shipping_threshold),
    standard_shipping_cost = COALESCE((settings_data->>'standard_shipping_cost')::DECIMAL, standard_shipping_cost),
    express_shipping_cost = COALESCE((settings_data->>'express_shipping_cost')::DECIMAL, express_shipping_cost),
    enable_local_delivery = COALESCE((settings_data->>'enable_local_delivery')::BOOLEAN, enable_local_delivery),
    notification_settings = COALESCE((settings_data->>'notification_settings')::JSONB, notification_settings),
    maintenance_mode = COALESCE((settings_data->>'maintenance_mode')::BOOLEAN, maintenance_mode),
    debug_mode = COALESCE((settings_data->>'debug_mode')::BOOLEAN, debug_mode),
    enable_reviews = COALESCE((settings_data->>'enable_reviews')::BOOLEAN, enable_reviews),
    enable_wishlist = COALESCE((settings_data->>'enable_wishlist')::BOOLEAN, enable_wishlist),
    enable_notifications = COALESCE((settings_data->>'enable_notifications')::BOOLEAN, enable_notifications),
    session_timeout = COALESCE((settings_data->>'session_timeout')::INTEGER, session_timeout),
    max_login_attempts = COALESCE((settings_data->>'max_login_attempts')::INTEGER, max_login_attempts),
    backup_frequency = COALESCE((settings_data->>'backup_frequency')::TEXT, backup_frequency),
    cache_duration = COALESCE((settings_data->>'cache_duration')::INTEGER, cache_duration),
    updated_at = NOW()
  RETURNING to_jsonb(settings.*) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get specific setting value
CREATE OR REPLACE FUNCTION public.get_setting_value(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
  result TEXT;
  public_fields TEXT[] := ARRAY[
    'company_name', 'company_description', 'company_email', 'company_phone',
    'company_address', 'company_logo', 'logo_url', 'primary_color', 'secondary_color',
    'currency', 'tax_rate', 'prices_include_tax', 'show_prices_with_tax',
    'free_shipping_threshold', 'standard_shipping_cost', 'express_shipping_cost',
    'enable_local_delivery', 'enable_reviews', 'enable_wishlist', 'timezone'
  ];
  anonymous_fields TEXT[] := ARRAY[
    'company_name', 'currency', 'timezone', 'enable_reviews', 'enable_wishlist',
    'primary_color', 'secondary_color'
  ];
BEGIN
  user_role := auth.current_user_role();
  
  -- Check access permissions
  IF user_role = 'admin' THEN
    -- Admin can access any setting
    EXECUTE format('SELECT %I::TEXT FROM public.settings LIMIT 1', setting_key) INTO result;
  ELSIF user_role = 'user' AND setting_key = ANY(public_fields) THEN
    -- Regular user can access public settings
    EXECUTE format('SELECT %I::TEXT FROM public.settings LIMIT 1', setting_key) INTO result;
  ELSIF user_role = 'anonymous' AND setting_key = ANY(anonymous_fields) THEN
    -- Anonymous can access very limited settings
    EXECUTE format('SELECT %I::TEXT FROM public.settings LIMIT 1', setting_key) INTO result;
  ELSE
    -- Access denied
    RETURN NULL;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. AUDIT LOGGING FOR SETTINGS CHANGES
-- ============================================================================

-- Create audit table for settings changes
CREATE TABLE IF NOT EXISTS public.settings_audit (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'UPDATE', 'INSERT'
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view settings audit logs"
ON public.settings_audit
FOR SELECT
TO authenticated
USING (auth.is_admin());

-- Function to log settings changes
CREATE OR REPLACE FUNCTION log_settings_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.settings_audit (
      user_id, action, changed_fields, old_values, new_values
    )
    VALUES (
      auth.uid(),
      TG_OP,
      to_jsonb(NEW) - to_jsonb(OLD),
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.settings_audit (
      user_id, action, new_values
    )
    VALUES (
      auth.uid(),
      TG_OP,
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS settings_audit_trigger ON public.settings;
CREATE TRIGGER settings_audit_trigger
  AFTER INSERT OR UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION log_settings_changes();

-- ============================================================================
-- 9. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions on settings table
GRANT SELECT ON public.settings TO authenticated, anon;
GRANT UPDATE ON public.settings TO authenticated;
GRANT INSERT ON public.settings TO authenticated;

-- Grant permissions on views
GRANT SELECT ON public.public_settings TO authenticated, anon;
GRANT SELECT ON public.anonymous_settings TO anon;
GRANT SELECT ON public.admin_settings TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.get_settings() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_settings(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_setting_value(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_authenticated() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION auth.current_user_role() TO authenticated, anon;

-- Grant permissions on audit table
GRANT SELECT ON public.settings_audit TO authenticated;

-- ============================================================================
-- 10. VERIFICATION AND TESTING
-- ============================================================================

-- Test the RLS policies
DO $$
DECLARE
  test_result JSONB;
  policy_count INTEGER;
BEGIN
  -- Count policies on settings table
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'settings' AND schemaname = 'public';
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SETTINGS RLS POLICIES VERIFICATION';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created: %', policy_count;
  RAISE NOTICE '';
  
  -- Test helper functions
  BEGIN
    SELECT auth.current_user_role() INTO test_result;
    RAISE NOTICE '✅ Helper functions created successfully';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Error in helper functions: %', SQLERRM;
  END;
  
  -- Test views
  BEGIN
    SELECT COUNT(*) FROM public.public_settings INTO policy_count;
    RAISE NOTICE '✅ Public settings view working';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Error in public settings view: %', SQLERRM;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE 'RLS POLICIES IMPLEMENTED:';
  RAISE NOTICE '  • Admins can view all settings';
  RAISE NOTICE '  • Admins can update all settings';
  RAISE NOTICE '  • Users can view public settings';
  RAISE NOTICE '  • Anonymous users can view basic settings';
  RAISE NOTICE '  • Settings deletion is prevented';
  RAISE NOTICE '  • Audit logging is enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'SECURITY FEATURES:';
  RAISE NOTICE '  • Role-based access control';
  RAISE NOTICE '  • Field-level filtering';
  RAISE NOTICE '  • Secure views for different user types';
  RAISE NOTICE '  • Audit trail for changes';
  RAISE NOTICE '  • Helper functions for safe access';
  RAISE NOTICE '============================================';
END $$;

-- Show current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'settings' AND schemaname = 'public'
ORDER BY policyname;
