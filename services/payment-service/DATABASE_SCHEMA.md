# Gamarriando Payment Service - Database Schema

## Overview

The Payment Service uses the same PostgreSQL database as the Product Service, with additional tables for handling orders, payments, and transactions.

## Database Tables

### 1. Orders Table
Stores customer orders with their details and status.

```sql
CREATE TABLE orders (
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
```

**Fields:**
- `id`: Primary key (auto-increment)
- `user_id`: Customer identifier
- `status`: Order status (pending, processing, shipped, delivered, cancelled)
- `total_amount`: Total order amount
- `currency`: Currency code (USD, EUR, etc.)
- `shipping_address`: JSON object with shipping details
- `billing_address`: JSON object with billing details
- `notes`: Additional order notes
- `created_at`: Order creation timestamp
- `updated_at`: Last update timestamp

### 2. Order Items Table
Stores individual items within each order.

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key (auto-increment)
- `order_id`: Foreign key to orders table
- `product_id`: Foreign key to products table (from product-service)
- `quantity`: Number of items ordered
- `unit_price`: Price per unit at time of order
- `total_price`: Total price for this line item
- `created_at`: Item creation timestamp

### 3. Payments Table
Stores payment information for orders.

```sql
CREATE TABLE payments (
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
```

**Fields:**
- `id`: Primary key (auto-increment)
- `order_id`: Foreign key to orders table
- `amount`: Payment amount
- `currency`: Currency code
- `payment_method`: Payment method (credit_card, paypal, etc.)
- `status`: Payment status (pending, processing, completed, failed, refunded)
- `gateway_response`: JSON response from payment gateway
- `metadata`: Additional payment metadata
- `created_at`: Payment creation timestamp
- `updated_at`: Last update timestamp

### 4. Transactions Table
Stores individual transactions (payments, refunds, chargebacks, etc.).

```sql
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Primary key (auto-increment)
- `payment_id`: Foreign key to payments table
- `transaction_type`: Type of transaction (payment, refund, chargeback, adjustment)
- `amount`: Transaction amount
- `currency`: Currency code
- `status`: Transaction status (pending, completed, failed, cancelled)
- `gateway_transaction_id`: External gateway transaction ID
- `gateway_response`: JSON response from payment gateway
- `metadata`: Additional transaction metadata
- `created_at`: Transaction creation timestamp
- `updated_at`: Last update timestamp

## Database Views

### 1. Order Summary View
Provides a summary of orders with item counts and quantities.

```sql
CREATE VIEW order_summary AS
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
```

### 2. Payment Summary View
Provides a summary of payments with order and transaction information.

```sql
CREATE VIEW payment_summary AS
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
```

### 3. Transaction Summary View
Provides a summary of transactions with payment and order information.

```sql
CREATE VIEW transaction_summary AS
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
```

## Database Functions

### 1. Get Order with Items
Retrieves an order along with all its items.

```sql
CREATE FUNCTION get_order_with_items(order_id_param INTEGER)
RETURNS TABLE (...)
```

### 2. Get Payment with Transactions
Retrieves a payment along with all its transactions.

```sql
CREATE FUNCTION get_payment_with_transactions(payment_id_param INTEGER)
RETURNS TABLE (...)
```

### 3. Calculate Order Total
Calculates the total amount for an order based on its items.

```sql
CREATE FUNCTION calculate_order_total(order_id_param INTEGER)
RETURNS DECIMAL
```

### 4. Get User Orders
Retrieves order history for a specific user with pagination.

```sql
CREATE FUNCTION get_user_orders(user_id_param VARCHAR, limit_param INTEGER, offset_param INTEGER)
RETURNS TABLE (...)
```

## Indexes

The following indexes are created for optimal performance:

### Orders Table
- `idx_orders_user_id`: Index on user_id
- `idx_orders_status`: Index on status
- `idx_orders_created_at`: Index on created_at
- `idx_orders_total_amount`: Index on total_amount

### Order Items Table
- `idx_order_items_order_id`: Index on order_id
- `idx_order_items_product_id`: Index on product_id

### Payments Table
- `idx_payments_order_id`: Index on order_id
- `idx_payments_status`: Index on status
- `idx_payments_payment_method`: Index on payment_method
- `idx_payments_created_at`: Index on created_at

### Transactions Table
- `idx_transactions_payment_id`: Index on payment_id
- `idx_transactions_type`: Index on transaction_type
- `idx_transactions_status`: Index on status
- `idx_transactions_gateway_id`: Index on gateway_transaction_id
- `idx_transactions_created_at`: Index on created_at

## Triggers

Automatic `updated_at` timestamp updates are handled by triggers:

- `update_orders_updated_at`: Updates updated_at on orders table
- `update_payments_updated_at`: Updates updated_at on payments table
- `update_transactions_updated_at`: Updates updated_at on transactions table

## Sample Data

The migration includes sample data for testing:

- 1 sample order with 2 items
- 1 sample payment
- 1 sample transaction

## Integration with Product Service

The payment service integrates with the existing product service tables:

- `order_items.product_id` references `products.id`
- Uses the same database connection and configuration
- Shares the same VPC and security groups
- Uses the same IAM role for database access

## Security Considerations

- All tables use proper foreign key constraints
- Sensitive payment data is stored in JSONB fields for flexibility
- Database access is restricted to the Lambda functions via VPC
- All queries use parameterized statements to prevent SQL injection
