-- Migration: Create prices table with foreign key to products
-- Date: September 11, 2025
-- Purpose: Separate pricing data for role-based access control

-- =============================================================================
-- STEP 2: Create prices table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Foreign key to products table using ref field
    product_ref TEXT NOT NULL,
    
    -- Pricing information
    unit_price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'ILS' NOT NULL,
    
    -- Optional pricing metadata
    cost_price NUMERIC(10,2), -- For future profit calculations
    discount_price NUMERIC(10,2), -- For sale prices
    price_tier TEXT DEFAULT 'standard', -- For different pricing levels
    
    -- Ensure ref exists in products table
    CONSTRAINT fk_prices_product_ref 
        FOREIGN KEY (product_ref) 
        REFERENCES public.products(ref) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Ensure unique pricing per product
    CONSTRAINT unique_product_pricing UNIQUE (product_ref)
);

-- =============================================================================
-- Add indexes for performance
-- =============================================================================

-- Index on product_ref for fast lookups
CREATE INDEX IF NOT EXISTS idx_prices_product_ref ON public.prices(product_ref);

-- Index on pricing for filtering/sorting
CREATE INDEX IF NOT EXISTS idx_prices_unit_price ON public.prices(unit_price);

-- =============================================================================
-- Add updated_at trigger
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for prices table
DROP TRIGGER IF EXISTS update_prices_updated_at ON public.prices;
CREATE TRIGGER update_prices_updated_at
    BEFORE UPDATE ON public.prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Add comments for documentation
-- =============================================================================

COMMENT ON TABLE public.prices IS 'Product pricing information - restricted to verified members';
COMMENT ON COLUMN public.prices.product_ref IS 'Reference to products.ref field';
COMMENT ON COLUMN public.prices.unit_price IS 'Price per unit in specified currency';
COMMENT ON COLUMN public.prices.currency IS 'Currency code (ILS, USD, EUR, etc.)';
COMMENT ON COLUMN public.prices.cost_price IS 'Cost price for profit calculations';
COMMENT ON COLUMN public.prices.discount_price IS 'Discounted price for sales';
COMMENT ON COLUMN public.prices.price_tier IS 'Pricing tier (standard, premium, wholesale, etc.)';

-- =============================================================================
-- Grant permissions
-- =============================================================================

-- Allow authenticated users to read (will be restricted by RLS)
GRANT SELECT ON public.prices TO authenticated;
GRANT SELECT ON public.prices TO anon;

-- Allow service role full access for admin operations
GRANT ALL ON public.prices TO service_role;
