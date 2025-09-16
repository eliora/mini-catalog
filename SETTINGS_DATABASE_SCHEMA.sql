-- ============================================================================
-- SETTINGS DATABASE SCHEMA - COMPLETE IMPLEMENTATION
-- ============================================================================
-- Based on ADMIN_DATABASE_SCHEMA.md documentation
-- Implements comprehensive system settings management
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. DROP EXISTING SETTINGS TABLE (if exists) FOR CLEAN RECREATION
-- ============================================================================

-- Drop existing table and recreate with proper schema
DROP TABLE IF EXISTS public.settings CASCADE;

-- ============================================================================
-- 2. CREATE COMPREHENSIVE SETTINGS TABLE
-- ============================================================================

CREATE TABLE public.settings (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ========================================================================
    -- GENERAL SETTINGS (Company Information)
    -- ========================================================================
    company_name VARCHAR(255),
    company_description TEXT,
    company_email VARCHAR(255),
    company_phone VARCHAR(50),
    company_address TEXT,
    company_logo VARCHAR(500),
    tagline VARCHAR(255),
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1976d2',
    secondary_color VARCHAR(7) DEFAULT '#dc004e',
    timezone VARCHAR(50) DEFAULT 'Asia/Jerusalem',
    
    -- ========================================================================
    -- BUSINESS SETTINGS
    -- ========================================================================
    business_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    is_vat_registered BOOLEAN DEFAULT true,
    
    -- ========================================================================
    -- FINANCIAL SETTINGS (Tax & Currency)
    -- ========================================================================
    currency VARCHAR(3) DEFAULT 'ILS',
    tax_rate DECIMAL(5,4) DEFAULT 0.18,
    prices_include_tax BOOLEAN DEFAULT true,
    show_prices_with_tax BOOLEAN DEFAULT true,
    enable_tax_exempt BOOLEAN DEFAULT false,
    invoice_footer_text TEXT,
    
    -- ========================================================================
    -- SHIPPING SETTINGS
    -- ========================================================================
    free_shipping_threshold DECIMAL(10,2) DEFAULT 0.00,
    standard_shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    express_shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    enable_local_delivery BOOLEAN DEFAULT true,
    
    -- ========================================================================
    -- NOTIFICATION SETTINGS (JSONB for complex structure)
    -- ========================================================================
    notification_settings JSONB DEFAULT '{
        "categories": {
            "orders": {
                "email": true,
                "sms": false,
                "push": true,
                "inApp": true
            },
            "inventory": {
                "email": true,
                "sms": false,
                "push": false,
                "inApp": true
            },
            "customers": {
                "email": false,
                "sms": false,
                "push": false,
                "inApp": true
            },
            "system": {
                "email": true,
                "sms": false,
                "push": true,
                "inApp": true
            }
        }
    }',
    
    -- ========================================================================
    -- SYSTEM SETTINGS
    -- ========================================================================
    maintenance_mode BOOLEAN DEFAULT false,
    debug_mode BOOLEAN DEFAULT false,
    enable_reviews BOOLEAN DEFAULT true,
    enable_wishlist BOOLEAN DEFAULT true,
    enable_notifications BOOLEAN DEFAULT true,
    session_timeout INTEGER DEFAULT 3600, -- in seconds
    max_login_attempts INTEGER DEFAULT 5,
    backup_frequency VARCHAR(20) DEFAULT 'daily',
    cache_duration INTEGER DEFAULT 300, -- in seconds
    
    -- ========================================================================
    -- SYSTEM TIMESTAMPS
    -- ========================================================================
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for company lookups
CREATE INDEX IF NOT EXISTS idx_settings_company_name 
ON public.settings USING btree (company_name);

-- Index for currency operations
CREATE INDEX IF NOT EXISTS idx_settings_currency 
ON public.settings USING btree (currency);

-- Index for timestamps
CREATE INDEX IF NOT EXISTS idx_settings_created_at 
ON public.settings USING btree (created_at);

CREATE INDEX IF NOT EXISTS idx_settings_updated_at 
ON public.settings USING btree (updated_at);

-- JSONB index for notification settings
CREATE INDEX IF NOT EXISTS idx_settings_notification_settings 
ON public.settings USING gin (notification_settings);

-- ============================================================================
-- 4. CREATE CONSTRAINTS
-- ============================================================================

-- Ensure valid currency codes (ISO 4217)
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_currency 
CHECK (currency ~ '^[A-Z]{3}$');

-- Ensure valid tax rate (0-100%)
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_tax_rate 
CHECK (tax_rate >= 0 AND tax_rate <= 1);

-- Ensure valid color codes for themes
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_primary_color 
CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$');

ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_secondary_color 
CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$');

-- Ensure positive shipping costs
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_shipping_costs 
CHECK (
    free_shipping_threshold >= 0 AND 
    standard_shipping_cost >= 0 AND 
    express_shipping_cost >= 0
);

-- Ensure valid session timeout (minimum 5 minutes)
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_session_timeout 
CHECK (session_timeout >= 300);

-- Ensure valid max login attempts
ALTER TABLE public.settings 
ADD CONSTRAINT chk_settings_max_login_attempts 
CHECK (max_login_attempts > 0 AND max_login_attempts <= 20);

-- ============================================================================
-- 5. CREATE TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_settings_updated_at();

-- ============================================================================
-- 6. INSERT DEFAULT SETTINGS RECORD
-- ============================================================================

INSERT INTO public.settings (
    company_name,
    company_description,
    company_email,
    company_phone,
    currency,
    tax_rate,
    is_vat_registered,
    timezone,
    primary_color,
    secondary_color,
    prices_include_tax,
    show_prices_with_tax,
    enable_local_delivery,
    enable_reviews,
    enable_wishlist,
    enable_notifications
) VALUES (
    'Mini Catalog E-commerce',
    'Professional e-commerce solution for modern businesses',
    'admin@minicatalog.com',
    '+972-XX-XXX-XXXX',
    'ILS',
    0.18,
    true,
    'Asia/Jerusalem',
    '#1976d2',
    '#dc004e',
    true,
    true,
    true,
    true,
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. CREATE HELPFUL VIEWS
-- ============================================================================

-- View for basic company information
CREATE OR REPLACE VIEW public.company_info AS
SELECT 
    company_name,
    company_description,
    company_email,
    company_phone,
    company_address,
    company_logo,
    logo_url,
    currency,
    tax_rate,
    is_vat_registered
FROM public.settings
LIMIT 1;

-- View for financial settings
CREATE OR REPLACE VIEW public.financial_settings AS
SELECT 
    currency,
    tax_rate,
    prices_include_tax,
    show_prices_with_tax,
    enable_tax_exempt,
    invoice_footer_text,
    free_shipping_threshold,
    standard_shipping_cost,
    express_shipping_cost
FROM public.settings
LIMIT 1;

-- View for system configuration
CREATE OR REPLACE VIEW public.system_config AS
SELECT 
    maintenance_mode,
    debug_mode,
    enable_reviews,
    enable_wishlist,
    enable_notifications,
    session_timeout,
    max_login_attempts,
    backup_frequency,
    cache_duration
FROM public.settings
LIMIT 1;

-- ============================================================================
-- 8. ADD TABLE AND COLUMN COMMENTS
-- ============================================================================

COMMENT ON TABLE public.settings IS 'Comprehensive system-wide configuration settings for the Mini Catalog E-commerce platform';

-- General settings comments
COMMENT ON COLUMN public.settings.company_name IS 'Company or business name';
COMMENT ON COLUMN public.settings.company_description IS 'Company description or tagline';
COMMENT ON COLUMN public.settings.company_email IS 'Primary company contact email';
COMMENT ON COLUMN public.settings.company_phone IS 'Primary company phone number';
COMMENT ON COLUMN public.settings.company_address IS 'Company physical address';
COMMENT ON COLUMN public.settings.company_logo IS 'URL to company logo image';

-- Financial settings comments
COMMENT ON COLUMN public.settings.currency IS 'Default currency code (ISO 4217)';
COMMENT ON COLUMN public.settings.tax_rate IS 'Tax rate as decimal (0.18 = 18% VAT)';
COMMENT ON COLUMN public.settings.prices_include_tax IS 'Whether displayed prices include tax';
COMMENT ON COLUMN public.settings.show_prices_with_tax IS 'Whether to show tax-inclusive prices';

-- System settings comments
COMMENT ON COLUMN public.settings.maintenance_mode IS 'Whether the system is in maintenance mode';
COMMENT ON COLUMN public.settings.debug_mode IS 'Whether debug mode is enabled';
COMMENT ON COLUMN public.settings.session_timeout IS 'Session timeout in seconds';
COMMENT ON COLUMN public.settings.notification_settings IS 'JSONB object containing notification preferences';

-- ============================================================================
-- 9. CREATE FUNCTIONS FOR SETTINGS MANAGEMENT
-- ============================================================================

-- Function to get a specific setting value
CREATE OR REPLACE FUNCTION get_setting(setting_key TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    EXECUTE format('SELECT %I::TEXT FROM public.settings LIMIT 1', setting_key) INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update a specific setting
CREATE OR REPLACE FUNCTION update_setting(setting_key TEXT, setting_value TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE public.settings SET %I = %L, updated_at = NOW()', setting_key, setting_value);
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get notification settings for a category
CREATE OR REPLACE FUNCTION get_notification_settings(category TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    IF category IS NULL THEN
        SELECT notification_settings INTO result FROM public.settings LIMIT 1;
    ELSE
        SELECT notification_settings->'categories'->category INTO result FROM public.settings LIMIT 1;
    END IF;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. VERIFICATION AND SUMMARY
-- ============================================================================

-- Verify the table structure matches documentation
DO $$
DECLARE
    column_count INTEGER;
    index_count INTEGER;
    constraint_count INTEGER;
    settings_count INTEGER;
BEGIN
    -- Count columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'settings';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'settings' AND schemaname = 'public';
    
    -- Count constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'settings';
    
    -- Count settings records
    SELECT COUNT(*) INTO settings_count
    FROM public.settings;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'SETTINGS TABLE SCHEMA CREATION COMPLETE';
    RAISE NOTICE '';
    RAISE NOTICE 'Columns created: %', column_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Constraints created: %', constraint_count;
    RAISE NOTICE 'Default records: %', settings_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Settings table created successfully';
    RAISE NOTICE '✅ All constraints and indexes applied';
    RAISE NOTICE '✅ Default settings record inserted';
    RAISE NOTICE '✅ Helper functions and views created';
    RAISE NOTICE '';
    RAISE NOTICE 'FEATURES IMPLEMENTED:';
    RAISE NOTICE '  • General company settings';
    RAISE NOTICE '  • Financial and tax configuration';
    RAISE NOTICE '  • Shipping settings';
    RAISE NOTICE '  • Notification preferences (JSONB)';
    RAISE NOTICE '  • System configuration';
    RAISE NOTICE '  • Auto-updating timestamps';
    RAISE NOTICE '  • Data validation constraints';
    RAISE NOTICE '  • Performance indexes';
    RAISE NOTICE '  • Helper functions and views';
    RAISE NOTICE '============================================';
END $$;

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'settings'
ORDER BY ordinal_position;
