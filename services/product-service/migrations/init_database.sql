-- Gamarriando Product Service Database Schema
-- Initial migration for RDS Aurora PostgreSQL

-- Create database if not exists (run this manually)
-- CREATE DATABASE gamarriando;

-- Connect to the database
\c gamarriando;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_products INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft',
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    vendor_id INTEGER REFERENCES vendors(id) ON DELETE SET NULL,
    images JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);
CREATE INDEX IF NOT EXISTS idx_vendors_is_verified ON vendors(is_verified);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO categories (name, slug, description, "order") VALUES
('Electrónicos', 'electronicos', 'Productos electrónicos y tecnología', 1),
('Ropa', 'ropa', 'Ropa y accesorios', 2),
('Hogar y Jardín', 'hogar-jardin', 'Productos para el hogar y jardín', 3),
('Deportes', 'deportes', 'Artículos deportivos y fitness', 4),
('Libros', 'libros', 'Libros y material educativo', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories
INSERT INTO categories (name, slug, description, parent_id, "order") VALUES
('Smartphones', 'smartphones', 'Teléfonos inteligentes y accesorios', 1, 1),
('Laptops', 'laptops', 'Computadoras portátiles', 1, 2),
('Tablets', 'tablets', 'Tabletas y iPads', 1, 3),
('Camisetas', 'camisetas', 'Camisetas y tops', 2, 1),
('Pantalones', 'pantalones', 'Pantalones y jeans', 2, 2),
('Zapatos', 'zapatos', 'Calzado para hombre y mujer', 2, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert initial vendors
INSERT INTO vendors (name, email, phone, address, description, is_verified, rating, total_products) VALUES
('Tech Store Pro', 'info@techstorepro.com', '+1987654321', 
 '{"street": "456 Tech Avenue", "city": "Tech City", "state": "Tech State", "zip_code": "54321", "country": "Tech Country"}',
 'Especialistas en productos tecnológicos', true, 4.8, 150),
('Fashion Hub', 'contact@fashionhub.com', '+1122334455',
 '{"street": "789 Fashion Boulevard", "city": "Fashion City", "state": "Fashion State", "zip_code": "67890", "country": "Fashion Country"}',
 'Tu tienda de moda y estilo', false, 4.2, 75),
('Home & Garden Plus', 'info@homegardenplus.com', '+1555666777',
 '{"street": "321 Garden Street", "city": "Garden City", "state": "Garden State", "zip_code": "11111", "country": "Garden Country"}',
 'Todo para tu hogar y jardín', true, 4.6, 120),
('Sports Central', 'sales@sportscentral.com', '+1999888777',
 '{"street": "654 Sports Lane", "city": "Sports City", "state": "Sports State", "zip_code": "22222", "country": "Sports Country"}',
 'Equipamiento deportivo profesional', true, 4.7, 200),
('Book World', 'orders@bookworld.com', '+1444333222',
 '{"street": "987 Library Avenue", "city": "Book City", "state": "Book State", "zip_code": "33333", "country": "Book Country"}',
 'Tu librería online de confianza', true, 4.9, 300)
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, description, price, stock, status, category_id, vendor_id, images, tags) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'El smartphone más avanzado de Apple con chip A17 Pro', 999.99, 25, 'active', 6, 1, '["https://example.com/iphone15pro1.jpg", "https://example.com/iphone15pro2.jpg"]', '["smartphone", "apple", "premium"]'),
('MacBook Air M2', 'macbook-air-m2', 'Laptop ultradelgada con chip M2 de Apple', 1199.99, 15, 'active', 7, 1, '["https://example.com/macbookair1.jpg"]', '["laptop", "apple", "m2", "ultrabook"]'),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Smartphone Android con IA integrada', 799.99, 30, 'active', 6, 1, '["https://example.com/galaxys24.jpg"]', '["smartphone", "samsung", "android", "ai"]'),
('Camiseta Básica Algodón', 'camiseta-basica-algodon', 'Camiseta 100% algodón orgánico, cómoda y duradera', 19.99, 100, 'active', 9, 2, '["https://example.com/camiseta1.jpg"]', '["ropa", "basica", "algodon", "organico"]'),
('Jeans Clásicos', 'jeans-clasicos', 'Jeans de corte clásico en denim premium', 49.99, 50, 'active', 10, 2, '["https://example.com/jeans1.jpg"]', '["ropa", "jeans", "denim", "clasico"]'),
('Zapatillas Deportivas', 'zapatillas-deportivas', 'Zapatillas para running con tecnología de amortiguación', 89.99, 75, 'active', 2, 4, '["https://example.com/zapatillas1.jpg"]', '["deportes", "running", "zapatillas", "amortiguacion"]'),
('Set de Herramientas', 'set-herramientas', 'Set completo de herramientas para el hogar', 79.99, 40, 'active', 3, 3, '["https://example.com/herramientas1.jpg"]', '["hogar", "herramientas", "bricolaje"]'),
('Libro: Clean Code', 'libro-clean-code', 'Guía para escribir código limpio y mantenible', 29.99, 60, 'active', 5, 5, '["https://example.com/cleancode.jpg"]', '["programacion", "desarrollo", "software", "calidad"]')
ON CONFLICT (slug) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW active_products AS
SELECT 
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.stock,
    p.status,
    p.images,
    p.tags,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    v.name as vendor_name,
    v.email as vendor_email,
    v.rating as vendor_rating
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN vendors v ON p.vendor_id = v.id
WHERE p.status = 'active' AND p.stock > 0;

CREATE OR REPLACE VIEW vendor_stats AS
SELECT 
    v.id,
    v.name,
    v.email,
    v.rating,
    COUNT(p.id) as total_products,
    COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products,
    AVG(p.price) as avg_product_price,
    MIN(p.price) as min_product_price,
    MAX(p.price) as max_product_price
FROM vendors v
LEFT JOIN products p ON v.id = p.vendor_id
GROUP BY v.id, v.name, v.email, v.rating;

-- Create function to get products by category
CREATE OR REPLACE FUNCTION get_products_by_category(category_slug_param VARCHAR)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    price DECIMAL,
    stock INTEGER,
    status VARCHAR,
    images JSONB,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    category_name VARCHAR,
    vendor_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.status,
        p.images,
        p.tags,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        v.name as vendor_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN vendors v ON p.vendor_id = v.id
    WHERE c.slug = category_slug_param AND p.status = 'active'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to search products
CREATE OR REPLACE FUNCTION search_products(search_term VARCHAR)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    slug VARCHAR,
    description TEXT,
    price DECIMAL,
    stock INTEGER,
    status VARCHAR,
    images JSONB,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    category_name VARCHAR,
    vendor_name VARCHAR,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.stock,
        p.status,
        p.images,
        p.tags,
        p.created_at,
        p.updated_at,
        c.name as category_name,
        v.name as vendor_name,
        (
            CASE 
                WHEN p.name ILIKE '%' || search_term || '%' THEN 3.0
                WHEN p.description ILIKE '%' || search_term || '%' THEN 2.0
                WHEN c.name ILIKE '%' || search_term || '%' THEN 1.5
                WHEN v.name ILIKE '%' || search_term || '%' THEN 1.0
                ELSE 0.0
            END
        ) as relevance_score
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN vendors v ON p.vendor_id = v.id
    WHERE (
        p.name ILIKE '%' || search_term || '%' OR
        p.description ILIKE '%' || search_term || '%' OR
        c.name ILIKE '%' || search_term || '%' OR
        v.name ILIKE '%' || search_term || '%'
    ) AND p.status = 'active'
    ORDER BY relevance_score DESC, p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gamarriando;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gamarriando;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO gamarriando;

-- Display summary
SELECT 'Database initialization completed successfully!' as status;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_vendors FROM vendors;
SELECT COUNT(*) as total_products FROM products;
