-- Gamarriando User Service Database Schema
-- This script creates all necessary tables for user management, authentication, and authorization

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user information
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    profile_picture_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table - Role-based access control
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL, -- 'customer', 'vendor', 'admin', 'moderator'
    granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- User sessions table - JWT session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens table - Password reset functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens table - Email verification functionality
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.id,
    u.email,
    u.username,
    u.first_name,
    u.last_name,
    u.phone,
    u.date_of_birth,
    u.is_active,
    u.is_verified,
    u.is_admin,
    u.profile_picture_url,
    u.preferences,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ur.id,
                'role_name', ur.role_name,
                'granted_at', ur.granted_at,
                'expires_at', ur.expires_at,
                'is_active', ur.is_active
            )
        ) FILTER (WHERE ur.id IS NOT NULL), 
        '[]'::json
    ) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, u.phone, 
         u.date_of_birth, u.is_active, u.is_verified, u.is_admin, 
         u.profile_picture_url, u.preferences, u.last_login_at, 
         u.created_at, u.updated_at;

-- Create view for active sessions
CREATE OR REPLACE VIEW active_sessions AS
SELECT 
    us.id,
    us.user_id,
    u.email,
    u.username,
    us.device_info,
    us.ip_address,
    us.user_agent,
    us.expires_at,
    us.created_at,
    us.last_accessed_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.expires_at > NOW()
ORDER BY us.last_accessed_at DESC;

-- Insert sample data for testing
INSERT INTO users (email, username, password_hash, first_name, last_name, is_active, is_verified, is_admin) VALUES
('admin@gamarriando.com', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'Admin', 'User', true, true, true),
('john.doe@example.com', 'johndoe', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'John', 'Doe', true, true, false),
('jane.smith@example.com', 'janesmith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'Jane', 'Smith', true, false, false),
('vendor@example.com', 'vendor1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', 'Vendor', 'User', true, true, false)
ON CONFLICT (email) DO NOTHING;

-- Insert sample roles
INSERT INTO user_roles (user_id, role_name, granted_by) VALUES
(1, 'admin', 1),
(1, 'customer', 1),
(2, 'customer', 1),
(3, 'customer', 1),
(4, 'vendor', 1),
(4, 'customer', 1)
ON CONFLICT DO NOTHING;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM email_verification_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user with roles
CREATE OR REPLACE FUNCTION get_user_with_roles(user_email VARCHAR)
RETURNS TABLE (
    id INTEGER,
    email VARCHAR,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    date_of_birth DATE,
    is_active BOOLEAN,
    is_verified BOOLEAN,
    is_admin BOOLEAN,
    profile_picture_url VARCHAR,
    preferences JSONB,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    roles JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM user_profiles WHERE user_profiles.email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate user credentials
CREATE OR REPLACE FUNCTION validate_user_credentials(user_email VARCHAR, password_hash VARCHAR)
RETURNS TABLE (
    id INTEGER,
    email VARCHAR,
    username VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    is_active BOOLEAN,
    is_verified BOOLEAN,
    is_admin BOOLEAN,
    roles JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.is_active,
        u.is_verified,
        u.is_admin,
        COALESCE(
            json_agg(
                json_build_object(
                    'role_name', ur.role_name,
                    'granted_at', ur.granted_at,
                    'expires_at', ur.expires_at
                )
            ) FILTER (WHERE ur.id IS NOT NULL), 
            '[]'::json
        ) as roles
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
    WHERE u.email = user_email 
    AND u.password_hash = password_hash 
    AND u.is_active = true
    GROUP BY u.id, u.email, u.username, u.first_name, u.last_name, 
             u.is_active, u.is_verified, u.is_admin;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gamarriando;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gamarriando;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO gamarriando;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'User service database schema created successfully!';
    RAISE NOTICE 'Tables created: users, user_roles, user_sessions, password_reset_tokens, email_verification_tokens';
    RAISE NOTICE 'Views created: user_profiles, active_sessions';
    RAISE NOTICE 'Functions created: cleanup_expired_sessions, cleanup_expired_tokens, get_user_with_roles, validate_user_credentials';
    RAISE NOTICE 'Sample data inserted for testing';
END $$;
