-- Add tax_rate field to company_settings table
-- This script is idempotent - safe to run multiple times

-- Check if tax_rate column exists before adding it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'company_settings' 
        AND column_name = 'tax_rate'
    ) THEN
        -- Add tax_rate column
        ALTER TABLE company_settings 
        ADD COLUMN tax_rate DECIMAL(5,2) DEFAULT 17.00;
        
        RAISE NOTICE 'Added tax_rate column to company_settings table';
    ELSE
        RAISE NOTICE 'tax_rate column already exists in company_settings table';
    END IF;
END $$;

-- Set default tax rate for existing records that don't have it
UPDATE company_settings 
SET tax_rate = 17.00 
WHERE tax_rate IS NULL;

-- Add comment to the column
COMMENT ON COLUMN company_settings.tax_rate IS 'Tax rate percentage (e.g., 17.00 for 17% VAT)';
