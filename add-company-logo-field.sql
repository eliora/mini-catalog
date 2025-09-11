-- Add company_logo field to existing company_settings table
-- Run this in Supabase SQL Editor to add logo support
-- Safe to run multiple times

-- Add the logo field only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'company_settings' 
        AND column_name = 'company_logo'
    ) THEN
        ALTER TABLE company_settings ADD COLUMN company_logo TEXT DEFAULT '';
    END IF;
END $$;

-- Update the default company name to Jean Darcel (only if it's the old default)
UPDATE company_settings 
SET company_name = 'Jean Darcel' 
WHERE company_name = 'קטלוג מוצרים';

-- If no settings exist at all, insert default with Jean Darcel
INSERT INTO company_settings (
  company_name,
  company_description, 
  company_tagline,
  company_address,
  company_phone,
  company_email,
  invoice_footer,
  company_logo
) 
SELECT 
  'Jean Darcel',
  'מערכת ניהול הזמנות',
  'אתר מקצועי למוצרי יופי',
  '',
  '',
  '',
  'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות',
  ''
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
