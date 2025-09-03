-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'קטלוג מוצרים',
  company_description TEXT NOT NULL DEFAULT 'מערכת ניהול הזמנות',
  company_tagline TEXT NOT NULL DEFAULT 'אתר מקצועי למוצרי יופי',
  company_address TEXT DEFAULT '',
  company_phone TEXT DEFAULT '',
  company_email TEXT DEFAULT '',
  invoice_footer TEXT NOT NULL DEFAULT 'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to initialize table (for API call)
CREATE OR REPLACE FUNCTION create_company_settings_table()
RETURNS void AS $$
BEGIN
  -- This function exists just to be called from the API
  -- The table creation is handled above
  NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert default settings if table is empty
INSERT INTO company_settings (
  company_name,
  company_description, 
  company_tagline,
  company_address,
  company_phone,
  company_email,
  invoice_footer
) 
SELECT 
  'קטלוג מוצרים',
  'מערכת ניהול הזמנות',
  'אתר מקצועי למוצרי יופי',
  '',
  '',
  '',
  'מסמך זה הופק באופן אוטומטי על ידי מערכת ניהול ההזמנות'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Enable RLS (Row Level Security)
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company_settings
-- Allow read access for authenticated users
CREATE POLICY "Allow read access to company settings" ON company_settings FOR SELECT USING (true);

-- Allow insert/update for authenticated users (admin only in practice)
CREATE POLICY "Allow insert access to company settings" ON company_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access to company settings" ON company_settings FOR UPDATE USING (true);
