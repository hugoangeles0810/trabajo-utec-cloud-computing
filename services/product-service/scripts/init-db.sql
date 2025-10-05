-- Initialize Gamarriando Product Service Database

-- Create database if it doesn't exist (this will be handled by Docker)
-- CREATE DATABASE IF NOT EXISTS gamarriando;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- These will be created by Alembic migrations, but we can add some additional ones here

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for full-text search
-- These will be added after tables are created by migrations

-- Insert some sample data for development
-- This will be handled by the application or separate seed scripts
