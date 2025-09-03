-- Exact CSV Match Supabase Database Setup for Mini Catalog
-- This matches the enhanced_jda_web_translated_heb_final.csv headers exactly
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Products table matching your CSV headers EXACTLY
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ref no" TEXT UNIQUE NOT NULL,  -- Exact match with quotes for space
    hebrew_name TEXT,
    short_description_he TEXT,
    description_he TEXT,
    skin_type_he TEXT,
    "Anwendung_he" TEXT,  -- Exact match with capital A
    "WirkungInhaltsstoffe_he" TEXT, -- Exact match with capital W
    "Product Name" TEXT,  -- Exact match with quotes for space
    "Product Name2" TEXT, -- Exact match 
    "Size" TEXT,          -- Exact match with capital S
    pic TEXT,             -- Main picture URL
    all_pics TEXT,        -- All pictures separated by |
    unit_price DECIMAL(10,2) DEFAULT 0,
    product_type TEXT DEFAULT 'Product',
    line TEXT,            -- For derived categories if needed
    notice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table (same as before)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_ref ON public.products("ref no");
CREATE INDEX IF NOT EXISTS idx_products_hebrew_name ON public.products(hebrew_name);
CREATE INDEX IF NOT EXISTS idx_products_product_name ON public.products("Product Name");
CREATE INDEX IF NOT EXISTS idx_products_line ON public.products(line);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to products
CREATE POLICY "Enable read access for all users" ON public.products
    FOR SELECT USING (true);

-- Create policies for public insert access to orders (for customers)
CREATE POLICY "Enable insert access for all users" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Create policies for service role (admin) - full access
CREATE POLICY "Enable all access for service role on products" ON public.products
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Enable all access for service role on orders" ON public.orders
    FOR ALL USING (auth.role() = 'service_role');

-- Insert some sample data from your CSV to test
INSERT INTO public.products (
    "ref no", hebrew_name, short_description_he, description_he, skin_type_he, 
    "Anwendung_he", "WirkungInhaltsstoffe_he", "Product Name", "Product Name2", 
    "Size", pic, all_pics, unit_price
) VALUES
(
    '652', 
    'קרם הגנה ל-24 שעות',
    'קרם עשיר להגנה ולחות אינטנסיבית לעור יבש ורגיש. מועשר בתמצית קוויאר להאטת תהליכי הזדקנות.',
    '<p><strong>קרם הגנה ל-24 שעות</strong> – קרם עשיר המעניק הגנה ולחות אינטנסיבית למשך 24 שעות, אידיאלי לעור יבש, רגיש וזקוק להרגעה.</p>',
    'עור יבש, עור רגיש, עור בוגר',
    'יש למרוח בבוקר ו/או בערב על עור פנים נקי. יש לעסות בעדינות עד לספיגה מלאה.',
    '<p><strong>רכיבים מרכזיים:</strong></p><ul><li><strong>תמצית קוויאר:</strong> ממריץ ייצור קולגן</li></ul>',
    '24 h creme de protection',
    '24h protection cream',
    '50 ml jar',
    'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=קרם+הגנה',
    'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=קרם+הגנה',
    29.99
),
(
    '1291',
    'אמפולה מחייה', 
    'אמפולת אנטי-אייג''ינג למיצוק העור והפחתת קמטים, מועשרת בתמצית קוויאר ופרו-רטינול.',
    '<p><strong>אמפולה מחייה</strong> – טיפול אנטי-אייג''ינג מרוכז למיצוק העור</p>',
    'עור בוגר',
    'יש למרוח את תכולת האמפולה בבוקר או בערב על עור פנים נקי.',
    '<p><strong>רכיבים מרכזיים:</strong><ul><li><strong>תמצית קוויאר:</strong> מעודד ייצור קולגן</li></ul>',
    'ampoule revita',
    'revitalizing ampoule',
    '5 x 2 ml ampoules',
    'https://www.jda.de/media/catalog/product/_/1/_1291_ampoule_revita.png',
    'https://www.jda.de/media/catalog/product/_/1/_1291_ampoule_revita.png',
    49.99
);

-- Verify the setup
SELECT 'Products table created successfully' as status, count(*) as sample_products FROM public.products;
SELECT 'Orders table created successfully' as status, count(*) as sample_orders FROM public.orders;
