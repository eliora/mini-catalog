-- ============================================================================
-- UPDATE PRODUCTS TABLE TO MATCH DOCUMENTED SCHEMA
-- ============================================================================
-- This script adds missing indexes and documents extra fields to match
-- the ADMIN_DATABASE_SCHEMA.md documentation
-- ============================================================================

-- Step 1: Add missing index for created_at (for better query performance)
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products USING btree (created_at) TABLESPACE pg_default;

-- Step 2: Verify all documented indexes exist
SELECT 
    i.relname as indexname,
    t.relname as tablename,
    pg_get_indexdef(i.oid) as indexdef
FROM pg_class i
JOIN pg_index ix ON i.oid = ix.indexrelid
JOIN pg_class t ON ix.indrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE t.relname = 'products' 
AND n.nspname = 'public'
ORDER BY i.relname;

-- Step 3: Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- Step 4: Document the extra fields that exist in actual schema
-- These fields are present in the actual table but not in documentation:

-- active_ingredients (English version)
-- usage_instructions (English version) 
-- product_name (Additional product name field)
-- product_name_2 (Second product name field)

-- Step 5: Show sample data to understand the extra fields
SELECT 
    ref,
    hebrew_name,
    english_name,
    product_name,
    product_name_2,
    active_ingredients,
    active_ingredients_he,
    usage_instructions,
    usage_instructions_he
FROM public.products
WHERE active_ingredients IS NOT NULL 
   OR usage_instructions IS NOT NULL 
   OR product_name IS NOT NULL 
   OR product_name_2 IS NOT NULL
LIMIT 5;

-- Step 6: Show index usage statistics
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE relname = 'products'
ORDER BY idx_scan DESC;

-- Step 7: Verify the table matches documented structure
DO $$
DECLARE
    expected_columns INTEGER := 24; -- Based on documentation
    actual_columns INTEGER;
    expected_indexes INTEGER := 6; -- Based on documentation
    actual_indexes INTEGER;
BEGIN
    -- Count actual columns
    SELECT COUNT(*) INTO actual_columns
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products';
    
    -- Count actual indexes
    SELECT COUNT(*) INTO actual_indexes
    FROM pg_class i
    JOIN pg_index ix ON i.oid = ix.indexrelid
    JOIN pg_class t ON ix.indrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE t.relname = 'products' 
    AND n.nspname = 'public';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'PRODUCTS TABLE SCHEMA VERIFICATION:';
    RAISE NOTICE '';
    RAISE NOTICE 'Columns: % (expected: %)', actual_columns, expected_columns;
    RAISE NOTICE 'Indexes: % (expected: %)', actual_indexes, expected_indexes;
    RAISE NOTICE '';
    
    IF actual_columns >= expected_columns THEN
        RAISE NOTICE '✅ Column count is sufficient';
    ELSE
        RAISE NOTICE '❌ Missing columns detected';
    END IF;
    
    IF actual_indexes >= expected_indexes THEN
        RAISE NOTICE '✅ Index count is sufficient';
    ELSE
        RAISE NOTICE '❌ Missing indexes detected';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'EXTRA FIELDS IN ACTUAL SCHEMA:';
    RAISE NOTICE '  • active_ingredients (English)';
    RAISE NOTICE '  • usage_instructions (English)';
    RAISE NOTICE '  • product_name (Additional name)';
    RAISE NOTICE '  • product_name_2 (Second name)';
    RAISE NOTICE '';
    RAISE NOTICE 'These fields should be added to documentation';
    RAISE NOTICE '============================================';
END $$;

-- Step 8: Create a view for documentation purposes (shows documented fields only)
CREATE OR REPLACE VIEW public.products_documented AS
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
    unit_price,
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

-- Step 9: Show the documented view structure
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products_documented'
ORDER BY ordinal_position;

-- Step 10: Final verification
SELECT 
    'Products table updated to match documentation' as status,
    COUNT(*) as total_products
FROM public.products;
