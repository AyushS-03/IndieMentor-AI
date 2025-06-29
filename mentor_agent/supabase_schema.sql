-- Create users table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    avatar_url VARCHAR,
    role VARCHAR DEFAULT 'user' CHECK (role IN ('user', 'admin', 'mentor', 'creator')),
    subscription_tier VARCHAR DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert demo users (optional)
INSERT INTO users (id, email, name, avatar_url, role, subscription_tier) VALUES
    ('demo_user_1', 'demo@example.com', 'Demo User', 'https://api.dicebear.com/7.x/initials/svg?seed=Demo%20User', 'user', 'free'),
    ('admin_user_1', 'admin@example.com', 'Admin User', 'https://api.dicebear.com/7.x/initials/svg?seed=Admin%20User', 'admin', 'enterprise')
ON CONFLICT (email) DO NOTHING;
