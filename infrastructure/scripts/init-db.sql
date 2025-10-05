-- Initialize Gamarriando database
-- This script runs when the PostgreSQL container starts

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS gamarriando;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial tables will be handled by SQLAlchemy migrations
-- This file is here for any custom initialization needed

-- Insert some sample data (optional)
-- This can be removed in production

-- Sample categories
INSERT INTO categories (name, slug, description, parent_id, "order") VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets', NULL, 1),
('Clothing', 'clothing', 'Fashion and apparel', NULL, 2),
('Books', 'books', 'Books and literature', NULL, 3),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies', NULL, 4),
('Sports', 'sports', 'Sports and fitness equipment', NULL, 5)
ON CONFLICT (slug) DO NOTHING;

-- Sample vendors
INSERT INTO vendors (name, email, phone, address, description, is_active, is_verified) VALUES
('TechStore Pro', 'contact@techstorepro.com', '+1-555-0123', '123 Tech Street, Silicon Valley, CA', 'Leading electronics retailer', true, true),
('Fashion Forward', 'hello@fashionforward.com', '+1-555-0124', '456 Fashion Ave, New York, NY', 'Trendy clothing and accessories', true, true),
('BookWorld', 'info@bookworld.com', '+1-555-0125', '789 Library Lane, Boston, MA', 'Your local bookstore', true, false)
ON CONFLICT (email) DO NOTHING;
