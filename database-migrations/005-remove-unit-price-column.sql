-- Migration: Remove unit_price column from products table
-- Date: September 11, 2025
-- Purpose: Complete the pricing separation by removing unit_price from products
-- WARNING: This is a destructive operation - ensure pricing data is safely migrated first!

-- =============================================================================
-- STEP 5: Remove unit_price column from products table
-- =============================================================================

-- IMPORTANT: Only run this AFTER confirming data migration was successful!
-- 
-- Verification steps before running:
-- 1. Check that all prices were migrated: SELECT COUNT(*) FROM public.prices;
-- 2. Verify data integrity with join query
-- 3. Test that your application works with the new prices table
-- 4. Have a database backup ready!

-- =============================================================================
-- PRE-REMOVAL VERIFICATION (uncomment to run checks)
-- =============================================================================

-- Check current pricing data distribution
-- SELECT 
--     'products_with_unit_price' as table_name,
--     COUNT(*) as count 
-- FROM public.products 
-- WHERE unit_price IS NOT NULL
-- UNION ALL
-- SELECT 
--     'prices_table_entries' as table_name,
--     COUNT(*) as count 
-- FROM public.prices;

-- Verify all products with prices have corresponding entries
-- SELECT 
--     p.ref,
--     p.hebrew_name,
--     p.unit_price,
--     pr.unit_price as migrated_price,
--     CASE 
--         WHEN pr.product_ref IS NULL THEN 'MISSING_IN_PRICES'
--         WHEN p.unit_price != pr.unit_price THEN 'PRICE_MISMATCH'
--         ELSE 'OK'
--     END as migration_status
-- FROM public.products p
-- LEFT JOIN public.prices pr ON p.ref = pr.product_ref
-- WHERE p.unit_price IS NOT NULL
-- ORDER BY migration_status DESC;

-- =============================================================================
-- ACTUAL COLUMN REMOVAL (uncomment when ready)
-- =============================================================================

-- Step 1: Remove any constraints or indexes on unit_price column
-- (Check if any exist first)
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints tc
-- JOIN information_schema.constraint_column_usage ccu USING (constraint_name)
-- WHERE tc.table_name = 'products' AND ccu.column_name = 'unit_price';

-- Step 2: Remove the column
-- ALTER TABLE public.products DROP COLUMN IF EXISTS unit_price;

-- Step 3: Verify column is removed
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' AND column_name = 'unit_price';
-- -- Should return no rows

-- =============================================================================
-- POST-REMOVAL VERIFICATION
-- =============================================================================

-- Check that products table no longer has unit_price
-- \d public.products

-- Verify application can still access pricing through joins
-- SELECT 
--     p.ref,
--     p.hebrew_name,
--     pr.unit_price,
--     pr.currency
-- FROM public.products p
-- LEFT JOIN public.prices pr ON p.ref = pr.product_ref
-- LIMIT 5;

-- =============================================================================
-- ROLLBACK PLAN (if needed)
-- =============================================================================

-- If you need to rollback this migration:
-- 1. Add the column back: ALTER TABLE public.products ADD COLUMN unit_price NUMERIC(10,2);
-- 2. Restore data: UPDATE public.products SET unit_price = pr.unit_price FROM public.prices pr WHERE products.ref = pr.product_ref;
-- 3. Drop prices table if desired: DROP TABLE public.prices CASCADE;

-- =============================================================================
-- FINAL NOTES
-- =============================================================================

-- After successful removal:
-- 1. Update your application code to fetch prices separately
-- 2. Update API endpoints to join with prices table
-- 3. Test all pricing-related functionality
-- 4. Update database documentation
-- 5. Consider adding monitoring for pricing access patterns
