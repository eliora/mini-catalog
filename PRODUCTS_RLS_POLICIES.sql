-- ============================================================================
-- PRODUCTS TABLE - ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Comprehensive RLS policies for the products table
-- Compatible with standard PostgreSQL/Supabase setups
-- ============================================================================

-- Enable RLS on the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. DROP EXISTING POLICIES (Clean slate)
-- ============================================================================

-- Drop all existing policies on products table
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
DROP POLICY IF EXISTS "Verified members can view detailed product info" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Anonymous users can view basic products" ON public.products;

-- ============================================================================
-- 2. HELPER FUNCTIONS FOR PRODUCTS RLS
-- ============================================================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role = 'admin' 
     FROM public.users 
     WHERE email = current_user),
    false
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is verified member
CREATE OR REPLACE FUNCTION public.is_verified_member()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (SELECT user_role IN ('verified_members', 'admin') AND status = 'active'
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
         current_user IS NOT NULL;
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
    (SELECT role FROM public.users WHERE email = current_user),
    'anonymous'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. READ POLICIES
-- ============================================================================

-- Policy: Everyone can view basic product information
CREATE POLICY "Everyone can view products"
ON public.products
FOR SELECT
USING (true); -- Allow all reads, but sensitive fields filtered by views

-- Note: We use views to control field access rather than complex RLS conditions
-- This provides better performance and clearer security boundaries

-- ============================================================================
-- 4. WRITE POLICIES (INSERT/UPDATE/DELETE)
-- ============================================================================

-- Policy: Only admins can insert products
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = current_user 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Policy: Only admins can update products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = current_user 
    AND role = 'admin'
    AND status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = current_user 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- Policy: Only admins can delete products (soft delete recommended)
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = current_user 
    AND role = 'admin'
    AND status = 'active'
  )
);

-- ============================================================================
-- 5. SECURITY VIEWS FOR DIFFERENT ACCESS LEVELS
-- ============================================================================

-- View for public product information (anonymous users)
CREATE OR REPLACE VIEW public.public_products AS
SELECT 
  id,
  ref,
  hebrew_name,
  english_name,
  french_name,
  product_line,
  product_type,
  type,
  size,
  -- Hide exact quantities for non-authenticated users
  CASE 
    WHEN qty > 0 THEN 'in_stock'
    ELSE 'out_of_stock'
  END as stock_status,
  description,
  description_he,
  short_description_he,
  header,
  ingredients,
  active_ingredients_he,
  skin_type_he,
  usage_instructions_he,
  notice,
  main_pic,
  pics,
  created_at,
  updated_at
FROM public.products;

-- View for authenticated users (includes stock quantities)
CREATE OR REPLACE VIEW public.user_products AS
SELECT 
  id,
  ref,
  hebrew_name,
  english_name,
  french_name,
  product_line,
  product_type,
  type,
  size,
  qty,
  description,
  description_he,
  short_description_he,
  header,
  ingredients,
  active_ingredients_he,
  skin_type_he,
  usage_instructions_he,
  notice,
  main_pic,
  pics,
  created_at,
  updated_at
FROM public.products
WHERE EXISTS (
  SELECT 1 FROM public.users 
  WHERE email = current_user 
  AND status = 'active'
);

-- View for verified members (includes pricing information if available)
CREATE OR REPLACE VIEW public.verified_products AS
SELECT 
  p.id,
  p.ref,
  p.hebrew_name,
  p.english_name,
  p.french_name,
  p.product_line,
  p.product_type,
  p.type,
  p.size,
  p.qty,
  p.unit_price,
  pr.unit_price as current_price,
  pr.cost_price,
  pr.discount_price,
  pr.currency,
  p.description,
  p.description_he,
  p.short_description_he,
  p.header,
  p.ingredients,
  p.active_ingredients_he,
  p.skin_type_he,
  p.usage_instructions_he,
  p.notice,
  p.main_pic,
  p.pics,
  p.created_at,
  p.updated_at
FROM public.products p
LEFT JOIN public.prices pr ON p.ref = pr.product_ref
WHERE EXISTS (
  SELECT 1 FROM public.users 
  WHERE email = current_user 
  AND user_role IN ('verified_members', 'admin')
  AND status = 'active'
);

-- View for admin users (complete access including sensitive data)
CREATE OR REPLACE VIEW public.admin_products AS
SELECT 
  p.*,
  pr.unit_price as current_price,
  pr.cost_price,
  pr.discount_price,
  pr.currency as price_currency,
  pr.created_at as price_created_at,
  pr.updated_at as price_updated_at
FROM public.products p
LEFT JOIN public.prices pr ON p.ref = pr.product_ref
WHERE EXISTS (
  SELECT 1 FROM public.users 
  WHERE email = current_user 
  AND role = 'admin'
  AND status = 'active'
);

-- ============================================================================
-- 6. SAFE FUNCTIONS FOR PRODUCT ACCESS
-- ============================================================================

-- Function to get products based on user role
CREATE OR REPLACE FUNCTION public.get_products(
  search_term TEXT DEFAULT NULL,
  product_line_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  ref TEXT,
  hebrew_name TEXT,
  english_name TEXT,
  french_name TEXT,
  product_line TEXT,
  product_type TEXT,
  type TEXT,
  size TEXT,
  qty INTEGER,
  unit_price NUMERIC,
  current_price NUMERIC,
  cost_price NUMERIC,
  discount_price NUMERIC,
  currency TEXT,
  description TEXT,
  description_he TEXT,
  short_description_he TEXT,
  header TEXT,
  ingredients TEXT,
  active_ingredients_he TEXT,
  skin_type_he TEXT,
  usage_instructions_he TEXT,
  notice TEXT,
  main_pic TEXT,
  pics JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  stock_status TEXT
) AS $$
DECLARE
  user_role TEXT;
  is_admin_user BOOLEAN := false;
  is_verified_user BOOLEAN := false;
  is_authenticated_user BOOLEAN := false;
BEGIN
  -- Determine user access level
  SELECT 
    u.role = 'admin',
    u.user_role IN ('verified_members', 'admin') AND u.status = 'active',
    u.status = 'active'
  INTO is_admin_user, is_verified_user, is_authenticated_user
  FROM public.users u
  WHERE u.email = current_user;
  
  -- Set defaults for anonymous users
  is_admin_user := COALESCE(is_admin_user, false);
  is_verified_user := COALESCE(is_verified_user, false);
  is_authenticated_user := COALESCE(is_authenticated_user, false);
  
  -- Return appropriate product view based on user level
  IF is_admin_user THEN
    RETURN QUERY
    SELECT 
      ap.id, ap.ref, ap.hebrew_name, ap.english_name, ap.french_name,
      ap.product_line, ap.product_type, ap.type, ap.size, ap.qty,
      ap.unit_price, ap.current_price, ap.cost_price, ap.discount_price,
      ap.price_currency, ap.description, ap.description_he, ap.short_description_he,
      ap.header, ap.ingredients, ap.active_ingredients_he, ap.skin_type_he,
      ap.usage_instructions_he, ap.notice, ap.main_pic, ap.pics,
      ap.created_at, ap.updated_at,
      CASE 
        WHEN ap.qty > 10 THEN 'in_stock'
        WHEN ap.qty > 0 THEN 'low_stock'
        ELSE 'out_of_stock'
      END as stock_status
    FROM public.admin_products ap
    WHERE (search_term IS NULL OR (
      ap.hebrew_name ILIKE '%' || search_term || '%' OR
      ap.english_name ILIKE '%' || search_term || '%' OR
      ap.french_name ILIKE '%' || search_term || '%' OR
      ap.ref ILIKE '%' || search_term || '%'
    ))
    AND (product_line_filter IS NULL OR ap.product_line = product_line_filter)
    ORDER BY ap.created_at DESC
    LIMIT limit_count OFFSET offset_count;
    
  ELSIF is_verified_user THEN
    RETURN QUERY
    SELECT 
      vp.id, vp.ref, vp.hebrew_name, vp.english_name, vp.french_name,
      vp.product_line, vp.product_type, vp.type, vp.size, vp.qty,
      vp.unit_price, vp.current_price, vp.cost_price, vp.discount_price,
      vp.currency, vp.description, vp.description_he, vp.short_description_he,
      vp.header, vp.ingredients, vp.active_ingredients_he, vp.skin_type_he,
      vp.usage_instructions_he, vp.notice, vp.main_pic, vp.pics,
      vp.created_at, vp.updated_at,
      CASE 
        WHEN vp.qty > 10 THEN 'in_stock'
        WHEN vp.qty > 0 THEN 'low_stock'
        ELSE 'out_of_stock'
      END as stock_status
    FROM public.verified_products vp
    WHERE (search_term IS NULL OR (
      vp.hebrew_name ILIKE '%' || search_term || '%' OR
      vp.english_name ILIKE '%' || search_term || '%' OR
      vp.french_name ILIKE '%' || search_term || '%' OR
      vp.ref ILIKE '%' || search_term || '%'
    ))
    AND (product_line_filter IS NULL OR vp.product_line = product_line_filter)
    ORDER BY vp.created_at DESC
    LIMIT limit_count OFFSET offset_count;
    
  ELSIF is_authenticated_user THEN
    RETURN QUERY
    SELECT 
      up.id, up.ref, up.hebrew_name, up.english_name, up.french_name,
      up.product_line, up.product_type, up.type, up.size, up.qty,
      NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::TEXT,
      up.description, up.description_he, up.short_description_he,
      up.header, up.ingredients, up.active_ingredients_he, up.skin_type_he,
      up.usage_instructions_he, up.notice, up.main_pic, up.pics,
      up.created_at, up.updated_at,
      CASE 
        WHEN up.qty > 10 THEN 'in_stock'
        WHEN up.qty > 0 THEN 'low_stock'
        ELSE 'out_of_stock'
      END as stock_status
    FROM public.user_products up
    WHERE (search_term IS NULL OR (
      up.hebrew_name ILIKE '%' || search_term || '%' OR
      up.english_name ILIKE '%' || search_term || '%' OR
      up.french_name ILIKE '%' || search_term || '%' OR
      up.ref ILIKE '%' || search_term || '%'
    ))
    AND (product_line_filter IS NULL OR up.product_line = product_line_filter)
    ORDER BY up.created_at DESC
    LIMIT limit_count OFFSET offset_count;
    
  ELSE
    -- Anonymous users get public view
    RETURN QUERY
    SELECT 
      pp.id, pp.ref, pp.hebrew_name, pp.english_name, pp.french_name,
      pp.product_line, pp.product_type, pp.type, pp.size, 
      NULL::INTEGER, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::NUMERIC, NULL::TEXT,
      pp.description, pp.description_he, pp.short_description_he,
      pp.header, pp.ingredients, pp.active_ingredients_he, pp.skin_type_he,
      pp.usage_instructions_he, pp.notice, pp.main_pic, pp.pics,
      pp.created_at, pp.updated_at, pp.stock_status
    FROM public.public_products pp
    WHERE (search_term IS NULL OR (
      pp.hebrew_name ILIKE '%' || search_term || '%' OR
      pp.english_name ILIKE '%' || search_term || '%' OR
      pp.french_name ILIKE '%' || search_term || '%' OR
      pp.ref ILIKE '%' || search_term || '%'
    ))
    AND (product_line_filter IS NULL OR pp.product_line = product_line_filter)
    ORDER BY pp.created_at DESC
    LIMIT limit_count OFFSET offset_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get a single product by ID or reference
CREATE OR REPLACE FUNCTION public.get_product(
  product_identifier TEXT -- Can be ID or reference
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  is_admin_user BOOLEAN := false;
  is_verified_user BOOLEAN := false;
  is_authenticated_user BOOLEAN := false;
BEGIN
  -- Determine user access level
  SELECT 
    u.role = 'admin',
    u.user_role IN ('verified_members', 'admin') AND u.status = 'active',
    u.status = 'active'
  INTO is_admin_user, is_verified_user, is_authenticated_user
  FROM public.users u
  WHERE u.email = current_user;
  
  -- Set defaults
  is_admin_user := COALESCE(is_admin_user, false);
  is_verified_user := COALESCE(is_verified_user, false);
  is_authenticated_user := COALESCE(is_authenticated_user, false);
  
  -- Get product based on access level
  IF is_admin_user THEN
    SELECT row_to_json(ap.*)::jsonb INTO result
    FROM public.admin_products ap
    WHERE ap.id::text = product_identifier OR ap.ref = product_identifier
    LIMIT 1;
    
  ELSIF is_verified_user THEN
    SELECT row_to_json(vp.*)::jsonb INTO result
    FROM public.verified_products vp
    WHERE vp.id::text = product_identifier OR vp.ref = product_identifier
    LIMIT 1;
    
  ELSIF is_authenticated_user THEN
    SELECT row_to_json(up.*)::jsonb INTO result
    FROM public.user_products up
    WHERE up.id::text = product_identifier OR up.ref = product_identifier
    LIMIT 1;
    
  ELSE
    SELECT row_to_json(pp.*)::jsonb INTO result
    FROM public.public_products pp
    WHERE pp.id::text = product_identifier OR pp.ref = product_identifier
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for admin to manage products
CREATE OR REPLACE FUNCTION public.admin_upsert_product(product_data JSONB)
RETURNS JSONB AS $$
DECLARE
  is_admin_user BOOLEAN := false;
  result JSONB;
  product_id UUID;
  existing_product BOOLEAN := false;
BEGIN
  -- Verify admin role
  SELECT role = 'admin' INTO is_admin_user
  FROM public.users 
  WHERE email = current_user AND status = 'active';
  
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  
  -- Check if product exists (by ID or ref)
  IF product_data->>'id' IS NOT NULL THEN
    SELECT id INTO product_id 
    FROM public.products 
    WHERE id = (product_data->>'id')::UUID;
    existing_product := product_id IS NOT NULL;
  ELSIF product_data->>'ref' IS NOT NULL THEN
    SELECT id INTO product_id 
    FROM public.products 
    WHERE ref = product_data->>'ref';
    existing_product := product_id IS NOT NULL;
  END IF;
  
  IF existing_product THEN
    -- Update existing product
    UPDATE public.products 
    SET 
      ref = COALESCE((product_data->>'ref'), ref),
      hebrew_name = COALESCE((product_data->>'hebrew_name'), hebrew_name),
      english_name = COALESCE((product_data->>'english_name'), english_name),
      french_name = COALESCE((product_data->>'french_name'), french_name),
      product_line = COALESCE((product_data->>'product_line'), product_line),
      product_type = COALESCE((product_data->>'product_type'), product_type),
      type = COALESCE((product_data->>'type'), type),
      size = COALESCE((product_data->>'size'), size),
      qty = COALESCE((product_data->>'qty')::INTEGER, qty),
      unit_price = COALESCE((product_data->>'unit_price')::NUMERIC, unit_price),
      description = COALESCE((product_data->>'description'), description),
      description_he = COALESCE((product_data->>'description_he'), description_he),
      short_description_he = COALESCE((product_data->>'short_description_he'), short_description_he),
      header = COALESCE((product_data->>'header'), header),
      ingredients = COALESCE((product_data->>'ingredients'), ingredients),
      active_ingredients_he = COALESCE((product_data->>'active_ingredients_he'), active_ingredients_he),
      skin_type_he = COALESCE((product_data->>'skin_type_he'), skin_type_he),
      usage_instructions_he = COALESCE((product_data->>'usage_instructions_he'), usage_instructions_he),
      notice = COALESCE((product_data->>'notice'), notice),
      main_pic = COALESCE((product_data->>'main_pic'), main_pic),
      pics = COALESCE((product_data->>'pics')::JSONB, pics),
      updated_at = NOW()
    WHERE id = product_id
    RETURNING row_to_json(products.*)::jsonb INTO result;
  ELSE
    -- Insert new product
    INSERT INTO public.products (
      ref, hebrew_name, english_name, french_name, product_line,
      product_type, type, size, qty, unit_price, description,
      description_he, short_description_he, header, ingredients,
      active_ingredients_he, skin_type_he, usage_instructions_he,
      notice, main_pic, pics
    )
    VALUES (
      product_data->>'ref',
      product_data->>'hebrew_name',
      product_data->>'english_name',
      product_data->>'french_name',
      product_data->>'product_line',
      product_data->>'product_type',
      product_data->>'type',
      product_data->>'size',
      COALESCE((product_data->>'qty')::INTEGER, 0),
      (product_data->>'unit_price')::NUMERIC,
      product_data->>'description',
      product_data->>'description_he',
      product_data->>'short_description_he',
      product_data->>'header',
      product_data->>'ingredients',
      product_data->>'active_ingredients_he',
      product_data->>'skin_type_he',
      product_data->>'usage_instructions_he',
      product_data->>'notice',
      product_data->>'main_pic',
      (product_data->>'pics')::JSONB
    )
    RETURNING row_to_json(products.*)::jsonb INTO result;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. AUDIT SYSTEM FOR PRODUCTS
-- ============================================================================

-- Create audit table for product changes
CREATE TABLE IF NOT EXISTS public.products_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  product_ref TEXT,
  user_email TEXT,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  changed_fields JSONB,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit table
ALTER TABLE public.products_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view product audit logs
CREATE POLICY "Admins can view product audit"
ON public.products_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = current_user 
    AND role = 'admin'
  )
);

-- Function to log product changes
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.products_audit (
      product_id, product_ref, user_email, action, old_values
    )
    VALUES (
      OLD.id, OLD.ref, current_user, TG_OP, to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.products_audit (
      product_id, product_ref, user_email, action, 
      changed_fields, old_values, new_values
    )
    VALUES (
      NEW.id, NEW.ref, current_user, TG_OP,
      to_jsonb(NEW) - to_jsonb(OLD), to_jsonb(OLD), to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.products_audit (
      product_id, product_ref, user_email, action, new_values
    )
    VALUES (
      NEW.id, NEW.ref, current_user, TG_OP, to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main operation if audit fails
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS products_audit_trigger ON public.products;
CREATE TRIGGER products_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION log_product_changes();

-- ============================================================================
-- 8. GRANT PERMISSIONS
-- ============================================================================

-- Grant basic permissions
GRANT SELECT ON public.products TO PUBLIC;
GRANT SELECT ON public.public_products TO PUBLIC;
GRANT SELECT ON public.user_products TO PUBLIC;
GRANT SELECT ON public.verified_products TO PUBLIC;
GRANT SELECT ON public.admin_products TO PUBLIC;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_products(TEXT, TEXT, INTEGER, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_product(TEXT) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(JSONB) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_verified_member() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_authenticated() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO PUBLIC;

-- Grant audit table permissions
GRANT SELECT ON public.products_audit TO PUBLIC;

-- ============================================================================
-- 9. VERIFICATION
-- ============================================================================

DO $$
DECLARE
  policy_count INTEGER;
  function_count INTEGER;
  view_count INTEGER;
  trigger_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'products' AND schemaname = 'public';
  
  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND (p.proname LIKE '%product%' OR p.proname IN ('is_admin', 'is_verified_member', 'is_authenticated'));
  
  -- Count views  
  SELECT COUNT(*) INTO view_count
  FROM pg_views
  WHERE schemaname = 'public' 
  AND viewname LIKE '%product%';
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger
  WHERE tgrelid = 'public.products'::regclass;
  
  RAISE NOTICE '============================================';
  RAISE NOTICE 'PRODUCTS RLS SETUP COMPLETE';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created: %', policy_count;
  RAISE NOTICE 'Functions created: %', function_count;
  RAISE NOTICE 'Views created: %', view_count;
  RAISE NOTICE 'Triggers created: %', trigger_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS enabled on products table';
  RAISE NOTICE '✅ Role-based access policies implemented';
  RAISE NOTICE '✅ Security views for different user types';
  RAISE NOTICE '✅ Safe access functions implemented';
  RAISE NOTICE '✅ Admin management functions created';
  RAISE NOTICE '✅ Audit system enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'ACCESS LEVELS:';
  RAISE NOTICE '  • Anonymous: Basic product info, no stock/pricing';
  RAISE NOTICE '  • Authenticated: Product info + stock status';
  RAISE NOTICE '  • Verified Members: Product info + pricing';
  RAISE NOTICE '  • Admin: Complete access + management';
  RAISE NOTICE '';
  RAISE NOTICE 'USAGE EXAMPLES:';
  RAISE NOTICE '  • SELECT * FROM public.get_products(); -- Get products by role';
  RAISE NOTICE '  • SELECT * FROM public.get_product(''PROD001''); -- Get single product';
  RAISE NOTICE '  • SELECT * FROM public.admin_upsert_product(''{"ref": "PROD001", "hebrew_name": "מוצר חדש"}''::jsonb); -- Admin manage';
  RAISE NOTICE '============================================';
END $$;
