-- Gamarriando Payment Service Database Schema
-- Migration to add payment-related tables to existing database

-- Connect to the database (this should already be done)
-- \c gamarriando;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    gateway_response JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'chargeback', 'adjustment'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway_id ON transactions(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Create triggers to automatically update updated_at for new tables
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.user_id,
    o.status,
    o.total_amount,
    o.currency,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) as item_count,
    SUM(oi.quantity) as total_quantity
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.status, o.total_amount, o.currency, o.created_at, o.updated_at;

CREATE OR REPLACE VIEW payment_summary AS
SELECT 
    p.id,
    p.order_id,
    p.amount,
    p.currency,
    p.payment_method,
    p.status,
    p.created_at,
    p.updated_at,
    o.user_id,
    o.total_amount as order_total,
    COUNT(t.id) as transaction_count
FROM payments p
LEFT JOIN orders o ON p.order_id = o.id
LEFT JOIN transactions t ON p.id = t.payment_id
GROUP BY p.id, p.order_id, p.amount, p.currency, p.payment_method, p.status, p.created_at, p.updated_at, o.user_id, o.total_amount;

CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    t.payment_id,
    t.transaction_type,
    t.amount,
    t.currency,
    t.status,
    t.gateway_transaction_id,
    t.created_at,
    t.updated_at,
    p.order_id,
    p.payment_method,
    o.user_id
FROM transactions t
LEFT JOIN payments p ON t.payment_id = p.id
LEFT JOIN orders o ON p.order_id = o.id;

-- Create function to get order with items
CREATE OR REPLACE FUNCTION get_order_with_items(order_id_param INTEGER)
RETURNS TABLE (
    order_id INTEGER,
    user_id VARCHAR,
    status VARCHAR,
    total_amount DECIMAL,
    currency VARCHAR,
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    item_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    unit_price DECIMAL,
    item_total_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.user_id,
        o.status,
        o.total_amount,
        o.currency,
        o.shipping_address,
        o.billing_address,
        o.notes,
        o.created_at,
        o.updated_at,
        oi.id as item_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.total_price as item_total_price
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.id = order_id_param
    ORDER BY oi.id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get payment with transactions
CREATE OR REPLACE FUNCTION get_payment_with_transactions(payment_id_param INTEGER)
RETURNS TABLE (
    payment_id INTEGER,
    order_id INTEGER,
    amount DECIMAL,
    currency VARCHAR,
    payment_method VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    transaction_id INTEGER,
    transaction_type VARCHAR,
    transaction_amount DECIMAL,
    transaction_status VARCHAR,
    gateway_transaction_id VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as payment_id,
        p.order_id,
        p.amount,
        p.currency,
        p.payment_method,
        p.status,
        p.created_at,
        p.updated_at,
        t.id as transaction_id,
        t.transaction_type,
        t.amount as transaction_amount,
        t.status as transaction_status,
        t.gateway_transaction_id
    FROM payments p
    LEFT JOIN transactions t ON p.id = t.payment_id
    WHERE p.id = payment_id_param
    ORDER BY t.created_at;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_param INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL;
BEGIN
    SELECT COALESCE(SUM(oi.total_price), 0) INTO total
    FROM order_items oi
    WHERE oi.order_id = order_id_param;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user order history
CREATE OR REPLACE FUNCTION get_user_orders(user_id_param VARCHAR, limit_param INTEGER DEFAULT 50, offset_param INTEGER DEFAULT 0)
RETURNS TABLE (
    id INTEGER,
    status VARCHAR,
    total_amount DECIMAL,
    currency VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    item_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.status,
        o.total_amount,
        o.currency,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_id_param
    GROUP BY o.id, o.status, o.total_amount, o.currency, o.created_at, o.updated_at
    ORDER BY o.created_at DESC
    LIMIT limit_param OFFSET offset_param;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for development
INSERT INTO orders (user_id, status, total_amount, currency, shipping_address, billing_address, notes) VALUES
('user_123', 'completed', 129.98, 'USD', 
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip_code": "10001", "country": "USA"}',
 '{"street": "123 Main St", "city": "New York", "state": "NY", "zip_code": "10001", "country": "USA"}',
 'Please deliver after 5 PM')
ON CONFLICT DO NOTHING;

-- Get the order ID for sample data
DO $$
DECLARE
    sample_order_id INTEGER;
BEGIN
    SELECT id INTO sample_order_id FROM orders WHERE user_id = 'user_123' AND total_amount = 129.98 LIMIT 1;
    
    -- Insert sample order items
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
    (sample_order_id, 1, 1, 999.99, 999.99),
    (sample_order_id, 4, 2, 19.99, 39.98)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample payment
    INSERT INTO payments (order_id, amount, currency, payment_method, status, gateway_response) VALUES
    (sample_order_id, 129.98, 'USD', 'credit_card', 'completed',
     '{"transaction_id": "txn_123456", "gateway": "stripe", "processed_at": "2024-01-15T10:30:00Z"}')
    ON CONFLICT DO NOTHING;
    
    -- Get the payment ID for sample data
    DECLARE
        sample_payment_id INTEGER;
    BEGIN
        SELECT id INTO sample_payment_id FROM payments WHERE order_id = sample_order_id LIMIT 1;
        
        -- Insert sample transaction
        INSERT INTO transactions (payment_id, transaction_type, amount, currency, status, gateway_transaction_id, gateway_response) VALUES
        (sample_payment_id, 'payment', 129.98, 'USD', 'completed', 'txn_123456',
         '{"transaction_id": "txn_123456", "gateway": "stripe", "processed_at": "2024-01-15T10:30:00Z", "fee": 3.77, "net_amount": 126.21}')
        ON CONFLICT DO NOTHING;
    END;
END $$;

-- Display summary
SELECT 'Payment tables migration completed successfully!' as status;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_order_items FROM order_items;
SELECT COUNT(*) as total_payments FROM payments;
SELECT COUNT(*) as total_transactions FROM transactions;
