-- ============================================================================
-- UPDATE SETTINGS USING EXISTING ADMIN USER
-- ============================================================================
-- Using your existing admin users to update settings
-- Admin users found: admin1@gisele.co.il and a.elior@gmail.com
-- ============================================================================

-- ============================================================================
-- 1. VERIFY YOUR ADMIN USERS
-- ============================================================================

-- Show your current admin users
SELECT 
    id,
    email,
    role,
    user_role,
    full_name,
    status,
    'This user can update settings' as note
FROM public.users 
WHERE email IN ('admin1@gisele.co.il', 'a.elior@gmail.com')
AND status = 'active';

-- ============================================================================
-- 2. CREATE SIMPLE FUNCTION TO UPDATE SETTINGS AS ADMIN USER
-- ============================================================================

-- Function that uses your existing admin user context
CREATE OR REPLACE FUNCTION public.update_settings_as_admin(
    admin_email TEXT,
    settings_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  settings_id UUID;
  update_count INTEGER := 0;
  admin_user_id UUID;
  admin_verified BOOLEAN := false;
BEGIN
  -- Verify the admin user exists and has proper permissions
  SELECT id INTO admin_user_id
  FROM public.users 
  WHERE email = admin_email 
  AND (role = 'admin' OR user_role = 'admin')
  AND status = 'active';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user % not found or not active. Available admins: admin1@gisele.co.il, a.elior@gmail.com', admin_email
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  admin_verified := true;
  
  -- Get or create settings record
  SELECT id INTO settings_id FROM public.settings LIMIT 1;
  
  IF settings_id IS NULL THEN
    INSERT INTO public.settings DEFAULT VALUES
    RETURNING id INTO settings_id;
  END IF;
  
  -- Perform the settings update
  UPDATE public.settings 
  SET 
    -- Company Information
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
    
    -- Business Settings
    business_name = COALESCE(settings_data->>'business_name', business_name),
    registration_number = COALESCE(settings_data->>'registration_number', registration_number),
    tax_id = COALESCE(settings_data->>'tax_id', tax_id),
    is_vat_registered = COALESCE((settings_data->>'is_vat_registered')::BOOLEAN, is_vat_registered),
    
    -- Financial Settings
    currency = COALESCE(settings_data->>'currency', currency),
    tax_rate = COALESCE((settings_data->>'tax_rate')::DECIMAL(5,4), tax_rate),
    prices_include_tax = COALESCE((settings_data->>'prices_include_tax')::BOOLEAN, prices_include_tax),
    show_prices_with_tax = COALESCE((settings_data->>'show_prices_with_tax')::BOOLEAN, show_prices_with_tax),
    enable_tax_exempt = COALESCE((settings_data->>'enable_tax_exempt')::BOOLEAN, enable_tax_exempt),
    invoice_footer_text = COALESCE(settings_data->>'invoice_footer_text', invoice_footer_text),
    
    -- Shipping Settings
    free_shipping_threshold = COALESCE((settings_data->>'free_shipping_threshold')::DECIMAL(10,2), free_shipping_threshold),
    standard_shipping_cost = COALESCE((settings_data->>'standard_shipping_cost')::DECIMAL(10,2), standard_shipping_cost),
    express_shipping_cost = COALESCE((settings_data->>'express_shipping_cost')::DECIMAL(10,2), express_shipping_cost),
    enable_local_delivery = COALESCE((settings_data->>'enable_local_delivery')::BOOLEAN, enable_local_delivery),
    
    -- Notification Settings
    notification_settings = COALESCE((settings_data->'notification_settings'), notification_settings),
    
    -- System Settings
    maintenance_mode = COALESCE((settings_data->>'maintenance_mode')::BOOLEAN, maintenance_mode),
    debug_mode = COALESCE((settings_data->>'debug_mode')::BOOLEAN, debug_mode),
    enable_reviews = COALESCE((settings_data->>'enable_reviews')::BOOLEAN, enable_reviews),
    enable_wishlist = COALESCE((settings_data->>'enable_wishlist')::BOOLEAN, enable_wishlist),
    enable_notifications = COALESCE((settings_data->>'enable_notifications')::BOOLEAN, enable_notifications),
    session_timeout = COALESCE((settings_data->>'session_timeout')::INTEGER, session_timeout),
    max_login_attempts = COALESCE((settings_data->>'max_login_attempts')::INTEGER, max_login_attempts),
    backup_frequency = COALESCE(settings_data->>'backup_frequency', backup_frequency),
    cache_duration = COALESCE((settings_data->>'cache_duration')::INTEGER, cache_duration),
    
    -- Update timestamp
    updated_at = NOW()
  WHERE id = settings_id;
  
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    RAISE EXCEPTION 'Settings update failed. No rows were updated. Settings ID: %', settings_id
      USING ERRCODE = 'no_data_found';
  END IF;
  
  -- Return the updated settings with metadata
  SELECT row_to_json(s.*)::jsonb INTO result
  FROM public.settings s
  WHERE s.id = settings_id;
  
  -- Add success metadata
  result := result || jsonb_build_object(
    '_success', true,
    '_admin_user', admin_email,
    '_admin_user_id', admin_user_id,
    '_updated_rows', update_count,
    '_updated_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_settings_as_admin(TEXT, JSONB) TO PUBLIC;

-- ============================================================================
-- 3. TEST THE FUNCTION WITH YOUR ADMIN USER
-- ============================================================================

-- Test with admin1@gisele.co.il
SELECT public.update_settings_as_admin(
    'admin1@gisele.co.il',
    '{
        "company_name": "Gisele Company",
        "company_email": "admin1@gisele.co.il",
        "currency": "ILS",
        "tax_rate": "0.17",
        "primary_color": "#1976d2",
        "enable_reviews": true
    }'
);

-- ============================================================================
-- 4. READY-TO-USE UPDATE EXAMPLES
-- ============================================================================

-- Example 1: Update basic company information
/*
SELECT public.update_settings_as_admin(
    'admin1@gisele.co.il',
    '{
        "company_name": "Your Company Name",
        "company_description": "Your company description",
        "company_email": "contact@yourcompany.com",
        "company_phone": "+972-XX-XXX-XXXX"
    }'
);
*/

-- Example 2: Update financial settings
/*
SELECT public.update_settings_as_admin(
    'a.elior@gmail.com', 
    '{
        "currency": "ILS",
        "tax_rate": "0.17",
        "prices_include_tax": true,
        "is_vat_registered": true
    }'
);
*/

-- Example 3: Update theme colors
/*
SELECT public.update_settings_as_admin(
    'admin1@gisele.co.il',
    '{
        "primary_color": "#1976d2",
        "secondary_color": "#dc004e"
    }'
);
*/

-- Example 4: Update system features
/*
SELECT public.update_settings_as_admin(
    'admin1@gisele.co.il',
    '{
        "enable_reviews": true,
        "enable_wishlist": true,
        "session_timeout": 3600,
        "max_login_attempts": 5
    }'
);
*/

-- ============================================================================
-- 5. VERIFY THE RESULTS
-- ============================================================================

-- Check current settings
SELECT 
    company_name,
    company_email,
    currency,
    tax_rate,
    primary_color,
    enable_reviews,
    updated_at
FROM public.settings;

-- ============================================================================
-- 6. USAGE INSTRUCTIONS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'SETTINGS UPDATE WITH EXISTING ADMIN USER';
  RAISE NOTICE '';
  RAISE NOTICE 'Your admin users:';
  RAISE NOTICE '  • admin1@gisele.co.il (Elior)';
  RAISE NOTICE '  • a.elior@gmail.com (Elior)';
  RAISE NOTICE '';
  RAISE NOTICE 'TO UPDATE SETTINGS, USE:';
  RAISE NOTICE '';
  RAISE NOTICE 'SELECT public.update_settings_as_admin(';
  RAISE NOTICE '    ''admin1@gisele.co.il'',';
  RAISE NOTICE '    ''{"company_name": "Your Company Name"}''';
  RAISE NOTICE ');';
  RAISE NOTICE '';
  RAISE NOTICE 'AVAILABLE FIELDS TO UPDATE:';
  RAISE NOTICE '  • company_name, company_description, company_email';
  RAISE NOTICE '  • currency, tax_rate, primary_color, secondary_color';
  RAISE NOTICE '  • enable_reviews, enable_wishlist';
  RAISE NOTICE '  • And many more...';
  RAISE NOTICE '';
  RAISE NOTICE 'The function above already tested with admin1@gisele.co.il!';
  RAISE NOTICE '============================================';
END $$;
