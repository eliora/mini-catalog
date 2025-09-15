-- Create tables for Hypay payment integration
-- Run this migration after setting up the basic e-commerce tables

-- Create payment_sessions table for tracking Hypay payment sessions
CREATE TABLE IF NOT EXISTS public.payment_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id varchar(255) UNIQUE NOT NULL,
    order_id varchar(255) REFERENCES orders(id) ON DELETE CASCADE,
    amount decimal(10,2) NOT NULL,
    currency varchar(3) DEFAULT 'ILS' NOT NULL,
    status varchar(50) DEFAULT 'created' NOT NULL,
    customer_name varchar(255) NOT NULL,
    customer_email varchar(255),
    customer_phone varchar(50),
    payment_url text,
    transaction_id varchar(255),
    payment_method varchar(50),
    error_message text,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_sessions_order_id ON payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_created_at ON payment_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_session_id ON payment_sessions(session_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_sessions_updated_at
    BEFORE UPDATE ON payment_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_sessions_updated_at();

-- Add payment-related columns to existing orders table if they don't exist
DO $$ 
BEGIN
    -- Add payment status column
    BEGIN
        ALTER TABLE orders ADD COLUMN payment_status varchar(50) DEFAULT 'not_required';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column payment_status already exists';
    END;

    -- Add payment method column  
    BEGIN
        ALTER TABLE orders ADD COLUMN payment_method varchar(50);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column payment_method already exists';
    END;

    -- Add payment session ID reference
    BEGIN
        ALTER TABLE orders ADD COLUMN payment_session_id varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column payment_session_id already exists';
    END;

    -- Add transaction ID
    BEGIN
        ALTER TABLE orders ADD COLUMN transaction_id varchar(255);
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column transaction_id already exists';
    END;

    -- Add payment error field
    BEGIN
        ALTER TABLE orders ADD COLUMN payment_error text;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column payment_error already exists';
    END;

    -- Add confirmed timestamp
    BEGIN
        ALTER TABLE orders ADD COLUMN confirmed_at timestamptz;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column confirmed_at already exists';
    END;

    -- Add cancelled timestamp
    BEGIN
        ALTER TABLE orders ADD COLUMN cancelled_at timestamptz;
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column cancelled_at already exists';
    END;
END $$;

-- Insert default Hypay configuration into settings table
INSERT INTO settings (key, value, description, created_at, updated_at)
VALUES (
    'hypay_config',
    '{
        "enabled": true,
        "sandbox": true,
        "currency": "ILS",
        "paymentMethods": ["credit_card", "paypal", "bit"],
        "paymentExpiryMinutes": 30,
        "requirePaymentOnSubmit": false,
        "webhookEnabled": true,
        "autoConfirmOrders": true,
        "maxRefundDays": 30
    }'::jsonb,
    'Hypay payment gateway configuration settings',
    now(),
    now()
) ON CONFLICT (key) DO UPDATE SET
    updated_at = now();

-- Insert payment status options into settings for reference
INSERT INTO settings (key, value, description, created_at, updated_at)
VALUES (
    'payment_statuses',
    '{
        "order_statuses": {
            "pending": "ממתין",
            "pending_payment": "ממתין לתשלום", 
            "payment_failed": "תשלום נכשל",
            "confirmed": "אושר",
            "cancelled": "בוטל",
            "completed": "הושלם"
        },
        "payment_statuses": {
            "not_required": "לא נדרש תשלום",
            "required": "נדרש תשלום",
            "pending": "ממתין לתשלום",
            "completed": "תשלום הושלם",
            "failed": "תשלום נכשל",
            "cancelled": "תשלום בוטל",
            "refunded": "הוחזר"
        }
    }'::jsonb,
    'Payment and order status definitions',
    now(),
    now()
) ON CONFLICT (key) DO UPDATE SET
    updated_at = now();

-- Create function to get active payment sessions
CREATE OR REPLACE FUNCTION get_active_payment_sessions()
RETURNS TABLE (
    session_id varchar(255),
    order_id varchar(255),
    amount decimal(10,2),
    status varchar(50),
    expires_at timestamptz,
    created_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ps.session_id,
        ps.order_id,
        ps.amount,
        ps.status,
        ps.expires_at,
        ps.created_at
    FROM payment_sessions ps
    WHERE ps.status IN ('created', 'pending')
      AND (ps.expires_at IS NULL OR ps.expires_at > now())
    ORDER BY ps.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup expired payment sessions
CREATE OR REPLACE FUNCTION cleanup_expired_payment_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Update expired sessions
    UPDATE payment_sessions 
    SET status = 'expired', updated_at = now()
    WHERE status IN ('created', 'pending') 
      AND expires_at IS NOT NULL 
      AND expires_at < now();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Update related orders
    UPDATE orders 
    SET status = 'payment_expired', 
        payment_status = 'expired',
        updated_at = now()
    WHERE payment_session_id IN (
        SELECT session_id FROM payment_sessions 
        WHERE status = 'expired' 
          AND updated_at >= now() - INTERVAL '1 minute'
    );
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL ON payment_sessions TO authenticated;
GRANT ALL ON payment_sessions TO service_role;

-- Enable RLS on payment_sessions
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_sessions
-- Users can view their own payment sessions
CREATE POLICY "Users can view their own payment sessions" ON payment_sessions
    FOR SELECT USING (
        customer_email = auth.jwt() ->> 'email'
        OR order_id IN (
            SELECT id FROM orders 
            WHERE created_by = auth.uid()
               OR customer_name = (auth.jwt() ->> 'user_metadata')::json ->> 'full_name'
        )
    );

-- Authenticated users can insert payment sessions
CREATE POLICY "Authenticated users can create payment sessions" ON payment_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Service role can do everything (for webhooks and admin functions)
CREATE POLICY "Service role full access to payment sessions" ON payment_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- Admin users can view all payment sessions
CREATE POLICY "Admin users can view all payment sessions" ON payment_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
              AND ur.role = 'admin'
        )
    );

COMMIT;
