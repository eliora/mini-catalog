-- Migration: Migrate existing pricing data from products to prices table
-- Date: September 11, 2025
-- Purpose: Move unit_price data to new prices table before removing column

-- =============================================================================
-- STEP 3: Migrate existing pricing data
-- =============================================================================

-- Insert existing pricing data into prices table
-- Only migrate products that have a unit_price value
INSERT INTO public.prices (product_ref, unit_price, currency)
SELECT 
    ref as product_ref,
    unit_price,
    'ILS' as currency  -- Default currency
FROM public.products 
WHERE unit_price IS NOT NULL 
  AND ref IS NOT NULL
  AND ref != ''
ON CONFLICT (product_ref) DO UPDATE SET
    unit_price = EXCLUDED.unit_price,
    updated_at = timezone('utc'::text, now());

-- =============================================================================
-- Verification queries (run these to check migration)
-- =============================================================================

-- Check how many prices were migrated
-- SELECT COUNT(*) as migrated_prices FROM public.prices;

-- Check products without prices
-- SELECT COUNT(*) as products_without_prices 
-- FROM public.products p 
-- LEFT JOIN public.prices pr ON p.ref = pr.product_ref 
-- WHERE pr.product_ref IS NULL;

-- Verify price data integrity
-- SELECT 
--     p.ref,
--     p.hebrew_name,
--     p.unit_price as old_price,
--     pr.unit_price as new_price,
--     CASE 
--         WHEN p.unit_price = pr.unit_price THEN 'MATCH'
--         ELSE 'MISMATCH'
--     END as status
-- FROM public.products p
-- INNER JOIN public.prices pr ON p.ref = pr.product_ref
-- WHERE p.unit_price IS NOT NULL
-- LIMIT 10;

-- =============================================================================
-- IMPORTANT NOTES
-- =============================================================================

-- 1. This migration preserves all existing pricing data
-- 2. Products without unit_price will not have entries in prices table
-- 3. The foreign key constraint ensures data integrity
-- 4. Run verification queries before proceeding to next step
-- 5. Backup your database before running these migrations!
